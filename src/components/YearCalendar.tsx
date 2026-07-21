import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronDown } from 'lucide-react'
import type { DayData } from '../types'
import { JOURNEY_END, JOURNEY_START } from '../data/journeySeed'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type DayStatus = 'none' | 'planned' | 'done' | 'review-planned' | 'review-done'

export function buildDayMap(days: DayData[]): Map<string, DayData> {
  return new Map(days.map((d) => [d.date, d]))
}

export function getDayStatus(dateStr: string, dayMap: Map<string, DayData>): DayStatus {
  const day = dayMap.get(dateStr)
  if (!day) return 'none'
  if (day.isReview) return day.completed ? 'review-done' : 'review-planned'
  return day.completed ? 'done' : 'planned'
}

function defaultOpenMonth(year: number): number {
  const now = new Date()
  if (now.getFullYear() === year) return now.getMonth()
  // Journey starts in June (month 5)
  const start = parseISO(JOURNEY_START)
  if (start.getFullYear() === year) return start.getMonth()
  return 0
}

interface YearCalendarProps {
  year: number
  days: DayData[]
  compact?: boolean
}

export function YearCalendar({ year, days, compact = false }: YearCalendarProps) {
  const dayMap = useMemo(() => buildDayMap(days), [days])
  /** Each month expands/collapses independently */
  const [openMonths, setOpenMonths] = useState<Set<number>>(
    () => new Set([defaultOpenMonth(year)]),
  )

  const covered = days.length
  const completed = days.filter((d) => d.completed).length
  const remaining = covered - completed

  const journeyStart = parseISO(JOURNEY_START)
  const journeyEnd = parseISO(JOURNEY_END)

  const toggleMonth = (monthIndex: number) => {
    setOpenMonths((prev) => {
      const next = new Set(prev)
      if (next.has(monthIndex)) next.delete(monthIndex)
      else next.add(monthIndex)
      return next
    })
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Coverage summary */}
      <div className="surface grid grid-cols-3 gap-2 !p-3">
        <Metric label="Days covered" value={String(covered)} hint="on the plan" />
        <Metric label="Completed" value={String(completed)} hint="checked off" accent="success" />
        <Metric label="Remaining" value={String(remaining)} hint="still open" accent="gold" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-0.5 text-[11px] text-parchment-muted">
        <LegendDot className="bg-gold/25 ring-1 ring-gold/70" label="On plan" />
        <LegendDot className="bg-gold" label="Done" />
        <LegendDot className="bg-success/30 ring-1 ring-success/60" label="Review day" />
        <LegendDot className="bg-success" label="Review done" />
        <LegendDot className="bg-sky-500 ring-1 ring-sky-300" label="Today" />
      </div>

      <p className="px-0.5 text-xs leading-relaxed text-parchment-muted">
        Tap any month to open or close it. Highlighted days are on the plan (
        {format(journeyStart, 'MMM d')} – {format(journeyEnd, 'MMM d, yyyy')}). Tap a day
        to open the reading.
      </p>

      <div className="flex flex-wrap gap-2 px-0.5">
        <button
          type="button"
          onClick={() => setOpenMonths(new Set())}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-parchment-muted ring-1 ring-white/10"
        >
          Collapse all
        </button>
        <button
          type="button"
          onClick={() => setOpenMonths(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))}
          className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-parchment-muted ring-1 ring-white/10"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => setOpenMonths(new Set([defaultOpenMonth(year)]))}
          className="rounded-lg bg-gradient-to-b from-sky-400 to-sky-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-sky-900/40 ring-1 ring-sky-300/40"
        >
          Today
        </button>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 12 }, (_, monthIndex) => (
          <MonthGrid
            key={monthIndex}
            year={year}
            monthIndex={monthIndex}
            dayMap={dayMap}
            highlightRange={monthOverlapsJourney(year, monthIndex, journeyStart, journeyEnd)}
            open={openMonths.has(monthIndex)}
            onToggle={() => toggleMonth(monthIndex)}
          />
        ))}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: 'gold' | 'success'
}) {
  const valueColor =
    accent === 'success'
      ? 'text-success'
      : accent === 'gold'
        ? 'text-gold'
        : 'text-parchment'
  return (
    <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center ring-1 ring-white/5">
      <p className={`font-serif text-xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-parchment-muted">
        {label}
      </p>
      <p className="text-[10px] text-parchment-muted/70">{hint}</p>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  )
}

function monthOverlapsJourney(
  year: number,
  monthIndex: number,
  start: Date,
  end: Date,
): boolean {
  const mStart = new Date(year, monthIndex, 1)
  const mEnd = endOfMonth(mStart)
  return mStart <= end && mEnd >= start
}

function MonthGrid({
  year,
  monthIndex,
  dayMap,
  highlightRange,
  open,
  onToggle,
}: {
  year: number
  monthIndex: number
  dayMap: Map<string, DayData>
  highlightRange: boolean
  open: boolean
  onToggle: () => void
}) {
  const monthDate = new Date(year, monthIndex, 1)
  const monthLabel = format(monthDate, 'MMMM')
  const panelId = `month-panel-${year}-${monthIndex}`

  const monthStart = startOfMonth(monthDate)
  const cells = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 }),
  })

  let coveredCount = 0
  let doneCount = 0
  dayMap.forEach((d) => {
    const dt = parseISO(d.date)
    if (dt.getFullYear() === year && dt.getMonth() === monthIndex) {
      coveredCount++
      if (d.completed) doneCount++
    }
  })

  return (
    <section
      className={`surface overflow-hidden rounded-2xl !p-0 ${
        highlightRange ? 'ring-1 ring-gold/25' : ''
      } ${open ? 'shadow-lg shadow-black/20' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="card-press flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/[0.03]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-parchment">{monthLabel}</h3>
            {highlightRange && (
              <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold">
                Plan
              </span>
            )}
          </div>
          {coveredCount > 0 ? (
            <p className="mt-0.5 text-xs tabular-nums text-parchment-muted">
              <span className="font-semibold text-gold">
                {doneCount}/{coveredCount}
              </span>{' '}
              plan days complete
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-parchment-muted/60">No plan days this month</p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gold transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/5 px-3 pb-3 pt-2">
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={`${d}-${i}`}
                  className="py-0.5 text-center text-xs font-bold tracking-wide text-parchment-muted/80"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((date) => {
                const inMonth = isSameMonth(date, monthDate)
                const dateStr = format(date, 'yyyy-MM-dd')
                const status = getDayStatus(dateStr, dayMap)
                const day = dayMap.get(dateStr)
                const today = isToday(date)

                const base =
                  'relative flex aspect-square min-h-9 items-center justify-center rounded-lg text-base font-bold tabular-nums transition'

                if (!inMonth) {
                  return <div key={dateStr} className={`${base} opacity-0`} aria-hidden />
                }

                // Today always gets a distinct sky-blue treatment
                const todayCls = today
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-900/40 ring-2 ring-sky-300/80'
                  : ''

                if (status === 'none') {
                  return (
                    <div
                      key={dateStr}
                      className={`${base} ${
                        today ? todayCls : 'text-parchment-muted/50'
                      }`}
                    >
                      {format(date, 'd')}
                    </div>
                  )
                }

                const statusCls = today
                  ? todayCls
                  : status === 'done'
                    ? 'bg-gold text-navy shadow-sm shadow-gold/30'
                    : status === 'review-done'
                      ? 'bg-success text-navy'
                      : status === 'review-planned'
                        ? 'bg-success/20 text-success ring-1 ring-success/50'
                        : 'bg-gold/20 text-gold-soft ring-1 ring-gold/55'

                const content = format(date, 'd')

                if (day) {
                  return (
                    <Link
                      key={dateStr}
                      to={`/day/${day.id}`}
                      title={`${day.reading}${day.completed ? ' · Done' : ''}${today ? ' · Today' : ''}`}
                      className={`${base} card-press ${statusCls}`}
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <div key={dateStr} className={`${base} ${statusCls}`}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function isJourneyDate(date: Date, dayMap: Map<string, DayData>): boolean {
  return dayMap.has(format(date, 'yyyy-MM-dd'))
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}
