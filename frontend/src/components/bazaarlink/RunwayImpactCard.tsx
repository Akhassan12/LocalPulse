/**
 * components/bazaarlink/RunwayImpactCard.tsx
 * Visualizes financial runway impact (days lost vs preserved) for a market item.
 */
import React from 'react'
import { Wallet, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react'

export interface RunwayImpactData {
  runway_days_before: number | string
  runway_days_after: number | string
  days_lost: number | string
  can_afford_item: boolean
  emergency_reserve_preserved: boolean
  liquid_cash_after: number | string
  projection_note: string
}

interface RunwayImpactCardProps {
  data: RunwayImpactData
  barterValueAvailable?: number
  className?: string
}

export const RunwayImpactCard: React.FC<RunwayImpactCardProps> = ({
  data,
  barterValueAvailable = 0,
  className = '',
}) => {
  const daysBefore = Number(data.runway_days_before).toFixed(1)
  const daysAfter = Number(data.runway_days_after).toFixed(1)
  const daysLost = Number(data.days_lost).toFixed(1)
  const cashAfter = Number(data.liquid_cash_after).toFixed(0)

  return (
    <div className={`bg-white rounded-xl p-4 border border-[#0D1B2A]/10 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#0D1B2A] flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-[#C9A84C]" />
          Cash Runway Impact
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
            data.emergency_reserve_preserved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {data.emergency_reserve_preserved ? (
            <>
              <ShieldCheck className="w-3 h-3" />
              Reserve Safe
            </>
          ) : (
            <>
              <ShieldAlert className="w-3 h-3" />
              Reserve Breached
            </>
          )}
        </span>
      </div>

      {/* Runway Numbers Comparison */}
      <div className="flex items-center justify-between bg-[#FAF5EB] p-3 rounded-lg mb-3">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#1A2B3C]/60 font-medium">Runway Before</span>
          <span className="text-lg font-bold text-[#0D1B2A]">{daysBefore} <span className="text-xs font-normal">days</span></span>
        </div>
        <div className="text-center px-2">
          <span className="text-xs font-bold text-rose-600">
            -{daysLost} {Number(daysLost) === 1 ? 'day' : 'days'}
          </span>
          <span className="block text-[9px] text-[#1A2B3C]/50">cash spend</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wider text-[#1A2B3C]/60 font-medium">Runway After</span>
          <span className="text-lg font-bold text-[#0D1B2A]">{daysAfter} <span className="text-xs font-normal">days</span></span>
        </div>
      </div>

      {/* Barter opportunity callout */}
      {barterValueAvailable > 0 && (
        <div className="mb-3 p-2 bg-[#E0EFC7]/40 border border-[#2D6A4F]/20 rounded-lg flex items-center gap-2 text-xs text-[#2D6A4F]">
          <Sparkles className="w-4 h-4 flex-shrink-0 text-[#2D6A4F]" />
          <span>
            Bartering up to <strong>${barterValueAvailable.toFixed(0)}</strong> can preserve your travel runway!
          </span>
        </div>
      )}

      {/* Cash after & Disclaimer */}
      <div className="space-y-1.5 text-[10px] text-[#1A2B3C]/70">
        <div className="flex justify-between font-medium">
          <span>Remaining Cash Reserve</span>
          <span className="font-bold text-[#0D1B2A]">${cashAfter}</span>
        </div>
        <p className="italic text-[9px] text-[#1A2B3C]/50 leading-relaxed">
          {data.projection_note}
        </p>
      </div>
    </div>
  )
}
export default RunwayImpactCard
