import os
from typing import List, Dict

# Các đuôi file ảnh hợp lệ
image_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']

def get_comic_pages(project_path: str) -> Dict:
    """
    Xử lý đường dẫn cho dự án truyện tranh.
    - Nếu là thư mục, quét và trả về tất cả file ảnh.
    - Nếu là file, trả về chính file đó.
    """
    if not os.path.exists(project_path):
        raise FileNotFoundError(f"Đường dẫn không tồn tại: {project_path}")

    if os.path.isdir(project_path):
        # Sắp xếp để đảm bảo thứ tự trang truyện
        files_in_dir = sorted(os.listdir(project_path))
        image_files = [os.path.join(project_path, f) for f in files_in_dir if any(f.lower().endswith(ext) for ext in image_extensions)]
        
        if not image_files:
            raise FileNotFoundError("Không tìm thấy file ảnh nào trong thư mục đã chọn.")
        
        project_name = os.path.basename(project_path)
        return {"projectName": project_name, "files": image_files}

    elif os.path.isfile(project_path):
        if not any(project_path.lower().endswith(ext) for ext in image_extensions):
            raise ValueError("File được chọn không phải là ảnh hợp lệ.")
            
        project_name = os.path.basename(os.path.dirname(project_path))
        return {"projectName": project_name, "files": [project_path]}
        
    raise ValueError("Đường dẫn không phải là file hoặc thư mục hợp lệ.")