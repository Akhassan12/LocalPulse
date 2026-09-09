# Technical Requirements Document: LocalPulse

**Document type:** Engineering TRD (implementation-level)
**Companion to:** LocalPulse PRD v1.0
**Status:** Draft for engineering execution
**Version:** 1.0

---

## 1. Purpose & Scope

This TRD translates the LocalPulse PRD into concrete engineering requirements: architecture, data contracts, algorithms, API contracts, non-functional requirements, and delivery structure. It is the document an engineer should be able to build directly from, without re-reading the product spec.

Out of scope for this document: UX copy, visual design tokens beyond what affects component structure, business/marketing rationale (covered in the PRD).

---

## 2. System Architecture

### 2.1 High-level architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  React 18 + Vite SPA    │  HTTPS │   FastAPI (async)         │
│  (PWA, Tailwind, RQ)    │───────▶│   /app/routers             │
│                          │◀───────│   /app/services  (pure)    │
└─────────────┬────────────┘  JSON  │   /app/models (SQLAlchemy) │
              │                     │   /app/schemas (Pydantic)  │
      Supabase Auth (JWT)           └───────────┬────────────────┘
              │                                  │
              ▼                                  ▼
     ┌──────────────────┐              ┌──────────────────────┐
     │ Supabase Auth      │              │ PostgreSQL (Supabase) │
     │ (signup/login/JWT) │              │ RLS-enforced tables    │
     └──────────────────┘              └──────────────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │ External vision-model API  │
                                    │ (item detection), w/ mock  │
                                    │ fallback on failure         │
                                    └────────────────────────────┘
```

### 2.2 Layering rules (enforced, not aspirational)
- `/backend/app/routers` — thin HTTP handlers only: parse request, call a service or ORM query, shape response. No business logic.
- `/backend/app/services` — pure, framework-independent Python. **No** `fastapi`, `sqlalchemy`, or `httpx`/HTTP imports inside `ranking_engine.py`, `physics_engine.py`, `runway_calculator.py`, `barter_optimizer.py`. These modules take plain Python/Pydantic data in and return plain Python/Pydantic data out — they must be importable and unit-testable in a bare `python` REPL with no DB or web server running.
- `/backend/app/models` — SQLAlchemy 2.0 ORM only, no business logic.
- `/backend/app/schemas` — Pydantic v2 request/response models, kept separate from ORM models (no leaking ORM objects directly into API responses).
- Services never import routers or call back into the DB layer directly; routers own all persistence calls and pass plain data into services.

### 2.3 Authentication & authorization flow
1. Frontend uses `@supabase/supabase-js` for signup/login; Supabase issues a JWT.
2. Every 🔒 backend route requires `Authorization: Bearer <jwt>`.
3. Backend middleware/dependency verifies the JWT signature against the Supabase project's JWT secret (never trusts a client-supplied user ID or traveler/provider ID in the body).
4. The verified `sub` claim is the only source of the caller's `user_id`; all subsequent ownership lookups (`traveler_profiles.user_id`, `providers.user_id`) are derived from it server-side.
5. Row Level Security in Postgres is a second, independent enforcement layer — a defense-in-depth requirement, not a substitute for the server-side ownership checks in routers (explicitly required for provider write routes in Section 8).

### 2.4 Client-side state architecture
- **Zustand** — ephemeral/UI state: onboarding step, open modals, selected map marker, filter-panel expanded/collapsed state, active mobile tab (list vs. map).
- **TanStack React Query** — all server data: profile, inventory, recommendations, experience details, itineraries, provider dashboard data. Configure:
  - `staleTime` short (or 0) for `/recommendations` — it must refetch on context change
  - Optimistic updates for itinerary add/remove and inventory CRUD, with rollback on error
  - Query keys must include the live context object (or a hash of it) for `/recommendations` so React Query treats different contexts as different cache entries

---

## 3. Data Model (implementation spec)

All tables use `UUID` primary keys (`gen_random_uuid()`), `timestamptz NOT NULL DEFAULT now()` for `created_at`/`updated_at`, and are managed via Alembic migrations mirrored 1:1 from this section — no ad hoc schema drift.

### 3.1 `traveler_profiles`
```sql
id                          UUID PK
user_id                     UUID UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE
display_name                text NOT NULL
traveler_type                enum('solo','couple','family','backpacker','business') NOT NULL
interests                    JSONB NOT NULL DEFAULT '[]'
dietary_preferences          JSONB NOT NULL DEFAULT '[]'
accessibility_needs          JSONB NOT NULL DEFAULT '[]'
preferred_budget_min         numeric(12,2)
preferred_budget_max         numeric(12,2)
home_currency                text NOT NULL DEFAULT 'USD'
max_carry_capacity_kg        numeric(6,2)
current_carried_weight_kg    numeric(6,2) DEFAULT 0
liquid_cash                  numeric(12,2) DEFAULT 0
average_daily_spend          numeric(12,2)
remaining_travel_days        int DEFAULT 0
minimum_emergency_reserve    numeric(12,2) DEFAULT 0
created_at, updated_at       timestamptz NOT NULL DEFAULT now()

