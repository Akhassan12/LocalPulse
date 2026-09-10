import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useContextStore } from '../store/contextStore'
import {
  Compass, Clock, Wallet, ChevronDown, ArrowRight,
  Backpack, ShoppingBag, Star, MapPin, Users, Zap,
  Coffee, Mountain, UtensilsCrossed, ShoppingCart, Palette, Leaf,
  Quote, CheckCircle2, TrendingUp, Sparkles, Heart,
} from 'lucide-react'

/* ── Data ─────────────────────────────────────────────────────────────────── */

const DESTINATIONS = [
  { city: 'Jaipur',   country: 'India', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80', count: 6, tag: 'Artisan Crafts & Forts',  lat: 26.9124, lng: 75.7873 },
  { city: 'Varanasi', country: 'India', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80', count: 6, tag: 'Ghats & Silk Weaving',   lat: 25.3176, lng: 82.9739 },
  { city: 'Delhi',    country: 'India', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', count: 6, tag: 'Bazaars & Heritage',     lat: 28.6562, lng: 77.2410 },
  { city: 'Kochi',    country: 'India', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', count: 5, tag: 'Spice Trails & Kathakali', lat: 9.9656,  lng: 76.2421 },
]

const CATEGORIES = [
  { icon: UtensilsCrossed, label: 'Food & Dining',   color: '#E05A38', bg: '#FDEEE9' },
  { icon: Mountain,        label: 'Outdoor',         color: '#3B5249', bg: '#EDF2EF' },
  { icon: Palette,         label: 'Culture & Art',   color: '#8B5CF6', bg: '#F3EEFF' },
  { icon: ShoppingCart,    label: 'Markets',         color: '#D97706', bg: '#FEF3C7' },
  { icon: Coffee,          label: 'Wellness',        color: '#0891B2', bg: '#E0F7FA' },
  { icon: Leaf,            label: 'Eco Experiences', color: '#6B8E7B', bg: '#EDF2EF' },
]

const STEPS = [
  { icon: MapPin,    title: 'Set Your Context',   desc: 'Tell us your location, free time, budget, and group. LocalPulse factors in everything.' },
  { icon: Zap,       title: 'Get Ranked Results', desc: 'Our engine scores every experience against your exact constraints — not generic popularity.' },
  { icon: Backpack,  title: 'Decide & Go',        desc: 'Scan any item at a market. Instantly see if it fits your pack, cash runway, or barter stock.' },
]

const TESTIMONIALS = [
  { name: 'Ananya Krishnan',   type: 'Solo Explorer',   flag: '🇮🇳', avatar: 'https://i.pravatar.cc/80?img=23', text: 'I\'ve tried every travel app. LocalPulse found me authentic block printers in Bagru and morning boat ragas in Varanasi that no commercial tour offers.', score: 5 },
  { name: 'Arjun Mehta',       type: 'Food Explorer',   flag: '🇮🇳', avatar: 'https://i.pravatar.cc/80?img=12', text: 'The Chandpole Rabri spot and Thatheri Bazaar food trail were legendary. The fit score respects my exact time and budget.', score: 5 },
  { name: 'Mia Jensen',        type: 'Backpacker',      flag: '🇩🇰', avatar: 'https://i.pravatar.cc/80?img=47', text: 'BazaarLink saved me at the Johari bazaar. I scanned a pashmina scarf, saw the fair value and carry impact instantly.', score: 5 },
]

const STATS = [
  { value: '100+', label: 'Curated experiences' },
  { value: '5+',   label: 'Indian hubs & growing' },
  { value: '98%',  label: 'Fit-score accuracy' },
  { value: '< 2s', label: 'AI Gemini mining' },
]

/* ── Landing Page ─────────────────────────────────────────────────────────── */
export default function Landing() {
  const { setContext } = useContextStore()

  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero">
        {/* Cinematic background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1E]/80 via-[#1A1A1E]/55 to-[#E05A38]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1E] via-transparent to-transparent" />
        </div>

        {/* Decorative rings */}
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#E05A38]/10 animate-spin-slow pointer-events-none hidden lg:block" />
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#E05A38]/05 animate-spin-slow pointer-events-none hidden lg:block" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A38]/15 border border-[#E05A38]/30 text-[#E05A38] text-xs font-semibold uppercase tracking-wider mb-8">
              <Sparkles size={12} />
              <span>Intelligent Local Discovery</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-tight mb-6">
              Discover Local.{' '}
              <span className="text-[#E05A38] italic">Travel Real.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Experiences ranked by your actual constraints — time, budget, pack weight,
              and barter potential. Not by what's trending.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/discover">
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#E05A38] text-white text-lg font-semibold hover:bg-[#E86B4B] hover:-translate-y-px transition-all shadow-[0_4px_24px_rgba(224,90,56,0.40)] group">
                  Start Exploring
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/login">
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/25 text-white text-lg font-semibold hover:bg-white/10 transition-all">
                  Sign In
                </button>
              </Link>
            </div>

            {/* Stats bar */}
            <div className="glass rounded-[20px] inline-flex flex-wrap items-center justify-center gap-px mx-auto divide-x divide-white/10">
              {STATS.map(({ value, label }) => (
                <div key={label} className="px-6 py-4 text-center first:rounded-l-[20px] last:rounded-r-[20px]">
                  <div className="text-2xl font-display font-bold text-[#E05A38]">{value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 animate-scroll-bounce flex flex-col items-center gap-2" aria-hidden>
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={20} className="text-[#E05A38]" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section className="py-24 section-canvas" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="chip-terra mb-4 inline-block">How It Works</span>
            <h2 id="how-it-works-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-4 mb-4">
              Three Steps to the{' '}
              <span className="text-[#E05A38] italic">Perfect Experience</span>
            </h2>
            <p className="text-[#75747A] max-w-xl mx-auto">
              Unlike other travel apps, we account for your real-world limits before making any suggestion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group relative animate-fade-in-up">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-[#E05A38]/30 to-transparent z-0 -translate-x-8" aria-hidden />
                )}
                <div className="relative z-10 bento-card p-8 h-full hover:border-[#E05A38]/20">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDEEE9] border border-[#E05A38]/15 flex items-center justify-center mb-6 group-hover:bg-[#E05A38]/20 transition-colors">
                    <Icon size={28} className="text-[#E05A38]" aria-hidden />
                  </div>
                  <div className="font-data text-4xl font-bold text-[#E05A38]/15 mb-2 leading-none">
                    0{i + 1}
                  </div>
                  <h3 className="font-display text-xl text-[#1A1A1E] mb-3">{title}</h3>
                  <p className="text-[#75747A] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ DESTINATIONS */}
      <section className="py-24 section-sand" aria-labelledby="destinations-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="chip-eco mb-4 inline-block">Featured Cities</span>
              <h2 id="destinations-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-4">
                Where Will You{' '}
                <span className="text-[#E05A38] italic">Pulse Next?</span>
              </h2>
            </div>
            <Link to="/discover" className="shrink-0">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#E05A38] hover:bg-[#FDEEE9] transition-all">
                View all cities <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {DESTINATIONS.map(({ city, country, image, count, tag, lat, lng }) => (
              <Link
                key={city}
                to="/discover"
                onClick={() => setContext({ locationLabel: city, lat, lng })}
                className="group block bento-card overflow-hidden animate-fade-in-up"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden img-zoom-wrap">
                  <img
                    src={image}
                    alt={`${city}, ${country}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1E]/70 via-transparent to-transparent" />
                  {/* Tag pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-[#1A1A1E] shadow-sm backdrop-blur-sm">
                      {tag}
                    </span>
                  </div>
                  {/* Count badge */}
                  <div className="absolute top-3 right-3">
                    <span className="chip-terra">
                      {count}
                    </span>
                  </div>
                </div>
                {/* Footer */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[#1A1A1E]">{city}</h3>
                      <p className="text-[#75747A] text-sm flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {country}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#FDEEE9] flex items-center justify-center group-hover:bg-[#E05A38] transition-colors">
                      <ArrowRight size={16} className="text-[#E05A38] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ BAZAARLINK SPOTLIGHT */}
      <section className="py-24 section-canvas overflow-hidden" aria-labelledby="bazaarlink-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Interactive mockup */}
            <div className="relative order-2 lg:order-1 flex flex-col gap-4">
              {/* Backpack card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E6E0D6', borderRadius: '24px', boxShadow: '0 4px 24px rgba(26,26,30,0.06)', padding: '24px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Backpack size={20} className="text-[#E05A38]" aria-hidden />
                  <span style={{ color: '#1A1A1E', fontWeight: 500 }}>Backpack Capacity</span>
                  <span className="chip-eco ml-auto">Comfortable</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2" style={{ color: '#75747A' }}>
                    <span>Current: 8.2 kg</span>
                    <span>Max: 15 kg</span>
                  </div>
                  <div className="eco-gauge-track">
                    <div className="eco-gauge-fill" style={{ width: '55%' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#9E9DA3' }}>55% used · 6.8 kg remaining</p>
                </div>
              </div>

              {/* Item scan card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E6E0D6', borderRadius: '24px', boxShadow: '0 4px 24px rgba(26,26,30,0.06)', padding: '24px' }}>
                <p className="label-caps mb-3" style={{ color: '#9E9DA3' }}>Scanned Item</p>
                <div className="flex items-center gap-4">
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FDEEE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={24} className="text-[#E05A38]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: '#1A1A1E', fontWeight: 500 }}>Silk Batik Scarf</p>
                    <p className="text-sm" style={{ color: '#3B5249' }}>~$18 · Est. 0.3 kg</p>
                    <p className="text-xs" style={{ color: '#9E9DA3' }}>Confidence: 94%</p>
                  </div>
                  <span className="chip-eco">✓ Fits</span>
                </div>
              </div>

              {/* Cash runway card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E6E0D6', borderRadius: '24px', boxShadow: '0 4px 24px rgba(26,26,30,0.06)', padding: '24px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet size={20} className="text-[#E05A38]" aria-hidden />
                  <span style={{ color: '#1A1A1E', fontWeight: 500 }}>Cash Runway</span>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="font-display text-3xl font-bold" style={{ color: '#1A1A1E' }}>14.2</div>
                    <div className="text-xs" style={{ color: '#75747A' }}>days now</div>
                  </div>
                  <ArrowRight className="self-center" size={20} aria-hidden style={{ color: '#D4CCC0' }} />
                  <div className="text-center">
                    <div className="font-display text-3xl font-bold" style={{ color: '#E05A38' }}>13.5</div>
                    <div className="text-xs" style={{ color: '#75747A' }}>after purchase</div>
                  </div>
                </div>
                <p className="text-xs mt-3 flex items-center gap-1" style={{ color: '#3B5249' }}>
                  <CheckCircle2 size={12} aria-hidden /> Barter saves 0.7 days runway
                </p>
              </div>

              <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(224,90,56,0.06)', filter: 'blur(48px)' }} />
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <span className="chip-terra mb-6 inline-block">
                <Zap size={10} className="inline mr-1" aria-hidden /> BazaarLink™ Physical Layer
              </span>
              <h2 id="bazaarlink-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-4 mb-6 leading-tight">
                Buy, Barter, or{' '}
                <span className="text-[#E05A38] italic">Skip — in 3 Taps</span>
              </h2>
              <p className="text-[#75747A] mb-8 leading-relaxed">
                Every market stall decision in one panel. Scan any item and instantly see its weight impact on your pack, its cost impact on your cash runway, and whether you have something in your inventory to trade for it instead.
              </p>
              <ul className="flex flex-col gap-4 mb-10" role="list">
                {[
                  { icon: Backpack,   text: 'Real-time carrying capacity — down to the gram' },
                  { icon: Wallet,     text: 'Cash runway projected across your remaining travel days' },
                  { icon: TrendingUp, text: 'AI-suggested barter packages from your own inventory' },
                  { icon: Star,       text: 'Bargaining phrases in the local language' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDEEE9] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={16} className="text-[#E05A38]" aria-hidden />
                    </div>
                    <span className="text-[#36363D]">{text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/discover">
                <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E05A38] text-white text-base font-semibold hover:bg-[#E86B4B] hover:-translate-y-px transition-all shadow-sm">
                  Try BazaarLink
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ CATEGORIES */}
      <section className="py-24 section-sand" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="chip-neutral mb-4 inline-block">Experience Types</span>
            <h2 id="categories-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-4">
              Every Kind of{' '}
              <span className="text-[#E05A38] italic">Local Experience</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 stagger">
            {CATEGORIES.map(({ icon: Icon, label, color, bg }) => (
              <Link
                key={label}
                to="/discover"
                className="group relative rounded-2xl p-6 md:p-8 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)] animate-fade-in-up"
                style={{ background: bg, border: `1px solid ${color}20` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: `${color}18` }}>
                  <Icon size={28} style={{ color }} aria-hidden />
                </div>
                <h3 className="font-display text-lg text-[#1A1A1E] font-semibold">{label}</h3>
                <p className="text-[#75747A] text-sm mt-1">Curated near you</p>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={20} style={{ color }} aria-hidden />
                </div>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-15 group-hover:opacity-25 transition-opacity" style={{ background: color }} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-24 section-canvas" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="chip-eco mb-4 inline-block">Real Travelers</span>
            <h2 id="testimonials-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-4">
              What Explorers{' '}
              <span className="text-[#E05A38] italic">Are Saying</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {TESTIMONIALS.map(({ name, type, flag, avatar, text, score }) => (
              <article key={name} className="bento-card p-8 flex flex-col gap-5 animate-fade-in-up">
                <Quote size={28} className="text-[#E05A38]/25" aria-hidden />
                <p className="text-[#36363D] leading-relaxed flex-1 italic">"{text}"</p>

                <div className="flex gap-1" aria-label={`${score} out of 5 stars`}>
                  {Array.from({ length: score }).map((_, i) => (
                    <Star key={i} size={14} className="text-[#E05A38] fill-current" aria-hidden />
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#F5F2EB]">
                  <img src={avatar} alt={`${name} avatar`} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-[#1A1A1E] font-semibold text-sm">{name} {flag}</p>
                    <p className="text-[#75747A] text-xs">{type}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ PROVIDER CTA */}
      <section className="py-24 section-sand relative overflow-hidden" aria-labelledby="provider-cta-heading">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E05A38]/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B5249]/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div style={{ background: '#FFFFFF', border: '1px solid #E6E0D6', borderRadius: 24, boxShadow: '0 4px 24px rgba(26,26,30,0.06)', padding: '48px 40px', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EDF2EF', border: '1px solid rgba(107,142,123,0.30)', color: '#3B5249', fontFamily: "'Space Grotesk', monospace", fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 9999, padding: '3px 10px', marginBottom: 24 }}>
              <Users size={10} /> For Experience Providers
            </span>
            <h2 id="provider-cta-heading" className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1E] font-bold mt-4 mb-6 leading-tight">
              List Your Experience.<br className="hidden md:block" /> Reach Real Travelers.
            </h2>
            <p className="text-[#75747A] text-lg max-w-2xl mx-auto mb-10">
              Get your tour, workshop, market stall, or venue in front of travelers who are actively looking for exactly what you offer — and can actually afford it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/provider">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#E05A38] text-white text-lg font-semibold hover:bg-[#E86B4B] hover:-translate-y-px transition-all shadow-sm">
                  Become a Provider <ArrowRight size={20} />
                </button>
              </Link>
              <Link to="/discover">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-[#E6E0D6] text-[#36363D] text-lg font-semibold hover:bg-[#F5F2EB] transition-all">
                  Explore First
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-[#75747A] text-sm">
              {['Free to list', 'Demand analytics', 'No booking fees', 'Global reach'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#3B5249]" aria-hidden /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
