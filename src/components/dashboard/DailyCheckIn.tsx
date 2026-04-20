"use client"

import { useState, useEffect } from "react"
import { Sun, CheckCircle, Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CheckInData {
  date: string
  mood: number
  priority: string
  gratitude: string
  completed: boolean
}

const MOOD_LABELS: Record<number, string> = {
  1: "Struggling", 2: "Rough", 3: "Low", 4: "Below average",
  5: "Okay", 6: "Decent", 7: "Good", 8: "Great", 9: "Excellent", 10: "Amazing"
}

const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-500", 2: "bg-red-400", 3: "bg-orange-500", 4: "bg-orange-400",
  5: "bg-amber-400", 6: "bg-yellow-400", 7: "bg-lime-400", 8: "bg-emerald-400",
  9: "bg-emerald-500", 10: "bg-emerald-600"
}

export function DailyCheckIn() {
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState(0)
  const [priority, setPriority] = useState("")
  const [gratitude, setGratitude] = useState("")
  const [completed, setCompleted] = useState(false)
  const [streak, setStreak] = useState(0)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const stored = localStorage.getItem("hfp-daily-checkins")
    if (stored) {
      const checkins: CheckInData[] = JSON.parse(stored)
      const todayCheckin = checkins.find(c => c.date === today)
      if (todayCheckin?.completed) {
        setCompleted(true)
        setMood(todayCheckin.mood)
        setPriority(todayCheckin.priority)
        setGratitude(todayCheckin.gratitude)
      }
      // Calculate streak
      let s = 0
      const d = new Date()
      for (let i = 0; i < 365; i++) {
        const dateStr = d.toISOString().split("T")[0]
        if (checkins.some(c => c.date === dateStr && c.completed)) {
          s++
          d.setDate(d.getDate() - 1)
        } else if (i === 0) {
          d.setDate(d.getDate() - 1) // today might not be done yet
        } else {
          break
        }
      }
      setStreak(s)
    }
  }, [today])

  function save() {
    const stored = localStorage.getItem("hfp-daily-checkins")
    const checkins: CheckInData[] = stored ? JSON.parse(stored) : []
    const updated = checkins.filter(c => c.date !== today)
    updated.push({ date: today, mood, priority, gratitude, completed: true })
    // Keep last 90 days only
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const trimmed = updated.filter(c => new Date(c.date) >= cutoff)
    localStorage.setItem("hfp-daily-checkins", JSON.stringify(trimmed))
    setCompleted(true)

    // Also log mood to the server
    fetch("/api/mental-health/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: mood, emotions: [], triggers: [] }),
    }).catch(() => {}) // Silent fail — the localStorage log is the primary
  }

  if (completed) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Checked in today</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>Mood: <strong>{mood}/10</strong></span>
              {priority && <span>Priority: <strong>{priority}</strong></span>}
              {streak > 1 && <span className="text-amber-600 font-medium">{streak} day streak</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-5 w-5 text-amber-500" />
          <p className="text-sm font-semibold">Daily Check-In</p>
          <p className="text-[10px] text-muted-foreground ml-auto">30 seconds</p>
        </div>

        {step === 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">How are you feeling today? (1-10)</p>
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button key={n} onClick={() => { setMood(n); setStep(1) }}
                  className={cn("h-9 w-9 rounded-lg text-sm font-bold transition-all",
                    mood === n ? `${MOOD_COLORS[n]} text-white scale-110` :
                    "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}>{n}</button>
              ))}
            </div>
            {mood > 0 && <p className="text-xs text-muted-foreground">{MOOD_LABELS[mood]}</p>}
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">What is your #1 priority today?</p>
            <div className="flex gap-2">
              <Input value={priority} onChange={e => setPriority(e.target.value)}
                placeholder="The one thing that matters most today..."
                className="flex-1" autoFocus
                onKeyDown={e => e.key === "Enter" && priority && setStep(2)} />
              <Button size="sm" onClick={() => setStep(2)} disabled={!priority}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">One thing you are grateful for:</p>
            <div className="flex gap-2">
              <Input value={gratitude} onChange={e => setGratitude(e.target.value)}
                placeholder="Something good in your life right now..."
                className="flex-1" autoFocus
                onKeyDown={e => e.key === "Enter" && gratitude && save()} />
              <Button size="sm" onClick={save} disabled={!gratitude}
                className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Sparkles className="h-4 w-4" /> Done
              </Button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-3 justify-center">
          {[0, 1, 2].map(s => (
            <div key={s} className={cn("h-1.5 w-8 rounded-full transition-all",
              s < step ? "bg-emerald-400" : s === step ? "bg-amber-400" : "bg-muted"
            )} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
