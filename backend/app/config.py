import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Bodim - Intelligent Boarding Recommendation System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT token encoding/decoding
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartbodim-secret-key-for-research-project-2026-super-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database configuration (Defaults to SQLite for instant local execution, supports PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./smart_bodim.db"
    )
    
    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()
