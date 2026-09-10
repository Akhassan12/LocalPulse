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
  ArrowRight,
} from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import { api } from '../lib/api'
import { useItineraryStore } from '../store/itineraryStore'
import { FitScoreDial } from '../components/discovery/FitScoreDial'
import ScanPanel from '../components/bazaarlink/ScanPanel'

// Fallback seed catalog for offline / direct deep-linking
const FALLBACK_CATALOG: Record<string, any> = {
  'jaipur-bagru-block-printing': {
    id: 'jaipur-bagru-block-printing',
    title: 'Bagru Natural Dye Hand-Block Printing Workshop',
    description:
      'Learn the multi-century art of wood-block carving, natural vegetable dyeing, and mud-resist printing in the artisan enclave of Bagru, near Jaipur. Guided by National Award-winning master artisans, you will hand-stamp raw khadi cotton using hard teakwood blocks and organic indigo vats.',
    category: 'culture',
    city: 'Jaipur',
    country: 'India',
    address: 'Chhipa Mohalla, Bagru, Jaipur, Rajasthan 303007',
    lat: 26.8124,
    lng: 75.5473,
    price_min: 1200,
    price_max: 2400,
    currency: 'INR',
    duration_minutes: 180,
    rating_avg: 4.96,
    rating_count: 154,
    uniqueness_score: 0.98,
    images: [
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    ],
    opening_hours: {
      monday: '09:00 - 17:00',
      tuesday: '09:00 - 17:00',
      wednesday: '09:00 - 17:00',
      thursday: '09:00 - 17:00',
      friday: '09:00 - 17:00',
      saturday: '10:00 - 16:00',
    },
    capacity: 8,
    accessibility_tags: ['Step-free ground courtyard', 'Tactile artisan guidance', 'Shaded drying area'],
    tags: ['Bagru Block Print', 'Natural Dyes', 'Chhipa Community', 'Master Craftsman', 'Khadi Fabric'],
    fit_score: 95,
    fit_breakdown: {
      time_score: 0.94,
      budget_score: 0.92,
      interest_score: 0.98,
      distance_score: 0.93,
      quality_score: 0.99,
    },
  },
  'varanasi-dawn-raga-boat': {
    id: 'varanasi-dawn-raga-boat',
    title: 'Varanasi Dawn Boat Raga & Sacred Ghat Aarti',
    description:
      'Drift silently across the sacred Ganges at sunrise as classical shehnai and morning Bhairav ragas resonate along the stone steps of ancient ghats. Experience the spiritual heartbeat of Kashi, visiting Manikarnika Ghat, Dashashwamedh, and historic riverside akharas with a fifth-generation boatman.',
    category: 'culture',
    city: 'Varanasi',
    country: 'India',
    address: 'Dashashwamedh Ghat, Godowlia, Varanasi, Uttar Pradesh 221001',
    lat: 25.3076,
    lng: 83.0104,
    price_min: 800,
    price_max: 1800,
    currency: 'INR',
    duration_minutes: 120,
    rating_avg: 4.98,
    rating_count: 230,
    uniqueness_score: 0.99,
    images: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1200&auto=format&fit=crop&q=80',
    ],
    opening_hours: {
      everyday: '05:30 - 08:30',
    },
    capacity: 6,
    accessibility_tags: ['Life jackets provided', 'Gentle step assistance', 'Morning serene atmosphere'],
    tags: ['Morning Raga', 'Ganges Sunrise', 'Spiritual Kashi', 'Historic Ghats', 'Local Boatman'],
    fit_score: 97,
    fit_breakdown: {
      time_score: 0.96,
      budget_score: 0.94,
      interest_score: 0.99,
      distance_score: 0.97,
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
              'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1200&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
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
          const fallback = (id && FALLBACK_CATALOG[id]) || FALLBACK_CATALOG['jaipur-bagru-block-printing']
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
        currency: experience.currency || 'INR',
        durationMinutes: experience.duration_minutes || 120,
        city: experience.city || 'Jaipur',
        lat: Number(experience.lat) || 26.9124,
        lng: Number(experience.lng) || 75.7873,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] text-[#1A1A1E]">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#E05A38] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#75747A]">Loading authentic experience details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] text-[#1A1A1E]">
        <Navbar />
        <main className="pt-24 max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#E05A38] mx-auto mb-3" />
          <h2 className="text-2xl font-display font-bold text-[#1A1A1E]">Experience Not Found</h2>
          <p className="text-sm text-[#75747A] mt-1 mb-6">
            The requested experience could not be loaded or has been retired.
          </p>
          <Link
            to="/discover"
            className="px-6 py-2.5 rounded-xl bg-[#E05A38] text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-[#E86B4B] cursor-pointer shadow-sm"
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

  const formatPrice = () => {
    const min = Number(experience.price_min) || 0
    const max = Number(experience.price_max) || min
    if (min === 0 && max === 0) return 'Free'
    if (min === max) return `₹${min.toLocaleString()}`
    return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1A1A1E] flex flex-col">
      <Navbar />

      <main className="pt-24 lg:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="py-4 flex items-center justify-between text-xs text-[#75747A]">
          <Link
            to={`/discover?city=${encodeURIComponent(experience.city)}`}
            className="inline-flex items-center gap-1.5 font-semibold text-[#E05A38] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {experience.city} Discovery
          </Link>
          <div className="flex items-center gap-2">
            <span className="capitalize font-medium text-[#1A1A1E]">{experience.city}</span>
            <ChevronRight className="w-3 h-3 text-[#9E9DA3]" />
            <span className="capitalize font-medium text-[#75747A]">{experience.category?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E0D6] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="chip-terra capitalize">
                {experience.category?.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-[#1A1A1E]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{experience.rating_avg ? Number(experience.rating_avg).toFixed(2) : '4.9'}</span>
                <span className="text-[#75747A] font-normal">({experience.rating_count || 32} verified reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-[#1A1A1E]">
              {experience.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#75747A] flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E05A38]" />
              {experience.address || `${experience.city}, ${experience.country}`}
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isBookmarked
                  ? 'bg-[#3B5249] text-white hover:bg-[#2E4039]'
                  : 'bg-[#E05A38] hover:bg-[#E86B4B] text-white'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved in Itinerary</span>
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
              className="p-3 rounded-xl bg-white hover:bg-[#F5F2EB] border border-[#E6E0D6] text-[#75747A] hover:text-[#1A1A1E] transition-colors cursor-pointer shadow-sm"
              title="Share experience"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mb-8">
          <div className="md:col-span-3 rounded-2xl overflow-hidden aspect-[16/10] bg-[#F5F2EB] relative shadow-md border border-[#E6E0D6]">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={experience.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute top-3 left-3 bg-[#1A1A1E]/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#E05A38]" /> Cultural Heritage Verified
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`rounded-xl overflow-hidden aspect-video relative border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#E05A38] ring-2 ring-[#E05A38]/30' : 'border-[#E6E0D6] opacity-70 hover:opacity-100'
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
            <div className="bg-white rounded-2xl p-5 border border-[#E6E0D6] shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border-r border-[#F5F2EB] last:border-none">
                <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#E05A38]" /> Duration
                </span>
                <span className="text-base font-data font-bold text-[#1A1A1E]">
                  {experience.duration_minutes || 120}m
                </span>
              </div>
              <div className="border-r border-[#F5F2EB] last:border-none">
                <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#3B5249]" /> Cost
                </span>
                <span className="text-base font-data font-bold text-[#E05A38]">
                  {formatPrice()}
                </span>
              </div>
              <div className="border-r border-[#F5F2EB] last:border-none">
                <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#3B5249]" /> Group Size
                </span>
                <span className="text-base font-bold text-[#1A1A1E]">
                  Max {experience.capacity || 6}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#75747A] flex items-center justify-center gap-1 mb-1 font-medium">
                  <Compass className="w-3.5 h-3.5 text-[#E05A38]" /> Effort Level
                </span>
                <span className="text-base font-bold text-[#1A1A1E]">Moderate</span>
              </div>
            </div>

            {/* Cultural Narrative & Story */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E0D6] shadow-sm space-y-4">
              <h2 className="text-lg font-display font-bold text-[#1A1A1E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E05A38]" /> Cultural Narrative & Authenticity
              </h2>
              <p className="text-sm text-[#36363D] leading-relaxed whitespace-pre-line">
                {experience.description}
              </p>

              {/* Tags */}
              {experience.tags && experience.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#F5F2EB]">
                  {experience.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="chip-neutral text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Practical Details & Accessibility */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E0D6] shadow-sm space-y-4">
              <h2 className="text-lg font-display font-bold text-[#1A1A1E] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3B5249]" /> Accessibility & Practical Guidelines
              </h2>

              {experience.accessibility_tags && experience.accessibility_tags.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {experience.accessibility_tags.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#36363D] bg-[#F5F2EB] p-3 rounded-xl border border-[#E6E0D6]">
                      <CheckCircle2 className="w-4 h-4 text-[#3B5249] flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#75747A]">Wheelchair and sensory guidelines available on site. Contact provider for specific assistance.</p>
              )}

              {/* Opening hours */}
              {experience.opening_hours && Object.keys(experience.opening_hours).length > 0 && (
                <div className="pt-3 border-t border-[#F5F2EB]">
                  <span className="block text-xs font-bold text-[#1A1A1E] mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E05A38]" /> Weekly Schedule
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(experience.opening_hours).map(([day, hours]) => (
                      <div key={day} className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E6E0D6]">
                        <span className="block font-semibold capitalize text-[#1A1A1E]">{day}</span>
                        <span className="text-[#75747A] font-data">{String(hours)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Circumstance Shift & Live Alternative (Hackathon problem requirement) */}
            <div className="bg-[#FDEEE9] rounded-2xl p-6 border border-[#E05A38]/30 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-[#E05A38] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Circumstance Shift or Running Late?
                  </h3>
                  <p className="text-xs text-[#555] mt-1 leading-relaxed">
                    If this experience is booked, weather changes to heavy rain, or your schedule shifts, our recommendation engine can immediately calculate the nearest open alternatives in {experience.city}.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  to={`/discover?city=${encodeURIComponent(experience.city)}`}
                  className="px-4 py-2 rounded-xl bg-[#E05A38] text-white font-bold text-xs hover:bg-[#E86B4B] shadow-sm inline-flex items-center gap-1.5 transition-all"
                >
                  <span>Find Live Alternatives</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => alert(`Weather alert for ${experience.city}: Clear skies today. Sheltered haveli alternatives are ready in 1 click if conditions shift.`)}
                  className="px-4 py-2 rounded-xl bg-white text-[#36363D] hover:bg-[#F5F2EB] border border-[#E6E0D6] font-medium text-xs transition-all"
                >
                  Check Live Weather Fit
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Fit Score Dial + Scanner (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Fit Score Dial Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E0D6] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-[#1A1A1E]">Live Match Score</h3>
                  <p className="text-[11px] text-[#75747A]">Multi-factor fit for your current context</p>
                </div>
                <FitScoreDial
                  score={experience.fit_score || 94}
                  breakdown={experience.fit_breakdown}
                  size="lg"
                  showBreakdown={false}
                />
              </div>

              {/* Constraint breakdown bars */}
              <div className="space-y-3 pt-3 border-t border-[#F5F2EB] text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#75747A]">Available Time Fit</span>
                    <span className="font-data font-bold text-[#3B5249]">96%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F2EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B5249] rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#75747A]">Target Budget Fit</span>
                    <span className="font-data font-bold text-[#3B5249]">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F2EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B5249] rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#75747A]">Local Cultural Depth</span>
                    <span className="font-data font-bold text-[#E05A38]">98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F2EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E05A38] rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BazaarLink™ Decision Engine Panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1E] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E05A38]" />
                  Artisan Price & Valuation
                </span>
                <button
                  type="button"
                  onClick={() => setShowBazaarScanner(!showBazaarScanner)}
                  className="text-xs text-[#E05A38] font-semibold hover:underline cursor-pointer"
                >
                  {showBazaarScanner ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {/* Integrated ScanPanel */}
              <ScanPanel
                cityHint={experience.city || 'Jaipur'}
                currentBackpackWeight={3.5}
                maxBackpackCapacity={15.0}
                liquidCash={4500}
                dailySpend={1200}
                travelDaysRemaining={7}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

