import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import type { JournalCategory } from '../types'
import { EmptyState, PageHeader, PageShell, Surface } from '../components/ui'
import { useJourneyStore } from '../store/useJourneyStore'

const TABS: { id: JournalCategory; label: string; short: string; prompt: string }[] = [
  {
    id: 'MAJOR_REVELATION',
    label: 'Revelations',
    short: 'Reveal',
    prompt: 'Major revelations during this journey',
  },
  {
    id: 'CHANGED_ME',
    label: 'Changed me',
    short: 'Changed',
    prompt: 'How the Word has changed me',
  },
  {
    id: 'COMMITMENT',
    label: 'Commitments',
    short: 'Commit',
    prompt: 'Commitments made to God during this study',
  },
  {
    id: 'FREEFORM',
    label: 'Free journal',
    short: 'Journal',
    prompt: 'Daily and weekly free-form reflections',
  },
]

export function JournalPage() {
  const journal = useJourneyStore((s) => s.journal)
  const addJournal = useJourneyStore((s) => s.addJournal)
  const deleteJournal = useJourneyStore((s) => s.deleteJournal)
  const [tab, setTab] = useState<JournalCategory>('MAJOR_REVELATION')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const entries = journal.filter((j) => j.category === tab)
  const meta = TABS.find((t) => t.id === tab)!

  const save = () => {
    if (!body.trim()) return
    addJournal(tab, title.trim(), body.trim())
    setTitle('')
    setBody('')
    setOpen(false)
  }

  return (
    <PageShell className="animate-fade-up relative">
      <PageHeader
        eyebrow="Write it down"
        title="Journal"
        subtitle="Capture what God is doing"
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-gold text-navy shadow-md shadow-gold/25'
                : 'surface text-parchment-muted'
            }`}
          >
            {t.short}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-parchment-muted">{meta.prompt}</p>

      {entries.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Tap the gold + button to add your first reflection in this section."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Surface key={e.id} className="!p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {e.title && (
                    <h3 className="font-serif text-base font-bold text-parchment">
                      {e.title}
                    </h3>
                  )}
                  <p className="mt-0.5 text-xs text-parchment-muted">
                    {format(parseISO(e.updatedAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this entry?')) deleteJournal(e.id)
                  }}
                  className="rounded-xl p-2 text-parchment-muted transition hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-parchment/90">
                {e.body}
              </p>
            </Surface>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="journal-fab fixed bottom-28 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold text-navy shadow-xl shadow-gold/40 transition hover:scale-105 active:scale-95 landscape:bottom-16 landscape:right-3 landscape:h-11 landscape:w-11"
        aria-label="Add entry"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center">
          <div className="surface w-full max-w-lg animate-fade-up rounded-[1.5rem] !p-5 shadow-2xl">
            <p className="eyebrow">New entry</p>
            <h2 className="mt-1 font-serif text-xl text-parchment">{meta.label}</h2>
            <input
              className="field mt-4"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="field mt-2 min-h-32"
              placeholder="Write freely…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button type="button" onClick={save} className="btn-primary flex-1 !w-auto">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
