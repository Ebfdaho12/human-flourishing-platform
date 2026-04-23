"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  Target, TrendingUp, TrendingDown, ArrowRight, AlertTriangle,
  Sparkles, Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { cn } from "@/lib/utils"

// ---------- helpers ----------
const getToday = () => new Date().toISOString().split("T")[0]
const dateNDaysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0] }
const clamp = (v: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, v))
const round1 = (v: number) => Math.round(v * 10) / 10

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { return JSON.parse(localStorage.getItem(key) || "") as T } catch { return fallback }
}

// Ten life dimensions (preserved from prior version + mapped to data sources)
const LIFE_AREAS = [
  { id: "health", label: "Physical Health", short: "Health", color: "#f43f5e", module: "/health", desc: "Sleep, exercise, body signals" },
  { id: "mental", label: "Mental Health", short: "Mental", color: "#ec4899", module: "/mental-health", desc: "Mood, gratitude, stress" },
  { id: "relationships", label: "Relationships", short: "Relate", color: "#f97316", module: "/people", desc: "Contact recency + quality" },
  { id: "career", label: "Career / Purpose", short: "Career", color: "#eab308", module: "/goals", desc: "Active goals & progress" },
  { id: "finances", label: "Finances", short: "Money", color: "#22c55e", module: "/budget", desc: "Budget surplus + net worth trend" },
  { id: "education", label: "Learning / Growth", short: "Growth", color: "#3b82f6", module: "/reading", desc: "Books + skills progression" },
  { id: "environment", label: "Environment", short: "Envir", color: "#06b6d4", module: "/home-maintenance", desc: "Water, energy, surroundings" },
  { id: "fun", label: "Fun / Recreation", short: "Fun", color: "#8b5cf6", module: "/wins", desc: "Wins, breathwork, play" },
  { id: "spirituality", label: "Spirituality / Values", short: "Spirit", color: "#a855f7", module: "/vision", desc: "Vision, meaning, practice" },
  { id: "contribution", label: "Contribution", short: "Give", color: "#14b8a6", module: "/community", desc: "Giving back, impact" },
] as const

type AreaId = typeof LIFE_AREAS[number]["id"]

interface DimensionResult {
  id: AreaId
  computed: number | null  // 0-10, null if no data
  confidence: "high" | "medium" | "low" | "none"
  basis: string            // short human explanation
  evidence: string[]       // bullet facts
}

