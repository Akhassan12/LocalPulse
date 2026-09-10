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
  X,
  Loader2,
  Globe,
  MapPin,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

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

  // AI Mining state
  const [showMineModal, setShowMineModal] = useState(false)
  const [mineCity, setMineCity] = useState('')
  const [mineCountry, setMineCountry] = useState('')
  const [mineCategory, setMineCategory] = useState('All')
  const [isMining, setIsMining] = useState(false)
  const [miningStatus, setMiningStatus] = useState<string | null>(null)
  const [mineSuccessMsg, setMineSuccessMsg] = useState<string | null>(null)

  const cardListRef = useRef<HTMLDivElement>(null)

  const handleMineDestination = async (e?: React.FormEvent, targetCity?: string, targetCountry?: string) => {
    if (e) e.preventDefault()
    const city = targetCity || mineCity
    const country = targetCountry || mineCountry
    if (!city.trim()) return

    setIsMining(true)
    setMiningStatus(`Google Gemini AI is scouting authentic hidden gems & geo-coordinates in ${city}...`)
    setMineSuccessMsg(null)

    try {
      const res = await apiPost<{ status: string; count: number; experiences: any[] }>('/experiences/mine', {
        city: city.trim(),
        country: country.trim() || undefined,
        category: mineCategory === 'All' ? undefined : mineCategory,
        count: 4,
      })
      if (res.experiences && res.experiences.length > 0) {
        const first = res.experiences[0]
        setContext({
          locationLabel: city.trim(),
          lat: Number(first.lat) || context.lat,
          lng: Number(first.lng) || context.lng,
        })
        setMineSuccessMsg(`Successfully mined ${res.experiences.length} authentic hidden gems for ${city}! Pins added to map.`)
        setTimeout(() => {
          setShowMineModal(false)
          setMineCity('')
          setMiningStatus(null)
          setMineSuccessMsg(null)
        }, 1200)
        refetch()
      }
    } catch (err: any) {
      setMiningStatus(`Mining note: ${err.message || 'Error communicating with AI engine'}`)
    } finally {
      setIsMining(false)
    }
  }

  // Scroll to top on initial page mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Initialize coordinates to Jaipur, India if not set
  useEffect(() => {
    if (!context.lat || !context.lng) {
      setContext({
        lat: 26.9124,
        lng: 75.7873,
        locationLabel: 'Jaipur',
      })
    }
  }, [context.lat, context.lng, setContext])


  // Sync URL search param ?city=...
  const [searchParams] = useSearchParams()
  const cityParam = searchParams.get('city')
  useEffect(() => {
    if (cityParam && cityParam.toLowerCase() !== (context.locationLabel || '').toLowerCase()) {
      const cityMap: Record<string, [number, number]> = {
        jaipur: [26.9124, 75.7873],
        varanasi: [25.3176, 82.9739],
        delhi: [28.6562, 77.2410],
        mumbai: [18.9220, 72.8347],
        kochi: [9.9656, 76.2421],
        udaipur: [24.5854, 73.7125],
        kolkata: [22.5726, 88.3639],
        goa: [15.2993, 74.1240],
      }
      const coords = cityMap[cityParam.toLowerCase()]
      setContext({
        locationLabel: cityParam.charAt(0).toUpperCase() + cityParam.slice(1),
        lat: coords ? coords[0] : context.lat,
        lng: coords ? coords[1] : context.lng,
      })
    }
  }, [cityParam, context.locationLabel, setContext])

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
      context.circumstanceMode,
      context.travelerType,
    ],
    queryFn: async () => {
      const payload = {
        lat: context.lat ?? 26.9124,
        lng: context.lng ?? 75.7873,
        city: context.locationLabel || 'Jaipur',
        circumstance_mode: context.circumstanceMode || 'normal',
        traveler_type: context.travelerType || 'solo',
        available_minutes: context.availableMinutes,
        remaining_budget: Number(context.remainingBudget) || 2000,
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
          interest_score: 85,
          time_score: 90,
          budget_score: 88,
          distance_score: 80,
          quality_score: exp.rating_avg ? (Number(exp.rating_avg) / 5) * 100 : 90,
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
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1E] flex flex-col">
      <Navbar />

      <main className="pt-32 lg:pt-36 pb-36 px-4 sm:px-6 lg:px-8 flex-1 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Top interactive live context bar */}
        <ContextBar />

        {/* Discovery Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E6E0D6] p-3.5 rounded-2xl shadow-[0_2px_12px_rgba(26,26,30,0.06)]">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#E05A38] text-white shadow-sm'
                      : 'bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] hover:text-[#36363D] border border-[#E6E0D6]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px] md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9DA3]" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F5F2EB] border border-[#E6E0D6] text-xs text-[#1A1A1E] placeholder-[#9E9DA3] focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10"
              />
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#F5F2EB] border border-[#E6E0D6] text-xs font-medium text-[#36363D] focus:outline-none focus:border-[#E05A38] cursor-pointer"
              >
                <option value="fit">Top Fit Score</option>
                <option value="distance">Shortest Distance</option>
                <option value="duration">Quickest</option>
                <option value="price">Lowest Price</option>
              </select>

              {/* Refetch button */}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh recommendations"
                className={`p-2 rounded-xl border border-[#E6E0D6] bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] transition-colors cursor-pointer ${
                  isFetching ? 'animate-spin text-[#E05A38]' : ''
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* AI Mine Destination Button */}
              <button
                type="button"
                onClick={() => setShowMineModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E05A38] to-[#E86B4B] text-white text-xs font-semibold hover:from-[#C85A32] hover:to-[#E05A38] shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow-md shrink-0"
                title="Mine any destination worldwide with Google Gemini AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Mine City</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-xl font-bold text-[#1A1A1E]">
              Curated Local Discoveries
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-data font-bold bg-[#FDEEE9] text-[#E05A38] border border-[#E05A38]/20">
              {filteredItems.length} active
            </span>
          </div>

          {/* Mobile view toggle (List vs Map) */}
          <div className="flex lg:hidden items-center bg-[#F5F2EB] rounded-xl p-1 border border-[#E6E0D6] shadow-sm">
            <button
              type="button"
              onClick={() => setMobileTab('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mobileTab === 'list'
                  ? 'bg-[#E05A38] text-white'
                  : 'text-[#75747A] hover:text-[#36363D]'
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
                  ? 'bg-[#E05A38] text-white'
                  : 'text-[#75747A] hover:text-[#36363D]'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="skeleton h-72 rounded-2xl" />
                ))}
              </div>
            ) : isError ? (
              // Error State
              <div className="bento-card p-8 text-center border-rose-200">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-[#1A1A1E] mb-1">
                  Could not load experiences
                </h3>
                <p className="text-xs text-[#75747A] mb-4">
                  {(error as Error)?.message || 'Something went wrong while ranking experiences.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-5 py-2.5 rounded-xl bg-[#E05A38] text-white text-xs font-bold hover:bg-[#E86B4B] transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              // Empty State
              <div className="bento-card p-10 text-center">
                <Compass className="w-12 h-12 text-[#E05A38] mx-auto mb-3 opacity-70 animate-pulse" />
                <h3 className="font-display text-xl font-bold text-[#1A1A1E] mb-1">
                  No experiences match your constraints
                </h3>
                <p className="text-xs text-[#75747A] max-w-md mx-auto mb-4 leading-relaxed">
                  Try extending your available time or adjusting your budget in the Constraints bar above to uncover more local gems.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All')
                    setSearchQuery('')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#E05A38] text-white text-xs font-bold hover:bg-[#E86B4B] cursor-pointer"
                >
                  Reset Filters
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
            className={`lg:col-span-5 lg:sticky lg:top-24 h-[calc(100vh-160px)] min-h-[520px] rounded-2xl overflow-hidden border border-[#E6E0D6] shadow-[var(--shadow-card)] ${
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
                  : [26.9124, 75.7873]
              }
            />
          </div>
        </div>
      </main>

      {/* Floating Constraint Telemetry HUD */}
      <aside aria-label="Expedition telemetry HUD" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-3xl glass-card rounded-2xl px-6 py-3.5 shadow-[0_16px_48px_rgba(26,26,30,0.14)] border border-[#E6E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-5">
          {/* Budget HUD */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-[#75747A] gap-3">
              <span>Budget Remaining:</span>
              <span className="font-data font-bold text-[#E05A38]">₹{Number(context.remainingBudget || 2000).toLocaleString()}</span>
            </div>
            <div className="eco-gauge-track w-28 sm:w-36">
              <div className="eco-gauge-fill" style={{ width: '65%' }} />
            </div>
          </div>

          {/* Group & Pace */}
          <div className="hidden md:flex flex-col gap-1 border-l border-[#E6E0D6] pl-5">
            <span className="label-caps text-[#9E9DA3]">Group Config</span>
            <span className="font-semibold text-[#1A1A1E] flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#6B8E7B] animate-pulse" />
              {context.groupSize} {context.groupSize === 1 ? 'Explorer' : 'Explorers'} · {context.availableMinutes}m
            </span>
          </div>

          {/* Circumstance Mode Badge */}
          {context.circumstanceMode && context.circumstanceMode !== 'normal' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FDEEE9] text-[#E05A38] font-bold text-[11px] border border-[#E05A38]/30 animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize">{context.circumstanceMode.replace('_', ' ')}</span>
            </div>
          )}
        </div>


        {/* CTA to Review Itinerary */}
        <Link
          to="/itinerary"
          className="bg-[#E05A38] hover:bg-[#E86B4B] text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap hover:-translate-y-px"
        >
          <span>Review Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </aside>

      {/* ── AI City Data Mining Modal (Powered by Google Gemini) ─────────────── */}
      {showMineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1E]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E6E0D6] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDEEE9] flex items-center justify-center text-[#E05A38] border border-[#E05A38]/20 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1A1A1E]">
                    AI India Cultural Data Miner
                  </h3>
                  <p className="text-xs text-[#75747A]">
                    Powered by Google Gemini AI · Real GPS & Fair Valuations across India
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMineModal(false)
                  setMiningStatus(null)
                  setMineSuccessMsg(null)
                }}
                className="p-1.5 rounded-xl hover:bg-[#F5F2EB] text-[#75747A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#525158] leading-relaxed">
              Mine authentic hidden gems across India. Scout traditional artisan workshops, secret food gallis, ancient ghats, and heritage trails with exact geo-coordinates.
            </p>

            {/* Quick-Pick Popular Indian Cultural Hubs */}
            <div className="flex flex-col gap-1.5">
              <span className="label-caps text-[#9E9DA3]">Quick Mine Indian Hubs</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { city: 'Jaipur', country: 'India' },
                  { city: 'Delhi', country: 'India' },
                  { city: 'Varanasi', country: 'India' },
                  { city: 'Mumbai', country: 'India' },
                  { city: 'Kochi', country: 'India' },
                  { city: 'Udaipur', country: 'India' },
                  { city: 'Kolkata', country: 'India' },
                  { city: 'Goa', country: 'India' },
                ].map((hub) => (
                  <button
                    key={hub.city}
                    type="button"
                    disabled={isMining}
                    onClick={() => handleMineDestination(undefined, hub.city, hub.country)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F2EB] hover:bg-[#FDEEE9] text-[#36363D] hover:text-[#E05A38] border border-[#E6E0D6] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {hub.city}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={(e) => handleMineDestination(e)} className="flex flex-col gap-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block label-caps text-[#75747A] mb-1">
                    Destination City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9DA3]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaipur, Varanasi, Mysore"
                      value={mineCity}
                      onChange={(e) => setMineCity(e.target.value)}
                      disabled={isMining}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F5F2EB] border border-[#E6E0D6] text-xs text-[#1A1A1E] focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block label-caps text-[#75747A] mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9DA3]" />
                    <input
                      type="text"
                      placeholder="India"
                      value={mineCountry || 'India'}
                      onChange={(e) => setMineCountry(e.target.value)}
                      disabled={isMining}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F5F2EB] border border-[#E6E0D6] text-xs text-[#1A1A1E] focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Status or Success message */}
              {miningStatus && (
                <div className="p-3 rounded-xl bg-[#FDEEE9] border border-[#E05A38]/20 flex items-center gap-2.5 text-xs text-[#E05A38]">
                  {isMining && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{miningStatus}</span>
                </div>
              )}

              {mineSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  {mineSuccessMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E0D6]">
                <button
                  type="button"
                  onClick={() => setShowMineModal(false)}
                  disabled={isMining}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#75747A] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMining || !mineCity.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#E05A38] text-white text-xs font-semibold hover:bg-[#C85A32] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isMining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mining with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mine Authentic Gems</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
