"use client"

import useSWR from "swr"
import { Target, Heart, GraduationCap, CheckCircle, Circle, Clock, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function GoalsPage() {
  const { data } = useSWR("/api/goals/all", fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading goals...</div>

  const { goals, active, completed, total } = data
  const activeGoals = goals.filter((g: any) => g.isActive && !g.completedAt)
  const completedGoals = goals.filter((g: any) => g.completedAt)
  const inactiveGoals = goals.filter((g: any) => !g.isActive && !g.completedAt)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">All Goals</h1>
        </div>
        <p className="text-sm text-muted-foreground">Unified view of every goal across all modules</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Goals</h2>
          <div className="space-y-3">
            {activeGoals.map((g: any) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-2">
            {completedGoals.map((g: any) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* No goals */}
      {total === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Set goals in any module to see them here.</p>
            <div className="flex justify-center gap-3 mt-4">
              <a href="/health" className="text-sm text-rose-600 hover:underline">Health goals →</a>
              <a href="/education" className="text-sm text-blue-600 hover:underline">Learning goals →</a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paused */}
      {inactiveGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Paused ({inactiveGoals.length})</h2>
          <div className="space-y-2 opacity-60">
            {inactiveGoals.map((g: any) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: any }) {
  const isHealth = goal.module === "HEALTH"
  const Icon = isHealth ? Heart : GraduationCap
  const color = isHealth ? "text-rose-500" : "text-blue-500"
  const isComplete = !!goal.completedAt

  return (
    <Card className={cn("card-hover", isComplete && "border-emerald-200 bg-emerald-50/20")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5", isComplete ? "text-emerald-500" : color)}>
            {isComplete ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn("text-sm font-medium", isComplete && "line-through text-muted-foreground")}>{goal.title}</p>
              <Badge variant="outline" className="text-[10px] py-0">{goal.module}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Target: {goal.target}
              {goal.deadline && ` · Due ${new Date(goal.deadline).toLocaleDateString()}`}
            </p>
            {!isComplete && goal.progress > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", isHealth ? "bg-rose-500" : "bg-blue-500")} style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
