import { Link } from 'react-router-dom'
import { Map, ArrowRight, Globe, MessageCircle, Share2 } from 'lucide-react'

const LINKS = {
  product: [
    { label: 'Discover',       to: '/discover' },
    { label: 'Itinerary',      to: '/itinerary' },
    { label: 'BazaarLink',     to: '/discover' },
    { label: 'For Providers',  to: '/provider' },
  ],
  company: [
    { label: 'About',    to: '/' },
    { label: 'Blog',     to: '/' },
    { label: 'Careers',  to: '/' },
    { label: 'Press',    to: '/' },
  ],
  legal: [
    { label: 'Privacy Policy',    to: '/' },
    { label: 'Terms of Service',  to: '/' },
    { label: 'Cookie Policy',     to: '/' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1E] text-white/70" role="contentinfo">
      {/* Newsletter — warm sand strip inside dark footer */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-1">Stay in the loop</h3>
              <p className="text-white/50 text-sm">Travel tips, new destinations, and BazaarLink updates.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email address for newsletter"
                className="flex-1 md:w-72 px-4 py-3 rounded-[10px] bg-white/[0.07] border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-[#E05A38] transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#E05A38] hover:bg-[#E86B4B] text-white font-semibold rounded-[10px] transition-colors flex items-center gap-2 text-sm hover:-translate-y-px transition-all"
              >
                Subscribe <ArrowRight size={16} aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group" aria-label="LocalPulse home">
              <div className="w-10 h-10 rounded-[12px] bg-[#E05A38] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(224,90,56,0.5)] transition-shadow">
                <Map size={20} className="text-white" aria-hidden />
              </div>
              <span className="font-display text-2xl font-bold text-white">
                Local<span className="text-[#E05A38]">Pulse</span>
              </span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Discover local experiences that fit your real constraints — time, budget, backpack space, and barter potential.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={['Website', 'Social', 'Share'][i]}
                  className="w-9 h-9 rounded-full bg-white/[0.07] hover:bg-[#E05A38]/20 hover:text-[#E05A38] flex items-center justify-center transition-all duration-150 border border-white/10"
                >
                  <Icon size={16} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, typeof LINKS.product][]).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white/90 font-semibold text-xs uppercase tracking-widest mb-5">
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </h4>
              <ul className="flex flex-col gap-3" role="list">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/45 hover:text-[#E05A38] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/35">
          <p>© {new Date().getFullYear()} LocalPulse. All rights reserved.</p>
          <p>Built for real travelers, not algorithms.</p>
        </div>
      </div>
    </footer>
  )
}
