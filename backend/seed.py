"""
backend/seed.py — CLI seed script to populate LocalPulse database
Run with: python seed.py
"""
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.database import Base, db_url
import app.models  # Register all models with Base.metadata
from app.seeds.seed_data import seed_database_sync


def main():
    print("Connecting to database and creating tables if not present...")
    sync_url = db_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    sync_url = sync_url.replace("sqlite+aiosqlite://", "sqlite://", 1)
    # If using in-memory or sqlite fallback
    if "sqlite" in sync_url:
        engine = create_engine(sync_url)
    else:
        try:
            engine = create_engine(sync_url)
            engine.connect()
        except Exception as err:
            print(f"PostgreSQL connection failed ({err}), falling back to local SQLite 'localpulse.db'...")
            engine = create_engine("sqlite:///localpulse.db")

    Base.metadata.create_all(engine)

    with Session(engine) as session:
        print("Seeding experiences and market valuations...")
        result = seed_database_sync(session)
        print(f"Seed complete: {result}")


if __name__ == "__main__":
    main()
