"use client"

import { useState } from "react"
import useSWR from "swr"
import { Calendar, Flame, Trophy, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LEVEL_COLORS = [
  "bg-muted",              // 0: no activity
  "bg-emerald-200",        // 1: light
  "bg-emerald-400",        // 2: moderate
  "bg-emerald-600",        // 3: active
  "bg-emerald-800",        // 4: very active
]

const LEVEL_LABELS = ["No activity", "1-2 actions", "3-5 actions", "6-10 actions", "10+ actions"]

export default function HabitsPage() {
  const [months, setMonths] = useState("3")
  const { data } = useSWR(`/api/habits?months=${months}`, fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading habit data...</div>

  const { days, stats } = data

  // Group days into weeks for the grid
  const weeks: any[][] = []
  let currentWeek: any[] = []

  // Pad start to align with day of week
  if (days.length > 0) {
    const firstDay = new Date(days[0].date).getDay()
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
  }

  for (const day of days) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push(currentWeek)
  }

  const completionRate = stats.totalDays > 0 ? Math.round((stats.activeDays / stats.totalDays) * 100) : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Habit Tracker</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your engagement history — every day, every module</p>
        </div>
        <Select value={months} onValueChange={setMonths}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 month</SelectItem>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className={cn("h-5 w-5 mx-auto mb-1", stats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
            <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{stats.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest streak</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{stats.activeDays}/{stats.totalDays}</p>
            <p className="text-xs text-muted-foreground">Active days ({completionRate}%)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <p className="text-2xl font-bold text-violet-600">{stats.totalActions}</p>
            <p className="text-xs text-muted-foreground">Total actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity Grid</CardTitle>
          <CardDescription>Like GitHub contributions — but for your life</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-[2px]" style={{ minWidth: "max-content" }}>
              {/* Day labels */}
              <div className="flex items-center gap-[2px] mb-1">
                <div className="w-8" />
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="w-3 text-center text-[9px] text-muted-foreground">{d}</div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-[2px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((day: any, di: number) => (
                      <div
                        key={di}
                        className={cn(
                          "w-3 h-3 rounded-[2px] transition-colors",
                          day ? LEVEL_COLORS[day.level] : "bg-transparent"
                        )}
                        title={day ? `${day.date}: ${day.total} actions (${day.modules.join(", ")})` : ""}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-[2px]", color)} title={LEVEL_LABELS[i]} />
            ))}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const monthMap: Record<string, { active: number; total: number; actions: number }> = {}
            for (const day of days) {
              const month = day.date.slice(0, 7)
              if (!monthMap[month]) monthMap[month] = { active: 0, total: 0, actions: 0 }
              monthMap[month].total++
              if (day.level > 0) monthMap[month].active++
              monthMap[month].actions += day.total
            }

            return (
              <div className="space-y-2">
                {Object.entries(monthMap).reverse().map(([month, data]) => {
                  const pct = Math.round((data.active / data.total) * 100)
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">
                        {new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                        {data.active}/{data.total} days
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
