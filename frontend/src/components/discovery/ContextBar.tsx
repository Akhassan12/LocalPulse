import React from 'react'
import {
  Clock,
  IndianRupee,
  Users,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CloudRain,
  Zap,
  HeartHandshake,
  Sparkles,
} from 'lucide-react'
import { useContextStore } from '../../store/contextStore'
import { useUIStore } from '../../store/uiStore'

const PRESET_CITIES = [
  { name: 'Jaipur',   country: 'India', lat: 26.9124, lng: 75.7873 },
  { name: 'Delhi',    country: 'India', lat: 28.6562, lng: 77.2410 },
  { name: 'Varanasi', country: 'India', lat: 25.3176, lng: 82.9739 },
  { name: 'Mumbai',   country: 'India', lat: 18.9220, lng: 72.8347 },
  { name: 'Kochi',    country: 'India', lat: 9.9656,  lng: 76.2421 },
]

const TIME_PRESETS = [
  { label: '45m',     value: 45 },
  { label: '1.5h',    value: 90 },
  { label: '2.5h',    value: 150 },
  { label: '4h',      value: 240 },
  { label: 'Full Day', value: 480 },
]

const CIRCUMSTANCE_MODES = [
  { id: 'normal',       label: 'Standard',       icon: Zap,           desc: 'Balanced fit' },
  { id: 'monsoon_rain', label: 'Monsoon / Heat', icon: CloudRain,     desc: 'Indoor havelis & ateliers' },
  { id: 'time_crunch',  label: 'Tight Window',   icon: Clock,         desc: '≤45m & walking radius' },
  { id: 'budget_saver', label: 'Budget Saver',   icon: IndianRupee,   desc: 'Free rituals & street gems' },
  { id: 'family_mode',  label: 'Family & Kids',  icon: HeartHandshake,desc: 'Safe, hands-on crafts' },
] as const

const TRAVELER_TYPES = [
  { id: 'solo',    label: 'Solo Explorer' },
  { id: 'couple',  label: 'Couple' },
  { id: 'family',  label: 'Family with Kids' },
  { id: 'friends', label: 'Friends Group' },
] as const

