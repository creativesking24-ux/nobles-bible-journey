export interface BibleVersion {
  id: string
  abbreviation: string
  title: string
  languageTag: string
  copyright?: string
  /** True if Epistles / Proverbs / Revelation books are present */
  supportsJourney: boolean
}

const JOURNEY_BOOKS = ['ROM', '1CO', 'PRO', 'REV'] as const

/** Common English version IDs (YouVersion / bible.com). May require extra licenses. */
export const KNOWN_ENGLISH_VERSIONS: { id: string; abbreviation: string; title: string }[] =
  [
    { id: '114', abbreviation: 'NKJV', title: 'New King James Version' },
    { id: '111', abbreviation: 'NIV', title: 'New International Version' },
    { id: '59', abbreviation: 'ESV', title: 'English Standard Version' },
    { id: '116', abbreviation: 'NLT', title: 'New Living Translation' },
    { id: '1', abbreviation: 'KJV', title: 'King James Version' },
    { id: '100', abbreviation: 'NASB', title: 'New American Standard Bible' },
    { id: '1713', abbreviation: 'CSB', title: 'Christian Standard Bible' },
    { id: '8', abbreviation: 'AMPC', title: 'Amplified Bible, Classic Edition' },
    { id: '1588', abbreviation: 'AMP', title: 'Amplified Bible' },
    { id: '97', abbreviation: 'MSG', title: 'The Message' },
    { id: '3034', abbreviation: 'BSB', title: 'Berean Standard Bible' },
    { id: '12', abbreviation: 'ASV', title: 'American Standard Version' },
    { id: '206', abbreviation: 'WEB', title: 'World English Bible' },
  ]

interface ApiBible {
  id: number | string
  abbreviation?: string
  localized_abbreviation?: string
  title?: string
  localized_title?: string
  language_tag?: string
  copyright?: string
  books?: string[]
}

/**
 * Fetch licensed Bible versions available to this App Key.
 * Merges English catalog + licensed popular versions (NIV, etc.).
 */
export async function fetchAvailableBibles(
  languageRanges: string[] = ['en'],
): Promise<BibleVersion[]> {
  const byId = new Map<string, BibleVersion>()

  // 1) English catalog from API
  try {
    const list = await fetchBiblesByLanguage(languageRanges)
    for (const b of list) byId.set(b.id, b)
  } catch {
    // continue with licenses / known
  }

  // 2) License-backed IDs (may include more than language catalog shows)
  let licensedIds = new Set<string>()
  try {
    licensedIds = await fetchLicensedBibleIds()
  } catch {
    licensedIds = new Set()
  }

  // 3) Resolve popular English versions that are licensed (or already listed)
  const toResolve = KNOWN_ENGLISH_VERSIONS.map((v) => v.id).filter(
    (id) => licensedIds.has(id) || byId.has(id),
  )

  // Always try to resolve known ones that appear in licenses even if not in en catalog
  for (const known of KNOWN_ENGLISH_VERSIONS) {
    if (licensedIds.has(known.id) && !byId.has(known.id)) {
      toResolve.push(known.id)
    }
  }

  await Promise.all(
    [...new Set(toResolve)].map(async (id) => {
      if (byId.has(id)) return
      try {
        const b = await fetchBibleMeta(id)
        if (b) byId.set(b.id, b)
      } catch {
        /* skip */
      }
    }),
  )

  // 4) Mark known English even if metadata failed (show as needing license)
  for (const known of KNOWN_ENGLISH_VERSIONS) {
    if (!byId.has(known.id) && licensedIds.has(known.id)) {
      byId.set(known.id, {
        id: known.id,
        abbreviation: known.abbreviation,
        title: known.title,
        languageTag: 'en',
        supportsJourney: true,
      })
    }
  }

  const list = [...byId.values()].filter((b) => b.id && b.title)
  list.sort((a, b) => {
    if (a.supportsJourney !== b.supportsJourney) {
      return a.supportsJourney ? -1 : 1
    }
    return a.abbreviation.localeCompare(b.abbreviation)
  })

  if (list.length === 0) return FALLBACK_BIBLES
  return list
}

async function fetchBiblesByLanguage(languageRanges: string[]): Promise<BibleVersion[]> {
  const params = new URLSearchParams()
  for (const lang of languageRanges) {
    params.append('language_ranges[]', lang)
  }

  const res = await fetch(`/api/youversion/v1/bibles?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  if (res.status === 503) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; error?: string }
    if (body.code === 'NOT_CONFIGURED') {
      throw new Error('YVP_APP_KEY not configured')
    }
    throw new Error(body.error || 'Bible list unavailable (503)')
  }

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`Failed to load Bible versions (${res.status}) ${t.slice(0, 120)}`)
  }

  const data = (await res.json()) as { data?: ApiBible[] }
  const list = Array.isArray(data.data) ? data.data : []
  return list.map(normalizeBible)
}

async function fetchLicensedBibleIds(): Promise<Set<string>> {
  const res = await fetch('/api/youversion/v1/licenses', {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return new Set()
  const data = (await res.json()) as { data?: Array<{ bible_ids?: number[] }> }
  const ids = new Set<string>()
  for (const lic of data.data || []) {
    for (const id of lic.bible_ids || []) ids.add(String(id))
  }
  return ids
}

export async function fetchBibleMeta(id: string): Promise<BibleVersion | null> {
  const res = await fetch(`/api/youversion/v1/bibles/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = (await res.json()) as ApiBible
  return normalizeBible(data)
}

/** Probe whether a version can return Scripture text */
export async function canReadBible(id: string): Promise<boolean> {
  const res = await fetch(
    `/api/youversion/v1/bibles/${encodeURIComponent(id)}/passages/JHN.3.16`,
    { headers: { Accept: 'application/json' } },
  )
  return res.ok
}

function normalizeBible(b: ApiBible): BibleVersion {
  const books = b.books ?? []
  const supportsJourney =
    books.length === 0 || JOURNEY_BOOKS.every((code) => books.includes(code))

  return {
    id: String(b.id),
    abbreviation: b.localized_abbreviation || b.abbreviation || String(b.id),
    title: b.localized_title || b.title || 'Bible',
    languageTag: b.language_tag || 'en',
    copyright: b.copyright || undefined,
    supportsJourney,
  }
}

export const FALLBACK_BIBLES: BibleVersion[] = [
  {
    id: '3034',
    abbreviation: 'BSB',
    title: 'Berean Standard Bible',
    languageTag: 'en',
    copyright: 'Public Domain',
    supportsJourney: true,
  },
]

export const NKJV_VERSION: BibleVersion = {
  id: '114',
  abbreviation: 'NKJV',
  title: 'New King James Version',
  languageTag: 'en',
  supportsJourney: true,
}
