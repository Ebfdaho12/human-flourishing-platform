"use client"

import { useState } from "react"
import { Moon, Sun, Clock, ArrowRight, Sparkles, BedDouble } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// Average sleep cycle = 90 minutes
// Ideal: wake at end of light sleep (end of cycle), not mid-deep-sleep
const CYCLE_MINUTES = 90
const FALL_ASLEEP_MINUTES = 15 // average time to fall asleep

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000)
}

function calcCycleTimes(baseTime: Date, direction: "forward" | "backward", cycles: number[]): { time: Date; cycles: number; quality: string }[] {
  return cycles.map(c => {
    const sleepMins = c * CYCLE_MINUTES
    const offset = direction === "forward"
      ? sleepMins + FALL_ASLEEP_MINUTES
      : -(sleepMins + FALL_ASLEEP_MINUTES)
    const time = addMinutes(baseTime, offset)
    const quality = c >= 6 ? "Optimal" : c === 5 ? "Good" : c === 4 ? "Minimum" : "Short"
    return { time, cycles: c, quality }
  })
}

function hoursFromCycles(c: number): string {
  const total = c * 1.5
  const h = Math.floor(total)
  const m = (total - h) * 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const SLEEP_FACTS = [
  "During deep sleep (stages 3-4), your body repairs muscles, strengthens immunity, and consolidates memories.",
  "REM sleep increases with each cycle — your 5th and 6th cycles have the most REM, which is critical for creativity and emotional processing.",
  "Waking mid-cycle (during deep sleep) causes grogginess that can last hours. Waking at the end of a cycle feels natural.",
  "Sleep debt is real — losing 1 hour per night for a week equals the cognitive impairment of pulling an all-nighter.",
  "Your body temperature drops 1-2°F during sleep. A cool room (65-68°F / 18-20°C) helps you fall asleep faster.",
  "Blue light from screens suppresses melatonin for up to 90 minutes. Stop screens 1 hour before bed for faster sleep onset.",
  "Consistent sleep and wake times — even on weekends — is the single most impactful thing you can do for sleep quality.",
  "Caffeine has a half-life of 5-6 hours. A coffee at 3pm means half the caffeine is still in your system at 9pm.",
]

export default function SleepCalculatorPage() {
  const [mode, setMode] = useState<"wake" | "sleep">("wake")
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM")
  const [results, setResults] = useState<{ time: Date; cycles: number; quality: string }[] | null>(null)
  const [factIndex] = useState(() => Math.floor(Math.random() * SLEEP_FACTS.length))

  function calculate() {
    const h24 = ampm === "PM" ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
    const base = new Date()
    base.setHours(h24, minute, 0, 0)

    if (mode === "wake") {
      // User wants to wake at X — when should they go to bed?
      const times = calcCycleTimes(base, "backward", [6, 5, 4, 3])
      setResults(times)
    } else {
      // User is going to sleep at X — when should they wake up?
      const times = calcCycleTimes(base, "forward", [3, 4, 5, 6])
      setResults(times)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Sleep Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">Wake up at the end of a sleep cycle — not in the middle. Feel refreshed, not groggy.</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setMode("wake"); setResults(null) }}
          className={cn("rounded-xl border-2 p-4 text-left transition-all",
            mode === "wake" ? "border-indigo-400 bg-indigo-50/30" : "border-border hover:bg-muted/30"
          )}>
          <Sun className="h-5 w-5 text-amber-500 mb-1" />
          <p className="text-sm font-semibold">I need to wake up at...</p>
          <p className="text-xs text-muted-foreground">When should I go to bed?</p>
        </button>
        <button onClick={() => { setMode("sleep"); setResults(null) }}
          className={cn("rounded-xl border-2 p-4 text-left transition-all",
            mode === "sleep" ? "border-indigo-400 bg-indigo-50/30" : "border-border hover:bg-muted/30"
          )}>
          <BedDouble className="h-5 w-5 text-indigo-500 mb-1" />
          <p className="text-sm font-semibold">I am going to sleep at...</p>
          <p className="text-xs text-muted-foreground">When should I wake up?</p>
        </button>
      </div>

      {/* Time picker */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground mb-3">
            {mode === "wake" ? "What time do you need to wake up?" : "What time are you going to bed?"}
          </p>
          <div className="flex items-center gap-3 justify-center">
            <select value={hour} onChange={e => setHour(Number(e.target.value))}
              className="text-3xl font-bold bg-transparent border-b-2 border-indigo-300 text-center w-16 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-3xl font-bold text-muted-foreground">:</span>
            <select value={minute} onChange={e => setMinute(Number(e.target.value))}
              className="text-3xl font-bold bg-transparent border-b-2 border-indigo-300 text-center w-16 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500">
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setAmpm("AM")}
                className={cn("text-xs px-2 py-0.5 rounded font-semibold transition-colors",
                  ampm === "AM" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:bg-muted"
                )}>AM</button>
              <button onClick={() => setAmpm("PM")}
                className={cn("text-xs px-2 py-0.5 rounded font-semibold transition-colors",
                  ampm === "PM" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:bg-muted"
                )}>PM</button>
            </div>
          </div>
          <Button onClick={calculate} className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            Calculate {mode === "wake" ? "Bedtimes" : "Wake Times"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {mode === "wake"
              ? "Go to bed at one of these times to wake up feeling refreshed:"
              : "Set your alarm for one of these times:"}
          </p>
          {results.map((r, i) => (
            <Card key={i} className={cn("card-hover transition-all",
              r.quality === "Optimal" ? "border-2 border-emerald-300 bg-emerald-50/20" :
              r.quality === "Good" ? "border-indigo-200 bg-indigo-50/10" : ""
            )}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">{formatTime(r.time)}</p>
                    {r.quality === "Optimal" && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> Best
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.cycles} cycles = {hoursFromCycles(r.cycles)} of sleep</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold",
                    r.quality === "Optimal" ? "text-emerald-600" :
                    r.quality === "Good" ? "text-blue-600" :
                    r.quality === "Minimum" ? "text-amber-600" : "text-red-500"
                  )}>{r.quality}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-[10px] text-muted-foreground text-center">
            Times include ~15 minutes to fall asleep. Each sleep cycle is approximately 90 minutes.
          </p>
        </div>
      )}

      {/* How it works */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" /> How Sleep Cycles Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</div>
              <div>
                <p className="text-sm font-medium">Light Sleep (Stage 1-2)</p>
                <p className="text-xs text-muted-foreground">Your body relaxes, heart rate slows. Easy to wake from. ~20 minutes.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">2</div>
              <div>
                <p className="text-sm font-medium"><Explain tip="The deepest stage of sleep where your body does most of its physical repair — muscles grow, tissues heal, and your immune system gets stronger. If you wake up during this stage, you feel extremely groggy and confused">Deep Sleep</Explain> (Stage 3-4)</p>
                <p className="text-xs text-muted-foreground">Body repairs itself, <Explain tip="A natural chemical your body releases during deep sleep that helps build muscle, repair tissue, and support growth in children. Exercise and deep sleep increase it; poor sleep decreases it">growth hormone</Explain> released, immune system strengthens. Hardest to wake from. ~40 minutes.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold">3</div>
              <div>
                <p className="text-sm font-medium"><Explain tip="Rapid Eye Movement sleep — the stage where you dream. Your eyes move quickly, your brain is almost as active as when you are awake, and your body is temporarily paralyzed so you do not act out your dreams. This stage is critical for learning, memory, and emotional health">REM Sleep</Explain> (Dream Stage)</p>
                <p className="text-xs text-muted-foreground">Brain processes emotions, <Explain tip="The process of moving new information from short-term memory into long-term memory. This is why studying before bed and getting good sleep helps you remember — your brain 'saves' what you learned while you sleep">consolidates memories</Explain>, boosts creativity. ~30 minutes.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              One full cycle takes ~90 minutes. You go through 4-6 cycles per night. Waking at the end of a cycle (during light sleep)
              instead of the middle (during deep sleep) is the difference between feeling alert and feeling groggy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Random fact */}
      <Card className="border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sleep Science:</strong> {SLEEP_FACTS[factIndex]}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/health/sleep" className="text-sm text-indigo-600 hover:underline">Sleep Tracker</a>
        <a href="/routine" className="text-sm text-amber-600 hover:underline">Daily Routines</a>
        <a href="/health" className="text-sm text-emerald-600 hover:underline">Health Dashboard</a>
      </div>
    </div>
  )
}
