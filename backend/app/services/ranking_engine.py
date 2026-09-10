"""
app/services/ranking_engine.py — Context-Aware Experience Ranking Engine
Pure Python / Pydantic service.
Calculates 0-100 fit scores based on interest, time, budget, distance, Bayesian quality,
accessibility, and pack capacity dampening for shopping/markets.
"""
from __future__ import annotations

import math
from datetime import datetime, time
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Tuple
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.experience import (
    Experience,
    LiveContext,
    FitBreakdown,
    RankedExperience,
)
from app.schemas.traveler import TravelerProfileBase


# Earth radius in kilometers for Haversine calculation
EARTH_RADIUS_KM = 6371.0
WALKING_SPEED_KMH = 5.0  # standard human walking speed 5 km/h


class RankingWeights(BaseModel):
    model_config = ConfigDict(frozen=True)

    interest_match: Decimal = Decimal("0.25")
    time_fit: Decimal = Decimal("0.20")
    budget_fit: Decimal = Decimal("0.15")
    distance_fit: Decimal = Decimal("0.15")
    rating_quality: Decimal = Decimal("0.15")
    accessibility_fit: Decimal = Decimal("0.10")

    @model_validator(mode="after")
    def validate_weights_sum(self) -> "RankingWeights":
        total = (
            self.interest_match
            + self.time_fit
            + self.budget_fit
            + self.distance_fit
            + self.rating_quality
            + self.accessibility_fit
        )
        if abs(total - Decimal("1.0")) > Decimal("0.001"):
            raise ValueError(f"Ranking weights must sum exactly to 1.0 (got {total})")
        return self


