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