CHECK (preferred_budget_min <= preferred_budget_max)
CHECK (max_carry_capacity_kg IS NULL OR max_carry_capacity_kg >= 0)
CHECK (current_carried_weight_kg >= 0)
CHECK (liquid_cash >= 0)
CHECK (remaining_travel_days >= 0)
CHECK (minimum_emergency_reserve >= 0)
```

### 3.2 `inventory_items`
```sql
id                          UUID PK
traveler_id                 UUID NOT NULL REFERENCES traveler_profiles ON DELETE CASCADE
name                        text NOT NULL
asset_type                  enum('physical_item','skill') NOT NULL
category                    text
estimated_barter_value       numeric(12,2) DEFAULT 0
currency                    text DEFAULT 'USD'
weight_kg                   numeric(6,2) DEFAULT 0
available_quantity           numeric(10,2) DEFAULT 1
minimum_retained_quantity    numeric(10,2) DEFAULT 0
unit_label                  text DEFAULT 'unit'
tradeable                   boolean DEFAULT true
utility_score                numeric(5,2) DEFAULT 0
metadata                    JSONB DEFAULT '{}'
created_at, updated_at      timestamptz NOT NULL DEFAULT now()

CHECK (available_quantity >= minimum_retained_quantity)
CHECK (estimated_barter_value >= 0 AND weight_kg >= 0 AND available_quantity >= 0)
```

### 3.3 `providers`
```sql
id               UUID PK
user_id          UUID NOT NULL REFERENCES auth.users
business_name    text NOT NULL
contact_email    text NOT NULL
description      text
verified         boolean DEFAULT false
created_at, updated_at
```

### 3.4 `experiences`
```sql
id                    UUID PK
provider_id           UUID REFERENCES providers  -- nullable for seed/scraped data
title                 text NOT NULL
description           text
category              text NOT NULL   -- food, culture, outdoor, market, shopping, workshop, tour, nightlife, wellness, ...
tags                  JSONB DEFAULT '[]'
price_min             numeric(12,2)
price_max             numeric(12,2)
currency              text DEFAULT 'USD'
duration_minutes      int NOT NULL
lat                   double precision NOT NULL
lng                   double precision NOT NULL
address               text
city                  text NOT NULL
country               text NOT NULL
opening_hours         JSONB NOT NULL DEFAULT '{}'   -- {"mon": {"open": "09:00", "close": "18:00"}, "tue": null, ...}
capacity              int
accessibility_tags    JSONB DEFAULT '[]'
rating_avg            numeric(3,2) DEFAULT 0
rating_count          int DEFAULT 0
uniqueness_score      numeric(4,3) DEFAULT 0 CHECK (uniqueness_score BETWEEN 0 AND 1)
is_active             boolean DEFAULT true
source                enum('provider','scraped','seed') NOT NULL DEFAULT 'seed'
created_at, updated_at

