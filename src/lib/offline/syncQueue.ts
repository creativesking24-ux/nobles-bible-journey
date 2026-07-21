/**
 * Offline mutation queue.
 * User actions apply to local storage immediately.
 * When online, queued ops are marked synced (ready for a future cloud API).
 */

export type SyncOpType =
  | 'TOGGLE_DAY'
  | 'SET_DAY_COMPLETED'
  | 'SET_NOTES'
  | 'MEMORY_VERSE'
  | 'MEMORY_MASTERED'
  | 'KEY_INSIGHT'
  | 'JOURNAL_ADD'
  | 'JOURNAL_UPDATE'
  | 'JOURNAL_DELETE'
  | 'HIGHLIGHT_SET'
  | 'HIGHLIGHT_CLEAR'
  | 'SETTINGS'

export interface SyncOp {
  id: string
  type: SyncOpType
  payload: Record<string, unknown>
  createdAt: string
  /** Was the device offline when this happened? */
  offline: boolean
  status: 'pending' | 'synced' | 'failed'
  error?: string
  syncedAt?: string
}

const STORAGE_KEY = 'nobles-sync-queue-v1'
const META_KEY = 'nobles-sync-meta-v1'

type SyncMeta = {
  lastSyncedAt: string | null
  lastOnlineAt: string | null
}

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l())
}

export function subscribeSyncQueue(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function loadQueue(): SyncOp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SyncOp[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveQueue(ops: SyncOp[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops))
  notify()
}

function loadMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return { lastSyncedAt: null, lastOnlineAt: null }
    return JSON.parse(raw) as SyncMeta
  } catch {
    return { lastSyncedAt: null, lastOnlineAt: null }
  }
}

function saveMeta(meta: SyncMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
  notify()
}

export function getSyncQueue(): SyncOp[] {
  return loadQueue()
}

export function getPendingOps(): SyncOp[] {
  return loadQueue().filter((o) => o.status === 'pending')
}

export function getPendingCount(): number {
  return getPendingOps().length
}

export function getSyncMeta(): SyncMeta {
  return loadMeta()
}

export function enqueueSyncOp(
  type: SyncOpType,
  payload: Record<string, unknown>,
): SyncOp {
  const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false
  const op: SyncOp = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    offline,
    // If already online, still record then immediately sync-friendly
    status: 'pending',
  }
  const queue = loadQueue()
  queue.push(op)
  // Cap history
  const trimmed = queue.slice(-500)
  saveQueue(trimmed)

  // If online, try flush soon
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    void flushSyncQueue()
  }

  return op
}

/**
 * Flush pending ops when back online.
 * Local store is already source of truth — this marks ops synced
 * and is the hook for a future remote API.
 */
export async function flushSyncQueue(
  remoteSync?: (ops: SyncOp[]) => Promise<void>,
): Promise<{ synced: number; failed: number }> {
  const queue = loadQueue()
  const pending = queue.filter((o) => o.status === 'pending')
  if (pending.length === 0) {
    const meta = loadMeta()
    saveMeta({
      ...meta,
      lastOnlineAt: new Date().toISOString(),
      lastSyncedAt: meta.lastSyncedAt ?? new Date().toISOString(),
    })
    return { synced: 0, failed: 0 }
  }

  let synced = 0
  let failed = 0
  const now = new Date().toISOString()

  try {
    if (remoteSync) {
      await remoteSync(pending)
    }
    // Mark all pending as synced (local-first success)
    const next = queue.map((o) =>
      o.status === 'pending'
        ? { ...o, status: 'synced' as const, syncedAt: now }
        : o,
    )
    // Keep last 100 synced for history, drop older synced
    const pendingLeft = next.filter((o) => o.status === 'pending')
    const recentSynced = next
      .filter((o) => o.status === 'synced')
      .slice(-100)
    saveQueue([...pendingLeft, ...recentSynced])
    synced = pending.length
    saveMeta({ lastSyncedAt: now, lastOnlineAt: now })
  } catch (err) {
    failed = pending.length
    const message = err instanceof Error ? err.message : 'Sync failed'
    const next = queue.map((o) =>
      o.status === 'pending' ? { ...o, status: 'failed' as const, error: message } : o,
    )
    saveQueue(next)
    saveMeta({ ...loadMeta(), lastOnlineAt: now })
  }

  return { synced, failed }
}

/** Optional future remote endpoint */
export async function remoteSyncPlaceholder(ops: SyncOp[]): Promise<void> {
  // No cloud backend yet — localStorage already holds the truth.
  // When you add a server, POST ops here:
  // await fetch('/api/sync', { method: 'POST', body: JSON.stringify({ ops }) })
  void ops
}

export function clearSyncedHistory() {
  const pending = loadQueue().filter((o) => o.status === 'pending')
  saveQueue(pending)
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
