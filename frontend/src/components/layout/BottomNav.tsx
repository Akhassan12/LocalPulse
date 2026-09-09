import React from 'react'
import { NavLink } from 'react-router-dom'
import { Compass, BookMarked, Map, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/discover',  label: 'Discover',  icon: Compass },
  { to: '/itinerary', label: 'Itinerary', icon: BookMarked },
  { to: '/map',       label: 'Map',       icon: Map },
  { to: '/settings',  label: 'Settings',  icon: Settings },
]

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[#C9A84C]/20 safe-area-pb"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch" role="list">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) => [
                'flex flex-col items-center justify-center gap-1 py-3 w-full transition-all duration-150 text-xs font-medium',
                isActive
                  ? 'text-[#C9A84C]'
                  : 'text-white/50 hover:text-white/80',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  <span className={['p-1.5 rounded-[8px] transition-all duration-150', isActive ? 'bg-[#C9A84C]/20' : ''].join(' ')}>
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
