/**
 * pages/Itinerary.tsx
 * Phase 8: Interactive Itinerary Planner & Cumulative Constraint Impact
 * - Ordered schedule sequence with move up / down reordering
 * - Cumulative time, cost, runway burn, and distance calculations
 * - Real-time constraint overload warnings (fatigue & budget burn)
 * - Map sequence route preview
 * - Export & share summary
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  MapPin,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Compass,
  FileText,
  Layers,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useItineraryStore, ItineraryItem } from '../store/itineraryStore'

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
  const { items, removeItem, clearItinerary } = useItineraryStore()
  const [localItems, setLocalItems] = useState<ItineraryItem[]>(items)
  const [impact, setImpact] = useState<CumulativeImpact | null>(null)
  const [notes] = useState<Record<string, string>>({})
  const [isExportCopied, setIsExportCopied] = useState<boolean>(false)

  // Keep localItems in sync with zustand store
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Calculate cumulative constraint impact
  useEffect(() => {
    const calculateLocalImpact = () => {
      const totalDuration = localItems.reduce((acc, curr) => acc + (curr.durationMinutes || 120), 0)
      const totalCost = localItems.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
      
      let estDistance = 0
      for (let i = 0; i < localItems.length - 1; i++) {
        const lat1 = localItems[i].lat || 26.9124
        const lng1 = localItems[i].lng || 75.7873
        const lat2 = localItems[i + 1].lat || 26.9124
        const lng2 = localItems[i + 1].lng || 75.7873
        const dlat = (lat2 - lat1) * 111.0
        const dlng = (lng2 - lng1) * 111.0 * 0.95
        estDistance += Math.sqrt(dlat * dlat + dlng * dlng)
      }

      const dailySpend = 2000.0 // INR average budget / day
      const daysConsumed = totalCost > 0 ? (totalCost / dailySpend) : 0
      const warnings: string[] = []

      if (totalDuration > 480) {
        warnings.push('High Schedule Density: Active itinerary duration exceeds 8 hours in a single day.')
      }
      if (totalCost > 8000) {
        warnings.push(`Heavy Cash Burn: Total cost is ₹${totalCost.toLocaleString()}, consuming ${daysConsumed.toFixed(1)} days of travel runway.`)
      }
      if (estDistance > 15.0) {
        warnings.push(`High Physical Transit: Sequential exploration transit distance is ~${estDistance.toFixed(1)} km.`)
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
    const header = `=== LocalPulse Cultural Itinerary ===\nTotal Time: ${Math.floor((impact?.total_duration_minutes || 0) / 60)}h ${(impact?.total_duration_minutes || 0) % 60}m | Est. Cost: ₹${impact?.total_cost_min.toLocaleString()}\n\n`
    const body = localItems
      .map((item, idx) => {
        const note = notes[item.experienceId] ? `   Note: ${notes[item.experienceId]}\n` : ''
        return `${idx + 1}. ${item.title} (${item.city})\n   Category: ${item.category} | ${item.durationMinutes} mins | ₹${item.price}\n${note}`
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
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1E] flex flex-col">
      <Navbar />

      <main className="pt-32 lg:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E6E0D6]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30">
                Constraint-Balanced
              </span>
              <span className="text-xs font-data text-[#75747A]">
                {localItems.length} Experience{localItems.length !== 1 ? 's' : ''} Planned
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#1A1A1E]">
              Expedition Itinerary
            </h1>
            <p className="text-sm text-[#75747A] mt-1">
              Sequence, cumulative time duration, budget runway consumption & transit balance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {localItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportText}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F2EB] border border-[#E6E0D6] text-[#1A1A1E] font-semibold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#E05A38]" />
                  <span>{isExportCopied ? 'Copied to Clipboard!' : 'Export Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={clearItinerary}
                  className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-[#E6E0D6] text-[#75747A] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#E86B4B] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(224,90,56,0.30)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Explore More</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {localItems.length === 0 ? (
          <div className="py-24 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-[#FDEEE9] border border-[#E05A38]/30 flex items-center justify-center mx-auto mb-5 shadow-[0_4px_24px_rgba(224,90,56,0.15)]">
              <Compass className="w-10 h-10 text-[#E05A38]" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#1A1A1E]">Your Itinerary is Empty</h2>
            <p className="text-sm text-[#75747A] mt-2 mb-8 leading-relaxed max-w-md mx-auto">
              Explore hidden craft workshops, ancestral kitchens, and sacred ruins in the Discovery feed to start building your constraint-aware journey.
            </p>
            <Link
              to="/discover"
              className="px-6 py-3.5 rounded-full bg-[#E05A38] hover:bg-[#E86B4B] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(224,90,56,0.35)] transition-all cursor-pointer"
            >
              <span>Discover Local Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* LEFT COLUMN: Itinerary Items Sequence (7 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1A1A1E] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#E05A38]" />
                  Sequential Schedule Order
                </h2>
                <span className="text-xs font-data text-[#9E9DA3] italic">
                  Use arrows to optimize your walking path
                </span>
              </div>

              <div className="space-y-3.5">
                {localItems.map((item, index) => (
                  <div
                    key={item.experienceId}
                    className="bg-white rounded-2xl p-5 border border-[#E6E0D6] shadow-[0_2px_12px_rgba(26,26,30,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#E05A38]/30 hover:shadow-md transition-all"
                  >
                    {/* Left: Stop Number & Info */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FDEEE9] text-[#E05A38] font-data text-sm font-bold flex items-center justify-center flex-shrink-0 border border-[#E05A38]/20">
                        #{index + 1}
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/20">
                            {item.category?.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-[#75747A] font-medium">{item.city}</span>
                        </div>

                        <Link
                          to={`/experiences/${item.experienceId}`}
                          className="font-display font-bold text-[#1A1A1E] text-base hover:text-[#E05A38] transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#9E9DA3] group-hover:text-[#E05A38] flex-shrink-0" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#75747A] pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-[#1A1A1E]">
                            <Clock className="w-3.5 h-3.5 text-[#E05A38]" />
                            {formatDuration(item.durationMinutes || 120)}
                          </span>
                          <span className="flex items-center gap-1 font-data font-bold text-[#3B5249]">
                            ₹{Number(item.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Reorder & Remove Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F5F2EB]">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        title="Move earlier"
                        className="p-2 rounded-xl bg-[#F5F2EB] hover:bg-[#EDE8DF] disabled:opacity-30 disabled:cursor-not-allowed text-[#1A1A1E] transition-colors cursor-pointer border border-[#E6E0D6]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === localItems.length - 1}
                        title="Move later"
                        className="p-2 rounded-xl bg-[#F5F2EB] hover:bg-[#EDE8DF] disabled:opacity-30 disabled:cursor-not-allowed text-[#1A1A1E] transition-colors cursor-pointer border border-[#E6E0D6]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.experienceId)}
                        title="Remove stop"
                        className="p-2 rounded-xl bg-[#F5F2EB] hover:bg-rose-50 text-[#75747A] hover:text-rose-600 transition-colors cursor-pointer border border-[#E6E0D6]"
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
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
                <div className="bg-white rounded-3xl p-6 border border-[#E6E0D6] shadow-[0_4px_24px_rgba(26,26,30,0.06)] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
                    <div>
                      <h3 className="text-base font-display font-bold text-[#1A1A1E]">Cumulative Day Impact</h3>
                      <p className="text-xs text-[#75747A] font-data">Aggregated travel physics & finance</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                        impact.is_balanced
                          ? 'bg-[#EDF2EF] text-[#3B5249] border-[#6B8E7B]/30'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {impact.is_balanced ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3B5249]" /> Balanced Day
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Dense Day
                        </>
                      )}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#F5F2EB] border border-[#E6E0D6] p-3.5 rounded-2xl">
                      <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#E05A38]" /> Total Time
                      </span>
                      <span className="text-base font-data font-bold text-[#1A1A1E]">
                        {formatDuration(impact.total_duration_minutes)}
                      </span>
                    </div>

                    <div className="bg-[#F5F2EB] border border-[#E6E0D6] p-3.5 rounded-2xl">
                      <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                        <span className="text-xs font-bold text-[#3B5249]">₹</span> Cash Outflow
                      </span>
                      <span className="text-base font-data font-bold text-[#3B5249]">
                        ₹{impact.total_cost_min.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-[#F5F2EB] border border-[#E6E0D6] p-3.5 rounded-2xl">
                      <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                        <Compass className="w-3.5 h-3.5 text-[#0891B2]" /> Transfer Transit
                      </span>
                      <span className="text-base font-data font-bold text-[#1A1A1E]">
                        ~{impact.estimated_walk_distance_km} km
                      </span>
                    </div>

                    <div className="bg-[#F5F2EB] border border-[#E6E0D6] p-3.5 rounded-2xl">
                      <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-[#E05A38]" /> Runway Burn
                      </span>
                      <span className="text-base font-data font-bold text-[#1A1A1E]">
                        {impact.days_of_runway_consumed} days
                      </span>
                    </div>
                  </div>

                  {/* Sequence Map Visualizer Box */}
                  <div className="pt-3 border-t border-[#F5F2EB] space-y-2.5">
                    <span className="block text-xs font-bold text-[#1A1A1E] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E05A38]" /> Route Sequence Waypoints
                    </span>
                    <div className="p-3 bg-[#F5F2EB] rounded-2xl border border-[#E6E0D6] space-y-2 text-xs">
                      {localItems.map((item, i) => (
                        <div key={item.experienceId} className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-[#E05A38] text-white text-[10px] font-data font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                            {i + 1}
                          </span>
                          <span className="font-medium text-[#1A1A1E] truncate text-[11px]">
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

      <Footer />
    </div>
  )
}
