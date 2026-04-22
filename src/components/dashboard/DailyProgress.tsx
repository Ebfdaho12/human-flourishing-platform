"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * DailyProgress — Floating progress indicator
 *
 * Shows a compact progress ring in the corner that fills as
 * the user completes daily rhythm activities. Creates a gentle
 * "pull" toward completion without being pushy.
 *
 * Only shows if the user has opted into gamification.
 */

function getToday(): string { return new Date().toISOString().split("T")[0] }

export function DailyProgress() {
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(5)
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const today = getToday()
    let done = 0
    const checks = 5

    try {
      // Check mood logged today (via API cache in localStorage)
      // We can't easily check API from a static component, so we check localStorage signals
      const habits = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
      const habitsDone = habits.filter((h: any) => h.completedDates?.includes(today)).length
      if (habits.length > 0 && habitsDone >= habits.length * 0.5) done++
    } catch {}

    try {
      const gratitude = JSON.parse(localStorage.getItem("hfp-gratitude") || "[]")
      if (gratitude.some((e: any) => e.date === today)) done++
    } catch {}

    try {
      const evening = JSON.parse(localStorage.getItem("hfp-evening-review") || "[]")
      if (evening.some((e: any) => e.date === today)) done++
    } catch {}

    try {
      const water = JSON.parse(localStorage.getItem("hfp-water-log") || "[]")
      const todayWater = water.filter((e: any) => e.date === today).reduce((s: number, e: any) => s + (e.amount || 0), 0)
      if (todayWater >= 2000) done++
    } catch {}

    try {
      const focus = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      const todayFocus = focus.find((e: any) => e.date === today)
      if (todayFocus?.focusMinutes >= 25) done++
    } catch {}

    // Check if gamification is enabled
    try {
      const settings = JSON.parse(localStorage.getItem("hfp-experience-settings") || "{}")
      if (settings.gamification === false) { setMounted(false); return }
    } catch {}

    setProgress(done)
    setTotal(checks)
  }, [])

  if (!mounted || progress === total) return null // Hide when complete or not mounted

  const pct = Math.round((progress / total) * 100)
  const circumference = 2 * Math.PI * 14
  const filled = (pct / 100) * circumference

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full bg-white border-2 border-violet-200 shadow-lg px-3 py-2 hover:shadow-xl transition-all hover:scale-105"
      >
        <svg width={36} height={36} className="transform -rotate-90">
          <circle cx={18} cy={18} r={14} fill="none" stroke="#e2e8f0" strokeWidth={3} />
          <circle cx={18} cy={18} r={14} fill="none" stroke="#8b5cf6" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference - filled}
            style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <span className="text-[10px] font-bold text-violet-600">{progress}/{total}</span>
        </div>

        {expanded && (
          <div className="flex items-center gap-1.5 pr-1">
            <span className="text-[10px] text-muted-foreground">Daily progress</span>
            <a href="/daily-quests" className="text-[10px] text-violet-600 hover:underline flex items-center gap-0.5">
              Quests <ArrowRight className="h-2.5 w-2.5" />
            </a>
          </div>
        )}
      </button>
    </div>
  )
}
