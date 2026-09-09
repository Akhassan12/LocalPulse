# Product Requirements Document: LocalPulse

**Document type:** MVP Product Requirements Document
**Product:** LocalPulse — Intelligent Local Discovery & Experience Platform with Physical-Constraint Layer (BazaarLink)
**Status:** Draft for engineering scoping
**Version:** 1.0

---

## 1. Executive Summary

LocalPulse is a fully responsive web application (desktop, laptop, tablet, and mobile) that helps travelers discover local experiences matched to their real, current constraints — interests, location, available time, budget, group size, and accessibility needs — rather than generic popularity rankings.

Its differentiator is the **BazaarLink physical-constraint layer**: for market, shopping, and craft-buying experiences, the app tracks a traveler's remaining backpack capacity and cash runway, and helps them decide whether to buy an item with cash, barter for it using items already in their inventory, or skip it. This layer also feeds back into the core recommendation ranking, so travelers close to their pack-weight limit see shopping-heavy experiences ranked lower.

On the supply side, local businesses and experience providers can list experiences and view basic demand signals (views, shortlist adds).

---

## 2. Problem Statement

Existing local-discovery tools (review aggregators, generic "things to do" apps) rank experiences by popularity or proximity alone. They ignore:

- Whether the traveler actually has time or budget left in their day
- Whether the traveler wants and can carry a physical item, which is a real, common friction point at markets and craft shops
- Whether cash spent on an item measurably shortens the traveler's remaining trip runway
- Whether a trade (barter) is a viable, less costly alternative to a cash purchase

LocalPulse addresses this by combining a standard multi-factor recommendation engine with a purpose-built physical/financial constraint engine (BazaarLink), so recommendations and in-the-moment shopping decisions are grounded in what the traveler can actually do.

---

## 3. Goals & Success Criteria

### 3.1 Product goals
1. Recommend experiences that fit a traveler's real-time context (time, budget, location, group, accessibility), not just static preferences.
2. Let travelers make an informed buy/barter/skip decision on any physical item in under three taps/clicks, backed by concrete capacity and runway numbers.
3. Give providers enough demand visibility to judge whether their listings are working, without building booking/payments infrastructure.
4. Ship a fully responsive product from one shared component set — not a mobile app with a desktop skin bolted on.

### 3.2 MVP success criteria (functional, not analytics-driven, since this is a build-and-demo MVP)
- A traveler can complete onboarding, get ranked recommendations, open a market experience, scan/upload an item, and see a carrying-impact card, a runway-impact card, and at least one barter suggestion — end to end, with real or mock data.
- The same set of screens renders correctly (no horizontal scroll, correct layout per breakpoint) at 375px, 768px, 1024px, and 1440px.
- `RankingEngine`, `CarryingCapacityEngine`, `CashRunwayCalculator`, and `BarterOptimizer` are unit-tested, framework-independent, and pass in isolation.
- `npm run build` and the backend test suite both pass before the MVP is considered done.

---

## 4. Non-Goals (explicitly out of scope for MVP)

- Payment processing / transactions
- Real-time chat between travelers and providers
- Native mobile apps (iOS/Android) — web + installable PWA only
- Multi-language i18n beyond the bargaining-phrase feature
- Production-grade content moderation
- A full booking-slot calendar for providers (simple per-day open/closed + capacity only)
- Revenue/booking analytics on the provider dashboard

These must also be stated plainly in the project README, alongside the calculation modules' own stated limitations (heuristic barter matching, projected — not guaranteed — runway).

---

## 5. Target Users & Personas

| Persona | Description | Primary needs |
|---|---|---|
| **Backpacker Traveler** | Budget-conscious, long-trip traveler tracking pack weight and cash runway closely | Fast fit-check on purchases, barter options, runway visibility |
| **Casual/Family Traveler** | Shorter trip, not weight-constrained, browsing for things to do | Good ranked recommendations by interest/time/budget; physical layer largely invisible |
| **Local Experience Provider** | Runs a tour, workshop, market stall, or venue | Easy listing creation, visibility into demand (views, shortlist adds) |

The physical/financial layer is opt-in by design (skippable at onboarding) so it never blocks or complicates the experience for the Casual/Family persona.

---

## 6. Responsive Design Requirements

