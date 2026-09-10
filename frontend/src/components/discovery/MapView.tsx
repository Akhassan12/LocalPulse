/**
 * components/discovery/MapView.tsx
 * Leaflet-powered interactive map with custom pins, fit-score coloring,
 * and bidirectional synchronization with list selection.
 */
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { RankedExperienceData } from './ExperienceCard'
import { Clock, Footprints, ArrowUpRight, Bookmark, BookmarkCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useItineraryStore } from '../../store/itineraryStore'

interface MapViewProps {
  items: RankedExperienceData[]
  selectedId: string | null
  onSelect: (id: string) => void
  center?: [number, number]
  zoom?: number
}

// Custom SVG Pin Generator with Terracotta theme & Fit Score coloring
function createPinIcon(score: number, isSelected: boolean) {
  const color = isSelected ? '#C85A32' : score >= 80 ? '#10B981' : score >= 60 ? '#E05A38' : '#36363D'
  const size = isSelected ? 44 : 34
  const innerText = `${score}%`

  const svg = `
    <svg width="${size}" height="${size + 10}" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${
        isSelected
          ? `<circle cx="20" cy="20" r="19" fill="${color}" fill-opacity="0.3">
              <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="fill-opacity" values="0.35;0.1;0.35" dur="2s" repeatCount="indefinite"/>
            </circle>`
          : ''
      }
      <path d="M20 0C8.954 0 0 8.954 0 20C0 32 20 48 20 48C20 48 40 32 40 20C40 8.954 31.046 0 20 0Z" fill="${color}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <circle cx="20" cy="18" r="14" fill="#FFFFFF"/>
      <text x="20" y="22" text-anchor="middle" fill="#1A1A1E" font-size="10" font-family="Outfit, sans-serif" font-weight="800">${innerText}</text>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'custom-pin-marker',
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
  })
}

// Controller component to smoothly pan/zoom when a new experience is selected
function MapController({ selectedItem }: { selectedItem?: RankedExperienceData }) {
  const map = useMap()

  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.experience.lat, selectedItem.experience.lng], Math.max(map.getZoom(), 14), {
        duration: 1.2,
      })
    }
  }, [selectedItem, map])

  return null
}

export const MapView: React.FC<MapViewProps> = ({
  items,
  selectedId,
  onSelect,
  center = [26.9124, 75.7873], // Default Jaipur, India
  zoom = 13,
}) => {
  const { isShortlisted, addItem, removeItem } = useItineraryStore()

  // Find currently selected item
  const selectedItem = items.find((i) => i.experience.id === selectedId)

  // Compute map center from active items if available
  const effectiveCenter = selectedItem
    ? ([selectedItem.experience.lat, selectedItem.experience.lng] as [number, number])
    : items.length > 0
    ? ([items[0].experience.lat, items[0].experience.lng] as [number, number])
    : center

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-inner border border-[#0D1B2A]/10">
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '100%', height: '100%' }}
      >
        {/* OpenStreetMap Map Tiles for reliable, keyless map rendering */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedItem={selectedItem} />

        {items.map((item) => {
          const { experience, fit_score } = item
          const isSelected = experience.id === selectedId
          const score = Math.round(Number(fit_score) || 0)
          const shortlisted = isShortlisted(experience.id)

          return (
            <Marker
              key={experience.id}
              position={[experience.lat, experience.lng]}
              icon={createPinIcon(score, isSelected)}
              eventHandlers={{
                click: () => onSelect(experience.id),
              }}
            >
              <Popup className="custom-experience-popup">
                <div className="w-56 p-1 text-[#1A1A1E]">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#F5F2EB] text-[#75747A] border border-[#E6E0D6]">
                      {experience.category}
                    </span>
                    <span className="text-[11px] font-bold text-[#E05A38] bg-[#FDEEE9] px-1.5 py-0.5 rounded border border-[#E05A38]/20">
                      {score}% Fit
                    </span>
                  </div>

                  <h4 className="font-display text-sm font-bold leading-tight mb-1 text-[#1A1A1E]">
                    {experience.title}
                  </h4>

                  <p className="text-xs text-[#75747A] mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-[#E05A38]" /> {experience.duration_minutes}m
                    </span>
                    {item.walking_distance_km !== undefined && (
                      <span className="flex items-center gap-0.5 text-emerald-700">
                        <Footprints className="w-3 h-3" /> {Number(item.walking_distance_km).toFixed(1)} km
                      </span>
                    )}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E6E0D6]">
                    <Link
                      to={`/experiences/${experience.id}`}
                      className="text-xs font-semibold text-[#E05A38] hover:text-[#C85A32] flex items-center gap-0.5"
                    >
                      Details <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
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
                      }}
                      className="text-xs p-1 rounded-lg hover:bg-[#F5F2EB] text-[#1A1A1E] transition-colors cursor-pointer"
                      title={shortlisted ? 'Remove from Itinerary' : 'Save to Itinerary'}
                    >
                      {shortlisted ? (
                        <BookmarkCheck className="w-4 h-4 text-[#C9A84C]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
export default MapView
