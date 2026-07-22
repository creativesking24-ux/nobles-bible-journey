import { useEffect, useState } from 'react'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eraser,
  ExternalLink,
  Highlighter,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  PREFERRED_QUICK_VERSIONS,
  canReadBible,
  type BibleVersion,
} from '../lib/youversion/bibles'
import {
  fetchPassagesForReading,
  type FetchedPassage,
  type PassageFetchState,
} from '../lib/youversion/client'
import { bibleComUrl, bibleComUrlForReading, isReviewReading } from '../lib/youversion/refs'
import type { HighlightColor } from '../types'
import { highlightKey } from '../types'
import { useJourneyStore } from '../store/useJourneyStore'
import { BibleVersionPicker } from './BibleVersionPicker'
import { OpenInBibleApp } from './OpenInBibleApp'
import { Surface } from './ui'

const COLORS: { id: HighlightColor; label: string; swatch: string; bg: string }[] =
  [
    {
      id: 'yellow',
      label: 'Yellow',
      swatch: 'bg-yellow-400',
      bg: 'bg-yellow-400/35 ring-1 ring-yellow-300/40',
    },
    {
      id: 'green',
      label: 'Green',
      swatch: 'bg-emerald-400',
      bg: 'bg-emerald-400/30 ring-1 ring-emerald-300/40',
    },
    {
      id: 'blue',
      label: 'Blue',
      swatch: 'bg-sky-400',
      bg: 'bg-sky-400/30 ring-1 ring-sky-300/40',
    },
    {
      id: 'pink',
      label: 'Pink',
      swatch: 'bg-pink-400',
      bg: 'bg-pink-400/30 ring-1 ring-pink-300/40',
    },
    {
      id: 'orange',
      label: 'Orange',
      swatch: 'bg-orange-400',
      bg: 'bg-orange-400/30 ring-1 ring-orange-300/40',
    },
  ]

const colorBg: Record<HighlightColor, string> = Object.fromEntries(
  COLORS.map((c) => [c.id, c.bg]),
) as Record<HighlightColor, string>

interface ScriptureReaderProps {
  reading: string
  /** Calmer, distraction-free layout for the day reading view */
  focused?: boolean
}

