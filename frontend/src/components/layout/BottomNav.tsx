import { NavLink } from 'react-router-dom'
import { Compass, BookMarked, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/discover',  label: 'Discover',  icon: Compass },
  { to: '/itinerary', label: 'Itinerary', icon: BookMarked },
  { to: '/settings',  label: 'Settings',  icon: Settings },
]

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E6E0D6] safe-area-pb shadow-lg"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch" role="list">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) => [
                'flex flex-col items-center justify-center gap-1 py-3 w-full transition-all duration-150 text-xs font-semibold',
                isActive
                  ? 'text-[#E05A38]'
                  : 'text-[#75747A] hover:text-[#1A1A1E]',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  <span className={['p-1.5 rounded-xl transition-all duration-150', isActive ? 'bg-[#FDEEE9]' : ''].join(' ')}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
