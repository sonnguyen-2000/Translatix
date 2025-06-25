# translatix-backend/app/api/comic/schema.py

from pydantic import BaseModel
from typing import List, Dict, Tuple

class ProjectRequest(BaseModel):
    paths: List[str]

# MỚI: Định nghĩa cấu trúc cho bong bóng thoại
class Bubble(BaseModel):
    id: str
    text: str
    translation: str = ""
    coords: Tuple[int, int, int, int] # (x, y, width, height)

# MỚI: Định nghĩa cấu trúc cho mỗi trang truyện
class Page(BaseModel):
    id: str
    original_url: str
    inpainted_url: str
    bubbles: List[Bubble]

# CẬP NHẬT: Response model
class ProjectResponse(BaseModel):
    projectName: str
    # Thay thế 'files' bằng 'pages'
    pages: List[Page]