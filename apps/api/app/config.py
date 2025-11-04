from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # Database
    DATABASE_URL: str = "postgresql://daira:daira@localhost:5432/daira"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # MinIO (S3-compatible storage)
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "daira-media"

    # Kafka
    KAFKA_BROKERS: str = "localhost:9092"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    JWT_SECRET: str = "change-this-jwt-secret-in-production"

    # Environment
    ENVIRONMENT: str = "development"


settings = Settings()
