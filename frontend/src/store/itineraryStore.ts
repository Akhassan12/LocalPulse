/**
 * store/itineraryStore.ts — Local and synced shortlist / itinerary state
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItineraryItem {
  id: string
  experienceId: string
  title: string
  category: string
  price: string
  currency: string
  durationMinutes: number
  city: string
  lat: number
  lng: number
  addedAt: string
}

interface ItineraryState {
  items: ItineraryItem[]
  addItem: (item: Omit<ItineraryItem, 'addedAt'>) => void
  removeItem: (experienceId: string) => void
  isShortlisted: (experienceId: string) => boolean
  clearItinerary: () => void
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.some((i) => i.experienceId === item.experienceId)
        if (!exists) {
          set((state) => ({
            items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
          }))
        }
      },
      removeItem: (experienceId) => {
        set((state) => ({
          items: state.items.filter((i) => i.experienceId !== experienceId),
        }))
      },
      isShortlisted: (experienceId) => {
        return get().items.some((i) => i.experienceId === experienceId)
      },
      clearItinerary: () => set({ items: [] }),
    }),
    {
      name: 'localpulse-itinerary',
    }
  )
)
