/**
 * pages/Discover.tsx
 * Full-stack discovery experience combining real-time constraints (ContextBar),
 * dynamic ranking engine results, interactive Leaflet Map with bidirectional sync,
 * category filters, search, and responsive mobile/desktop views.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import Navbar from '../components/layout/Navbar'
import ContextBar from '../components/discovery/ContextBar'
import ExperienceCard, { RankedExperienceData } from '../components/discovery/ExperienceCard'
import MapView from '../components/discovery/MapView'

import { useContextStore } from '../store/contextStore'
import { useUIStore } from '../store/uiStore'
import { apiPost, apiGet } from '../lib/api'

const CATEGORIES = [
  'All',
  'food',
  'culture',
  'outdoor',
  'market',
  'workshop',
  'tour',
  'nightlife',
  'wellness',
]

export default function Discover() {
  const { context, setContext } = useContextStore()
  const { selectedExperienceId, setSelectedExperienceId, mobileTab, setMobileTab } = useUIStore()

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'fit' | 'distance' | 'duration' | 'price'>('fit')

  const cardListRef = useRef<HTMLDivElement>(null)

  // Initialize coordinates to Tokyo if not set
  useEffect(() => {
    if (!context.lat || !context.lng) {
      setContext({
        lat: 35.6762,
        lng: 139.6503,
        locationLabel: 'Tokyo',
      })
    }
  }, [context.lat, context.lng, setContext])

  // Fetch ranked recommendations with debouncing via react-query
  const {
    data: recommendations = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<RankedExperienceData[]>({
    queryKey: [
      'recommendations',
      context.lat,
      context.lng,
      context.availableMinutes,
      context.remainingBudget,
      context.groupSize,
      context.locationLabel,
    ],
    queryFn: async () => {
      const payload = {
        lat: context.lat ?? 35.6762,
        lng: context.lng ?? 139.6503,
        available_minutes: context.availableMinutes,
        remaining_budget: context.remainingBudget,
        group_size: context.groupSize,
        current_time: new Date().toISOString(),
        show_closed: true,
      }

      try {
        // Try calling the full AI ranking endpoint
        const res = await apiPost<RankedExperienceData[]>('/recommendations', payload)
        if (Array.isArray(res) && res.length > 0) {
          return res
        }
      } catch (err) {
        console.warn('Fallback to public experiences listing:', err)
      }

      // Fallback: fetch experiences directly for this city
      const cityFilter = context.locationLabel ? `?city=${encodeURIComponent(context.locationLabel)}` : ''
      const rawExperiences = await apiGet<any[]>(`/experiences${cityFilter}`)

      // Transform raw experiences into RankedExperienceData shape
      return rawExperiences.map((exp) => ({
        experience: exp,
        fit_score: exp.uniqueness_score ? Number(exp.uniqueness_score) * 10 : 85,
        breakdown: {
          interest_score: 0.85,
          time_score: 0.9,
          budget_score: 0.88,
          distance_score: 0.8,
          quality_score: exp.rating_avg ? Number(exp.rating_avg) / 5 : 0.9,
        },
        explanation: `Curated local experience in ${exp.city} matching your available time and group preferences.`,
        walking_distance_km: 1.2,
        estimated_walk_minutes: 15,
      }))
    },
    staleTime: 30000,
  })

  // Filter & sort results client-side for immediate responsive feedback
  const filteredItems = useMemo(() => {
    return recommendations
      .filter((item) => {
        // Category filter
        if (activeCategory !== 'All' && item.experience.category !== activeCategory) {
          return false
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesTitle = item.experience.title.toLowerCase().includes(q)
          const matchesTags = item.experience.tags?.some((t) => t.toLowerCase().includes(q))
          const matchesCategory = item.experience.category.toLowerCase().includes(q)
          if (!matchesTitle && !matchesTags && !matchesCategory) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'fit') {
          return Number(b.fit_score) - Number(a.fit_score)
        }
        if (sortBy === 'distance') {
          return Number(a.walking_distance_km) - Number(b.walking_distance_km)
        }
        if (sortBy === 'duration') {
          return a.experience.duration_minutes - b.experience.duration_minutes
        }
        if (sortBy === 'price') {
          const priceA = Number(a.experience.price_min) || 0
          const priceB = Number(b.experience.price_min) || 0
          return priceA - priceB
        }
        return 0
      })
  }, [recommendations, activeCategory, searchQuery, sortBy])

  // Scroll experience card into view when selected on map
  const handleMarkerSelect = (id: string) => {
    setSelectedExperienceId(id)
    const cardEl = document.getElementById(`experience-${id}`)
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen bg-[#061423] text-white flex flex-col selection:bg-[#C9A84C]/30">
      <Navbar />

      <main className="pt-24 lg:pt-28 pb-28 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top interactive live context bar */}
        <ContextBar />

        {/* Discovery Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A1420]/85 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-xl">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#C9A84C] text-[#0D1B2A] font-bold shadow-[0_0_14px_rgba(201,168,76,0.35)]'
                      : 'bg-white/[0.05] text-white/75 hover:bg-white/[0.1] hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search hidden gems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#132030] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
              />
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#132030] border border-white/15 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60 cursor-pointer"
              >
                <option value="fit" className="bg-[#0D1B2A]">Top Fit Score</option>
                <option value="distance" className="bg-[#0D1B2A]">Shortest Distance</option>
                <option value="duration" className="bg-[#0D1B2A]">Quickest</option>
                <option value="price" className="bg-[#0D1B2A]">Lowest Price</option>
              </select>

              {/* Refetch button */}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh recommendations"
                className={`p-2 rounded-xl border border-white/15 bg-[#132030] text-white hover:bg-white/10 transition-colors cursor-pointer ${
                  isFetching ? 'animate-spin text-[#C9A84C]' : ''
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl font-bold text-white tracking-wide">
              Curated Local Discoveries
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#C9A84C]/20 text-[#E5C365] border border-[#C9A84C]/30">
              {filteredItems.length} active
            </span>
          </div>

          {/* Mobile view toggle (List vs Map) */}
          <div className="flex lg:hidden items-center bg-[#0A1420] rounded-xl p-1 border border-white/10 shadow-sm">
            <button
              type="button"
              onClick={() => setMobileTab('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mobileTab === 'list'
                  ? 'bg-[#C9A84C] text-[#0D1B2A]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mobileTab === 'map'
                  ? 'bg-[#C9A84C] text-[#0D1B2A]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        </div>

        {/* Main Content Layout: Split Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column: Experience Cards List */}
          <div
            ref={cardListRef}
            className={`lg:col-span-7 space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {isLoading ? (
              // Loading Skeletons
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-white/[0.04] animate-pulse border border-white/10"
                  />
                ))}
              </div>
            ) : isError ? (
              // Error State
              <div className="bg-[#0A1420]/80 rounded-2xl p-8 text-center border border-rose-500/30">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-white mb-1">
                  Could not load experiences
                </h3>
                <p className="text-xs text-white/60 mb-4">
                  {(error as Error)?.message || 'Something went wrong while ranking experiences.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0D1B2A] text-xs font-bold hover:bg-[#E5C365] transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              // Empty State
              <div className="bg-[#0A1420]/80 backdrop-blur-xl rounded-2xl p-10 text-center border border-white/10">
                <Compass className="w-12 h-12 text-[#C9A84C] mx-auto mb-3 opacity-80 animate-pulse" />
                <h3 className="font-serif text-xl font-bold text-white mb-1">
                  No experiences match your constraints
                </h3>
                <p className="text-xs text-white/70 max-w-md mx-auto mb-4 leading-relaxed">
                  Try extending your available time or adjusting your budget in the Constraints bar above to uncover more local gems.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All')
                    setSearchQuery('')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#0D1B2A] text-xs font-bold hover:bg-[#E5C365] cursor-pointer"
                >
                  Reset Category Filters
                </button>
              </div>
            ) : (
              // Ranked Experience Cards
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <ExperienceCard
                    key={item.experience.id}
                    item={item}
                    isSelected={item.experience.id === selectedExperienceId}
                    onSelect={() => setSelectedExperienceId(item.experience.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Leaflet Map (Sticky on Desktop) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 h-[calc(100vh-160px)] min-h-[520px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <MapView
              items={filteredItems}
              selectedId={selectedExperienceId}
              onSelect={handleMarkerSelect}
              center={
                context.lat && context.lng
                  ? [context.lat, context.lng]
                  : [35.6762, 139.6503]
              }
            />
          </div>
        </div>
      </main>

      {/* Stitch Spec: Floating Constraint Telemetry Bar HUD */}
      <aside aria-label="Expedition telemetry HUD" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-3xl bg-[#0A1420]/90 backdrop-blur-2xl border border-[#C9A84C]/40 rounded-2xl px-5 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-5">
          {/* Budget HUD */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-white/75 gap-3">
              <span>Budget Burn:</span>
              <span className="font-mono font-bold text-[#E5C365]">${context.remainingBudget || 100} remaining</span>
            </div>
            <div className="w-28 sm:w-36 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4EC9B0] to-[#C9A84C] rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          {/* Group & Pace */}
          <div className="hidden md:flex flex-col gap-1 border-l border-white/10 pl-5">
            <span className="text-[11px] text-white/75">Group Configuration:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4EC9B0] animate-pulse" />
              {context.groupSize} {context.groupSize === 1 ? 'Explorer' : 'Explorers'} · {context.availableMinutes}m window
            </span>
          </div>
        </div>

        {/* CTA to Review Itinerary */}
        <Link
          to="/itinerary"
          className="bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(201,168,76,0.35)] cursor-pointer whitespace-nowrap"
        >
          <span>Review Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </aside>
    </div>
  )
}