INDEX ON (city, category)
INDEX ON (lat, lng)   -- bounding-box prefilter before Haversine scoring
```

### 3.5 `market_valuations` (shared reference data — not traveler-private)
```sql
id                       UUID PK
item_name                text NOT NULL
category                 text
location_country         text
location_city            text
currency                 text DEFAULT 'USD'
fair_market_value        numeric(12,2) NOT NULL
suggested_opening_bid    numeric(12,2) NOT NULL
estimated_weight_kg      numeric(6,2) NOT NULL CHECK (estimated_weight_kg > 0)
valuation_source         text DEFAULT 'community_estimate'
confidence_score         numeric(3,2) DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1)
bargaining_phrases       JSONB DEFAULT '[]'   -- [{"native": "...", "phonetic": "...", "meaning": "..."}]
created_at
```

### 3.6 `itineraries`
```sql
id            UUID PK
traveler_id   UUID NOT NULL REFERENCES traveler_profiles ON DELETE CASCADE
title         text NOT NULL
date          date
created_at
```

### 3.7 `itinerary_items`
```sql
id               UUID PK
itinerary_id     UUID NOT NULL REFERENCES itineraries ON DELETE CASCADE
experience_id    UUID NOT NULL REFERENCES experiences
start_time       time
notes            text
position         int NOT NULL

UNIQUE (itinerary_id, position)
```

### 3.8 `recommendation_logs`
```sql
id                       UUID PK
traveler_id              UUID NOT NULL REFERENCES traveler_profiles
context_snapshot         JSONB NOT NULL  -- {location, available_minutes, remaining_budget, group_size, current_time, pack_state, cash_state}
ranked_experience_ids     JSONB NOT NULL  -- ordered array of UUIDs, top N
created_at
```

### 3.9 Row Level Security policy matrix

| Table | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `traveler_profiles` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `inventory_items` | via `traveler_id` → `traveler_profiles.user_id = auth.uid()` | same |
| `providers` | `user_id = auth.uid()` | same |
| `experiences` | public (any authenticated or `anon` role) | only owning provider (`provider_id` → `providers.user_id = auth.uid()`), server-side ownership re-checked in the router as well |
| `market_valuations` | authenticated-read-only | service-role only |
| `itineraries` / `itinerary_items` | via `traveler_id`/`itinerary_id` → owner | same |
| `recommendation_logs` | via `traveler_id` → owner (read for provider demand aggregation goes through a service-role aggregation query, not direct RLS-bypassing client reads) | insert-only, system-written |

Every policy above requires an explicit `pytest` case (positive: owner can access; negative: non-owner is denied) — RLS is not considered "done" on schema definition alone.

---

## 4. Ranking Engine — Technical Spec

### 4.1 Module contract
`app/services/ranking_engine.py`

```python
class RankingEngine:
    def __init__(self, weights: RankingWeights | None = None): ...

    def rank(
        self,
        experiences: list[Experience],
        traveler_profile: TravelerProfile,
        context: LiveContext,
    ) -> list[RankedExperience]: ...
