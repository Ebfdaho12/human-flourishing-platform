"use client"

import { useState, useEffect } from "react"
import { Sun, CheckSquare, Heart, Moon, TrendingUp, ArrowRight, Flame, CheckCircle, Circle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RhythmStep {
  label: string
  href: string
  icon: any
  color: string
  checkKey: string // localStorage key or special check
  time: string
}

const STEPS: RhythmStep[] = [
  { label: "Morning Briefing", href: "/morning-briefing", icon: Sun, color: "text-amber-500 bg-amber-50 border-amber-200", checkKey: "morning", time: "AM" },
  { label: "Daily Habits", href: "/daily-habits", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50 border-emerald-200", checkKey: "habits", time: "All day" },
  { label: "Gratitude", href: "/gratitude", icon: Heart, color: "text-rose-400 bg-rose-50 border-rose-200", checkKey: "gratitude", time: "Any time" },
  { label: "Evening Review", href: "/evening-review", icon: Moon, color: "text-indigo-500 bg-indigo-50 border-indigo-200", checkKey: "evening", time: "PM" },
]

export function DailyRhythm() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const checks: Record<string, boolean> = {}

    // Check gratitude
    try {
      const gratitude = localStorage.getItem("hfp-gratitude")
      if (gratitude) {
        const entries = JSON.parse(gratitude)
        checks.gratitude = entries.some((e: any) => e.date === today)
      }
    } catch {}

    // Check evening review
    try {
      const evening = localStorage.getItem("hfp-evening-review")
      if (evening) {
        const entries = JSON.parse(evening)
        checks.evening = entries.some((e: any) => e.date === today)
      }
    } catch {}

    // Check habits (at least 50% done)
    try {
      const habits = localStorage.getItem("hfp-daily-habits")
      if (habits) {
        const parsed = JSON.parse(habits)
        const total = parsed.length
        const done = parsed.filter((h: any) => h.completedDates?.includes(today)).length
        checks.habits = total > 0 && done >= total * 0.5
      }
    } catch {}

    // Morning = just visited today (we check via page visit tracking)
    try {
      const visited = localStorage.getItem("hfp-last-briefing")
      checks.morning = visited === today
    } catch {}

    setCompleted(checks)
  }, [today])

  const doneCount = Object.values(completed).filter(Boolean).length

  return (
    <Card className="border-violet-200/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold">Daily Rhythm</p>
          </div>
          <Badge variant="outline" className={cn("text-[9px]", doneCount === 4 ? "border-emerald-300 text-emerald-700" : "")}>{doneCount}/4 today</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon
            const done = completed[step.checkKey]
            return (
              <a key={step.href} href={step.href} className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all hover:shadow-sm", step.color, done ? "opacity-70" : "")}>
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {done && <CheckCircle className="h-3 w-3 text-emerald-500 absolute -top-1 -right-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">{step.label}</span>
                <span className="text-[8px] text-muted-foreground">{step.time}</span>
              </a>
            )
          })}
        </div>
        {doneCount === 4 && (
          <p className="text-[10px] text-emerald-600 text-center mt-2 font-medium">Daily rhythm complete. You are building something extraordinary.</p>
        )}
      </CardContent>
    </Card>
  )
}
