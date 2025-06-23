from fastapi import APIRouter, HTTPException
from . import schema
from app.services import game_service

router = APIRouter()

@router.post("/process", response_model=schema.ProjectResponse)
def handle_process_game(request: schema.ProjectRequest):
    try:
        result = game_service.process_game_project(request.type, request.path)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
