import { Link } from 'react-router-dom'
import { Highlighter, Trash2 } from 'lucide-react'
import { EmptyState, PageHeader, PageShell, Surface } from '../components/ui'
import type { HighlightColor } from '../types'
import { useJourneyStore } from '../store/useJourneyStore'

const SWATCH: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-400',
  blue: 'bg-sky-400',
  pink: 'bg-pink-400',
  orange: 'bg-orange-400',
}

const ROW_BG: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-400/20',
  green: 'bg-emerald-400/20',
  blue: 'bg-sky-400/20',
  pink: 'bg-pink-400/20',
  orange: 'bg-orange-400/20',
}

export function HighlightsPage() {
  const highlights = useJourneyStore((s) => s.highlights)
  const clearHighlight = useJourneyStore((s) => s.clearHighlight)
  const days = useJourneyStore((s) => s.days)

  const list = Object.values(highlights).sort((a, b) => {
    if (a.passageRef === b.passageRef) return a.verse - b.verse
    return a.passageRef.localeCompare(b.passageRef)
  })

  const findDayForPassage = (passageRef: string) => {
    // ROM.1 → match days whose reading includes that chapter via ref parse is complex;
    // best-effort: match book chapter in reading string loosely
    const [book, chap] = passageRef.split('.')
    return days.find((d) => {
      // crude: days store reading labels; open schedule instead if no match
      return d.reading.toUpperCase().includes(book.slice(0, 3)) || d.reading.includes(chap)
    })
  }

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow="Saved verses"
        title="Highlights"
        subtitle={`${list.length} verse${list.length === 1 ? '' : 's'} highlighted`}
      />

      {list.length === 0 ? (
        <EmptyState
          title="No highlights yet"
          body="Open a day’s Scripture reading and tap a verse to highlight it in yellow, green, blue, pink, or orange."
          action={
            <Link to="/schedule" className="btn-primary !w-auto px-6">
              Open study plan
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((h) => {
            const day = findDayForPassage(h.passageRef)
            return (
              <Surface
                key={`${h.passageRef}:${h.verse}`}
                className={`!p-4 ${ROW_BG[h.color]}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${SWATCH[h.color]}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-gold">
                      {h.label || h.passageRef}:{h.verse}
                    </p>
                    <p className="mt-1.5 font-serif text-sm leading-relaxed text-parchment">
                      <sup className="mr-1 font-bold text-gold">{h.verse}</sup>
                      {h.text || '…'}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      {day && (
                        <Link
                          to={`/day/${day.id}`}
                          className="text-xs font-semibold text-gold"
                        >
                          Open day
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => clearHighlight(h.passageRef, h.verse)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-parchment-muted hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Surface>
            )
          })}
        </div>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-parchment-muted">
        <Highlighter className="h-3.5 w-3.5 text-gold" />
        Highlights stay on this device
      </p>
    </PageShell>
  )
}
