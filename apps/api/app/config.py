from pydantic_settings import BaseSettings
from functools import lru_cache
import secrets


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://daira:daira123@postgres:5432/daira"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # MinIO/S3
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "daira-media"
    
    # Redpanda/Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "redpanda:9092"
    
    # JWT Authentication
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)  # Generate secure default
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # App
    APP_NAME: str = "DAIRA API"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://web:3000"]
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
