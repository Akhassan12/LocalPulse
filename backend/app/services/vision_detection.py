"""
app/services/vision_detection.py — Item Detection & Valuation Service
Dual-mode AI vision detection: OpenRouter (minimax/hailuo-3) with deterministic mock fallback.
Returns item metadata, fair valuation, estimated weight, opening bid, and local bargaining phrases.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
from decimal import Decimal
from typing import Optional, List, Any

import httpx
from pydantic import BaseModel, ConfigDict

from app.config import settings


class BargainingPhrase(BaseModel):
    model_config = ConfigDict(frozen=True)

    native: str
    phonetic: str
    meaning: str


class DetectedItemResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    item_name: str
    category: str
    fair_market_value: Decimal
    currency: str
    suggested_opening_bid: Decimal
    estimated_weight_kg: Decimal
    confidence_score: float
    bargaining_phrases: List[BargainingPhrase]
    detection_source: str  # "live_ai" | "demo_mode"
    description: Optional[str] = None


# Catalog of realistic deterministic mock results for demo / offline mode
DETERMINISTIC_CATALOG = [
    {
        "item_name": "Handmade Glazed Ceramic Matcha Bowl (Chawan)",
        "category": "ceramics",
        "fair_market_value": Decimal("45.00"),
        "currency": "USD",
        "suggested_opening_bid": Decimal("28.00"),
        "estimated_weight_kg": Decimal("0.38"),
        "confidence_score": 0.94,
        "description": "Authentic stoneware chawan with rich tenmoku iron glaze, suitable for tea ceremony.",
        "bargaining_phrases": [
            {
                "native": "少しおまけしていただけますか？",
                "phonetic": "Sukoshi omake shite itadakemasu ka?",
                "meaning": "Could you give me a small discount?",
            },
            {
                "native": "二つ買ったら安くなりますか？",
                "phonetic": "Futatsu kattara yasuku narimasu ka?",
                "meaning": "If I buy two, can you lower the price?",
            },
            {
                "native": "予算がこれだけしかなくて…",
                "phonetic": "Yosan ga kore dake shika nakute...",
                "meaning": "My budget is only this much...",
            },
        ],
    },
    {
        "item_name": "Oaxacan Alebrije Carved Copal Wood Figurine",
        "category": "woodcraft",
        "fair_market_value": Decimal("35.00"),
        "currency": "USD",
        "suggested_opening_bid": Decimal("22.00"),
        "estimated_weight_kg": Decimal("0.25"),
        "confidence_score": 0.92,
        "description": "Intricately hand-painted whimsical animal sculpture carved from native copal wood.",
        "bargaining_phrases": [
            {
                "native": "¿Cuánto es lo menos por esta pieza?",
                "phonetic": "KWAN-toh ess loh MEH-nohs por ESS-tah pee-EH-sah?",
                "meaning": "What is the absolute best price for this piece?",
            },
            {
                "native": "¿Me da precio de mayoreo si llevo dos?",
                "phonetic": "Meh dah PREH-syoh deh mah-yoh-REH-oh see YEH-voh dohs?",
                "meaning": "Will you give me a bundle price if I take two?",
            },
            {
                "native": "Tengo 20 dólares en efectivo ahorita.",
                "phonetic": "TEN-goh VEHN-teh DOH-lah-rehs en eh-fek-TEE-voh ow-REE-tah.",
                "meaning": "I have $20 in cash right now.",
            },
        ],
    },
    {
        "item_name": "Handwoven Zapotec Wool Rug / Tapestry",
        "category": "textiles",
        "fair_market_value": Decimal("75.00"),
        "currency": "USD",
        "suggested_opening_bid": Decimal("50.00"),
        "estimated_weight_kg": Decimal("0.85"),
        "confidence_score": 0.89,
        "description": "Natural sheep wool dyed with indigo and cochineal, woven on a pedal loom in Teotitlán.",
        "bargaining_phrases": [
            {
                "native": "¿Está teñido con tintes naturales?",
                "phonetic": "Ess-TAH teh-NYEE-doh kohn TEEN-tess nah-too-RAH-less?",
                "meaning": "Is this colored with natural dyes?",
            },
            {
                "native": "¿Aceptaría 50 por él?",
                "phonetic": "Ah-sep-tah-REE-ah seen-KWEN-tah por ehl?",
                "meaning": "Would you accept 50 for it?",
            },
        ],
    },
    {
        "item_name": "Artisanal Damascus Steel Folding Knife (Higonokami)",
        "category": "metalwork",
        "fair_market_value": Decimal("60.00"),
        "currency": "USD",
        "suggested_opening_bid": Decimal("40.00"),
        "estimated_weight_kg": Decimal("0.18"),
        "confidence_score": 0.96,
        "description": "Traditional Japanese brass-handled friction folder with laminated high-carbon steel.",
        "bargaining_phrases": [
            {
                "native": "現金で払うので安くできますか？",
                "phonetic": "Genkin de harau node yasuku dekimasu ka?",
                "meaning": "I am paying in cash, can you offer a discount?",
            },
            {
                "native": "この刃物は手作りですか？",
                "phonetic": "Kono hamono wa tezukuri desu ka?",
                "meaning": "Was this blade hand-forged?",
            },
        ],
    },
]


class ItemDetectionService:
    @staticmethod
    async def detect_from_image(
        image_bytes: bytes,
        filename: Optional[str] = None,
        city_hint: Optional[str] = None,
    ) -> DetectedItemResult:
        """
        Detect item details from raw image bytes.
        Dual AI vision detection engine:
        1. Attempts OpenRouter (minimax/hailuo-3) if OPENROUTER_API_KEY is configured.
        2. Attempts Google Gemini if GOOGLE_API_KEY / GEMINI_API_KEY is configured.
        3. Falls back gracefully to deterministic market catalog if keys are absent or rate-limited.
        """
        openrouter_key = (
            getattr(settings, "OPENROUTER_API_KEY", None)
            or os.environ.get("OPENROUTER_API_KEY")
        )
        google_key = (
            getattr(settings, "GOOGLE_API_KEY", None)
            or getattr(settings, "GEMINI_API_KEY", None)
            or os.environ.get("GOOGLE_API_KEY")
            or os.environ.get("GEMINI_API_KEY")
        )

        # 1. Try OpenRouter (minimax/hailuo-3)
        if openrouter_key and openrouter_key.startswith("sk-or-v1-"):
            try:
                result = await ItemDetectionService._call_openrouter_vision(
                    image_bytes=image_bytes,
                    api_key=openrouter_key,
                    city_hint=city_hint,
                )
                if result:
                    return result
            except Exception as e:
                print(f"[ItemDetectionService] OpenRouter vision attempt failed: {e}")

        # 2. Try Google Gemini
        if google_key and len(google_key.strip()) > 10:
            try:
                result = await ItemDetectionService._call_gemini_vision(
                    image_bytes=image_bytes,
                    api_key=google_key.strip(),
                    city_hint=city_hint,
                )
                if result:
                    return result
            except Exception as e:
                print(f"[ItemDetectionService] Google Gemini vision attempt failed: {e}")

        # 3. Fallback: Hash image bytes to pick a deterministic item from catalog
        return ItemDetectionService._get_deterministic_mock(image_bytes, filename, city_hint)

    @staticmethod
    async def _call_openrouter_vision(
        image_bytes: bytes,
        api_key: str,
        city_hint: Optional[str] = None,
    ) -> Optional[DetectedItemResult]:
        """Calls OpenRouter API with minimax/hailuo-3 via OpenAI-compatible chat completions."""
        try:
            model = getattr(settings, "OPENROUTER_MODEL", "minimax/hailuo-3")

            # Encode image as base64 data URL
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            image_url = f"data:image/jpeg;base64,{b64_image}"

            prompt = (
                "You are an expert appraiser and cultural guide for travelers in local markets. "
                "Analyze the item in this image. Estimate its fair market retail value (in USD), "
                "a realistic suggested opening bid for polite haggling (typically 60-70% of fair value), "
                "estimated physical weight in kg, category, and 2-3 authentic local bargaining phrases "
                "(native text, romanized phonetic pronunciation, and English meaning). "
                f"Location context: {city_hint or 'local marketplace'}. "
                "Respond ONLY with valid JSON matching this schema exactly:\n"
                "{\n"
                '  "item_name": "string",\n'
                '  "category": "string",\n'
                '  "fair_market_value": 35.00,\n'
                '  "currency": "USD",\n'
                '  "suggested_opening_bid": 22.00,\n'
                '  "estimated_weight_kg": 0.35,\n'
                '  "confidence_score": 0.92,\n'
                '  "description": "string",\n'
                '  "bargaining_phrases": [\n'
                '    {"native": "string", "phonetic": "string", "meaning": "string"}\n'
                "  ]\n"
                "}"
            )

            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "image_url", "image_url": {"url": image_url}},
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
                "max_tokens": 1024,
                "temperature": 0.2,
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://localpulse.app",
                        "X-Title": "LocalPulse BazaarLink",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

            text = data["choices"][0]["message"]["content"] or ""

            # Strip potential markdown fences
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            parsed = json.loads(text)
            phrases = [
                BargainingPhrase(
                    native=p.get("native", ""),
                    phonetic=p.get("phonetic", ""),
                    meaning=p.get("meaning", ""),
                )
                for p in parsed.get("bargaining_phrases", [])
            ]

            return DetectedItemResult(
                item_name=parsed.get("item_name", "Handcrafted Market Item"),
                category=parsed.get("category", "handicraft"),
                fair_market_value=Decimal(str(parsed.get("fair_market_value", 30.00))).quantize(Decimal("0.01")),
                currency=parsed.get("currency", "USD"),
                suggested_opening_bid=Decimal(str(parsed.get("suggested_opening_bid", 20.00))).quantize(Decimal("0.01")),
                estimated_weight_kg=Decimal(str(parsed.get("estimated_weight_kg", 0.4))).quantize(Decimal("0.01")),
                confidence_score=float(parsed.get("confidence_score", 0.9)),
                bargaining_phrases=phrases,
                detection_source="live_ai",
                description=parsed.get("description"),
            )
        except Exception as err:
            print(f"[OpenRouter vision error]: {err}")
            return None

    @staticmethod
    async def _call_gemini_vision(
        image_bytes: bytes,
        api_key: str,
        city_hint: Optional[str] = None,
    ) -> Optional[DetectedItemResult]:
        """Calls Google Gemini Vision API (gemini-1.5-flash / gemini-2.5-flash) with structured JSON prompt."""
        try:
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            
            prompt = (
                "You are an expert appraiser and cultural guide for travelers in local markets. "
                "Analyze the item in this image. Estimate its fair market retail value (in USD), "
                "a realistic suggested opening bid for polite haggling (typically 60-70% of fair value), "
                "estimated physical weight in kg, category, and 2-3 authentic local bargaining phrases "
                "(native text, romanized phonetic pronunciation, and English meaning). "
                f"Location context: {city_hint or 'local marketplace'}. "
                "Respond ONLY with valid JSON matching this schema exactly:\n"
                "{\n"
                '  "item_name": "string",\n'
                '  "category": "string",\n'
                '  "fair_market_value": 35.00,\n'
                '  "currency": "USD",\n'
                '  "suggested_opening_bid": 22.00,\n'
                '  "estimated_weight_kg": 0.35,\n'
                '  "confidence_score": 0.92,\n'
                '  "description": "string",\n'
                '  "bargaining_phrases": [\n'
                '    {"native": "string", "phonetic": "string", "meaning": "string"}\n'
                "  ]\n"
                "}"
            )

            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": b64_image,
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1024,
                    "responseMimeType": "application/json",
                },
            }

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()

            candidates = data.get("candidates", [])
            if not candidates:
                return None
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                return None

            text = parts[0].get("text", "").strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            parsed = json.loads(text)
            phrases = [
                BargainingPhrase(
                    native=p.get("native", ""),
                    phonetic=p.get("phonetic", ""),
                    meaning=p.get("meaning", ""),
                )
                for p in parsed.get("bargaining_phrases", [])
            ]

            return DetectedItemResult(
                item_name=parsed.get("item_name", "Handcrafted Market Item"),
                category=parsed.get("category", "handicraft"),
                fair_market_value=Decimal(str(parsed.get("fair_market_value", 30.00))).quantize(Decimal("0.01")),
                currency=parsed.get("currency", "USD"),
                suggested_opening_bid=Decimal(str(parsed.get("suggested_opening_bid", 20.00))).quantize(Decimal("0.01")),
                estimated_weight_kg=Decimal(str(parsed.get("estimated_weight_kg", 0.4))).quantize(Decimal("0.01")),
                confidence_score=float(parsed.get("confidence_score", 0.9)),
                bargaining_phrases=phrases,
                detection_source="live_ai_gemini",
                description=parsed.get("description"),
            )
        except Exception as err:
            print(f"[Gemini vision error]: {err}")
            return None


    @staticmethod
    def _get_deterministic_mock(
        image_bytes: bytes,
        filename: Optional[str] = None,
        city_hint: Optional[str] = None,
    ) -> DetectedItemResult:
        """Deterministic mock item selection based on SHA-256 hash."""
        seed_data = image_bytes or (filename or "demo_item").encode("utf-8")
        hash_val = int(hashlib.sha256(seed_data).hexdigest(), 16)
        
        # If city hint is Oaxaca, prefer Oaxaca items
        if city_hint and "oaxaca" in city_hint.lower():
            candidates = [c for c in DETERMINISTIC_CATALOG if "Oaxaca" in c["item_name"] or "Zapotec" in c["item_name"]]
        elif city_hint and "tokyo" in city_hint.lower():
            candidates = [c for c in DETERMINISTIC_CATALOG if "Matcha" in c["item_name"] or "Higonokami" in c["item_name"]]
        else:
            candidates = DETERMINISTIC_CATALOG

        chosen = candidates[hash_val % len(candidates)]

        phrases = [
            BargainingPhrase(
                native=p["native"],
                phonetic=p["phonetic"],
                meaning=p["meaning"],
            )
            for p in chosen["bargaining_phrases"]
        ]

        return DetectedItemResult(
            item_name=chosen["item_name"],
            category=chosen["category"],
            fair_market_value=chosen["fair_market_value"],
            currency=chosen["currency"],
            suggested_opening_bid=chosen["suggested_opening_bid"],
            estimated_weight_kg=chosen["estimated_weight_kg"],
            confidence_score=chosen["confidence_score"],
            bargaining_phrases=phrases,
            detection_source="demo_mode",
            description=chosen.get("description"),
        )
