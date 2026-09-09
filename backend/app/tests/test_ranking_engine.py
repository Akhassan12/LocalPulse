"""
Tests for RankingEngine (ranking_engine.py)
Validates all 6 fit factors, Bayesian quality weighting, capacity modifiers,
opening hours pre-filtering, and master ranking order.
"""
from decimal import Decimal
from datetime import datetime
from uuid import uuid4
import pytest

from app.schemas.experience import Experience, LiveContext
from app.schemas.traveler import TravelerProfileBase
from app.services.ranking_engine import (
    RankingEngine,
    RankingWeights,
    haversine_distance_km,
)


def test_ranking_weights_sum_validation():
    # Valid default weights
    weights = RankingWeights()
    assert (
        weights.interest_match
        + weights.time_fit
        + weights.budget_fit
        + weights.distance_fit
        + weights.rating_quality
        + weights.accessibility_fit
    ) == Decimal("1.0")

    # Invalid weights that don't sum to 1.0 must raise ValueError
    with pytest.raises(ValueError) as exc_info:
        RankingWeights(
            interest_match=Decimal("0.5"),
            time_fit=Decimal("0.5"),
            budget_fit=Decimal("0.5"),
        )
    assert "must sum exactly to 1.0" in str(exc_info.value)


def test_interest_fit_scoring():
    engine = RankingEngine()
    # 2 out of 3 match: 66.7
    score = engine.score_interest_fit(
        traveler_interests=["food", "architecture", "history"],
        experience_tags=["food", "history", "walking tour"],
    )
    assert score.quantize(Decimal("0.1")) == Decimal("66.7")

    # Empty interests gives neutral 50.0
    neutral = engine.score_interest_fit(traveler_interests=[], experience_tags=["food"])
    assert neutral == Decimal("50.0")

    # Zero overlap
    zero = engine.score_interest_fit(
        traveler_interests=["surfing"], experience_tags=["cooking", "museum"]
    )
    assert zero == Decimal("0.0")


def test_time_fit_piecewise():
    engine = RankingEngine()
    # Available = 120 mins
    # Sweet spot (30% - 80% = 36 to 96 mins)
    assert engine.score_time_fit(60, 120) == Decimal("100.0")
    assert engine.score_time_fit(90, 120) == Decimal("100.0")

    # Duration > available_minutes (150 > 120): sharp penalty
    over_score = engine.score_time_fit(150, 120)
    assert over_score == Decimal("0.0")

    # Short duration (< 30% of 120 = < 36 mins): partial credit between 40 and 100
    short_score = engine.score_time_fit(18, 120)
    assert Decimal("40.0") <= short_score < Decimal("100.0")


def test_budget_fit():
    engine = RankingEngine()
    # Free item fits perfectly
    assert engine.score_budget_fit(
        price_min=Decimal("0.0"),
        price_max=Decimal("0.0"),
        remaining_budget=Decimal("50.0"),
    ) == Decimal("100.0")

    # Price > remaining budget is unaffordable -> 0.0
    assert engine.score_budget_fit(
        price_min=Decimal("80.0"),
        price_max=Decimal("120.0"),
        remaining_budget=Decimal("50.0"),
    ) == Decimal("0.0")

    # Within preferred budget range
    assert engine.score_budget_fit(
        price_min=Decimal("20.0"),
        price_max=Decimal("40.0"),
        remaining_budget=Decimal("100.0"),
        preferred_min=Decimal("10.0"),
        preferred_max=Decimal("50.0"),
    ) == Decimal("100.0")


def test_bayesian_quality_ranking_critical_requirement():
    """
    TRD Requirement:
    A 5.0 rating with only 2 reviews must NOT outrank a 4.6 rating with 200 reviews.
    """
    engine = RankingEngine(bayesian_prior_mean=Decimal("4.0"), bayesian_confidence_c=Decimal("15.0"))

    score_few_reviews = engine.score_quality_fit(
        rating_avg=Decimal("5.0"),
        rating_count=2,
    )
    score_many_reviews = engine.score_quality_fit(
        rating_avg=Decimal("4.6"),
        rating_count=200,
    )

    # The verified 4.6 with 200 reviews must beat the unverified 5.0 with 2 reviews!
    assert score_many_reviews > score_few_reviews
    assert score_many_reviews > Decimal("90.0")


def test_distance_fit_and_round_trip():
    # Distance between two nearby coordinates in Tokyo (~1.2 km)
    lat1, lng1 = 35.6586, 139.7454
    lat2, lng2 = 35.6686, 139.7554
    dist = haversine_distance_km(lat1, lng1, lat2, lng2)
    assert 1.0 < dist < 2.0

    engine = RankingEngine()
    # Round trip walk (~28 mins) + 60 min activity = ~88 mins. Available = 120 mins -> fits!
    score_fits, _, walk_mins = engine.score_distance_fit(
        traveler_lat=lat1,
        traveler_lng=lng1,
        exp_lat=lat2,
        exp_lng=lng2,
        duration_minutes=60,
        available_minutes=120,
    )
    assert score_fits > Decimal("70.0")

    # If available is only 30 mins, cannot complete round trip + activity -> decays to 0
    score_unreachable, _, _ = engine.score_distance_fit(
        traveler_lat=lat1,
        traveler_lng=lng1,
        exp_lat=lat2,
        exp_lng=lng2,
        duration_minutes=60,
        available_minutes=30,
    )
    assert score_unreachable == Decimal("0.0")


