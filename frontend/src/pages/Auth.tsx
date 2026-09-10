/**
 * pages/Auth.tsx
 * Professional Authentication Page — Terracotta & Stone Design.
 * Full-screen dual-column: cinematic left panel + clean right form.
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
  MapPin,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface AuthPageProps {
  defaultTab?: 'login' | 'signup'
}

export default function Auth({ defaultTab }: AuthPageProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const initialTab = (searchParams.get('tab') as 'login' | 'signup') || defaultTab || 'login'
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/discover'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  useEffect(() => {
    const qTab = searchParams.get('tab')
    if (qTab === 'login' || qTab === 'signup') setTab(qTab)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) throw err
        navigate(from, { replace: true })
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || email.split('@')[0] } },
        })
        if (err) throw err
        setSuccess('Account created! Check your inbox to confirm, then sign in.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication encountered an issue.')
    } finally {
      setLoading(false)
    }
  }

  const handleFillDemo = () => {
    setEmail('traveler@localpulse.app')
    setPassword('LocalPulse2026!')
    if (tab === 'signup') setName('Alex Vance')
    setError(null)
  }

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t)
    setError(null)
    setSuccess(null)
  }

  const FEATURES = [
    {
      icon: Zap,
      color: '#E05A38',
      bg: 'rgba(224,90,56,0.15)',
      title: 'Dynamic Fit-Score Engine',
      desc: 'Scores 50+ experiences across Tokyo & Oaxaca based on your time window, budget, and group size.',
    },
    {
      icon: Sparkles,
      color: '#6B8E7B',
      bg: 'rgba(107,142,123,0.15)',
      title: 'BazaarLink AI Vision & Barter',
      desc: 'Snap any market item to get valuations, baggage weight impact, and local bargaining phrases.',
    },
    {
      icon: ShieldCheck,
      color: '#3B5249',
      bg: 'rgba(59,82,73,0.15)',
      title: 'Private & Zero Tourist-Traps',
      desc: 'Your itinerary and inventory are secured with Supabase Row-Level Security.',
    },
  ]

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ── LEFT PANEL: Cinematic hero ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col bg-[#1A1A1E] overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1E]/85 via-[#1A1A1E]/70 to-[#E05A38]/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 xl:px-16 py-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-[#E05A38] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(224,90,56,0.5)] transition-shadow">
              <Map size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">
              Local<span className="text-[#E05A38]">Pulse</span>
            </span>
          </Link>

          {/* Hero copy — centered vertically */}
          <div className="flex-1 flex flex-col justify-center py-12">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A38]/15 border border-[#E05A38]/30 text-[#E05A38] text-xs font-semibold uppercase tracking-wider w-fit mb-8">
              <Compass size={13} className="animate-spin-slow" />
              <span>Intelligent Local Discovery</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
              Unlock the Pulse<br />
              of Every{' '}
              <span className="text-[#E05A38] italic">Neighborhood.</span>
            </h1>
            <p className="text-white/65 text-base leading-relaxed mb-10 max-w-md">
              Connect your real travel limits — free hours, cash runway, and pack weight — with hand-crafted local market experiences.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-4">
              {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">{title}</h4>
                    <p className="text-xs text-white/55 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[47, 52, 23, 61, 12].map((n) => (
                  <img
                    key={n}
                    src={`https://i.pravatar.cc/40?img=${n}`}
                    className="w-9 h-9 rounded-full border-2 border-[#1A1A1E] object-cover"
                    alt="Explorer"
                  />
                ))}
              </div>
              <div>
                <p className="text-white/90 text-sm font-semibold">2,400+ explorers</p>
                <p className="text-white/45 text-xs">already discovering local pulse</p>
              </div>
            </div>
          </div>

          {/* Bottom left coords */}
          <div className="flex items-center gap-2 text-white/30 text-[11px]" style={{ fontFamily: "'Space Grotesk', monospace" }}>
            <MapPin size={11} className="text-[#E05A38]/60" />
            <span>35.6762° N, 139.6503° E  ·  17.0732° N, -96.7266° W</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth form ─────────────────────────────────── */}
      <div className="flex-1 lg:w-[48%] xl:w-[45%] flex flex-col bg-[#FBF9F5]">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-[#E6E0D6]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E05A38] flex items-center justify-center">
              <Map size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#1A1A1E]">Local<span className="text-[#E05A38]">Pulse</span></span>
          </Link>
          <Link to="/discover" className="text-sm text-[#75747A] hover:text-[#E05A38] flex items-center gap-1 transition-colors">
            Explore as Guest <ArrowRight size={15} />
          </Link>
        </div>

        {/* Form area — centered vertically */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10">
          <div className="w-full max-w-md">

            {/* Desktop top link */}
            <div className="hidden lg:flex justify-end mb-8">
              <Link to="/discover" className="text-sm text-[#75747A] hover:text-[#E05A38] flex items-center gap-1.5 transition-colors">
                Explore as Guest <ArrowRight size={15} />
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1E] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
                {tab === 'login' ? 'Welcome back, Explorer' : 'Join the Expedition'}
              </h2>
              <p className="text-[#75747A] text-sm">
                {tab === 'login'
                  ? 'Access your itinerary, saved spots, and baggage runway.'
                  : 'Personalize your travel constraints and discover authentic hubs.'}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-xl bg-[#F5F2EB] p-1 mb-8 border border-[#E6E0D6]">
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    tab === t
                      ? 'bg-[#E05A38] text-white shadow-sm'
                      : 'text-[#75747A] hover:text-[#36363D]'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Alerts */}
            {error && (
              <div role="alert" className="mb-5 p-3.5 rounded-xl bg-[#FFF5F5] border border-[#FCA5A5] text-sm text-[#DC2626] flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="alert" className="mb-5 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-sm text-[#16A34A] flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#36363D] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E9DA3]">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Vance"
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E6E0D6] text-[#1A1A1E] placeholder-[#C4C3C9] text-sm focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#36363D] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E9DA3]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@expedition.org"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E6E0D6] text-[#1A1A1E] placeholder-[#C4C3C9] text-sm focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#36363D]">
                    Password
                  </label>
                  {tab === 'login' && (
                    <span className="text-[11px] text-[#9E9DA3]">Min. 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E9DA3]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E6E0D6] text-[#1A1A1E] placeholder-[#C4C3C9] text-sm focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9E9DA3] hover:text-[#E05A38] transition-colors cursor-pointer"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#E05A38] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E86B4B] hover:-translate-y-px transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer mt-2"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    {tab === 'login' ? 'Sign In to LocalPulse' : 'Create Your Free Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo helper */}
            <div className="mt-6 pt-5 border-t border-[#E6E0D6]">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5F2EB] hover:bg-[#EDE8DF] border border-[#E6E0D6] text-[#36363D] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={13} className="text-[#E05A38]" />
                <span>Fill Demo Account Credentials</span>
              </button>
              <p className="text-[11px] text-center text-[#9E9DA3] mt-4">
                By continuing, you agree to LocalPulse's community guidelines & privacy terms.
              </p>
            </div>

            {/* Switch tab link */}
            <p className="text-center text-sm text-[#75747A] mt-5">
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
                className="text-[#E05A38] font-semibold hover:underline cursor-pointer"
              >
                {tab === 'login' ? 'Create one free' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom copyright (right panel only) */}
        <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-5 border-t border-[#E6E0D6]">
          <p className="text-xs text-[#9E9DA3] text-center">
            © {new Date().getFullYear()} LocalPulse Inc. · Built for real travelers.
          </p>
        </div>
      </div>
    </div>
  )
}
