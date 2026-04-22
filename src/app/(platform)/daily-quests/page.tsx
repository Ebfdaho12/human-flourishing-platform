"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Swords, CheckCircle, Circle, Flame, Star, Zap, Gift, Crown, Sparkles, Trophy, Target, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

function getToday(): string { return new Date().toISOString().split("T")[0] }

// ─── Quest Definitions ─────────────────────────────────────────
interface Quest {
  id: string
  name: string
  description: string
  xp: number
  check: (ctx: QuestContext) => boolean
  icon: string
  category: "body" | "mind" | "soul" | "wealth" | "social"
}

interface QuestContext {
  today: string
  moodLogged: boolean
  healthLogged: boolean
  habitsComplete: number
  habitsTotal: number
  gratitudeDone: boolean
  waterMl: number
  focusMin: number
  eveningDone: boolean
  streaks: any
  pagesVisited: number
}

const DAILY_QUESTS: Quest[] = [
  { id: "mood", name: "Check In", description: "Log your mood", xp: 15, icon: "🧠", category: "mind", check: ctx => ctx.moodLogged },
  { id: "health", name: "Body Data", description: "Log one health metric", xp: 15, icon: "❤️", category: "body", check: ctx => ctx.healthLogged },
  { id: "water", name: "Hydrate", description: "Drink 2L+ water", xp: 10, icon: "💧", category: "body", check: ctx => ctx.waterMl >= 2000 },
  { id: "habits50", name: "Half Done", description: "Complete 50% of habits", xp: 15, icon: "✅", category: "soul", check: ctx => ctx.habitsTotal > 0 && ctx.habitsComplete >= ctx.habitsTotal * 0.5 },
  { id: "habits100", name: "All In", description: "Complete ALL habits", xp: 30, icon: "🔥", category: "soul", check: ctx => ctx.habitsTotal > 0 && ctx.habitsComplete >= ctx.habitsTotal },
  { id: "gratitude", name: "Grateful Heart", description: "Write 3 gratitudes", xp: 10, icon: "🙏", category: "soul", check: ctx => ctx.gratitudeDone },
  { id: "focus30", name: "Deep Work", description: "30+ min focused work", xp: 20, icon: "🎯", category: "mind", check: ctx => ctx.focusMin >= 30 },
  { id: "evening", name: "Day Closed", description: "Complete evening review", xp: 15, icon: "🌙", category: "mind", check: ctx => ctx.eveningDone },
  { id: "explore", name: "Explorer", description: "Visit a new page", xp: 5, icon: "🗺️", category: "mind", check: ctx => ctx.pagesVisited > 0 },
]

// Variable bonus quests — rotates daily based on date hash
const BONUS_QUESTS: Quest[] = [
  { id: "bonus_breathe", name: "Breathe Deep", description: "Do a breathwork session", xp: 25, icon: "🧘", category: "body", check: () => false },
  { id: "bonus_cold", name: "Ice Warrior", description: "Take a cold shower", xp: 25, icon: "🧊", category: "body", check: () => false },
  { id: "bonus_read", name: "Bookworm", description: "Read for 20 minutes", xp: 20, icon: "📖", category: "mind", check: () => false },
  { id: "bonus_walk", name: "Touch Grass", description: "Walk outside for 15+ min", xp: 15, icon: "🌿", category: "body", check: () => false },
  { id: "bonus_stretch", name: "Limber Up", description: "5 min morning stretch", xp: 15, icon: "🤸", category: "body", check: () => false },
  { id: "bonus_journal", name: "Ink Flow", description: "Write a journal entry", xp: 20, icon: "✏️", category: "soul", check: () => false },
  { id: "bonus_kindness", name: "Pay It Forward", description: "Do something kind for someone", xp: 20, icon: "💛", category: "social", check: () => false },
  { id: "bonus_learn", name: "Level Up", description: "Learn something new (any page)", xp: 15, icon: "🎓", category: "mind", check: () => false },
  { id: "bonus_no_phone", name: "Unplug", description: "1 hour without your phone", xp: 25, icon: "📵", category: "soul", check: () => false },
  { id: "bonus_cook", name: "Chef Mode", description: "Cook a healthy meal", xp: 15, icon: "🍳", category: "body", check: () => false },
]

function getDailyBonusQuests(date: string): Quest[] {
  // Hash the date to pick 2 bonus quests that rotate daily
  const hash = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const idx1 = hash % BONUS_QUESTS.length
  const idx2 = (hash * 7 + 3) % BONUS_QUESTS.length
  const picked = [BONUS_QUESTS[idx1]]
  if (idx2 !== idx1) picked.push(BONUS_QUESTS[idx2])
  return picked
}

