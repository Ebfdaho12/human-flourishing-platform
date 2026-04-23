"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  BookOpen, CheckCircle, Target, ArrowRight, Sparkles,
  TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface Reflection {
  id: string
  date: string
  biggestWin: string
  lesson: string
  gratitude: string
  nextWeekFocus: string
  rating: number
}

interface WeekMetrics {
  moodAvg: number | null
  moodByDay: (number | null)[]
  bestMoodDay: { day: string; score: number } | null
  worstMoodDay: { day: string; score: number } | null
  sleepAvg: number | null
  sleepByDay: (number | null)[]
  exerciseCount: number
  focusMinutes: number
  focusByDay: number[]
  focusHours: number
  habitPct: number
  habitsDone: number
  habitsPossible: number
  habitsByDay: number[]
  habitMisses: { name: string; missed: number }[]
  gratitudeCount: number
  gratitudeItems: number
  winsCount: number
  decisionsCount: number
  eveningReviewCount: number
  activeDays: number
  dayLabels: string[]
  dayISOs: string[]
}

interface WeekDelta {
  key: string
  label: string
  curr: number | null
  prev: number | null
  unit: string
  better: "up" | "down" // which direction is better
}

interface Prompt {
  text: string
  tone: "question" | "celebrate" | "warning"
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function isoDay(offsetFromToday: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetFromToday)
  return d.toISOString().split("T")[0]
}

function weekRange(weeksAgo: number): { days: string[]; labels: string[] } {
  // days go from oldest to newest (index 0 = 6 days ago relative to the week)
  const start = -6 - weeksAgo * 7
  const days: string[] = []
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const offset = start + i
    const iso = isoDay(offset)
    days.push(iso)
    labels.push(DAY_SHORT[new Date(iso + "T12:00:00").getDay()])
  }
  return { days, labels }
}

function avg(xs: number[]): number | null {
  const clean = xs.filter(n => Number.isFinite(n) && n > 0)
  if (clean.length === 0) return null
  return clean.reduce((s, n) => s + n, 0) / clean.length
}

