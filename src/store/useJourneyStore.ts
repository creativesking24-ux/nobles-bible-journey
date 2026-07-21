import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { format, parseISO, subDays, getDayOfYear } from 'date-fns'
import { JOURNEY_WEEKS, MOTIVATIONAL_VERSES } from '../data/journeySeed'
import type {
  AppSettings,
  DayData,
  HighlightColor,
  JournalCategory,
  JournalEntry,
  ScriptureHighlight,
  WeekData,
} from '../types'
import { highlightKey } from '../types'
import { enqueueSyncOp } from '../lib/offline/syncQueue'

function buildSeed() {
  const weeks: WeekData[] = JOURNEY_WEEKS.map((w) => ({
    weekNumber: w.weekNumber,
    theme: w.theme,
    startDate: w.startDate,
    endDate: w.endDate,
    memoryVerse: '',
    memoryVerseMastered: false,
    memoryVerseMasteredDate: null,
    keyInsight: '',
  }))

  const days: DayData[] = JOURNEY_WEEKS.flatMap((w) =>
    w.days.map((d) => ({
      id: w.weekNumber * 10 + d.dayOfWeek,
      weekNumber: w.weekNumber,
      dayOfWeek: d.dayOfWeek,
      dayLabel: d.dayLabel,
      date: d.date,
      reading: d.reading,
      isReview: !!d.isReview,
      completed: false,
      notes: '',
      completedAt: null,
    })),
  )

  return { weeks, days }
}

function rebuildStreak(days: DayData[]): { streak: number; lastCompletedDate: string | null } {
  const byDate = new Map(days.map((d) => [d.date, d]))
  let cursor = format(new Date(), 'yyyy-MM-dd')
  let streak = 0
  let last: string | null = null

  const today = byDate.get(cursor)
  if (!today?.completed) {
    cursor = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  }

  while (true) {
    const d = byDate.get(cursor)
    if (d?.completed) {
      streak++
      if (!last) last = d.date
      cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd')
    } else {
      break
    }
  }
  return { streak, lastCompletedDate: last }
}

const seed = buildSeed()

interface JourneyStore {
  weeks: WeekData[]
  days: DayData[]
  journal: JournalEntry[]
  /** Keyed by `${passageRef}:${verse}` e.g. ROM.1:16 */
  highlights: Record<string, ScriptureHighlight>
  settings: AppSettings
  streak: number
  lastCompletedDate: string | null

  // selectors helpers as methods
  getTodayDay: () => DayData | undefined
  getCurrentWeek: () => number
  getProgress: () => {
    completed: number
    total: number
    percent: number
    weeksCompleted: number
  }
  verseOfDay: () => string

  toggleDay: (id: number) => void
  setDayNotes: (id: number, notes: string) => void
  setMemoryVerse: (week: number, verse: string) => void
  toggleMemoryMastered: (week: number) => void
  setKeyInsight: (week: number, insight: string) => void
  addJournal: (category: JournalCategory, title: string, body: string) => void
  updateJournal: (id: string, patch: Partial<Pick<JournalEntry, 'title' | 'body'>>) => void
  deleteJournal: (id: string) => void
  updateSettings: (patch: Partial<AppSettings>) => void

  setHighlight: (opts: {
    passageRef: string
    verse: number
    color: HighlightColor
    text?: string
    label?: string
  }) => void
  /** Toggle: same color removes; different color updates; no highlight applies */
  applyHighlight: (opts: {
    passageRef: string
    verse: number
    color: HighlightColor
    text?: string
    label?: string
  }) => void
  clearHighlight: (passageRef: string, verse: number) => void
  clearPassageHighlights: (passageRef: string) => void
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      weeks: seed.weeks,
      days: seed.days,
      journal: [],
      highlights: {},
      settings: {
        userName: 'Mayeku Noble',
        darkMode: true,
        reminderEnabled: false,
        bibleId: '3034',
        bibleAbbreviation: 'BSB',
        bibleTitle: 'Berean Standard Bible',
      },
      streak: 0,
      lastCompletedDate: null,

