"""
app/routers/public.py — Unauthenticated public routes
GET /health, GET /cities, GET /experiences, GET /experiences/{id}
"""
from __future__ import annotations

import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Experience as ExperienceModel
from app.schemas.experience import Experience as ExperienceSchema

router = APIRouter()


@router.get("/health", summary="Liveness check")
async def health():
    return {"status": "ok", "service": "localpulse-api"}


@router.get("/cities", summary="List distinct cities with experience counts")
async def list_cities(session: AsyncSession = Depends(get_db)):
    """
    Query distinct cities and their countries and total active experiences.
    """
    stmt = (
        select(
            ExperienceModel.city,
            ExperienceModel.country,
            func.count(ExperienceModel.id).label("experience_count"),
        )
        .where(ExperienceModel.is_active == True)
        .group_by(ExperienceModel.city, ExperienceModel.country)
        .order_by(func.count(ExperienceModel.id).desc())
    )
    result = await session.execute(stmt)
    rows = result.all()
    return [
        {
            "city": r.city,
            "country": r.country,
            "experience_count": r.experience_count,
        }
        for r in rows
    ]


@router.get(
    "/experiences",
    response_model=List[ExperienceSchema],
    summary="List public experiences (filterable)",
)
async def list_experiences(
    city: Optional[str] = Query(None, description="Filter by city name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    price_max: Optional[Decimal] = Query(None, description="Maximum price filter"),
    search: Optional[str] = Query(None, description="Search term in title/description"),
    is_active: bool = Query(True, description="Filter active experiences"),
    session: AsyncSession = Depends(get_db),
):
    """
    List experiences with optional filtering by city, category, budget, and search terms.
    """
    stmt = select(ExperienceModel).where(ExperienceModel.is_active == is_active)

    if city:
        stmt = stmt.where(func.lower(ExperienceModel.city) == city.strip().lower())
    if category:
        stmt = stmt.where(ExperienceModel.category == category)
    if price_max is not None:
        stmt = stmt.where(ExperienceModel.price_min <= price_max)
    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            func.lower(ExperienceModel.title).like(term)
            | func.lower(ExperienceModel.description).like(term)
        )

    stmt = stmt.order_by(ExperienceModel.rating_avg.desc(), ExperienceModel.uniqueness_score.desc())
    result = await session.execute(stmt)
    experiences = result.scalars().all()

    return [
        ExperienceSchema(
            id=exp.id,
            provider_id=exp.provider_id,
            title=exp.title,
            description=exp.description,
            category=exp.category,
            tags=exp.tags or [],
            price_min=exp.price_min,
            price_max=exp.price_max,
            currency=exp.currency,
            duration_minutes=exp.duration_minutes,
            lat=exp.lat,
            lng=exp.lng,
            address=exp.address,
            city=exp.city,
            country=exp.country,
            opening_hours=exp.opening_hours or {},
            capacity=exp.capacity,
            accessibility_tags=exp.accessibility_tags or [],
            rating_avg=exp.rating_avg,
            rating_count=exp.rating_count,
            uniqueness_score=exp.uniqueness_score,
            is_active=exp.is_active,
            source=exp.source,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
        )
        for exp in experiences
    ]


@router.get(
    "/experiences/{experience_id}",
    response_model=ExperienceSchema,
    summary="Get single experience details",
)
async def get_experience(
    experience_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
):
    """
    Retrieve full details for a single experience.
    """
    stmt = select(ExperienceModel).where(ExperienceModel.id == experience_id)
    result = await session.execute(stmt)
    exp = result.scalar_one_or_none()

    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experience with id {experience_id} not found",
        )

    return ExperienceSchema(
        id=exp.id,
        provider_id=exp.provider_id,
        title=exp.title,
        description=exp.description,
        category=exp.category,
        tags=exp.tags or [],
        price_min=exp.price_min,
        price_max=exp.price_max,
        currency=exp.currency,
        duration_minutes=exp.duration_minutes,
        lat=exp.lat,
        lng=exp.lng,
        address=exp.address,
        city=exp.city,
        country=exp.country,
        opening_hours=exp.opening_hours or {},
        capacity=exp.capacity,
        accessibility_tags=exp.accessibility_tags or [],
        rating_avg=exp.rating_avg,
        rating_count=exp.rating_count,
        uniqueness_score=exp.uniqueness_score,
        is_active=exp.is_active,
        source=exp.source,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
    )


from pydantic import BaseModel, Field

class MineExperiencesRequest(BaseModel):
    city: str = Field(..., description="Target city to mine authentic experiences for")
    country: Optional[str] = Field(None, description="Country name")
    category: Optional[str] = Field(None, description="Optional category focus")
    count: int = Field(default=4, ge=1, le=8, description="Number of gems to mine")


@router.post(
    "/experiences/mine",
    summary="Mine authentic local experiences for any city using Google Gemini AI",
)
async def mine_experiences(
    payload: MineExperiencesRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Use Google Gemini to discover and mine real-world authentic hidden gems for any city.
    Automatically saves newly discovered gems to the database and returns them for live map rendering.
    """
    from app.services.ai_miner import AIMinerService
    mined = await AIMinerService.mine_experiences_for_city(
        city=payload.city,
        country=payload.country,
        category=payload.category,
        count=payload.count,
        session=session,
    )
    return {
        "status": "success",
        "city": payload.city,
        "count": len(mined),
        "experiences": mined,
    }

