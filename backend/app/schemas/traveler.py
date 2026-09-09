"""
app/schemas/traveler.py — Pydantic v2 schemas for traveler profile and inventory
All financial and physical metrics are strictly Decimal.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Literal, Optional, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


TravelerType = Literal["solo", "couple", "family", "backpacker", "business"]
AssetType = Literal["physical_item", "skill"]


class TravelerProfileBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str = Field(..., min_length=2, max_length=100)
    traveler_type: TravelerType = "solo"
    interests: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list)
    accessibility_needs: list[str] = Field(default_factory=list)
    preferred_budget_min: Optional[Decimal] = Field(default=Decimal("0"), ge=0)
    preferred_budget_max: Optional[Decimal] = Field(default=Decimal("200"), ge=0)
    home_currency: str = Field(default="USD", max_length=3)
    max_carry_capacity_kg: Optional[Decimal] = Field(default=Decimal("15.0"), ge=0, le=100)
    current_carried_weight_kg: Decimal = Field(default=Decimal("0.0"), ge=0)
    liquid_cash: Decimal = Field(default=Decimal("0.0"), ge=0)
    average_daily_spend: Optional[Decimal] = Field(default=Decimal("50.0"), ge=0)
    remaining_travel_days: int = Field(default=0, ge=0)
    minimum_emergency_reserve: Decimal = Field(default=Decimal("0.0"), ge=0)

    @model_validator(mode="after")
    def validate_budget_and_weight(self) -> "TravelerProfileBase":
        if self.preferred_budget_min is not None and self.preferred_budget_max is not None:
            if self.preferred_budget_min > self.preferred_budget_max:
                raise ValueError("preferred_budget_min must be <= preferred_budget_max")
        if self.max_carry_capacity_kg is not None:
            if self.current_carried_weight_kg > self.max_carry_capacity_kg:
                raise ValueError("current_carried_weight_kg cannot exceed max_carry_capacity_kg")
        return self


class TravelerProfileCreate(TravelerProfileBase):
    pass


class TravelerProfileUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    traveler_type: Optional[TravelerType] = None
    interests: Optional[list[str]] = None
    dietary_preferences: Optional[list[str]] = None
    accessibility_needs: Optional[list[str]] = None
    preferred_budget_min: Optional[Decimal] = Field(None, ge=0)
    preferred_budget_max: Optional[Decimal] = Field(None, ge=0)
    home_currency: Optional[str] = Field(None, max_length=3)
    max_carry_capacity_kg: Optional[Decimal] = Field(None, ge=0, le=100)
    current_carried_weight_kg: Optional[Decimal] = Field(None, ge=0)
    liquid_cash: Optional[Decimal] = Field(None, ge=0)
    average_daily_spend: Optional[Decimal] = Field(None, ge=0)
    remaining_travel_days: Optional[int] = Field(None, ge=0)
    minimum_emergency_reserve: Optional[Decimal] = Field(None, ge=0)


class TravelerProfileResponse(TravelerProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class InventoryItemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., min_length=1, max_length=200)
    asset_type: AssetType = "physical_item"
    category: Optional[str] = None
    estimated_barter_value: Decimal = Field(default=Decimal("0.0"), ge=0)
    currency: str = Field(default="USD", max_length=3)
    weight_kg: Decimal = Field(default=Decimal("0.0"), ge=0)
    available_quantity: Decimal = Field(default=Decimal("1.0"), ge=0)
    minimum_retained_quantity: Decimal = Field(default=Decimal("0.0"), ge=0)
    unit_label: str = "unit"
    tradeable: bool = True
    utility_score: Decimal = Field(default=Decimal("0.0"), ge=0, le=100)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_quantities(self) -> "InventoryItemBase":
        if self.available_quantity < self.minimum_retained_quantity:
            raise ValueError("available_quantity must be >= minimum_retained_quantity")
        return self


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    category: Optional[str] = None
    estimated_barter_value: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = None
    weight_kg: Optional[Decimal] = Field(None, ge=0)
    available_quantity: Optional[Decimal] = Field(None, ge=0)
    minimum_retained_quantity: Optional[Decimal] = Field(None, ge=0)
    unit_label: Optional[str] = None
    tradeable: Optional[bool] = None
    utility_score: Optional[Decimal] = Field(None, ge=0, le=100)
    metadata: Optional[dict[str, Any]] = None


class InventoryItemResponse(InventoryItemBase):
    id: UUID
    traveler_id: UUID
    created_at: datetime
    updated_at: datetime
