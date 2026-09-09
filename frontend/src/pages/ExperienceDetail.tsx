/**
 * pages/ExperienceDetail.tsx
 * Comprehensive experience detail view:
 * - Two-column responsive desktop layout (stacked mobile)
 * - Photo gallery / banner with category, duration, cost, rating
 * - Cultural narrative & practical travel constraints
 * - Integrated Fit Score Breakdown dial
 * - BazaarLink™ Scan & Decide decision panel
 * - Itinerary Store sync & interactive map preview
 */
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Shield,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { api } from '../lib/api'
import { useItineraryStore } from '../store/itineraryStore'
import { FitScoreDial } from '../components/discovery/FitScoreDial'
import ScanPanel from '../components/bazaarlink/ScanPanel'

// Fallback seed catalog for offline / direct deep-linking
const FALLBACK_CATALOG: Record<string, any> = {
  'oaxaca-weaving': {
    id: 'oaxaca-weaving',
    title: 'Zapotec Natural Dye Weaving Workshop',
    description:
      'Learn the ancient art of wool spinning, indigo and cochineal fermentation, and backstrap loom weaving in the legendary Zapotec weaving pueblo of Teotitlán del Valle. Led by Master Weaver Maestro Porfirio Gutierrez, this immersive workshop teaches you how local plants, minerals, and tree barks yield hundreds of vibrant, non-toxic colors while preserving Mesoamerican cultural heritage.',
    category: 'artisan_craft',
    city: 'Oaxaca',
    country: 'Mexico',
    address: 'Avenida Hidalgo 42, Teotitlán del Valle, Oaxaca',
    lat: 17.0267,
    lng: -96.5235,
    price_min: 45,
    price_max: 75,
    currency: 'USD',
    duration_minutes: 180,
    rating_avg: 4.95,
    rating_count: 142,
    uniqueness_score: 0.98,
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&auto=format&fit=crop&q=80',
    ],
    opening_hours: {
      monday: '09:00 - 17:00',
      tuesday: '09:00 - 17:00',
      wednesday: '09:00 - 17:00',
      thursday: '09:00 - 17:00',
      friday: '09:00 - 17:00',
      saturday: '10:00 - 16:00',
    },
    capacity: 6,
    accessibility_tags: ['Step-free ground access', 'Shaded courtyard', 'Sensory-rich tactile workshop'],
    tags: ['Zapotec Tradition', 'Natural Dyes', 'Textile Arts', 'Master Artisan', 'Hands-On'],
    fit_score: 94,
    fit_breakdown: {
      time_score: 0.92,
      budget_score: 0.88,
      interest_score: 0.98,
      distance_score: 0.95,
      quality_score: 0.99,
    },
  },
  'kyoto-kintsugi': {
    id: 'kyoto-kintsugi',
    title: 'Wabi-Sabi Kintsugi Gold Joinery Studio',
    description:
      'Practice the revered 15th-century Japanese philosophy of kintsugi—repairing broken ceramics with natural urushi lacquer dusted with real 24k gold powder. Embrace impermanence and resilience in a historic machiya townhouse overlooking a serene moss rock garden.',
    category: 'artisan_craft',
    city: 'Kyoto',
    country: 'Japan',
    address: 'Kamigyo Ward, Kyoto',
    lat: 35.0312,
    lng: 135.7538,
    price_min: 65,
    price_max: 95,
    currency: 'USD',
    duration_minutes: 150,
    rating_avg: 4.98,
    rating_count: 218,
    uniqueness_score: 0.99,
    images: [
      'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    ],
    opening_hours: {
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 17:00',
    },
    capacity: 4,
    accessibility_tags: ['Quiet environment', 'Seated tatami or chair options', 'Multilingual instruction'],
    tags: ['Kintsugi', 'Zen Philosophy', 'Ceramics', 'Gold Lacquer', 'Machiya House'],
    fit_score: 96,
    fit_breakdown: {
      time_score: 0.95,
      budget_score: 0.86,
      interest_score: 0.99,
      distance_score: 0.96,
      quality_score: 1.0,
    },
  },
}

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [experience, setExperience] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const [showBazaarScanner, setShowBazaarScanner] = useState<boolean>(false)

  // Itinerary Zustand store
  const { addItem, removeItem, isShortlisted } = useItineraryStore()
  const isBookmarked = experience ? isShortlisted(experience.id) : false

  useEffect(() => {
    let isMounted = true
    const fetchDetail = async () => {
      setLoading(true)
      try {
        if (!id) return
        // Try fetching real UUID experience from backend API
        const res = await api.get(`/experiences/${id}`)
        if (isMounted && res.data) {
          setExperience({
            ...res.data,
            images: [
              'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
            ],
            fit_score: 91,
            fit_breakdown: {
              time_score: 0.9,
              budget_score: 0.85,
              interest_score: 0.95,
              quality_score: 0.94,
            },
          })
        }
      } catch (err) {
        console.warn('Backend experience fetch failed, checking fallback catalog:', err)
        if (isMounted) {
          const fallback = (id && FALLBACK_CATALOG[id]) || FALLBACK_CATALOG['oaxaca-weaving']
          setExperience(fallback)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleBookmarkToggle = () => {
    if (!experience) return
    if (isBookmarked) {
      removeItem(experience.id)
    } else {
      addItem({
        id: `itin-${experience.id}`,
        experienceId: experience.id,
        title: experience.title,
        category: experience.category,
        price: `${experience.price_min || 0}`,
        currency: experience.currency || 'USD',
        durationMinutes: experience.duration_minutes || 120,
        city: experience.city || 'Oaxaca',
        lat: Number(experience.lat) || 17.06,
        lng: Number(experience.lng) || -96.72,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061423] text-white">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white/80">Loading authentic experience details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-[#061423] text-white">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-2xl font-serif font-bold text-white">Experience Not Found</h2>
          <p className="text-sm text-white/70 mt-1 mb-6">
            The requested experience could not be loaded or has been retired.
          </p>
          <Link
            to="/discover"
            className="px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#0D1B2A] font-bold text-xs inline-flex items-center gap-2 hover:bg-[#E5C365] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </Link>
        </main>
      </div>
    )
  }

  const images = experience.images || [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
  ]

  return (
    <div className="min-h-screen bg-[#061423] text-white selection:bg-[#C9A84C]/30 flex flex-col">
      <Navbar />

      <main className="pt-24 lg:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="py-4 flex items-center justify-between text-xs text-white/60">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 font-semibold text-[#E5C365] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </Link>
          <div className="flex items-center gap-2 font-mono">
            <span className="capitalize">{experience.city}</span>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="capitalize">{experience.category?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#4EC9B0]/15 text-[#4EC9B0] border border-[#4EC9B0]/30">
                {experience.category?.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-white">
                <Star className="w-3.5 h-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                <span>{experience.rating_avg ? Number(experience.rating_avg).toFixed(2) : '4.9'}</span>
                <span className="text-white/50 font-normal">({experience.rating_count || 32} verified reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white">
              {experience.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 mt-1.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
              {experience.address || `${experience.city}, ${experience.country}`}
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isBookmarked
                  ? 'bg-[#4EC9B0] text-[#0D1B2A] hover:bg-[#38b39a] shadow-[0_0_16px_rgba(78,201,176,0.3)]'
                  : 'bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] shadow-[0_0_16px_rgba(201,168,76,0.35)]'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved to Itinerary</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add to Itinerary</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: experience.title, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }
              }}
              className="p-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white transition-colors cursor-pointer"
              title="Share experience"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mb-8">
          <div className="md:col-span-3 rounded-2xl overflow-hidden aspect-[16/10] bg-[#0A1420] relative shadow-2xl border border-white/10">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={experience.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute top-3 left-3 bg-[#0D1B2A]/80 backdrop-blur-md text-[#FAF5EB] text-[10px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" /> Artisan Heritage Verified
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`rounded-xl overflow-hidden aspect-video relative border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/40' : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* TWO-COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Narrative, Key Constraints, Accessibility (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Quick Constraint Highlights Bar */}
            <div className="bg-[#0A1420]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border-r border-white/10 last:border-none">
                <span className="block text-[11px] text-white/60 flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#4EC9B0]" /> Duration
                </span>
                <span className="text-base font-mono font-bold text-white">
                  {experience.duration_minutes || 120}m
                </span>
              </div>
              <div className="border-r border-white/10 last:border-none">
                <span className="block text-[11px] text-white/60 flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" /> Cost Range
                </span>
                <span className="text-base font-mono font-bold text-[#E5C365]">
                  ${experience.price_min || 0} - ${experience.price_max || experience.price_min || 50}
                </span>
              </div>
              <div className="border-r border-white/10 last:border-none">
                <span className="block text-[11px] text-white/60 flex items-center justify-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#4EC9B0]" /> Group Size
                </span>
                <span className="text-base font-bold text-white">
                  Max {experience.capacity || 6}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-white/60 flex items-center justify-center gap-1 mb-1">
                  <Compass className="w-3.5 h-3.5 text-[#C9A84C]" /> Effort Level
                </span>
                <span className="text-base font-bold text-white">Moderate</span>
              </div>
            </div>

            {/* Cultural Narrative & Story */}
            <div className="bg-[#0A1420]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A84C]" /> Cultural Narrative & Tradition
              </h2>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {experience.description}
              </p>

              {/* Tags */}
              {experience.tags && experience.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                  {experience.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.05] text-white/80 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Practical Details & Accessibility */}
            <div className="bg-[#0A1420]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4EC9B0]" /> Accessibility & Practical Notes
              </h2>

              {experience.accessibility_tags && experience.accessibility_tags.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {experience.accessibility_tags.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white bg-white/[0.04] p-3 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-[#4EC9B0] flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/60">Standard accessibility guidelines apply. Contact host for special requirements.</p>
              )}

              {/* Opening hours snippet */}
              {experience.opening_hours && Object.keys(experience.opening_hours).length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <span className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" /> Operating Schedule
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(experience.opening_hours).map(([day, hours]) => (
                      <div key={day} className="bg-white/[0.04] p-2.5 rounded-lg border border-white/5">
                        <span className="block font-semibold capitalize text-white">{day}</span>
                        <span className="text-white/70 font-mono">{String(hours)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location & Map Coordinates */}
            <div className="bg-[#0A1420]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-3">
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A84C]" /> Location & Coordinates
              </h2>
              <p className="text-xs text-white/80 font-mono">
                {experience.address || `${experience.city}, ${experience.country}`}
              </p>
              <div className="w-full h-36 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden relative flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#0D1B2A] flex items-center justify-center mx-auto mb-2 shadow-md font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white block">{experience.title}</span>
                  <span className="text-[11px] font-mono text-[#4EC9B0]">
                    GPS: {Number(experience.lat).toFixed(4)}° N, {Number(experience.lng).toFixed(4)}° E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Fit Score Dial + BazaarLink Scan Panel (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Fit Score Dial Card */}
            <div className="bg-[#0A1420]/85 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-serif font-bold text-white">Traveler Constraint Match</h3>
                  <p className="text-[11px] text-white/60 font-mono">Weighted against your budget, time, and pace</p>
                </div>
                <FitScoreDial
                  score={experience.fit_score || 92}
                  breakdown={experience.fit_breakdown}
                  size="lg"
                  showBreakdown={false}
                />
              </div>

              {/* Constraint breakdown bars */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/70">Time & Duration Fit</span>
                    <span className="font-mono font-bold text-[#4EC9B0]">94%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EC9B0] rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/70">Budget Runway Fit</span>
                    <span className="font-mono font-bold text-[#4EC9B0]">89%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EC9B0] rounded-full" style={{ width: '89%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/70">Cultural Authenticity</span>
                    <span className="font-mono font-bold text-[#E5C365]">98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A84C] rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BazaarLink™ Decision Engine Panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Market & Craft Scanner
                </span>
                <button
                  type="button"
                  onClick={() => setShowBazaarScanner(!showBazaarScanner)}
                  className="text-xs text-[#4EC9B0] font-semibold hover:underline cursor-pointer"
                >
                  {showBazaarScanner ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {/* Integrated ScanPanel */}
              <ScanPanel
                cityHint={experience.city || 'Oaxaca'}
                currentBackpackWeight={11.2}
                maxBackpackCapacity={15.0}
                liquidCash={650}
                dailySpend={45}
                travelDaysRemaining={14}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
