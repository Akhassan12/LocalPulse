import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useUIStore } from '../store/uiStore'
import { useContextStore } from '../store/contextStore'
import {
  Compass, Clock, Wallet, ChevronDown, ArrowRight,
  Backpack, ShoppingBag, Star, MapPin, Users, Zap,
  Coffee, Mountain, UtensilsCrossed, ShoppingCart, Palette, Heart, Leaf,
  Quote, CheckCircle2, TrendingUp,
} from 'lucide-react'

/* ── Data ─────────────────────────────────────────────────────────────────── */

const DESTINATIONS = [
  {
    city: 'Tokyo', country: 'Japan',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    count: 40, tag: 'Culture & Workshops',
    lat: 35.6762, lng: 139.6503,
  },
  {
    city: 'Oaxaca', country: 'Mexico',
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
    count: 40, tag: 'Bazaars & Heritage',
    lat: 17.0732, lng: -96.7266,
  },
  {
    city: 'Kyoto', country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    count: 24, tag: 'Culture & Zen',
    lat: 35.0116, lng: 135.7681,
  },
  {
    city: 'Lisbon', country: 'Portugal',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    count: 32, tag: 'Food & Miradouros',
    lat: 38.7223, lng: -9.1393,
  },
]

const CATEGORIES = [
  { icon: UtensilsCrossed, label: 'Food & Dining',   color: '#C9A84C', bg: '#C9A84C15' },
  { icon: Mountain,        label: 'Outdoor',         color: '#4EC9B0', bg: '#4EC9B015' },
  { icon: Palette,         label: 'Culture & Art',   color: '#8B5CF6', bg: '#8B5CF615' },
  { icon: ShoppingCart,    label: 'Markets',         color: '#EC4899', bg: '#EC489915' },
  { icon: Coffee,          label: 'Wellness',        color: '#F59E0B', bg: '#F59E0B15' },
  { icon: Leaf,            label: 'Eco Experiences', color: '#22C55E', bg: '#22C55E15' },
]

const STEPS = [
  {
    icon: MapPin,
    title: 'Set Your Context',
    desc: 'Tell us your location, free time, budget, and group. LocalPulse factors in everything.',
  },
  {
    icon: Zap,
    title: 'Get Ranked Results',
    desc: 'Our engine scores every experience against your exact constraints — not generic popularity.',
  },
  {
    icon: Backpack,
    title: 'Decide & Go',
    desc: 'Scan any item at a market. Instantly see if it fits your pack, cash runway, or barter stock.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Mia Jensen', type: 'Backpacker', flag: '🇩🇰',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: 'BazaarLink saved me at Chatuchak. I scanned a silk scarf, saw it would push me 2kg over limit, and traded my spare camera strap for it instead. Genius.',
    score: 5,
  },
  {
    name: 'Rafi Torres', type: 'Family Traveler', flag: '🇪🇸',
    avatar: 'https://i.pravatar.cc/80?img=52',
    text: 'The fit score is a game changer. It found a kid-friendly cooking class that fit our 90-minute window and budget — exactly what we needed.',
    score: 5,
  },
  {
    name: 'Ananya Krishnan', type: 'Solo Explorer', flag: '🇮🇳',
    avatar: 'https://i.pravatar.cc/80?img=23',
    text: 'I\'ve tried every travel app. LocalPulse is the only one that understands I have a carry-on budget and 3 days left. It respects that.',
    score: 5,
  },
]

const STATS = [
  { value: '50+',  label: 'Curated experiences' },
  { value: '2',    label: 'Cities & growing' },
  { value: '95%',  label: 'Fit-score accuracy' },
  { value: '< 3s', label: 'Scan to decision' },
]

/* ── FitScoreMini ─────────────────────────────────────────────────────────── */
function FitScoreMini({ score }: { score: number }) {
  const color = score >= 70 ? '#C9A84C' : score >= 40 ? '#4EC9B0' : '#EF4444'
  const r = 18, circ = 2 * Math.PI * r, offset = circ * (1 - score / 100)
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="absolute text-xs font-bold text-white" style={{ color }}>{score}</span>
    </div>
  )
}

