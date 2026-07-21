import {
  fetchPassagesFromFallback,
  isYouVersionCoolingDown,
  markYouVersionRateLimited,
} from './fallbackBible'
import { parseReadingToRefs, type ParsedPassage } from './refs'

/**
 * Default Bible ID: Berean Standard Bible.
 * Override via settings (preferred) or VITE_YVP_BIBLE_ID env.
 */
export const DEFAULT_BIBLE_ID =
  (import.meta.env.VITE_YVP_BIBLE_ID as string | undefined)?.trim() || '3034'

export type PassageFetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | {
      status: 'ready'
      passages: FetchedPassage[]
      warnings?: string[]
      /** youversion | fallback */
      source?: 'youversion' | 'fallback'
    }
  | { status: 'error'; message: string; code?: string }
  | { status: 'unconfigured'; message: string }

export interface VerseBlock {
  number: number
  text: string
}

export interface FetchedPassage {
  ref: string
  label: string
  text: string
  verses: VerseBlock[]
  copyright?: string
  raw?: unknown
}

const memoryCache = new Map<string, FetchedPassage>()
const CACHE_PREFIX = 'yv-passage-v2:'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h

function cacheKey(bibleId: string, ref: string) {
  return `${bibleId}:${ref}`
}

function readCache(bibleId: string, ref: string): FetchedPassage | null {
  const key = cacheKey(bibleId, ref)
  const mem = memoryCache.get(key)
  if (mem) return mem
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { at: number; passage: FetchedPassage }
    if (Date.now() - parsed.at > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    memoryCache.set(key, parsed.passage)
    return parsed.passage
  } catch {
    return null
  }
}

function writeCache(bibleId: string, ref: string, passage: FetchedPassage) {
  const key = cacheKey(bibleId, ref)
  memoryCache.set(key, passage)
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ at: Date.now(), passage }),
    )
  } catch {
    /* ignore */
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch chapters for a plan reading.
 * 1) YouVersion (if not cooling down) with cache + retries
 * 2) Public-domain fallback (bible-api.com WEB) so text always shows
 */
export async function fetchPassagesForReading(
  reading: string,
  bibleId: string = DEFAULT_BIBLE_ID,
): Promise<PassageFetchState> {
  const parsed = parseReadingToRefs(reading)
  if (parsed.length === 0) {
    return {
      status: 'error',
      message: 'This day is a review — no new reading to load.',
      code: 'REVIEW',
    }
  }

  // Serve fully from cache when possible (fast path)
  const allCached = parsed.every((p) => readCache(bibleId, p.ref))
  if (allCached) {
    return {
      status: 'ready',
      source: 'youversion',
      passages: parsed.map((p) => readCache(bibleId, p.ref)!),
    }
  }

  // Prefer fallback while YouVersion is rate-limiting
  if (isYouVersionCoolingDown()) {
    try {
      const passages = await fetchPassagesFromFallback(reading)
      return {
        status: 'ready',
        source: 'fallback',
        passages,
        warnings: [
          'YouVersion is rate-limited — showing World English Bible (public domain) for now.',
        ],
      }
    } catch {
      // fall through to try YouVersion again
    }
  }

  const passages: FetchedPassage[] = []
  const warnings: string[] = []
  let hitRateLimit = false
  let hitForbidden = false
  let hitUnconfigured = false

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]
    const cached = readCache(bibleId, p.ref)
    if (cached) {
      passages.push(cached)
      continue
    }

    if (i > 0) await sleep(350)

    try {
      const passage = await fetchOneFromYouVersion(p, bibleId)
      passages.push(passage)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load'
      if (message.includes('NOT_CONFIGURED') || message.includes('YVP_APP_KEY')) {
        hitUnconfigured = true
      }
      if (message.includes('401') || message.includes('403') || message.includes('licensed')) {
        hitForbidden = true
      }
      if (message.includes('429') || message.toLowerCase().includes('rate')) {
        hitRateLimit = true
        markYouVersionRateLimited(90_000)
      }
      warnings.push(`${p.label}: ${message}`)
    }
  }

  if (passages.length > 0) {
    return {
      status: 'ready',
      source: 'youversion',
      passages,
      warnings: warnings.length ? warnings : undefined,
    }
  }

  // Full failure on YouVersion → public domain fallback
  try {
    const fallback = await fetchPassagesFromFallback(reading)
    const note = hitRateLimit
      ? 'YouVersion rate limit — showing World English Bible (public domain). Try your preferred version again later.'
      : hitForbidden
        ? 'Selected YouVersion text is not licensed — showing World English Bible (public domain). Switch to BSB/ASV if licensed.'
        : hitUnconfigured
          ? 'YouVersion key not configured — showing World English Bible (public domain).'
          : 'YouVersion unavailable — showing World English Bible (public domain).'

    return {
      status: 'ready',
      source: 'fallback',
      passages: fallback,
      warnings: [note],
    }
  } catch (fbErr) {
    const fbMsg = fbErr instanceof Error ? fbErr.message : 'Fallback failed'
    if (hitUnconfigured) {
      return {
        status: 'unconfigured',
        message:
          'YouVersion App Key not configured, and offline fallback failed. Check your network and .env YVP_APP_KEY.',
      }
    }
    return {
      status: 'error',
      message: hitRateLimit
        ? `YouVersion rate-limited and fallback failed (${fbMsg}). Wait a minute and reload.`
        : `${warnings[0] || 'Could not load Scripture'}. Fallback: ${fbMsg}`,
      code: hitRateLimit ? 'RATE_LIMIT' : 'EMPTY',
    }
  }
}

