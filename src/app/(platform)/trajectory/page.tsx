"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { TrendingUp, DollarSign, Heart, Brain, Target, Sparkles, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

// ---------- types ----------
interface Habit { id: string; name: string; icon: string; streak: number; completedDates: string[] }
interface NetWorthHistoryPoint { date: string; netWorth: number }
interface FlourishingHistoryPoint { date: string; score: number }
interface MoodEntry { score: number; recordedAt: string }

// ---------- helpers ----------
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function linearFit(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 }
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  let num = 0, denX = 0, denY = 0
  for (const p of points) {
    num += (p.x - meanX) * (p.y - meanY)
    denX += (p.x - meanX) ** 2
    denY += (p.y - meanY) ** 2
  }
  const slope = denX === 0 ? 0 : num / denX
  const intercept = meanY - slope * meanX
  const r2 = denX === 0 || denY === 0 ? 0 : (num * num) / (denX * denY)
  return { slope, intercept, r2 }
}

function residualStdDev(points: { x: number; y: number }[], fit: { slope: number; intercept: number }): number {
  if (points.length < 2) return 0
  const sumSq = points.reduce((s, p) => {
    const pred = fit.intercept + fit.slope * p.x
    return s + (p.y - pred) ** 2
  }, 0)
  return Math.sqrt(sumSq / Math.max(1, points.length - 1))
}

function habitCompletionPct(habit: Habit, lookbackDays: number): number {
  const today = new Date()
  let completed = 0
  for (let i = 0; i < lookbackDays; i++) {
    const d = new Date(today.getTime() - i * 86400000).toISOString().split("T")[0]
    if (habit.completedDates.includes(d)) completed++
  }
  return completed / lookbackDays
}

