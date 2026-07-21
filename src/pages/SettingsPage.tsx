import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookMarked,
  Cloud,
  Info,
  Palette,
  Shield,
  User,
} from 'lucide-react'
import { BibleVersionPicker } from '../components/BibleVersionPicker'
import { ThemeToggle } from '../components/ThemeToggle'
import { PageHeader, PageShell, Surface } from '../components/ui'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useJourneyStore } from '../store/useJourneyStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const settings = useJourneyStore((s) => s.settings)
  const updateSettings = useJourneyStore((s) => s.updateSettings)
  const { online, pendingCount, lastSyncedAt, syncing, syncNow } = useOnlineStatus()

  return (
    <PageShell className="animate-fade-up">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-parchment-muted ring-1 ring-white/10"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <PageHeader eyebrow="Preferences" title="Settings" />

      <div className="space-y-4">
        <Surface className="!p-4">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Profile</h2>
          </div>
          <label className="section-label mb-1.5 block">Name on certificate</label>
          <input
            className="field"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Your name"
          />
        </Surface>

        <Surface className="!p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gold" />
              <div>
                <h2 className="font-semibold text-parchment">Appearance</h2>
                <p className="text-xs text-parchment-muted">
                  {settings.darkMode ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
          <p className="text-xs leading-relaxed text-parchment-muted">
            Preference is saved on this device and applied across the app.
          </p>
        </Surface>

        <Surface className="!p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Bible version</h2>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-parchment-muted">
            Versions available to your YouVersion App Key (licensed on platform.youversion.com).
            Switching reloads Scripture on Daily readings.
          </p>
          <BibleVersionPicker />
        </Surface>

        <Surface className="!p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Journey window</h2>
          </div>
          <p className="text-sm leading-relaxed text-parchment-muted">
            Dates follow the PDF plan:{' '}
            <span className="font-semibold text-parchment">
              June 15 – September 20, 2026
            </span>{' '}
            (14 weeks). You can still check off any day anytime.
          </p>
        </Surface>

        <Surface className="!p-4">
          <div className="mb-3 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Offline & sync</h2>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-parchment-muted">
            <li>
              Status:{' '}
              <strong className="text-parchment">
                {online ? 'Online' : 'Offline'}
              </strong>
            </li>
            <li>
              Pending changes:{' '}
              <strong className="text-parchment">{pendingCount}</strong>
            </li>
            <li>
              Last sync:{' '}
              <strong className="text-parchment">
                {lastSyncedAt
                  ? new Date(lastSyncedAt).toLocaleString()
                  : 'Not yet'}
              </strong>
            </li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-parchment-muted">
            Mark days complete, notes, journal, and highlights save on this device
            immediately — even offline. When you reconnect, pending changes sync
            automatically (ready for a future cloud account).
          </p>
          <button
            type="button"
            disabled={!online || syncing}
            onClick={() => void syncNow()}
            className="btn-primary mt-3"
          >
            {syncing ? 'Syncing…' : online ? 'Sync now' : 'Connect to sync'}
          </button>
        </Surface>

        <Surface className="!p-4">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Privacy</h2>
          </div>
          <p className="text-sm leading-relaxed text-parchment-muted">
            Progress, notes, and journal stay in this browser only. Install the app for
            the best offline experience. Clear site data to reset.
          </p>
        </Surface>

        <p className="px-1 text-center text-xs leading-relaxed text-parchment-muted">
          Noble&apos;s Bible Journey · Epistles + Proverbs + Revelation
          <br />
          <span className="italic text-gold/80">
            May the Lord strengthen you for this journey.
          </span>
        </p>
      </div>
    </PageShell>
  )
}
