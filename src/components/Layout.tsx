import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Home,
  NotebookPen,
  Trophy,
} from 'lucide-react'
import { InstallPrompt } from './InstallPrompt'
import { OfflineBanner } from './OfflineBanner'

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/schedule', label: 'Plan', icon: BookOpen },
  { to: '/calendar', label: 'Year', icon: CalendarDays },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/progress', label: 'Wins', icon: Trophy },
]

export function Layout() {
  const location = useLocation()
  const hideNav =
    location.pathname.startsWith('/day/') || location.pathname === '/settings'

  return (
    <div className="app-frame relative mx-auto flex min-h-dvh max-w-lg flex-col">
      <OfflineBanner />
      <div className={`flex-1 overflow-x-hidden ${hideNav ? 'pb-6' : 'pb-28'}`}>
        <Outlet />
      </div>

      <InstallPrompt />

      {!hideNav && (
        <nav className="no-print fixed inset-x-0 bottom-0 z-40 px-3 safe-pb">
          <div className="mx-auto mb-2 max-w-lg">
            <div className="nav-dock flex items-stretch justify-between gap-0.5 rounded-[1.4rem] p-1.5">
              {tabs.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.05rem] px-1 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'nav-item-active'
                        : 'text-parchment-muted hover:text-parchment'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-[1.35rem] w-[1.35rem] transition-transform duration-200 ${
                          isActive ? 'scale-110' : ''
                        }`}
                        strokeWidth={isActive ? 2.4 : 1.9}
                        aria-hidden
                      />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
