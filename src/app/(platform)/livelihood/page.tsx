"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  Compass, Zap, Target, TrendingUp, AlertCircle, Sparkles, DollarSign, Clock,
  BookOpen, Users, Hammer, Pencil, GraduationCap, Building, Briefcase,
  LineChart, ArrowRight, ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { secureFetcher } from "@/lib/encrypted-fetch"

/**
 * Your Livelihood Partner
 *
 * Reads everything the platform already knows about the user and returns
 * an evidence-based monetization picture — asset inventory, revenue math,
 * archetype fit ranked by fit, anti-patterns, and a smallest-possible
 * experiment to validate a direction this week.
 *
 * Design principles:
 * - Data in, direction out. No generic "top 10 side hustles".
 * - Present what the logs suggest. User decides.
 * - Revenue targets grounded in actual budget, not abstract goals.
 * - Values as filters, not motivators — anti-patterns surface explicitly.
 * - Zero upsell. No course. No "unlock premium". Only their interest.
 */

// ───────────────────────────────────────────────
// Data types (loose — match whatever the user has)
// ───────────────────────────────────────────────
type Win = { id?: string; text?: string; title?: string; description?: string; category?: string; createdAt?: string; date?: string }
type DailyHabit = { id: string; name: string; completions?: string[]; completedDates?: string[] }
type Skill = { id?: string; name: string; level?: number; category?: string; hoursLogged?: number }
type FocusSession = { id?: string; date?: string; minutes?: number; duration?: number }
type Goal = { id?: string; title?: string; name?: string; active?: boolean }
type Book = { id?: string; title?: string; genre?: string; status?: string }
type StudySession = { id?: string; date: string; technique: string; topic: string; minutes: number }
type Person = { id?: string; name?: string; relationship?: string; tier?: number }
type StoredValues = { topFive: string[]; savedAt: string }
type BudgetExpense = { category: string; amount: number }
type BudgetData = { income?: number; expenses?: BudgetExpense[]; monthlyExpenses?: number }
type NetWorthData = { assets?: { name?: string; type?: string; category?: string; value: number }[]; liabilities?: { value: number }[] }
type NWSnap = { date: string; netWorth: number }

type Archetype = {
  key: string
  name: string
  icon: any
  color: string
  tagline: string
  description: string
  thrives: string[]
  struggles: string[]
  valueAffinities: string[]    // aligns with these values
  valueConflicts: string[]      // clashes with these values
  smallestExperiment: string
  revenueShape: string
}

