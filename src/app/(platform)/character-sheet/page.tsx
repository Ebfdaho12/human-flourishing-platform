"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Swords, Heart, Brain, Shield, Zap, BookOpen, Users, Flame, Star, Trophy, Target, Crown, TrendingUp, Dumbbell, Moon, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

// ─── XP & Leveling System ─────────────────────────────────────────
function xpForLevel(level: number): number { return Math.floor(100 * Math.pow(1.5, level - 1)) }
function levelFromXP(xp: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) { remaining -= xpForLevel(level); level++ }
  const needed = xpForLevel(level)
  return { level, currentXP: remaining, nextLevelXP: needed, progress: Math.round((remaining / needed) * 100) }
}

function className(level: number): string {
  if (level >= 50) return "Transcendent"
  if (level >= 40) return "Sage"
  if (level >= 30) return "Master"
  if (level >= 25) return "Champion"
  if (level >= 20) return "Veteran"
  if (level >= 15) return "Warrior"
  if (level >= 10) return "Adventurer"
  if (level >= 5) return "Apprentice"
  return "Novice"
}

function classColor(level: number): string {
  if (level >= 40) return "text-amber-400"
  if (level >= 30) return "text-violet-400"
  if (level >= 20) return "text-blue-400"
  if (level >= 10) return "text-emerald-400"
  return "text-slate-400"
}

// ─── Stat Bar Component ─────────────────────────────────────────
function StatBar({ label, value, max, icon: Icon, color, subtext }: {
  label: string; value: number; max: number; icon: any; color: string; subtext?: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <span className="text-xs font-semibold">{label}</span>
        </div>
        <span className={cn("text-sm font-bold", color)}>{value}<span className="text-[10px] text-muted-foreground">/{max}</span></span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000",
          pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
        )} style={{ width: `${pct}%` }} />
      </div>
      {subtext && <p className="text-[9px] text-muted-foreground">{subtext}</p>}
    </div>
  )
}

// ─── Achievement Badge ─────────────────────────────────────────
function AchievementBadge({ name, description, earned, icon }: {
  name: string; description: string; earned: boolean; icon: string
}) {
  return (
    <div className={cn("rounded-lg border p-2 text-center transition-all", earned ? "border-amber-300 bg-amber-50/30" : "opacity-30 grayscale")}>
      <span className="text-xl">{icon}</span>
      <p className="text-[10px] font-semibold mt-0.5">{name}</p>
      <p className="text-[8px] text-muted-foreground">{description}</p>
    </div>
  )
}

