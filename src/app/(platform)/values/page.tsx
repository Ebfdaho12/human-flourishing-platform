"use client"

import { useState } from "react"
import { Compass, CheckCircle, ArrowRight, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALL_VALUES = [
  "Authenticity", "Growth", "Freedom", "Family", "Health",
  "Integrity", "Creativity", "Compassion", "Courage", "Wisdom",
  "Justice", "Adventure", "Security", "Independence", "Community",
  "Knowledge", "Love", "Purpose", "Gratitude", "Resilience",
  "Honesty", "Loyalty", "Respect", "Humility", "Generosity",
  "Innovation", "Balance", "Peace", "Excellence", "Faith",
  "Service", "Curiosity", "Simplicity", "Discipline", "Empathy",
  "Responsibility", "Patience", "Humor", "Nature", "Legacy",
]

export default function ValuesPage() {
  const [step, setStep] = useState<"select" | "rank" | "results">("select")
  const [selected, setSelected] = useState<string[]>([])
  const [topFive, setTopFive] = useState<string[]>([])

  function toggleValue(value: string) {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value))
    } else if (selected.length < 10) {
      setSelected([...selected, value])
    }
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...topFive]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setTopFive(next)
  }

  function moveDown(index: number) {
    if (index === topFive.length - 1) return
    const next = [...topFive]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setTopFive(next)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Core Values Discovery</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {step === "select" ? "Step 1: Choose up to 10 values that resonate with you." :
           step === "rank" ? "Step 2: Narrow to your top 5 and rank them." :
           "Your core values — the compass for every decision."}
        </p>
      </div>

      {step === "select" && (
        <>
          <div className="flex flex-wrap gap-2">
            {ALL_VALUES.map(value => (
              <button key={value} onClick={() => toggleValue(value)}
                className={cn("rounded-full border px-3 py-1.5 text-sm transition-all",
                  selected.includes(value)
                    ? "border-violet-400 bg-violet-100 text-violet-800 shadow-sm font-medium"
                    : "border-border hover:border-violet-200 hover:bg-violet-50/50"
                )}>
                {selected.includes(value) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                {value}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{selected.length}/10 selected</p>
          <Button onClick={() => { setTopFive(selected.slice(0, 5)); setStep("rank") }} disabled={selected.length < 5}>
            Next: Rank your top 5 <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {step === "rank" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Choose and rank your top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {topFive.map((value, i) => (
                  <div key={value} className="flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50/30 p-3">
                    <span className="text-lg font-bold text-violet-600 w-6 text-center">{i + 1}</span>
                    <span className="flex-1 font-medium">{value}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveUp(i)} className="text-xs text-muted-foreground hover:text-foreground px-1">Up</button>
                      <button onClick={() => moveDown(i)} className="text-xs text-muted-foreground hover:text-foreground px-1">Down</button>
                    </div>
                  </div>
                ))}
              </div>

              {selected.length > 5 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tap to swap in:</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.filter(v => !topFive.includes(v)).map(value => (
                      <button key={value} onClick={() => {
                        const next = [...topFive]
                        next[next.length - 1] = value
                        setTopFive(next)
                      }} className="rounded-full border border-border px-2 py-1 text-xs hover:bg-muted">{value}</button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
            <Button onClick={() => setStep("results")} disabled={topFive.length < 5}>
              See Results <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === "results" && (
        <>
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-violet-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-4">Your Core Values</h2>
              <div className="space-y-3">
                {topFive.map((value, i) => (
                  <div key={value} className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-violet-400">#{i + 1}</span>
                    <span className="text-lg font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">How to use your values:</strong></p>
              <p>When facing a difficult decision, ask: "Which option aligns most with my top values?"</p>
              <p>When something feels wrong but you cannot explain why, check if one of your values is being violated.</p>
              <p>When setting goals, ensure they serve at least one of your core values — otherwise you will lose motivation.</p>
              <p>Revisit this exercise every 6-12 months. Values evolve as you grow.</p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setStep("select"); setSelected([]); setTopFive([]) }}>Start Over</Button>
            <Button variant="outline" onClick={() => setStep("rank")}>Re-rank</Button>
          </div>
        </>
      )}

      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why values matter:</strong> Research by Dr. Brene Brown found that people who can articulate their
            core values make faster, more confident decisions and experience less regret. Values act as a personal
            constitution — when choices align with values, you feel integrity. When they conflict, you feel stress.
            Knowing your values is knowing yourself.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