const ARCHETYPES: Archetype[] = [
  {
    key: "creator",
    name: "Creator",
    icon: Pencil,
    color: "from-violet-500 to-fuchsia-500",
    tagline: "Publishing your voice — writing, video, audio, art",
    description: "You make things in public, consistently, and a small fraction of the people who encounter them buy, subscribe, or commission more. Income is lumpy early, compounds slowly, durable long.",
    thrives: ["daily output habit", "comfort with public-facing work", "a distinct voice or aesthetic", "patience with slow compounding"],
    struggles: ["irregular motivation", "needing immediate validation", "wanting clean weekly paychecks early on"],
    valueAffinities: ["Authenticity", "Creativity", "Freedom", "Curiosity", "Legacy"],
    valueConflicts: ["Security"],
    smallestExperiment: "Publish one piece this week — even if rough. Post it where strangers can see it. Track: did anyone engage? did you want to do it again next week?",
    revenueShape: "Slow ramp. First revenue often in month 3-9. Compounds to $1-10k/mo over 1-3 years if consistent.",
  },
  {
    key: "craftsman",
    name: "Craftsman",
    icon: Hammer,
    color: "from-amber-500 to-orange-500",
    tagline: "A specific skill done extraordinarily well — service or product",
    description: "You get deep at one thing and people pay for the depth. Freelance design, coding, repair, carpentry, advanced editing, bespoke fitness coaching. Rate goes up with reputation, not with scale.",
    thrives: ["depth over breadth", "quality-obsessed temperament", "word-of-mouth via happy clients", "enjoys focused work"],
    struggles: ["trading time for money has a ceiling", "client management if introverted"],
    valueAffinities: ["Excellence", "Integrity", "Discipline", "Authenticity"],
    valueConflicts: [],
    smallestExperiment: "Do one piece of paid work for one person this week — even at a discounted or symbolic rate. The goal is the experience of delivering for pay, not the money.",
    revenueShape: "Fast first dollar. Scales with rate increases, not hours. $40-200/hr range common within 12-24 months of seriousness.",
  },
  {
    key: "teacher",
    name: "Teacher",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
    tagline: "Packaging what you know into courses, coaching, cohorts",
    description: "You've figured out something that others struggle with, and you can explain it clearly. Income comes from transferring clarity — courses, 1:1 coaching, paid newsletters, workshops, cohort programs.",
    thrives: ["clear explanation of complex things", "patience with beginners", "narrative about your own journey", "repeatable process"],
    struggles: ["perfectionism delaying launch", "impostor syndrome", "hating sales"],
    valueAffinities: ["Wisdom", "Service", "Knowledge", "Generosity", "Growth"],
    valueConflicts: [],
    smallestExperiment: "Offer to teach one person one thing for free this week — a friend, a stranger, a group. Observe: did they get it? did teaching energize or drain you?",
    revenueShape: "Medium ramp. First course/coaching offer can hit $1-5k fast if you have audience. Cohort or premium coaching scales to $10-50k/mo.",
  },
  {
    key: "consultant",
    name: "Consultant",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-500",
    tagline: "Advising people and businesses using hard-won expertise",
    description: "You've done the thing companies want to know how to do. They pay for your judgment, not your execution time. Can scale into firms or stay solo-premium.",
    thrives: ["strong professional narrative", "comfort saying no", "willingness to charge for opinions"],
    struggles: ["not enough real-world experience to consult on", "undervaluing your own expertise"],
    valueAffinities: ["Integrity", "Excellence", "Wisdom", "Independence"],
    valueConflicts: [],
    smallestExperiment: "Have one diagnostic conversation this week with someone who could benefit from your expertise. Don't pitch. Just listen, analyze, prescribe. Did they want more?",
    revenueShape: "Slow to start (relationship-gated), then fast once trusted. $150-1000/hr common within 1-3 years.",
  },
  {
    key: "builder",
    name: "Builder",
    icon: Building,
    color: "from-rose-500 to-pink-500",
    tagline: "Products or software that earn while you sleep",
    description: "You ship things. Apps, SaaS, physical products, newsletters, directories, tools. Early years are all cost and effort; eventually the product earns without you in the loop.",
    thrives: ["sustained focus hours", "tolerance for 6-18 months of no revenue", "enjoys building over marketing", "technical or making skill"],
    struggles: ["releasing early and often", "marketing the thing after building it"],
    valueAffinities: ["Innovation", "Excellence", "Creativity", "Freedom", "Discipline"],
    valueConflicts: ["Security"],
    smallestExperiment: "Ship the smallest possible version of one thing this week — even if it's 10% of what you envision. The act of publishing matters more than the scope.",
    revenueShape: "Steep curve. Most products earn near-zero for 6-18 months then ramp. Successful products compound to $5-100k+/mo.",
  },
  {
    key: "operator",
    name: "Operator",
    icon: LineChart,
    color: "from-cyan-500 to-sky-500",
    tagline: "Running or operating existing businesses / real assets",
    description: "You don't need to invent. You run. Acquire a small business, operate a rental portfolio, manage a book of clients for someone else, operate a franchise. Capital + operational skill = cashflow.",
    thrives: ["systems thinking", "comfort with process and SOPs", "modest capital or access to it", "managing people"],
    struggles: ["needing high autonomy in daily work", "no capital runway"],
    valueAffinities: ["Discipline", "Responsibility", "Security", "Excellence"],
    valueConflicts: ["Creativity", "Adventure"],
    smallestExperiment: "Spend 2 hours this week researching small businesses for sale under $50k in your area, or property-management opportunities. You're looking for how these deals are structured, not ready to buy.",
    revenueShape: "Cashflow-first. Requires capital or sweat equity upfront; stable $3-30k/mo once operating.",
  },
  {
    key: "trader",
    name: "Trader / Investor",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    tagline: "Deploying capital to compound — markets, private investments",
    description: "You develop an edge — in public markets, private investing, or something structured — and deploy capital against it. Not luck; edge. Most people who try this lose money; the ones who succeed have a documented process.",
    thrives: ["emotional discipline", "accepting being wrong gracefully", "rigorous journaling", "process over outcome thinking"],
    struggles: ["needing the money short-term", "ego-driven decisions", "no edge"],
    valueAffinities: ["Discipline", "Wisdom", "Independence", "Patience"],
    valueConflicts: ["Security", "Community"],
    smallestExperiment: "Paper-trade or micro-allocate for the next month using your written criteria. The goal is to test your edge with real skin in the game at minimal cost — not to make money yet.",
    revenueShape: "Non-linear. Most years small; a few years outsized. Requires multi-year commitment before judging whether you have edge.",
  },
]

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
function daysSince(iso: string | undefined) {
  if (!iso) return Infinity
  return (Date.now() - new Date(iso).getTime()) / 86400000
}

