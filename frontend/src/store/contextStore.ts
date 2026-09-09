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
}

const DEFAULT_CONTEXT: LiveContext = {
  lat: null,
  lng: null,
  locationLabel: '',
  availableMinutes: 120,
  remainingBudget: '100.00',
  groupSize: 1,
  currency: 'USD',
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
