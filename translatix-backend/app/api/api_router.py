from fastapi import APIRouter
# Sử dụng import tuyệt đối để tránh nhầm lẫn
from app.api.comic.router import router as comic_router
from app.api.game.router import router as game_router

api_router = APIRouter()
api_router.include_router(comic_router, prefix="/comic", tags=["Comic"])
api_router.include_router(game_router, prefix="/game", tags=["Game"])