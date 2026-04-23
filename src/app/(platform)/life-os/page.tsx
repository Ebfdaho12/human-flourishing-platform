"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  LayoutDashboard, Heart, Brain, Moon, Dumbbell, Flame, Target, DollarSign,
  Droplets, Timer, Zap, CheckSquare, BookOpen, TrendingUp, TrendingDown, Minus,
  Star, Crown, Sparkles, ArrowRight, Calendar
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { Explain } from "@/components/ui/explain"

function getToday(): string { return new Date().toISOString().split("T")[0] }

function Spark({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - ((v - min) / range) * 20}`).join(" ")
  return <svg width={60} height={20}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
}

function MiniStat({ icon: Icon, label, value, unit, color, trend, href, spark }: {
  icon: any; label: string; value: string | number; unit?: string; color: string; trend?: number | null; href: string; spark?: number[]
}) {
  return (
    <a href={href} className="rounded-lg border p-2.5 hover:bg-muted/50 transition-colors block">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        {trend !== null && trend !== undefined && (
          Math.abs(trend) < 0.2 ? <Minus className="h-3 w-3 text-muted-foreground" /> :
          trend > 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> :
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-lg font-bold">{value}<span className="text-[9px] text-muted-foreground ml-0.5">{unit}</span></p>
        {spark && spark.length >= 3 && <Spark data={spark} color={color.replace("text-", "#").replace("500", "")} />}
      </div>
    </a>
  )
}

export default function LifeOSPage() {
  const today = getToday()
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=14", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=100", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const { data: walletData } = useSWR("/api/wallet", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)

  // localStorage data
  const [habits, setHabits] = useState<any[]>([])
  const [waterToday, setWaterToday] = useState(0)
  const [waterGoal, setWaterGoal] = useState(2500)
  const [focusToday, setFocusToday] = useState(0)
  const [gratitudeDone, setGratitudeDone] = useState(false)
  const [eveningDone, setEveningDone] = useState(false)
  const [challengeCount, setChallengeCount] = useState(0)
  const [flourishingScore, setFlourishingScore] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
      setHabits(h)
    } catch {}
    try {
      const w = JSON.parse(localStorage.getItem("hfp-water-log") || "[]")
      const todayEntries = w.filter((e: any) => e.date === today)
      setWaterToday(todayEntries.reduce((s: number, e: any) => s + (e.amount || 0), 0))
    } catch {}
    try {
      const f = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      const todayFocus = f.find((e: any) => e.date === today)
      if (todayFocus) setFocusToday(todayFocus.focusMinutes)
    } catch {}
    try {
      const g = JSON.parse(localStorage.getItem("hfp-gratitude") || "[]")
      setGratitudeDone(g.some((e: any) => e.date === today))
    } catch {}
    try {
      const e = JSON.parse(localStorage.getItem("hfp-evening-review") || "[]")
      setEveningDone(e.some((en: any) => en.date === today))
    } catch {}
    try {
      const c = JSON.parse(localStorage.getItem("hfp-challenges") || "[]")
      setChallengeCount(c.filter((ch: any) => ch.completedDays?.length < 30).length)
    } catch {}
    try {
      const fh = JSON.parse(localStorage.getItem("hfp-flourishing-history") || "[]")
      const todayScore = fh.find((h: any) => h.date === today)
      if (todayScore) setFlourishingScore(todayScore.score)
    } catch {}
  }, [today])

  const moods = (moodData?.entries || []).reverse()
  const entries = (healthData?.entries || []).reverse()
  const streaks = streakData || {}
  const wallet = walletData?.wallet || {}
  const goals = goalsData?.goals || []

  // Derive metrics
  const moodScores = moods.map((m: any) => m.score).filter(Boolean)
  const avgMood = moodScores.length > 0 ? Math.round(moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length * 10) / 10 : null
  const sleepEntries = entries.filter((e: any) => e.entryType === "SLEEP")
  const sleepHours = sleepEntries.map((e: any) => { try { return JSON.parse(e.data)?.hoursSlept || 0 } catch { return 0 } }).filter((h: number) => h > 0)
  const avgSleep = sleepHours.length > 0 ? Math.round(sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length * 10) / 10 : null
  const exerciseCount = entries.filter((e: any) => e.entryType === "EXERCISE").slice(0, 7).length

  const habitsTotal = habits.length
  const habitsDone = habits.filter((h: any) => h.completedDates?.includes(today)).length
  const habitPct = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0

  const maxStreak = Math.max(streaks.health || 0, streaks.mood || 0, streaks.journal || 0, streaks.platform || 0)
  const activeGoals = goals.filter((g: any) => !g.completed).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  // ===== Cross-feature correlations =====
  const correlations = (() => {
    const insights: { text: string; icon: string; color: string }[] = []

    // Mood on exercise days vs non-exercise days
    try {
      const exerciseDates = new Set(
        entries.filter((e: any) => e.entryType === "EXERCISE").map((e: any) => (e.createdAt || "").slice(0, 10))
      )
      const moodOnExercise: number[] = []
      const moodOffExercise: number[] = []
      moods.forEach((m: any) => {
        const d = (m.createdAt || "").slice(0, 10)
        if (!m.score) return
        if (exerciseDates.has(d)) moodOnExercise.push(m.score)
        else moodOffExercise.push(m.score)
      })
      if (moodOnExercise.length >= 2 && moodOffExercise.length >= 2) {
        const avgOn = moodOnExercise.reduce((a, b) => a + b, 0) / moodOnExercise.length
        const avgOff = moodOffExercise.reduce((a, b) => a + b, 0) / moodOffExercise.length
        const diff = Math.round((avgOn - avgOff) * 10) / 10
        if (Math.abs(diff) >= 0.2) {
          insights.push({
            text: `Your mood is ${Math.abs(diff)} pts ${diff > 0 ? "higher" : "lower"} on days you exercise`,
            icon: "💪", color: diff > 0 ? "text-emerald-600" : "text-amber-600",
          })
        }
      }
    } catch {}

    // Best sleep night
    try {
      const sleepWithDate = sleepEntries.map((e: any) => {
        try { return { date: (e.createdAt || "").slice(0, 10), hours: JSON.parse(e.data)?.hoursSlept || 0 } }
        catch { return { date: "", hours: 0 } }
      }).filter((e: any) => e.hours > 0)
      if (sleepWithDate.length > 0) {
        const best = sleepWithDate.reduce((a: any, b: any) => (b.hours > a.hours ? b : a))
        insights.push({
          text: `Your best sleep was ${new Date(best.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${best.hours}hrs`,
          icon: "😴", color: "text-indigo-600",
        })
      }
    } catch {}

    // Focus peaks — morning vs afternoon
    try {
      const focusHistory = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      const morning: number[] = []
      const afternoon: number[] = []
      focusHistory.forEach((f: any) => {
        const h = new Date(f.timestamp || f.date).getHours()
        if (h < 12 && f.focusMinutes) morning.push(f.focusMinutes)
        else if (h >= 12 && f.focusMinutes) afternoon.push(f.focusMinutes)
      })
      if (morning.length + afternoon.length >= 3) {
        const avgMorning = morning.length ? morning.reduce((a, b) => a + b, 0) / morning.length : 0
        const avgAfternoon = afternoon.length ? afternoon.reduce((a, b) => a + b, 0) / afternoon.length : 0
        if (Math.abs(avgMorning - avgAfternoon) > 2) {
          insights.push({
            text: `Your focus peaks in the ${avgMorning > avgAfternoon ? "morning" : "afternoon"}`,
            icon: "🎯", color: "text-red-600",
          })
        }
      }
    } catch {}

    // Most consistent habit
    try {
      if (habits.length > 0) {
        const withRate = habits.map((h: any) => {
          const created = new Date(h.createdAt || Date.now()).getTime()
          const days = Math.max(1, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)))
          const completions = h.completedDates?.length || 0
          return { name: h.name || h.title || "Unnamed", pct: Math.min(100, Math.round((completions / days) * 100)) }
        })
        const best = withRate.sort((a, b) => b.pct - a.pct)[0]
        if (best && best.pct > 0) {
          insights.push({
            text: `You're most consistent with "${best.name}" (${best.pct}% completion)`,
            icon: "✓", color: "text-emerald-600",
          })
        }
      }
    } catch {}

    return insights
  })()

  // ===== Weekly trajectory (7-day trend per metric) =====
  const weeklyTrajectory = (() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split("T")[0]
    })

    // Mood by day
    const moodByDay = last7.map(date => {
      const dayMoods = moods.filter((m: any) => (m.createdAt || "").startsWith(date)).map((m: any) => m.score).filter(Boolean)
      return dayMoods.length ? dayMoods.reduce((a: number, b: number) => a + b, 0) / dayMoods.length : 0
    })
    // Sleep by day
    const sleepByDay = last7.map(date => {
      const daySleep = sleepEntries.filter((e: any) => (e.createdAt || "").startsWith(date))
        .map((e: any) => { try { return JSON.parse(e.data)?.hoursSlept || 0 } catch { return 0 } })
        .filter((h: number) => h > 0)
      return daySleep.length ? daySleep.reduce((a: number, b: number) => a + b, 0) / daySleep.length : 0
    })
    // Focus by day
    let focusByDay: number[] = Array(7).fill(0)
    try {
      const fh = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      focusByDay = last7.map(date => {
        const day = fh.find((e: any) => e.date === date)
        return day?.focusMinutes || 0
      })
    } catch {}
    // Habits completion % by day
    const habitsByDay = last7.map(date => {
      if (habits.length === 0) return 0
      const done = habits.filter((h: any) => h.completedDates?.includes(date)).length
      return Math.round((done / habits.length) * 100)
    })

    function trend(data: number[]): number {
      const nonZero = data.filter(v => v > 0)
      if (nonZero.length < 2) return 0
      const firstHalf = data.slice(0, 3).filter(v => v > 0)
      const secondHalf = data.slice(-3).filter(v => v > 0)
      if (!firstHalf.length || !secondHalf.length) return 0
      const a = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
      const b = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
      return Math.round((b - a) * 10) / 10
    }

    return [
      { label: "Mood", data: moodByDay, current: moodByDay[6] || 0, unit: "/10", change: trend(moodByDay), color: "#8b5cf6" },
      { label: "Sleep", data: sleepByDay, current: sleepByDay[6] || 0, unit: "hrs", change: trend(sleepByDay), color: "#6366f1" },
      { label: "Focus", data: focusByDay, current: focusByDay[6] || 0, unit: "min", change: trend(focusByDay), color: "#ef4444" },
      { label: "Habits", data: habitsByDay, current: habitsByDay[6] || 0, unit: "%", change: trend(habitsByDay), color: "#10b981" },
    ]
  })()

  // ===== Momentum score =====
  const momentumScore = (() => {
    // 1. Active streaks (normalized to 40 pts max)
    const totalStreakDays = (streaks.health || 0) + (streaks.mood || 0) + (streaks.journal || 0) + (streaks.platform || 0)
    const streakPts = Math.min(40, totalStreakDays * 2)

    // 2. Daily completion rate (today's 5 key rituals, 30 pts max)
    const todayRituals = [
      moodScores.length > 0 && moods[moods.length - 1]?.createdAt?.startsWith(today),
      habitPct >= 50,
      gratitudeDone,
      waterToday >= waterGoal,
      eveningDone,
    ].filter(Boolean).length
    const completionPts = Math.round((todayRituals / 5) * 30)

    // 3. Consistency (how many days this week had any activity, 30 pts max)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split("T")[0]
    })
    const activeDays = last7.filter(date => {
      const hadMood = moods.some((m: any) => (m.createdAt || "").startsWith(date))
      const hadHealth = entries.some((e: any) => (e.createdAt || "").startsWith(date))
      const hadHabit = habits.some((h: any) => h.completedDates?.includes(date))
      return hadMood || hadHealth || hadHabit
    }).length
    const consistencyPts = Math.round((activeDays / 7) * 30)

    return Math.min(100, streakPts + completionPts + consistencyPts)
  })()

  const momentumLabel = momentumScore >= 70 ? "High" : momentumScore >= 40 ? "Moderate" : "Slowing"
  const momentumColor = momentumScore >= 70 ? "emerald" : momentumScore >= 40 ? "amber" : "red"

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>
        <a href="/flourishing-score" className="text-center">
          <p className={cn("text-3xl font-bold", flourishingScore >= 70 ? "text-emerald-500" : flourishingScore >= 40 ? "text-amber-500" : "text-muted-foreground")}>{flourishingScore || "—"}</p>
          <p className="text-[9px] text-muted-foreground">Flourishing</p>
        </a>
      </div>

      {/* Daily rhythm status */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Mood", done: moodScores.length > 0 && moods[moods.length - 1]?.createdAt?.startsWith(today), href: "/mental-health", icon: Brain, color: "text-violet-500 bg-violet-50 border-violet-200" },
          { label: "Habits", done: habitPct >= 50, href: "/daily-habits", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
          { label: "Gratitude", done: gratitudeDone, href: "/gratitude", icon: Heart, color: "text-rose-400 bg-rose-50 border-rose-200" },
          { label: "Water", done: waterToday >= waterGoal, href: "/water-tracker", icon: Droplets, color: "text-blue-500 bg-blue-50 border-blue-200" },
          { label: "Review", done: eveningDone, href: "/evening-review", icon: Moon, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <a key={i} href={item.href} className={cn("rounded-lg border p-2 text-center transition-all hover:shadow-sm", item.color, item.done ? "opacity-60" : "")}>
              <Icon className="h-4 w-4 mx-auto" />
              <p className="text-[9px] font-medium mt-0.5">{item.label}</p>
              <p className="text-[8px]">{item.done ? "✓" : "—"}</p>
            </a>
          )
        })}
      </div>

      {/* Core metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat icon={Brain} label="Mood (7d)" value={avgMood ?? "—"} unit="/10" color="text-violet-500" href="/mental-health" spark={moodScores.slice(-7)} trend={null} />
        <MiniStat icon={Moon} label="Sleep (7d)" value={avgSleep ?? "—"} unit="hrs" color="text-indigo-500" href="/sleep-optimization" spark={sleepHours.slice(-7)} trend={null} />
        <MiniStat icon={Dumbbell} label="Exercise" value={exerciseCount} unit="/wk" color="text-orange-500" href="/health" trend={null} />
        <MiniStat icon={CheckSquare} label="Habits" value={`${habitPct}%`} color="text-emerald-500" href="/daily-habits" trend={null} />
        <MiniStat icon={Droplets} label="Water" value={waterToday} unit="ml" color="text-blue-500" href="/water-tracker" trend={null} />
        <MiniStat icon={Timer} label="Focus" value={focusToday} unit="min" color="text-red-500" href="/focus-timer" trend={null} />
        <MiniStat icon={DollarSign} label="FOUND" value={wallet.balance?.toLocaleString() ?? "0"} color="text-emerald-600" href="/wallet" trend={null} />
        <MiniStat icon={Flame} label="Best Streak" value={maxStreak} unit="days" color="text-orange-500" href="/character-sheet" trend={null} />
      </div>

      {/* Active systems */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {activeGoals > 0 && (
          <a href="/goals" className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-1"><Target className="h-3.5 w-3.5 text-violet-500" /><span className="text-[10px] text-muted-foreground">Active Goals</span></div>
            <p className="text-lg font-bold">{activeGoals}</p>
          </a>
        )}
        {challengeCount > 0 && (
          <a href="/30-day-challenges" className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-1"><Flame className="h-3.5 w-3.5 text-orange-500" /><span className="text-[10px] text-muted-foreground">Active Challenges</span></div>
            <p className="text-lg font-bold">{challengeCount}</p>
          </a>
        )}
        <a href="/correlations" className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /><span className="text-[10px] text-muted-foreground">Insights</span></div>
          <p className="text-xs font-medium text-blue-600">View patterns →</p>
        </a>
      </div>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { href: "/morning-briefing", label: "Briefing", emoji: "☀️" },
              { href: "/breathwork", label: "Breathe", emoji: "🧘" },
              { href: "/decision-journal", label: "Decide", emoji: "⚖️" },
              { href: "/vision-board", label: "Vision", emoji: "✨" },
              { href: "/book-library", label: "Read", emoji: "📚" },
              { href: "/character-sheet", label: "Stats", emoji: "🎮" },
            ].map(a => (
              <a key={a.href} href={a.href} className="rounded-lg border p-2 text-center hover:bg-muted/50 transition-colors">
                <span className="text-lg">{a.emoji}</span>
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.label}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This is your <Explain tip="Life OS treats your life like a system — all your health, habits, mood, and goals are tracked in one place so you can see how everything connects and make better decisions">Life Operating System</Explain>.</strong> Not a collection of tools — a unified command center.
            Every metric here connects to every other metric through your data. Mood affects sleep. Sleep affects exercise.
            Exercise affects energy. Energy affects decisions. Decisions shape your <Explain tip="Your trajectory is the direction your life is heading based on your current habits and choices — small daily actions compound into big long-term changes">trajectory</Explain>. Track it all, see the connections,
            and steer deliberately. The examined life, quantified.
          </p>
        </CardContent>
      </Card>

      {/* ===== Momentum Score ===== */}
      <Card className={cn(
        "border-2",
        momentumColor === "emerald" ? "border-emerald-200 bg-emerald-50/20" :
        momentumColor === "amber" ? "border-amber-200 bg-amber-50/20" :
        "border-red-200 bg-red-50/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className={cn(
                "h-4 w-4",
                momentumColor === "emerald" ? "text-emerald-500" :
                momentumColor === "amber" ? "text-amber-500" : "text-red-500"
              )} />
              <p className="text-sm font-semibold">Weekly Momentum</p>
            </div>
            <Badge variant="outline" className={cn(
              "text-[10px]",
              momentumColor === "emerald" ? "border-emerald-300 text-emerald-700" :
              momentumColor === "amber" ? "border-amber-300 text-amber-700" :
              "border-red-300 text-red-700"
            )}>{momentumLabel}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg width={96} height={96} viewBox="0 0 96 96" className="-rotate-90">
                <circle cx={48} cy={48} r={40} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={8} />
                <circle
                  cx={48} cy={48} r={40} fill="none"
                  stroke={momentumColor === "emerald" ? "#10b981" : momentumColor === "amber" ? "#f59e0b" : "#ef4444"}
                  strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={`${(momentumScore / 100) * 251.3} 251.3`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={cn(
                  "text-2xl font-bold",
                  momentumColor === "emerald" ? "text-emerald-600" :
                  momentumColor === "amber" ? "text-amber-600" : "text-red-600"
                )}>{momentumScore}</p>
                <p className="text-[8px] text-muted-foreground">/ 100</p>
              </div>
            </div>
            <div className="flex-1 text-[10px] text-muted-foreground space-y-0.5">
              <p>Combines active streaks, daily completion rate, and 7-day consistency.</p>
              <p className={cn(
                "font-medium pt-1",
                momentumColor === "emerald" ? "text-emerald-700" :
                momentumColor === "amber" ? "text-amber-700" : "text-red-700"
              )}>
                {momentumScore >= 70 ? "You're in flow — keep going." :
                 momentumScore >= 40 ? "Steady. Small actions compound." :
                 "Momentum is slipping. Pick one ritual to re-anchor today."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Weekly Trajectory ===== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold">7-Day Trajectory</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {weeklyTrajectory.map((m, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  {m.change !== 0 && (
                    m.change > 0
                      ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                      : <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="flex items-end justify-between gap-1">
                  <div>
                    <p className="text-base font-bold">
                      {m.current ? (Math.round(m.current * 10) / 10) : "—"}
                      <span className="text-[8px] text-muted-foreground ml-0.5">{m.unit}</span>
                    </p>
                    {m.change !== 0 && (
                      <p className={cn(
                        "text-[9px] font-medium",
                        m.change > 0 ? "text-emerald-600" : "text-red-600"
                      )}>{m.change > 0 ? "+" : ""}{m.change}{m.unit === "%" ? "%" : ""}</p>
                    )}
                  </div>
                  <Spark data={m.data.length && m.data.some(v => v > 0) ? m.data : [0, 0, 0]} color={m.color} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== Cross-feature Correlations ===== */}
      {correlations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold">Patterns in Your Data</p>
            </div>
            <div className="space-y-1.5">
              {correlations.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-base shrink-0">{c.icon}</span>
                  <p className={cn("text-xs flex-1", c.color)}>{c.text}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Cross-referenced across your mood, health, focus, and habit data. More data = sharper patterns.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap text-xs">
        <a href="/dashboard" className="text-violet-600 hover:underline">Dashboard</a>
        <a href="/flourishing-score" className="text-emerald-600 hover:underline">Flourishing Score</a>
        <a href="/trends" className="text-blue-600 hover:underline">Trends</a>
        <a href="/hive-mind" className="text-violet-600 hover:underline">Hive Mind</a>
        <a href="/tools" className="text-slate-600 hover:underline">All Tools</a>
      </div>
    </div>
  )
}
