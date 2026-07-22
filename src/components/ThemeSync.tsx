import { useEffect } from 'react'
import { useJourneyStore } from '../store/useJourneyStore'

/** Applies dark/light class on <html> and updates theme-color meta. */
export function ThemeSync() {
  const darkMode = useJourneyStore((s) => s.settings.darkMode)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    root.classList.toggle('light', !darkMode)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', darkMode ? '#0a1420' : '#F3EEE4')
    }

    // Keep localStorage in sync for flash-prevention script
    try {
      localStorage.setItem('nobles-theme', darkMode ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [darkMode])

  return null
}
