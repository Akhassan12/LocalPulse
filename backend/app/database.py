"""
app/database.py — Database configuration, SQLAlchemy async session & base model
"""
from __future__ import annotations

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


class Base(DeclarativeBase):
    pass


import os
from sqlalchemy import create_engine as create_sync_engine

# Normalize database URL for async driver
raw_url = settings.DATABASE_URL
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+asyncpg://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Check if PostgreSQL is actually connectable; if not, fallback to sqlite+aiosqlite:///localpulse.db
db_url = raw_url
if "postgresql" in raw_url:
    sync_check_url = raw_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    try:
        test_engine = create_sync_engine(sync_check_url, connect_args={"connect_timeout": 1})
        with test_engine.connect():
            pass
        test_engine.dispose()
    except Exception:
        # Fallback to local SQLite database if PG is unreachable
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sqlite_path = os.path.join(base_dir, "localpulse.db")
        db_url = f"sqlite+aiosqlite:///{sqlite_path.replace(os.sep, '/')}"

engine: AsyncEngine = create_async_engine(
    db_url,
    echo=False,
    future=True,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an asynchronous database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
