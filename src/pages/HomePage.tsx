import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Highlighter,
  Quote,
  Settings,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { ProgressRing } from '../components/ProgressRing'
import { ThemeToggle } from '../components/ThemeToggle'
import { IconButton, PageShell, StatPill, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

export function HomePage() {
  const getTodayDay = useJourneyStore((s) => s.getTodayDay)
  const getCurrentWeek = useJourneyStore((s) => s.getCurrentWeek)
  const getProgress = useJourneyStore((s) => s.getProgress)
  const verseOfDay = useJourneyStore((s) => s.verseOfDay)
  const streak = useJourneyStore((s) => s.streak)
  const toggleDay = useJourneyStore((s) => s.toggleDay)
  const settings = useJourneyStore((s) => s.settings)
  const weeks = useJourneyStore((s) => s.weeks)

  const today = getTodayDay()
  const week = getCurrentWeek()
  const progress = getProgress()
  const verse = verseOfDay()
  const todayTheme = today
    ? weeks.find((w) => w.weekNumber === today.weekNumber)?.theme
    : undefined
  const firstName = settings.userName.split(' ')[0] || 'Friend'

  return (
    <PageShell>
      {/* Header */}
      <header className="animate-fade-up mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 ring-1 ring-gold/25">
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              90+ Day Journey
            </span>
          </div>
          <h1 className="font-serif text-[1.7rem] font-bold leading-tight text-parchment">
            Hello, {firstName}
          </h1>
          <p className="mt-1 text-sm text-parchment-muted">
            {format(new Date(), 'EEEE · MMMM d')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle variant="icon" />
          <IconButton to="/settings" label="Settings">
            <Settings className="h-5 w-5" />
          </IconButton>
        </div>
      </header>

      {/* Progress hero */}
      <section className="animate-fade-up-delay surface-hero mb-4 overflow-hidden rounded-[1.5rem] p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="section-label">Your progress</p>
            <h2 className="mt-1 font-serif text-xl text-parchment">
              Week {week}
              <span className="text-parchment-muted"> of 14</span>
            </h2>
          </div>
          <Link
            to="/progress"
            className="flex items-center gap-0.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-gold ring-1 ring-white/10"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <ProgressRing percent={progress.percent} size={118} label="Done" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <StatPill
              icon={<Flame className="h-4 w-4" />}
              label="Streak"
              value={`${streak} day${streak === 1 ? '' : 's'}`}
            />
            <StatPill
              icon={<BookOpen className="h-4 w-4" />}
              label="Days checked"
              value={`${progress.completed} / ${progress.total}`}
            />
            <StatPill
              icon={<Trophy className="h-4 w-4" />}
              label="Weeks finished"
              value={`${progress.weeksCompleted} / 14`}
            />
          </div>
        </div>
      </section>

      {/* Today's focus — primary action first for intuition */}
      <section className="animate-fade-up-delay-2 mb-4">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h3 className="section-label">Today&apos;s focus</h3>
          {today && (
            <Link
              to={`/day/${today.id}`}
              className="flex items-center gap-0.5 text-xs font-semibold text-gold"
            >
              Full view <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <Surface className="!p-5">
          {today ? (
            <>
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    today.completed
                      ? 'bg-success/15 text-success ring-1 ring-success/30'
                      : 'bg-gold/15 text-gold ring-1 ring-gold/30'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-parchment-muted">
                    Week {today.weekNumber}
                    {today.isReview ? ' · Review day' : ' · Daily reading'}
                  </p>
                  <p className="mt-0.5 font-serif text-xl font-bold leading-snug text-gold-soft">
                    {today.reading}
                  </p>
                  {todayTheme && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-parchment-muted">
                      {todayTheme}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => toggleDay(today.id)}
                  className={today.completed ? 'btn-success' : 'btn-primary'}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${today.completed ? 'check-pop' : ''}`}
                  />
                  {today.completed ? 'Completed today' : 'Mark reading complete'}
                </button>
                <Link to={`/day/${today.id}`} className="btn-ghost w-full">
                  Add notes & insights
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-serif text-lg text-parchment">Browse your plan</p>
              <p className="mt-2 text-sm leading-relaxed text-parchment-muted">
                No reading is scheduled for today&apos;s calendar date. The journey runs
                Jun 15 – Sep 20, 2026 — open the plan anytime to check off days.
              </p>
              <Link to="/schedule" className="btn-primary mt-5">
                Open study plan
              </Link>
            </>
          )}
        </Surface>
      </section>

      {/* Verse */}
      <section className="animate-fade-up-delay-3 mb-4">
        <Surface gold className="!p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Quote className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Verse of the day</p>
              <p className="mt-2 font-serif text-[0.95rem] leading-relaxed text-parchment">
                {verse}
              </p>
            </div>
          </div>
        </Surface>
      </section>

      {/* Quick links */}
      <section className="animate-fade-up-delay-3 grid grid-cols-3 gap-2.5">
        <Link to="/schedule" className="surface card-press group rounded-2xl p-3.5">
          <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
            <BookOpen className="h-4.5 w-4.5 h-4 w-4" />
          </div>
          <p className="text-[10px] font-medium text-parchment-muted">Plan</p>
          <p className="mt-0.5 text-sm font-semibold text-parchment">14 weeks</p>
        </Link>
        <Link to="/calendar" className="surface card-press group rounded-2xl p-3.5">
          <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
            <CalendarDays className="h-4 w-4" />
          </div>
          <p className="text-[10px] font-medium text-parchment-muted">Year</p>
          <p className="mt-0.5 text-sm font-semibold text-parchment">Calendar</p>
        </Link>
        <Link to="/progress" className="surface card-press group rounded-2xl p-3.5">
          <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
            <Trophy className="h-4 w-4" />
          </div>
          <p className="text-[10px] font-medium text-parchment-muted">Wins</p>
          <p className="mt-0.5 text-sm font-semibold text-parchment">Certificate</p>
        </Link>
      </section>

      <div className="mt-3 space-y-2">
        <Link
          to="/highlights"
          className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/8"
        >
          <span className="inline-flex items-center gap-2 text-parchment-muted">
            <Highlighter className="h-4 w-4 text-gold" />
            Scripture highlights
          </span>
          <ChevronRight className="h-4 w-4 text-gold" />
        </Link>
        <Link
          to="/memory"
          className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/8"
        >
          <span className="text-parchment-muted">Memory verses master list</span>
          <ChevronRight className="h-4 w-4 text-gold" />
        </Link>
      </div>

      {today && (
        <p className="mt-5 text-center text-[11px] leading-relaxed text-parchment-muted">
          {format(parseISO(today.date), 'MMMM d, yyyy')}
        </p>
      )}
    </PageShell>
  )
}
