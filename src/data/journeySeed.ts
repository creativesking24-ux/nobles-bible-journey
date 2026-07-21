/**
 * Exact schedule from "Bible Study Progress Tracker GGP.pdf"
 * Journey: June 15 – September 20, 2026 · 14 weeks
 */
export interface DaySeed {
  dayOfWeek: number
  dayLabel: string
  date: string
  reading: string
  isReview?: boolean
}

export interface WeekSeed {
  weekNumber: number
  theme: string
  startDate: string
  endDate: string
  days: DaySeed[]
}

export const JOURNEY_WEEKS: WeekSeed[] = [
  {
    weekNumber: 1,
    theme: 'Romans 1–12',
    startDate: '2026-06-15',
    endDate: '2026-06-21',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-06-15', reading: 'Romans 1–2' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-06-16', reading: 'Romans 3–4' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-06-17', reading: 'Romans 5–6' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-06-18', reading: 'Romans 7–8' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-06-19', reading: 'Romans 9–10' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-06-20', reading: 'Romans 11–12' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-06-21', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 2,
    theme: 'Romans 13–16, 1 Cor 1–6, Proverbs 1–2',
    startDate: '2026-06-22',
    endDate: '2026-06-28',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-06-22', reading: 'Romans 13–14' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-06-23', reading: 'Romans 15–16' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-06-24', reading: '1 Corinthians 1–2' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-06-25', reading: '1 Corinthians 3–4' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-06-26', reading: '1 Corinthians 5–6' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-06-27', reading: 'Proverbs 1–2' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-06-28', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 3,
    theme: '1 Cor 7–16, Proverbs 3–4',
    startDate: '2026-06-29',
    endDate: '2026-07-05',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-06-29', reading: '1 Corinthians 7–8' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-06-30', reading: '1 Corinthians 9–10' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-07-01', reading: '1 Corinthians 11–12' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-07-02', reading: '1 Corinthians 13–14' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-07-03', reading: '1 Corinthians 15–16' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-07-04', reading: 'Proverbs 3–4' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-07-05', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 4,
    theme: '2 Cor 1–10, Proverbs 5–6',
    startDate: '2026-07-06',
    endDate: '2026-07-12',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-07-06', reading: '2 Corinthians 1–2' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-07-07', reading: '2 Corinthians 3–4' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-07-08', reading: '2 Corinthians 5–6' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-07-09', reading: '2 Corinthians 7–8' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-07-10', reading: '2 Corinthians 9–10' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-07-11', reading: 'Proverbs 5–6' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-07-12', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 5,
    theme: '2 Cor 11–13, Galatians, Eph 1, Prov 7–8',
    startDate: '2026-07-13',
    endDate: '2026-07-19',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-07-13', reading: '2 Corinthians 11–12' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-07-14', reading: '2 Cor 13, Galatians 1' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-07-15', reading: 'Galatians 2–3' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-07-16', reading: 'Galatians 4–5' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-07-17', reading: 'Gal 6, Ephesians 1' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-07-18', reading: 'Proverbs 7–8' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-07-19', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 6,
    theme: 'Ephesians, Philippians, Col 1, Prov 9–10',
    startDate: '2026-07-20',
    endDate: '2026-07-26',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-07-20', reading: 'Ephesians 2–3' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-07-21', reading: 'Ephesians 4–5' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-07-22', reading: 'Eph 6, Philippians 1' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-07-23', reading: 'Philippians 2–3' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-07-24', reading: 'Phil 4, Colossians 1' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-07-25', reading: 'Proverbs 9–10' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-07-26', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 7,
    theme: 'Col 2–4, 1 & 2 Thess, Prov 11–12',
    startDate: '2026-07-27',
    endDate: '2026-08-02',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-07-27', reading: 'Colossians 2–3' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-07-28', reading: 'Col 4, 1 Thess 1' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-07-29', reading: '1 Thessalonians 2–3' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-07-30', reading: '1 Thessalonians 4–5' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-07-31', reading: '2 Thessalonians 1–2' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-08-01', reading: 'Proverbs 11–12' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-08-02', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 8,
    theme: '2 Thess 3, 1 & 2 Tim, Prov 13–14',
    startDate: '2026-08-03',
    endDate: '2026-08-09',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-08-03', reading: '2 Thess 3, 1 Tim 1' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-08-04', reading: '1 Timothy 2–3' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-08-05', reading: '1 Timothy 4–5' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-08-06', reading: '1 Tim 6, 2 Tim 1' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-08-07', reading: '2 Timothy 2–3' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-08-08', reading: 'Proverbs 13–14' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-08-09', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 9,
    theme: '2 Tim 4, Titus, Philemon, Heb 1–6, Prov 17–18',
    startDate: '2026-08-10',
    endDate: '2026-08-16',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-08-10', reading: '2 Tim 4, Titus 1' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-08-11', reading: 'Titus 2–3, Philemon' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-08-12', reading: 'Hebrews 1–2' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-08-13', reading: 'Hebrews 3–4' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-08-14', reading: 'Hebrews 5–6' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-08-15', reading: 'Proverbs 17–18' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-08-16', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 10,
    theme: 'Hebrews 7–13, James 1–3, Prov 19–20',
    startDate: '2026-08-17',
    endDate: '2026-08-23',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-08-17', reading: 'Hebrews 7–8' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-08-18', reading: 'Hebrews 9–10' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-08-19', reading: 'Hebrews 11–12' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-08-20', reading: 'Heb 13, James 1' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-08-21', reading: 'James 2–3' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-08-22', reading: 'Proverbs 19–20' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-08-23', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 11,
    theme: 'James 4–5, 1 & 2 Peter, 1 John 1, Prov 21–22',
    startDate: '2026-08-24',
    endDate: '2026-08-30',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-08-24', reading: 'James 4–5, 1 Pet 1' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-08-25', reading: '1 Peter 2–3' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-08-26', reading: '1 Peter 4–5' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-08-27', reading: '2 Peter 1–2' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-08-28', reading: '2 Pet 3, 1 John 1' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-08-29', reading: 'Proverbs 21–22' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-08-30', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 12,
    theme: '1 John 2–5, Jude, Rev 1–4, Prov 23–24',
    startDate: '2026-08-31',
    endDate: '2026-09-06',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-08-31', reading: '1 John 2–3' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-09-01', reading: '1 John 4–5, 2 John' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-09-02', reading: '3 John, Jude' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-09-03', reading: 'Revelation 1–2' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-09-04', reading: 'Revelation 3–4' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-09-05', reading: 'Proverbs 23–24' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-09-06', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 13,
    theme: 'Revelation 5–14, Proverbs 25–26',
    startDate: '2026-09-07',
    endDate: '2026-09-13',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-09-07', reading: 'Revelation 5–6' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-09-08', reading: 'Revelation 7–8' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-09-09', reading: 'Revelation 9–10' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-09-10', reading: 'Revelation 11–12' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-09-11', reading: 'Revelation 13–14' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-09-12', reading: 'Proverbs 25–26' },
      { dayOfWeek: 7, dayLabel: 'Sun', date: '2026-09-13', reading: 'REVIEW', isReview: true },
    ],
  },
  {
    weekNumber: 14,
    theme: 'Revelation 15–22, Proverbs 27–31',
    startDate: '2026-09-14',
    endDate: '2026-09-20',
    days: [
      { dayOfWeek: 1, dayLabel: 'Mon', date: '2026-09-14', reading: 'Revelation 15–16' },
      { dayOfWeek: 2, dayLabel: 'Tue', date: '2026-09-15', reading: 'Revelation 17–18' },
      { dayOfWeek: 3, dayLabel: 'Wed', date: '2026-09-16', reading: 'Revelation 19–20' },
      { dayOfWeek: 4, dayLabel: 'Thu', date: '2026-09-17', reading: 'Revelation 21–22' },
      { dayOfWeek: 5, dayLabel: 'Fri', date: '2026-09-18', reading: 'Proverbs 27–28' },
      { dayOfWeek: 6, dayLabel: 'Sat', date: '2026-09-19', reading: 'Proverbs 29–31' },
      {
        dayOfWeek: 7,
        dayLabel: 'Sun',
        date: '2026-09-20',
        reading: 'FINAL REVIEW',
        isReview: true,
      },
    ],
  },
]

