import { useEffect } from 'react'
import { CloudOff, CloudUpload, Loader2, Wifi, WifiOff, X } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function OfflineBanner() {
  const {
    online,
    pendingCount,
    syncing,
    lastSyncResult,
    syncNow,
    clearSyncMessage,
  } = useOnlineStatus()

  useEffect(() => {
    if (!lastSyncResult) return
    const t = window.setTimeout(() => clearSyncMessage(), 4000)
    return () => window.clearTimeout(t)
  }, [lastSyncResult, clearSyncMessage])

  if (online && !syncing && !lastSyncResult && pendingCount === 0) {
    return null
  }

  if (!online) {
    return (
      <div className="offline-banner-wrap no-print sticky top-0 z-50 app-gutter-x pt-2.5 safe-pt">
        <div className="surface mx-auto flex max-w-lg items-start gap-3 rounded-2xl !p-3 ring-1 ring-orange-400/25 landscape:max-w-4xl">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-parchment">Offline mode</p>
            <p className="mt-0.5 text-xs leading-relaxed text-parchment-muted">
              You can still mark days complete, write notes, and highlight verses.
              Changes save on this device
              {pendingCount > 0
                ? ` (${pendingCount} waiting to sync)`
                : ''}
              . They’ll update when you’re back online.
            </p>
          </div>
          <CloudOff className="mt-1 h-4 w-4 shrink-0 text-parchment-muted" />
        </div>
      </div>
    )
  }

  if (syncing) {
    return (
      <div className="offline-banner-wrap no-print sticky top-0 z-50 app-gutter-x pt-2.5 safe-pt">
        <div className="surface mx-auto flex max-w-lg items-center gap-3 rounded-2xl !p-3 landscape:max-w-4xl">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
          <p className="text-xs font-semibold text-parchment-muted">
            Syncing offline changes…
          </p>
        </div>
      </div>
    )
  }

  if (lastSyncResult) {
    return (
      <div className="offline-banner-wrap no-print sticky top-0 z-50 app-gutter-x pt-2.5 safe-pt">
        <div className="surface mx-auto flex max-w-lg items-center gap-3 rounded-2xl !p-3 ring-1 ring-success/30 landscape:max-w-4xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
            <Wifi className="h-4 w-4" />
          </div>
          <p className="min-w-0 flex-1 text-xs font-semibold text-parchment">
            {lastSyncResult}
          </p>
          <button
            type="button"
            onClick={clearSyncMessage}
            className="rounded-lg p-1 text-parchment-muted"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div className="offline-banner-wrap no-print sticky top-0 z-50 app-gutter-x pt-2.5 safe-pt">
        <div className="surface mx-auto flex max-w-lg items-center gap-3 rounded-2xl !p-3 landscape:max-w-4xl">
          <CloudUpload className="h-4 w-4 text-gold" />
          <p className="min-w-0 flex-1 text-xs text-parchment-muted">
            {pendingCount} change{pendingCount === 1 ? '' : 's'} ready to sync
          </p>
          <button
            type="button"
            onClick={() => void syncNow()}
            className="rounded-lg bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30"
          >
            Sync now
          </button>
        </div>
      </div>
    )
  }

  return null
}
