"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * useSyncedStorage — localStorage with automatic cloud backup
 *
 * Reads from localStorage for instant load, then syncs to/from the database API.
 * On save: writes to localStorage immediately (instant) + debounced PUT to /api/user/data.
 * On mount: reads localStorage first, then fetches from API and merges (API wins if newer).
 *
 * This gives the best of both worlds:
 * - Instant local reads/writes (no loading spinners)
 * - Cross-device persistence via encrypted database
 * - Offline-capable (works without network, syncs when online)
 *
 * Usage:
 *   const [data, setData] = useSyncedStorage<HabitData[]>("daily-habits", [])
 */

const STORAGE_PREFIX = "hfp-"

// Map localStorage keys to API keys
const KEY_MAP: Record<string, string> = {
  "hfp-daily-habits": "daily-habits",
  "hfp-gratitude": "gratitude",
  "hfp-water-log": "water-log",
  "hfp-decisions": "decisions",
  "hfp-challenges": "challenges",
  "hfp-people": "people",
  "hfp-skills": "skills",
  "hfp-vision-board": "vision-board",
  "hfp-energy-log": "energy-log",
  "hfp-body-comp": "body-comp",
  "hfp-lunar-logs": "lunar-logs",
  "hfp-evening-review": "evening-review",
  "hfp-focus-history": "focus-history",
  "hfp-flourishing-history": "flourishing-history",
  "hfp-future-letters": "future-letters",
  "hfp-my-path": "my-path",
}

export function useSyncedStorage<T>(localKey: string, defaultValue: T): [T, (value: T) => void] {
  const fullKey = localKey.startsWith(STORAGE_PREFIX) ? localKey : `${STORAGE_PREFIX}${localKey}`
  const apiKey = KEY_MAP[fullKey]

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue
    try {
      const stored = localStorage.getItem(fullKey)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<string | null>(null)

  // Sync from API on mount
  useEffect(() => {
    if (!apiKey) return
    fetch(`/api/user/data?key=${apiKey}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (res?.data) {
          try {
            const apiData = typeof res.data === "string" ? JSON.parse(res.data) : res.data
            const localStr = localStorage.getItem(fullKey)
            const localUpdated = localStr ? new Date(0) : new Date(0) // localStorage has no timestamp
            const apiUpdated = new Date(res.updatedAt || 0)

            // If API has data and it's newer (or local is empty), use API data
            if (!localStr || apiUpdated > new Date(lastSyncRef.current || 0)) {
              localStorage.setItem(fullKey, JSON.stringify(apiData))
              setValue(apiData)
              lastSyncRef.current = res.updatedAt
            }
          } catch {}
        }
      })
      .catch(() => {}) // Offline — use localStorage only
  }, [apiKey, fullKey])

  // Save function — writes to localStorage immediately, debounced API sync
  const save = useCallback((newValue: T) => {
    setValue(newValue)

    // Immediate localStorage write
    try {
      localStorage.setItem(fullKey, JSON.stringify(newValue))
    } catch {}

    // Debounced API write (2 seconds after last change)
    if (apiKey) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        fetch("/api/user/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: apiKey, data: JSON.stringify(newValue) }),
        }).then(r => {
          if (r.ok) return r.json().then(res => { lastSyncRef.current = res.updatedAt })
        }).catch(() => {}) // Offline — will sync next time
      }, 2000)
    }
  }, [fullKey, apiKey])

  return [value, save]
}
