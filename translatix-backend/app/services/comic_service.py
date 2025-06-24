import os
from typing import List, Dict

# Các đuôi file ảnh hợp lệ
image_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']

def get_comic_pages(project_paths: List[str]) -> Dict:
    """
    Xử lý danh sách đường dẫn ảnh truyện được chọn.
    """
    if not project_paths:
        raise ValueError("Không có đường dẫn file nào được cung cấp.")

    valid_files = [
        p for p in project_paths
        if os.path.isfile(p) and os.path.splitext(p)[1].lower() in image_extensions
    ]

    if not valid_files:
        raise FileNotFoundError("Không tìm thấy file ảnh hợp lệ nào.")

    project_name = os.path.basename(os.path.dirname(valid_files[0]))

    return {
        "projectName": project_name,
        "files": sorted(valid_files)
    }
