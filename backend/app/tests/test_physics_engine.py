"""
Tests for CarryingCapacityEngine (physics_engine.py)
Validates physical invariants, boundary limits, and threshold classifications.
"""
from decimal import Decimal
import pytest

from app.services.physics_engine import (
    CarryingCapacityEngine,
    CapacityValidationError,
    CarryingImpactResult,
)


def test_carrying_capacity_normal_fit():
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("15.0"),
        current_weight_kg=Decimal("8.0"),
        item_weight_kg=Decimal("2.0"),
    )
    assert isinstance(result, CarryingImpactResult)
    assert result.remaining_before_kg == Decimal("7.0")
    assert result.remaining_after_kg == Decimal("5.0")
    assert result.fits is True
    # (10 / 15) * 100 = 66.7%
    assert result.percent_capacity_used_after == Decimal("66.7")
    assert result.weight_status == "comfortable"


def test_carrying_capacity_near_limit():
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("7.0"),
        item_weight_kg=Decimal("2.0"),
    )
    assert result.fits is True
    # 9.0 / 10.0 = 90.0%
    assert result.percent_capacity_used_after == Decimal("90.0")
    assert result.weight_status == "near_limit"


def test_carrying_capacity_over_limit():
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("8.0"),
        item_weight_kg=Decimal("3.0"),
    )
    assert result.fits is False
    assert result.remaining_after_kg == Decimal("-1.0")
    assert result.percent_capacity_used_after == Decimal("110.0")
    assert result.weight_status == "over_limit"


def test_boundary_exact_comfortable_threshold():
    # Exactly 80% should be 'comfortable'
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("5.0"),
        item_weight_kg=Decimal("3.0"),
        comfortable_threshold_pct=Decimal("80.0"),
    )
    assert result.percent_capacity_used_after == Decimal("80.0")
    assert result.weight_status == "comfortable"


def test_boundary_exact_near_limit_threshold():
    # Exactly 100% should be 'near_limit'
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("7.0"),
        item_weight_kg=Decimal("3.0"),
        near_limit_threshold_pct=Decimal("100.0"),
    )
    assert result.percent_capacity_used_after == Decimal("100.0")
    assert result.weight_status == "near_limit"
    assert result.fits is True


def test_boundary_item_weight_zero():
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("5.0"),
        item_weight_kg=Decimal("0.0"),
    )
    assert result.remaining_after_kg == Decimal("5.0")
    assert result.fits is True


def test_boundary_current_weight_equals_max_capacity():
    # Pack is already full
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("10.0"),
        item_weight_kg=Decimal("0.5"),
    )
    assert result.remaining_before_kg == Decimal("0.0")
    assert result.remaining_after_kg == Decimal("-0.5")
    assert result.fits is False
    assert result.weight_status == "over_limit"


def test_validation_error_on_preexisting_overload():
    # If starting weight already exceeds max capacity and allow_overloaded_state is False
    with pytest.raises(CapacityValidationError) as exc_info:
        CarryingCapacityEngine.calculate(
            max_capacity_kg=Decimal("10.0"),
            current_weight_kg=Decimal("12.0"),
            item_weight_kg=Decimal("1.0"),
            allow_overloaded_state=False,
        )
    assert "exceeds maximum capacity" in str(exc_info.value)


def test_allow_overloaded_state_bypasses_initial_check():
    # When allow_overloaded_state is True, it calculates without raising
    result = CarryingCapacityEngine.calculate(
        max_capacity_kg=Decimal("10.0"),
        current_weight_kg=Decimal("12.0"),
        item_weight_kg=Decimal("1.0"),
        allow_overloaded_state=True,
    )
    assert result.fits is False
    assert result.weight_status == "over_limit"


def test_negative_input_validation():
    with pytest.raises(CapacityValidationError):
        CarryingCapacityEngine.calculate(
            max_capacity_kg=Decimal("-5.0"),
            current_weight_kg=Decimal("0.0"),
            item_weight_kg=Decimal("1.0"),
        )
