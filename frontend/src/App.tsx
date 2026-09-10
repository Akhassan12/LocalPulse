import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthModal from './components/auth/AuthModal'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AIConciergeModal from './components/concierge/AIConciergeModal'
import Spinner from './components/ui/Spinner'

const Landing = lazy(() => import('./pages/Landing'))
const Discover = lazy(() => import('./pages/Discover'))
const ExperienceDetail = lazy(() => import('./pages/ExperienceDetail'))
const Itinerary = lazy(() => import('./pages/Itinerary'))
const Settings = lazy(() => import('./pages/Settings'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard'))
const ExperienceForm = lazy(() => import('./pages/provider/ExperienceForm'))
const Auth = lazy(() => import('./pages/Auth'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Spinner size="lg" variant="terra" label="Loading..." />
    </div>
  )
}

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

        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