export function ScriptureReader({ reading, focused = false }: ScriptureReaderProps) {
  const [state, setState] = useState<PassageFetchState>({ status: 'idle' })
  const [reloadKey, setReloadKey] = useState(0)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow')
  const [selected, setSelected] = useState<{
    passageRef: string
    verse: number
  } | null>(null)
  const [highlightMode, setHighlightMode] = useState(true)
  const [quickOk, setQuickOk] = useState<Record<string, boolean>>({})

  const highlights = useJourneyStore((s) => s.highlights)
  const applyHighlight = useJourneyStore((s) => s.applyHighlight)
  const clearHighlight = useJourneyStore((s) => s.clearHighlight)
  const settings = useJourneyStore((s) => s.settings)
  const updateSettings = useJourneyStore((s) => s.updateSettings)
  const bibleId = settings.bibleId || '3034'

  // Probe preferred quick versions once (offline-friendly after first success)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next: Record<string, boolean> = {}
      await Promise.all(
        PREFERRED_QUICK_VERSIONS.map(async (v) => {
          try {
            next[v.id] = await canReadBible(v.id)
          } catch {
            next[v.id] = v.id === '3034' // BSB often public / fallback
          }
        }),
      )
      if (!cancelled) setQuickOk(next)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isReviewReading(reading)) {
      setState({
        status: 'error',
        message:
          'Review day — re-read this week’s highlights in your notes or on bible.com.',
        code: 'REVIEW',
      })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })
    setSelected(null)
    setChapterIndex(0)

    fetchPassagesForReading(reading, bibleId)
      .then((result) => {
        if (!cancelled) setState(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Failed to load',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [reading, reloadKey, bibleId])

  useEffect(() => {
    if (state.status === 'ready' && state.passages.length > 0) {
      setChapterIndex((i) => Math.min(i, state.passages.length - 1))
    }
  }, [state])

  const bibleCom = bibleComUrlForReading(
    reading,
    bibleId,
    settings.bibleAbbreviation || 'BSB',
  )
  const gateway = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    reading.replace(/[–—]/g, '-'),
  )}&version=${encodeURIComponent(settings.bibleAbbreviation || 'NIV')}`

  const selectQuickVersion = (v: (typeof PREFERRED_QUICK_VERSIONS)[number]) => {
    if (v.id === bibleId) return
    updateSettings({
      bibleId: v.id,
      bibleAbbreviation: v.abbreviation,
      bibleTitle: v.title,
    })
    setReloadKey((k) => k + 1)
  }

  const onVerseTap = (
    passageRef: string,
    verse: number,
    text: string,
    label: string,
  ) => {
    setSelected({ passageRef, verse })
    if (!highlightMode) return
    applyHighlight({
      passageRef,
      verse,
      color: activeColor,
      text,
      label,
    })
  }

  const selectedKey = selected
    ? highlightKey(selected.passageRef, selected.verse)
    : null
  const selectedHighlight = selectedKey ? highlights[selectedKey] : undefined

  const passages = state.status === 'ready' ? state.passages : []
  const totalChapters = passages.length
  const current: FetchedPassage | null =
    totalChapters > 0 ? passages[Math.min(chapterIndex, totalChapters - 1)] : null
  const multi = totalChapters > 1

  const goPrev = () => {
    setChapterIndex((i) => Math.max(0, i - 1))
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goNext = () => {
    setChapterIndex((i) => Math.min(totalChapters - 1, i + 1))
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chapterBibleCom = current
    ? bibleComUrl(current.ref, bibleId, settings.bibleAbbreviation || 'BSB')
    : bibleCom

  const copyrightText =
    current?.copyright ||
    (state.status === 'ready' && state.source === 'fallback'
      ? 'World English Bible (WEB) — Public Domain'
      : null)

  const surfaceClass = focused
    ? '!overflow-visible !p-0 bg-transparent shadow-none ring-0 !border-0 backdrop-blur-none text-left'
    : '!overflow-visible !p-5 text-left'

  return (
    <Surface className={surfaceClass}>
      {/* Header + version */}
      <div
        className={`mb-3 flex w-full items-start justify-between gap-2 text-left ${
          focused ? '' : ''
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {!focused && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <BookOpen className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <h2
              className={`text-left font-semibold text-parchment ${
                focused ? 'font-serif text-lg' : ''
              }`}
            >
              {focused ? 'Read Scripture' : 'Scripture'}
            </h2>
            <p className="w-full text-left text-[11px] leading-snug text-parchment-muted">
              {settings.bibleAbbreviation}
              {multi
                ? ` · chapter ${chapterIndex + 1} of ${totalChapters}`
                : focused
                  ? ' · focused reading'
                  : ' · tap verse to highlight'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <BibleVersionPicker
            compact
            onChanged={(_b: BibleVersion) => setReloadKey((k) => k + 1)}
          />
          {state.status !== 'loading' && !isReviewReading(reading) && (
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-lg p-2 text-parchment-muted hover:bg-white/5 hover:text-gold"
              aria-label="Reload passage"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Easy version switcher — preferred translations */}
      <div className="mb-4 w-full text-left">
        <p className="mb-1.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-parchment-muted">
          Version
        </p>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
          {PREFERRED_QUICK_VERSIONS.map((v) => {
            const active = bibleId === v.id
            const known = quickOk[v.id]
            // Show all preferred chips; dim unknown until probed
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => selectQuickVersion(v)}
                title={v.title}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-gold text-navy shadow-md shadow-gold/25'
                    : known === false
                      ? 'bg-white/[0.03] text-parchment-muted/50 ring-1 ring-white/8'
                      : 'bg-white/5 text-parchment-muted ring-1 ring-white/10 hover:text-parchment'
                }`}
              >
                {v.abbreviation}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chapter navigator */}
      {state.status === 'ready' && multi && (
        <div className="mb-4 space-y-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {passages.map((p, i) => (
              <button
                key={p.ref}
                type="button"
                onClick={() => {
                  setChapterIndex(i)
                  setSelected(null)
                }}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  i === chapterIndex
                    ? 'bg-gold text-navy shadow-md shadow-gold/25'
                    : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={chapterIndex <= 0}
              className="btn-ghost !w-auto !px-3 !py-2 text-xs disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-xs font-semibold tabular-nums text-parchment-muted">
              {chapterIndex + 1} / {totalChapters}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={chapterIndex >= totalChapters - 1}
              className="btn-ghost !w-auto !px-3 !py-2 text-xs disabled:opacity-35"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Highlight toolbar — quieter in focused mode */}
      {state.status === 'ready' && current && !focused && (
        <div className="mb-4 rounded-xl bg-black/25 p-3 ring-1 ring-white/8">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-parchment-muted">
              <Highlighter className="h-3.5 w-3.5 text-gold" />
              Highlight
            </div>
            <button
              type="button"
              onClick={() => setHighlightMode((v) => !v)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                highlightMode
                  ? 'bg-gold/20 text-gold ring-1 ring-gold/35'
                  : 'bg-white/5 text-parchment-muted ring-1 ring-white/10'
              }`}
            >
              {highlightMode ? 'On' : 'Off'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                aria-label={`${c.label} highlight`}
                aria-pressed={activeColor === c.id}
                onClick={() => {
                  setActiveColor(c.id)
                  setHighlightMode(true)
                  if (selected && current) {
                    const v = current.verses.find((x) => x.number === selected.verse)
                    if (selected.passageRef === current.ref) {
                      applyHighlight({
                        passageRef: selected.passageRef,
                        verse: selected.verse,
                        color: c.id,
                        text: v?.text,
                        label: current.label,
                      })
                    }
                  }
                }}
                className={`h-8 w-8 rounded-full ${c.swatch} transition ring-offset-2 ring-offset-navy-card ${
                  activeColor === c.id
                    ? 'scale-110 ring-2 ring-white'
                    : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
            <button
              type="button"
              title="Remove highlight"
              aria-label="Remove highlight from selected verse"
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                clearHighlight(selected.passageRef, selected.verse)
              }}
              className="ml-1 flex h-8 items-center gap-1 rounded-full bg-white/5 px-2.5 text-[11px] font-semibold text-parchment-muted ring-1 ring-white/10 disabled:opacity-40"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          {selected && (
            <p className="mt-2 text-[11px] text-parchment-muted">
              Selected v{selected.verse}
              {selectedHighlight
                ? ` · ${selectedHighlight.color}`
                : ' · not highlighted'}
            </p>
          )}
        </div>
      )}

      {state.status === 'loading' && (
        <div className="scripture-loading flex w-full flex-col items-start gap-3 py-10 text-left text-sm text-parchment-muted">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-soft-pulse rounded-full bg-gold/15" />
            <Loader2 className="relative h-6 w-6 animate-spin text-gold" />
          </div>
          <span className="font-medium text-parchment">Loading Scripture…</span>
          <span className="w-full text-left text-[11px] leading-relaxed text-parchment-muted/90">
            Fetching {settings.bibleAbbreviation || 'your version'} for {reading}
            {multi ? '' : ' · chapters load one at a time'}
          </span>
          <div className="mt-1 h-1 w-full max-w-[12rem] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          </div>
        </div>
      )}

      {state.status === 'unconfigured' && (
        <div className="w-full space-y-3 rounded-xl bg-gold/10 p-3 text-left ring-1 ring-gold/25">
          <p className="text-sm leading-relaxed text-parchment">{state.message}</p>
          <OpenLinks bibleCom={bibleCom} gateway={gateway} />
        </div>
      )}

      {state.status === 'error' && (
        <div className="w-full space-y-3 text-left">
          <p className="text-sm leading-relaxed text-parchment-muted">{state.message}</p>
          <OpenLinks bibleCom={bibleCom} gateway={gateway} />
        </div>
      )}

      {state.status === 'ready' && current && (
        <div className="w-full space-y-4 text-left">
          {state.source === 'fallback' && (
            <p className="w-full rounded-xl bg-sky-500/10 px-3 py-2 text-left text-xs leading-relaxed text-sky-100 ring-1 ring-sky-400/30">
              Showing <strong>World English Bible</strong> (public domain) because
              YouVersion is temporarily unavailable. Prefer BSB when it recovers.
            </p>
          )}
          {state.warnings && state.warnings.length > 0 && (
            <p className="w-full text-left text-[11px] leading-relaxed text-parchment-muted">
              {state.warnings[0]}
            </p>
          )}

          <article className={`w-full text-left ${focused ? 'scripture-focus' : ''}`}>
            <div className="mb-1 flex w-full items-end justify-between gap-2">
              <h3
                className={`min-w-0 flex-1 text-left font-serif font-bold leading-snug text-gold-soft ${
                  focused ? 'text-[1.55rem]' : 'text-[1.4rem]'
                }`}
              >
                {current.label}
              </h3>
              {multi && (
                <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                  Ch. {chapterIndex + 1}/{totalChapters}
                </span>
              )}
            </div>

            <div className="mt-5 w-full space-y-1 overflow-visible text-left">
              {current.verses.length > 0 && current.verses[0].number > 0 ? (
                current.verses.map((v) => {
                  const key = highlightKey(current.ref, v.number)
                  const hl = highlights[key]
                  const isSelected =
                    selected?.passageRef === current.ref &&
                    selected.verse === v.number
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        onVerseTap(current.ref, v.number, v.text, current.label)
                      }
                      className={`verse-row px-3 py-2.5 transition ${
                        focused ? 'py-3' : 'py-2.5'
                      } ${hl ? colorBg[hl.color] : 'hover:bg-white/[0.04]'} ${
                        isSelected ? 'is-selected' : ''
                      }`}
                    >
                      <span
                        className={`scripture-verse font-serif text-parchment ${
                          focused ? 'text-[1.06rem]' : 'text-[1rem]'
                        }`}
                      >
                        <sup className="mr-1.5 select-none align-super text-[0.7rem] font-bold tabular-nums text-gold">
                          {v.number}
                        </sup>
                        {v.text}
                      </span>
                    </button>
                  )
                })
              ) : (
                <p
                  className={`scripture-verse px-1 font-serif text-parchment/95 ${
                    focused ? 'text-[1.06rem]' : 'text-[1rem]'
                  }`}
                >
                  {current.text}
                </p>
              )}
            </div>

            {/* Always show copyright attribution */}
            <footer className="mt-6 w-full border-t border-white/8 pt-3 text-left">
              <p className="w-full text-left text-[10px] leading-relaxed text-parchment-muted/85">
                {copyrightText ||
                  `${settings.bibleAbbreviation || 'Bible'} text · used under applicable license`}
              </p>
              <p className="mt-1 w-full text-left text-[10px] text-parchment-muted/60">
                Scripture provided via YouVersion Platform · {settings.bibleTitle || 'Bible'}
              </p>
            </footer>
          </article>

          {multi && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={goPrev}
                disabled={chapterIndex <= 0}
                className="btn-ghost flex-1 !py-3 text-sm disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" />
                {chapterIndex > 0 ? passages[chapterIndex - 1].label : 'Previous'}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={chapterIndex >= totalChapters - 1}
                className={`flex-1 !py-3 text-sm font-bold ${
                  chapterIndex >= totalChapters - 1
                    ? 'btn-ghost opacity-35'
                    : 'btn-primary'
                }`}
              >
                {chapterIndex < totalChapters - 1
                  ? passages[chapterIndex + 1].label
                  : 'Done'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <OpenInBibleApp
              passageRef={current.ref}
              versionId={bibleId}
              abbreviation={settings.bibleAbbreviation || 'BSB'}
            />
            {!focused && <OpenLinks bibleCom={chapterBibleCom} gateway={gateway} />}
            {focused && (
              <a
                href={chapterBibleCom}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost flex w-full !py-2.5 text-sm"
              >
                Open on bible.com <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {state.status === 'idle' && (
        <p className="text-sm text-parchment-muted">Open this day to load Scripture.</p>
      )}
    </Surface>
  )
}

function OpenLinks({ bibleCom, gateway }: { bibleCom: string; gateway: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={bibleCom}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost flex-1 !py-2.5 text-sm"
      >
        Open on bible.com <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <a
        href={gateway}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost flex-1 !py-2.5 text-sm"
      >
        Bible Gateway <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
