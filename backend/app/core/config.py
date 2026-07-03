from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Joyara Fashion"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "mysql+aiomysql://joyara_user:JoyaraFash2024!@localhost:3306/joyara_fashion"

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ALLOWED_ORIGINS: str = "http://localhost:5173"

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5_242_880

    ADMIN_EMAIL: str = "admin@joyarafashion.com"
    ADMIN_PASSWORD: str = "Admin@123456"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
