import { useEffect, useState } from 'react'
import { BookMarked, Check, ChevronDown, Loader2 } from 'lucide-react'
import {
  FALLBACK_BIBLES,
  NKJV_VERSION,
  canReadBible,
  fetchAvailableBibles,
  fetchBibleMeta,
  type BibleVersion,
} from '../lib/youversion/bibles'
import { useJourneyStore } from '../store/useJourneyStore'

interface BibleVersionPickerProps {
  compact?: boolean
  onChanged?: (bible: BibleVersion) => void
}

export function BibleVersionPicker({
  compact = false,
  onChanged,
}: BibleVersionPickerProps) {
  const settings = useJourneyStore((s) => s.settings)
  const updateSettings = useJourneyStore((s) => s.updateSettings)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versions, setVersions] = useState<BibleVersion[]>(FALLBACK_BIBLES)
  const [query, setQuery] = useState('')
  const [customId, setCustomId] = useState('')
  const [customStatus, setCustomStatus] = useState<string | null>(null)
  const [nkjvNote, setNkjvNote] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAvailableBibles(['en'])
      .then(async (list) => {
        if (cancelled) return
        // Ensure current selection is in the list
        if (settings.bibleId && !list.some((v) => v.id === settings.bibleId)) {
          const meta = await fetchBibleMeta(settings.bibleId)
          if (meta) list = [meta, ...list]
        }
        if (list.length) setVersions(list)
        setError(null)

        // Probe NKJV availability for a clear message
        const nkjvListed = list.some(
          (v) =>
            v.id === '114' ||
            v.abbreviation.toUpperCase() === 'NKJV' ||
            v.title.toLowerCase().includes('new king james'),
        )
        if (!nkjvListed) {
          const ok = await canReadBible('114')
          if (cancelled) return
          if (ok) {
            setVersions((prev) =>
              prev.some((v) => v.id === '114') ? prev : [NKJV_VERSION, ...prev],
            )
            setNkjvNote(null)
          } else {
            setNkjvNote(
              'NKJV (id 114) is not licensed for this App Key yet. Accept a Thomas Nelson / HarperCollins license on platform.youversion.com if available, then add version ID 114 below.',
            )
          }
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load versions')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const select = (b: BibleVersion) => {
    updateSettings({
      bibleId: b.id,
      bibleAbbreviation: b.abbreviation,
      bibleTitle: b.title,
    })
    onChanged?.(b)
    setOpen(false)
    setCustomStatus(null)
  }

  const tryCustomId = async () => {
    const id = customId.trim()
    if (!id) return
    setCustomStatus('Checking…')
    const meta = await fetchBibleMeta(id)
    const readable = await canReadBible(id)
    if (!readable) {
      setCustomStatus(
        meta
          ? `Found “${meta.abbreviation}” but access denied (license required).`
          : `Version ${id} not found or not licensed for your key.`,
      )
      return
    }
    const b: BibleVersion = meta || {
      id,
      abbreviation: id === '114' ? 'NKJV' : id,
      title: id === '114' ? 'New King James Version' : `Bible ${id}`,
      languageTag: 'en',
      supportsJourney: true,
    }
    setVersions((prev) => (prev.some((v) => v.id === b.id) ? prev : [b, ...prev]))
    select(b)
    setCustomStatus(`Using ${b.abbreviation} — ${b.title}`)
  }

  const filtered = versions.filter((v) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      v.abbreviation.toLowerCase().includes(q) ||
      v.title.toLowerCase().includes(q) ||
      v.id.includes(q)
    )
  })

  // Pin NKJV search convenience
  const showNkjvHint =
    query.toLowerCase().includes('nkjv') ||
    query.toLowerCase().includes('king james')

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex max-w-full items-center gap-1.5 rounded-xl bg-gold/12 px-2.5 py-1.5 text-xs font-bold text-gold ring-1 ring-gold/30"
        >
          <BookMarked className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{settings.bibleAbbreviation || 'Bible'}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close version list"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-white/10 bg-navy-card shadow-2xl">
              <VersionList
                loading={loading}
                error={error}
                nkjvNote={nkjvNote}
                showNkjvHint={showNkjvHint}
                query={query}
                setQuery={setQuery}
                versions={filtered}
                selectedId={settings.bibleId}
                onSelect={select}
                customId={customId}
                setCustomId={setCustomId}
                onCustomSubmit={tryCustomId}
                customStatus={customStatus}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-parchment">
            {settings.bibleAbbreviation} · {settings.bibleTitle}
          </p>
          <p className="text-xs text-parchment-muted">YouVersion ID {settings.bibleId}</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
      </div>
      <VersionList
        loading={loading}
        error={error}
        nkjvNote={nkjvNote}
        showNkjvHint={showNkjvHint || true}
        query={query}
        setQuery={setQuery}
        versions={filtered}
        selectedId={settings.bibleId}
        onSelect={select}
        customId={customId}
        setCustomId={setCustomId}
        onCustomSubmit={tryCustomId}
        customStatus={customStatus}
      />
    </div>
  )
}

function VersionList({
  loading,
  error,
  nkjvNote,
  showNkjvHint,
  query,
  setQuery,
  versions,
  selectedId,
  onSelect,
  customId,
  setCustomId,
  onCustomSubmit,
  customStatus,
}: {
  loading: boolean
  error: string | null
  nkjvNote: string | null
  showNkjvHint: boolean
  query: string
  setQuery: (q: string) => void
  versions: BibleVersion[]
  selectedId: string
  onSelect: (b: BibleVersion) => void
  customId: string
  setCustomId: (v: string) => void
  onCustomSubmit: () => void
  customStatus: string | null
}) {
  return (
    <div className="flex max-h-[22rem] flex-col">
      <div className="border-b border-white/8 p-2">
        <input
          className="field !py-2 text-sm"
          placeholder="Search (try NKJV, BSB, WEB…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {nkjvNote && (showNkjvHint || !query) && (
        <p className="border-b border-white/5 px-3 py-2 text-[11px] leading-relaxed text-orange-200/90">
          {nkjvNote}
        </p>
      )}

      {error && (
        <p className="px-3 py-2 text-xs text-orange-300/90">
          {error}. Showing available list if any.
        </p>
      )}

      <div className="overflow-y-auto">
        {loading && versions.length <= 1 ? (
          <div className="flex items-center gap-2 px-3 py-6 text-sm text-parchment-muted">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Loading versions…
          </div>
        ) : versions.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-parchment-muted">
            No versions match
          </p>
        ) : (
          versions.map((v) => {
            const selected = v.id === selectedId
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-white/5 ${
                  selected ? 'bg-gold/10' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-parchment">
                      {v.abbreviation}
                    </span>
                    {!v.supportsJourney && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-parchment-muted">
                        Limited
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-parchment-muted">{v.title}</p>
                </div>
                {selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
              </button>
            )
          })
        )}
      </div>

      <div className="border-t border-white/8 p-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-parchment-muted">
          Custom version ID
        </p>
        <div className="flex gap-2">
          <input
            className="field !py-2 text-sm"
            placeholder="e.g. 114 for NKJV"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={onCustomSubmit}
            className="shrink-0 rounded-xl bg-gold px-3 text-xs font-bold text-navy"
          >
            Use
          </button>
        </div>
        {customStatus && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-parchment-muted">
            {customStatus}
          </p>
        )}
      </div>
    </div>
  )
}
