import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { CelebrationToast, type Celebration } from '../components/CelebrationToast'
import { NotesEditor } from '../components/NotesEditor'
import { ScriptureReader } from '../components/ScriptureReader'
import { PageShell } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

export function DailyPage() {
  const { dayId } = useParams()
  const id = Number(dayId)
  const navigate = useNavigate()
  const days = useJourneyStore((s) => s.days)
  const day = days.find((d) => d.id === id)
  const week = useJourneyStore((s) =>
    s.weeks.find((w) => w.weekNumber === day?.weekNumber),
  )
  const toggleDay = useJourneyStore((s) => s.toggleDay)
  const setDayNotes = useJourneyStore((s) => s.setDayNotes)
  const addJournal = useJourneyStore((s) => s.addJournal)

  const ordered = useMemo(
    () => [...days].sort((a, b) => a.date.localeCompare(b.date)),
    [days],
  )
  const idx = ordered.findIndex((d) => d.id === id)
  const prevDay = idx > 0 ? ordered[idx - 1] : null
  const nextDay = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null

  const [celebration, setCelebration] = useState<Celebration>(null)
  const [journalHint, setJournalHint] = useState<string | null>(null)

  if (!day) {
    return (
      <PageShell>
        <p className="text-parchment-muted">
          Day not found.{' '}
          <Link to="/schedule" className="font-semibold text-gold">
            Back to schedule
          </Link>
        </p>
      </PageShell>
    )
  }

  const markDone = () => {
    if (day.completed) {
      toggleDay(day.id)
      return
    }
    const weekDays = days.filter((d) => d.weekNumber === day.weekNumber)
    const othersDone = weekDays
      .filter((d) => d.id !== day.id)
      .every((d) => d.completed)
    toggleDay(day.id)
    if (othersDone) {
      setCelebration({ type: 'week', weekNumber: day.weekNumber })
    } else {
      setCelebration({ type: 'day', reading: day.reading })
    }
  }

  const expandToJournal = () => {
    if (!day.notes.trim()) return
    addJournal(
      'FREEFORM',
      `${day.reading} · ${format(parseISO(day.date), 'MMM d')}`,
      day.notes.trim(),
    )
    setJournalHint('Saved to Journal → Free journal')
    window.setTimeout(() => setJournalHint(null), 3200)
  }

  return (
    <PageShell className="animate-fade-up">
      <CelebrationToast
        celebration={celebration}
        onDismiss={() => setCelebration(null)}
      />

      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-parchment-muted ring-1 ring-white/10 transition hover:text-parchment"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!prevDay}
            onClick={() => prevDay && navigate(`/day/${prevDay.id}`)}
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-parchment-muted ring-1 ring-white/10 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" /> Prev day
          </button>
          <button
            type="button"
            disabled={!nextDay}
            onClick={() => nextDay && navigate(`/day/${nextDay.id}`)}
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-parchment-muted ring-1 ring-white/10 disabled:opacity-35"
          >
            Next day <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="w-full text-left">
        <p className="eyebrow">
          Week {day.weekNumber} · {day.dayLabel}
        </p>
        <h1 className="mt-2 w-full text-left font-serif text-[1.7rem] font-bold leading-snug text-parchment">
          {day.reading}
        </h1>
        <p className="mt-2 w-full text-left text-sm text-parchment-muted">
          {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
        </p>
        {week && (
          <p className="mt-2 w-full text-left text-xs leading-relaxed text-parchment-muted/90">
            Theme: {week.theme}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={markDone}
        className={`mt-6 ${day.completed ? 'btn-success' : 'btn-primary'} !py-4 text-base`}
      >
        <CheckCircle2 className={`h-5 w-5 ${day.completed ? 'check-pop' : ''}`} />
        {day.completed ? 'Completed' : 'Mark as Done'}
      </button>

      <div className="mt-6 w-full text-left">
        <ScriptureReader reading={day.reading} focused />
      </div>

      <div className="surface mt-6 w-full rounded-[1.35rem] !p-5 text-left">
        <NotesEditor
          value={day.notes}
          onChange={(v) => setDayNotes(day.id, v)}
          syncKey={day.id}
          enableVoice
          size="large"
          onExpandToJournal={expandToJournal}
        />
        {journalHint && (
          <p className="mt-2 w-full text-left text-xs font-semibold text-success">
            {journalHint}
          </p>
        )}
      </div>

      {/* Bottom day nav */}
      <div className="mt-7 flex w-full gap-2.5">
        <button
          type="button"
          disabled={!prevDay}
          onClick={() => prevDay && navigate(`/day/${prevDay.id}`)}
          className="btn-ghost flex min-w-0 flex-1 items-center justify-start !px-3 !py-3.5 text-left text-sm disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">
            {prevDay ? prevDay.reading : 'Previous day'}
          </span>
        </button>
        <button
          type="button"
          disabled={!nextDay}
          onClick={() => nextDay && navigate(`/day/${nextDay.id}`)}
          className={`flex min-w-0 flex-1 items-center justify-end gap-0.5 !px-3 !py-3.5 text-right text-sm font-bold ${
            nextDay ? 'btn-primary' : 'btn-ghost opacity-35'
          }`}
        >
          <span className="min-w-0 truncate">
            {nextDay ? nextDay.reading : 'End of plan'}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </PageShell>
  )
}
