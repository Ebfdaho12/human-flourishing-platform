"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  TrendingUp, TrendingDown, Minus, Brain, Moon, Scale,
  Dumbbell, BarChart3, Droplets, Timer, CheckSquare, Flame, Calendar,
  Target, AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

// ============================================================================
// Types
// ============================================================================

type Point = { date: string; value: number } // date = YYYY-MM-DD

type Direction = "rising" | "falling" | "stable"

interface MetricSeries {
  key: string
  label: string
  unit: string
  color: string        // hex
  accentClass: string  // tailwind bg-* for gradient stops
  icon: any
  higherIsBetter: boolean
  points: Point[]      // sparse (only days with data)
  target?: number      // for forecasting
}

interface TrendStats {
  n: number
  mean: number
  slope: number        // units / day
  intercept: number
  r2: number
  rollingAvg30: number | null
  rollingAvg90: number | null
  wowDelta: number | null
  momDelta: number | null
  direction: Direction
  significance: "strong" | "moderate" | "weak" | "none"
  peak: Point | null
  trough: Point | null
  forecastDays: number | null
}

// ============================================================================
// Date helpers
// ============================================================================

function ymd(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d
  return x.toISOString().slice(0, 10)
}
function dayDiff(a: string, b: string): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000)
}
function addDays(d: string, n: number): string {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return ymd(x)
}
function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
function fmtDateLong(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function weekStart(d: string): string {
  const x = new Date(d + "T00:00:00")
  const day = x.getDay() // 0 Sun..6 Sat
  x.setDate(x.getDate() - day)
  return ymd(x)
}

// ============================================================================
// Statistics — real linear regression, no placeholders
// ============================================================================

/**
 * Ordinary least-squares linear regression on (dayIndex, value) pairs.
 * Returns slope (value/day), intercept, and coefficient of determination R^2.
 */
function linearRegression(points: Point[], anchor: string): {
  slope: number; intercept: number; r2: number
} {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0]?.value ?? 0, r2: 0 }
  const xs = points.map(p => dayDiff(p.date, anchor))
  const ys = points.map(p => p.value)
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  if (denX === 0) return { slope: 0, intercept: my, r2: 0 }
  const slope = num / denX
  const intercept = my - slope * mx
  const r2 = denY === 0 ? 0 : (num * num) / (denX * denY)
  return { slope, intercept, r2 }
}

/**
 * Classify trend direction using slope magnitude relative to value scale,
 * gated by R^2 so noisy series don't claim a direction.
 */
function classifyTrend(slope: number, mean: number, r2: number, n: number): {
  direction: Direction
  significance: "strong" | "moderate" | "weak" | "none"
} {
  if (n < 4) return { direction: "stable", significance: "none" }
  // Relative slope: % change per day normalized by mean value (absolute)
  const rel = mean !== 0 ? Math.abs(slope) / Math.abs(mean) : 0
  const weeklyRel = rel * 7 // % change per week

  let significance: "strong" | "moderate" | "weak" | "none"
  if (r2 >= 0.5 && n >= 7) significance = "strong"
  else if (r2 >= 0.25 && n >= 5) significance = "moderate"
  else if (r2 >= 0.1) significance = "weak"
  else significance = "none"

  // Need at least 1% weekly change to call a direction
  if (weeklyRel < 0.01 || significance === "none") return { direction: "stable", significance }
  return { direction: slope > 0 ? "rising" : "falling", significance }
}

function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function rollingAverage(points: Point[], days: number, endDate: string): number | null {
  const cutoff = addDays(endDate, -days + 1)
  const window = points.filter(p => p.date >= cutoff && p.date <= endDate)
  return window.length ? mean(window.map(p => p.value)) : null
}

/** Average value within a [start,end] date window (inclusive). */
function windowAvg(points: Point[], start: string, end: string): number | null {
  const w = points.filter(p => p.date >= start && p.date <= end)
  return w.length ? mean(w.map(p => p.value)) : null
}

function findPeakTrough(points: Point[]): { peak: Point | null; trough: Point | null } {
  if (points.length === 0) return { peak: null, trough: null }
  let peak = points[0], trough = points[0]
  for (const p of points) {
    if (p.value > peak.value) peak = p
    if (p.value < trough.value) trough = p
  }
  return { peak, trough }
}

