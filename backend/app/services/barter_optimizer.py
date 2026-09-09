"""
app/services/barter_optimizer.py — Barter Optimizer
Bounded, discretized knapsack optimizer for BazaarLink asset packaging.
Pure Python / Pydantic service. No framework or database imports allowed.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class BarterPackageItem(BaseModel):
    model_config = ConfigDict(frozen=True)

    item_id: Optional[UUID] = None
    name: str
    quantity: Decimal
    unit_value: Decimal
    total_value: Decimal
    weight_kg: Decimal


class BarterPackage(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[BarterPackageItem]
    asset_count: int
    total_value_offered: Decimal
    value_ratio: Decimal
    weight_freed_kg: Decimal
    remaining_capacity_after_kg: Decimal
    acceptable: bool
    explanation: str


class BarterPackagesResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    target_item_value: Decimal
    target_item_weight_kg: Decimal
    remaining_backpack_capacity_kg: Decimal
    packages: list[BarterPackage]
    total_tradeable_inventory_value: Decimal
    complexity_note: str = (
        "Heuristic bounded knapsack solver; explores combinations up to max_assets_per_package "
        "and is not guaranteed to find a global optimum across continuous fractions."
    )


class BarterOptimizer:
    @staticmethod
    def find_packages(
        target_item_value: Decimal,
        target_item_weight_kg: Decimal,
        remaining_backpack_capacity_kg: Decimal,
        inventory: list[Any],  # Accepts InventoryItem models or dicts with compatible fields
        max_assets_per_package: int = 4,
        minimum_value_ratio: Decimal = Decimal("0.85"),
        max_packages_to_return: int = 5,
    ) -> BarterPackagesResult:
        """
        Find candidate asset barter packages from inventory to acquire a target item.
        """
        if target_item_value < Decimal("0"):
            raise ValueError("target_item_value cannot be negative.")
        if target_item_weight_kg < Decimal("0"):
            raise ValueError("target_item_weight_kg cannot be negative.")
        if max_assets_per_package < 1:
            raise ValueError("max_assets_per_package must be at least 1.")
        if minimum_value_ratio < Decimal("0"):
            raise ValueError("minimum_value_ratio cannot be negative.")

        # 1. Filter to tradeable items with available > minimum_retained
        eligible_items = []
        total_inv_value = Decimal("0.0")

        for item in inventory:
            # Handle Pydantic model or dict
            is_tradeable = getattr(item, "tradeable", None)
            if is_tradeable is None:
                is_tradeable = getattr(item, "willing_to_trade", None)
            if is_tradeable is None and isinstance(item, dict):
                is_tradeable = item.get("tradeable", item.get("willing_to_trade", True))

            if not is_tradeable:
                continue

            avail = getattr(item, "available_quantity", None) or getattr(item, "quantity", None)
            if avail is None and isinstance(item, dict):
                avail = item.get("available_quantity", item.get("quantity", Decimal("1")))
            avail = Decimal(str(avail))

            retained = getattr(item, "minimum_retained_quantity", None)
            if retained is None and isinstance(item, dict):
                retained = item.get("minimum_retained_quantity", Decimal("0"))
            retained = Decimal(str(retained))

            usable_qty = avail - retained
            if usable_qty <= Decimal("0"):
                continue

            unit_val = getattr(item, "estimated_barter_value", None) or getattr(item, "estimated_value", None)
            if unit_val is None and isinstance(item, dict):
                unit_val = item.get("estimated_barter_value", item.get("estimated_value", Decimal("0")))
            unit_val = Decimal(str(unit_val))

            weight = getattr(item, "weight_kg", None)
            if weight is None and isinstance(item, dict):
                weight = item.get("weight_kg", Decimal("0"))
            weight = Decimal(str(weight))

            name = (
                getattr(item, "name", None)
                or getattr(item, "item_name", None)
                or (item.get("name") or item.get("item_name") if isinstance(item, dict) else "Item")
            )
            item_id = getattr(item, "id", None) or (item.get("id") if isinstance(item, dict) else None)

            total_inv_value += (unit_val * usable_qty)

            eligible_items.append({
                "id": item_id,
                "name": name,
                "unit_value": unit_val,
                "weight_kg": weight,
                "usable_qty": usable_qty,
            })

        min_required_val = target_item_value * minimum_value_ratio

        # Early return if empty or total inventory value is below required ratio
        if not eligible_items or (target_item_value > Decimal("0") and total_inv_value < min_required_val):
            return BarterPackagesResult(
                target_item_value=target_item_value,
                target_item_weight_kg=target_item_weight_kg,
                remaining_backpack_capacity_kg=remaining_backpack_capacity_kg,
                packages=[],
                total_tradeable_inventory_value=total_inv_value,
            )

        # 2. Expand items into discrete tradeable units (up to max_assets_per_package count)
        flat_units = []
        for it in eligible_items:
            # We can use at most max_assets_per_package of this single item
            units_to_take = min(int(it["usable_qty"]), max_assets_per_package)
            for _ in range(units_to_take):
                flat_units.append({
                    "id": it["id"],
                    "name": it["name"],
                    "unit_value": it["unit_value"],
                    "weight_kg": it["weight_kg"],
                })

        candidate_packages: list[BarterPackage] = []
        seen_combinations = set()

        # Generate combinations of 1 to max_assets_per_package items
        # To keep combinatorial explosion bounded, limit search space
        from itertools import combinations

        for size in range(1, min(len(flat_units), max_assets_per_package) + 1):
            for combo in combinations(flat_units, size):
                # Count distinct or total assets
                # Check signature to avoid duplicate combinations of identical items
                combo_sig = tuple(sorted(f"{x['name']}:{x['unit_value']}:{x['weight_kg']}" for x in combo))
                if combo_sig in seen_combinations:
                    continue
                seen_combinations.add(combo_sig)

                # Group by item name to form package items
                grouped: dict[str, dict[str, Any]] = {}
                total_val = Decimal("0.0")
                weight_freed = Decimal("0.0")

                for u in combo:
                    k = f"{u['id']}_{u['name']}"
                    if k not in grouped:
                        grouped[k] = {
                            "item_id": u["id"],
                            "name": u["name"],
                            "quantity": Decimal("0"),
                            "unit_value": u["unit_value"],
                            "weight_kg": Decimal("0.0"),
                        }
                    grouped[k]["quantity"] += Decimal("1")
                    grouped[k]["weight_kg"] += u["weight_kg"]
                    total_val += u["unit_value"]
                    weight_freed += u["weight_kg"]

                if target_item_value > Decimal("0"):
                    val_ratio = (total_val / target_item_value).quantize(
                        Decimal("0.01"), rounding=ROUND_HALF_UP
                    )
                else:
                    val_ratio = Decimal("1.00")

                if val_ratio < minimum_value_ratio:
                    continue

                remaining_cap_after = (
                    remaining_backpack_capacity_kg + weight_freed - target_item_weight_kg
                )
                acceptable = (
                    remaining_cap_after >= Decimal("0") and val_ratio >= minimum_value_ratio
                )

                items_out = [
                    BarterPackageItem(
                        item_id=v["item_id"],
                        name=v["name"],
                        quantity=v["quantity"],
                        unit_value=v["unit_value"],
                        total_value=v["unit_value"] * v["quantity"],
                        weight_kg=v["weight_kg"],
                    )
                    for v in grouped.values()
                ]

                # Generate brief explanation
                item_names = ", ".join(f"{it.quantity}x {it.name}" for it in items_out)
                if val_ratio >= Decimal("1.0"):
                    explanation = f"Offers {item_names} matching {int(val_ratio * 100)}% of target value, freeing {weight_freed:.1f}kg."
                else:
                    explanation = f"Offers {item_names} at {int(val_ratio * 100)}% value ratio (within acceptable {int(minimum_value_ratio * 100)}% margin)."

                candidate_packages.append(
                    BarterPackage(
                        items=items_out,
                        asset_count=len(combo),
                        total_value_offered=total_val,
                        value_ratio=val_ratio,
                        weight_freed_kg=weight_freed,
                        remaining_capacity_after_kg=remaining_cap_after,
                        acceptable=acceptable,
                        explanation=explanation,
                    )
                )

        # 3. Tie-break ordering:
        # 1st: fewest assets first (asset_count ASC)
        # 2nd: most weight freed (weight_freed_kg DESC)
        # 3rd: closest value ratio to 1.0 (abs(val_ratio - 1.0) ASC)
        candidate_packages.sort(
            key=lambda p: (
                p.asset_count,
                -p.weight_freed_kg,
                abs(p.value_ratio - Decimal("1.0")),
            )
        )

        return BarterPackagesResult(
            target_item_value=target_item_value,
            target_item_weight_kg=target_item_weight_kg,
            remaining_backpack_capacity_kg=remaining_backpack_capacity_kg,
            packages=candidate_packages[:max_packages_to_return],
            total_tradeable_inventory_value=total_inv_value,
        )
