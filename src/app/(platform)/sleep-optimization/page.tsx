"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Moon, Brain, Sun, Thermometer, Eye, Clock, Apple, Bed, Pill, Dumbbell, AlertTriangle, Heart, Activity, ChevronDown, ChevronUp, CheckCircle, TrendingUp, TrendingDown, Minus, Zap, Target, BarChart3, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

function Collapsible({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
        <span className="text-sm font-semibold flex-1">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

function ProtocolList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <CheckCircle className={cn("h-3 w-3 shrink-0 mt-0.5", color)} />
          <p className="text-[10px] text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  )
}

// ===== Helpers =====
function dateKey(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d
  return x.toISOString().split("T")[0]
}

function timeToMinutes(t: string | null | undefined): number | null {
  if (!t || typeof t !== "string") return null
  const m = t.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  const h = Number(m[1]); const mm = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return null
  return h * 60 + mm
}

// Normalize bedtime to a signed-minutes-from-midnight on a wrap-around axis
// Bedtimes between 18:00 and 23:59 are represented as negative (pre-midnight)
// so the average of 23:30 and 00:30 comes out correctly.
function bedtimeToSignedMinutes(t: string | null | undefined): number | null {
  const raw = timeToMinutes(t)
  if (raw === null) return null
  return raw >= 18 * 60 ? raw - 24 * 60 : raw
}

function signedToClockLabel(signed: number): string {
  let m = Math.round(signed)
  while (m < 0) m += 24 * 60
  m = m % (24 * 60)
  const h = Math.floor(m / 60); const mm = m % 60
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mm.toString().padStart(2, "0")} ${ampm}`
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b }
  const den = Math.sqrt(dx * dy)
  if (den === 0) return null
  return num / den
}

type SleepRow = {
  date: string
  recordedAt: string
  hours: number
  quality: number | null
  bedtime: string | null
  wakeTime: string | null
  bedSigned: number | null   // signed minutes (negative = pre-midnight)
  wakeMinutes: number | null
}

function qualityColor(q: number | null, hours: number): string {
  // If quality is provided use it; else infer from hours vs 8hr target
  const score = q ?? (hours >= 7.5 ? 8 : hours >= 6.5 ? 6 : hours >= 5.5 ? 4 : 3)
  if (score >= 8) return "#10b981" // emerald
  if (score >= 6) return "#6366f1" // indigo
  if (score >= 4) return "#f59e0b" // amber
  return "#ef4444" // red
}

export default function SleepOptimizationPage() {
  // ===== Data sources =====
  const { data: sleepData } = useSWR("/api/health/entries?type=SLEEP&limit=60", secureFetcher)
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=60", secureFetcher)
  const { data: exerciseData } = useSWR("/api/health/entries?type=EXERCISE&limit=60", secureFetcher)

  // localStorage focus history
  const [focusByDate, setFocusByDate] = useState<Record<string, number>>({})
  useEffect(() => {
    try {
      const fh = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      const map: Record<string, number> = {}
      for (const f of fh) {
        if (f?.date && typeof f.focusMinutes === "number") map[f.date] = f.focusMinutes
      }
      setFocusByDate(map)
    } catch {}
  }, [])

  // ===== Parse sleep rows =====
  const rows: SleepRow[] = useMemo(() => {
    const entries = (sleepData?.entries ?? []) as any[]
    const out: SleepRow[] = []
    for (const e of entries) {
      let d: any = {}
      try { d = JSON.parse(e.data || "{}") } catch {}
      const hours = Number(d.hoursSlept ?? d.hours ?? 0)
      if (!Number.isFinite(hours) || hours <= 0) continue
      const recAt: string = e.recordedAt || e.createdAt || new Date().toISOString()
      out.push({
        date: dateKey(recAt),
        recordedAt: recAt,
        hours,
        quality: typeof d.quality === "number" ? d.quality : null,
        bedtime: typeof d.bedtime === "string" ? d.bedtime : null,
        wakeTime: typeof d.wakeTime === "string" ? d.wakeTime : null,
        bedSigned: bedtimeToSignedMinutes(d.bedtime),
        wakeMinutes: timeToMinutes(d.wakeTime),
      })
    }
    // Sort chronological asc
    out.sort((a, b) => a.date.localeCompare(b.date))
    // Dedupe by date — keep most recent log per date
    const byDate = new Map<string, SleepRow>()
    for (const r of out) byDate.set(r.date, r)
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [sleepData])

  const last30 = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
    const cutoffKey = dateKey(cutoff)
    return rows.filter(r => r.date >= cutoffKey)
  }, [rows])

  // ===== Mood lookup by date =====
  const moodByDate: Record<string, number> = useMemo(() => {
    const map: Record<string, number[]> = {}
    for (const m of (moodData?.entries ?? []) as any[]) {
      const d = dateKey(m.recordedAt || m.createdAt || Date.now())
      if (typeof m.score === "number") (map[d] ||= []).push(m.score)
    }
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(map)) out[k] = v.reduce((a, b) => a + b, 0) / v.length
    return out
  }, [moodData])

  const exerciseDates: Set<string> = useMemo(() => {
    const set = new Set<string>()
    for (const e of (exerciseData?.entries ?? []) as any[]) set.add(dateKey(e.recordedAt || e.createdAt || Date.now()))
    return set
  }, [exerciseData])

  // ===== Core metrics =====
  const avgDuration = last30.length ? Math.round((last30.reduce((s, r) => s + r.hours, 0) / last30.length) * 10) / 10 : null
  const qualityVals = last30.map(r => r.quality).filter((q): q is number => typeof q === "number")
  const avgQuality = qualityVals.length ? Math.round((qualityVals.reduce((a, b) => a + b, 0) / qualityVals.length) * 10) / 10 : null

  // Sleep debt = total deficit vs 8hr target (capped at 0 surplus per night)
  const sleepDebt = last30.reduce((d, r) => d + Math.max(0, 8 - r.hours), 0)
  const sleepDebtRounded = Math.round(sleepDebt * 10) / 10

  // Consistency: stddev of bedtime (lower is better). Normalize to 0-100.
  const bedSignedVals = last30.map(r => r.bedSigned).filter((v): v is number => typeof v === "number")
  const bedtimeStdMin = bedSignedVals.length >= 3 ? stdDev(bedSignedVals) : null
  // 0 std = 100 score. 90min std = 0 score. Linear between.
  const consistencyScore = bedtimeStdMin === null ? null : Math.max(0, Math.min(100, Math.round(100 - (bedtimeStdMin / 90) * 100)))

  // ===== Social jetlag: weekday vs weekend sleep gap =====
  const social = useMemo(() => {
    const weekdayDur: number[] = []
    const weekendDur: number[] = []
    const weekdayBed: number[] = []
    const weekendBed: number[] = []
    for (const r of last30) {
      const dow = new Date(r.date + "T00:00:00").getDay() // 0 Sun, 6 Sat
      const isWeekend = dow === 0 || dow === 6
      if (isWeekend) {
        weekendDur.push(r.hours)
        if (r.bedSigned !== null) weekendBed.push(r.bedSigned)
      } else {
        weekdayDur.push(r.hours)
        if (r.bedSigned !== null) weekdayBed.push(r.bedSigned)
      }
    }
    const avg = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null
    const wkdayAvgDur = avg(weekdayDur)
    const wkendAvgDur = avg(weekendDur)
    const wkdayAvgBed = avg(weekdayBed)
    const wkendAvgBed = avg(weekendBed)
    const durGap = wkdayAvgDur !== null && wkendAvgDur !== null ? wkendAvgDur - wkdayAvgDur : null
    const bedGapMin = wkdayAvgBed !== null && wkendAvgBed !== null ? Math.abs(wkendAvgBed - wkdayAvgBed) : null
    return { wkdayAvgDur, wkendAvgDur, wkdayAvgBed, wkendAvgBed, durGap, bedGapMin,
      weekdayCount: weekdayDur.length, weekendCount: weekendDur.length }
  }, [last30])

  // ===== Optimal bedtime: correlate bedtime with next-day mood + focus =====
  const optimal = useMemo(() => {
    // For each sleep row with a bedtime, look up next-day mood and focus
    const items: { bedSigned: number; bedLabel: string; nextMood: number | null; nextFocus: number | null; score: number | null }[] = []
    for (const r of rows) {
      if (r.bedSigned === null) continue
      // Next day = date of sleep log + 1 day (the day you wake into)
      const next = new Date(r.date + "T00:00:00"); next.setDate(next.getDate() + 1)
      const nk = dateKey(next)
      const nextMood = moodByDate[nk] ?? null
      const nextFocus = focusByDate[nk] ?? null
      // Normalized composite "next-day performance" score:
      // mood on 1-10 scale; focus normalized to 0-120 min window → 0-10
      let score: number | null = null
      if (nextMood !== null || nextFocus !== null) {
        const parts: number[] = []
        if (nextMood !== null) parts.push(nextMood)
        if (nextFocus !== null) parts.push(Math.max(0, Math.min(10, nextFocus / 12)))
        score = parts.reduce((s, v) => s + v, 0) / parts.length
      }
      items.push({
        bedSigned: r.bedSigned,
        bedLabel: signedToClockLabel(r.bedSigned),
        nextMood,
        nextFocus,
        score,
      })
    }

    const withScore = items.filter(i => i.score !== null) as { bedSigned: number; bedLabel: string; nextMood: number | null; nextFocus: number | null; score: number }[]
    if (withScore.length < 3) return { bucket: null, corr: null, sampleSize: withScore.length, items: withScore }

    // Bucket bedtimes into 30-minute windows, average score per bucket, pick best
    const buckets = new Map<number, { sum: number; n: number; center: number }>()
    for (const it of withScore) {
      const b = Math.round(it.bedSigned / 30) * 30
      const cur = buckets.get(b) ?? { sum: 0, n: 0, center: b }
      cur.sum += it.score; cur.n += 1
      buckets.set(b, cur)
    }
    // Only consider buckets with >= 2 samples
    const validBuckets = Array.from(buckets.values()).filter(b => b.n >= 2)
    const bestBucket = validBuckets.length
      ? validBuckets.reduce((best, b) => (b.sum / b.n > best.sum / best.n ? b : best))
      : null
    const bedSignedArr = withScore.map(i => i.bedSigned)
    const scoreArr = withScore.map(i => i.score)
    const corr = pearson(bedSignedArr, scoreArr)
    return {
      bucket: bestBucket ? { center: bestBucket.center, avg: Math.round((bestBucket.sum / bestBucket.n) * 10) / 10, n: bestBucket.n } : null,
      corr,
      sampleSize: withScore.length,
      items: withScore,
    }
  }, [rows, moodByDate, focusByDate])

  // ===== Best sleep day =====
  const bestDay = useMemo(() => {
    if (!last30.length) return null
    const ranked = [...last30].sort((a, b) => {
      const qa = a.quality ?? a.hours; const qb = b.quality ?? b.hours
      if (qb !== qa) return qb - qa
      return b.hours - a.hours
    })
    const best = ranked[0]
    if (!best) return null
    // What did the user do that day (or the day leading into it)?
    const exercisedPrevDay = (() => {
      const prev = new Date(best.date + "T00:00:00"); prev.setDate(prev.getDate() - 1)
      return exerciseDates.has(dateKey(prev))
    })()
    const exercisedSameDay = exerciseDates.has(best.date)
    const prevDayKey = (() => { const d = new Date(best.date + "T00:00:00"); d.setDate(d.getDate() - 1); return dateKey(d) })()
    const prevMood = moodByDate[prevDayKey] ?? null
    return { row: best, exercisedPrevDay, exercisedSameDay, prevMood }
  }, [last30, exerciseDates, moodByDate])

  // ===== Worst-night signal =====
  const worstDay = useMemo(() => {
    if (!last30.length) return null
    const ranked = [...last30].sort((a, b) => {
      const qa = a.quality ?? a.hours; const qb = b.quality ?? b.hours
      if (qa !== qb) return qa - qb
      return a.hours - b.hours
    })
    return ranked[0]
  }, [last30])

  // ===== Recommendations from real patterns =====
  const recommendations: { text: string; tone: "good" | "warn" | "alert" }[] = useMemo(() => {
    const out: { text: string; tone: "good" | "warn" | "alert" }[] = []
    if (avgDuration !== null) {
      if (avgDuration < 6.5) out.push({ text: `Your 30-day average is ${avgDuration}hrs — well below the 7-9hr adult range. Cognitive performance drops ~40% after just one night under 6hrs. Prioritize an earlier bedtime, not a later wake.`, tone: "alert" })
      else if (avgDuration < 7) out.push({ text: `Averaging ${avgDuration}hrs over 30 days. You're running a chronic deficit — target +30min earlier bedtime for a week and re-measure.`, tone: "warn" })
      else if (avgDuration > 9.2) out.push({ text: `Averaging ${avgDuration}hrs — unusually high. If unrefreshing, consider screening for sleep apnea, depression, or underlying inflammation.`, tone: "warn" })
      else out.push({ text: `${avgDuration}hrs average puts you squarely in the healthy 7-9hr band. Hold this and optimize quality next.`, tone: "good" })
    }
    if (consistencyScore !== null && bedtimeStdMin !== null) {
      if (consistencyScore < 50) out.push({ text: `Your bedtime varies by ±${Math.round(bedtimeStdMin)}min — classic social jetlag territory. Anchor wake time first; bedtime will follow.`, tone: "alert" })
      else if (consistencyScore < 75) out.push({ text: `Bedtime stddev is ${Math.round(bedtimeStdMin)}min. Tighten to <30min for measurably better REM architecture.`, tone: "warn" })
      else out.push({ text: `Bedtime consistency score ${consistencyScore}/100 — excellent. Your circadian clock is well anchored.`, tone: "good" })
    }
    if (social.bedGapMin !== null && social.bedGapMin >= 60) {
      out.push({ text: `Weekend bedtime drifts ${Math.round(social.bedGapMin)}min from weekdays — equivalent to flying across a timezone every Friday. Monday cognition pays the price.`, tone: "warn" })
    }
    if (sleepDebtRounded > 10) {
      out.push({ text: `Accumulated sleep debt of ${sleepDebtRounded}hrs over the last 30 days. You cannot fully repay, but you can stop accumulating — protect a 7.5hr minimum tonight.`, tone: "warn" })
    }
    if (optimal.bucket) {
      out.push({ text: `Your next-day mood/focus peaks when bedtime is near ${signedToClockLabel(optimal.bucket.center)} (n=${optimal.bucket.n}, score ${optimal.bucket.avg}/10). Aim for that window.`, tone: "good" })
    }
    if (bestDay?.exercisedPrevDay || bestDay?.exercisedSameDay) {
      out.push({ text: `Your best-sleep night followed a day you exercised. Exercise is the strongest non-behavioral sleep intervention in your data.`, tone: "good" })
    }
    if (avgQuality !== null && avgQuality < 5) {
      out.push({ text: `Subjective quality averaging ${avgQuality}/10. Cool the room to 65-68°F, blackout the light, and cut caffeine by noon for 7 days — then re-rate.`, tone: "warn" })
    }
    return out
  }, [avgDuration, avgQuality, consistencyScore, bedtimeStdMin, sleepDebtRounded, social, optimal, bestDay])

  const hasData = rows.length > 0
  const hasEnough = last30.length >= 3

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Sleep Optimization</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sleep is the foundation of every system in your body. Optimize it first — everything else improves downstream.
        </p>
      </div>

      {/* ===== REAL ANALYTICS ===== */}
      {!hasData && (
        <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/20">
          <CardContent className="p-5 text-center space-y-2">
            <Bed className="h-6 w-6 mx-auto text-indigo-500" />
            <p className="text-sm font-semibold">No sleep logs yet</p>
            <p className="text-xs text-muted-foreground">
              Log a sleep entry on the <a href="/health" className="text-indigo-600 hover:underline">health page</a> (hours, quality, bedtime, wake time) and this section will fill with your personal analytics.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          {/* Top-level metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                <p className="text-xl font-bold">{avgDuration !== null ? avgDuration : "—"}<span className="text-[10px] text-muted-foreground ml-0.5">hrs</span></p>
                <p className="text-[10px] text-muted-foreground">Avg duration (30d)</p>
                {avgDuration !== null && (
                  <p className={cn("text-[10px] font-medium", avgDuration >= 7 && avgDuration <= 9 ? "text-emerald-600" : avgDuration < 7 ? "text-amber-600" : "text-blue-600")}>
                    {avgDuration >= 7 && avgDuration <= 9 ? "In range" : avgDuration < 7 ? "Below target" : "Above range"}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Sparkles className="h-4 w-4 mx-auto mb-1 text-violet-500" />
                <p className="text-xl font-bold">{avgQuality !== null ? avgQuality : "—"}<span className="text-[10px] text-muted-foreground ml-0.5">/10</span></p>
                <p className="text-[10px] text-muted-foreground">Avg quality</p>
                {avgQuality === null && <p className="text-[9px] text-muted-foreground">Log quality to track</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <AlertTriangle className={cn("h-4 w-4 mx-auto mb-1", sleepDebtRounded > 10 ? "text-red-500" : sleepDebtRounded > 5 ? "text-amber-500" : "text-emerald-500")} />
                <p className="text-xl font-bold">{sleepDebtRounded}<span className="text-[10px] text-muted-foreground ml-0.5">hrs</span></p>
                <p className="text-[10px] text-muted-foreground">Sleep debt vs 8hr</p>
                <p className={cn("text-[10px] font-medium", sleepDebtRounded > 10 ? "text-red-600" : sleepDebtRounded > 5 ? "text-amber-600" : "text-emerald-600")}>
                  {sleepDebtRounded > 10 ? "Significant" : sleepDebtRounded > 5 ? "Moderate" : "Minimal"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Target className={cn("h-4 w-4 mx-auto mb-1", consistencyScore !== null && consistencyScore >= 75 ? "text-emerald-500" : consistencyScore !== null && consistencyScore >= 50 ? "text-amber-500" : "text-rose-500")} />
                <p className="text-xl font-bold">{consistencyScore !== null ? consistencyScore : "—"}<span className="text-[10px] text-muted-foreground ml-0.5">/100</span></p>
                <p className="text-[10px] text-muted-foreground">Consistency</p>
                {bedtimeStdMin !== null && <p className="text-[9px] text-muted-foreground">±{Math.round(bedtimeStdMin)}min bedtime</p>}
              </CardContent>
            </Card>
          </div>

          {/* 30-day duration chart */}
          {hasEnough && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-500" /> 30-Day Sleep Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Build a 30-day index from today going back, filling missing days
                  const days: { date: string; row: SleepRow | null }[] = []
                  const byDate = new Map(last30.map(r => [r.date, r]))
                  for (let i = 29; i >= 0; i--) {
                    const d = new Date(); d.setDate(d.getDate() - i)
                    const k = dateKey(d)
                    days.push({ date: k, row: byDate.get(k) ?? null })
                  }
                  const w = 600, h = 180
                  const pad = { t: 12, r: 12, b: 28, l: 32 }
                  const innerW = w - pad.l - pad.r
                  const innerH = h - pad.t - pad.b
                  const maxY = 12 // 12hr ceiling
                  const barW = innerW / 30 - 2
                  const yAt = (v: number) => pad.t + innerH - (v / maxY) * innerH
                  return (
                    <>
                      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40" preserveAspectRatio="none">
                        {/* Target band 7-9hr */}
                        <rect x={pad.l} y={yAt(9)} width={innerW} height={yAt(7) - yAt(9)} fill="#10b981" opacity={0.08} />
                        <line x1={pad.l} x2={w - pad.r} y1={yAt(8)} y2={yAt(8)} stroke="#10b981" strokeDasharray="3 3" strokeWidth={0.7} opacity={0.6} />
                        {/* Y gridlines */}
                        {[0, 4, 8, 12].map(v => (
                          <g key={v}>
                            <line x1={pad.l} x2={w - pad.r} y1={yAt(v)} y2={yAt(v)} stroke="currentColor" className="text-muted/20" strokeWidth={0.5} />
                            <text x={pad.l - 4} y={yAt(v) + 3} textAnchor="end" fontSize="8" className="fill-muted-foreground">{v}h</text>
                          </g>
                        ))}
                        {/* Bars */}
                        {days.map((d, i) => {
                          const x = pad.l + i * (innerW / 30) + 1
                          if (!d.row) return (
                            <rect key={i} x={x} y={yAt(0.15)} width={barW} height={yAt(0) - yAt(0.15)} fill="currentColor" className="text-muted/30" />
                          )
                          const y = yAt(d.row.hours)
                          const barH = yAt(0) - y
                          return (
                            <rect key={i} x={x} y={y} width={barW} height={barH} fill={qualityColor(d.row.quality, d.row.hours)} rx={1}>
                              <title>{d.date}: {d.row.hours}hrs{d.row.quality !== null ? ` (Q ${d.row.quality}/10)` : ""}</title>
                            </rect>
                          )
                        })}
                        {/* X labels (every 5 days) */}
                        {days.filter((_, i) => i % 5 === 0 || i === 29).map((d, i, arr) => {
                          const idx = days.indexOf(d)
                          const x = pad.l + idx * (innerW / 30) + barW / 2
                          const label = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          return <text key={i} x={x} y={h - 10} textAnchor="middle" fontSize="8" className="fill-muted-foreground">{label}</text>
                        })}
                      </svg>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#10b981" }} /> 8+</span>
                          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#6366f1" }} /> 6-7</span>
                          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#f59e0b" }} /> 4-5</span>
                          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#ef4444" }} /> &lt;4</span>
                        </div>
                        <span>{last30.length}/30 nights logged</span>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Sleep-Wake Heatmap */}
          {hasEnough && last30.some(r => r.bedSigned !== null || r.wakeMinutes !== null) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-500" /> Sleep-Wake Consistency (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // 24-hour grid, 30 rows (one per day)
                  const w = 600, h = 220
                  const pad = { t: 14, r: 8, b: 22, l: 30 }
                  const innerW = w - pad.l - pad.r
                  const innerH = h - pad.t - pad.b
                  const cellW = innerW / 24
                  const rowH = innerH / 30
                  const days: { date: string; row: SleepRow | null }[] = []
                  const byDate = new Map(last30.map(r => [r.date, r]))
                  for (let i = 29; i >= 0; i--) {
                    const d = new Date(); d.setDate(d.getDate() - i)
                    days.push({ date: dateKey(d), row: byDate.get(dateKey(d)) ?? null })
                  }
                  // Render asleep band per day: from bedtime to waketime (wrap if crosses midnight)
                  return (
                    <>
                      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56" preserveAspectRatio="none">
                        {/* Hour gridlines */}
                        {Array.from({ length: 25 }).map((_, hr) => (
                          <line key={hr} x1={pad.l + hr * cellW} x2={pad.l + hr * cellW} y1={pad.t} y2={pad.t + innerH} stroke="currentColor" className="text-muted/15" strokeWidth={0.4} />
                        ))}
                        {/* Day rows */}
                        {days.map((d, di) => {
                          const y = pad.t + di * rowH
                          const bars: React.ReactNode[] = []
                          // Background row
                          bars.push(<rect key={`bg-${di}`} x={pad.l} y={y} width={innerW} height={rowH - 0.5} fill="currentColor" className="text-muted/5" />)
                          if (d.row) {
                            const bed = d.row.bedtime ? timeToMinutes(d.row.bedtime) : null
                            const wake = d.row.wakeMinutes
                            if (bed !== null && wake !== null) {
                              const color = qualityColor(d.row.quality, d.row.hours)
                              // If bedtime is in evening (>= 18:00) it crosses midnight into wake next morning
                              if (bed >= 18 * 60 && wake < 12 * 60) {
                                // Evening half
                                const x1 = pad.l + (bed / 60) * cellW
                                bars.push(<rect key={`e-${di}`} x={x1} y={y + 1} width={pad.l + innerW - x1} height={rowH - 2} fill={color} opacity={0.75} />)
                                // Morning half
                                const x2End = pad.l + (wake / 60) * cellW
                                bars.push(<rect key={`m-${di}`} x={pad.l} y={y + 1} width={x2End - pad.l} height={rowH - 2} fill={color} opacity={0.75} />)
                              } else if (bed < wake) {
                                const x1 = pad.l + (bed / 60) * cellW
                                const x2 = pad.l + (wake / 60) * cellW
                                bars.push(<rect key={`s-${di}`} x={x1} y={y + 1} width={Math.max(1, x2 - x1)} height={rowH - 2} fill={color} opacity={0.75} />)
                              } else {
                                const x1 = pad.l + (bed / 60) * cellW
                                bars.push(<rect key={`w1-${di}`} x={x1} y={y + 1} width={pad.l + innerW - x1} height={rowH - 2} fill={color} opacity={0.75} />)
                                const x2 = pad.l + (wake / 60) * cellW
                                bars.push(<rect key={`w2-${di}`} x={pad.l} y={y + 1} width={x2 - pad.l} height={rowH - 2} fill={color} opacity={0.75} />)
                              }
                            } else {
                              // No time data — show a simple dot block in 22-06 band proportional to hours
                              const color = qualityColor(d.row.quality, d.row.hours)
                              bars.push(<rect key={`f-${di}`} x={pad.l + 22 * cellW} y={y + 1} width={d.row.hours * cellW * (2 / 8)} height={rowH - 2} fill={color} opacity={0.4} />)
                            }
                          }
                          return <g key={di}>{bars}</g>
                        })}
                        {/* X hour labels */}
                        {[0, 6, 12, 18, 24].map(hr => (
                          <text key={hr} x={pad.l + hr * cellW} y={h - 8} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
                            {hr === 0 ? "12a" : hr === 12 ? "12p" : hr === 24 ? "12a" : hr < 12 ? `${hr}a` : `${hr - 12}p`}
                          </text>
                        ))}
                        {/* Y date labels (every 5 days) */}
                        {days.filter((_, i) => i % 5 === 0 || i === 29).map((d, i) => {
                          const di = days.indexOf(d)
                          const y = pad.t + di * rowH + rowH / 2 + 3
                          return <text key={i} x={pad.l - 4} y={y} textAnchor="end" fontSize="7" className="fill-muted-foreground">{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}</text>
                        })}
                      </svg>
                      <p className="text-[9px] text-muted-foreground mt-1">
                        Each row is one night. Colored bars show time asleep. Tight vertical alignment = strong circadian anchor.
                      </p>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Weekday vs Weekend */}
          {(social.weekdayCount > 0 && social.weekendCount > 0) && (
            <Card className={cn("border-2", social.bedGapMin !== null && social.bedGapMin >= 60 ? "border-amber-200 bg-amber-50/20" : "border-emerald-200 bg-emerald-50/20")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className={cn("h-4 w-4", social.bedGapMin !== null && social.bedGapMin >= 60 ? "text-amber-500" : "text-emerald-500")} />
                  Social Jetlag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-2.5 bg-white/50">
                    <p className="text-[9px] text-muted-foreground">Weekday ({social.weekdayCount} nights)</p>
                    <p className="text-lg font-bold">{social.wkdayAvgDur !== null ? Math.round(social.wkdayAvgDur * 10) / 10 : "—"}<span className="text-[10px] text-muted-foreground ml-0.5">hrs</span></p>
                    {social.wkdayAvgBed !== null && <p className="text-[10px] text-muted-foreground">Bed ~{signedToClockLabel(social.wkdayAvgBed)}</p>}
                  </div>
                  <div className="rounded-lg border p-2.5 bg-white/50">
                    <p className="text-[9px] text-muted-foreground">Weekend ({social.weekendCount} nights)</p>
                    <p className="text-lg font-bold">{social.wkendAvgDur !== null ? Math.round(social.wkendAvgDur * 10) / 10 : "—"}<span className="text-[10px] text-muted-foreground ml-0.5">hrs</span></p>
                    {social.wkendAvgBed !== null && <p className="text-[10px] text-muted-foreground">Bed ~{signedToClockLabel(social.wkendAvgBed)}</p>}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {social.bedGapMin !== null && social.bedGapMin >= 60
                    ? <>Your bedtime shifts <strong>{Math.round(social.bedGapMin)} minutes</strong> on weekends — each hour of weekend drift is metabolically equivalent to flying one timezone east. Monday morning cognition and mood are measurably degraded.</>
                    : social.bedGapMin !== null
                    ? <>Only <strong>{Math.round(social.bedGapMin)} min</strong> weekend shift — your circadian rhythm stays anchored, which is rare and valuable.</>
                    : <>Add bedtime to your sleep logs to see your weekday/weekend drift.</>}
                  {social.durGap !== null && Math.abs(social.durGap) > 0.4 && (
                    <> You sleep <strong>{Math.abs(Math.round(social.durGap * 10) / 10)}hrs {social.durGap > 0 ? "more" : "less"}</strong> on weekends — {social.durGap > 0 ? "classic weekday debt, weekend recovery pattern" : "unusual inversion"}.</>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Optimal bedtime from cross-reference */}
          {optimal.sampleSize >= 3 && (
            <Card className="border-2 border-indigo-200 bg-indigo-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" /> Your Optimal Bedtime
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {optimal.bucket ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-indigo-700">{signedToClockLabel(optimal.bucket.center)}</p>
                      <Badge variant="outline" className="text-[9px] border-indigo-300 text-indigo-700">n={optimal.bucket.n} nights</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Cross-referenced against next-day mood and focus-session output.
                      Bedtimes near <strong>{signedToClockLabel(optimal.bucket.center)}</strong> were followed by an average next-day performance score of <strong>{optimal.bucket.avg}/10</strong> — your highest-yield window.
                      {optimal.corr !== null && Math.abs(optimal.corr) >= 0.2 && (
                        <> Overall bedtime-vs-performance correlation: <strong>r = {Math.round(optimal.corr * 100) / 100}</strong> ({optimal.corr < 0 ? "earlier bedtimes track with better next-day performance" : "later bedtimes track with better next-day performance — unusual; consider chronotype"}).</>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {optimal.sampleSize} nights have both a logged bedtime and a next-day mood/focus signal, but no 30-min bucket has enough samples yet. Keep logging — this insight sharpens with data.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Best sleep day insight */}
          {bestDay && (
            <Card className="border-2 border-emerald-200 bg-emerald-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" /> Best Sleep Night — What Preceded It
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2 items-baseline">
                  <p className="text-sm font-bold">{new Date(bestDay.row.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                  <Badge className="bg-emerald-500 text-[9px]">{bestDay.row.hours}hrs</Badge>
                  {bestDay.row.quality !== null && <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700">Quality {bestDay.row.quality}/10</Badge>}
                  {bestDay.row.bedtime && <Badge variant="outline" className="text-[9px]">Bed {bestDay.row.bedtime}</Badge>}
                  {bestDay.row.wakeTime && <Badge variant="outline" className="text-[9px]">Wake {bestDay.row.wakeTime}</Badge>}
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-1">
                  {bestDay.exercisedPrevDay && <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500" /> You exercised the day before</li>}
                  {bestDay.exercisedSameDay && <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500" /> You exercised that same day</li>}
                  {bestDay.prevMood !== null && <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500" /> Previous day mood: {Math.round(bestDay.prevMood * 10) / 10}/10</li>}
                  {!bestDay.exercisedPrevDay && !bestDay.exercisedSameDay && bestDay.prevMood === null && (
                    <li className="text-[10px]">Log exercise and mood alongside sleep to see what preceded your best nights.</li>
                  )}
                </ul>
                {worstDay && worstDay.date !== bestDay.row.date && (
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-emerald-200/50 mt-2">
                    Worst night: {new Date(worstDay.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {worstDay.hours}hrs{worstDay.quality !== null ? `, Q ${worstDay.quality}/10` : ""}. Delta vs best: {Math.round((bestDay.row.hours - worstDay.hours) * 10) / 10}hrs.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Personalized recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> Personalized Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <div key={i} className={cn(
                    "rounded-lg border p-2.5 flex items-start gap-2",
                    r.tone === "alert" ? "border-red-200 bg-red-50/40" : r.tone === "warn" ? "border-amber-200 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/40"
                  )}>
                    {r.tone === "alert" ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" /> :
                     r.tone === "warn" ? <TrendingDown className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" /> :
                     <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />}
                    <p className="text-[11px] leading-relaxed">{r.text}</p>
                  </div>
                ))}
                <p className="text-[9px] text-muted-foreground pt-1">Generated from your last 30 days of sleep, mood, focus, and exercise data.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ===== EDUCATIONAL CONTENT (preserved) ===== */}

      {/* Why it matters */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-indigo-900 mb-2">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Matthew Walker's research at UC Berkeley demonstrates that <strong>every major disease killing people in developed nations has a causal link to insufficient sleep</strong> — Alzheimer's, cancer, cardiovascular disease, obesity, diabetes, depression. Cognitive performance drops <strong>~40% after just one night of 6 hours of sleep</strong>. Reaction time, emotional regulation, memory consolidation, immune function, and hormone balance all degrade measurably. Sleep is not rest — it is active recovery, repair, and reorganization. There is no biological system that does not benefit from adequate sleep, and none that is not damaged by its absence.
          </p>
        </CardContent>
      </Card>

      {/* Sleep Architecture */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Sleep Architecture</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sleep is not one uniform state — it cycles through distinct stages in <Explain tip="Each sleep cycle lasts roughly 90 minutes. You go through 4-6 cycles per night. Earlier cycles are rich in deep sleep; later cycles have more REM. This is why both early and late sleep hours matter.">~90-minute cycles</Explain>, each serving different functions. Cutting sleep short doesn't just reduce quantity — it eliminates specific stages.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { stage: "N1 (Light Sleep)", pct: "~5%", desc: "Transition stage. Easy to wake from. Muscle twitches (hypnic jerks) are normal here." },
              { stage: "N2 (Core Sleep)", pct: "~45%", desc: "Sleep spindles and K-complexes consolidate motor skills and procedural memory. The bulk of your sleep." },
              { stage: "N3 (Deep / Slow-Wave)", pct: "~25%", desc: "Growth hormone release, immune repair, cellular restoration, memory consolidation. Dominates early-night cycles. Hardest to wake from." },
              { stage: "REM (Dream Sleep)", pct: "~25%", desc: "Emotional processing, creativity, memory integration. Dominates late-night cycles. Muscle paralysis prevents acting out dreams." },
            ].map((s, i) => (
              <div key={i} className="rounded-lg bg-indigo-50 border border-indigo-200 p-2.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-indigo-800">{s.stage}</p>
                  <Badge className="bg-indigo-500 text-[9px] py-0">{s.pct}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Key insight:</strong> Deep sleep concentrates in the first half of the night; REM concentrates in the second half. Going to bed late robs you of deep sleep. Waking early robs you of REM. Both are irreplaceable.
          </p>
        </CardContent>
      </Card>

      {/* Circadian Rhythm */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Circadian Rhythm & Light</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your <Explain tip="A 24-hour internal clock (actually ~24.2 hours) driven by the suprachiasmatic nucleus in the hypothalamus. It governs sleep-wake timing, hormone release, body temperature, and metabolism. Light is the primary signal that keeps it synchronized.">circadian rhythm</Explain> is the master clock governing when you feel alert and when you feel sleepy. Light is its primary input signal.
          </p>
          <div className="space-y-2">
            {[
              { time: "Morning (within 1hr of waking)", action: "Get 10-30 min of sunlight exposure. Triggers cortisol pulse that sets your wake clock and starts the ~16hr countdown to melatonin release. Overcast days still work — outdoor light is 10-50x brighter than indoor.", color: "text-amber-500" },
              { time: "Midday", action: "Cortisol naturally peaks, body temperature rises. Alertness is highest. This is your biological performance window.", color: "text-orange-500" },
              { time: "Evening (2hrs before bed)", action: "Melatonin begins rising in dim light. Blue and green wavelengths suppress melatonin production by up to 50%. Dim your environment, use warm/red lighting, wear blue-light-blocking glasses if needed.", color: "text-rose-500" },
              { time: "Night", action: "Core body temperature drops ~1-2°F. Melatonin peaks. Any bright light exposure (bathroom, phone) can reset the clock and delay sleep onset by 30-60 minutes.", color: "text-indigo-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 text-[9px] mt-0.5 border-indigo-300 text-indigo-700 min-w-[140px] justify-center">{item.time}</Badge>
                <p className="text-[10px] text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Optimization Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Collapsible title="Temperature" icon={Thermometer} iconColor="text-blue-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Core body temperature must drop 1-2°F for sleep onset. Manipulating this is one of the most powerful sleep tools.</p>
            <ProtocolList color="text-blue-400" items={[
              "Keep bedroom at 65-68°F (18-20°C) — cooler is almost always better for sleep",
              "Hot bath or shower 90 minutes before bed — warms skin, vasodilates, then core temp drops rapidly as you cool",
              "Warm feet, cool core — wear socks if extremities are cold, but keep the room cool",
              "Cooling mattress pads (e.g., Eight Sleep) can drop skin temperature and measurably increase deep sleep %",
              "Avoid heavy blankets that trap heat — or use a fan to keep air moving over exposed skin",
            ]} />
          </Collapsible>

          <Collapsible title="Light Exposure" icon={Sun} iconColor="text-amber-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Light is the single strongest input to your circadian clock. Get it right and sleep becomes dramatically easier.</p>
            <ProtocolList color="text-amber-400" items={[
              "Morning sunlight within 1 hour of waking: 10 min on clear days, 20-30 min on overcast — sets your entire circadian clock",
              "Blue-light-blocking glasses 2 hours before bed — blocks the wavelengths (460-480nm) that suppress melatonin",
              "Switch to red/amber lighting in the evening — red wavelengths have minimal impact on melatonin",
              "If you must use screens, enable night mode AND reduce brightness to minimum usable level",
              "Complete darkness for sleep — blackout curtains, cover LED indicators, no hallway light under the door",
            ]} />
          </Collapsible>

          <Collapsible title="Timing & Consistency" icon={Clock} iconColor="text-violet-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Consistent wake time is the single most impactful behavioral change. It anchors your entire circadian system.</p>
            <ProtocolList color="text-violet-400" items={[
              "Same wake time every day (including weekends) — this is more important than bedtime. Vary by no more than 30 minutes.",
              "Understand sleep pressure: adenosine builds during waking hours and creates sleepiness. Caffeine blocks adenosine receptors but doesn't eliminate the debt.",
              "Caffeine half-life is ~6 hours. A coffee at 2 PM means half the caffeine is still active at 8 PM. Cut off by noon for most people.",
              "Avoid naps after 3 PM — they reduce sleep pressure and delay nighttime sleep onset",
              "If you can't sleep within 20 minutes, get up and do something boring in dim light. Return when sleepy. Don't train your brain that bed = frustration.",
            ]} />
          </Collapsible>

          <Collapsible title="Nutrition" icon={Apple} iconColor="text-green-500">
            <p className="text-xs text-muted-foreground leading-relaxed">What and when you eat directly affects sleep onset, depth, and architecture.</p>
            <ProtocolList color="text-green-400" items={[
              "Magnesium glycinate (300-400mg before bed) — calms the nervous system and supports deep sleep. One of the best-supported sleep supplements.",
              "No large meals 2-3 hours before bed — digestion raises core temperature and can cause reflux in supine position",
              "Alcohol destroys REM sleep — even 1-2 drinks fragments sleep architecture. You may fall asleep faster but the quality is dramatically worse.",
              "Tart cherry juice contains natural melatonin precursors — 1 oz concentrate shown to increase sleep time by ~84 minutes in research",
              "High-glycemic carbs 4 hours before bed can increase tryptophan availability, but avoid simple sugars close to bed",
            ]} />
          </Collapsible>

          <Collapsible title="Environment" icon={Bed} iconColor="text-slate-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Your sleep environment should signal one thing to your brain: this is where sleep happens.</p>
            <ProtocolList color="text-slate-400" items={[
              "Dark: blackout curtains or a quality sleep mask. Even dim light through closed eyelids reduces melatonin.",
              "Cool: 65-68°F. Your thermostat is a sleep tool.",
              "Quiet: earplugs, white noise machine, or both. Intermittent noise (traffic, snoring) is worse than constant background.",
              "No screens in bed — reserve the bed exclusively for sleep. Your brain learns associations quickly.",
              "Dedicated sleep surface — a quality mattress and pillow matter. Replace pillows every 1-2 years, mattress every 7-10.",
            ]} />
          </Collapsible>

          <Collapsible title="Supplements" icon={Pill} iconColor="text-emerald-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Evidence-based supplements that support sleep without dependency. Always start with behavioral changes first.</p>
            <ProtocolList color="text-emerald-400" items={[
              "Magnesium glycinate (300-400mg) — best-supported, calms nervous system, most people are deficient",
              "Glycine (3g before bed) — lowers core body temperature, improves subjective sleep quality in multiple studies",
              "Tart cherry extract — natural melatonin and anti-inflammatory compounds",
              "Apigenin (50mg, from chamomile) — mild sedative, reduces anxiety. Andrew Huberman's stack includes this.",
              "L-theanine (100-200mg) — promotes alpha brain waves, reduces racing thoughts without sedation",
              "Note on melatonin: effective short-term for jet lag or shift work, but long-term exogenous use can downregulate natural production. Not recommended as a nightly supplement.",
            ]} />
          </Collapsible>

          <Collapsible title="Exercise" icon={Dumbbell} iconColor="text-orange-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Exercise is one of the most effective sleep interventions — but timing matters.</p>
            <ProtocolList color="text-orange-400" items={[
              "Morning or afternoon exercise improves deep sleep duration and reduces sleep onset latency",
              "Intense exercise within 2-3 hours of bed can delay sleep onset — raises core temp and cortisol",
              "Moderate exercise (walking, yoga) in the evening is generally fine and may help wind down",
              "Consistent exercisers show 65% improvement in daytime alertness and reduced daytime sleepiness",
              "Even 30 minutes of moderate activity improves sleep quality on that same night",
            ]} />
          </Collapsible>
        </CardContent>
      </Card>

      {/* What Kills Sleep */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Kills Sleep</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { factor: "Alcohol", detail: "Sedation is not sleep. Alcohol fragments sleep architecture, blocks REM by 20-50%, causes middle-of-night waking as the liver metabolizes it, and suppresses growth hormone." },
            { factor: "Caffeine after noon", detail: "Half-life of ~6 hours means a 2 PM coffee leaves 25% of the caffeine active at 2 AM. Blocks adenosine receptors, reducing both sleep pressure and deep sleep percentage." },
            { factor: "Blue light at night", detail: "Screens emit 460-480nm light that directly suppresses melatonin production via melanopsin receptors in the retina. Even 8 lux of blue light delays melatonin onset." },
            { factor: "Inconsistent schedule", detail: "Social jet lag — varying sleep/wake times by 2+ hours on weekends — disrupts circadian rhythm as severely as crossing time zones." },
            { factor: "Stress & cortisol", detail: "Elevated evening cortisol prevents the natural drop needed for sleep onset. Chronic stress keeps the HPA axis activated, fragmenting sleep architecture." },
            { factor: "Hot bedroom", detail: "Core temperature must drop for sleep initiation. A room above 70°F fights this process, reducing deep sleep and increasing nighttime awakenings." },
            { factor: "Large late meals", detail: "Digestion raises metabolic rate and core temperature. Lying down with a full stomach increases reflux risk. The GI system should be winding down, not working." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-red-50/50 border border-red-200 p-2.5">
              <p className="text-xs font-semibold text-red-800">{item.factor}</p>
              <p className="text-[10px] text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connection to Mood */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Sleep & Mood Connection
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In user data on this platform, <strong>sleep-mood correlation is consistently the strongest signal</strong> — stronger than exercise, nutrition, or social connection. One night of poor sleep increases amygdala reactivity by 60% (Walker et al.), meaning you are physiologically more anxious, irritable, and emotionally volatile. REM sleep specifically processes emotional memories — without it, negative experiences are not properly integrated, and they accumulate. If you track your mood on the <a href="/correlations" className="text-violet-600 hover:underline font-medium">correlations page</a>, sleep will likely emerge as the single most predictive variable.
          </p>
        </CardContent>
      </Card>

      {/* Connection to Fascia */}
      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Sleep & Fascia
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gil Hedley's cadaver research revealed that <strong>fascial adhesions ("fuzz") form overnight</strong> during the hours of immobility while you sleep. This is the stiffness you feel every morning — it is real, physical collagen cross-links forming between fascial layers. This is why <strong>morning movement is non-negotiable</strong>: even 5 minutes of whole-body stretching dissolves the overnight fuzz before it becomes permanent. Chronic immobility (sleeping in the same curled position, never stretching upon waking) allows these adhesions to compound, contributing to chronic stiffness and pain. See the <a href="/fascia" className="text-rose-600 hover:underline font-medium">fascia page</a> for protocols.
          </p>
        </CardContent>
      </Card>

      {/* Sources */}
      <SourceList sources={[
        { id: 1, title: "Why We Sleep: Unlocking the Power of Sleep and Dreams", authors: "Walker M", journal: "Scribner", year: 2017, type: "book", notes: "Foundational text on sleep science. Covers architecture, cognitive effects, disease links." },
        { id: 2, title: "Evidence for the circadian regulation of human sleep", authors: "Dijk DJ, Czeisler CA", journal: "Journal of Physiology", year: 1995, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/7738250/", notes: "Core circadian rhythm research — melatonin, cortisol timing." },
        { id: 3, title: "The effects of magnesium supplementation on subjective sleep quality", authors: "Abbasi B, Kimiagar M, et al.", journal: "Journal of Research in Medical Sciences", year: 2012, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/23853635/", notes: "Magnesium supplementation improved sleep quality in elderly." },
        { id: 4, title: "Short sleep duration and health outcomes: a systematic review", authors: "Itani O, Jike M, Watanabe N, Kaneita Y", journal: "Sleep Medicine", year: 2017, type: "review", url: "https://pubmed.ncbi.nlm.nih.gov/27568340/", notes: "<6hrs sleep: +13% mortality, +48% heart disease, +15% stroke risk." },
        { id: 5, title: "Evening use of light-emitting eReaders negatively affects sleep", authors: "Chang AM, Aeschbach D, Duffy JF, Czeisler CA", journal: "PNAS", year: 2014, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/25535358/", notes: "Blue light delays melatonin onset by 90 minutes." },
        { id: 6, title: "Effects of alcohol on sleep physiology", authors: "Ebrahim IO, Shapiro CM, Williams AJ, Fenwick PB", journal: "Alcoholism: Clinical and Experimental Research", year: 2013, type: "review", url: "https://pubmed.ncbi.nlm.nih.gov/23347102/", notes: "Alcohol disrupts REM sleep, fragments sleep architecture." },
        { id: 7, title: "Social jetlag and obesity", authors: "Roenneberg T, Allebrandt KV, Merrow M, Vetter C", journal: "Current Biology", year: 2012, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/22578422/", notes: "Weekday/weekend sleep schedule drift correlates with metabolic disease." },
      ]} />

      <div className="flex gap-3 flex-wrap">
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/correlations" className="text-sm text-violet-600 hover:underline">Correlations</a>
      </div>
    </div>
  )
}
