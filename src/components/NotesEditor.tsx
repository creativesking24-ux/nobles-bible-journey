import { useEffect, useRef, useState } from 'react'
import { Check, Expand, Loader2, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved'

interface NotesEditorProps {
  value: string
  onChange: (value: string) => void
  /** Reset save UI when this key changes (e.g. day id) */
  syncKey?: string | number
  placeholder?: string
  /** Called when user wants to expand into a full journal entry */
  onExpandToJournal?: () => void
  /** Allow voice dictation (browser SpeechRecognition) */
  enableVoice?: boolean
  /** Larger height for comfortable mobile typing */
  size?: 'default' | 'large' | 'xl'
  label?: string
  className?: string
}

/**
 * Comfortable notes field with visual auto-save status.
 * Parent should write through immediately (Zustand persist already saves).
 */
export function NotesEditor({
  value,
  onChange,
  syncKey,
  placeholder = 'What is the Spirit highlighting today?',
  onExpandToJournal,
  enableVoice = false,
  size = 'large',
  label = 'Notes & revelations',
  className = '',
}: NotesEditorProps) {
  const [status, setStatus] = useState<SaveStatus>(value.trim() ? 'saved' : 'idle')
  const [expanded, setExpanded] = useState(false)
  const [listening, setListening] = useState(false)
  const timer = useRef<number | null>(null)
  const recognitionRef = useRef<{
    start: () => void
    stop: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onresult: ((ev: any) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
  } | null>(null)

  // When navigating to another day, reset status from stored notes
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    setStatus(value.trim() ? 'saved' : 'idle')
    setExpanded(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on key change
  }, [syncKey])

  const handleChange = (next: string) => {
    onChange(next)
    setStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setStatus(next.trim() ? 'saved' : 'idle')
    }, 450)
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (!enableVoice) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = false
    r.interimResults = false
    r.lang = navigator.language || 'en-US'
    recognitionRef.current = r
  }, [enableVoice])

  const startVoice = () => {
    const r = recognitionRef.current
    if (!r) {
      alert('Voice input works best in Chrome on Android.')
      return
    }
    r.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript
      if (text) {
        const next = value ? `${value}\n${text}` : text
        handleChange(next)
      }
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    setListening(true)
    r.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const minH =
    expanded || size === 'xl'
      ? 'min-h-[16rem]'
      : size === 'large'
        ? 'min-h-[10.5rem]'
        : 'min-h-32'

  return (
    <section className={`notes-editor ${className}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="font-semibold text-parchment">{label}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SaveBadge status={status} hasContent={!!value.trim()} />
          {enableVoice && (
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
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
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full bg-white/5 p-1.5 text-parchment-muted ring-1 ring-white/10 hover:text-gold"
            aria-label={expanded ? 'Collapse notes' : 'Expand notes'}
            title={expanded ? 'Collapse' : 'Write more'}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      <textarea
        className={`field field-notes ${minH} text-[1rem] leading-[1.65]`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={expanded ? 12 : size === 'large' ? 6 : 4}
      />

      {listening && (
        <p className="mt-2 text-center text-xs font-medium text-gold">Listening…</p>
      )}

      {onExpandToJournal && value.trim() && (
        <button
          type="button"
          onClick={onExpandToJournal}
          className="btn-ghost mt-2.5 w-full !py-2.5 text-sm"
        >
          <Expand className="h-4 w-4 text-gold" />
          Expand into journal entry
        </button>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-parchment-muted/90">
        Auto-saves on this device · edit anytime
      </p>
    </section>
  )
}

function SaveBadge({
  status,
  hasContent,
}: {
  status: SaveStatus
  hasContent: boolean
}) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-parchment-muted ring-1 ring-white/10">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving
      </span>
    )
  }
  if (status === 'saved' && hasContent) {
    return (
      <span className="saved-badge inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success ring-1 ring-success/30">
        <Check className="h-3 w-3" strokeWidth={3} />
        Saved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-parchment-muted/70 ring-1 ring-white/8">
      Draft
    </span>
  )
}
