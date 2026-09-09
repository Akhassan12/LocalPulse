/**
 * components/bazaarlink/CarryingImpactCard.tsx
 * Visualizes backpack capacity impact before and after acquiring a market item.
 */
import React from 'react'
import { Backpack, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export interface CarryingImpactData {
  max_capacity_kg: number | string
  current_weight_kg: number | string
  item_weight_kg: number | string
  remaining_before_kg: number | string
  remaining_after_kg: number | string
  fits: boolean
  percent_capacity_used_after: number | string
  weight_status: 'comfortable' | 'near_limit' | 'over_limit'
}

interface CarryingImpactCardProps {
  data: CarryingImpactData
  className?: string
}

export const CarryingImpactCard: React.FC<CarryingImpactCardProps> = ({ data, className = '' }) => {
  const percentUsed = Math.min(100, Math.round(Number(data.percent_capacity_used_after) || 0))
  const isOver = data.weight_status === 'over_limit' || !data.fits
  const isNear = data.weight_status === 'near_limit'

  let statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-800'
  let barColor = 'bg-emerald-500'
  let statusText = 'Comfortable'
  let Icon = CheckCircle2

  if (isOver) {
    statusBg = 'bg-rose-50 border-rose-200 text-rose-800'
    barColor = 'bg-rose-500'
    statusText = 'Exceeds Pack Limit'
    Icon = XCircle
  } else if (isNear) {
    statusBg = 'bg-amber-50 border-amber-200 text-amber-800'
    barColor = 'bg-amber-500'
    statusText = 'Near Capacity Limit'
    Icon = AlertTriangle
  }

  const currentKg = Number(data.current_weight_kg).toFixed(1)
  const itemKg = Number(data.item_weight_kg).toFixed(2)
  const maxKg = Number(data.max_capacity_kg).toFixed(1)
  const remAfterKg = Number(data.remaining_after_kg).toFixed(1)

  return (
    <div className={`bg-white rounded-xl p-4 border border-[#0D1B2A]/10 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#0D1B2A] flex items-center gap-1.5">
          <Backpack className="w-4 h-4 text-[#C9A84C]" />
          Pack Carrying Impact
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusBg}`}>
          <Icon className="w-3 h-3" />
          {statusText}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[11px] text-[#1A2B3C]/70">
          <span>Pack Load</span>
          <span className="font-semibold text-[#0D1B2A]">{percentUsed}% ({Number(data.current_weight_kg) + Number(data.item_weight_kg)} / {maxKg} kg)</span>
        </div>
        <div className="w-full h-2.5 bg-[#0D1B2A]/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#0D1B2A]/5 text-center text-[11px]">
        <div className="p-1.5 rounded-lg bg-[#FAF5EB]">
          <span className="block text-[#1A2B3C]/60 text-[10px]">Item Weight</span>
          <span className="font-bold text-[#0D1B2A]">+{itemKg} kg</span>
        </div>
        <div className="p-1.5 rounded-lg bg-[#FAF5EB]">
          <span className="block text-[#1A2B3C]/60 text-[10px]">Remaining</span>
          <span className="font-bold text-[#0D1B2A]">{remAfterKg} kg</span>
        </div>
        <div className="p-1.5 rounded-lg bg-[#FAF5EB]">
          <span className="block text-[#1A2B3C]/60 text-[10px]">Pack Fits?</span>
          <span className={`font-bold ${data.fits ? 'text-emerald-700' : 'text-rose-600'}`}>
            {data.fits ? 'Yes' : 'Overweight'}
          </span>
        </div>
      </div>
    </div>
  )
}
export default CarryingImpactCard