const CATEGORY_COLORS: Record<string, string> = {
  body: "text-red-500 bg-red-50 border-red-200",
  mind: "text-violet-500 bg-violet-50 border-violet-200",
  soul: "text-amber-500 bg-amber-50 border-amber-200",
  wealth: "text-emerald-500 bg-emerald-50 border-emerald-200",
  social: "text-blue-500 bg-blue-50 border-blue-200",
}

export default function DailyQuestsPage() {
  const today = getToday()
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=1", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=5", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)

  const [habits, setHabits] = useState<any[]>([])
  const [waterMl, setWaterMl] = useState(0)
  const [focusMin, setFocusMin] = useState(0)
  const [gratitudeDone, setGratitudeDone] = useState(false)
  const [eveningDone, setEveningDone] = useState(false)
  const [pagesVisited, setPagesVisited] = useState(0)
  const [completedBonuses, setCompletedBonuses] = useState<Set<string>>(new Set())
  const [questHistory, setQuestHistory] = useState<{ date: string; xp: number; quests: number }[]>([])

  useEffect(() => {
    try { setHabits(JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")) } catch {}
    try {
      const w = JSON.parse(localStorage.getItem("hfp-water-log") || "[]")
      setWaterMl(w.filter((e: any) => e.date === today).reduce((s: number, e: any) => s + (e.amount || 0), 0))
    } catch {}
    try {
      const f = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      setFocusMin(f.find((e: any) => e.date === today)?.focusMinutes || 0)
    } catch {}
    try { setGratitudeDone(JSON.parse(localStorage.getItem("hfp-gratitude") || "[]").some((e: any) => e.date === today)) } catch {}
    try { setEveningDone(JSON.parse(localStorage.getItem("hfp-evening-review") || "[]").some((e: any) => e.date === today)) } catch {}
    try { setPagesVisited(JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]").length) } catch {}
    try { setCompletedBonuses(new Set(JSON.parse(localStorage.getItem(`hfp-bonus-${today}`) || "[]"))) } catch {}
    try { setQuestHistory(JSON.parse(localStorage.getItem("hfp-quest-history") || "[]")) } catch {}
  }, [today])

  const moods = moodData?.entries || []
  const entries = healthData?.entries || []
  const moodLogged = moods.length > 0 && moods[0]?.createdAt?.startsWith(today)
  const healthLogged = entries.length > 0 && entries[0]?.recordedAt?.startsWith(today)
  const habitsComplete = habits.filter((h: any) => h.completedDates?.includes(today)).length
  const habitsTotal = habits.length

  const ctx: QuestContext = { today, moodLogged, healthLogged, habitsComplete, habitsTotal, gratitudeDone, waterMl, focusMin, eveningDone, streaks: streakData || {}, pagesVisited }

  const bonusQuests = getDailyBonusQuests(today)
  const allQuests = [...DAILY_QUESTS, ...bonusQuests]

  // Check completion
  const questStates = allQuests.map(q => ({
    ...q,
    completed: q.check(ctx) || completedBonuses.has(q.id),
    isBonus: bonusQuests.includes(q),
  }))

  const completedCount = questStates.filter(q => q.completed).length
  const totalXP = questStates.filter(q => q.completed).reduce((s, q) => s + q.xp, 0)

  // Combo multiplier: completing 3+ quests gives bonus
  const comboLevel = completedCount >= 9 ? 3 : completedCount >= 6 ? 2 : completedCount >= 3 ? 1 : 0
  const comboMultiplier = [1, 1.25, 1.5, 2.0][comboLevel]
  const finalXP = Math.round(totalXP * comboMultiplier)
  const comboBonus = finalXP - totalXP

  // Manual complete for bonus quests (honor system)
  function completeBonusQuest(id: string) {
    const updated = new Set([...completedBonuses, id])
    setCompletedBonuses(updated)
    localStorage.setItem(`hfp-bonus-${today}`, JSON.stringify([...updated]))
  }

  // Save daily quest XP to history
  useEffect(() => {
    if (completedCount > 0) {
      const updated = [{ date: today, xp: finalXP, quests: completedCount }, ...questHistory.filter(h => h.date !== today)].slice(0, 30)
      setQuestHistory(updated)
      localStorage.setItem("hfp-quest-history", JSON.stringify(updated))
    }
  }, [completedCount, finalXP, today])

  // Random encouragement
  const encouragements = [
    "Every quest completed is a step toward the person you're becoming.",
    "Small actions, repeated daily, create extraordinary lives.",
    "You're not just checking boxes — you're rewiring your brain for flourishing.",
    "The compound effect is working in your favor right now.",
    "Future you is grateful for what present you is doing.",
  ]
  const dailyEncouragement = encouragements[today.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % encouragements.length]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daily Quests</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete quests. Earn XP. Build combos. Level up your life — literally.
        </p>
      </div>

      {/* Progress + Combo */}
      <Card className={cn("border-2", completedCount === allQuests.length ? "border-amber-300 bg-gradient-to-r from-amber-50/30 to-orange-50/20" : "border-slate-200")}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{completedCount}/{allQuests.length} Quests</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">{finalXP} <span className="text-xs">XP</span></p>
              {comboBonus > 0 && <p className="text-[10px] text-orange-500">+{comboBonus} combo bonus</p>}
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${(completedCount / allQuests.length) * 100}%` }} />
          </div>

          {/* Combo display */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map(level => (
                <div key={level} className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                  comboLevel >= level ? "border-orange-400 bg-orange-100 text-orange-700 scale-110" : "border-muted bg-muted/50 text-muted-foreground"
                )}>
                  {level === 1 ? "×1.25" : level === 2 ? "×1.5" : "×2"}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground flex-1">
              {comboLevel === 0 ? "Complete 3 quests to activate combo" :
               comboLevel === 1 ? "Combo ×1.25! Complete 6 for ×1.5" :
               comboLevel === 2 ? "Combo ×1.5! Complete 9 for ×2.0" :
               "MAX COMBO ×2.0! All quests earn double XP!"}
            </p>
          </div>
          {completedCount === allQuests.length && (
            <p className="text-xs text-amber-700 font-medium mt-2 text-center">
              <Crown className="h-3.5 w-3.5 inline mr-1" /> ALL QUESTS COMPLETE — Maximum XP earned today!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quest list */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-violet-500" /> Today's Quests</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {questStates.map((q) => (
            <div key={q.id} className={cn("flex items-center gap-3 rounded-lg p-2.5 transition-all",
              q.completed ? "bg-emerald-50/50 opacity-80" : "hover:bg-muted/50"
            )}>
              <span className="text-lg shrink-0">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("text-xs font-semibold", q.completed ? "line-through text-emerald-700" : "")}>{q.name}</p>
                  {q.isBonus && <Badge className="bg-amber-500 text-[8px] py-0">Bonus</Badge>}
                  <Badge variant="outline" className={cn("text-[8px]", CATEGORY_COLORS[q.category])}>{q.category}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{q.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-amber-600">+{q.xp}</span>
                {q.completed ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : q.isBonus && !q.completed ? (
                  <button onClick={() => completeBonusQuest(q.id)} className="rounded-full border-2 border-amber-300 bg-amber-50 p-1 hover:bg-amber-100 transition-colors" title="Mark complete (honor system)">
                    <Circle className="h-3 w-3 text-amber-400" />
                  </button>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Daily encouragement */}
      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4 text-center">
          <Sparkles className="h-4 w-4 text-violet-400 mx-auto mb-1" />
          <p className="text-xs text-violet-700 italic">"{dailyEncouragement}"</p>
        </CardContent>
      </Card>

      {/* Quest history */}
      {questHistory.length > 1 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Quest History</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-16">
              {questHistory.slice(0, 14).reverse().map((h, i) => {
                const max = Math.max(...questHistory.slice(0, 14).map(x => x.xp))
                const pct = max > 0 ? (h.xp / max) * 100 : 0
                return <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-amber-400 to-orange-400" style={{ height: `${Math.max(4, pct)}%`, opacity: 0.5 + (i / 14) * 0.5 }} title={`${h.date}: ${h.xp} XP (${h.quests} quests)`} />
              })}
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-1">XP earned per day (last 14 days)</p>
          </CardContent>
        </Card>
      )}

      {/* How combos work */}
      <Card className="border-orange-200 bg-orange-50/10">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> The Combo System</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>3 quests</strong> = <span className="text-orange-600 font-bold">×1.25</span> XP multiplier</p>
            <p><strong>6 quests</strong> = <span className="text-orange-600 font-bold">×1.5</span> XP multiplier</p>
            <p><strong>9+ quests</strong> = <span className="text-orange-600 font-bold">×2.0</span> XP multiplier (MAX COMBO)</p>
            <p className="text-orange-700 font-medium mt-2">Combos reward doing multiple healthy things in one day. The more dimensions of flourishing you touch, the faster you level up. This is the positive feedback loop that replaces doom-scrolling with self-improvement.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/character-sheet" className="text-sm text-amber-600 hover:underline">Character Sheet</a>
        <a href="/flourishing-score" className="text-sm text-violet-600 hover:underline">Flourishing Score</a>
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/30-day-challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/life-os" className="text-sm text-blue-600 hover:underline">Life OS</a>
      </div>
    </div>
  )
}
