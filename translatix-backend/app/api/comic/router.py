# translatix-backend/app/api/comic/router.py - KHÔNG CẦN THAY ĐỔI
from fastapi import APIRouter, HTTPException
from . import schema
from app.services import comic_service
import os
import shutil

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

@router.delete("temp/{session_id}")
def delete_temp_session(session_id: str):
    temp_dir = os.path.abspath(os.path.join("temp_output", session_id))
    if os.path.exists(temp_dir) and os.path.isdir(temp_dir):
        shutil.rmtree(temp_dir)
        print(f"[dev:backend] 🗑️ Deleted temp session: {temp_dir}")
        return {"status": "deleted"}
    return {"status": "not_found"}