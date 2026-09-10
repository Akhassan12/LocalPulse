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
    if (min === 0 && max === 0) return 'Free'
    if (min === max) return `₹${min.toLocaleString()}`
    return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`
  }

  return (
    <div
      id={`experience-${experience.id}`}
      onClick={handleCardClick}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer bg-white ${
        isSelected
          ? 'border-[#E05A38] ring-2 ring-[#E05A38]/20 shadow-[var(--shadow-card-hover)] -translate-y-1'
          : 'border-[#E6E0D6] hover:border-[#E05A38]/30 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-[#EDE8DF]">
        <img
          src={imageUrl}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1E]/70 via-black/10 to-transparent" />

        {/* Category + shortlist button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="chip-terra capitalize shadow-sm">
            {experience.category?.replace('_', ' ')}
          </span>

          <button
            type="button"
            onClick={handleToggleShortlist}
            title={shortlisted ? 'Remove from Itinerary' : 'Add to Itinerary'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
              shortlisted
                ? 'bg-[#E05A38] text-white ring-2 ring-[#E05A38]/40 scale-105'
                : 'bg-white/85 text-[#75747A] hover:text-[#E05A38] hover:bg-white border border-[#E6E0D6]'
            }`}
          >
            {shortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* City + Rating overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 text-white/95 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#E05A38]" />
            <span className="font-medium text-xs">{experience.city}</span>
          </div>

          {experience.rating_avg && Number(experience.rating_avg) > 0 && (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-sm">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold text-xs">{Number(experience.rating_avg).toFixed(1)}</span>
              {experience.rating_count && (
                <span className="text-white/70 text-[10px]">({experience.rating_count})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <h3 className="font-display text-base font-bold text-[#1A1A1E] leading-snug group-hover:text-[#E05A38] transition-colors line-clamp-2">
              {experience.title}
            </h3>
            {/* Fit Score Dial */}
            <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <FitScoreDial score={fit_score} breakdown={breakdown} size="sm" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#75747A] mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#E05A38]" />
              {experience.duration_minutes}m
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4CCC0]" />
            <span className="font-data font-bold text-[#E05A38]">{formatPrice()}</span>
            {walking_distance_km !== undefined && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#D4CCC0]" />
                <span className="flex items-center gap-1 text-[#3B5249] font-data text-[11px] font-semibold">
                  <Footprints className="w-3.5 h-3.5 text-[#3B5249]" />
                  {Number(walking_distance_km) < 1
                    ? `${(Number(walking_distance_km) * 1000).toFixed(0)}m`
                    : `${Number(walking_distance_km).toFixed(1)}km`}
                  {estimated_walk_minutes > 0 && ` • ${estimated_walk_minutes}m walk`}
                </span>
              </>
            )}
          </div>

          {/* AI Explanation Pill */}
          {explanation && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-[#FDEEE9] border border-[#E05A38]/15 text-[11px] text-[#36363D] flex items-start gap-2 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-[#E05A38] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 italic">{explanation}</span>
            </div>
          )}

          {/* Tags */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="chip-neutral text-[10px] py-0.5 px-2 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-[#F5F2EB] flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleShortlist}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none min-h-[36px] ${
              shortlisted
                ? 'bg-[#3B5249] text-white hover:bg-[#2E4039]'
                : 'bg-[#E05A38] text-white hover:bg-[#E86B4B] shadow-sm'
            }`}
          >
            {shortlisted ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap font-medium">In Plan</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap font-medium">Add to Plan</span>
              </>
            )}
          </button>

          <Link
            to={`/experiences/${experience.id}`}
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#F5F2EB] hover:bg-[#EDE8DF] border border-[#E6E0D6] text-[#36363D] hover:text-[#1A1A1E] transition-all flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer select-none min-h-[36px]"
          >
            <span className="whitespace-nowrap">Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ExperienceCard
