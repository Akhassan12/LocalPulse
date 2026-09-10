"""
LocalPulse FastAPI Backend
main.py — App factory, middleware, router registration
"""
from __future__ import annotations

import time
import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import public, traveler, physics, provider, recommendations, itinerary, concierge

# ── Structured logging ──────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)
log = structlog.get_logger()


# ── Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    log.info("localpulse.startup", env=settings.APP_ENV)
    try:
        from app.database import Base, engine, async_session_factory
        import app.models
        from sqlalchemy import select, func
        from app.models import Experience as ExperienceModel, MarketValuation
        from app.seeds.seed_data import SEED_EXPERIENCES, SEED_MARKET_VALUATIONS

        # Ensure all tables exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Auto-seed database if empty
        async with async_session_factory() as session:
            count_res = await session.execute(select(func.count(ExperienceModel.id)))
            count = count_res.scalar() or 0
            if count == 0:
                log.info("localpulse.auto_seeding_database", count=count)
                for exp_data in SEED_EXPERIENCES:
                    session.add(ExperienceModel(**exp_data))
                for val_data in SEED_MARKET_VALUATIONS:
                    session.add(MarketValuation(**val_data))
                await session.commit()
                log.info("localpulse.auto_seeding_complete", experiences=len(SEED_EXPERIENCES))
    except Exception as e:
        log.warning("localpulse.startup_seed_warning", error=str(e))

    yield
    log.info("localpulse.shutdown")


# ── App factory ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="LocalPulse API",
    version="0.1.0",
    description="Intelligent local discovery & experience platform with BazaarLink physical-constraint layer.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.APP_ENV != "production" else settings.cors_origins_list + ["https://localhost:5173", "http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Structured request logging middleware ────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    log.info(
        "http.request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        latency_ms=elapsed,
    )
    return response


# ── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("http.unhandled_exception", path=request.url.path, error=str(exc))
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


# ── Routers ──────────────────────────────────────────────────────────────────
from fastapi import APIRouter

# Support both /api/v1 and root prefixes for maximum frontend flexibility
api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(public.router, tags=["Public"])
api_v1.include_router(recommendations.router, tags=["Discovery & Recommendations"])
api_v1.include_router(traveler.router, prefix="/me", tags=["Traveler"])
api_v1.include_router(itinerary.router, tags=["Itinerary"])
api_v1.include_router(physics.router, tags=["Physics & Finance"])
api_v1.include_router(provider.router, prefix="/providers", tags=["Provider"])
api_v1.include_router(concierge.router, tags=["AI Concierge"])

app.include_router(api_v1)
app.include_router(public.router, tags=["Public"])
app.include_router(recommendations.router, tags=["Discovery & Recommendations"])
app.include_router(traveler.router, prefix="/me", tags=["Traveler"])
app.include_router(itinerary.router, tags=["Itinerary"])
app.include_router(physics.router, tags=["Physics & Finance"])
app.include_router(provider.router, prefix="/providers", tags=["Provider"])
app.include_router(concierge.router, tags=["AI Concierge"])

 
 
if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)


