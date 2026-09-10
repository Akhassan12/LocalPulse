"""
app/routers/concierge.py — Conversational AI Travel Concierge
Powered by Google Gemini 3.6 Flash.
Interprets traveler natural language queries ("I have 2 hours in Varanasi near the ghats with kids...")
and cross-references the live experience database to return hyper-local, context-aware suggestions.
"""
from __future__ import annotations

import json
from decimal import Decimal
from typing import List, Optional
import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Experience as ExperienceModel

log = structlog.get_logger()
router = APIRouter()


class ConciergeMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ConciergeRequest(BaseModel):
    message: str
    city: Optional[str] = "Jaipur"
    available_minutes: Optional[int] = 120
    remaining_budget: Optional[Decimal] = Decimal("2000")
    group_size: Optional[int] = 2
    history: Optional[List[ConciergeMessage]] = None


class RecommendedExperienceRef(BaseModel):
    id: str
    title: str
    city: str
    duration_minutes: int
    price: str
    fit_reason: str


class ConciergeResponse(BaseModel):
    reply: str
    matched_experiences: List[RecommendedExperienceRef]
    suggested_actions: List[str]


@router.post(
    "/concierge/chat",
    response_model=ConciergeResponse,
    summary="Chat with Pulse AI Concierge for contextual discovery",
)
async def concierge_chat(
    req: ConciergeRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Synthesize authentic travel recommendations using Gemini 3.6 Flash + live database context.
    """
    city = req.city or "Jaipur"

    # 1. Fetch available experiences for this city from DB
    query = (
        select(ExperienceModel)
        .where(
            ExperienceModel.is_active == True,
            ExperienceModel.city.ilike(f"%{city.strip()}%"),
        )
        .limit(12)
    )
    res = await session.execute(query)
    exps = res.scalars().all()

    # Fallback to general active experiences if city has few
    if len(exps) < 3:
        fallback_query = select(ExperienceModel).where(ExperienceModel.is_active == True).limit(10)
        fb_res = await session.execute(fallback_query)
        exps = fb_res.scalars().all()

    # Format experiences for Gemini prompt
    catalog_summary = []
    for e in exps:
        p_min = e.price_min if e.price_min is not None else Decimal("0")
        catalog_summary.append({
            "id": str(e.id),
            "title": e.title,
            "category": e.category,
            "city": e.city,
            "duration_m": e.duration_minutes,
            "price_inr": f"INR {p_min}",
            "tags": e.tags[:4] if e.tags else [],
            "description": e.description[:120] + "..." if e.description else "",
        })

    catalog_json = json.dumps(catalog_summary, indent=2)

    # 2. Query Gemini 3.6 Flash
    gemini_key = settings.GEMINI_API_KEY
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            system_prompt = f"""You are 'Pulse Concierge', an elite hyper-local cultural discovery assistant in India.
You help travelers discover authentic hidden gems, sacred rituals, artisan workshops, and street food.
A traveler is in {city}.
Their context: Available time: ~{req.available_minutes} mins, Budget: ~INR {req.remaining_budget}, Group size: {req.group_size}.

Here are the real local experiences available in our verified database:
{catalog_json}

Traveler asks: "{req.message}"

Respond with:
1. A warm, insightful 2-4 sentence conversational recommendation specifically addressing their constraints (time, budget, walking, group type).
2. Recommend 1-3 best matching experiences from the provided database list.

Return ONLY valid JSON matching this exact structure:
{{
  "reply": "Your conversational response here",
  "matched_ids": ["id-of-matched-experience-1", "id-of-matched-experience-2"],
  "reasons": {{"id-of-matched-experience-1": "Short 1-sentence reason why it fits their exact time/group"}},
  "suggested_actions": ["Next action 1", "Next action 2"]
}}
"""
            response = model.generate_content(
                system_prompt,
                generation_config={"temperature": 0.3, "response_mime_type": "application/json"}
            )
            raw_text = response.text.strip()
            data = json.loads(raw_text)

            matched_refs = []
            exp_map = {str(e.id): e for e in exps}
            for m_id in data.get("matched_ids", []):
                if m_id in exp_map:
                    e = exp_map[m_id]
                    p_min = e.price_min if e.price_min is not None else Decimal("0")
                    reason = data.get("reasons", {}).get(m_id, f"Perfect fit for your {city} visit.")
                    matched_refs.append(
                        RecommendedExperienceRef(
                            id=str(e.id),
                            title=e.title,
                            city=e.city,
                            duration_minutes=e.duration_minutes,
                            price=f"₹{p_min.toLocaleString() if hasattr(p_min, 'toLocaleString') else p_min}",
                            fit_reason=reason,
                        )
                    )

            if matched_refs:
                return ConciergeResponse(
                    reply=data.get("reply", f"Here are the most authentic local experiences in {city} for your timeframe."),
                    matched_experiences=matched_refs,
                    suggested_actions=data.get("suggested_actions", [f"Explore {city} on Map", "Filter by Short Walk"]),
                )

        except Exception as exc:
            log.warning("concierge.gemini_failed", error=str(exc))

    # 3. Deterministic Local Fallback if Gemini unavailable
    top_matches = []
    for e in exps[:2]:
        p_min = e.price_min if e.price_min is not None else Decimal("0")
        top_matches.append(
            RecommendedExperienceRef(
                id=str(e.id),
                title=e.title,
                city=e.city,
                duration_minutes=e.duration_minutes,
                price=f"₹{p_min}",
                fit_reason=f"Curated {e.category} gem in {e.city} comfortably fitting within your {req.available_minutes}-min window.",
            )
        )

    return ConciergeResponse(
        reply=f"Based on your {req.available_minutes}-minute timeframe in {city}, I recommend exploring these authentic local cultural traditions.",
        matched_experiences=top_matches,
        suggested_actions=[f"View all {city} Gems", "Reroute for Monsoon Rain", "Find Free Rituals"],
    )
