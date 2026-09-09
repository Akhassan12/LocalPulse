/**
 * pages/Auth.tsx
 * Professional, dedicated Authentication Page (Sign In & Sign Up)
 * Designed with rich expedition styling, dual-column visual storytelling,
 * Supabase integration, quick demo credentials, and seamless navigation.
 */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Map,
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

interface AuthPageProps {
  defaultTab?: 'login' | 'signup'
}

export default function Auth({ defaultTab }: AuthPageProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Determine initial tab from prop or query param
  const initialTab = (searchParams.get('tab') as 'login' | 'signup') || defaultTab || 'login'
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect destination after authentication
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/discover'

  // If already logged in, automatically navigate to destination
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  // Sync tab if search params change
  useEffect(() => {
    const qTab = searchParams.get('tab')
    if (qTab === 'login' || qTab === 'signup') {
      setTab(qTab)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (err) throw err
        navigate(from, { replace: true })
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: name.trim() || email.split('@')[0],
            },
          },
        })
        if (err) throw err
        setSuccess('Account created successfully! Check your inbox to confirm, or try logging in.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication encountered an issue.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill demo explorer
  const handleFillDemo = () => {
    setEmail('traveler@localpulse.app')
    setPassword('LocalPulse2026!')
    if (tab === 'signup') {
      setName('Alex Vance')
    }
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#070E17] text-white flex flex-col justify-between selection:bg-[#C9A84C] selection:text-[#0D1B2A]">
      {/* Top minimal header */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-white/10 z-20">
        <Link to="/" className="flex items-center gap-3 group" aria-label="LocalPulse home">
          <div className="w-10 h-10 rounded-xl bg-[#C9A84C] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(201,168,76,0.5)] transition-shadow">
            <Map size={20} className="text-[#0D1B2A]" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Local<span className="text-[#C9A84C]">Pulse</span>
          </span>
        </Link>

        <Link
          to="/discover"
          className="text-sm font-medium text-white/70 hover:text-[#C9A84C] flex items-center gap-1.5 transition-colors"
        >
          <span>Explore as Guest</span>
          <ArrowRight size={16} />
        </Link>
      </header>

      {/* Main layout container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Background glow ambiance */}
        <div
          aria-hidden
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#C9A84C]/10 rounded-full blur-[140px] pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#4EC9B0]/10 rounded-full blur-[140px] pointer-events-none"
        />

        <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Visual Storytelling & Platform Benefits */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-8 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold uppercase tracking-wider w-fit">
              <Compass size={14} className="animate-spin-slow" />
              <span>Intelligent Local Discovery</span>
            </div>

            <div>
              <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                Unlock the Pulse of Every <span className="text-[#C9A84C] italic">Neighborhood.</span>
              </h1>
              <p className="text-white/70 text-base leading-relaxed">
                Connect your real travel limits — free hours, cash runway, and pack weight — with hand-crafted, authentic market experiences.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C9A84C]/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={18} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Dynamic Fit-Score Engine</h4>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    Instantly scores 80+ experiences across Tokyo & Oaxaca based on your physical location and schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C9A84C]/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#4EC9B0]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={18} className="text-[#4EC9B0]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">BazaarLink AI Vision & Barter</h4>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    Snap any market item to get honest valuations, baggage weight impact, and local bargaining phrases.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C9A84C]/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} className="text-[#22C55E]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Private & Zero Tourist-Traps</h4>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    Your itineraries and inventory are secured with Supabase Row-Level Security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Sign In / Log In Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="glass-card rounded-[28px] p-6 sm:p-8 relative">
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-[#0D1B2A] p-1 mb-6 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login')
                    setError(null)
                    setSuccess(null)
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    tab === 'login'
                      ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup')
                    setError(null)
                    setSuccess(null)
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-[#C9A84C] text-[#0D1B2A] shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Title & subtitle */}
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-white">
                  {tab === 'login' ? 'Welcome Back, Explorer' : 'Join the Expedition'}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  {tab === 'login'
                    ? 'Access your personal itinerary, saved spots, and baggage runway.'
                    : 'Personalize your travel constraints and discover authentic hubs.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-start gap-2 animate-fade-in"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-start gap-2 animate-fade-in"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Vance"
                        autoComplete="name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@expedition.org"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-white/80">
                      Password
                    </label>
                    {tab === 'login' && (
                      <span className="text-[11px] text-white/50">
                        Must be at least 6 characters
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2 font-bold justify-center"
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  {tab === 'login' ? 'Sign In to LocalPulse' : 'Create Your Free Account'}
                </Button>
              </form>

              {/* Quick Demo Helper */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} className="text-[#C9A84C]" />
                  <span>Fill Demo Account Credentials</span>
                </button>

                <p className="text-[11px] text-center text-white/40">
                  By continuing, you agree to LocalPulse's community guidelines & privacy terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
        <span>&copy; {new Date().getFullYear()} LocalPulse Inc. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
          <Link to="/discover" className="hover:text-[#C9A84C] transition-colors">Explore</Link>
          <Link to="/onboarding" className="hover:text-[#C9A84C] transition-colors">Setup Profile</Link>
        </div>
      </footer>
    </div>
  )
}
