import { useMemo, useState } from 'react'
import { findLeadsInCity } from './places.js'
import { useLeads } from './useLeads.js'
import './App.css'

const BUILDING_TYPES = [
  'Construction Site',
  'Warehouse',
  'Retail',
  'Other',
]

function sortLeads(list) {
  return [...list].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1
    return a.businessName.localeCompare(b.businessName)
  })
}

export default function App() {
  const { leads, addLeads, addManualLead, removeLead } = useLeads()
  const [cityQuery, setCityQuery] = useState('New York')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const [manualName, setManualName] = useState('')
  const [manualType, setManualType] = useState('Warehouse')
  const [manualLocation, setManualLocation] = useState('')
  const [manualError, setManualError] = useState(null)

  const sorted = useMemo(() => sortLeads(leads), [leads])

  async function handleSearch(e) {
    e.preventDefault()
    setSearchError(null)
    setSearching(true)
    try {
      const found = await findLeadsInCity(cityQuery)
      addLeads(found)
      if (found.length === 0) {
        setSearchError('No results for that area. Try another city or spelling.')
      }
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : 'Search failed. Use npm run dev locally, or deploy with the /api/nominatim proxy.',
      )
    } finally {
      setSearching(false)
    }
  }

  function handleAddManual(e) {
    e.preventDefault()
    if (!manualName.trim() || !manualLocation.trim()) {
      setManualError('Enter a business name and location to add a lead.')
      return
    }
    setManualError(null)
    addManualLead({
      businessName: manualName,
      buildingType: manualType,
      location: manualLocation,
    })
    setManualName('')
    setManualLocation('')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden>
            ⧗
          </span>
          <div>
            <h1>Trishula AI</h1>
            <p className="tagline">Real-time lead finder · security camera installs</p>
          </div>
        </div>
        <p className="api-note">
          Live data: OpenStreetMap Nominatim (free, no key). Local: <code>npm run dev</code> uses a
          Vite proxy. Production (e.g. Vercel): <code>/api/nominatim</code> serverless proxy avoids
          browser CORS.
        </p>
      </header>

      <section className="panel">
        <h2>Find leads in a city</h2>
        <form className="row" onSubmit={handleSearch}>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="e.g. Austin, Seattle, Chicago"
            aria-label="City or region"
            className="input grow"
          />
          <button type="submit" className="btn primary" disabled={searching}>
            {searching ? 'Searching…' : 'Find leads'}
          </button>
        </form>
        {searchError && <p className="error">{searchError}</p>}
      </section>

      <section className="panel">
        <h2>Add lead manually</h2>
        <form className="form-grid" onSubmit={handleAddManual} noValidate>
          <label className="field">
            <span>Business name</span>
            <input
              className="input"
              value={manualName}
              onChange={(e) => {
                setManualName(e.target.value)
                setManualError(null)
              }}
            />
          </label>
          <label className="field">
            <span>Building type</span>
            <select
              className="input"
              value={manualType}
              onChange={(e) => setManualType(e.target.value)}
            >
              {BUILDING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="field full">
            <span>Location (address or city)</span>
            <input
              className="input"
              value={manualLocation}
              onChange={(e) => {
                setManualLocation(e.target.value)
                setManualError(null)
              }}
            />
          </label>
          {manualError && <p className="error full">{manualError}</p>}
          <div className="full">
            <button type="submit" className="btn secondary">
              Add lead
            </button>
          </div>
        </form>
      </section>

      <section className="panel leads">
        <div className="leads-head">
          <h2>Dashboard ({leads.length})</h2>
          <p className="legend">
            <span className="pill high">High</span> Construction / Warehouse ·
            <span className="pill low"> Low</span> Retail / Other
          </p>
        </div>
        {sorted.length === 0 ? (
          <p className="empty">No leads yet. Search a city or add one manually.</p>
        ) : (
          <ul className="lead-list">
            {sorted.map((lead) => (
              <li key={lead.id} className={`lead-card ${lead.priority}`}>
                <div className="lead-main">
                  <span className={`priority-dot ${lead.priority}`} title={lead.priority} />
                  <div>
                    <div className="lead-title">{lead.businessName}</div>
                    <div className="lead-meta">
                      {lead.buildingType} · {lead.source === 'api' ? 'Live search' : 'Manual'}
                    </div>
                    <div className="lead-location">{lead.location}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => removeLead(lead.id)}
                  aria-label={`Delete ${lead.businessName}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
