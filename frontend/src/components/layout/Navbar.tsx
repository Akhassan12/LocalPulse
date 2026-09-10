import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Compass,
  Map,
  BookMarked,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_LINKS = [
  { to: '/discover',  label: 'Discover',  icon: Compass },
  { to: '/itinerary', label: 'Itinerary', icon: BookMarked },
  { to: '/provider',  label: 'For Hosts', icon: LayoutDashboard },
  { to: '/settings',  label: 'Settings',  icon: Settings },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [userDropOpen, setUserDropOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, signOut } = useAuth()

  const isLanding  = location.pathname === '/'
  const isDarkPage = ['/auth', '/login', '/signin', '/signup'].includes(location.pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setUserDropOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    setUserDropOpen(false)
    navigate('/')
  }

  const userDisplayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Explorer'
  const userInitial = userDisplayName.charAt(0).toUpperCase()

  /* === Header style logic === */
  const isTransparent = isLanding && !scrolled
  const headerClass = isTransparent
    ? 'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-transparent border-b border-transparent py-2'
    : isDarkPage
    ? 'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-[#070E17]/90 backdrop-blur-md border-b border-white/10 shadow-md py-0'
    : 'fixed top-0 left-0 right-0 z-40 transition-all duration-300 navbar-warm py-0'

  const logoTextColor   = isTransparent || isDarkPage ? 'text-white' : 'text-[#1A1A1E]'
  const logoAccentColor = isTransparent || isDarkPage ? 'text-[#C9A84C]' : 'text-[#E05A38]'
  const navLinkBase     = isTransparent || isDarkPage
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-[#36363D] hover:text-[#1A1A1E] hover:bg-[#EDE8DF]'
  const navLinkActive   = isTransparent || isDarkPage
    ? 'bg-white/10 text-white font-semibold'
    : 'bg-[#FDEEE9] text-[#E05A38] font-semibold'

  return (
    <header className={headerClass}>
      <nav className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">

          {/* ─── Logo ─── */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none" aria-label="LocalPulse home">
            <div className="w-9 h-9 rounded-xl bg-[#E05A38] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(224,90,56,0.45)] transition-all duration-300">
              <Map size={18} className="text-white" aria-hidden />
            </div>
            <span className={`font-display text-xl font-bold tracking-tight transition-colors ${logoTextColor}`}>
              Local<span className={logoAccentColor}>Pulse</span>
            </span>
          </Link>

          {/* ─── Desktop Nav Links ─── */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                      isActive ? navLinkActive : navLinkBase
                    }`
                  }
                >
                  <Icon size={15} className="opacity-70" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ─── Desktop User / Auth ─── */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropOpen(!userDropOpen)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all text-left cursor-pointer ${
                    isTransparent || isDarkPage
                      ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15'
                      : 'bg-[#F5F2EB] hover:bg-[#EDE8DF] border-[#E6E0D6]'
                  }`}
                  aria-expanded={userDropOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E05A38] to-[#F07A5A] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {userInitial}
                  </div>
                  <div className="hidden xl:block">
                    <div className={`text-xs font-semibold leading-tight ${isTransparent || isDarkPage ? 'text-white' : 'text-[#1A1A1E]'}`}>
                      {userDisplayName}
                    </div>
                    <div className="text-[10px] text-[#E05A38]">Verified Explorer</div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${userDropOpen ? 'rotate-180' : ''} ${isTransparent || isDarkPage ? 'text-white/60' : 'text-[#75747A]'}`}
                  />
                </button>

                {/* Dropdown */}
                {userDropOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E6E0D6] shadow-[0_20px_60px_-12px_rgba(26,26,30,0.15)] p-2 z-50 animate-fade-in-up">
                    <div className="px-3 py-2.5 border-b border-[#F5F2EB] mb-1">
                      <div className="text-xs font-semibold text-[#1A1A1E] truncate">{user.email}</div>
                      <div className="text-[10px] text-[#E05A38] flex items-center gap-1 mt-0.5">
                        <Sparkles size={10} /> Active Session
                      </div>
                    </div>

                    <Link to="/itinerary" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#36363D] hover:text-[#1A1A1E] hover:bg-[#F5F2EB] transition-colors" onClick={() => setUserDropOpen(false)}>
                      <BookMarked size={14} className="text-[#E05A38]" />
                      <span>My Itinerary</span>
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#36363D] hover:text-[#1A1A1E] hover:bg-[#F5F2EB] transition-colors" onClick={() => setUserDropOpen(false)}>
                      <Settings size={14} className="text-[#E05A38]" />
                      <span>Expedition Settings</span>
                    </Link>

                    <div className="border-t border-[#F5F2EB] my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    isTransparent || isDarkPage
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-[#E6E0D6] text-[#36363D] hover:bg-[#EDE8DF]'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-full bg-[#E05A38] text-white text-sm font-semibold hover:bg-[#E86B4B] shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ─── Mobile Hamburger ─── */}
          <button
            className={`lg:hidden p-2.5 rounded-xl transition-colors cursor-pointer ${
              isTransparent || isDarkPage ? 'text-white/90 hover:bg-white/10' : 'text-[#36363D] hover:bg-[#EDE8DF]'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E6E0D6] animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F2EB] border border-[#E6E0D6] mb-2">
                <div className="w-10 h-10 rounded-full bg-[#E05A38] text-white font-bold text-sm flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-[#1A1A1E]">{userDisplayName}</div>
                  <div className="text-xs text-[#75747A] truncate">{user.email}</div>
                </div>
              </div>
            )}

            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#FDEEE9] text-[#E05A38] font-semibold'
                      : 'text-[#36363D] hover:bg-[#F5F2EB]'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} className="opacity-70" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="border-t border-[#E6E0D6] my-2" />

            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#EF4444] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center py-3 rounded-xl border border-[#E6E0D6] text-sm font-semibold text-[#36363D] hover:bg-[#F5F2EB] transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center py-3 rounded-xl bg-[#E05A38] text-white text-sm font-semibold hover:bg-[#E86B4B] transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
