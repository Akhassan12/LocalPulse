"""
app/tests/test_bazaarlink_api.py — Integration tests for Phase 7 BazaarLink APIs
"""
import io
import base64
import pytest
from decimal import Decimal
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
async def test_carrying_impact_api(test_client):
    payload = {
        "max_capacity_kg": "15.0",
        "current_weight_kg": "10.0",
        "item_weight_kg": "2.0",
        "allow_overloaded_state": False,
    }
    res = await test_client.post("/physics/carrying-impact", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["fits"] is True
    assert float(data["remaining_after_kg"]) == 3.0
    assert float(data["percent_capacity_used_after"]) == 80.0
    assert data["weight_status"] == "comfortable"

    # Test rejection on overload
    res_err = await test_client.post(
        "/physics/carrying-impact",
        json={
            "max_capacity_kg": "15.0",
            "current_weight_kg": "16.0",
            "item_weight_kg": "1.0",
            "allow_overloaded_state": False,
        },
    )
    assert res_err.status_code == 422


@pytest.mark.anyio
async def test_runway_impact_api(test_client):
    payload = {
        "liquid_cash": "600.0",
        "average_daily_spend": "50.0",
        "remaining_travel_days": 10,
        "item_cash_price": "75.0",
        "minimum_emergency_reserve": "100.0",
    }
    res = await test_client.post("/finance/runway-impact", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["can_afford_item"] is True
    assert data["emergency_reserve_preserved"] is True
    assert float(data["days_lost"]) == 1.5
    assert "projection_note" in data


@pytest.mark.anyio
async def test_scan_detect_api(test_client):
    # Test multipart file upload
    fake_img = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    files = {"file": ("test_ceramic.jpg", io.BytesIO(fake_img), "image/jpeg")}
    res = await test_client.post("/scans/detect", files=files, data={"city_hint": "Tokyo"})
    assert res.status_code == 200
    data = res.json()
    assert "item_name" in data
    assert "fair_market_value" in data
    assert "suggested_opening_bid" in data
    assert len(data["bargaining_phrases"]) >= 2
    assert data["detection_source"] in ("live_ai", "demo_mode")

    # Test base64 endpoint
    b64_str = base64.b64encode(fake_img).decode("utf-8")
    res_b64 = await test_client.post(
        "/scans/detect-base64",
        json={"image_base64": b64_str, "city_hint": "Oaxaca"},
    )
    assert res_b64.status_code == 200
    data_b64 = res_b64.json()
    assert "item_name" in data_b64
    assert float(data_b64["fair_market_value"]) > 0


@pytest.mark.anyio
async def test_barter_matches_api(test_client):
    payload = {
        "target_item_value": "45.0",
        "target_item_weight_kg": "0.35",
        "remaining_backpack_capacity_kg": "3.0",
        "inventory": [
            {
                "item_name": "Silver Ring",
                "category": "jewelry",
                "estimated_value": "30.0",
                "weight_kg": "0.02",
                "quantity": 1,
                "willing_to_trade": True,
            },
            {
                "item_name": "Pocket Watercolor Set",
                "category": "art",
                "estimated_value": "20.0",
                "weight_kg": "0.15",
                "quantity": 1,
                "willing_to_trade": True,
            },
        ],
    }
    res = await test_client.post("/barter/matches", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "packages" in data
    assert "complexity_note" in data
    assert len(data["packages"]) > 0