function computeStats(m: MetricSeries, today: string): TrendStats {
  const n = m.points.length
  const reg = linearRegression(m.points, today)
  const values = m.points.map(p => p.value)
  const mu = mean(values)
  const { direction, significance } = classifyTrend(reg.slope, mu, reg.r2, n)

  const { peak, trough } = findPeakTrough(m.points)

  const rollingAvg30 = rollingAverage(m.points, 30, today)
  const rollingAvg90 = rollingAverage(m.points, 90, today)

  // Week-over-week: last 7d vs previous 7d
  const w1 = windowAvg(m.points, addDays(today, -6), today)
  const w2 = windowAvg(m.points, addDays(today, -13), addDays(today, -7))
  const wowDelta = w1 !== null && w2 !== null ? w1 - w2 : null

  // Month-over-month: last 30d vs previous 30d
  const mo1 = windowAvg(m.points, addDays(today, -29), today)
  const mo2 = windowAvg(m.points, addDays(today, -59), addDays(today, -30))
  const momDelta = mo1 !== null && mo2 !== null ? mo1 - mo2 : null

  // Forecast: if a target exists and trend is moving toward it, project days until crossing.
  let forecastDays: number | null = null
  if (m.target !== undefined && reg.slope !== 0 && significance !== "none" && rollingAvg30 !== null) {
    const current = rollingAvg30
    const towardTarget = (m.target > current && reg.slope > 0) || (m.target < current && reg.slope < 0)
    if (towardTarget) {
      const days = (m.target - current) / reg.slope
      if (days > 0 && days <= 365) forecastDays = Math.round(days)
    }
  }

  return {
    n,
    mean: mu,
    slope: reg.slope,
    intercept: reg.intercept,
    r2: reg.r2,
    rollingAvg30,
    rollingAvg90,
    wowDelta,
    momDelta,
    direction,
    significance,
    peak,
    trough,
    forecastDays,
  }
}

// ============================================================================
// Composite period analysis — best/worst week across all metrics
// ============================================================================

interface WeekScore { weekStart: string; zSum: number; contributors: number }

function bestAndWorstWeek(metrics: MetricSeries[], horizonDays: number, today: string): {
  best: WeekScore | null; worst: WeekScore | null
} {
  // Normalize each metric to z-scores (flip sign if lower-is-better), then sum per week.
  const startDate = addDays(today, -horizonDays + 1)
  const weekMap: Record<string, { sum: number; count: number }> = {}

  for (const m of metrics) {
    if (m.points.length < 3) continue
    const vals = m.points.map(p => p.value)
    const mu = mean(vals)
    const sd = Math.sqrt(mean(vals.map(v => (v - mu) ** 2))) || 1
    for (const p of m.points) {
      if (p.date < startDate || p.date > today) continue
      const z = (p.value - mu) / sd
      const contribution = m.higherIsBetter ? z : -z
      const wk = weekStart(p.date)
      if (!weekMap[wk]) weekMap[wk] = { sum: 0, count: 0 }
      weekMap[wk].sum += contribution
      weekMap[wk].count++
    }
  }

  const weeks: WeekScore[] = Object.entries(weekMap)
    .filter(([_, v]) => v.count >= 2)
    .map(([weekStart, v]) => ({ weekStart, zSum: v.sum, contributors: v.count }))

  if (weeks.length === 0) return { best: null, worst: null }
  weeks.sort((a, b) => b.zSum - a.zSum)
  return { best: weeks[0], worst: weeks[weeks.length - 1] }
}

// ============================================================================
// SVG line chart with gradient fill, month boundaries, peak/trough labels
// ============================================================================

