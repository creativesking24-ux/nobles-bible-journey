/**
 * Vercel serverless proxy for YouVersion Platform API.
 *
 * Env (Project Settings → Environment Variables):
 *   YVP_APP_KEY=your_youversion_app_key
 *
 * Client calls:
 *   GET /api/youversion/v1/bibles/{id}/passages/{ref}?format=html
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const appKey = process.env.YVP_APP_KEY
  if (!appKey) {
    return res.status(503).json({
      error: 'YVP_APP_KEY not configured on the server',
      code: 'NOT_CONFIGURED',
    })
  }

  const parts = req.query.path
  const rawPath = Array.isArray(parts) ? parts.join('/') : parts || ''
  if (!rawPath) {
    return res.status(400).json({ error: 'Missing path' })
  }

  // Forward query params except the catch-all "path"
  const forward = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'path') continue
    if (Array.isArray(value)) {
      value.forEach((v) => forward.append(key, String(v)))
    } else if (value != null) {
      forward.append(key, String(value))
    }
  }
  const qs = forward.toString()
  const url = `https://api.youversion.com/${rawPath}${qs ? `?${qs}` : ''}`

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-YVP-App-Key': appKey,
        'x-yvp-app-key': appKey,
      },
    })
    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'application/json',
    )
    // Short cache for passages; licenses/lists can revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.send(text)
  } catch (err) {
    console.error('YouVersion proxy error', err)
    return res.status(502).json({
      error: 'Upstream YouVersion request failed',
      detail: err instanceof Error ? err.message : String(err),
    })
  }
}
