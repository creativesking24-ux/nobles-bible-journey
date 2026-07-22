import { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  BookOpen,
  Check,
  Loader2,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import type { JournalCategory, JournalEntry } from '../types'
import { EmptyState } from '../components/EmptyState'
import { PageHeader, PageShell, Surface } from '../components/ui'
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

type SaveStatus = 'idle' | 'saving' | 'saved'

export function JournalPage() {
  const journal = useJourneyStore((s) => s.journal)
  const days = useJourneyStore((s) => s.days)
  const addJournal = useJourneyStore((s) => s.addJournal)
  const updateJournal = useJourneyStore((s) => s.updateJournal)
  const deleteJournal = useJourneyStore((s) => s.deleteJournal)
  const [tab, setTab] = useState<JournalCategory>('MAJOR_REVELATION')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimer = useRef<number | null>(null)

  const entries = journal.filter((j) => j.category === tab)
  const meta = TABS.find((t) => t.id === tab)!
  const dayNotes = days.filter((d) => d.notes.trim().length > 0)
  const totalEntries = journal.length

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [])

  const openNew = () => {
    setEditing(null)
    setTitle('')
    setBody('')
    setSaveStatus('idle')
    setOpen(true)
  }

  const openEdit = (e: JournalEntry) => {
    setEditing(e)
    setTitle(e.title)
    setBody(e.body)
    setSaveStatus('saved')
    setOpen(true)
  }

  const persistEdit = (nextTitle: string, nextBody: string) => {
    if (!editing) return
    setSaveStatus('saving')
    updateJournal(editing.id, { title: nextTitle, body: nextBody })
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaveStatus('saved'), 400)
  }

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (editing) persistEdit(v, body)
  }

  const onBodyChange = (v: string) => {
    setBody(v)
    if (editing) persistEdit(title, v)
  }

  const saveNew = () => {
    if (!body.trim()) return
    addJournal(tab, title.trim(), body.trim())
    setTitle('')
    setBody('')
    setOpen(false)
    setSaveStatus('idle')
  }

  const closeSheet = () => {
    setOpen(false)
    setEditing(null)
    setTitle('')
    setBody('')
    setSaveStatus('idle')
  }

  return (
    <PageShell className="animate-fade-up relative">
      <PageHeader
        eyebrow="Write it down"
        title="Journal"
        subtitle="Capture what God is doing"
      />

      {/* Category tabs */}
      <div className="no-scrollbar app-bleed-x mb-5 flex gap-2 overflow-x-auto pb-0.5">
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

      <p className="mb-5 text-sm leading-relaxed text-parchment-muted">{meta.prompt}</p>

      {/* First-time / empty guidance */}
      {totalEntries === 0 && dayNotes.length === 0 && (
        <div className="mb-5">
          <EmptyState
            icon={<NotebookPen className="h-6 w-6" />}
            eyebrow="Your sacred notebook"
            title="Nothing written yet — and that’s okay"
            body="Use the + button to record a revelation, or jot notes on any day’s reading page. You can expand daily notes into a full journal entry anytime."
            action={
              <button type="button" onClick={openNew} className="btn-primary !py-3.5">
                <Plus className="h-5 w-5" />
                Write your first entry
              </button>
            }
          />
        </div>
      )}

      {entries.length === 0 && totalEntries > 0 && (
        <EmptyState
          className="mb-5"
          icon={<BookOpen className="h-6 w-6" />}
          title={`No ${meta.label.toLowerCase()} yet`}
          body={`Tap + to add something under “${meta.label}”. Switch tabs above to see other sections.`}
          action={
            <button type="button" onClick={openNew} className="btn-primary !py-3">
              <Plus className="h-4 w-4" />
              Add entry
            </button>
          }
        />
      )}

      {entries.length === 0 && totalEntries === 0 && dayNotes.length > 0 && (
        <Surface className="mb-5 !p-5">
          <p className="eyebrow">From daily notes</p>
          <p className="mt-2 text-sm leading-relaxed text-parchment-muted">
            You already have notes on {dayNotes.length} day
            {dayNotes.length === 1 ? '' : 's'}. Open a day to edit them, or start a
            category entry with +.
          </p>
        </Surface>
      )}

      {entries.length > 0 && (
        <div className="space-y-3.5">
          {entries.map((e) => (
            <Surface key={e.id} className="!p-5">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(e)}
                  className="min-w-0 flex-1 text-left"
                >
                  {e.title && (
                    <h3 className="font-serif text-base font-bold text-parchment">
                      {e.title}
                    </h3>
                  )}
                  <p className="mt-0.5 text-xs text-parchment-muted">
                    {format(parseISO(e.updatedAt), 'MMM d, yyyy · h:mm a')}
                    <span className="text-gold/80"> · Tap to edit</span>
                  </p>
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(e)}
                    className="rounded-xl p-2 text-parchment-muted transition hover:bg-gold/10 hover:text-gold"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
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
              </div>
              <button
                type="button"
                onClick={() => openEdit(e)}
                className="mt-3.5 w-full text-left"
              >
                <p className="whitespace-pre-wrap text-sm leading-[1.7] text-parchment/90">
                  {e.body}
                </p>
              </button>
            </Surface>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={openNew}
        className="journal-fab fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold text-navy shadow-xl shadow-gold/40 transition hover:scale-105 active:scale-95 landscape:bottom-16 landscape:right-5 landscape:h-11 landscape:w-11"
        aria-label="Add entry"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 app-gutter-x py-4 backdrop-blur-sm sm:items-center sm:py-6">
          <div className="surface w-full max-w-lg animate-fade-up rounded-[1.5rem] !p-5 shadow-2xl sm:!p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="eyebrow">{editing ? 'Edit entry' : 'New entry'}</p>
                <h2 className="mt-1 font-serif text-xl text-parchment">{meta.label}</h2>
              </div>
              {editing && (
                <SavePill status={saveStatus} />
              )}
            </div>
            <input
              className="field mt-5"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
            <textarea
              className="field field-notes mt-3 min-h-[12rem] text-[1rem] leading-[1.65]"
              placeholder="Write freely… what is God showing you?"
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              autoFocus
            />
            {editing ? (
              <p className="mt-2 text-[11px] text-parchment-muted">
                Changes auto-save on this device
              </p>
            ) : null}
            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={closeSheet} className="btn-ghost flex-1">
                {editing ? 'Done' : 'Cancel'}
              </button>
              {!editing && (
                <button
                  type="button"
                  onClick={saveNew}
                  className="btn-primary flex-1 !w-auto"
                  disabled={!body.trim()}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function SavePill({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-parchment-muted ring-1 ring-white/10">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold uppercase text-success ring-1 ring-success/30">
        <Check className="h-3 w-3" strokeWidth={3} /> Saved
      </span>
    )
  }
  return null
}
