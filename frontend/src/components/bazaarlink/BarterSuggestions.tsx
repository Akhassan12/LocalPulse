/**
 * components/bazaarlink/BarterSuggestions.tsx
 * Lists optimized barter combinations from the traveler's inventory.
 */
import React, { useState } from 'react'
import { ArrowLeftRight, Check, Scale, Info, CheckCircle2 } from 'lucide-react'

export interface BarterPackageItem {
  item_id?: string | null
  name: string
  quantity: number | string
  unit_value: number | string
  total_value: number | string
  weight_kg: number | string
}

export interface BarterPackage {
  items: BarterPackageItem[]
  asset_count: number
  total_value_offered: number | string
  value_ratio: number | string
  weight_freed_kg: number | string
  remaining_capacity_after_kg: number | string
  acceptable: boolean
  explanation: string
}

export interface BarterPackagesResult {
  target_item_value: number | string
  target_item_weight_kg: number | string
  remaining_backpack_capacity_kg: number | string
  packages: BarterPackage[]
  total_tradeable_inventory_value: number | string
  complexity_note?: string
}

interface BarterSuggestionsProps {
  data: BarterPackagesResult
  onSelectPackage?: (pkg: BarterPackage) => void
  selectedPackageIndex?: number | null
  className?: string
}

export const BarterSuggestions: React.FC<BarterSuggestionsProps> = ({
  data,
  onSelectPackage,
  selectedPackageIndex: externalSelectedIndex = null,
  className = '',
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number | null>(0)
  const selectedIndex = externalSelectedIndex !== null ? externalSelectedIndex : internalSelectedIndex

  const handleSelect = (index: number, pkg: BarterPackage) => {
    setInternalSelectedIndex(index)
    if (onSelectPackage) {
      onSelectPackage(pkg)
    }
  }

  if (!data.packages || data.packages.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-4 border border-[#0D1B2A]/10 text-center ${className}`}>
        <ArrowLeftRight className="w-8 h-8 text-[#1A2B3C]/30 mx-auto mb-2" />
        <p className="text-xs font-semibold text-[#0D1B2A]">No Complete Trade Matches</p>
        <p className="text-[11px] text-[#1A2B3C]/60 mt-1">
          Your active tradeable items don’t reach the required value for this craft. You can offer a cash + barter split.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#0D1B2A] flex items-center gap-1.5">
          <ArrowLeftRight className="w-4 h-4 text-[#2D6A4F]" />
          Recommended Barter Combinations
        </span>
        <span className="text-[10px] text-[#2D6A4F] font-bold bg-[#E0EFC7] px-2 py-0.5 rounded-full">
          {data.packages.length} Option{data.packages.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2.5">
        {data.packages.map((pkg, idx) => {
          const isSelected = selectedIndex === idx
          const ratioPercent = Math.round(Number(pkg.value_ratio) * 100)
          const valueOffered = Number(pkg.total_value_offered).toFixed(0)
          const weightFreed = Number(pkg.weight_freed_kg).toFixed(2)

          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx, pkg)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#2D6A4F] bg-[#FAF5EB] shadow-sm ring-1 ring-[#2D6A4F]/30'
                  : 'border-[#0D1B2A]/10 bg-white hover:border-[#2D6A4F]/40'
              }`}
            >
              {/* Package Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0D1B2A]">
                      Combination #{idx + 1}
                    </span>
                    {pkg.acceptable && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        <Check className="w-2.5 h-2.5" /> Fair Trade
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#1A2B3C]/70 mt-0.5">{pkg.explanation}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[#2D6A4F]">${valueOffered}</span>
                  <span className="block text-[9px] text-[#1A2B3C]/50">({ratioPercent}% value)</span>
                </div>
              </div>

              {/* Items List in Package */}
              <div className="bg-white/80 rounded-lg p-2 border border-[#0D1B2A]/5 mb-2 space-y-1">
                {pkg.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#0D1B2A] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                      {Number(item.quantity) > 1 ? `${item.quantity}× ` : ''}
                      {item.name}
                    </span>
                    <span className="text-[#1A2B3C]/60 text-[10px]">
                      ${Number(item.total_value).toFixed(0)} ({Number(item.weight_kg).toFixed(2)} kg)
                    </span>
                  </div>
                ))}
              </div>

              {/* Package Footer Metrics */}
              <div className="flex items-center justify-between text-[10px] text-[#1A2B3C]/70 pt-1 border-t border-[#0D1B2A]/5">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-[#C9A84C]" />
                  Freed from pack: <strong className="text-[#0D1B2A]">-{weightFreed} kg</strong>
                </span>
                <span className="text-[#2D6A4F] font-semibold flex items-center gap-1">
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected Offer
                    </>
                  ) : (
                    'Tap to select'
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Heuristic Disclaimer */}
      {data.complexity_note && (
        <div className="flex items-start gap-1.5 text-[9px] text-[#1A2B3C]/50 italic px-1">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#1A2B3C]/40" />
          <span>{data.complexity_note}</span>
        </div>
      )}
    </div>
  )
}
export default BarterSuggestions
