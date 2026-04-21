"use client"

import { useState } from "react"
import useSWR from "swr"
import { Moon, Sun, Calendar, Clock, TrendingUp, BarChart3, Sparkles, AlertTriangle, Dumbbell, Brain, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { secureFetcher } from "@/lib/encrypted-fetch"

const fetcher = secureFetcher

const INSIGHT_ICONS: Record<string, any> = { positive: TrendingUp, warning: AlertTriangle, neutral: Lightbulb }
const INSIGHT_COLORS: Record<string, string> = { positive: "border-emerald-200 bg-emerald-50/20 text-emerald-700", warning: "border-amber-200 bg-amber-50/20 text-amber-700", neutral: "border-blue-200 bg-blue-50/20 text-blue-700" }

const MOON_EMOJIS: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓",
  "Waxing Gibbous": "🌔", "Full Moon": "🌕", "Waning Gibbous": "🌖",
  "Last Quarter": "🌗", "Waning Crescent": "🌘",
}

export default function CorrelationsPage() {
  const [days, setDays] = useState("90")
  const { data } = useSWR(`/api/correlations?days=${days}`, fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading correlations...</div>

  const { currentMoon, moonCorrelations, dayCorrelations, seasonCorrelations, hourActivity, sleepMoodCorrelation, dataPoints, insights, exerciseMoodDelta, exerciseDayCount, restDayCount } = data

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Moon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Pattern Correlations</h1>
          </div>
          <p className="text-sm text-muted-foreground">Discover patterns between your mood, health, and environmental factors</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="180">6 months</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dataPoints < 5 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Moon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">Not enough data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete at least 5 mood check-ins to see correlations. You have {dataPoints} so far.</p>
            <a href="/mental-health" className="inline-block mt-4 text-sm text-violet-600 hover:underline">Do a mood check-in →</a>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current moon */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-4xl">{MOON_EMOJIS[currentMoon.phase] ?? "🌙"}</span>
              <div>
                <p className="font-semibold">{currentMoon.phase}</p>
                <p className="text-xs text-muted-foreground">Current moon phase · {currentMoon.illumination}% illumination</p>
              </div>
            </CardContent>
          </Card>

          {/* Smart Insights */}
          {insights && insights.length > 0 && (
            <Card className="border-2 border-violet-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-500" /> Your Personal Insights
                </CardTitle>
                <CardDescription>Patterns discovered from your data — the platform is learning about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.map((insight: any, i: number) => {
                  const Icon = INSIGHT_ICONS[insight.type] || Lightbulb
                  return (
                    <div key={i} className={cn("rounded-lg border p-3 flex items-start gap-3", INSIGHT_COLORS[insight.type])}>
                      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs leading-relaxed">{insight.text}</p>
                        <Badge variant="outline" className="text-[8px] mt-1">{insight.confidence} confidence</Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Exercise vs Mood */}
          {exerciseMoodDelta !== null && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-orange-500" /> Exercise vs Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={cn("text-4xl font-bold", exerciseMoodDelta > 0.3 ? "text-emerald-600" : exerciseMoodDelta < -0.3 ? "text-red-500" : "text-muted-foreground")}>
                    {exerciseMoodDelta > 0 ? "+" : ""}{exerciseMoodDelta}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mood difference on exercise days vs rest days
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {exerciseDayCount} exercise days and {restDayCount} rest days
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moon phase vs mood */}
          {moonCorrelations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" /> Moon Phase vs Mood
                </CardTitle>
                <CardDescription>Your average mood during each moon phase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moonCorrelations.map((mc: any) => (
                    <div key={mc.phase} className="flex items-center gap-3">
                      <span className="text-lg w-6">{MOON_EMOJIS[mc.phase] ?? "🌙"}</span>
                      <span className="text-sm w-32 shrink-0">{mc.phase}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          style={{ width: `${(mc.avgMood / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-10 text-right">{mc.avgMood}</span>
                      <span className="text-xs text-muted-foreground w-8">({mc.entries})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day of week */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" /> Day of Week vs Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-24">
                {dayCorrelations.map((dc: any) => {
                  const height = dc.avgMood ? (dc.avgMood / 10) * 100 : 0
                  return (
                    <div key={dc.day} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs font-bold">{dc.avgMood ?? "—"}</p>
                      <div className="w-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${Math.max(4, height)}%`, opacity: dc.entries > 0 ? 0.8 : 0.2 }} />
                      <span className="text-[9px] text-muted-foreground">{dc.day.slice(0, 3)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Season */}
          {seasonCorrelations.some((s: any) => s.entries > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" /> Seasonal Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {seasonCorrelations.map((sc: any) => (
                    <div key={sc.season} className="text-center p-3 rounded-lg border border-border/50">
                      <p className="text-lg">{sc.season === "Spring" ? "🌱" : sc.season === "Summer" ? "☀️" : sc.season === "Fall" ? "🍂" : "❄️"}</p>
                      <p className="text-lg font-bold mt-1">{sc.avgMood ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{sc.season}</p>
                      <p className="text-[10px] text-muted-foreground">{sc.entries} entries</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sleep vs mood */}
          {sleepMoodCorrelation !== null && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Sleep vs Mood Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={cn("text-4xl font-bold", sleepMoodCorrelation > 0.3 ? "text-emerald-600" : sleepMoodCorrelation < -0.3 ? "text-red-500" : "text-muted-foreground")}>
                    {sleepMoodCorrelation > 0 ? "+" : ""}{sleepMoodCorrelation}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.abs(sleepMoodCorrelation) > 0.5 ? "Strong" : Math.abs(sleepMoodCorrelation) > 0.3 ? "Moderate" : "Weak"} {sleepMoodCorrelation > 0 ? "positive" : "negative"} correlation
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {sleepMoodCorrelation > 0.3
                      ? "More sleep tends to correlate with better mood for you."
                      : sleepMoodCorrelation < -0.3
                        ? "Interesting — more sleep correlates with lower mood. Could be oversleeping?"
                        : "Sleep and mood don't show a strong pattern yet. Keep logging for more data."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on {data.sleepMoodPairs} paired data points</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity by hour */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" /> When You Log
              </CardTitle>
              <CardDescription>Your check-in patterns by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-[2px] h-16">
                {hourActivity.map((h: any) => {
                  const max = Math.max(...hourActivity.map((x: any) => x.count))
                  const pct = max > 0 ? (h.count / max) * 100 : 0
                  return (
                    <div
                      key={h.hour}
                      className="flex-1 rounded-t bg-gradient-to-t from-purple-500 to-violet-400"
                      style={{ height: `${Math.max(2, pct)}%`, opacity: h.count > 0 ? 0.7 : 0.1 }}
                      title={`${h.label}: ${h.count} check-ins`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> {data.disclaimer} These correlations become more meaningful with more data.
            The more you log, the clearer the patterns become. Ancient civilizations tracked these same patterns
            for thousands of years — now you can too, with data.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/mental-health" className="text-sm text-pink-600 hover:underline">← Mental Health</a>
        <a href="/health" className="text-sm text-rose-600 hover:underline">Health Intelligence →</a>
      </div>
    </div>
  )
}
