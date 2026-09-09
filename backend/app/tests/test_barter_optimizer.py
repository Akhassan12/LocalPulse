"""
Tests for BarterOptimizer (barter_optimizer.py)
Validates knapsack package finding, item tradeability, quantity constraints,
value ratio boundaries, and tie-breaking criteria.
"""
from decimal import Decimal
import pytest

from app.services.barter_optimizer import (
    BarterOptimizer,
    BarterPackagesResult,
)


def test_empty_inventory_returns_empty_packages():
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("1.5"),
        remaining_backpack_capacity_kg=Decimal("5.0"),
        inventory=[],
    )
    assert isinstance(result, BarterPackagesResult)
    assert len(result.packages) == 0
    assert result.total_tradeable_inventory_value == Decimal("0.0")


def test_inventory_below_minimum_ratio_returns_empty():
    # Inventory only has $20 of value, target item is $100 (needs at least $85 with 0.85 ratio)
    inventory = [
        {
            "name": "Keychain",
            "estimated_barter_value": Decimal("10.00"),
            "weight_kg": Decimal("0.1"),
            "available_quantity": Decimal("2.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        }
    ]
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("1.0"),
        remaining_backpack_capacity_kg=Decimal("5.0"),
        inventory=inventory,
    )
    assert len(result.packages) == 0
    assert result.total_tradeable_inventory_value == Decimal("20.00")


def test_single_item_exact_match():
    inventory = [
        {
            "name": "Vintage Sunglasses",
            "estimated_barter_value": Decimal("100.00"),
            "weight_kg": Decimal("0.2"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        }
    ]
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("0.5"),
        remaining_backpack_capacity_kg=Decimal("3.0"),
        inventory=inventory,
    )
    assert len(result.packages) == 1
    pkg = result.packages[0]
    assert pkg.asset_count == 1
    assert pkg.value_ratio == Decimal("1.00")
    assert pkg.weight_freed_kg == Decimal("0.2")
    # remaining_capacity_after = 3.0 + 0.2 - 0.5 = 2.7
    assert pkg.remaining_capacity_after_kg == Decimal("2.7")
    assert pkg.acceptable is True


def test_respects_minimum_retained_quantity():
    # 2 available, but 2 retained -> 0 usable!
    inventory = [
        {
            "name": "Essential Power Bank",
            "estimated_barter_value": Decimal("50.00"),
            "weight_kg": Decimal("0.4"),
            "available_quantity": Decimal("2.0"),
            "minimum_retained_quantity": Decimal("2.0"),
            "tradeable": True,
        }
    ]
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("50.00"),
        target_item_weight_kg=Decimal("0.5"),
        remaining_backpack_capacity_kg=Decimal("3.0"),
        inventory=inventory,
    )
    assert len(result.packages) == 0


def test_non_tradeable_items_ignored():
    inventory = [
        {
            "name": "Passport",
            "estimated_barter_value": Decimal("1000.00"),
            "weight_kg": Decimal("0.1"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": False,
        }
    ]
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("0.5"),
        remaining_backpack_capacity_kg=Decimal("3.0"),
        inventory=inventory,
    )
    assert len(result.packages) == 0


def test_tie_break_fewest_assets_then_most_weight_freed():
    # Item A: 1 item worth $100, weight 0.5kg
    # Item B + C: 2 items each $50, combined weight 2.0kg
    inventory = [
        {
            "name": "Heavy Jacket",
            "estimated_barter_value": Decimal("50.00"),
            "weight_kg": Decimal("1.5"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        },
        {
            "name": "Heavy Boots",
            "estimated_barter_value": Decimal("50.00"),
            "weight_kg": Decimal("1.5"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        },
        {
            "name": "Compact Watch",
            "estimated_barter_value": Decimal("100.00"),
            "weight_kg": Decimal("0.2"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        },
    ]

    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("1.0"),
        remaining_backpack_capacity_kg=Decimal("5.0"),
        inventory=inventory,
        max_assets_per_package=4,
    )

    assert len(result.packages) >= 2
    # The first package should have fewer assets (1 asset: Compact Watch)
    assert result.packages[0].asset_count == 1
    assert result.packages[0].items[0].name == "Compact Watch"


def test_capacity_acceptance_check():
    # If remaining pack capacity after barter < 0, acceptable is False
    inventory = [
        {
            "name": "Scarf",
            "estimated_barter_value": Decimal("100.00"),
            "weight_kg": Decimal("0.1"),
            "available_quantity": Decimal("1.0"),
            "minimum_retained_quantity": Decimal("0.0"),
            "tradeable": True,
        }
    ]
    # remaining capacity is 0.5kg, target weighs 3.0kg, scarf frees 0.1kg -> 0.5 + 0.1 - 3.0 = -2.4kg
    result = BarterOptimizer.find_packages(
        target_item_value=Decimal("100.00"),
        target_item_weight_kg=Decimal("3.0"),
        remaining_backpack_capacity_kg=Decimal("0.5"),
        inventory=inventory,
    )
    assert len(result.packages) == 1
    assert result.packages[0].acceptable is False
    assert result.packages[0].remaining_capacity_after_kg == Decimal("-2.4")
