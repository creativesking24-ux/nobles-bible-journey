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
    <div className="app-frame app-shell relative mx-auto flex min-h-dvh w-full max-w-lg flex-col landscape:max-w-4xl">
      <OfflineBanner />
      <div
        className={`main-scroll flex-1 overflow-x-hidden ${
          hideNav ? 'pb-6 landscape:pb-4' : 'pb-28 landscape:pb-16'
        }`}
      >
        <Outlet />
      </div>

      <InstallPrompt />

      {!hideNav && (
        <nav className="app-nav no-print fixed inset-x-0 bottom-0 z-40 px-3 landscape:px-4 safe-pb safe-x">
          <div className="nav-inner mx-auto mb-2 max-w-lg landscape:mb-1.5 landscape:max-w-4xl">
            <div className="nav-dock flex items-stretch justify-between gap-0.5 rounded-[1.4rem] p-1.5 landscape:gap-1 landscape:rounded-2xl landscape:px-2 landscape:py-1">
              {tabs.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `nav-link flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.05rem] px-1 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 landscape:flex-row landscape:justify-center landscape:gap-1.5 landscape:rounded-xl landscape:px-2 landscape:py-1.5 landscape:text-[11px] ${
                      isActive
                        ? 'nav-item-active'
                        : 'text-parchment-muted hover:text-parchment'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-[1.35rem] w-[1.35rem] shrink-0 transition-transform duration-200 landscape:h-4 landscape:w-4 ${
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