export default function CharacterSheetPage() {
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=30", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=200", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const { data: walletData } = useSWR("/api/wallet", secureFetcher)
  const { data: goalsData } = useSWR("/api/goals/all", secureFetcher)
  const [pagesVisited, setPagesVisited] = useState(0)
  const [habitsData, setHabitsData] = useState<any[]>([])
  const [gratitudeCount, setGratitudeCount] = useState(0)

  useEffect(() => {
    try { setPagesVisited(JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]").length) } catch {}
    try { setHabitsData(JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")) } catch {}
    try { setGratitudeCount(JSON.parse(localStorage.getItem("hfp-gratitude") || "[]").length) } catch {}
  }, [])

  const moods = moodData?.entries || []
  const entries = healthData?.entries || []
  const streaks = streakData || {}
  const wallet = walletData?.wallet || {}
  const goals = goalsData?.goals || []

  // Calculate XP from activities
  const totalXP = useMemo(() => {
    let xp = 0
    xp += moods.length * 10           // 10 XP per mood log
    xp += entries.length * 15          // 15 XP per health entry
    xp += (streaks.health || 0) * 20   // 20 XP per streak day
    xp += (streaks.mood || 0) * 20
    xp += pagesVisited * 5             // 5 XP per page explored
    xp += gratitudeCount * 10          // 10 XP per gratitude entry
    xp += goals.length * 25            // 25 XP per goal set
    xp += Number(wallet.balance || 0)  // 1 XP per FOUND token
    // Habit streaks
    habitsData.forEach((h: any) => { xp += (h.completedDates?.length || 0) * 5 })
    return xp
  }, [moods, entries, streaks, pagesVisited, gratitudeCount, goals, wallet, habitsData])

  const levelInfo = levelFromXP(totalXP)

  // ─── Core Stats (RPG-style) ─────────────────────────────────
  const stats = useMemo(() => {
    // VITALITY (health + exercise + sleep)
    const exerciseCount = entries.filter((e: any) => e.entryType === "EXERCISE").length
    const sleepEntries = entries.filter((e: any) => e.entryType === "SLEEP")
    const avgSleep = sleepEntries.length > 0 ? sleepEntries.reduce((s: number, e: any) => {
      try { return s + (JSON.parse(e.data)?.hoursSlept || 0) } catch { return s }
    }, 0) / sleepEntries.length : 0
    const vitality = Math.min(99, Math.round(
      (Math.min(30, exerciseCount) / 30 * 40) + (avgSleep >= 7 ? 30 : avgSleep >= 6 ? 20 : 10) + (Math.min(50, entries.length) / 50 * 30)
    ))

    // RESILIENCE (streaks + consistency + habits)
    const maxStreak = Math.max(streaks.health || 0, streaks.mood || 0, streaks.journal || 0)
    const totalHabitDays = habitsData.reduce((s: number, h: any) => s + (h.completedDates?.length || 0), 0)
    const resilience = Math.min(99, Math.round(
      (Math.min(30, maxStreak) / 30 * 50) + (Math.min(100, totalHabitDays) / 100 * 30) + (gratitudeCount > 0 ? 20 : 0)
    ))

    // WISDOM (pages explored + goals + learning)
    const wisdom = Math.min(99, Math.round(
      (Math.min(100, pagesVisited) / 100 * 50) + (Math.min(10, goals.length) / 10 * 30) + (gratitudeCount >= 21 ? 20 : gratitudeCount >= 7 ? 10 : 0)
    ))

    // AWARENESS (mood tracking + correlations data + journal)
    const moodConsistency = moods.length
    const awareness = Math.min(99, Math.round(
      (Math.min(30, moodConsistency) / 30 * 60) + (sleepEntries.length >= 7 ? 20 : 0) + (gratitudeCount >= 7 ? 20 : 0)
    ))

    // WEALTH (FOUND tokens + financial engagement)
    const foundBalance = Number(wallet.balance || 0)
    const wealth = Math.min(99, Math.round(
      (Math.min(1000, foundBalance) / 1000 * 60) + (pagesVisited >= 20 ? 20 : 10) + (goals.length >= 3 ? 20 : 10)
    ))

    // SOCIAL (community engagement — basic for now)
    const social = Math.min(99, Math.round(
      (pagesVisited >= 50 ? 30 : pagesVisited >= 20 ? 20 : 10) + (gratitudeCount >= 7 ? 20 : 0) + (habitsData.length >= 5 ? 20 : 10) + (maxStreak >= 7 ? 30 : maxStreak >= 3 ? 15 : 0)
    ))

    return { vitality, resilience, wisdom, awareness, wealth, social }
  }, [entries, streaks, pagesVisited, gratitudeCount, goals, wallet, habitsData, moods])

  // ─── Achievements ─────────────────────────────────
  const achievements = [
    { name: "First Steps", description: "Log your first mood", icon: "👣", earned: moods.length >= 1 },
    { name: "Week Warrior", description: "7-day streak", icon: "⚔️", earned: Math.max(streaks.health||0, streaks.mood||0) >= 7 },
    { name: "Iron Will", description: "30-day streak", icon: "🛡️", earned: Math.max(streaks.health||0, streaks.mood||0) >= 30 },
    { name: "Century", description: "100 health entries", icon: "💯", earned: entries.length >= 100 },
    { name: "Explorer", description: "Visit 50 pages", icon: "🗺️", earned: pagesVisited >= 50 },
    { name: "Cartographer", description: "Visit 100 pages", icon: "🌍", earned: pagesVisited >= 100 },
    { name: "Grateful Heart", description: "21-day gratitude streak", icon: "🙏", earned: gratitudeCount >= 21 },
    { name: "Token Holder", description: "Earn 100 FOUND", icon: "🪙", earned: Number(wallet.balance||0) >= 100 },
    { name: "Goal Setter", description: "Create 5 goals", icon: "🎯", earned: goals.length >= 5 },
    { name: "Habit Master", description: "Maintain 10 habits", icon: "⚡", earned: habitsData.length >= 10 },
    { name: "Night Owl", description: "Complete evening review 7 days", icon: "🦉", earned: false }, // would need evening review data
    { name: "Centurion", description: "Reach Level 10", icon: "👑", earned: levelInfo.level >= 10 },
  ]
  const earnedCount = achievements.filter(a => a.earned).length

  // Power score = average of all stats
  const powerScore = Math.round((stats.vitality + stats.resilience + stats.wisdom + stats.awareness + stats.wealth + stats.social) / 6)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Character Sheet</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your real-life RPG stats. Every action you take on the platform earns XP and levels up your character.
        </p>
      </div>

      {/* Level & Class */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/30 to-orange-50/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Crown className={cn("h-8 w-8", levelInfo.level >= 20 ? "text-yellow-200" : "text-white")} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">Level {levelInfo.level}</p>
                <Badge className={cn("text-xs", classColor(levelInfo.level))}>{className(levelInfo.level)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{totalXP.toLocaleString()} total XP · Power: {powerScore}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                  <span>{levelInfo.currentXP} / {levelInfo.nextLevelXP} XP</span>
                  <span>Level {levelInfo.level + 1}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${levelInfo.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Stats */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Core Stats</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <StatBar label="VIT — Vitality" value={stats.vitality} max={99} icon={Heart} color="text-red-500" subtext="Health entries, exercise, sleep quality" />
          <StatBar label="RES — Resilience" value={stats.resilience} max={99} icon={Shield} color="text-blue-500" subtext="Streaks, habits, consistency" />
          <StatBar label="WIS — Wisdom" value={stats.wisdom} max={99} icon={BookOpen} color="text-violet-500" subtext="Pages explored, goals, learning" />
          <StatBar label="AWR — Awareness" value={stats.awareness} max={99} icon={Brain} color="text-pink-500" subtext="Mood tracking, self-reflection, journaling" />
          <StatBar label="WLT — Wealth" value={stats.wealth} max={99} icon={DollarSign} color="text-emerald-500" subtext="FOUND tokens, financial engagement" />
          <StatBar label="SOC — Social" value={stats.social} max={99} icon={Users} color="text-cyan-500" subtext="Community, gratitude, platform engagement" />
        </CardContent>
      </Card>

      {/* Active Buffs (streaks) */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Active Buffs</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "Health Streak", value: streaks.health || 0, icon: "❤️‍🔥", buff: "+2 VIT/day" },
              { name: "Mood Streak", value: streaks.mood || 0, icon: "🧠", buff: "+2 AWR/day" },
              { name: "Journal Streak", value: streaks.journal || 0, icon: "📝", buff: "+2 WIS/day" },
              { name: "Platform Streak", value: streaks.platform || 0, icon: "⚡", buff: "+1 ALL/day" },
            ].map((buff, i) => (
              <div key={i} className={cn("rounded-lg border p-2.5 text-center", buff.value > 0 ? "border-orange-200 bg-orange-50/30" : "opacity-40")}>
                <span className="text-xl">{buff.icon}</span>
                <p className="text-[10px] font-semibold mt-0.5">{buff.name}</p>
                <p className={cn("text-lg font-bold", buff.value > 0 ? "text-orange-600" : "text-muted-foreground")}>{buff.value}d</p>
                <p className="text-[8px] text-orange-500">{buff.value > 0 ? buff.buff : "Inactive"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Achievements
            <Badge variant="outline" className="text-[9px] ml-auto">{earnedCount}/{achievements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {achievements.map((a, i) => <AchievementBadge key={i} {...a} />)}
          </div>
        </CardContent>
      </Card>

      {/* XP Sources */}
      <Card className="border-slate-200 bg-slate-50/10">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2">How to Earn XP</p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
            <p>🧠 Mood check-in: <strong>+10 XP</strong></p>
            <p>❤️ Health entry: <strong>+15 XP</strong></p>
            <p>🔥 Streak day: <strong>+20 XP</strong></p>
            <p>🙏 Gratitude entry: <strong>+10 XP</strong></p>
            <p>🎯 Set a goal: <strong>+25 XP</strong></p>
            <p>🗺️ Explore a page: <strong>+5 XP</strong></p>
            <p>✅ Complete a habit: <strong>+5 XP</strong></p>
            <p>🪙 Earn FOUND: <strong>+1 XP each</strong></p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/flourishing-score" className="text-sm text-violet-600 hover:underline">Flourishing Score</a>
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/trends" className="text-sm text-blue-600 hover:underline">Your Trends</a>
        <a href="/progress" className="text-sm text-amber-600 hover:underline">Progress</a>
        <a href="/trajectory" className="text-sm text-indigo-600 hover:underline">Life Trajectory</a>
      </div>
    </div>
  )
}
