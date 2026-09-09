/**
 * components/discovery/ContextBar.tsx
 * Interactive constraint controls bar: City selector, Time slider, Budget, and Group Size.
 * Updates Zustand contextStore with debounced refetch triggers.
 */
import React from 'react'
import {
  Clock,
  DollarSign,
  Users,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import { useContextStore } from '../../store/contextStore'
import { useUIStore } from '../../store/uiStore'

const PRESET_CITIES = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Oaxaca', country: 'Mexico', lat: 17.0732, lng: -96.7266 },
]

const TIME_PRESETS = [
  { label: '45m', value: 45 },
  { label: '1.5h', value: 90 },
  { label: '2.5h', value: 150 },
  { label: '4h', value: 240 },
  { label: 'Full Day', value: 480 },
]

export const ContextBar: React.FC = () => {
  const { context, setContext, resetContext } = useContextStore()
  const { contextBarExpanded, toggleContextBar } = useUIStore()

  const currentCityName = context.locationLabel || 'Tokyo'

  const handleSelectCity = (city: typeof PRESET_CITIES[0]) => {
    setContext({
      lat: city.lat,
      lng: city.lng,
      locationLabel: city.name,
    })
  }

  return (
    <div className="bg-[#0A1420]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl transition-all duration-300">
      {/* Header / Summary row */}
      <div className="flex items-center justify-between gap-4">
        {/* City selection pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mr-1">
            <MapPin className="w-4 h-4 text-[#C9A84C]" />
            <span className="hidden sm:inline font-mono uppercase tracking-wider text-[11px]">Destination:</span>
          </div>
          {PRESET_CITIES.map((c) => {
            const active = currentCityName.toLowerCase().includes(c.name.toLowerCase())
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCity(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-[0_0_12px_rgba(201,168,76,0.35)]'
                    : 'bg-white/[0.06] text-white/75 hover:bg-white/[0.12] border border-white/10'
                }`}
              >
                {c.name}, {c.country}
              </button>
            )
          })}
        </div>

        {/* Action icons & expand/collapse */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetContext}
            title="Reset to default constraints"
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleContextBar}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Constraints</span>
            {contextBarExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#C9A84C]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#C9A84C]" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Controls Drawer */}
      {contextBarExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in text-xs text-white/90">
          {/* Available Time Control */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4EC9B0]" />
                Available Time
              </span>
              <span className="font-mono font-bold text-[#E5C365]">
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
              className="w-full accent-[#C9A84C] cursor-pointer"
            />

            <div className="flex items-center justify-between gap-1 pt-1">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setContext({ availableMinutes: p.value })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    context.availableMinutes === p.value
                      ? 'bg-[#C9A84C] text-[#0D1B2A] font-bold shadow-sm'
                      : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Budget Control */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#4EC9B0]" />
                Remaining Budget
              </span>
              <span className="font-mono font-bold text-[#4EC9B0]">
                ${Number(context.remainingBudget || 0).toFixed(0)} USD
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="350"
              step="10"
              value={Number(context.remainingBudget) || 100}
              onChange={(e) => setContext({ remainingBudget: e.target.value })}
              className="w-full accent-[#4EC9B0] cursor-pointer"
            />

            <div className="flex items-center justify-between gap-1 pt-1">
              {[25, 60, 120, 200, 300].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setContext({ remainingBudget: `${b}` })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    Number(context.remainingBudget) === b
                      ? 'bg-[#4EC9B0] text-[#0D1B2A] font-bold shadow-sm'
                      : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/5'
                  }`}
                >
                  ${b}
                </button>
              ))}
            </div>
          </div>

          {/* Group Size & Preferences */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
                Group Size
              </span>
              <span className="font-bold text-white">
                {context.groupSize === 1
                  ? 'Solo Explorer'
                  : context.groupSize === 2
                  ? 'Couple (2)'
                  : `${context.groupSize} Explorers`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Solo', val: 1 },
                { label: 'Pair', val: 2 },
                { label: '3-4', val: 3 },
                { label: '5+', val: 5 },
              ].map((g) => (
                <button
                  key={g.val}
                  type="button"
                  onClick={() => setContext({ groupSize: g.val })}
                  className={`py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                    context.groupSize === g.val
                      ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-sm'
                      : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/5'
                  }`}
                >
                  {g.label}
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
