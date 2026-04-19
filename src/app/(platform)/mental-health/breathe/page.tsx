"use client"

import { useState, useEffect, useRef } from "react"
import { Wind, Play, Pause, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TECHNIQUES = [
  {
    name: "Box Breathing",
    description: "Used by Navy SEALs. Equal parts inhale, hold, exhale, hold.",
    phases: [
      { action: "Breathe In", duration: 4 },
      { action: "Hold", duration: 4 },
      { action: "Breathe Out", duration: 4 },
      { action: "Hold", duration: 4 },
    ],
    cycles: 4,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "4-7-8 Breathing",
    description: "Dr. Andrew Weil's relaxation technique. Activates parasympathetic nervous system.",
    phases: [
      { action: "Breathe In", duration: 4 },
      { action: "Hold", duration: 7 },
      { action: "Breathe Out", duration: 8 },
    ],
    cycles: 4,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Physiological Sigh",
    description: "Fastest known way to calm down. Double inhale through nose, long exhale through mouth.",
    phases: [
      { action: "Inhale (nose)", duration: 2 },
      { action: "Inhale again", duration: 1 },
      { action: "Long exhale (mouth)", duration: 6 },
    ],
    cycles: 5,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Wim Hof Round",
    description: "Power breathing for energy and cold tolerance. 30 deep breaths then hold.",
    phases: [
      { action: "Deep breath in", duration: 2 },
      { action: "Let go", duration: 1 },
    ],
    cycles: 30,
    color: "from-cyan-500 to-blue-600",
    suffix: [
      { action: "Exhale & Hold", duration: 30 },
      { action: "Recovery Breath", duration: 15 },
    ],
  },
  {
    name: "Calm Breathing",
    description: "Simple slow breathing for everyday calm. No holds, just slow in and out.",
    phases: [
      { action: "Breathe In", duration: 5 },
      { action: "Breathe Out", duration: 5 },
    ],
    cycles: 6,
    color: "from-pink-400 to-rose-500",
  },
]

export default function BreathePage() {
  const [selectedTechnique, setSelectedTechnique] = useState<typeof TECHNIQUES[0] | null>(null)
  const [running, setRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [complete, setComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function start(technique: typeof TECHNIQUES[0]) {
    setSelectedTechnique(technique)
    setRunning(true)
    setComplete(false)
    setCurrentCycle(0)
    setCurrentPhase(0)
    setCountdown(technique.phases[0].duration)

    let cycle = 0
    let phase = 0
    let time = technique.phases[0].duration

    intervalRef.current = setInterval(() => {
      time--
      if (time <= 0) {
        phase++
        if (phase >= technique.phases.length) {
          phase = 0
          cycle++
          if (cycle >= technique.cycles) {
            // Check for suffix phases (Wim Hof)
            if ((technique as any).suffix) {
              // Handle suffix separately
            }
            clearInterval(intervalRef.current!)
            setRunning(false)
            setComplete(true)
            return
          }
        }
        time = technique.phases[phase].duration
      }
      setCurrentPhase(phase)
      setCurrentCycle(cycle)
      setCountdown(time)
    }, 1000)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setSelectedTechnique(null)
    setComplete(false)
  }

  const currentAction = selectedTechnique?.phases[currentPhase]
  const isInhale = currentAction?.action.toLowerCase().includes("in") || currentAction?.action.toLowerCase().includes("inhale")
  const isExhale = currentAction?.action.toLowerCase().includes("out") || currentAction?.action.toLowerCase().includes("exhale")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Breathing Exercises</h1>
        </div>
        <p className="text-sm text-muted-foreground">Guided breathing with visual timer. Scientifically proven to reduce stress in under 5 minutes.</p>
      </div>

      {/* Active session */}
      {(running || complete) && selectedTechnique && (
        <Card className={cn("border-2 overflow-hidden", complete ? "border-emerald-300" : "border-blue-200")}>
          <div className={cn("bg-gradient-to-r p-4 text-white text-center", selectedTechnique.color)}>
            <p className="font-bold text-lg">{selectedTechnique.name}</p>
            <p className="text-white/70 text-xs">Cycle {currentCycle + 1} of {selectedTechnique.cycles}</p>
          </div>
          <CardContent className="p-8 text-center">
            {complete ? (
              <div>
                <div className="flex h-32 w-32 mx-auto items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">Complete</p>
                <p className="text-sm text-muted-foreground mt-1">Well done. Take a moment to notice how you feel.</p>
                <Button className="mt-4" onClick={stop}>Done</Button>
              </div>
            ) : (
              <div>
                {/* Breathing circle */}
                <div className={cn(
                  "flex h-40 w-40 mx-auto items-center justify-center rounded-full transition-all duration-1000 mb-6",
                  isInhale ? "scale-110 bg-blue-100" : isExhale ? "scale-90 bg-blue-50" : "scale-100 bg-blue-75 bg-violet-50"
                )}>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{countdown}</p>
                    <p className="text-sm text-blue-500 mt-1">{currentAction?.action}</p>
                  </div>
                </div>

                <Button variant="outline" onClick={stop}>
                  <Pause className="h-4 w-4" /> Stop
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Technique selection */}
      {!running && !complete && (
        <div className="space-y-3">
          {TECHNIQUES.map((technique) => (
            <Card key={technique.name} className="card-hover cursor-pointer" onClick={() => start(technique)}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", technique.color)}>
                  <Wind className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{technique.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{technique.description}</p>
                  <div className="flex gap-2 mt-1.5">
                    {technique.phases.map((p, i) => (
                      <span key={i} className="text-[10px] rounded-full bg-muted px-2 py-0.5">
                        {p.action} {p.duration}s
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">× {technique.cycles}</span>
                  </div>
                </div>
                <Play className="h-5 w-5 text-muted-foreground/30 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-cyan-200 bg-cyan-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science:</strong> Controlled breathing activates the vagus nerve, which triggers the
            parasympathetic nervous system ("rest and digest"). A 2023 Stanford study found that cyclic sighing
            (physiological sigh) was more effective than mindfulness meditation at reducing anxiety. Box breathing
            is used by Navy SEALs, first responders, and surgeons to perform under pressure.
          </p>
        </CardContent>
      </Card>

      <a href="/mental-health" className="text-sm text-pink-600 hover:underline block">← Mental Health</a>
    </div>
  )
}
