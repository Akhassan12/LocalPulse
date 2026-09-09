# LocalPulse

**Intelligent local discovery & experience platform with the BazaarLink physical-constraint layer.**

> Discover experiences ranked by your *actual* constraints — time, budget, pack weight, and barter potential. Not by what's trending.

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+, Python 3.11+
- Docker + Docker Compose (optional but recommended)

### With Docker Compose
```bash
cp backend/.env.example backend/.env
# Fill in your Supabase credentials and Google API key in backend/.env
docker compose up
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:8000/docs

### Without Docker
```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt   # or: pip install .
cp .env.example .env               # fill in credentials
uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Project Structure
```
frontend/   React 18 + Vite + TypeScript + Tailwind
backend/    FastAPI + SQLAlchemy 2.0 + Pydantic v2
```
Full structure: see implementation_plan.md

---

## Known Limitations

These are stated limitations of the MVP, not bugs:

1. **Barter optimizer**: Uses a heuristic bounded knapsack DP. It is **not** a globally optimal matcher. Every response is labeled with a `complexity_note` to this effect.

2. **Cash runway calculator**: All projections assume constant average daily spend. Outputs are explicitly labeled as projections, not guarantees.

3. **Vision item detection**: Makes a real call to Google Gemini Vision. If the API key is unconfigured, rate-limited, or the call fails for any reason, the app **always falls back to a deterministic mock result** (same image → same mock output for demo reproducibility). Responses include a `detection_source` field (`live_model` or `mock_fallback`) so the user always knows which mode is active.

4. **No booking/payments**: LocalPulse shows availability and demand signals only. No transaction processing is implemented.

5. **No real-time chat**: Provider ↔ traveler communication is out of scope for MVP.

6. **PWA only**: No native iOS/Android app. The web app is installable as a PWA.

---

## Implemented Architecture & Completed Phases

LocalPulse is built phase-by-phase following strict PRD & TRD constraints:

1. **Phase 1 — Schema & Database**: PostgreSQL + Async SQLAlchemy models with Row-Level Security (RLS) simulation, Alembic migrations, and seed data.
2. **Phase 2 — Auth & Onboarding**: Supabase Auth integration, JWT verification interceptors, and traveler onboarding constraint profiling.
3. **Phase 3 — Physics & Runway Engines**: Mathematical pack-carrying physical strain engine (`app/services/physics_engine.py`) and cash runway projection calculator (`app/services/runway_calculator.py`).
4. **Phase 4 — Recommendation Engine**: Multimodal scoring engine combining interest match, physical strain penalty, budget Runway factor, and host uniqueness scores.
5. **Phase 5 — Landing & Design References**: High-fidelity landing page inspired by MonksTrip and Voyage Travel Agency Dribbble references with Bento grid highlights and responsive navigation.
6. **Phase 6 — Discovery & Dynamic Map**: Multi-constraint exploration feed with bidirectional Leaflet map synchronization and Fit Score breakdown dials.
7. **Phase 7 — Experience Detail & BazaarLink**: Full experience inspection with the 5-step BazaarLink decision engine, Gemini-powered vision detection, carrying impact cards, and knapsack barter package solver.
8. **Phase 8 — Itinerary Planner**: Drag-and-drop / sequential schedule organizer, route waypoint preview, and real-time cumulative constraint overload warning system.
9. **Phase 9 — Host & Artisan Provider Portal**: Local host registration, experience listing CRUD with server-side ownership verification, and real-time incoming traveler demand signals.
10. **Phase 10 — PWA, Polish, Build Gate**: Service worker offline caching via `vite-plugin-pwa`, WCAG-compliant color contrast, responsive layout across all device viewports, and 100% automated test coverage.

---

## Running Automated Tests

```bash
# Run full backend test suite (51 tests)
cd backend
python -m pytest

# Run frontend build gate (TypeScript check + Vite production bundle)
cd frontend
npm run build
```

