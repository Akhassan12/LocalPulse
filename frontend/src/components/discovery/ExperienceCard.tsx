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
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer backdrop-blur-xl ${
        isSelected
          ? 'bg-[#132030] border-[#C9A84C] ring-2 ring-[#C9A84C]/40 shadow-2xl -translate-y-1'
          : 'bg-[#0A1420]/80 hover:bg-[#132030]/90 border-white/10 hover:border-[#C9A84C]/50 hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner Image with gradient */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0A1420]">
        <img
          src={imageUrl}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1420] via-black/20 to-transparent" />

        {/* Top Badges: Category & Shortlist Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0D1B2A]/80 backdrop-blur-md text-[#4EC9B0] border border-[#4EC9B0]/30 shadow-sm">
            {experience.category?.replace('_', ' ')}
          </span>

          <button
            type="button"
            onClick={handleToggleShortlist}
            title={shortlisted ? 'Remove from Itinerary' : 'Add to Itinerary'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
              shortlisted
                ? 'bg-[#C9A84C] text-[#0D1B2A] ring-2 ring-[#C9A84C]/60 scale-105'
                : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/10'
            }`}
          >
            {shortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Image Overlay: City & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span className="font-medium text-xs">{experience.city}</span>
          </div>

          {experience.rating_avg && Number(experience.rating_avg) > 0 && (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold text-xs">{Number(experience.rating_avg).toFixed(1)}</span>
              {experience.rating_count && (
                <span className="text-white/60 text-[10px]">({experience.rating_count})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif text-lg font-bold text-white leading-snug group-hover:text-[#C9A84C] transition-colors line-clamp-2">
              {experience.title}
            </h3>
            {/* Fit Score Dial */}
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <FitScoreDial score={fit_score} breakdown={breakdown} size="sm" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/70 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
              {experience.duration_minutes}m
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-mono font-bold text-[#E5C365]">{formatPrice()}</span>
            {walking_distance_km !== undefined && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="flex items-center gap-1 text-[#4EC9B0] font-mono text-[11px]">
                  <Footprints className="w-3.5 h-3.5" />
                  {Number(walking_distance_km).toFixed(1)} km (~{estimated_walk_minutes}m walk)
                </span>
              </>
            )}
          </div>

          {/* AI Explanation Pill */}
          {explanation && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-[#C9A84C]/25 text-[11px] text-[#F5EDD6]/90 flex items-start gap-2 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 italic">{explanation}</span>
            </div>
          )}

          {/* Tags */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-white/[0.05] text-white/70 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions: Prominent Aligned Dual Buttons */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleShortlist}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
              shortlisted
                ? 'bg-[#4EC9B0] hover:bg-[#38b39a] text-[#0D1B2A] shadow-[0_0_12px_rgba(78,201,176,0.3)]'
                : 'bg-[#C9A84C] hover:bg-[#E5C365] active:bg-[#B8933E] text-[#0D1B2A] shadow-[0_0_12px_rgba(201,168,76,0.25)]'
            }`}
          >
            {shortlisted ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>In Itinerary</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Add to Itinerary</span>
              </>
            )}
          </button>

          <Link
            to={`/experiences/${experience.id}`}
            onClick={(e) => e.stopPropagation()}
            className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white hover:text-[#4EC9B0] transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ExperienceCard
