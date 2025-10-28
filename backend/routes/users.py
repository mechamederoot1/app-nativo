from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, Form
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.user import UserBase
from schemas.post import PostOut
from dependencies import get_current_user
from database.models import User, Post
import os
import uuid
from pathlib import Path
from typing import List

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

@router.get("/me", response_model=UserBase)
async def me(current: User = Depends(get_current_user)):
    return current

@router.get("/search")
async def search_users(q: str = Query(""), db: Session = Depends(get_db)):
    term = (q or "").strip()
    qs = db.query(User)
    if term:
        like = f"%{term.lower()}%"
        qs = qs.filter((User.first_name.ilike(like)) | (User.last_name.ilike(like)) | (User.email.ilike(like)))
    users = qs.order_by(User.first_name.asc()).limit(20).all()
    def to_username(u: User):
        return f"{u.first_name}{u.last_name}".replace(" ", "").lower()
    return [
        {
            "id": u.id,
            "name": f"{u.first_name} {u.last_name}",
            "username": to_username(u),
            "profile_photo": u.profile_photo,
            "cover_photo": u.cover_photo,
        }
        for u in users
    ]

@router.get("/{user_id}", response_model=UserBase)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = None
    if user_id.isdigit():
        user = db.query(User).filter(User.id == int(user_id)).first()
    else:
        user = db.query(User).filter(User.username == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@router.get("/{user_id}/posts", response_model=List[PostOut])
async def get_user_posts(user_id: str, db: Session = Depends(get_db)):
    user = None
    if user_id.isdigit():
        user = db.query(User).filter(User.id == int(user_id)).first()
    else:
        user = db.query(User).filter(User.username == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    posts = db.query(Post).filter(Post.user_id == user.id).order_by(Post.created_at.desc()).all()
    return [
        PostOut(
            id=p.id,
            content=p.content,
            media_url=p.media_url,
            created_at=p.created_at,
            user_id=p.user_id,
            user_name=f"{p.author.first_name} {p.author.last_name}" if p.author else "Anônimo",
            user_profile_photo=p.author.profile_photo if p.author else None,
            user_cover_photo=p.author.cover_photo if p.author else None,
        ) for p in posts
    ]

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
