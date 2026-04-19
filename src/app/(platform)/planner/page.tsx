"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, CheckCircle, Circle, Clock, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  text: string
  time: string
  done: boolean
  priority: "low" | "medium" | "high"
}

const PRIORITY_COLORS = {
  low: "border-l-emerald-400",
  medium: "border-l-amber-400",
  high: "border-l-red-400",
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const storageKey = `hfp-planner-${new Date().toISOString().split("T")[0]}`

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) setTasks(JSON.parse(stored))
  }, [storageKey])

  function save(updated: Task[]) {
    setTasks(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  function addTask() {
    if (!newTask.trim()) return
    save([...tasks, {
      id: Date.now().toString(36),
      text: newTask.trim(),
      time: newTime || "",
      done: false,
      priority: newPriority,
    }])
    setNewTask("")
    setNewTime("")
  }

  function toggleTask(id: string) {
    save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id: string) {
    save(tasks.filter(t => t.id !== id))
  }

  const completedCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Group by time
  const withTime = tasks.filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time))
  const withoutTime = tasks.filter(t => !t.time)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daily Planner</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${progress}%` }} />
          </div>
          <span className={cn("text-sm font-bold", progress === 100 ? "text-emerald-600" : "text-violet-600")}>
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Add task */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="What needs to get done today?"
              className="flex-1"
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <Input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-28"
            />
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map(p => (
                <button key={p} onClick={() => setNewPriority(p)}
                  className={cn("h-9 w-9 rounded-lg border text-xs font-bold transition-colors",
                    newPriority === p ? (
                      p === "high" ? "bg-red-100 border-red-300 text-red-700" :
                      p === "medium" ? "bg-amber-100 border-amber-300 text-amber-700" :
                      "bg-emerald-100 border-emerald-300 text-emerald-700"
                    ) : "border-border text-muted-foreground"
                  )}>
                  {p[0].toUpperCase()}
                </button>
              ))}
            </div>
            <Button onClick={addTask} disabled={!newTask.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled tasks */}
      {withTime.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </p>
          <div className="space-y-1.5">
            {withTime.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      {/* Unscheduled tasks */}
      {withoutTime.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Anytime</p>
          <div className="space-y-1.5">
            {withoutTime.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks for today yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Plan your day. Even 3 items is enough to create focus.</p>
          </CardContent>
        </Card>
      )}

      {progress === 100 && totalCount > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-emerald-600">All done for today!</p>
            <p className="text-sm text-muted-foreground">Rest well. Tomorrow is a new day.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Tip:</strong> Start with your 3 most important tasks. If you complete those, the day is a win
            regardless of what else happens. Set times for tasks that need them, leave the rest flexible.
            Plans are stored per day — each morning starts fresh.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-l-4 bg-card px-3 py-2.5 transition-all", PRIORITY_COLORS[task.priority], task.done && "opacity-50")}>
      <button onClick={() => onToggle(task.id)} className="shrink-0">
        {task.done ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground/30" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", task.done && "line-through text-muted-foreground")}>{task.text}</p>
      </div>
      {task.time && <span className="text-xs text-muted-foreground shrink-0">{task.time}</span>}
      <button onClick={() => onDelete(task.id)} className="p-1 text-muted-foreground/30 hover:text-destructive shrink-0">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
