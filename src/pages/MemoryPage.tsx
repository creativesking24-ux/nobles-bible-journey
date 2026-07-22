import { useEffect, useRef, useState } from 'react'
import { BookMarked, Check, Loader2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader, PageShell, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

export function MemoryPage() {
  const weeks = useJourneyStore((s) => s.weeks)
  const setMemoryVerse = useJourneyStore((s) => s.setMemoryVerse)
  const toggleMemoryMastered = useJourneyStore((s) => s.toggleMemoryMastered)
  const mastered = weeks.filter((w) => w.memoryVerseMastered).length
  const pct = Math.round((mastered / 14) * 100)
  const hasAnyVerse = weeks.some((w) => w.memoryVerse.trim().length > 0)
  const firstEmpty = weeks.find((w) => !w.memoryVerse.trim())

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow="Hide them in your heart"
        title="Memory verses"
        subtitle={`${mastered} of 14 mastered`}
      />

      {/* Progress strip */}
      <Surface className="mb-5 !p-4">
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="font-medium text-parchment-muted">Mastery progress</span>
          <span className="font-bold tabular-nums text-gold">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold-soft transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Surface>

      {!hasAnyVerse && (
        <div className="mb-5">
          <EmptyState
            icon={<BookMarked className="h-6 w-6" />}
            eyebrow="Start small"
            title="Write one verse this week"
            body="Each week has room for a memory verse. Type the reference or full text below, practice it, then mark Mastered when it’s in your heart."
            action={
              firstEmpty ? (
                <a href={`#week-${firstEmpty.weekNumber}`} className="btn-primary !py-3.5">
                  Begin with Week {firstEmpty.weekNumber}
                </a>
              ) : undefined
            }
          />
        </div>
      )}

      {hasAnyVerse && (
        <p className="mb-5 text-sm leading-relaxed text-parchment-muted">
          Write each weekly verse from memory, then mark it mastered — same flow as the
          paper tracker. Changes save automatically.
        </p>
      )}

      <div className="space-y-3.5">
        {weeks.map((w, i) => (
          <MemoryCard
            key={w.weekNumber}
            weekNumber={w.weekNumber}
            theme={w.theme}
            memoryVerse={w.memoryVerse}
            mastered={w.memoryVerseMastered}
            masteredDate={w.memoryVerseMasteredDate}
            delay={i * 0.02}
            onChange={(v) => setMemoryVerse(w.weekNumber, v)}
            onToggleMastered={() => toggleMemoryMastered(w.weekNumber)}
          />
        ))}
      </div>
    </PageShell>
  )
}

function MemoryCard({
  weekNumber,
  theme,
  memoryVerse,
  mastered,
  masteredDate,
  delay,
  onChange,
  onToggleMastered,
}: {
  weekNumber: number
  theme: string
  memoryVerse: string
  mastered: boolean
  masteredDate: string | null
  delay: number
  onChange: (v: string) => void
  onToggleMastered: () => void
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>(
    memoryVerse ? 'saved' : 'idle',
  )
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setStatus(memoryVerse ? 'saved' : 'idle')
  }, [weekNumber, memoryVerse])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const handleChange = (v: string) => {
    onChange(v)
    setStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus(v.trim() ? 'saved' : 'idle'), 400)
  }

  return (
    <article
      id={`week-${weekNumber}`}
      className="surface animate-fade-up scroll-mt-24 rounded-[1.35rem] p-5"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                mastered
                  ? 'bg-gold text-navy'
                  : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
              }`}
            >
              {weekNumber}
            </span>
            <h2 className="font-semibold text-parchment">Week {weekNumber}</h2>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-parchment-muted">
            {theme}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleMastered}
          className={`card-press flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            mastered
              ? 'bg-success/15 text-success ring-1 ring-success/30'
              : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
          }`}
        >
          {mastered && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          {mastered ? 'Done' : 'Master'}
        </button>
      </div>

      <div className="mt-1 flex justify-end">
        {status === 'saving' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-parchment-muted">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving
          </span>
        )}
        {status === 'saved' && memoryVerse.trim() && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-success">
            <Check className="h-3 w-3" strokeWidth={3} /> Saved
          </span>
        )}
      </div>

      <textarea
        className="field field-notes mt-2 min-h-[4.5rem] text-[0.95rem] leading-relaxed"
        rows={3}
        placeholder="Verse reference or full text…"
        value={memoryVerse}
        onChange={(e) => handleChange(e.target.value)}
      />
      {masteredDate && (
        <p className="mt-2.5 text-xs font-medium text-success">Mastered {masteredDate}</p>
      )}
    </article>
  )
}
