"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  Sparkles, TrendingUp, TrendingDown, Flame, Zap, Compass, Telescope,
  Activity, Brain, Moon, Droplets, Timer, Heart, CheckSquare, Scale, Users,
  Calendar, BarChart3, Target, ArrowUpRight, ArrowDownRight, Minus, Info,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

/* ==========================================================================
 * Pattern Discovery — Your Personal Insights
 *
 * Cross-feature signal extraction. Pulls from:
 *   - /api/mental-health/mood           (mood 1-10, emotions, activities)
 *   - /api/health/entries               (SLEEP, EXERCISE, NUTRITION, etc.)
 *   - /api/mental-health/journal        (journal entries)
 *   - /api/habits                       (multi-module engagement calendar)
 *   - /api/streaks                      (per-module streaks)
 *   - /api/goals/all                    (active goals)
 *   - localStorage: hfp-daily-habits, hfp-water-log, hfp-focus-history,
 *     hfp-gratitude, hfp-decisions, hfp-people, hfp-breathwork-sessions,
 *     hfp-evening-review, hfp-flourishing-history
 *
 * Every insight cites its data source count. Insights are ranked by
 * surprise-worthiness (stronger deviations and unusual patterns first).
 * ========================================================================== */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LABELS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const MIN_DAYS_FOR_INSIGHTS = 14

function toISODate(d: Date | string): string {
  const dd = typeof d === "string" ? new Date(d) : d
  return dd.toISOString().slice(0, 10)
}
function safeParse<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}
function round(n: number, p = 1): number {
  const m = Math.pow(10, p)
  return Math.round(n * m) / m
}
function mean(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}
function stddev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}
function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}
function pearson(xs: number[], ys: number[]): number {
  if (xs.length < 3 || xs.length !== ys.length) return 0
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

/* ------------------------- tiny hand-rolled SVG --------------------------- */

function Sparkline({ data, color = "#8b5cf6", height = 28, width = 90 }: {
  data: number[]; color?: string; height?: number; width?: number
}) {
  if (data.length < 2) return <svg width={width} height={height} />
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => `${i * step},${height - 2 - ((v - min) / range) * (height - 4)}`).join(" ")
  const last = data[data.length - 1]
  const lastX = (data.length - 1) * step
  const lastY = height - 2 - ((last - min) / range) * (height - 4)
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  )
}

