"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  Heart,
  Brain,
  Briefcase,
  Users,
  Activity,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LocalHabit {
  id: string
  name: string
  icon: string
  streak: number
  completedDates: string[]
  scheduledTime?: string
}

interface MoodEntry {
  id: string
  score: number
  recordedAt: string
}

type Dimension = "health" | "mind" | "work" | "relationships"

const DIMENSION_META: Record<Dimension, { label: string; icon: typeof Heart; color: string; ring: string; bar: string; bg: string; text: string }> = {
  health:       { label: "Body",          icon: Heart,     color: "emerald", ring: "ring-emerald-200",  bar: "bg-emerald-500",  bg: "bg-emerald-50",  text: "text-emerald-700" },
  mind:         { label: "Mind",          icon: Brain,     color: "violet",  ring: "ring-violet-200",   bar: "bg-violet-500",   bg: "bg-violet-50",   text: "text-violet-700" },
  work:         { label: "Work & Craft",  icon: Briefcase, color: "amber",   ring: "ring-amber-200",    bar: "bg-amber-500",    bg: "bg-amber-50",    text: "text-amber-700" },
  relationships:{ label: "Connection",    icon: Users,     color: "rose",    ring: "ring-rose-200",     bar: "bg-rose-500",     bg: "bg-rose-50",     text: "text-rose-700" },
}

// Keyword-based clustering heuristic. Runs entirely on-device against habit names.
const DIMENSION_KEYWORDS: Record<Dimension, string[]> = {
  health:        ["water", "hydrate", "sleep", "exercise", "move", "gym", "run", "walk", "stretch", "yoga", "fascia", "cold", "sauna", "supplement", "meal", "eat", "food", "nutrition", "fast", "steps", "lift", "strength", "cardio", "posture", "breath", "dental", "floss", "vitamin"],
  mind:          ["read", "book", "journal", "meditate", "meditation", "mindful", "learn", "study", "think", "reflect", "mood", "therapy", "gratitude", "review", "no screen", "no-screen", "screen", "dopamine", "focus", "practice"],
  work:          ["work", "deep", "write", "code", "build", "ship", "email", "inbox", "plan", "review", "invest", "budget", "save", "side hustle", "hustle", "project", "habit stack", "stack", "priorities"],
  relationships: ["call", "text", "family", "partner", "spouse", "friend", "date", "kids", "child", "parent", "gratitude", "connect", "community", "volunteer", "neighbor", "compliment", "listen"],
}

function classifyDimension(name: string): Dimension {
  const n = name.toLowerCase()
  let best: Dimension = "mind"
  let bestScore = 0
  for (const dim of Object.keys(DIMENSION_KEYWORDS) as Dimension[]) {
    const score = DIMENSION_KEYWORDS[dim].reduce((s, kw) => (n.includes(kw) ? s + 1 : s), 0)
    if (score > bestScore) { bestScore = score; best = dim }
  }
  return best
}

function iso(d: Date) { return d.toISOString().slice(0, 10) }
function daysAgo(n: number): string { return iso(new Date(Date.now() - n * 86400000)) }

// How many days since the first completion (the habit's observation window).
function observationWindow(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort()
  const first = new Date(sorted[0] + "T12:00:00").getTime()
  const today = new Date(iso(new Date()) + "T12:00:00").getTime()
  return Math.max(1, Math.floor((today - first) / 86400000) + 1)
}

function completionRate(dates: string[]): number {
  const window = observationWindow(dates)
  if (window === 0) return 0
  return Math.min(100, Math.round((dates.length / window) * 100))
}

function currentStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const set = new Set(dates)
  const today = iso(new Date())
  const yesterday = daysAgo(1)
  if (!set.has(today) && !set.has(yesterday)) return 0
  let n = 0
  for (let i = 0; i < 3650; i++) {
    const key = daysAgo(i)
    if (set.has(key)) n++
    else if (i > 0) break
  }
  return n
}

