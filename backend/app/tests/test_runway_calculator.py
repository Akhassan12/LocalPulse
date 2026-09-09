"""
Tests for CashRunwayCalculator (runway_calculator.py)
Validates runway projection, cash spend impact, barter preservation, and reserve protections.
"""
from decimal import Decimal
import pytest

from app.services.runway_calculator import (
    CashRunwayCalculator,
    RunwayImpactResult,
)


def test_normal_cash_purchase():
    # $1000 cash, $50/day spend -> 20 days runway.
    # Buy $200 item -> $800 cash left -> 16 days runway. Days lost = 4.
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("1000.00"),
        average_daily_spend=Decimal("50.00"),
        remaining_travel_days=15,
        item_cash_price=Decimal("200.00"),
        minimum_emergency_reserve=Decimal("100.00"),
    )
    assert isinstance(result, RunwayImpactResult)
    assert result.runway_days_current == Decimal("20.0")
    assert result.runway_days_after_cash_purchase == Decimal("16.0")
    assert result.days_lost == Decimal("4.0")
    assert result.can_afford_item is True
    assert result.is_infinite_runway is False


def test_zero_spend_guard():
    # When spend is 0, runway is infinite/indefinite; should not raise ZeroDivisionError
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("500.00"),
        average_daily_spend=Decimal("0.00"),
        remaining_travel_days=10,
        item_cash_price=Decimal("100.00"),
    )
    assert result.is_infinite_runway is True
    assert result.runway_days_current is None
    assert result.runway_days_after_cash_purchase is None
    assert result.days_lost == Decimal("0.0")
    assert "indefinite" in result.projection_note.lower()


def test_barter_preserves_cash_and_runway():
    # $1000 cash, $50/day spend. Buy $200 item via barter.
    # Cash untouched -> runway stays 20 days, days preserved = 4.0
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("1000.00"),
        average_daily_spend=Decimal("50.00"),
        remaining_travel_days=15,
        item_cash_price=Decimal("200.00"),
        barter_value=Decimal("200.00"),
        minimum_emergency_reserve=Decimal("100.00"),
    )
    assert result.runway_days_after_barter == Decimal("20.0")
    assert result.days_preserved_via_barter == Decimal("4.0")
    assert result.emergency_reserve_preserved is True


def test_boundary_exact_exhaust_down_to_reserve():
    # $300 cash, $100 reserve, $200 item -> exact match to reserve
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("300.00"),
        average_daily_spend=Decimal("30.00"),
        remaining_travel_days=5,
        item_cash_price=Decimal("200.00"),
        minimum_emergency_reserve=Decimal("100.00"),
    )
    assert result.can_afford_item is True


def test_boundary_pushes_below_emergency_reserve():
    # $250 cash, $100 reserve, $200 item -> leaves $50 (< $100 reserve)
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("250.00"),
        average_daily_spend=Decimal("30.00"),
        remaining_travel_days=5,
        item_cash_price=Decimal("200.00"),
        minimum_emergency_reserve=Decimal("100.00"),
    )
    assert result.can_afford_item is False


def test_boundary_remaining_travel_days_zero():
    result = CashRunwayCalculator.calculate(
        liquid_cash=Decimal("500.00"),
        average_daily_spend=Decimal("50.00"),
        remaining_travel_days=0,
        item_cash_price=Decimal("50.00"),
    )
    assert result.remaining_travel_days == 0
    assert result.can_afford_item is True


def test_negative_input_guards():
    with pytest.raises(ValueError):
        CashRunwayCalculator.calculate(
            liquid_cash=Decimal("-10.00"),
            average_daily_spend=Decimal("50.00"),
            remaining_travel_days=5,
            item_cash_price=Decimal("10.00"),
        )

    with pytest.raises(ValueError):
        CashRunwayCalculator.calculate(
            liquid_cash=Decimal("100.00"),
            average_daily_spend=Decimal("50.00"),
            remaining_travel_days=5,
            item_cash_price=Decimal("-20.00"),
        )
