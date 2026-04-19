"use client"

import useSWR from "swr"
import { Flame, CheckCircle, Circle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function StreakWidget() {
  const { data } = useSWR("/api/streaks", fetcher)

  if (!data) return null

  const { streaks, checklist, dailyProgress, dailyTotal } = data
  const pct = dailyTotal > 0 ? Math.round((dailyProgress / dailyTotal) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Streak + daily progress */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current streak */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className={cn("h-5 w-5", streaks.overall.current > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          <p className="text-3xl font-bold text-orange-500">{streaks.overall.current}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {streaks.overall.current === 1 ? "day" : "days"} · Best: {streaks.overall.longest}
          </p>
        </div>

        {/* Daily progress */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className={cn("h-5 w-5", pct === 100 ? "text-amber-500" : "text-muted-foreground/30")} />
            <p className="text-xs text-muted-foreground">Today's Progress</p>
          </div>
          <p className={cn("text-3xl font-bold", pct === 100 ? "text-emerald-500" : pct > 0 ? "text-amber-500" : "text-muted-foreground")}>
            {dailyProgress}/{dailyTotal}
          </p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-amber-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily checklist */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Daily Checklist</p>
        <div className="space-y-2">
          {checklist.map((item: any) => (
            <a
              key={item.label}
              href={`/${item.module}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                item.done ? "text-muted-foreground" : "hover:bg-muted/50"
              )}
            >
              {item.done ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              <span className={cn(item.done && "line-through")}>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