```

- `RankingWeights` — dataclass/Pydantic model with defaults matching Section 4.2 below; overridable per call for testing and future tuning, never hardcoded as magic numbers inline.
- `LiveContext` — `{ lat: float, lng: float, available_minutes: int, remaining_budget: Decimal, group_size: int, current_time: datetime }`
- `RankedExperience` — original experience + `fit_score: Decimal (0-100)` + `breakdown: FitBreakdown` + `explanation: str`

### 4.2 Default weights

| Factor | Weight |
|---|---|
| Interest match | 0.25 |
| Time fit | 0.20 |
| Budget fit | 0.15 |
| Distance / travel time | 0.15 |
| Rating quality | 0.15 |
| Accessibility + group suitability | 0.10 |

Weights must sum to 1.0; enforce with a validator, not a comment.

### 4.3 Factor algorithms

**Interest fit** — Jaccard-style overlap: `|traveler.interests ∩ experience.tags| / |traveler.interests|` (guard divide-by-zero when traveler has no interests set → neutral score, e.g. 50).

**Time fit** — piecewise scoring against `available_minutes`:
- `duration > available_minutes` → score decays sharply toward 0 (can't complete it)
- `duration` in a "comfortable middle band" (e.g., 30%–80% of `available_minutes`) → full credit (100)
- `duration` far below that band (uses almost none of the available time) → partial credit, decaying but not to zero
Implement as an explicit piecewise function with named breakpoints, not an opaque formula — this needs to be independently testable at each boundary.

**Budget fit** — compares `[price_min, price_max]` against `remaining_budget` and `[preferred_budget_min, preferred_budget_max]`:
- `price_min > remaining_budget` → score ≈ 0
- price range fully inside both remaining budget and preferred range → 100
- partial overlap → proportional score
All arithmetic in `Decimal`.

**Distance fit** — Haversine distance (`context.lat/lng` → `experience.lat/lng`) → estimated one-way walking time at 5 km/h → compare round-trip time against `available_minutes` using the same "unreachable-and-back scores near zero" rule as time fit.

**Quality fit** — Bayesian/confidence-weighted average, e.g.:
```
bayesian_rating = (C * m + rating_count * rating_avg) / (C + rating_count)
```
where `m` is the global prior mean rating and `C` is a confidence constant (configurable, e.g. 10–20 "virtual reviews"). Normalize to 0–100. This must be verified with a test case: a 5.0/2-reviews experience must NOT outrank a 4.6/200-reviews experience.

**Accessibility fit** — overlap between `traveler.accessibility_needs` and `experience.accessibility_tags` (same overlap approach as interest fit) blended with a binary/graduated group-size-vs-`capacity` check (score penalized or zeroed if `group_size > capacity` when capacity is set).

**Capacity fit modifier (market/shopping only)** — computed from the traveler's *remaining* pack-capacity percentage (`(max_capacity - current_weight) / max_capacity`). Applied as a multiplicative or subtractive dampening factor on top of the base weighted sum — **only** for `category in {'market', 'shopping'}` — configurable dampening curve (e.g., no penalty above 30% remaining capacity, linear penalty below that, floor at a minimum multiplier so score never hits exactly zero from this factor alone).

### 4.4 Filtering & explanation
- Pre-filter: exclude experiences where `is_active = false`, or currently closed per `opening_hours` vs `context.current_time`, unless `show_closed` is explicitly passed.
- `explanation` string generator: pick the top 2–3 scoring factors from `breakdown`, map each to a templated clause (e.g., time → "`{minutes}`-minute walk", budget → "well within budget", quality → "highly rated`{for group_type}`"), join into one sentence. Keep template logic in the service layer so it's testable without a live LLM call.

### 4.5 Performance note
Bounding-box prefilter on `(lat, lng)` index before running Haversine + full scoring on the candidate set, to avoid scoring the entire `experiences` table on every request as city/experience counts grow beyond the MVP seed size.

---

## 5. Physical Constraint Engine (BazaarLink) — Technical Spec

`app/services/physics_engine.py`, `runway_calculator.py`, `barter_optimizer.py`, `vision_detection.py` — all framework-independent.

### 5.1 `CarryingCapacityEngine`
```python
class CarryingCapacityEngine:
    @staticmethod
    def calculate(
        max_capacity_kg: Decimal,
        current_weight_kg: Decimal,
        item_weight_kg: Decimal,
        allow_overloaded_state: bool = False,
        comfortable_threshold_pct: Decimal = Decimal("80"),
        near_limit_threshold_pct: Decimal = Decimal("100"),
    ) -> CarryingImpactResult: ...
