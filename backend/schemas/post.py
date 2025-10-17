from datetime import datetime
from pydantic import BaseModel

class PostCreate(BaseModel):
    content: str
    media_url: str | None = None

class PostOut(BaseModel):
    id: int
    content: str
    media_url: str | None
    created_at: datetime
    user_name: str

    class Config:
        from_attributes = True
