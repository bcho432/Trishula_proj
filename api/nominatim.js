/**
 * Server-side proxy to OpenStreetMap Nominatim.
 * Lets the static Vite app call same-origin /api/nominatim on Vercel (avoids browser CORS).
 * Policy: https://operations.osmfoundation.org/policies/nominatim/
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const forwarded = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (value === undefined) continue
    const v = Array.isArray(value) ? value[0] : value
    forwarded.set(key, String(v))
  }

  if (!forwarded.has('format')) forwarded.set('format', 'json')

  const targetUrl = `https://nominatim.openstreetmap.org/search?${forwarded.toString()}`

  try {
    const r = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'TrishulaAI-LeadFinder/1.0 (https://github.com/bcho432/Trishula_proj; Vercel serverless)',
        Accept: 'application/json',
      },
    })
    const body = await r.text()
    const ct = r.headers.get('content-type') || 'application/json; charset=utf-8'
    res.status(r.status)
    res.setHeader('Content-Type', ct)
    res.send(body)
  } catch {
    res.status(502).json({ error: 'Upstream request failed' })
  }
}
