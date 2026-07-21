export type JournalCategory =
  | 'MAJOR_REVELATION'
  | 'CHANGED_ME'
  | 'COMMITMENT'
  | 'FREEFORM'

export interface DayData {
  id: number // weekNumber * 10 + dayOfWeek
  weekNumber: number
  dayOfWeek: number // 1=Mon … 7=Sun
  dayLabel: string
  date: string // yyyy-MM-dd
  reading: string
  isReview: boolean
  completed: boolean
  notes: string
  completedAt: string | null
}

export interface WeekData {
  weekNumber: number
  theme: string
  startDate: string
  endDate: string
  memoryVerse: string
  memoryVerseMastered: boolean
  memoryVerseMasteredDate: string | null
  keyInsight: string
}

export interface JournalEntry {
  id: string
  category: JournalCategory
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  userName: string
  darkMode: boolean
  reminderEnabled: boolean
  /** YouVersion Bible version id, e.g. "3034" (BSB) */
  bibleId: string
  /** Short label for UI, e.g. "BSB" */
  bibleAbbreviation: string
  /** Full title for UI */
  bibleTitle: string
}

/** Highlight colors for Scripture verses */
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

export interface ScriptureHighlight {
  /** e.g. ROM.1 */
  passageRef: string
  verse: number
  color: HighlightColor
  /** Snapshot of verse text when highlighted */
  text?: string
  /** Optional label e.g. Romans 1 */
  label?: string
  createdAt: string
  updatedAt: string
}

/** Composite key helper: ROM.1:16 */
export function highlightKey(passageRef: string, verse: number): string {
  return `${passageRef}:${verse}`
}

export interface AppState {
  weeks: WeekData[]
  days: DayData[]
  journal: JournalEntry[]
  highlights: Record<string, ScriptureHighlight>
  settings: AppSettings
  streak: number
  lastCompletedDate: string | null
  seeded: boolean
}
