import os
from typing import List, Dict

# Các đuôi file ảnh hợp lệ
image_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']

def get_comic_pages(project_paths: List[str]) -> Dict:
    """
    Xử lý danh sách đường dẫn.
    - Nếu 1 đường dẫn là thư mục -> quét các file ảnh trong đó.
    - Nếu là danh sách file -> lọc các file ảnh hợp lệ.
    """
    if not project_paths:
        raise ValueError("Không có đường dẫn nào được cung cấp.")

    # Trường hợp 1: Người dùng chọn một thư mục
    if len(project_paths) == 1 and os.path.isdir(project_paths[0]):
        directory_path = project_paths[0]
        project_name = os.path.basename(directory_path)
        
        all_files_in_dir = os.listdir(directory_path)
        valid_files = [
            os.path.join(directory_path, f) for f in all_files_in_dir
            if os.path.isfile(os.path.join(directory_path, f)) and os.path.splitext(f)[1].lower() in image_extensions
        ]
        
        if not valid_files:
            raise FileNotFoundError(f"Không tìm thấy file ảnh nào trong thư mục '{project_name}'.")

    # Trường hợp 2: Người dùng chọn nhiều file
    else:
        valid_files = [
            p for p in project_paths
            if os.path.isfile(p) and os.path.splitext(p)[1].lower() in image_extensions
        ]

        if not valid_files:
            raise FileNotFoundError("Không tìm thấy file ảnh hợp lệ nào trong các file đã chọn.")

        project_name = os.path.basename(os.path.dirname(valid_files[0]))

    return {
        "projectName": project_name,
        "files": sorted(valid_files)
    }