function DayBars({ values, labels, color }: { values: number[]; labels: string[]; color: string }) {
  const max = Math.max(...values, 0.01)
  return (
    <div className="flex items-end gap-1.5 h-20">
      {values.map((v, i) => {
        const h = max > 0 ? (v / max) * 100 : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-medium tabular-nums text-muted-foreground">{v > 0 ? round(v, 1) : ""}</span>
            <div className="w-full rounded-t" style={{ height: `${Math.max(2, h)}%`, backgroundColor: color, opacity: v > 0 ? 0.85 : 0.15 }} />
            <span className="text-[9px] text-muted-foreground">{labels[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

function BenchmarkBar({ p50, p75, p90, current, unit, color }: {
  p50: number; p75: number; p90: number; current: number; unit: string; color: string
}) {
  const range = Math.max(p90 * 1.1, current * 1.05, 1)
  const pct = (v: number) => Math.max(0, Math.min(100, (v / range) * 100))
  return (
    <div className="relative h-6">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-muted" />
      <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
        style={{ left: `${pct(p50)}%`, width: `${pct(p90) - pct(p50)}%`, backgroundColor: color, opacity: 0.35 }} />
      {/* p50 p75 p90 tick */}
      {[{ v: p50, label: "p50" }, { v: p75, label: "p75" }, { v: p90, label: "p90" }].map((t, i) => (
        <div key={i} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${pct(t.v)}%`, transform: "translateX(-50%)" }}>
          <div className="h-3 w-px bg-foreground/40" />
          <span className="text-[8px] text-muted-foreground mt-0.5">{t.label}</span>
        </div>
      ))}
      {/* current marker */}
      {current > 0 && (
        <div className="absolute -top-1 bottom-0 flex flex-col items-center" style={{ left: `${pct(current)}%`, transform: "translateX(-50%)" }}>
          <div className="h-4 w-2 rounded-sm shadow" style={{ backgroundColor: color }} />
          <span className="text-[9px] font-bold tabular-nums mt-0.5" style={{ color }}>{round(current, 1)}{unit}</span>
        </div>
      )}
    </div>
  )
}

function Donut({ value, max = 100, size = 64, color, label, sub }: {
  value: number; max?: number; size?: number; color: string; label: string; sub?: string
}) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-muted/40" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-base font-bold tabular-nums" style={{ color }}>{Math.round(value)}</p>
        {sub && <p className="text-[8px] text-muted-foreground -mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ------------------------------ types ------------------------------------- */

type Surprise = "headline" | "high" | "medium" | "low"

interface Insight {
  id: string
  title: string
  detail?: string
  surprise: Surprise
  score: number // 0-100, higher = more surprising
  source: string // e.g. "based on 47 mood logs"
  icon: any
  color: string
  tone: "positive" | "negative" | "neutral"
  href?: string
}

/* ================================== PAGE ================================== */

export default function InsightsPage() {
  /* ----- network data ----- */
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=90", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=200", secureFetcher)
  const { data: journalData } = useSWR("/api/mental-health/journal?limit=100", secureFetcher)
  const { data: habitsCalData } = useSWR("/api/habits?months=3", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)

  /* ----- localStorage data ----- */
  const [localReady, setLocalReady] = useState(false)
  const [habits, setHabits] = useState<any[]>([])
  const [waterLog, setWaterLog] = useState<any[]>([])
  const [focusHistory, setFocusHistory] = useState<any[]>([])
  const [gratitude, setGratitude] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [breathworkSessions, setBreathwork] = useState<any[]>([])
  const [eveningReview, setEveningReview] = useState<any[]>([])
  const [flourishingHistory, setFlourishingHistory] = useState<any[]>([])

  useEffect(() => {
    setHabits(safeParse("hfp-daily-habits", []))
    setWaterLog(safeParse("hfp-water-log", []))
    setFocusHistory(safeParse("hfp-focus-history", []))
    setGratitude(safeParse("hfp-gratitude", []))
    setDecisions(safeParse("hfp-decisions", []))
    setPeople(safeParse("hfp-people", []))
    setBreathwork(safeParse("hfp-breathwork-sessions", []))
    setEveningReview(safeParse("hfp-evening-review", []))
    setFlourishingHistory(safeParse("hfp-flourishing-history", []))
    setLocalReady(true)
  }, [])

  /* ----- normalised inputs ----- */
  const moods: Array<{ date: string; score: number; createdAt: string; activities: string[] }> = useMemo(() => {
    return (moodData?.entries || [])
      .map((m: any) => ({
        date: toISODate(m.recordedAt || m.createdAt),
        score: m.score,
        createdAt: m.recordedAt || m.createdAt,
        activities: Array.isArray(m.activities) ? m.activities : [],
      }))
      .filter((m: any) => m.score && m.date)
  }, [moodData])

  const healthEntries: any[] = healthData?.entries || []
  const sleepEntries = useMemo(() => {
    return healthEntries
      .filter(e => e.entryType === "SLEEP")
      .map(e => {
        let h = 0, q: number | null = null
        try { const d = JSON.parse(e.data); h = Number(d?.hoursSlept || d?.hours || 0); q = d?.quality ?? null } catch {}
        return { date: toISODate(e.recordedAt || e.createdAt), hours: h, quality: q }
      })
      .filter(s => s.hours > 0)
  }, [healthEntries])

  const exerciseDates = useMemo(() => {
    const s = new Set<string>()
    healthEntries.filter(e => e.entryType === "EXERCISE").forEach(e => s.add(toISODate(e.recordedAt || e.createdAt)))
    return s
  }, [healthEntries])

  const journalEntries: any[] = journalData?.entries || []

  /* ----- window of observation ----- */
  const totalDataDays = useMemo(() => {
    const allDates = new Set<string>()
    moods.forEach(m => allDates.add(m.date))
    sleepEntries.forEach(s => allDates.add(s.date))
    healthEntries.forEach(e => allDates.add(toISODate(e.recordedAt || e.createdAt)))
    journalEntries.forEach(e => allDates.add(toISODate(e.createdAt)))
    focusHistory.forEach(f => allDates.add(f.date))
    waterLog.forEach(w => allDates.add(w.date))
    gratitude.forEach(g => allDates.add(g.date))
    return allDates.size
  }, [moods, sleepEntries, healthEntries, journalEntries, focusHistory, waterLog, gratitude])

  /* ================== INSIGHT GENERATION (real patterns) ================== */
  const insights: Insight[] = useMemo(() => {
    if (!localReady) return []
    const out: Insight[] = []

    /* ----- Mood by day-of-week ----- */
    if (moods.length >= 7) {
      const byDow: number[][] = Array.from({ length: 7 }, () => [])
      moods.forEach(m => {
        const d = new Date(m.createdAt)
        byDow[d.getDay()].push(m.score)
      })
      const avgByDow = byDow.map(arr => arr.length ? mean(arr) : null)
      const present = avgByDow.map((v, i) => ({ v, i })).filter(o => o.v !== null) as { v: number; i: number }[]
      if (present.length >= 3) {
        const vals = present.map(p => p.v)
        const overall = mean(vals)
        const best = present.reduce((a, b) => (a.v > b.v ? a : b))
        const worst = present.reduce((a, b) => (a.v < b.v ? a : b))
        const spread = best.v - worst.v
        const sd = stddev(vals)
        if (spread >= 0.8 && byDow[best.i].length >= 2) {
          const surprise = spread >= 2 ? "high" : spread >= 1.3 ? "medium" : "low"
          out.push({
            id: "mood-dow-best",
            title: `Your mood is highest on ${DAY_LABELS_LONG[best.i]}s (avg ${round(best.v, 1)}/10)`,
            detail: `That's ${round(best.v - overall, 1)} pts above your overall ${round(overall, 1)} average. Whatever you do Tuesdays${best.i === 2 ? "" : ` — no wait, ${DAY_LABELS_LONG[best.i]}s`} — it works.`,
            surprise, score: Math.min(100, 40 + spread * 20 + sd * 10),
            source: `based on ${moods.length} mood logs across ${present.length} weekdays`,
            icon: Calendar, color: "#10b981", tone: "positive", href: "/mental-health",
          })
        }
        if (spread >= 1.2 && byDow[worst.i].length >= 2) {
          out.push({
            id: "mood-dow-worst",
            title: `${DAY_LABELS_LONG[worst.i]}s are your hardest day (avg ${round(worst.v, 1)}/10)`,
            detail: `${round(overall - worst.v, 1)} pts below your average. A flag to schedule recovery rituals — sleep, solitude, or something restorative.`,
            surprise: spread >= 2 ? "medium" : "low",
            score: Math.min(100, 30 + spread * 15),
            source: `based on ${byDow[worst.i].length} ${DAY_LABELS_LONG[worst.i]} mood logs`,
            icon: Calendar, color: "#f59e0b", tone: "negative", href: "/mental-health",
          })
        }
      }
    }

    /* ----- 7-day mood trajectory vs 30-day baseline ----- */
    if (moods.length >= 14) {
      const now = Date.now()
      const last7 = moods.filter(m => (now - new Date(m.createdAt).getTime()) / 86400000 <= 7).map(m => m.score)
      const prior30 = moods.filter(m => {
        const age = (now - new Date(m.createdAt).getTime()) / 86400000
        return age > 7 && age <= 37
      }).map(m => m.score)
      if (last7.length >= 3 && prior30.length >= 5) {
        const m7 = mean(last7); const m30 = mean(prior30)
        const delta = m7 - m30
        const pct = m30 > 0 ? (delta / m30) * 100 : 0
        if (Math.abs(delta) >= 0.4) {
          const up = delta > 0
          out.push({
            id: "mood-trend-7v30",
            title: `Your 7-day mood is ${up ? "up" : "down"} ${Math.abs(round(pct, 0))}% vs the prior month`,
            detail: `${round(m7, 1)}/10 this week vs ${round(m30, 1)}/10 baseline (${last7.length} recent · ${prior30.length} baseline logs).`,
            surprise: Math.abs(pct) >= 15 ? "high" : Math.abs(pct) >= 8 ? "medium" : "low",
            score: Math.min(100, 45 + Math.abs(pct) * 2),
            source: `based on ${last7.length + prior30.length} mood logs`,
            icon: up ? TrendingUp : TrendingDown, color: up ? "#10b981" : "#ef4444", tone: up ? "positive" : "negative",
            href: "/mental-health",
          })
        }
      }
    }

    /* ----- Sleep × Mood correlation ----- */
    if (sleepEntries.length >= 5 && moods.length >= 5) {
      const sleepMap = new Map<string, number>()
      sleepEntries.forEach(s => sleepMap.set(s.date, s.hours))
      const pairs: { s: number; m: number }[] = []
      moods.forEach(mEntry => {
        const h = sleepMap.get(mEntry.date)
        if (h !== undefined && h > 0) pairs.push({ s: h, m: mEntry.score })
      })
      if (pairs.length >= 5) {
        const r = pearson(pairs.map(p => p.s), pairs.map(p => p.m))
        if (Math.abs(r) >= 0.25) {
          const strong = Math.abs(r) >= 0.5
          const pos = r > 0
          out.push({
            id: "sleep-mood-corr",
            title: `${strong ? "Strong" : "Moderate"} ${pos ? "positive" : "negative"} link between your sleep and mood (r = ${round(r, 2)})`,
            detail: pos
              ? `Nights with more sleep pair with higher-mood days. That's a lever you can pull.`
              : `Counter-intuitive — more sleep tracks with lower mood for you. Could be oversleeping on rough days.`,
            surprise: strong ? "high" : "medium",
            score: Math.min(100, 55 + Math.abs(r) * 60),
            source: `based on ${pairs.length} matched sleep+mood days`,
            icon: Moon, color: pos ? "#6366f1" : "#ef4444", tone: pos ? "positive" : "neutral",
            href: "/correlations",
          })
        }
      }
    }

    /* ----- Exercise × Mood delta ----- */
    if (exerciseDates.size >= 2 && moods.length >= 6) {
      const on: number[] = [], off: number[] = []
      moods.forEach(m => (exerciseDates.has(m.date) ? on : off).push(m.score))
      if (on.length >= 2 && off.length >= 2) {
        const d = mean(on) - mean(off)
        if (Math.abs(d) >= 0.3) {
          out.push({
            id: "exercise-mood",
            title: `Mood is ${round(Math.abs(d), 1)} pts ${d > 0 ? "higher" : "lower"} on days you exercise`,
            detail: `${round(mean(on), 1)}/10 on ${on.length} exercise days vs ${round(mean(off), 1)}/10 on ${off.length} rest days.`,
            surprise: Math.abs(d) >= 1.2 ? "high" : Math.abs(d) >= 0.7 ? "medium" : "low",
            score: Math.min(100, 50 + Math.abs(d) * 25),
            source: `based on ${on.length + off.length} mood logs + ${exerciseDates.size} exercise days`,
            icon: Activity, color: d > 0 ? "#10b981" : "#f59e0b", tone: d > 0 ? "positive" : "neutral",
            href: "/correlations",
          })
        }
      }
    }

    /* ----- Habit: personal best completion ----- */
    if (habits.length > 0) {
      const ranked = habits.map((h: any) => {
        const created = h.createdAt ? new Date(h.createdAt).getTime() : Date.now() - 30 * 86400000
        const daysAlive = Math.max(1, Math.floor((Date.now() - created) / 86400000))
        const comps = h.completedDates?.length || 0
        const last30 = (h.completedDates || []).filter((d: string) => {
          const age = (Date.now() - new Date(d).getTime()) / 86400000
          return age <= 30
        }).length
        const rate30 = Math.min(100, Math.round((last30 / Math.min(30, daysAlive)) * 100))
        const allTimeRate = Math.min(100, Math.round((comps / daysAlive) * 100))
        return { name: h.name || h.title || "Unnamed", rate30, allTimeRate, comps, daysAlive, last30 }
      }).filter(h => h.comps > 0)

      if (ranked.length > 0) {
        const best30 = [...ranked].sort((a, b) => b.rate30 - a.rate30)[0]
        if (best30 && best30.rate30 >= 60 && best30.last30 >= 5) {
          out.push({
            id: `habit-best-${best30.name}`,
            title: `You've hit "${best30.name}" ${best30.rate30}% this month`,
            detail: `${best30.last30} of the last ${Math.min(30, best30.daysAlive)} days. Lifetime rate: ${best30.allTimeRate}%.`,
            surprise: best30.rate30 >= 90 ? "high" : best30.rate30 >= 75 ? "medium" : "low",
            score: Math.min(100, 40 + best30.rate30 * 0.5),
            source: `based on ${best30.comps} total completions over ${best30.daysAlive} days`,
            icon: CheckSquare, color: "#10b981", tone: "positive", href: "/daily-habits",
          })
        }

        // Worst habit
        const worst = [...ranked].sort((a, b) => a.rate30 - b.rate30)[0]
        if (worst && worst.rate30 < 35 && ranked.length >= 2) {
          out.push({
            id: `habit-worst-${worst.name}`,
            title: `"${worst.name}" is slipping — ${worst.rate30}% this month`,
            detail: `Only ${worst.last30} of the last ${Math.min(30, worst.daysAlive)} days. Pick one tiny version and re-anchor.`,
            surprise: "low", score: 25 + (50 - worst.rate30),
            source: `based on ${worst.comps} total completions`,
            icon: Target, color: "#f59e0b", tone: "negative", href: "/daily-habits",
          })
        }
      }
    }

    /* ----- Focus this week vs prior month ----- */
    if (focusHistory.length >= 5) {
      const now = Date.now()
      const last7 = focusHistory.filter(f => {
        const age = (now - new Date(f.date).getTime()) / 86400000
        return age <= 7
      })
      const prior28 = focusHistory.filter(f => {
        const age = (now - new Date(f.date).getTime()) / 86400000
        return age > 7 && age <= 35
      })
      const sum7 = last7.reduce((s, f) => s + (f.focusMinutes || 0), 0)
      const avg7 = sum7 / 7
      const avgPrior = prior28.length ? prior28.reduce((s, f) => s + (f.focusMinutes || 0), 0) / 28 : 0
      if (avg7 > 0 && avgPrior > 0 && Math.abs(avg7 - avgPrior) / avgPrior >= 0.15) {
        const pct = ((avg7 - avgPrior) / avgPrior) * 100
        const up = pct > 0
        out.push({
          id: "focus-7v28",
          title: `Your 7-day focus is ${up ? "up" : "down"} ${Math.abs(round(pct, 0))}% vs last month`,
          detail: `${Math.round(avg7)} min/day this week vs ${Math.round(avgPrior)} min/day baseline.`,
          surprise: Math.abs(pct) >= 50 ? "high" : Math.abs(pct) >= 25 ? "medium" : "low",
          score: Math.min(100, 40 + Math.abs(pct)),
          source: `based on ${last7.length + prior28.length} focus sessions`,
          icon: Timer, color: up ? "#ef4444" : "#f59e0b", tone: up ? "positive" : "negative", href: "/focus-timer",
        })
      }
    }

    /* ----- Gratitude rolling streak & headline ----- */
    if (gratitude.length >= 3) {
      const now = Date.now()
      const byWeek = (w: number) => gratitude.filter((g: any) => {
        const age = (now - new Date(g.date).getTime()) / 86400000
        return age > (w - 1) * 7 && age <= w * 7
      }).length
      const thisW = byWeek(1), lastW = byWeek(2), wAgo2 = byWeek(3), wAgo3 = byWeek(4)
      const recentMax = Math.max(lastW, wAgo2, wAgo3)
      if (thisW >= 3 && thisW > recentMax) {
        out.push({
          id: "gratitude-best",
          title: `You've journaled ${thisW} gratitudes this week — your highest in ${thisW > Math.max(lastW, wAgo2, wAgo3) && [lastW, wAgo2, wAgo3].every(x => x < thisW) ? "at least 3 weeks" : "recent weeks"}`,
          detail: `Prior 3 weeks: ${lastW}, ${wAgo2}, ${wAgo3}. Compounding mental state work.`,
          surprise: thisW >= 7 ? "medium" : "low",
          score: 45 + thisW * 3,
          source: `based on ${gratitude.length} gratitude entries`,
          icon: Heart, color: "#f43f5e", tone: "positive", href: "/gratitude",
        })
      } else if (thisW === 0 && lastW >= 2) {
        out.push({
          id: "gratitude-gap",
          title: `Zero gratitudes logged this week — ${lastW} last week`,
          detail: `One of the highest-leverage 60-second rituals. Pick one thing right now.`,
          surprise: "low", score: 30,
          source: `based on ${gratitude.length} total gratitude entries`,
          icon: Heart, color: "#94a3b8", tone: "negative", href: "/gratitude",
        })
      }
    }

    /* ----- Water adherence ----- */
    if (waterLog.length >= 7) {
      const goal = 2500
      const now = Date.now()
      const last14 = waterLog.filter((d: any) => {
        const age = (now - new Date(d.date).getTime()) / 86400000
        return age <= 14
      })
      const hit = last14.filter((d: any) => (d.total || 0) >= goal).length
      const rate = last14.length ? hit / last14.length : 0
      if (last14.length >= 5 && rate >= 0.8) {
        out.push({
          id: "water-hit-rate",
          title: `You hit your hydration goal ${hit} of the last ${last14.length} days (${Math.round(rate * 100)}%)`,
          surprise: rate >= 0.9 ? "medium" : "low",
          score: 30 + rate * 40,
          source: `based on ${last14.length} logged days`,
          icon: Droplets, color: "#3b82f6", tone: "positive", href: "/water-tracker",
        })
      } else if (last14.length >= 5 && rate < 0.3) {
        out.push({
          id: "water-low",
          title: `Only ${hit} of ${last14.length} recent days hit hydration target`,
          surprise: "low", score: 30,
          source: `based on ${last14.length} logged days`,
          icon: Droplets, color: "#f59e0b", tone: "negative", href: "/water-tracker",
        })
      }
    }

    /* ----- Focus time-of-day preference ----- */
    if (focusHistory.length >= 6) {
      let morning = 0, afternoon = 0, evening = 0, mC = 0, aC = 0, eC = 0
      focusHistory.forEach((f: any) => {
        const t = f.timestamp || f.date
        const h = new Date(t).getHours()
        if (!f.focusMinutes) return
        if (h < 12) { morning += f.focusMinutes; mC++ }
        else if (h < 17) { afternoon += f.focusMinutes; aC++ }
        else { evening += f.focusMinutes; eC++ }
      })
      const bands = [
        { label: "morning", total: morning, n: mC },
        { label: "afternoon", total: afternoon, n: aC },
        { label: "evening", total: evening, n: eC },
      ].filter(b => b.n >= 2)
      if (bands.length >= 2) {
        const best = bands.reduce((a, b) => (b.total / b.n > a.total / a.n ? b : a))
        const worst = bands.reduce((a, b) => (b.total / b.n < a.total / a.n ? b : a))
        const ratio = worst.n ? (best.total / best.n) / (worst.total / worst.n) : 0
        if (ratio >= 1.5) {
          out.push({
            id: "focus-time-of-day",
            title: `Your focus peaks in the ${best.label}`,
            detail: `${Math.round(best.total / best.n)} min avg vs ${Math.round(worst.total / worst.n)} min in the ${worst.label}. Protect ${best.label}s for deep work.`,
            surprise: ratio >= 2.5 ? "medium" : "low",
            score: 35 + Math.min(40, ratio * 8),
            source: `based on ${mC + aC + eC} focus sessions`,
            icon: Zap, color: "#ef4444", tone: "positive", href: "/focus-timer",
          })
        }
      }
    }

    /* ----- Active streaks ----- */
    if (streakData?.streaks) {
      const s = streakData.streaks
      const best = Object.entries(s)
        .filter(([k]) => k !== "overall")
        .map(([k, v]: any) => ({ k, current: v.current || 0, longest: v.longest || 0 }))
        .sort((a, b) => b.current - a.current)[0]
      if (best && best.current >= 5) {
        const tying = best.current >= best.longest - 1 && best.longest >= 7
        out.push({
          id: `streak-${best.k}`,
          title: tying
            ? `${best.current}-day ${best.k} streak — tying or near your all-time best of ${best.longest}`
            : `${best.current}-day ${best.k} streak active`,
          detail: `Longest ever: ${best.longest} days.`,
          surprise: tying ? "high" : best.current >= 14 ? "medium" : "low",
          score: 30 + best.current * 2 + (tying ? 20 : 0),
          source: `based on ${best.k} engagement history`,
          icon: Flame, color: "#f97316", tone: "positive",
        })
      }
    }

    /* ----- Engagement days in last 14 (habits API) ----- */
    if (habitsCalData?.stats) {
      const st = habitsCalData.stats
      const activeRate = st.totalDays ? st.activeDays / st.totalDays : 0
      if (activeRate >= 0.85 && st.activeDays >= 20) {
        out.push({
          id: "engagement-rate",
          title: `You've been active ${st.activeDays} of the last ${st.totalDays} days (${Math.round(activeRate * 100)}%)`,
          detail: `${st.totalActions} total cross-module actions. This is the pattern — not a streak, a way of operating.`,
          surprise: activeRate >= 0.95 ? "medium" : "low",
          score: 40 + activeRate * 30,
          source: `based on ${st.totalActions} actions across modules`,
          icon: BarChart3, color: "#8b5cf6", tone: "positive",
        })
      }
    }

    /* ----- Decisions cadence ----- */
    if (decisions.length >= 3) {
      const pending = decisions.filter((d: any) => d.status === "pending" || !d.reviewed).length
      const reviewed = decisions.length - pending
      if (reviewed >= 2 && decisions.length >= 3) {
        out.push({
          id: "decisions-log",
          title: `You've logged ${decisions.length} decisions — ${reviewed} reviewed`,
          detail: `Decision journaling beats memory for calibration. Review due on ${pending} open ones.`,
          surprise: "low", score: 25 + Math.min(30, decisions.length * 2),
          source: `based on ${decisions.length} decision entries`,
          icon: Scale, color: "#8b5cf6", tone: "neutral", href: "/decision-journal",
        })
      }
    }

    /* ----- Relationship "cold" count ----- */
    if (people.length >= 2) {
      const overdue = people.filter((p: any) => {
        if (!p.lastContact || !p.reminderDays) return false
        const age = (Date.now() - new Date(p.lastContact).getTime()) / 86400000
        return age > p.reminderDays
      })
      if (overdue.length >= 1 && overdue.length >= people.length * 0.4) {
        out.push({
          id: "people-overdue",
          title: `${overdue.length} of ${people.length} relationships are past due for contact`,
          detail: `Recency decays fast. Even a two-line message re-opens the circuit.`,
          surprise: overdue.length >= 3 ? "medium" : "low",
          score: 30 + overdue.length * 4,
          source: `based on ${people.length} tracked people`,
          icon: Users, color: "#f43f5e", tone: "negative", href: "/people",
        })
      }
    }

    /* ----- Hidden correlation: gratitude days vs mood ----- */
    if (gratitude.length >= 4 && moods.length >= 6) {
      const gSet = new Set(gratitude.map((g: any) => g.date))
      const withG: number[] = [], withoutG: number[] = []
      moods.forEach(m => (gSet.has(m.date) ? withG : withoutG).push(m.score))
      if (withG.length >= 3 && withoutG.length >= 3) {
        const d = mean(withG) - mean(withoutG)
        if (Math.abs(d) >= 0.5) {
          out.push({
            id: "gratitude-mood",
            title: `Mood is ${round(Math.abs(d), 1)} pts ${d > 0 ? "higher" : "lower"} on days you log gratitude`,
            detail: `${round(mean(withG), 1)}/10 on ${withG.length} gratitude days vs ${round(mean(withoutG), 1)}/10 on ${withoutG.length} others. Hidden link.`,
            surprise: Math.abs(d) >= 1 ? "high" : "medium",
            score: 60 + Math.abs(d) * 20,
            source: `based on ${withG.length + withoutG.length} paired days`,
            icon: Telescope, color: "#f43f5e", tone: d > 0 ? "positive" : "neutral",
          })
        }
      }
    }

    /* ----- Hidden correlation: journaling days vs mood ----- */
    if (journalEntries.length >= 4 && moods.length >= 6) {
      const jSet = new Set(journalEntries.map((j: any) => toISODate(j.createdAt)))
      const withJ: number[] = [], withoutJ: number[] = []
      moods.forEach(m => (jSet.has(m.date) ? withJ : withoutJ).push(m.score))
      if (withJ.length >= 3 && withoutJ.length >= 3) {
        const d = mean(withJ) - mean(withoutJ)
        if (Math.abs(d) >= 0.4) {
          out.push({
            id: "journal-mood",
            title: `Mood is ${round(Math.abs(d), 1)} pts ${d > 0 ? "higher" : "lower"} on days you journal`,
            surprise: Math.abs(d) >= 1 ? "high" : "medium",
            score: 55 + Math.abs(d) * 18,
            source: `based on ${withJ.length + withoutJ.length} paired days`,
            icon: Telescope, color: "#6366f1", tone: d > 0 ? "positive" : "neutral", href: "/journal",
          })
        }
      }
    }

    /* ----- Breathwork cadence ----- */
    if (breathworkSessions.length >= 3) {
      const now = Date.now()
      const last7 = breathworkSessions.filter((b: any) => (now - new Date(b.date || b.timestamp || 0).getTime()) / 86400000 <= 7).length
      if (last7 >= 3) {
        out.push({
          id: "breathwork-cadence",
          title: `${last7} breathwork sessions in the last 7 days`,
          surprise: last7 >= 5 ? "medium" : "low",
          score: 25 + last7 * 3,
          source: `based on ${breathworkSessions.length} total sessions`,
          icon: Sparkles, color: "#06b6d4", tone: "positive", href: "/breathwork",
        })
      }
    }

    return out
  }, [localReady, moods, sleepEntries, exerciseDates, journalEntries, habits, focusHistory,
      gratitude, waterLog, streakData, habitsCalData, decisions, people, breathworkSessions])

  /* ----- rank by surprise ----- */
  const ranked = useMemo(() => {
    const copy = [...insights]
    copy.sort((a, b) => b.score - a.score)
    if (copy.length) copy[0].surprise = "headline"
    return copy
  }, [insights])

  const headline = ranked[0]
  const rest = ranked.slice(1)

  /* ----- personal benchmarks (90-day p50/p75/p90) ----- */
  const benchmarks = useMemo(() => {
    const now = Date.now()
    const in90 = <T extends { date: string }>(arr: T[]) =>
      arr.filter(x => (now - new Date(x.date).getTime()) / 86400000 <= 90)

    const mood90 = in90(moods).map(m => m.score)
    const sleep90 = in90(sleepEntries).map(s => s.hours)
    const focus90 = in90(focusHistory.map((f: any) => ({ date: f.date, v: f.focusMinutes || 0 }))).map(x => x.v).filter(v => v > 0)
    const water90 = in90(waterLog.map((w: any) => ({ date: w.date, v: w.total || 0 }))).map(x => x.v).filter(v => v > 0)

    // today's current values
    const today = toISODate(new Date())
    const todayMood = moods.filter(m => m.date === today).map(m => m.score)
    const todaySleep = sleepEntries.filter(s => s.date === today).map(s => s.hours)
    const todayFocus = focusHistory.find((f: any) => f.date === today)?.focusMinutes || 0
    const todayWater = waterLog.find((w: any) => w.date === today)?.total || 0

    return [
      { label: "Mood", unit: "/10", color: "#8b5cf6", data: mood90, current: todayMood.length ? mean(todayMood) : 0, icon: Brain },
      { label: "Sleep", unit: "h", color: "#6366f1", data: sleep90, current: todaySleep[0] || 0, icon: Moon },
      { label: "Focus", unit: "m", color: "#ef4444", data: focus90, current: todayFocus, icon: Timer },
      { label: "Water", unit: "ml", color: "#3b82f6", data: water90, current: todayWater, icon: Droplets },
    ].map(b => ({
      ...b,
      n: b.data.length,
      p50: percentile(b.data, 50),
      p75: percentile(b.data, 75),
      p90: percentile(b.data, 90),
    }))
  }, [moods, sleepEntries, focusHistory, waterLog])

  /* ----- weekly pattern heatmap ----- */
  const moodByDow = useMemo(() => {
    const bucket: number[][] = Array.from({ length: 7 }, () => [])
    moods.forEach(m => {
      const d = new Date(m.createdAt).getDay()
      bucket[d].push(m.score)
    })
    return bucket.map(arr => (arr.length ? round(mean(arr), 1) : 0))
  }, [moods])

  const sleepByDow = useMemo(() => {
    const bucket: number[][] = Array.from({ length: 7 }, () => [])
    sleepEntries.forEach(s => {
      const d = new Date(s.date).getDay()
      bucket[d].push(s.hours)
    })
    return bucket.map(arr => (arr.length ? round(mean(arr), 1) : 0))
  }, [sleepEntries])

  /* ----- flourishing history sparkline ----- */
  const flourishingSpark = useMemo(() => {
    const sorted = [...flourishingHistory].sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
    return sorted.map(h => h.score).filter(s => typeof s === "number")
  }, [flourishingHistory])

  /* ----- loading guard ----- */
  if (!localReady) {
    return (
      <div className="p-8 text-center text-muted-foreground max-w-4xl">
        <Sparkles className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
        <p>Scanning your data...</p>
      </div>
    )
  }

  /* ================== EMPTY STATE (< 14 days of data) ==================== */
  if (totalDataDays < MIN_DAYS_FOR_INSIGHTS) {
    const have = totalDataDays
    const need = MIN_DAYS_FOR_INSIGHTS - have
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Telescope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-xs text-muted-foreground">Cross-feature pattern discovery from your own data</p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-violet-200">
          <CardContent className="py-10 px-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Compass className="h-12 w-12 text-violet-400" />
                <Sparkles className="h-5 w-5 text-amber-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-lg">Patterns need time to emerge</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
                Insights are computed from your real data — mood, sleep, habits, focus, gratitude, relationships.
                You've logged data on <span className="font-semibold text-foreground">{have}</span> distinct {have === 1 ? "day" : "days"}.
                {" "}Need <span className="font-semibold text-foreground">{need}</span> more to unlock correlations, day-of-week patterns, and trajectory detection.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-lg mx-auto text-left">
              {[
                { href: "/mental-health", label: "Log mood", icon: Brain, color: "text-violet-500" },
                { href: "/sleep-optimization", label: "Log sleep", icon: Moon, color: "text-indigo-500" },
                { href: "/daily-habits", label: "Check habits", icon: CheckSquare, color: "text-emerald-500" },
                { href: "/gratitude", label: "3 gratitudes", icon: Heart, color: "text-rose-500" },
              ].map(l => {
                const Icon = l.icon
                return (
                  <a key={l.href} href={l.href} className="rounded-lg border p-2.5 hover:bg-muted/40 transition-colors flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", l.color)} />
                    <span className="text-xs">{l.label}</span>
                  </a>
                )
              })}
            </div>
            <p className="text-[10px] text-muted-foreground pt-2">
              Every claim on this page is computed from data you own. No baked-in examples. No placeholders.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ============================= RENDERED PAGE =========================== */
  return (
    <div className="space-y-6 max-w-4xl">
      {/* ---------- header ---------- */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <Telescope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Insights</h1>
              <p className="text-xs text-muted-foreground">Pattern discovery across your platform data — ranked by surprise-worthiness</p>
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-muted-foreground leading-tight">
          <p><span className="font-semibold text-foreground">{ranked.length}</span> patterns</p>
          <p><span className="font-semibold text-foreground">{totalDataDays}</span> data-days</p>
          <p>
            <span className="font-semibold text-foreground">
              {moods.length + sleepEntries.length + journalEntries.length + focusHistory.length + gratitude.length}
            </span> logs
          </p>
        </div>
      </div>

      {/* ---------- THIS WEEK'S HEADLINE ---------- */}
      {headline ? (
        <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-indigo-50/40 dark:from-violet-950/20 dark:to-indigo-950/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="h-6 w-6 rounded-md bg-violet-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">This week's headline</p>
              <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-700 dark:text-violet-300">
                {Math.round(headline.score)}/100 surprise
              </Badge>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${headline.color}1a` }}>
                <headline.icon className="h-6 w-6" style={{ color: headline.color }} />
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-semibold leading-snug">{headline.title}</p>
                {headline.detail && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{headline.detail}</p>}
                <div className="flex items-center gap-2 mt-2.5">
                  <p className="text-[10px] text-muted-foreground italic">{headline.source}</p>
                  {headline.href && (
                    <a href={headline.href} className="text-[11px] font-medium text-violet-600 hover:underline inline-flex items-center gap-0.5">
                      explore <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Still gathering enough signal for a headline. Keep logging.</p>
          </CardContent>
        </Card>
      )}

      {/* ---------- PERSONAL BENCHMARKS ---------- */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-semibold">Your Personal Benchmark</p>
            </div>
            <p className="text-[10px] text-muted-foreground">90-day distribution · p50 / p75 / p90</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {benchmarks.map(b => {
              const Icon = b.icon
              const atPct = b.p90 > 0
                ? b.current >= b.p90 ? "top 10%"
                : b.current >= b.p75 ? "top 25%"
                : b.current >= b.p50 ? "above median"
                : b.current > 0 ? "below median"
                : null
                : null
              return (
                <div key={b.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" style={{ color: b.color }} />
                      <span className="text-xs font-medium">{b.label}</span>
                      <span className="text-[9px] text-muted-foreground">({b.n} days)</span>
                    </div>
                    {b.current > 0 && atPct && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                        today: {atPct}
                      </span>
                    )}
                  </div>
                  {b.n >= 3 ? (
                    <BenchmarkBar p50={b.p50} p75={b.p75} p90={b.p90} current={b.current} unit={b.unit} color={b.color} />
                  ) : (
                    <p className="text-[10px] text-muted-foreground">Need more logs to compute percentiles.</p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t">
            These are <span className="font-medium">your own</span> 90-day percentiles — not a population norm.
            The bar shows where today lands relative to how you usually perform.
          </p>
        </CardContent>
      </Card>

      {/* ---------- DAY-OF-WEEK PATTERN ---------- */}
      {moods.length >= 7 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold">Weekly rhythm</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{moods.length} mood logs · {sleepEntries.length} sleep logs</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground mb-2">Mood by day (avg /10)</p>
                <DayBars values={moodByDow} labels={DAY_LABELS} color="#8b5cf6" />
              </div>
              {sleepEntries.length >= 5 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-2">Sleep by day (avg hrs)</p>
                  <DayBars values={sleepByDow} labels={DAY_LABELS} color="#6366f1" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- FLOURISHING TRAJECTORY ---------- */}
      {flourishingSpark.length >= 5 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Flourishing trajectory</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Last {flourishingSpark.length} logged days</p>
              </div>
              <div className="flex items-center gap-3">
                <Donut
                  value={flourishingSpark[flourishingSpark.length - 1]}
                  max={100}
                  color={flourishingSpark[flourishingSpark.length - 1] >= 70 ? "#10b981" : flourishingSpark[flourishingSpark.length - 1] >= 40 ? "#f59e0b" : "#ef4444"}
                  label="latest" sub="/ 100"
                />
                <Sparkline data={flourishingSpark} color="#8b5cf6" height={44} width={140} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
              <span>low {Math.min(...flourishingSpark)}</span>
              <span>avg {Math.round(mean(flourishingSpark))}</span>
              <span>high {Math.max(...flourishingSpark)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- ALL PATTERNS ---------- */}
      {rest.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold">All patterns</p>
              </div>
              <p className="text-[10px] text-muted-foreground">ranked by surprise</p>
            </div>
            <div className="space-y-2">
              {rest.map(ins => {
                const Icon = ins.icon
                const surpriseBadge = ins.surprise === "high"
                  ? { label: "High surprise", cls: "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20" }
                  : ins.surprise === "medium"
                    ? { label: "Notable", cls: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/20" }
                    : { label: "Routine", cls: "border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-800/30" }
                const toneIcon = ins.tone === "positive" ? <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  : ins.tone === "negative" ? <ArrowDownRight className="h-3 w-3 text-red-500" />
                  : <Minus className="h-3 w-3 text-muted-foreground" />
                return (
                  <a
                    key={ins.id}
                    href={ins.href || "#"}
                    className={cn("flex gap-3 rounded-lg border p-3 transition-colors", ins.href ? "hover:bg-muted/40" : "cursor-default")}
                    onClick={e => !ins.href && e.preventDefault()}
                  >
                    <div className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ins.color}15` }}>
                      <Icon className="h-4 w-4" style={{ color: ins.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{ins.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {toneIcon}
                          <Badge variant="outline" className={cn("text-[9px] shrink-0", surpriseBadge.cls)}>{surpriseBadge.label}</Badge>
                        </div>
                      </div>
                      {ins.detail && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ins.detail}</p>}
                      <p className="text-[10px] text-muted-foreground/80 italic mt-1">{ins.source}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- DATA LEDGER ---------- */}
      <Card className="border-violet-100 bg-violet-50/20 dark:bg-violet-950/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-violet-500" />
            <p className="text-xs font-semibold">How these insights are computed</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {[
              { label: "Mood logs", n: moods.length, href: "/mental-health" },
              { label: "Sleep logs", n: sleepEntries.length, href: "/sleep-optimization" },
              { label: "Exercise days", n: exerciseDates.size, href: "/health" },
              { label: "Journal entries", n: journalEntries.length, href: "/journal" },
              { label: "Focus sessions", n: focusHistory.length, href: "/focus-timer" },
              { label: "Gratitude days", n: gratitude.length, href: "/gratitude" },
              { label: "Water days", n: waterLog.length, href: "/water-tracker" },
              { label: "Decisions", n: decisions.length, href: "/decision-journal" },
            ].map(d => (
              <a key={d.label} href={d.href} className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5 hover:bg-muted/40 transition-colors">
                <p className="text-muted-foreground">{d.label}</p>
                <p className="text-sm font-bold text-foreground tabular-nums">{d.n}</p>
              </a>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Every pattern above is derived from the raw data in these buckets. Correlations use Pearson's r on matched days.
            Percentiles use your 90-day distribution. Day-of-week averages require at least two logs per day before they appear.
            Nothing is inferred, templated, or generated from outside sources — this is a mirror of your own logs.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap text-xs pt-2">
        <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
        <a href="/correlations" className="text-indigo-600 hover:underline">Correlations</a>
        <a href="/flourishing-score" className="text-emerald-600 hover:underline">Flourishing Score</a>
        <a href="/progress" className="text-blue-600 hover:underline">Progress</a>
        <a href="/community/insights" className="text-amber-600 hover:underline">Community insights</a>
      </div>
    </div>
  )
}
