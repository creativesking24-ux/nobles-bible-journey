# Noble's Bible Journey Tracker

**90+ Day Bible Study** · June 15 – September 20, 2026  
Epistles + Proverbs + Revelation · for **Mayeku Noble**

A mobile-first **Progressive Web App** that digitizes the *Bible Study Progress Tracker GGP* PDF into a beautiful, offline-capable experience you can install on your phone’s home screen.

## Features

- **Home** — progress ring, streak, today’s reading, mark done, verse of the day  
- **Schedule** — all **14 weeks** with exact PDF dates, themes, and readings  
- **Daily detail** — **YouVersion Scripture** (Platform API), notes + **voice input**  

- **Memory verses** — master list with mastery dates  
- **Journal** — revelations, “changed me”, commitments, free-form  
- **Progress & certificate** — summary table, shareable certificate image, full PDF export  
- **PWA** — installable, offline via service worker, dark navy + gold theme  

All progress is stored in **localStorage** (Zustand persist). No account required.

### Offline mode

- **Install as PWA** for the best offline experience (app shell is cached).
- Mark days complete, notes, journal, memory verses, and highlights work **offline** — saved on device immediately.
- A **sync queue** records offline changes; when you reconnect, they flush automatically (and show “Synced N offline changes”).
- Scripture text needs network the first time; recently viewed passages may load from cache.

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand + localStorage |
| Routing | React Router |
| Dates | date-fns |
| Icons | lucide-react |
| PWA | vite-plugin-pwa |
| Export | html2canvas + jsPDF |

## YouVersion Platform (Scripture embed)

Daily readings load passage text via the **[YouVersion Platform API](https://developers.youversion.com/)** — not by scraping bible.com.

### Setup

1. Create an org + app at [platform.youversion.com](https://platform.youversion.com/)  
2. Accept the license(s) for the Bible version(s) you want (e.g. BSB, NIV via fast-track)  
3. Copy your **App Key**  
4. Configure env:

```bash
cp .env.example .env
# Edit .env:
# YVP_APP_KEY=your_key_here
# VITE_YVP_BIBLE_ID=3034   # optional; docs sample BSB id
```

5. Restart the dev server.

The App Key is **only** used on the server:

| Environment | How the key is applied |
|-------------|------------------------|
| Local `npm run dev` | Vite proxy injects `X-YVP-App-Key` on `/api/youversion/*` |
| Vercel production | `api/youversion/[...path].js` serverless function + `YVP_APP_KEY` env |

Never put the key in a `VITE_*` variable (that would ship it to the browser).

Without a key, Daily still works: notes, mark complete, and links to **bible.com** / Bible Gateway.

## Run locally

```bash
cd nobles-bible-journey
npm install
cp .env.example .env   # then add YVP_APP_KEY
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

For a phone on the same Wi‑Fi:

```bash
npm run dev -- --host
```

Then open `http://<your-computer-ip>:5173` in the phone browser.

### Install as an app (PWA)

1. Open the site in **Chrome** (Android) or **Safari** (iOS).  
2. **Android:** menu → *Install app* / *Add to Home screen* (or use the in-app install banner).  
3. **iOS Safari:** Share → *Add to Home Screen*.  

## Production build

```bash
npm run build
npm run preview   # optional local preview of dist/
```

Output is in `dist/`.

## Deploy

### Vercel

```bash
npx vercel
```

Or connect the Git repo in the [Vercel dashboard](https://vercel.com) — framework preset **Vite**.

Set **Environment Variable** `YVP_APP_KEY` (and optional `VITE_YVP_BIBLE_ID`) in the Vercel project so the `/api/youversion` proxy works in production.

### Netlify

```bash
npx netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist` folder after `npm run build`.  
Add a `public/_redirects` (already usable) or Netlify redirect: `/* /index.html 200` for SPA routing.

### GitHub Pages

Set Vite `base` in `vite.config.ts` if the site is not at the domain root, then deploy `dist/`.

## Project structure

```
src/
  components/     Layout, ProgressRing, InstallPrompt
  data/           journeySeed.ts  (PDF-faithful 14 weeks)
  pages/          Home, Schedule, Daily, Memory, Journal, Progress, Settings
  store/          useJourneyStore.ts (Zustand + persist)
  utils/          PDF + certificate export
  types.ts
  App.tsx
public/           PWA icons, favicon
```

## Schedule source of truth

Seed data matches **Bible Study Progress Tracker GGP.pdf** (weeks 1–14, Mon–Sat readings, Sunday REVIEW / FINAL REVIEW).

## License

Personal use for the Noble Bible Journey study plan.