function round1(n: number | null): number | null {
  return n === null ? null : Math.round(n * 10) / 10
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

function pctDelta(curr: number | null, prev: number | null): number | null {
  if (curr === null || prev === null || prev === 0) return null
  return Math.round(((curr - prev) / prev) * 100)
}

function trendArrow(curr: number | null, prev: number | null, better: "up" | "down"): string {
  if (curr === null || prev === null) return "→"
  const diff = curr - prev
  if (Math.abs(diff) < 0.05 * (prev || 1)) return "→"
  const up = diff > 0
  if (better === "up") return up ? "↑" : "↓"
  return up ? "↓" : "↑"
}

function deltaColor(curr: number | null, prev: number | null, better: "up" | "down"): string {
  if (curr === null || prev === null) return "text-muted-foreground"
  const diff = curr - prev
  if (Math.abs(diff) < 0.05 * (prev || 1)) return "text-muted-foreground"
  const up = diff > 0
  const good = (better === "up" && up) || (better === "down" && !up)
  return good ? "text-emerald-600" : "text-red-600"
}

function formatDayLabel(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

// ────────────────────────────────────────────────────────────────────────────
// Metric extraction
// ────────────────────────────────────────────────────────────────────────────

function extractWeek(
  weeksAgo: number,
  mood: any[],
  health: any[],
  habits: any[],
  focusHistory: any[],
  gratitude: any[],
  wins: any[],
  decisions: any[],
  eveningReviews: any[],
): WeekMetrics {
  const { days, labels } = weekRange(weeksAgo)
  const daySet = new Set(days)

  // Mood by day (average if multiple entries)
  const moodBuckets: number[][] = days.map(() => [])
  for (const m of mood) {
    const d = String(m?.recordedAt || m?.createdAt || "").slice(0, 10)
    const idx = days.indexOf(d)
    if (idx >= 0 && typeof m.score === "number") moodBuckets[idx].push(m.score)
  }
  const moodByDay = moodBuckets.map(b => b.length ? b.reduce((s, n) => s + n, 0) / b.length : null)
  const moodAvg = (() => {
    const vals = moodByDay.filter((v): v is number => v !== null)
    return vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : null
  })()
  let bestMoodDay: { day: string; score: number } | null = null
  let worstMoodDay: { day: string; score: number } | null = null
  moodByDay.forEach((v, i) => {
    if (v === null) return
    if (!bestMoodDay || v > bestMoodDay.score) bestMoodDay = { day: days[i], score: v }
    if (!worstMoodDay || v < worstMoodDay.score) worstMoodDay = { day: days[i], score: v }
  })

  // Sleep + exercise from health entries
  const sleepBuckets: number[][] = days.map(() => [])
  let exerciseCount = 0
  for (const e of health) {
    const d = String(e?.recordedAt || e?.createdAt || "").slice(0, 10)
    if (!daySet.has(d)) continue
    if (e.entryType === "SLEEP") {
      const parsed = typeof e.data === "string" ? safeParse<any>(e.data, {}) : (e.data || {})
      const hrs = Number(parsed?.hoursSlept || parsed?.hours || 0)
      if (hrs > 0) sleepBuckets[days.indexOf(d)].push(hrs)
    } else if (e.entryType === "EXERCISE") {
      exerciseCount++
    }
  }
  const sleepByDay = sleepBuckets.map(b => b.length ? b.reduce((s, n) => s + n, 0) / b.length : null)
  const sleepAvg = (() => {
    const vals = sleepByDay.filter((v): v is number => v !== null)
    return vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : null
  })()

  // Focus by day (localStorage)
  const focusByDay = days.map(d => {
    const entry = focusHistory.find((f: any) => f.date === d)
    return Number(entry?.focusMinutes || 0)
  })
  const focusMinutes = focusByDay.reduce((s, n) => s + n, 0)
  const focusHours = Math.round((focusMinutes / 60) * 10) / 10

  // Habits — completion % by day and per-habit misses
  const habitsByDay = days.map(d => {
    if (habits.length === 0) return 0
    const done = habits.filter((h: any) => h.completedDates?.includes(d)).length
    return Math.round((done / habits.length) * 100)
  })
  let habitsDone = 0
  const habitsPossible = habits.length * 7
  const perHabitMisses: { name: string; missed: number }[] = []
  for (const h of habits) {
    const completed = days.filter(d => h.completedDates?.includes(d)).length
    habitsDone += completed
    const missed = 7 - completed
    perHabitMisses.push({ name: h.name || h.id || "Habit", missed })
  }
  const habitPct = habitsPossible > 0 ? Math.round((habitsDone / habitsPossible) * 100) : 0

  // Gratitude / wins / decisions / evening reviews (count in window)
  const gratitudeEntries = gratitude.filter((g: any) => daySet.has(g.date))
  const gratitudeItems = gratitudeEntries.reduce((s: number, e: any) => s + (e.items?.length || 0), 0)

  const winsInWeek = wins.filter((w: any) => {
    const d = String(w.date || "").slice(0, 10)
    return daySet.has(d)
  })

  const decisionsInWeek = decisions.filter((d: any) => daySet.has(d.date))
  const eveningInWeek = eveningReviews.filter((e: any) => daySet.has(e.date))

  // Active days: any signal that day
  const activeDays = days.filter(d => {
    if (moodByDay[days.indexOf(d)] !== null) return true
    if (sleepByDay[days.indexOf(d)] !== null) return true
    if (focusByDay[days.indexOf(d)] > 0) return true
    if (habits.some((h: any) => h.completedDates?.includes(d))) return true
    if (gratitudeEntries.some((g: any) => g.date === d)) return true
    if (eveningInWeek.some((e: any) => e.date === d)) return true
    return false
  }).length

  return {
    moodAvg,
    moodByDay,
    bestMoodDay,
    worstMoodDay,
    sleepAvg,
    sleepByDay,
    exerciseCount,
    focusMinutes,
    focusByDay,
    focusHours,
    habitPct,
    habitsDone,
    habitsPossible,
    habitsByDay,
    habitMisses: perHabitMisses.sort((a, b) => b.missed - a.missed).filter(h => h.missed > 0),
    gratitudeCount: gratitudeEntries.length,
    gratitudeItems,
    winsCount: winsInWeek.length,
    decisionsCount: decisionsInWeek.length,
    eveningReviewCount: eveningInWeek.length,
    activeDays,
    dayLabels: labels,
    dayISOs: days,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern detection
// ────────────────────────────────────────────────────────────────────────────

function detectPatterns(
  week: WeekMetrics,
  mood: any[],
  health: any[],
  habits: any[],
  focusHistory: any[],
): { text: string; tone: "info" | "warning" | "good" }[] {
  const patterns: { text: string; tone: "info" | "warning" | "good" }[] = []

  // 1) Consistently skipped habits by weekday
  for (const h of habits) {
    const perWeekday: Record<number, { total: number; done: number }> = {}
    for (let i = 0; i < 7; i++) {
      const iso = week.dayISOs[i]
      const wd = new Date(iso + "T12:00:00").getDay()
      if (!perWeekday[wd]) perWeekday[wd] = { total: 0, done: 0 }
      perWeekday[wd].total++
      if (h.completedDates?.includes(iso)) perWeekday[wd].done++
    }
    // Also factor in historical completedDates over the last ~4 weeks for that weekday
    const historicalByWeekday: Record<number, { total: number; done: number }> = {}
    const lookback = 28
    for (let i = 0; i < lookback; i++) {
      const iso = isoDay(-i)
      const wd = new Date(iso + "T12:00:00").getDay()
      if (!historicalByWeekday[wd]) historicalByWeekday[wd] = { total: 0, done: 0 }
      historicalByWeekday[wd].total++
      if (h.completedDates?.includes(iso)) historicalByWeekday[wd].done++
    }
    for (const [wdStr, stats] of Object.entries(historicalByWeekday)) {
      if (stats.total >= 3 && stats.done === 0) {
        const wd = parseInt(wdStr, 10)
        patterns.push({
          text: `"${h.name}" was never completed on ${DAY_SHORT[wd]}s in the last 4 weeks.`,
          tone: "warning",
        })
      }
    }
  }

  // 2) Mood dip after late nights — compare mood the day after low sleep
  const lateNightMoodDrops: number[] = []
  for (let i = 1; i < 7; i++) {
    const prevSleep = week.sleepByDay[i - 1]
    const currMood = week.moodByDay[i]
    const prevMood = week.moodByDay[i - 1]
    if (prevSleep !== null && prevSleep < 6.5 && currMood !== null && prevMood !== null) {
      lateNightMoodDrops.push(prevMood - currMood)
    }
  }
  if (lateNightMoodDrops.length >= 2) {
    const avgDrop = lateNightMoodDrops.reduce((s, n) => s + n, 0) / lateNightMoodDrops.length
    if (avgDrop > 0.8) {
      patterns.push({
        text: `Your mood dropped an avg of ${Math.round(avgDrop * 10) / 10} pts the day after nights under 6.5 hrs sleep.`,
        tone: "warning",
      })
    }
  }

  // 3) Focus peaks on which weekday?
  if (week.focusByDay.some(v => v > 0)) {
    const max = Math.max(...week.focusByDay)
    const min = Math.min(...week.focusByDay.filter(v => v >= 0))
    if (max >= 30 && max > min * 1.5) {
      const idx = week.focusByDay.indexOf(max)
      patterns.push({
        text: `Your deepest focus day was ${DAY_SHORT[new Date(week.dayISOs[idx] + "T12:00:00").getDay()]} (${max} min).`,
        tone: "good",
      })
    }
  }

  // 4) Mood lift from exercise — compare exercise days to non
  const exerciseDates = new Set(
    health
      .filter((e: any) => e.entryType === "EXERCISE")
      .map((e: any) => String(e.recordedAt || e.createdAt || "").slice(0, 10))
  )
  const onEx: number[] = []
  const offEx: number[] = []
  week.dayISOs.forEach((d, i) => {
    const m = week.moodByDay[i]
    if (m === null) return
    if (exerciseDates.has(d)) onEx.push(m)
    else offEx.push(m)
  })
  if (onEx.length >= 2 && offEx.length >= 2) {
    const diff = (onEx.reduce((s, n) => s + n, 0) / onEx.length) - (offEx.reduce((s, n) => s + n, 0) / offEx.length)
    if (Math.abs(diff) >= 0.6) {
      patterns.push({
        text: `Your mood was ${Math.abs(Math.round(diff * 10) / 10)} pts ${diff > 0 ? "higher" : "lower"} on exercise days.`,
        tone: diff > 0 ? "good" : "warning",
      })
    }
  }

  // 5) Active days engagement
  if (week.activeDays === 7) {
    patterns.push({ text: "You showed up every day this week. That is the work.", tone: "good" })
  } else if (week.activeDays <= 3) {
    patterns.push({ text: `Only ${week.activeDays}/7 active days. Re-anchor with one small ritual.`, tone: "warning" })
  }

  return patterns
}

// ────────────────────────────────────────────────────────────────────────────
// Auto-prompts based on data
// ────────────────────────────────────────────────────────────────────────────

function buildPrompts(curr: WeekMetrics, prev: WeekMetrics, habits: any[]): Prompt[] {
  const prompts: Prompt[] = []

  // Mood drop vs last week
  if (curr.moodAvg !== null && prev.moodAvg !== null) {
    const drop = curr.moodAvg - prev.moodAvg
    if (drop <= -1) {
      prompts.push({ text: `Your mood averaged ${round1(drop)} pts below last week. What shifted?`, tone: "question" })
    } else if (drop >= 1) {
      prompts.push({ text: `Mood up ${round1(drop)} pts from last week — what worked that you want to keep?`, tone: "celebrate" })
    }
  }

  // Worst day call-out
  if (curr.worstMoodDay && curr.bestMoodDay && curr.worstMoodDay.score < curr.bestMoodDay.score - 2) {
    const worstDay = new Date(curr.worstMoodDay.day + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })
    prompts.push({ text: `${worstDay} was your lowest day (${round1(curr.worstMoodDay.score)}/10). What happened?`, tone: "question" })
  }

  // Sleep shortage
  if (curr.sleepAvg !== null && curr.sleepAvg < 6.8) {
    prompts.push({ text: `Averaged ${round1(curr.sleepAvg)} hrs of sleep. What is the one change that would give you back an hour?`, tone: "question" })
  }

  // Habit streak break — any habit that used to be consistent but dropped this week
  for (const h of habits) {
    const thisWeek = curr.dayISOs.filter(d => h.completedDates?.includes(d)).length
    const last4WeeksCount = (() => {
      let c = 0
      for (let i = 7; i < 35; i++) if (h.completedDates?.includes(isoDay(-i))) c++
      return c
    })()
    const priorRate = last4WeeksCount / 28
    const currRate = thisWeek / 7
    if (priorRate >= 0.6 && currRate < 0.3) {
      prompts.push({ text: `"${h.name}" slipped this week (was ${Math.round(priorRate * 100)}%, now ${Math.round(currRate * 100)}%). What pulled you away?`, tone: "question" })
    }
  }

  // Focus drop
  if (curr.focusMinutes < prev.focusMinutes * 0.6 && prev.focusMinutes >= 60) {
    prompts.push({ text: `Deep focus dropped from ${Math.round(prev.focusMinutes / 60 * 10) / 10}h to ${curr.focusHours}h. What broke the protected time?`, tone: "question" })
  }

  // No gratitude
  if (curr.gratitudeCount === 0 && prev.gratitudeCount > 0) {
    prompts.push({ text: `No gratitude entries this week. What would it cost you to write three things now?`, tone: "question" })
  }

  // Excellent week
  if (curr.moodAvg !== null && curr.moodAvg >= 7.5 && curr.activeDays >= 6) {
    prompts.push({ text: `Mood ${round1(curr.moodAvg)}/10 across ${curr.activeDays} active days. Name what made this week work.`, tone: "celebrate" })
  }

  return prompts.slice(0, 5)
}

// ────────────────────────────────────────────────────────────────────────────
// Sparkline
// ────────────────────────────────────────────────────────────────────────────

function Sparkline({
  data, color, labels, min, max, unit, height = 48, width = 280,
}: {
  data: (number | null)[]
  color: string
  labels: string[]
  min?: number
  max?: number
  unit: string
  height?: number
  width?: number
}) {
  const valid = data.filter((v): v is number => v !== null && Number.isFinite(v))
  if (valid.length < 1) {
    return (
      <div className="flex items-center justify-center h-12 text-[10px] text-muted-foreground border border-dashed rounded">
        no data this week
      </div>
    )
  }
  const lo = min !== undefined ? min : Math.min(...valid)
  const hi = max !== undefined ? max : Math.max(...valid)
  const range = hi - lo || 1
  const padX = 8
  const padY = 6
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0

  const pointsXY = data.map((v, i) => {
    const x = padX + i * stepX
    if (v === null || !Number.isFinite(v)) return { x, y: null as number | null }
    const y = height - padY - ((v - lo) / range) * (height - padY * 2)
    return { x, y }
  })

  // Build a path that skips null segments
  let path = ""
  let inSeg = false
  for (const p of pointsXY) {
    if (p.y === null) { inSeg = false; continue }
    path += `${inSeg ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `
    inSeg = true
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
      {/* Baseline */}
      <line x1={padX} x2={width - padX} y1={height - padY} y2={height - padY} stroke="currentColor" className="text-muted" strokeWidth={0.5} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pointsXY.map((p, i) => p.y !== null ? (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ) : null)}
      {labels.map((lab, i) => (
        <text key={i} x={padX + i * stepX} y={height - 0.5} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 8 }}>
          {lab[0]}
        </text>
      ))}
    </svg>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

const PROMPTS = [
  "What was your biggest win this week — personal, financial, family, or health?",
  "What did you learn this week that changed how you think or act?",
  "What is one thing you are grateful for right now that you might take for granted?",
  "What is your ONE focus for next week? (Not five things. One.)",
]

export default function WeeklyReflectionPage() {
  // API data — pull 60 days to cover this + prior week(s)
  const { data: moodData } = useSWR<{ entries: any[] }>("/api/mental-health/mood?limit=90", secureFetcher)
  const { data: healthData } = useSWR<{ entries: any[] }>("/api/health/entries?limit=200", secureFetcher)

  // localStorage state
  const [habits, setHabits] = useState<any[]>([])
  const [focusHistory, setFocusHistory] = useState<any[]>([])
  const [gratitude, setGratitude] = useState<any[]>([])
  const [wins, setWins] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [eveningReviews, setEveningReviews] = useState<any[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])

  // Reflection form
  const [step, setStep] = useState(0)
  const [biggestWin, setBiggestWin] = useState("")
  const [lesson, setLesson] = useState("")
  const [gratitudeText, setGratitudeText] = useState("")
  const [nextWeekFocus, setNextWeekFocus] = useState("")
  const [rating, setRating] = useState(0)
  const [completed, setCompleted] = useState(false)

  const thisWeekKey = useMemo(() => isoDay(0), [])

  useEffect(() => {
    setHabits(safeParse(localStorage.getItem("hfp-daily-habits"), [] as any[]))
    setFocusHistory(safeParse(localStorage.getItem("hfp-focus-history"), [] as any[]))
    setGratitude(safeParse(localStorage.getItem("hfp-gratitude"), [] as any[]))
    setWins(safeParse(localStorage.getItem("hfp-wins"), [] as any[]))
    setDecisions(safeParse(localStorage.getItem("hfp-decisions"), [] as any[]))
    setEveningReviews(safeParse(localStorage.getItem("hfp-evening-review"), [] as any[]))

    const stored = safeParse<Reflection[]>(localStorage.getItem("hfp-weekly-reflections"), [])
    setReflections(stored)
    const existing = stored.find(r => r.date === thisWeekKey)
    if (existing) {
      setCompleted(true)
      setBiggestWin(existing.biggestWin)
      setLesson(existing.lesson)
      setGratitudeText(existing.gratitude)
      setNextWeekFocus(existing.nextWeekFocus)
      setRating(existing.rating)
    }
  }, [thisWeekKey])

  const mood = moodData?.entries || []
  const health = healthData?.entries || []

  // Extract metrics for this week and previous week
  const thisWeek = useMemo(
    () => extractWeek(0, mood, health, habits, focusHistory, gratitude, wins, decisions, eveningReviews),
    [mood, health, habits, focusHistory, gratitude, wins, decisions, eveningReviews],
  )
  const lastWeek = useMemo(
    () => extractWeek(1, mood, health, habits, focusHistory, gratitude, wins, decisions, eveningReviews),
    [mood, health, habits, focusHistory, gratitude, wins, decisions, eveningReviews],
  )

  const patterns = useMemo(
    () => detectPatterns(thisWeek, mood, health, habits, focusHistory),
    [thisWeek, mood, health, habits, focusHistory],
  )

  const autoPrompts = useMemo(
    () => buildPrompts(thisWeek, lastWeek, habits),
    [thisWeek, lastWeek, habits],
  )

  const deltas: WeekDelta[] = [
    { key: "mood", label: "Mood", curr: round1(thisWeek.moodAvg), prev: round1(lastWeek.moodAvg), unit: "/10", better: "up" },
    { key: "sleep", label: "Sleep", curr: round1(thisWeek.sleepAvg), prev: round1(lastWeek.sleepAvg), unit: "h", better: "up" },
    { key: "focus", label: "Focus", curr: thisWeek.focusHours, prev: Math.round(lastWeek.focusMinutes / 60 * 10) / 10, unit: "h", better: "up" },
    { key: "habits", label: "Habits", curr: thisWeek.habitPct, prev: lastWeek.habitPct, unit: "%", better: "up" },
    { key: "exercise", label: "Exercise", curr: thisWeek.exerciseCount, prev: lastWeek.exerciseCount, unit: "×", better: "up" },
    { key: "gratitude", label: "Gratitude", curr: thisWeek.gratitudeCount, prev: lastWeek.gratitudeCount, unit: "d", better: "up" },
  ]

  function save() {
    const reflection: Reflection = {
      id: Date.now().toString(36), date: thisWeekKey,
      biggestWin, lesson, gratitude: gratitudeText, nextWeekFocus, rating,
    }
    const updated = [reflection, ...reflections.filter(r => r.date !== thisWeekKey)].slice(0, 52)
    setReflections(updated)
    localStorage.setItem("hfp-weekly-reflections", JSON.stringify(updated))
    setCompleted(true)
  }

  // Weekly streak (at-least-one reflection per week window)
  const streak = (() => {
    let s = 0
    for (let i = 0; i < 52; i++) {
      const weekStart = new Date()
      weekStart.setHours(0, 0, 0, 0)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekStartIso = weekStart.toISOString().split("T")[0]
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const windowStart = new Date(weekStart); windowStart.setDate(windowStart.getDate() - 6)
      const has = reflections.some(r => {
        const d = new Date(r.date + "T12:00:00")
        return d >= windowStart && d <= weekEnd
      })
      if (has) s++
      else if (i > 0) break
      else if (i === 0) { /* allow empty current week */ }
    }
    return s
  })()

  // ──────────────────────────────────────────────────────────────────────
  // Shared: "Week by the numbers" header block
  // ──────────────────────────────────────────────────────────────────────

  const dataHeader = (
    <div className="space-y-4">
      {/* Sparklines */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <p className="text-sm font-semibold">This Week at a Glance</p>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatDayLabel(thisWeek.dayISOs[0])} → {formatDayLabel(thisWeek.dayISOs[6])}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Mood</span>
                <span className="text-sm font-bold text-violet-600">{thisWeek.moodAvg !== null ? round1(thisWeek.moodAvg) : "—"}<span className="text-[9px] text-muted-foreground">/10</span></span>
              </div>
              <div className="text-violet-500">
                <Sparkline data={thisWeek.moodByDay} color="#8b5cf6" labels={thisWeek.dayLabels} min={1} max={10} unit="/10" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sleep</span>
                <span className="text-sm font-bold text-indigo-600">{thisWeek.sleepAvg !== null ? round1(thisWeek.sleepAvg) : "—"}<span className="text-[9px] text-muted-foreground">h</span></span>
              </div>
              <Sparkline data={thisWeek.sleepByDay} color="#6366f1" labels={thisWeek.dayLabels} min={4} max={10} unit="h" />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Focus</span>
                <span className="text-sm font-bold text-red-600">{thisWeek.focusHours}<span className="text-[9px] text-muted-foreground">h</span></span>
              </div>
              <Sparkline data={thisWeek.focusByDay} color="#ef4444" labels={thisWeek.dayLabels} min={0} unit="min" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By the numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile
          label="Best day"
          value={thisWeek.bestMoodDay ? `${round1(thisWeek.bestMoodDay.score)}/10` : "—"}
          sub={thisWeek.bestMoodDay ? new Date(thisWeek.bestMoodDay.day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }) : "—"}
          color="emerald"
        />
        <StatTile
          label="Worst day"
          value={thisWeek.worstMoodDay ? `${round1(thisWeek.worstMoodDay.score)}/10` : "—"}
          sub={thisWeek.worstMoodDay ? new Date(thisWeek.worstMoodDay.day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }) : "—"}
          color="red"
        />
        <StatTile label="Habits" value={`${thisWeek.habitPct}%`} sub={`${thisWeek.habitsDone}/${thisWeek.habitsPossible}`} color="emerald" />
        <StatTile label="Focus" value={`${thisWeek.focusHours}h`} sub={`${thisWeek.focusMinutes} min total`} color="red" />
        <StatTile label="Exercise" value={`${thisWeek.exerciseCount}×`} sub="sessions" color="orange" />
        <StatTile label="Gratitude" value={`${thisWeek.gratitudeCount}`} sub={`${thisWeek.gratitudeItems} items`} color="rose" />
        <StatTile label="Wins logged" value={`${thisWeek.winsCount}`} sub="this week" color="amber" />
        <StatTile label="Active days" value={`${thisWeek.activeDays}/7`} sub={thisWeek.activeDays >= 6 ? "consistent" : thisWeek.activeDays >= 4 ? "solid" : "light"} color="violet" />
      </div>

      {/* Week over week */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold">vs. Last Week</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {deltas.map(d => {
              const arrow = trendArrow(d.curr, d.prev, d.better)
              const pct = pctDelta(d.curr, d.prev)
              const color = deltaColor(d.curr, d.prev, d.better)
              return (
                <div key={d.key} className="rounded-lg border p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</p>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <p className="text-base font-bold">
                      {d.curr !== null ? d.curr : "—"}
                      <span className="text-[9px] text-muted-foreground ml-0.5">{d.unit}</span>
                    </p>
                    <span className={cn("text-xs font-medium flex items-center gap-0.5", color)}>
                      <span className="font-bold">{arrow}</span>
                      {pct !== null ? `${pct > 0 ? "+" : ""}${pct}%` : ""}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    prev: {d.prev !== null ? d.prev : "—"}{d.unit}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">This Week&apos;s Patterns</p>
            </div>
            <div className="space-y-1.5">
              {patterns.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border p-2.5 text-xs flex items-start gap-2",
                    p.tone === "good" && "border-emerald-200 bg-emerald-50/30 text-emerald-800",
                    p.tone === "warning" && "border-amber-200 bg-amber-50/30 text-amber-800",
                    p.tone === "info" && "border-slate-200 bg-muted/20",
                  )}
                >
                  {p.tone === "good" && <Trophy className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                  {p.tone === "warning" && <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                  {p.tone === "info" && <Minus className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                  <span className="flex-1">{p.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit misses */}
      {thisWeek.habitMisses.length > 0 && thisWeek.habitsPossible > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2">Habits to Re-Anchor</p>
            <div className="space-y-1">
              {thisWeek.habitMisses.slice(0, 4).map(h => (
                <div key={h.name} className="flex items-center justify-between text-xs">
                  <span>{h.name}</span>
                  <span className="text-red-600 font-medium">{h.missed}/7 missed</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data-driven prompts */}
      {autoPrompts.length > 0 && (
        <Card className="border-violet-200 bg-violet-50/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold">Prompts From Your Data</p>
            </div>
            <div className="space-y-1.5">
              {autoPrompts.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-xs p-2 rounded border",
                    p.tone === "celebrate" && "border-emerald-200 bg-emerald-50/30",
                    p.tone === "question" && "border-violet-200 bg-background",
                    p.tone === "warning" && "border-amber-200 bg-amber-50/30",
                  )}
                >
                  {p.text}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              These are auto-generated from your last 7 days. Let them seed your written reflection below.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────
  // Completed view
  // ──────────────────────────────────────────────────────────────────────

  if (completed) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center pt-4">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">This Week&apos;s Reflection</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {streak > 1 ? `${streak} week streak · ` : ""}Saved {formatDayLabel(thisWeekKey)}
          </p>
        </div>

        {dataHeader}

        <Card className="border-emerald-200 bg-emerald-50/10">
          <CardContent className="p-5 space-y-3">
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Biggest Win</p><p className="text-sm">{biggestWin}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">What I Learned</p><p className="text-sm">{lesson}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Grateful For</p><p className="text-sm">{gratitudeText}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Week Focus</p><p className="text-sm font-semibold">{nextWeekFocus}</p></div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Week Rating</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} className={cn("h-3 w-5 rounded-sm", n <= rating ? "bg-emerald-400" : "bg-muted")} />
                ))}
              </div>
              <span className="text-sm font-bold text-emerald-600">{rating}/10</span>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => { setCompleted(false); setStep(0) }}
              className="mt-2"
            >
              Edit reflection
            </Button>
          </CardContent>
        </Card>

        {/* Previous reflections */}
        {reflections.filter(r => r.date !== thisWeekKey).length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Previous Weeks</h2>
            <div className="space-y-2">
              {reflections.filter(r => r.date !== thisWeekKey).slice(0, 8).map(r => (
                <Card key={r.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{formatDayLabel(r.date)}</span>
                      <span className="text-xs font-bold text-emerald-600">{r.rating}/10</span>
                    </div>
                    <p className="text-xs"><strong>Win:</strong> {r.biggestWin}</p>
                    <p className="text-xs"><strong>Focus:</strong> {r.nextWeekFocus}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center text-sm">
          <a href="/progress" className="text-emerald-600 hover:underline">Progress</a>
          <a href="/wins" className="text-amber-600 hover:underline">Wins</a>
          <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────
  // Write view
  // ──────────────────────────────────────────────────────────────────────

  const firstPrompt = autoPrompts[0]?.text

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center pt-4">
        <BookOpen className="h-10 w-10 text-violet-500 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Weekly Reflection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDayLabel(thisWeek.dayISOs[0])} — {formatDayLabel(thisWeek.dayISOs[6])}
        </p>
      </div>

      {dataHeader}

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {[0, 1, 2, 3, 4].map(s => (
          <div key={s} className={cn("h-1.5 w-10 rounded-full",
            s < step ? "bg-emerald-400" : s === step ? "bg-violet-400" : "bg-muted")} />
        ))}
      </div>

      <Card className="border-2 border-violet-200">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[0]}</p>
              {thisWeek.winsCount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  You logged {thisWeek.winsCount} win{thisWeek.winsCount > 1 ? "s" : ""} this week. The biggest might already be in <a href="/wins" className="underline">/wins</a>.
                </p>
              )}
              <Textarea value={biggestWin} onChange={e => setBiggestWin(e.target.value)}
                placeholder="It doesn't have to be big. Showing up counts. Making a hard decision counts. Keeping a promise counts."
                className="min-h-[100px]" autoFocus />
              <Button onClick={() => setStep(1)} disabled={!biggestWin.trim()} className="w-full">
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[1]}</p>
              {firstPrompt && (
                <p className="text-[10px] text-violet-700 italic">Seed: {firstPrompt}</p>
              )}
              <Textarea value={lesson} onChange={e => setLesson(e.target.value)}
                placeholder="A skill, an insight, something about yourself, a mistake that taught you something..."
                className="min-h-[100px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)} disabled={!lesson.trim()} className="flex-1">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[2]}</p>
              {thisWeek.gratitudeCount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {thisWeek.gratitudeItems} gratitude items across {thisWeek.gratitudeCount} days logged. What stood out?
                </p>
              )}
              <Textarea value={gratitudeText} onChange={e => setGratitudeText(e.target.value)}
                placeholder="A person, a moment, your health, your home, your freedom, something small that made a big difference..."
                className="min-h-[100px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!gratitudeText.trim()} className="flex-1">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[3]}</p>
              {thisWeek.habitMisses[0] && (
                <p className="text-[10px] text-amber-700">
                  Candidate: re-establish "{thisWeek.habitMisses[0].name}" (missed {thisWeek.habitMisses[0].missed}/7 this week).
                </p>
              )}
              <Textarea value={nextWeekFocus} onChange={e => setNextWeekFocus(e.target.value)}
                placeholder="Not a to-do list. One thing that, if you accomplished it, would make next week a success."
                className="min-h-[80px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)} disabled={!nextWeekFocus.trim()} className="flex-1">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">How would you rate this week? (1-10)</p>
              {thisWeek.moodAvg !== null && (
                <p className="text-[10px] text-muted-foreground">
                  Your mood averaged {round1(thisWeek.moodAvg)}/10 — your felt sense matters more. Trust it.
                </p>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRating(n)} type="button"
                    className={cn("h-10 w-10 rounded-lg text-sm font-bold transition-all",
                      rating === n ? (n >= 7 ? "bg-emerald-500 text-white scale-110"
                        : n >= 4 ? "bg-amber-400 text-white scale-110"
                        : "bg-red-400 text-white scale-110")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}>{n}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={save} disabled={rating === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete Reflection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why reflect weekly?</strong> Harvard Business School research found employees who spent 15 minutes
            at the end of each day reflecting on lessons learned performed 23% better after 10 days than those who
            did not. Weekly reflection scales this: it catches patterns daily reflection misses and connects actions
            to outcomes across longer arcs. Over 52 weeks, you build a complete record of your year — growth you can
            see, lessons you can revisit, and a trajectory that proves you are moving forward.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// StatTile
// ────────────────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, color }: {
  label: string; value: string; sub: string;
  color: "emerald" | "red" | "amber" | "rose" | "violet" | "orange" | "indigo"
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    red: "text-red-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    violet: "text-violet-600",
    orange: "text-orange-600",
    indigo: "text-indigo-600",
  }
  return (
    <div className="rounded-lg border p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold", colorMap[color])}>{value}</p>
      <p className="text-[9px] text-muted-foreground truncate">{sub}</p>
    </div>
  )
}
