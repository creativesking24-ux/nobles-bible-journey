import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  Star,
} from 'lucide-react'
import { PageHeader, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

export function SchedulePage() {
  const weeks = useJourneyStore((s) => s.weeks)
  const days = useJourneyStore((s) => s.days)
  const getCurrentWeek = useJourneyStore((s) => s.getCurrentWeek)
  const toggleDay = useJourneyStore((s) => s.toggleDay)
  const setDayNotes = useJourneyStore((s) => s.setDayNotes)
  const setMemoryVerse = useJourneyStore((s) => s.setMemoryVerse)
  const toggleMemoryMastered = useJourneyStore((s) => s.toggleMemoryMastered)
  const setKeyInsight = useJourneyStore((s) => s.setKeyInsight)

  const [activeWeek, setActiveWeek] = useState(getCurrentWeek)
  const [expanded, setExpanded] = useState<number | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const week = weeks.find((w) => w.weekNumber === activeWeek) ?? weeks[0]
  const weekDays = useMemo(
    () =>
      days
        .filter((d) => d.weekNumber === activeWeek)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    [days, activeWeek],
  )
  const doneCount = weekDays.filter((d) => d.completed).length
  const pct = Math.round((doneCount / Math.max(weekDays.length, 1)) * 100)

  const [memory, setMemory] = useState(week?.memoryVerse ?? '')
  const [insight, setInsight] = useState(week?.keyInsight ?? '')

  useEffect(() => {
    setMemory(week?.memoryVerse ?? '')
    setInsight(week?.keyInsight ?? '')
    setExpanded(null)
  }, [week?.weekNumber, week?.memoryVerse, week?.keyInsight])

  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-week="${activeWeek}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeWeek])

  if (!week) return null

  return (
    <div className="safe-pt flex h-full flex-col">
      <div className="app-gutter-x pt-4 landscape:pt-3">
        <PageHeader
          eyebrow="14 weeks"
          title="Study plan"
          subtitle="Tap a day to open · check to complete"
          action={
            <Link
              to="/calendar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl surface text-gold landscape:h-10 landscape:w-10"
              aria-label="Year calendar"
            >
              <CalendarDays className="h-5 w-5" />
            </Link>
          }
        />
      </div>

      {/* Sticky week picker */}
      <div className="sticky top-0 z-20 border-b border-theme bg-navy/80 app-gutter-x pb-3 backdrop-blur-xl landscape:pb-2">
        <div ref={tabsRef} className="no-scrollbar flex gap-2 overflow-x-auto py-1">
          {weeks.map((w) => {
            const wDays = days.filter((d) => d.weekNumber === w.weekNumber)
            const complete = wDays.length > 0 && wDays.every((d) => d.completed)
            const active = w.weekNumber === activeWeek
            const isCurrent = w.weekNumber === getCurrentWeek()
            return (
              <button
                key={w.weekNumber}
                type="button"
                data-week={w.weekNumber}
                onClick={() => setActiveWeek(w.weekNumber)}
                className={`relative shrink-0 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gold text-navy shadow-lg shadow-gold/25'
                    : complete
                      ? 'bg-success/15 text-success ring-1 ring-success/25'
                      : 'surface text-parchment-muted'
                }`}
              >
                W{w.weekNumber}
                {isCurrent && !active && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold ring-2 ring-navy" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="app-gutter-x flex-1 space-y-3.5 overflow-y-auto pb-8 pt-4">
        {/* Week summary */}
        <Surface hero className="animate-fade-up !p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Week {week.weekNumber}</p>
              <p className="mt-1 text-sm text-parchment-muted">
                {format(parseISO(week.startDate), 'MMM d')} –{' '}
                {format(parseISO(week.endDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="rounded-xl bg-black/25 px-2.5 py-1.5 text-center">
              <p className="font-serif text-lg font-bold tabular-nums text-gold">{pct}%</p>
              <p className="text-[9px] uppercase tracking-wide text-parchment-muted">
                week
              </p>
            </div>
          </div>
          <h2 className="mt-3 w-full font-serif text-base leading-snug text-parchment">
            {week.theme}
          </h2>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-parchment-muted">
              <span>
                {doneCount} of {weekDays.length} days complete
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-dim via-gold to-gold-soft transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </Surface>

        {/* Days */}
        <div className="space-y-2">
          {weekDays.map((day, i) => {
            const open = expanded === day.id
            return (
              <div
                key={day.id}
                className={`animate-fade-up surface overflow-hidden rounded-2xl transition-all ${
                  day.completed ? 'ring-1 ring-success/25' : ''
                }`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-1 p-1.5 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`card-press flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                      day.completed
                        ? 'bg-gradient-to-br from-gold-soft to-gold text-navy shadow-md shadow-gold/30'
                        : 'bg-navy/60 text-parchment-muted ring-1 ring-white/10 hover:ring-gold/30'
                    }`}
                    aria-label={day.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {day.completed && (
                      <Check className="check-pop h-5 w-5" strokeWidth={3} />
                    )}
                  </button>

                  <Link
                    to={`/day/${day.id}`}
                    className="min-w-0 flex-1 rounded-xl px-2 py-2 active:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-parchment-muted">
                        {day.dayLabel}
                      </p>
                      <span className="text-[11px] text-parchment-muted/70">
                        {format(parseISO(day.date), 'MMM d')}
                      </span>
                      {day.isReview && (
                        <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold">
                          Review
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-semibold text-parchment">
                      {day.reading}
                    </p>
                    {day.notes && !open && (
                      <p className="mt-0.5 truncate text-xs text-parchment-muted">
                        Note saved
                      </p>
                    )}
                  </Link>

                  <button
                    type="button"
                    className="rounded-xl p-2.5 text-parchment-muted transition hover:bg-white/5 hover:text-parchment"
                    onClick={() => setExpanded(open ? null : day.id)}
                    aria-label="Toggle notes"
                    aria-expanded={open}
                  >
                    {open ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {open && (
                  <div className="border-t border-white/5 bg-black/15 px-3 pb-3 pt-3">
                    <label className="section-label mb-1.5 block">Quick note</label>
                    <textarea
                      className="field"
                      rows={3}
                      placeholder="What stood out today?"
                      value={day.notes}
                      onChange={(e) => setDayNotes(day.id, e.target.value)}
                    />
                    <Link
                      to={`/day/${day.id}`}
                      className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold text-gold"
                    >
                      Open full day view <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Memory verse */}
        <Surface className="!p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-parchment">Memory verse</h3>
              <p className="text-xs text-parchment-muted">Week {week.weekNumber}</p>
            </div>
          </div>
          <textarea
            className="field"
            rows={2}
            placeholder="Write the verse reference or text…"
            value={memory}
            onChange={(e) => {
              setMemory(e.target.value)
              setMemoryVerse(week.weekNumber, e.target.value)
            }}
          />
          <button
            type="button"
            onClick={() => toggleMemoryMastered(week.weekNumber)}
            className={`mt-3 w-full rounded-xl py-3 text-sm font-bold transition ${
              week.memoryVerseMastered
                ? 'btn-success !py-3'
                : 'bg-gold/12 text-gold ring-1 ring-gold/30'
            }`}
          >
            {week.memoryVerseMastered
              ? `Mastered · ${week.memoryVerseMasteredDate}`
              : 'Mark as mastered'}
          </button>
        </Surface>

        {/* Key insight */}
        <Surface className="!p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-parchment">Key insight</h3>
              <p className="text-xs text-parchment-muted">This week&apos;s takeaway</p>
            </div>
          </div>
          <textarea
            className="field"
            rows={3}
            placeholder="What is God showing you this week?"
            value={insight}
            onChange={(e) => {
              setInsight(e.target.value)
              setKeyInsight(week.weekNumber, e.target.value)
            }}
          />
        </Surface>
      </div>
    </div>
  )
}
