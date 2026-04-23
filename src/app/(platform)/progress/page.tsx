"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  TrendingUp, TrendingDown, Minus, Heart, DollarSign, Brain, Users, BookOpen,
  Flame, Trophy, Target, Sparkles, ArrowUp, ArrowDown, Award, Activity,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

function isoDay(offset: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

// Fit a line y = mx + b over [0..n-1], return slope per day (m)
function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0
  const xs = values.map((_, i) => i)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

// ────────────────────────────────────────────────────────────────────────────
// Sparkline (hand-rolled SVG)
// ────────────────────────────────────────────────────────────────────────────

function TrajectorySpark({
  data, color, width = 160, height = 36,
}: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-muted/30" strokeWidth={1} strokeDasharray="2 2" />
      </svg>
    )
  }
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2] as [number, number])
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  const start = data[0]
  const end = data[data.length - 1]
  const trendUp = end > start

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={color} />
      {trendUp
        ? <polygon points={`${width + 4},${height / 2 - 3} ${width + 10},${height / 2} ${width + 4},${height / 2 + 3}`} fill={color} opacity={0.5} />
        : null}
    </svg>
  )
}

// Circular ring for dimension percentages
function Ring({ pct, color, size = 64, stroke = 6 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (clamp(pct) / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
      />
    </svg>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Flourishing level ladder
// ────────────────────────────────────────────────────────────────────────────

const LEVELS = [
  { lvl: 1, min: 0,  name: "Starting",      color: "text-slate-500",   bg: "bg-slate-100" },
  { lvl: 2, min: 25, name: "Stabilizing",   color: "text-blue-500",    bg: "bg-blue-100" },
  { lvl: 3, min: 45, name: "Building",      color: "text-emerald-500", bg: "bg-emerald-100" },
  { lvl: 4, min: 65, name: "Flourishing",   color: "text-violet-500",  bg: "bg-violet-100" },
  { lvl: 5, min: 80, name: "Thriving",      color: "text-amber-500",   bg: "bg-amber-100" },
  { lvl: 6, min: 92, name: "Transcending",  color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
] as const

type Level = (typeof LEVELS)[number]
function getLevel(score: number): { cur: Level; next: Level | undefined; pointsToNext: number } {
  let cur: Level = LEVELS[0]
  for (const l of LEVELS) if (score >= l.min) cur = l
  const next = LEVELS.find(l => l.min > score)
  return { cur, next, pointsToNext: next ? Math.max(0, next.min - score) : 0 }
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  // APIs
  const { data: healthData }       = useSWR("/api/health/entries?limit=200", secureFetcher)
  const { data: moodData }         = useSWR("/api/mental-health/mood?limit=90", secureFetcher)
  const { data: streaksData }      = useSWR("/api/streaks", secureFetcher)
  const { data: goalsData }        = useSWR("/api/goals/all", secureFetcher)
  const { data: achievementsData } = useSWR("/api/achievements", secureFetcher)
  const { data: walletData }       = useSWR("/api/wallet", secureFetcher)

  // localStorage
  const [local, setLocal] = useState<{
    habits: any[]; wins: any[]; decisions: any[]; reflections: any[];
    reading: any[]; skills: any[]; relationships: any[]; netWorth: any;
    debts: any; subs: any; budget: any; flourishingHistory: any[];
    gratitude: any[]; focusHistory: any[]; challenges: any[];
    meals: any; preparedness: any;
  } | null>(null)

  useEffect(() => {
    setLocal({
      habits:             safeParse(localStorage.getItem("hfp-daily-habits"), []),
      wins:               safeParse(localStorage.getItem("hfp-wins"), []),
      decisions:          safeParse(localStorage.getItem("hfp-decisions"), []),
      reflections:        safeParse(localStorage.getItem("hfp-weekly-reflections"), []),
      reading:            safeParse(localStorage.getItem("hfp-reading"), []),
      skills:             safeParse(localStorage.getItem("hfp-skills"), []),
      relationships:      safeParse(localStorage.getItem("hfp-relationships"), []),
      netWorth:           safeParse(localStorage.getItem("hfp-networth"), null),
      debts:              safeParse(localStorage.getItem("hfp-debts"), null),
      subs:               safeParse(localStorage.getItem("hfp-subscriptions"), null),
      budget:             safeParse(localStorage.getItem("hfp-budget"), null),
      flourishingHistory: safeParse(localStorage.getItem("hfp-flourishing-history"), []),
      gratitude:          safeParse(localStorage.getItem("hfp-gratitude"), []),
      focusHistory:       safeParse(localStorage.getItem("hfp-focus-history"), []),
      challenges:         safeParse(localStorage.getItem("hfp-challenges"), []),
      meals:              safeParse(localStorage.getItem("hfp-meal-plan"), null),
      preparedness:       safeParse(localStorage.getItem("hfp-preparedness"), {}),
    })
  }, [])

  // ===== Build 90-day per-dimension trajectories =====
  const { dimensions, quarterlyWins, focusAreas, streakSummary, overall90d } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const days90 = Array.from({ length: 90 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (89 - i))
      return d.toISOString().slice(0, 10)
    })
    const quarterAgo = Date.now() - 90 * 86400000

    const entries = healthData?.entries ?? []
    const moods = moodData?.entries ?? []
    const goals = goalsData?.goals ?? []
    const streaksObj = streaksData ?? {}
    const wallet = walletData?.wallet ?? {}
    const ach = achievementsData ?? { badges: [], earned: 0, total: 0 }

    // --- HEALTH dimension per-day score (0..100) ---
    const healthByDay: number[] = days90.map(d => {
      const dayEntries = entries.filter((e: any) => (e.createdAt || "").startsWith(d))
      const hadExercise = dayEntries.some((e: any) => e.entryType === "EXERCISE")
      const sleepEntry = dayEntries.find((e: any) => e.entryType === "SLEEP")
      let sleepHours = 0
      try { sleepHours = sleepEntry ? (JSON.parse(sleepEntry.data)?.hoursSlept || 0) : 0 } catch {}
      const hadAnyLog = dayEntries.length > 0

      let s = 0
      if (hadExercise) s += 45
      if (sleepHours >= 7) s += 40
      else if (sleepHours >= 6) s += 25
      else if (sleepHours > 0) s += 10
      if (hadAnyLog) s += 15
      return clamp(s)
    })

    // --- MIND (mood + habits + focus + reflections) per-day ---
    const habitsList = local?.habits ?? []
    const focusHistory = local?.focusHistory ?? []
    const reflections = local?.reflections ?? []

    const mindByDay: number[] = days90.map(d => {
      const dayMoods = moods.filter((m: any) => String(m.recordedAt || m.createdAt || "").startsWith(d))
      const moodAvg = dayMoods.length ? dayMoods.reduce((a: number, m: any) => a + (m.score || 0), 0) / dayMoods.length : 0
      const moodPart = moodAvg ? (moodAvg / 10) * 40 : 0

      const habitDone = habitsList.length
        ? habitsList.filter((h: any) => h.completedDates?.includes(d)).length / habitsList.length
        : 0
      const habitPart = habitDone * 35

      const focusDay = focusHistory.find((f: any) => f.date === d)
      const focusMin = focusDay?.focusMinutes || 0
      const focusPart = clamp(focusMin / 60 * 15, 0, 15)

      const hadReflection = reflections.some((r: any) => {
        const rd = new Date(r.date + "T12:00:00")
        const dd = new Date(d + "T12:00:00")
        const diff = Math.abs(rd.getTime() - dd.getTime())
        return diff <= 6 * 86400000
      })
      const reflPart = hadReflection ? 10 : 0

      return clamp(moodPart + habitPart + focusPart + reflPart)
    })

    // --- WEALTH (snapshot-driven; not time-series, so render a step-curve based on present completeness) ---
    const budget = local?.budget
    const netWorth = local?.netWorth
    const debts = local?.debts
    const subs = local?.subs
    const wealthNow = (() => {
      let s = 0
      if (budget?.incomes?.some((v: number) => v > 0)) s += 25
      if (netWorth?.entries?.length > 0) s += 25
      if (debts?.debts?.length > 0) s += 15
      if (subs?.subs?.length > 0) s += 10
      const foundBal = wallet?.balance || 0
      if (foundBal >= 1000) s += 25
      else if (foundBal >= 500) s += 15
      else if (foundBal >= 100) s += 8
      return clamp(s)
    })()
    // Step-curve: use netWorth entries (have dates) to build history
    const nwEntries = (netWorth?.entries ?? []).slice().sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const wealthByDay: number[] = days90.map(d => {
      const relevantEntries = nwEntries.filter((e: any) => e.date <= d)
      const hasEntry = relevantEntries.length > 0
      let s = 0
      if (budget?.incomes?.some((v: number) => v > 0)) s += 25
      if (hasEntry) s += 25
      if (debts?.debts?.length > 0) s += 15
      if (subs?.subs?.length > 0) s += 10
      const foundBal = wallet?.balance || 0
      if (foundBal >= 1000) s += 25
      else if (foundBal >= 500) s += 15
      else if (foundBal >= 100) s += 8
      return clamp(s)
    })

    // --- RELATIONSHIPS (localStorage relationships + wins flagged social) ---
    const relationshipsList = local?.relationships ?? []
    const wins = local?.wins ?? []
    const socialWinsByDate = new Map<string, number>()
    for (const w of wins) {
      if (w.category !== "social" && w.category !== "family") continue
      const d = String(w.date || "").slice(0, 10)
      if (!d) continue
      socialWinsByDate.set(d, (socialWinsByDate.get(d) || 0) + 1)
    }
    const relationshipsByDay: number[] = days90.map(d => {
      const trackedScore = clamp(relationshipsList.length * 15, 0, 50)
      const recentSocialActivity = (() => {
        const start = new Date(d + "T12:00:00"); start.setDate(start.getDate() - 6)
        let count = 0
        for (const w of wins) {
          if (!(w.category === "social" || w.category === "family")) continue
          const wd = new Date(String(w.date || "").slice(0, 10) + "T12:00:00")
          if (wd <= new Date(d + "T12:00:00") && wd >= start) count++
        }
        return clamp(count * 12, 0, 50)
      })()
      return clamp(trackedScore + recentSocialActivity)
    })

    // --- GROWTH (reading + skills + decisions + achievements) ---
    const reading = local?.reading ?? []
    const skills = local?.skills ?? []
    const decisions = local?.decisions ?? []

    const growthByDay: number[] = days90.map(d => {
      const booksFinishedByDate = reading.filter((b: any) => {
        if (b.status !== "finished") return false
        const fd = (b.finishedAt || b.finishDate || b.updatedAt || "").slice(0, 10)
        return fd && fd <= d
      }).length
      const decisionsByDate = decisions.filter((dec: any) => (dec.date || "") <= d).length
      const skillsStarted = skills.length

      let s = 0
      s += clamp(booksFinishedByDate * 12, 0, 40)
      s += clamp(decisionsByDate * 5, 0, 30)
      s += clamp(skillsStarted * 6, 0, 20)
      const earnedAch = ach.earned || 0
      s += clamp(earnedAch * 2, 0, 10)
      return clamp(s)
    })

    // ===== Latest values and slopes =====
    const dimensions = [
      { key: "health",        label: "Health",        icon: Heart,        color: "#10b981", colorClass: "text-emerald-500",
        data: healthByDay, value: healthByDay[healthByDay.length - 1] },
      { key: "mind",          label: "Mind",          icon: Brain,        color: "#8b5cf6", colorClass: "text-violet-500",
        data: mindByDay, value: mindByDay[mindByDay.length - 1] },
      { key: "wealth",        label: "Wealth",        icon: DollarSign,   color: "#f59e0b", colorClass: "text-amber-500",
        data: wealthByDay, value: wealthByDay[wealthByDay.length - 1] },
      { key: "relationships", label: "Relationships", icon: Users,        color: "#f43f5e", colorClass: "text-rose-500",
        data: relationshipsByDay, value: relationshipsByDay[relationshipsByDay.length - 1] },
      { key: "growth",        label: "Growth",        icon: BookOpen,     color: "#6366f1", colorClass: "text-indigo-500",
        data: growthByDay, value: growthByDay[growthByDay.length - 1] },
    ].map(d => {
      // 30-day slope for trajectory; compare last 30 vs prior 30
      const last30 = d.data.slice(-30)
      const prior30 = d.data.slice(-60, -30)
      const a = last30.reduce((x, y) => x + y, 0) / Math.max(1, last30.length)
      const b = prior30.length ? prior30.reduce((x, y) => x + y, 0) / prior30.length : a
      const delta = Math.round(a - b)
      const slope = linearSlope(d.data.slice(-30))
      return { ...d, delta, slope }
    })

    // ===== Overall 90d score (weighted average of dimension data) =====
    const weights: Record<string, number> = { health: 0.25, mind: 0.25, wealth: 0.2, relationships: 0.15, growth: 0.15 }
    const overall90d = dimensions.map((d, _, arr) => {
      return arr.map(x => x.data).reduce((acc, series, idx) => {
        const w = weights[arr[idx].key]
        return acc.map((v, i) => v + (series[i] || 0) * w)
      }, Array(90).fill(0))
    })[0] || Array(90).fill(0)

    // ===== Biggest wins this quarter =====
    const quarterlyWins = (wins as any[])
      .filter(w => w.date && new Date(w.date).getTime() >= quarterAgo)
      .sort((a, b) => {
        const wa = a.size === "big" ? 3 : a.size === "medium" ? 2 : 1
        const wb = b.size === "big" ? 3 : b.size === "medium" ? 2 : 1
        if (wa !== wb) return wb - wa
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .slice(0, 5)

    // ===== Biggest progress vs needs focus =====
    const sorted = [...dimensions].sort((a, b) => b.delta - a.delta)
    const focusAreas = {
      topGains: sorted.filter(d => d.delta > 0).slice(0, 2),
      needsFocus: sorted.slice().reverse().filter(d => d.value < 50).slice(0, 2),
    }

    // ===== Streak summary =====
    const streakSummary = (() => {
      const keys = ["overall", "health", "mood", "journal", "education", "energy"] as const
      const currents = keys.map(k => (streaksObj as any)[k]?.current || 0)
      const longests = keys.map(k => (streaksObj as any)[k]?.longest || 0)

      // Local habits streaks
      const habitStreaks = habitsList.map((h: any) => {
        const dates: string[] = Array.isArray(h.completedDates) ? [...h.completedDates].sort() : []
        if (!dates.length) return { current: 0, longest: 0, name: h.name || "Habit" }
        let longest = 1, run = 1
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1] + "T12:00:00").getTime()
          const curr = new Date(dates[i] + "T12:00:00").getTime()
          if (Math.round((curr - prev) / 86400000) === 1) { run++; if (run > longest) longest = run }
          else run = 1
        }
        // Current streak
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const yest = new Date(today); yest.setDate(yest.getDate() - 1)
        const todayIso = today.toISOString().slice(0, 10)
        const yestIso = yest.toISOString().slice(0, 10)
        const last = dates[dates.length - 1]
        let current = 0
        if (last === todayIso || last === yestIso) {
          current = 1
          for (let i = dates.length - 2; i >= 0; i--) {
            const a = new Date(dates[i + 1] + "T12:00:00").getTime()
            const b = new Date(dates[i] + "T12:00:00").getTime()
            if (Math.round((a - b) / 86400000) === 1) current++
            else break
          }
        }
        return { current, longest, name: h.name || "Habit" }
      })

      const allCurrents = [...currents, ...habitStreaks.map(h => h.current)]
      const allLongests = [...longests, ...habitStreaks.map(h => h.longest)]
      const active = allCurrents.filter(n => n >= 1).length
      const currentLongest = Math.max(0, ...allCurrents)
      const everLongest = Math.max(0, ...allLongests)

      const namedCurrent = habitStreaks
        .filter(h => h.current > 0)
        .sort((a, b) => b.current - a.current)[0]
      const namedEver = habitStreaks
        .sort((a, b) => b.longest - a.longest)[0]

      return { active, currentLongest, everLongest, namedCurrent, namedEver }
    })()

    return { dimensions, quarterlyWins, focusAreas, streakSummary, overall90d }
  }, [local, healthData, moodData, streaksData, goalsData, achievementsData, walletData])

  if (!local) return null

  // ===== Overall flourishing score (weighted avg of dimension values) =====
  const weights: Record<string, number> = { health: 0.25, mind: 0.25, wealth: 0.2, relationships: 0.15, growth: 0.15 }
  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.value * weights[d.key], 0))
  const level = getLevel(overallScore)

  // ===== Level progress toward next =====
  const levelProgress = level.next
    ? clamp(((overallScore - level.cur.min) / (level.next.min - level.cur.min)) * 100)
    : 100

  const achievementsPct = achievementsData?.completionPct ?? 0
  const achievementsEarned = achievementsData?.earned ?? 0
  const achievementsTotal = achievementsData?.total ?? 0
  const activeGoals = (goalsData?.goals ?? []).filter((g: any) => g.isActive && !g.completedAt).length
  const completedGoals = goalsData?.completed ?? 0

  const hasAnyData = dimensions.some(d => d.data.some(v => v > 0))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Progress</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Five life dimensions, tracked across 90 days. Real data, no estimates.
        </p>
      </div>

      {/* ===== Flourishing level ===== */}
      <Card className={cn("border-2", level.cur.bg.replace("bg-", "border-").replace("-100", "-200"))}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Score ring */}
            <div className="relative shrink-0">
              <Ring pct={overallScore} color={
                overallScore >= 65 ? "#8b5cf6" :
                overallScore >= 45 ? "#10b981" :
                overallScore >= 25 ? "#3b82f6" : "#64748b"
              } size={96} stroke={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={cn("text-3xl font-bold leading-none", level.cur.color)}>{overallScore}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">/ 100</p>
              </div>
            </div>

            {/* Level info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[9px]", level.cur.color)}>
                  Level {level.cur.lvl}
                </Badge>
                <p className="text-sm font-semibold">{level.cur.name}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                {level.next
                  ? `${level.pointsToNext} points to Level ${level.next.lvl} — ${level.next.name}`
                  : "You are at the highest level. Keep going."}
              </p>
              {level.next && (
                <>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${levelProgress}%`,
                        background: `linear-gradient(to right, ${
                          overallScore >= 65 ? "#8b5cf6" : overallScore >= 45 ? "#10b981" : "#3b82f6"
                        }, ${overallScore >= 65 ? "#f59e0b" : "#8b5cf6"})`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>{level.cur.min}</span>
                    <span>{level.next.min}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 90-day overall spark */}
          {hasAnyData && (
            <div className="mt-4 pt-3 border-t flex items-center gap-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">90-day trend</p>
              <div className="flex-1 flex justify-end">
                <TrajectorySpark data={overall90d} color="#8b5cf6" width={220} height={30} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Per-dimension trajectories ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map(d => {
          const Icon = d.icon
          const trendIcon = d.delta > 2 ? TrendingUp : d.delta < -2 ? TrendingDown : Minus
          const TrendIcon = trendIcon
          const trendColor = d.delta > 2 ? "text-emerald-500" : d.delta < -2 ? "text-red-500" : "text-muted-foreground"
          return (
            <Card key={d.key}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Ring pct={d.value} color={d.color} size={52} stroke={5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className={cn("h-4 w-4", d.colorClass)} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-sm font-semibold flex-1">{d.label}</p>
                      <TrendIcon className={cn("h-3 w-3", trendColor)} />
                      <span className={cn("text-[10px] font-medium", trendColor)}>
                        {d.delta > 0 ? "+" : ""}{d.delta}
                      </span>
                    </div>
                    <p className="text-2xl font-bold leading-none">{Math.round(d.value)}<span className="text-[10px] text-muted-foreground ml-0.5">/ 100</span></p>
                    <div className="mt-1.5">
                      <TrajectorySpark data={d.data} color={d.color} width={180} height={26} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ===== Streak health ===== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold">Streak Health</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{streakSummary.active}</p>
              <p className="text-[10px] text-muted-foreground mt-1">active streaks</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{streakSummary.currentLongest}</p>
              <p className="text-[10px] text-muted-foreground mt-1">current longest</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{streakSummary.everLongest}</p>
              <p className="text-[10px] text-muted-foreground mt-1">longest ever</p>
            </div>
          </div>
          {(streakSummary.namedCurrent?.current || 0) > 0 && (
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Your strongest active streak:
              {" "}<span className="font-medium text-foreground">{streakSummary.namedCurrent!.name}</span>
              {" "}at {streakSummary.namedCurrent!.current} days.
              {streakSummary.namedEver && streakSummary.namedEver.longest > streakSummary.namedCurrent!.current && (
                <> Your personal best: <span className="font-medium text-foreground">{streakSummary.namedEver.name}</span> at {streakSummary.namedEver.longest} days.</>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== Biggest gains vs needs focus ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-semibold">Biggest areas of progress</p>
            </div>
            {focusAreas.topGains.length === 0 ? (
              <p className="text-xs text-muted-foreground">No dimension has clearly improved over the last 30 days yet.</p>
            ) : (
              <div className="space-y-2">
                {focusAreas.topGains.map(d => {
                  const Icon = d.icon
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 shrink-0", d.colorClass)} />
                      <p className="text-xs font-medium flex-1">{d.label}</p>
                      <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700">
                        +{d.delta} in 30d
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">Needs focus</p>
            </div>
            {focusAreas.needsFocus.length === 0 ? (
              <p className="text-xs text-muted-foreground">Every dimension is above 50. You are balanced — keep compounding.</p>
            ) : (
              <div className="space-y-2">
                {focusAreas.needsFocus.map(d => {
                  const Icon = d.icon
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 shrink-0", d.colorClass)} />
                      <p className="text-xs font-medium flex-1">{d.label}</p>
                      <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">
                        {Math.round(d.value)}/100
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== Biggest wins this quarter ===== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold">Biggest wins this quarter</p>
            <Badge variant="outline" className="text-[9px] ml-auto">last 90 days</Badge>
          </div>
          {quarterlyWins.length === 0 ? (
            <div className="py-6 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No wins logged yet this quarter.</p>
              <a href="/wins" className="text-xs text-amber-600 hover:underline mt-1 inline-block">Log your first win</a>
            </div>
          ) : (
            <div className="space-y-2">
              {quarterlyWins.map((w: any) => (
                <div key={w.id} className="flex items-start gap-2.5 rounded-lg border p-2.5">
                  <div className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    w.size === "big" ? "bg-amber-100 text-amber-600" :
                    w.size === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <Trophy className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug break-words">{w.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] capitalize">{w.category}</Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Goals & achievements summary ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 text-violet-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeGoals}</p>
            <p className="text-[10px] text-muted-foreground">active goals</p>
            {completedGoals > 0 && (
              <p className="text-[9px] text-emerald-600 mt-0.5">{completedGoals} completed all-time</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Award className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{achievementsEarned}<span className="text-xs text-muted-foreground">/{achievementsTotal}</span></p>
            <p className="text-[10px] text-muted-foreground">achievements</p>
            <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${achievementsPct}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Activity className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{(local.wins || []).length}</p>
            <p className="text-[10px] text-muted-foreground">total wins logged</p>
            {(local.decisions || []).length > 0 && (
              <p className="text-[9px] text-blue-600 mt-0.5">{local.decisions.length} decisions journaled</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== Philosophy ===== */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Every number here comes from data you generated.</strong> No guesses, no surveys.
            The goal is not to max the score — it is to see yourself clearly. Small shifts compound. The
            dimension with the lowest score is usually the highest-leverage thing to work on next.
          </p>
        </CardContent>
      </Card>

      {/* Footer links */}
      <div className="flex gap-3 flex-wrap text-xs border-t pt-4">
        <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
        <a href="/timeline" className="text-purple-600 hover:underline">Timeline</a>
        <a href="/flourishing-score" className="text-emerald-600 hover:underline">Flourishing Score</a>
        <a href="/wins" className="text-amber-600 hover:underline">Wins</a>
        <a href="/goals" className="text-blue-600 hover:underline">Goals</a>
        <a href="/tools" className="text-slate-600 hover:underline">All Tools</a>
      </div>
    </div>
  )
}
