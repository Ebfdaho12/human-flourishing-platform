"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  Moon, Sun, Calendar, Clock, TrendingUp, BarChart3, Sparkles,
  AlertTriangle, Dumbbell, Brain, Lightbulb, Droplets, CheckSquare,
  Heart, Timer, Activity, RefreshCcw, Info, Flame,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { Explain } from "@/components/ui/explain"

/**
 * Correlations — personal insights dashboard.
 *
 * This page fuses three data sources:
 *   1. Server-side metrics (mood, sleep, exercise) from the GET /api/correlations endpoint.
 *   2. Client-side metrics (water, habits, gratitude, focus) read from localStorage.
 *   3. Deep Pearson analysis (same-day + lag) from POST /api/correlations, which
 *      receives the client-side day-bucketed data and joins it with server data.
 *
 * Design principles:
 *   - Every number shown is derived from real user data. No placeholders.
 *   - Insufficient-data states are explicit and actionable.
 *   - Significance tiers (strong / moderate / weak / noise) are shown for every r.
 *   - Visualizations are pure SVG, no external libraries.
 */

// ─── Icon registry for dynamic icon resolution from API payload ───────
const ICON_MAP: Record<string, any> = {
  Moon, Dumbbell, Droplets, CheckSquare, Timer, Heart, Brain,
}

// ─── Significance visual system ───────────────────────────────────────
const SIG_META: Record<string, { label: string; dot: string; text: string; ring: string }> = {
  strong:   { label: "Strong signal",   dot: "bg-emerald-500",  text: "text-emerald-700",  ring: "border-emerald-200 bg-emerald-50/40" },
  moderate: { label: "Moderate signal", dot: "bg-blue-500",     text: "text-blue-700",     ring: "border-blue-200 bg-blue-50/40" },
  weak:     { label: "Weak signal",     dot: "bg-amber-500",    text: "text-amber-700",    ring: "border-amber-200 bg-amber-50/40" },
  noise:    { label: "Not enough data", dot: "bg-muted",        text: "text-muted-foreground", ring: "border-border bg-muted/20" },
}

const MOON_EMOJIS: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓",
  "Waxing Gibbous": "🌔", "Full Moon": "🌕", "Waning Gibbous": "🌖",
  "Last Quarter": "🌗", "Waning Crescent": "🌘",
}

const INSIGHT_ICONS: Record<string, any> = { positive: TrendingUp, warning: AlertTriangle, neutral: Lightbulb }
const INSIGHT_COLORS: Record<string, string> = {
  positive: "border-emerald-200 bg-emerald-50/20 text-emerald-700",
  warning:  "border-amber-200 bg-amber-50/20 text-amber-700",
  neutral:  "border-blue-200 bg-blue-50/20 text-blue-700",
}

// ─── Types ────────────────────────────────────────────────────────────
interface Correlation {
  key: string
  label: string
  unit: string
  icon: string
  r: number | null
  n: number
  significance: "strong" | "moderate" | "weak" | "noise"
  threshold: { value: number; unit: string; verb: string } | null
  delta: { above: number; below: number; deltaPct: number; nAbove: number; nBelow: number } | null
  lags: Array<{ lag: number; r: number | null; n: number }>
  scatter: Array<{ x: number; y: number; date: string }>
}

interface DeepAnalysis {
  ready: boolean
  moodDays?: number
  needed?: number
  message?: string
  period?: { days: number; from: string; to: string }
  streams?: Record<string, number>
  correlations?: Correlation[]
  matrix?: {
    labels: string[]
    keys: string[]
    cells: Array<Array<{ r: number | null; n: number; significance: string }>>
  }
  patterns?: Array<{ text: string; weight: number; tag: string }>
  disclaimer?: string
}

// ─── Local data collectors ────────────────────────────────────────────
// Read client-side stores and reduce them to day-keyed maps that the
// backend can join with server data.

function isoDay(ms: number): string {
  return new Date(ms).toISOString().split("T")[0]
}

function daysAgo(n: number): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split("T")[0]
  })
}