```
- Validation: raise `CapacityValidationError` if `current_weight_kg > max_capacity_kg` and `allow_overloaded_state` is `False` — this must fire *before* any impact calculation.
- Output fields: `remaining_before_kg`, `remaining_after_kg`, `fits: bool`, `percent_capacity_used_after: Decimal`, `weight_status: Literal['comfortable','near_limit','over_limit']`.
- `weight_status` thresholds are the two configurable percentages above, not hardcoded.
- Boundary tests required: exactly at `comfortable_threshold_pct`, exactly at `near_limit_threshold_pct`, `item_weight_kg = 0`, `current_weight_kg = max_capacity_kg` (zero remaining).

### 5.2 `CashRunwayCalculator`
```python
class CashRunwayCalculator:
    @staticmethod
    def calculate(
        liquid_cash: Decimal,
        average_daily_spend: Decimal,
        remaining_travel_days: int,
        item_cash_price: Decimal,
        barter_value: Decimal | None = None,
        minimum_emergency_reserve: Decimal = Decimal("0"),
    ) -> RunwayImpactResult: ...
```
- `runway_days_current = liquid_cash / average_daily_spend` (guard `average_daily_spend == 0` → return an explicit "undefined/infinite runway" state rather than dividing by zero)
- `runway_days_after_cash_purchase = (liquid_cash - item_cash_price) / average_daily_spend`
- `days_lost = runway_days_current - runway_days_after_cash_purchase`
- `can_afford_item: bool = (liquid_cash - item_cash_price) >= minimum_emergency_reserve`
- If `barter_value` supplied: `runway_days_after_barter` assumes cash unchanged (`liquid_cash` untouched) but factor in `barter_value` only as an opportunity-cost note, not a cash increase — barter does not add cash, it *avoids spending it*, so `days_preserved_via_barter = days_lost` (the cash-purchase days lost that are avoided) and `emergency_reserve_preserved: bool = True` when barter is chosen (since no cash leaves).
- Every response includes `projection_note: str` stating this assumes constant average daily spend and is not a guarantee.
- Boundary tests: `average_daily_spend = 0`, purchase exactly exhausts down to `minimum_emergency_reserve`, purchase pushes below reserve, `remaining_travel_days = 0`.

### 5.3 `BarterOptimizer`
```python
class BarterOptimizer:
    @staticmethod
    def find_packages(
        target_item_value: Decimal,
        target_item_weight_kg: Decimal,
        remaining_backpack_capacity_kg: Decimal,
        inventory: list[InventoryItem],
        max_assets_per_package: int = 4,
        minimum_value_ratio: Decimal = Decimal("0.85"),
    ) -> BarterPackagesResult: ...
```
- Algorithm: bounded, discretized-value knapsack DP over `inventory` (filter to `tradeable = True` and `available_quantity > minimum_retained_quantity` first).
  - Discretize `estimated_barter_value` into cents-equivalent integer buckets for DP indexing (never use float for the DP table itself — hold `Decimal` for the actual returned totals, use integer-scaled values only internally for the DP index).
  - Respect each item's actual available-minus-retained quantity as its usable count; never reuse the same `inventory_items` row beyond that quantity within a single package.
  - Cap each package at `max_assets_per_package` distinct assets.
  - Return **multiple** candidate packages (not just the single best), each with `total_value_offered`, `value_ratio = total_value_offered / target_item_value` (must be ≥ `minimum_value_ratio` to be included), `weight_freed_kg` (sum of offered items' weight — this is capacity *regained* by trading them away, distinct from the target item's own weight), `remaining_capacity_after_kg`, `acceptable: bool`, and a one-line `explanation`.
  - Tie-break ordering: fewest assets first, then most weight freed.
  - Always attach `complexity_note: str` stating this is a heuristic bounded solver, not a global optimum.
- Boundary tests: empty inventory, inventory with total value below `minimum_value_ratio` threshold (no packages returned, not an error), a single item that exactly matches target value.

### 5.4 Item detection service (`vision_detection.py`)
```python
class ItemDetectionService:
    async def detect(self, image_bytes: bytes, content_type: str) -> ItemDetectionResult: ...
