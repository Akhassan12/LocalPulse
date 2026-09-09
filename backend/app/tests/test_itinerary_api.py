"""
app/tests/test_itinerary_api.py — Integration tests for Phase 8 Itinerary API
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from main import app
from app.database import Base, get_db
from app.auth import get_optional_user, AuthUser

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
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with async_session() as session:
            yield session

    async def override_get_optional_user():
        return TEST_USER

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_optional_user] = override_get_optional_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.mark.anyio
async def test_itinerary_workflow(test_client):
    # 1. Get initial itinerary
    res = await test_client.get("/me/itinerary")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "impact" in data

    # 2. Add first item
    item1 = {
        "experience_id": "exp-oaxaca-weaving",
        "title": "Zapotec Natural Dye Workshop",
        "category": "artisan_craft",
        "price_min": 45.0,
        "price_max": 75.0,
        "duration_minutes": 180,
        "city": "Oaxaca",
        "lat": 17.026,
        "lng": -96.523,
    }
    res_add1 = await test_client.post("/me/itinerary/items", json=item1)
    assert res_add1.status_code == 201
    itin1 = res_add1.json()
    assert len(itin1["items"]) >= 1
    assert itin1["impact"]["total_duration_minutes"] >= 180

    # 3. Add second item
    item2 = {
        "experience_id": "exp-oaxaca-culinary",
        "title": "Ancestral Mole Cooking Masterclass",
        "category": "culinary",
        "price_min": 60.0,
        "price_max": 90.0,
        "duration_minutes": 240,
        "city": "Oaxaca",
        "lat": 17.062,
        "lng": -96.721,
    }
    res_add2 = await test_client.post("/me/itinerary/items", json=item2)
    assert res_add2.status_code == 201
    itin2 = res_add2.json()
    assert len(itin2["items"]) >= 2

    # 4. Reorder items
    reorder_payload = [item2["experience_id"], item1["experience_id"]]
    res_reorder = await test_client.put("/me/itinerary/reorder", json=reorder_payload)
    assert res_reorder.status_code == 200
    reordered_itin = res_reorder.json()
    assert reordered_itin["items"][0]["experience_id"] == item2["experience_id"]

    # 5. Remove first item
    res_del = await test_client.delete(f"/me/itinerary/items/{item2['experience_id']}")
    assert res_del.status_code == 200
    itin_after_del = res_del.json()
    assert not any(i["experience_id"] == item2["experience_id"] for i in itin_after_del["items"])
