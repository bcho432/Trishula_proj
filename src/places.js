import { priorityForBuildingType } from './risk'

// Dev: Vite proxy (vite.config.js). Production (e.g. Vercel): serverless proxy (api/nominatim.js).
const NOMINATIM_SEARCH = import.meta.env.DEV
  ? '/nominatim/search'
  : '/api/nominatim'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function nominatimSearch(query, limit = 12) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(limit),
    addressdetails: '1',
  })
  const res = await fetch(`${NOMINATIM_SEARCH}?${params}`)
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function pickBusinessName(hit) {
  if (hit.name?.trim()) return hit.name.trim()
  const first = hit.display_name.split(',')[0]?.trim()
  return first || 'Unknown business'
}

function inferTypeFromHit(hit, fallback) {
  const blob = `${hit.display_name} ${hit.class ?? ''} ${hit.type ?? ''}`.toLowerCase()
  if (
    blob.includes('warehouse') ||
    blob.includes('distribution') ||
    blob.includes('logistics center') ||
    hit.type === 'warehouse' ||
    hit.type === 'industrial'
  ) {
    return 'Warehouse'
  }
  if (
    blob.includes('construction') ||
    blob.includes('contractor') ||
    blob.includes('builder') ||
    hit.type === 'construction'
  ) {
    return 'Construction Site'
  }
  if (
    blob.includes('retail') ||
    blob.includes('shop') ||
    blob.includes('store') ||
    blob.includes('mall') ||
    blob.includes('supermarket') ||
    hit.class === 'shop'
  ) {
    return 'Retail'
  }
  return fallback
}

function toLead(hit, queryFallback, source) {
  const buildingType = inferTypeFromHit(hit, queryFallback)
  return {
    id: crypto.randomUUID(),
    businessName: pickBusinessName(hit),
    buildingType,
    location: hit.display_name,
    priority: priorityForBuildingType(buildingType),
    source,
  }
}

export async function findLeadsInCity(city) {
  const trimmed = city.trim()
  if (!trimmed) return []

  const plans = [
    { query: `warehouse ${trimmed}`, fallbackType: 'Warehouse' },
    { query: `construction company ${trimmed}`, fallbackType: 'Construction Site' },
    { query: `industrial building ${trimmed}`, fallbackType: 'Warehouse' },
  ]

  const seen = new Set()
  const leads = []

  for (const { query, fallbackType } of plans) {
    const hits = await nominatimSearch(query)
    for (const hit of hits) {
      const key = `${hit.lat},${hit.lon},${hit.place_id}`
      if (seen.has(key)) continue
      seen.add(key)
      leads.push(toLead(hit, fallbackType, 'api'))
    }
    await delay(350)
  }

  return leads
}
