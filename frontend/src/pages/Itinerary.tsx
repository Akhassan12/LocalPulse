/**
 * pages/Itinerary.tsx
 * Phase 8: Interactive Itinerary Planner & Cumulative Constraint Impact
 * - Ordered schedule sequence with move up / down reordering
 * - Cumulative time, cost, runway burn, and distance calculations
 * - Real-time constraint overload warnings (fatigue & budget burn)
 * - Map sequence route preview
 * - Export & share summary
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Share2,
  Compass,
  FileText,
  Layers,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useItineraryStore, ItineraryItem } from '../store/itineraryStore'
import { api } from '../lib/api'

interface CumulativeImpact {
  item_count: number
  total_duration_minutes: number
  total_cost_min: number
  total_cost_max: number
  estimated_walk_distance_km: number
  days_of_runway_consumed: number
  warnings: string[]
  is_balanced: boolean
}

export default function Itinerary() {
  const { items, removeItem, clearItinerary, addItem } = useItineraryStore()
  const [localItems, setLocalItems] = useState<ItineraryItem[]>(items)
  const [impact, setImpact] = useState<CumulativeImpact | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isExportCopied, setIsExportCopied] = useState<boolean>(false)

  // Keep localItems in sync with zustand store
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Calculate or fetch cumulative impact
  useEffect(() => {
    const calculateLocalImpact = () => {
      const totalDuration = localItems.reduce((acc, curr) => acc + (curr.durationMinutes || 120), 0)
      const totalCost = localItems.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
      
      let estDistance = 0
      for (let i = 0; i < localItems.length - 1; i++) {
        const lat1 = localItems[i].lat || 17.06
        const lng1 = localItems[i].lng || -96.72
        const lat2 = localItems[i + 1].lat || 17.06
        const lng2 = localItems[i + 1].lng || -96.72
        const dlat = (lat2 - lat1) * 111.0
        const dlng = (lng2 - lng1) * 111.0 * 0.95
        estDistance += Math.sqrt(dlat * dlat + dlng * dlng)
      }

      const dailySpend = 50.0
      const daysConsumed = totalCost > 0 ? (totalCost / dailySpend) : 0
      const warnings: string[] = []

      if (totalDuration > 480) {
        warnings.push('High Schedule Density: Active itinerary duration exceeds 8 hours in a single day.')
      }
      if (totalCost > 200) {
        warnings.push(`Heavy Cash Burn: Total cost is $${totalCost.toFixed(0)}, consuming ${daysConsumed.toFixed(1)} days of travel runway.`)
      }
      if (estDistance > 12.0) {
        warnings.push(`High Physical Transit: Sequential exploration distance is ${estDistance.toFixed(1)} km.`)
      }

      setImpact({
        item_count: localItems.length,
        total_duration_minutes: totalDuration,
        total_cost_min: totalCost,
        total_cost_max: totalCost * 1.25,
        estimated_walk_distance_km: Math.round(estDistance * 10) / 10,
        days_of_runway_consumed: Math.round(daysConsumed * 10) / 10,
        warnings,
        is_balanced: warnings.length === 0,
      })
    }

    calculateLocalImpact()
  }, [localItems])

  // Move item up in the sequence
  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...localItems]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    setLocalItems(newItems)
  }

  // Move item down in the sequence
  const moveDown = (index: number) => {
    if (index >= localItems.length - 1) return
    const newItems = [...localItems]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    setLocalItems(newItems)
  }

  // Remove item
  const handleRemove = (experienceId: string) => {
    removeItem(experienceId)
    setLocalItems((prev) => prev.filter((item) => item.experienceId !== experienceId))
  }

  // Export summary to clipboard
  const handleExportText = () => {
    if (localItems.length === 0) return
    const header = `=== LocalPulse Cultural Itinerary ===\nTotal Time: ${Math.floor((impact?.total_duration_minutes || 0) / 60)}h ${(impact?.total_duration_minutes || 0) % 60}m | Est. Cost: $${impact?.total_cost_min.toFixed(0)}\n\n`
    const body = localItems
      .map((item, idx) => {
        const note = notes[item.experienceId] ? `   Note: ${notes[item.experienceId]}\n` : ''
        return `${idx + 1}. ${item.title} (${item.city})\n   Category: ${item.category} | ${item.durationMinutes} mins | $${item.price}\n${note}`
      })
      .join('\n')
    
    navigator.clipboard?.writeText(header + body)
    setIsExportCopied(true)
    setTimeout(() => setIsExportCopied(false), 2500)
  }

  // Format hours and mins
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#0D1B2A]">
      <Navbar />

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#0D1B2A]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E0EFC7] text-[#2D6A4F]">
                Constraint-Balanced
              </span>
              <span className="text-xs text-[#1A2B3C]/60">
                {localItems.length} Experience{localItems.length !== 1 ? 's' : ''} Planned
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#0D1B2A]">
              My Expedition Itinerary
            </h1>
            <p className="text-xs sm:text-sm text-[#1A2B3C]/70 mt-1">
              Sequence, cumulative time duration, budget runway consumption & transit balance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {localItems.length > 0 && (
              <>
                <button
                  onClick={handleExportText}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#0D1B2A]/15 text-[#0D1B2A] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#FAF5EB] transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4 text-[#2D6A4F]" />
                  {isExportCopied ? 'Copied to Clipboard!' : 'Export Summary'}
                </button>
                <button
                  onClick={clearItinerary}
                  className="p-2.5 rounded-xl bg-white border border-[#0D1B2A]/15 text-[#1A2B3C]/70 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <Link
              to="/discover"
              className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#245640] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Explore More
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {localItems.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#E0EFC7]/60 flex items-center justify-center mx-auto mb-4 border border-[#2D6A4F]/20">
              <Compass className="w-8 h-8 text-[#2D6A4F]" />
            </div>
            <h2 className="text-xl font-display font-bold text-[#0D1B2A]">Your Itinerary is Empty</h2>
            <p className="text-xs text-[#1A2B3C]/70 mt-2 mb-6 leading-relaxed">
              Explore hidden craft workshops, ancestral kitchens, and sacred ruins in the Discovery feed to start building your constraint-aware journey.
            </p>
            <Link
              to="/discover"
              className="px-6 py-3 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-[#245640] shadow-md transition-all"
            >
              Discover Local Experiences <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* LEFT COLUMN: Itinerary Items Sequence (7 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9A84C]" />
                  Sequential Schedule Order
                </h2>
                <span className="text-[11px] text-[#1A2B3C]/60 italic">
                  Use arrows to optimize your walking path
                </span>
              </div>

              <div className="space-y-3">
                {localItems.map((item, index) => (
                  <div
                    key={item.experienceId}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#0D1B2A]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2D6A4F]/30 transition-all"
                  >
                    {/* Left: Stop Number & Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#0D1B2A] text-[#FAF5EB] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                        #{index + 1}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FAF5EB] text-[#2D6A4F] border border-[#0D1B2A]/5">
                            {item.category?.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#1A2B3C]/50">{item.city}</span>
                        </div>

                        <Link
                          to={`/experiences/${item.experienceId}`}
                          className="font-bold text-[#0D1B2A] text-sm hover:text-[#2D6A4F] hover:underline flex items-center gap-1 group"
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#1A2B3C]/40 group-hover:text-[#2D6A4F] flex-shrink-0" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#1A2B3C]/70 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-[#0D1B2A]">
                            <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            {formatDuration(item.durationMinutes || 120)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#0D1B2A]">
                            <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
                            ${item.price || '0'}
                          </span>
                        </div>

                        {/* Optional custom note input */}
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="Add timing notes e.g., 'Arrive 10:30 AM before crowds'..."
                            value={notes[item.experienceId] || ''}
                            onChange={(e) =>
                              setNotes({ ...notes, [item.experienceId]: e.target.value })
                            }
                            className="w-full text-[11px] bg-[#FAF5EB] border border-[#0D1B2A]/10 rounded-lg px-2.5 py-1 text-[#0D1B2A] placeholder:text-[#1A2B3C]/40 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Reorder & Delete buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#0D1B2A]/5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded-lg border border-[#0D1B2A]/10 bg-white text-[#1A2B3C]/70 hover:text-[#0D1B2A] hover:bg-[#FAF5EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move stop earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === localItems.length - 1}
                        className="p-2 rounded-lg border border-[#0D1B2A]/10 bg-white text-[#1A2B3C]/70 hover:text-[#0D1B2A] hover:bg-[#FAF5EB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move stop later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.experienceId)}
                        className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors ml-1"
                        title="Remove from itinerary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Cumulative Impact Dashboard (5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Warnings Banner */}
              {impact && impact.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Constraint Overload Warnings</span>
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                    {impact.warnings.map((warn, i) => (
                      <li key={i} className="leading-snug">
                        {warn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cumulative Summary Card */}
              {impact && (
                <div className="bg-white rounded-2xl p-6 border border-[#0D1B2A]/10 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#0D1B2A]/5">
                    <div>
                      <h3 className="text-sm font-bold text-[#0D1B2A]">Cumulative Day Impact</h3>
                      <p className="text-[11px] text-[#1A2B3C]/60">Aggregated travel physics & finance</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        impact.is_balanced
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {impact.is_balanced ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Balanced Day
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Dense Day
                        </>
                      )}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#FAF5EB] p-3 rounded-xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60 flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-[#2D6A4F]" /> Total Time
                      </span>
                      <span className="text-base font-bold text-[#0D1B2A]">
                        {formatDuration(impact.total_duration_minutes)}
                      </span>
                    </div>

                    <div className="bg-[#FAF5EB] p-3 rounded-xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60 flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-[#C9A84C]" /> Cash Outflow
                      </span>
                      <span className="text-base font-bold text-[#0D1B2A]">
                        ${impact.total_cost_min.toFixed(0)}
                      </span>
                    </div>

                    <div className="bg-[#FAF5EB] p-3 rounded-xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60 flex items-center justify-center gap-1 mb-1">
                        <Compass className="w-3 h-3 text-[#2D6A4F]" /> Transfer Transit
                      </span>
                      <span className="text-base font-bold text-[#0D1B2A]">
                        ~{impact.estimated_walk_distance_km} km
                      </span>
                    </div>

                    <div className="bg-[#FAF5EB] p-3 rounded-xl">
                      <span className="block text-[10px] text-[#1A2B3C]/60 flex items-center justify-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-[#C9A84C]" /> Runway Burn
                      </span>
                      <span className="text-base font-bold text-[#0D1B2A]">
                        {impact.days_of_runway_consumed} days
                      </span>
                    </div>
                  </div>

                  {/* Sequence Map Visualizer Box */}
                  <div className="pt-2 border-t border-[#0D1B2A]/5 space-y-2">
                    <span className="block text-xs font-bold text-[#0D1B2A] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" /> Route Sequence Waypoints
                    </span>
                    <div className="p-3 bg-[#FAF5EB] rounded-xl border border-[#0D1B2A]/5 space-y-2 text-xs">
                      {localItems.map((item, i) => (
                        <div key={item.experienceId} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-[#0D1B2A] truncate text-[11px]">
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
