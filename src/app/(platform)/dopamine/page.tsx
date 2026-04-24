"use client"

import { Brain, Zap, Smartphone, TrendingDown, TrendingUp, Sun, Timer, ShoppingCart, ArrowRight, Snowflake, Dumbbell, BookOpen, Play, Pause, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type HealthEntry = { id: string; entryType: string; loggedAt: string; data?: Record<string, unknown> }
type MoodEntry = { id: string; moodScore: number; createdAt: string }
type DailyHabit = { id: string; name: string; completions?: string[]; completedDates?: string[] }
type Reset = { id: string; type: "24h" | "48h" | "30d"; startedAt: string; endedAt?: string; completed: boolean; notes?: string }

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)

const supernormalStimuli = [
  { name: "Social media", spike: "Variable reward — same mechanism as slot machines", baseline: "Fragmented attention, anxiety, FOMO, reduced deep focus capacity" },
  { name: "Pornography", spike: "Unlimited novelty — Coolidge effect on demand", baseline: "Desensitization, escalation, reduced motivation for real-world connection" },
  { name: "Processed sugar", spike: "Rapid glucose spike triggers massive dopamine release", baseline: "Insulin resistance, energy crashes, increasing cravings over time" },
  { name: "Gambling / trading", spike: "Variable ratio reinforcement — the most addictive reward schedule known", baseline: "Compulsive behavior, financial ruin, inability to enjoy predictable rewards" },
  { name: "Drugs / alcohol", spike: "Direct neurotransmitter manipulation — 2x to 10x normal dopamine", baseline: "Physical dependence, tolerance requiring escalating doses, withdrawal" },
]

const healthyDopamine = [
  { source: "Cold exposure", boost: "+250% baseline (sustained 2-3 hrs)", color: "text-blue-700 bg-blue-50 border-blue-200", note: "Cold shower, ice bath. Sustained norepinephrine and dopamine elevation — no crash." },
  { source: "Exercise", boost: "+200% baseline", color: "text-emerald-700 bg-emerald-50 border-emerald-200", note: "Resistance training and intense cardio. Also increases dopamine receptor density over time." },
  { source: "Sunlight (AM)", boost: "+30-50% baseline", color: "text-amber-700 bg-amber-50 border-amber-200", note: "First 30 min of morning light. Sets circadian rhythm and primes dopamine circuits for the day." },
  { source: "Achievement / learning", boost: "Sustained elevation", color: "text-violet-700 bg-violet-50 border-violet-200", note: "Completing hard tasks. The dopamine comes from effort toward a goal, not the reward itself." },
  { source: "Music (with frisson)", boost: "+9-21% per peak", color: "text-rose-700 bg-rose-50 border-rose-200", note: "The chills you get from music. Dopamine release in the nucleus accumbens — same reward pathway as food and sex." },
]

