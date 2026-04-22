"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, Flame, RotateCcw, Plus, X, Droplets, Moon, Dumbbell, BookOpen, Brain, Heart, Apple, Pill, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { useToast } from "@/components/ui/toast-notification"

interface Habit {
  id: string
  name: string
  icon: string
  streak: number
  completedDates: string[]
}

const DEFAULT_HABITS: Omit<Habit, "streak" | "completedDates">[] = [
  { id: "water", name: "Drink 2.5L water", icon: "💧" },
  { id: "exercise", name: "Move your body (30 min)", icon: "🏋️" },
  { id: "sleep", name: "7+ hours sleep", icon: "😴" },
  { id: "read", name: "Read (20 min)", icon: "📖" },
  { id: "mood", name: "Log mood", icon: "🧠" },
  { id: "gratitude", name: "Write 3 gratitudes", icon: "🙏" },
  { id: "no-screen", name: "No screens 1hr before bed", icon: "📵" },
  { id: "meditate", name: "Breathwork / meditation", icon: "🧘" },
  { id: "stretch", name: "Morning stretch / fascia work", icon: "🤸" },
  { id: "journal", name: "Journal entry", icon: "✏️" },
]

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort().reverse()
  const today = getToday()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  // Must include today or yesterday to have an active streak
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000)
    return d.toISOString().split("T")[0]
  }).reverse()
}