// ---------- main ----------
export default function LifeWheelPage() {
  const today = getToday()

  // ----- real-data sources -----
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=60", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=200", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const { data: walletData } = useSWR("/api/wallet", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)

  // localStorage-backed sources
  const [lsReady, setLsReady] = useState(false)
  const [habits, setHabits] = useState<any[]>([])
  const [waterLog, setWaterLog] = useState<any[]>([])
  const [focusHistory, setFocusHistory] = useState<any[]>([])
  const [gratitude, setGratitude] = useState<any[]>([])
  const [breathwork, setBreathwork] = useState<any[]>([])
  const [flourishingHistory, setFlourishingHistory] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [budget, setBudget] = useState<{ incomes?: any[]; expenses?: any[] } | null>(null)
  const [networth, setNetworth] = useState<{ entries?: any[]; history?: any[] } | null>(null)
  const [reading, setReading] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [vision, setVision] = useState<any[]>([])
  const [wins, setWins] = useState<any[]>([])
  const [energyLog, setEnergyLog] = useState<Record<string, any[]>>({})
  const [selfAssess, setSelfAssess] = useState<Record<AreaId, number>>(
    Object.fromEntries(LIFE_AREAS.map(a => [a.id, 5])) as Record<AreaId, number>
  )

  useEffect(() => {
    setHabits(safeParse<any[]>("hfp-daily-habits", []))
    setWaterLog(safeParse<any[]>("hfp-water-log", []))
    setFocusHistory(safeParse<any[]>("hfp-focus-history", []))
    setGratitude(safeParse<any[]>("hfp-gratitude", []))
    setBreathwork(safeParse<any[]>("hfp-breathwork-sessions", []))
    setFlourishingHistory(safeParse<any[]>("hfp-flourishing-history", []))
    setPeople(safeParse<any[]>("hfp-people", []))
    setRelationships(safeParse<any[]>("hfp-relationships", []))
    setBudget(safeParse<any>("hfp-budget", null))
    setNetworth(safeParse<any>("hfp-networth", null))
    setReading(safeParse<any[]>("hfp-reading", []))
    setSkills(safeParse<any[]>("hfp-skills", []))
    setVision(safeParse<any[]>("hfp-vision", []))
    setWins(safeParse<any[]>("hfp-wins", []))
    setEnergyLog(safeParse<Record<string, any[]>>("hfp-energy-log", {}))
    setSelfAssess(safeParse<Record<AreaId, number>>("hfp-life-wheel-self",
      Object.fromEntries(LIFE_AREAS.map(a => [a.id, 5])) as Record<AreaId, number>))
    setLsReady(true)
  }, [])

  // Persist self-assessment
  useEffect(() => {
    if (!lsReady) return
    try { localStorage.setItem("hfp-life-wheel-self", JSON.stringify(selfAssess)) } catch {}
  }, [selfAssess, lsReady])

  // ----- derive server data -----
  const moods = moodData?.entries || []
  const healthEntries = healthData?.entries || []
  const streaks = streakData || {}
  const wallet = walletData?.wallet || {}
  const goals = goalsData?.goals || []

  // ----- computed dimension scores (0-10 + confidence + evidence) -----
  const computed = useMemo<Record<AreaId, DimensionResult>>(() => {
    const results = {} as Record<AreaId, DimensionResult>

    // ---- HEALTH ----
    // sleep (7-9hrs ideal) + exercise freq + habit completion today
    {
      const sleepEntries = healthEntries.filter((e: any) => e.entryType === "SLEEP").slice(0, 7)
      const avgSleep = sleepEntries.length ? sleepEntries.reduce((s: number, e: any) => {
        try { return s + (JSON.parse(e.data)?.hoursSlept || 0) } catch { return s }
      }, 0) / sleepEntries.length : 0
      const sleepScore = !sleepEntries.length ? null
        : avgSleep >= 7 && avgSleep <= 9 ? 10
        : avgSleep >= 6 ? 7
        : avgSleep >= 5 ? 4 : 2
      const exerciseWk = healthEntries.filter((e: any) => {
        if (e.entryType !== "EXERCISE") return false
        const d = (e.createdAt || "").slice(0, 10)
        return d >= dateNDaysAgo(7)
      }).length
      const exerciseScore = exerciseWk === 0 ? null : Math.min(10, exerciseWk * 2)
      const habitDoneToday = habits.length > 0 ? habits.filter((h: any) => h.completedDates?.includes(today)).length / habits.length : null
      const habitScore = habitDoneToday === null ? null : Math.round(habitDoneToday * 10)

      const parts = [sleepScore, exerciseScore, habitScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (sleepScore !== null) evidence.push(`Sleep: avg ${round1(avgSleep)}hrs over ${sleepEntries.length} nights`)
      if (exerciseScore !== null) evidence.push(`Exercise: ${exerciseWk} session${exerciseWk === 1 ? "" : "s"} last 7d`)
      if (habitScore !== null) evidence.push(`Habits today: ${Math.round((habitDoneToday ?? 0) * 100)}%`)
      const conf: DimensionResult["confidence"] = parts.length >= 3 ? "high" : parts.length === 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.health = {
        id: "health",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "sleep + exercise + habits",
        evidence: evidence.length ? evidence : ["No health signals logged yet"],
      }
    }

    // ---- MENTAL ----
    // 30d mood avg + gratitude frequency + stress proxy (mood dispersion)
    {
      const last30 = moods.filter((m: any) => (m.createdAt || "").slice(0, 10) >= dateNDaysAgo(30))
      const scores = last30.map((m: any) => m.score).filter((v: any) => typeof v === "number")
      const avgMood = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0
      const moodScore = scores.length ? clamp(avgMood) : null
      // dispersion (lower is better — stable mood)
      let stabilityScore: number | null = null
      if (scores.length >= 5) {
        const mean = avgMood
        const variance = scores.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / scores.length
        const sd = Math.sqrt(variance)
        stabilityScore = clamp(10 - sd * 2) // sd 0 -> 10, sd 5 -> 0
      }
      // gratitude last 30d
      const gratDays30 = new Set(gratitude.filter((g: any) => (g.date || "") >= dateNDaysAgo(30)).map((g: any) => g.date)).size
      const gratScore = gratitude.length ? clamp((gratDays30 / 30) * 10) : null

      const parts = [moodScore, stabilityScore, gratScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (moodScore !== null) evidence.push(`Mood (30d): ${round1(avgMood)}/10 from ${scores.length} entries`)
      if (stabilityScore !== null) evidence.push(`Mood stability: ${round1(stabilityScore)}/10`)
      if (gratScore !== null) evidence.push(`Gratitude: ${gratDays30} days logged in last 30`)
      const conf: DimensionResult["confidence"] = parts.length >= 3 ? "high" : parts.length === 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.mental = {
        id: "mental",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "mood avg + stability + gratitude",
        evidence: evidence.length ? evidence : ["No mood / gratitude data yet"],
      }
    }

    // ---- RELATIONSHIPS ----
    // people tracker: quality + recency + overdue penalty; plus /relationships circles
    {
      const daysSince = (d: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999
      const pool = [...people, ...relationships.map(r => ({
        // normalize /relationships shape
        name: r.name, quality: undefined, lastContact: r.lastContact, reminderDays: r.contactFrequency,
      }))]
      if (pool.length === 0) {
        results.relationships = {
          id: "relationships", computed: null, confidence: "none",
          basis: "people-tracker + relationships",
          evidence: ["No people tracked yet — add contacts on /people"],
        }
      } else {
        const avgQuality = people.length
          ? people.reduce((s, p) => s + (typeof p.quality === "number" ? p.quality : 5), 0) / people.length
          : 5
        const onTime = pool.filter(p => {
          const ds = daysSince(p.lastContact || "")
          return p.lastContact && ds <= (p.reminderDays || 30)
        }).length
        const recencyScore = pool.length ? (onTime / pool.length) * 10 : 5
        const overdue = pool.length - onTime
        const combined = round1((avgQuality + recencyScore) / 2)
        results.relationships = {
          id: "relationships",
          computed: clamp(combined),
          confidence: pool.length >= 5 ? "high" : pool.length >= 2 ? "medium" : "low",
          basis: "quality + contact recency",
          evidence: [
            `${pool.length} people tracked, avg quality ${round1(avgQuality)}/10`,
            `${onTime}/${pool.length} on cadence, ${overdue} overdue`,
          ],
        }
      }
    }

    // ---- CAREER / PURPOSE ----
    // active goals count + avg progress + streak of engagement
    {
      const active = goals.filter((g: any) => g.isActive && !g.completedAt)
      const completed30 = goals.filter((g: any) => g.completedAt && g.completedAt >= dateNDaysAgo(30))
      if (goals.length === 0 && vision.length === 0) {
        results.career = {
          id: "career", computed: null, confidence: "none",
          basis: "goals + vision",
          evidence: ["No goals or vision set — start on /goals or /vision"],
        }
      } else {
        const avgProgress = active.length ? active.reduce((s: number, g: any) => s + (g.progress || 0), 0) / active.length : 0
        // score: having active goals (up to 4), avg progress, and recent completions
        const activityPts = Math.min(4, active.length) * 1.25 // max 5
        const progressPts = (avgProgress / 100) * 3 // max 3
        const completionPts = Math.min(2, completed30.length) // max 2
        const visionPts = vision.length > 0 ? 0 : 0 // already counted in spirituality
        const score = clamp(activityPts + progressPts + completionPts + visionPts)
        results.career = {
          id: "career",
          computed: round1(score),
          confidence: goals.length >= 3 ? "high" : goals.length >= 1 ? "medium" : "low",
          basis: "active goals + progress + completions",
          evidence: [
            `${active.length} active goal${active.length === 1 ? "" : "s"}, avg progress ${Math.round(avgProgress)}%`,
            `${completed30.length} completed in last 30 days`,
          ],
        }
      }
    }

    // ---- FINANCES ----
    // budget surplus + net worth + recent history trend
    {
      const incomes = budget?.incomes || []
      const expenses = budget?.expenses || []
      const incomeSum = incomes.reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0)
      const expenseSum = expenses.reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0)
      const hasBudget = incomes.length > 0 || expenses.length > 0
      const surplusRatio = incomeSum > 0 ? (incomeSum - expenseSum) / incomeSum : null
      // surplus of 20%+ => 10, 0% => 5, -20%+ => 0
      const surplusScore = surplusRatio === null ? null
        : clamp(5 + surplusRatio * 25)

      const nwEntries = networth?.entries || []
      const hist = networth?.history || []
      const assets = nwEntries.filter((e: any) => e.type === "asset").reduce((s: number, e: any) => s + (e.amount || 0), 0)
      const liabs = nwEntries.filter((e: any) => e.type === "liability").reduce((s: number, e: any) => s + (e.amount || 0), 0)
      const nw = assets - liabs
      const nwScore = nwEntries.length === 0 ? null
        : nw > 0 ? clamp(5 + Math.log10(Math.max(1, nw)) * 0.9)  // log scale, ~$10k ≈ 8.6, ~$100k ≈ 9.5
        : nw === 0 ? 5
        : clamp(5 - Math.log10(Math.max(1, -nw)) * 1.2)
      // trajectory (recent 2 snapshots)
      let trendScore: number | null = null
      if (hist.length >= 2) {
        const last = hist[hist.length - 1].netWorth
        const prev = hist[hist.length - 2].netWorth
        const change = last - prev
        trendScore = clamp(5 + (change > 0 ? 3 : change < 0 ? -3 : 0) * Math.min(1, Math.abs(change) / Math.max(1000, Math.abs(prev))))
      }

      const parts = [surplusScore, nwScore, trendScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (hasBudget) evidence.push(`Budget: $${Math.round(incomeSum).toLocaleString()} in − $${Math.round(expenseSum).toLocaleString()} out`)
      if (nwEntries.length) evidence.push(`Net worth: $${Math.round(nw).toLocaleString()}`)
      if (hist.length >= 2) evidence.push(`NW trend: ${hist[hist.length - 1].netWorth > hist[hist.length - 2].netWorth ? "up" : "down"} vs last snapshot`)
      const conf: DimensionResult["confidence"] = parts.length >= 3 ? "high" : parts.length === 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.finances = {
        id: "finances",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "budget surplus + net worth + trend",
        evidence: evidence.length ? evidence : ["No budget or net-worth data yet"],
      }
    }

    // ---- EDUCATION / GROWTH ----
    // books reading + finished; skills avg level; focus minutes last 7d
    {
      const finished = reading.filter((b: any) => b.status === "finished").length
      const readingNow = reading.filter((b: any) => b.status === "reading").length
      const booksScore = reading.length === 0 ? null
        : clamp(readingNow * 2 + Math.min(5, finished * 0.5) + 2) // base 2 for engagement
      const avgSkill = skills.length ? skills.reduce((s: number, k: any) => s + (k.level || 0), 0) / skills.length : null
      const skillScore = avgSkill === null ? null : clamp(avgSkill) // level already 1-10
      const last7Focus = focusHistory
        .filter((f: any) => f.date && f.date >= dateNDaysAgo(7))
        .reduce((s: number, f: any) => s + (f.focusMinutes || 0), 0)
      const focusScore = focusHistory.length === 0 ? null
        : clamp(last7Focus / 30) // 300 min/wk => 10

      const parts = [booksScore, skillScore, focusScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (booksScore !== null) evidence.push(`Books: ${readingNow} in progress, ${finished} finished`)
      if (skillScore !== null) evidence.push(`Skills: ${skills.length} tracked, avg level ${round1(avgSkill!)}/10`)
      if (focusScore !== null) evidence.push(`Focus: ${last7Focus} min last 7d`)
      const conf: DimensionResult["confidence"] = parts.length >= 3 ? "high" : parts.length === 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.education = {
        id: "education",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "books + skills + focus hours",
        evidence: evidence.length ? evidence : ["No reading / skills / focus data yet"],
      }
    }

    // ---- ENVIRONMENT ----
    // water intake habit consistency + energy log usage (proxy for awareness of surroundings)
    {
      const waterDays30 = new Set(
        waterLog.filter((w: any) => (w.date || "") >= dateNDaysAgo(30)).map((w: any) => w.date)
      ).size
      const waterScore = waterLog.length === 0 ? null : clamp((waterDays30 / 30) * 10)
      const energyDays30 = Object.keys(energyLog).filter(d => d >= dateNDaysAgo(30)).length
      const energyScore = Object.keys(energyLog).length === 0 ? null : clamp((energyDays30 / 30) * 10)

      const parts = [waterScore, energyScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (waterScore !== null) evidence.push(`Water logged: ${waterDays30}/30 recent days`)
      if (energyScore !== null) evidence.push(`Energy tracked: ${energyDays30}/30 recent days`)
      const conf: DimensionResult["confidence"] = parts.length >= 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.environment = {
        id: "environment",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "hydration + energy awareness",
        evidence: evidence.length ? evidence : ["No hydration or energy data yet — mostly self-assessed"],
      }
    }

    // ---- FUN / RECREATION ----
    // wins logged + breathwork sessions + active streak
    {
      const wins30 = wins.filter((w: any) => (w.date || "").slice(0, 10) >= dateNDaysAgo(30)).length
      const winsScore = wins.length === 0 ? null : clamp(wins30 / 2) // 20 wins/mo => 10
      const breath30 = breathwork.filter((b: any) => {
        const d = b.date || new Date(b.timestamp || 0).toISOString().slice(0, 10)
        return d >= dateNDaysAgo(30)
      }).length
      const breathScore = breathwork.length === 0 ? null : clamp(breath30 / 2)

      const parts = [winsScore, breathScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (winsScore !== null) evidence.push(`Wins logged (30d): ${wins30}`)
      if (breathScore !== null) evidence.push(`Breathwork sessions (30d): ${breath30}`)
      const conf: DimensionResult["confidence"] = parts.length >= 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.fun = {
        id: "fun",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "wins + breathwork frequency",
        evidence: evidence.length ? evidence : ["No play / recovery data — self-assess below"],
      }
    }

    // ---- SPIRITUALITY / VALUES ----
    // vision items + gratitude practice + long-term goals
    {
      const visionScore = vision.length === 0 ? null : clamp(Math.min(10, vision.length * 1.2 + 2))
      const gratPracticeScore = gratitude.length === 0 ? null
        : clamp(Math.min(10, new Set(gratitude.map((g: any) => g.date)).size / 3)) // 30 unique days => 10
      const parts = [visionScore, gratPracticeScore].filter((v): v is number => v !== null)
      const evidence: string[] = []
      if (visionScore !== null) evidence.push(`Vision items: ${vision.length}`)
      if (gratPracticeScore !== null) evidence.push(`Gratitude entries total: ${gratitude.length}`)
      const conf: DimensionResult["confidence"] = parts.length >= 2 ? "medium" : parts.length === 1 ? "low" : "none"
      results.spirituality = {
        id: "spirituality",
        computed: parts.length ? round1(parts.reduce((a, b) => a + b, 0) / parts.length) : null,
        confidence: conf,
        basis: "vision + gratitude practice",
        evidence: evidence.length ? evidence : ["No vision or gratitude signals yet"],
      }
    }

    // ---- CONTRIBUTION ----
    // only self-assessed (no direct data source); mark as such
    {
      results.contribution = {
        id: "contribution", computed: null, confidence: "none",
        basis: "self-assessment only",
        evidence: ["No tracked data — rate yourself below"],
      }
    }

    return results
  }, [
    moods, healthEntries, streaks, wallet, goals,
    habits, waterLog, focusHistory, gratitude, breathwork,
    people, relationships, budget, networth, reading, skills, vision, wins, energyLog,
    today,
  ])

  // effective score per dimension (computed if available, else self-assess)
  const effective = useMemo(() => {
    const out = {} as Record<AreaId, number>
    LIFE_AREAS.forEach(a => {
      out[a.id] = computed[a.id].computed ?? selfAssess[a.id]
    })
    return out
  }, [computed, selfAssess])

  // 30-days-ago snapshot — derived from flourishing history + by re-computing from old data
  // Use closest snapshot from flourishing-history (only has 6 dimensions) OR the dimension-history we persist ourselves
  const [wheelHistory, setWheelHistory] = useState<{ date: string; scores: Record<string, number> }[]>([])
  useEffect(() => {
    if (!lsReady) return
    setWheelHistory(safeParse<any[]>("hfp-life-wheel-history", []))
  }, [lsReady])

  // persist today's snapshot
  useEffect(() => {
    if (!lsReady) return
    try {
      const saved = safeParse<any[]>("hfp-life-wheel-history", [])
      const withoutToday = saved.filter(h => h.date !== today)
      const scoresToSave = Object.fromEntries(LIFE_AREAS.map(a => [a.id, effective[a.id]]))
      const updated = [...withoutToday, { date: today, scores: scoresToSave }].slice(-90)
      localStorage.setItem("hfp-life-wheel-history", JSON.stringify(updated))
      setWheelHistory(updated)
    } catch {}
    // only when effective scores are actually populated (lsReady ensures data loaded)
  }, [lsReady, today,
    effective.health, effective.mental, effective.relationships, effective.career, effective.finances,
    effective.education, effective.environment, effective.fun, effective.spirituality, effective.contribution,
  ])

  // Find snapshot closest to 30 days ago
  const prevSnapshot = useMemo(() => {
    if (wheelHistory.length < 2) return null
    const target = dateNDaysAgo(30)
    let best: { date: string; scores: Record<string, number> } | null = null
    let bestGap = Infinity
    for (const h of wheelHistory) {
      const gap = Math.abs(new Date(h.date).getTime() - new Date(target).getTime())
      if (gap < bestGap) { bestGap = gap; best = h }
    }
    // only use if within 40 days of target (so we have meaningful comparison)
    if (!best || bestGap > 40 * 86400000) return null
    return best
  }, [wheelHistory])

  // ----- aggregate metrics -----
  const scores = LIFE_AREAS.map(a => effective[a.id])
  const avgScore = round1(scores.reduce((s, v) => s + v, 0) / scores.length)
  const maxS = Math.max(...scores); const minS = Math.min(...scores)
  const balance = Math.round((1 - (maxS - minS) / 10) * 100)
  const sortedLow = [...LIFE_AREAS].sort((a, b) => effective[a.id] - effective[b.id])
  const weakest = sortedLow.slice(0, 2)
  const highest = sortedLow[sortedLow.length - 1]

  // most improved / declined vs 30d ago
  const deltas = useMemo(() => {
    if (!prevSnapshot) return null
    return LIFE_AREAS.map(a => ({
      area: a,
      now: effective[a.id],
      prev: prevSnapshot.scores[a.id] ?? null,
      delta: prevSnapshot.scores[a.id] !== undefined ? round1(effective[a.id] - prevSnapshot.scores[a.id]) : null,
    })).filter(d => d.delta !== null) as { area: typeof LIFE_AREAS[number]; now: number; prev: number; delta: number }[]
  }, [prevSnapshot, effective])

  const mostImproved = deltas && deltas.length ? [...deltas].sort((a, b) => b.delta - a.delta)[0] : null
  const mostDeclined = deltas && deltas.length ? [...deltas].sort((a, b) => a.delta - b.delta)[0] : null

  // 30-day balance score time series (from wheel history)
  const balanceSeries = useMemo(() => {
    const days: { date: string; score: number; balance: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = dateNDaysAgo(i)
      const snap = wheelHistory.find(h => h.date === d)
      if (snap) {
        const vals = LIFE_AREAS.map(a => snap.scores[a.id] ?? 5)
        const avg = round1(vals.reduce((a, b) => a + b, 0) / vals.length)
        const bal = Math.round((1 - (Math.max(...vals) - Math.min(...vals)) / 10) * 100)
        days.push({ date: d, score: avg, balance: bal })
      }
    }
    return days
  }, [wheelHistory])

  // action suggestions tied to specific features
  const actionFor = (id: AreaId): { label: string; href: string }[] => {
    switch (id) {
      case "health": return [{ label: "Log sleep", href: "/sleep-optimization" }, { label: "Log exercise", href: "/health" }, { label: "Check daily habits", href: "/daily-habits" }]
      case "mental": return [{ label: "Log mood", href: "/mental-health" }, { label: "Gratitude practice", href: "/gratitude" }, { label: "Breathwork", href: "/breathwork" }]
      case "relationships": return [{ label: "Reach out to overdue contacts", href: "/people" }, { label: "Map your circles", href: "/relationships" }]
      case "career": return [{ label: "Set or advance a goal", href: "/goals" }, { label: "Review vision", href: "/vision" }]
      case "finances": return [{ label: "Update budget", href: "/budget" }, { label: "Snapshot net worth", href: "/net-worth" }]
      case "education": return [{ label: "Read 20 min", href: "/reading" }, { label: "Practice a skill", href: "/skills" }, { label: "Focus session", href: "/focus-timer" }]
      case "environment": return [{ label: "Log water", href: "/water-tracker" }, { label: "Track energy", href: "/energy-management" }, { label: "Home maintenance", href: "/home-maintenance" }]
      case "fun": return [{ label: "Log a win", href: "/wins" }, { label: "Breathwork", href: "/breathwork" }, { label: "Creative play", href: "/vision-board" }]
      case "spirituality": return [{ label: "Add to vision", href: "/vision" }, { label: "Gratitude entry", href: "/gratitude" }, { label: "Evening review", href: "/evening-review" }]
      case "contribution": return [{ label: "Join community", href: "/community" }, { label: "Governance", href: "/governance" }]
    }
  }

  // ----- RADAR chart (hand-rolled SVG with two overlays) -----
  const size = 340
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 40
  const angleAt = (i: number) => (i * 360 / LIFE_AREAS.length - 90) * Math.PI / 180
  const pointAt = (i: number, v: number) => {
    const a = angleAt(i)
    const r = (v / 10) * maxR
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const polyPoints = (vals: number[]) =>
    vals.map((v, i) => { const p = pointAt(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(" ")

  const confBadge = (c: DimensionResult["confidence"]) => {
    if (c === "high") return <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700">high confidence</Badge>
    if (c === "medium") return <Badge variant="outline" className="text-[9px] border-blue-300 text-blue-700">medium</Badge>
    if (c === "low") return <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">low</Badge>
    return <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-600">self-assessment</Badge>
  }

  // ----- RENDER -----
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Life Wheel</h1>
            <p className="text-xs text-muted-foreground">Computed from your real data across the platform. Self-assess only where no data exists.</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Overall</p>
            <p className="text-2xl font-bold text-violet-600">{avgScore}<span className="text-xs text-muted-foreground">/10</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-amber-600">{balance}<span className="text-xs text-muted-foreground">%</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Strongest</p>
            <p className="text-sm font-semibold" style={{ color: highest.color }}>{highest.short}</p>
            <p className="text-xs text-muted-foreground">{round1(effective[highest.id])}/10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Weakest</p>
            <p className="text-sm font-semibold" style={{ color: weakest[0].color }}>{weakest[0].short}</p>
            <p className="text-xs text-muted-foreground">{round1(effective[weakest[0].id])}/10</p>
          </CardContent>
        </Card>
      </div>

      {/* Radar chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Balance Radar</CardTitle>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-violet-600" />today</span>
              {prevSnapshot && (
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-slate-400 border-dashed" style={{ borderTop: "2px dashed #94a3b8" }} />30 days ago</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md">
              {/* Background rings */}
              {[2, 4, 6, 8, 10].map(ring => (
                <polygon
                  key={ring}
                  points={LIFE_AREAS.map((_, i) => { const p = pointAt(i, ring); return `${p.x},${p.y}` }).join(" ")}
                  fill="none" stroke="currentColor" className="text-border" strokeWidth={0.5}
                />
              ))}
              {/* Spokes */}
              {LIFE_AREAS.map((_, i) => {
                const p = pointAt(i, 10)
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" className="text-border" strokeWidth={0.5} />
              })}
              {/* 30-day-ago overlay (dashed) */}
              {prevSnapshot && (
                <polygon
                  points={polyPoints(LIFE_AREAS.map(a => prevSnapshot.scores[a.id] ?? 5))}
                  fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3"
                />
              )}
              {/* Current overlay */}
              <polygon
                points={polyPoints(LIFE_AREAS.map(a => effective[a.id]))}
                fill="rgba(124, 58, 237, 0.18)" stroke="#7c3aed" strokeWidth={2}
              />
              {/* Dim dots */}
              {LIFE_AREAS.map((a, i) => {
                const p = pointAt(i, effective[a.id])
                return <circle key={a.id} cx={p.x} cy={p.y} r={4} fill={a.color} />
              })}
              {/* Labels */}
              {LIFE_AREAS.map((a, i) => {
                const ang = angleAt(i)
                const lx = cx + (maxR + 22) * Math.cos(ang)
                const ly = cy + (maxR + 22) * Math.sin(ang)
                return (
                  <g key={a.id}>
                    <text x={lx} y={ly - 4} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-foreground font-medium">{a.short}</text>
                    <text x={lx} y={ly + 7} textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-muted-foreground">{round1(effective[a.id])}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Most improved / declined */}
      {(mostImproved || mostDeclined) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mostImproved && mostImproved.delta > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-800">Most improved (30d)</p>
                </div>
                <p className="text-sm font-medium" style={{ color: mostImproved.area.color }}>{mostImproved.area.label}</p>
                <p className="text-xs text-muted-foreground">{round1(mostImproved.prev)} → {round1(mostImproved.now)} (+{mostImproved.delta})</p>
              </CardContent>
            </Card>
          )}
          {mostDeclined && mostDeclined.delta < 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-xs font-semibold text-red-800">Most declined (30d)</p>
                </div>
                <p className="text-sm font-medium" style={{ color: mostDeclined.area.color }}>{mostDeclined.area.label}</p>
                <p className="text-xs text-muted-foreground">{round1(mostDeclined.prev)} → {round1(mostDeclined.now)} ({mostDeclined.delta})</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Balance time series */}
      {balanceSeries.length >= 2 ? (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Balance & Overall — last 30 days</CardTitle></CardHeader>
          <CardContent>
            <BalanceLine series={balanceSeries} />
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-violet-500" />overall /10</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-amber-500" />balance %</span>
              <span className="ml-auto">{balanceSeries.length} daily snapshot{balanceSeries.length === 1 ? "" : "s"}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/20">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Time-series graph needs at least 2 daily snapshots. One is saved automatically each time you open this page — come back tomorrow.</p>
          </CardContent>
        </Card>
      )}

      {/* Weakest-area action plan */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base">Focus here next</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakest.map(a => (
            <div key={a.id} className="rounded-lg border p-3 bg-background">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: a.color }} />
                  <p className="text-sm font-semibold">{a.label}</p>
                  <span className="text-xs font-bold" style={{ color: a.color }}>{round1(effective[a.id])}/10</span>
                </div>
                {confBadge(computed[a.id].confidence)}
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{computed[a.id].evidence[0]}</p>
              <div className="flex flex-wrap gap-1.5">
                {actionFor(a.id).map(act => (
                  <a key={act.href} href={act.href}
                     className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border bg-background hover:bg-muted transition-colors">
                    {act.label}<ArrowRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Per-dimension detail */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All dimensions — computed vs self-assessed</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {LIFE_AREAS.map(a => {
            const c = computed[a.id]
            const hasComputed = c.computed !== null
            const delta = prevSnapshot?.scores[a.id] !== undefined
              ? round1(effective[a.id] - prevSnapshot!.scores[a.id]) : null
            return (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-sm font-semibold">{a.label}</span>
                    {confBadge(c.confidence)}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {hasComputed && (
                      <span className="text-muted-foreground">computed <strong style={{ color: a.color }}>{c.computed}</strong></span>
                    )}
                    <span className="text-muted-foreground">self <strong>{selfAssess[a.id]}</strong></span>
                    {delta !== null && delta !== 0 && (
                      <span className={cn("font-medium flex items-center gap-0.5",
                        delta > 0 ? "text-emerald-600" : "text-red-600")}>
                        {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">Source: {c.basis}</p>
                <ul className="text-[11px] text-muted-foreground mb-2 space-y-0.5">
                  {c.evidence.map((ev, i) => <li key={i}>• {ev}</li>)}
                </ul>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">Self-rate:</span>
                  <Slider
                    min={1} max={10} step={1}
                    value={[selfAssess[a.id]]}
                    onValueChange={([v]) => setSelfAssess(prev => ({ ...prev, [a.id]: v }))}
                  />
                  <span className="text-xs font-bold w-6 text-right" style={{ color: a.color }}>{selfAssess[a.id]}</span>
                </div>
                {hasComputed && Math.abs((c.computed as number) - selfAssess[a.id]) >= 2 && (
                  <div className="flex items-start gap-1 mt-2 text-[10px] text-amber-700">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                      {(c.computed as number) > selfAssess[a.id]
                        ? `Your data is stronger than you feel here (+${round1((c.computed as number) - selfAssess[a.id])}). Trust the evidence.`
                        : `You rate yourself higher than the data shows (−${round1(selfAssess[a.id] - (c.computed as number))}). Something real may be missing logs.`}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
              <p><strong className="text-foreground">How this is computed:</strong> each dimension draws from the tools you actually use. Health blends sleep logs, exercise frequency, and habit completion. Mental pulls mood averages, stability, and gratitude. Relationships come from /people contact recency and quality. Finances combine budget surplus and net-worth trajectory. Growth uses books, skills, and focus minutes. Where no tracked data exists (contribution, sometimes environment), the slider is your honest self-assessment.</p>
              <p>A snapshot is stored each day so you can compare against 30 days ago and see which dimensions are actually moving. Focus on the weakest two — balance comes from raising the floor, not chasing the ceiling.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 text-xs flex-wrap">
        <a href="/dashboard" className="text-violet-600 hover:underline">Dashboard</a>
        <a href="/life-os" className="text-indigo-600 hover:underline">Life OS</a>
        <a href="/flourishing-score" className="text-emerald-600 hover:underline">Flourishing Score</a>
        <a href="/trends" className="text-blue-600 hover:underline">Trends</a>
      </div>
    </div>
  )
}

// ---------- small chart ----------
function BalanceLine({ series }: { series: { date: string; score: number; balance: number }[] }) {
  const w = 600; const h = 140; const pad = 24
  const n = series.length
  const xAt = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, n - 1)
  const scoreY = (v: number) => h - pad - (v / 10) * (h - 2 * pad)
  const balY = (v: number) => h - pad - (v / 100) * (h - 2 * pad)
  const scorePts = series.map((d, i) => `${xAt(i)},${scoreY(d.score).toFixed(1)}`).join(" ")
  const balPts = series.map((d, i) => `${xAt(i)},${balY(d.balance).toFixed(1)}`).join(" ")
  const first = series[0]; const last = series[n - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      {/* gridlines */}
      {[0, 25, 50, 75, 100].map(g => (
        <line key={g} x1={pad} x2={w - pad} y1={balY(g)} y2={balY(g)} stroke="currentColor" className="text-border" strokeWidth={0.5} />
      ))}
      {/* balance line */}
      <polyline points={balPts} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinejoin="round" />
      {/* score line */}
      <polyline points={scorePts} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinejoin="round" />
      {/* endpoints */}
      <circle cx={xAt(n - 1)} cy={scoreY(last.score)} r={3} fill="#7c3aed" />
      <circle cx={xAt(n - 1)} cy={balY(last.balance)} r={3} fill="#f59e0b" />
      {/* date labels */}
      <text x={pad} y={h - 4} className="fill-muted-foreground" style={{ fontSize: 9 }}>{first.date.slice(5)}</text>
      <text x={w - pad} y={h - 4} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 9 }}>{last.date.slice(5)}</text>
    </svg>
  )
}
