from pydantic import BaseModel
from typing import List

class ProjectRequest(BaseModel):
    paths: List[str]

class ProjectResponse(BaseModel):
    projectName: str
    files: List[str]