def haversine_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate Great Circle distance in kilometers between two geo coordinates."""
    r_lat1 = math.radians(lat1)
    r_lng1 = math.radians(lng1)
    r_lat2 = math.radians(lat2)
    r_lng2 = math.radians(lng2)

    dlat = r_lat2 - r_lat1
    dlng = r_lng2 - r_lng1

    a = math.sin(dlat / 2) ** 2 + math.cos(r_lat1) * math.cos(r_lat2) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


class RankingEngine:
    def __init__(
        self,
        weights: Optional[RankingWeights] = None,
        bayesian_prior_mean: Decimal = Decimal("4.0"),
        bayesian_confidence_c: Decimal = Decimal("15.0"),
    ):
        self.weights = weights or RankingWeights()
        self.prior_mean = bayesian_prior_mean
        self.confidence_c = bayesian_confidence_c

    # ── 1. Interest Fit ─────────────────────────────────────────────────────────
    @staticmethod
    def score_interest_fit(
        traveler_interests: list[str], experience_tags: list[str]
    ) -> Decimal:
        """
        Jaccard-style overlap: |interests ∩ tags| / |interests| * 100.
        Returns neutral score (50.0) if traveler has no interests specified.
        """
        if not traveler_interests:
            return Decimal("50.0")

        t_set = {i.strip().lower() for i in traveler_interests if i.strip()}
        if not t_set:
            return Decimal("50.0")

        e_set = {t.strip().lower() for t in experience_tags if t.strip()}
        overlap = len(t_set.intersection(e_set))
        score = (Decimal(overlap) / Decimal(len(t_set))) * Decimal("100.0")
        return min(Decimal("100.0"), max(Decimal("0.0"), score))

    # ── 2. Time Fit ─────────────────────────────────────────────────────────────
    @staticmethod
    def score_time_fit(duration_minutes: int, available_minutes: int) -> Decimal:
        """
        Piecewise scoring against available_minutes:
        - duration > available_minutes: decays sharply toward 0
        - duration in comfortable middle band (30% to 80%): 100.0
        - duration between 80% and 100%: comfortable tight band (70 to 100)
        - duration < 30%: partial credit decaying gracefully but not to 0 (40 to 100)
        """
        if available_minutes <= 0:
            return Decimal("0.0")

        dur = Decimal(duration_minutes)
        avail = Decimal(available_minutes)

        if dur > avail:
            # Can't complete in available time; sharp penalty
            overage = dur - avail
            # Linear decay to 0 over 30 mins overage
            penalty = (overage / Decimal("30.0")) * Decimal("50.0")
            raw_score = max(Decimal("0.0"), Decimal("20.0") - penalty)
            return raw_score.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        ratio = dur / avail  # 0.0 to 1.0

        if Decimal("0.30") <= ratio <= Decimal("0.80"):
            # Comfortable sweet spot
            return Decimal("100.0")
        elif ratio > Decimal("0.80"):
            # Close to available time: scale 100 down to 70 at 100%
            tightness = (ratio - Decimal("0.80")) / Decimal("0.20")
            score = Decimal("100.0") - (tightness * Decimal("30.0"))
            return score.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        else:
            # Under 30%: short activity, scale from 40 up to 100
            scale = ratio / Decimal("0.30")
            score = Decimal("40.0") + (scale * Decimal("60.0"))
            return score.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    # ── 3. Budget Fit ───────────────────────────────────────────────────────────
    @staticmethod
    def score_budget_fit(
        price_min: Optional[Decimal],
        price_max: Optional[Decimal],
        remaining_budget: Decimal,
        preferred_min: Optional[Decimal] = None,
        preferred_max: Optional[Decimal] = None,
    ) -> Decimal:
        """
        Evaluates experience price range against remaining budget and preferred budget:
        - price_min > remaining_budget: 0.0 (unaffordable)
        - fully within remaining_budget and preferred range: 100.0
        - partial overlap or below preferred min: proportional score
        """
        p_min = price_min if price_min is not None else Decimal("0.0")
        p_max = price_max if price_max is not None else p_min

        # Free experiences always fit well
        if p_max == Decimal("0.0"):
            return Decimal("100.0")

        if p_min > remaining_budget:
            return Decimal("0.0")

        pref_min = preferred_min if preferred_min is not None else Decimal("0.0")
        pref_max = preferred_max if preferred_max is not None else remaining_budget

        # If price fits cleanly inside preferred budget
        if p_min >= pref_min and p_max <= pref_max:
            return Decimal("100.0")

        # If price is lower than preferred min (very cheap/free)
        if p_max < pref_min:
            return Decimal("90.0")

        # If price is above preferred max but <= remaining budget
        if p_max > pref_max and p_min <= remaining_budget:
            # Proportional discount based on how much it exceeds preferred max
            budget_cushion = remaining_budget - pref_max
            if budget_cushion > Decimal("0.0"):
                overage_ratio = (p_max - pref_max) / budget_cushion
                score = Decimal("100.0") - min(Decimal("60.0"), overage_ratio * Decimal("60.0"))
            else:
                score = Decimal("50.0")
            return max(Decimal("10.0"), score).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        return Decimal("75.0")

    # ── 4. Distance & Travel Time Fit ───────────────────────────────────────────
    @staticmethod
    def score_distance_fit(
        traveler_lat: float,
        traveler_lng: float,
        exp_lat: float,
        exp_lng: float,
        duration_minutes: int,
        available_minutes: int,
    ) -> Tuple[Decimal, Decimal, int]:
        """
        Computes Haversine distance, estimated walk time at 5 km/h,
        checks if round trip + activity fits in available time.
        Returns (distance_score, distance_km, one_way_walk_minutes).
        """
        dist_km = haversine_distance_km(traveler_lat, traveler_lng, exp_lat, exp_lng)
        dist_dec = Decimal(str(dist_km)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        one_way_hours = dist_km / WALKING_SPEED_KMH
        one_way_mins = int(math.ceil(one_way_hours * 60))
        round_trip_mins = one_way_mins * 2
        total_time_needed = round_trip_mins + duration_minutes

        if total_time_needed > available_minutes:
            # Round trip cannot be made within available time
            overage = total_time_needed - available_minutes
            penalty = Decimal(overage) * Decimal("2.0")
            score = max(Decimal("0.0"), Decimal("30.0") - penalty)
            return (score.quantize(Decimal("0.1")), dist_dec, one_way_mins)

        # Distance score based on proximity
        if dist_km <= 0.5:
            score = Decimal("100.0")
        elif dist_km <= 1.5:
            score = Decimal("90.0")
        elif dist_km <= 3.0:
            score = Decimal("75.0")
        elif dist_km <= 5.0:
            score = Decimal("60.0")
        else:
            # Further away: scales down to 30.0
            scale = max(0.0, 1.0 - (dist_km - 5.0) / 10.0)
            score = Decimal("30.0") + (Decimal(str(scale)) * Decimal("30.0"))

        return (min(Decimal("100.0"), score.quantize(Decimal("0.1"))), dist_dec, one_way_mins)

    # ── 5. Quality Fit (Bayesian average) ────────────────────────────────────────
    def score_quality_fit(self, rating_avg: Decimal, rating_count: int) -> Decimal:
        """
        Bayesian weighted average:
        bayesian_rating = (C * m + rating_count * rating_avg) / (C + rating_count)
        Normalized to 0-100 scale: (bayesian_rating / 5.0) * 100
        Guarantees that high review count with solid rating outranks low review count with 5.0.
        """
        c = self.confidence_c
        m = self.prior_mean
        n = Decimal(rating_count)
        r = rating_avg

        bayesian_rating = (c * m + n * r) / (c + n)
        normalized = (bayesian_rating / Decimal("5.0")) * Decimal("100.0")
        return min(Decimal("100.0"), max(Decimal("0.0"), normalized.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)))

    # ── 6. Accessibility & Group Fit ────────────────────────────────────────────
    @staticmethod
    def score_accessibility_fit(
        traveler_needs: list[str],
        experience_tags: list[str],
        group_size: int,
        capacity: Optional[int],
    ) -> Decimal:
        """
        Checks accessibility tags match and group size vs venue capacity.
        """
        # Accessibility tag match
        t_needs = {n.strip().lower() for n in traveler_needs if n.strip()}
        if not t_needs:
            acc_score = Decimal("100.0")
        else:
            e_tags = {t.strip().lower() for t in experience_tags if t.strip()}
            overlap = len(t_needs.intersection(e_tags))
            acc_score = (Decimal(overlap) / Decimal(len(t_needs))) * Decimal("100.0")

        # Capacity check
        if capacity is not None and capacity > 0:
            if group_size > capacity:
                # Over capacity penalty
                return Decimal("0.0")
            elif group_size == capacity:
                # Exactly full
                acc_score = acc_score * Decimal("0.85")

        return min(Decimal("100.0"), max(Decimal("0.0"), acc_score.quantize(Decimal("0.1"))))

    # ── 7. Capacity Modifier (Market/Shopping Only) ──────────────────────────────
    @staticmethod
    def calculate_capacity_modifier(
        category: str,
        max_capacity_kg: Optional[Decimal],
        current_weight_kg: Decimal,
    ) -> Decimal:
        """
        Dampens score for market/shopping experiences when traveler's pack is nearly full.
        No penalty above 30% remaining capacity; linear penalty below, floored at 0.5.
        """
        if category.lower() not in {"market", "shopping"}:
            return Decimal("1.0")

        if max_capacity_kg is None or max_capacity_kg <= Decimal("0.0"):
            return Decimal("1.0")

        remaining_cap = max(Decimal("0.0"), max_capacity_kg - current_weight_kg)
        remaining_pct = (remaining_cap / max_capacity_kg) * Decimal("100.0")

        if remaining_pct >= Decimal("30.0"):
            return Decimal("1.0")

        # Linear decay between 0% and 30% remaining: from 0.5 to 1.0
        ratio = remaining_pct / Decimal("30.0")
        modifier = Decimal("0.5") + (ratio * Decimal("0.5"))
        return max(Decimal("0.5"), modifier.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    # ── 8. Operating Hours Pre-filter ───────────────────────────────────────────
    @staticmethod
    def is_open_now(opening_hours: dict, current_time: datetime) -> bool:
        """
        Checks if the experience is open at current_time.
        Expected format: {"mon": {"open": "09:00", "close": "18:00"}, ...}
        """
        if not opening_hours:
            return True  # If not specified, assume open

        weekday_keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        current_weekday = weekday_keys[current_time.weekday()]

        day_schedule = opening_hours.get(current_weekday)
        if not day_schedule:
            # Explicitly closed on this day (e.g. null or missing)
            return False

        open_str = day_schedule.get("open")
        close_str = day_schedule.get("close")
        if not open_str or not close_str:
            return True

        try:
            o_h, o_m = map(int, open_str.split(":"))
            c_h, c_m = map(int, close_str.split(":"))
            open_t = time(o_h, o_m)
            close_t = time(c_h, c_m)
            now_t = current_time.time()

            if open_t <= close_t:
                return open_t <= now_t <= close_t
            else:
                # Crosses midnight (e.g., nightlife 21:00 to 03:00)
                return now_t >= open_t or now_t <= close_t
        except Exception:
            return True

    # ── 9. Explanation Generation ───────────────────────────────────────────────
    @staticmethod
    def generate_explanation(
        breakdown: FitBreakdown,
        walk_minutes: int,
        category: str,
        tags: list[str],
        circumstance_mode: Optional[str] = None,
    ) -> str:
        """
        Picks the top 2-3 scoring factors and formats them into an intuitive sentence,
        highlighting circumstance adaptations if active.
        """
        circumstance_prefix = ""
        if circumstance_mode == "monsoon_rain":
            circumstance_prefix = "🌧️ Weather Adapted: "
        elif circumstance_mode == "heatwave":
            circumstance_prefix = "☀️ Cool Refuge: "
        elif circumstance_mode == "time_crunch":
            circumstance_prefix = "⏱️ Rapid Reroute: "
        elif circumstance_mode == "budget_saver":
            circumstance_prefix = "💸 Budget Gem: "
        elif circumstance_mode == "family_mode":
            circumstance_prefix = "👨‍👩‍👧 Family Favorite: "

        factors = [
            ("time", breakdown.time_score, f"fits your schedule ({walk_minutes}-min walk)"),
            ("budget", breakdown.budget_score, "well within your target budget"),
            ("quality", breakdown.quality_score, "highly rated with verified local reviews"),
            ("interest", breakdown.interest_score, f"matches your interests ({', '.join(tags[:2]) if tags else category})"),
            ("accessibility", breakdown.accessibility_score, "meets your accessibility requirements"),
        ]

        # Sort by score descending
        factors.sort(key=lambda x: x[1], reverse=True)

        top_clauses = [f[2] for f in factors[:2] if f[1] >= Decimal("60.0")]
        if not top_clauses:
            return f"{circumstance_prefix}Solid fit for your location and available window."

        joined = " and ".join(top_clauses)
        return f"{circumstance_prefix}Top pick: {joined}."

    # ── 10. Master Rank Function ────────────────────────────────────────────────
    def rank(
        self,
        experiences: list[Experience],
        traveler_profile: TravelerProfileBase,
        context: LiveContext,
    ) -> list[RankedExperience]:
        """
        Filter, evaluate, and rank candidate experiences with circumstance adaptation.
        """
        ranked_list: list[RankedExperience] = []
        mode = context.circumstance_mode

        for exp in experiences:
            # 1. Pre-filter active status
            if not exp.is_active:
                continue

            # 2. Pre-filter opening hours unless show_closed is True
            if not context.show_closed and not self.is_open_now(exp.opening_hours, context.current_time):
                continue

            # Calculate individual factor scores
            interests_to_use = context.interests if context.interests else traveler_profile.interests
            interest_s = self.score_interest_fit(interests_to_use, exp.tags)
            time_s = self.score_time_fit(exp.duration_minutes, context.available_minutes)
            budget_s = self.score_budget_fit(
                exp.price_min,
                exp.price_max,
                context.remaining_budget,
                traveler_profile.preferred_budget_min,
                traveler_profile.preferred_budget_max,
            )
            dist_s, dist_km, walk_mins = self.score_distance_fit(
                context.lat,
                context.lng,
                exp.lat,
                exp.lng,
                exp.duration_minutes,
                context.available_minutes,
            )
            quality_s = self.score_quality_fit(exp.rating_avg, exp.rating_count)
            access_s = self.score_accessibility_fit(
                context.accessibility_needs if context.accessibility_needs else traveler_profile.accessibility_needs,
                exp.accessibility_tags,
                context.group_size,
                exp.capacity,
            )
            cap_modifier = self.calculate_capacity_modifier(
                exp.category,
                traveler_profile.max_carry_capacity_kg,
                traveler_profile.current_carried_weight_kg,
            )

            # ── Dynamic Circumstance Adaptation Modifier ────────────────────────
            circumstance_multiplier = Decimal("1.0")
            exp_text = f"{exp.title} {exp.description} {' '.join(exp.tags)} {exp.category}".lower()

            if mode in ("monsoon_rain", "heatwave"):
                # Boost sheltered / indoor ateliers, havelis, workshops, food
                is_indoor = any(k in exp_text for k in ["indoor", "workshop", "studio", "haveli", "museum", "baithak", "sweets", "chai", "silk", "craft"])
                is_open_air = any(k in exp_text for k in ["boat", "river", "open-air", "trail", "stepwell", "akhada", "walking tour"])
                if is_indoor:
                    circumstance_multiplier *= Decimal("1.25")
                elif is_open_air:
                    circumstance_multiplier *= Decimal("0.60")

            elif mode == "time_crunch":
                # Severe priority for duration <= 45m and close distance
                if exp.duration_minutes <= 45 and walk_mins <= 12:
                    circumstance_multiplier *= Decimal("1.30")
                elif exp.duration_minutes > 90 or walk_mins > 20:
                    circumstance_multiplier *= Decimal("0.50")

            elif mode == "budget_saver":
                # Free or under 250 INR
                p_min = exp.price_min if exp.price_min is not None else Decimal("0.0")
                if p_min <= Decimal("250.0"):
                    circumstance_multiplier *= Decimal("1.30")
                elif p_min > Decimal("1000.0"):
                    circumstance_multiplier *= Decimal("0.60")

            elif mode == "family_mode":
                # Kid & family friendly hands-on crafts, food, puppets
                is_family_friendly = any(k in exp_text for k in ["family", "kid", "pottery", "block print", "craft", "sweet", "puppet", "heritage", "story"])
                if is_family_friendly:
                    circumstance_multiplier *= Decimal("1.25")
                if "akhada" in exp_text or "nightlife" in exp_text:
                    circumstance_multiplier *= Decimal("0.60")

            breakdown = FitBreakdown(
                interest_score=interest_s,
                time_score=time_s,
                budget_score=budget_s,
                distance_score=dist_s,
                quality_score=quality_s,
                accessibility_score=access_s,
                capacity_modifier=cap_modifier,
            )

            # Weighted sum of 6 core factors
            base_score = (
                (self.weights.interest_match * interest_s)
                + (self.weights.time_fit * time_s)
                + (self.weights.budget_fit * budget_s)
                + (self.weights.distance_fit * dist_s)
                + (self.weights.rating_quality * quality_s)
                + (self.weights.accessibility_fit * access_s)
            )

            # Apply capacity modifier and circumstance modifier
            final_score = (base_score * cap_modifier * circumstance_multiplier).quantize(
                Decimal("0.1"), rounding=ROUND_HALF_UP
            )
            final_score = min(Decimal("100.0"), max(Decimal("0.0"), final_score))

            explanation = self.generate_explanation(breakdown, walk_mins, exp.category, exp.tags, mode)

            ranked_list.append(
                RankedExperience(
                    experience=exp,
                    fit_score=final_score,
                    breakdown=breakdown,
                    explanation=explanation,
                    walking_distance_km=dist_km,
                    estimated_walk_minutes=walk_mins,
                )
            )

        # Sort descending by fit_score
        ranked_list.sort(key=lambda r: r.fit_score, reverse=True)
        return ranked_list

