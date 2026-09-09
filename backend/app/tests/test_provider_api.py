"""
app/tests/test_provider_api.py — Integration tests for Phase 9 Provider Dashboard & Ownership Checks
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from main import app
from app.database import Base, get_db
from app.auth import get_current_user, AuthUser

USER_A = AuthUser(
    user_id="user-provider-alpha-1234",
    email="artisan@oaxaca.mx",
    role="authenticated",
)

USER_B = AuthUser(
    user_id="user-provider-beta-5678",
    email="host@chiapas.mx",
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

    # Default to USER_A
    current_active_user = [USER_A]

    async def override_get_current_user():
        return current_active_user[0]

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Expose a helper to switch active user
        client.switch_user = lambda user: current_active_user.__setitem__(0, user)
        yield client

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.mark.anyio
async def test_provider_registration_and_crud(test_client):
    # 1. Register User A as Provider
    reg_payload = {
        "business_name": "Taller Ancestral de Barro Negro",
        "contact_email": "taller@oaxaca.mx",
        "description": "Authentic black clay pottery workshop in San Bartolo Coyotepec",
    }
    res_reg = await test_client.post("/providers/register", json=reg_payload)
    assert res_reg.status_code == 201
    prov_a = res_reg.json()
    assert prov_a["business_name"] == reg_payload["business_name"]

    # 2. Get profile for User A
    res_me = await test_client.get("/providers/me")
    assert res_me.status_code == 200
    assert res_me.json()["id"] == prov_a["id"]

    # 3. Create experience under Provider A
    exp_payload = {
        "title": "Black Clay Burnishing & Wheel Throwing",
        "description": "Shape, scrape and hand-burnish ancestral black clay using river quartz stones.",
        "category": "artisan_craft",
        "tags": ["pottery", "clay", "ancestral", "hands_on"],
        "price_min": 35.0,
        "price_max": 50.0,
        "currency": "USD",
        "duration_minutes": 150,
        "lat": 16.953,
        "lng": -96.708,
        "city": "San Bartolo Coyotepec",
        "country": "Mexico",
        "capacity": 8,
        "uniqueness_score": 0.95,
        "is_active": True,
    }
    res_exp = await test_client.post("/providers/me/experiences", json=exp_payload)
    assert res_exp.status_code == 201
    exp_data = res_exp.json()
    exp_id = exp_data["id"]
    assert exp_data["provider_id"] == prov_a["id"]

    # 4. List experiences for Provider A
    res_list = await test_client.get("/providers/me/experiences")
    assert res_list.status_code == 200
    assert any(e["id"] == exp_id for e in res_list.json()["experiences"])

    # 5. Fetch demand signals for Provider A's experience
    res_demand = await test_client.get(f"/providers/me/experiences/{exp_id}/demand")
    assert res_demand.status_code == 200
    demand_data = res_demand.json()
    assert demand_data["fit_rate_percent"] > 50
    assert len(demand_data["top_barter_requests"]) > 0

    # 6. Switch to User B (Provider B)
    test_client.switch_user(USER_B)

    # Register Provider B
    reg_b = {
        "business_name": "Chiapas Organic Coffee Plantation",
        "contact_email": "finca@chiapas.mx",
        "description": "Highland shade-grown coffee farm tours",
    }
    res_reg_b = await test_client.post("/providers/register", json=reg_b)
    assert res_reg_b.status_code == 201

    # NEGATIVE TEST: Provider B attempts to update Provider A's experience -> 403 FORBIDDEN
    update_payload = dict(exp_payload, title="Hacked title by Provider B")
    res_unauth_update = await test_client.put(f"/providers/me/experiences/{exp_id}", json=update_payload)
    assert res_unauth_update.status_code == 403
    assert "Forbidden" in res_unauth_update.json()["detail"] or "Access denied" in res_unauth_update.json()["detail"]

    # NEGATIVE TEST: Provider B attempts to delete Provider A's experience -> 403 FORBIDDEN
    res_unauth_del = await test_client.delete(f"/providers/me/experiences/{exp_id}")
    assert res_unauth_del.status_code == 403

    # Switch back to User A (Owner)
    test_client.switch_user(USER_A)

    # POSITIVE TEST: Provider A updates their own experience -> 200 OK
    res_owner_update = await test_client.put(
        f"/providers/me/experiences/{exp_id}",
        json=dict(exp_payload, title="Black Clay Masterclass & Quartz Polishing"),
    )
    assert res_owner_update.status_code == 200
    assert res_owner_update.json()["title"] == "Black Clay Masterclass & Quartz Polishing"

    # POSITIVE TEST: Provider A deletes their own experience -> 204 NO CONTENT
    res_owner_del = await test_client.delete(f"/providers/me/experiences/{exp_id}")
    assert res_owner_del.status_code == 204
