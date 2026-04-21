"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Zap, BarChart3, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Mode = "focus" | "short-break" | "long-break"

const MODE_CONFIG: Record<Mode, { label: string; color: string; icon: any; defaultMin: number }> = {
  focus: { label: "Focus", color: "text-red-500 bg-red-50 border-red-200", icon: Brain, defaultMin: 25 },
  "short-break": { label: "Short Break", color: "text-emerald-500 bg-emerald-50 border-emerald-200", icon: Coffee, defaultMin: 5 },
  "long-break": { label: "Long Break", color: "text-blue-500 bg-blue-50 border-blue-200", icon: Zap, defaultMin: 15 },
}

interface SessionLog {
  date: string
  focusMinutes: number
  sessions: number
}

export default function FocusTimerPage() {
  const [mode, setMode] = useState<Mode>("focus")
  const [focusMin, setFocusMin] = useState(25)
  const [shortBreakMin, setShortBreakMin] = useState(5)
  const [longBreakMin, setLongBreakMin] = useState(15)
  const [longBreakInterval, setLongBreakInterval] = useState(4)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessionsCompleted, setSessions] = useState(0)
  const [totalFocusToday, setTotalFocusToday] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [history, setHistory] = useState<SessionLog[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const config = MODE_CONFIG[mode]

  // Load history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hfp-focus-history") || "[]")
      setHistory(saved)
      const todayLog = saved.find((l: SessionLog) => l.date === today)
      if (todayLog) { setTotalFocusToday(todayLog.focusMinutes); setSessions(todayLog.sessions) }
    } catch {}
  }, [today])

  function getDuration(m: Mode): number {
    if (m === "focus") return focusMin * 60
    if (m === "short-break") return shortBreakMin * 60
    return longBreakMin * 60
  }

  function switchMode(newMode: Mode) {
    setMode(newMode)
    setTimeLeft(getDuration(newMode))
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function logSession() {
    const newTotal = totalFocusToday + focusMin
    const newSessions = sessionsCompleted + 1
    setTotalFocusToday(newTotal)
    setSessions(newSessions)
    const updated = [
      { date: today, focusMinutes: newTotal, sessions: newSessions },
      ...history.filter(h => h.date !== today)
    ].slice(0, 90)
    setHistory(updated)
    localStorage.setItem("hfp-focus-history", JSON.stringify(updated))
  }

  const completeSession = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Play notification sound (system beep fallback)
    try { audioRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19telefonXhSRkZl"); audioRef.current.play().catch(() => {}) } catch {}

    if (mode === "focus") {
      logSession()
      const newCount = sessionsCompleted + 1
      if (newCount % longBreakInterval === 0) switchMode("long-break")
      else switchMode("short-break")
    } else {
      switchMode("focus")
    }
  }, [mode, sessionsCompleted, longBreakInterval, focusMin, totalFocusToday, history, today])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { completeSession(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, completeSession])

  function toggle() {
    if (running) { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }
    else setRunning(true)
  }

  function reset() { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); setTimeLeft(getDuration(mode)) }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalDuration = getDuration(mode)
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0
  const Icon = config.icon

  // Week stats
  const last7 = history.filter(h => { const d = new Date(h.date); const week = new Date(Date.now() - 7 * 86400000); return d >= week })
  const weekFocus = last7.reduce((s, h) => s + h.focusMinutes, 0)
  const weekSessions = last7.reduce((s, h) => s + h.sessions, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Focus Timer</h1>
        </div>
        <p className="text-sm text-muted-foreground">Pomodoro technique — structured focus sessions with strategic breaks. Deep work requires boundaries.</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG["focus"]][]).map(([m, cfg]) => (
          <button key={m} onClick={() => !running && switchMode(m)} className={cn("flex-1 rounded-lg border p-2 text-center transition-colors", mode === m ? cfg.color : "hover:bg-muted/50", running && mode !== m ? "opacity-30" : "")}>
            <cfg.icon className="h-4 w-4 mx-auto mb-0.5" />
            <p className="text-[10px] font-medium">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Timer display */}
      <Card className={cn("border-2", config.color.split(" ").slice(1).join(" "))}>
        <CardContent className="p-8 text-center">
          <p className="text-6xl font-mono font-bold tracking-wider">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </p>
          <p className={cn("text-sm font-medium mt-2", config.color.split(" ")[0])}>{config.label}</p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", mode === "focus" ? "bg-red-400" : mode === "short-break" ? "bg-emerald-400" : "bg-blue-400")} style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={toggle} size="lg" className={mode === "focus" ? "bg-red-600 hover:bg-red-700" : mode === "short-break" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}>
              {running ? <><Pause className="h-5 w-5 mr-1" /> Pause</> : <><Play className="h-5 w-5 mr-1" /> {timeLeft === getDuration(mode) ? "Start" : "Resume"}</>}
            </Button>
            <Button onClick={reset} variant="outline" size="lg"><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">Session {sessionsCompleted + 1} · Long break every {longBreakInterval} sessions</p>
        </CardContent>
      </Card>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-red-600">{sessionsCompleted}</p>
          <p className="text-[10px] text-muted-foreground">Sessions today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-red-600">{totalFocusToday}</p>
          <p className="text-[10px] text-muted-foreground">Focus minutes today</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{weekFocus}</p>
          <p className="text-[10px] text-muted-foreground">Focus min this week</p>
        </CardContent></Card>
      </div>

      {/* Settings */}
      <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Settings2 className="h-3.5 w-3.5" /> {showSettings ? "Hide" : "Show"} settings
      </button>
      {showSettings && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className="text-[10px] text-muted-foreground">Focus (min)</label>
            <Input type="number" value={focusMin} onChange={e => { const v = Number(e.target.value) || 25; setFocusMin(v); if (mode === "focus" && !running) setTimeLeft(v * 60) }} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Short break</label>
            <Input type="number" value={shortBreakMin} onChange={e => { const v = Number(e.target.value) || 5; setShortBreakMin(v); if (mode === "short-break" && !running) setTimeLeft(v * 60) }} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Long break</label>
            <Input type="number" value={longBreakMin} onChange={e => { const v = Number(e.target.value) || 15; setLongBreakMin(v); if (mode === "long-break" && !running) setTimeLeft(v * 60) }} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Long break every</label>
            <Input type="number" value={longBreakInterval} onChange={e => setLongBreakInterval(Number(e.target.value) || 4)} className="h-8 text-sm" /></div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Last 14 Days</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-16">
              {history.slice(0, 14).reverse().map((h, i) => {
                const max = Math.max(...history.slice(0, 14).map(x => x.focusMinutes))
                const pct = max > 0 ? (h.focusMinutes / max) * 100 : 0
                return <div key={i} className="flex-1 rounded-t bg-red-400" style={{ height: `${Math.max(2, pct)}%`, opacity: 0.5 + (i / 14) * 0.5 }} title={`${h.date}: ${h.focusMinutes}min`} />
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The Pomodoro Technique:</strong> Created by Francesco Cirillo. 25 minutes of focused work, then 5-minute break.
            After 4 sessions, take a longer 15-30 minute break. The key insight: your brain needs constraint to focus.
            Open-ended "I'll work until I'm done" leads to distraction. "I'll focus for 25 minutes" creates urgency
            and permission to ignore everything else. Cal Newport's Deep Work research confirms: 3-4 hours of
            truly focused work per day is more productive than 8 hours of scattered attention.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/dopamine" className="text-sm text-amber-600 hover:underline">Dopamine</a>
        <a href="/planner" className="text-sm text-violet-600 hover:underline">Daily Planner</a>
        <a href="/character-sheet" className="text-sm text-orange-600 hover:underline">Character Sheet</a>
        <a href="/notes" className="text-sm text-blue-600 hover:underline">Quick Notes</a>
      </div>
    </div>
  )
}
