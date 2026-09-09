"""
app/config.py — Pydantic settings from environment variables
"""
from __future__ import annotations
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/localpulse"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Vision API — OpenRouter (primary) or Google Gemini (legacy)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "minimax/hailuo-3"
    GOOGLE_API_KEY: str = ""   # kept for backward compat; used as OPENROUTER_API_KEY if set
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    # Rate limits (requests per minute)
    RATE_LIMIT_RECOMMENDATIONS: int = 20
    RATE_LIMIT_SCANS: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
