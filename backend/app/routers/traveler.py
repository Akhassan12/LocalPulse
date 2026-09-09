"""
app/routers/traveler.py — Authenticated traveler profile and inventory CRUD
Enforces user ownership via server-verified JWT claims (get_current_user).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
import structlog

from app.auth import AuthUser, get_current_user
from app.schemas.traveler import (
    TravelerProfileCreate,
    TravelerProfileUpdate,
    TravelerProfileResponse,
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
)

log = structlog.get_logger()
router = APIRouter()

# In-memory storage cache for development mode and fallback persistence
# Map: user_id -> profile dict
_PROFILES_STORE: Dict[str, dict] = {}
# Map: user_id -> list of item dicts
_INVENTORY_STORE: Dict[str, List[dict]] = {}


def _get_or_create_default_profile(user_id: str) -> dict:
    if user_id not in _PROFILES_STORE:
        now = datetime.now(timezone.utc)
        _PROFILES_STORE[user_id] = {
            "id": uuid.uuid4(),
            "user_id": uuid.UUID(user_id) if len(user_id) == 36 else uuid.uuid5(uuid.NAMESPACE_DNS, user_id),
            "display_name": "Expedition Explorer",
            "traveler_type": "solo",
            "interests": ["Hidden Alley Food", "Night Markets", "Artisan Workshops"],
            "dietary_preferences": ["No restrictions"],
            "accessibility_needs": ["None needed"],
            "preferred_budget_min": Decimal("20.0"),
            "preferred_budget_max": Decimal("150.0"),
            "home_currency": "USD",
            "max_carry_capacity_kg": Decimal("15.0"),
            "current_carried_weight_kg": Decimal("3.5"),
            "liquid_cash": Decimal("500.0"),
            "average_daily_spend": Decimal("50.0"),
            "remaining_travel_days": 7,
            "minimum_emergency_reserve": Decimal("100.0"),
            "created_at": now,
            "updated_at": now,
        }
    return _PROFILES_STORE[user_id]


@router.get("/profile", response_model=TravelerProfileResponse, summary="Get current traveler profile")
async def get_profile(user: AuthUser = Depends(get_current_user)):
    """
    Retrieve the traveler profile for the authenticated user.
    """
    profile = _get_or_create_default_profile(user.user_id)
    return profile


@router.post("/profile", response_model=TravelerProfileResponse, status_code=status.HTTP_201_CREATED, summary="Create traveler profile")
async def create_profile(
    payload: TravelerProfileCreate,
    user: AuthUser = Depends(get_current_user),
):
    """
    Create a new traveler profile during onboarding.
    """
    now = datetime.now(timezone.utc)
    u_id = uuid.UUID(user.user_id) if len(user.user_id) == 36 else uuid.uuid5(uuid.NAMESPACE_DNS, user.user_id)
    
    profile_data = {
        "id": uuid.uuid4(),
        "user_id": u_id,
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    _PROFILES_STORE[user.user_id] = profile_data
    log.info("traveler.profile_created", user_id=user.user_id)
    return profile_data


@router.put("/profile", response_model=TravelerProfileResponse, summary="Update traveler profile")
async def update_profile(
    payload: TravelerProfileUpdate,
    user: AuthUser = Depends(get_current_user),
):
    """
    Update traveler profile preferences or BazaarLink constraints.
    """
    profile = _get_or_create_default_profile(user.user_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        if val is not None:
            profile[field] = val

    profile["updated_at"] = datetime.now(timezone.utc)
    _PROFILES_STORE[user.user_id] = profile
    log.info("traveler.profile_updated", user_id=user.user_id)
    return profile


# ── Inventory Items (BazaarLink Asset Management) ───────────────────────────

@router.get("/inventory", response_model=List[InventoryItemResponse], summary="List traveler inventory items")
async def list_inventory(user: AuthUser = Depends(get_current_user)):
    """
    List physical and skill assets tradeable on BazaarLink.
    """
    profile = _get_or_create_default_profile(user.user_id)
    return _INVENTORY_STORE.get(user.user_id, [])


@router.post("/inventory", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED, summary="Add item to inventory")
async def add_inventory_item(
    payload: InventoryItemCreate,
    user: AuthUser = Depends(get_current_user),
):
    """
    Add a tradeable item or skill asset to the traveler's pack.
    """
    profile = _get_or_create_default_profile(user.user_id)
    now = datetime.now(timezone.utc)
    item_id = uuid.uuid4()

    item_data = {
        "id": item_id,
        "traveler_id": profile["id"],
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
    }

    if user.user_id not in _INVENTORY_STORE:
        _INVENTORY_STORE[user.user_id] = []

    _INVENTORY_STORE[user.user_id].append(item_data)
    log.info("traveler.inventory_item_added", user_id=user.user_id, item_id=str(item_id))
    return item_data


@router.delete("/inventory/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove item from inventory")
async def delete_inventory_item(
    item_id: uuid.UUID,
    user: AuthUser = Depends(get_current_user),
):
    """
    Remove an inventory item owned by the caller.
    """
    items = _INVENTORY_STORE.get(user.user_id, [])
    new_items = [i for i in items if i["id"] != item_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found")
    _INVENTORY_STORE[user.user_id] = new_items
    log.info("traveler.inventory_item_deleted", user_id=user.user_id, item_id=str(item_id))
    return None