This is a single responsive product built from shared components with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`) — not two separate designs.

**Desktop / laptop (≥1024px):**
- Persistent sidebar or top nav (no hamburger menu)
- Discovery screen: ranked list (≈40% column) and Leaflet map (≈60%) side-by-side, both independently scrollable/pannable
- Context bar (location, time, budget, group size) persistent, not modal
- Experience detail: two-column layout (info/gallery vs. map/booking/barter panel)
- Hover states on all interactive elements
- Full keyboard navigation: logical tab order, visible focus rings, Enter/Space activation, Escape closes modals
- Item-scan flow uses drag-and-drop / file upload instead of a rear camera, but calls the same detection endpoint

**Tablet (768–1023px):**
- Adaptive two-column where space allows (e.g., profile fields), single-column/collapsible elsewhere (list above map)

**Mobile (<768px):**
- Single-column, stacked layout
- Context bar collapses to an expandable panel
- List/map become swappable tabs or a bottom-sheet-over-map
- Bottom navigation bar for primary sections
- Minimum touch target 44×44px
- Camera-based scan (`getUserMedia`, `facingMode: "environment"`) as primary input, same file-upload fallback as desktop

**Acceptance check:** every screen verified (by eye or automated screenshot) at 375px, 768px, 1024px, and 1440px, with no unintended horizontal scroll.

---

## 7. Functional Requirements

### 7.1 Traveler Onboarding & Profile
- Multi-step onboarding form (not a single page)
- **Personal fields:** display name, traveler type (solo/couple/family/backpacker/business), interests (multi-select tag list), dietary preferences, accessibility needs, preferred budget range, home currency
- **Physical & financial fields (BazaarLink, optional):** max carry capacity, current carried weight, liquid cash, average daily spend, remaining travel days, minimum emergency cash reserve
- Skip logic: physical-layer fields default sensibly (e.g., 15kg capacity) if skipped; market-category experiences hide the physics/runway/barter panel until filled in, with a contextual prompt the first time a market listing is opened
- Profile fully editable post-onboarding from Settings; any update immediately affects the next `/recommendations` call and any open market panels

### 7.2 Live Context & Discovery
- Persistent (desktop) / collapsible (mobile) context bar: location (geolocation with manual override), available free time, remaining budget, group size
- Debounced (~400ms) re-fetch of `/recommendations` on any context change — no full page reload
- Recommendation cards show: title, category icon, fit score (visually prominent, e.g. radial dial), one-line "why this fits," duration, price range, distance/travel time, rating + review count, thumbnail
- Cards are keyboard-navigable and open the experience detail view
- Empty state: clear message with one-click filter-relaxation suggestions, not a blank screen
- Map markers colored/sized by fit-score tier; bidirectional sync between map marker and list card selection

### 7.3 Experience Detail
- Standard layout: photo gallery, description, price range, duration, today's opening hours highlighted, accessibility tags, rating breakdown, embedded map, "Add to itinerary"
- **Market/shopping categories additionally show the Scan & Decide panel:**
  1. Item capture (camera or file upload) → `/scans/detect`
  2. Detection result: item name, category, fair market value, suggested opening bid, estimated weight, confidence score, 2–3 bargaining phrases (native text + phonetic + meaning)
  3. Carrying impact card: capacity before/after, fits (y/n), % capacity used, status badge (comfortable / near limit / over limit)
  4. Cash runway impact card: runway before/after, days lost, remaining cash, can-afford flag, runway preserved if bartered
  5. Barter suggestions: 3–5 candidate packages (items offered, value ratio, weight freed, acceptable flag, explanation), explicitly labeled heuristic, not a guaranteed trade
  6. If inventory or physical-profile fields are empty, show an inline prompt rather than hiding the panel

### 7.4 Itinerary / Shortlist
- Add/remove experiences; optional grouping by date into named itineraries
- Reorder within a day (drag-and-drop on desktop; drag or up/down controls on mobile)
- Cumulative physical-impact summary when the shortlist contains market items: combined projected weight and cash committed, checked against remaining capacity/runway, with a warning if the **combined** total breaches limits even when no single item does

### 7.5 Provider Side
- Provider registration (business name, contact email, description), linkable to the same auth user as a traveler account
- Create/edit listings: title, description, category, tags, price range, duration, geocoded or pin-dropped location, structured per-day opening hours, capacity, accessibility tags, photos
- Availability: simple per-day open/closed toggle + capacity (no full booking calendar)
- Dashboard: own listings, demand signals per listing (views, shortlist-adds, last 7/30 days) from `recommendation_logs` and itinerary data — no revenue data

### 7.6 System / Data
- Seed data: 1–2 cities, 50–100 experiences across categories, including 10–15 market/shopping listings with matching `market_valuations` rows
- Ranking and physics/runway/barter logic implemented as pure, framework-independent, unit-testable functions/classes
- All money/weight math uses `Decimal` end-to-end — never float, never mixed float/Decimal
- Structured backend logging (path, status, latency); recommendation requests additionally logged to `recommendation_logs`

---

## 8. Ranking Engine — Requirements

Pure `RankingEngine` class, no FastAPI/DB imports.

**Inputs:** `experiences[]`, `traveler_profile`, `context (lat, lng, available_minutes, remaining_budget, group_size, current_time)`

**Output:** experiences sorted by `fit_score` (0–100), each annotated with a `breakdown` (per-factor 0–100 scores) and a generated `explanation` string built from the top-scoring factors.

**Default factor weights:**

| Factor | Weight |
|---|---|
| Interest match | 25% |
| Time fit | 20% |
| Budget fit | 15% |
| Distance / travel time | 15% |
| Rating quality | 15% |
| Accessibility + group suitability | 10% |

**Key rules:**
- Time fit penalizes both "too long to fit" and "barely uses the time," full credit in a comfortable middle band
- Budget fit approaches zero when `price_min > remaining_budget`
- Distance fit uses Haversine distance → estimated walking time at ~5 km/h, scored against `available_minutes`
- Quality fit uses a Bayesian/confidence-weighted average of rating and review count (a 5.0 from 2 reviews should not outrank a 4.6 from 200)
- Capacity fit (market/shopping only) is a modifier applied on top of the base weighted sum, dampening score for travelers near their pack-weight limit; no effect on other categories
- Closed experiences (per `opening_hours` vs. `context.current_time`) are excluded/scored zero unless "show closed" is explicitly toggled

---

## 9. Physical Constraint Engine (BazaarLink) — Requirements

Separate pure module, also framework-independent.

- **`CarryingCapacityEngine.calculate(...)`** — remaining capacity before/after, `fits: bool`, `percent_capacity_used_after`, `weight_status` (comfortable/near_limit/over_limit); raises a validation error if current weight already exceeds max capacity unless explicitly allowed.
- **`CashRunwayCalculator.calculate(...)`** — runway before/after a cash purchase, days lost, remaining cash, `can_afford_item`, and (if barter value supplied) runway after barter, days preserved, whether the emergency reserve is preserved. Every output explicitly flagged as a projection assuming constant spend.
- **`BarterOptimizer.find_packages(...)`** — bounded, discretized-value knapsack DP over tradeable inventory, respecting per-asset quantities, capped item count per package, returns multiple candidate packages tie-broken by fewest assets then most weight freed, always including a `complexity_note` stating it is a heuristic, not a globally optimal matcher.
- **Item detection service** — real vision-model call (image + structured-output prompt) returning name, category, fair value, weight, confidence, validated against a Pydantic schema; falls back to a clearly-labeled deterministic mock on any failure so the demo never breaks.

All outputs are Pydantic response models with explicit units in field names (`_kg`, `_days`).

---

## 10. Data Model Summary

Eight core tables, all UUID-keyed, RLS-enabled except `market_valuations` (authenticated-read-only, service-role-write-only):

1. `traveler_profiles` — personal + physical/financial fields, budget/weight/cash check constraints
2. `inventory_items` — tradeable assets for barter, quantity and retention constraints
3. `providers` — linked to `auth.users`
4. `experiences` — category, pricing, geolocation, structured opening hours, rating aggregates, `uniqueness_score`; indexed on `(city, category)` and `(lat, lng)`
5. `market_valuations` — shared reference data for item detection/valuation
6. `itineraries` — traveler-owned, optionally dated
7. `itinerary_items` — ordered items per itinerary, unique `(itinerary_id, position)`
8. `recommendation_logs` — context snapshot + ranked result, for provider demand signals

Full column-level detail is defined in the engineering spec (source document, Section 5) and should be mirrored 1:1 into Alembic migrations.

---

## 11. API Surface (minimum)

Auth via Supabase JWT verified server-side on every 🔒 route; identity always derived from the token, never a client-supplied ID.

**Traveler:** profile CRUD, inventory CRUD, `POST /recommendations` (writes `recommendation_logs`), `GET /experiences/{id}` (public), `POST /scans/detect`, `POST /physics/carrying-impact` & `POST /finance/runway-impact` (unauthenticated, pure calculation), `POST /barter/matches` (auth required — reads caller's own inventory server-side), itinerary CRUD.

**Provider:** register, create/edit experiences (server-side ownership check, not just RLS), list own experiences, per-listing demand.

**Public:** `GET /experiences` (filterable), `GET /cities`, `GET /health`.

**Cross-cutting:** consistent error shape `{ error, detail }`; specific 400s over generic 422 dumps; rate limiting on `/scans/detect` and `/recommendations`.

---

## 12. Design Requirements

- "Expedition" palette: deep navy/ink `#0D1B2A`, brass/gold `#C9A84C`, teal `#4EC9B0`, warm parchment background
- Consistent type scale (display font for headings, clean sans for body), consistent across both discovery and barter/market screens — must read as one product
- Explicitly avoid generic "AI-template" cream/terracotta defaults, unstyled form controls, undifferentiated rounded cards
- Accessibility baseline: WCAG AA contrast, visible focus states, alt text on all images, properly labeled (not placeholder-only) form fields, semantic landmarks (`nav`, `main`, `aside`)

