"""
app/models/__init__.py — SQLAlchemy 2.0 ORM Models for LocalPulse
Matches LocalPulse_TRD.md Section 3 data model specifications.
"""
from __future__ import annotations

import uuid
from datetime import datetime, date, time
from decimal import Decimal
from typing import Optional, List, Any

from sqlalchemy import (
    String,
    Text,
    Numeric,
    Integer,
    Float,
    Boolean,
    DateTime,
    Date,
    Time,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# Universal UUID Type that works seamlessly on both PostgreSQL and SQLite
class GUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value


# Universal JSON Type that uses JSONB on PostgreSQL and JSON elsewhere
class UniversalJSON(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        else:
            from sqlalchemy import JSON
            return dialect.type_descriptor(JSON())


# ── 3.1 TravelerProfile ───────────────────────────────────────────────────────
class TravelerProfile(Base):
    __tablename__ = "traveler_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), unique=True, nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    traveler_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="solo"
    )
    interests: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False, default=list
    )
    dietary_preferences: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False, default=list
    )
    accessibility_needs: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False, default=list
    )
    preferred_budget_min: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True, default=Decimal("0.0")
    )
    preferred_budget_max: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True, default=Decimal("200.0")
    )
    home_currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="USD"
    )
    max_carry_capacity_kg: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(6, 2), nullable=True, default=Decimal("15.0")
    )
    current_carried_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(6, 2), nullable=False, default=Decimal("0.0")
    )
    liquid_cash: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.0")
    )
    average_daily_spend: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True, default=Decimal("50.0")
    )
    remaining_travel_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    minimum_emergency_reserve: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.0")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "preferred_budget_min IS NULL OR preferred_budget_max IS NULL OR preferred_budget_min <= preferred_budget_max",
            name="check_budget_range",
        ),
        CheckConstraint(
            "max_carry_capacity_kg IS NULL OR max_carry_capacity_kg >= 0",
            name="check_max_capacity_positive",
        ),
        CheckConstraint("current_carried_weight_kg >= 0", name="check_weight_positive"),
        CheckConstraint("liquid_cash >= 0", name="check_cash_positive"),
        CheckConstraint("remaining_travel_days >= 0", name="check_days_positive"),
        CheckConstraint("minimum_emergency_reserve >= 0", name="check_reserve_positive"),
    )

    # Relationships
    inventory_items: Mapped[List["InventoryItem"]] = relationship(
        "InventoryItem", back_populates="traveler", cascade="all, delete-orphan"
    )
    itineraries: Mapped[List["Itinerary"]] = relationship(
        "Itinerary", back_populates="traveler", cascade="all, delete-orphan"
    )


# ── 3.2 InventoryItem ─────────────────────────────────────────────────────────
class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    traveler_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("traveler_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    asset_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="physical_item"
    )
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    estimated_barter_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0.0")
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(6, 2), nullable=False, default=Decimal("0.0")
    )
    available_quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("1.0")
    )
    minimum_retained_quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0.0")
    )
    unit_label: Mapped[str] = mapped_column(String(50), nullable=False, default="unit")
    tradeable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    utility_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, default=Decimal("0.0")
    )
    metadata_: Mapped[dict] = mapped_column(
        "metadata", UniversalJSON(), nullable=False, default=dict
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "available_quantity >= minimum_retained_quantity",
            name="check_available_ge_retained",
        ),
        CheckConstraint(
            "estimated_barter_value >= 0 AND weight_kg >= 0 AND available_quantity >= 0",
            name="check_item_metrics_non_negative",
        ),
    )

    traveler: Mapped["TravelerProfile"] = relationship(
        "TravelerProfile", back_populates="inventory_items"
    )


# ── 3.3 Provider ──────────────────────────────────────────────────────────────
class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), nullable=False, index=True
    )
    business_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    experiences: Mapped[List["Experience"]] = relationship(
        "Experience", back_populates="provider"
    )


# ── 3.4 Experience ────────────────────────────────────────────────────────────
class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    provider_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("providers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    tags: Mapped[list] = mapped_column(UniversalJSON(), nullable=False, default=list)
    price_min: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True, default=Decimal("0.0")
    )
    price_max: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True, default=Decimal("0.0")
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    opening_hours: Mapped[dict] = mapped_column(
        UniversalJSON(), nullable=False, default=dict
    )
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    accessibility_tags: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False, default=list
    )
    rating_avg: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), nullable=False, default=Decimal("0.0")
    )
    rating_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    uniqueness_score: Mapped[Decimal] = mapped_column(
        Numeric(4, 3), nullable=False, default=Decimal("0.5")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="seed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "uniqueness_score >= 0 AND uniqueness_score <= 1",
            name="check_uniqueness_bounds",
        ),
        Index("idx_experiences_city_category", "city", "category"),
        Index("idx_experiences_lat_lng", "lat", "lng"),
    )

    provider: Mapped[Optional["Provider"]] = relationship(
        "Provider", back_populates="experiences"
    )
    itinerary_items: Mapped[List["ItineraryItem"]] = relationship(
        "ItineraryItem", back_populates="experience"
    )


# ── 3.5 MarketValuation ───────────────────────────────────────────────────────
class MarketValuation(Base):
    __tablename__ = "market_valuations"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    item_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location_country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location_city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    fair_market_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    suggested_opening_bid: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    estimated_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(6, 2), nullable=False
    )
    valuation_source: Mapped[str] = mapped_column(
        String(100), nullable=False, default="community_estimate"
    )
    confidence_score: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), nullable=False, default=Decimal("0.50")
    )
    bargaining_phrases: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False, default=list
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("estimated_weight_kg > 0", name="check_market_weight_positive"),
        CheckConstraint(
            "confidence_score >= 0 AND confidence_score <= 1",
            name="check_confidence_score_bounds",
        ),
    )


# ── 3.6 Itinerary ─────────────────────────────────────────────────────────────
class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    traveler_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("traveler_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    traveler: Mapped["TravelerProfile"] = relationship(
        "TravelerProfile", back_populates="itineraries"
    )
    items: Mapped[List["ItineraryItem"]] = relationship(
        "ItineraryItem", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryItem.position"
    )


# ── 3.7 ItineraryItem ─────────────────────────────────────────────────────────
class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    itinerary_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    experience_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("experiences.id"), nullable=False, index=True
    )
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("itinerary_id", "position", name="uq_itinerary_position"),
    )

    itinerary: Mapped["Itinerary"] = relationship(
        "Itinerary", back_populates="items"
    )
    experience: Mapped["Experience"] = relationship(
        "Experience", back_populates="itinerary_items"
    )


# ── 3.8 RecommendationLog ─────────────────────────────────────────────────────
class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    traveler_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("traveler_profiles.id"), nullable=False, index=True
    )
    context_snapshot: Mapped[dict] = mapped_column(
        UniversalJSON(), nullable=False
    )
    ranked_experience_ids: Mapped[list] = mapped_column(
        UniversalJSON(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
