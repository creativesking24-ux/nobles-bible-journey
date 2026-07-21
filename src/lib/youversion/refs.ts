/**
 * Map plan reading labels → YouVersion / USFM-style passage IDs
 * e.g. "Romans 1–2" → ["ROM.1", "ROM.2"]
 *     "2 Cor 13, Galatians 1" → ["2CO.13", "GAL.1"]
 */

const BOOK_ALIASES: Record<string, string> = {
  // Full names
  genesis: 'GEN',
  exodus: 'EXO',
  leviticus: 'LEV',
  numbers: 'NUM',
  deuteronomy: 'DEU',
  joshua: 'JOS',
  judges: 'JDG',
  ruth: 'RUT',
  '1 samuel': '1SA',
  '2 samuel': '2SA',
  '1 kings': '1KI',
  '2 kings': '2KI',
  '1 chronicles': '1CH',
  '2 chronicles': '2CH',
  ezra: 'EZR',
  nehemiah: 'NEH',
  esther: 'EST',
  job: 'JOB',
  psalm: 'PSA',
  psalms: 'PSA',
  proverbs: 'PRO',
  ecclesiastes: 'ECC',
  'song of solomon': 'SNG',
  isaiah: 'ISA',
  jeremiah: 'JER',
  lamentations: 'LAM',
  ezekiel: 'EZK',
  daniel: 'DAN',
  hosea: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  obadiah: 'OBA',
  jonah: 'JON',
  micah: 'MIC',
  nahum: 'NAM',
  habakkuk: 'HAB',
  zephaniah: 'ZEP',
  haggai: 'HAG',
  zechariah: 'ZEC',
  malachi: 'MAL',
  matthew: 'MAT',
  mark: 'MRK',
  luke: 'LUK',
  john: 'JHN',
  acts: 'ACT',
  romans: 'ROM',
  '1 corinthians': '1CO',
  '2 corinthians': '2CO',
  galatians: 'GAL',
  ephesians: 'EPH',
  philippians: 'PHP',
  colossians: 'COL',
  '1 thessalonians': '1TH',
  '2 thessalonians': '2TH',
  '1 timothy': '1TI',
  '2 timothy': '2TI',
  titus: 'TIT',
  philemon: 'PHM',
  hebrews: 'HEB',
  james: 'JAS',
  '1 peter': '1PE',
  '2 peter': '2PE',
  '1 john': '1JN',
  '2 john': '2JN',
  '3 john': '3JN',
  jude: 'JUD',
  revelation: 'REV',
  // Abbreviations used in the PDF / seed
  gen: 'GEN',
  rom: 'ROM',
  '1 cor': '1CO',
  '2 cor': '2CO',
  cor: '1CO',
  gal: 'GAL',
  eph: 'EPH',
  phil: 'PHP',
  php: 'PHP',
  col: 'COL',
  '1 thess': '1TH',
  '2 thess': '2TH',
  '1 tim': '1TI',
  '2 tim': '2TI',
  tit: 'TIT',
  phlm: 'PHM',
  heb: 'HEB',
  jas: 'JAS',
  '1 pet': '1PE',
  '2 pet': '2PE',
  '1 jn': '1JN',
  '2 jn': '2JN',
  '3 jn': '3JN',
  rev: 'REV',
  prov: 'PRO',
}

/** Sorted longest-first so "1 corinthians" matches before "corinthians" */
const BOOK_KEYS = Object.keys(BOOK_ALIASES).sort((a, b) => b.length - a.length)

export interface ParsedPassage {
  /** YouVersion style e.g. ROM.1 */
  ref: string
  bookCode: string
  chapter: number
  /** Human label e.g. Romans 1 */
  label: string
}

export function isReviewReading(reading: string): boolean {
  const t = reading.trim().toUpperCase()
  return t === 'REVIEW' || t === 'FINAL REVIEW' || t.includes('REVIEW')
}

/**
 * Parse a tracker reading line into one or more chapter refs.
 */
export function parseReadingToRefs(reading: string): ParsedPassage[] {
  if (!reading || isReviewReading(reading)) return []

  const normalized = reading
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  const segments = normalized.split(/\s*,\s*/).filter(Boolean)
  const results: ParsedPassage[] = []

  for (const segment of segments) {
    results.push(...parseSegment(segment))
  }

  return results
}