```
- Calls a real multimodal/vision-capable model with the image plus a structured-output prompt requesting: `item_name`, `category`, `estimated_fair_value`, `estimated_weight_kg`, `confidence_score`.
- Parse and validate the model's response against a strict Pydantic schema before returning; any parse failure, API error, timeout, or missing API key **must** fall back to a deterministic mock result (not a random one — same input image hash → same mock output, for demo reproducibility).
- Response always includes `detection_source: Literal['live_model', 'mock_fallback']` so the frontend can label it honestly.
- No business logic beyond the API call + validation lives here — it does not calculate carrying/runway impact itself; the router composes the detection result with the other pure engines.

### 5.5 Decimal discipline (cross-cutting)
- Every function signature above takes and returns `Decimal`, never `float`.
- Pydantic schemas use `condecimal(...)` or plain `Decimal` typed fields with explicit units baked into field names (`_kg`, `_days`) at every layer — service, schema, and frontend TypeScript types (mirrored as `string`-serialized decimals over the wire, parsed with a Decimal-safe library on the frontend, not native JS `number`, to avoid float precision loss on money math).

---

## 6. API Contract

Base error shape for all non-2xx responses:
```json
{ "error": "string_error_code", "detail": "human-readable specific message" }
```
Validation failures return `400` with a specific `detail`, not a generic FastAPI `422` dump.

### 6.1 Traveler routes

| Method & Path | Auth | Request | Response (success) |
|---|---|---|---|
| `GET /me/profile` | 🔒 | — | `TravelerProfile` |
| `PUT /me/profile` | 🔒 | `TravelerProfileUpdate` | `TravelerProfile` |
| `GET /me/inventory` | 🔒 | — | `list[InventoryItem]` |
| `POST /me/inventory` | 🔒 | `InventoryItemCreate` | `InventoryItem` |
| `PUT /me/inventory/{id}` | 🔒 | `InventoryItemUpdate` | `InventoryItem` |
| `DELETE /me/inventory/{id}` | 🔒 | — | `204` |
| `POST /recommendations` | 🔒 | `LiveContext` | `list[RankedExperience]` (also writes `recommendation_logs`) |
| `GET /experiences/{id}` | public | — | `ExperienceDetail` |
| `POST /scans/detect` | 🔒 | multipart image | `ItemDetectionResult` |
| `POST /physics/carrying-impact` | none | `CarryingImpactRequest` | `CarryingImpactResult` |
| `POST /finance/runway-impact` | none | `RunwayImpactRequest` | `RunwayImpactResult` |
| `POST /barter/matches` | 🔒 | `BarterMatchRequest` (target value/weight only — inventory read server-side) | `BarterPackagesResult` |
| `POST /itineraries` | 🔒 | `ItineraryCreate` | `Itinerary` |
| `GET /itineraries` | 🔒 | — | `list[Itinerary]` |
| `POST /itineraries/{id}/items` | 🔒 | `ItineraryItemCreate` | `ItineraryItem` |
| `DELETE /itineraries/{id}/items/{item_id}` | 🔒 | — | `204` |

`/physics/carrying-impact` and `/finance/runway-impact` are unauthenticated because they're pure calculators with no persistence — but `/barter/matches` requires auth specifically because it must read the caller's *own* inventory from the DB server-side rather than trusting a client-supplied inventory array (prevents a client from fabricating an inventory to game the match).

### 6.2 Provider routes

| Method & Path | Auth | Notes |
|---|---|---|
| `POST /providers` | 🔒 | register provider profile, linked to `auth.uid()` |
| `POST /experiences` | 🔒 | ownership implied by authenticated provider |
| `PUT /experiences/{id}` | 🔒 | **server-side ownership check required** (`experience.provider_id.user_id == auth.uid()`) in addition to RLS — do not rely on RLS alone |
| `GET /providers/me/experiences` | 🔒 | — |
| `GET /providers/me/experiences/{id}/demand` | 🔒 | view count, shortlist-add count, last 7/30 days, aggregated from `recommendation_logs` + itinerary data |

### 6.3 Public routes

| Method & Path | Notes |
|---|---|
| `GET /experiences` | filters: `city`, `category`, `price_max`, `is_active` |
| `GET /cities` | distinct city list from `experiences` |
| `GET /health` | liveness check |

### 6.4 Rate limiting
`/scans/detect` and `/recommendations` require a basic per-user rate limit (e.g., token bucket keyed on `auth.uid()`) — protects the vision-API budget and prevents a broken frontend retry loop from hammering the ranking engine.

---

## 7. Frontend Technical Requirements

### 7.1 Routing (React Router v6+)
- `/` — Landing (no auth)
- `/onboarding` — multi-step, gated to authenticated-but-no-profile users
- `/discover` — main Discovery screen
- `/experiences/:id` — Experience detail
- `/itinerary` — Shortlist/itinerary
- `/provider` — Provider dashboard (role-gated)
- `/provider/experiences/new`, `/provider/experiences/:id/edit`
- `/settings` — profile edit

### 7.2 Responsive component strategy
- Shared component tree with Tailwind responsive classes (`sm:` `md:` `lg:` `xl:`); no separate `MobileDiscovery` / `DesktopDiscovery` component pair — one `Discovery` component whose internal layout (flex direction, column widths, tab vs. side-by-side) changes via breakpoint classes and a `useBreakpoint()`-style hook only where JS branching (not pure CSS) is unavoidable (e.g., swapping tabs vs. side-by-side rendering of list/map).
- Map/list bidirectional sync implemented via shared Zustand state (`selectedExperienceId`) read by both the list and the Leaflet marker layer, regardless of breakpoint layout.

### 7.3 Forms
- React Hook Form + Zod schemas for every form (onboarding, settings, experience create/edit).
- Zod schemas should mirror backend Pydantic constraints field-for-field (numeric ranges, required fields, enum values) so client-side and server-side validation never silently diverge — flag any schema drift found during implementation rather than resolving it ad hoc in only one place.

### 7.4 Item-scan input handling
- Mobile: `getUserMedia({ video: { facingMode: 'environment' } })`, capture frame to `Blob`, POST multipart to `/scans/detect`.
- Desktop/no-camera: drag-and-drop zone + `<input type="file" accept="image/*">`, same POST target — **one** `useItemScan()` hook backing both input methods so the detection call path is identical regardless of capture method.

### 7.5 PWA
- `vite-plugin-pwa` with an installable manifest (icons, name, theme colors matching the expedition palette) and a service worker; must remain functional (installable, offline app-shell at minimum) on both desktop and mobile browsers that support PWAs.

### 7.6 Decimal handling on the frontend
- Backend serializes `Decimal` fields as strings in JSON (not native floats) to avoid precision loss; frontend parses these with a decimal-safe library (e.g. `decimal.js`) wherever money/weight arithmetic or comparison happens client-side (e.g., live capacity/runway preview before hitting the calculation endpoints) — never native JS floating point for these fields.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | JWT verified server-side on every 🔒 route; RLS as defense-in-depth; provider write routes double-checked for ownership in the router; no client-supplied user/traveler/provider IDs trusted anywhere |
| **Data integrity** | `Decimal` end-to-end for money/weight, no float/Decimal mixing; DB-level CHECK constraints mirrored by Pydantic validators |
| **Performance** | Bounding-box prefilter before Haversine scoring; debounce context-change refetches (~400ms); rate-limit `/scans/detect` and `/recommendations` |
| **Reliability** | Vision-API failures degrade to a labeled deterministic mock, never a broken scan flow |
| **Accessibility** | WCAG AA contrast on the expedition palette; full keyboard navigation with visible focus rings on desktop; labeled (not placeholder-only) form fields; semantic landmarks |
| **Observability** | Structured backend logs (path, status, latency) at minimum; `recommendation_logs` persisted per request for later demand analysis |
| **Config/secrets** | All secrets via `.env`, never committed; `.env.example` committed with placeholders; `.gitignore` covers all `.env*` except the example |
| **CORS** | Explicit allowed origins for the frontend, never wildcarded in a production configuration |

---

## 9. Testing Strategy

| Layer | Requirement |
|---|---|
| `RankingEngine` | Unit tests per factor (interest, time, budget, distance, quality, accessibility, capacity modifier) covering normal, boundary, and invalid-input cases; explicit Bayesian-quality test (low-review 5.0 vs. high-review 4.6) |
| `CarryingCapacityEngine` | Unit tests at exactly each threshold, zero item weight, already-overloaded state (both allowed and disallowed) |
| `CashRunwayCalculator` | Unit tests at zero daily spend, purchase exactly at reserve boundary, purchase below reserve, zero remaining days |
| `BarterOptimizer` | Unit tests for empty inventory, below-ratio inventory, exact-match single item, package-count cap, tie-break ordering |
| API routes | At least one integration test per route group against a real test database (not fully mocked) |
| RLS policies | Positive (owner access) and negative (non-owner denied) test per private table |
| Frontend | Component tests for the ranking card, the Scan & Decide panel, and the responsive layout switch (assert side-by-side structure at `lg:` and stacked/tabbed structure below `md:`) |
| Build gate | `npm run build` and the backend test suite must both pass before the MVP is considered done — this is a hard gate, not a suggestion |

---

## 10. Deployment & Local Development

- **Local dev:** Docker Compose bringing up backend + optional local Postgres + frontend dev server (preferred, not strictly mandatory if an equivalent documented setup exists).
- **Migrations:** Alembic, one migration per schema change in Section 3, applied in order; no manual schema edits against a running Supabase instance outside of migrations.
- **Environments:** `.env.example` documents every required variable (Supabase URL/keys, JWT secret reference, vision-API key, CORS origins) with placeholder values only.
- **README requirement:** setup steps, run steps, and known limitations — stated as plainly as the calculation modules' own stated limitations (heuristic barter matcher, projected-not-guaranteed runway, mock fallback for vision detection when unconfigured).

---

## 11. Project Structure (authoritative)

```
/frontend
  /src
    /pages
    /components
    /lib          (api client, supabase client)
    /hooks
    /store        (zustand)
