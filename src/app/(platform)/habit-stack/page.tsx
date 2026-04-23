"use client"

import { useState, useEffect, useMemo } from "react"
import { Layers, Plus, ArrowDown, Trash2, CheckCircle, RotateCcw, Sparkles, Sunrise, Moon, Link2, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HabitStack {
  id: string
  name: string
  habits: { text: string; done: boolean }[]
  streak: number
  lastCompleted: string
  scheduledTime?: string
}

interface DailyHabit {
  id: string
  name: string
  icon: string
  streak: number
  completedDates: string[]
  scheduledTime?: string
}

const TEMPLATES: { name: string; habits: string[]; cite: string }[] = [
  {
    name: "Morning Power Stack",
    habits: [
      "After I wake up, I will drink a glass of water",
      "After I drink water, I will do 5 minutes of stretching",
      "After I stretch, I will write 3 things I am grateful for",
      "After I write gratitude, I will review my top 3 priorities for the day",
      "After I review priorities, I will do 25 minutes of focused work",
    ],
    cite: "Based on Clear, Atomic Habits, Ch. 5 — habit stacking formula",
  },
  {
    name: "Evening Wind-Down",
    habits: [
      "After I finish dinner, I will clean the kitchen for 5 minutes",
      "After I clean, I will prepare tomorrow's clothes",
      "After I prep clothes, I will read for 20 minutes",
      "After I read, I will write one sentence about my day",
      "After I journal, I will do a 3-minute breathing exercise",
    ],
    cite: "Based on Clear, Atomic Habits — implementation intentions reduce decision friction",
  },
  {
    name: "Fitness Builder",
    habits: [
      "After I put on my shoes, I will do 10 push-ups",
      "After push-ups, I will do 10 squats",
      "After squats, I will do a 30-second plank",
      "After plank, I will do 10 lunges each leg",
      "After lunges, I will stretch for 3 minutes",
    ],
    cite: "Based on Clear's 2-minute rule — scale up from a tiny anchor",
  },
  {
    name: "Learning Stack",
    habits: [
      "After I pour my coffee, I will read 10 pages",
      "After I read, I will write one thing I learned",
      "After I write, I will watch one educational video (10 min max)",
      "After the video, I will practice one skill for 15 minutes",
    ],
    cite: "Based on Clear, Atomic Habits — pair new habits to existing anchor cues",
  },
]

function isToday(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()
}

function parseTime(t?: string): number | null {
  if (!t) return null
  const [h, m] = t.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function getLastN(n: number): string[] {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().split("T")[0])
}

function completionRate(habit: DailyHabit, windowDays = 30): number {
  const window = getLastN(windowDays)
  const hits = window.filter(d => habit.completedDates.includes(d)).length
  return hits / windowDays
}

export default function HabitStackPage() {
  const [stacks, setStacks] = useState<HabitStack[]>([])
  const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>([])
  const [activeStack, setActiveStack] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newHabits, setNewHabits] = useState<string[]>([""])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-habit-stacks")
    if (stored) setStacks(JSON.parse(stored))
    const daily = localStorage.getItem("hfp-daily-habits")
    if (daily) setDailyHabits(JSON.parse(daily))
  }, [])

  function save(updated: HabitStack[]) {
    setStacks(updated)
    localStorage.setItem("hfp-habit-stacks", JSON.stringify(updated))
  }

  function createStack(name: string, habits: string[]) {
    const filtered = habits.filter(h => h.trim())
    if (!name.trim() || filtered.length === 0) return
    save([...stacks, {
      id: Date.now().toString(36),
      name: name.trim(),
      habits: filtered.map(h => ({ text: h.trim(), done: false })),
      streak: 0,
      lastCompleted: "",
    }])
    setNewName("")
    setNewHabits([""])
    setShowCreate(false)
  }

  function useTemplate(template: typeof TEMPLATES[0]) {
    createStack(template.name, template.habits)
  }

  function toggleHabit(stackId: string, habitIndex: number) {
    save(stacks.map(s => {
      if (s.id !== stackId) return s
      const habits = s.habits.map((h, i) => i === habitIndex ? { ...h, done: !h.done } : h)
      const allDone = habits.every(h => h.done)
      const wasCompletedToday = isToday(s.lastCompleted)

      let streak = s.streak
      if (allDone && !wasCompletedToday) {
        if (isYesterday(s.lastCompleted) || s.lastCompleted === "") {
          streak = s.streak + 1
        } else if (!isToday(s.lastCompleted)) {
          streak = 1
        }
      }

      return {
        ...s,
        habits,
        streak,
        lastCompleted: allDone ? new Date().toISOString() : s.lastCompleted,
      }
    }))
  }

  function resetStack(stackId: string) {
    save(stacks.map(s => s.id === stackId
      ? { ...s, habits: s.habits.map(h => ({ ...h, done: false })) }
      : s
    ))
  }

  function deleteStack(stackId: string) {
    save(stacks.filter(s => s.id !== stackId))
    if (activeStack === stackId) setActiveStack(null)
  }

  // Auto-suggest anchors from user's high-success habits
  const anchorSuggestions = useMemo(() => {
    if (dailyHabits.length < 2) return []
    const ranked = dailyHabits
      .map(h => ({ habit: h, rate: completionRate(h, 30) }))
      .filter(x => x.rate >= 0.5 && x.habit.completedDates.length >= 5)
      .sort((a, b) => b.rate - a.rate)
    if (ranked.length === 0) return []

    const weak = dailyHabits
      .map(h => ({ habit: h, rate: completionRate(h, 30) }))
      .filter(x => x.rate < 0.5)
      .sort((a, b) => a.rate - b.rate)

    const suggestions: { anchor: string; anchorRate: number; target: string; targetRate: number; icon: string }[] = []
    for (const anchor of ranked.slice(0, 3)) {
      for (const target of weak.slice(0, 2)) {
        if (anchor.habit.id !== target.habit.id && suggestions.length < 4) {
          suggestions.push({
            anchor: anchor.habit.name,
            anchorRate: Math.round(anchor.rate * 100),
            target: target.habit.name,
            targetRate: Math.round(target.rate * 100),
            icon: anchor.habit.icon,
          })
        }
      }
    }
    return suggestions
  }, [dailyHabits])

  // Time-proximity chains (habits scheduled within 30 min of each other)
  const timeChains = useMemo(() => {
    const timed = dailyHabits
      .map(h => ({ habit: h, minutes: parseTime(h.scheduledTime) }))
      .filter(x => x.minutes !== null) as { habit: DailyHabit; minutes: number }[]
    if (timed.length < 2) return []
    timed.sort((a, b) => a.minutes - b.minutes)

    const chains: { habits: DailyHabit[]; startMinutes: number; endMinutes: number; jointRate: number }[] = []
    let current: typeof timed = [timed[0]]
    for (let i = 1; i < timed.length; i++) {
      if (timed[i].minutes - current[current.length - 1].minutes <= 30) {
        current.push(timed[i])
      } else {
        if (current.length >= 2) {
          chains.push(buildChain(current))
        }
        current = [timed[i]]
      }
    }
    if (current.length >= 2) chains.push(buildChain(current))
    return chains

    function buildChain(group: typeof timed) {
      const habits = group.map(g => g.habit)
      const last30 = getLastN(30)
      let allHit = 0
      for (const d of last30) {
        if (habits.every(h => h.completedDates.includes(d))) allHit++
      }
      return {
        habits,
        startMinutes: group[0].minutes,
        endMinutes: group[group.length - 1].minutes,
        jointRate: allHit / 30,
      }
    }
  }, [dailyHabits])

  const routineDetection = useMemo(() => {
    const morning = dailyHabits.filter(h => {
      const m = parseTime(h.scheduledTime)
      return m !== null && m < 11 * 60
    })
    const evening = dailyHabits.filter(h => {
      const m = parseTime(h.scheduledTime)
      return m !== null && m >= 18 * 60
    })
    return { morning, evening }
  }, [dailyHabits])

  const active = activeStack ? stacks.find(s => s.id === activeStack) : null
  const totalStreaks = stacks.reduce((sum, s) => sum + s.streak, 0)
  const completedToday = stacks.filter(s => isToday(s.lastCompleted) && s.habits.every(h => h.done)).length

  function formatMinutes(m: number): string {
    const h = Math.floor(m / 60)
    const mm = m % 60
    const period = h >= 12 ? "pm" : "am"
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${mm.toString().padStart(2, "0")}${period}`
  }

  // Stack strength: completion rate of whole chain vs expected if independent
  function stackStrength(stack: HabitStack): { chainRate: number; independentRate: number; bonus: number } {
    // Can't compute historical without logs; use today's completion as sample
    const doneCount = stack.habits.filter(h => h.done).length
    const chainRate = stack.habits.length > 0 ? doneCount / stack.habits.length : 0
    const independentRate = chainRate // Today only; use streak as longitudinal proxy
    const bonus = stack.streak > 0 ? Math.min(stack.streak / 30, 1) : 0
    return { chainRate, independentRate, bonus }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Habit Stacking</h1>
        </div>
        <p className="text-sm text-muted-foreground">Chain habits together. Complete one, the next begins. Build routines that stick.</p>
      </div>

      {/* Stats */}
      {stacks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stacks.length}</p>
              <p className="text-xs text-muted-foreground">Stacks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{completedToday}</p>
              <p className="text-xs text-muted-foreground">Done today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{totalStreaks}</p>
              <p className="text-xs text-muted-foreground">Total streak days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-suggested anchors from daily habits */}
      {!active && anchorSuggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" /> Suggested Anchors (from your data)
          </p>
          <div className="space-y-2">
            {anchorSuggestions.map((s, i) => (
              <Card key={i} className="border-amber-200 bg-amber-50/20">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed">
                        Your <strong>{s.anchor}</strong>{" "}
                        <span className="text-emerald-600">({s.anchorRate}% success)</span>{" "}
                        could anchor{" "}
                        <strong>{s.target}</strong>{" "}
                        <span className="text-red-500">({s.targetRate}% success)</span>.
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 italic">
                        "After I {s.anchor.toLowerCase()}, I will {s.target.toLowerCase()}."
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-[10px] h-7"
                      onClick={() => {
                        setNewName(`${s.anchor} → ${s.target}`)
                        setNewHabits([`After I ${s.anchor.toLowerCase()}, I will ${s.target.toLowerCase()}`])
                        setShowCreate(true)
                      }}
                    >
                      <Plus className="h-3 w-3" /> Stack
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Time-proximity detected chains */}
      {!active && timeChains.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Link2 className="h-3 w-3 text-violet-500" /> Detected Chains (within 30 min)
          </p>
          <div className="space-y-2">
            {timeChains.map((chain, i) => (
              <Card key={i} className="border-violet-200 bg-violet-50/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">
                      {formatMinutes(chain.startMinutes)} – {formatMinutes(chain.endMinutes)}
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-violet-500" />
                      <span className="text-[10px] font-bold text-violet-600">
                        {Math.round(chain.jointRate * 100)}% joint rate
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {chain.habits.map((h, j) => (
                      <span key={h.id} className="inline-flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {h.icon} {h.name}
                        </Badge>
                        {j < chain.habits.length - 1 && <ArrowDown className="h-3 w-3 text-violet-400 -rotate-90" />}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    All {chain.habits.length} habits completed together on{" "}
                    {Math.round(chain.jointRate * 30)}/30 recent days.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Morning / Evening routine detection */}
      {!active && (routineDetection.morning.length >= 2 || routineDetection.evening.length >= 2) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {routineDetection.morning.length >= 2 && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50/40 to-amber-50/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sunrise className="h-4 w-4 text-orange-500" />
                  <p className="text-xs font-semibold text-orange-700">Morning Routine Detected</p>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{routineDetection.morning.length} habits before 11am:</p>
                <div className="flex flex-wrap gap-1">
                  {routineDetection.morning.map(h => (
                    <Badge key={h.id} variant="outline" className="text-[9px]">{h.icon} {h.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {routineDetection.evening.length >= 2 && (
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-violet-50/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-indigo-700">Evening Routine Detected</p>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{routineDetection.evening.length} habits after 6pm:</p>
                <div className="flex flex-wrap gap-1">
                  {routineDetection.evening.map(h => (
                    <Badge key={h.id} variant="outline" className="text-[9px]">{h.icon} {h.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!active ? (
        <div className="space-y-4">
          {/* Existing stacks with strength score */}
          {stacks.map(stack => {
            const done = stack.habits.filter(h => h.done).length
            const total = stack.habits.length
            const isDoneToday = isToday(stack.lastCompleted) && done === total
            const strength = stackStrength(stack)
            const strengthPct = Math.round((strength.chainRate * 0.6 + strength.bonus * 0.4) * 100)
            return (
              <Card key={stack.id} className="card-hover cursor-pointer" onClick={() => setActiveStack(stack.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    isDoneToday ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                  )}>
                    {isDoneToday ? <CheckCircle className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{stack.name}</h3>
                      {stack.streak > 0 && (
                        <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">
                          {stack.streak} day streak
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[9px]",
                        strengthPct >= 70 ? "text-emerald-600 border-emerald-300" :
                        strengthPct >= 40 ? "text-amber-600 border-amber-300" :
                        "text-red-500 border-red-300"
                      )}>
                        Strength {strengthPct}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{total} habits · {done}/{total} done today</p>
                    <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Templates */}
          {!showCreate && (
            <>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Custom Stack</Button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Research-Backed Templates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <Card key={t.name} className="card-hover cursor-pointer" onClick={() => useTemplate(t)}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.habits.length} habits</p>
                        <p className="text-[10px] text-muted-foreground italic mt-1.5 leading-snug">{t.cite}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Custom create */}
          {showCreate && (
            <Card className="border-2 border-emerald-200">
              <CardContent className="p-4 space-y-3">
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Stack name (e.g., Morning Routine)" />
                <p className="text-xs text-muted-foreground">Use the format: &quot;After I [existing habit], I will [new habit]&quot;</p>
                {newHabits.map((h, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    {i > 0 && <ArrowDown className="h-3 w-3 text-emerald-400 shrink-0" />}
                    <Input value={h} onChange={e => {
                      const updated = [...newHabits]
                      updated[i] = e.target.value
                      setNewHabits(updated)
                    }} placeholder={`Habit ${i + 1}`} className="flex-1" />
                    {newHabits.length > 1 && (
                      <button onClick={() => setNewHabits(newHabits.filter((_, j) => j !== i))}
                        className="text-muted-foreground/30 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setNewHabits([...newHabits, ""])}>
                  <Plus className="h-3 w-3" /> Add Habit
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => createStack(newName, newHabits)} disabled={!newName.trim()} className="flex-1">Create Stack</Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Active stack detail */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveStack(null)}>All stacks</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => resetStack(active.id)}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteStack(active.id)}>
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-5">
              <h2 className="text-xl font-bold">{active.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-white/80">{active.habits.filter(h => h.done).length}/{active.habits.length}</span>
                {active.streak > 0 && <span className="text-white/80">{active.streak} day streak</span>}
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(active.habits.filter(h => h.done).length / active.habits.length) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habit chain */}
          <div className="space-y-0">
            {active.habits.map((habit, i) => {
              const isNext = !habit.done && (i === 0 || active.habits[i - 1]?.done)
              return (
                <div key={i}>
                  {i > 0 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className={cn("h-4 w-4", active.habits[i - 1]?.done ? "text-emerald-400" : "text-muted-foreground/20")} />
                    </div>
                  )}
                  <div
                    className={cn("rounded-xl border-2 p-4 cursor-pointer transition-all",
                      habit.done ? "border-emerald-300 bg-emerald-50/30 opacity-70" :
                      isNext ? "border-amber-300 bg-amber-50/20 shadow-sm" :
                      "border-border"
                    )}
                    onClick={() => toggleHabit(active.id, i)}>
                    <div className="flex items-center gap-3">
                      {habit.done
                        ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        : <div className={cn("h-5 w-5 rounded-full border-2 shrink-0",
                            isNext ? "border-amber-400" : "border-muted-foreground/20")} />
                      }
                      <div>
                        {isNext && <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Next up</p>}
                        <p className={cn("text-sm", habit.done && "line-through text-muted-foreground")}>{habit.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {active.habits.every(h => h.done) && (
            <Card className="border-emerald-300 bg-emerald-50/30">
              <CardContent className="p-5 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-emerald-700">Stack Complete</p>
                <p className="text-sm text-muted-foreground">Every chain link held. Come back tomorrow to keep the streak alive.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Why */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why habit stacking?</strong> From James Clear&apos;s <em>Atomic Habits</em> (2018, Ch. 5): &quot;One of the best ways to build
            a new habit is to identify a current habit you already do each day and then stack your new behavior on top.&quot;
            The existing habit becomes a trigger for the next one. Each completion creates momentum. The chain pulls
            you forward instead of relying on willpower alone. BJ Fogg&apos;s <em>Tiny Habits</em> (2019) calls this
            the &quot;anchor moment&quot; — the precise trigger that fires your new behaviour.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/habit-science" className="text-sm text-violet-600 hover:underline">Habit Science</a>
        <a href="/routine" className="text-sm text-amber-600 hover:underline">Daily Routines</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
      </div>
    </div>
  )
}
