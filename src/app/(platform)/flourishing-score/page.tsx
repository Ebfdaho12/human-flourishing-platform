"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Sparkles, Heart, Brain, Moon, Dumbbell, Flame, Target, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { Explain } from "@/components/ui/explain"

function getToday(): string { return new Date().toISOString().split("T")[0] }

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-blue-500"
  if (score >= 40) return "text-amber-500"
  return "text-red-500"
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Thriving"
  if (score >= 80) return "Flourishing"
  if (score >= 70) return "Growing"
  if (score >= 60) return "Stable"
  if (score >= 50) return "Okay"
  if (score >= 40) return "Struggling"
  if (score >= 30) return "Low"
  return "Needs attention"
}

function ringColor(score: number): string {
  if (score >= 80) return "stroke-emerald-500"
  if (score >= 60) return "stroke-blue-500"
  if (score >= 40) return "stroke-amber-500"
  return "stroke-red-500"
}

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" className={ringColor(score)} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - filled} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={cn("text-4xl font-bold", scoreColor(score))}>{score}</p>
        <p className="text-xs text-muted-foreground">{scoreLabel(score)}</p>
      </div>
    </div>
  )
}

interface DimensionScore {
  name: string
  score: number
  weight: number
  icon: any
  color: string
  source: string
  detail: string
}

