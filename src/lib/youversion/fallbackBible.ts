/**
 * Public-domain fallback when YouVersion is rate-limited or unavailable.
 * Uses bible-api.com (World English Bible by default — no API key).
 */
import type { FetchedPassage, VerseBlock } from './client'
import { parseReadingToRefs, type ParsedPassage } from './refs'

/** Track API host rate-limit so we skip hammering YouVersion temporarily */
let youVersionCooldownUntil = 0

export function markYouVersionRateLimited(ms = 60_000) {
  youVersionCooldownUntil = Date.now() + ms
}

export function isYouVersionCoolingDown() {
  return Date.now() < youVersionCooldownUntil
}

/** bible-api.com book slugs */
const API_BOOK: Record<string, string> = {
  GEN: 'genesis',
  EXO: 'exodus',
  LEV: 'leviticus',
  NUM: 'numbers',
  DEU: 'deuteronomy',
  JOS: 'joshua',
  JDG: 'judges',
  RUT: 'ruth',
  '1SA': '1 samuel',
  '2SA': '2 samuel',
  '1KI': '1 kings',
  '2KI': '2 kings',
  '1CH': '1 chronicles',
  '2CH': '2 chronicles',
  EZR: 'ezra',
  NEH: 'nehemiah',
  EST: 'esther',
  JOB: 'job',
  PSA: 'psalms',
  PRO: 'proverbs',
  ECC: 'ecclesiastes',
  SNG: 'song of solomon',
  ISA: 'isaiah',
  JER: 'jeremiah',
  LAM: 'lamentations',
  EZK: 'ezekiel',
  DAN: 'daniel',
  HOS: 'hosea',
  JOL: 'joel',
  AMO: 'amos',
  OBA: 'obadiah',
  JON: 'jonah',
  MIC: 'micah',
  NAM: 'nahum',
  HAB: 'habakkuk',
  ZEP: 'zephaniah',
  HAG: 'haggai',
  ZEC: 'zechariah',
  MAL: 'malachi',
  MAT: 'matthew',
  MRK: 'mark',
  LUK: 'luke',
  JHN: 'john',
  ACT: 'acts',
  ROM: 'romans',
  '1CO': '1 corinthians',
  '2CO': '2 corinthians',
  GAL: 'galatians',
  EPH: 'ephesians',
  PHP: 'philippians',
  COL: 'colossians',
  '1TH': '1 thessalonians',
  '2TH': '2 thessalonians',
  '1TI': '1 timothy',
  '2TI': '2 timothy',
  TIT: 'titus',
  PHM: 'philemon',
  HEB: 'hebrews',
  JAS: 'james',
  '1PE': '1 peter',
  '2PE': '2 peter',
  '1JN': '1 john',
  '2JN': '2 john',
  '3JN': '3 john',
  JUD: 'jude',
  REV: 'revelation',
}

interface BibleApiVerse {
  book_id?: string
  book_name?: string
  chapter?: number
  verse: number
  text: string
}

interface BibleApiResponse {
  reference?: string
  verses?: BibleApiVerse[]
  text?: string
  translation_name?: string
  translation_id?: string
}

export async function fetchPassagesFromFallback(
  reading: string,
): Promise<FetchedPassage[]> {
  const parsed = parseReadingToRefs(reading)
  const out: FetchedPassage[] = []
  for (const p of parsed) {
    out.push(await fetchOneFromFallback(p))
  }
  return out
}

async function fetchOneFromFallback(p: ParsedPassage): Promise<FetchedPassage> {
  const book = API_BOOK[p.bookCode]
  if (!book) {
    throw new Error(`Unknown book ${p.bookCode} for fallback Bible`)
  }

  // bible-api.com: "romans+1" or "1+corinthians+13"
  const slug = `${book.replace(/\s+/g, '+')}+${p.chapter}`
  const url = `https://bible-api.com/${encodeURI(slug)}?translation=web`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Fallback Bible API ${res.status} for ${p.label}`)
  }

  const data = (await res.json()) as BibleApiResponse
  const verses: VerseBlock[] = (data.verses || []).map((v) => ({
    number: v.verse,
    text: (v.text || '').replace(/\s+/g, ' ').trim(),
  })).filter((v) => v.text)

  const text =
    verses.length > 0
      ? verses.map((v) => `${v.number} ${v.text}`).join(' ')
      : (data.text || '').replace(/\s+/g, ' ').trim()

  return {
    ref: p.ref,
    label: data.reference || p.label,
    text,
    verses:
      verses.length > 0
        ? verses
        : text
          ? [{ number: 0, text }]
          : [],
    copyright:
      data.translation_name
        ? `${data.translation_name} (public domain fallback)`
        : 'World English Bible (public domain fallback)',
  }
}
