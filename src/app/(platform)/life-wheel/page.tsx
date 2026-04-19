"use client"

import { useState } from "react"
import { Target, ChevronRight, BarChart3, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LIFE_AREAS = [
  { id: "health", label: "Physical Health", desc: "Energy, fitness, nutrition, sleep, vitals", color: "#f43f5e", module: "/health" },
  { id: "mental", label: "Mental Health", desc: "Mood, stress, emotional balance, resilience", color: "#ec4899", module: "/mental-health" },
  { id: "relationships", label: "Relationships", desc: "Family, friends, partner, community", color: "#f97316", module: null },
  { id: "career", label: "Career / Purpose", desc: "Work satisfaction, growth, meaning, impact", color: "#eab308", module: null },
  { id: "finances", label: "Finances", desc: "Income, savings, debt, financial security", color: "#22c55e", module: "/education/finance" },
  { id: "education", label: "Learning / Growth", desc: "Skills, knowledge, curiosity, mastery", color: "#3b82f6", module: "/education" },
  { id: "environment", label: "Environment", desc: "Living space, nature, community surroundings", color: "#06b6d4", module: "/energy" },
  { id: "fun", label: "Fun / Recreation", desc: "Hobbies, play, creativity, adventure", color: "#8b5cf6", module: null },
  { id: "spirituality", label: "Spirituality / Values", desc: "Purpose, meaning, inner peace, alignment", color: "#a855f7", module: null },
  { id: "contribution", label: "Contribution", desc: "Giving back, impact, civic participation", color: "#14b8a6", module: "/governance" },
]

export default function LifeWheelPage() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(LIFE_AREAS.map(a => [a.id, 5]))
  )
  const [showResults, setShowResults] = useState(false)

  const avgScore = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / LIFE_AREAS.length * 10) / 10
  const lowestArea = LIFE_AREAS.reduce((min, a) => scores[a.id] < scores[min.id] ? a : min, LIFE_AREAS[0])
  const highestArea = LIFE_AREAS.reduce((max, a) => scores[a.id] > scores[max.id] ? a : max, LIFE_AREAS[0])
  const balance = Math.round((1 - (Math.max(...Object.values(scores)) - Math.min(...Object.values(scores))) / 10) * 100)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Life Wheel Assessment</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Rate each area of your life from 1-10. See where you are thriving and where you need attention.
        </p>
      </div>

      {/* Wheel visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 300 300" className="w-64 h-64">
              {/* Background circles */}
              {[2, 4, 6, 8, 10].map(ring => (
                <circle key={ring} cx="150" cy="150" r={ring * 13} fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" />
              ))}
              {/* Score polygon */}
              <polygon
                points={LIFE_AREAS.map((area, i) => {
                  const angle = (i * 360 / LIFE_AREAS.length - 90) * Math.PI / 180
                  const r = scores[area.id] * 13
                  return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`
                }).join(" ")}
                fill="rgba(124, 58, 237, 0.15)"
                stroke="#7c3aed"
                strokeWidth="2"
              />
              {/* Labels */}
              {LIFE_AREAS.map((area, i) => {
                const angle = (i * 360 / LIFE_AREAS.length - 90) * Math.PI / 180
                const labelR = 140
                const x = 150 + labelR * Math.cos(angle)
                const y = 150 + labelR * Math.sin(angle)
                return (
                  <g key={area.id}>
                    <circle cx={150 + scores[area.id] * 13 * Math.cos(angle)} cy={150 + scores[area.id] * 13 * Math.sin(angle)} r="4" fill={area.color} />
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-muted-foreground font-medium">
                      {area.label.split(" / ")[0]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            {LIFE_AREAS.map(area => (
              <div key={area.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: area.color }} />
                    <span className="text-sm font-medium">{area.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: area.color }}>{scores[area.id]}/10</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{area.desc}</p>
                <Slider
                  min={1} max={10} step={1}
                  value={[scores[area.id]]}
                  onValueChange={([v]) => setScores(prev => ({ ...prev, [area.id]: v }))}
                />
              </div>
            ))}
          </div>

          <Button className="w-full mt-6" onClick={() => setShowResults(true)}>
            <BarChart3 className="h-4 w-4" /> See My Results
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-violet-600">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Overall score</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{balance}%</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </CardContent>
            </Card>
            <Card className={cn("bg-gradient-to-br", scores[lowestArea.id] <= 3 ? "from-red-50 to-orange-50 border-red-200" : "from-emerald-50 to-green-50 border-emerald-200")}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: lowestArea.color }}>{scores[lowestArea.id]}</p>
                <p className="text-xs text-muted-foreground">Lowest area</p>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Your Insights</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p><strong>Strongest area:</strong> {highestArea.label} ({scores[highestArea.id]}/10). This is your foundation — build on it.</p>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p><strong>Needs attention:</strong> {lowestArea.label} ({scores[lowestArea.id]}/10).
                  {lowestArea.module ? (
                    <> Start with the <a href={lowestArea.module} className="text-violet-600 hover:underline">{lowestArea.label} module</a>.</>
                  ) : (
                    <> Small improvements here will have the biggest impact on your overall score.</>
                  )}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p><strong>Balance score:</strong> {balance}%.
                  {balance >= 80 ? " Your life is well-balanced across areas." :
                   balance >= 60 ? " Fairly balanced, but some areas could use more attention." :
                   " There is a significant gap between your strongest and weakest areas. Focus on bringing the lowest areas up."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ranked areas */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">All Areas Ranked</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...LIFE_AREAS].sort((a, b) => scores[b.id] - scores[a.id]).map((area, i) => (
                  <div key={area.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium">{area.label}</span>
                        <span className="text-sm font-bold" style={{ color: area.color }}>{scores[area.id]}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${scores[area.id] * 10}%`, backgroundColor: area.color }} />
                      </div>
                    </div>
                    {area.module && (
                      <a href={area.module} className="text-xs text-violet-600 hover:underline shrink-0">Improve</a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>About the Life Wheel:</strong> Used by coaches and therapists worldwide, the Life Wheel helps you see
            your life holistically rather than fixating on one area. A perfectly round wheel rolls smoothly — an imbalanced
            one creates a bumpy ride. The goal is not perfection in every area, but enough balance that no single area
            drags the rest down. Retake this assessment monthly to track your progress.
          </p>
        </CardContent>
      </Card>

      <a href="/dashboard" className="text-sm text-violet-600 hover:underline block">Back to Dashboard</a>
    </div>
  )
}