---

## 13. Tech Stack

**Frontend:** React 18 + Vite + TypeScript (strict), Tailwind CSS, Headless UI / Lucide icons, React Router v6+, PWA via `vite-plugin-pwa`, Leaflet (`react-leaflet`), Zustand (UI state) + TanStack React Query (server state), React Hook Form + Zod.

**Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0 async + Alembic, Pydantic v2, Supabase Auth (JWT verification server-side), explicit CORS config.

**Database:** PostgreSQL via Supabase, UUID PKs, RLS as described in Section 10.

**Other:** `Decimal` everywhere for money/weight, `.env` + committed `.env.example`, Docker Compose for local dev (preferred), real vision-API call with deterministic mock fallback for item detection.

---

## 14. Testing & Quality Bar

- Unit tests for `RankingEngine`, `CarryingCapacityEngine`, `CashRunwayCalculator`, `BarterOptimizer` — normal, boundary (exactly-at-threshold, zero), and invalid-input cases
- At least one integration test per API route group against a real test database
- Frontend component tests: ranking card, scan-and-decide panel, responsive layout switch (side-by-side vs. stacked per breakpoint)
- `npm run build` and backend test suite must both pass before the MVP is considered complete — code must actually be run, not just written

---

## 15. Project Structure

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
    /services     (ranking_engine.py, physics_engine.py, runway_calculator.py, barter_optimizer.py, vision_detection.py)
    /models       (SQLAlchemy ORM)
    /schemas      (Pydantic request/response)
    /auth.py
  /alembic
  /tests