interface LocalDayMaps {
  water: Record<string, number>
  habits: Record<string, number>
  gratitude: Record<string, number>
  focus: Record<string, number>
}

function collectLocalData(days: number): LocalDayMaps {
  const result: LocalDayMaps = { water: {}, habits: {}, gratitude: {}, focus: {} }
  if (typeof window === "undefined") return result

  const cutoff = Date.now() - days * 86400000

  // Water: hfp-water-log = [{ date, entries: [{amount, time}], total }]
  try {
    const raw = JSON.parse(localStorage.getItem("hfp-water-log") || "[]")
    for (const d of raw) {
      if (!d?.date) continue
      if (new Date(d.date).getTime() < cutoff) continue
      const total = typeof d.total === "number"
        ? d.total
        : Array.isArray(d.entries) ? d.entries.reduce((s: number, e: any) => s + (e?.amount || 0), 0) : 0
      if (total > 0) result.water[d.date] = total
    }
  } catch {}

  // Habits: hfp-daily-habits = [{ id, name, completedDates: [YYYY-MM-DD] }]
  // Bucket by date → completion ratio across all defined habits.
  try {
    const raw = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
    if (Array.isArray(raw) && raw.length > 0) {
      const dateCount: Record<string, number> = {}
      for (const habit of raw) {
        for (const date of habit?.completedDates ?? []) {
          if (!date) continue
          if (new Date(date).getTime() < cutoff) continue
          dateCount[date] = (dateCount[date] ?? 0) + 1
        }
      }
      const totalHabits = raw.length
      for (const [date, count] of Object.entries(dateCount)) {
        result.habits[date] = Math.min(1, count / totalHabits)
      }
    }
  } catch {}

  // Gratitude: hfp-gratitude = [{ date, items: [...] }]
  try {
    const raw = JSON.parse(localStorage.getItem("hfp-gratitude") || "[]")
    for (const entry of raw) {
      if (!entry?.date) continue
      if (new Date(entry.date).getTime() < cutoff) continue
      const n = Array.isArray(entry.items) ? entry.items.length : 0
      if (n > 0) result.gratitude[entry.date] = n
    }
  } catch {}

  // Focus: hfp-focus-history = [{ date, focusMinutes, sessions }]
  try {
    const raw = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
    for (const entry of raw) {
      if (!entry?.date) continue
      if (new Date(entry.date).getTime() < cutoff) continue
      const mins = typeof entry.focusMinutes === "number" ? entry.focusMinutes : 0
      if (mins > 0) result.focus[entry.date] = mins
    }
  } catch {}

  return result
}

// ─── Small formatters ─────────────────────────────────────────────────
function fmtR(r: number | null): string {
  if (r === null) return "—"
  const sign = r > 0 ? "+" : ""
  return `${sign}${r.toFixed(2)}`
}

function fmtPct(p: number): string {
  const sign = p > 0 ? "+" : ""
  return `${sign}${p}%`
}

// ─── Primitive SVG charts ─────────────────────────────────────────────

