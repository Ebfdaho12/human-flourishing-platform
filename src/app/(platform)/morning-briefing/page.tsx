"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Sun, Moon, Heart, DollarSign, Brain, TrendingUp, Flame, Target, Coffee, Zap, Calendar, BookOpen, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

function getGreeting(): { greeting: string; icon: any; message: string } {
  const hour = new Date().getHours()
  if (hour < 6) return { greeting: "Night owl", icon: Moon, message: "Still up? Your body repairs itself during sleep. Consider winding down." }
  if (hour < 12) return { greeting: "Good morning", icon: Sun, message: "The morning is when willpower is highest. Use it wisely." }
  if (hour < 17) return { greeting: "Good afternoon", icon: Coffee, message: "Afternoon energy dip is real. Move your body for 5 minutes." }
  if (hour < 21) return { greeting: "Good evening", icon: Sun, message: "Evening is for reflection. What went well today?" }
  return { greeting: "Good night", icon: Moon, message: "Screen light suppresses melatonin. Consider switching to warm light." }
}

function getMoonPhase(): { phase: string; emoji: string } {
  const refNew = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const diff = (Date.now() - refNew) / (1000 * 60 * 60 * 24)
  const cycleDay = ((diff % 29.53) + 29.53) % 29.53
  if (cycleDay < 1.85) return { phase: "New Moon", emoji: "🌑" }
  if (cycleDay < 7.38) return { phase: "Waxing Crescent", emoji: "🌒" }
  if (cycleDay < 9.23) return { phase: "First Quarter", emoji: "🌓" }
  if (cycleDay < 14.77) return { phase: "Waxing Gibbous", emoji: "🌔" }
  if (cycleDay < 16.61) return { phase: "Full Moon", emoji: "🌕" }
  if (cycleDay < 22.15) return { phase: "Waning Gibbous", emoji: "🌖" }
  if (cycleDay < 24.0) return { phase: "Last Quarter", emoji: "🌗" }
  return { phase: "Waning Crescent", emoji: "🌘" }
}

function getDayInfo() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const daysInYear = (now.getFullYear() % 4 === 0) ? 366 : 365
  const percentYear = Math.round((dayOfYear / daysInYear) * 100)
  const daysLeft = daysInYear - dayOfYear
  return { dayOfYear, daysInYear, percentYear, daysLeft }
}

const DAILY_WISDOM = [
  "What gets measured gets managed. — Peter Drucker",
  "We are what we repeatedly do. Excellence is not an act, but a habit. — Aristotle",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Compound interest is the eighth wonder of the world. — Einstein",
  "Take care of your body. It is the only place you have to live. — Jim Rohn",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The obstacle is the way. — Marcus Aurelius",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "Health is the crown on the well person's head that only the ill person can see.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "He who has a why can endure any how. — Nietzsche",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Discipline equals freedom. — Jocko Willink",
  "The unexamined life is not worth living. — Socrates",
  "First say to yourself what you would be; then do what you have to do. — Epictetus",
  "Your net worth is not your self worth.",
  "Sleep is the best meditation. — Dalai Lama",
  "The greatest wealth is health. — Virgil",
  "In the middle of difficulty lies opportunity. — Einstein",
  "You cannot change what you refuse to confront.",
  "The cost of a thing is the amount of life you exchange for it. — Thoreau",
  "What you do every day matters more than what you do once in a while.",
  "A society grows great when old men plant trees whose shade they shall never sit in.",
  "The mind is everything. What you think, you become. — Buddha",
  "Freedom is what you do with what's been done to you. — Sartre",
  "It is not the strongest that survive, but the most adaptable. — Darwin",
  "The best doctor gives the least medicines. — Benjamin Franklin",
  "People do not decide their futures. They decide their habits, and their habits decide their futures.",
  "The two most important days in your life are the day you are born and the day you find out why. — Mark Twain",
  "Memento mori — Remember that you will die. Use this not to despair, but to prioritize.",
]

