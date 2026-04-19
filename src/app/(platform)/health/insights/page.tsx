"use client"

import { useState } from "react"
import useSWR from "swr"
import { Activity, Heart, Moon, Dumbbell, Apple, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HealthInsightsPage() {
  const [entryType, setEntryType] = useState("VITALS")
  const [periodA, setPeriodA] = useState("30")
  const [periodB, setPeriodB] = useState("60")

  const { data } = useSWR(
    `/api/health/compare?type=${entryType}&periodA=${periodA}&periodB=${periodB}`,
    fetcher
  )

  const changes = data?.changes ?? {}

  const METRIC_LABELS: Record<string, { label: string; unit: string; goodDirection: "up" | "down" | "stable" }> = {
    heartRate: { label: "Heart Rate", unit: "bpm", goodDirection: "stable" },
    systolic: { label: "BP Systolic", unit: "mmHg", goodDirection: "down" },
    diastolic: { label: "BP Diastolic", unit: "mmHg", goodDirection: "down" },
    oxygenSat: { label: "O2 Saturation", unit: "%", goodDirection: "up" },
    temperature: { label: "Temperature", unit: "°F", goodDirection: "stable" },
    durationMin: { label: "Exercise Duration", unit: "min", goodDirection: "up" },
    intensity: { label: "Exercise Intensity", unit: "/10", goodDirection: "up" },
    calories: { label: "Calories Burned", unit: "kcal", goodDirection: "up" },
    hoursSlept: { label: "Sleep Hours", unit: "hrs", goodDirection: "up" },
    quality: { label: "Sleep Quality", unit: "/10", goodDirection: "up" },
    weight: { label: "Weight", unit: "lbs", goodDirection: "stable" },
    steps: { label: "Steps", unit: "", goodDirection: "up" },
    waist: { label: "Waist", unit: "in", goodDirection: "down" },
    waterL: { label: "Water Intake", unit: "L", goodDirection: "up" },
  }

  function getChangeColor(key: string, changePct: number): string {
    const meta = METRIC_LABELS[key]
    if (!meta || Math.abs(changePct) < 2) return "text-muted-foreground"
    const isUp = changePct > 0
    if (meta.goodDirection === "up") return isUp ? "text-emerald-600" : "text-red-500"
    if (meta.goodDirection === "down") return isUp ? "text-red-500" : "text-emerald-600"
    return Math.abs(changePct) > 10 ? "text-amber-500" : "text-muted-foreground"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Health Insights</h1>
        </div>
        <p className="text-sm text-muted-foreground">Compare your health metrics across time periods</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={entryType} onValueChange={setEntryType}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VITALS">Vitals</SelectItem>
                <SelectItem value="EXERCISE">Exercise</SelectItem>
                <SelectItem value="SLEEP">Sleep</SelectItem>
                <SelectItem value="NUTRITION">Nutrition</SelectItem>
                <SelectItem value="MEASUREMENT">Measurements</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Last</span>
            <Select value={periodA} onValueChange={setPeriodA}>
              <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7d</SelectItem>
                <SelectItem value="14">14d</SelectItem>
                <SelectItem value="30">30d</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">vs previous</span>
            <Select value={periodB} onValueChange={setPeriodB}>
              <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30d</SelectItem>
                <SelectItem value="60">60d</SelectItem>
                <SelectItem value="90">90d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comparison cards */}
      {Object.keys(changes).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No data to compare for this period.</p>
            <p className="text-sm text-muted-foreground mt-1">Log more entries to see how your metrics change over time.</p>
            <a href="/health" className="inline-block mt-4 text-sm text-violet-600 hover:underline">Go to Health Intelligence →</a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(changes).map(([key, change]: [string, any]) => {
            const meta = METRIC_LABELS[key] ?? { label: key, unit: "", goodDirection: "stable" }
            const changeColor = getChangeColor(key, change.changePct)
            const isUp = change.change > 0
            const isSignificant = Math.abs(change.changePct) >= 2

            return (
              <Card key={key} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">{meta.label}</p>
                    {isSignificant ? (
                      isUp ? <TrendingUp className={cn("h-4 w-4", changeColor)} /> : <TrendingDown className={cn("h-4 w-4", changeColor)} />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current period</p>
                      <p className="text-xl font-bold">{change.current} <span className="text-xs font-normal text-muted-foreground">{meta.unit}</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previous period</p>
                      <p className="text-xl font-bold text-muted-foreground">{change.previous} <span className="text-xs font-normal">{meta.unit}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className={cn("text-sm font-bold", changeColor)}>
                      {change.change > 0 ? "+" : ""}{change.change} {meta.unit}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", changeColor)}>
                      {change.changePct > 0 ? "+" : ""}{change.changePct}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/dashboard" className="text-sm text-rose-600 hover:underline">Health Dashboard →</a>
        <a href="/digest" className="text-sm text-purple-600 hover:underline">Weekly Digest →</a>
      </div>
    </div>
  )
}