// ---------- sparkline ----------
function TrajectorySVG({
  historical,
  pessimistic,
  current,
  ambitious,
  bandLow,
  bandHigh,
  yLabel,
  formatY,
}: {
  historical: { x: number; y: number }[]
  pessimistic: { x: number; y: number }[]
  current: { x: number; y: number }[]
  ambitious: { x: number; y: number }[]
  bandLow: { x: number; y: number }[]
  bandHigh: { x: number; y: number }[]
  yLabel: string
  formatY: (v: number) => string
}) {
  const W = 640, H = 220, PAD_L = 52, PAD_R = 12, PAD_T = 14, PAD_B = 28
  const allPts = [...historical, ...pessimistic, ...current, ...ambitious, ...bandLow, ...bandHigh]
  if (allPts.length === 0) return null
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMinRaw = Math.min(...ys), yMaxRaw = Math.max(...ys)
  const yPad = (yMaxRaw - yMinRaw) * 0.08 || Math.abs(yMaxRaw) * 0.1 || 1
  const yMin = yMinRaw - yPad, yMax = yMaxRaw + yPad

  const sx = (x: number) => PAD_L + ((x - xMin) / Math.max(1e-9, xMax - xMin)) * (W - PAD_L - PAD_R)
  const sy = (y: number) => H - PAD_B - ((y - yMin) / Math.max(1e-9, yMax - yMin)) * (H - PAD_T - PAD_B)

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ")

  const bandPath = bandLow.length && bandHigh.length
    ? `M ${sx(bandLow[0].x).toFixed(1)} ${sy(bandLow[0].y).toFixed(1)} ` +
      bandLow.slice(1).map(p => `L ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ") + " " +
      [...bandHigh].reverse().map(p => `L ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ") + " Z"
    : ""

  const today = historical.length ? historical[historical.length - 1].x : 0
  const todayPx = sx(today)

  // y-axis ticks (4)
  const ticks = Array.from({ length: 4 }, (_, i) => yMin + ((yMax - yMin) * i) / 3)
  // x-axis ticks (days -> months/years labels)
  const xTicks = [xMin, xMin + (xMax - xMin) * 0.25, xMin + (xMax - xMin) * 0.5, xMin + (xMax - xMin) * 0.75, xMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${yLabel} trajectory`}>
      {/* grid */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={sy(t)} x2={W - PAD_R} y2={sy(t)} stroke="currentColor" className="text-muted-foreground/15" strokeWidth={1} />
          <text x={PAD_L - 6} y={sy(t) + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">{formatY(t)}</text>
        </g>
      ))}
      {/* x tick labels */}
      {xTicks.map((t, i) => {
        const d = Math.round(t - today)
        const label = d === 0 ? "now" : d < 0 ? `${Math.round(-d / 30)}mo ago` : d < 365 ? `+${Math.round(d / 30)}mo` : `+${(d / 365).toFixed(1)}y`
        return (
          <text key={i} x={sx(t)} y={H - 10} textAnchor="middle" fontSize={9} className="fill-muted-foreground">{label}</text>
        )
      })}
      {/* uncertainty band */}
      {bandPath && <path d={bandPath} className="fill-violet-400/15" />}
      {/* today line */}
      <line x1={todayPx} y1={PAD_T} x2={todayPx} y2={H - PAD_B} stroke="currentColor" className="text-violet-500/40" strokeDasharray="3 3" strokeWidth={1} />
      <text x={todayPx + 3} y={PAD_T + 9} fontSize={9} className="fill-violet-500">today</text>
      {/* scenarios */}
      {pessimistic.length > 0 && <path d={toPath(pessimistic)} fill="none" className="stroke-red-400" strokeWidth={1.5} strokeDasharray="4 3" />}
      {ambitious.length > 0 && <path d={toPath(ambitious)} fill="none" className="stroke-emerald-500" strokeWidth={1.5} strokeDasharray="4 3" />}
      {current.length > 0 && <path d={toPath(current)} fill="none" className="stroke-violet-600" strokeWidth={2} />}
      {historical.length > 0 && <path d={toPath(historical)} fill="none" className="stroke-foreground" strokeWidth={1.75} />}
      {historical.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={2} className="fill-foreground" />
      ))}
      {/* axis line */}
      <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="currentColor" className="text-muted-foreground/30" />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="currentColor" className="text-muted-foreground/30" />
      <text x={6} y={PAD_T + 6} fontSize={9} className="fill-muted-foreground" transform={`rotate(-90 6 ${PAD_T + 6})`}>{yLabel}</text>
    </svg>
  )
}

// ---------- page ----------
export default function TrajectoryPage() {
  // user overrides for sliders when no history exists
  const [age, setAge] = useState(30)
  const [horizonYears, setHorizonYears] = useState(5)

  // real data pulls
  const [habits] = useSyncedStorage<Habit[]>("hfp-daily-habits", [])
  const [networthHistory, setNetworthHistory] = useState<NetWorthHistoryPoint[]>([])
  const [flourishingHistory, setFlourishingHistory] = useState<FlourishingHistoryPoint[]>([])
  const [budget, setBudget] = useState<{ incomes: number[]; expenses: number[][] } | null>(null)

  useEffect(() => {
    try {
      const nw = localStorage.getItem("hfp-networth")
      if (nw) {
        const parsed = JSON.parse(nw)
        setNetworthHistory((parsed.history ?? []).filter((h: any) => h && h.date && typeof h.netWorth === "number"))
      }
    } catch {}
    try {
      const fh = localStorage.getItem("hfp-flourishing-history")
      if (fh) {
        const parsed = JSON.parse(fh)
        setFlourishingHistory(Array.isArray(parsed) ? parsed.filter((h: any) => h && h.date && typeof h.score === "number").sort((a: any, b: any) => a.date.localeCompare(b.date)) : [])
      }
    } catch {}
    try {
      const b = localStorage.getItem("hfp-budget")
      if (b) setBudget(JSON.parse(b))
    } catch {}
  }, [])

  const { data: moodData } = useSWR("/api/mental-health/mood?limit=90", secureFetcher)
  const moodEntries: MoodEntry[] = useMemo(() =>
    (moodData?.entries ?? []).filter((e: any) => e && typeof e.score === "number" && e.recordedAt)
      .map((e: any) => ({ score: e.score, recordedAt: e.recordedAt }))
      .sort((a: MoodEntry, b: MoodEntry) => a.recordedAt.localeCompare(b.recordedAt))
  , [moodData])

  // ---------- derived stats ----------
  const today = new Date().toISOString().split("T")[0]

  // Net worth: fit a line in $/day using history
  const nwFit = useMemo(() => {
    if (networthHistory.length < 2) return null
    const first = networthHistory[0].date
    const pts = networthHistory.map(p => ({ x: daysBetween(first, p.date), y: p.netWorth }))
    const fit = linearFit(pts)
    const resid = residualStdDev(pts, fit)
    const latest = pts[pts.length - 1]
    const spanDays = pts[pts.length - 1].x - pts[0].x
    return { fit, resid, latest, spanDays, first, pts }
  }, [networthHistory])

  // Budget-derived monthly surplus (used as fallback when no NW history and as basis for ambitious scenario)
  const budgetSurplus = useMemo(() => {
    if (!budget) return null
    const totalIncome = (budget.incomes ?? []).reduce((s, v) => s + (Number(v) || 0), 0)
    const totalExpense = (budget.expenses ?? []).reduce((s, row) => s + (row ?? []).reduce((r, v) => r + (Number(v) || 0), 0), 0)
    return { monthly: totalIncome - totalExpense, income: totalIncome, expense: totalExpense }
  }, [budget])

  // Mood: fit line in score/day
  const moodFit = useMemo(() => {
    if (moodEntries.length < 2) return null
    const first = moodEntries[0].recordedAt.split("T")[0]
    const pts = moodEntries.map(e => ({ x: daysBetween(first, e.recordedAt.split("T")[0]), y: e.score }))
    const fit = linearFit(pts)
    const resid = residualStdDev(pts, fit)
    return { fit, resid, latest: pts[pts.length - 1], first, pts }
  }, [moodEntries])

  // Flourishing: fit line in score/day
  const flourFit = useMemo(() => {
    if (flourishingHistory.length < 2) return null
    const first = flourishingHistory[0].date
    const pts = flourishingHistory.map(h => ({ x: daysBetween(first, h.date), y: h.score }))
    const fit = linearFit(pts)
    const resid = residualStdDev(pts, fit)
    return { fit, resid, latest: pts[pts.length - 1], first, pts }
  }, [flourishingHistory])

  // Habit consistency (30-day completion)
  const habitStats = useMemo(() => {
    if (!habits || habits.length === 0) return null
    const withPct = habits.map(h => ({ habit: h, pct30: habitCompletionPct(h, 30), pct90: habitCompletionPct(h, 90) }))
    const avg30 = withPct.reduce((s, h) => s + h.pct30, 0) / withPct.length
    const weakest = [...withPct].sort((a, b) => a.pct30 - b.pct30)[0]
    const strongest = [...withPct].sort((a, b) => b.pct30 - a.pct30)[0]
    return { withPct, avg30, weakest, strongest }
  }, [habits])

  // ---------- projections ----------
  const horizonDays = horizonYears * 365
  const MONTHS = horizonYears * 12

  // Build monthly sample points along horizon
  const sampleDays = Array.from({ length: MONTHS + 1 }, (_, i) => Math.round((i * horizonDays) / MONTHS))

  function buildProjection(
    fitRec: { fit: { slope: number; intercept: number }; resid: number; latest: { x: number; y: number }; first: string; pts: { x: number; y: number }[] } | null,
    clamp?: { min?: number; max?: number }
  ) {
    if (!fitRec) return null
    const historicalWithTodayX = fitRec.pts.map(p => ({ x: daysBetween(today, fitRec.first) + p.x, y: p.y }))
    const lastY = fitRec.latest.y
    const slopePerDay = fitRec.fit.slope
    const resid = fitRec.resid

    const cap = (v: number) => {
      if (clamp?.min !== undefined) v = Math.max(clamp.min, v)
      if (clamp?.max !== undefined) v = Math.min(clamp.max, v)
      return v
    }

    const current: { x: number; y: number }[] = sampleDays.map(d => ({ x: d, y: cap(lastY + slopePerDay * d) }))
    // Pessimistic: halve positive trends, exaggerate negative; add a drift
    const pessSlope = slopePerDay >= 0 ? slopePerDay * 0.35 : slopePerDay * 1.5
    const pessimistic: { x: number; y: number }[] = sampleDays.map(d => ({ x: d, y: cap(lastY + pessSlope * d) }))
    // Ambitious: boost positive, turn negative neutral-to-positive
    const ambSlope = slopePerDay >= 0 ? slopePerDay * 1.6 : Math.max(0.02, Math.abs(slopePerDay) * 0.5)
    const ambitious: { x: number; y: number }[] = sampleDays.map(d => ({ x: d, y: cap(lastY + ambSlope * d) }))
    // Uncertainty band (current pace ± 1.5 * resid * sqrt(t / spanTypical))
    const typicalSpan = Math.max(30, fitRec.pts[fitRec.pts.length - 1].x - fitRec.pts[0].x)
    const bandLow: { x: number; y: number }[] = sampleDays.map(d => ({ x: d, y: cap((lastY + slopePerDay * d) - 1.5 * resid * Math.sqrt(Math.max(1, d) / typicalSpan)) }))
    const bandHigh: { x: number; y: number }[] = sampleDays.map(d => ({ x: d, y: cap((lastY + slopePerDay * d) + 1.5 * resid * Math.sqrt(Math.max(1, d) / typicalSpan)) }))

    return { historical: historicalWithTodayX, current, pessimistic, ambitious, bandLow, bandHigh, slopePerDay, resid, lastY }
  }

  const nwProjection = useMemo(() => buildProjection(nwFit), [nwFit, horizonYears])
  const moodProjection = useMemo(() => buildProjection(moodFit, { min: 1, max: 10 }), [moodFit, horizonYears])
  const flourProjection = useMemo(() => buildProjection(flourFit, { min: 0, max: 100 }), [flourFit, horizonYears])

  // ---------- "if you raise 1 habit to daily" impact ----------
  const habitLift = useMemo(() => {
    if (!habitStats?.weakest) return null
    const cur = habitStats.weakest.pct30
    const lift = 1 - cur // going from current to 100%
    // Each habit contributes roughly 100/habits.length points to daily consistency; flourishing gets ~15% weight from habits dimension.
    const contribPerHabit = 100 / habits.length
    const deltaConsistencyPoints = lift * contribPerHabit
    const deltaFlourishPerDay = deltaConsistencyPoints * 0.15 / 30 // spread over first month
    return { habit: habitStats.weakest.habit, currentPct: cur, deltaFlourishPerDay, deltaConsistencyPoints }
  }, [habitStats, habits])

  // ---------- milestones (monthly for finance) ----------
  const nwMilestones = useMemo(() => {
    if (!nwProjection) return []
    return Array.from({ length: horizonYears }, (_, i) => {
      const month = (i + 1) * 12
      const sample = nwProjection.current[Math.min(month, nwProjection.current.length - 1)]
      const pessSample = nwProjection.pessimistic[Math.min(month, nwProjection.pessimistic.length - 1)]
      const ambSample = nwProjection.ambitious[Math.min(month, nwProjection.ambitious.length - 1)]
      return { year: i + 1, current: sample.y, pessimistic: pessSample.y, ambitious: ambSample.y }
    })
  }, [nwProjection, horizonYears])

  // ---------- habit consistency projection ----------
  const habitConsistencyProj = useMemo(() => {
    if (!habitStats) return null
    const currentAvg = habitStats.avg30
    // Consistency tends to drift toward a personal equilibrium. Use a simple convergence model.
    const equilibrium = currentAvg * 0.92 // slight regression to mean downward in pessimistic
    const daysToEq = 180
    const current = sampleDays.map(d => ({ x: d, y: 100 * (currentAvg + (equilibrium - currentAvg) * Math.min(1, d / daysToEq) * 0.5) }))
    const pessimistic = sampleDays.map(d => ({ x: d, y: 100 * Math.max(0, currentAvg * (1 - Math.min(0.35, d / (365 * 2)))) }))
    const ambitiousEq = Math.min(0.95, currentAvg + 0.2)
    const ambitious = sampleDays.map(d => ({ x: d, y: 100 * (currentAvg + (ambitiousEq - currentAvg) * Math.min(1, d / daysToEq)) }))
    const bandLow = current.map(p => ({ x: p.x, y: Math.max(0, p.y - 6 * Math.sqrt(Math.max(1, p.x) / 90)) }))
    const bandHigh = current.map(p => ({ x: p.x, y: Math.min(100, p.y + 6 * Math.sqrt(Math.max(1, p.x) / 90)) }))
    return { historical: [{ x: 0, y: currentAvg * 100 }], current, pessimistic, ambitious, bandLow, bandHigh }
  }, [habitStats, horizonYears])

  // ---------- render ----------
  const hasAnyData = networthHistory.length > 0 || moodEntries.length > 0 || flourishingHistory.length > 0 || habits.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your {horizonYears}-Year Trajectory</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A projection from your own data — net worth, mood, flourishing score, and habit consistency — forward, with honest uncertainty bands.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Not a prediction — a projection.</strong> These lines extrapolate your current rates forward. Confidence bands
            widen with time because the future is genuinely uncertain. The point is not to lock in a destination, but to see
            how today&apos;s small decisions compound into dramatically different lives.
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Projection Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Current age</label>
              <Input type="number" value={age} onChange={e => setAge(Math.max(0, Number(e.target.value) || 0))} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Horizon (years)</label>
              <Input type="number" min={1} max={30} value={horizonYears} onChange={e => setHorizonYears(Math.max(1, Math.min(30, Number(e.target.value) || 5)))} className="h-8 text-sm" />
            </div>
            <div className="col-span-2 text-[10px] text-muted-foreground self-end leading-tight">
              You&apos;ll be <strong>{age + horizonYears}</strong> at the end of this horizon. Bands = ±1.5 residual σ, widening as √t.
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasAnyData && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4 text-xs text-amber-800">
            No historical data yet. Log entries on <a className="underline" href="/net-worth">Net Worth</a>,{" "}
            <a className="underline" href="/mental-health">Mood</a>,{" "}
            <a className="underline" href="/flourishing-score">Flourishing Score</a>, or{" "}
            <a className="underline" href="/daily-habits">Daily Habits</a> to see your real trajectory.
          </CardContent>
        </Card>
      )}

      {/* NET WORTH TRAJECTORY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Net Worth Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nwProjection && nwFit ? (
            <>
              <TrajectorySVG
                historical={nwProjection.historical}
                pessimistic={nwProjection.pessimistic}
                current={nwProjection.current}
                ambitious={nwProjection.ambitious}
                bandLow={nwProjection.bandLow}
                bandHigh={nwProjection.bandHigh}
                yLabel="Net worth"
                formatY={(v) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${Math.round(v)}`)}
              />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                  <p className="text-[10px] text-red-600 font-medium">Pessimistic</p>
                  <p className="font-semibold text-red-800">${Math.round(nwProjection.pessimistic[nwProjection.pessimistic.length - 1].y).toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">if momentum halves</p>
                </div>
                <div className="rounded-lg bg-violet-50 border border-violet-200 p-2">
                  <p className="text-[10px] text-violet-600 font-medium">Current pace</p>
                  <p className="font-semibold text-violet-800">${Math.round(nwProjection.current[nwProjection.current.length - 1].y).toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">${(nwFit.fit.slope * 30).toFixed(0)}/mo avg · {nwFit.pts.length} pts</p>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                  <p className="text-[10px] text-emerald-600 font-medium">Ambitious</p>
                  <p className="font-semibold text-emerald-800">${Math.round(nwProjection.ambitious[nwProjection.ambitious.length - 1].y).toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">if pace +60%</p>
                </div>
              </div>
              {budgetSurplus && (
                <p className="text-[11px] text-muted-foreground">
                  Your budget shows <strong className={budgetSurplus.monthly >= 0 ? "text-emerald-600" : "text-red-600"}>${budgetSurplus.monthly.toLocaleString()}/mo</strong> surplus.
                  {budgetSurplus.monthly > 0 && nwFit.fit.slope > 0 && ` Compounded at 7% over ${horizonYears}y that surplus alone is $${Math.round(budgetSurplus.monthly * (((1 + 0.07 / 12) ** (horizonYears * 12) - 1) / (0.07 / 12))).toLocaleString()}.`}
                </p>
              )}
            </>
          ) : budgetSurplus && budgetSurplus.monthly !== 0 ? (
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Net worth history not yet established. Using budget-derived surplus of <strong>${budgetSurplus.monthly.toLocaleString()}/mo</strong>:</p>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5].map(r => {
                  const fv = budgetSurplus.monthly * (((1 + r / 100 / 12) ** (horizonYears * 12) - 1) / (r / 100 / 12))
                  return (
                    <div key={r} className="rounded-lg bg-muted/30 border p-2">
                      <p className="text-[10px] text-muted-foreground">@ {r}%/yr</p>
                      <p className="font-semibold">${Math.round(fv).toLocaleString()}</p>
                    </div>
                  )
                })}
                {(() => {
                  const r = 7
                  const fv = budgetSurplus.monthly * (((1 + r / 100 / 12) ** (horizonYears * 12) - 1) / (r / 100 / 12))
                  return (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                      <p className="text-[10px] text-emerald-600">@ 7%/yr</p>
                      <p className="font-semibold text-emerald-800">${Math.round(fv).toLocaleString()}</p>
                    </div>
                  )
                })()}
              </div>
              <p>Add entries on <a className="underline" href="/net-worth">Net Worth</a> across multiple weeks to unlock your real fit.</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No net-worth history. Log entries on <a className="underline" href="/net-worth">Net Worth</a> for a real fit.</p>
          )}
        </CardContent>
      </Card>

      {/* FLOURISHING TRAJECTORY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" /> Flourishing Score Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flourProjection ? (
            <>
              <TrajectorySVG
                historical={flourProjection.historical}
                pessimistic={flourProjection.pessimistic}
                current={flourProjection.current}
                ambitious={flourProjection.ambitious}
                bandLow={flourProjection.bandLow}
                bandHigh={flourProjection.bandHigh}
                yLabel="Score /100"
                formatY={(v) => `${Math.round(v)}`}
              />
              <p className="text-[11px] text-muted-foreground">
                From <strong>{flourishingHistory.length}</strong> observations over{" "}
                <strong>{flourFit ? Math.round((flourFit.pts[flourFit.pts.length - 1].x - flourFit.pts[0].x)) : 0}</strong> days.
                Current slope: <strong>{flourFit ? (flourFit.fit.slope * 30).toFixed(2) : "—"} pts/mo</strong>.
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Need at least 2 flourishing-score snapshots. Visit <a className="underline" href="/flourishing-score">Flourishing Score</a> on different days.</p>
          )}
        </CardContent>
      </Card>

      {/* MOOD TRAJECTORY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Mood Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moodProjection ? (
            <>
              <TrajectorySVG
                historical={moodProjection.historical}
                pessimistic={moodProjection.pessimistic}
                current={moodProjection.current}
                ambitious={moodProjection.ambitious}
                bandLow={moodProjection.bandLow}
                bandHigh={moodProjection.bandHigh}
                yLabel="Mood /10"
                formatY={(v) => v.toFixed(1)}
              />
              <p className="text-[11px] text-muted-foreground">
                Based on <strong>{moodEntries.length}</strong> mood check-ins. Slope:{" "}
                <strong>{moodFit ? (moodFit.fit.slope * 30).toFixed(2) : "—"} pts/mo</strong>. Mood is volatile; wide bands are honest.
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Need at least 2 mood entries. Log on <a className="underline" href="/mental-health">Mental Health</a>.</p>
          )}
        </CardContent>
      </Card>

      {/* HABIT CONSISTENCY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" /> Habit Consistency Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {habitConsistencyProj && habitStats ? (
            <>
              <TrajectorySVG
                historical={habitConsistencyProj.historical}
                pessimistic={habitConsistencyProj.pessimistic}
                current={habitConsistencyProj.current}
                ambitious={habitConsistencyProj.ambitious}
                bandLow={habitConsistencyProj.bandLow}
                bandHigh={habitConsistencyProj.bandHigh}
                yLabel="% daily"
                formatY={(v) => `${Math.round(v)}%`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                  <p className="text-[10px] text-emerald-700">Strongest (last 30d)</p>
                  <p className="font-semibold text-emerald-900">{habitStats.strongest.habit.name}</p>
                  <p className="text-[10px] text-emerald-700">{Math.round(habitStats.strongest.pct30 * 100)}% of days</p>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                  <p className="text-[10px] text-amber-700">Weakest (last 30d)</p>
                  <p className="font-semibold text-amber-900">{habitStats.weakest.habit.name}</p>
                  <p className="text-[10px] text-amber-700">{Math.round(habitStats.weakest.pct30 * 100)}% of days</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No habits tracked. Start on <a className="underline" href="/daily-habits">Daily Habits</a>.</p>
          )}
        </CardContent>
      </Card>

      {/* WHAT-IF: RAISE 1 HABIT TO DAILY */}
      {habitLift && habitStats && (
        <Card className="border-2 border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" /> If You Raised <em>{habitLift.habit.name}</em> to Daily
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground">Current</p>
                <p className="font-semibold">{Math.round(habitLift.currentPct * 100)}% of days</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">+{Math.round((1 - habitLift.currentPct) * 30)} extra reps/mo</p>
                <p className="font-semibold">{Math.round((1 - habitLift.currentPct) * 365)} extra/yr</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Over {horizonYears} years</p>
                <p className="font-semibold">{Math.round((1 - habitLift.currentPct) * 365 * horizonYears)} extra reps</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-900 mt-3 leading-relaxed">
              Raising your weakest habit from <strong>{Math.round(habitLift.currentPct * 100)}%</strong> to <strong>100%</strong> adds about{" "}
              <strong>{habitLift.deltaConsistencyPoints.toFixed(1)} points</strong> to your daily habit-consistency score — which flows into your flourishing score via the habits dimension ({(0.15 * 100).toFixed(0)}% weight).
            </p>
          </CardContent>
        </Card>
      )}

      {/* MONTHLY MILESTONES (finance) */}
      {nwMilestones.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-500" /> Yearly Net-Worth Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-1.5 pr-3">Year</th>
                    <th className="py-1.5 pr-3">Age</th>
                    <th className="py-1.5 pr-3 text-right">Pessimistic</th>
                    <th className="py-1.5 pr-3 text-right">Current pace</th>
                    <th className="py-1.5 text-right">Ambitious</th>
                  </tr>
                </thead>
                <tbody>
                  {nwMilestones.map(m => (
                    <tr key={m.year} className="border-b border-muted/30">
                      <td className="py-1.5 pr-3 font-medium">Year {m.year}</td>
                      <td className="py-1.5 pr-3">{age + m.year}</td>
                      <td className="py-1.5 pr-3 text-right text-red-600">${Math.round(m.pessimistic).toLocaleString()}</td>
                      <td className="py-1.5 pr-3 text-right text-violet-700 font-semibold">${Math.round(m.current).toLocaleString()}</td>
                      <td className="py-1.5 text-right text-emerald-700">${Math.round(m.ambitious).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UNCERTAINTY NOTE */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <Badge variant="secondary" className="mr-1.5">Honest caveat</Badge>
            These projections assume your current rates continue. They do not account for market crashes, career changes, health
            shocks, new relationships, children, or the thousand ways life actually unfolds. The widening confidence bands
            (±1.5 residual σ · √t) reflect that the further you look, the less you know. Use these lines as <em>direction</em>,
            not destination. The number that matters most is the one you move this week.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress Dashboard</a>
        <a href="/compound-interest" className="text-sm text-blue-600 hover:underline">Compound Interest</a>
        <a href="/flourishing-score" className="text-sm text-violet-600 hover:underline">Flourishing Score</a>
        <a href="/daily-habits" className="text-sm text-orange-600 hover:underline">Daily Habits</a>
        <a href="/net-worth" className="text-sm text-amber-600 hover:underline">Net Worth</a>
      </div>
    </div>
  )
}
