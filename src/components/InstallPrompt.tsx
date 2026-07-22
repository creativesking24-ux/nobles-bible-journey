import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === '1',
  )
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true
    setIsStandalone(standalone)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || dismissed || !deferred) return null

  return (
    <div className="install-prompt no-print fixed inset-x-0 bottom-[5.5rem] z-50 mx-auto max-w-lg px-4 landscape:bottom-14 landscape:max-w-4xl landscape:px-5 safe-x">
      <div className="surface flex items-center gap-3 rounded-2xl !p-3 shadow-2xl ring-1 ring-gold/25">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft/30 to-gold/20 text-gold">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-parchment">Install for offline use</p>
          <p className="text-xs text-parchment-muted">Home screen · works offline</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl bg-gradient-to-b from-gold-soft to-gold px-3.5 py-2 text-xs font-bold text-navy shadow-md shadow-gold/30"
          onClick={async () => {
            await deferred.prompt()
            setDeferred(null)
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="rounded-lg p-1.5 text-parchment-muted hover:text-parchment"
          aria-label="Dismiss"
          onClick={() => {
            setDismissed(true)
            localStorage.setItem('pwa-install-dismissed', '1')
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