def test_accessibility_and_group_capacity():
    engine = RankingEngine()
    # Group size 6 exceeds venue capacity 4 -> 0.0
    score = engine.score_accessibility_fit(
        traveler_needs=[],
        experience_tags=[],
        group_size=6,
        capacity=4,
    )
    assert score == Decimal("0.0")

    # Group size 3 within capacity 4
    score_ok = engine.score_accessibility_fit(
        traveler_needs=["wheelchair"],
        experience_tags=["wheelchair", "step-free"],
        group_size=3,
        capacity=4,
    )
    assert score_ok == Decimal("100.0")


def test_capacity_modifier_for_shopping_only():
    engine = RankingEngine()
    # Culture category: unaffected even if pack is 100% full
    assert engine.calculate_capacity_modifier(
        category="culture",
        max_capacity_kg=Decimal("15.0"),
        current_weight_kg=Decimal("15.0"),
    ) == Decimal("1.0")

    # Market category with pack 90% full (only 10% remaining capacity < 30%)
    mod = engine.calculate_capacity_modifier(
        category="market",
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("9.0"),  # 1.0kg remaining = 10%
    )
    # Ratio = 10% / 30% = 0.333. Mod = 0.5 + 0.5*0.333 = ~0.67
    assert Decimal("0.5") <= mod < Decimal("1.0")

    # Market category with plenty of capacity (50% remaining)
    assert engine.calculate_capacity_modifier(
        category="market",
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("5.0"),
    ) == Decimal("1.0")


def test_opening_hours_pre_filter():
    engine = RankingEngine()
    # Open on Wednesday 10:00 to 18:00
    opening = {
        "wed": {"open": "10:00", "close": "18:00"},
        "thu": None,
    }
    # 2026-09-09 is a Wednesday! (weekday = 2 = 'wed')
    time_during_open = datetime(2026, 9, 9, 14, 0, 0)
    assert engine.is_open_now(opening, time_during_open) is True

    time_before_open = datetime(2026, 9, 9, 8, 0, 0)
    assert engine.is_open_now(opening, time_before_open) is False

    # Thursday is explicitly None (closed)
    thursday_time = datetime(2026, 9, 10, 14, 0, 0)
    assert engine.is_open_now(opening, thursday_time) is False


def test_master_ranking_sort_order():
    engine = RankingEngine()

    traveler = TravelerProfileBase(
        display_name="Elena",
        traveler_type="solo",
        interests=["street food", "ramen"],
        preferred_budget_min=Decimal("10.0"),
        preferred_budget_max=Decimal("50.0"),
        liquid_cash=Decimal("500.0"),
        max_carry_capacity_kg=Decimal("15.0"),
        current_carried_weight_kg=Decimal("5.0"),
    )

    context = LiveContext(
        lat=35.6586,
        lng=139.7454,
        available_minutes=120,
        remaining_budget=Decimal("50.0"),
        group_size=1,
        current_time=datetime(2026, 9, 9, 12, 30, 0),
    )

    exp_high_match = Experience(
        id=uuid4(),
        title="Artisan Ramen Masterclass",
        category="food",
        tags=["ramen", "street food"],
        price_min=Decimal("25.0"),
        price_max=Decimal("35.0"),
        duration_minutes=60,
        lat=35.6600,
        lng=139.7470,
        city="Tokyo",
        country="Japan",
        rating_avg=Decimal("4.9"),
        rating_count=180,
    )

    exp_low_match = Experience(
        id=uuid4(),
        title="Extreme Scuba Expedition",
        category="outdoor",
        tags=["diving", "scuba"],
        price_min=Decimal("200.0"),  # Way above remaining budget
        price_max=Decimal("300.0"),
        duration_minutes=240,       # Exceeds available time
        lat=35.7500,
        lng=139.8500,
        city="Tokyo",
        country="Japan",
        rating_avg=Decimal("3.5"),
        rating_count=5,
    )

    ranked = engine.rank([exp_low_match, exp_high_match], traveler, context)

    assert len(ranked) == 2
    # The high match ramen experience must be ranked #1
    assert ranked[0].experience.id == exp_high_match.id
    assert ranked[0].fit_score > ranked[1].fit_score
    assert ranked[0].fit_score >= Decimal("80.0")
    assert "ramen" in ranked[0].explanation.lower() or "interests" in ranked[0].explanation.lower() or "schedule" in ranked[0].explanation.lower()
