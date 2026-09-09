/**
 * components/discovery/ExperienceCard.tsx
 * Modern, responsive experience card inspired by MonksTrip & Voyage designs.
 * Displays category pills, price, duration, distance, AI explanation, and interactive actions.
 */
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  MapPin,
  Star,
  Bookmark,
  BookmarkCheck,
  Compass,
  ArrowUpRight,
  Footprints,
  Sparkles,
} from 'lucide-react'
import FitScoreDial, { FitBreakdownData } from './FitScoreDial'
import { useItineraryStore } from '../../store/itineraryStore'
import { useUIStore } from '../../store/uiStore'

export interface ExperienceData {
  id: string
  title: string
  description?: string
  category: string
  tags?: string[]
  price_min?: number | string
  price_max?: number | string
  currency?: string
  duration_minutes: number
  lat: number
  lng: number
  address?: string
  city: string
  country: string
  rating_avg?: number | string
  rating_count?: number
  uniqueness_score?: number | string
}

export interface RankedExperienceData {
  experience: ExperienceData
  fit_score: number | string
  breakdown: FitBreakdownData
  explanation: string
  walking_distance_km: number | string
  estimated_walk_minutes: number
}

interface ExperienceCardProps {
  item: RankedExperienceData
  isSelected?: boolean
  onSelect?: () => void
}

// Curated high quality imagery mapping by category for expedition vibe
const CATEGORY_IMAGES: Record<string, string> = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  culture: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
  outdoor: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  market: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
  shopping: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
  workshop: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
  tour: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  nightlife: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
  wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  item,
  isSelected = false,
  onSelect,
}) => {
  const { experience, fit_score, breakdown, explanation, walking_distance_km, estimated_walk_minutes } = item
  const { isShortlisted, addItem, removeItem } = useItineraryStore()
  const { setSelectedExperienceId } = useUIStore()

  const shortlisted = isShortlisted(experience.id)

  const handleToggleShortlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (shortlisted) {
      removeItem(experience.id)
    } else {
      addItem({
        id: experience.id,
        experienceId: experience.id,
        title: experience.title,
        category: experience.category,
        price: `${experience.price_min ?? 0}`,
        currency: experience.currency ?? 'USD',
        durationMinutes: experience.duration_minutes,
        city: experience.city,
        lat: experience.lat,
        lng: experience.lng,
      })
    }
  }

  const handleCardClick = () => {
    setSelectedExperienceId(experience.id)
    if (onSelect) onSelect()
  }

  const imageUrl = CATEGORY_IMAGES[experience.category] || CATEGORY_IMAGES.culture

  const formatPrice = () => {
    const min = Number(experience.price_min) || 0
    const max = Number(experience.price_max) || min
    const curr = experience.currency || 'USD'
    if (min === 0 && max === 0) return 'Free'
    if (min === max) return `${curr} ${min}`
    return `${curr} ${min} – ${max}`
  }

  return (
    <div
      id={`experience-${experience.id}`}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/40 shadow-xl -translate-y-1'
          : 'border-[#0D1B2A]/10 hover:border-[#C9A84C]/50 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner Image with gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0D1B2A]/5">
        <img
          src={imageUrl}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges: Category & Shortlist Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-black/50 backdrop-blur-md text-white border border-white/20">
            {experience.category}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleShortlist}
              title={shortlisted ? 'Remove from Itinerary' : 'Add to Itinerary'}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                shortlisted
                  ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-md'
                  : 'bg-black/40 text-white hover:bg-black/70'
              }`}
            >
              {shortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay: City & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span className="font-medium">{experience.city}</span>
          </div>

          {experience.rating_avg && Number(experience.rating_avg) > 0 && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{Number(experience.rating_avg).toFixed(1)}</span>
              {experience.rating_count && (
                <span className="text-white/70 text-[10px]">({experience.rating_count})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display text-lg font-bold text-[#0D1B2A] leading-snug group-hover:text-[#C9A84C] transition-colors line-clamp-1">
              {experience.title}
            </h3>
            {/* Fit Score Dial */}
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <FitScoreDial score={fit_score} breakdown={breakdown} size="sm" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#1A2B3C]/70 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0D1B2A]/50" />
              {experience.duration_minutes} mins
            </span>
            <span className="w-1 h-1 rounded-full bg-[#0D1B2A]/20" />
            <span className="font-medium text-[#0D1B2A]">{formatPrice()}</span>
            {walking_distance_km !== undefined && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#0D1B2A]/20" />
                <span className="flex items-center gap-1 text-emerald-700">
                  <Footprints className="w-3.5 h-3.5" />
                  {Number(walking_distance_km).toFixed(1)} km (~{estimated_walk_minutes}m walk)
                </span>
              </>
            )}
          </div>

          {/* AI Explanation Pill (Why It Fits) */}
          {explanation && (
            <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-[#FAF5EB] border border-[#C9A84C]/20 text-[11px] text-[#1A2B3C]/90 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed italic">{explanation}</span>
            </div>
          )}

          {/* Tags */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {experience.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#0D1B2A]/5 text-[#1A2B3C]/75"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-[#0D1B2A]/5 flex items-center justify-between">
          <Link
            to={`/experiences/${experience.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-[#0D1B2A] hover:text-[#C9A84C] flex items-center gap-1 transition-colors"
          >
            Explore details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedExperienceId(experience.id)
            }}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0D1B2A]/5 hover:bg-[#C9A84C]/20 text-[#0D1B2A] transition-colors flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-[#C9A84C]" />
            Locate
          </button>
        </div>
      </div>
    </div>
  )
}
export default ExperienceCard
