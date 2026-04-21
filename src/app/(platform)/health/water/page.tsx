"use client"

import { useState } from "react"
import useSWR from "swr"
import { Droplets, Plus, Minus, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { secureFetcher, encryptedPost } from "@/lib/encrypted-fetch"

const fetcher = secureFetcher

const GLASS_SIZE = 0.25 // liters per glass

export default function WaterTrackerPage() {
  const { data, mutate } = useSWR("/api/health/entries?limit=100", fetcher)
  const [logging, setLogging] = useState(false)
  const [dailyGoal] = useState(2.5) // liters

  const entries: any[] = (data?.entries ?? []).filter((e: any) => e.entryType === "NUTRITION")

  // Get today's water intake
  const today = new Date().toISOString().split("T")[0]
  const todayEntries = entries.filter(e => e.recordedAt?.split("T")[0] === today)
  const todayWater = todayEntries.reduce((sum, e) => {
    const d = JSON.parse(e.data || "{}")
    return sum + (d.waterL ?? 0)
  }, 0)

  // Last 7 days
  const last7Days: { date: string; liters: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().split("T")[0]
    const dayEntries = entries.filter(e => e.recordedAt?.split("T")[0] === key)
    const liters = dayEntries.reduce((sum, e) => {
      const data = JSON.parse(e.data || "{}")
      return sum + (data.waterL ?? 0)
    }, 0)
    last7Days.push({ date: key, liters: Math.round(liters * 10) / 10 })
  }

  const weekAvg = last7Days.length > 0
    ? Math.round((last7Days.reduce((s, d) => s + d.liters, 0) / last7Days.length) * 10) / 10
    : 0

  const progress = Math.min(100, Math.round((todayWater / dailyGoal) * 100))
  const glasses = Math.round(todayWater / GLASS_SIZE)

  async function addWater(liters: number) {
    setLogging(true)
    await encryptedPost("/api/health/entries", {
        entryType: "NUTRITION",
        data: { waterL: liters },
        notes: `Water: ${liters}L`,
      })
    setLogging(false)
    mutate()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Water Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">Stay hydrated. Track every glass.</p>
      </div>

      {/* Today's progress */}
      <Card className={cn("border-2", progress >= 100 ? "border-emerald-300 bg-emerald-50/30" : "border-blue-200 bg-blue-50/20")}>
        <CardContent className="p-6 text-center">
          {/* Water circle */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg width="160" height="160" className="-rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
              <circle
                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none"
                className={progress >= 100 ? "text-emerald-500" : "text-blue-500"}
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-bold">{todayWater.toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">of {dailyGoal}L goal</p>
            </div>
          </div>

          <p className={cn("text-sm font-medium mb-4", progress >= 100 ? "text-emerald-600" : "text-blue-600")}>
            {progress >= 100 ? "Goal reached!" : `${glasses} glasses · ${progress}% of daily goal`}
          </p>

          {/* Quick add buttons */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { label: "Small glass", liters: 0.2 },
              { label: "Glass", liters: 0.25 },
              { label: "Large glass", liters: 0.35 },
              { label: "Bottle", liters: 0.5 },
              { label: "Large bottle", liters: 0.75 },
              { label: "1 Liter", liters: 1.0 },
            ].map((opt) => (
              <Button
                key={opt.label}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => addWater(opt.liters)}
                disabled={logging}
              >
                <Plus className="h-3 w-3" /> {opt.label} ({opt.liters}L)
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{weekAvg}L</p>
            <p className="text-xs text-muted-foreground">7-day average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{last7Days.filter(d => d.liters >= dailyGoal).length}/7</p>
            <p className="text-xs text-muted-foreground">Days goal met</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-day chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {last7Days.map((day) => {
              const pct = Math.min(100, (day.liters / dailyGoal) * 100)
              const met = day.liters >= dailyGoal
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t relative" style={{ height: `${Math.max(4, pct)}%` }}>
                    <div className={cn("w-full h-full rounded-t", met ? "bg-emerald-500" : "bg-blue-400")} style={{ opacity: 0.7 }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="relative mt-1">
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-blue-300" style={{ bottom: "0" }} />
            <p className="text-[10px] text-blue-400 text-right">Goal: {dailyGoal}L</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why track water?</strong> Dehydration affects concentration, mood, energy, and physical performance.
            Most adults need 2-3 liters per day. More if exercising or in hot weather.
            Chronic mild dehydration is common and easy to fix.
          </p>
        </CardContent>
      </Card>

      <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
    </div>
  )
}
