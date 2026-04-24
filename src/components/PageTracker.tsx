"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * PageTracker — Records which pages the user has visited
 *
 * Powers:
 * - Character sheet "Explorer" achievement (visit 50/100 pages)
 * - Discovery recommendations ("you haven't tried these yet")
 * - Smart suggestions based on browsing patterns
 * - XP for exploring (5 XP per new page)
 * - Morning briefing "visited today" check
 *
 * Stored in localStorage (lightweight, no API call per page).
 * The set is small enough that it doesn't need cloud sync.
 */

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    // Skip non-content paths
    if (pathname === "/" || pathname.startsWith("/api/") || pathname.startsWith("/login") || pathname.startsWith("/register")) return

    try {
      // Legacy set (backward-compat with Explorer achievement + Discovery code)
      const visited = JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]")
      if (!visited.includes(pathname)) {
        visited.push(pathname)
        localStorage.setItem("hfp-pages-visited", JSON.stringify(visited))
      }

      // Frequency-weighted log — powers data-driven Quick Access on the dashboard.
      // Structure: { [path]: { count, last } }
      const freqRaw = localStorage.getItem("hfp-page-visits")
      const freq: Record<string, { count: number; last: string }> = freqRaw ? JSON.parse(freqRaw) : {}
      const existing = freq[pathname]
      freq[pathname] = {
        count: (existing?.count ?? 0) + 1,
        last: new Date().toISOString(),
      }
      localStorage.setItem("hfp-page-visits", JSON.stringify(freq))

      // Track today's last briefing visit
      if (pathname === "/morning-briefing") {
        localStorage.setItem("hfp-last-briefing", new Date().toISOString().split("T")[0])
      }
    } catch {}
  }, [pathname])

  return null // Invisible component
}
