"""
RAONE - Database Configuration
Async SQLAlchemy setup with PostgreSQL.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """Dependency that provides a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup and add missing columns."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add new columns to existing tables (create_all won't alter existing tables)
        try:
            await conn.execute(
                text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_blacklisted BOOLEAN DEFAULT FALSE")
            )
        except Exception:
            pass  # Column may already exist


async def close_db():
    """Dispose engine on shutdown."""
    await engine.dispose()
