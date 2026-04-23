"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  Trophy, Plus, Star, Sparkles, Trash2, Calendar, Flame, Zap,
  TrendingUp, Target, Award, Activity, BarChart3, Layers
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

interface Win {
  id: string
  text: string
  category: string
  date: string
  size: "small" | "medium" | "big"
}

interface DerivedWin {
  id: string
  text: string
  category: string
  date: string
  size: Win["size"]
  source: "habit" | "challenge" | "goal" | "achievement" | "streak"
}

type AnyWin = (Win & { source?: undefined }) | DerivedWin

const CATEGORIES = [
  { value: "health",    label: "Health",          color: "bg-emerald-100 text-emerald-700 border-emerald-300", fill: "#10b981" },
  { value: "career",    label: "Career",          color: "bg-blue-100 text-blue-700 border-blue-300",          fill: "#3b82f6" },
  { value: "family",    label: "Family",          color: "bg-rose-100 text-rose-700 border-rose-300",          fill: "#f43f5e" },
  { value: "financial", label: "Financial",       color: "bg-amber-100 text-amber-700 border-amber-300",       fill: "#f59e0b" },
  { value: "learning",  label: "Learning",        color: "bg-violet-100 text-violet-700 border-violet-300",    fill: "#8b5cf6" },
  { value: "personal",  label: "Personal Growth", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300", fill: "#d946ef" },
  { value: "social",    label: "Social",          color: "bg-cyan-100 text-cyan-700 border-cyan-300",          fill: "#06b6d4" },
  { value: "other",     label: "Other",           color: "bg-slate-100 text-slate-700 border-slate-300",       fill: "#64748b" },
] as const

type CategoryValue = typeof CATEGORIES[number]["value"]

const SIZE_LABELS = { small: "Daily Win", medium: "Weekly Win", big: "Major Win" }

const CATEGORY_KEYWORDS: Record<CategoryValue, string[]> = {
  health:    ["run", "ran", "workout", "gym", "exercise", "lifted", "yoga", "walk", "hike", "sleep", "slept", "meditat", "water", "healthy", "cold shower", "breathwork", "fitness", "weight", "nutrition", "cooked", "cardio", "stretch", "recovery", "hydrat", "doctor", "therapy session"],
  career:    ["promot", "raise", "project", "launched", "shipped", "deadline", "meeting", "client", "boss", "interview", "hired", "job", "business", "startup", "pitched", "sales", "deal", "contract", "presentation", "manager", "team", "coworker", "quarter", "okr"],
  family:    ["kid", "child", "son", "daughter", "wife", "husband", "partner", "spouse", "mom", "dad", "mother", "father", "brother", "sister", "family", "parent", "baby", "dinner with", "holiday"],
  financial: ["saved", "invest", "stock", "crypto", "paid off", "debt", "budget", "income", "earned", "sold", "paycheck", "bonus", "tax", "retirement", "$", "dollar", "money", "rent", "mortgage"],
  learning:  ["learn", "read", "book", "course", "study", "class", "skill", "language", "practiced", "tutor", "lesson", "certification", "exam", "passed test", "degree", "research", "understood", "finished chapter", "code", "coding", "built", "wrote", "essay"],
  personal:  ["habit", "streak", "journal", "gratitude", "reflect", "mindful", "overcame", "fear", "discipline", "focus", "willpower", "courage", "growth", "self", "confidence", "proud"],
  social:    ["friend", "call", "called", "reached out", "coffee with", "lunch with", "party", "community", "volunteer", "helped", "gave", "gift", "date", "networking", "reconnected"],
  other:     [],
}

const PROMPTS = [
  "What went well today?",
  "What are you proud of this week?",
  "What obstacle did you overcome recently?",
  "What skill did you improve?",
  "What relationship got stronger?",
  "What did you do for your health?",
  "What financial progress did you make?",
  "What made you smile today?",
  "What did your child do that made you proud?",
  "What fear did you face?",
]

function detectCategory(text: string): CategoryValue {
  const lower = text.toLowerCase()
  let bestCat: CategoryValue = "other"
  let bestScore = 0
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryValue, string[]][]) {
    let score = 0
    for (const kw of keywords) if (lower.includes(kw)) score++
    if (score > bestScore) { bestScore = score; bestCat = cat }
  }
  return bestCat
}