/* ── Landing Page ─────────────────────────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { openAuthModal } = useUIStore()
  const { setContext } = useContextStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Cinematic background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Multi-layer navy overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/90 via-[#0D1B2A]/65 to-[#0D1B2A]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-transparent to-transparent" />
        </div>

        {/* Animated brass ring decoration */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#C9A84C]/8 animate-spin-slow pointer-events-none hidden lg:block"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#C9A84C]/4 animate-spin-slow pointer-events-none hidden lg:block"
          style={{ animationDirection: 'reverse', animationDuration: '16s' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up stagger">
            <Badge variant="brass" className="mb-6 inline-flex" size="md">
              <Zap size={12} aria-hidden /> Intelligent Local Discovery
            </Badge>

            <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-tight mb-6">
              Discover Local.{' '}
              <span className="text-[#C9A84C] italic">Travel Real.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Experiences ranked by your actual constraints — time, budget, pack weight,
              and barter potential. Not by what's trending.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/discover">
                <Button
                  variant="primary" size="xl"
                  className="animate-pulse-brass group shadow-xl"
                  icon={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  iconPosition="right"
                >
                  Start Exploring
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="xl" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Mini Stats bar */}
            <div className="glass rounded-[20px] inline-flex flex-wrap items-center justify-center gap-px mx-auto divide-x divide-white/10">
              {STATS.map(({ value, label }) => (
                <div key={label} className="px-6 py-4 text-center first:rounded-l-[20px] last:rounded-r-[20px]">
                  <div className="text-2xl font-display font-bold text-[#C9A84C]">{value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-bounce" aria-hidden>
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={20} className="text-[#C9A84C]" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section className="py-24 bg-[#0D1B2A]" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="teal" className="mb-4 inline-flex">How It Works</Badge>
            <h2 id="how-it-works-heading" className="font-display text-4xl md:text-5xl text-white mb-4">
              Three Steps to the{' '}
              <span className="text-[#C9A84C] italic">Perfect Experience</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Unlike other travel apps, we account for your real-world limits before making any suggestion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group relative animate-fade-in-up">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-[#C9A84C]/40 to-transparent z-0 -translate-x-8" aria-hidden />
                )}

                <div className="relative z-10 glass rounded-[20px] p-8 h-full hover:border-[#C9A84C]/40 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-[16px] bg-[#C9A84C]/15 flex items-center justify-center mb-6 group-hover:bg-[#C9A84C]/25 transition-colors">
                    <Icon size={28} className="text-[#C9A84C]" aria-hidden />
                  </div>
                  <div className="text-4xl font-display font-bold text-[#C9A84C]/20 mb-2 leading-none">
                    0{i + 1}
                  </div>
                  <h3 className="font-display text-xl text-white mb-3">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ DESTINATIONS */}
      <section className="py-24 bg-[#F5EDD6]" aria-labelledby="destinations-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Badge variant="navy" className="mb-4 inline-flex">Featured Cities</Badge>
              <h2 id="destinations-heading" className="font-display text-4xl md:text-5xl text-[#0D1B2A]">
                Where Will You{' '}
                <span className="text-[#C9A84C] italic">Pulse Next?</span>
              </h2>
            </div>
            <Link to="/discover" className="shrink-0">
              <Button variant="ghost" className="text-[#0D1B2A] hover:bg-[#0D1B2A]/10" icon={<ArrowRight size={18} />} iconPosition="right">
                View all cities
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {DESTINATIONS.map(({ city, country, image, count, tag, lat, lng }) => (
              <Link
                key={city}
                to="/discover"
                onClick={() => setContext({ locationLabel: city, lat, lng })}
                className="group block rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-deep)] transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={`${city}, ${country}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-transparent to-transparent" />

                  {/* Fit score teaser */}
                  <div className="absolute top-4 right-4">
                    <FitScoreMini score={Math.floor(75 + Math.random() * 22)} />
                  </div>

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="glass-light text-[#0D1B2A] text-xs font-medium px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>

                  {/* City info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white">{city}</h3>
                        <p className="text-white/70 text-sm flex items-center gap-1">
                          <MapPin size={12} aria-hidden /> {country}
                        </p>
                      </div>
                      <Badge variant="ghost" size="sm">
                        {count} experiences
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ BAZAARLINK SPOTLIGHT */}
      <section className="py-24 bg-[#0D1B2A] overflow-hidden" aria-labelledby="bazaarlink-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Interactive mockup */}
            <div className="relative order-2 lg:order-1">
              {/* Main card */}
              <div className="glass rounded-[24px] p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Backpack size={20} className="text-[#C9A84C]" aria-hidden />
                  <span className="text-white font-medium">Backpack Capacity</span>
                  <Badge variant="teal" size="sm" className="ml-auto">Comfortable</Badge>
                </div>
                {/* Capacity bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Current: 8.2 kg</span>
                    <span>Max: 15 kg</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4EC9B0] to-[#C9A84C] rounded-full transition-all duration-1000" style={{ width: '55%' }} />
                  </div>
                  <p className="text-white/40 text-xs mt-1">55% used · 6.8 kg remaining</p>
                </div>
              </div>

              {/* Item scan card */}
              <div className="glass rounded-[24px] p-6 mb-4 ml-6">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Scanned Item</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[12px] bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <ShoppingBag size={24} className="text-[#C9A84C]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Silk Batik Scarf</p>
                    <p className="text-[#4EC9B0] text-sm">~$18 · Est. 0.3 kg</p>
                    <p className="text-white/50 text-xs">Confidence: 94%</p>
                  </div>
                  <Badge variant="success" size="sm">✓ Fits</Badge>
                </div>
              </div>

              {/* Cash runway card */}
              <div className="glass rounded-[24px] p-6 ml-3">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet size={20} className="text-[#C9A84C]" aria-hidden />
                  <span className="text-white font-medium">Cash Runway</span>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="font-display text-3xl font-bold text-white">14.2</div>
                    <div className="text-white/50 text-xs">days now</div>
                  </div>
                  <ArrowRight className="text-white/30 self-center" size={20} aria-hidden />
                  <div className="text-center">
                    <div className="font-display text-3xl font-bold text-[#C9A84C]">13.5</div>
                    <div className="text-white/50 text-xs">after purchase</div>
                  </div>
                </div>
                <p className="text-[#4EC9B0] text-xs mt-3 flex items-center gap-1">
                  <CheckCircle2 size={12} aria-hidden /> Barter saves 0.7 days runway
                </p>
              </div>

              {/* Decorative glow */}
              <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <Badge variant="brass" className="mb-6 inline-flex">
                <Zap size={12} aria-hidden /> BazaarLink™ Physical Layer
              </Badge>
              <h2 id="bazaarlink-heading" className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
                Buy, Barter, or{' '}
                <span className="text-[#C9A84C] italic">Skip — in 3 Taps</span>
              </h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Every market stall decision in one panel. Scan any item and instantly see its weight impact on your pack, its cost impact on your cash runway, and whether you have something in your inventory to trade for it instead.
              </p>
              <ul className="flex flex-col gap-4 mb-10" role="list">
                {[
                  { icon: Backpack, text: 'Real-time carrying capacity — down to the gram' },
                  { icon: Wallet,   text: 'Cash runway projected across your remaining travel days' },
                  { icon: TrendingUp, text: 'AI-suggested barter packages from your own inventory' },
                  { icon: Star,     text: 'Bargaining phrases in the local language' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={16} className="text-[#C9A84C]" aria-hidden />
                    </div>
                    <span className="text-white/70">{text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/discover">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  Try BazaarLink
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ CATEGORIES */}
      <section className="py-24 bg-[#F5EDD6]" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="navy" className="mb-4 inline-flex">Experience Types</Badge>
            <h2 id="categories-heading" className="font-display text-4xl md:text-5xl text-[#0D1B2A]">
              Every Kind of{' '}
              <span className="text-[#C9A84C] italic">Local Experience</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 stagger">
            {CATEGORIES.map(({ icon: Icon, label, color, bg }) => (
              <Link
                key={label}
                to="/discover"
                className="group relative rounded-[20px] p-6 md:p-8 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-deep)] animate-fade-in-up"
                style={{ background: bg, border: `1px solid ${color}20` }}
              >
                <div
                  className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={28} style={{ color }} aria-hidden />
                </div>
                <h3 className="font-display text-lg text-[#0D1B2A] font-semibold">{label}</h3>
                <p className="text-[#0D1B2A]/50 text-sm mt-1">Curated near you</p>

                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={20} style={{ color }} aria-hidden />
                </div>

                {/* Decorative bg shape */}
                <div
                  className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ background: color }}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-24 bg-[#0D1B2A]" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="teal" className="mb-4 inline-flex">Real Travelers</Badge>
            <h2 id="testimonials-heading" className="font-display text-4xl md:text-5xl text-white">
              What Explorers{' '}
              <span className="text-[#C9A84C] italic">Are Saying</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {TESTIMONIALS.map(({ name, type, flag, avatar, text, score }) => (
              <article key={name} className="glass rounded-[24px] p-8 flex flex-col gap-5 animate-fade-in-up">
                <Quote size={28} className="text-[#C9A84C]/40" aria-hidden />
                <p className="text-white/80 leading-relaxed flex-1 italic">"{text}"</p>

                {/* Stars */}
                <div className="flex gap-1" aria-label={`${score} out of 5 stars`}>
                  {Array.from({ length: score }).map((_, i) => (
                    <Star key={i} size={14} className="text-[#C9A84C] fill-current" aria-hidden />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <img
                    src={avatar}
                    alt={`${name} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{name} {flag}</p>
                    <p className="text-white/50 text-xs">{type}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ PROVIDER CTA */}
      <section className="py-24 bg-gradient-to-br from-[#C9A84C] via-[#b8933e] to-[#9a7a33] relative overflow-hidden" aria-labelledby="provider-cta-heading">
        {/* Background pattern */}
        <div aria-hidden className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #0D1B2A 1px, transparent 1px), radial-gradient(circle at 80% 50%, #0D1B2A 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Badge className="mb-6 inline-flex bg-[#0D1B2A]/20 text-[#0D1B2A] border-[#0D1B2A]/20">
            <Users size={12} aria-hidden /> For Experience Providers
          </Badge>
          <h2 id="provider-cta-heading" className="font-display text-4xl md:text-5xl lg:text-6xl text-[#0D1B2A] font-bold mb-6">
            List Your Experience.{' '}
            <br className="hidden md:block" />
            Reach Real Travelers.
          </h2>
          <p className="text-[#0D1B2A]/70 text-lg max-w-2xl mx-auto mb-10">
            Get your tour, workshop, market stall, or venue in front of travelers who are actively looking for exactly what you offer — and can actually afford it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/provider">
              <Button
                size="xl"
                className="bg-[#0D1B2A] text-white hover:bg-[#1A2B3C] !border-0"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Become a Provider
              </Button>
            </Link>
            <Link to="/">
              <Button
                size="xl"
                className="bg-transparent border-2 border-[#0D1B2A]/40 text-[#0D1B2A] hover:bg-[#0D1B2A]/10 !shadow-none"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Mini trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-[#0D1B2A]/60 text-sm">
            {['Free to list', 'Demand analytics', 'No booking fees', 'Global reach'].map(item => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 size={16} aria-hidden /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
