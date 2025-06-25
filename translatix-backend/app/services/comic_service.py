# app/services/comic_service.py

import os
import cv2
import numpy as np
import uuid
import traceback
from typing import List, Dict, Any
from paddleocr import PaddleOCR

# --- Khởi tạo OCR ---
# Hàm này khởi tạo engine OCR một lần duy nhất khi module được tải.
def initialize_ocr_engine():
    """
    Khởi tạo và trả về một instance của PaddleOCR engine theo đúng tài liệu PP-OCR 3.0+.
    Trả về None nếu có lỗi.
    """
    try:
        print("[dev:backend] Initializing PaddleOCR engine...")
        # Sử dụng các tham số được tài liệu hóa trong PP-OCR 3.0+
        # Các tham số này tắt các module tiền xử lý tài liệu, phù hợp cho truyện tranh.
        engine = PaddleOCR(
            lang='en', # hoặc 'ch', 'japan', 'korean', v.v.
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False, # Tắt module phân loại hướng dòng chữ
        )
        print("[dev:backend] PaddleOCR engine initialized successfully.")
        return engine
    except Exception as e:
        print(f"[dev:backend] CRITICAL: Error initializing PaddleOCR. Check your PaddlePaddle/GPU installation.")
        print(f"[dev:backend] Error details: {e}")
        traceback.print_exc()
        return None

# Khởi tạo engine OCR
ocr_engine = initialize_ocr_engine()

# --- Các hằng số ---
IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
TEMP_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'temp_output'))
os.makedirs(TEMP_OUTPUT_DIR, exist_ok=True)


def process_single_page(image_path: str, output_dir: str, page_index: int) -> Dict[str, Any]:
    """
    Xử lý một trang truyện tranh: nhận dạng văn bản, xóa văn bản và trả về dữ liệu.
    """
    if not ocr_engine:
        raise RuntimeError("PaddleOCR engine is not available. Please check initialization logs.")

    try:
        # 1. Đọc file ảnh một cách an toàn (hỗ trợ đường dẫn có ký tự Unicode)
        img_array = np.fromfile(image_path, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            print(f"[dev:backend] WARNING: Could not read or decode image: {image_path}")
            return None

        # 2. Gọi API `predict()` của PaddleOCR theo tài liệu mới
        results = ocr_engine.predict(img)

        # 3. Kiểm tra và trích xuất kết quả từ đối tượng `Result`
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        bubbles_data = []

        # `results` là list chứa các đối tượng `Result`, mỗi đối tượng cho một ảnh
        if results and results[0]:
            page_result = results[0] # Lấy đối tượng Result cho ảnh duy nhất của chúng ta

            # --- LOGGING ĐƯỢC THÊM VÀO ---
            # In ra toàn bộ kết quả nhận dạng một cách chi tiết để gỡ lỗi
            # Phương thức `print()` được tích hợp sẵn trong đối tượng Result của PaddleOCR
            print(f"\n--- DETAILED OCR LOG FOR PAGE {page_index + 1} ---")
            page_result.print()
            print(f"--- END DETAILED LOG FOR PAGE {page_index + 1} ---\n")
            # --- KẾT THÚC LOGGING ---

            # Trích xuất dữ liệu từ các thuộc tính của đối tượng Result
            # Đảm bảo rằng các thuộc tính này tồn tại trước khi truy cập
            detected_polygons = getattr(page_result, 'dt_polys', [])
            recognized_texts = getattr(page_result, 'rec_texts', [])
            recognition_scores = getattr(page_result, 'rec_scores', [])

            # 4. Xử lý từng vùng văn bản được nhận dạng
            for i in range(len(detected_polygons)):
                points = detected_polygons[i].astype(np.int32)
                text = recognized_texts[i]
                confidence = recognition_scores[i]

                # Dòng print này vẫn được giữ lại để xem nhanh từng dòng
                print(f"[DEBUG] Page {page_index + 1}, Line {i}: '{text}' (Confidence: {confidence:.2f})")

                if confidence < 0.85:
                    print(f"[DEBUG] -> Skipping low confidence detection.")
                    continue

                cv2.fillPoly(mask, [points], 255)
                x, y, w, h = cv2.boundingRect(points)

                bubbles_data.append({
                    "id": f"p{page_index + 1}_b{len(bubbles_data) + 1}",
                    "text": text,
                    "translation": "",
                    "coords": (x, y, w, h)
                })
        else:
             print(f"[dev:backend] No text detected on page {page_index + 1}: {os.path.basename(image_path)}")

        # 5. Inpainting: Xóa văn bản khỏi ảnh gốc
        kernel = np.ones((13, 13), np.uint8)
        dilated_mask = cv2.dilate(mask, kernel, iterations=4)
        inpainted_img = cv2.inpaint(img, dilated_mask, inpaintRadius=15, flags=cv2.INPAINT_TELEA)

        # 6. Lưu ảnh đã xóa chữ
        inpainted_filename = f"inpainted_{page_index + 1}_{os.path.basename(image_path)}.png"
        inpainted_path = os.path.join(output_dir, inpainted_filename)
        
        is_success, buffer = cv2.imencode(".png", inpainted_img)
        if is_success:
            with open(inpainted_path, 'wb') as f:
                f.write(buffer)
        else:
            print(f"[dev:backend] WARNING: Could not encode inpainted image for {image_path}")
            inpainted_path = ""

        return {
            "id": f"p{page_index + 1}",
            "original_url": os.path.abspath(image_path),
            "inpainted_url": os.path.abspath(inpainted_path) if inpainted_path else "",
            "bubbles": bubbles_data
        }

    except Exception as e:
        print(f"[dev:backend] CRITICAL ERROR processing page {image_path}: {e}")
        traceback.print_exc()
        return None


def get_comic_pages(project_paths: List[str]) -> Dict[str, Any]:
    """
    Nhận vào danh sách đường dẫn file hoặc thư mục và xử lý chúng thành một dự án truyện tranh.
    """
    if not project_paths:
        raise ValueError("No project paths were provided.")

    valid_files = []
    project_name = "New Comic Project"

    if len(project_paths) == 1 and os.path.isdir(project_paths[0]):
        directory_path = project_paths[0]
        project_name = os.path.basename(directory_path)
        try:
            all_files = sorted(os.listdir(directory_path))
            valid_files = [
                os.path.join(directory_path, f)
                for f in all_files
                if os.path.splitext(f)[-1].lower() in IMAGE_EXTENSIONS
            ]
        except Exception as e:
            raise IOError(f"Could not read directory: {directory_path}") from e
    else:
        valid_files = sorted([
            p for p in project_paths
            if os.path.isfile(p) and os.path.splitext(p)[-1].lower() in IMAGE_EXTENSIONS
        ])
        if valid_files:
            project_name = os.path.basename(os.path.dirname(valid_files[0]))

    if not valid_files:
        raise FileNotFoundError("No valid image files found in the provided paths.")

    session_id = str(uuid.uuid4())
    session_output_dir = os.path.join(TEMP_OUTPUT_DIR, session_id)
    os.makedirs(session_output_dir, exist_ok=True)
    print(f"[dev:backend] Created temporary session directory: {session_output_dir}")

    processed_pages = []
    for i, file_path in enumerate(valid_files):
        print(f"[dev:backend] >>> Processing page {i + 1}/{len(valid_files)}: {os.path.basename(file_path)}")
        page_data = process_single_page(file_path, session_output_dir, i)
        if page_data:
            processed_pages.append(page_data)

    if not processed_pages:
        print("[dev:backend] WARNING: No pages were processed successfully.")

    return {
        "projectName": project_name,
        "pages": processed_pages
    }
