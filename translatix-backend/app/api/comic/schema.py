from pydantic import BaseModel
from typing import List

class ProjectRequest(BaseModel):
    path: str

class ProjectResponse(BaseModel):
    projectName: str
    files: List[str]