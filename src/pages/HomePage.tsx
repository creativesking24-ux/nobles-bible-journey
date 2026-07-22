import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Flame,
  Heart,
  Quote,
  Sparkles,
} from 'lucide-react'
import { CelebrationToast, type Celebration } from '../components/CelebrationToast'
import { EmptyState } from '../components/EmptyState'
import { ProgressRing } from '../components/ProgressRing'
import { ThemeToggle } from '../components/ThemeToggle'
import { PageShell, Surface } from '../components/ui'
import { bibleComUrlForReading, isReviewReading } from '../lib/youversion/refs'
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
  const days = useJourneyStore((s) => s.days)

  const today = getTodayDay()
  const week = getCurrentWeek()
  const progress = getProgress()
  const verse = verseOfDay()
  const todayTheme = today
    ? weeks.find((w) => w.weekNumber === today.weekNumber)?.theme
    : undefined
  const firstName = settings.userName.split(' ')[0] || 'Friend'
  const isFirstTime = progress.completed === 0
  const day1 = days.find((d) => d.weekNumber === 1 && d.dayOfWeek === 1)

  const [celebration, setCelebration] = useState<Celebration>(null)

  const openBibleUrl = today
    ? isReviewReading(today.reading)
      ? 'https://www.bible.com/bible'
      : bibleComUrlForReading(
          today.reading,
          settings.bibleId || '3034',
          settings.bibleAbbreviation || 'BSB',
        )
    : null

  const onMarkDone = useCallback(() => {
    if (!today || today.completed) return

    const weekDays = days.filter((d) => d.weekNumber === today.weekNumber)
    const othersDone = weekDays
      .filter((d) => d.id !== today.id)
      .every((d) => d.completed)

    toggleDay(today.id)
    const nextStreak = useJourneyStore.getState().streak

    if (othersDone) {
      setCelebration({ type: 'week', weekNumber: today.weekNumber })
    } else {
      setCelebration({ type: 'day', reading: today.reading })
      if (nextStreak >= 2) {
        window.setTimeout(() => {
          setCelebration((c) =>
            c?.type === 'day' ? { type: 'streak', days: nextStreak } : c,
          )
        }, 2800)
      }
    }
  }, [today, toggleDay, days])

  const startDay1 = useCallback(() => {
    if (!day1 || day1.completed) return
    toggleDay(day1.id)
    setCelebration({ type: 'day', reading: day1.reading })
  }, [day1, toggleDay])

  return (
    <PageShell>
      <CelebrationToast
        celebration={celebration}
        onDismiss={() => setCelebration(null)}
      />

      {/* Compact header */}
      <header className="animate-fade-up mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1">
            Week {week} of 14 · {progress.percent}%
          </p>
          <h1 className="font-serif text-[1.6rem] font-bold leading-tight text-parchment">
            Hello, {firstName}
          </h1>
          <p className="mt-1 text-sm text-parchment-muted">
            {format(new Date(), 'EEEE · MMMM d')}
          </p>
        </div>
        <ThemeToggle variant="icon" />
      </header>

      {/* First-time welcome */}
      {isFirstTime && (
        <section className="animate-fade-up-delay mb-5">
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            eyebrow="Welcome"
            title="Your journey begins with one faithful step"
            body="This is a 14-week path through the Word. Start with Day 1, or open today’s reading if you’re mid-plan. Every checkmark is grace in motion."
            action={
              <>
                {day1 && !day1.completed && (
                  <button type="button" onClick={startDay1} className="btn-primary !py-3.5">
                    <CheckCircle2 className="h-5 w-5" />
                    Start your journey — mark Day 1 complete
                  </button>
                )}
                {day1 && (
                  <Link
                    to={`/day/${day1.id}`}
                    className="btn-ghost flex w-full !py-3 text-sm font-bold"
                  >
                    <BookOpen className="h-4 w-4 text-gold" />
                    Open Day 1 · {day1.reading}
                    <ChevronRight className="ml-auto h-4 w-4 text-gold" />
                  </Link>
                )}
              </>
            }
          />
        </section>
      )}

      {/* 1. TODAY'S READING — primary */}
      <section className="animate-fade-up-delay mb-5">
        <Surface className="!p-5 ring-1 ring-gold/25 sm:!p-6">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold ring-1 ring-gold/25">
              <Sparkles className="h-3 w-3" />
              Today&apos;s reading
            </span>
            {today?.completed && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                Done
              </span>
            )}
          </div>

          {today ? (
            <>
              <p className="font-serif text-[1.9rem] font-bold leading-snug text-gold-soft">
                {today.reading}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-parchment-muted">
                Week {today.weekNumber}
                {today.isReview ? ' · Review day' : ' · Daily reading'}
                {todayTheme ? ` · ${todayTheme}` : ''}
              </p>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (today.completed) {
                      toggleDay(today.id)
                      return
                    }
                    onMarkDone()
                  }}
                  className={`${today.completed ? 'btn-success' : 'btn-primary'} !py-4 text-base shadow-lg`}
                >
                  <CheckCircle2
                    className={`h-6 w-6 ${today.completed ? 'check-pop' : ''}`}
                  />
                  {today.completed ? 'Completed today' : 'Mark as Done'}
                </button>

                <Link
                  to={`/day/${today.id}`}
                  className="btn-ghost flex w-full !py-3.5 text-sm font-bold"
                >
                  <BookOpen className="h-5 w-5 text-gold" />
                  Open full Bible text
                  <ChevronRight className="ml-auto h-4 w-4 text-gold" />
                </Link>

                {openBibleUrl && !today.isReview && (
                  <a
                    href={openBibleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost flex w-full !py-3 text-sm text-parchment-muted"
                  >
                    Open in Bible App / web
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="font-serif text-xl text-parchment">No reading scheduled today</p>
              <p className="mt-2.5 text-sm leading-relaxed text-parchment-muted">
                The journey runs Jun 15 – Sep 20, 2026. Browse the schedule anytime to check
                off days, or start with Day 1.
              </p>
              <div className="mt-5 space-y-2">
                {day1 && (
                  <Link to={`/day/${day1.id}`} className="btn-primary">
                    <BookOpen className="h-5 w-5" />
                    Open Day 1 · {day1.reading}
                  </Link>
                )}
                <Link to="/schedule" className="btn-ghost flex w-full !py-3 font-bold">
                  Browse full schedule
                  <ChevronRight className="ml-auto h-4 w-4 text-gold" />
                </Link>
              </div>
            </>
          )}
        </Surface>
      </section>

      {/* 2. Streak + progress summary */}
      <section className="animate-fade-up-delay-2 surface-hero mb-5 overflow-hidden rounded-[1.5rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              Your journey
            </p>
            <h2 className="mt-1.5 font-serif text-xl text-white">
              Week {week}
              <span className="text-white/70"> of 14</span>
            </h2>
            <p className="mt-1 text-sm text-white/75">{progress.percent}% of the path</p>
          </div>
          <Link
            to="/progress"
            className="flex items-center gap-0.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-gold ring-1 ring-white/15"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <ProgressRing percent={progress.percent} size={112} label="Complete" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/10">
              <Flame
                className={`h-5 w-5 ${
                  streak > 0
                    ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.65)]'
                    : 'text-white/40'
                }`}
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                  Streak
                </p>
                <p className="text-sm font-bold text-white">
                  {streak > 0
                    ? `${streak} day${streak === 1 ? '' : 's'} 🔥`
                    : isFirstTime
                      ? 'Ready when you are'
                      : 'Start today'}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                Days checked
              </p>
              <p className="text-sm font-bold text-white">
                {progress.completed} / {progress.total}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-white/55">
            <span>Overall progress</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-dim via-gold to-gold-soft transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Verse of the day */}
      <section className="animate-fade-up-delay-3 mb-2">
        <Surface gold className="!p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Quote className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Encouragement</p>
              <p className="mt-2.5 font-serif text-[0.98rem] leading-relaxed text-parchment">
                {verse}
              </p>
            </div>
          </div>
        </Surface>
      </section>
    </PageShell>
  )
}
