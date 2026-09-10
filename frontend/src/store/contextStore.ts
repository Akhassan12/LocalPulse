/**
 * store/contextStore.ts — Zustand live context state
 * Holds the traveler's current live context (location, time, budget, group size).
 * Changes here trigger debounced /recommendations refetch.
 */
import { create } from 'zustand'

export interface LiveContext {
  lat: number | null
  lng: number | null
  locationLabel: string
  availableMinutes: number
  remainingBudget: string   // string to preserve Decimal precision
  groupSize: number
  currency: string
  circumstanceMode: 'normal' | 'monsoon_rain' | 'time_crunch' | 'budget_saver' | 'family_mode' | 'heatwave'
  travelerType: 'solo' | 'couple' | 'family' | 'friends'
}

const DEFAULT_CONTEXT: LiveContext = {
  lat: 26.9124,
  lng: 75.7873,
  locationLabel: 'Jaipur',
  availableMinutes: 120,
  remainingBudget: '2000',
  groupSize: 2,
  currency: 'INR',
  circumstanceMode: 'normal',
  travelerType: 'solo',
}

interface ContextState {
  context: LiveContext
  setContext: (patch: Partial<LiveContext>) => void
  resetContext: () => void
}

export const useContextStore = create<ContextState>((set) => ({
  context: DEFAULT_CONTEXT,
  setContext: (patch) => set((s) => ({ context: { ...s.context, ...patch } })),
  resetContext: () => set({ context: DEFAULT_CONTEXT }),
}))

