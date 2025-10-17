import os, sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Allow running from project root or backend/ directory
if __package__ is None or __package__ == "":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.database.session import Base, engine
    from backend.routes import auth as _auth, users as _users, posts as _posts
except ModuleNotFoundError:
    from database.session import Base, engine
    from routes import auth as _auth, users as _users, posts as _posts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="App Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.include_router(_auth.router, prefix="/auth", tags=["auth"])
app.include_router(_users.router, prefix="/users", tags=["users"])
app.include_router(_posts.router, prefix="/posts", tags=["posts"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend running"}