/docker-compose.yml
/README.md
```

Calculation logic in `/services` stays free of FastAPI/SQLAlchemy/HTTP imports; routers call services, services never call back into routers or the DB layer.

---

## 16. Risks & Open Questions

| Risk / Question | Notes |
|---|---|
| Vision-API cost/availability | Mitigated by deterministic mock fallback; needs a rate limit on `/scans/detect` |
| Barter optimizer correctness at scale | Bounded DP is heuristic by design; must be labeled as such in every response, not silently presented as optimal |
| RLS policy correctness | Every traveler-private table needs a policy test, not just a schema-level assumption |
| Seed data realism | 10–15 market listings need genuinely varied item types/weights to make barter/capacity demos meaningful |
| Scope creep into payments/booking | Explicitly fenced off in Non-Goals (Section 4) — revisit only post-MVP |

---

## 17. Milestones (suggested build order)

1. Data model + migrations + RLS policies
2. Pure calculation services (`RankingEngine`, `CarryingCapacityEngine`, `CashRunwayCalculator`, `BarterOptimizer`) with unit tests, before any API wiring
3. Auth + core traveler API routes (profile, inventory, recommendations)
4. Discovery screen (responsive: list + map) wired to `/recommendations`
5. Experience detail + Scan & Decide panel (mock detection first, real vision API second)
6. Itinerary/shortlist with cumulative impact summary
7. Provider registration, listing CRUD, dashboard
8. Seed data population, end-to-end pass at all four breakpoints, full test suite green

---

*This PRD is derived from the full engineering specification supplied for LocalPulse; the specification remains the source of truth for exact schema fields, endpoint signatures, and calculation formulas where this document summarizes.*
