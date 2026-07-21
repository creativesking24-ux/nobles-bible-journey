import { format, parseISO } from 'date-fns'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { DayData, JournalEntry, WeekData } from '../types'

export async function exportCertificateImage(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element, {
    backgroundColor: '#0D1B2A',
    scale: 2,
    useCORS: true,
  })
  const dataUrl = canvas.toDataURL('image/png')

  if (navigator.share) {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Noble's Bible Journey Certificate" })
        return
      }
    } catch {
      // fall through to download
    }
  }

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  a.click()
}

export function exportProgressPdf(opts: {
  userName: string
  weeks: WeekData[]
  days: DayData[]
  journal: JournalEntry[]
  percent: number
  weeksCompleted: number
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  let y = margin

  const line = (text: string, size = 11, color: [number, number, number] = [30, 30, 30]) => {
    if (y > 780) {
      doc.addPage()
      y = margin
    }
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, 500)
    doc.text(lines, margin, y)
    y += lines.length * (size + 4)
  }

  doc.setFont('times', 'bold')
  line("Noble's Bible Journey Tracker", 18, [13, 27, 42])
  doc.setFont('helvetica', 'normal')
  line('90+ Day Journey · June 15 – September 20, 2026', 11, [168, 139, 42])
  line(`${opts.userName} · ${opts.percent}% complete · ${opts.weeksCompleted}/14 weeks`, 11)
  y += 8
  line('OVERALL PROGRESS SUMMARY', 13, [13, 27, 42])

  opts.weeks.forEach((w) => {
    const wd = opts.days.filter((d) => d.weekNumber === w.weekNumber)
    const done = wd.length > 0 && wd.every((d) => d.completed)
    const range = `${format(parseISO(w.startDate), 'MMM d')}–${format(parseISO(w.endDate), 'MMM d')}`
    const verse = w.memoryVerse || '—'
    const mastered = w.memoryVerseMastered
      ? `Mastered ${w.memoryVerseMasteredDate ?? ''}`
      : 'Not mastered'
    line(
      `Week ${w.weekNumber}  ${range}  ${done ? 'Done' : 'In progress'}  |  ${mastered}  |  ${verse}`,
      9,
    )
  })

  y += 12
  line('COMPLETION CERTIFICATE', 14, [13, 27, 42])
  line(`I, ${opts.userName}, have completed the 90+ Day Bible Study Journey`, 11)
  line('Start: June 15, 2026 · End: September 20, 2026', 10)
  line('Books: Epistles + Proverbs + Revelation · Chapters: 143+', 10)
  line('"This Book of the Law shall not depart from your mouth…" — Joshua 1:8', 10, [
    168, 139, 42,
  ])

  if (opts.journal.length) {
    y += 16
    line('JOURNAL EXCERPTS', 13, [13, 27, 42])
    opts.journal.slice(0, 20).forEach((j) => {
      line(
        `[${j.category}] ${j.title || 'Untitled'} — ${format(parseISO(j.updatedAt), 'MMM d, yyyy')}`,
        9,
        [80, 80, 80],
      )
      line(j.body.slice(0, 280) + (j.body.length > 280 ? '…' : ''), 9)
      y += 4
    })
  }

  doc.save('nobles-bible-journey-progress.pdf')
}