// Pearson correlation between two numeric vectors.
function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 3) return 0
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]; sy += ys[i]
    sxx += xs[i] * xs[i]; syy += ys[i] * ys[i]
    sxy += xs[i] * ys[i]
  }
  const num = n * sxy - sx * sy
  const den = Math.sqrt(Math.max(0, n * sxx - sx * sx)) * Math.sqrt(Math.max(0, n * syy - sy * sy))
  return den === 0 ? 0 : num / den
}

// Hand-rolled SVG sparkline.
function Sparkline({ values, width = 120, height = 28, stroke = "#059669" }: { values: number[]; width?: number; height?: number; stroke?: string }) {
  if (values.length === 0) return <svg width={width} height={height} />
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const range = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
  const last = values[values.length - 1]
  const lastX = (values.length - 1) * step
  const lastY = height - ((last - min) / range) * (height - 4) - 2
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={lastX} cy={lastY} r="2" fill={stroke} />
    </svg>
  )
}

// 30-day completion vector for a single habit (0 or 1 per day).
function habitVector(dates: string[], days = 30): number[] {
  const set = new Set(dates)
  const out: number[] = []
  for (let i = days - 1; i >= 0; i--) out.push(set.has(daysAgo(i)) ? 1 : 0)
  return out
}

const LEVEL_COLORS = ["bg-muted", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600", "bg-emerald-800"]
const LEVEL_LABELS = ["No activity", "1-2 actions", "3-5 actions", "6-10 actions", "10+ actions"]

export default function HabitsPage() {
  const [months, setMonths] = useState("3")
  const { data } = useSWR(`/api/habits?months=${months}`, fetcher)
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=90", fetcher)
  const [localHabits] = useSyncedStorage<LocalHabit[]>("hfp-daily-habits", [])

  const hasLocal = localHabits.length > 0
  const hasActivityData = !!data
  const mood: MoodEntry[] = moodData?.entries ?? []

  // Per-habit derived metrics, memoized. Uses observation-window completion (not a naive all-time %)
  // so young habits aren't punished for short history, and old habits aren't flattered by old gaps.
  const enriched = useMemo(() => {
    return localHabits.map((h) => {
      const dim = classifyDimension(h.name)
      const rate = completionRate(h.completedDates)
      const streak = currentStreak(h.completedDates)
      const total = h.completedDates.length
      const window = observationWindow(h.completedDates)
      const daysToAutomaticity = Math.max(0, 66 - total)
      const vec = habitVector(h.completedDates, 30)
      const last7 = vec.slice(-7).reduce((s, v) => s + v, 0)
      const prev7 = vec.slice(-14, -7).reduce((s, v) => s + v, 0)
      const trend = last7 - prev7 // -7..+7
      return { ...h, dim, rate, streak, total, window, daysToAutomaticity, vec, last7, prev7, trend }
    })
  }, [localHabits])

  // Aggregate health across all local habits.
  const aggregate = useMemo(() => {
    if (enriched.length === 0) return null
    const total = enriched.length
    const avgRate = Math.round(enriched.reduce((s, h) => s + h.rate, 0) / total)
    const ranked = [...enriched].sort((a, b) => b.rate - a.rate)
    const top3 = ranked.slice(0, 3)
    const bottom3 = ranked.slice(-3).reverse()
    const withTime = enriched.filter((h) => !!h.scheduledTime).length
    const withTimeRate = withTime > 0
      ? Math.round(enriched.filter((h) => h.scheduledTime).reduce((s, h) => s + h.rate, 0) / withTime)
      : 0
    const withoutTime = total - withTime
    const withoutTimeRate = withoutTime > 0
      ? Math.round(enriched.filter((h) => !h.scheduledTime).reduce((s, h) => s + h.rate, 0) / withoutTime)
      : 0
    return { total, avgRate, top3, bottom3, withTime, withoutTime, withTimeRate, withoutTimeRate }
  }, [enriched])

  // 30-day daily completion percentage (across ALL local habits).
  const dailyCompletion30 = useMemo(() => {
    const series: { date: string; pct: number }[] = []
    if (enriched.length === 0) return series
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i)
      const done = enriched.reduce((s, h) => s + (h.completedDates.includes(d) ? 1 : 0), 0)
      const pct = Math.round((done / enriched.length) * 100)
      series.push({ date: d, pct })
    }
    return series
  }, [enriched])

  // Dimension clusters.
  const clusters = useMemo(() => {
    const byDim: Record<Dimension, typeof enriched> = { health: [], mind: [], work: [], relationships: [] }
    for (const h of enriched) byDim[h.dim].push(h)
    return (Object.keys(byDim) as Dimension[]).map((dim) => {
      const items = byDim[dim]
      const avg = items.length === 0 ? 0 : Math.round(items.reduce((s, h) => s + h.rate, 0) / items.length)
      return { dim, items, avg }
    })
  }, [enriched])

  // Keystone detection: correlate each habit's 30-day daily completion with mood score on those days.
  const keystones = useMemo(() => {
    if (mood.length < 5 || enriched.length === 0) return []
    // Build daily average mood for the last 30 days (average if multiple entries per day).
    const moodByDay: Record<string, { sum: number; n: number }> = {}
    for (const m of mood) {
      const key = iso(new Date(m.recordedAt))
      if (!moodByDay[key]) moodByDay[key] = { sum: 0, n: 0 }
      moodByDay[key].sum += m.score
      moodByDay[key].n++
    }
    const days: string[] = []
    const moodVec: number[] = []
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i)
      if (moodByDay[d]) {
        days.push(d)
        moodVec.push(moodByDay[d].sum / moodByDay[d].n)
      }
    }
    if (moodVec.length < 5) return []
    return enriched
      .map((h) => {
        const hset = new Set(h.completedDates)
        const hv = days.map((d) => (hset.has(d) ? 1 : 0))
        const r = pearson(hv, moodVec)
        return { habit: h, r, overlap: days.length }
      })
      .filter((k) => Number.isFinite(k.r) && Math.abs(k.r) > 0.05)
      .sort((a, b) => b.r - a.r)
  }, [mood, enriched])

  // Contribution grid from /api/habits (cross-module activity).
  const grid = useMemo(() => {
    if (!data) return { weeks: [], monthly: [] as { month: string; active: number; total: number; actions: number }[] }
    const days = data.days as { date: string; level: number; total: number; modules: string[] }[]
    const weeks: (typeof days[0] | null)[][] = []
    let week: (typeof days[0] | null)[] = []
    if (days.length > 0) {
      const firstDay = new Date(days[0].date).getDay()
      for (let i = 0; i < firstDay; i++) week.push(null)
    }
    for (const d of days) {
      week.push(d)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

    const monthMap: Record<string, { active: number; total: number; actions: number }> = {}
    for (const d of days) {
      const m = d.date.slice(0, 7)
      if (!monthMap[m]) monthMap[m] = { active: 0, total: 0, actions: 0 }
      monthMap[m].total++
      if (d.level > 0) monthMap[m].active++
      monthMap[m].actions += d.total
    }
    const monthly = Object.entries(monthMap)
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => b.month.localeCompare(a.month))
    return { weeks, monthly }
  }, [data])

  if (!hasActivityData) return <div className="p-8 text-center text-muted-foreground">Loading habit data...</div>

  const { stats } = data
  const activeDaysPct = stats.totalDays > 0 ? Math.round((stats.activeDays / stats.totalDays) * 100) : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Habit Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregate health, keystone detection, and the 66-day road to automaticity. Pulls from your daily checklist and every module you touch.
          </p>
        </div>
        <Select value={months} onValueChange={setMonths}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 month</SelectItem>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{aggregate?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground">Active habits</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <p className="text-2xl font-bold text-violet-600">{aggregate?.avgRate ?? 0}%</p>
            <p className="text-xs text-muted-foreground">Avg completion</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className={cn("h-5 w-5 mx-auto mb-1", stats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
            <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{stats.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest streak</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-sky-500" />
            <p className="text-2xl font-bold text-sky-600">{stats.activeDays}/{stats.totalDays}</p>
            <p className="text-xs text-muted-foreground">Active days ({activeDaysPct}%)</p>
          </CardContent>
        </Card>
      </div>

      {/* 30-day trendline */}
      {dailyCompletion30.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> 30-Day Completion Trendline</CardTitle>
            <CardDescription>Percentage of your habits completed each day, last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={dailyCompletion30} />
          </CardContent>
        </Card>
      )}

      {/* Top / Bottom performers */}
      {aggregate && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                <Sparkles className="h-4 w-4" /> Top Performers
              </CardTitle>
              <CardDescription className="text-xs">Your strongest habits by completion rate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aggregate.top3.length === 0 && <p className="text-xs text-muted-foreground">No habits yet.</p>}
              {aggregate.top3.map((h) => <HabitRow key={h.id} h={h} tone="emerald" />)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-rose-700">
                <TrendingDown className="h-4 w-4" /> Needs Attention
              </CardTitle>
              <CardDescription className="text-xs">Lowest-rate habits — candidates for redesign or removal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aggregate.bottom3.length === 0 && <p className="text-xs text-muted-foreground">No habits yet.</p>}
              {aggregate.bottom3.map((h) => <HabitRow key={h.id} h={h} tone="rose" />)}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Habit-quality heuristic: scheduled time effect */}
      {aggregate && aggregate.total > 0 && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
              <Clock className="h-4 w-4" /> Habit-Quality Heuristic
            </CardTitle>
            <CardDescription className="text-xs">
              Research (Gollwitzer, 1999) shows implementation intentions — habits tied to a specific cue or time — are 2-3x more likely to stick.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aggregate.withTime === 0 ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                None of your {aggregate.total} habits have a scheduled time. Try binding one to a cue (&quot;after morning coffee&quot;) or a time (&quot;07:30&quot;) this week — it&apos;s the single highest-leverage change you can make.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">With scheduled time</p>
                  <p className="text-2xl font-bold text-indigo-600">{aggregate.withTimeRate}%</p>
                  <p className="text-[10px] text-muted-foreground">{aggregate.withTime} habit{aggregate.withTime === 1 ? "" : "s"}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Unscheduled</p>
                  <p className="text-2xl font-bold text-muted-foreground">{aggregate.withoutTimeRate}%</p>
                  <p className="text-[10px] text-muted-foreground">{aggregate.withoutTime} habit{aggregate.withoutTime === 1 ? "" : "s"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Life-dimension clusters */}
      {enriched.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4 text-slate-500" /> Life Dimensions</CardTitle>
            <CardDescription>Habits auto-clustered by dimension. A balanced stack touches body, mind, work, and connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clusters.map(({ dim, items, avg }) => {
              const meta = DIMENSION_META[dim]
              const Icon = meta.icon
              return (
                <div key={dim} className={cn("rounded-lg border p-3", meta.bg)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", meta.text)} />
                      <span className={cn("text-sm font-semibold", meta.text)}>{meta.label}</span>
                      <Badge variant="outline" className="text-[9px]">{items.length}</Badge>
                    </div>
                    <span className={cn("text-xs font-bold", meta.text)}>{avg}%</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">No habits in this dimension yet. A balanced life touches all four.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map((h) => <HabitRow key={h.id} h={h} tone={meta.color as "emerald" | "violet" | "amber" | "rose"} compact />)}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* 66-day automaticity */}
      {enriched.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-violet-500" /> Road to Automaticity</CardTitle>
            <CardDescription>
              Lally et al. (2010) found behaviors become automatic after a median of 66 days of repetition. Each bar is a habit&apos;s progress toward that threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...enriched].sort((a, b) => b.total - a.total).map((h) => {
              const pct = Math.min(100, Math.round((h.total / 66) * 100))
              const done = h.total >= 66
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="text-sm shrink-0 w-6 text-center">{h.icon}</span>
                  <span className="text-xs flex-1 truncate">{h.name}</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden max-w-[260px]">
                    <div
                      className={cn("h-full rounded-full transition-all", done ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-violet-400 to-violet-600")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">
                    {done ? "Automatic" : `${h.daysToAutomaticity}d to go`}
                  </span>
                  <span className="text-[10px] font-bold w-10 text-right shrink-0 tabular-nums">{h.total}/66</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Keystone habits */}
      {keystones.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
              <Sparkles className="h-4 w-4" /> Keystone Habits
            </CardTitle>
            <CardDescription className="text-xs">
              Habits whose completion days correlate with your mood score. Positive = you feel better on days you do it. Negative = the opposite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {keystones.slice(0, 5).map(({ habit, r, overlap }) => {
              const positive = r > 0
              const strength = Math.abs(r)
              const label = strength > 0.4 ? "Strong" : strength > 0.2 ? "Moderate" : "Weak"
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <span className="text-sm shrink-0 w-6 text-center">{habit.icon}</span>
                  <span className="text-xs flex-1 truncate">{habit.name}</span>
                  <span className={cn("text-[10px] font-semibold", positive ? "text-emerald-600" : "text-rose-600")}>
                    {positive ? "+" : ""}{r.toFixed(2)} r
                  </span>
                  <Badge variant="outline" className={cn("text-[9px]", positive ? "border-emerald-200 text-emerald-700" : "border-rose-200 text-rose-700")}>
                    {label} {positive ? "lift" : "drag"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground w-12 text-right">n={overlap}</span>
                </div>
              )
            })}
            <p className="text-[10px] text-muted-foreground italic pt-2">
              Correlation is not causation — but keystone lifts are where your leverage lives. Double down on the top one for a month.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state for local habits */}
      {!hasLocal && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center space-y-2">
            <Target className="h-6 w-6 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-semibold">Dashboard unlocks with your first habit</p>
            <p className="text-xs text-muted-foreground">
              Set up a daily checklist on the Daily Habits page. This dashboard will then show completion rates, life-dimension balance, 66-day automaticity progress, and keystone detection against your mood log.
            </p>
            <a href="/daily-habits" className="inline-block mt-2 text-xs text-emerald-600 hover:underline font-medium">Go to Daily Habits →</a>
          </CardContent>
        </Card>
      )}

      {/* Cross-module activity grid (original feature, preserved) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cross-Module Activity</CardTitle>
          <CardDescription>Every day you engaged with any module — health, mood, journal, education, governance, energy.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-[2px]" style={{ minWidth: "max-content" }}>
              <div className="flex items-center gap-[2px] mb-1">
                <div className="w-8" />
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="w-3 text-center text-[9px] text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="flex gap-[2px]">
                {grid.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={cn(
                          "w-3 h-3 rounded-[2px] transition-colors",
                          day ? LEVEL_COLORS[day.level] : "bg-transparent"
                        )}
                        title={day ? `${day.date}: ${day.total} actions (${day.modules.join(", ")})` : ""}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-[2px]", color)} title={LEVEL_LABELS[i]} />
            ))}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {grid.monthly.map(({ month, active, total }) => {
              const pct = total === 0 ? 0 : Math.round((active / total) * 100)
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                    {active}/{total} days
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Related navigation */}
      <div className="flex gap-3 flex-wrap text-sm">
        <a href="/daily-habits" className="text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/habit-science" className="text-violet-600 hover:underline">Habit Science</a>
        <a href="/habit-stack" className="text-teal-600 hover:underline">Habit Stack</a>
        <a href="/correlations" className="text-sky-600 hover:underline">Correlations</a>
        <a href="/insights" className="text-amber-600 hover:underline">Insights</a>
      </div>
    </div>
  )
}

// ---------- Subcomponents ----------

function HabitRow({
  h,
  tone,
  compact = false,
}: {
  h: {
    id: string
    name: string
    icon: string
    rate: number
    streak: number
    total: number
    trend: number
    vec: number[]
  }
  tone: "emerald" | "violet" | "amber" | "rose"
  compact?: boolean
}) {
  const strokeMap: Record<typeof tone, string> = {
    emerald: "#059669",
    violet:  "#7c3aed",
    amber:   "#d97706",
    rose:    "#e11d48",
  }
  const barMap: Record<typeof tone, string> = {
    emerald: "bg-emerald-500",
    violet:  "bg-violet-500",
    amber:   "bg-amber-500",
    rose:    "bg-rose-500",
  }
  const textMap: Record<typeof tone, string> = {
    emerald: "text-emerald-600",
    violet:  "text-violet-600",
    amber:   "text-amber-600",
    rose:    "text-rose-600",
  }
  const trendGlyph = h.trend > 0 ? "↑" : h.trend < 0 ? "↓" : "•"
  const trendClass = h.trend > 0 ? "text-emerald-600" : h.trend < 0 ? "text-rose-600" : "text-muted-foreground"

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm shrink-0 w-6 text-center">{h.icon}</span>
      <span className={cn("text-xs flex-1 truncate", compact && "text-[11px]")}>{h.name}</span>
      <Sparkline values={h.vec} stroke={strokeMap[tone]} width={compact ? 72 : 96} height={compact ? 18 : 22} />
      <div className={cn("h-1.5 bg-muted rounded-full overflow-hidden shrink-0", compact ? "w-14" : "w-20")}>
        <div className={cn("h-full", barMap[tone])} style={{ width: `${h.rate}%` }} />
      </div>
      <span className={cn("text-[10px] font-bold tabular-nums w-8 text-right shrink-0", textMap[tone])}>
        {h.rate}%
      </span>
      {h.streak > 0 && (
        <span className="text-[10px] text-orange-500 tabular-nums w-8 text-right shrink-0 inline-flex items-center justify-end gap-0.5">
          <Flame className="h-2.5 w-2.5" />{h.streak}
        </span>
      )}
      <span className={cn("text-[10px] w-4 text-right shrink-0", trendClass)} title={`Last 7 vs prior 7: ${h.trend > 0 ? "+" : ""}${h.trend}`}>
        {trendGlyph}
      </span>
    </div>
  )
}

function TrendChart({ data }: { data: { date: string; pct: number }[] }) {
  const W = 720
  const H = 120
  const PAD_L = 28
  const PAD_R = 8
  const PAD_T = 8
  const PAD_B = 18
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  if (data.length === 0) return null

  const xs = data.map((_, i) => PAD_L + (i / Math.max(1, data.length - 1)) * innerW)
  const ys = data.map((d) => PAD_T + (1 - d.pct / 100) * innerH)
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ")
  const areaPath = `${linePath} L${xs[xs.length - 1].toFixed(1)},${(PAD_T + innerH).toFixed(1)} L${xs[0].toFixed(1)},${(PAD_T + innerH).toFixed(1)} Z`

  // 7-day moving average.
  const ma: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - 6)
    const slice = data.slice(start, i + 1)
    ma.push(slice.reduce((s, d) => s + d.pct, 0) / slice.length)
  }
  const maY = ma.map((v) => PAD_T + (1 - v / 100) * innerH)
  const maPath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${maY[i].toFixed(1)}`).join(" ")

  const avg = data.reduce((s, d) => s + d.pct, 0) / data.length
  const avgY = PAD_T + (1 - avg / 100) * innerH

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet" className="min-w-[560px]">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y-axis gridlines + labels */}
        {[0, 25, 50, 75, 100].map((t) => {
          const y = PAD_T + (1 - t / 100) * innerH
          return (
            <g key={t}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={t === 0 || t === 100 ? "0" : "2 3"} />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{t}%</text>
            </g>
          )
        })}
        {/* Area */}
        <path d={areaPath} fill="url(#trendFill)" />
        {/* Daily line */}
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.55" />
        {/* 7d moving average (bolder) */}
        <path d={maPath} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Average reference line */}
        <line x1={PAD_L} y1={avgY} x2={W - PAD_R} y2={avgY} stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - PAD_R} y={avgY - 3} textAnchor="end" fontSize="9" fill="#7c3aed">avg {Math.round(avg)}%</text>
        {/* X-axis: first/mid/last labels */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => {
          const d = data[i]
          if (!d) return null
          return (
            <text key={i} x={xs[i]} y={H - 4} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="9" fill="#94a3b8">
              {new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          )
        })}
        {/* Last point */}
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill="#059669" />
      </svg>
    </div>
  )
}
