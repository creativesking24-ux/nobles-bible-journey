import { Link } from 'react-router-dom'
import {
  Award,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Highlighter,
  Settings,
  Sparkles,
} from 'lucide-react'
import { PageHeader, PageShell, Surface } from '../components/ui'
import { ThemeToggle } from '../components/ThemeToggle'
import { useJourneyStore } from '../store/useJourneyStore'

const links = [
  {
    to: '/progress',
    label: 'Certificate & progress',
    hint: 'Milestones, export, certificate',
    icon: Award,
  },
  {
    to: '/memory',
    label: 'Memory verses',
    hint: 'Master list for all 14 weeks',
    icon: BookMarked,
  },
  {
    to: '/highlights',
    label: 'Scripture highlights',
    hint: 'Verses you’ve marked',
    icon: Highlighter,
  },
  {
    to: '/calendar',
    label: 'Year calendar',
    hint: 'See every covered day',
    icon: CalendarDays,
  },
  {
    to: '/settings',
    label: 'Settings',
    hint: 'Name, Bible version, offline, theme',
    icon: Settings,
  },
]

export function MorePage() {
  const settings = useJourneyStore((s) => s.settings)
  const progress = useJourneyStore((s) => s.getProgress)()
  const week = useJourneyStore((s) => s.getCurrentWeek)()

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow="Menu"
        title="More"
        subtitle="Certificate, memory, settings"
        action={<ThemeToggle variant="icon" />}
      />

      <Surface className="mb-5 !p-5">
        <div className="flex w-full items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-parchment">{settings.userName}</p>
            <p className="text-content mt-0.5 text-xs text-parchment-muted">
              Week {week} of 14 · {progress.percent}% complete
            </p>
          </div>
        </div>
      </Surface>

      <div className="w-full space-y-2.5">
        {links.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="surface card-press flex w-full items-center gap-3 rounded-[1.35rem] !p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-semibold text-parchment">{label}</p>
              <p className="text-content mt-0.5 text-xs text-parchment-muted">{hint}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gold" />
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
