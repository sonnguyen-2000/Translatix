# app/services/comic_service.py

import os
import cv2
import numpy as np
import uuid
import traceback
import re
from typing import List, Dict, Any
from paddleocr import PaddleOCR

# --- Khởi tạo OCR ---
def initialize_ocr_engine():
    """
    Khởi tạo và trả về một instance của PaddleOCR engine theo đúng tài liệu PP-OCR 3.0+.
    """
    try:
        print("[dev:backend] Initializing PaddleOCR engine...")
        engine = PaddleOCR(
            lang='en',
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
        )
        print("[dev:backend] PaddleOCR engine initialized successfully.")
        return engine
    except Exception as e:
        print(f"[dev:backend] CRITICAL: Error initializing PaddleOCR. Check your PaddlePaddle/GPU installation.")
        print(f"[dev:backend] Error details: {e}")
        traceback.print_exc()
        return None

ocr_engine = initialize_ocr_engine()

# --- Các hằng số ---
IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
TEMP_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'temp_output'))
os.makedirs(TEMP_OUTPUT_DIR, exist_ok=True)


def process_single_page(image_path: str, output_dir: str, page_index: int) -> Dict[str, Any]:
    if not ocr_engine:
        raise RuntimeError("PaddleOCR engine is not available. Please check initialization logs.")

    try:
        img_array = np.fromfile(image_path, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            print(f"[dev:backend] WARNING: Could not read or decode image: {image_path}")
            return None

        results = ocr_engine.predict(img)
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        bubbles_data = []

        if results and results[0]:
            page_result = results[0]
            # 👉 BỎ CÁC LOG VỀ TEXT, POLYGONS, SCORES (dễ lỗi Unicode)
            # print("Texts:", repr(page_result.get('rec_texts', [])))
            # print("Polygons:", page_result.get('rec_polys', []))
            # print("Scores:", page_result.get('rec_scores', []))

            polygons = page_result['rec_polys']
            texts = page_result['rec_texts']
            scores = page_result['rec_scores']

            for i, (points, text, score) in enumerate(zip(polygons, texts, scores)):
                points = np.array(points, dtype=np.int32)

                # 👉 Không log text ở đây
                # print(f"[ACCEPTED] Adding line {i}: '{text}' (Confidence: {score:.2f})")

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

        # Inpainting
        kernel = np.ones((13, 13), np.uint8)
        dilated_mask = cv2.dilate(mask, kernel, iterations=4)
        inpainted_img = cv2.inpaint(img, dilated_mask, inpaintRadius=15, flags=cv2.INPAINT_TELEA)

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