function parseSegment(segment: string): ParsedPassage[] {
  const lower = segment.toLowerCase().trim()

  let bookKey: string | null = null
  let rest = ''

  for (const key of BOOK_KEYS) {
    if (lower === key || lower.startsWith(key + ' ')) {
      bookKey = key
      rest = segment.slice(key.length).trim()
      break
    }
    if (lower.startsWith(key)) {
      const after = lower.slice(key.length)
      if (after === '' || after.startsWith(' ') || /^\d/.test(after)) {
        bookKey = key
        rest = segment.slice(key.length).trim()
        break
      }
    }
  }

  if (!bookKey) return []

  const code = BOOK_ALIASES[bookKey]
  const displayBook = titleCaseBook(bookKey)
  const chapterPart = rest.replace(/^[:\s]+/, '')

  // Single-chapter books: Philemon, Jude, 2 John, etc.
  if (!chapterPart) {
    return [
      {
        ref: `${code}.1`,
        bookCode: code,
        chapter: 1,
        label: displayBook,
      },
    ]
  }

  const rangeMatch = chapterPart.match(/^(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const start = Number(rangeMatch[1])
    const end = Number(rangeMatch[2])
    const out: ParsedPassage[] = []
    for (let c = start; c <= end; c++) {
      out.push({
        ref: `${code}.${c}`,
        bookCode: code,
        chapter: c,
        label: `${displayBook} ${c}`,
      })
    }
    return out
  }

  const single = chapterPart.match(/^(\d+)/)
  if (single) {
    const c = Number(single[1])
    return [
      {
        ref: `${code}.${c}`,
        bookCode: code,
        chapter: c,
        label: `${displayBook} ${c}`,
      },
    ]
  }

  return []
}

function titleCaseBook(key: string): string {
  const pretty: Record<string, string> = {
    romans: 'Romans',
    '1 corinthians': '1 Corinthians',
    '2 corinthians': '2 Corinthians',
    '1 cor': '1 Corinthians',
    '2 cor': '2 Corinthians',
    galatians: 'Galatians',
    gal: 'Galatians',
    ephesians: 'Ephesians',
    eph: 'Ephesians',
    philippians: 'Philippians',
    phil: 'Philippians',
    colossians: 'Colossians',
    col: 'Colossians',
    '1 thessalonians': '1 Thessalonians',
    '2 thessalonians': '2 Thessalonians',
    '1 thess': '1 Thessalonians',
    '2 thess': '2 Thessalonians',
    '1 timothy': '1 Timothy',
    '2 timothy': '2 Timothy',
    '1 tim': '1 Timothy',
    '2 tim': '2 Timothy',
    titus: 'Titus',
    philemon: 'Philemon',
    hebrews: 'Hebrews',
    heb: 'Hebrews',
    james: 'James',
    '1 peter': '1 Peter',
    '2 peter': '2 Peter',
    '1 pet': '1 Peter',
    '2 pet': '2 Peter',
    '1 john': '1 John',
    '2 john': '2 John',
    '3 john': '3 John',
    jude: 'Jude',
    revelation: 'Revelation',
    rev: 'Revelation',
    proverbs: 'Proverbs',
    prov: 'Proverbs',
  }
  if (pretty[key]) return pretty[key]
  return key.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Universal link — opens YouVersion app when installed, else browser */
export function bibleComUrl(ref: string, versionId = '3034', abbreviation = 'BSB'): string {
  const abbr = abbreviation.replace(/\s+/g, '') || 'BSB'
  return `https://www.bible.com/bible/${versionId}/${ref}.${abbr}`
}

/** Custom scheme (iOS/Android) */
export function youVersionAppUrl(ref: string, versionId = '3034'): string {
  const params = new URLSearchParams({
    reference: ref,
    version_id: String(versionId),
  })
  return `youversion://bible?${params.toString()}`
}

/** Alternate scheme formats some app builds recognize */
export function youVersionAppUrlAlt(ref: string, versionId = '3034'): string {
  return `youversion://bible/${encodeURIComponent(String(versionId))}/${encodeURIComponent(ref)}`
}

/**
 * Android Intent — YouVersion package with browser fallback.
 */
export function youVersionAndroidIntentUrl(
  ref: string,
  versionId = '3034',
  abbreviation = 'BSB',
): string {
  const web = bibleComUrl(ref, versionId, abbreviation)
  const fallback = encodeURIComponent(web)
  const hostPath = web.replace(/^https?:\/\//, '')
  return (
    `intent://${hostPath}` +
    `#Intent;scheme=https;package=com.sirma.mobile.bible.android;` +
    `S.browser_fallback_url=${fallback};end`
  )
}

export function bibleComUrlForReading(
  reading: string,
  versionId = '3034',
  abbreviation = 'BSB',
): string {
  const refs = parseReadingToRefs(reading)
  if (refs.length === 0) return 'https://www.bible.com/bible'
  return bibleComUrl(refs[0].ref, versionId, abbreviation)
}

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    ua,
  )
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches &&
    window.innerWidth < 900
  return uaMobile || !!coarse
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent || '')
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

/**
 * Open passage in YouVersion Bible App.
 * Strategy (when app is installed):
 * 1. Universal link https://www.bible.com/... (most reliable on modern iOS/Android)
 * 2. Android Intent as alternative
 * 3. youversion:// scheme as last resort helper
 */
export function openInYouVersionApp(opts: {
  ref: string
  versionId?: string
  abbreviation?: string
}): void {
  const versionId = opts.versionId || '3034'
  const abbreviation = opts.abbreviation || 'BSB'
  const web = bibleComUrl(opts.ref, versionId, abbreviation)

  // Desktop: open bible.com in a new tab
  if (!isMobileBrowser()) {
    window.open(web, '_blank', 'noopener,noreferrer')
    return
  }

  // Mobile with app installed: universal / app links are the most reliable.
  // Android also gets an Intent that targets the YouVersion package.
  if (isAndroid()) {
    window.location.href = youVersionAndroidIntentUrl(
      opts.ref,
      versionId,
      abbreviation,
    )
    return
  }

  // iOS: universal link first (opens YouVersion if associated domains work)
  window.location.href = web
}
