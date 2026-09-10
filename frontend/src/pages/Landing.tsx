import React from 'react'
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
  { city: 'Jaipur',   country: 'India', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80', count: 6, tag: 'Artisan Crafts & Forts',  lat: 26.9124, lng: 75.7873, coords: '26.9124° N, 75.7873° E' },
  { city: 'Varanasi', country: 'India', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80', count: 6, tag: 'Ghats & Silk Weaving',   lat: 25.3176, lng: 82.9739, coords: '25.3176° N, 82.9739° E' },
  { city: 'Delhi',    country: 'India', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', count: 6, tag: 'Bazaars & Heritage',     lat: 28.6562, lng: 77.2410, coords: '28.6562° N, 77.2410° E' },
  { city: 'Kochi',    country: 'India', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', count: 5, tag: 'Spice Trails & Kathakali', lat: 9.9656,  lng: 76.2421, coords: '9.9656° N, 76.2421° E' },
]

const CATEGORIES = [
  { icon: UtensilsCrossed, label: 'Food & Dining',   desc: 'Street delicacies & authentic dhabas', color: '#E05A38', bg: '#FDEEE9' },
  { icon: Mountain,        label: 'Outdoor & Treks', desc: 'Fort hikes & sunrise ridge trails',    color: '#3B5249', bg: '#EDF2EF' },
  { icon: Palette,         label: 'Culture & Art',   desc: 'Block printing & palace heritage',     color: '#8B5CF6', bg: '#F3EEFF' },
  { icon: ShoppingCart,    label: 'Bazaars & Crafts',desc: 'Gem markets & silver workshops',       color: '#D97706', bg: '#FEF3C7' },
  { icon: Coffee,          label: 'Wellness & Ragas',desc: 'Morning ghat rituals & herbal teas',    color: '#0891B2', bg: '#E0F7FA' },
  { icon: Leaf,            label: 'Eco Experiences', desc: 'Community farms & artisan trusts',     color: '#2E7D5C', bg: '#EAF5EE' },
]

const STEPS = [
  { icon: MapPin,    title: 'Set Your Real Constraints', desc: 'Specify exact free hours, budget ceiling, group makeup, and backpack carry limit. LocalPulse factors in everything.' },
  { icon: Zap,       title: 'Intelligent Fit Ranking',   desc: 'Our engine scores every local experience against your constraints with instant precision — never generic popularity.' },
  { icon: Backpack,  title: 'BazaarLink Physical Layer', desc: 'Scan market items with camera or text. Instantly calculate pack carry weight, remaining runway days, and trade barter options.' },
]

const TESTIMONIALS = [
  { name: 'Ananya Krishnan',   type: 'Solo Cultural Explorer', flag: '🇮🇳', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80', text: 'I have tried every travel app. LocalPulse found me authentic wood-block printers in Bagru and morning boat ragas in Varanasi that no commercial tour offers.', score: 5 },
  { name: 'Arjun Mehta',       type: 'Culinary Backpacker',     flag: '🇮🇳', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80', text: 'The Chandpole Rabri spot and Thatheri Bazaar craft trail were legendary. The fit score respected my exact 3-hour window and budget perfectly.', score: 5 },
  { name: 'Mia Jensen',        type: 'Slow Traveler',          flag: '🇩🇰', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&q=80', text: 'BazaarLink saved me at the Johari Bazaar. I scanned a pashmina scarf, saw the fair valuation and pack weight impact instantly before buying.', score: 5 },
]

const STATS = [
  { value: '100+', label: 'Curated Experiences' },
  { value: '4+',   label: 'Indian Heritage Hubs' },
  { value: '98%',  label: 'Fit-Score Accuracy' },
  { value: '< 2s', label: 'AI Gemini Mining' },
]

/* ── Landing Page Component ───────────────────────────────────────────────── */
export default function Landing() {
  const { setContext } = useContextStore()

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1E]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-label="Hero">
        {/* Cinematic background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85"
            alt="Scenic mountain landscape at sunset"
            aria-hidden
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1E]/80 via-[#1A1A1E]/60 to-[#1A1A1E]/90" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#1A1A1E]/30 to-[#1A1A1E]/80" />
        </div>

        {/* Ambient atmospheric glow */}
        <div aria-hidden className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#E05A38]/20 blur-[130px] pointer-events-none" />

        {/* Hero Main Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A38]/20 border border-[#E05A38]/40 text-[#E05A38] text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-[#E05A38]" />
            <span>Intelligent Local Discovery</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.12] mb-6 tracking-tight text-balance">
            Discover Local.{' '}
            <span className="text-[#E05A38] italic">Travel Real.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed font-normal text-pretty">
            Experiences ranked by your actual constraints — time, budget, pack weight,
            and barter potential. Not by generic popularity.
          </p>

          {/* Action Buttons with explicit spacing */}
          <div
            className="flex flex-row flex-wrap gap-4 justify-center items-center"
            style={{ marginBottom: '48px' }}
          >
            <Link to="/discover">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#E05A38] text-white text-base font-semibold hover:bg-[#E86B4B] hover:scale-105 active:scale-95 transition-all shadow-[0_8px_24px_rgba(224,90,56,0.40)] cursor-pointer group min-h-[52px]"
              >
                <span>Start Exploring</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white text-base font-semibold hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer min-h-[52px]"
              >
                <span>Sign In</span>
              </button>
            </Link>
          </div>

          {/* Stats Bar — sleek glass card with generous internal space */}
          <div
            className="w-full max-w-3xl mx-auto rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-2xl"
            style={{ marginBottom: '36px' }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center px-2 py-1">
                <div className="text-2xl sm:text-3xl font-display font-bold text-[#E05A38] tabular-nums">{value}</div>
                <div className="text-xs text-white/75 font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Bottom scroll indicator */}
          <div
            className="flex flex-col items-center gap-1.5 pointer-events-none"
            style={{ marginTop: '8px' }}
            aria-hidden
          >
            <span className="text-white/50 text-[10px] tracking-widest uppercase font-semibold">Scroll to explore</span>
            <ChevronDown size={18} className="text-[#E05A38] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section className="py-24 bg-[#FBF9F5]" aria-labelledby="how-it-works-heading">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FDEEE9] text-[#E05A38] border border-[#E05A38]/20 mb-4">
              How It Works
            </span>
            <h2 id="how-it-works-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-2 mb-4 text-balance">
              Three Steps to the{' '}
              <span className="text-[#E05A38] italic">Perfect Experience</span>
            </h2>
            <p className="text-[#75747A] max-w-xl mx-auto text-pretty">
              Unlike generic tourist aggregators, LocalPulse computes feasibility around your exact schedule and physical limits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group relative">
                <div className="bento-card p-8 h-full flex flex-col justify-between hover:border-[#E05A38]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(26,26,30,0.08)] bg-white rounded-3xl border border-[#E6E0D6]">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#FDEEE9] border border-[#E05A38]/20 flex items-center justify-center group-hover:bg-[#E05A38] transition-colors">
                        <Icon size={26} className="text-[#E05A38] group-hover:text-white transition-colors" aria-hidden />
                      </div>
                      <span className="font-data text-3xl font-bold text-[#E05A38]/25 tabular-nums">0{i + 1}</span>
                    </div>
                    <h3 className="font-display text-xl text-[#1A1A1E] font-bold mb-3">{title}</h3>
                    <p className="text-[#75747A] text-sm leading-relaxed text-pretty">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ DESTINATIONS */}
      <section className="py-24 bg-[#EDE8DF]/40 border-y border-[#E6E0D6]" aria-labelledby="destinations-heading">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30 mb-4">
                Curated Indian Hubs
              </span>
              <h2 id="destinations-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-2 text-balance">
                Where Will You{' '}
                <span className="text-[#E05A38] italic">Pulse Next?</span>
              </h2>
            </div>
            <Link to="/discover" className="shrink-0">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#E05A38] hover:bg-[#FDEEE9] border border-transparent hover:border-[#E05A38]/20 transition-all cursor-pointer">
                View all cities <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.map(({ city, country, image, count, tag, lat, lng, coords }) => (
              <Link
                key={city}
                to="/discover"
                onClick={() => setContext({ locationLabel: city, lat, lng })}
                className="group block rounded-3xl overflow-hidden bg-white border border-[#E6E0D6] shadow-[0_4px_20px_rgba(26,26,30,0.06)] hover:shadow-[0_16px_36px_rgba(26,26,30,0.12)] hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Image & Badges */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={image}
                    alt={`${city}, ${country}`}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1E]/80 via-transparent to-transparent" />
                  
                  {/* Tag Pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-[#1A1A1E] shadow-sm backdrop-blur-md">
                      {tag}
                    </span>
                  </div>

                  {/* Count Pill */}
                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E05A38] text-white shadow-sm">
                      {count} items
                    </span>
                  </div>

                  {/* Bottom Image Overlay Coordinates */}
                  <div className="absolute bottom-3 left-3.5 text-white/80 font-data text-[11px] tracking-wider">
                    {coords}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#1A1A1E] group-hover:text-[#E05A38] transition-colors">{city}</h3>
                      <p className="text-[#75747A] text-sm flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#E05A38]" /> {country}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FDEEE9] flex items-center justify-center group-hover:bg-[#E05A38] transition-colors">
                      <ArrowRight size={18} className="text-[#E05A38] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ BAZAARLINK SPOTLIGHT */}
      <section className="py-24 bg-[#FBF9F5] overflow-hidden" aria-labelledby="bazaarlink-heading">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Interactive Mockup Panel */}
            <div className="relative order-2 lg:order-1 flex flex-col gap-5">
              {/* Backpack Capacity Card */}
              <div className="bg-white border border-[#E6E0D6] rounded-3xl p-6 shadow-[0_4px_24px_rgba(26,26,30,0.06)] hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#FDEEE9] flex items-center justify-center text-[#E05A38]">
                    <Backpack size={19} aria-hidden />
                  </div>
                  <span className="font-semibold text-[#1A1A1E]">Backpack Carry Volume</span>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30">
                    Comfortable
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2 text-[#75747A]">
                    <span>Current Pack: 8.2 kg</span>
                    <span>Safe Ceiling: 15.0 kg</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EDE8DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E05A38] rounded-full transition-all duration-500" style={{ width: '55%' }} />
                  </div>
                  <p className="text-xs mt-2 text-[#9E9DA3]">55% used · 6.8 kg free headroom remaining</p>
                </div>
              </div>

              {/* Scanned Item Card */}
              <div className="bg-white border border-[#E6E0D6] rounded-3xl p-6 shadow-[0_4px_24px_rgba(26,26,30,0.06)] hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-data text-xs uppercase tracking-wider text-[#9E9DA3] font-semibold">Real-Time Scan</p>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30">
                    ✓ Fits Pack
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDEEE9] border border-[#E05A38]/20 flex items-center justify-center shrink-0">
                    <ShoppingBag size={24} className="text-[#E05A38]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A1A1E] font-bold text-base truncate">Handwoven Silk Batik Scarf</p>
                    <p className="text-sm text-[#3B5249] font-medium">Fair Value: ₹1,200 (~$15) · Weight: 0.25 kg</p>
                    <p className="text-xs text-[#9E9DA3] mt-0.5">Gemini Confidence: 96%</p>
                  </div>
                </div>
              </div>

              {/* Cash Runway Card */}
              <div className="bg-white border border-[#E6E0D6] rounded-3xl p-6 shadow-[0_4px_24px_rgba(26,26,30,0.06)] hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#FDEEE9] flex items-center justify-center text-[#E05A38]">
                    <Wallet size={19} aria-hidden />
                  </div>
                  <span className="font-semibold text-[#1A1A1E]">Cash Runway Impact</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <div className="font-display text-3xl font-bold text-[#1A1A1E] tabular-nums">14.2</div>
                    <div className="text-xs text-[#75747A]">Days remaining</div>
                  </div>
                  <ArrowRight className="text-[#D4CCC0]" size={20} aria-hidden />
                  <div className="text-left">
                    <div className="font-display text-3xl font-bold text-[#E05A38] tabular-nums">13.6</div>
                    <div className="text-xs text-[#75747A]">After item purchase</div>
                  </div>
                </div>
                <p className="text-xs mt-3 flex items-center gap-1.5 text-[#3B5249] font-medium">
                  <CheckCircle2 size={14} className="text-[#3B5249]" aria-hidden /> Trade an extra battery pack to preserve cash runway!
                </p>
              </div>

              {/* Ambient blur ornament */}
              <div aria-hidden className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[#E05A38]/8 blur-3xl pointer-events-none" />
            </div>

            {/* Right: Persuasive Copy */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FDEEE9] text-[#E05A38] border border-[#E05A38]/20 mb-4">
                <Zap size={12} className="inline text-[#E05A38]" aria-hidden /> BazaarLink™ Physical Layer
              </span>
              <h2 id="bazaarlink-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] font-bold mt-2 mb-6 leading-tight text-balance">
                Buy, Barter, or{' '}
                <span className="text-[#E05A38] italic">Skip — in 3 Taps</span>
              </h2>
              <p className="text-[#75747A] mb-8 leading-relaxed text-pretty text-base sm:text-lg">
                Never second-guess a market stall purchase again. Scan any artisan craft or souvenir to instantly calculate its weight burden on your backpack, its cost impact on your daily budget runway, and discover what you can trade from your personal inventory instead.
              </p>
              <ul className="flex flex-col gap-4 mb-10" role="list">
                {[
                  { icon: Backpack,   text: 'Real-time backpack carry capacity calculated down to the gram' },
                  { icon: Wallet,     text: 'Daily cash runway projected across your entire remaining itinerary' },
                  { icon: TrendingUp, text: 'AI-suggested barter items from your own logged gear inventory' },
                  { icon: Star,       text: 'Local language bargaining phrases and respectful etiquette guides' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#FDEEE9] flex items-center justify-center shrink-0 mt-0.5 border border-[#E05A38]/20">
                      <Icon size={16} className="text-[#E05A38]" aria-hidden />
                    </div>
                    <span className="text-[#36363D] font-medium leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/discover">
                <button
                  type="button"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#E05A38] text-white text-base font-semibold hover:bg-[#E86B4B] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(224,90,56,0.30)] cursor-pointer"
                >
                  <span>Try BazaarLink in Discovery</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ CATEGORIES */}
      <section className="py-24 bg-[#EDE8DF]/30 border-y border-[#E6E0D6]" aria-labelledby="categories-heading">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30 mb-4">
              Curated Taxonomy
            </span>
            <h2 id="categories-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-2 text-balance">
              Every Kind of{' '}
              <span className="text-[#E05A38] italic">Local Experience</span>
            </h2>
            <p className="text-[#75747A] max-w-lg mx-auto mt-3 text-pretty">
              Filtered dynamically by your walking range, energy levels, and authentic cultural interest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {CATEGORIES.map(({ icon: Icon, label, desc, color, bg }) => (
              <Link
                key={label}
                to="/discover"
                className="group relative rounded-3xl p-7 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(26,26,30,0.10)] bg-white border border-[#E6E0D6] flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: bg, color }}
                  >
                    <Icon size={26} aria-hidden />
                  </div>
                  <h3 className="font-display text-xl text-[#1A1A1E] font-bold mb-1">{label}</h3>
                  <p className="text-[#75747A] text-sm leading-relaxed">{desc}</p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F5F2EB]">
                  <span className="text-xs font-semibold text-[#9E9DA3] group-hover:text-[#E05A38] transition-colors">
                    Explore Experiences
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1"
                    style={{ background: bg, color }}
                  >
                    <ArrowRight size={15} aria-hidden />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-24 bg-[#FBF9F5]" aria-labelledby="testimonials-heading">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30 mb-4">
              Real Explorers
            </span>
            <h2 id="testimonials-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] mt-2 text-balance">
              What Explorers{' '}
              <span className="text-[#E05A38] italic">Are Saying</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, type, flag, avatar, text, score }) => (
              <article
                key={name}
                className="bg-white border border-[#E6E0D6] rounded-3xl p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(26,26,30,0.06)] hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Quote size={28} className="text-[#E05A38]/30" aria-hidden />
                    <div className="flex gap-1" aria-label={`${score} out of 5 stars`}>
                      {Array.from({ length: score }).map((_, i) => (
                        <Star key={i} size={15} className="text-[#E05A38] fill-[#E05A38]" aria-hidden />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#36363D] leading-relaxed italic text-sm sm:text-base mb-6">
                    "{text}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-[#F5F2EB]">
                  <img
                    src={avatar}
                    alt={`${name} avatar`}
                    className="w-11 h-11 rounded-full object-cover border border-[#E6E0D6]"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-[#1A1A1E] font-bold text-sm flex items-center gap-1.5">
                      {name} <span>{flag}</span>
                    </p>
                    <p className="text-[#75747A] text-xs">{type}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ PROVIDER CTA */}
      <section className="py-24 bg-[#EDE8DF]/40 relative overflow-hidden" aria-labelledby="provider-cta-heading">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E05A38]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B5249]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-white border border-[#E6E0D6] rounded-3xl shadow-[0_8px_32px_rgba(26,26,30,0.06)] p-8 sm:p-14 text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EDF2EF] text-[#3B5249] border border-[#6B8E7B]/30 mb-6">
              <Users size={12} /> For Experience Providers
            </span>
            <h2 id="provider-cta-heading" className="font-display text-4xl md:text-5xl text-[#1A1A1E] font-bold mb-6 leading-tight text-balance">
              List Your Experience.<br className="hidden md:block" /> Reach Real Travelers.
            </h2>
            <p className="text-[#75747A] text-base sm:text-lg max-w-2xl mx-auto mb-10 text-pretty">
              Get your tour, workshop, market stall, or artisan studio in front of travelers who are actively seeking what you offer — and whose budget and schedule match your pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/provider" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#E05A38] text-white text-base font-semibold hover:bg-[#E86B4B] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(224,90,56,0.30)] cursor-pointer"
                >
                  <span>Become a Provider</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/discover" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#E6E0D6] bg-[#F5F2EB] text-[#36363D] text-base font-semibold hover:bg-[#EDE8DF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Explore First</span>
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-10 text-[#75747A] text-sm">
              {['Free to list', 'Demand analytics', 'No booking fees', 'Indian heritage focus'].map(item => (
                <span key={item} className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className="text-[#3B5249]" aria-hidden /> {item}
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
