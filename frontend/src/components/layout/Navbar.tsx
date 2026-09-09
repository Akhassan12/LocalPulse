import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Compass,
  Map,
  BookMarked,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const NAV_LINKS = [
  { to: '/discover',  label: 'Discover',   icon: Compass },
  { to: '/itinerary', label: 'Itinerary',  icon: BookMarked },
  { to: '/provider',  label: 'Provider',   icon: LayoutDashboard },
  { to: '/settings',  label: 'Settings',   icon: Settings },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const isLanding = location.pathname === '/'

  // Dynamic header blur when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on route changes
  useEffect(() => {
    setUserDropdownOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    setUserDropdownOpen(false)
    navigate('/')
  }

  const userDisplayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Explorer'

  const userInitial = userDisplayName.charAt(0).toUpperCase()

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isLanding && !scrolled
          ? 'bg-transparent border-b border-transparent py-2'
          : 'bg-[#0D1B2A]/90 backdrop-blur-md border-b border-white/10 shadow-md py-0',
      ].join(' ')}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="LocalPulse home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(201,168,76,0.5)] transition-all duration-300">
              <Map size={20} className="text-[#0D1B2A]" aria-hidden />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Local<span className="text-[#C9A84C]">Pulse</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-1.5" role="list">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => [
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2',
                    isActive
                      ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-semibold shadow-inner'
                      : 'text-white/75 hover:text-white hover:bg-white/10',
                  ].join(' ')}
                >
                  <Icon size={16} className="text-[#C9A84C]/80" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop User / Auth Area */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-all text-left cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#DFC272] text-[#0D1B2A] font-bold text-xs flex items-center justify-center shadow-sm">
                    {userInitial}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {userDisplayName}
                    </div>
                    <div className="text-[10px] text-[#C9A84C]">Verified Explorer</div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/60 transition-transform ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0D1B2A] border border-[#C9A84C]/30 shadow-2xl p-2 z-50 animate-fade-in-up">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                      <div className="text-xs font-semibold text-white truncate">
                        {user.email}
                      </div>
                      <div className="text-[10px] text-[#C9A84C] flex items-center gap-1 mt-0.5">
                        <Sparkles size={10} /> Active Session
                      </div>
                    </div>

                    <Link
                      to="/itinerary"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <BookMarked size={14} className="text-[#C9A84C]" />
                      <span>My Itinerary</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings size={14} className="text-[#C9A84C]" />
                      <span>Traveler Settings</span>
                    </Link>

                    <div className="border-t border-white/10 my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="secondary" size="sm" className="border-[#C9A84C]/80 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="font-semibold shadow-md">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#070E17]/98 backdrop-blur-xl border-t border-white/10 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/10 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-[#0D1B2A] font-bold text-sm flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white">{userDisplayName}</div>
                  <div className="text-xs text-white/50 truncate">{user.email}</div>
                </div>
              </div>
            )}

            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => [
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10',
                ].join(' ')}
              >
                <Icon size={18} className="text-[#C9A84C]" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-sm font-semibold cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="secondary" size="md" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="primary" size="md" className="w-full justify-center">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
