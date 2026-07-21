import { Moon, Sun } from 'lucide-react'
import { useJourneyStore } from '../store/useJourneyStore'

interface ThemeToggleProps {
  /** icon = compact button; segmented = Dark | Light pills */
  variant?: 'icon' | 'segmented'
  className?: string
}

export function ThemeToggle({ variant = 'segmented', className = '' }: ThemeToggleProps) {
  const darkMode = useJourneyStore((s) => s.settings.darkMode)
  const updateSettings = useJourneyStore((s) => s.updateSettings)

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => updateSettings({ darkMode: !darkMode })}
        className={`surface card-press flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-parchment-muted transition hover:text-gold ${className}`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    )
  }

  return (
    <div className={`theme-toggle ${className}`} role="group" aria-label="Color theme">
      <button
        type="button"
        className={!darkMode ? 'active' : ''}
        onClick={() => updateSettings({ darkMode: false })}
        aria-pressed={!darkMode}
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </button>
      <button
        type="button"
        className={darkMode ? 'active' : ''}
        onClick={() => updateSettings({ darkMode: true })}
        aria-pressed={darkMode}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </button>
    </div>
  )
}
