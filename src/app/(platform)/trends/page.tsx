"use client"

import { useState } from "react"
import useSWR from "swr"
import { TrendingUp, TrendingDown, Minus, Heart, Brain, Moon, Scale, Activity, Zap, Dumbbell, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

function MiniChart({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return <p className="text-[10px] text-muted-foreground">Need more data</p>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((val, i) => {
        const pct = ((val - min) / range) * 100
        return (
          <div key={i} className={cn("flex-1 rounded-t min-h-[2px]", color)} style={{ height: `${Math.max(4, pct)}%`, opacity: 0.7 + (i / data.length) * 0.3 }} title={`${val}`} />
        )
      })}
    </div>
  )
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (Math.abs(diff) < 0.1) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  if (diff > 0) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
}

export default function TrendsPage() {
  const [period, setPeriod] = useState("30")
  const { data: moodData } = useSWR(`/api/mental-health/mood?limit=${period}`, secureFetcher)
  const { data: healthData } = useSWR(`/api/health/entries?limit=200`, secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)

  const moods = (moodData?.entries || []).reverse()
  const healthEntries = (healthData?.entries || []).reverse()
  const streaks = streakData || {}

  // Extract time series
  const moodScores = moods.map((m: any) => m.score).filter(Boolean)
  const sleepEntries = healthEntries.filter((e: any) => e.entryType === "SLEEP")
  const sleepHours = sleepEntries.map((e: any) => { try { return JSON.parse(e.data)?.hoursSlept || 0 } catch { return 0 } }).filter((h: number) => h > 0)
  const exerciseEntries = healthEntries.filter((e: any) => e.entryType === "EXERCISE")
  const exerciseDurations = exerciseEntries.map((e: any) => { try { return JSON.parse(e.data)?.durationMin || 0 } catch { return 0 } }).filter((d: number) => d > 0)
  const weightEntries = healthEntries.filter((e: any) => e.entryType === "MEASUREMENT")
  const weights = weightEntries.map((e: any) => { try { return JSON.parse(e.data)?.weight || 0 } catch { return 0 } }).filter((w: number) => w > 0)
  const vitalEntries = healthEntries.filter((e: any) => e.entryType === "VITALS")
  const heartRates = vitalEntries.map((e: any) => { try { return JSON.parse(e.data)?.heartRate || 0 } catch { return 0 } }).filter((h: number) => h > 0)

  function avg(arr: number[]): number { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0 }
  function trend(arr: number[]): { current: number; previous: number } | null {
    if (arr.length < 4) return null
    const half = Math.floor(arr.length / 2)
    return { current: avg(arr.slice(half)), previous: avg(arr.slice(0, half)) }
  }

  const moodTrend = trend(moodScores)
  const sleepTrend = trend(sleepHours)
  const exerciseTrend = trend(exerciseDurations)
  const weightTrend = trend(weights)
  const hrTrend = trend(heartRates)

  const noData = moodScores.length === 0 && sleepHours.length === 0 && weights.length === 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Your Trends</h1>
          </div>
          <p className="text-sm text-muted-foreground">See how your metrics change over time. Trends reveal what the daily numbers can't.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {noData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">Start tracking to see trends</p>
            <p className="text-sm text-muted-foreground mt-1">Log mood, health, sleep, or exercise to unlock your personal trend dashboard.</p>
            <div className="flex gap-3 justify-center mt-4">
              <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Log mood →</a>
              <a href="/health" className="text-sm text-rose-600 hover:underline">Log health →</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mood */}
          {moodScores.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-violet-500" />
                    <p className="text-sm font-semibold">Mood</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {moodTrend && <TrendArrow current={moodTrend.current} previous={moodTrend.previous} />}
                    <p className="text-lg font-bold">{avg(moodScores)}<span className="text-xs text-muted-foreground">/10</span></p>
                    <Badge variant="outline" className="text-[8px]">{moodScores.length} entries</Badge>
                  </div>
                </div>
                <MiniChart data={moodScores.slice(-30)} color="bg-violet-400" />
                {moodTrend && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {moodTrend.current > moodTrend.previous ? "↑ Improving" : moodTrend.current < moodTrend.previous ? "↓ Declining" : "→ Stable"} — first half avg {moodTrend.previous}, second half avg {moodTrend.current}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sleep */}
          {sleepHours.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-semibold">Sleep</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sleepTrend && <TrendArrow current={sleepTrend.current} previous={sleepTrend.previous} />}
                    <p className="text-lg font-bold">{avg(sleepHours)}<span className="text-xs text-muted-foreground">hrs</span></p>
                    <Badge variant="outline" className="text-[8px]">{sleepHours.length} entries</Badge>
                  </div>
                </div>
                <MiniChart data={sleepHours.slice(-30)} color="bg-indigo-400" />
                {avg(sleepHours) < 7 && <p className="text-[10px] text-amber-600 mt-2">Below 7-hour threshold — cognitive function, emotional regulation, and immune function are all impacted.</p>}
              </CardContent>
            </Card>
          )}

          {/* Exercise */}
          {exerciseDurations.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-semibold">Exercise</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {exerciseTrend && <TrendArrow current={exerciseTrend.current} previous={exerciseTrend.previous} />}
                    <p className="text-lg font-bold">{avg(exerciseDurations)}<span className="text-xs text-muted-foreground">min</span></p>
                    <Badge variant="outline" className="text-[8px]">{exerciseDurations.length} sessions</Badge>
                  </div>
                </div>
                <MiniChart data={exerciseDurations.slice(-30)} color="bg-orange-400" />
              </CardContent>
            </Card>
          )}

          {/* Weight */}
          {weights.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-semibold">Weight</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {weightTrend && <TrendArrow current={weightTrend.current} previous={weightTrend.previous} />}
                    <p className="text-lg font-bold">{weights[weights.length - 1]}<span className="text-xs text-muted-foreground">lbs</span></p>
                    <Badge variant="outline" className="text-[8px]">{weights.length} weigh-ins</Badge>
                  </div>
                </div>
                <MiniChart data={weights.slice(-30)} color="bg-blue-400" />
                {weightTrend && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Change: {Math.round((weightTrend.current - weightTrend.previous) * 10) / 10} lbs ({weightTrend.current > weightTrend.previous ? "gaining" : "losing"})
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Heart rate */}
          {heartRates.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-semibold">Resting Heart Rate</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hrTrend && <TrendArrow current={hrTrend.previous} previous={hrTrend.current} />}
                    <p className="text-lg font-bold">{heartRates[heartRates.length - 1]}<span className="text-xs text-muted-foreground">bpm</span></p>
                  </div>
                </div>
                <MiniChart data={heartRates.slice(-30)} color="bg-red-400" />
                <p className="text-[10px] text-muted-foreground mt-2">Lower resting HR = better cardiovascular fitness. Athletes: 40-60 bpm. Average adult: 60-80 bpm.</p>
              </CardContent>
            </Card>
          )}

          {/* Streaks summary */}
          <Card className="border-orange-200 bg-orange-50/20">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> Active Streaks</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(streaks).filter(([_, v]) => typeof v === "number" && v > 0).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-lg font-bold text-orange-600">{value as number}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{key} days</p>
                  </div>
                ))}
                {Object.entries(streaks).filter(([_, v]) => typeof v === "number" && v > 0).length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-4 text-center">No active streaks. Start logging daily to build them.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/correlations" className="text-sm text-violet-600 hover:underline">Pattern Correlations</a>
        <a href="/health" className="text-sm text-rose-600 hover:underline">Health Dashboard</a>
        <a href="/mental-health" className="text-sm text-pink-600 hover:underline">Mental Health</a>
        <a href="/body-composition" className="text-sm text-blue-600 hover:underline">Body Composition</a>
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
      </div>
    </div>
  )
}
