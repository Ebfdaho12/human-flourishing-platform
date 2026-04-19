"use client"

import useSWR from "swr"
import { Heart, Activity, Moon, Dumbbell, Apple, Ruler, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-[1px] h-8">
      {data.slice(-14).map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${Math.max(8, ((v - min) / range) * 100)}%`,
            backgroundColor: color,
            opacity: 0.5 + (i / data.length) * 0.5,
            minWidth: 2,
          }}
        />
      ))}
    </div>
  )
}

function TrendArrow({ values }: { values: number[] }) {
  if (values.length < 2) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length)
  const earlier = values.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, values.length)
  if (recent > earlier * 1.05) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  if (recent < earlier * 0.95) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function HealthDashboardPage() {
  const { data: vitals } = useSWR("/api/health/trends?type=VITALS&days=30", fetcher)
  const { data: exercise } = useSWR("/api/health/trends?type=EXERCISE&days=30", fetcher)
  const { data: sleep } = useSWR("/api/health/trends?type=SLEEP&days=30", fetcher)
  const { data: nutrition } = useSWR("/api/health/trends?type=NUTRITION&days=30", fetcher)
  const { data: measurements } = useSWR("/api/health/trends?type=MEASUREMENT&days=30", fetcher)

  const cards: {
    title: string; icon: any; color: string; bgColor: string;
    value: string | null; unit: string; trend: number[]; chartColor: string;
  }[] = []

  // Heart rate
  if (vitals?.summary?.heartRate) {
    const s = vitals.summary.heartRate
    cards.push({
      title: "Heart Rate", icon: Activity, color: "text-rose-500", bgColor: "from-rose-50 to-red-50",
      value: `${s.latest}`, unit: "bpm",
      trend: vitals.points.map((p: any) => p.heartRate).filter(Boolean),
      chartColor: "#f43f5e",
    })
  }

  // Blood pressure
  if (vitals?.summary?.systolic) {
    const s = vitals.summary.systolic
    const d = vitals.summary.diastolic
    cards.push({
      title: "Blood Pressure", icon: Heart, color: "text-red-500", bgColor: "from-red-50 to-orange-50",
      value: d ? `${s.latest}/${d.latest}` : `${s.latest}`, unit: "mmHg",
      trend: vitals.points.map((p: any) => p.systolic).filter(Boolean),
      chartColor: "#ef4444",
    })
  }

  // O2 saturation
  if (vitals?.summary?.oxygenSat) {
    const s = vitals.summary.oxygenSat
    cards.push({
      title: "O2 Saturation", icon: Activity, color: "text-cyan-500", bgColor: "from-cyan-50 to-blue-50",
      value: `${s.latest}`, unit: "%",
      trend: vitals.points.map((p: any) => p.oxygenSat).filter(Boolean),
      chartColor: "#06b6d4",
    })
  }

  // Exercise duration
  if (exercise?.summary?.durationMin) {
    const s = exercise.summary.durationMin
    cards.push({
      title: "Exercise", icon: Dumbbell, color: "text-orange-500", bgColor: "from-orange-50 to-amber-50",
      value: `${s.latest}`, unit: "min",
      trend: exercise.points.map((p: any) => p.durationMin).filter(Boolean),
      chartColor: "#f97316",
    })
  }

  // Calories burned
  if (exercise?.summary?.calories) {
    const s = exercise.summary.calories
    cards.push({
      title: "Calories Burned", icon: Dumbbell, color: "text-amber-500", bgColor: "from-amber-50 to-yellow-50",
      value: `${s.latest}`, unit: "kcal",
      trend: exercise.points.map((p: any) => p.calories).filter(Boolean),
      chartColor: "#f59e0b",
    })
  }

  // Sleep
  if (sleep?.summary?.hoursSlept) {
    const s = sleep.summary.hoursSlept
    cards.push({
      title: "Sleep", icon: Moon, color: "text-indigo-500", bgColor: "from-indigo-50 to-violet-50",
      value: `${s.latest}`, unit: "hours",
      trend: sleep.points.map((p: any) => p.hoursSlept).filter(Boolean),
      chartColor: "#6366f1",
    })
  }

  // Sleep quality
  if (sleep?.summary?.quality) {
    const s = sleep.summary.quality
    cards.push({
      title: "Sleep Quality", icon: Moon, color: "text-violet-500", bgColor: "from-violet-50 to-purple-50",
      value: `${s.latest}`, unit: "/10",
      trend: sleep.points.map((p: any) => p.quality).filter(Boolean),
      chartColor: "#8b5cf6",
    })
  }

  // Weight
  if (measurements?.summary?.weight) {
    const s = measurements.summary.weight
    cards.push({
      title: "Weight", icon: Ruler, color: "text-cyan-500", bgColor: "from-cyan-50 to-teal-50",
      value: `${s.latest}`, unit: "lbs",
      trend: measurements.points.map((p: any) => p.weight).filter(Boolean),
      chartColor: "#06b6d4",
    })
  }

  // Steps
  if (measurements?.summary?.steps) {
    const s = measurements.summary.steps
    cards.push({
      title: "Steps", icon: Ruler, color: "text-emerald-500", bgColor: "from-emerald-50 to-green-50",
      value: s.latest.toLocaleString(), unit: "",
      trend: measurements.points.map((p: any) => p.steps).filter(Boolean),
      chartColor: "#10b981",
    })
  }

  // Calories consumed
  if (nutrition?.summary?.calories) {
    const s = nutrition.summary.calories
    cards.push({
      title: "Calories Intake", icon: Apple, color: "text-green-500", bgColor: "from-green-50 to-emerald-50",
      value: `${s.latest}`, unit: "kcal",
      trend: nutrition.points.map((p: any) => p.calories).filter(Boolean),
      chartColor: "#22c55e",
    })
  }

  // Water
  if (nutrition?.summary?.waterL) {
    const s = nutrition.summary.waterL
    cards.push({
      title: "Water", icon: Apple, color: "text-blue-500", bgColor: "from-blue-50 to-indigo-50",
      value: `${s.latest}`, unit: "L",
      trend: nutrition.points.map((p: any) => p.waterL).filter(Boolean),
      chartColor: "#3b82f6",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">All your vitals at a glance — 30-day trends</p>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No health data yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start logging vitals, exercise, sleep, and nutrition to see your dashboard populate.
            </p>
            <a href="/health" className="inline-block mt-4 text-sm text-violet-600 hover:underline">
              Go to Health Intelligence →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className={cn("card-hover bg-gradient-to-br", card.bgColor)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", card.color)} />
                      <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                    </div>
                    <TrendArrow values={card.trend} />
                  </div>
                  <p className="text-2xl font-bold">
                    {card.value}<span className="text-sm font-normal text-muted-foreground ml-1">{card.unit}</span>
                  </p>
                  <div className="mt-3">
                    <MiniChart data={card.trend} color={card.chartColor} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Back to Health Intelligence</a>
        <a href="/health/cases" className="text-sm text-emerald-600 hover:underline">Anonymous Cases →</a>
      </div>
    </div>
  )
}
