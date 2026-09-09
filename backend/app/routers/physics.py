"""
app/routers/physics.py — Physics, Finance & BazaarLink Calculation Endpoints
Routes:
  POST /physics/carrying-impact
  POST /finance/runway-impact
  POST /scans/detect
  POST /barter/matches
"""
from __future__ import annotations

import base64
from decimal import Decimal
from typing import Optional, List, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.auth import get_current_user, get_optional_user, AuthUser
from app.services.physics_engine import (
    CarryingCapacityEngine,
    CarryingImpactResult,
    CapacityValidationError,
)
from app.services.runway_calculator import (
    CashRunwayCalculator,
    RunwayImpactResult,
)
from app.services.barter_optimizer import (
    BarterOptimizer,
    BarterPackagesResult,
)
from app.services.vision_detection import (
    ItemDetectionService,
    DetectedItemResult,
)
from app.models import InventoryItem, TravelerProfile

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class CarryingImpactRequest(BaseModel):
    max_capacity_kg: Decimal = Field(..., ge=0)
    current_weight_kg: Decimal = Field(..., ge=0)
    item_weight_kg: Decimal = Field(..., ge=0)
    allow_overloaded_state: bool = False


class RunwayImpactRequest(BaseModel):
    liquid_cash: Decimal = Field(..., ge=0)
    average_daily_spend: Decimal = Field(..., ge=0)
    remaining_travel_days: int = Field(..., ge=0)
    item_cash_price: Decimal = Field(..., ge=0)
    barter_value: Optional[Decimal] = Field(None, ge=0)
    minimum_emergency_reserve: Decimal = Field(default=Decimal("0.0"), ge=0)


class BarterMatchItemInput(BaseModel):
    id: Optional[UUID] = None
    item_name: str
    category: str
    estimated_value: Decimal = Field(..., ge=0)
    weight_kg: Decimal = Field(..., ge=0)
    quantity: int = Field(default=1, ge=1)
    willing_to_trade: bool = True


class BarterMatchesRequest(BaseModel):
    target_item_value: Decimal = Field(..., gt=0)
    target_item_weight_kg: Decimal = Field(..., ge=0)
    remaining_backpack_capacity_kg: Decimal = Field(..., ge=0)
    inventory: Optional[List[BarterMatchItemInput]] = None


class Base64ScanRequest(BaseModel):
    image_base64: str
    filename: Optional[str] = None
    city_hint: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/physics/carrying-impact",
    response_model=CarryingImpactResult,
    summary="Calculate carrying capacity impact (pure calculation)",
)
async def carrying_impact(payload: CarryingImpactRequest) -> CarryingImpactResult:
    """Calculate before/after capacity, fit status, and weight categorization."""
    try:
        return CarryingCapacityEngine.calculate(
            max_capacity_kg=payload.max_capacity_kg,
            current_weight_kg=payload.current_weight_kg,
            item_weight_kg=payload.item_weight_kg,
            allow_overloaded_state=payload.allow_overloaded_state,
        )
    except CapacityValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.post(
    "/finance/runway-impact",
    response_model=RunwayImpactResult,
    summary="Calculate cash runway impact (pure calculation)",
)
async def runway_impact(payload: RunwayImpactRequest) -> RunwayImpactResult:
    """Calculate days lost/preserved, emergency reserve preservation, and runway projection."""
    try:
        return CashRunwayCalculator.calculate(
            liquid_cash=payload.liquid_cash,
            average_daily_spend=payload.average_daily_spend,
            remaining_travel_days=payload.remaining_travel_days,
            item_cash_price=payload.item_cash_price,
            barter_value=payload.barter_value,
            minimum_emergency_reserve=payload.minimum_emergency_reserve,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.post(
    "/scans/detect",
    response_model=DetectedItemResult,
    summary="Detect and valuate item from image (multipart or base64)",
)
async def scan_detect(
    file: Optional[UploadFile] = File(None),
    city_hint: Optional[str] = Form(None),
    current_user: Optional[AuthUser] = Depends(get_optional_user),
) -> DetectedItemResult:
    """
    Detect item details from an uploaded image.
    Supports camera capture / file upload via multipart/form-data.
    """
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An image file is required.",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return await ItemDetectionService.detect_from_image(
        image_bytes=contents,
        filename=file.filename,
        city_hint=city_hint,
    )


