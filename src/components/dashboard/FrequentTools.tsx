"use client"

import { useEffect, useMemo, useState } from "react"

/**
 * FrequentTools — data-driven Quick Access.
 *
 * Reads hfp-page-visits (populated by PageTracker) and surfaces the user's
 * 8 most-visited routes by a recency-weighted score. Falls back to a
 * curated starter set for new users with <10 tracked visits.
 *
 * Replaces the previous hardcoded emoji grid on the dashboard. If the user
 * actually uses /budget + /health + /water-tracker every day, those show up
 * here automatically — instead of what we guessed they'd want.
 */

type VisitRecord = { count: number; last: string }
type FreqMap = Record<string, VisitRecord>

// Starter set for users with little history — curated general-purpose tools
const STARTER_TOOLS: { href: string; label: string; emoji: string }[] = [
  { href: "/morning-briefing", label: "Morning Briefing", emoji: "☀️" },
  { href: "/daily-habits", label: "Daily Habits", emoji: "✅" },
  { href: "/mental-health", label: "Mood & Mind", emoji: "🧠" },
  { href: "/budget", label: "Budget", emoji: "💰" },
  { href: "/health", label: "Health", emoji: "❤️" },
  { href: "/goals", label: "Goals", emoji: "🎯" },
  { href: "/planner", label: "Planner", emoji: "📋" },
  { href: "/insights", label: "Insights", emoji: "✨" },
]

// Nice labels for common paths. Fallback generates from path if missing.
const PATH_LABELS: Record<string, { label: string; emoji: string }> = {
  "/morning-briefing": { label: "Morning Briefing", emoji: "☀️" },
  "/daily-habits": { label: "Daily Habits", emoji: "✅" },
  "/mental-health": { label: "Mood & Mind", emoji: "🧠" },
  "/budget": { label: "Budget", emoji: "💰" },
  "/health": { label: "Health", emoji: "❤️" },
  "/goals": { label: "Goals", emoji: "🎯" },
  "/planner": { label: "Planner", emoji: "📋" },
  "/insights": { label: "Insights", emoji: "✨" },
  "/life-os": { label: "Life OS", emoji: "🧭" },
  "/trends": { label: "Trends", emoji: "📈" },
  "/correlations": { label: "Correlations", emoji: "🔗" },
  "/focus-timer": { label: "Focus Timer", emoji: "⏱️" },
  "/focus": { label: "Focus", emoji: "⏱️" },
  "/notes": { label: "Notes", emoji: "📝" },
  "/gratitude": { label: "Gratitude", emoji: "🙏" },
  "/evening-review": { label: "Evening Review", emoji: "🌙" },
  "/weekly-reflection": { label: "Weekly Review", emoji: "📖" },
  "/water-tracker": { label: "Water", emoji: "💧" },
  "/sleep-optimization": { label: "Sleep", emoji: "😴" },
  "/net-worth": { label: "Net Worth", emoji: "📊" },
  "/debt-payoff": { label: "Debt Payoff", emoji: "🔨" },
  "/wins": { label: "Wins", emoji: "🏆" },
  "/character-sheet": { label: "Character", emoji: "⚔️" },
  "/flourishing-score": { label: "Flourishing", emoji: "🌱" },
  "/people": { label: "People", emoji: "👥" },
  "/family-meeting": { label: "Family Meeting", emoji: "👨‍👩‍👧‍👦" },
}

function prettify(path: string): { label: string; emoji: string } {
  if (PATH_LABELS[path]) return PATH_LABELS[path]
  const seg = path.split("/").filter(Boolean).pop() ?? path
  const label = seg.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  return { label, emoji: "•" }
}

export function FrequentTools() {
  const [mounted, setMounted] = useState(false)
  const [freq, setFreq] = useState<FreqMap>({})

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem("hfp-page-visits")
      if (raw) setFreq(JSON.parse(raw))
    } catch {}
  }, [])

  const topRoutes = useMemo(() => {
    const entries = Object.entries(freq)
      // exclude dashboard + auth + API pages
      .filter(([p]) => p !== "/dashboard" && !p.startsWith("/api") && !p.startsWith("/login") && !p.startsWith("/register"))
    const totalVisits = entries.reduce((s, [, v]) => s + v.count, 0)

    if (totalVisits < 10) {
      // Not enough history — show starter set
      return { routes: STARTER_TOOLS, personalized: false }
    }

    const now = Date.now()
    const scored = entries.map(([path, v]) => {
      const daysAgo = (now - new Date(v.last).getTime()) / 86400000
      // Recency-decayed score: halves every 14 days
      const recency = Math.pow(0.5, daysAgo / 14)
      const score = v.count * (0.5 + 0.5 * recency)
      return { path, count: v.count, score }
    })
    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, 8).map(s => ({ href: s.path, ...prettify(s.path) }))
    return { routes: top, personalized: true }
  }, [freq])

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card/50 p-3 h-[52px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {topRoutes.routes.map(t => (
          <a key={t.href} href={t.href} className="rounded-xl border border-border bg-card p-3 hover:bg-accent/50 transition-colors flex items-center gap-2.5">
            <span className="text-lg">{t.emoji}</span>
            <span className="text-sm font-medium truncate">{t.label}</span>
          </a>
        ))}
      </div>
      {!topRoutes.personalized && (
        <p className="text-[10px] text-muted-foreground mt-1.5">
          A curated starter set — this will adapt to your most-used tools as you explore.
        </p>
      )}
    </>
  )
}
