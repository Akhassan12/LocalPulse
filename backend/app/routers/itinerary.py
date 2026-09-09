"""
app/routers/itinerary.py — Itinerary CRUD, reordering, and cumulative constraint impact calculations.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
import structlog

from app.auth import AuthUser, get_current_user, get_optional_user

log = structlog.get_logger()
router = APIRouter()

# In-memory storage cache for development mode and fallback persistence
# Map: user_id -> itinerary dict
_ITINERARIES_STORE: Dict[str, dict] = {}


# ── Schemas ──────────────────────────────────────────────────────────────────

class ItineraryItemInput(BaseModel):
    experience_id: str
    title: str
    category: str
    price_min: Decimal = Decimal("0.0")
    price_max: Decimal = Decimal("0.0")
    currency: str = "USD"
    duration_minutes: int = 120
    city: str = "Oaxaca"
    lat: float = 17.06
    lng: float = -96.72
    notes: Optional[str] = None
    position: Optional[int] = None


class ReorderItemInput(BaseModel):
    item_id: str
    position: int


class CumulativeImpactResponse(BaseModel):
    item_count: int
    total_duration_minutes: int
    total_cost_min: Decimal
    total_cost_max: Decimal
    estimated_walk_distance_km: Decimal
    days_of_runway_consumed: Decimal
    warnings: List[str]
    is_balanced: bool


class ItineraryResponse(BaseModel):
    id: str
    name: str
    city: str
    items: List[dict]
    impact: CumulativeImpactResponse


# ── Helpers ──────────────────────────────────────────────────────────────────

def _calculate_impact(items: List[dict], daily_spend: Decimal = Decimal("50.0")) -> CumulativeImpactResponse:
    total_duration = sum(int(item.get("duration_minutes", 120)) for item in items)
    total_min = sum(Decimal(str(item.get("price_min", 0))) for item in items)
    total_max = sum(Decimal(str(item.get("price_max", item.get("price_min", 0)))) for item in items)

    # Estimate sequential walk distance between consecutive lat/lng pins
    est_distance = Decimal("0.0")
    for i in range(len(items) - 1):
        lat1, lng1 = float(items[i].get("lat", 0)), float(items[i].get("lng", 0))
        lat2, lng2 = float(items[i + 1].get("lat", 0)), float(items[i + 1].get("lng", 0))
        # Simple planar approximation for city exploration: 111km per deg
        dlat = (lat2 - lat1) * 111.0
        dlng = (lng2 - lng1) * 111.0 * 0.95
        dist = (dlat**2 + dlng**2) ** 0.5
        est_distance += Decimal(str(round(dist, 2)))

    days_consumed = Decimal(str(round(float(total_max) / float(daily_spend), 1))) if daily_spend > 0 else Decimal("0.0")

    warnings = []
    if total_duration > 480:  # > 8 hours
        warnings.append("High schedule density: Total active time exceeds 8 hours in a single day.")
    if float(total_max) > 200:
        warnings.append(f"High cash burn: Cumulative minimum expense is ${total_max}, consuming {days_consumed} days of daily budget runway.")
    if float(est_distance) > 12.0:
        warnings.append(f"Extensive walking distance: Estimated transfer distance is {est_distance} km.")

    return CumulativeImpactResponse(
        item_count=len(items),
        total_duration_minutes=total_duration,
        total_cost_min=total_min,
        total_cost_max=total_max,
        estimated_walk_distance_km=est_distance,
        days_of_runway_consumed=days_consumed,
        warnings=warnings,
        is_balanced=len(warnings) == 0,
    )


def _get_or_create_itinerary(user_id: str) -> dict:
    if user_id not in _ITINERARIES_STORE:
        now = datetime.now(timezone.utc).isoformat()
        _ITINERARIES_STORE[user_id] = {
            "id": f"itin-{user_id[:8]}",
            "name": "My Cultural Exploration",
            "city": "Oaxaca",
            "items": [],
            "created_at": now,
            "updated_at": now,
        }
    return _ITINERARIES_STORE[user_id]


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get(
    "/me/itinerary",
    response_model=ItineraryResponse,
    summary="Get active itinerary with items and cumulative impact",
)
async def get_active_itinerary(
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    uid = current_user.user_id if current_user else "guest-traveler"
    itin = _get_or_create_itinerary(uid)
    impact = _calculate_impact(itin["items"])

    return ItineraryResponse(
        id=itin["id"],
        name=itin["name"],
        city=itin["city"],
        items=itin["items"],
        impact=impact,
    )


@router.post(
    "/me/itinerary/items",
    response_model=ItineraryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add experience to active itinerary",
)
async def add_item_to_itinerary(
    payload: ItineraryItemInput,
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    uid = current_user.user_id if current_user else "guest-traveler"
    itin = _get_or_create_itinerary(uid)

    # Check if already present
    for existing in itin["items"]:
        if existing["experience_id"] == payload.experience_id:
            impact = _calculate_impact(itin["items"])
            return ItineraryResponse(
                id=itin["id"],
                name=itin["name"],
                city=itin["city"],
                items=itin["items"],
                impact=impact,
            )

    new_item = {
        "id": f"item-{uuid.uuid4().hex[:8]}",
        "experience_id": payload.experience_id,
        "title": payload.title,
        "category": payload.category,
        "price_min": float(payload.price_min),
        "price_max": float(payload.price_max or payload.price_min),
        "currency": payload.currency,
        "duration_minutes": payload.duration_minutes,
        "city": payload.city,
        "lat": payload.lat,
        "lng": payload.lng,
        "notes": payload.notes,
        "position": len(itin["items"]) + 1,
        "added_at": datetime.now(timezone.utc).isoformat(),
    }

    itin["items"].append(new_item)
    itin["updated_at"] = datetime.now(timezone.utc).isoformat()
    log.info("itinerary.item_added", user_id=uid, experience_id=payload.experience_id)

    impact = _calculate_impact(itin["items"])
    return ItineraryResponse(
        id=itin["id"],
        name=itin["name"],
        city=itin["city"],
        items=itin["items"],
        impact=impact,
    )


@router.delete(
    "/me/itinerary/items/{experience_or_item_id}",
    response_model=ItineraryResponse,
    summary="Remove experience from active itinerary",
)
async def remove_item_from_itinerary(
    experience_or_item_id: str,
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    uid = current_user.user_id if current_user else "guest-traveler"
    itin = _get_or_create_itinerary(uid)

    original_count = len(itin["items"])
    itin["items"] = [
        item for item in itin["items"]
        if item["id"] != experience_or_item_id and item["experience_id"] != experience_or_item_id
    ]

    # Re-normalize positions
    for idx, item in enumerate(itin["items"]):
        item["position"] = idx + 1

    itin["updated_at"] = datetime.now(timezone.utc).isoformat()
    log.info("itinerary.item_removed", user_id=uid, removed_id=experience_or_item_id)

    impact = _calculate_impact(itin["items"])
    return ItineraryResponse(
        id=itin["id"],
        name=itin["name"],
        city=itin["city"],
        items=itin["items"],
        impact=impact,
    )


@router.put(
    "/me/itinerary/reorder",
    response_model=ItineraryResponse,
    summary="Reorder experiences in active itinerary",
)
async def reorder_itinerary_items(
    ordered_ids: List[str],
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    uid = current_user.user_id if current_user else "guest-traveler"
    itin = _get_or_create_itinerary(uid)

    item_map = {item["id"]: item for item in itin["items"]}
    item_map.update({item["experience_id"]: item for item in itin["items"]})

    reordered = []
    seen = set()
    for item_id in ordered_ids:
        if item_id in item_map and item_id not in seen:
            item = item_map[item_id]
            reordered.append(item)
            seen.add(item["id"])
            seen.add(item["experience_id"])

    # Append any unmentioned items
    for item in itin["items"]:
        if item["id"] not in seen:
            reordered.append(item)
            seen.add(item["id"])

    for idx, item in enumerate(reordered):
        item["position"] = idx + 1

    itin["items"] = reordered
    itin["updated_at"] = datetime.now(timezone.utc).isoformat()
    log.info("itinerary.items_reordered", user_id=uid, count=len(reordered))

    impact = _calculate_impact(itin["items"])
    return ItineraryResponse(
        id=itin["id"],
        name=itin["name"],
        city=itin["city"],
        items=itin["items"],
        impact=impact,
    )


@router.get(
    "/me/itinerary/cumulative-impact",
    response_model=CumulativeImpactResponse,
    summary="Get cumulative constraint impact (time, cost, runway, warnings)",
)
async def get_cumulative_impact(
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    uid = current_user.user_id if current_user else "guest-traveler"
    itin = _get_or_create_itinerary(uid)
    return _calculate_impact(itin["items"])
