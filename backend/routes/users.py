from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.user import UserBase
from dependencies import get_current_user
from database.models import User
import os
import uuid
from pathlib import Path

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

@router.get("/me", response_model=UserBase)
async def me(current: User = Depends(get_current_user)):
    return current

@router.post("/profile-photo")
async def update_profile_photo(
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        file_extension = Path(file.filename or "jpg").suffix
        unique_filename = f"profile_{current.id}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(MEDIA_DIR, unique_filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        media_url = f"/media/{unique_filename}"
        current.profile_photo = media_url
        db.add(current)
        db.commit()
        db.refresh(current)

        return {
            "success": True,
            "profile_photo": media_url,
            "message": "Profile photo updated successfully"
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error uploading profile photo: {str(e)}")

@router.post("/cover-photo")
async def update_cover_photo(
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        file_extension = Path(file.filename or "jpg").suffix
        unique_filename = f"cover_{current.id}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(MEDIA_DIR, unique_filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        media_url = f"/media/{unique_filename}"
        current.cover_photo = media_url
        db.add(current)
        db.commit()
        db.refresh(current)

        return {
            "success": True,
            "cover_photo": media_url,
            "message": "Cover photo updated successfully"
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error uploading cover photo: {str(e)}")
