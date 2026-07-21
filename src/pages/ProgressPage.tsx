import { useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, ChevronRight, Download, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProgressRing } from '../components/ProgressRing'
import { PageHeader, PageShell, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'
import { exportCertificateImage, exportProgressPdf } from '../utils/export'

export function ProgressPage() {
  const weeks = useJourneyStore((s) => s.weeks)
  const days = useJourneyStore((s) => s.days)
  const journal = useJourneyStore((s) => s.journal)
  const settings = useJourneyStore((s) => s.settings)
  const getProgress = useJourneyStore((s) => s.getProgress)
  const progress = getProgress()
  const certRef = useRef<HTMLDivElement>(null)
  const remaining = progress.total - progress.completed

  return (
    <PageShell className="animate-fade-up">
      <PageHeader
        eyebrow="Celebrate faithfulness"
        title="Your wins"
        subtitle="Progress summary & certificate"
      />

      <Surface hero className="mb-4 flex items-center gap-4 !p-5">
        <ProgressRing percent={progress.percent} size={108} label="Journey" />
        <div className="min-w-0">
          <p className="font-serif text-lg text-parchment">Overall progress</p>
          <p className="mt-1 text-sm text-parchment-muted">
            {progress.completed} of {progress.total} days covered
          </p>
          <p className="text-sm text-parchment-muted">
            {progress.weeksCompleted} of 14 weeks finished
          </p>
        </div>
      </Surface>

      <Link to="/calendar" className="surface card-press mb-5 flex items-center gap-3 !p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-parchment">2026 year calendar</p>
          <p className="text-xs text-parchment-muted">
            {progress.total} plan days · {progress.completed} done · {remaining} left
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gold" />
      </Link>

      <h2 className="section-label mb-2 px-0.5">Weekly status</h2>
      <Surface className="mb-5 !overflow-hidden !p-0">
        <div className="grid grid-cols-[2.25rem_1fr_2.75rem_2.75rem] gap-1 border-b border-white/8 bg-black/15 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-parchment-muted">
          <span>Wk</span>
          <span>Dates</span>
          <span className="text-center">Done</span>
          <span className="text-center">Verse</span>
        </div>
        {weeks.map((w) => {
          const wd = days.filter((d) => d.weekNumber === w.weekNumber)
          const done = wd.length > 0 && wd.every((d) => d.completed)
          return (
            <div
              key={w.weekNumber}
              className="grid grid-cols-[2.25rem_1fr_2.75rem_2.75rem] items-center gap-1 border-b border-white/5 px-3 py-3 text-sm last:border-0"
            >
              <span className="font-bold tabular-nums text-parchment">{w.weekNumber}</span>
              <span className="text-xs text-parchment-muted">
                {format(parseISO(w.startDate), 'MMM d')}–
                {format(parseISO(w.endDate), 'MMM d')}
              </span>
              <span className="flex justify-center">
                <StatusDot on={done} tone="success" />
              </span>
              <span className="flex justify-center">
                <StatusDot on={w.memoryVerseMastered} tone="gold" />
              </span>
            </div>
          )
        })}
      </Surface>

      <h2 className="section-label mb-2 px-0.5">Certificate</h2>
      <div
        ref={certRef}
        className="rounded-[1.35rem] border-2 border-gold/80 bg-gradient-to-b from-[#1a2f44] via-navy-soft to-navy p-6 text-center shadow-2xl shadow-black/40"
      >
        <div className="mx-auto mb-1 h-0.5 w-12 rounded-full bg-gold/60" />
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
          Completion Certificate
        </p>
        <p className="mt-5 font-serif text-xl leading-snug text-parchment">
          I, <span className="text-gold-soft">{settings.userName}</span>,
        </p>
        <p className="mt-2 text-sm leading-relaxed text-parchment/85">
          have completed the 90+ Day Bible Study Journey
        </p>
        <div className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-sm">
          <CertRow label="Start" value="June 15, 2026" />
          <CertRow label="End" value="September 20, 2026" />
          <CertRow label="Books" value="Epistles + Proverbs + Revelation" />
          <CertRow label="Chapters" value="143+" />
          <CertRow
            label="Progress"
            value={`${progress.percent}% · ${progress.weeksCompleted}/14 weeks`}
          />
        </div>
        <p className="mt-7 text-sm text-parchment/75">Signed: ________________</p>
        <p className="mt-2 text-sm text-parchment/75">Date: ________________</p>
        <p className="mt-6 font-serif text-xs italic leading-relaxed text-gold/90">
          “This Book of the Law shall not depart from your mouth…” — Joshua 1:8
        </p>
        <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-gold/60" />
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (certRef.current) {
              exportCertificateImage(certRef.current, 'bible-journey-certificate.png')
            }
          }}
        >
          <Share2 className="h-4 w-4" />
          Share certificate
        </button>
        <button
          type="button"
          className="btn-ghost w-full !py-3.5"
          onClick={() =>
            exportProgressPdf({
              userName: settings.userName,
              weeks,
              days,
              journal,
              percent: progress.percent,
              weeksCompleted: progress.weeksCompleted,
            })
          }
        >
          <Download className="h-4 w-4" />
          Export full progress PDF
        </button>
        <p className="text-center text-[11px] text-parchment-muted">
          Everything stays on this device · works offline
        </p>
      </div>
    </PageShell>
  )
}

function StatusDot({ on, tone }: { on: boolean; tone: 'success' | 'gold' }) {
  const color = tone === 'success' ? 'bg-success' : 'bg-gold'
  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${
        on ? `${color} shadow-[0_0_8px_currentColor]` : 'bg-white/15'
      }`}
    />
  )
}

function CertRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/6 pb-2">
      <span className="text-parchment-muted">{label}</span>
      <span className="text-right font-medium text-parchment">{value}</span>
    </div>
  )
}
