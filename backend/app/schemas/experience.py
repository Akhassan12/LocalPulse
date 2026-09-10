"""
app/schemas/experience.py — Pydantic models for experiences and live ranking
"""
from __future__ import annotations

from decimal import Decimal
from typing import Optional, Any, Literal, List
from uuid import UUID
from datetime import datetime, time
from pydantic import BaseModel, ConfigDict, Field, model_validator


ExperienceCategory = Literal[
    "food",
    "culture",
    "outdoor",
    "market",
    "shopping",
    "workshop",
    "tour",
    "nightlife",
    "wellness",
]


class ExperienceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: ExperienceCategory = "culture"
    tags: list[str] = Field(default_factory=list)
    price_min: Optional[Decimal] = Field(default=Decimal("0.0"), ge=0)
    price_max: Optional[Decimal] = Field(default=Decimal("0.0"), ge=0)
    currency: str = Field(default="USD", max_length=3)
    duration_minutes: int = Field(..., gt=0)
    lat: float
    lng: float
    address: Optional[str] = None
    city: str
    country: str
    opening_hours: dict[str, Any] = Field(default_factory=dict)
    capacity: Optional[int] = Field(default=None, gt=0)
    accessibility_tags: list[str] = Field(default_factory=list)
    rating_avg: Decimal = Field(default=Decimal("0.0"), ge=0, le=5)
    rating_count: int = Field(default=0, ge=0)
    uniqueness_score: Decimal = Field(default=Decimal("0.5"), ge=0, le=1)
    is_active: bool = True
    source: Literal["provider", "scraped", "seed", "gemini_ai", "ai_mined"] = "seed"


class Experience(ExperienceBase):
    id: UUID
    provider_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LiveContext(BaseModel):
    model_config = ConfigDict(frozen=True)

    lat: float
    lng: float
    available_minutes: int = Field(..., gt=0)
    remaining_budget: Decimal = Field(default=Decimal("100.0"), ge=0)
    group_size: int = Field(default=1, ge=1)
    current_time: datetime = Field(default_factory=datetime.utcnow)
    show_closed: bool = False
    city: Optional[str] = None
    circumstance_mode: Optional[str] = None  # "normal", "monsoon_rain", "time_crunch", "budget_saver", "family_mode", "heatwave"
    traveler_type: Optional[str] = None  # "solo", "couple", "family", "friends"
    accessibility_needs: Optional[List[str]] = None
    interests: Optional[List[str]] = None


class FitBreakdown(BaseModel):
    model_config = ConfigDict(frozen=True)

    interest_score: Decimal
    time_score: Decimal
    budget_score: Decimal
    distance_score: Decimal
    quality_score: Decimal
    accessibility_score: Decimal
    capacity_modifier: Decimal = Decimal("1.0")


class RankedExperience(BaseModel):
    model_config = ConfigDict(frozen=True)

    experience: Experience
    fit_score: Decimal  # 0 to 100
    breakdown: FitBreakdown
    explanation: str
    walking_distance_km: Decimal
    estimated_walk_minutes: int
