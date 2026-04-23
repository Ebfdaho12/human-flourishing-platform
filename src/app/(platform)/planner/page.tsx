"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  Calendar, Plus, CheckCircle, Circle, Clock, Trash2, Zap, AlertTriangle,
  Briefcase, Heart, BookOpen, Moon, Sparkles, TrendingDown, Brain, Dumbbell,
  Target, Layers, Timer
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

type Category = "work" | "health" | "learning" | "rest" | "other"

interface Task {
  id: string
  text: string
  time: string        // HH:MM or ""
  duration: number    // minutes
  done: boolean
  priority: "low" | "medium" | "high"
  category: Category
  source?: "manual" | "habit"
  sourceId?: string
}

const PRIORITY_BORDER: Record<Task["priority"], string> = {
  low: "border-l-emerald-400",
  medium: "border-l-amber-400",
  high: "border-l-red-400",
}

const CATEGORY_META: Record<Category, { label: string; icon: any; color: string; bar: string; bg: string }> = {
  work:     { label: "Work",     icon: Briefcase, color: "text-blue-600",    bar: "bg-blue-500",    bg: "bg-blue-50 border-blue-200" },
  health:   { label: "Health",   icon: Dumbbell,  color: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  learning: { label: "Learning", icon: BookOpen,  color: "text-violet-600",  bar: "bg-violet-500",  bg: "bg-violet-50 border-violet-200" },
  rest:     { label: "Rest",     icon: Moon,      color: "text-indigo-600",  bar: "bg-indigo-500",  bg: "bg-indigo-50 border-indigo-200" },
  other:    { label: "Other",    icon: Layers,    color: "text-slate-600",   bar: "bg-slate-400",   bg: "bg-slate-50 border-slate-200" },
}

const HABIT_CATEGORY_MAP: Record<string, Category> = {
  water: "health", exercise: "health", sleep: "rest", read: "learning",
  mood: "health", gratitude: "rest", "no-screen": "rest", meditate: "rest",
  stretch: "health", journal: "learning",
}

function todayISO(): string { return new Date().toISOString().split("T")[0] }
function daysAgoISO(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]
}
function addMin(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor((total % (24 * 60)) / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`
}

function categorizeHabit(h: any): Category {
  if (h.id && HABIT_CATEGORY_MAP[h.id]) return HABIT_CATEGORY_MAP[h.id]
  const name = String(h.name || "").toLowerCase()
  if (/(run|walk|gym|exercise|workout|stretch|water|hydrat|sleep|meal|food|diet|yoga)/.test(name)) return "health"
  if (/(read|study|learn|book|course|practice|lesson)/.test(name)) return "learning"
  if (/(meditat|breath|gratitude|journal|reflect|review|rest|nap)/.test(name)) return "rest"
  if (/(code|work|email|meeting|ship|build|client)/.test(name)) return "work"
  return "other"
}

// Infer category from free-text task
function inferCategory(text: string): Category {
  const t = text.toLowerCase()
  if (/(run|walk|gym|exercise|workout|stretch|water|hydrat|sleep|meal|cook|yoga|swim|bike|lift)/.test(t)) return "health"
  if (/(read|study|learn|book|course|practice|lesson|research)/.test(t)) return "learning"
  if (/(meditat|breath|gratitude|journal|reflect|review|rest|nap|pray|relax)/.test(t)) return "rest"
  if (/(code|work|email|meeting|call|ship|build|client|write|report|deploy|plan|draft|fix|bug)/.test(t)) return "work"
  return "other"
}

export default function PlannerPage() {
  const today = todayISO()
  const storageKey = `hfp-planner-${today}`

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newDuration, setNewDuration] = useState(30)
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium")
  const [newCategory, setNewCategory] = useState<Category>("work")
  const [habits, setHabits] = useState<any[]>([])
  const [focusHistory, setFocusHistory] = useState<any[]>([])

  const { data: healthData } = useSWR("/api/health/entries?limit=100", secureFetcher)

  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); if (s) setTasks(JSON.parse(s)) } catch {}
    try { setHabits(JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")) } catch {}
    try { setFocusHistory(JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")) } catch {}
  }, [storageKey])

  function save(updated: Task[]) {
    setTasks(updated)
    try { localStorage.setItem(storageKey, JSON.stringify(updated)) } catch {}
  }

  function addTask() {
    if (!newTask.trim()) return
    save([...tasks, {
      id: Date.now().toString(36),
      text: newTask.trim(),
      time: newTime || "",
      duration: Math.max(5, Math.min(480, newDuration || 30)),
      done: false,
      priority: newPriority,
      category: newCategory,
      source: "manual",
    }])
    setNewTask(""); setNewTime(""); setNewDuration(30)
  }
  function toggleTask(id: string) { save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)) }
  function deleteTask(id: string) { save(tasks.filter(t => t.id !== id)) }

  // ===== Derive: peak focus hour from focus history =====
  const peakFocusHour = useMemo(() => {
    // Bucket logged focus sessions by hour; requires timestamp field, falls back to stored date's completions
    const buckets = new Array(24).fill(0)
    let total = 0
    focusHistory.forEach((f: any) => {
      const ts = f.timestamp || f.completedAt || f.date
      if (!ts) return
      const h = new Date(ts).getHours()
      const mins = Number(f.focusMinutes || f.minutes || 0)
      if (mins > 0) { buckets[h] += mins; total += mins }
    })
    if (total < 30) return null // not enough signal
    let bestHour = 0, bestVal = -1
    buckets.forEach((v, h) => { if (v > bestVal) { bestVal = v; bestHour = h } })
    if (bestVal <= 0) return null
    return bestHour
  }, [focusHistory])

  const peakFocusRange = peakFocusHour !== null
    ? `${String(peakFocusHour).padStart(2, "0")}:00–${String((peakFocusHour + 2) % 24).padStart(2, "0")}:00`
    : null

  // ===== Derive: days since last exercise (from health entries) =====
  const daysSinceExercise = useMemo(() => {
    const entries = healthData?.entries || []
    const exDates = entries
      .filter((e: any) => e.entryType === "EXERCISE")
      .map((e: any) => (e.createdAt || "").slice(0, 10))
      .filter(Boolean)
      .sort()
      .reverse()
    if (exDates.length === 0) return null
    const last = new Date(exDates[0])
    const diff = Math.floor((Date.now() - last.getTime()) / 86400000)
    return diff
  }, [healthData])

  // ===== Active habits not yet in today's plan =====
  const activeHabits = useMemo(() => {
    return habits.filter((h: any) => {
      const done = Array.isArray(h.completedDates) && h.completedDates.includes(today)
      const alreadyOnPlan = tasks.some(t => t.sourceId === h.id)
      return !done && !alreadyOnPlan
    })
  }, [habits, tasks, today])

  function importHabits() {
    if (activeHabits.length === 0) return
    const imported: Task[] = activeHabits.map((h: any) => ({
      id: `habit-${h.id}-${Date.now().toString(36)}`,
      text: h.name || h.id,
      time: "",
      duration: 20,
      done: false,
      priority: "medium" as const,
      category: categorizeHabit(h),
      source: "habit" as const,
      sourceId: h.id,
    }))
    save([...tasks, ...imported])
  }

  // ===== Next review: last evening-review date =====
  const nextReviewIn = useMemo(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("hfp-evening-review") || "[]")
      const dates = arr.map((e: any) => e.date).filter(Boolean).sort().reverse()
      if (dates.length === 0) return 0 // due today
      const last = new Date(dates[0])
      const cadence = 1 // daily
      const nextDue = new Date(last.getTime() + cadence * 86400000)
      const diffDays = Math.ceil((nextDue.getTime() - Date.now()) / 86400000)
      return Math.max(0, diffDays)
    } catch { return 0 }
  }, [tasks])

  // ===== Time debt: hours planned but not executed over last 7 days =====
  const timeDebt = useMemo(() => {
    let plannedMins = 0, executedMins = 0
    for (let i = 1; i <= 7; i++) {
      const key = `hfp-planner-${daysAgoISO(i)}`
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const ts: Task[] = JSON.parse(raw)
        ts.forEach(t => {
          const d = Number(t.duration || 0)
          plannedMins += d
          if (t.done) executedMins += d
        })
      } catch {}
    }
    return { plannedMins, executedMins, debtMins: Math.max(0, plannedMins - executedMins) }
  }, [tasks])

  // ===== Today metrics =====
  const totalCount = tasks.length
  const completedCount = tasks.filter(t => t.done).length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const plannedMinsToday = tasks.reduce((s, t) => s + (t.duration || 0), 0)
  const completedMinsToday = tasks.filter(t => t.done).reduce((s, t) => s + (t.duration || 0), 0)
  const plannedHours = Math.round((plannedMinsToday / 60) * 10) / 10

  const byCategory = (["work", "health", "learning", "rest", "other"] as Category[]).map(c => {
    const mins = tasks.filter(t => t.category === c).reduce((s, t) => s + (t.duration || 0), 0)
    return { cat: c, mins, pct: plannedMinsToday > 0 ? Math.round((mins / plannedMinsToday) * 100) : 0 }
  })

  // ===== Scheduling warnings =====
  const overScheduled = plannedHours > 14
  const underScheduled = plannedHours < 4 && totalCount >= 0

  // ===== Suggestions =====
  const suggestions = useMemo(() => {
    const out: { icon: any; text: string; tone: "info" | "warn" | "good" }[] = []

    if (peakFocusRange) {
      const hiPriWork = tasks.filter(t => t.category === "work" && t.priority === "high" && !t.done)
      const anyInPeak = hiPriWork.some(t => {
        if (!t.time) return false
        const [h] = t.time.split(":").map(Number)
        return peakFocusHour !== null && h >= peakFocusHour && h < peakFocusHour + 2
      })
      if (hiPriWork.length > 0 && !anyInPeak) {
        out.push({ icon: Zap, tone: "info", text: `Your focus peaks ${peakFocusRange} — schedule deep work then` })
      } else if (hiPriWork.length === 0) {
        out.push({ icon: Brain, tone: "info", text: `Peak focus window ${peakFocusRange} is open — slot a high-priority task` })
      }
    }

    if (daysSinceExercise !== null && daysSinceExercise >= 3) {
      const hasHealth = tasks.some(t => t.category === "health" && !t.done)
      if (!hasHealth) {
        out.push({ icon: Dumbbell, tone: "warn", text: `You haven't exercised in ${daysSinceExercise} days — add a movement block today` })
      }
    }

    if (nextReviewIn === 0) {
      out.push({ icon: Moon, tone: "info", text: "Evening review is due today" })
    } else if (nextReviewIn > 0 && nextReviewIn <= 2) {
      out.push({ icon: Moon, tone: "info", text: `Next review in ${nextReviewIn} day${nextReviewIn === 1 ? "" : "s"}` })
    }

    if (activeHabits.length > 0) {
      out.push({ icon: Sparkles, tone: "info", text: `${activeHabits.length} active habit${activeHabits.length === 1 ? "" : "s"} not yet on today's plan` })
    }

    if (timeDebt.debtMins >= 60) {
      out.push({
        icon: TrendingDown, tone: "warn",
        text: `Time debt: ${Math.round(timeDebt.debtMins / 60 * 10) / 10}h planned but unexecuted in the last 7 days`
      })
    }

    if (plannedMinsToday > 0 && byCategory.find(b => b.cat === "rest")!.mins === 0 && plannedHours >= 6) {
      out.push({ icon: Moon, tone: "info", text: "No rest blocks today — consider a short recovery window" })
    }

    return out
  }, [peakFocusRange, peakFocusHour, daysSinceExercise, nextReviewIn, activeHabits.length, timeDebt, tasks, byCategory, plannedMinsToday, plannedHours])

  // ===== Sorting for display =====
  const withTime = [...tasks].filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time))
  const withoutTime = tasks.filter(t => !t.time)

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daily Planner</h1>
            <p className="text-xs text-muted-foreground">{todayLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold", progress === 100 ? "text-emerald-600" : "text-violet-600")}>
            {completedCount}/{totalCount || 0}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Done</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-violet-500")}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">{progress}%</span>
        </div>
      )}

      {/* ===== Top stat cards ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] text-muted-foreground">Planned today</span>
          </div>
          <p className="text-lg font-bold">{plannedHours}<span className="text-[9px] text-muted-foreground ml-0.5">hrs</span></p>
          <p className="text-[9px] text-muted-foreground">{Math.round(completedMinsToday / 60 * 10) / 10}h executed</p>
        </div>

        <div className="rounded-lg border p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[10px] text-muted-foreground">Completion</span>
          </div>
          <p className="text-lg font-bold">{progress}<span className="text-[9px] text-muted-foreground ml-0.5">%</span></p>
          <p className="text-[9px] text-muted-foreground">{completedCount} of {totalCount} tasks</p>
        </div>

        <div className="rounded-lg border p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className={cn("h-3.5 w-3.5", timeDebt.debtMins >= 120 ? "text-red-500" : "text-amber-500")} />
            <span className="text-[10px] text-muted-foreground">Time debt (7d)</span>
          </div>
          <p className="text-lg font-bold">{Math.round(timeDebt.debtMins / 60 * 10) / 10}<span className="text-[9px] text-muted-foreground ml-0.5">hrs</span></p>
          <p className="text-[9px] text-muted-foreground">planned, not executed</p>
        </div>

        <div className="rounded-lg border p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[10px] text-muted-foreground">Peak focus</span>
          </div>
          <p className="text-lg font-bold">
            {peakFocusRange ?? "—"}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {peakFocusRange ? "from your focus history" : "log more focus sessions"}
          </p>
        </div>
      </div>

      {/* ===== Scheduling warnings ===== */}
      {(overScheduled || (underScheduled && totalCount > 0)) && (
        <Card className={cn("border-2", overScheduled ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30")}>
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", overScheduled ? "text-red-500" : "text-amber-500")} />
            <div className="text-xs">
              {overScheduled ? (
                <>
                  <p className="font-semibold text-red-700">Over-scheduled: {plannedHours}h planned today</p>
                  <p className="text-red-600/80 mt-0.5">More than 14 intentional hours leaves no slack for recovery, transitions, or the unexpected. Consider deferring lower-priority blocks.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-700">Under-scheduled: only {plannedHours}h of intentional time</p>
                  <p className="text-amber-600/80 mt-0.5">Below 4 intentional hours typically means drift. Add a few deliberate blocks — even short ones anchor the day.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Smart suggestions ===== */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold">Suggestions from your data</p>
            </div>
            <div className="space-y-1.5">
              {suggestions.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5",
                    s.tone === "warn" ? "bg-amber-50/40 border-amber-200" :
                    s.tone === "good" ? "bg-emerald-50/40 border-emerald-200" : "bg-muted/20"
                  )}>
                    <Icon className={cn("h-3.5 w-3.5 shrink-0",
                      s.tone === "warn" ? "text-amber-600" :
                      s.tone === "good" ? "text-emerald-600" : "text-violet-600"
                    )} />
                    <p className="text-xs flex-1">{s.text}</p>
                  </div>
                )
              })}
            </div>
            {activeHabits.length > 0 && (
              <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={importHabits}>
                <Plus className="h-3 w-3 mr-1" /> Add {activeHabits.length} active habit{activeHabits.length === 1 ? "" : "s"} to today
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== Weekly/today load by category ===== */}
      {plannedMinsToday > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-semibold">Load breakdown</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{plannedHours}h total</p>
            </div>

            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden bg-muted mb-3">
              {byCategory.filter(b => b.mins > 0).map((b, i) => (
                <div
                  key={i}
                  className={cn("h-full", CATEGORY_META[b.cat].bar)}
                  style={{ width: `${b.pct}%` }}
                  title={`${CATEGORY_META[b.cat].label}: ${b.mins}min (${b.pct}%)`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {byCategory.map(b => {
                const meta = CATEGORY_META[b.cat]
                const Icon = meta.icon
                return (
                  <div key={b.cat} className="rounded-lg border p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className={cn("h-3 w-3", meta.color)} />
                      <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                    </div>
                    <p className="text-sm font-bold">
                      {Math.round(b.mins / 60 * 10) / 10}
                      <span className="text-[9px] text-muted-foreground ml-0.5">hrs</span>
                    </p>
                    <p className="text-[9px] text-muted-foreground">{b.pct}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Add task ===== */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onBlur={() => { if (newTask) setNewCategory(inferCategory(newTask)) }}
              placeholder="What block of time needs protecting today?"
              className="flex-1 min-w-[200px]"
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-28" />
            <div className="flex items-center gap-1">
              <Input
                type="number" min={5} max={480} step={5}
                value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value))}
                className="w-20"
                aria-label="Duration in minutes"
              />
              <span className="text-[10px] text-muted-foreground">min</span>
            </div>
            <Button onClick={addTask} disabled={!newTask.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5">
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map(p => (
                <button
                  key={p} onClick={() => setNewPriority(p)}
                  className={cn("h-7 px-2 rounded-md border text-[10px] font-semibold transition-colors",
                    newPriority === p
                      ? p === "high" ? "bg-red-100 border-red-300 text-red-700"
                      : p === "medium" ? "bg-amber-100 border-amber-300 text-amber-700"
                      : "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >{p.toUpperCase()}</button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["work", "health", "learning", "rest", "other"] as Category[]).map(c => {
                const meta = CATEGORY_META[c]
                const Icon = meta.icon
                return (
                  <button
                    key={c} onClick={() => setNewCategory(c)}
                    className={cn("h-7 px-2 rounded-md border text-[10px] font-semibold flex items-center gap-1 transition-colors",
                      newCategory === c ? meta.bg + " " + meta.color : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </button>
                )
              })}
            </div>
            {peakFocusRange && newCategory === "work" && newPriority === "high" && !newTime && (
              <button
                onClick={() => setNewTime(`${String(peakFocusHour).padStart(2, "0")}:00`)}
                className="h-7 px-2 rounded-md border border-violet-300 bg-violet-50 text-violet-700 text-[10px] font-semibold flex items-center gap-1 hover:bg-violet-100"
                title="Schedule at your peak focus window"
              >
                <Zap className="h-3 w-3" /> Slot at peak ({peakFocusRange.split("–")[0]})
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== Scheduled tasks ===== */}
      {withTime.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Scheduled
          </p>
          <div className="space-y-1.5">
            {withTime.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} peakFocusHour={peakFocusHour} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Unscheduled tasks ===== */}
      {withoutTime.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Anytime</p>
          <div className="space-y-1.5">
            {withoutTime.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} peakFocusHour={peakFocusHour} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Empty state ===== */}
      {totalCount === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks for today yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start with 3 blocks: one high-priority work item, one health block, one rest window.
            </p>
            {activeHabits.length > 0 && (
              <Button variant="outline" size="sm" className="mt-4 h-8 text-xs" onClick={importHabits}>
                <Plus className="h-3 w-3 mr-1" /> Import {activeHabits.length} active habit{activeHabits.length === 1 ? "" : "s"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {progress === 100 && totalCount > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-emerald-600">All {totalCount} blocks complete</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(completedMinsToday / 60 * 10) / 10}h of intentional time executed. Rest earned.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===== Footer links ===== */}
      <div className="flex flex-wrap gap-3 text-xs">
        <a href="/daily-habits" className="text-emerald-600 hover:underline">Habits</a>
        <a href="/focus-timer" className="text-red-600 hover:underline">Focus Timer</a>
        <a href="/evening-review" className="text-indigo-600 hover:underline">Evening Review</a>
        <a href="/life-os" className="text-violet-600 hover:underline">Life OS</a>
      </div>

      {/* ===== Philosophy ===== */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>A plan is a prediction you make to yourself.</strong> Every block you assign is a vote for who you intend to be today.
            This planner connects to your actual data — your focus patterns, your habits, your exercise history — so the suggestions
            aren't generic advice, they're inferred from how you've actually lived the last seven days. Track the gap between intention
            and execution (time debt), and it shrinks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskRow({
  task, onToggle, onDelete, peakFocusHour,
}: {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  peakFocusHour: number | null
}) {
  const meta = CATEGORY_META[task.category] || CATEGORY_META.other
  const CatIcon = meta.icon
  const endTime = task.time ? addMin(task.time, task.duration) : ""
  const inPeak = task.time && peakFocusHour !== null
    ? (() => {
        const [h] = task.time.split(":").map(Number)
        return h >= peakFocusHour && h < peakFocusHour + 2
      })()
    : false

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border border-l-4 bg-card px-3 py-2 transition-all",
      PRIORITY_BORDER[task.priority],
      task.done && "opacity-50",
      inPeak && !task.done && "ring-1 ring-violet-200"
    )}>
      <button onClick={() => onToggle(task.id)} className="shrink-0" aria-label={task.done ? "Mark incomplete" : "Mark complete"}>
        {task.done ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground/30" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className={cn("text-sm truncate", task.done && "line-through text-muted-foreground")}>{task.text}</p>
          {task.source === "habit" && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] border-emerald-300 text-emerald-700 shrink-0">habit</Badge>
          )}
          {inPeak && !task.done && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] border-violet-300 text-violet-700 shrink-0 flex items-center gap-0.5">
              <Zap className="h-2 w-2" /> peak
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("inline-flex items-center gap-1 text-[10px]", meta.color)}>
            <CatIcon className="h-3 w-3" /> {meta.label}
          </span>
          <span className="text-[10px] text-muted-foreground">{task.duration} min</span>
        </div>
      </div>

      {task.time && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {task.time}{endTime && <span className="text-muted-foreground/50">–{endTime}</span>}
        </span>
      )}

      <button onClick={() => onDelete(task.id)} className="p-1 text-muted-foreground/30 hover:text-destructive shrink-0" aria-label="Delete task">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
