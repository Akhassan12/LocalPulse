/**
 * components/discovery/FitScoreDial.tsx
 * High-visual circular fit score dial with animated arc and breakdown popover tooltip.
 */
import React, { useState } from 'react'
import { Info, Sparkles, Clock, DollarSign, MapPin, Star, ShieldCheck, Backpack } from 'lucide-react'

export interface FitBreakdownData {
  interest_score?: number | string
  time_score?: number | string
  budget_score?: number | string
  distance_score?: number | string
  quality_score?: number | string
  accessibility_score?: number | string
  capacity_modifier?: number | string
}

interface FitScoreDialProps {
  score: number | string
  breakdown?: FitBreakdownData
  size?: 'sm' | 'md' | 'lg'
  showBreakdown?: boolean
  className?: string
}

export const FitScoreDial: React.FC<FitScoreDialProps> = ({
  score,
  breakdown,
  size = 'md',
  showBreakdown = true,
  className = '',
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const numScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)))

  // Color mapping based on score
  let strokeColor = '#10B981' // Emerald for high match
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200'
  let label = 'Exceptional Match'
  if (numScore < 60) {
    strokeColor = '#F43F5E' // Rose
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200'
    label = 'Moderate Match'
  } else if (numScore < 80) {
    strokeColor = '#C9A84C' // Warm Brass
    badgeBg = 'bg-amber-50 text-amber-900 border-amber-200'
    label = 'Strong Match'
  }

  // Dimensions
  const dim = size === 'sm' ? 44 : size === 'lg' ? 76 : 56
  const strokeWidth = size === 'sm' ? 3.5 : size === 'lg' ? 5 : 4
  const radius = (dim - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (numScore / 100) * circumference

  const parseVal = (v?: number | string) => {
    if (v === undefined || v === null) return 0
    return Math.round(Number(v) * 100)
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      <div className="relative cursor-pointer transition-transform hover:scale-105">
        <svg width={dim} height={dim} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active progress arc */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inner score percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-semibold tracking-tight text-[#0D1B2A] ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'
            }`}
          >
            {numScore}%
          </span>
          {size === 'lg' && (
            <span className="text-[9px] uppercase tracking-wider text-[#1A2B3C]/60 font-medium -mt-1">
              Fit
            </span>
          )}
        </div>
      </div>

      {/* Breakdown Tooltip */}
      {showBreakdown && breakdown && tooltipOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-[#0D1B2A]/10 text-xs text-[#1A2B3C] animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between border-b border-[#0D1B2A]/10 pb-1.5 mb-2">
            <span className="font-semibold text-[#0D1B2A] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              Fit Breakdown
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
              {label}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#1A2B3C]/80">
                <Star className="w-3 h-3 text-amber-500" /> Interests Match
              </span>
              <span className="font-semibold">{parseVal(breakdown.interest_score)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#1A2B3C]/80">
                <Clock className="w-3 h-3 text-blue-500" /> Time Availability
              </span>
              <span className="font-semibold">{parseVal(breakdown.time_score)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#1A2B3C]/80">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Budget Alignment
              </span>
              <span className="font-semibold">{parseVal(breakdown.budget_score)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#1A2B3C]/80">
                <MapPin className="w-3 h-3 text-rose-500" /> Proximity / Walk
              </span>
              <span className="font-semibold">{parseVal(breakdown.distance_score)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#1A2B3C]/80">
                <ShieldCheck className="w-3 h-3 text-indigo-500" /> Quality & Reviews
              </span>
              <span className="font-semibold">{parseVal(breakdown.quality_score)}%</span>
            </div>
            {breakdown.capacity_modifier && Number(breakdown.capacity_modifier) < 1.0 && (
              <div className="flex items-center justify-between text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded text-[10px]">
                <span className="flex items-center gap-1">
                  <Backpack className="w-3 h-3" /> Pack Weight Constraint
                </span>
                <span className="font-bold">
                  {Math.round((1 - Number(breakdown.capacity_modifier)) * 100)}% dampening
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default FitScoreDial
