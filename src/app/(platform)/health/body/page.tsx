"use client"

import useSWR from "swr"
import { Ruler, TrendingUp, TrendingDown, Minus, Scale, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: "Underweight", color: "text-blue-600", bg: "bg-blue-100" },
  { min: 18.5, max: 25, label: "Normal", color: "text-emerald-600", bg: "bg-emerald-100" },
  { min: 25, max: 30, label: "Overweight", color: "text-amber-600", bg: "bg-amber-100" },
  { min: 30, max: 100, label: "Obese", color: "text-red-600", bg: "bg-red-100" },
]

export default function BodyCompositionPage() {
  const { data } = useSWR("/api/health/body-metrics?days=365", fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading body metrics...</div>

  const { weight, bmi, waist, steps, totalMeasurements, hasData } = data

  const bmiCat = BMI_CATEGORIES.find(c => bmi.value >= c.min && bmi.value < c.max) ?? BMI_CATEGORIES[1]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Body Composition</h1>
        </div>
        <p className="text-sm text-muted-foreground">Weight, BMI, measurements, and trends over time. {totalMeasurements} measurements logged.</p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Scale className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium">No body measurements yet</p>
            <p className="text-sm text-muted-foreground mt-1">Log weight, waist, and steps from the Health Intelligence page to see your body composition trends.</p>
            <a href="/health" className="inline-block mt-4 text-sm text-violet-600 hover:underline">Go to Health Intelligence →</a>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weight.latest && (
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                <CardContent className="p-4 text-center">
                  <Scale className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
                  <p className="text-2xl font-bold text-cyan-600">{weight.latest} lbs</p>
                  <p className="text-xs text-muted-foreground">Current weight</p>
                  {weight.change !== null && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {weight.change > 0 ? <TrendingUp className="h-3 w-3 text-amber-500" /> :
                       weight.change < 0 ? <TrendingDown className="h-3 w-3 text-emerald-500" /> :
                       <Minus className="h-3 w-3 text-muted-foreground" />}
                      <span className={cn("text-xs font-medium",
                        weight.change > 0 ? "text-amber-500" : weight.change < 0 ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {weight.change > 0 ? "+" : ""}{weight.change} lbs
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {bmi.value && (
              <Card className={cn("border", bmiCat.bg.replace("bg-", "border-").replace("100", "200"))}>
                <CardContent className="p-4 text-center">
                  <Ruler className="h-5 w-5 mx-auto mb-1 text-violet-500" />
                  <p className={cn("text-2xl font-bold", bmiCat.color)}>{bmi.value}</p>
                  <p className="text-xs text-muted-foreground">BMI ({bmiCat.label})</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Height: {bmi.heightUsed}</p>
                </CardContent>
              </Card>
            )}

            {waist.latest && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 text-center">
                  <Ruler className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">{waist.latest}"</p>
                  <p className="text-xs text-muted-foreground">Waist</p>
                  {waist.change !== null && (
                    <span className={cn("text-xs", waist.change < 0 ? "text-emerald-500" : "text-amber-500")}>
                      {waist.change > 0 ? "+" : ""}{waist.change}"
                    </span>
                  )}
                </CardContent>
              </Card>
            )}

            {steps.avg && (
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="p-4 text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600">{steps.avg.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Avg steps/day</p>
                  <p className="text-[10px] text-muted-foreground">Max: {steps.max?.toLocaleString()}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weight trend */}
          {weight.weeklyTrend && weight.weeklyTrend.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weight Trend</CardTitle>
                <CardDescription>Weekly averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {weight.weeklyTrend.map((w: any, i: number) => {
                    const min = Math.min(...weight.weeklyTrend.map((x: any) => x.avg))
                    const max = Math.max(...weight.weeklyTrend.map((x: any) => x.avg))
                    const range = max - min || 1
                    const pct = ((w.avg - min) / range) * 80 + 20
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <p className="text-[10px] font-bold">{w.avg}</p>
                        <div className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-blue-400" style={{ height: `${pct}%`, opacity: 0.6 + (i / weight.weeklyTrend.length) * 0.4 }} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* BMI scale visualization */}
          {bmi.value && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">BMI Scale</CardTitle></CardHeader>
              <CardContent>
                <div className="relative h-8 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-blue-200" />
                  <div className="flex-[2.6] bg-emerald-200" />
                  <div className="flex-[2] bg-amber-200" />
                  <div className="flex-[2.8] bg-red-200" />
                </div>
                <div className="relative h-4 mt-1">
                  <div className="absolute h-4 w-0.5 bg-foreground rounded" style={{ left: `${Math.min(95, Math.max(5, ((bmi.value - 15) / 25) * 100))}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
                <div className="flex justify-between text-[10px] mt-0.5">
                  <span className="text-blue-600">Under</span>
                  <span className="text-emerald-600">Normal</span>
                  <span className="text-amber-600">Over</span>
                  <span className="text-red-600">Obese</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight stats */}
          {weight.latest && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Weight Statistics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div><p className="text-xs text-muted-foreground">First recorded</p><p className="text-lg font-bold">{weight.first} lbs</p></div>
                  <div><p className="text-xs text-muted-foreground">Latest</p><p className="text-lg font-bold">{weight.latest} lbs</p></div>
                  <div><p className="text-xs text-muted-foreground">Min</p><p className="text-lg font-bold">{weight.min} lbs</p></div>
                  <div><p className="text-xs text-muted-foreground">Max</p><p className="text-lg font-bold">{weight.max} lbs</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="border-cyan-200 bg-cyan-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> BMI is a rough screening tool, not a diagnosis. It doesn't account for muscle mass,
            bone density, age, sex, or ethnicity. Athletes often have "overweight" BMIs due to muscle. Use it as one
            data point among many, not as the final word on your health. Waist circumference is often a better
            indicator of metabolic health risk than BMI alone.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/food" className="text-sm text-green-600 hover:underline">Food Diary →</a>
        <a href="/health/exercise" className="text-sm text-orange-600 hover:underline">Exercise →</a>
      </div>
    </div>
  )
}