export default function DopaminePage() {
  const { data: healthData } = useSWR<{ entries: HealthEntry[] }>("/api/health/entries?limit=300", secureFetcher)
  const { data: moodData } = useSWR<{ moods: MoodEntry[] }>("/api/mental-health/mood?limit=90", secureFetcher)
  const [habits] = useSyncedStorage<DailyHabit[]>("hfp-daily-habits", [])
  const [resets, setResets] = useSyncedStorage<Reset[]>("hfp-dopamine-resets", [])
  const [screenStore] = useSyncedStorage<{ logs?: { date: string; members: { hours: number }[] }[] } | Record<string, number>>("hfp-screen-time", {})
  const screenDaily = useMemo<Record<string, number>>(() => {
    if (!screenStore) return {}
    if ("logs" in screenStore && Array.isArray(screenStore.logs)) {
      const out: Record<string, number> = {}
      for (const l of screenStore.logs) {
        if (l.date && Array.isArray(l.members)) {
          const mins = l.members.reduce((s, m) => s + (m.hours ?? 0) * 60, 0)
          out[l.date] = mins
        }
      }
      return out
    }
    if (typeof screenStore === "object" && !Array.isArray(screenStore)) return screenStore as Record<string, number>
    return {}
  }, [screenStore])

  const cleanScore = useMemo(() => {
    const entries = healthData?.entries ?? []
    const weekAgo = Date.now() - 7 * 86400000
    const recent = entries.filter(e => new Date(e.loggedAt).getTime() >= weekAgo)
    const cold = recent.filter(e => /cold|ice|sauna/i.test(String(e.data?.activity ?? e.data?.type ?? ""))).length
    const exercise = recent.filter(e => e.entryType === "EXERCISE").length
    const sunlight = recent.filter(e => /sun|morning light|walk/i.test(String(e.data?.activity ?? e.data?.type ?? ""))).length
    const habitCompletions = habits.reduce((sum, h) => {
      const dates = (h.completions ?? h.completedDates ?? []).filter(d => new Date(d).getTime() >= weekAgo)
      return sum + dates.length
    }, 0)
    const moods = moodData?.moods ?? []
    const recentMoods = moods.filter(m => new Date(m.createdAt).getTime() >= weekAgo)
    const avgMood = recentMoods.length ? recentMoods.reduce((s, m) => s + m.moodScore, 0) / recentMoods.length : 0

    const parts = [
      { label: "Cold exposure", value: cold, target: 3, weight: 20, icon: Snowflake },
      { label: "Exercise", value: exercise, target: 4, weight: 25, icon: Dumbbell },
      { label: "Morning light", value: sunlight, target: 5, weight: 15, icon: Sun },
      { label: "Habit completions", value: habitCompletions, target: 25, weight: 25, icon: BookOpen },
      { label: "Mood baseline", value: avgMood, target: 7, weight: 15, icon: Brain },
    ]
    const score = parts.reduce((sum, p) => sum + Math.min(1, p.value / p.target) * p.weight, 0)
    return { score: Math.round(score), parts, avgMood: Math.round(avgMood * 10) / 10 }
  }, [healthData, moodData, habits])

  const activeReset = resets.find(r => !r.completed && !r.endedAt)
  const lastReset = resets.filter(r => r.completed).sort((a, b) => new Date(b.endedAt ?? "").getTime() - new Date(a.endedAt ?? "").getTime())[0]

  const startReset = (type: Reset["type"]) => {
    if (activeReset) return
    const r: Reset = { id: crypto.randomUUID(), type, startedAt: new Date().toISOString(), completed: false }
    setResets([...resets, r])
  }
  const endReset = (completed: boolean) => {
    if (!activeReset) return
    setResets(resets.map(r => r.id === activeReset.id ? { ...r, endedAt: new Date().toISOString(), completed } : r))
  }
  const activeHours = activeReset ? (Date.now() - new Date(activeReset.startedAt).getTime()) / 3600000 : 0

  const screenLast7 = useMemo(() => {
    const out: { day: string; mins: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      out.push({ day: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], mins: screenDaily[dayKey(d)] ?? 0 })
    }
    return out
  }, [screenDaily])
  const avgScreen = screenLast7.reduce((s, d) => s + d.mins, 0) / 7

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Dopamine & The Attention Economy</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Dopamine isn't the "pleasure molecule" — it's the motivation molecule. Understanding it changes how you see every habit, craving, and impulse you have.
        </p>
      </div>

      {/* Your Dopamine Health Score */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/40 to-orange-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600" /> Your Dopamine Health (this week)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-amber-100" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${(cleanScore.score / 100) * 201} 201`} strokeLinecap="round" className={cn(cleanScore.score >= 70 ? "text-emerald-500" : cleanScore.score >= 40 ? "text-amber-500" : "text-rose-500")} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold tabular-nums">{cleanScore.score}</span>
                <span className="text-[9px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              {cleanScore.parts.map(p => {
                const pct = Math.min(100, (p.value / p.target) * 100)
                return (
                  <div key={p.label} className="text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="flex items-center gap-1 text-muted-foreground"><p.icon className="h-3 w-3" />{p.label}</span>
                      <span className="tabular-nums font-mono text-[10px]">{typeof p.value === "number" && p.label === "Mood baseline" ? p.value.toFixed(1) : p.value}/{p.target}</span>
                    </div>
                    <div className="h-1 rounded-full bg-amber-100 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-400")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Score combines cold exposure, exercise, morning light, habit completions, and mood baseline from your actual logs — the evidence-based healthy dopamine sources.
          </p>
        </CardContent>
      </Card>

      {/* Dopamine Reset Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4 text-violet-600" /> Reset Protocols</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeReset ? (
            <div className="rounded-lg border-2 border-violet-300 bg-violet-50/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-violet-900">{activeReset.type === "24h" ? "24-Hour Reset" : activeReset.type === "48h" ? "48-Hour Reset" : "30-Day Gradual"} — in progress</p>
                  <p className="text-xs text-muted-foreground">Started {new Date(activeReset.startedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-violet-700 tabular-nums">{activeHours < 24 ? `${activeHours.toFixed(1)}h` : `${(activeHours / 24).toFixed(1)}d`}</p>
                  <p className="text-[10px] text-muted-foreground">elapsed</p>
                </div>
              </div>
              {(() => {
                const target = activeReset.type === "24h" ? 24 : activeReset.type === "48h" ? 48 : 24 * 30
                const pct = Math.min(100, (activeHours / target) * 100)
                return (
                  <div className="h-2 rounded-full bg-violet-100 overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                )
              })()}
              <div className="flex gap-2">
                <button onClick={() => endReset(true)} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5">Mark Complete</button>
                <button onClick={() => endReset(false)} className="flex-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium py-1.5">End Early</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => startReset("24h")} className="rounded-lg border p-3 hover:border-violet-300 hover:bg-violet-50/30 transition">
                <Play className="h-4 w-4 text-violet-600 mb-1" />
                <p className="text-xs font-semibold">Start 24h</p>
                <p className="text-[10px] text-muted-foreground">One day unplugged</p>
              </button>
              <button onClick={() => startReset("48h")} className="rounded-lg border p-3 hover:border-violet-300 hover:bg-violet-50/30 transition">
                <Play className="h-4 w-4 text-violet-600 mb-1" />
                <p className="text-xs font-semibold">Start 48h</p>
                <p className="text-[10px] text-muted-foreground">Full dopamine reset</p>
              </button>
              <button onClick={() => startReset("30d")} className="rounded-lg border p-3 hover:border-violet-300 hover:bg-violet-50/30 transition">
                <Play className="h-4 w-4 text-violet-600 mb-1" />
                <p className="text-xs font-semibold">Start 30d</p>
                <p className="text-[10px] text-muted-foreground">Gradual reduction</p>
              </button>
            </div>
          )}
          {resets.length > 0 && (
            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1 border-t">
              <span>Total resets: <span className="font-semibold text-foreground">{resets.filter(r => r.completed).length}</span> completed, {resets.filter(r => !r.completed && r.endedAt).length} attempted</span>
              {lastReset && <span>Last: {daysAgo(lastReset.endedAt!)}d ago</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screen time bar (if tracked) */}
      {avgScreen > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-600" /> Screen Time — last 7 days</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-16 mb-2">
              {screenLast7.map((d, i) => {
                const max = Math.max(...screenLast7.map(x => x.mins), 60)
                const h = (d.mins / max) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={cn("w-full rounded-t transition-all", d.mins > 180 ? "bg-rose-400" : d.mins > 120 ? "bg-amber-400" : "bg-emerald-400")} style={{ height: `${h}%` }} title={`${d.mins} min`} />
                    <span className="text-[9px] text-muted-foreground">{d.day}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg <span className="font-semibold text-foreground tabular-nums">{Math.round(avgScreen)} min/day</span> · {avgScreen > 180 ? "consider a reset — over 3hrs/day correlates with attention fragmentation" : avgScreen > 120 ? "moderate use — protect deep work blocks" : "healthy range — you are in control"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* What dopamine actually is */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-amber-600" /> What Dopamine Actually Is</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Dopamine drives wanting, not liking.</strong> It's a <Explain tip="A neurotransmitter is a chemical messenger that brain cells use to communicate with each other">neurotransmitter</Explain> released in anticipation of reward, not during the reward itself. This is why scrolling feels compelling but leaves you empty — the promise of something interesting keeps you going, but the payoff never satisfies.</p>
          <p><strong>Your <Explain tip="The resting level of dopamine in your brain. Higher baseline = more motivation, drive, and enjoyment of everyday life. Lower baseline = everything feels flat and boring.">dopamine baseline</Explain> determines your daily experience.</strong> High baseline: motivated, focused, enjoying ordinary things. Low baseline: bored, restless, needing stronger stimuli to feel anything. Every supernormal stimulus that spikes dopamine above baseline causes a proportional drop BELOW baseline afterward.</p>
          <p><strong>The pleasure-pain balance</strong> (Anna Lembke, <em>Dopamine Nation</em>): Your brain maintains homeostasis. Every spike is followed by a dip. The more intense and frequent the spikes, the lower your baseline drops. This is the mechanism behind <Explain tip="When your brain adapts to a stimulus so you need more and more of it to feel the same effect">tolerance</Explain> — and it applies to behavior, not just substances.</p>
        </CardContent>
      </Card>

      {/* Supernormal Stimuli */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> <Explain tip="Artificially amplified versions of natural rewards. Like how junk food is a supernormal version of natural food — it hijacks circuits designed for survival.">Supernormal Stimuli</Explain> That Lower Your Baseline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {supernormalStimuli.map(s => (
            <div key={s.name} className="rounded-lg border p-3">
              <p className="text-sm font-semibold mb-1">{s.name}</p>
              <p className="text-xs text-amber-700"><strong>Spike:</strong> {s.spike}</p>
              <p className="text-xs text-red-700"><strong>Cost:</strong> {s.baseline}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground mt-1">This isn't a moral judgment. It's neurochemistry. These stimuli exploit circuits that evolved for survival — they are designed to be hard to resist.</p>
        </CardContent>
      </Card>

      {/* Attention Economy */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">The Attention Economy</p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Every app on your phone employs teams of engineers whose explicit job is to maximize the time you spend on it. This isn't conspiracy — it's their business model. Your attention is the product being sold to advertisers.</p>
            <p><strong>Techniques used:</strong> Variable ratio reinforcement (pull-to-refresh), social validation feedback loops (likes/hearts), infinite scroll (removing natural stopping cues), notification interrupts (breaking focus to re-engage), autoplay (eliminating the decision to continue).</p>
            <p><strong>The result:</strong> The average person checks their phone 96 times per day. Each check fragments attention. Deep work requires 23 minutes to re-enter a flow state. The math doesn't work.</p>
            <a href="/screen-time" className="text-amber-600 hover:underline flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> Deep dive: Screen Time</a>
          </div>
        </CardContent>
      </Card>

      {/* Healthy Dopamine */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Healthy Dopamine Sources</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {healthyDopamine.map(h => (
            <div key={h.source} className={cn("rounded-lg border p-3", h.color.split(" ").slice(1).join(" "))}>
              <div className="flex items-center gap-2 mb-1">
                <p className={cn("text-sm font-semibold", h.color.split(" ")[0])}>{h.source}</p>
                <Badge variant="outline" className="text-[9px]">{h.boost}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{h.note}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">Key difference: these raise your baseline without the crash. Cold exposure data from European Journal of Applied Physiology. Exercise data from Neuropsychopharmacology.</p>
        </CardContent>
      </Card>

      {/* Dopamine Reset Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Timer className="h-4 w-4 text-violet-600" /> Reset Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-semibold mb-1">24-48 Hour Reset</p>
            <p>Remove all high-dopamine inputs for 24-48 hours: no phone, no social media, no junk food, no music, no screens. Just exist. Walk, read physical books, journal, cook simple food. The first 12 hours are uncomfortable. By hour 24, ordinary things start feeling rewarding again. This works because you allow your dopamine receptors to upregulate.</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-semibold mb-1">Gradual Reduction (30-Day)</p>
            <p>More sustainable for most people. Week 1: remove notifications and set screen time limits. Week 2: replace one high-dopamine habit with exercise or cold exposure. Week 3: add a morning routine before any screen use. Week 4: evaluate what you actually miss vs. what was just compulsion. Most people find they miss very little.</p>
          </div>
        </CardContent>
      </Card>

      {/* Dopamine and Spending */}
      <Card className="border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-semibold text-orange-900">Dopamine & Your Finances</p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong>Impulse purchases are dopamine-driven.</strong> The excitement is in the anticipation and the click, not in owning the thing. This is why online shopping is more addictive than in-store — faster feedback loop, lower friction, variable discovery (recommendations).</p>
            <p><strong>The 48-hour rule:</strong> Wait 48 hours before any non-essential purchase over $50. By then, the dopamine surge has passed and you can evaluate with your prefrontal cortex instead of your nucleus accumbens.</p>
            <a href="/financial-independence" className="text-orange-600 hover:underline flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> See: Financial Independence Calculator</a>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/screen-time" className="text-sm text-amber-600 hover:underline">Screen Time</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/financial-independence" className="text-sm text-emerald-600 hover:underline">Financial Independence</a>
        <a href="/cold-exposure" className="text-sm text-blue-600 hover:underline">Cold Exposure</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
      </div>
    </div>
  )
}
