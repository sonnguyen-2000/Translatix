from pydantic import BaseModel
from typing import List, Optional

class ProjectRequest(BaseModel):
    path: str
    type: str  # 'rpg', 'unity', 'unreal'

class ProjectResponse(BaseModel):
    projectName: str
    files: List[str]
    info: Optional[str] = None