export default function LivelihoodPage() {
  const [skills] = useSyncedStorage<Skill[]>("hfp-skills", [])
  const [habits] = useSyncedStorage<DailyHabit[]>("hfp-daily-habits", [])
  const [wins] = useSyncedStorage<Win[]>("hfp-wins", [])
  const [goals] = useSyncedStorage<Goal[]>("hfp-goals", [])
  const [reading] = useSyncedStorage<Book[]>("hfp-reading", [])
  const [studySessions] = useSyncedStorage<StudySession[]>("hfp-study-sessions", [])
  const [people] = useSyncedStorage<Person[]>("hfp-people", [])
  const [storedValues] = useSyncedStorage<StoredValues | null>("hfp-values", null)
  const [focusHistory] = useSyncedStorage<FocusSession[]>("hfp-focus-history", [])
  const [budget] = useSyncedStorage<BudgetData>("hfp-budget", {})
  const [netWorth] = useSyncedStorage<NetWorthData>("hfp-net-worth", {})
  const [nwHistory] = useSyncedStorage<NWSnap[]>("hfp-networth-history", [])
  const { data: moodData } = useSWR<{ moods: { score: number; recordedAt: string }[] }>("/api/mental-health/mood?limit=60", secureFetcher)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ───────────────── Asset inventory ─────────────────
  const inventory = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    const monthAgo = Date.now() - 30 * 86400000

    // Focus capacity — avg hours/week of deep work
    const recentFocus = focusHistory.filter(f => {
      const d = f.date ? new Date(f.date).getTime() : 0
      return d >= monthAgo
    })
    const focusMinTotal = recentFocus.reduce((s, f) => s + (f.minutes ?? f.duration ?? 0), 0)
    const focusHoursPerWeek = (focusMinTotal / 60) / 4

    // Habit consistency — completion rate over 7 days
    const habitRate = habits.length > 0
      ? habits.reduce((s, h) => {
          const recent = (h.completions ?? h.completedDates ?? []).filter(d => new Date(d).getTime() >= weekAgo).length
          return s + recent / 7
        }, 0) / habits.length
      : 0

    // Wins by category (dominant theme = leverage hint)
    const winCats: Record<string, number> = {}
    wins.forEach(w => {
      const c = (w.category ?? "other").toLowerCase()
      winCats[c] = (winCats[c] ?? 0) + 1
    })
    const topWinCat = Object.entries(winCats).sort((a, b) => b[1] - a[1])[0]

    // Skills — raw list
    const skillCount = skills.length
    const topSkill = skills.length > 0
      ? [...skills].sort((a, b) => (b.level ?? b.hoursLogged ?? 0) - (a.level ?? a.hoursLogged ?? 0))[0]
      : null

    // Learning investment — last 30 days hours
    const recentStudy = studySessions.filter(s => new Date(s.date).getTime() >= monthAgo)
    const studyHours = recentStudy.reduce((s, x) => s + x.minutes, 0) / 60

    // Reading direction
    const genres: Record<string, number> = {}
    reading.forEach(b => { if (b.genre) genres[b.genre] = (genres[b.genre] ?? 0) + 1 })
    const topGenre = Object.entries(genres).sort((a, b) => b[1] - a[1])[0]

    // Network size
    const networkSize = people.length
    const innerCircle = people.filter(p => (p.tier ?? 0) <= 1).length

    // Values
    const values: string[] = storedValues?.topFive ?? []

    // Mood baseline as proxy for energy availability
    const recentMoods = moodData?.moods ?? []
    const avgMood = recentMoods.length > 0
      ? recentMoods.reduce((s, m) => s + m.score, 0) / recentMoods.length
      : null

    return {
      focusHoursPerWeek,
      habitRate,
      topWinCat,
      winCount: wins.length,
      skillCount,
      topSkill,
      studyHours,
      topGenre,
      networkSize,
      innerCircle,
      values,
      avgMood,
      goalCount: goals.length,
    }
  }, [focusHistory, habits, wins, skills, studySessions, reading, people, storedValues, moodData, goals])

  // ───────────────── Revenue reality ─────────────────
  const revenue = useMemo(() => {
    const expenses = budget?.expenses ?? []
    const monthlyExp = expenses.reduce((s, e) => s + (e.amount ?? 0), 0) || budget?.monthlyExpenses || 0
    const income = budget?.income ?? 0

    // Cash runway
    const cash = (netWorth?.assets ?? [])
      .filter(a => /cash|checking|savings|hisa|tfsa/i.test(`${a.name ?? ""} ${a.type ?? ""} ${a.category ?? ""}`))
      .reduce((s, a) => s + (a.value ?? 0), 0)
    const runwayMonths = monthlyExp > 0 ? cash / monthlyExp : null

    // FI math (4% rule proxy)
    const fiNumber = monthlyExp * 12 * 25
    const assets = (netWorth?.assets ?? []).reduce((s, a) => s + (a.value ?? 0), 0)
    const liabilities = (netWorth?.liabilities ?? []).reduce((s, l) => s + (l.value ?? 0), 0)
    const nw = assets - liabilities
    const fiProgress = fiNumber > 0 ? Math.min(100, (nw / fiNumber) * 100) : 0

    // NW growth rate from history
    let growthPerMonth = 0
    if (nwHistory.length >= 2) {
      const sorted = [...nwHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const months = Math.max(0.1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (30 * 86400000))
      growthPerMonth = (last.netWorth - first.netWorth) / months
    }

    return {
      monthlyExp: Math.round(monthlyExp),
      income: Math.round(income),
      cash: Math.round(cash),
      runwayMonths,
      fiNumber: Math.round(fiNumber),
      nw: Math.round(nw),
      fiProgress,
      growthPerMonth: Math.round(growthPerMonth),
      surplus: Math.max(0, Math.round(income - monthlyExp)),
    }
  }, [budget, netWorth, nwHistory])

  // ───────────────── Archetype scoring ─────────────────
  const scored = useMemo(() => {
    return ARCHETYPES.map(arch => {
      let score = 0
      const reasons: string[] = []
      const concerns: string[] = []

      // Focus hours
      if (arch.key === "builder" || arch.key === "trader") {
        if (inventory.focusHoursPerWeek >= 10) {
          score += 15
          reasons.push(`${inventory.focusHoursPerWeek.toFixed(1)}h/wk deep work supports this`)
        } else if (inventory.focusHoursPerWeek > 0) {
          score += 3
          concerns.push(`only ${inventory.focusHoursPerWeek.toFixed(1)}h/wk focus — needs more`)
        }
      }
      if (arch.key === "creator") {
        if (inventory.focusHoursPerWeek >= 4) {
          score += 8
          reasons.push(`${inventory.focusHoursPerWeek.toFixed(1)}h/wk focus enables consistent output`)
        }
      }

      // Habit consistency (proxy for discipline)
      if (inventory.habitRate >= 0.7) {
        score += 10
        reasons.push(`${Math.round(inventory.habitRate * 100)}% habit completion = strong follow-through`)
      } else if (inventory.habitRate < 0.3 && inventory.habitRate > 0) {
        if (arch.key === "builder" || arch.key === "creator" || arch.key === "trader") {
          concerns.push(`habit consistency at ${Math.round(inventory.habitRate * 100)}% — these archetypes demand it`)
        }
      }

      // Top win category as leverage hint
      if (inventory.topWinCat) {
        const [cat] = inventory.topWinCat
        if (/learning|growth|study/i.test(cat) && (arch.key === "teacher" || arch.key === "consultant")) {
          score += 10
          reasons.push(`your wins cluster around learning — leverage for teaching`)
        }
        if (/career|work|project/i.test(cat) && (arch.key === "craftsman" || arch.key === "consultant")) {
          score += 8
          reasons.push(`career-centric wins support expertise-based paths`)
        }
        if (/creative|writing|art|music/i.test(cat) && arch.key === "creator") {
          score += 15
          reasons.push(`your creative wins directly map to this path`)
        }
      }

      // Skills
      if (inventory.skillCount >= 3 && (arch.key === "craftsman" || arch.key === "teacher" || arch.key === "consultant")) {
        score += 6
        reasons.push(`${inventory.skillCount} skills tracked supports expertise paths`)
      }

      // Learning investment
      if (inventory.studyHours >= 5) {
        if (arch.key === "teacher" || arch.key === "consultant") {
          score += 5
          reasons.push(`${inventory.studyHours.toFixed(0)}h/mo learning builds teachable expertise`)
        }
      }

      // Network
      if (inventory.networkSize >= 10) {
        if (arch.key === "consultant" || arch.key === "operator") score += 6
        if (arch.key === "teacher") score += 4
        reasons.push(`${inventory.networkSize} tracked contacts = distribution`)
      }

      // Runway (builder + trader need it most)
      if (revenue.runwayMonths != null) {
        if (arch.key === "builder") {
          if (revenue.runwayMonths >= 6) { score += 8; reasons.push(`${revenue.runwayMonths.toFixed(1)}mo runway — supports 6-18mo build timelines`) }
          else { concerns.push(`runway only ${revenue.runwayMonths.toFixed(1)}mo — build paths usually need 6+`) }
        }
        if (arch.key === "trader") {
          if (revenue.runwayMonths >= 12) score += 5
          else concerns.push(`trader paths require funds you can lose — 12+mo runway ideal`)
        }
        if (arch.key === "operator") {
          if (revenue.cash >= 20000) { score += 4; reasons.push(`cash supports acquisition/operator plays`) }
        }
      }

      // Values alignment
      if (inventory.values.length > 0) {
        const affinityHits = arch.valueAffinities.filter(v => inventory.values.includes(v))
        const conflictHits = arch.valueConflicts.filter(v => inventory.values.includes(v))
        if (affinityHits.length > 0) {
          score += affinityHits.length * 6
          reasons.push(`values alignment: ${affinityHits.join(", ")}`)
        }
        if (conflictHits.length > 0) {
          score -= conflictHits.length * 10
          concerns.push(`values conflict: ${conflictHits.join(", ")}`)
        }
      }

      // Mood baseline (proxy for creative energy)
      if (inventory.avgMood != null) {
        if ((arch.key === "creator" || arch.key === "teacher") && inventory.avgMood >= 7) {
          score += 4
          reasons.push(`mood baseline ${inventory.avgMood.toFixed(1)}/10 supports public-facing work`)
        }
      }

      return { ...arch, score, reasons, concerns }
    }).sort((a, b) => b.score - a.score)
  }, [inventory, revenue])

  const hasAnyData = inventory.skillCount + inventory.winCount + habits.length + revenue.monthlyExp > 0

  // ───────────────── Render ─────────────────
  if (!mounted) {
    return <div className="p-8 text-muted-foreground">Loading your data…</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Livelihood Partner</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Evidence-based monetization reading — from your logs, not generic advice. Present data; decide for yourself.
        </p>
      </div>

      {/* Principles banner */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>What this is:</strong> a synthesis of what the platform has observed about you — skills, wins, habits, focus capacity, budget, values — matched against seven ways people build a living from their work.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>What this is not:</strong> a course. A pitch. A promise. Your logs inform the fit; you inform the decision. Update your data, recompute, update the reading. Nothing here is destiny.
          </p>
        </CardContent>
      </Card>

      {!hasAnyData ? (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-sm font-semibold">Not enough signal yet.</p>
            <p className="text-xs text-muted-foreground">
              Log some wins, set up daily habits, add your skills, and fill in a budget. The fit-analysis below needs real data to be honest instead of generic.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <a href="/wins" className="text-xs text-emerald-600 hover:underline">Log a win</a>
              <a href="/daily-habits" className="text-xs text-emerald-600 hover:underline">Set habits</a>
              <a href="/skill-tree" className="text-xs text-emerald-600 hover:underline">Add skills</a>
              <a href="/budget" className="text-xs text-emerald-600 hover:underline">Budget</a>
              <a href="/values" className="text-xs text-emerald-600 hover:underline">Core values</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-600" /> Your Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {inventory.focusHoursPerWeek > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Focus</p><p className="text-sm font-bold tabular-nums">{inventory.focusHoursPerWeek.toFixed(1)}<span className="text-[10px] text-muted-foreground">h/wk</span></p></div>
                )}
                {habits.length > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase">Habit rate</p><p className={cn("text-sm font-bold tabular-nums", inventory.habitRate >= 0.7 ? "text-emerald-600" : inventory.habitRate >= 0.4 ? "text-amber-600" : "text-slate-600")}>{Math.round(inventory.habitRate * 100)}%</p></div>
                )}
                {inventory.skillCount > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase">Skills</p><p className="text-sm font-bold tabular-nums">{inventory.skillCount}</p></div>
                )}
                {inventory.winCount > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase">Wins</p><p className="text-sm font-bold tabular-nums">{inventory.winCount}</p></div>
                )}
                {inventory.studyHours > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><BookOpen className="h-2.5 w-2.5" /> Study 30d</p><p className="text-sm font-bold tabular-nums">{inventory.studyHours.toFixed(0)}<span className="text-[10px] text-muted-foreground">h</span></p></div>
                )}
                {inventory.networkSize > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Users className="h-2.5 w-2.5" /> Network</p><p className="text-sm font-bold tabular-nums">{inventory.networkSize}</p></div>
                )}
                {inventory.avgMood != null && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase">Mood avg</p><p className="text-sm font-bold tabular-nums">{inventory.avgMood.toFixed(1)}<span className="text-[10px] text-muted-foreground">/10</span></p></div>
                )}
                {inventory.goalCount > 0 && (
                  <div className="rounded-lg border p-2"><p className="text-[10px] text-muted-foreground uppercase">Goals</p><p className="text-sm font-bold tabular-nums">{inventory.goalCount}</p></div>
                )}
              </div>

              {inventory.topWinCat && (
                <p className="text-xs text-muted-foreground pt-1 border-t">
                  <span className="font-semibold text-foreground">Win pattern:</span> mostly <span className="font-semibold capitalize">{inventory.topWinCat[0]}</span> ({inventory.topWinCat[1]} wins). {inventory.topSkill && <span>Top skill: <span className="font-semibold">{inventory.topSkill.name}</span>. </span>}
                  {inventory.topGenre && <span>Reading: mostly {inventory.topGenre[0]}.</span>}
                </p>
              )}

              {inventory.values.length > 0 && (
                <div className="pt-1 border-t">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Your values (filter, not motivator)</p>
                  <div className="flex flex-wrap gap-1">
                    {inventory.values.map(v => <Badge key={v} variant="outline" className="text-[9px]">{v}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue reality */}
          {revenue.monthlyExp > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-600" /> Your Revenue Reality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  The numbers that matter — floor, ceiling, and how long you can afford to experiment.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Floor / mo</p>
                    <p className="text-sm font-bold text-rose-600 tabular-nums">${revenue.monthlyExp.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">covers expenses</p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Comfort / mo</p>
                    <p className="text-sm font-bold text-amber-600 tabular-nums">${Math.round(revenue.monthlyExp * 1.2).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">+20% cushion</p>
                  </div>
                  {revenue.runwayMonths != null && (
                    <div className="rounded-lg border p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Runway</p>
                      <p className={cn("text-sm font-bold tabular-nums", revenue.runwayMonths >= 12 ? "text-emerald-600" : revenue.runwayMonths >= 6 ? "text-amber-600" : "text-rose-600")}>{revenue.runwayMonths.toFixed(1)}<span className="text-[10px] text-muted-foreground">mo</span></p>
                      <p className="text-[10px] text-muted-foreground">experiment window</p>
                    </div>
                  )}
                  {revenue.fiNumber > 0 && (
                    <div className="rounded-lg border p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">FI target</p>
                      <p className="text-sm font-bold text-violet-600 tabular-nums">${(revenue.fiNumber / 1000).toFixed(0)}k</p>
                      <p className="text-[10px] text-muted-foreground">{Math.round(revenue.fiProgress)}% there</p>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-xs text-emerald-900">
                  <p><strong>What these mean:</strong></p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-muted-foreground">
                    <li><span className="text-emerald-900 font-semibold">Floor</span>: the number that ends the "job required" conversation.</li>
                    <li><span className="text-emerald-900 font-semibold">Comfort</span>: room to save, invest, breathe.</li>
                    {revenue.runwayMonths != null && (
                      <li><span className="text-emerald-900 font-semibold">Runway</span>: {revenue.runwayMonths.toFixed(1)} months of "no new income" you can absorb. Paths that need 6+ months to ramp must fit inside this window — or you need a second income while building.</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Archetype matches */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" /> Archetype Fit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Seven common ways people build a living from their work. Scored against your evidence. Top 3 shown.
              </p>
              <div className="space-y-3">
                {scored.slice(0, 3).map((arch, i) => {
                  const Icon = arch.icon
                  return (
                    <div key={arch.key} className={cn("rounded-xl border p-4", i === 0 ? "border-emerald-300 bg-emerald-50/30" : "border-border")}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white", arch.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">#{i + 1} {arch.name}</p>
                            <Badge variant="outline" className="text-[9px]">fit: {arch.score}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{arch.tagline}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{arch.description}</p>

                      {arch.reasons.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold mb-1">Why it fits you</p>
                          <ul className="space-y-0.5">
                            {arch.reasons.map((r, j) => (
                              <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                <span className="text-emerald-600 mt-0.5">•</span>{r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {arch.concerns.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold mb-1">What to watch for</p>
                          <ul className="space-y-0.5">
                            {arch.concerns.map((c, j) => (
                              <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-lg bg-slate-50 border p-2.5 mt-2">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Smallest experiment (this week)</p>
                        <p className="text-xs text-foreground">{arch.smallestExperiment}</p>
                        <p className="text-[10px] text-muted-foreground italic mt-1"><strong>Revenue shape:</strong> {arch.revenueShape}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Anti-patterns */}
          {(() => {
            const worst = scored[scored.length - 1]
            const showAnti = worst.score < 10 || worst.concerns.length > 0
            if (!showAnti) return null
            return (
              <Card className="border-amber-200 bg-amber-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /> Path to Approach Carefully</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong className="text-foreground">{worst.name}</strong> — {worst.tagline}. Your current evidence suggests friction with this path.
                  </p>
                  {worst.concerns.length > 0 && (
                    <ul className="space-y-0.5">
                      {worst.concerns.map((c, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground italic mt-2">
                    Not a verdict. People succeed across all paths. This is what your current data says — update it and recompute.
                  </p>
                </CardContent>
              </Card>
            )
          })()}

          {/* All archetypes summary */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">See all 7 archetypes + scores</summary>
            <div className="mt-3 space-y-1">
              {scored.map(arch => (
                <div key={arch.key} className="flex items-center gap-3 text-xs rounded border p-2">
                  <span className="w-24 font-semibold">{arch.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${Math.max(2, Math.min(100, arch.score))}%` }} />
                  </div>
                  <span className="w-12 text-right tabular-nums text-muted-foreground">{arch.score}</span>
                </div>
              ))}
            </div>
          </details>
        </>
      )}

      {/* Honest footer */}
      <Card className="border-slate-200 bg-slate-50/40">
        <CardContent className="p-4 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">A few things to hold in mind:</strong></p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Scores are based on your logs. Log more, they get more accurate.</li>
            <li>Most successful livelihoods blend 2-3 archetypes (e.g., consultant + teacher).</li>
            <li>The smallest experiment is the point — the scoring is orientation, the doing is everything.</li>
            <li>This page has no affiliate links, no paid placements, no premium tier. Just the synthesis.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/skill-tree" className="text-sm text-emerald-600 hover:underline">Skill Tree</a>
        <a href="/wins" className="text-sm text-amber-600 hover:underline">Wins</a>
        <a href="/values" className="text-sm text-violet-600 hover:underline">Values</a>
        <a href="/budget" className="text-sm text-teal-600 hover:underline">Budget</a>
        <a href="/side-hustles" className="text-sm text-blue-600 hover:underline">Side-Hustle Library</a>
        <a href="/career-path" className="text-sm text-rose-600 hover:underline">Career Path</a>
        <a href="/financial-independence" className="text-sm text-indigo-600 hover:underline">FI Calculator</a>
      </div>
    </div>
  )
}