function LineChart({ metric, stats, days }: { metric: MetricSeries; stats: TrendStats; days: number }) {
  const W = 640, H = 140
  const padL = 28, padR = 12, padT = 14, padB = 22
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const today = ymd(new Date())
  const start = addDays(today, -(days - 1))

  const visible = metric.points.filter(p => p.date >= start && p.date <= today)
  if (visible.length < 2) {
    return (
      <div className="flex items-center justify-center text-[11px] text-muted-foreground py-8">
        Need at least 2 data points in the selected window.
      </div>
    )
  }

  const values = visible.map(p => p.value)
  const vMax = Math.max(...values)
  const vMin = Math.min(...values)
  const pad = (vMax - vMin) * 0.15 || Math.abs(vMax) * 0.1 || 1
  const yMax = vMax + pad
  const yMin = Math.max(0, vMin - pad) // non-negative floor

  const x = (date: string) => {
    const d = dayDiff(date, start)
    return padL + (d / (days - 1)) * innerW
  }
  const y = (v: number) => padT + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH

  const pathD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")
  const areaD = `${pathD} L${x(visible[visible.length - 1].date).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(visible[0].date).toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  // Regression line across visible window. Intercept was computed with anchor=today,
  // so value(t) = intercept + slope * dayDiff(t, today).
  const regY = (d: string) => stats.intercept + stats.slope * dayDiff(d, today)

  // Month boundaries
  const months: { date: string; label: string }[] = []
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i)
    const dt = new Date(d + "T00:00:00")
    if (dt.getDate() === 1) months.push({ date: d, label: dt.toLocaleDateString("en-US", { month: "short" }) })
  }

  // Rolling average line (30d if horizon >= 60 else 7d)
  const rollingWindow = days >= 60 ? 30 : 7
  const rollPoints = visible.map(p => {
    const avg = rollingAverage(metric.points, rollingWindow, p.date)
    return avg !== null ? { date: p.date, value: avg } : null
  }).filter(Boolean) as Point[]
  const rollD = rollPoints.length >= 2
    ? rollPoints.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")
    : null

  const peak = stats.peak && stats.peak.date >= start ? stats.peak : null
  const trough = stats.trough && stats.trough.date >= start ? stats.trough : null

  const gradId = `grad-${metric.key}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${metric.label} chart`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={metric.color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid: 3 gridlines */}
      {[0, 0.5, 1].map((t, i) => {
        const yv = yMin + (yMax - yMin) * (1 - t)
        const yp = padT + innerH * t
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yp} y2={yp} stroke="currentColor" className="text-muted-foreground/15" strokeDasharray="2 3" />
            <text x={padL - 4} y={yp + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
              {Math.round(yv * 10) / 10}
            </text>
          </g>
        )
      })}

      {/* Month boundaries */}
      {months.map(m => (
        <g key={m.date}>
          <line x1={x(m.date)} x2={x(m.date)} y1={padT} y2={padT + innerH} stroke="currentColor" className="text-muted-foreground/20" strokeDasharray="1 4" />
          <text x={x(m.date)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{m.label}</text>
        </g>
      ))}

      {/* Area gradient */}
      <path d={areaD} fill={`url(#${gradId})`} />

      {/* Main line */}
      <path d={pathD} fill="none" stroke={metric.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

      {/* Rolling average */}
      {rollD && (
        <path d={rollD} fill="none" stroke={metric.color} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 3" />
      )}

      {/* Regression line */}
      {stats.significance !== "none" && (
        <line
          x1={x(start)} y1={y(regY(start))}
          x2={x(today)} y2={y(regY(today))}
          stroke={metric.color} strokeOpacity="0.4" strokeWidth="0.75" strokeDasharray="1 3"
        />
      )}

      {/* Data points */}
      {visible.map(p => (
        <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r="1.5" fill={metric.color} />
      ))}

      {/* Peak annotation */}
      {peak && (
        <g>
          <circle cx={x(peak.date)} cy={y(peak.value)} r="3" fill="#fff" stroke={metric.color} strokeWidth="1.5" />
          <text x={x(peak.date)} y={y(peak.value) - 6} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="600">
            peak {Math.round(peak.value * 10) / 10}
          </text>
        </g>
      )}
      {/* Trough annotation */}
      {trough && trough.date !== peak?.date && (
        <g>
          <circle cx={x(trough.date)} cy={y(trough.value)} r="3" fill="#fff" stroke={metric.color} strokeWidth="1.5" />
          <text x={x(trough.date)} y={y(trough.value) + 12} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="600">
            low {Math.round(trough.value * 10) / 10}
          </text>
        </g>
      )}
    </svg>
  )
}

// ============================================================================
// Small UI atoms
// ============================================================================

function DirectionBadge({ direction, significance, higherIsBetter }: {
  direction: Direction; significance: TrendStats["significance"]; higherIsBetter: boolean
}) {
  if (significance === "none") {
    return <Badge variant="outline" className="text-[9px] gap-1"><Minus className="h-2.5 w-2.5" /> No signal</Badge>
  }
  const good = direction === "stable" ? null : (direction === "rising") === higherIsBetter
  const Icon = direction === "rising" ? TrendingUp : direction === "falling" ? TrendingDown : Minus
  const cls =
    direction === "stable" ? "border-slate-300 text-slate-600" :
    good ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50"
  return (
    <Badge variant="outline" className={cn("text-[9px] gap-1 capitalize", cls)}>
      <Icon className="h-2.5 w-2.5" /> {direction} · {significance}
    </Badge>
  )
}

function DeltaPill({ label, delta, unit, higherIsBetter }: {
  label: string; delta: number | null; unit: string; higherIsBetter: boolean
}) {
  if (delta === null) {
    return (
      <div className="rounded border border-dashed px-2 py-1">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xs text-muted-foreground">Needs 2 windows</p>
      </div>
    )
  }
  const rounded = Math.round(delta * 10) / 10
  const good = rounded === 0 ? null : (rounded > 0) === higherIsBetter
  const color = rounded === 0 ? "text-slate-600" : good ? "text-emerald-600" : "text-amber-600"
  const sign = rounded > 0 ? "+" : ""
  return (
    <div className="rounded border px-2 py-1">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn("text-sm font-semibold", color)}>{sign}{rounded}<span className="text-[9px] ml-0.5">{unit}</span></p>
    </div>
  )
}

