"""
app/services/runway_calculator.py — Cash Runway Calculator
Pure Python / Pydantic service for financial runway impact analysis.
No framework or database imports allowed.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RunwayImpactResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    liquid_cash: Decimal
    average_daily_spend: Decimal
    remaining_travel_days: int
    item_cash_price: Decimal
    barter_value: Optional[Decimal] = None
    minimum_emergency_reserve: Decimal = Decimal("0.0")

    runway_days_current: Optional[Decimal] = None
    runway_days_after_cash_purchase: Optional[Decimal] = None
    runway_days_after_barter: Optional[Decimal] = None
    days_lost: Decimal = Decimal("0.0")
    days_preserved_via_barter: Decimal = Decimal("0.0")
    can_afford_item: bool
    emergency_reserve_preserved: bool
    is_infinite_runway: bool = False
    projection_note: str = (
        "Projection assumes constant average daily spend and does not account for "
        "unexpected travel emergencies or price fluctuations; it is not a financial guarantee."
    )


class CashRunwayCalculator:
    @staticmethod
    def calculate(
        liquid_cash: Decimal,
        average_daily_spend: Decimal,
        remaining_travel_days: int,
        item_cash_price: Decimal,
        barter_value: Optional[Decimal] = None,
        minimum_emergency_reserve: Decimal = Decimal("0"),
    ) -> RunwayImpactResult:
        """
        Calculate runway impact of purchasing an item with cash vs bartering.

        Guards against negative values and handles zero average daily spend cleanly.
        """
        if liquid_cash < Decimal("0"):
            raise ValueError("liquid_cash cannot be negative.")
        if average_daily_spend < Decimal("0"):
            raise ValueError("average_daily_spend cannot be negative.")
        if remaining_travel_days < 0:
            raise ValueError("remaining_travel_days cannot be negative.")
        if item_cash_price < Decimal("0"):
            raise ValueError("item_cash_price cannot be negative.")
        if minimum_emergency_reserve < Decimal("0"):
            raise ValueError("minimum_emergency_reserve cannot be negative.")
        if barter_value is not None and barter_value < Decimal("0"):
            raise ValueError("barter_value cannot be negative.")

        can_afford_item = (liquid_cash - item_cash_price) >= minimum_emergency_reserve

        # Zero spend guard: infinite / undefined runway
        if average_daily_spend == Decimal("0"):
            has_barter = barter_value is not None and barter_value > Decimal("0")
            return RunwayImpactResult(
                liquid_cash=liquid_cash,
                average_daily_spend=average_daily_spend,
                remaining_travel_days=remaining_travel_days,
                item_cash_price=item_cash_price,
                barter_value=barter_value,
                minimum_emergency_reserve=minimum_emergency_reserve,
                runway_days_current=None,
                runway_days_after_cash_purchase=None,
                runway_days_after_barter=None,
                days_lost=Decimal("0.0"),
                days_preserved_via_barter=Decimal("0.0"),
                can_afford_item=can_afford_item,
                emergency_reserve_preserved=True if has_barter else can_afford_item,
                is_infinite_runway=True,
                projection_note=(
                    "Average daily spend is zero; runway is indefinite. "
                    "Projection assumes constant conditions and is not a financial guarantee."
                ),
            )

        # Standard calculation with positive daily spend
        runway_days_current = (liquid_cash / average_daily_spend).quantize(
            Decimal("0.1"), rounding=ROUND_HALF_UP
        )

        remaining_cash_after = liquid_cash - item_cash_price
        if remaining_cash_after >= Decimal("0"):
            runway_days_after_cash = (remaining_cash_after / average_daily_spend).quantize(
                Decimal("0.1"), rounding=ROUND_HALF_UP
            )
        else:
            runway_days_after_cash = Decimal("0.0")

        days_lost = (item_cash_price / average_daily_spend).quantize(
            Decimal("0.1"), rounding=ROUND_HALF_UP
        )

        # Barter logic: avoids cash outlay
        has_barter = barter_value is not None and barter_value > Decimal("0")
        if has_barter:
            runway_days_after_barter = runway_days_current
            days_preserved_via_barter = days_lost
            emergency_reserve_preserved = True
        else:
            runway_days_after_barter = runway_days_after_cash
            days_preserved_via_barter = Decimal("0.0")
            emergency_reserve_preserved = can_afford_item

        return RunwayImpactResult(
            liquid_cash=liquid_cash,
            average_daily_spend=average_daily_spend,
            remaining_travel_days=remaining_travel_days,
            item_cash_price=item_cash_price,
            barter_value=barter_value,
            minimum_emergency_reserve=minimum_emergency_reserve,
            runway_days_current=runway_days_current,
            runway_days_after_cash_purchase=runway_days_after_cash,
            runway_days_after_barter=runway_days_after_barter,
            days_lost=days_lost,
            days_preserved_via_barter=days_preserved_via_barter,
            can_afford_item=can_afford_item,
            emergency_reserve_preserved=emergency_reserve_preserved,
            is_infinite_runway=False,
        )
