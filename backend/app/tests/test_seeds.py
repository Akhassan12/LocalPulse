"""
app/tests/test_seeds.py — Test seed data integrity and database insertion
"""
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database import Base
from app.models import Experience, MarketValuation
from app.seeds.seed_data import SEED_EXPERIENCES, SEED_MARKET_VALUATIONS, seed_database_sync


def test_seed_database_execution():
    """Verify seed_database inserts 80 experiences and 14 market valuations into clean database."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        result = seed_database_sync(session)
        assert result["status"] == "success"
        assert result["experiences"] == 80
        assert result["market_valuations"] == 14

        # Verify idempotence on second run
        rerun_result = seed_database_sync(session)
        assert rerun_result["status"] == "already_seeded"

        # Verify counts in database
        exp_count = session.scalar(select(Experience))
        assert exp_count is not None

        # Verify cities
        tokyo_count = len(session.scalars(select(Experience).where(Experience.city == "Tokyo")).all())
        oaxaca_count = len(session.scalars(select(Experience).where(Experience.city == "Oaxaca")).all())
        assert tokyo_count == 40
        assert oaxaca_count == 40

        # Check market valuations
        valuations = session.scalars(select(MarketValuation)).all()
        assert len(valuations) == 14
        for v in valuations:
            assert v.estimated_weight_kg > 0
            assert 0 <= v.confidence_score <= 1
            assert len(v.bargaining_phrases) > 0