export const ContextBar: React.FC = () => {
  const { context, setContext, resetContext } = useContextStore()
  const { contextBarExpanded, toggleContextBar } = useUIStore()

  const currentCityName = context.locationLabel || 'Jaipur'

  const handleSelectCity = (city: typeof PRESET_CITIES[0]) => {
    setContext({ lat: city.lat, lng: city.lng, locationLabel: city.name })
  }

  return (
    <div className="bg-white border border-[#E6E0D6] rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,26,30,0.06)] transition-all duration-300">
      {/* Header / Summary row */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        {/* City selection pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#75747A] mr-1 flex-shrink-0">
            <MapPin className="w-4 h-4 text-[#E05A38]" />
            <span className="hidden sm:inline label-caps text-[#9E9DA3]">City:</span>
          </div>
          {PRESET_CITIES.map((c) => {
            const active = currentCityName.toLowerCase().includes(c.name.toLowerCase())
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCity(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                  active
                    ? 'bg-[#E05A38] text-white shadow-sm'
                    : 'bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] border border-[#E6E0D6]'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Action icons & expand/collapse */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Active circumstance indicator badge if not normal */}
          {context.circumstanceMode !== 'normal' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FDEEE9] text-[#E05A38] border border-[#E05A38]/30 animate-pulse">
              <Sparkles className="w-3 h-3" />
              {CIRCUMSTANCE_MODES.find(m => m.id === context.circumstanceMode)?.label}
            </span>
          )}

          <button
            type="button"
            onClick={resetContext}
            title="Reset to default constraints"
            className="p-1.5 rounded-xl text-[#9E9DA3] hover:text-[#E05A38] hover:bg-[#FDEEE9] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleContextBar}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#36363D] px-3 py-1.5 rounded-xl bg-[#F5F2EB] hover:bg-[#EDE8DF] border border-[#E6E0D6] transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E05A38]" />
            <span>AI Filters</span>
            {contextBarExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#E05A38]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#E05A38]" />
            )}
          </button>
        </div>
      </div>

      {/* Circumstance Quick Reroute Pills (Problem statement differentiator!) */}
      <div className="mt-3 pt-3 border-t border-[#F5F2EB] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-[#75747A] uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#E05A38]" /> Circumstance Reroute:
        </span>
        {CIRCUMSTANCE_MODES.map((mode) => {
          const Icon = mode.icon
          const isActive = context.circumstanceMode === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (mode.id === 'time_crunch') {
                  setContext({ circumstanceMode: mode.id, availableMinutes: 45 })
                } else if (mode.id === 'budget_saver') {
                  setContext({ circumstanceMode: mode.id, remainingBudget: '250' })
                } else if (mode.id === 'family_mode') {
                  setContext({ circumstanceMode: mode.id, travelerType: 'family', groupSize: Math.max(context.groupSize, 3) })
                } else {
                  setContext({ circumstanceMode: mode.id })
                }
              }}
              title={mode.desc}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-[#1A1A1E] text-white shadow-sm font-semibold'
                  : 'bg-[#F9F7F2] text-[#555] hover:bg-[#EDE8DF] border border-[#E6E0D6]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E05A38]' : 'text-[#75747A]'}`} />
              <span>{mode.label}</span>
            </button>
          )
        })}
      </div>

      {/* Expanded Controls Drawer */}
      {contextBarExpanded && (
        <div className="mt-4 pt-4 border-t border-[#F5F2EB] grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in text-xs text-[#36363D]">
          {/* Available Time Control */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1A1E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#3B5249]" />
                Available Time
              </span>
              <span className="font-data font-bold text-[#E05A38]">
                {Math.floor(context.availableMinutes / 60)}h {context.availableMinutes % 60}m
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="480"
              step="15"
              value={context.availableMinutes}
              onChange={(e) => setContext({ availableMinutes: Number(e.target.value) })}
              className="w-full accent-[#E05A38] cursor-pointer"
            />

            <div className="flex items-center justify-between gap-1 pt-1">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setContext({ availableMinutes: p.value })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-data transition-all cursor-pointer ${
                    context.availableMinutes === p.value
                      ? 'bg-[#E05A38] text-white font-bold shadow-sm'
                      : 'bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] border border-[#E6E0D6]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Budget Control (in INR ₹) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1A1E] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#3B5249]" />
                Max Budget (INR)
              </span>
              <span className="font-data font-bold text-[#3B5249]">
                ₹{Number(context.remainingBudget || 0).toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={Number(context.remainingBudget) || 2000}
              onChange={(e) => setContext({ remainingBudget: e.target.value })}
              className="w-full accent-[#3B5249] cursor-pointer"
            />

            <div className="flex items-center justify-between gap-1 pt-1">
              {[250, 500, 1200, 2500, 5000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setContext({ remainingBudget: `${b}` })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-data transition-all cursor-pointer ${
                    Number(context.remainingBudget) === b
                      ? 'bg-[#3B5249] text-white font-bold shadow-sm'
                      : 'bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] border border-[#E6E0D6]'
                  }`}
                >
                  ₹{b >= 1000 ? `${(b/1000).toFixed(1)}k` : b}
                </button>
              ))}
            </div>
          </div>

          {/* Group Size & Traveler Type */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1A1E] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#3B5249]" />
                Traveler Profile
              </span>
              <span className="font-data font-bold text-[#3B5249]">
                {context.groupSize} {context.groupSize === 1 ? 'person' : 'people'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TRAVELER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const newGroup = t.id === 'solo' ? 1 : t.id === 'couple' ? 2 : t.id === 'family' ? 4 : 5
                    setContext({ travelerType: t.id, groupSize: newGroup })
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                    context.travelerType === t.id
                      ? 'bg-[#3B5249] text-white font-bold shadow-sm'
                      : 'bg-[#F5F2EB] text-[#75747A] hover:bg-[#EDE8DF] border border-[#E6E0D6]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextBar

