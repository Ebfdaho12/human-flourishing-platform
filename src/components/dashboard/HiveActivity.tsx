"use client"

import { useState, useEffect } from "react"
import { Users, Heart, Brain, Dumbbell, Droplets, Flame, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * HiveActivity — Social proof component that shows what the community is doing
 *
 * Creates the "I'm not alone" feeling. Shows simulated aggregate activity
 * that makes individual actions feel like part of something larger.
 * Real aggregate data will replace simulated data as user base grows.
 *
 * Psychology: Social proof (Cialdini) + belonging (Maslow) + positive peer pressure
 */

interface ActivityPulse {
  icon: any
  text: string
  color: string
  count: number
}

function getTimeBasedActivities(): ActivityPulse[] {
  const hour = new Date().getHours()
  const dayOfWeek = new Date().getDay()

  // Simulate realistic daily patterns
  const base = 47 + (dayOfWeek === 0 || dayOfWeek === 6 ? -10 : 0) // fewer on weekends

  const activities: ActivityPulse[] = []

  if (hour >= 5 && hour < 12) {
    activities.push({ icon: Brain, text: "people did their morning briefing today", color: "text-amber-500", count: base + Math.floor(Math.random() * 20) })
    activities.push({ icon: Heart, text: "mood check-ins logged this morning", color: "text-rose-500", count: base + 12 + Math.floor(Math.random() * 15) })
  }
  if (hour >= 6 && hour < 22) {
    activities.push({ icon: Dumbbell, text: "exercise sessions logged today", color: "text-orange-500", count: Math.floor(base * 0.6) + Math.floor(Math.random() * 10) })
    activities.push({ icon: Droplets, text: "people hit their water goal", color: "text-blue-500", count: Math.floor(base * 0.4) + Math.floor(Math.random() * 12) })
  }
  if (hour >= 7) {
    activities.push({ icon: Flame, text: "active streaks burning right now", color: "text-orange-500", count: base + 30 + Math.floor(Math.random() * 25) })
  }
  if (hour >= 18) {
    activities.push({ icon: TrendingUp, text: "evening reviews completed tonight", color: "text-indigo-500", count: Math.floor(base * 0.3) + Math.floor(Math.random() * 10) })
  }

  // Always show
  activities.push({ icon: Zap, text: "quests completed across the hive today", color: "text-violet-500", count: base * 4 + Math.floor(Math.random() * 50) })

  return activities.slice(0, 3) // Show max 3
}

export function HiveActivity() {
  const [activities, setActivities] = useState<ActivityPulse[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    setActivities(getTimeBasedActivities())
  }, [])

  // Rotate through activities every 5 seconds
  useEffect(() => {
    if (activities.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % activities.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [activities.length])

  if (activities.length === 0) return null

  const current = activities[currentIdx]
  if (!current) return null
  const Icon = current.icon

  return (
    <Card className="border-violet-200/30 bg-violet-50/5">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100">
          <Users className="h-4 w-4 text-violet-500" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", current.color)} />
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-bold text-foreground">~{current.count}</span> {current.text} <span className="text-[8px] opacity-50">(projected)</span>
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {activities.map((_, i) => (
            <div key={i} className={cn("h-1 w-1 rounded-full transition-all", i === currentIdx ? "bg-violet-500 w-3" : "bg-muted")} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
