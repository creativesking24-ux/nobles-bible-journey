import { Check } from 'lucide-react'
import { PageHeader, PageShell, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

export function MemoryPage() {
  const weeks = useJourneyStore((s) => s.weeks)
  const setMemoryVerse = useJourneyStore((s) => s.setMemoryVerse)
  const toggleMemoryMastered = useJourneyStore((s) => s.toggleMemoryMastered)
  const mastered = weeks.filter((w) => w.memoryVerseMastered).length
  const pct = Math.round((mastered / 14) * 100)

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow="Hide them in your heart"
        title="Memory verses"
        subtitle={`${mastered} of 14 mastered`}
      />

      {/* Progress strip */}
      <Surface className="mb-4 !p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-parchment-muted">Mastery progress</span>
          <span className="font-bold tabular-nums text-gold">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold-soft transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Surface>

      <p className="mb-4 text-sm leading-relaxed text-parchment-muted">
        Write each weekly verse from memory, then mark it mastered — same flow as the
        paper tracker.
      </p>

      <div className="space-y-3">
        {weeks.map((w, i) => (
          <article
            key={w.weekNumber}
            className="surface animate-fade-up rounded-2xl p-4"
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      w.memoryVerseMastered
                        ? 'bg-gold text-navy'
                        : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
                    }`}
                  >
                    {w.weekNumber}
                  </span>
                  <h2 className="font-semibold text-parchment">Week {w.weekNumber}</h2>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-parchment-muted">
                  {w.theme}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleMemoryMastered(w.weekNumber)}
                className={`card-press flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition ${
                  w.memoryVerseMastered
                    ? 'bg-success/15 text-success ring-1 ring-success/30'
                    : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
                }`}
              >
                {w.memoryVerseMastered && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {w.memoryVerseMastered ? 'Done' : 'Master'}
              </button>
            </div>
            <textarea
              className="field mt-3"
              rows={2}
              placeholder="Verse reference or full text…"
              value={w.memoryVerse}
              onChange={(e) => setMemoryVerse(w.weekNumber, e.target.value)}
            />
            {w.memoryVerseMasteredDate && (
              <p className="mt-2 text-xs font-medium text-success">
                Mastered {w.memoryVerseMasteredDate}
              </p>
            )}
          </article>
        ))}
      </div>
    </PageShell>
  )
}