@router.post(
    "/scans/detect-base64",
    response_model=DetectedItemResult,
    summary="Detect item from base64 JSON payload",
)
async def scan_detect_base64(
    payload: Base64ScanRequest,
    current_user: Optional[AuthUser] = Depends(get_optional_user),
) -> DetectedItemResult:
    """Detect item details from a base64 encoded image string."""
    try:
        # Strip header if present e.g. "data:image/jpeg;base64,..."
        raw_b64 = payload.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        image_bytes = base64.b64decode(raw_b64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 image data.",
        )

    return await ItemDetectionService.detect_from_image(
        image_bytes=image_bytes,
        filename=payload.filename,
        city_hint=payload.city_hint,
    )


@router.post(
    "/barter/matches",
    response_model=BarterPackagesResult,
    summary="Find barter packages for a target market item",
)
async def barter_matches(
    payload: BarterMatchesRequest,
    current_user: Optional[AuthUser] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> BarterPackagesResult:
    """
    Generate trade combinations from traveler's inventory using bounded knapsack solver.
    If inventory is explicitly provided in request body, uses it directly.
    Otherwise, reads inventory from the database for the authenticated user.
    """
    tradeable_inventory: list[dict[str, Any]] = []

    if payload.inventory is not None and len(payload.inventory) > 0:
        for item in payload.inventory:
            if item.willing_to_trade:
                tradeable_inventory.append({
                    "id": item.id,
                    "item_name": item.item_name,
                    "estimated_value": item.estimated_value,
                    "weight_kg": item.weight_kg,
                    "quantity": item.quantity,
                    "willing_to_trade": True,
                })
    elif current_user:
        # Load user inventory from database
        stmt = select(InventoryItem).where(
            InventoryItem.user_id == current_user.user_id,
            InventoryItem.willing_to_trade == True,
        )
        result = await db.execute(stmt)
        db_items = result.scalars().all()
        for item in db_items:
            tradeable_inventory.append({
                "id": item.id,
                "item_name": item.item_name,
                "estimated_value": item.estimated_value,
                "weight_kg": item.weight_kg,
                "quantity": item.quantity,
                "willing_to_trade": item.willing_to_trade,
            })

    # Default fallback sample inventory if user has none added yet, to allow instant interactive demonstration
    if len(tradeable_inventory) == 0:
        tradeable_inventory = [
            {
                "id": None,
                "item_name": "Leather Bound Travel Journal",
                "estimated_value": Decimal("18.00"),
                "weight_kg": Decimal("0.25"),
                "quantity": 1,
                "willing_to_trade": True,
            },
            {
                "id": None,
                "item_name": "Vintage Brass Compass",
                "estimated_value": Decimal("24.00"),
                "weight_kg": Decimal("0.15"),
                "quantity": 1,
                "willing_to_trade": True,
            },
            {
                "id": None,
                "item_name": "Hand-dyed Silk Bandana",
                "estimated_value": Decimal("15.00"),
                "weight_kg": Decimal("0.05"),
                "quantity": 2,
                "willing_to_trade": True,
            },
        ]

    return BarterOptimizer.find_packages(
        target_item_value=payload.target_item_value,
        target_item_weight_kg=payload.target_item_weight_kg,
        remaining_backpack_capacity_kg=payload.remaining_backpack_capacity_kg,
        inventory=tradeable_inventory,
        max_assets_per_package=4,
        minimum_value_ratio=Decimal("0.85"),
        max_packages_to_return=5,
    )
