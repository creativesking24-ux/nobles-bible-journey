# Continuous updates

You already have a production-ready app. Use one of these to ship changes easily.

---

## Everyday workflow (simplest)

After any code change on this machine:

```bash
cd /Users/test/nobles-bible-journey
npm run ship
```

That will:

1. `npm run build`
2. Deploy **production** to Vercel (`vercel --prod`)

Preview URL only (not production):

```bash
npm run ship:preview
```

**First time only** (once per computer):

```bash
npm i -g vercel
vercel login
cd /Users/test/nobles-bible-journey
vercel link          # connect this folder to a Vercel project
vercel env add YVP_APP_KEY   # Production — paste YouVersion key
```

Then every update is just `npm run ship`.

---

## Auto-deploy on every Git push (best long-term)

1. Create a GitHub repo (empty).
2. From the project:

```bash
cd /Users/test/nobles-bible-journey
git init
git add .
git commit -m "Noble's Bible Journey v1.1"
git branch -M main
git remote add origin https://github.com/YOUR_USER/nobles-bible-journey.git
git push -u origin main
```

3. Go to [vercel.com/new](https://vercel.com/new) → **Import** that GitHub repo.  
4. Add env var **`YVP_APP_KEY`** → Production.  
5. Deploy.

After that:

```bash
# make changes…
git add -A
git commit -m "Improve calendar"
git push
```

Vercel rebuilds and goes live automatically. No manual deploy step.

---

## What not to do

| Don’t | Why |
|--------|-----|
| Commit `.env` | Contains your API key |
| Set `VITE_YVP_APP_KEY` | Would leak the key in the browser |
| Only use Netlify Drop for frequent updates | Manual re-upload each time |

---

## Quick reference

| Goal | Command |
|------|---------|
| Local try | `npm run dev -- --host` |
| Production build | `npm run build` |
| Ship live | `npm run ship` |
| Preview deploy | `npm run ship:preview` |

Full first-time deploy notes: [DEPLOY.md](./DEPLOY.md)
