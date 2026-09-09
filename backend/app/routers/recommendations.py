"""
app/routers/recommendations.py — Authenticated live recommendation router
POST /recommendations — Wired to RankingEngine with bounding box pre-filter,
RLS-safe profile lookup, rate-limiting, and recommendation logging.
"""
from __future__ import annotations

import math
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import AuthUser, get_current_user
from app.config import settings
from app.database import get_db
from app.models import Experience as ExperienceModel, RecommendationLog, TravelerProfile as TravelerProfileModel
from app.schemas.experience import (
    Experience as ExperienceSchema,
    LiveContext,
    RankedExperience,
)
from app.schemas.traveler import TravelerProfileBase
from app.services.ranking_engine import RankingEngine

log = structlog.get_logger()
router = APIRouter()

# ── Rate limiting: In-memory sliding window ──────────────────────────────────
# Map: user_id -> list of timestamps
_USER_RECOMMENDATION_CALLS: dict[str, list[float]] = defaultdict(list)


def check_recommendations_rate_limit(user_id: str) -> None:
    now = time.time()
    window = 60.0  # 1 minute window
    max_requests = settings.RATE_LIMIT_RECOMMENDATIONS  # default 20 per minute

    # Prune old calls
    calls = [t for t in _USER_RECOMMENDATION_CALLS[user_id] if now - t < window]
    if len(calls) >= max_requests:
        log.warning("rate_limit_exceeded.recommendations", user_id=user_id, count=len(calls))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: maximum {max_requests} recommendation requests per minute.",
        )
    calls.append(now)
    _USER_RECOMMENDATION_CALLS[user_id] = calls


# ── Profile Resolver Helper ──────────────────────────────────────────────────
async def _get_or_create_traveler_profile(
    user: AuthUser, session: AsyncSession
) -> TravelerProfileModel:
    u_id = uuid.UUID(user.user_id) if len(user.user_id) == 36 else uuid.uuid5(uuid.NAMESPACE_DNS, user.user_id)
    query = select(TravelerProfileModel).where(TravelerProfileModel.user_id == u_id)
    res = await session.execute(query)
    profile = res.scalar_one_or_none()

    if profile is None:
        # Create default profile for the authenticated traveler
        profile = TravelerProfileModel(
            id=uuid.uuid4(),
            user_id=u_id,
            display_name=user.email.split("@")[0].title() if user.email else "Explorer",
            traveler_type="solo",
            interests=["Hidden Alley Food", "Night Markets", "Artisan Workshops", "Historic Landmarks"],
            dietary_preferences=["None"],
            accessibility_needs=["None"],
            preferred_budget_min=Decimal("10.0"),
            preferred_budget_max=Decimal("150.0"),
            home_currency="USD",
            max_carry_capacity_kg=Decimal("15.0"),
            current_carried_weight_kg=Decimal("3.5"),
            liquid_cash=Decimal("450.0"),
            average_daily_spend=Decimal("50.0"),
            remaining_travel_days=7,
            minimum_emergency_reserve=Decimal("100.0"),
        )
        session.add(profile)
        await session.flush()

    return profile


