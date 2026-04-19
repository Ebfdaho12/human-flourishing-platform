"use client"

import { useState } from "react"
import { Sun, Moon, Coffee, Dumbbell, BookOpen, Brain, Heart, Droplets, Apple, Pill, Clock, Plus, X, GripVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ROUTINE_TEMPLATES = {
  morning: {
    name: "Morning Routine",
    icon: Sun,
    color: "from-amber-500 to-orange-500",
    items: [
      { time: "6:00", activity: "Wake up — no phone for 30 minutes", icon: Sun, category: "mindset" },
      { time: "6:05", activity: "Drink a full glass of water", icon: Droplets, category: "health" },
      { time: "6:10", activity: "5 minutes of stretching or yoga", icon: Dumbbell, category: "exercise" },
      { time: "6:15", activity: "Gratitude journal — 3 things", icon: Heart, category: "mental" },
      { time: "6:20", activity: "Cold shower (30 seconds cold at end)", icon: Droplets, category: "health" },
      { time: "6:30", activity: "Healthy breakfast", icon: Apple, category: "nutrition" },
      { time: "6:45", activity: "10 minutes of reading or learning", icon: BookOpen, category: "education" },
      { time: "7:00", activity: "Set 3 intentions for the day", icon: Brain, category: "mindset" },
    ],
  },
  evening: {
    name: "Evening Routine",
    icon: Moon,
    color: "from-indigo-500 to-violet-500",
    items: [
      { time: "20:00", activity: "No screens — dim the lights", icon: Moon, category: "sleep" },
      { time: "20:15", activity: "Review the day — what went well?", icon: Brain, category: "mental" },
      { time: "20:30", activity: "Light stretching or foam rolling", icon: Dumbbell, category: "exercise" },
      { time: "20:45", activity: "Read for 20 minutes", icon: BookOpen, category: "education" },
      { time: "21:05", activity: "Breathing exercise (box breathing)", icon: Heart, category: "mental" },
      { time: "21:15", activity: "Prepare tomorrow's priorities", icon: Brain, category: "mindset" },
      { time: "21:30", activity: "In bed — room cool, dark, quiet", icon: Moon, category: "sleep" },
    ],
  },
  fitness: {
    name: "Fitness Day",
    icon: Dumbbell,
    color: "from-orange-500 to-red-500",
    items: [
      { time: "Morning", activity: "5 minute dynamic warm-up", icon: Dumbbell, category: "exercise" },
      { time: "Morning", activity: "Strength training (30-45 min)", icon: Dumbbell, category: "exercise" },
      { time: "After", activity: "Protein-rich meal within 1 hour", icon: Apple, category: "nutrition" },
      { time: "Midday", activity: "10 minute walk outside", icon: Sun, category: "exercise" },
      { time: "Afternoon", activity: "Hydrate — aim for 2L by now", icon: Droplets, category: "health" },
      { time: "Evening", activity: "Light stretching or foam rolling", icon: Dumbbell, category: "exercise" },
      { time: "Evening", activity: "Log workout in Health module", icon: Heart, category: "tracking" },
    ],
  },
  focus: {
    name: "Deep Focus Day",
    icon: Brain,
    color: "from-violet-500 to-purple-500",
    items: [
      { time: "Morning", activity: "Define the ONE most important task", icon: Brain, category: "mindset" },
      { time: "Morning", activity: "Phone on airplane mode", icon: Brain, category: "mindset" },
      { time: "Morning", activity: "90 minute deep work block", icon: Clock, category: "work" },
      { time: "Break", activity: "10 minute walk — no phone", icon: Sun, category: "exercise" },
      { time: "Midday", activity: "Healthy lunch — no screen", icon: Apple, category: "nutrition" },
      { time: "Afternoon", activity: "Second 90 minute deep work block", icon: Clock, category: "work" },
      { time: "Afternoon", activity: "Review progress and adjust", icon: Brain, category: "mindset" },
      { time: "Evening", activity: "Complete shutdown — no work thoughts", icon: Moon, category: "mental" },
    ],
  },
  learning: {
    name: "Learning Day",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    items: [
      { time: "Morning", activity: "Choose today's learning topic", icon: BookOpen, category: "education" },
      { time: "Morning", activity: "30 min AI tutoring session", icon: Brain, category: "education" },
      { time: "Midday", activity: "Take notes — write, don't type", icon: BookOpen, category: "education" },
      { time: "Afternoon", activity: "Teach what you learned to someone (or write it down)", icon: Brain, category: "education" },
      { time: "Afternoon", activity: "Find 2 opposing viewpoints on the topic", icon: BookOpen, category: "education" },
      { time: "Evening", activity: "Spaced repetition — review yesterday's notes", icon: Brain, category: "education" },
      { time: "Evening", activity: "Log session in Education module", icon: BookOpen, category: "tracking" },
    ],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  health: "bg-rose-100 text-rose-600",
  exercise: "bg-orange-100 text-orange-600",
  nutrition: "bg-green-100 text-green-600",
  mental: "bg-pink-100 text-pink-600",
  mindset: "bg-violet-100 text-violet-600",
  education: "bg-blue-100 text-blue-600",
  sleep: "bg-indigo-100 text-indigo-600",
  work: "bg-slate-100 text-slate-600",
  tracking: "bg-emerald-100 text-emerald-600",
}

export default function RoutinePage() {
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  function toggleItem(index: number) {
    const next = new Set(checkedItems)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    setCheckedItems(next)
  }

  const routine = selectedRoutine ? ROUTINE_TEMPLATES[selectedRoutine as keyof typeof ROUTINE_TEMPLATES] : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daily Routines</h1>
        </div>
        <p className="text-sm text-muted-foreground">Pre-built routines based on science. Check off as you go.</p>
      </div>

      {!routine ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ROUTINE_TEMPLATES).map(([key, r]) => {
            const Icon = r.icon
            return (
              <Card key={key} className="card-hover cursor-pointer" onClick={() => { setSelectedRoutine(key); setCheckedItems(new Set()) }}>
                <CardContent className="p-5">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white mb-3", r.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{r.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.items.length} steps</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[...new Set(r.items.map(i => i.category))].map(cat => (
                      <Badge key={cat} variant="outline" className="text-[9px]">{cat}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedRoutine(null)}>← All routines</Button>
            <p className="text-sm text-muted-foreground">
              {checkedItems.size}/{routine.items.length} complete
            </p>
          </div>

          <Card className={cn("bg-gradient-to-r text-white", routine.color)}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{routine.name}</h2>
                <p className="text-white/70 text-sm">{routine.items.length} steps</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{Math.round((checkedItems.size / routine.items.length) * 100)}%</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {routine.items.map((item, i) => {
              const Icon = item.icon
              const checked = checkedItems.has(i)
              return (
                <Card
                  key={i}
                  className={cn("card-hover cursor-pointer transition-all", checked && "opacity-60")}
                  onClick={() => toggleItem(i)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      checked ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
                    )}>
                      {checked && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", CATEGORY_COLORS[item.category] ?? "bg-muted")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", checked && "line-through text-muted-foreground")}>{item.activity}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {checkedItems.size === routine.items.length && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-emerald-600">Routine Complete!</p>
                <p className="text-sm text-muted-foreground">Consistency is the compound interest of self-improvement.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science of routines:</strong> Research shows that 40-45% of daily actions are habits, not conscious
            decisions (Duke University, 2006). Building a morning routine reduces decision fatigue and sets the tone for
            the entire day. Evening routines improve sleep quality by 65% (Journal of Clinical Sleep Medicine). Start with
            one routine, master it, then add more.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
