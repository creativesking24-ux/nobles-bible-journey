import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  flushSyncQueue,
  getPendingCount,
  getSyncMeta,
  remoteSyncPlaceholder,
  subscribeSyncQueue,
} from '../lib/offline/syncQueue'

function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

export function useOnlineStatus() {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  )

  const pendingCount = useSyncExternalStore(
    subscribeSyncQueue,
    () => getPendingCount(),
    () => 0,
  )

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    () => getSyncMeta().lastSyncedAt,
  )
  const [syncing, setSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeSyncQueue(() => {
      setLastSyncedAt(getSyncMeta().lastSyncedAt)
    })
    return () => {
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!online) return
    let cancelled = false
    const run = async () => {
      setSyncing(true)
      try {
        const result = await flushSyncQueue(remoteSyncPlaceholder)
        if (cancelled) return
        if (result.synced > 0) {
          setLastSyncResult(
            `Synced ${result.synced} offline change${result.synced === 1 ? '' : 's'}`,
          )
        } else {
          setLastSyncResult(null)
        }
        setLastSyncedAt(getSyncMeta().lastSyncedAt)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [online])

  const syncNow = async () => {
    if (!online) return
    setSyncing(true)
    try {
      const result = await flushSyncQueue(remoteSyncPlaceholder)
      setLastSyncResult(
        result.synced > 0
          ? `Synced ${result.synced} change${result.synced === 1 ? '' : 's'}`
          : 'Everything up to date',
      )
      setLastSyncedAt(getSyncMeta().lastSyncedAt)
    } finally {
      setSyncing(false)
    }
  }

  return {
    online,
    pendingCount,
    lastSyncedAt,
    syncing,
    lastSyncResult,
    syncNow,
    clearSyncMessage: () => setLastSyncResult(null),
  }
}
