"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass, CheckCircle, ArrowRight, Heart, Activity, AlertCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type StoredValues = { topFive: string[]; savedAt: string }
type Win = { id?: string; text?: string; title?: string; description?: string; createdAt?: string; date?: string; category?: string }
type DailyHabit = { id: string; name: string; completions?: string[]; completedDates?: string[] }
type Goal = { id: string; title?: string; name?: string }

const VALUE_KEYWORDS: Record<string, string[]> = {
  Health: ["gym", "workout", "exercise", "run", "walk", "sleep", "meal", "water", "yoga", "lift", "cardio", "health"],
  Family: ["family", "kids", "spouse", "partner", "parent", "son", "daughter", "dinner", "date night", "wife", "husband"],
  Growth: ["read", "learn", "course", "book", "skill", "practice", "study", "improve"],
  Creativity: ["write", "create", "design", "build", "make", "paint", "music", "craft", "creative"],
  Discipline: ["habit", "streak", "consistent", "daily", "routine", "commit", "followed through"],
  Courage: ["asked", "spoke up", "confronted", "risked", "brave", "hard conversation"],
  Generosity: ["gave", "helped", "donate", "volunteer", "mentored", "taught"],
  Integrity: ["honest", "truth", "kept promise", "did right", "told the truth"],
  Curiosity: ["explored", "tried", "experimented", "researched", "asked", "wondered"],
  Service: ["helped", "volunteered", "served", "supported", "community"],
  Resilience: ["pushed through", "didn't quit", "bounced back", "kept going", "overcame"],
  Patience: ["waited", "stayed calm", "listened", "didn't rush"],
  Adventure: ["travel", "trip", "explore", "new place", "journey"],
  Wisdom: ["reflected", "learned", "insight", "realized"],
  Gratitude: ["grateful", "thankful", "appreciation", "thanks"],
  Compassion: ["listened", "held space", "supported", "empathy", "kindness"],
  Community: ["community", "friends", "neighbor", "group", "gathering"],
  Freedom: ["independent", "chose", "own terms", "autonomy"],
  Nature: ["outside", "walk", "hike", "outdoors", "garden", "nature"],
  Peace: ["meditation", "breath", "stillness", "calm", "quiet"],
  Knowledge: ["read", "research", "studied", "learned"],
  Excellence: ["pr", "personal best", "mastery", "quality"],
  Purpose: ["mission", "purpose", "meaningful"],
  Security: ["saved", "paid off", "emergency fund", "insurance"],
  Balance: ["rest", "break", "time off", "boundary"],
  Empathy: ["listened", "understood", "held space"],
  Responsibility: ["kept promise", "followed through", "accountable"],
  Faith: ["prayed", "faith", "worship"],
  Simplicity: ["decluttered", "minimized", "removed", "simplified"],
  Legacy: ["wrote", "documented", "created", "built for"],
  Humor: ["laughed", "joke", "played", "fun"],
  Humility: ["apologized", "admitted", "wrong"],
  Loyalty: ["showed up", "stood by", "stayed"],
  Respect: ["listened", "honored", "acknowledged"],
  Love: ["love", "cherished", "held"],
  Honesty: ["told truth", "honest"],
  Innovation: ["new approach", "experiment", "iterated"],
  Authenticity: ["honest", "real", "myself"],
  Justice: ["fair", "stood up", "defended"],
  Independence: ["own", "alone", "self"],
}

