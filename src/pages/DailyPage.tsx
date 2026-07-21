import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle2,
  Mic,
  MicOff,
  NotebookPen,
} from 'lucide-react'
import { ScriptureReader } from '../components/ScriptureReader'
import { PageShell } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly 0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function DailyPage() {
  const { dayId } = useParams()
  const id = Number(dayId)
  const navigate = useNavigate()
  const day = useJourneyStore((s) => s.days.find((d) => d.id === id))
  const week = useJourneyStore((s) =>
    s.weeks.find((w) => w.weekNumber === day?.weekNumber),
  )
  const toggleDay = useJourneyStore((s) => s.toggleDay)
  const setDayNotes = useJourneyStore((s) => s.setDayNotes)

  const [listening, setListening] = useState(false)
  const recognition = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null
    const r = new SR() as SpeechRecognitionLike
    r.continuous = false
    r.interimResults = false
    r.lang = navigator.language || 'en-US'
    return r
  }, [])

  if (!day) {
    return (
      <PageShell>
        <p className="text-parchment-muted">
          Day not found.{' '}
          <Link to="/schedule" className="font-semibold text-gold">
            Back to plan
          </Link>
        </p>
      </PageShell>
    )
  }

  const startVoice = () => {
    if (!recognition) {
      alert('Voice input works best in Chrome on Android.')
      return
    }
    recognition.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript
      if (text) {
        const next = day.notes ? `${day.notes}\n${text}` : text
        setDayNotes(day.id, next)
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  const stopVoice = () => {
    recognition?.stop()
    setListening(false)
  }

  return (
    <PageShell className="animate-fade-up">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-parchment-muted ring-1 ring-white/10 transition hover:text-parchment"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <p className="eyebrow">
        Week {day.weekNumber} · {day.dayLabel}
      </p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-bold leading-tight text-parchment">
        {day.reading}
      </h1>
      <p className="mt-1.5 text-sm text-parchment-muted">
        {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
      </p>
      {week && (
        <p className="mt-2 text-xs leading-relaxed text-parchment-muted/90">
          Theme: {week.theme}
        </p>
      )}

      <button
        type="button"
        onClick={() => toggleDay(day.id)}
        className={`mt-5 ${day.completed ? 'btn-success' : 'btn-primary'}`}
      >
        <CheckCircle2 className={`h-5 w-5 ${day.completed ? 'check-pop' : ''}`} />
        {day.completed ? 'Completed' : 'Mark complete'}
      </button>

      <div className="mt-5">
        <ScriptureReader reading={day.reading} />
      </div>

      <section className="mt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-gold" />
            <h2 className="font-semibold text-parchment">Notes & revelations</h2>
          </div>
          <button
            type="button"
            onClick={listening ? stopVoice : startVoice}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              listening
                ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30 animate-soft-pulse'
                : 'bg-gold/12 text-gold ring-1 ring-gold/30'
            }`}
          >
            {listening ? (
              <>
                <MicOff className="h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" /> Voice
              </>
            )}
          </button>
        </div>
        <textarea
          className="field min-h-44"
          placeholder="What is the Spirit highlighting today?"
          value={day.notes}
          onChange={(e) => setDayNotes(day.id, e.target.value)}
        />
        {listening && (
          <p className="mt-2 text-center text-xs font-medium text-gold">Listening…</p>
        )}
        <p className="mt-2 text-center text-[11px] text-parchment-muted">
          Notes save automatically
        </p>
      </section>
    </PageShell>
  )
}
