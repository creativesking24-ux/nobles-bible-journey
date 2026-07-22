import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Home,
  Menu,
  NotebookPen,
  Trophy,
} from 'lucide-react'
import { InstallPrompt } from './InstallPrompt'
import { OfflineBanner } from './OfflineBanner'

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/schedule', label: 'Schedule', icon: BookOpen },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/progress', label: 'Progress', icon: Trophy },
  { to: '/more', label: 'More', icon: Menu },
]

export function Layout() {
  const location = useLocation()
  // Full reading view only — keep nav on More / Settings for discoverability
  const hideNav = location.pathname.startsWith('/day/')
  const moreActive = ['/more', '/memory', '/highlights', '/calendar', '/settings'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
  )

  return (
    <div className="app-frame app-shell relative mx-auto flex min-h-dvh w-full max-w-lg flex-col landscape:max-w-4xl">
      <OfflineBanner />
      <div
        className={`main-scroll page-transition flex-1 overflow-x-hidden ${
          hideNav ? 'pb-6 landscape:pb-4' : 'pb-28 landscape:pb-16'
        }`}
        key={location.pathname}
      >
        <Outlet />
      </div>

      <InstallPrompt />

      {!hideNav && (
        <nav
          className="app-nav no-print fixed inset-x-0 bottom-0 z-40 app-gutter-x safe-pb"
          aria-label="Main"
        >
          <div className="nav-inner mx-auto mb-2.5 max-w-lg landscape:mb-2 landscape:max-w-4xl">
            <div className="nav-dock flex items-stretch justify-between gap-0.5 rounded-[1.4rem] p-1.5 landscape:gap-1 landscape:rounded-2xl landscape:px-2.5 landscape:py-1.5">
              {tabs.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => {
                    const on = to === '/more' ? moreActive : isActive
                    return `nav-link flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.05rem] px-1 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 landscape:flex-row landscape:justify-center landscape:gap-1.5 landscape:rounded-xl landscape:px-2 landscape:py-1.5 landscape:text-[11px] ${
                      on
                        ? 'nav-item-active'
                        : 'text-parchment-muted hover:text-parchment'
                    }`
                  }}
                >
                  {({ isActive }) => {
                    const on = to === '/more' ? moreActive : isActive
                    return (
                      <>
                        <Icon
                          className={`h-[1.35rem] w-[1.35rem] shrink-0 transition-transform duration-200 landscape:h-4 landscape:w-4 ${
                            on ? 'scale-110' : ''
                          }`}
                          strokeWidth={on ? 2.4 : 1.9}
                          aria-hidden
                        />
                        <span className="truncate">{label}</span>
                      </>
                    )
                  }}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