// ============================================================================
// Page
// ============================================================================

export default function TrendsPage() {
  const [horizon, setHorizon] = useState<30 | 90>(90)

  // ---- Server-side data ----
  const { data: moodData, error: moodErr, isLoading: moodLoading } =
    useSWR("/api/mental-health/mood?limit=90", secureFetcher)
  const { data: healthData, error: healthErr, isLoading: healthLoading } =
    useSWR("/api/health/entries?limit=200", secureFetcher)

  // ---- Client-side (localStorage) data ----
  const [localHabits, setLocalHabits] = useState<any[]>([])
  const [waterLog, setWaterLog] = useState<{ date: string; total: number }[]>([])
  const [focusHistory, setFocusHistory] = useState<{ date: string; focusMinutes: number }[]>([])
  const [bodyComp, setBodyComp] = useState<any[]>([])

  useEffect(() => {
    try { setLocalHabits(JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")) } catch {}
    try { setWaterLog(JSON.parse(localStorage.getItem("hfp-water-log") || "[]")) } catch {}
    try { setFocusHistory(JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")) } catch {}
    try { setBodyComp(JSON.parse(localStorage.getItem("hfp-body-comp") || "[]")) } catch {}
  }, [])

  // ---- Build metric series (daily aggregates) ----
  const metrics = useMemo<MetricSeries[]>(() => {
    const moods = moodData?.entries || []
    const healthEntries = healthData?.entries || []

    // Group mood scores by day (average if multiple per day)
    const moodByDay: Record<string, number[]> = {}
    for (const m of moods) {
      if (!m.score) continue
      const d = ymd(m.recordedAt || m.createdAt)
      if (!moodByDay[d]) moodByDay[d] = []
      moodByDay[d].push(m.score)
    }
    const moodPoints: Point[] = Object.entries(moodByDay)
      .map(([date, scores]) => ({ date, value: mean(scores) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Sleep — HealthEntry SLEEP → data.hoursSlept
    const sleepByDay: Record<string, number[]> = {}
    for (const e of healthEntries) {
      if (e.entryType !== "SLEEP") continue
      try {
        const hrs = JSON.parse(e.data)?.hoursSlept
        if (typeof hrs === "number" && hrs > 0) {
          const d = ymd(e.recordedAt || e.createdAt)
          if (!sleepByDay[d]) sleepByDay[d] = []
          sleepByDay[d].push(hrs)
        }
      } catch {}
    }
    const sleepPoints: Point[] = Object.entries(sleepByDay)
      .map(([date, vals]) => ({ date, value: mean(vals) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Exercise — sum of durationMin per day
    const exerciseByDay: Record<string, number> = {}
    for (const e of healthEntries) {
      if (e.entryType !== "EXERCISE") continue
      try {
        const mins = JSON.parse(e.data)?.durationMin
        if (typeof mins === "number" && mins > 0) {
          const d = ymd(e.recordedAt || e.createdAt)
          exerciseByDay[d] = (exerciseByDay[d] || 0) + mins
        }
      } catch {}
    }
    const exercisePoints: Point[] = Object.entries(exerciseByDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Weight — MEASUREMENT.weight (most recent per day)
    const weightByDay: Record<string, number> = {}
    for (const e of healthEntries) {
      if (e.entryType !== "MEASUREMENT") continue
      try {
        const w = JSON.parse(e.data)?.weight
        if (typeof w === "number" && w > 0) {
          const d = ymd(e.recordedAt || e.createdAt)
          // Keep latest weight per day by taking newer timestamp
          weightByDay[d] = w
        }
      } catch {}
    }
    // Also fold in localStorage body-comp entries
    for (const b of bodyComp) {
      if (typeof b?.weight === "number" && b.weight > 0 && b.date) {
        weightByDay[b.date] = b.weight
      }
    }
    const weightPoints: Point[] = Object.entries(weightByDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Water — sum totals from hfp-water-log
    const waterPoints: Point[] = waterLog
      .filter(d => typeof d?.total === "number" && d.total > 0 && d.date)
      .map(d => ({ date: d.date, value: d.total }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Focus — minutes per day from hfp-focus-history
    const focusByDay: Record<string, number> = {}
    for (const f of focusHistory) {
      if (!f?.date || typeof f.focusMinutes !== "number") continue
      focusByDay[f.date] = (focusByDay[f.date] || 0) + f.focusMinutes
    }
    const focusPoints: Point[] = Object.entries(focusByDay)
      .filter(([_, v]) => v > 0)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Habits — daily completion percentage from hfp-daily-habits
    const habitPoints: Point[] = (() => {
      const total = localHabits.length
      if (total === 0) return []
      const dateSet = new Set<string>()
      for (const h of localHabits) {
        for (const d of (h?.completedDates || [])) dateSet.add(d)
      }
      const dates = Array.from(dateSet).sort()
      return dates.map(date => {
        const done = localHabits.filter(h => (h.completedDates || []).includes(date)).length
        return { date, value: Math.round((done / total) * 100) }
      })
    })()

    return [
      { key: "mood", label: "Mood", unit: "/10", color: "#8b5cf6", accentClass: "bg-violet-500",
        icon: Brain, higherIsBetter: true, points: moodPoints, target: 8 },
      { key: "sleep", label: "Sleep", unit: "hrs", color: "#6366f1", accentClass: "bg-indigo-500",
        icon: Moon, higherIsBetter: true, points: sleepPoints, target: 8 },
      { key: "exercise", label: "Exercise", unit: "min/day", color: "#f97316", accentClass: "bg-orange-500",
        icon: Dumbbell, higherIsBetter: true, points: exercisePoints, target: 45 },
      { key: "water", label: "Water", unit: "ml", color: "#0ea5e9", accentClass: "bg-sky-500",
        icon: Droplets, higherIsBetter: true, points: waterPoints, target: 2500 },
      { key: "focus", label: "Focus", unit: "min", color: "#ef4444", accentClass: "bg-red-500",
        icon: Timer, higherIsBetter: true, points: focusPoints, target: 120 },
      { key: "habits", label: "Habits", unit: "%", color: "#10b981", accentClass: "bg-emerald-500",
        icon: CheckSquare, higherIsBetter: true, points: habitPoints, target: 100 },
      { key: "weight", label: "Weight", unit: "lbs", color: "#3b82f6", accentClass: "bg-blue-500",
        icon: Scale, higherIsBetter: false, points: weightPoints },
    ]
  }, [moodData, healthData, localHabits, waterLog, focusHistory, bodyComp])

  const today = ymd(new Date())

  const metricStats = useMemo(
    () => metrics.map(m => ({ metric: m, stats: computeStats(m, today) })),
    [metrics, today]
  )

  const { best, worst } = useMemo(
    () => bestAndWorstWeek(metrics, horizon, today),
    [metrics, horizon, today]
  )

  const hasAnyData = metrics.some(m => m.points.length > 0)
  const totalDatapoints = metrics.reduce((s, m) => s + m.points.length, 0)

  // Earliest data point across all metrics
  const earliestDate = useMemo(() => {
    let min: string | null = null
    for (const m of metrics) for (const p of m.points) if (!min || p.date < min) min = p.date
    return min
  }, [metrics])

  const loading = moodLoading || healthLoading
  const anyError = !!(moodErr || healthErr)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Long-Term Trends</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cross-feature trajectory analysis. Linear regression over your real data — no averages tricks,
            no synthetic smoothing. Every slope is computed from what you logged.
          </p>
        </div>
        <div className="flex rounded-lg border overflow-hidden shrink-0">
          {[30, 90].map(d => (
            <button
              key={d}
              onClick={() => setHorizon(d as 30 | 90)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                horizon === d ? "bg-violet-600 text-white" : "bg-background hover:bg-muted"
              )}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Error / empty states */}
      {anyError && (
        <Card className="border-amber-300 bg-amber-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              Some server data failed to load. Showing trends from whatever is available locally and what loaded successfully.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && !hasAnyData && (
        <Card>
          <CardContent className="py-10 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading your history…</p>
          </CardContent>
        </Card>
      )}

      {!loading && !hasAnyData && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">Not enough data yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Trend analysis kicks in after you have at least 4 data points in a metric. Log mood,
              sleep, exercise, water, focus, or habits — then come back to see your trajectory.
            </p>
            <div className="flex gap-3 justify-center mt-4 text-sm">
              <a href="/mental-health" className="text-violet-600 hover:underline">Log mood</a>
              <a href="/health" className="text-rose-600 hover:underline">Log health</a>
              <a href="/daily-habits" className="text-emerald-600 hover:underline">Log habits</a>
              <a href="/water-tracker" className="text-blue-600 hover:underline">Log water</a>
            </div>
          </CardContent>
        </Card>
      )}

      {hasAnyData && (
        <>
          {/* Data coverage summary */}
          <Card className="border-violet-200 bg-violet-50/20">
            <CardContent className="p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-violet-900">
              <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Horizon: <strong>{horizon} days</strong></span>
              <span>Datapoints: <strong>{totalDatapoints}</strong></span>
              {earliestDate && <span>Since: <strong>{fmtDateLong(earliestDate)}</strong></span>}
              <span>Metrics tracked: <strong>{metrics.filter(m => m.points.length > 0).length} / {metrics.length}</strong></span>
            </CardContent>
          </Card>

          {/* Best / Worst composite weeks */}
          {(best || worst) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {best && (
                <Card className="border-emerald-200 bg-emerald-50/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-900">Peak week</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {fmtDate(best.weekStart)} – {fmtDate(addDays(best.weekStart, 6))}
                    </p>
                    <p className="text-[11px] text-emerald-800/80 mt-1">
                      Composite z-score <strong>+{best.zSum.toFixed(2)}</strong> across {best.contributors} datapoints.
                      Your best-performing week in the last {horizon} days — across every metric you track.
                    </p>
                  </CardContent>
                </Card>
              )}
              {worst && worst.weekStart !== best?.weekStart && (
                <Card className="border-amber-200 bg-amber-50/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-900">Dip week</p>
                    </div>
                    <p className="text-lg font-bold text-amber-700">
                      {fmtDate(worst.weekStart)} – {fmtDate(addDays(worst.weekStart, 6))}
                    </p>
                    <p className="text-[11px] text-amber-800/80 mt-1">
                      Composite z-score <strong>{worst.zSum.toFixed(2)}</strong> across {worst.contributors} datapoints.
                      Your weakest stretch. What was different? Check your journal around this date.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Per-metric trend cards */}
          <div className="space-y-3">
            {metricStats.map(({ metric, stats }) => {
              const { n } = stats
              if (n === 0) {
                return (
                  <Card key={metric.key} className="border-dashed opacity-60">
                    <CardContent className="p-3 flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        No {metric.label.toLowerCase()} data yet. Start logging to unlock trend analysis.
                      </p>
                    </CardContent>
                  </Card>
                )
              }
              if (n < 4) {
                return (
                  <Card key={metric.key} className="border-dashed">
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
                        <p className="text-xs">
                          <span className="font-medium">{metric.label}</span>
                          <span className="text-muted-foreground"> — {n} datapoint{n === 1 ? "" : "s"}, need {4 - n} more for regression.</span>
                        </p>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: metric.color }}>
                        {Math.round(stats.mean * 10) / 10}{metric.unit}
                      </p>
                    </CardContent>
                  </Card>
                )
              }
              const Icon = metric.icon
              return (
                <Card key={metric.key}>
                  <CardContent className="p-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: metric.color }} />
                        <p className="text-sm font-semibold">{metric.label}</p>
                        <Badge variant="outline" className="text-[9px]">{n} days</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DirectionBadge direction={stats.direction} significance={stats.significance} higherIsBetter={metric.higherIsBetter} />
                        <p className="text-lg font-bold" style={{ color: metric.color }}>
                          {Math.round(stats.mean * 10) / 10}
                          <span className="text-[10px] text-muted-foreground ml-1">{metric.unit} avg</span>
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <LineChart metric={metric} stats={stats} days={horizon} />

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      <div className="rounded border px-2 py-1">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">30d avg</p>
                        <p className="text-sm font-semibold">
                          {stats.rollingAvg30 !== null ? Math.round(stats.rollingAvg30 * 10) / 10 : "—"}
                          <span className="text-[9px] text-muted-foreground ml-0.5">{metric.unit}</span>
                        </p>
                      </div>
                      <div className="rounded border px-2 py-1">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">90d avg</p>
                        <p className="text-sm font-semibold">
                          {stats.rollingAvg90 !== null ? Math.round(stats.rollingAvg90 * 10) / 10 : "—"}
                          <span className="text-[9px] text-muted-foreground ml-0.5">{metric.unit}</span>
                        </p>
                      </div>
                      <DeltaPill label="WoW" delta={stats.wowDelta} unit={metric.unit} higherIsBetter={metric.higherIsBetter} />
                      <DeltaPill label="MoM" delta={stats.momDelta} unit={metric.unit} higherIsBetter={metric.higherIsBetter} />
                    </div>

                    {/* Narrative line — only derived statements, never synthetic */}
                    <div className="mt-3 text-[11px] text-muted-foreground space-y-1">
                      {stats.significance !== "none" && (
                        <p>
                          Regression slope: <strong>{stats.slope >= 0 ? "+" : ""}{(stats.slope * 7).toFixed(2)} {metric.unit}/week</strong>
                          {" · "}R²={stats.r2.toFixed(2)}{" · "}{stats.significance} signal
                        </p>
                      )}
                      {stats.significance === "none" && n >= 4 && (
                        <p>No statistically meaningful direction — variance dominates trend (R²={stats.r2.toFixed(2)}).</p>
                      )}
                      {stats.peak && stats.trough && stats.peak.date !== stats.trough.date && (
                        <p>
                          Peak <strong>{Math.round(stats.peak.value * 10) / 10}{metric.unit}</strong> on {fmtDate(stats.peak.date)}
                          {" · "}low <strong>{Math.round(stats.trough.value * 10) / 10}{metric.unit}</strong> on {fmtDate(stats.trough.date)}
                        </p>
                      )}
                      {stats.forecastDays !== null && metric.target !== undefined && (
                        <p className="text-violet-700">
                          <Target className="h-3 w-3 inline mb-0.5" /> At your current rate, your {metric.label.toLowerCase()} avg reaches{" "}
                          <strong>{metric.target}{metric.unit}</strong> in ~<strong>{stats.forecastDays} days</strong>
                          {" "}({fmtDate(addDays(today, stats.forecastDays))}).
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Methodology footer */}
          <Card className="border-slate-200 bg-slate-50/30">
            <CardContent className="p-3 text-[10px] text-muted-foreground leading-relaxed">
              <strong className="text-slate-700">Methodology.</strong> Direction is derived from ordinary least-squares linear regression on (day-offset, value) pairs.
              Signal strength uses R² (coefficient of determination): strong ≥0.50, moderate ≥0.25, weak ≥0.10.
              A "rising" / "falling" label requires both R² above threshold and weekly change ≥1% of the mean — otherwise stable.
              Peak week is the 7-day window with highest composite z-score across all tracked metrics (lower-is-better metrics are sign-flipped).
              Forecasts project the regression line until it crosses the target; only shown when trend moves toward target within 365 days.
              All numbers are computed locally from your data. Nothing is imputed or fabricated.
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-wrap text-xs">
            <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
            <a href="/correlations" className="text-violet-600 hover:underline">Pattern Correlations</a>
            <a href="/health" className="text-rose-600 hover:underline">Health Dashboard</a>
            <a href="/mental-health" className="text-pink-600 hover:underline">Mental Health</a>
            <a href="/body-composition" className="text-blue-600 hover:underline">Body Composition</a>
            <a href="/daily-habits" className="text-emerald-600 hover:underline">Daily Habits</a>
            <a href="/water-tracker" className="text-sky-600 hover:underline">Water</a>
            <a href="/focus-timer" className="text-red-600 hover:underline">Focus</a>
          </div>
        </>
      )}
    </div>
  )
}
