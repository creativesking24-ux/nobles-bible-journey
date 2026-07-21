import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import { PageHeader, PageShell } from '../components/ui'
import { YearCalendar } from '../components/YearCalendar'
import { JOURNEY_START } from '../data/journeySeed'
import { useJourneyStore } from '../store/useJourneyStore'

export function CalendarPage() {
  const days = useJourneyStore((s) => s.days)
  const year = useMemo(() => parseISO(JOURNEY_START).getFullYear(), [])

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow={`${year} overview`}
        title="Year calendar"
        subtitle="See every day covered by your 90+ day plan"
      />
      <YearCalendar year={year} days={days} />
    </PageShell>
  )
}
