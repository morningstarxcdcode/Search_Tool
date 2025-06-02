from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    # API Settings
    API_VERSION: str = "1"
    PROJECT_NAME: str = "Mercari Scraper API"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB Settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "mercari_search"

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",     # Next.js development server
        "http://localhost:8000",     # FastAPI development server
        "http://127.0.0.1:3000",    # Alternative localhost
        "http://127.0.0.1:8000",    # Alternative localhost
        "http://localhost",          # Generic localhost
        "http://127.0.0.1"          # Generic localhost
    ]

    # Scraper Settings
    SCRAPER_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

    # Authentication Settings
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API V1 STR
    API_V1_STR: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings() 