# ── POST /recommendations ────────────────────────────────────────────────────
@router.post(
    "/recommendations",
    response_model=List[RankedExperience],
    summary="Generate ranked experience recommendations based on live context",
)
async def get_recommendations(
    context: LiveContext,
    user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Evaluate candidate experiences using the multi-factor RankingEngine.
    Includes spatial bounding-box prefilter, capacity constraint penalty,
    and persistent audit logging to recommendation_logs.
    """
    check_recommendations_rate_limit(user.user_id)

    # 1. Resolve traveler profile
    profile_orm = await _get_or_create_traveler_profile(user, session)

    profile_base = TravelerProfileBase(
        display_name=profile_orm.display_name,
        traveler_type=profile_orm.traveler_type,
        interests=profile_orm.interests,
        dietary_preferences=profile_orm.dietary_preferences,
        accessibility_needs=profile_orm.accessibility_needs,
        preferred_budget_min=profile_orm.preferred_budget_min,
        preferred_budget_max=profile_orm.preferred_budget_max,
        home_currency=profile_orm.home_currency,
        max_carry_capacity_kg=profile_orm.max_carry_capacity_kg,
        current_carried_weight_kg=profile_orm.current_carried_weight_kg,
        liquid_cash=profile_orm.liquid_cash,
        average_daily_spend=profile_orm.average_daily_spend,
        remaining_travel_days=profile_orm.remaining_travel_days,
        minimum_emergency_reserve=profile_orm.minimum_emergency_reserve,
    )

    # 2. Bounding box prefilter
    # Maximum reasonable reach (assuming e.g. 50 km radius or context duration)
    # 1 deg latitude ≈ 111 km, 1 deg longitude ≈ 111 * cos(lat) km
    radius_km = 60.0
    lat_delta = radius_km / 111.0
    cos_lat = math.cos(math.radians(context.lat))
    lng_delta = radius_km / (111.0 * cos_lat if abs(cos_lat) > 0.01 else 111.0)

    min_lat, max_lat = context.lat - lat_delta, context.lat + lat_delta
    min_lng, max_lng = context.lng - lng_delta, context.lng + lng_delta

    # Spatial prefilter query
    query = (
        select(ExperienceModel)
        .where(
            ExperienceModel.is_active == True,
            ExperienceModel.lat >= min_lat,
            ExperienceModel.lat <= max_lat,
            ExperienceModel.lng >= min_lng,
            ExperienceModel.lng <= max_lng,
        )
        .limit(100)
    )
    result = await session.execute(query)
    candidates_orm = result.scalars().all()

    # Fallback: if user is not physically near seeded coordinates, load all active experiences
    if len(candidates_orm) < 5:
        fallback_query = (
            select(ExperienceModel)
            .where(ExperienceModel.is_active == True)
            .limit(100)
        )
        fallback_res = await session.execute(fallback_query)
        candidates_orm = fallback_res.scalars().all()

    # 3. Transform ORM models to Pydantic models
    candidate_schemas: list[ExperienceSchema] = []
    for c in candidates_orm:
        candidate_schemas.append(
            ExperienceSchema(
                id=c.id,
                provider_id=c.provider_id,
                title=c.title,
                description=c.description,
                category=c.category,
                tags=c.tags or [],
                price_min=c.price_min,
                price_max=c.price_max,
                currency=c.currency,
                duration_minutes=c.duration_minutes,
                lat=c.lat,
                lng=c.lng,
                address=c.address,
                city=c.city,
                country=c.country,
                opening_hours=c.opening_hours or {},
                capacity=c.capacity,
                accessibility_tags=c.accessibility_tags or [],
                rating_avg=c.rating_avg,
                rating_count=c.rating_count,
                uniqueness_score=c.uniqueness_score,
                is_active=c.is_active,
                source=c.source,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
        )

    # 4. Rank candidates using pure RankingEngine service
    engine = RankingEngine()
    ranked = engine.rank(
        experiences=candidate_schemas,
        traveler_profile=profile_base,
        context=context,
    )

    # 5. Record recommendation log
    try:
        ranked_ids = [str(r.experience.id) for r in ranked[:20]]
        log_entry = RecommendationLog(
            id=uuid.uuid4(),
            traveler_id=profile_orm.id,
            context_snapshot={
                "lat": context.lat,
                "lng": context.lng,
                "available_minutes": context.available_minutes,
                "remaining_budget": str(context.remaining_budget),
                "group_size": context.group_size,
                "timestamp": context.current_time.isoformat(),
            },
            ranked_experience_ids=ranked_ids,
        )
        session.add(log_entry)
        await session.commit()
    except Exception as e:
        log.warning("recommendation_log.failed", error=str(e))
        # Non-critical: do not fail client response if log commit fails

    log.info(
        "recommendations.generated",
        user_id=user.user_id,
        count=len(ranked),
        top_experience=ranked[0].experience.title if ranked else None,
    )
    return ranked
