# translatix-backend/app/api/comic/router.py - KHÔNG CẦN THAY ĐỔI
from fastapi import APIRouter, HTTPException
from . import schema
from app.services import comic_service

router = APIRouter()

@router.post("/process", response_model=schema.ProjectResponse)
def handle_process_comic(request: schema.ProjectRequest):
    try:
        result = comic_service.get_comic_pages(request.paths)
        return result
    except Exception as e:
        # Thêm log lỗi để dễ debug
        print(f"API Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))