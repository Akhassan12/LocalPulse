import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import Spinner from '../ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const openAuthModal = useUIStore((s) => s.openAuthModal)
  const location = useLocation()

  useEffect(() => {
    // If auth is loaded and no user, prompt sign in
    if (!loading && !user) {
      openAuthModal('login')
    }
  }, [loading, user, openAuthModal])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" variant="brass" />
          <p className="text-white/60 font-sans text-sm">Verifying your expedition credentials...</p>
        </div>
      </div>
    )
  }

  // If unauthenticated, redirect to dedicated login page while keeping target in state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
