from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.user import UserBase
from schemas.post import PostOut
from dependencies import get_current_user
from database.models import User, Post
import os
import uuid
from pathlib import Path

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

@router.get("/me", response_model=UserBase)
async def me(current: User = Depends(get_current_user)):
    return current

@router.get("", response_model=List[UserBase])
async def search_users(q: str = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if q:
        q = q.lower().strip()
        query = query.filter(
            (User.first_name.ilike(f"%{q}%")) |
            (User.last_name.ilike(f"%{q}%")) |
            (User.email.ilike(f"%{q}%"))
        )
    return query.limit(50).all()

@router.get("/{user_id}", response_model=UserBase)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@router.get("/{user_id}/posts", response_model=List[PostOut])
async def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.user_id == user_id).order_by(Post.created_at.desc()).all()
    out: List[PostOut] = []
    for p in posts:
        out.append(PostOut(
            id=p.id,
            content=p.content,
            media_url=p.media_url,
            created_at=p.created_at,
            user_name=f"{p.author.first_name} {p.author.last_name}" if p.author else "Anônimo",
            user_profile_photo=p.author.profile_photo if p.author else None,
            user_cover_photo=p.author.cover_photo if p.author else None,
        ))
    return out

@router.post("/profile-photo")
async def update_profile_photo(
    file: UploadFile = File(...),
    caption: str = Form(""),
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

        post = Post(user_id=current.id, content=caption or "Atualizou a foto de perfil", media_url=media_url)
        db.add(post)

        db.commit()
        db.refresh(current)

        return {
            "success": True,
            "profile_photo": media_url,
            "message": "Profile photo updated successfully",
            "post_id": post.id,
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error uploading profile photo: {str(e)}")

@router.post("/cover-photo")
async def update_cover_photo(
    file: UploadFile = File(...),
    caption: str = Form(""),
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

        post = Post(user_id=current.id, content=caption or "Atualizou a foto de capa", media_url=media_url)
        db.add(post)

        db.commit()
        db.refresh(current)

        return {
            "success": True,
            "cover_photo": media_url,
            "message": "Cover photo updated successfully",
            "post_id": post.id,
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error uploading cover photo: {str(e)}")