export default function FlourishingScorePage() {
  const today = getToday()
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=7", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=50", secureFetcher)
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const [history, setHistory] = useState<{ date: string; score: number; dimensions?: { mood: number; sleep: number; exercise: number; habits: number; gratitude: number; consistency: number } }[]>([])
  const [showBreakdown, setShowBreakdown] = useState(false)

  const moods = moodData?.entries || []
  const entries = healthData?.entries || []
  const streaks = streakData || {}

  // Calculate dimension scores
  const dimensions: DimensionScore[] = useMemo(() => {
    // Mood (0-100 from 1-10 scale)
    const recentMoods = moods.slice(0, 7).map((m: any) => m.score).filter(Boolean)
    const moodAvg = recentMoods.length > 0 ? recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length : 0
    const moodScore = Math.min(100, Math.round(moodAvg * 10))

    // Sleep (0-100, 7-9hrs = 100, drops off each side)
    const sleepEntries = entries.filter((e: any) => e.entryType === "SLEEP").slice(0, 7)
    let sleepScore = 0
    if (sleepEntries.length > 0) {
      const avgSleep = sleepEntries.reduce((s: number, e: any) => {
        try { return s + (JSON.parse(e.data)?.hoursSlept || 0) } catch { return s }
      }, 0) / sleepEntries.length
      if (avgSleep >= 7 && avgSleep <= 9) sleepScore = 100
      else if (avgSleep >= 6) sleepScore = 70
      else if (avgSleep >= 5) sleepScore = 40
      else sleepScore = 20
    }

    // Exercise (0-100 based on frequency)
    const exerciseThisWeek = entries.filter((e: any) => e.entryType === "EXERCISE").slice(0, 7).length
    const exerciseScore = Math.min(100, exerciseThisWeek * 20) // 5+ sessions = 100

    // Habits (0-100 from daily habits completion)
    let habitsScore = 0
    try {
      const habits = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
      if (habits.length > 0) {
        const done = habits.filter((h: any) => h.completedDates?.includes(today)).length
        habitsScore = Math.round((done / habits.length) * 100)
      }
    } catch {}

    // Gratitude (0 or 100 — did you do it today?)
    let gratitudeScore = 0
    try {
      const gratitude = JSON.parse(localStorage.getItem("hfp-gratitude") || "[]")
      if (gratitude.some((e: any) => e.date === today)) gratitudeScore = 100
      else if (gratitude.length > 0) gratitudeScore = 30 // credit for having a practice
    } catch {}

    // Consistency (streak-based)
    const maxStreak = Math.max(streaks.health || 0, streaks.mood || 0, streaks.journal || 0, streaks.platform || 0)
    const consistencyScore = Math.min(100, maxStreak * 5) // 20+ day streak = 100

    return [
      { name: "Mood", score: moodScore, weight: 25, icon: Brain, color: "text-violet-500", source: "7-day mood average", detail: recentMoods.length > 0 ? `Avg: ${(moodAvg).toFixed(1)}/10 (${recentMoods.length} entries)` : "No mood data — log your mood" },
      { name: "Sleep", score: sleepScore, weight: 25, icon: Moon, color: "text-indigo-500", source: "Recent sleep quality", detail: sleepEntries.length > 0 ? `${sleepScore >= 70 ? "Good" : "Below optimal"} sleep pattern` : "No sleep data — log your sleep" },
      { name: "Exercise", score: exerciseScore, weight: 20, icon: Dumbbell, color: "text-orange-500", source: "Exercise frequency", detail: `${exerciseThisWeek} sessions this week` },
      { name: "Habits", score: habitsScore, weight: 15, icon: Target, color: "text-emerald-500", source: "Today's habit completion", detail: `${habitsScore}% of habits done today` },
      { name: "Gratitude", score: gratitudeScore, weight: 10, icon: Heart, color: "text-rose-400", source: "Gratitude practice", detail: gratitudeScore === 100 ? "Logged today ✓" : "Not yet today" },
      { name: "Consistency", score: consistencyScore, weight: 5, icon: Flame, color: "text-orange-400", source: "Longest active streak", detail: `Best streak: ${maxStreak} days` },
    ]
  }, [moods, entries, streaks, today])

  // Composite score (weighted average)
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const compositeScore = Math.round(dimensions.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight)

  // Save to history
  useEffect(() => {
    if (compositeScore > 0) {
      try {
        const saved = JSON.parse(localStorage.getItem("hfp-flourishing-history") || "[]")
        const dimSnapshot = {
          mood: dimensions[0].score,
          sleep: dimensions[1].score,
          exercise: dimensions[2].score,
          habits: dimensions[3].score,
          gratitude: dimensions[4].score,
          consistency: dimensions[5].score,
        }
        const updated = [{ date: today, score: compositeScore, dimensions: dimSnapshot }, ...saved.filter((h: any) => h.date !== today)].slice(0, 90)
        localStorage.setItem("hfp-flourishing-history", JSON.stringify(updated))
        setHistory(updated)
      } catch {}
    }
  }, [compositeScore, today, dimensions])

  // Load history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hfp-flourishing-history") || "[]")
      setHistory(saved)
    } catch {}
  }, [])

  // 7-day trend
  const last7 = history.slice(0, 7)
  const prevAvg = last7.length >= 4 ? last7.slice(Math.floor(last7.length/2)).reduce((s, h) => s + h.score, 0) / Math.ceil(last7.length/2) : null
  const currAvg = last7.length >= 4 ? last7.slice(0, Math.floor(last7.length/2)).reduce((s, h) => s + h.score, 0) / Math.floor(last7.length/2) : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Flourishing Score</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          One <Explain tip="A composite score is a single number calculated from a weighted average of multiple dimensions — mood, sleep, exercise, habits, gratitude, and consistency">composite score</Explain> that captures how well you're doing across all dimensions of flourishing.
        </p>
      </div>

      {/* Main score ring */}
      <Card className="border-2 border-violet-200">
        <CardContent className="p-6 flex flex-col items-center">
          <ScoreRing score={compositeScore} />
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">Today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            {currAvg && prevAvg && (
              <div className="flex items-center gap-1 justify-center mt-1">
                {currAvg > prevAvg + 2 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : currAvg < prevAvg - 2 ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                <p className="text-[10px] text-muted-foreground">
                  {currAvg > prevAvg + 2 ? "Improving" : currAvg < prevAvg - 2 ? "Declining" : "Stable"} this week
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dimension breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => setShowBreakdown(!showBreakdown)} className="flex items-center gap-2 w-full text-left">
            <CardTitle className="text-base flex-1">Score Breakdown</CardTitle>
            {showBreakdown ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {showBreakdown && (
          <CardContent className="space-y-2">
            {dimensions.map((d, i) => {
              const Icon = d.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0", d.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium">{d.name}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[8px]">{d.weight}%</Badge>
                        <span className={cn("text-xs font-bold", scoreColor(d.score))}>{d.score}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", d.score >= 70 ? "bg-emerald-400" : d.score >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${d.score}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{d.detail}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {/* History — SVG line chart with gradient fill */}
      {history.length > 1 && (() => {
        const points = history.slice(0, 30).reverse()
        const w = 600
        const h = 140
        const pad = { t: 10, r: 10, b: 18, l: 28 }
        const innerW = w - pad.l - pad.r
        const innerH = h - pad.t - pad.b
        const n = points.length
        const minScore = Math.max(0, Math.min(...points.map(p => p.score)) - 5)
        const maxScore = Math.min(100, Math.max(...points.map(p => p.score)) + 5)
        const range = Math.max(1, maxScore - minScore)
        const xAt = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
        const yAt = (v: number) => pad.t + innerH - ((v - minScore) / range) * innerH
        const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.score)}`).join(" ")
        const areaPath = `${linePath} L ${xAt(n - 1)} ${pad.t + innerH} L ${xAt(0)} ${pad.t + innerH} Z`
        const firstDate = points[0]?.date
        const lastDate = points[points.length - 1]?.date
        return (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Recent History</CardTitle></CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flourishFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="flourishLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" />
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + innerH * t} y2={pad.t + innerH * t} stroke="currentColor" className="text-muted/30" strokeWidth={0.5} strokeDasharray="2 3" />
                ))}
                {/* Y axis labels */}
                {[0, 0.5, 1].map((t, i) => {
                  const val = Math.round(maxScore - (maxScore - minScore) * t)
                  return <text key={i} x={pad.l - 4} y={pad.t + innerH * t + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8">{val}</text>
                })}
                {/* Area fill */}
                <path d={areaPath} fill="url(#flourishFill)" />
                {/* Line */}
                <path d={linePath} fill="none" stroke="url(#flourishLine)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {/* Points */}
                {points.map((p, i) => (
                  <circle key={i} cx={xAt(i)} cy={yAt(p.score)} r={2} fill="rgb(139, 92, 246)">
                    <title>{p.date}: {p.score}</title>
                  </circle>
                ))}
              </svg>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>{firstDate}</span>
                <span>Today ({lastDate})</span>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Dimension trends over time — mini sparklines per dimension */}
      {history.length >= 2 && history.some(h => h.dimensions) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dimension Trends</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensions.map((d, idx) => {
              const key = d.name.toLowerCase() as "mood" | "sleep" | "exercise" | "habits" | "gratitude" | "consistency"
              const series = history
                .slice(0, 30)
                .reverse()
                .map(h => h.dimensions ? (h.dimensions as any)[key] : null)
                .filter((v): v is number => typeof v === "number")
              if (series.length < 2) return (
                <div key={idx} className="flex items-center gap-2 rounded border p-2">
                  <d.icon className={cn("h-3.5 w-3.5 shrink-0", d.color)} />
                  <span className="text-xs flex-1">{d.name}</span>
                  <span className="text-[9px] text-muted-foreground">Need more data</span>
                </div>
              )
              const sw = 120
              const sh = 28
              const sMin = Math.max(0, Math.min(...series) - 5)
              const sMax = Math.min(100, Math.max(...series) + 5)
              const sRange = Math.max(1, sMax - sMin)
              const sx = (i: number) => (i / (series.length - 1)) * sw
              const sy = (v: number) => sh - ((v - sMin) / sRange) * sh
              const sparkPath = series.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(v)}`).join(" ")
              const sparkArea = `${sparkPath} L ${sx(series.length - 1)} ${sh} L ${sx(0)} ${sh} Z`
              const first = series[0]
              const last = series[series.length - 1]
              const delta = last - first
              const trendIcon = delta > 3 ? TrendingUp : delta < -3 ? TrendingDown : Minus
              const TrendIcon = trendIcon
              const trendColor = delta > 3 ? "text-emerald-500" : delta < -3 ? "text-red-500" : "text-muted-foreground"
              const stroke = d.score >= 70 ? "rgb(16, 185, 129)" : d.score >= 40 ? "rgb(245, 158, 11)" : "rgb(239, 68, 68)"
              const fillId = `sparkFill-${idx}`
              return (
                <div key={idx} className="flex items-center gap-2 rounded border p-2">
                  <d.icon className={cn("h-3.5 w-3.5 shrink-0", d.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium">{d.name}</span>
                      <div className="flex items-center gap-1">
                        <TrendIcon className={cn("h-3 w-3", trendColor)} />
                        <span className={cn("text-[9px] font-semibold", trendColor)}>{delta > 0 ? "+" : ""}{delta}</span>
                      </div>
                    </div>
                    <svg viewBox={`0 0 ${sw} ${sh}`} className="w-full h-6" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path d={sparkArea} fill={`url(#${fillId})`} />
                      <path d={sparkPath} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> How the Score Works</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Mood (25%):</strong> Your 7-day average mood score, scaled to 0-100.</p>
            <p><strong>Sleep (25%):</strong> Based on sleep hours — 7-9hrs = 100, drops below 7 or above 9.</p>
            <p><strong>Exercise (20%):</strong> Sessions this week. 5+ = 100. Consistency matters more than intensity.</p>
            <p><strong>Habits (15%):</strong> Today's daily habits completion percentage.</p>
            <p><strong>Gratitude (10%):</strong> Did you write your gratitudes today?</p>
            <p><strong>Consistency (5%):</strong> Your longest active streak (20+ days = max).</p>
          </div>
          <p className="text-xs text-violet-700 font-medium mt-2">
            The score is <Explain tip="Weighted means some dimensions count more than others — mood and sleep have higher weight because they impact everything else">weighted</Explain> toward the fundamentals — mood and sleep account for half because they affect everything else. You don't need 100. You need consistent 70+.
          </p>
        </CardContent>
      </Card>

      {/* Quick actions based on lowest scores */}
      {compositeScore > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-emerald-900 mb-2">Raise Your Score</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {dimensions.sort((a, b) => a.score - b.score).slice(0, 3).map((d, i) => (
                <p key={i}>
                  <strong>{d.name} ({d.score}/100):</strong>{" "}
                  {d.name === "Mood" && d.score < 60 ? <a href="/mental-health" className="text-violet-600 hover:underline">Do a mood check-in →</a> : null}
                  {d.name === "Sleep" && d.score < 60 ? <a href="/sleep-optimization" className="text-indigo-600 hover:underline">Read sleep optimization →</a> : null}
                  {d.name === "Exercise" && d.score < 60 ? <a href="/health" className="text-orange-600 hover:underline">Log an exercise session →</a> : null}
                  {d.name === "Habits" && d.score < 60 ? <a href="/daily-habits" className="text-emerald-600 hover:underline">Check off your habits →</a> : null}
                  {d.name === "Gratitude" && d.score < 60 ? <a href="/gratitude" className="text-rose-600 hover:underline">Write 3 gratitudes →</a> : null}
                  {d.name === "Consistency" && d.score < 60 ? <span>Keep logging daily — streaks build automatically</span> : null}
                  {d.score >= 60 ? <span className="text-emerald-600">Looking good — keep it up</span> : null}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/trends" className="text-sm text-violet-600 hover:underline">Your Trends</a>
        <a href="/correlations" className="text-sm text-blue-600 hover:underline">Correlations</a>
        <a href="/morning-briefing" className="text-sm text-amber-600 hover:underline">Morning Briefing</a>
        <a href="/trajectory" className="text-sm text-indigo-600 hover:underline">Life Trajectory</a>
      </div>
    </div>
  )
}