/backend
  /app
    /routers      (thin route handlers only)
    /services     (ranking_engine.py, physics_engine.py, runway_calculator.py,
                    barter_optimizer.py, vision_detection.py — framework-independent)
    /models       (SQLAlchemy ORM)
    /schemas      (Pydantic request/response)
    /auth.py
  /alembic
  /tests
/docker-compose.yml
/README.md
```

---

## 12. Traceability to PRD

| PRD Section | TRD Section(s) |
|---|---|
| 6 Responsive Design | 7.2 |
| 7.1 Onboarding & Profile | 3.1, 6.1 |
| 7.2 Live Context & Discovery | 4, 6.1, 7.2 |
| 7.3 Experience Detail / Scan & Decide | 5, 6.1, 7.4 |
| 7.4 Itinerary / Shortlist | 3.6–3.7, 6.1 |
| 7.5 Provider Side | 3.3, 6.2 |
| 8 Ranking Engine | 4 |
| 9 Physical Constraint Engine | 5 |
| 10 Data Model | 3 |
| 11 API Endpoints | 6 |
| 13 Tech Stack | 2, 7 |
| 14 Testing & Quality Bar | 9 |
| 15 Project Structure | 11 |

---

*This TRD should be read alongside the LocalPulse PRD; where the two differ on a numeric default or threshold, the original engineering specification (source document) is the tiebreaking source of truth.*
