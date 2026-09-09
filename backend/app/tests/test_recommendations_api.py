"""
app/tests/test_recommendations_api.py — Unit & Integration tests for Recommendations and Public APIs
"""
import pytest
from datetime import datetime, timezone
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from main import app
from app.database import Base, get_db
from app.auth import get_current_user, AuthUser
from app.seeds.seed_data import seed_database_sync


# Test user fixture
TEST_USER = AuthUser(
    user_id="d3b07384-d113-4602-9c91-466315668748",
    email="traveler@example.com",
    role="authenticated",
)


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def test_client():
    """Setup in-memory sqlite test client with full seed data loaded."""
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data using sync connection
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session
    sync_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(sync_engine)
    with Session(sync_engine) as s:
        seed_database_sync(s)

    # Replicate seeds into test_engine
    async_session = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    
    # We can also seed directly into async session using seed_database
    from app.seeds.seed_data import seed_database
    async with async_session() as s:
        await seed_database(s)

    async def override_get_db():
        async with async_session() as session:
            yield session

    async def override_get_current_user():
        return TEST_USER

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.mark.anyio
async def test_health_check(test_client):
    res = await test_client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


@pytest.mark.anyio
async def test_get_cities(test_client):
    res = await test_client.get("/cities")
    assert res.status_code == 200
    cities = res.json()
    assert len(cities) == 2
    city_names = [c["city"] for c in cities]
    assert "Tokyo" in city_names
    assert "Oaxaca" in city_names


@pytest.mark.anyio
async def test_get_experiences_filtering(test_client):
    # All experiences
    res = await test_client.get("/experiences")
    assert res.status_code == 200
    all_exps = res.json()
    assert len(all_exps) == 80

    # Filter by city
    res_tokyo = await test_client.get("/experiences?city=Tokyo")
    assert res_tokyo.status_code == 200
    assert len(res_tokyo.json()) == 40

    # Filter by category
    res_food = await test_client.get("/experiences?category=food")
    assert res_food.status_code == 200
    assert all(e["category"] == "food" for e in res_food.json())

    # Filter by single ID
    first_id = all_exps[0]["id"]
    res_detail = await test_client.get(f"/experiences/{first_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == first_id


@pytest.mark.anyio
async def test_recommendations_flow(test_client):
    """Verify live ranking engine returns top experiences with fit scores and explanations."""
    payload = {
        "lat": 35.6762,  # Tokyo coordinates
        "lng": 139.6503,
        "available_minutes": 180,
        "remaining_budget": "120.0",
        "group_size": 1,
        "current_time": datetime.now(timezone.utc).isoformat(),
        "show_closed": True,
    }
    res = await test_client.post("/recommendations", json=payload)
    assert res.status_code == 200
    recommendations = res.json()
    assert len(recommendations) > 0

    top = recommendations[0]
    assert "fit_score" in top
    assert "breakdown" in top
    assert "explanation" in top
    assert "walking_distance_km" in top
    assert float(top["fit_score"]) >= 0.0

    # Ensure ranking is sorted descending
    scores = [float(r["fit_score"]) for r in recommendations]
    assert scores == sorted(scores, reverse=True)
