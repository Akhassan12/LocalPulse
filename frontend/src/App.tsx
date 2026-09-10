import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Landing from './pages/Landing'
import Discover from './pages/Discover'
import ExperienceDetail from './pages/ExperienceDetail'
import Itinerary from './pages/Itinerary'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import ExperienceForm from './pages/provider/ExperienceForm'
import AuthModal from './components/auth/AuthModal'
import Auth from './pages/Auth'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AIConciergeModal from './components/concierge/AIConciergeModal'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Global auth modal — rendered outside Routes so it persists across pages */}
        <AuthModal />
        {/* Conversational AI Concierge Drawer */}
        <AIConciergeModal />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth defaultTab="login" />} />
          <Route path="/signin" element={<Auth defaultTab="login" />} />
          <Route path="/signup" element={<Auth defaultTab="signup" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route
            path="/itinerary"
            element={
              <ProtectedRoute>
                <Itinerary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/experiences/new"
            element={
              <ProtectedRoute>
                <ExperienceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/experiences/:id/edit"
            element={
              <ProtectedRoute>
                <ExperienceForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
