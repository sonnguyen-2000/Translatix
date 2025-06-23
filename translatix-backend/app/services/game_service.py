import os
from typing import List, Dict

def find_rpgmaker_data_files(exe_path: str) -> List[str]:
    """Tìm các file .json trong thư mục data của game RPG Maker."""
    if not os.path.isfile(exe_path) or not exe_path.lower().endswith('.exe'):
        raise ValueError("Đường dẫn phải là một file .exe hợp lệ.")

    game_dir = os.path.dirname(exe_path)
    possible_data_paths = [os.path.join(game_dir, 'www', 'data'), os.path.join(game_dir, 'data')]

    data_dir = next((p for p in possible_data_paths if os.path.isdir(p)), None)
    
    if not data_dir:
        raise FileNotFoundError("Không tìm thấy thư mục 'data' hoặc 'www/data'.")

    json_files = [os.path.join(data_dir, f) for f in sorted(os.listdir(data_dir)) if f.lower().endswith('.json')]
    
    if not json_files:
        raise FileNotFoundError(f"Không tìm thấy file .json nào trong '{data_dir}'.")
        
    return json_files

def process_game_project(project_type: str, project_path: str) -> Dict:
    """Hàm điều phối, gọi đến logic xử lý game tương ứng."""
    project_name = os.path.basename(project_path)

    if project_type == 'rpg':
        files = find_rpgmaker_data_files(project_path)
        return {"projectName": project_name, "files": files}
    
    # Logic giữ chỗ cho Unity và Unreal
    if project_type in ['unity', 'unreal']:
        if not os.path.isdir(project_path):
             raise ValueError(f"Dự án {project_type.capitalize()} yêu cầu một thư mục.")
        # Tạm thời trả về thông báo, bạn có thể quét file sau
        return {"projectName": project_name, "files": [], "info": f"Đã nhận dự án {project_type.capitalize()}."}
        
    raise ValueError(f"Loại dự án game '{project_type}' không được hỗ trợ.")