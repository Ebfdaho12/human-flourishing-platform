"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Wind, Play, Pause, RotateCcw, Timer, Heart, Brain, Zap, Moon, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface BreathPattern {
  name: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  rounds: number
  description: string
  benefits: string[]
  science: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

const PATTERNS: BreathPattern[] = [
  { name: "Box Breathing", inhale: 4, hold1: 4, exhale: 4, hold2: 4, rounds: 4, difficulty: "Beginner", description: "Used by Navy SEALs for stress control. Equal phases create a calming, centering effect. Activates the parasympathetic nervous system.", benefits: ["Immediate stress reduction", "Improved focus", "Lower blood pressure", "Reduced cortisol"], science: "Activates the vagus nerve through controlled exhalation, shifting the autonomic nervous system from sympathetic (fight/flight) to parasympathetic (rest/digest). Used in military, first responder, and athletic performance contexts." },
  { name: "4-7-8 Breathing", inhale: 4, hold1: 7, exhale: 8, hold2: 0, rounds: 4, difficulty: "Beginner", description: "Dr. Andrew Weil's technique. The extended exhale is a natural tranquilizer for the nervous system. Often called the 'sleep breath.'", benefits: ["Falls asleep faster", "Reduces anxiety", "Manages cravings", "Controls anger responses"], science: "The 1:1.75:2 ratio (inhale:hold:exhale) maximizes CO2 tolerance and oxygen exchange. The long hold allows full gas exchange in alveoli. The extended exhale triggers the parasympathetic response more strongly than any other phase." },
  { name: "Physiological Sigh", inhale: 3, hold1: 0, exhale: 6, hold2: 0, rounds: 3, difficulty: "Beginner", description: "Discovered by Stanford's Andrew Huberman. Double inhale through nose, then long exhale through mouth. The fastest known way to reduce stress in real-time.", benefits: ["Fastest real-time stress reduction", "Works in 1-3 breaths", "No training needed", "Can use in any situation"], science: "Double inhale reinflates collapsed alveoli in the lungs, maximizing surface area for CO2 offloading. The long exhale then efficiently removes CO2, which is the primary driver of the 'suffocating' feeling during stress. Published in Cell Reports Medicine (2023)." },
  { name: "Wim Hof Method", inhale: 2, hold1: 0, exhale: 2, hold2: 0, rounds: 30, difficulty: "Advanced", description: "30 deep breaths followed by a breath hold on empty lungs. Induces controlled hyperventilation followed by hypoxia. Powerful but requires practice.", benefits: ["Increased cold tolerance", "Boosted immune response", "Reduced inflammation", "Elevated energy and focus"], science: "Radboud University study (2014): Wim Hof practitioners showed voluntary activation of the innate immune system and suppressed inflammatory response when injected with endotoxin. The breathing creates transient respiratory alkalosis, followed by a compensatory adrenaline surge during the retention." },
  { name: "Coherent Breathing", inhale: 5, hold1: 0, exhale: 5, hold2: 0, rounds: 10, difficulty: "Beginner", description: "5 seconds in, 5 seconds out. 6 breaths per minute. This rate maximizes heart rate variability (HRV) — the gold standard marker for autonomic nervous system health.", benefits: ["Maximizes HRV", "Deep relaxation", "Improved autonomic balance", "Reduced blood pressure"], science: "Research shows 6 breaths/minute (~0.1 Hz) creates resonance between respiratory and cardiovascular oscillations, maximizing baroreflex sensitivity and HRV. This is the same frequency used in biofeedback training for anxiety, PTSD, and performance optimization." },
  { name: "Tummo (Inner Fire)", inhale: 3, hold1: 15, exhale: 3, hold2: 0, rounds: 5, difficulty: "Advanced", description: "Tibetan Buddhist practice for generating internal heat. Combines visualization with breath retention. The foundation of the Wim Hof method.", benefits: ["Internal heat generation", "Deep meditative states", "Cold resistance", "Enhanced focus"], science: "fMRI studies show Tummo practitioners can raise their core body temperature by 1-2°C through breathing alone. Activates brown adipose tissue (BAT) and increases metabolic rate. The long hold creates controlled hypoxia that triggers heat-generating metabolic pathways." },
  { name: "Buteyko Breathing", inhale: 3, hold1: 0, exhale: 4, hold2: 3, rounds: 8, difficulty: "Intermediate", description: "Nasal breathing with reduced volume. Developed by Dr. Konstantin Buteyko. Focuses on increasing CO2 tolerance to improve oxygen delivery to tissues.", benefits: ["Improved nasal breathing", "Reduced asthma symptoms", "Better exercise tolerance", "Improved sleep"], science: "Based on the Bohr effect: hemoglobin releases more oxygen to tissues when CO2 levels are slightly elevated. Chronic overbreathing (common in modern life) creates low CO2, causing hemoglobin to hold onto oxygen. Buteyko retrains the body's CO2 setpoint." },
]

