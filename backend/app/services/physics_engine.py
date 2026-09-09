"""
app/services/physics_engine.py — Carrying Capacity Engine
Pure Python / Pydantic service for pack weight calculations.
No framework or database imports allowed.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class CapacityValidationError(ValueError):
    """Raised when backpack weight violates physical invariants before calculation."""
    pass


class CarryingImpactResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    max_capacity_kg: Decimal
    current_weight_kg: Decimal
    item_weight_kg: Decimal
    remaining_before_kg: Decimal
    remaining_after_kg: Decimal
    fits: bool
    percent_capacity_used_after: Decimal
    weight_status: Literal["comfortable", "near_limit", "over_limit"]


class CarryingCapacityEngine:
    @staticmethod
    def calculate(
        max_capacity_kg: Decimal,
        current_weight_kg: Decimal,
        item_weight_kg: Decimal,
        allow_overloaded_state: bool = False,
        comfortable_threshold_pct: Decimal = Decimal("80.0"),
        near_limit_threshold_pct: Decimal = Decimal("100.0"),
    ) -> CarryingImpactResult:
        """
        Calculate carrying impact of adding an item to the traveler's pack.

        Raises CapacityValidationError if current_weight_kg > max_capacity_kg
        and allow_overloaded_state is False.
        """
        # Invariant check before calculation
        if current_weight_kg > max_capacity_kg and not allow_overloaded_state:
            raise CapacityValidationError(
                f"Current pack weight ({current_weight_kg} kg) exceeds maximum capacity ({max_capacity_kg} kg)."
            )

        if max_capacity_kg < Decimal("0"):
            raise CapacityValidationError("Maximum capacity cannot be negative.")
        if current_weight_kg < Decimal("0"):
            raise CapacityValidationError("Current weight cannot be negative.")
        if item_weight_kg < Decimal("0"):
            raise CapacityValidationError("Item weight cannot be negative.")

        remaining_before_kg = max_capacity_kg - current_weight_kg
        weight_after = current_weight_kg + item_weight_kg
        remaining_after_kg = max_capacity_kg - weight_after

        fits = remaining_after_kg >= Decimal("0")

        # Guard division by zero if max_capacity is 0
        if max_capacity_kg == Decimal("0"):
            if weight_after == Decimal("0"):
                percent_capacity_used_after = Decimal("0.0")
            else:
                percent_capacity_used_after = Decimal("999.9")
        else:
            percent_capacity_used_after = (
                (weight_after / max_capacity_kg) * Decimal("100")
            ).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        # Status categorization against configurable thresholds
        if percent_capacity_used_after <= comfortable_threshold_pct:
            weight_status: Literal["comfortable", "near_limit", "over_limit"] = "comfortable"
        elif percent_capacity_used_after <= near_limit_threshold_pct:
            weight_status = "near_limit"
        else:
            weight_status = "over_limit"

        return CarryingImpactResult(
            max_capacity_kg=max_capacity_kg,
            current_weight_kg=current_weight_kg,
            item_weight_kg=item_weight_kg,
            remaining_before_kg=remaining_before_kg,
            remaining_after_kg=remaining_after_kg,
            fits=fits,
            percent_capacity_used_after=percent_capacity_used_after,
            weight_status=weight_status,
        )