function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toISOString().split("T")[0]
}

function startOfWeek(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0)
  const dow = x.getDay() // 0 = Sunday
  x.setDate(x.getDate() - dow)
  return x
}

function weekKey(d: Date | string): string {
  return dayKey(startOfWeek(typeof d === "string" ? new Date(d) : d))
}

function sizeWeight(s: Win["size"]): number {
  return s === "big" ? 5 : s === "medium" ? 3 : 1
}

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState("")
  const [newCategory, setNewCategory] = useState<CategoryValue>("personal")
  const [manualCategory, setManualCategory] = useState(false)
  const [newSize, setNewSize] = useState<Win["size"]>("small")
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const [activeFilter, setActiveFilter] = useState<CategoryValue | "all">("all")
  const [includeDerived, setIncludeDerived] = useState(true)

  // Cross-feature data sources
  const { data: habitsData } = useSWR("/api/habits?months=3", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)
  const { data: achievementsData } = useSWR("/api/achievements", secureFetcher)
  const { data: streaksData } = useSWR("/api/streaks", secureFetcher)

  // localStorage derived sources
  const [localHabits, setLocalHabits] = useState<any[]>([])
  const [localChallenges, setLocalChallenges] = useState<any[]>([])
  const [customChallenges, setCustomChallenges] = useState<any[]>([])

  useEffect(() => {
    try { const s = localStorage.getItem("hfp-wins"); if (s) setWins(JSON.parse(s)) } catch {}
    try { setLocalHabits(JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")) } catch {}
    try { setLocalChallenges(JSON.parse(localStorage.getItem("hfp-challenges") || "[]")) } catch {}
    try { setCustomChallenges(JSON.parse(localStorage.getItem("hfp-custom-challenges") || "[]")) } catch {}
  }, [])

  // Auto-categorize as user types
  useEffect(() => {
    if (!manualCategory && newText.trim().length >= 4) {
      setNewCategory(detectCategory(newText))
    }
  }, [newText, manualCategory])

  function save(updated: Win[]) {
    setWins(updated)
    localStorage.setItem("hfp-wins", JSON.stringify(updated))
  }

  function addWin() {
    const text = newText.trim()
    if (!text) return
    save([{
      id: Date.now().toString(36),
      text,
      category: manualCategory ? newCategory : detectCategory(text),
      date: new Date().toISOString(),
      size: newSize,
    }, ...wins])
    setNewText("")
    setManualCategory(false)
    setShowAdd(false)
  }

  function removeWin(id: string) {
    save(wins.filter(w => w.id !== id))
  }

  // ===== Derived wins from other features =====
  const derivedWins: DerivedWin[] = useMemo(() => {
    const out: DerivedWin[] = []
    const MIN_HABIT_STREAK = 7
    const MILESTONE_STREAKS = [7, 14, 21, 30, 60, 100]

    // Habit milestones (localStorage daily habits)
    for (const h of localHabits) {
      const dates: string[] = Array.isArray(h.completedDates) ? [...h.completedDates].sort() : []
      if (dates.length === 0) continue
      // Find consecutive streaks that hit milestones
      let run = 1
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]).getTime()
        const cur = new Date(dates[i]).getTime()
        const diff = Math.round((cur - prev) / 86400000)
        if (diff === 1) {
          run++
          if (MILESTONE_STREAKS.includes(run)) {
            out.push({
              id: `habit-${h.id ?? h.name}-${dates[i]}-${run}`,
              text: `Hit ${run}-day streak on "${h.name ?? h.title ?? "habit"}"`,
              category: "personal",
              date: new Date(dates[i] + "T12:00:00").toISOString(),
              size: run >= 100 ? "big" : run >= 30 ? "medium" : "small",
              source: "habit",
            })
          }
        } else {
          run = 1
        }
      }
    }

    // Challenge completions (localStorage 30-day challenges)
    const challengeMeta: Record<string, string> = {}
    for (const c of customChallenges) challengeMeta[c.id] = c.name ?? "Custom Challenge"
    for (const ac of localChallenges) {
      const done = ac.completedDays?.length ?? 0
      const name = challengeMeta[ac.challengeId] ?? ac.challengeId ?? "Challenge"
      if (done >= 30) {
        const lastDay = [...ac.completedDays].sort().slice(-1)[0]
        out.push({
          id: `challenge-${ac.challengeId}-${ac.startDate}`,
          text: `Completed 30-day ${name} challenge`,
          category: name.toLowerCase().includes("read") ? "learning" : "personal",
          date: new Date(lastDay + "T18:00:00").toISOString(),
          size: "big",
          source: "challenge",
        })
      } else if (done >= 7) {
        const lastDay = [...ac.completedDays].sort().slice(-1)[0]
        out.push({
          id: `challenge-${ac.challengeId}-week-${ac.startDate}`,
          text: `${done} days into ${name} challenge`,
          category: "personal",
          date: new Date(lastDay + "T18:00:00").toISOString(),
          size: "medium",
          source: "challenge",
        })
      }
    }

    // Completed goals
    const goals = goalsData?.goals ?? []
    for (const g of goals) {
      if (g.completedAt) {
        const cat = g.module === "HEALTH" ? "health" : g.module === "EDUCATION" ? "learning" : "personal"
        out.push({
          id: `goal-${g.id}`,
          text: `Completed goal: ${g.title}`,
          category: cat,
          date: g.completedAt,
          size: "big",
          source: "goal",
        })
      }
    }

    // Earned achievements (only gold & platinum surface as wins)
    const badges = achievementsData?.badges ?? []
    for (const b of badges) {
      if (!b.earned) continue
      if (b.tier !== "gold" && b.tier !== "platinum") continue
      // Best-guess category from id prefix
      const id = String(b.id)
      let cat: CategoryValue = "personal"
      if (id.startsWith("health")) cat = "health"
      else if (id.startsWith("session") || id.startsWith("first-session") || id.startsWith("study")) cat = "learning"
      else if (id.startsWith("found")) cat = "financial"
      out.push({
        id: `badge-${b.id}`,
        text: `Earned "${b.name}" achievement`,
        category: cat,
        date: new Date().toISOString(), // achievements API doesn't expose earn date
        size: b.tier === "platinum" ? "big" : "medium",
        source: "achievement",
      })
    }

    // Major streak milestones from API streaks
    const streaks = streaksData?.streaks ?? {}
    const streakEntries: [string, CategoryValue][] = [
      ["health", "health"], ["mood", "personal"], ["journal", "personal"],
      ["education", "learning"], ["energy", "other"], ["overall", "personal"],
    ]
    for (const [key, cat] of streakEntries) {
      const s = streaks[key]
      if (!s) continue
      const len = s.current || 0
      for (const mile of [7, 14, 30, 60, 100]) {
        if (len >= mile) {
          out.push({
            id: `streak-${key}-${mile}`,
            text: `${mile}-day ${key === "overall" ? "platform" : key} streak active`,
            category: cat,
            date: new Date().toISOString(),
            size: mile >= 60 ? "big" : mile >= 14 ? "medium" : "small",
            source: "streak",
          })
        }
      }
    }

    return out
  }, [localHabits, localChallenges, customChallenges, goalsData, achievementsData, streaksData])

  // Combined set (deduped manual wins + derived)
  const allWins: AnyWin[] = useMemo(() => {
    const manual: AnyWin[] = wins
    const combined: AnyWin[] = includeDerived ? [...manual, ...derivedWins] : manual
    return [...combined].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [wins, derivedWins, includeDerived])

  // ===== Metrics =====
  const now = new Date()
  const todayKey = dayKey(now)

  const thisWeekStart = startOfWeek(now)
  const thisWeek = allWins.filter(w => new Date(w.date) >= thisWeekStart).length

  // Rolling 30-day average (wins per day)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const last30 = allWins.filter(w => new Date(w.date) >= thirtyDaysAgo)
  const velocity = Math.round((last30.length / 30) * 10) / 10

  // Day-level streak (at least 1 win per day)
  const winDays = new Set(allWins.map(w => dayKey(w.date)))
  let dayStreak = 0
  {
    const d = new Date(now); d.setHours(0, 0, 0, 0)
    for (let i = 0; i < 730; i++) {
      const k = dayKey(d)
      if (winDays.has(k)) { dayStreak++; d.setDate(d.getDate() - 1) }
      else if (i === 0) { d.setDate(d.getDate() - 1) } // today empty is OK
      else break
    }
  }

  // Week-level streak (at least 1 win per week)
  const weekSet = new Set(allWins.map(w => weekKey(w.date)))
  let weekStreak = 0
  {
    const w = startOfWeek(now)
    for (let i = 0; i < 260; i++) {
      const k = dayKey(w)
      if (weekSet.has(k)) { weekStreak++; w.setDate(w.getDate() - 7) }
      else if (i === 0) { w.setDate(w.getDate() - 7) }
      else break
    }
  }

  // 12-week sparkline (wins per week, oldest -> newest)
  const weeklySeries = useMemo(() => {
    const series: { weekStart: Date; count: number; score: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const ws = new Date(thisWeekStart); ws.setDate(ws.getDate() - i * 7)
      const we = new Date(ws); we.setDate(we.getDate() + 7)
      const inWeek = allWins.filter(w => { const d = new Date(w.date); return d >= ws && d < we })
      const score = inWeek.reduce((s, w) => s + sizeWeight(w.size), 0)
      series.push({ weekStart: ws, count: inWeek.length, score })
    }
    return series
  }, [allWins, thisWeekStart])

  // Best week (highest weighted score)
  const bestWeek = useMemo(() => {
    if (allWins.length === 0) return null
    const byWeek: Record<string, { start: Date; count: number; score: number }> = {}
    for (const w of allWins) {
      const ws = startOfWeek(new Date(w.date))
      const k = dayKey(ws)
      if (!byWeek[k]) byWeek[k] = { start: ws, count: 0, score: 0 }
      byWeek[k].count++
      byWeek[k].score += sizeWeight(w.size)
    }
    const weeks = Object.values(byWeek)
    return weeks.reduce((a, b) => (b.score > a.score ? b : a))
  }, [allWins])

  // Category distribution
  const catDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const w of allWins) counts[w.category] = (counts[w.category] ?? 0) + 1
    return CATEGORIES.map(c => ({ ...c, count: counts[c.value] ?? 0 }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [allWins])
  const catTotal = catDist.reduce((s, c) => s + c.count, 0)

  // Momentum: recency (last 14 days) + diversity (unique categories in last 30 days)
  const momentum = useMemo(() => {
    const fourteenAgo = new Date(now.getTime() - 14 * 86400000)
    const recent = allWins.filter(w => new Date(w.date) >= fourteenAgo)
    // Frequency: up to 60 pts (2 pts per recent win, cap at 60)
    const freqPts = Math.min(60, recent.length * 2)
    // Diversity: up to 40 pts (10 pts per unique category in last 30 days, cap at 4)
    const cats30 = new Set(last30.map(w => w.category))
    const divPts = Math.min(40, cats30.size * 10)
    return {
      score: Math.min(100, freqPts + divPts),
      freqPts, divPts,
      recentCount: recent.length,
      uniqueCats: cats30.size,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWins])

  const momentumLabel = momentum.score >= 70 ? "High" : momentum.score >= 40 ? "Steady" : "Building"
  const momentumColor = momentum.score >= 70 ? "emerald" : momentum.score >= 40 ? "amber" : "slate"

  // Filtered list
  const filteredWins = activeFilter === "all" ? allWins : allWins.filter(w => w.category === activeFilter)

  // Group by month
  const byMonth: Record<string, AnyWin[]> = {}
  for (const win of filteredWins) {
    const key = new Date(win.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(win)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Wins & Gratitude</h1>
          </div>
          <p className="text-sm text-muted-foreground">Every win logged. Manual entries plus derived wins from habits, goals, challenges, and streaks.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Win</Button>
      </div>

      {/* Top stats */}
      {allWins.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{allWins.length}</p>
            <p className="text-[10px] text-muted-foreground">Total wins</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{thisWeek}</p>
            <p className="text-[10px] text-muted-foreground">This week</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{velocity}</p>
            <p className="text-[10px] text-muted-foreground">Velocity (30d avg/day)</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-violet-600">{dayStreak}</p>
            <p className="text-[10px] text-muted-foreground">Day streak</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-orange-600">{weekStreak}</p>
            <p className="text-[10px] text-muted-foreground">Week streak</p>
          </CardContent></Card>
        </div>
      )}

      {/* Momentum + Weekly sparkline */}
      {allWins.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Momentum */}
          <Card className={cn("border-2 sm:col-span-1",
            momentumColor === "emerald" ? "border-emerald-200 bg-emerald-50/20" :
            momentumColor === "amber" ? "border-amber-200 bg-amber-50/20" :
            "border-slate-200 bg-slate-50/20"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className={cn("h-4 w-4",
                  momentumColor === "emerald" ? "text-emerald-500" :
                  momentumColor === "amber" ? "text-amber-500" : "text-slate-500")} />
                <p className="text-sm font-semibold">Momentum</p>
                <Badge variant="outline" className={cn("text-[10px] ml-auto",
                  momentumColor === "emerald" ? "border-emerald-300 text-emerald-700" :
                  momentumColor === "amber" ? "border-amber-300 text-amber-700" :
                  "border-slate-300 text-slate-700")}>{momentumLabel}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 shrink-0">
                  <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90">
                    <circle cx={40} cy={40} r={34} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={7} />
                    <circle cx={40} cy={40} r={34} fill="none"
                      stroke={momentumColor === "emerald" ? "#10b981" : momentumColor === "amber" ? "#f59e0b" : "#64748b"}
                      strokeWidth={7} strokeLinecap="round"
                      strokeDasharray={`${(momentum.score / 100) * 213.6} 213.6`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={cn("text-xl font-bold",
                      momentumColor === "emerald" ? "text-emerald-600" :
                      momentumColor === "amber" ? "text-amber-600" : "text-slate-600")}>{momentum.score}</p>
                    <p className="text-[8px] text-muted-foreground">/ 100</p>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground space-y-0.5 flex-1">
                  <div className="flex justify-between"><span>Frequency</span><span className="font-medium text-foreground">{momentum.freqPts}/60</span></div>
                  <div className="flex justify-between"><span>Diversity</span><span className="font-medium text-foreground">{momentum.divPts}/40</span></div>
                  <p className="pt-1">{momentum.recentCount} wins · {momentum.uniqueCats} categories · last 14/30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12-week sparkline */}
          <Card className="sm:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-semibold">Wins per Week · last 12</p>
                </div>
                {bestWeek && (
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                    Best: {bestWeek.count} wins ({bestWeek.score} pts)
                  </Badge>
                )}
              </div>
              <WeeklyBars series={weeklySeries} bestStart={bestWeek?.start ?? null} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best week callout */}
      {bestWeek && bestWeek.count > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50/40 to-orange-50/40">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Best week ever</p>
              <p className="text-sm font-semibold">
                Week of {bestWeek.start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {bestWeek.count} {bestWeek.count === 1 ? "win" : "wins"} · {bestWeek.score} impact points
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category distribution */}
      {catDist.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold">Category Distribution</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{catTotal} wins across {catDist.length} categories</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <CategoryDonut data={catDist} total={catTotal} />
              <div className="flex-1 w-full space-y-1.5">
                {catDist.map(c => {
                  const pct = Math.round((c.count / catTotal) * 100)
                  return (
                    <button key={c.value}
                      onClick={() => setActiveFilter(activeFilter === c.value ? "all" : c.value)}
                      className={cn("w-full rounded-md border px-2.5 py-1.5 transition-colors flex items-center gap-2 text-left",
                        activeFilter === c.value ? "bg-muted/60" : "hover:bg-muted/30")}>
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.fill }} />
                      <span className="text-xs font-medium flex-1">{c.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.fill }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{c.count} · {pct}%</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Derived wins toggle + filter chips */}
      {allWins.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setActiveFilter("all")}
            className={cn("rounded-full px-3 py-1 text-[11px] border transition-all",
              activeFilter === "all" ? "bg-foreground text-background border-foreground" : "hover:bg-muted/50")}>
            All · {allWins.length}
          </button>
          {catDist.map(c => (
            <button key={c.value} onClick={() => setActiveFilter(c.value)}
              className={cn("rounded-full px-3 py-1 text-[11px] border transition-all",
                activeFilter === c.value ? c.color + " font-semibold" : "border-border text-muted-foreground hover:bg-muted/50")}>
              {c.label} · {c.count}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={includeDerived} onChange={e => setIncludeDerived(e.target.checked)} className="h-3 w-3" />
              Include derived wins ({derivedWins.length})
            </label>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card className="border-2 border-amber-200 bg-amber-50/20">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground italic">{prompt}</p>
            <Input value={newText} onChange={e => setNewText(e.target.value)}
              placeholder="What's your win?"
              onKeyDown={e => e.key === "Enter" && addWin()} />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</p>
                {!manualCategory && newText.trim().length >= 4 && (
                  <p className="text-[10px] text-blue-600">auto-detected · tap to override</p>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => { setNewCategory(c.value); setManualCategory(true) }}
                    className={cn("rounded-full px-2.5 py-0.5 text-[10px] border transition-all",
                      newCategory === c.value ? c.color + " font-semibold" : "border-border text-muted-foreground hover:bg-muted/50"
                    )}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {(["small", "medium", "big"] as const).map(s => (
                <button key={s} onClick={() => setNewSize(s)}
                  className={cn("rounded-lg border px-3 py-1.5 text-xs transition-all flex items-center gap-1.5",
                    newSize === s ? "border-amber-400 bg-amber-50 font-semibold text-amber-700" : "border-border text-muted-foreground"
                  )}>
                  {s === "big" && <Star className="h-3 w-3" />}
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
            <Button onClick={addWin} disabled={!newText.trim()} className="w-full">
              <Sparkles className="h-4 w-4" /> Log This Win
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wins by month */}
      {Object.keys(byMonth).length > 0 ? (
        <div className="space-y-5">
          {Object.entries(byMonth).map(([month, monthWins]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{month}</p>
                <Badge variant="outline" className="text-[9px]">{monthWins.length}</Badge>
              </div>
              <div className="space-y-2">
                {monthWins.map(win => {
                  const cat = CATEGORIES.find(c => c.value === win.category)
                  const derived = (win as DerivedWin).source
                  return (
                    <Card key={win.id} className={cn("card-hover",
                      win.size === "big" ? "border-amber-200 bg-amber-50/10" : "",
                      derived ? "bg-muted/10" : ""
                    )}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className={cn("mt-0.5 shrink-0",
                          win.size === "big" ? "text-amber-500" :
                          win.size === "medium" ? "text-violet-400" : "text-muted-foreground/40"
                        )}>
                          {derived === "habit" || derived === "streak" ? <Flame className="h-4 w-4" /> :
                           derived === "challenge" ? <Target className="h-4 w-4" /> :
                           derived === "goal" ? <Target className="h-4 w-4 fill-current" /> :
                           derived === "achievement" ? <Award className="h-4 w-4" /> :
                           win.size === "big" ? <Star className="h-4 w-4 fill-current" /> :
                           win.size === "medium" ? <Star className="h-4 w-4" /> :
                           <Sparkles className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", win.size === "big" && "font-semibold")}>{win.text}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {cat && <Badge variant="outline" className={cn("text-[9px]", cat.color)}>{cat.label}</Badge>}
                            {derived && (
                              <Badge variant="outline" className="text-[9px] border-dashed text-muted-foreground">
                                auto · {derived}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">{new Date(win.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {!derived && (
                          <button onClick={() => removeWin(win.id)}
                            className="p-1 text-muted-foreground/20 hover:text-destructive shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : !showAdd && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No wins logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start small. Drank enough water today? That is a win. Showed up for your kids? Win. Made dinner instead of ordering? Win.</p>
            <p className="text-xs text-muted-foreground/80 mt-3">Hit a 7-day habit streak or finish a challenge and it will appear here automatically.</p>
          </CardContent>
        </Card>
      )}

      {/* Philosophy */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why log wins?</strong> Your brain has a negativity bias &mdash; it remembers failures 3x more vividly than successes.
            After a month of logging wins, you have undeniable proof that you ARE making progress, even on hard days.
            Research from Harvard Business School found that people who reflected on daily progress &mdash; no matter how
            small &mdash; were significantly more motivated, creative, and productive than those who did not.
            This page counts everything: the wins you remember, and the ones your habits, goals, and streaks quietly earn for you.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap text-xs">
        <a href="/mental-health/gratitude" className="text-rose-600 hover:underline">Gratitude Journal</a>
        <a href="/challenges" className="text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/life-wheel" className="text-violet-600 hover:underline">Life Wheel</a>
        <a href="/goals" className="text-blue-600 hover:underline">Goals</a>
        <a href="/daily-habits" className="text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/life-os" className="text-slate-600 hover:underline">Life OS</a>
      </div>
    </div>
  )
}

/* ---------- SVG: 12-week bar chart with best-week highlight ---------- */
function WeeklyBars({ series, bestStart }: {
  series: { weekStart: Date; count: number; score: number }[]
  bestStart: Date | null
}) {
  const W = 480, H = 90, PAD_L = 4, PAD_R = 4, PAD_T = 8, PAD_B = 18
  const n = series.length
  const barW = (W - PAD_L - PAD_R) / n
  const maxScore = Math.max(1, ...series.map(s => s.score))
  const innerH = H - PAD_T - PAD_B
  const bestKey = bestStart ? dayKey(bestStart) : null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      {/* zero line */}
      <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + innerH} y2={PAD_T + innerH} stroke="currentColor" className="text-muted/40" strokeWidth={1} />
      {series.map((s, i) => {
        const h = (s.score / maxScore) * innerH
        const x = PAD_L + i * barW + 2
        const y = PAD_T + innerH - h
        const isBest = bestKey && dayKey(s.weekStart) === bestKey
        const isNow = i === n - 1
        const fill = isBest ? "#f59e0b" : isNow ? "#10b981" : s.score > 0 ? "#8b5cf6" : "#e2e8f0"
        return (
          <g key={i}>
            <rect x={x} y={y} width={Math.max(1, barW - 4)} height={Math.max(h, s.score > 0 ? 2 : 1)} fill={fill} rx={2} opacity={s.score > 0 ? 1 : 0.4}>
              <title>{s.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {s.count} wins · {s.score} pts</title>
            </rect>
            {s.count > 0 && (
              <text x={x + (barW - 4) / 2} y={y - 2} textAnchor="middle" className="fill-current text-muted-foreground" fontSize={8}>
                {s.count}
              </text>
            )}
          </g>
        )
      })}
      {/* x-axis labels (first, middle, last) */}
      {[0, Math.floor(n / 2), n - 1].map(i => {
        const s = series[i]
        if (!s) return null
        const x = PAD_L + i * barW + barW / 2
        return (
          <text key={`lbl-${i}`} x={x} y={H - 4} textAnchor="middle" className="fill-current text-muted-foreground" fontSize={8}>
            {s.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        )
      })}
    </svg>
  )
}

/* ---------- SVG: Category donut ---------- */
function CategoryDonut({ data, total }: { data: { value: string; label: string; fill: string; count: number }[]; total: number }) {
  const size = 140, cx = size / 2, cy = size / 2, r = 54, thickness = 22
  if (total === 0) return null

  let acc = 0
  const arcs = data.map(d => {
    const frac = d.count / total
    const start = acc
    const end = acc + frac
    acc = end
    return { ...d, frac, start, end }
  })

  function arcPath(startFrac: number, endFrac: number): string {
    const startAngle = startFrac * 2 * Math.PI - Math.PI / 2
    const endAngle = endFrac * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const rInner = r - thickness
    const x3 = cx + rInner * Math.cos(endAngle)
    const y3 = cy + rInner * Math.sin(endAngle)
    const x4 = cx + rInner * Math.cos(startAngle)
    const y4 = cy + rInner * Math.sin(startAngle)
    const largeArc = endFrac - startFrac > 0.5 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  // Single-category edge case: render as full ring
  if (arcs.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={r - thickness / 2} fill="none" stroke={arcs[0].fill} strokeWidth={thickness} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-current font-bold" fontSize={20}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-current text-muted-foreground" fontSize={9}>wins</text>
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {arcs.map(a => (
        <path key={a.value} d={arcPath(a.start, a.end)} fill={a.fill}>
          <title>{a.label}: {a.count} · {Math.round(a.frac * 100)}%</title>
        </path>
      ))}
      <text x={cx} y={cy - 2} textAnchor="middle" className="fill-current font-bold" fontSize={20}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-current text-muted-foreground" fontSize={9}>wins</text>
    </svg>
  )
}
