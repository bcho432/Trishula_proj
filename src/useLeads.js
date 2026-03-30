import { useCallback, useEffect, useState } from 'react'
import { priorityForBuildingType } from './risk'

const STORAGE_KEY = 'trishula-leads-v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useLeads() {
  const [leads, setLeads] = useState(loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads])

  const addLeads = useCallback((incoming) => {
    setLeads((prev) => {
      const keys = new Set(
        prev.map((l) => `${l.businessName}|${l.location}`.toLowerCase()),
      )
      const merged = [...prev]
      for (const l of incoming) {
        const k = `${l.businessName}|${l.location}`.toLowerCase()
        if (keys.has(k)) continue
        keys.add(k)
        merged.push(l)
      }
      return merged
    })
  }, [])

  const addManualLead = useCallback(({ businessName, buildingType, location }) => {
    const lead = {
      id: crypto.randomUUID(),
      businessName: businessName.trim(),
      buildingType,
      location: location.trim(),
      priority: priorityForBuildingType(buildingType),
      source: 'manual',
    }
    setLeads((prev) => [...prev, lead])
  }, [])

  const removeLead = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { leads, addLeads, addManualLead, removeLead }
}
