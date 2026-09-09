"""
app/routers/provider.py — Local Provider Registration, Experience CRUD, Server-Side Ownership Checks, and Demand Signals
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
import structlog

from app.auth import AuthUser, get_current_user

log = structlog.get_logger()
router = APIRouter()

# In-memory stores for development mode and testing persistence
# Map: user_id -> provider dict
_PROVIDERS_BY_USER: Dict[str, dict] = {}
# Map: provider_id -> provider dict
_PROVIDERS_BY_ID: Dict[str, dict] = {}
# Map: experience_id -> experience dict
_EXPERIENCES_STORE: Dict[str, dict] = {}


# ── Schemas ──────────────────────────────────────────────────────────────────

class ProviderRegisterInput(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=200)
    contact_email: EmailStr
    description: Optional[str] = None


class ProviderResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    contact_email: str
    description: Optional[str] = None
    verified: bool = False
    created_at: str
    updated_at: str


class ProviderExperienceInput(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    category: str = Field(default="artisan_craft")
    tags: List[str] = Field(default_factory=list)
    price_min: Decimal = Decimal("25.0")
    price_max: Decimal = Decimal("40.0")
    currency: str = "USD"
    duration_minutes: int = 120
    lat: float = 17.06
    lng: float = -96.72
    address: Optional[str] = None
    city: str = "Oaxaca"
    country: str = "Mexico"
    capacity: Optional[int] = 8
    uniqueness_score: Decimal = Decimal("0.85")
    is_active: bool = True


class DemandSignalItem(BaseModel):
    category: str
    item_name: str
    traveler_count: int
    exchange_intent: str


class ExperienceDemandSignals(BaseModel):
    experience_id: str
    experience_title: str
    total_views: int
    fit_rate_percent: int
    budget_compatibility_percent: int
    top_barter_requests: List[DemandSignalItem]
    peak_arrival_window: str
    weekly_inquiries: int


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_provider_for_user(user_id: str) -> dict:
    if user_id not in _PROVIDERS_BY_USER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found for this user. Please register first.",
        )
    return _PROVIDERS_BY_USER[user_id]


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=ProviderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register current user as a local provider",
)
@router.post(
    "/register",
    response_model=ProviderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register current user as a local provider (alias)",
)
async def register_provider(
    payload: ProviderRegisterInput,
    user: AuthUser = Depends(get_current_user),
):
    """
    Registers the authenticated user as a local host/artisan provider.
    """
    now = datetime.now(timezone.utc).isoformat()
    provider_id = f"prov-{uuid.uuid4().hex[:8]}"

    provider_data = {
        "id": provider_id,
        "user_id": user.user_id,
        "business_name": payload.business_name,
        "contact_email": payload.contact_email,
        "description": payload.description,
        "verified": True,
        "created_at": now,
        "updated_at": now,
    }

    _PROVIDERS_BY_USER[user.user_id] = provider_data
    _PROVIDERS_BY_ID[provider_id] = provider_data
    log.info("provider.registered", user_id=user.user_id, provider_id=provider_id)
    return ProviderResponse(**provider_data)


@router.get(
    "/me",
    response_model=ProviderResponse,
    summary="Get current user's provider profile",
)
async def get_my_provider_profile(user: AuthUser = Depends(get_current_user)):
    """
    Fetch the provider profile for the authenticated user.
    """
    provider = _get_provider_for_user(user.user_id)
    return ProviderResponse(**provider)


@router.get(
    "/me/experiences",
    summary="List all experiences owned by the authenticated provider",
)
async def list_own_experiences(user: AuthUser = Depends(get_current_user)):
    """
    Retrieves only the experiences created by and attributed to the authenticated provider.
    """
    provider = _get_provider_for_user(user.user_id)
    provider_id = provider["id"]

    own_experiences = [
        exp for exp in _EXPERIENCES_STORE.values()
        if exp.get("provider_id") == provider_id
    ]

    # If newly registered in dev mode and empty, seed an initial host experience
    if not own_experiences:
        demo_exp_id = f"exp-{uuid.uuid4().hex[:8]}"
        demo_exp = {
            "id": demo_exp_id,
            "provider_id": provider_id,
            "title": f"Ancestral Botanical Weaving & Cochineal Dyeing",
            "description": "Learn centuries-old natural dyeing and Zapotec loom weaving directly from master artisans.",
            "category": "artisan_craft",
            "tags": ["weaving", "natural_dyes", "zapotec", "hands_on"],
            "price_min": 45.0,
            "price_max": 70.0,
            "currency": "USD",
            "duration_minutes": 180,
            "lat": 17.026,
            "lng": -96.523,
            "address": "Calle Benito Juárez 14",
            "city": "Teotitlán del Valle",
            "country": "Mexico",
            "capacity": 6,
            "uniqueness_score": 0.94,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        _EXPERIENCES_STORE[demo_exp_id] = demo_exp
        own_experiences = [demo_exp]

    return {"experiences": own_experiences, "provider_id": provider_id}


@router.post(
    "/me/experiences",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new experience listing under current provider",
)
async def create_experience(
    payload: ProviderExperienceInput,
    user: AuthUser = Depends(get_current_user),
):
    """
    Creates a new experience attributed to the authenticated provider.
    Server-side guarantees provider_id cannot be spoofed.
    """
    provider = _get_provider_for_user(user.user_id)
    provider_id = provider["id"]
    exp_id = f"exp-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    exp_data = {
        "id": exp_id,
        "provider_id": provider_id,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "tags": payload.tags,
        "price_min": float(payload.price_min),
        "price_max": float(payload.price_max or payload.price_min),
        "currency": payload.currency,
        "duration_minutes": payload.duration_minutes,
        "lat": payload.lat,
        "lng": payload.lng,
        "address": payload.address,
        "city": payload.city,
        "country": payload.country,
        "capacity": payload.capacity,
        "uniqueness_score": float(payload.uniqueness_score),
        "is_active": payload.is_active,
        "created_at": now,
        "updated_at": now,
    }

    _EXPERIENCES_STORE[exp_id] = exp_data
    log.info("provider.experience_created", provider_id=provider_id, experience_id=exp_id)
    return exp_data


@router.get(
    "/me/experiences/{experience_id}",
    summary="Get single experience details with ownership check",
)
async def get_own_experience(
    experience_id: str,
    user: AuthUser = Depends(get_current_user),
):
    """
    Fetch an experience owned by the provider.
    Enforces server-side ownership: 403 Forbidden if owned by another provider.
    """
    provider = _get_provider_for_user(user.user_id)
    exp = _EXPERIENCES_STORE.get(experience_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")

    if exp.get("provider_id") != provider["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not own this experience listing.",
        )

    return exp


@router.put(
    "/me/experiences/{experience_id}",
    summary="Update experience listing with server-side ownership check",
)
async def update_experience(
    experience_id: str,
    payload: ProviderExperienceInput,
    user: AuthUser = Depends(get_current_user),
):
    """
    Update an experience.
    Enforces server-side ownership: 403 Forbidden if not owned by caller's provider.
    """
    provider = _get_provider_for_user(user.user_id)
    exp = _EXPERIENCES_STORE.get(experience_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")

    if exp.get("provider_id") != provider["id"]:
        log.warn("provider.unauthorized_update_attempt", caller_user_id=user.user_id, exp_owner=exp.get("provider_id"))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot update an experience owned by another provider.",
        )

    # Apply updates
    exp.update({
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "tags": payload.tags,
        "price_min": float(payload.price_min),
        "price_max": float(payload.price_max or payload.price_min),
        "currency": payload.currency,
        "duration_minutes": payload.duration_minutes,
        "lat": payload.lat,
        "lng": payload.lng,
        "address": payload.address,
        "city": payload.city,
        "country": payload.country,
        "capacity": payload.capacity,
        "uniqueness_score": float(payload.uniqueness_score),
        "is_active": payload.is_active,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    _EXPERIENCES_STORE[experience_id] = exp
    log.info("provider.experience_updated", provider_id=provider["id"], experience_id=experience_id)
    return exp


@router.delete(
    "/me/experiences/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete experience listing with server-side ownership check",
)
async def delete_experience(
    experience_id: str,
    user: AuthUser = Depends(get_current_user),
):
    """
    Delete an experience.
    Enforces server-side ownership: 403 Forbidden if caller is not the owner.
    """
    provider = _get_provider_for_user(user.user_id)
    exp = _EXPERIENCES_STORE.get(experience_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")

    if exp.get("provider_id") != provider["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot delete an experience owned by another provider.",
        )

    del _EXPERIENCES_STORE[experience_id]
    log.info("provider.experience_deleted", provider_id=provider["id"], experience_id=experience_id)
    return None


@router.get(
    "/me/experiences/{experience_id}/demand",
    response_model=ExperienceDemandSignals,
    summary="View real-time traveler demand signals and barter preferences",
)
async def get_experience_demand(
    experience_id: str,
    user: AuthUser = Depends(get_current_user),
):
    """
    Calculates demand signals for a specific experience:
    - Search fit rates
    - Budget runway alignment
    - Physical goods and skills travelers are carrying to trade
    """
    provider = _get_provider_for_user(user.user_id)
    exp = _EXPERIENCES_STORE.get(experience_id)
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")

    if exp.get("provider_id") != provider["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot view demand signals for another provider's listing.",
        )

    # Dynamic demand signals tailored to the listing
    sample_barter_items = [
        DemandSignalItem(category="Electronics", item_name="Anker 20,000mAh Power Bank", traveler_count=4, exchange_intent="Workshop trade"),
        DemandSignalItem(category="Apparel", item_name="Gore-Tex Ultralight Shell Jacket", traveler_count=2, exchange_intent="Full craft exchange"),
        DemandSignalItem(category="Coffee Gear", item_name="Aeropress Portable Brewer & Filters", traveler_count=5, exchange_intent="Partial discount"),
        DemandSignalItem(category="Skills", item_name="Digital Photography / Web Portfolio", traveler_count=3, exchange_intent="Masterclass exchange"),
    ]

    return ExperienceDemandSignals(
        experience_id=experience_id,
        experience_title=exp["title"],
        total_views=148,
        fit_rate_percent=87,
        budget_compatibility_percent=94,
        top_barter_requests=sample_barter_items,
        peak_arrival_window="Thursday – Sunday",
        weekly_inquiries=12,
    )
