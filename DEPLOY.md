# Deploy Noble's Bible Journey — go live now

Production build is ready (`npm run build` → `dist/`).

Recommended host: **Vercel** (includes YouVersion API proxy).

**Updating later?** See [UPDATE.md](./UPDATE.md) — usually just `npm run ship`.

---

## Option A — Vercel (recommended, ~2 minutes)

### 1. Install CLI (once)

```bash
npm i -g vercel
```

### 2. From the project folder

```bash
cd /Users/test/nobles-bible-journey
vercel
```

Follow prompts (link to your Vercel account / create project).

### 3. Set the YouVersion App Key (production)

```bash
vercel env add YVP_APP_KEY
# paste your key when prompted
# choose: Production (and Preview if you want)
```

Or in the dashboard: **Project → Settings → Environment Variables**  
- Name: `YVP_APP_KEY`  
- Value: your YouVersion key  

### 4. Ship production

```bash
vercel --prod
```

You’ll get a URL like:

`https://nobles-bible-journey.vercel.app`

### Optional env

| Name | Required | Notes |
|------|----------|--------|
| `YVP_APP_KEY` | Recommended | YouVersion Scripture in-app |
| `VITE_YVP_BIBLE_ID` | No | Default `3034` (BSB) |

Without `YVP_APP_KEY`, the app still works: tracking, calendar, notes, highlights, offline, and **WEB public-domain** Scripture fallback.

---

## Option B — Netlify (drag & drop)

```bash
cd /Users/test/nobles-bible-journey
npm run build
```

1. Open [https://app.netlify.com/drop](https://app.netlify.com/drop)  
2. Drag the **`dist`** folder  
3. Live URL is created instantly  

**Note:** Netlify drop does **not** include the YouVersion serverless proxy. Scripture will use the public-domain WEB fallback (still fine). For full YouVersion, use Vercel.

---

## Option C — Netlify CLI

```bash
npm i -g netlify-cli
cd /Users/test/nobles-bible-journey
npm run build
netlify deploy --prod --dir=dist
```

---

## After deploy

1. Open the live URL on your phone  
2. **Add to Home Screen** (PWA) for offline use  
3. Mark a day complete → data stays on the device  
4. Optional: set `YVP_APP_KEY` on Vercel and redeploy for BSB via YouVersion  

---

## Local production check

```bash
npm run build
npm run preview
```

---

## Security

- Never commit `.env`  
- Never set the App Key as `VITE_*` (would expose it in the browser)  
- Only set `YVP_APP_KEY` in the host’s server env (Vercel env vars)  