async function fetchOneFromYouVersion(
  parsed: ParsedPassage,
  bibleId: string,
): Promise<FetchedPassage> {
  const cached = readCache(bibleId, parsed.ref)
  if (cached) return cached

  const path = `/api/youversion/v1/bibles/${encodeURIComponent(bibleId)}/passages/${encodeURIComponent(parsed.ref)}?format=html`

  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(1200 * attempt)

    const res = await fetch(path, { headers: { Accept: 'application/json' } })

    if (res.status === 429) {
      markYouVersionRateLimited(90_000)
      lastErr = new Error('429 rate limit')
      // Don't burn more retries if hard-limited
      if (attempt >= 1) break
      continue
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `YouVersion ${res.status}: version not licensed or App Key invalid.`,
      )
    }

    if (res.status === 503) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: string
        code?: string
      }
      if (body.code === 'NOT_CONFIGURED') {
        throw new Error(
          body.error ||
            'YVP_APP_KEY not configured. Copy .env.example to .env and set your YouVersion App Key.',
        )
      }
      throw new Error(body.error || 'YouVersion proxy unavailable (503).')
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      // Plain text "Rate limit exceeded." without JSON
      if (res.status === 429 || /rate limit/i.test(body)) {
        markYouVersionRateLimited(90_000)
        lastErr = new Error('429 rate limit')
        continue
      }
      throw new Error(
        `YouVersion API ${res.status} for ${parsed.ref}${body ? `: ${body.slice(0, 100)}` : ''}`,
      )
    }

    // Content-Type may be text/plain on some errors
    const rawText = await res.text()
    if (/rate limit/i.test(rawText) && !rawText.trim().startsWith('{')) {
      markYouVersionRateLimited(90_000)
      lastErr = new Error('429 rate limit')
      continue
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(rawText) as Record<string, unknown>
    } catch {
      throw new Error(`Invalid JSON for ${parsed.ref}`)
    }

    const passage = normalizePassageResponse(parsed, data)
    writeCache(bibleId, parsed.ref, passage)
    return passage
  }

  throw lastErr || new Error(`Failed to load ${parsed.ref}`)
}

function normalizePassageResponse(
  parsed: ParsedPassage,
  data: Record<string, unknown>,
): FetchedPassage {
  const rawContent = data.content
  let contentStr = ''
  if (typeof rawContent === 'string') {
    contentStr = rawContent
  } else if (rawContent && typeof rawContent === 'object') {
    const c = rawContent as Record<string, unknown>
    contentStr = String(c.html || c.content || c.text || '')
  } else if (typeof data.text === 'string') {
    contentStr = data.text
  }

  const verses = parseVersesFromHtml(contentStr)
  const plain = cleanText(contentStr)
  const text =
    verses.length > 0
      ? verses.map((v) => `${v.number} ${v.text}`).join(' ')
      : plain ||
        'Passage loaded but text format was unexpected. Open bible.com for full reading.'

  const finalVerses =
    verses.length > 0 ? verses : plain ? [{ number: 0, text: plain }] : []

  const copyright =
    typeof data.copyright === 'string' ? data.copyright : undefined

  return {
    ref: parsed.ref,
    label:
      (typeof data.reference === 'string' && data.reference) || parsed.label,
    text,
    verses: finalVerses,
    copyright,
    raw: import.meta.env.DEV ? data : undefined,
  }
}

export function parseVersesFromHtml(html: string): VerseBlock[] {
  if (!html || !html.includes('yv-')) return []

  const parts = html.split(
    /<span[^>]*class="[^"]*yv-vlbl[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i,
  )
  const verses: VerseBlock[] = []
  for (let i = 1; i < parts.length; i += 2) {
    const number = Number(parts[i])
    const text = cleanText(parts[i + 1] ?? '')
    if (!Number.isFinite(number) || !text) continue
    verses.push({ number, text })
  }

  if (verses.length === 0) {
    const parts2 = html.split(/<span[^>]*\bv="(\d+)"[^>]*>\s*<\/span>/i)
    for (let i = 1; i < parts2.length; i += 2) {
      const number = Number(parts2[i])
      const text = cleanText(parts2[i + 1] ?? '')
      if (!Number.isFinite(number) || !text) continue
      verses.push({ number, text })
    }
  }

  return verses
}

function cleanText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
