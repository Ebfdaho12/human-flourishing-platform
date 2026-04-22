"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Lightbulb, ArrowRight, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { Skeleton } from "@/components/ui/skeleton"

interface Suggestion {
  text: string
  link: string
  type: "action" | "insight" | "reminder"
}

function SmartSuggestionsSkeleton() {
  return (
    <Card className="border-violet-200/50 bg-violet-50/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-violet-200/50 bg-white/50 p-2.5">
              <Skeleton className="h-1.5 w-1.5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-3 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SmartSuggestions() {
  const { data: streaks } = useSWR("/api/streaks", secureFetcher)
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=7", secureFetcher)
  const isLoading = streaks === undefined && moodData === undefined
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [pagesVisited, setPagesVisited] = useState(0)

  useEffect(() => {
    try {
      const visited = JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]")
      setPagesVisited(visited.length)
    } catch {}
  }, [])

  if (isLoading) return <SmartSuggestionsSkeleton />

  const suggestions: Suggestion[] = []
  const today = new Date().toISOString().split("T")[0]

  // Check mood data
  const moods = moodData?.entries || []
  const todayMood = moods.find((m: any) => m.createdAt?.startsWith(today))
  const avgMood = moods.length > 0 ? moods.reduce((s: number, m: any) => s + (m.score || 0), 0) / moods.length : null

  if (!todayMood) {
    suggestions.push({ text: "Log your mood today — 30 seconds, builds self-awareness over time", link: "/mental-health", type: "action" })
  }

  if (avgMood !== null && avgMood < 5) {
    suggestions.push({ text: "Your mood has been low this week. A 5-minute breathwork session can help immediately", link: "/breathwork", type: "insight" })
  }

  // Check streaks
  if (streaks?.health === 0) {
    suggestions.push({ text: "Start a health logging streak — even one metric per day compounds into powerful insights", link: "/health", type: "action" })
  }
  if (streaks?.health >= 7 && streaks?.health < 8) {
    suggestions.push({ text: `7-day health streak! Check your trends to see what the data shows`, link: "/trends", type: "insight" })
  }

  // Check habits
  try {
    const habits = localStorage.getItem("hfp-daily-habits")
    if (!habits) {
      suggestions.push({ text: "Set up your daily habits checklist — the operating system of people who flourish", link: "/daily-habits", type: "action" })
    }
  } catch {}

  // Check gratitude
  try {
    const gratitude = localStorage.getItem("hfp-gratitude")
    if (!gratitude) {
      suggestions.push({ text: "Start a gratitude practice — 21 days rewires your brain. Takes 90 seconds.", link: "/gratitude", type: "action" })
    }
  } catch {}

  // Discovery suggestions based on pages visited
  if (pagesVisited < 10) {
    suggestions.push({ text: "Take the personalized path quiz to find the best tools for you", link: "/my-path", type: "action" })
  }
  if (pagesVisited > 20 && pagesVisited < 50) {
    suggestions.push({ text: `You've explored ${pagesVisited} pages. Check your correlations — patterns may be emerging`, link: "/correlations", type: "insight" })
  }

  // Time-based
  const hour = new Date().getHours()
  if (hour >= 20) {
    suggestions.push({ text: "Evening time — close the day with an evening review", link: "/evening-review", type: "reminder" })
  }
  if (hour >= 5 && hour < 10) {
    suggestions.push({ text: "Good morning — start with your morning briefing", link: "/morning-briefing", type: "reminder" })
  }

  const visible = suggestions.filter(s => !dismissed.has(s.text)).slice(0, 3)
  if (visible.length === 0) return null

  return (
    <Card className="border-violet-200/50 bg-violet-50/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-semibold">Suggestions for You</p>
        </div>
        <div className="space-y-2">
          {visible.map((s, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <a href={s.link} className="flex-1 flex items-center gap-2 rounded-lg border border-violet-200/50 bg-white/50 p-2.5 hover:bg-violet-50/50 transition-colors">
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.type === "action" ? "bg-emerald-500" : s.type === "insight" ? "bg-violet-500" : "bg-amber-500")} />
                <p className="text-xs flex-1">{s.text}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              </a>
              <button onClick={() => setDismissed(new Set([...dismissed, s.text]))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
