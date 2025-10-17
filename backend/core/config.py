from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    SECRET_KEY: str = "super-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    @property
    def DB_PATH(self) -> Path:
        # Put DB file inside backend/ folder
        return Path(__file__).resolve().parent.parent / "app.db"

    @property
    def DATABASE_URL(self) -> str:
        # Use absolute path for sqlite URL
        return f"sqlite:///{self.DB_PATH}"

settings = Settings()