export default function DailyHabitsPage() {
  const defaultHabits = DEFAULT_HABITS.map(h => ({ ...h, streak: 0, completedDates: [] as string[] }))
  const [habits, save] = useSyncedStorage<Habit[]>("hfp-daily-habits", defaultHabits)
  const [newHabitName, setNewHabitName] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const today = getToday()
  const last7 = getLast7Days()

  const { toast } = useToast()

  function toggleToday(habitId: string) {
    const habit = habits.find(h => h.id === habitId)
    const wasCompleted = habit?.completedDates.includes(today)
    const updated = habits.map(h => {
      if (h.id !== habitId) return h
      const completed = h.completedDates.includes(today)
      const newDates = completed ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today]
      return { ...h, completedDates: newDates, streak: getStreak(newDates) }
    })
    save(updated)

    if (!wasCompleted && habit) {
      const newStreak = getStreak([...habit.completedDates, today])
      if (newStreak >= 7 && (newStreak % 7 === 0)) {
        toast({ message: `${habit.name}: ${newStreak}-day streak! 🔥`, type: "streak", xp: 20 })
      } else {
        toast({ message: `${habit.name} ✓`, type: "success", xp: 5, duration: 2000 })
      }
      // Check if all habits complete
      const nowDone = updated.filter(h => h.completedDates.includes(today)).length
      if (nowDone === updated.length && updated.length > 0) {
        setTimeout(() => toast({ message: "All habits complete! 💯", type: "milestone", xp: 30 }), 500)
      }
    }
  }

  function addHabit() {
    if (!newHabitName.trim()) return
    const id = `custom-${Date.now()}`
    const updated = [...habits, { id, name: newHabitName.trim(), icon: "⭐", streak: 0, completedDates: [] }]
    save(updated)
    setNewHabitName("")
    setShowAdd(false)
  }

  function removeHabit(id: string) {
    save(habits.filter(h => h.id !== id))
  }

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length
  const totalHabits = habits.length
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daily Habits</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Small actions, every day, compound into extraordinary results. Check off your habits. Build streaks. Become who you want to be.
        </p>
      </div>

      {/* Today's progress */}
      <Card className={cn("border-2", pct === 100 ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              <p className="text-xs text-muted-foreground">{completedToday} of {totalHabits} complete</p>
            </div>
            <div className="text-right">
              <p className={cn("text-2xl font-bold", pct === 100 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-muted-foreground")}>{pct}%</p>
              {longestStreak > 0 && <p className="text-[10px] text-orange-500"><Flame className="h-3 w-3 inline" /> Best streak: {longestStreak}d</p>}
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-blue-400 to-violet-500")} style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && <p className="text-xs text-emerald-600 font-medium mt-2 text-center">All habits complete today. You are building something extraordinary.</p>}
        </CardContent>
      </Card>

      {/* Habits checklist */}
      <Card>
        <CardContent className="p-4 space-y-1">
          {habits.map((habit) => {
            const done = habit.completedDates.includes(today)
            return (
              <div key={habit.id} className={cn("flex items-center gap-3 rounded-lg p-2.5 transition-colors cursor-pointer group", done ? "bg-emerald-50/50" : "hover:bg-muted/50")} onClick={() => toggleToday(habit.id)}>
                {done ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />}
                <span className="text-lg shrink-0">{habit.icon}</span>
                <span className={cn("text-sm flex-1", done ? "text-emerald-700 line-through" : "")}>{habit.name}</span>
                {habit.streak > 0 && (
                  <Badge variant="outline" className="text-[9px] shrink-0 border-orange-200 text-orange-600">
                    <Flame className="h-2.5 w-2.5 mr-0.5" />{habit.streak}d
                  </Badge>
                )}
                <button onClick={(e) => { e.stopPropagation(); removeHabit(habit.id) }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Add habit */}
      {showAdd ? (
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Input value={newHabitName} onChange={e => setNewHabitName(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} placeholder="Habit name..." className="h-9 text-sm" autoFocus />
            <Button onClick={addHabit} size="sm" className="bg-emerald-600 hover:bg-emerald-700">Add</Button>
            <Button onClick={() => setShowAdd(false)} size="sm" variant="outline">Cancel</Button>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAdd(true)} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Custom Habit</Button>
      )}

      {/* 7-day view */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground w-40 pb-2">Habit</th>
                  {last7.map(d => (
                    <th key={d} className="text-center text-muted-foreground pb-2 w-10">
                      {new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map(h => (
                  <tr key={h.id} className="border-t border-muted/50">
                    <td className="py-1.5 truncate max-w-[160px]">{h.icon} {h.name}</td>
                    {last7.map(d => (
                      <td key={d} className="text-center py-1.5">
                        {h.completedDates.includes(d) ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground/20 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analytics — only show when there's enough data */}
      {habits.some(h => h.completedDates.length >= 7) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Habit Analytics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Consistency ranking */}
            <div>
              <p className="text-xs font-semibold mb-2">Consistency Ranking</p>
              <div className="space-y-1.5">
                {[...habits]
                  .map(h => ({ ...h, consistency: h.completedDates.length > 0 ? Math.round((h.completedDates.length / Math.max(1, Math.ceil((Date.now() - new Date(h.completedDates[h.completedDates.length - 1] || today).getTime()) / 86400000 + h.completedDates.length))) * 100) : 0 }))
                  .sort((a, b) => b.consistency - a.consistency)
                  .map((h, i) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}.</span>
                      <span className="text-sm shrink-0">{h.icon}</span>
                      <span className="text-xs flex-1 truncate">{h.name}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", h.consistency >= 80 ? "bg-emerald-400" : h.consistency >= 50 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${h.consistency}%` }} />
                      </div>
                      <span className={cn("text-[10px] font-bold w-10 text-right", h.consistency >= 80 ? "text-emerald-600" : h.consistency >= 50 ? "text-amber-600" : "text-red-500")}>{h.consistency}%</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* 30-day heat map */}
            <div>
              <p className="text-xs font-semibold mb-2">30-Day Activity (all habits combined)</p>
              <div className="flex flex-wrap gap-[3px]">
                {Array.from({ length: 30 }, (_, i) => {
                  const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0]
                  const completed = habits.filter(h => h.completedDates.includes(d)).length
                  const pctDay = totalHabits > 0 ? completed / totalHabits : 0
                  const isToday = d === today
                  return (
                    <div
                      key={d}
                      className={cn("h-4 w-4 rounded-sm transition-colors", isToday ? "ring-1 ring-violet-400" : "")}
                      style={{ backgroundColor: pctDay === 0 ? "#f1f5f9" : pctDay < 0.33 ? "#fde68a" : pctDay < 0.66 ? "#86efac" : pctDay < 1 ? "#34d399" : "#059669" }}
                      title={`${d}: ${completed}/${totalHabits} habits (${Math.round(pctDay * 100)}%)`}
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground">
                <span>Less</span>
                {["#f1f5f9", "#fde68a", "#86efac", "#34d399", "#059669"].map((c, i) => (
                  <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Insights */}
            <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
              <p className="text-[10px] font-semibold text-violet-700 mb-1">Insights</p>
              <div className="space-y-1 text-[10px] text-muted-foreground">
                {(() => {
                  const insights: string[] = []
                  const mostConsistent = [...habits].sort((a, b) => b.completedDates.length - a.completedDates.length)[0]
                  const leastConsistent = [...habits].filter(h => h.completedDates.length > 0).sort((a, b) => a.completedDates.length - b.completedDates.length)[0]
                  if (mostConsistent?.completedDates.length > 5) insights.push(`${mostConsistent.icon} ${mostConsistent.name} is your strongest habit (${mostConsistent.completedDates.length} completions).`)
                  if (leastConsistent && leastConsistent.id !== mostConsistent?.id) insights.push(`${leastConsistent.icon} ${leastConsistent.name} needs the most attention (${leastConsistent.completedDates.length} completions).`)
                  // Day of week analysis
                  const dayCount: Record<number, number> = {}
                  habits.forEach(h => h.completedDates.forEach(d => { const day = new Date(d + "T12:00:00").getDay(); dayCount[day] = (dayCount[day] || 0) + 1 }))
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  const bestDay = Object.entries(dayCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
                  const worstDay = Object.entries(dayCount).sort((a, b) => Number(a[1]) - Number(b[1]))[0]
                  if (bestDay && worstDay && bestDay[0] !== worstDay[0]) insights.push(`You're most consistent on ${days[Number(bestDay[0])]}s and least on ${days[Number(worstDay[0])]}s.`)
                  if (longestStreak >= 14) insights.push(`Your ${longestStreak}-day best streak shows real commitment. Research says 66 days creates automatic behavior.`)
                  if (pct === 100) insights.push("Today is 100% complete. Every perfect day compounds.")
                  return insights.map((insight, i) => <p key={i}>• {insight}</p>)
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Philosophy */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The compound effect of daily habits is staggering.</strong> Improving just 1% per day means
            you are 37x better after one year. The habits on this list are not random — each one targets a
            different dimension of flourishing: body (exercise, sleep, water), mind (reading, meditation, journaling),
            and connection (gratitude). You do not rise to the level of your goals. You fall to the level of your systems.
            This is your system.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/morning-briefing" className="text-sm text-amber-600 hover:underline">Morning Briefing</a>
        <a href="/gratitude" className="text-sm text-rose-600 hover:underline">Gratitude Journal</a>
        <a href="/evening-review" className="text-sm text-indigo-600 hover:underline">Evening Review</a>
        <a href="/habit-stack" className="text-sm text-emerald-600 hover:underline">Habit Stack</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
      </div>
    </div>
  )
}