export default function MorningBriefingPage() {
  const { greeting, icon: GreetingIcon, message: greetingMessage } = getGreeting()
  const moon = getMoonPhase()
  const dayInfo = getDayInfo()
  const today = new Date()

  // Fetch user data
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=7", secureFetcher)
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=7", secureFetcher)
  const { data: walletData } = useSWR("/api/wallet", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)

  const streaks = streakData || {}
  const recentHealth = healthData?.entries || []
  const recentMoods = moodData?.entries || []
  const wallet = walletData?.wallet || {}
  const goals = goalsData?.goals || []

  // Calculate averages
  const avgMood = recentMoods.length > 0
    ? Math.round(recentMoods.reduce((sum: number, m: any) => sum + (m.score || 0), 0) / recentMoods.length * 10) / 10
    : null

  const todayWisdom = DAILY_WISDOM[dayInfo.dayOfYear % DAILY_WISDOM.length]

  // Health logging check
  const todayStr = today.toISOString().split("T")[0]
  const loggedToday = recentHealth.some((e: any) => e.recordedAt?.startsWith(todayStr))
  const moodToday = recentMoods.some((e: any) => e.createdAt?.startsWith(todayStr))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <GreetingIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{greeting}</h1>
            <p className="text-xs text-muted-foreground">
              {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" · "}Day {dayInfo.dayOfYear} of {dayInfo.daysInYear}
              {" · "}{moon.emoji} {moon.phase}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{greetingMessage}</p>
      </div>

      {/* Year progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">{today.getFullYear()} Progress</p>
            <p className="text-xs text-muted-foreground">{dayInfo.percentYear}% complete · {dayInfo.daysLeft} days remaining</p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${dayInfo.percentYear}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Daily wisdom */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-amber-800 italic leading-relaxed">"{todayWisdom}"</p>
        </CardContent>
      </Card>

      {/* Quick status */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's checklist */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-3.5 w-3.5 text-violet-500" /> Today's Status</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className={cn("h-2 w-2 rounded-full", moodToday ? "bg-emerald-500" : "bg-red-400")} />
              <span className={moodToday ? "text-emerald-700" : "text-muted-foreground"}>{moodToday ? "Mood logged ✓" : "Mood not logged yet"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={cn("h-2 w-2 rounded-full", loggedToday ? "bg-emerald-500" : "bg-red-400")} />
              <span className={loggedToday ? "text-emerald-700" : "text-muted-foreground"}>{loggedToday ? "Health logged ✓" : "Health not logged yet"}</span>
            </div>
            {!moodToday && (
              <a href="/mental-health" className="text-[10px] text-violet-600 hover:underline block mt-1">→ Log your mood</a>
            )}
            {!loggedToday && (
              <a href="/health" className="text-[10px] text-rose-600 hover:underline block">→ Log health data</a>
            )}
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-orange-500" /> Streaks</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {streaks.health > 0 && <div className="flex items-center justify-between text-xs"><span>Health logging</span><Badge variant="outline" className="text-[9px]">{streaks.health} days</Badge></div>}
            {streaks.mood > 0 && <div className="flex items-center justify-between text-xs"><span>Mood tracking</span><Badge variant="outline" className="text-[9px]">{streaks.mood} days</Badge></div>}
            {streaks.journal > 0 && <div className="flex items-center justify-between text-xs"><span>Journaling</span><Badge variant="outline" className="text-[9px]">{streaks.journal} days</Badge></div>}
            {streaks.platform > 0 && <div className="flex items-center justify-between text-xs"><span>Platform usage</span><Badge variant="outline" className="text-[9px]">{streaks.platform} days</Badge></div>}
            {(!streaks.health && !streaks.mood && !streaks.journal && !streaks.platform) && (
              <p className="text-[10px] text-muted-foreground">Start logging to build streaks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health & Mood snapshot */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-3.5 w-3.5 text-rose-500" /> Mood (7-day)</CardTitle></CardHeader>
          <CardContent>
            {avgMood !== null ? (
              <div>
                <p className={cn("text-2xl font-bold", avgMood >= 7 ? "text-emerald-600" : avgMood >= 5 ? "text-amber-600" : "text-red-600")}>{avgMood}/10</p>
                <p className="text-[10px] text-muted-foreground">
                  {avgMood >= 8 ? "Thriving" : avgMood >= 6 ? "Good" : avgMood >= 4 ? "Okay — check in with yourself" : "Low — be gentle with yourself"}
                </p>
                <div className="flex gap-0.5 mt-2">
                  {recentMoods.slice(0, 7).reverse().map((m: any, i: number) => (
                    <div key={i} className={cn("h-4 flex-1 rounded-sm", m.score >= 7 ? "bg-emerald-400" : m.score >= 5 ? "bg-amber-400" : "bg-red-400")} title={`${m.score}/10`} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No mood data yet. <a href="/mental-health" className="text-violet-600 hover:underline">Start tracking</a></p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-emerald-500" /> FOUND Balance</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{wallet.balance?.toLocaleString() ?? "0"}</p>
            <p className="text-[10px] text-muted-foreground">FOUND tokens earned</p>
            <a href="/wallet" className="text-[10px] text-violet-600 hover:underline mt-1 block">→ View wallet</a>
          </CardContent>
        </Card>
      </div>

      {/* Active goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-3.5 w-3.5 text-violet-500" /> Active Goals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {goals.slice(0, 5).map((goal: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-xs truncate flex-1">{goal.title || goal.name}</p>
                <Badge variant="outline" className="text-[9px] shrink-0 ml-2">
                  {goal.progress ?? 0}%
                </Badge>
              </div>
            ))}
            <a href="/goals" className="text-[10px] text-violet-600 hover:underline block mt-1">→ All goals</a>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: "/mental-health", label: "Mood Check-In", icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-200" },
              { href: "/health", label: "Log Health", icon: Activity, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
              { href: "/budget", label: "Budget", icon: DollarSign, color: "text-blue-500 bg-blue-50 border-blue-200" },
              { href: "/planner", label: "Daily Planner", icon: Calendar, color: "text-violet-500 bg-violet-50 border-violet-200" },
              { href: "/reading", label: "Reading Log", icon: BookOpen, color: "text-amber-500 bg-amber-50 border-amber-200" },
              { href: "/weekly-reflection", label: "Reflect", icon: Brain, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
            ].map((action, i) => {
              const Icon = action.icon
              return (
                <a key={i} href={action.href} className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:shadow-sm transition-shadow", action.color)}>
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium text-center">{action.label}</span>
                </a>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contextual recommendations */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Today's Focus
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            {!moodToday && <p>→ <strong>Log your mood</strong> — tracking how you feel is the foundation of self-awareness. Takes 30 seconds.</p>}
            {!loggedToday && <p>→ <strong>Log one health metric</strong> — sleep, exercise, water, or weight. Consistency beats completeness.</p>}
            {avgMood !== null && avgMood < 5 && <p>→ <strong>Be gentle with yourself today</strong>. Your 7-day mood average is below 5. Consider: nature walk, journaling, calling a friend, or extra sleep tonight.</p>}
            {moon.phase === "Full Moon" && <p>→ <strong>Full Moon today</strong> {moon.emoji}. Research shows 20 min less deep sleep during full moons. Consider an earlier bedtime and reduced screen time this evening.</p>}
            {moon.phase === "New Moon" && <p>→ <strong>New Moon today</strong> {moon.emoji}. Traditional association: new beginnings, intention-setting. Good day to set a new goal or start a habit.</p>}
            <p>→ <strong>Move your body</strong> — even 5 minutes of movement dissolves overnight fascial adhesions and boosts cognitive function for hours.</p>
            <p>→ <strong>Hydrate</strong> — your brain is 75% water. Even 2% dehydration reduces cognitive performance measurably.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/dashboard" className="text-sm text-violet-600 hover:underline">Dashboard</a>
        <a href="/trajectory" className="text-sm text-indigo-600 hover:underline">Life Trajectory</a>
        <a href="/lunar-cycles" className="text-sm text-blue-600 hover:underline">Lunar Cycles</a>
        <a href="/weekly-reflection" className="text-sm text-emerald-600 hover:underline">Weekly Reflection</a>
        <a href="/health-protocols" className="text-sm text-rose-600 hover:underline">Health Protocols</a>
      </div>
    </div>
  )
}