export const MOTIVATIONAL_VERSES = [
  'Joshua 1:8 — This Book of the Law shall not depart from your mouth…',
  'Psalm 119:105 — Your word is a lamp to my feet and a light to my path.',
  'Romans 12:2 — Be transformed by the renewal of your mind.',
  '2 Timothy 3:16 — All Scripture is breathed out by God…',
  'Hebrews 4:12 — The word of God is living and active…',
  'Proverbs 3:5–6 — Trust in the Lord with all your heart…',
  'James 1:22 — Be doers of the word, and not hearers only…',
  'Colossians 3:16 — Let the word of Christ dwell in you richly…',
  'Philippians 4:13 — I can do all things through him who strengthens me.',
  'Revelation 1:3 — Blessed is the one who reads aloud the words of this prophecy…',
  '1 Peter 2:2 — Long for the pure spiritual milk, that by it you may grow…',
  'Ephesians 6:17 — Take the helmet of salvation, and the sword of the Spirit…',
  'Matthew 4:4 — Man shall not live by bread alone, but by every word…',
  'Isaiah 40:8 — The grass withers… but the word of our God will stand forever.',
]

export const JOURNEY_START = '2026-06-15'
export const JOURNEY_END = '2026-09-20'
export const TOTAL_DAYS = 98
