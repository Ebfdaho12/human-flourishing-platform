"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PRESETS = [
  { name: "Pomodoro", work: 25, break: 5, color: "from-red-500 to-orange-500" },
  { name: "Deep Work", work: 90, break: 15, color: "from-violet-500 to-purple-500" },
  { name: "Short Focus", work: 15, break: 3, color: "from-blue-500 to-cyan-500" },
  { name: "50/10", work: 50, break: 10, color: "from-emerald-500 to-teal-500" },
]

export default function FocusTimerPage() {
  const [preset, setPreset] = useState(PRESETS[0])
  const [mode, setMode] = useState<"idle" | "work" | "break">("idle")
  const [timeLeft, setTimeLeft] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function startWork() {
    setMode("work")
    setTimeLeft(preset.work * 60)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Work done — switch to break
          clearInterval(intervalRef.current!)
          setSessions(s => s + 1)
          setTotalMinutes(m => m + preset.work)
          setMode("break")
          setTimeLeft(preset.break * 60)
          // Auto-start break
          intervalRef.current = setInterval(() => {
            setTimeLeft(p => {
              if (p <= 1) {
                clearInterval(intervalRef.current!)
                setMode("idle")
                return 0
              }
              return p - 1
            })
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  function resume() {
    if (mode === "idle") return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          if (mode === "work") {
            setSessions(s => s + 1)
            setTotalMinutes(m => m + preset.work)
            setMode("break")
            return preset.break * 60
          }
          setMode("idle")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setMode("idle")
    setTimeLeft(0)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = mode === "work" ? preset.work * 60 : preset.break * 60
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Focus Timer</h1>
        </div>
        <p className="text-sm text-muted-foreground">Structured focus sessions. Work deeply. Rest fully.</p>
      </div>

      {/* Preset selector */}
      {mode === "idle" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <Card
              key={p.name}
              className={cn("card-hover cursor-pointer", preset.name === p.name && "border-violet-300 ring-2 ring-violet-200")}
              onClick={() => setPreset(p)}
            >
              <CardContent className="p-4 text-center">
                <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white mb-2", p.color)}>
                  <Timer className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.work}m work · {p.break}m break</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timer display */}
      <Card className={cn("overflow-hidden", mode === "work" ? "border-red-200" : mode === "break" ? "border-emerald-200" : "border-border")}>
        {mode !== "idle" && (
          <div className={cn("h-1.5 transition-all", mode === "work" ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${progress}%` }} />
        )}
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            {mode === "work" ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <Brain className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wider">Focus Time</p>
              </div>
            ) : mode === "break" ? (
              <div className="flex items-center justify-center gap-2 text-emerald-500">
                <Coffee className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wider">Break Time</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ready to focus</p>
            )}
          </div>

          <p className={cn("text-7xl font-bold font-mono tabular-nums",
            mode === "work" ? "text-red-600" : mode === "break" ? "text-emerald-600" : "text-foreground"
          )}>
            {mode === "idle" ? `${preset.work}:00` : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
          </p>

          <div className="flex justify-center gap-3 mt-6">
            {mode === "idle" ? (
              <Button size="lg" onClick={startWork} className={cn("bg-gradient-to-r text-white px-8", preset.color)}>
                <Play className="h-5 w-5" /> Start {preset.name}
              </Button>
            ) : (
              <>
                <Button variant="outline" size="lg" onClick={intervalRef.current ? pause : resume}>
                  {intervalRef.current ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {intervalRef.current ? "Pause" : "Resume"}
                </Button>
                <Button variant="outline" size="lg" onClick={reset}>
                  <RotateCcw className="h-5 w-5" /> Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{sessions}</p>
            <p className="text-xs text-muted-foreground">Sessions today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <p className="text-2xl font-bold">{totalMinutes}m</p>
            <p className="text-xs text-muted-foreground">Total focus time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The Pomodoro Technique:</strong> Work for 25 minutes, break for 5. After 4 rounds, take a longer 15-30 minute break.
            Research shows focused blocks with breaks produce better results than continuous work. The key is full focus
            during work time (no phone, no email, no distractions) and full rest during breaks (stand up, move, look away from screens).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