      getTodayDay: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().days.find((d) => d.date === today)
      },

      getCurrentWeek: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const day = get().days.find((d) => d.date === today)
        if (day) return day.weekNumber
        const week = get().weeks.find((w) => today >= w.startDate && today <= w.endDate)
        if (week) return week.weekNumber
        if (today < '2026-06-15') return 1
        if (today > '2026-09-20') return 14
        return 1
      },

      getProgress: () => {
        const { days, weeks } = get()
        const completed = days.filter((d) => d.completed).length
        const total = days.length
        const weeksCompleted = weeks.filter((w) => {
          const wd = days.filter((d) => d.weekNumber === w.weekNumber)
          return wd.length > 0 && wd.every((d) => d.completed)
        }).length
        return {
          completed,
          total,
          percent: total === 0 ? 0 : Math.round((completed * 100) / total),
          weeksCompleted,
        }
      },

      verseOfDay: () => {
        const i = getDayOfYear(new Date()) % MOTIVATIONAL_VERSES.length
        return MOTIVATIONAL_VERSES[i]
      },

      toggleDay: (id) => {
        const before = get().days.find((d) => d.id === id)
        const nextCompleted = !before?.completed
        set((state) => {
          const days = state.days.map((d) =>
            d.id === id
              ? {
                  ...d,
                  completed: !d.completed,
                  completedAt: !d.completed ? new Date().toISOString() : null,
                }
              : d,
          )
          const { streak, lastCompletedDate } = rebuildStreak(days)
          return { days, streak, lastCompletedDate }
        })
        enqueueSyncOp('SET_DAY_COMPLETED', {
          dayId: id,
          completed: nextCompleted,
          reading: before?.reading,
          date: before?.date,
        })
      },

      setDayNotes: (id, notes) => {
        set((state) => ({
          days: state.days.map((d) => (d.id === id ? { ...d, notes } : d)),
        }))
        enqueueSyncOp('SET_NOTES', { dayId: id, notes })
      },

      setMemoryVerse: (week, verse) => {
        set((state) => ({
          weeks: state.weeks.map((w) =>
            w.weekNumber === week ? { ...w, memoryVerse: verse } : w,
          ),
        }))
        enqueueSyncOp('MEMORY_VERSE', { week, verse })
      },

      toggleMemoryMastered: (week) => {
        const before = get().weeks.find((w) => w.weekNumber === week)
        const mastered = !before?.memoryVerseMastered
        set((state) => ({
          weeks: state.weeks.map((w) => {
            if (w.weekNumber !== week) return w
            return {
              ...w,
              memoryVerseMastered: mastered,
              memoryVerseMasteredDate: mastered
                ? format(new Date(), 'yyyy-MM-dd')
                : null,
            }
          }),
        }))
        enqueueSyncOp('MEMORY_MASTERED', { week, mastered })
      },

      setKeyInsight: (week, insight) => {
        set((state) => ({
          weeks: state.weeks.map((w) =>
            w.weekNumber === week ? { ...w, keyInsight: insight } : w,
          ),
        }))
        enqueueSyncOp('KEY_INSIGHT', { week, insight })
      },

      addJournal: (category, title, body) => {
        const now = new Date().toISOString()
        const entry: JournalEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          category,
          title,
          body,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ journal: [entry, ...state.journal] }))
        enqueueSyncOp('JOURNAL_ADD', { entry })
      },

      updateJournal: (id, patch) => {
        set((state) => ({
          journal: state.journal.map((j) =>
            j.id === id
              ? { ...j, ...patch, updatedAt: new Date().toISOString() }
              : j,
          ),
        }))
        enqueueSyncOp('JOURNAL_UPDATE', { id, patch })
      },

      deleteJournal: (id) => {
        set((state) => ({ journal: state.journal.filter((j) => j.id !== id) }))
        enqueueSyncOp('JOURNAL_DELETE', { id })
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }))
        enqueueSyncOp('SETTINGS', { patch })
      },

      setHighlight: ({ passageRef, verse, color, text, label }) => {
        const key = highlightKey(passageRef, verse)
        const now = new Date().toISOString()
        set((state) => {
          const prev = state.highlights[key]
          const entry: ScriptureHighlight = {
            passageRef,
            verse,
            color,
            text: text ?? prev?.text,
            label: label ?? prev?.label,
            createdAt: prev?.createdAt ?? now,
            updatedAt: now,
          }
          return { highlights: { ...state.highlights, [key]: entry } }
        })
        enqueueSyncOp('HIGHLIGHT_SET', { passageRef, verse, color, text, label })
      },

      applyHighlight: ({ passageRef, verse, color, text, label }) => {
        const key = highlightKey(passageRef, verse)
        const existing = get().highlights[key]
        if (existing && existing.color === color) {
          get().clearHighlight(passageRef, verse)
          return
        }
        get().setHighlight({ passageRef, verse, color, text, label })
      },

      clearHighlight: (passageRef, verse) => {
        const key = highlightKey(passageRef, verse)
        set((state) => {
          if (!state.highlights[key]) return state
          const next = { ...state.highlights }
          delete next[key]
          return { highlights: next }
        })
        enqueueSyncOp('HIGHLIGHT_CLEAR', { passageRef, verse })
      },

      clearPassageHighlights: (passageRef) => {
        set((state) => {
          const next = { ...state.highlights }
          for (const k of Object.keys(next)) {
            if (next[k].passageRef === passageRef) delete next[k]
          }
          return { highlights: next }
        })
        enqueueSyncOp('HIGHLIGHT_CLEAR', { passageRef, all: true })
      },
    }),
    {
      name: 'nobles-bible-journey-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        weeks: state.weeks,
        days: state.days,
        journal: state.journal,
        highlights: state.highlights,
        settings: state.settings,
        streak: state.streak,
        lastCompletedDate: state.lastCompletedDate,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<JourneyStore> | undefined
        if (!p?.days?.length || !p?.weeks?.length) return current
        // Preserve user progress but ensure seed structure exists
        const seedDays = seed.days
        const seedWeeks = seed.weeks
        const dayMap = new Map(p.days.map((d) => [d.id, d]))
        const weekMap = new Map(p.weeks.map((w) => [w.weekNumber, w]))
        return {
          ...current,
          ...p,
          days: seedDays.map((sd) => {
            const saved = dayMap.get(sd.id)
            return saved
              ? {
                  ...sd,
                  completed: saved.completed,
                  notes: saved.notes,
                  completedAt: saved.completedAt,
                }
              : sd
          }),
          weeks: seedWeeks.map((sw) => {
            const saved = weekMap.get(sw.weekNumber)
            return saved
              ? {
                  ...sw,
                  memoryVerse: saved.memoryVerse,
                  memoryVerseMastered: saved.memoryVerseMastered,
                  memoryVerseMasteredDate: saved.memoryVerseMasteredDate,
                  keyInsight: saved.keyInsight,
                }
              : sw
          }),
          journal: p.journal ?? [],
          highlights: p.highlights ?? {},
          settings: {
            ...{
              userName: 'Mayeku Noble',
              darkMode: true,
              reminderEnabled: false,
              bibleId: '3034',
              bibleAbbreviation: 'BSB',
              bibleTitle: 'Berean Standard Bible',
            },
            ...current.settings,
            ...p.settings,
          },
          streak: p.streak ?? 0,
          lastCompletedDate: p.lastCompletedDate ?? null,
        }
      },
    },
  ),
)
