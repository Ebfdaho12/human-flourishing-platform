"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, Flame, RotateCcw, Plus, X, Droplets, Moon, Dumbbell, BookOpen, Brain, Heart, Apple, Pill, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const today = getToday()
  const last7 = getLast7Days()

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hfp-daily-habits")
    if (saved) {
      setHabits(JSON.parse(saved))
    } else {
      // Initialize with defaults
      const initial = DEFAULT_HABITS.map(h => ({ ...h, streak: 0, completedDates: [] }))
      setHabits(initial)
      localStorage.setItem("hfp-daily-habits", JSON.stringify(initial))
    }
  }, [])

  function save(updated: Habit[]) {
    setHabits(updated)
    localStorage.setItem("hfp-daily-habits", JSON.stringify(updated))
  }

  function toggleToday(habitId: string) {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h
      const completed = h.completedDates.includes(today)
      const newDates = completed ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today]
      return { ...h, completedDates: newDates, streak: getStreak(newDates) }
    })
    save(updated)
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