function Scatter({ points, xLabel, yLabel, color }: {
  points: Array<{ x: number; y: number }>
  xLabel: string
  yLabel: string
  color: string
}) {
  if (points.length < 3) return (
    <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
      Not enough points to plot
    </div>
  )
  const W = 280, H = 120, padL = 28, padB = 18, padT = 6, padR = 6
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const xRange = xMax - xMin || 1
  const yRange = yMax - yMin || 1

  const toX = (x: number) => padL + ((x - xMin) / xRange) * plotW
  const toY = (y: number) => padT + plotH - ((y - yMin) / yRange) * plotH

  // Least-squares line for visual trend (same coefficients used for Pearson).
  const n = points.length
  const sumX = xs.reduce((s, v) => s + v, 0)
  const sumY = ys.reduce((s, v) => s + v, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = xs.reduce((s, v) => s + v * v, 0)
  const denom = n * sumX2 - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const intercept = (sumY - slope * sumX) / n
  const lineX1 = xMin, lineY1 = slope * xMin + intercept
  const lineX2 = xMax, lineY2 = slope * xMax + intercept

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Scatter plot of ${xLabel} vs ${yLabel}`}>
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="currentColor" className="text-muted" strokeWidth={0.5} />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="currentColor" className="text-muted" strokeWidth={0.5} />
      {/* Grid */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={padL} y1={padT + plotH * (1 - t)} x2={padL + plotW} y2={padT + plotH * (1 - t)} stroke="currentColor" className="text-muted/30" strokeWidth={0.3} strokeDasharray="2 2" />
      ))}
      {/* Trend line */}
      {denom !== 0 && (
        <line x1={toX(lineX1)} y1={toY(lineY1)} x2={toX(lineX2)} y2={toY(lineY2)} stroke={color} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
      )}
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={2.5} fill={color} opacity={0.7} />
      ))}
      {/* Axis labels */}
      <text x={padL + plotW / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="currentColor" className="text-muted-foreground">{xLabel}</text>
      <text x={6} y={padT + plotH / 2} textAnchor="middle" fontSize={8} fill="currentColor" className="text-muted-foreground" transform={`rotate(-90 6 ${padT + plotH / 2})`}>{yLabel}</text>
      {/* Axis tick values */}
      <text x={padL} y={padT + plotH + 10} textAnchor="start" fontSize={7} fill="currentColor" className="text-muted-foreground">{Math.round(xMin * 10) / 10}</text>
      <text x={padL + plotW} y={padT + plotH + 10} textAnchor="end" fontSize={7} fill="currentColor" className="text-muted-foreground">{Math.round(xMax * 10) / 10}</text>
      <text x={padL - 3} y={padT + 6} textAnchor="end" fontSize={7} fill="currentColor" className="text-muted-foreground">{Math.round(yMax * 10) / 10}</text>
      <text x={padL - 3} y={padT + plotH} textAnchor="end" fontSize={7} fill="currentColor" className="text-muted-foreground">{Math.round(yMin * 10) / 10}</text>
    </svg>
  )
}

function Heatmap({ labels, cells }: {
  labels: string[]
  cells: Array<Array<{ r: number | null; n: number; significance: string }>>
}) {
  const size = 28
  const labelPad = 68
  const W = labelPad + size * labels.length + 4
  const H = labelPad + size * labels.length + 4

  function cellColor(r: number | null, sig: string): string {
    if (r === null || sig === "noise") return "hsl(var(--muted))"
    // Divergent palette: red (negative) → white → blue (positive)
    const intensity = Math.min(1, Math.abs(r))
    if (r > 0) {
      const alpha = 0.15 + intensity * 0.65
      return `rgba(59, 130, 246, ${alpha})` // blue-500
    }
    const alpha = 0.15 + intensity * 0.65
    return `rgba(239, 68, 68, ${alpha})` // red-500
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Correlation heatmap across all metrics">
      {/* Column labels (rotated) */}
      {labels.map((l, i) => (
        <text
          key={`col-${i}`}
          x={labelPad + i * size + size / 2}
          y={labelPad - 4}
          fontSize={9}
          fill="currentColor"
          className="text-foreground"
          textAnchor="start"
          transform={`rotate(-45 ${labelPad + i * size + size / 2} ${labelPad - 4})`}
        >{l}</text>
      ))}
      {/* Row labels */}
      {labels.map((l, i) => (
        <text
          key={`row-${i}`}
          x={labelPad - 4}
          y={labelPad + i * size + size / 2 + 3}
          fontSize={9}
          fill="currentColor"
          className="text-foreground"
          textAnchor="end"
        >{l}</text>
      ))}
      {/* Cells */}
      {cells.map((row, i) =>
        row.map((cell, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={labelPad + j * size}
              y={labelPad + i * size}
              width={size - 1}
              height={size - 1}
              fill={cellColor(cell.r, cell.significance)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={0.5}
            >
              <title>{`${labels[i]} × ${labels[j]}: r=${fmtR(cell.r)} (n=${cell.n}, ${cell.significance})`}</title>
            </rect>
            {cell.r !== null && Math.abs(cell.r) >= 0.15 && (
              <text
                x={labelPad + j * size + size / 2}
                y={labelPad + i * size + size / 2 + 3}
                fontSize={8}
                textAnchor="middle"
                fill={Math.abs(cell.r) > 0.5 ? "white" : "currentColor"}
                className={Math.abs(cell.r) > 0.5 ? "" : "text-foreground"}
              >{cell.r > 0 ? "+" : ""}{cell.r.toFixed(1)}</text>
            )}
          </g>
        )),
      )}
    </svg>
  )
}

// ─── Significance badge ───────────────────────────────────────────────
function SigBadge({ sig }: { sig: string }) {
  const meta = SIG_META[sig] ?? SIG_META.noise
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

// ─── Correlation card ─────────────────────────────────────────────────
function CorrelationCard({ c }: { c: Correlation }) {
  const Icon = ICON_MAP[c.icon] ?? Activity
  const meta = SIG_META[c.significance] ?? SIG_META.noise
  const color = c.r === null
    ? "#94a3b8"
    : c.r > 0 ? "#10b981" : "#ef4444"
  const bestLag = c.lags
    .filter(l => l.r !== null && l.n >= 7)
    .sort((a, b) => Math.abs(b.r!) - Math.abs(a.r!))[0]

  return (
    <Card className={cn("border", meta.ring)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{c.label} vs Mood</CardTitle>
          </div>
          <SigBadge sig={c.significance} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className={cn(
              "text-3xl font-bold tabular-nums",
              c.r === null ? "text-muted-foreground" : c.r > 0.15 ? "text-emerald-600" : c.r < -0.15 ? "text-red-500" : "text-muted-foreground",
            )}>{fmtR(c.r)}</p>
            <p className="text-[10px] text-muted-foreground">
              Pearson r · n = {c.n} day{c.n === 1 ? "" : "s"}
            </p>
          </div>
          {c.delta && (
            <div className="text-right">
              <p className={cn(
                "text-lg font-semibold tabular-nums",
                c.delta.deltaPct > 0 ? "text-emerald-600" : c.delta.deltaPct < 0 ? "text-red-500" : "text-muted-foreground",
              )}>{fmtPct(c.delta.deltaPct)}</p>
              <p className="text-[10px] text-muted-foreground">mood delta</p>
            </div>
          )}
        </div>

        <Scatter
          points={c.scatter}
          xLabel={`${c.label} (${c.unit})`}
          yLabel="Mood (1–10)"
          color={color}
        />

        {c.delta && c.threshold && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-[11px] leading-relaxed">
            Mood averages <strong>{c.delta.above}</strong> on the {c.delta.nAbove} day{c.delta.nAbove === 1 ? "" : "s"} you {c.threshold.value === 0 ? c.threshold.verb : `${c.threshold.verb} ${c.threshold.value} ${c.threshold.unit}`},
            vs <strong>{c.delta.below}</strong> on the {c.delta.nBelow} day{c.delta.nBelow === 1 ? "" : "s"} you didn't.
          </div>
        )}

        {bestLag && Math.abs(bestLag.r!) >= 0.2 && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <RefreshCcw className="h-3 w-3" />
            <span>
              Effect carries: mood {bestLag.lag} day{bestLag.lag > 1 ? "s" : ""} later r = {fmtR(bestLag.r)} (n={bestLag.n})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────
export default function CorrelationsPage() {
  const [days, setDays] = useState("90")
  const [deep, setDeep] = useState<DeepAnalysis | null>(null)
  const [deepError, setDeepError] = useState<string | null>(null)
  const [loadingDeep, setLoadingDeep] = useState(false)

  // Server-side baseline: moon/day/season/exercise/sleep framing.
  const { data, isLoading, error } = useSWR(`/api/correlations?days=${days}`, secureFetcher)

  // POST to /api/correlations with local client data for deep analysis.
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoadingDeep(true)
      setDeepError(null)
      try {
        const local = collectLocalData(parseInt(days, 10))
        const res = await fetch("/api/correlations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            days: parseInt(days, 10),
            waterByDay: local.water,
            habitsByDay: local.habits,
            gratitudeByDay: local.gratitude,
            focusByDay: local.focus,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: DeepAnalysis = await res.json()
        if (!cancelled) setDeep(json)
      } catch (err) {
        if (!cancelled) setDeepError(err instanceof Error ? err.message : "Failed to analyze")
      } finally {
        if (!cancelled) setLoadingDeep(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [days])

  // Sort correlations by strength desc for display.
  const sortedCorrelations = useMemo(() => {
    if (!deep?.correlations) return []
    return [...deep.correlations].sort((a, b) => {
      const aS = a.r === null ? 0 : Math.abs(a.r)
      const bS = b.r === null ? 0 : Math.abs(b.r)
      return bS - aS
    })
  }, [deep?.correlations])

  // Loading gate
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading correlations...</div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm">Couldn't load your correlations. Please retry in a moment.</p>
      </div>
    )
  }

  const {
    currentMoon, moonCorrelations, dayCorrelations, seasonCorrelations,
    hourActivity, sleepMoodCorrelation, dataPoints, insights,
    exerciseMoodDelta, exerciseDayCount, restDayCount,
  } = data

  const deepReady = deep?.ready === true
  const deepMoodDays = deep?.moodDays ?? 0
  const deepNeeded = deep?.needed ?? 7

  // Global empty state: no server mood data at all.
  if (!dataPoints || dataPoints < 5) {
    return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader days={days} setDays={setDays} />
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-medium">Keep logging — insights appear after 7 days</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              You have {dataPoints ?? 0} mood check-in{(dataPoints ?? 0) === 1 ? "" : "s"} so far.
              Real patterns emerge once you have at least 7 days of data across mood, sleep, exercise, habits, and gratitude.
            </p>
            <div className="mt-5 flex justify-center gap-3 text-sm">
              <a href="/mental-health" className="text-violet-600 hover:underline">Check in now</a>
              <a href="/life-os" className="text-indigo-600 hover:underline">Life OS →</a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader days={days} setDays={setDays} />

      {/* Headline stats: signal strength banner */}
      {deepReady && sortedCorrelations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatTile
            label="Days analyzed"
            value={deepMoodDays.toString()}
            icon={Calendar}
            color="text-violet-500"
            subtitle="with mood data"
          />
          <StatTile
            label="Strong signals"
            value={sortedCorrelations.filter(c => c.significance === "strong").length.toString()}
            icon={Flame}
            color="text-emerald-500"
            subtitle="|r| ≥ 0.5"
          />
          <StatTile
            label="Patterns found"
            value={(deep?.patterns?.length ?? 0).toString()}
            icon={Sparkles}
            color="text-indigo-500"
            subtitle="non-obvious"
          />
          <StatTile
            label="Data streams"
            value={Object.values(deep?.streams ?? {}).filter(n => n >= 7).length.toString()}
            icon={BarChart3}
            color="text-blue-500"
            subtitle="with ≥7 days"
          />
        </div>
      )}

      {/* Non-obvious patterns — the hero of the page */}
      {deepReady && deep?.patterns && deep.patterns.length > 0 && (
        <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/40 to-indigo-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" /> Patterns in Your Data
            </CardTitle>
            <CardDescription>
              Non-obvious connections the system found by <Explain tip="Cross-referencing means comparing every metric against every other metric to find patterns — like whether drinking more water is associated with better mood">cross-referencing</Explain> your streams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {deep.patterns.map((p, i) => (
              <div key={i} className="rounded-lg border border-violet-200/60 bg-white/50 p-3 flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{p.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Deep analysis not yet ready */}
      {!deepReady && !loadingDeep && !deepError && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Info className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium">Deep analysis needs at least {deepNeeded} mood days</p>
            <p className="text-xs text-muted-foreground mt-1">
              {deep?.message ?? `You have ${deepMoodDays}. Keep logging to unlock per-metric Pearson correlations.`}
            </p>
          </CardContent>
        </Card>
      )}

      {loadingDeep && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-xs text-muted-foreground">
            Computing correlations across your data streams…
          </CardContent>
        </Card>
      )}

      {/* Per-metric correlation cards (the meat) */}
      {deepReady && sortedCorrelations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedCorrelations.map(c => <CorrelationCard key={c.key} c={c} />)}
        </div>
      )}

      {/* Cross-metric heatmap */}
      {deepReady && deep?.matrix && deep.matrix.labels.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Correlation Matrix
            </CardTitle>
            <CardDescription>
              Every metric vs every other metric. Blue = positive correlation, red = negative. Opacity shows strength.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap labels={deep.matrix.labels} cells={deep.matrix.cells} />
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(239,68,68,0.8)" }} /><span>−1</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted" /><span>0</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(59,130,246,0.8)" }} /><span>+1</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Server-side context — moon, day, season, insights, activity */}
      {insights && insights.length > 0 && (
        <Card className="border-2 border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-500" /> Additional Insights
            </CardTitle>
            <CardDescription>Patterns across your mood, sleep, and exercise data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight: any, i: number) => {
              const Icon = INSIGHT_ICONS[insight.type] || Lightbulb
              return (
                <div key={i} className={cn("rounded-lg border p-3 flex items-start gap-3", INSIGHT_COLORS[insight.type])}>
                  <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs leading-relaxed">{insight.text}</p>
                    <Badge variant="outline" className="text-[8px] mt-1">{insight.confidence} confidence</Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Exercise-day vs rest-day delta (kept from legacy for continuity) */}
      {exerciseMoodDelta !== null && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-orange-500" /> Exercise Days vs Rest Days
            </CardTitle>
            <CardDescription>Mood averaged across days you exercised vs days you didn't</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{exerciseDayCount}</p>
                <p className="text-[10px] text-muted-foreground">exercise days</p>
              </div>
              <div className="text-center">
                <p className={cn("text-4xl font-bold", exerciseMoodDelta > 0.3 ? "text-emerald-600" : exerciseMoodDelta < -0.3 ? "text-red-500" : "text-muted-foreground")}>
                  {exerciseMoodDelta > 0 ? "+" : ""}{exerciseMoodDelta}
                </p>
                <p className="text-[10px] text-muted-foreground">mood delta</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{restDayCount}</p>
                <p className="text-[10px] text-muted-foreground">rest days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moon phase */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-4 flex items-center gap-4">
          <span className="text-4xl">{MOON_EMOJIS[currentMoon.phase] ?? "🌙"}</span>
          <div className="flex-1">
            <p className="font-semibold">{currentMoon.phase}</p>
            <p className="text-xs text-muted-foreground">Current moon phase · {currentMoon.illumination}% illumination</p>
          </div>
        </CardContent>
      </Card>

      {moonCorrelations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" /> Moon Phase vs Mood
            </CardTitle>
            <CardDescription>Your average mood during each moon phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {moonCorrelations.map((mc: any) => (
                <div key={mc.phase} className="flex items-center gap-3">
                  <span className="text-lg w-6">{MOON_EMOJIS[mc.phase] ?? "🌙"}</span>
                  <span className="text-sm w-32 shrink-0">{mc.phase}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${(mc.avgMood / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-10 text-right tabular-nums">{mc.avgMood}</span>
                  <span className="text-xs text-muted-foreground w-8 tabular-nums">({mc.entries})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day of week */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" /> Day of Week vs Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {dayCorrelations.map((dc: any) => {
              const height = dc.avgMood ? (dc.avgMood / 10) * 100 : 0
              return (
                <div key={dc.day} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-xs font-bold tabular-nums">{dc.avgMood ?? "—"}</p>
                  <div className="w-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${Math.max(4, height)}%`, opacity: dc.entries > 0 ? 0.8 : 0.2 }} />
                  <span className="text-[9px] text-muted-foreground">{dc.day.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Season */}
      {seasonCorrelations.some((s: any) => s.entries > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" /> Seasonal Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {seasonCorrelations.map((sc: any) => (
                <div key={sc.season} className="text-center p-3 rounded-lg border border-border/50">
                  <p className="text-lg">{sc.season === "Spring" ? "🌱" : sc.season === "Summer" ? "☀️" : sc.season === "Fall" ? "🍂" : "❄️"}</p>
                  <p className="text-lg font-bold mt-1 tabular-nums">{sc.avgMood ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{sc.season}</p>
                  <p className="text-[10px] text-muted-foreground">{sc.entries} entries</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy sleep correlation — kept for breadth */}
      {sleepMoodCorrelation !== null && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Sleep vs Mood (full history)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className={cn("text-4xl font-bold tabular-nums", sleepMoodCorrelation > 0.3 ? "text-emerald-600" : sleepMoodCorrelation < -0.3 ? "text-red-500" : "text-muted-foreground")}>
                {sleepMoodCorrelation > 0 ? "+" : ""}{sleepMoodCorrelation}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.abs(sleepMoodCorrelation) > 0.5 ? "Strong" : Math.abs(sleepMoodCorrelation) > 0.3 ? "Moderate" : "Weak"} {sleepMoodCorrelation > 0 ? "positive" : "negative"} <Explain tip="A correlation coefficient runs from -1 to +1. Closer to +1 means the two things rise together; closer to -1 means one rises while the other falls; near 0 means no reliable relationship">correlation</Explain>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {data.sleepMoodPairs} paired <Explain tip="A paired data point is a day where both sleep and mood were logged, allowing them to be compared directly">data points</Explain>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* When you log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" /> When You Log
          </CardTitle>
          <CardDescription>Your mood check-in patterns by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-[2px] h-16">
            {hourActivity.map((h: any) => {
              const max = Math.max(...hourActivity.map((x: any) => x.count))
              const pct = max > 0 ? (h.count / max) * 100 : 0
              return (
                <div
                  key={h.hour}
                  className="flex-1 rounded-t bg-gradient-to-t from-purple-500 to-violet-400"
                  style={{ height: `${Math.max(2, pct)}%`, opacity: h.count > 0 ? 0.7 : 0.1 }}
                  title={`${h.label}: ${h.count} check-ins`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
          </div>
        </CardContent>
      </Card>

      {/* How to read this */}
      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold">How to read this page</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5 leading-relaxed">
            <li><strong>Pearson r</strong> is a number from −1 to +1. Higher absolute value = stronger relationship.</li>
            <li><strong>Strong</strong> = |r| ≥ 0.5, <strong>moderate</strong> = 0.3–0.5, <strong>weak</strong> = 0.15–0.3, otherwise noise.</li>
            <li><strong>n</strong> is the number of days where both metrics were logged. We require at least 7 before trusting a signal.</li>
            <li><strong>Mood delta</strong> shows the percentage difference in average mood above vs below a meaningful threshold (e.g. 7 hours of sleep).</li>
            <li>Water, habits, gratitude, and focus data are read from this device's local storage and <Explain tip="Your data never leaves your device unencrypted — it is processed on the server only long enough to compute the correlations shown here">analyzed alongside</Explain> server-stored mood, sleep, and exercise data.</li>
          </ul>
          <p className="text-[10px] text-muted-foreground pt-1">
            <strong>Note:</strong> {data.disclaimer} {deep?.disclaimer ?? "Correlations become sharper with more data."}
          </p>
        </CardContent>
      </Card>

      {deepError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 text-xs text-amber-800">
          Deep analysis unavailable right now: {deepError}
        </div>
      )}

      <div className="flex gap-3 flex-wrap text-sm">
        <a href="/mental-health" className="text-pink-600 hover:underline">← Mental Health</a>
        <a href="/life-os" className="text-indigo-600 hover:underline">Life OS</a>
        <a href="/health" className="text-rose-600 hover:underline">Health Intelligence →</a>
      </div>
    </div>
  )
}

// ─── Sub-components for the main page ─────────────────────────────────

function PageHeader({ days, setDays }: { days: string; setDays: (v: string) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Pattern Correlations</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Which activities actually drive your well-being — quantified.
        </p>
      </div>
      <Select value={days} onValueChange={setDays}>
        <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="30">30 days</SelectItem>
          <SelectItem value="90">90 days</SelectItem>
          <SelectItem value="180">6 months</SelectItem>
          <SelectItem value="365">1 year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function StatTile({ label, value, icon: Icon, color, subtitle }: {
  label: string
  value: string
  icon: any
  color: string
  subtitle?: string
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