function scoreAlignment(text: string, value: string): boolean {
  const kws = VALUE_KEYWORDS[value] ?? [value.toLowerCase()]
  const t = text.toLowerCase()
  return kws.some(k => t.includes(k))
}

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
  const [stored, setStored] = useSyncedStorage<StoredValues | null>("hfp-values", null)
  const [wins] = useSyncedStorage<Win[]>("hfp-wins", [])
  const [habits] = useSyncedStorage<DailyHabit[]>("hfp-daily-habits", [])
  const [goals] = useSyncedStorage<Goal[]>("hfp-goals", [])
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<"select" | "rank" | "results">("select")
  const [selected, setSelected] = useState<string[]>([])
  const [topFive, setTopFive] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    if (stored?.topFive?.length === 5) {
      setTopFive(stored.topFive)
      setSelected(stored.topFive)
      setStep("results")
    }
  }, [stored])

  const alignment = useMemo(() => {
    if (!stored?.topFive?.length) return null
    const weekAgo = Date.now() - 7 * 86400000
    const monthAgo = Date.now() - 30 * 86400000

    const recentWins = wins.filter(w => {
      const t = new Date(w.createdAt ?? w.date ?? "").getTime()
      return t >= monthAgo
    })
    const weekWins = recentWins.filter(w => new Date(w.createdAt ?? w.date ?? "").getTime() >= weekAgo)

    const byValue = stored.topFive.map(v => {
      const winMatches = recentWins.filter(w => scoreAlignment(`${w.text ?? ""} ${w.title ?? ""} ${w.description ?? ""}`, v))
      const habitMatches = habits.filter(h => scoreAlignment(h.name, v))
      const weekCompletions = habitMatches.reduce((s, h) => s + ((h.completions ?? h.completedDates ?? []).filter(d => new Date(d).getTime() >= weekAgo).length), 0)
      const goalMatches = goals.filter(g => scoreAlignment(`${g.title ?? ""} ${g.name ?? ""}`, v))
      const evidence = winMatches.length + weekCompletions + goalMatches.length
      return { value: v, winCount: winMatches.length, weekCompletions, goalCount: goalMatches.length, evidence, sampleWins: winMatches.slice(0, 2) }
    }).sort((a, b) => b.evidence - a.evidence)

    const total = byValue.reduce((s, v) => s + v.evidence, 0)
    const weakest = [...byValue].sort((a, b) => a.evidence - b.evidence)[0]
    const strongest = byValue[0]
    const avgPerValue = total / Math.max(1, byValue.length)
    const driftFactor = weakest && avgPerValue > 0 ? weakest.evidence / avgPerValue : 1

    return { byValue, total, weakest, strongest, avgPerValue, driftFactor, weekWinsTotal: weekWins.length, monthWinsTotal: recentWins.length }
  }, [stored, wins, habits, goals])

  const maxEvidence = alignment ? Math.max(...alignment.byValue.map(v => v.evidence), 1) : 1

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
            <Button onClick={() => { setStored({ topFive, savedAt: new Date().toISOString() }); setStep("results") }} disabled={topFive.length < 5}>
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

          {/* Alignment Audit */}
          {mounted && alignment && alignment.total > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" /> Alignment Audit — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Your stated values are detected in <span className="font-semibold text-foreground tabular-nums">{alignment.total}</span> pieces of evidence — wins, active habits, and goals that match each value&apos;s keywords. Evidence is how values become real.</p>

                <div className="space-y-1.5">
                  {alignment.byValue.map(v => (
                    <div key={v.value} className="flex items-center gap-2 text-xs">
                      <span className="w-24 font-medium">{v.value}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-500" style={{ width: `${(v.evidence / maxEvidence) * 100}%` }} />
                      </div>
                      <span className="w-24 text-right tabular-nums font-mono text-[10px] text-muted-foreground">
                        {v.winCount}w · {v.weekCompletions}h · {v.goalCount}g
                      </span>
                    </div>
                  ))}
                </div>

                {alignment.weakest && alignment.strongest && alignment.weakest.value !== alignment.strongest.value && alignment.driftFactor < 0.4 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-2.5 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900 leading-snug">
                      <strong>Drift detected.</strong> You named <span className="font-semibold">{alignment.weakest.value}</span> as a core value but there&apos;s only <span className="font-semibold tabular-nums">{alignment.weakest.evidence}</span> piece{alignment.weakest.evidence === 1 ? "" : "s"} of evidence for it this month — while <span className="font-semibold">{alignment.strongest.value}</span> has {alignment.strongest.evidence}. Either it&apos;s time to act, or it&apos;s time to admit this isn&apos;t actually a top-5 value.
                    </p>
                  </div>
                )}

                {alignment.strongest && alignment.strongest.sampleWins.length > 0 && (
                  <div className="rounded-lg border bg-white p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-600" /> Evidence of {alignment.strongest.value}</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {alignment.strongest.sampleWins.map((w, i) => (
                        <li key={i} className="truncate">&ldquo;{w.text ?? w.title ?? w.description ?? ""}&rdquo;</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground italic">
                  Keyword detection matches wins, habits, and goals to each value. Broad keywords — accuracy improves with more logged data.
                </p>
              </CardContent>
            </Card>
          )}

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
