from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..schemas.user import UserBase
from ..dependencies import get_current_user
from ..database.models import User

router = APIRouter()

@router.get("/me", response_model=UserBase)
async def me(current: User = Depends(get_current_user)):
    return current
