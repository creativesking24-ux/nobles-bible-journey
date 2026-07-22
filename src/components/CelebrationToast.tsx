import { useEffect } from 'react'
import { Flame, PartyPopper, Sparkles, X } from 'lucide-react'

export type Celebration =
  | { type: 'day'; reading: string }
  | { type: 'week'; weekNumber: number }
  | { type: 'streak'; days: number }
  | null

interface CelebrationToastProps {
  celebration: Celebration
  onDismiss: () => void
}

export function CelebrationToast({ celebration, onDismiss }: CelebrationToastProps) {
  useEffect(() => {
    if (!celebration) return
    const ms = celebration.type === 'week' ? 4500 : 3200
    const t = window.setTimeout(onDismiss, ms)
    return () => window.clearTimeout(t)
  }, [celebration, onDismiss])

  if (!celebration) return null

  const isWeek = celebration.type === 'week'
  const title =
    celebration.type === 'week'
      ? `Week ${celebration.weekNumber} complete!`
      : celebration.type === 'streak'
        ? `${celebration.days}-day streak!`
        : 'Well done!'
  const body =
    celebration.type === 'week'
      ? 'You finished every day this week. Rest in that faithfulness.'
      : celebration.type === 'streak'
        ? 'Keep showing up — consistency builds a life of the Word.'
        : `“${celebration.reading}” is checked off. The Word is at work.`

  return (
    <div className="celebration-toast no-print pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center app-gutter-x pt-3 safe-pt">
      <div
        className={`pointer-events-auto surface animate-celebrate flex w-full max-w-lg items-start gap-3 rounded-2xl !p-4 ring-1 ${
          isWeek ? 'ring-gold/50' : 'ring-success/35'
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isWeek
              ? 'bg-gold/20 text-gold'
              : celebration.type === 'streak'
                ? 'bg-orange-500/20 text-orange-300'
                : 'bg-success/20 text-success'
          }`}
        >
          {isWeek ? (
            <PartyPopper className="h-5 w-5" />
          ) : celebration.type === 'streak' ? (
            <Flame className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-bold text-parchment">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-parchment-muted">{body}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-parchment-muted"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