type Phase = "inhale" | "hold1" | "exhale" | "hold2"

export default function BreathworkPage() {
  const [selectedPattern, setSelectedPattern] = useState(0)
  const [running, setRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>("inhale")
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [expandedInfo, setExpandedInfo] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const pattern = PATTERNS[selectedPattern]

  const phaseLabel: Record<Phase, string> = { inhale: "Breathe In", hold1: "Hold", exhale: "Breathe Out", hold2: "Hold" }
  const phaseColor: Record<Phase, string> = { inhale: "text-blue-500", hold1: "text-amber-500", exhale: "text-emerald-500", hold2: "text-violet-500" }
  const phaseDuration: Record<Phase, number> = { inhale: pattern.inhale, hold1: pattern.hold1, exhale: pattern.exhale, hold2: pattern.hold2 }

  const nextPhase = useCallback((phase: Phase): Phase => {
    if (phase === "inhale") return pattern.hold1 > 0 ? "hold1" : "exhale"
    if (phase === "hold1") return "exhale"
    if (phase === "exhale") return pattern.hold2 > 0 ? "hold2" : "inhale"
    return "inhale"
  }, [pattern])

  function start() {
    setRunning(true)
    setCurrentPhase("inhale")
    setTimeLeft(pattern.inhale)
    setCurrentRound(1)
    setTotalSeconds(0)
  }

  function stop() {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Save completed session if >30 seconds
    if (totalSeconds > 30) {
      try {
        const sessions = JSON.parse(localStorage.getItem("hfp-breathwork-sessions") || "[]")
        sessions.unshift({ date: new Date().toISOString().split("T")[0], pattern: pattern.name, duration: totalSeconds })
        localStorage.setItem("hfp-breathwork-sessions", JSON.stringify(sessions.slice(0, 100)))
      } catch {}
    }
  }

  function reset() {
    stop()
    setCurrentPhase("inhale")
    setTimeLeft(0)
    setCurrentRound(1)
    setTotalSeconds(0)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const next = nextPhase(currentPhase)
          if (next === "inhale" && currentPhase !== "inhale") {
            setCurrentRound(r => {
              if (r >= pattern.rounds) { stop(); return r }
              return r + 1
            })
          }
          setCurrentPhase(next)
          return phaseDuration[next]
        }
        return prev - 1
      })
      setTotalSeconds(t => t + 1)
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, currentPhase, pattern, nextPhase, phaseDuration])

  // Breathing circle animation
  const circleScale = running
    ? currentPhase === "inhale" ? "scale-100" : currentPhase === "exhale" ? "scale-50" : "scale-75"
    : "scale-75"
  const circleColor = running
    ? currentPhase === "inhale" ? "bg-blue-400/30 border-blue-400" : currentPhase === "exhale" ? "bg-emerald-400/30 border-emerald-400" : "bg-amber-400/30 border-amber-400"
    : "bg-slate-200/30 border-slate-300"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Breathwork & Meditation</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Guided breathing protocols backed by science. The fastest, cheapest, most effective tool for stress, sleep, focus, and immune function.
        </p>
      </div>

      <Card className="border-2 border-cyan-200 bg-cyan-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Breathing is the only autonomic function you can consciously control.</strong> This means
            it is a direct lever into your nervous system. A 5-minute breathing session can measurably reduce
            cortisol, lower blood pressure, increase <Explain tip="Heart Rate Variability — the variation in time between heartbeats. Higher HRV means your nervous system is more resilient and adaptable">HRV</Explain>, and shift your brain state. It costs nothing, requires
            no equipment, and works immediately. Every protocol below is research-backed.
          </p>
        </CardContent>
      </Card>

      {/* Pattern selector */}
      <div className="grid grid-cols-2 gap-2">
        {PATTERNS.map((p, i) => (
          <button key={i} onClick={() => { reset(); setSelectedPattern(i) }} className={cn("rounded-lg border p-2.5 text-left transition-colors", i === selectedPattern ? "border-cyan-400 bg-cyan-50/30 ring-1 ring-cyan-400" : "hover:bg-muted/50")}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold">{p.name}</p>
              <Badge variant="outline" className={cn("text-[8px]",
                p.difficulty === "Beginner" ? "border-emerald-300 text-emerald-700" :
                p.difficulty === "Intermediate" ? "border-amber-300 text-amber-700" :
                "border-red-300 text-red-700"
              )}>{p.difficulty}</Badge>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2} × {p.rounds}</p>
          </button>
        ))}
      </div>

      {/* Breathing timer */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm font-semibold mb-1">{pattern.name}</p>
            <p className="text-[10px] text-muted-foreground mb-6">{pattern.description}</p>

            {/* Breathing circle */}
            <div className="flex justify-center mb-6">
              <div className={cn("h-40 w-40 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ease-in-out", circleScale, circleColor)}>
                <div className="text-center">
                  {running ? (
                    <>
                      <p className={cn("text-lg font-bold", phaseColor[currentPhase])}>{phaseLabel[currentPhase]}</p>
                      <p className="text-3xl font-bold">{timeLeft}</p>
                      <p className="text-[10px] text-muted-foreground">Round {currentRound}/{pattern.rounds}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-muted-foreground">Ready</p>
                      <p className="text-[10px] text-muted-foreground">{pattern.inhale}s-{pattern.hold1}s-{pattern.exhale}s-{pattern.hold2}s</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!running ? (
                <Button onClick={start} className="bg-cyan-600 hover:bg-cyan-700"><Play className="h-4 w-4 mr-1" /> Start</Button>
              ) : (
                <Button onClick={stop} variant="outline"><Pause className="h-4 w-4 mr-1" /> Pause</Button>
              )}
              <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
            </div>

            {totalSeconds > 0 && (
              <p className="text-[10px] text-muted-foreground mt-3">
                <Timer className="h-3 w-3 inline mr-1" />
                Session: {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, "0")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Protocol details */}
      <div className="space-y-2">
        {PATTERNS.map((p, i) => (
          <div key={i} className="rounded-lg border">
            <button onClick={() => setExpandedInfo(expandedInfo === i ? null : i)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
              <Wind className="h-4 w-4 text-cyan-500 shrink-0" />
              <span className="text-sm font-semibold flex-1">{p.name}</span>
              <Badge variant="outline" className="text-[8px] mr-2">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2}</Badge>
              {expandedInfo === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {expandedInfo === i && (
              <div className="px-3 pb-3 space-y-2">
                <p className="text-xs text-muted-foreground">{p.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {p.benefits.map((b, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                      <Zap className="h-2.5 w-2.5 shrink-0" /> {b}
                    </div>
                  ))}
                </div>
                <div className="rounded bg-slate-50 border p-2">
                  <p className="text-[10px] text-muted-foreground"><strong>Science:</strong> {p.science}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Session history */}
      {(() => {
        let sessions: { date: string; pattern: string; duration: number }[] = []
        try { sessions = JSON.parse(localStorage.getItem("hfp-breathwork-sessions") || "[]") } catch {}
        if (sessions.length === 0) return null
        const totalMinutes = Math.round(sessions.reduce((s, ss) => s + ss.duration, 0) / 60)
        const streak = (() => { let s = 0; const today = new Date().toISOString().split("T")[0]; for (let i = 0; i < 365; i++) { const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]; if (sessions.some(ss => ss.date === d)) s++; else if (i > 0) break; } return s })()
        return (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Session History</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center"><p className="text-lg font-bold text-cyan-600">{sessions.length}</p><p className="text-[9px] text-muted-foreground">Sessions</p></div>
                <div className="text-center"><p className="text-lg font-bold text-cyan-600">{totalMinutes}</p><p className="text-[9px] text-muted-foreground">Total minutes</p></div>
                <div className="text-center"><p className="text-lg font-bold text-orange-500">{streak}</p><p className="text-[9px] text-muted-foreground">Day streak</p></div>
              </div>
              <div className="space-y-1">
                {sessions.slice(0, 7).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs rounded border p-2">
                    <span className="text-muted-foreground">{s.date}</span>
                    <span>{s.pattern}</span>
                    <span className="text-muted-foreground">{Math.round(s.duration / 60)}min</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Quick reference */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2">When to Use What</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Stressed right now:</strong> Physiological Sigh (1-3 breaths, instant effect)</p>
            <p><strong>Can't fall asleep:</strong> 4-7-8 Breathing (4 rounds in bed)</p>
            <p><strong>Need to focus:</strong> Box Breathing (4 rounds before deep work)</p>
            <p><strong>General wellness:</strong> Coherent Breathing (5 min daily, maximizes HRV and builds <Explain tip="Vagal tone measures how strong your vagus nerve's calming influence is — higher vagal tone means you recover from stress faster">vagal tone</Explain>)</p>
            <p><strong>Energy boost:</strong> Wim Hof Method (3 rounds in the morning, pair with cold shower)</p>
            <p><strong>Before a hard conversation:</strong> Box Breathing or Physiological Sigh</p>
            <p><strong>After exercise:</strong> Coherent Breathing (shifts you out of the <Explain tip="The sympathetic nervous system is your body's 'fight or flight' mode — it speeds up your heart and primes you for action">sympathetic nervous system</Explain> to accelerate recovery)</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/lunar-cycles" className="text-sm text-blue-600 hover:underline">Lunar Cycles</a>
      </div>
    </div>
  )
}
