"use client"

import { useState, useEffect } from "react"
import { Layers, Plus, ArrowDown, Trash2, CheckCircle, RotateCcw, Sparkles } from "lucide-react"
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
  lastCompleted: string // ISO date
}

const TEMPLATES: { name: string; habits: string[] }[] = [
  {
    name: "Morning Power Stack",
    habits: [
      "After I wake up, I will drink a glass of water",
      "After I drink water, I will do 5 minutes of stretching",
      "After I stretch, I will write 3 things I am grateful for",
      "After I write gratitude, I will review my top 3 priorities for the day",
      "After I review priorities, I will do 25 minutes of focused work",
    ],
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
  },
  {
    name: "Learning Stack",
    habits: [
      "After I pour my coffee, I will read 10 pages",
      "After I read, I will write one thing I learned",
      "After I write, I will watch one educational video (10 min max)",
      "After the video, I will practice one skill for 15 minutes",
    ],
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

export default function HabitStackPage() {
  const [stacks, setStacks] = useState<HabitStack[]>([])
  const [activeStack, setActiveStack] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newHabits, setNewHabits] = useState<string[]>([""])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-habit-stacks")
    if (stored) setStacks(JSON.parse(stored))
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
        // Completing today
        if (isYesterday(s.lastCompleted) || s.lastCompleted === "") {
          streak = s.streak + 1
        } else if (!isToday(s.lastCompleted)) {
          streak = 1 // Reset streak if missed a day
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

  const active = activeStack ? stacks.find(s => s.id === activeStack) : null
  const totalStreaks = stacks.reduce((sum, s) => sum + s.streak, 0)
  const completedToday = stacks.filter(s => isToday(s.lastCompleted) && s.habits.every(h => h.done)).length

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

      {!active ? (
        <div className="space-y-4">
          {/* Existing stacks */}
          {stacks.map(stack => {
            const done = stack.habits.filter(h => h.done).length
            const total = stack.habits.length
            const completedToday = isToday(stack.lastCompleted) && done === total
            return (
              <Card key={stack.id} className="card-hover cursor-pointer" onClick={() => setActiveStack(stack.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    completedToday ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                  )}>
                    {completedToday ? <CheckCircle className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{stack.name}</h3>
                      {stack.streak > 0 && (
                        <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">
                          {stack.streak} day streak
                        </Badge>
                      )}
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
                  <Sparkles className="h-3 w-3" /> Quick Start Templates
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <Card key={t.name} className="card-hover cursor-pointer" onClick={() => useTemplate(t)}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.habits.length} habits</p>
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
            <Button variant="ghost" onClick={() => setActiveStack(null)}>← All stacks</Button>
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
                {active.streak > 0 && <span className="text-white/80">🔥 {active.streak} day streak</span>}
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
                <p className="text-lg font-bold text-emerald-700">Stack Complete!</p>
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
            <strong>Why habit stacking?</strong> From James Clear's <em>Atomic Habits</em>: &quot;One of the best ways to build
            a new habit is to identify a current habit you already do each day and then stack your new behavior on top.&quot;
            The existing habit becomes a trigger for the next one. Each completion creates momentum. The chain pulls
            you forward instead of relying on willpower alone.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/habits" className="text-sm text-emerald-600 hover:underline">Habit Tracker</a>
        <a href="/routine" className="text-sm text-amber-600 hover:underline">Daily Routines</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
      </div>
    </div>
  )
}
