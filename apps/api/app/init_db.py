import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.config import get_settings
from app.models import User, Post, Comment

settings = get_settings()


async def init_db():
    """Initialize the database tables"""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Drop all tables (for development)
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("Database initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_db())
