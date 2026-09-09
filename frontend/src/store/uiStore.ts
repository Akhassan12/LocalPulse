/**
 * store/uiStore.ts — Zustand UI state
 * Ephemeral/UI-only state: modals, map selection, mobile tabs, etc.
 */
import { create } from 'zustand'

interface UIState {
  // Auth modal
  authModalOpen: boolean
  authModalTab: 'login' | 'signup'
  openAuthModal: (tab?: 'login' | 'signup') => void
  closeAuthModal: () => void

  // Discovery
  selectedExperienceId: string | null
  setSelectedExperienceId: (id: string | null) => void
  mobileTab: 'list' | 'map'
  setMobileTab: (tab: 'list' | 'map') => void

  // Context bar
  contextBarExpanded: boolean
  toggleContextBar: () => void

  // BazaarLink scan panel
  scanPanelOpen: boolean
  openScanPanel: () => void
  closeScanPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  authModalOpen: false,
  authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  selectedExperienceId: null,
  setSelectedExperienceId: (id) => set({ selectedExperienceId: id }),
  mobileTab: 'list',
  setMobileTab: (tab) => set({ mobileTab: tab }),

  contextBarExpanded: false,
  toggleContextBar: () => set((s) => ({ contextBarExpanded: !s.contextBarExpanded })),

  scanPanelOpen: false,
  openScanPanel: () => set({ scanPanelOpen: true }),
  closeScanPanel: () => set({ scanPanelOpen: false }),
}))
