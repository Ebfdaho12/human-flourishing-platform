"use client"

import useSWR from "swr"
import { Heart, Brain, Moon, Dumbbell, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 24
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = Math.round((current - previous) * 10) / 10
  if (Math.abs(diff) < 0.2) return <Badge variant="outline" className="text-[8px] gap-0.5"><Minus className="h-2.5 w-2.5" /> Stable</Badge>
  if (diff > 0) return <Badge variant="outline" className="text-[8px] gap-0.5 border-emerald-300 text-emerald-700"><TrendingUp className="h-2.5 w-2.5" /> +{diff}</Badge>
  return <Badge variant="outline" className="text-[8px] gap-0.5 border-red-300 text-red-600"><TrendingDown className="h-2.5 w-2.5" /> {diff}</Badge>
}

export function HealthSnapshot() {
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=14", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=100", secureFetcher)

  const moods = (moodData?.entries || []).reverse()
  const entries = (healthData?.entries || []).reverse()

  const moodScores = moods.map((m: any) => m.score).filter(Boolean)
  const sleepHours = entries.filter((e: any) => e.entryType === "SLEEP").map((e: any) => { try { return JSON.parse(e.data)?.hoursSlept || 0 } catch { return 0 } }).filter((h: number) => h > 0)
  const exerciseMins = entries.filter((e: any) => e.entryType === "EXERCISE").map((e: any) => { try { return JSON.parse(e.data)?.durationMin || 0 } catch { return 0 } }).filter((d: number) => d > 0)
  const weights = entries.filter((e: any) => e.entryType === "MEASUREMENT").map((e: any) => { try { return JSON.parse(e.data)?.weight || 0 } catch { return 0 } }).filter((w: number) => w > 0)

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null
  const trend = (arr: number[]) => {
    if (arr.length < 4) return null
    const half = Math.floor(arr.length / 2)
    return { current: avg(arr.slice(half))!, previous: avg(arr.slice(0, half))! }
  }

  const metrics = [
    { label: "Mood", value: avg(moodScores), unit: "/10", data: moodScores, color: "#8b5cf6", trend: trend(moodScores), icon: Brain, href: "/mental-health" },
    { label: "Sleep", value: avg(sleepHours), unit: "hrs", data: sleepHours, color: "#6366f1", trend: trend(sleepHours), icon: Moon, href: "/sleep-optimization" },
    { label: "Exercise", value: avg(exerciseMins), unit: "min", data: exerciseMins, color: "#f97316", trend: trend(exerciseMins), icon: Dumbbell, href: "/health" },
    { label: "Weight", value: weights.length > 0 ? weights[weights.length - 1] : null, unit: "lbs", data: weights, color: "#3b82f6", trend: trend(weights), icon: Heart, href: "/body-composition" },
  ].filter(m => m.value !== null)

  if (metrics.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Health Snapshot</p>
          <a href="/trends" className="text-[10px] text-violet-600 hover:underline flex items-center gap-1">All trends <ArrowRight className="h-3 w-3" /></a>
        </div>
        <div className={cn("grid gap-3", metrics.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <a key={i} href={m.href} className="rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                  {m.trend && <TrendBadge current={m.trend.current} previous={m.trend.previous} />}
                </div>
                <p className="text-lg font-bold">{m.value}<span className="text-[10px] text-muted-foreground ml-0.5">{m.unit}</span></p>
                <Sparkline data={m.data.slice(-14)} color={m.color} />
              </a>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
