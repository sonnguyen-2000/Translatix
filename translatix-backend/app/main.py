from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Cho phép Electron App giao tiếp với API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # An toàn hơn nếu bạn chỉ định origin cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}


@app.get("/health")
def health_check():
    """Endpoint đơn giản để kiểm tra xem server có đang chạy không."""
    return {"status": "ok"}
