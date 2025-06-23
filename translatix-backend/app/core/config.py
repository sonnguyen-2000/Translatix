from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Translatix Backend API"
    API_V1_STR: str = "/api/v1"
    # Bạn có thể thêm các cấu hình khác ở đây, ví dụ: database URL

settings = Settings()