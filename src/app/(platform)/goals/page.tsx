"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  Target, Heart, GraduationCap, CheckCircle, Circle, Clock, Trophy, Flame,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, Link2, Calendar,
  Brain, Dumbbell, Moon, Droplets, CheckSquare, Crown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000
const MS_PER_WEEK = MS_PER_DAY * 7
const STALLED_DAYS = 14
const SPARK_WEEKS = 12

const DIMENSION: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  HEALTH: { label: "Health", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  EDUCATION: { label: "Mind", icon: Brain, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  FITNESS: { label: "Fitness", icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  SLEEP: { label: "Sleep", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
  HYDRATION: { label: "Hydration", icon: Droplets, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" },
  HABITS: { label: "Habits", icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
}

// Map HealthGoal.goalType to a finer-grained dimension
function dimensionOf(goal: GoalRecord): keyof typeof DIMENSION {
  if (goal.module === "EDUCATION") return "EDUCATION"
  const t = (goal.type || "").toUpperCase()
  if (t.includes("SLEEP")) return "SLEEP"
  if (t.includes("WATER") || t.includes("HYDR")) return "HYDRATION"
  if (t.includes("EXERCISE") || t.includes("STEPS") || t.includes("WEIGHT")) return "FITNESS"
  return "HEALTH"
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GoalRecord = {
  id: string
  module: "HEALTH" | "EDUCATION" | string
  type: string
  title: string
  target: string
  progress: number
  isActive: boolean
  completedAt: string | null
  deadline: string | null
  createdAt: string
}

type GoalsResponse = {
  goals: GoalRecord[]
  active: number
  completed: number
  total: number
}

type ProgressPoint = { t: number; p: number } // timestamp ms, progress 0-100
type ProgressHistory = Record<string, ProgressPoint[]>

type HealthEntry = {
  id: string
  entryType: string
  data: string
  recordedAt: string
  createdAt: string
}

type Habit = {
  id: string
  name: string
  icon?: string
  streak?: number
  completedDates: string[]
  createdAt?: string
  linkedGoalId?: string
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then(r => r.json())

function isoDate(d: Date): string { return d.toISOString().slice(0, 10) }
function daysBetween(a: number, b: number): number { return Math.floor((a - b) / MS_PER_DAY) }

function fmtDate(ts: number | string | null | undefined): string {
  if (!ts) return "—"
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

// Derive a metric-link hint from goal title. Auto-reads matching metric.
function detectMetricLink(title: string): { kind: "sleep" | "exercise" | "water" | null; targetValue?: number } {
  const t = title.toLowerCase()
  const numMatch = t.match(/(\d+(?:\.\d+)?)/)
  const n = numMatch ? parseFloat(numMatch[1]) : undefined
  if (/sleep|hrs?.*sleep|hours.*bed/.test(t)) return { kind: "sleep", targetValue: n }
  if (/water|hydrat|litres?|liters?|ml/.test(t)) return { kind: "water", targetValue: n }
  if (/exercise|workout|gym|run|lift|steps?/.test(t)) return { kind: "exercise", targetValue: n }
  return { kind: null }
}

// Compute velocity (progress points per week) from progress history over last 4 weeks.
function computeVelocity(history: ProgressPoint[]): number {
  if (history.length < 2) return 0
  const cutoff = Date.now() - 4 * MS_PER_WEEK
  const window = history.filter(p => p.t >= cutoff).sort((a, b) => a.t - b.t)
  if (window.length < 2) {
    // Fall back to whole history
    const sorted = [...history].sort((a, b) => a.t - b.t)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const weeks = Math.max((last.t - first.t) / MS_PER_WEEK, 1 / 7)
    return (last.p - first.p) / weeks
  }
  const first = window[0]
  const last = window[window.length - 1]
  const weeks = Math.max((last.t - first.t) / MS_PER_WEEK, 1 / 7)
  return (last.p - first.p) / weeks
}

// Build a 12-week sparkline — one data point per ISO week using the last recorded progress in that week.
function buildSparkline(history: ProgressPoint[], currentProgress: number): number[] {
  const points: number[] = []
  const now = Date.now()
  let lastKnown = 0
  // Sort ascending
  const sorted = [...history].sort((a, b) => a.t - b.t)
  let idx = 0
  for (let wk = SPARK_WEEKS - 1; wk >= 0; wk--) {
    const weekEnd = now - wk * MS_PER_WEEK
    while (idx < sorted.length && sorted[idx].t <= weekEnd) {
      lastKnown = sorted[idx].p
      idx++
    }
    points.push(lastKnown)
  }
  // If no history at all, at least show current progress as the last point
  if (sorted.length === 0 && currentProgress > 0) {
    points[points.length - 1] = currentProgress
  } else if (points[points.length - 1] !== currentProgress && currentProgress > lastKnown) {
    points[points.length - 1] = currentProgress
  }
  return points
}

// Project ETA from velocity. Returns null if no ETA possible.
function computeETA(progress: number, velocity: number): { days: number; date: number } | null {
  if (progress >= 100) return null
  if (velocity <= 0) return null
  const weeksToGo = (100 - progress) / velocity
  const days = Math.round(weeksToGo * 7)
  return { days, date: Date.now() + days * MS_PER_DAY }
}

// Is the goal on track for a 90-day quarterly pace?
function quarterlyPace(createdAt: string, progress: number, velocity: number): {
  required: number // progress needed per week to finish in 90d of creation
  actual: number // current velocity
  status: "ahead" | "ontrack" | "behind" | "complete" | "unknown"
} {
  if (progress >= 100) return { required: 0, actual: velocity, status: "complete" }
  const created = new Date(createdAt).getTime()
  const deadline = created + 90 * MS_PER_DAY
  const weeksLeft = (deadline - Date.now()) / MS_PER_WEEK
  if (weeksLeft <= 0) return { required: Infinity, actual: velocity, status: "behind" }
  const required = (100 - progress) / weeksLeft
  if (velocity >= required * 1.15) return { required, actual: velocity, status: "ahead" }
  if (velocity >= required * 0.85) return { required, actual: velocity, status: "ontrack" }
  if (velocity <= 0) return { required, actual: velocity, status: "unknown" }
  return { required, actual: velocity, status: "behind" }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { data } = useSWR<GoalsResponse>("/api/goals/all", fetcher)
  const { data: healthData } = useSWR<{ entries: HealthEntry[] }>("/api/health/entries?limit=200", fetcher)

  const [progressHistory, setProgressHistory] = useState<ProgressHistory>({})
  const [habits, setHabits] = useState<Habit[]>([])
  const [waterLog, setWaterLog] = useState<Array<{ date: string; amount: number }>>([])
  const [hydrated, setHydrated] = useState(false)

  // Load local data
  useEffect(() => {
    setProgressHistory(safeParse<ProgressHistory>(localStorage.getItem("hfp-goal-history"), {}))
    setHabits(safeParse<Habit[]>(localStorage.getItem("hfp-daily-habits"), []))
    setWaterLog(safeParse<Array<{ date: string; amount: number }>>(localStorage.getItem("hfp-water-log"), []))
    setHydrated(true)
  }, [])

  // Append today's snapshot for each goal so velocity becomes computable over time.
  useEffect(() => {
    if (!data?.goals || !hydrated) return
    const now = Date.now()
    const today = isoDate(new Date(now))
    const next: ProgressHistory = { ...progressHistory }
    let changed = false
    for (const g of data.goals) {
      const list = next[g.id] ? [...next[g.id]] : []
      // Seed with createdAt at 0% if missing
      if (list.length === 0) {
        const created = new Date(g.createdAt).getTime()
        list.push({ t: created, p: 0 })
        changed = true
      }
      const last = list[list.length - 1]
      const lastDay = isoDate(new Date(last.t))
      // Log a daily snapshot if progress changed OR if day rolled over
      if (lastDay !== today || last.p !== g.progress) {
        list.push({ t: now, p: g.progress })
        changed = true
      }
      // Cap history at 1 year
      const cutoff = now - 365 * MS_PER_DAY
      const trimmed = list.filter(p => p.t >= cutoff)
      next[g.id] = trimmed
    }
    if (changed) {
      setProgressHistory(next)
      try { localStorage.setItem("hfp-goal-history", JSON.stringify(next)) } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.goals, hydrated])

  // ─── Auto-metric sync: find goals whose title implies a tracked metric ─────
  const autoMetrics = useMemo(() => {
    const entries = healthData?.entries ?? []
    const today = isoDate(new Date())
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return isoDate(d)
    })

    // Avg sleep over last 7 days
    const sleepValues = entries
      .filter(e => e.entryType === "SLEEP")
      .map(e => {
        try {
          const payload = JSON.parse(e.data || "{}")
          return { date: isoDate(new Date(e.recordedAt)), hours: Number(payload.hoursSlept) || 0 }
        } catch { return { date: "", hours: 0 } }
      })
      .filter(v => v.hours > 0 && last7.includes(v.date))
    const avgSleep = sleepValues.length
      ? sleepValues.reduce((s, v) => s + v.hours, 0) / sleepValues.length
      : null

    // Exercise count last 7 days
    const exerciseCount = entries.filter(e => {
      if (e.entryType !== "EXERCISE") return false
      const d = isoDate(new Date(e.recordedAt))
      return last7.includes(d)
    }).length

    // Water today (ml)
    const waterToday = waterLog
      .filter(w => w.date === today)
      .reduce((s, w) => s + (w.amount || 0), 0)

    return { avgSleep, exerciseCount, waterToday }
  }, [healthData?.entries, waterLog])

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading goals...</div>

  const allGoals = data.goals
  const activeGoals = allGoals.filter(g => g.isActive && !g.completedAt)
  const completedGoals = allGoals.filter(g => !!g.completedAt)
  const inactiveGoals = allGoals.filter(g => !g.isActive && !g.completedAt)

  // ─── Enrich active goals with analytics ───────────────────────────────────
  const enriched = activeGoals.map(g => {
    const history = progressHistory[g.id] ?? []
    const velocity = computeVelocity(history)
    const eta = computeETA(g.progress, velocity)
    const sparkline = buildSparkline(history, g.progress)
    const pace = quarterlyPace(g.createdAt, g.progress, velocity)

    // Last progress change for stalled detection
    const sortedAsc = [...history].sort((a, b) => a.t - b.t)
    const nonZero = sortedAsc.filter((p, i) => i === 0 || p.p !== sortedAsc[i - 1].p)
    const lastChangeTs = nonZero.length ? nonZero[nonZero.length - 1].t : new Date(g.createdAt).getTime()
    const daysSinceMove = daysBetween(Date.now(), lastChangeTs)
    const stalled = daysSinceMove >= STALLED_DAYS && g.progress < 100

    // Linked habits (matches by title substring — a habit's name appears in the goal's title)
    const linkedHabits = habits.filter(h => {
      if (h.linkedGoalId === g.id) return true
      const hn = (h.name || "").toLowerCase().trim()
      if (hn.length < 3) return false
      return g.title.toLowerCase().includes(hn)
    })

    // Metric link — auto-read current value
    const link = detectMetricLink(g.title)
    let metricCurrent: number | null = null
    let metricLabel = ""
    if (link.kind === "sleep") {
      metricCurrent = autoMetrics.avgSleep
      metricLabel = "7-day avg sleep"
    } else if (link.kind === "exercise") {
      metricCurrent = autoMetrics.exerciseCount
      metricLabel = "7-day workouts"
    } else if (link.kind === "water") {
      metricCurrent = autoMetrics.waterToday / 1000 // ml → L
      metricLabel = "today's intake (L)"
    }

    const dim = dimensionOf(g)

    return { g, history, velocity, eta, sparkline, pace, stalled, daysSinceMove, linkedHabits, link, metricCurrent, metricLabel, dim }
  })

  // Priority ranking: urgency (deadline proximity) + momentum (low velocity = higher priority)
  const ranked = [...enriched].sort((a, b) => {
    const urgencyA = a.g.deadline ? Math.max(0, (new Date(a.g.deadline).getTime() - Date.now()) / MS_PER_DAY) : 180
    const urgencyB = b.g.deadline ? Math.max(0, (new Date(b.g.deadline).getTime() - Date.now()) / MS_PER_DAY) : 180
    const scoreA = urgencyA - (a.stalled ? 30 : 0) - a.g.progress * 0.2
    const scoreB = urgencyB - (b.stalled ? 30 : 0) - b.g.progress * 0.2
    return scoreA - scoreB
  })
  const topThreeIds = new Set(ranked.slice(0, 3).map(e => e.g.id))

  // ─── Distribution by dimension ────────────────────────────────────────────
  const distribution = activeGoals.reduce<Record<string, number>>((acc, g) => {
    const key = dimensionOf(g)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // ─── Aggregate stats ──────────────────────────────────────────────────────
  const stalledCount = enriched.filter(e => e.stalled).length
  const onTrackCount = enriched.filter(e => e.pace.status === "ontrack" || e.pace.status === "ahead").length
  const behindCount = enriched.filter(e => e.pace.status === "behind").length
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0
  const totalVelocity = enriched.reduce((s, e) => s + Math.max(0, e.velocity), 0)
  const weeklyPacePct = Math.round(totalVelocity * 10) / 10

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Goals</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Momentum, pace, and projection across every goal you&apos;re pursuing.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-amber-600" />
            <p className="text-xl font-bold">{data.active}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
            <p className="text-xl font-bold">{data.completed}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "border",
          stalledCount > 0 ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200" : "bg-muted/30",
        )}>
          <CardContent className="p-3 text-center">
            <AlertTriangle className={cn("h-4 w-4 mx-auto mb-1", stalledCount > 0 ? "text-red-600" : "text-muted-foreground")} />
            <p className="text-xl font-bold">{stalledCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stalled ({STALLED_DAYS}d+)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
          <CardContent className="p-3 text-center">
            <Zap className="h-4 w-4 mx-auto mb-1 text-violet-600" />
            <p className="text-xl font-bold">{weeklyPacePct}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pts/week pace</p>
          </CardContent>
        </Card>
      </div>

      {/* Pace summary */}
      {activeGoals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-semibold">Quarterly Pace</p>
              <span className="text-xs text-muted-foreground ml-auto">{avgProgress}% avg progress</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <PaceTile label="On track / ahead" count={onTrackCount} total={activeGoals.length} tone="emerald" />
              <PaceTile label="Behind pace" count={behindCount} total={activeGoals.length} tone="amber" />
              <PaceTile label="Insufficient data" count={activeGoals.length - onTrackCount - behindCount} total={activeGoals.length} tone="slate" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dimension distribution */}
      {Object.keys(distribution).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-semibold">Distribution by Life Dimension</p>
            </div>
            <div className="space-y-2">
              {Object.entries(distribution)
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => {
                  const d = DIMENSION[key] ?? DIMENSION.HEALTH
                  const Icon = d.icon
                  const pct = Math.round((count / activeGoals.length) * 100)
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={cn("flex items-center gap-1.5 w-24 shrink-0", d.color)}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{d.label}</span>
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", d.color.replace("text-", "bg-"))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right tabular-nums">{count}</span>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 priority goals */}
      {ranked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Top Priorities</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">Ranked by urgency × momentum</span>
          </div>
          <div className="space-y-3">
            {ranked.slice(0, 3).map(entry => (
              <GoalCard key={entry.g.id} entry={entry} emphasized />
            ))}
          </div>
        </div>
      )}

      {/* Other active goals */}
      {ranked.length > 3 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Other Active Goals ({ranked.length - 3})
          </h2>
          <div className="space-y-2">
            {ranked.slice(3).map(entry => (
              <GoalCard key={entry.g.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Completed
          </h2>
          <div className="space-y-2">
            {completedGoals.map(g => (
              <CompletedRow key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* Paused */}
      {inactiveGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Paused ({inactiveGoals.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {inactiveGoals.map(g => (
              <CompletedRow key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.total === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Set goals in any module to see them here.</p>
            <div className="flex justify-center gap-3 mt-4">
              <a href="/health" className="text-sm text-rose-600 hover:underline">Health goals →</a>
              <a href="/education" className="text-sm text-blue-600 hover:underline">Learning goals →</a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Velocity computed from progress snapshots over the last 4 weeks. Sparklines show {SPARK_WEEKS}-week progress history.
        Completion ETA projects from current velocity — zero or negative velocity means no ETA is shown.
        Quarterly pace compares current velocity against the rate needed to finish within 90 days of creation.
      </p>
    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

function PaceTile({ label, count, total, tone }: { label: string; count: number; total: number; tone: "emerald" | "amber" | "slate" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const toneCls =
    tone === "emerald" ? "border-emerald-200 bg-emerald-50/40 text-emerald-700"
    : tone === "amber" ? "border-amber-200 bg-amber-50/40 text-amber-700"
    : "border-slate-200 bg-slate-50/40 text-slate-600"
  return (
    <div className={cn("rounded-lg border p-2.5", toneCls)}>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{count}<span className="text-xs font-normal opacity-60 ml-1">/ {total}</span></p>
      <p className="text-[10px] mt-0.5">{pct}% of active</p>
    </div>
  )
}

function Sparkline({ data, color, width = 160, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) {
    return <div className="h-9 text-[10px] text-muted-foreground flex items-center">No history yet</div>
  }
  const max = 100
  const min = 0
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ")
  const areaPts = `0,${height} ${pts} ${width},${height}`
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={areaPts} fill={color} opacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null
        const cx = i * step
        const cy = height - ((v - min) / range) * (height - 4) - 2
        return <circle key={i} cx={cx} cy={cy} r={2.5} fill={color} />
      })}
    </svg>
  )
}

type EnrichedGoal = {
  g: GoalRecord
  history: ProgressPoint[]
  velocity: number
  eta: { days: number; date: number } | null
  sparkline: number[]
  pace: ReturnType<typeof quarterlyPace>
  stalled: boolean
  daysSinceMove: number
  linkedHabits: Habit[]
  link: ReturnType<typeof detectMetricLink>
  metricCurrent: number | null
  metricLabel: string
  dim: keyof typeof DIMENSION
}

function GoalCard({ entry, emphasized = false }: { entry: EnrichedGoal; emphasized?: boolean }) {
  const { g, velocity, eta, sparkline, pace, stalled, daysSinceMove, linkedHabits, link, metricCurrent, metricLabel, dim } = entry
  const d = DIMENSION[dim] ?? DIMENSION.HEALTH
  const Icon = d.icon
  const hexColor =
    dim === "HEALTH" ? "#f43f5e"
    : dim === "EDUCATION" ? "#3b82f6"
    : dim === "FITNESS" ? "#f97316"
    : dim === "SLEEP" ? "#6366f1"
    : dim === "HYDRATION" ? "#0ea5e9"
    : "#10b981"

  const velocityBadge = (() => {
    if (velocity > 0.5) return { icon: TrendingUp, label: `+${velocity.toFixed(1)} pts/wk`, cls: "text-emerald-600 border-emerald-200 bg-emerald-50" }
    if (velocity < -0.5) return { icon: TrendingDown, label: `${velocity.toFixed(1)} pts/wk`, cls: "text-red-600 border-red-200 bg-red-50" }
    return { icon: Minus, label: "flat", cls: "text-slate-500 border-slate-200 bg-slate-50" }
  })()
  const VIcon = velocityBadge.icon

  const paceBadge = (() => {
    switch (pace.status) {
      case "ahead": return { label: "Ahead of quarterly pace", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      case "ontrack": return { label: "On quarterly pace", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      case "behind": return { label: "Behind quarterly pace", cls: "text-amber-700 bg-amber-50 border-amber-200" }
      case "complete": return { label: "Complete", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      default: return { label: "Pace unknown", cls: "text-slate-600 bg-slate-50 border-slate-200" }
    }
  })()

  const daysToDeadline = g.deadline
    ? Math.round((new Date(g.deadline).getTime() - Date.now()) / MS_PER_DAY)
    : null

  return (
    <Card className={cn(
      "transition-shadow",
      emphasized && "border-2 shadow-sm",
      emphasized ? d.border : "",
      stalled && "ring-1 ring-red-200",
    )}>
      <CardContent className={cn("p-4", emphasized && d.bg + "/20")}>
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 shrink-0", d.color)}>
            <Icon className={cn(emphasized ? "h-5 w-5" : "h-4 w-4")} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={cn("font-medium", emphasized ? "text-sm" : "text-sm")}>{g.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Target: {g.target}
                  {daysToDeadline !== null && (
                    <> · Due {fmtDate(g.deadline)}{daysToDeadline >= 0 ? ` (${daysToDeadline}d)` : ` (overdue ${Math.abs(daysToDeadline)}d)`}</>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="outline" className="text-[9px] py-0 h-4">{d.label}</Badge>
                <Badge variant="outline" className={cn("text-[9px] py-0 h-4 flex items-center gap-0.5", velocityBadge.cls)}>
                  <VIcon className="h-2.5 w-2.5" />{velocityBadge.label}
                </Badge>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold tabular-nums">{g.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${g.progress}%`, backgroundColor: hexColor }}
                />
              </div>
            </div>

            {/* Analytics row */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sparkline */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Last {SPARK_WEEKS} weeks</p>
                <Sparkline data={sparkline} color={hexColor} />
              </div>
              {/* ETA + pace */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA:</span>
                  <span className="font-medium">
                    {eta ? `${eta.days}d · ${fmtDate(eta.date)}` : velocity <= 0 ? "No forward motion" : "—"}
                  </span>
                </div>
                <div className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]", paceBadge.cls)}>
                  <Calendar className="h-2.5 w-2.5" />{paceBadge.label}
                </div>
                {pace.status !== "complete" && pace.status !== "unknown" && isFinite(pace.required) && (
                  <p className="text-[10px] text-muted-foreground">
                    Need {pace.required.toFixed(1)} pts/wk · you&apos;re doing {Math.max(0, pace.actual).toFixed(1)}
                  </p>
                )}
              </div>
            </div>

            {/* Stalled warning */}
            {stalled && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50/60 px-2.5 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <p className="text-[11px] text-red-700">
                  Stalled — no progress for <span className="font-semibold">{daysSinceMove}</span> days. Consider breaking this down or re-anchoring.
                </p>
              </div>
            )}

            {/* Metric auto-read */}
            {link.kind && metricCurrent !== null && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/40 px-2.5 py-1.5">
                <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <p className="text-[11px] text-blue-800">
                  Live metric · {metricLabel}: <span className="font-semibold">{metricCurrent.toFixed(1)}</span>
                  {link.targetValue !== undefined && (
                    <> / target {link.targetValue}
                      {metricCurrent >= link.targetValue
                        ? <span className="ml-1 text-emerald-700">· met</span>
                        : <span className="ml-1 text-amber-700">· {(link.targetValue - metricCurrent).toFixed(1)} to go</span>}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Linked habits */}
            {linkedHabits.length > 0 && (
              <div className="mt-2 flex items-start gap-2">
                <Link2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Supported by</span>
                  {linkedHabits.map(h => (
                    <a
                      key={h.id}
                      href="/daily-habits"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      {h.icon && <span>{h.icon}</span>}
                      <span>{h.name}</span>
                      {typeof h.streak === "number" && h.streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600">
                          <Flame className="h-2.5 w-2.5" />{h.streak}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletedRow({ goal }: { goal: GoalRecord }) {
  const isComplete = !!goal.completedAt
  const dim = dimensionOf(goal)
  const d = DIMENSION[dim] ?? DIMENSION.HEALTH
  const Icon = d.icon
  return (
    <Card className={cn("border", isComplete && "border-emerald-200 bg-emerald-50/20")}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn("shrink-0", isComplete ? "text-emerald-500" : d.color)}>
            {isComplete ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn("text-sm", isComplete && "line-through text-muted-foreground")}>{goal.title}</p>
              <Badge variant="outline" className="text-[9px] py-0 h-4">{d.label}</Badge>
              <Icon className={cn("h-3 w-3", d.color)} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target: {goal.target}
              {isComplete && ` · Completed ${fmtDate(goal.completedAt)}`}
              {!isComplete && goal.deadline && ` · Due ${fmtDate(goal.deadline)}`}
            </p>
          </div>
          {!isComplete && goal.progress > 0 && (
            <div className="w-20 shrink-0">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", d.color.replace("text-", "bg-"))} style={{ width: `${goal.progress}%` }} />
              </div>
              <p className="text-[9px] text-right text-muted-foreground mt-0.5">{goal.progress}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
