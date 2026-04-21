"use client"

import { useState, useEffect } from "react"
import { BookOpen, CheckCircle, Star, Target, ArrowRight, Calendar, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Reflection {
  id: string
  date: string
  biggestWin: string
  lesson: string
  gratitude: string
  nextWeekFocus: string
  rating: number // 1-10 how was this week
}

const PROMPTS = [
  "What was your biggest win this week — personal, financial, family, or health?",
  "What did you learn this week that changed how you think or act?",
  "What is one thing you are grateful for right now that you might take for granted?",
  "What is your ONE focus for next week? (Not five things. One.)",
]

export default function WeeklyReflectionPage() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [step, setStep] = useState(0)
  const [biggestWin, setBiggestWin] = useState("")
  const [lesson, setLesson] = useState("")
  const [gratitude, setGratitude] = useState("")
  const [nextWeekFocus, setNextWeekFocus] = useState("")
  const [rating, setRating] = useState(0)
  const [completed, setCompleted] = useState(false)

  const thisWeek = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const stored = localStorage.getItem("hfp-weekly-reflections")
    if (stored) {
      const data: Reflection[] = JSON.parse(stored)
      setReflections(data)
      // Check if this week's reflection exists
      const existing = data.find(r => r.date === thisWeek)
      if (existing) {
        setCompleted(true)
        setBiggestWin(existing.biggestWin)
        setLesson(existing.lesson)
        setGratitude(existing.gratitude)
        setNextWeekFocus(existing.nextWeekFocus)
        setRating(existing.rating)
      }
    }
  }, [thisWeek])

  function save() {
    const reflection: Reflection = {
      id: Date.now().toString(36),
      date: thisWeek,
      biggestWin, lesson, gratitude, nextWeekFocus, rating,
    }
    const updated = [reflection, ...reflections.filter(r => r.date !== thisWeek)].slice(0, 52) // keep 1 year
    setReflections(updated)
    localStorage.setItem("hfp-weekly-reflections", JSON.stringify(updated))
    setCompleted(true)
  }

  // Calculate streak
  const streak = (() => {
    let s = 0
    const now = new Date()
    for (let i = 0; i < 52; i++) {
      const weekDate = new Date(now)
      weekDate.setDate(weekDate.getDate() - (i * 7))
      const weekStr = weekDate.toISOString().split("T")[0]
      if (reflections.some(r => r.date === weekStr)) s++
      else if (i > 0) break
    }
    return s
  })()

  if (completed) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center pt-4">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">This Week's Reflection</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {streak > 1 ? `${streak} week streak. ` : ""}Completed for this week.
          </p>
        </div>

        <Card className="border-emerald-200 bg-emerald-50/10">
          <CardContent className="p-5 space-y-3">
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Biggest Win</p><p className="text-sm">{biggestWin}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">What I Learned</p><p className="text-sm">{lesson}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Grateful For</p><p className="text-sm">{gratitude}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Week Focus</p><p className="text-sm font-semibold">{nextWeekFocus}</p></div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Week Rating</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} className={cn("h-3 w-5 rounded-sm", n <= rating ? "bg-emerald-400" : "bg-muted")} />
                ))}
              </div>
              <span className="text-sm font-bold text-emerald-600">{rating}/10</span>
            </div>
          </CardContent>
        </Card>

        {/* Previous reflections */}
        {reflections.length > 1 && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Previous Weeks</h2>
            <div className="space-y-2">
              {reflections.filter(r => r.date !== thisWeek).slice(0, 8).map(r => (
                <Card key={r.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="text-xs font-bold text-emerald-600">{r.rating}/10</span>
                    </div>
                    <p className="text-xs"><strong>Win:</strong> {r.biggestWin}</p>
                    <p className="text-xs"><strong>Focus:</strong> {r.nextWeekFocus}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress Dashboard</a>
          <a href="/wins" className="text-sm text-amber-600 hover:underline">Wins & Gratitude</a>
          <a href="/dashboard" className="text-sm text-violet-600 hover:underline">Dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center pt-4">
        <BookOpen className="h-10 w-10 text-violet-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Weekly Reflection</h1>
        <p className="text-sm text-muted-foreground mt-1">5 minutes. 4 questions. The practice that turns weeks into growth.</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {[0, 1, 2, 3, 4].map(s => (
          <div key={s} className={cn("h-1.5 w-10 rounded-full", s < step ? "bg-emerald-400" : s === step ? "bg-violet-400" : "bg-muted")} />
        ))}
      </div>

      <Card className="border-2 border-violet-200">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[0]}</p>
              <Textarea value={biggestWin} onChange={e => setBiggestWin(e.target.value)}
                placeholder="It doesn't have to be big. Showing up counts. Making a hard decision counts. Keeping a promise counts."
                className="min-h-[100px]" autoFocus />
              <Button onClick={() => setStep(1)} disabled={!biggestWin.trim()} className="w-full">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[1]}</p>
              <Textarea value={lesson} onChange={e => setLesson(e.target.value)}
                placeholder="A skill, an insight, something about yourself, a mistake that taught you something..."
                className="min-h-[100px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)} disabled={!lesson.trim()} className="flex-1">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[2]}</p>
              <Textarea value={gratitude} onChange={e => setGratitude(e.target.value)}
                placeholder="A person, a moment, your health, your home, your freedom, something small that made a big difference..."
                className="min-h-[100px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!gratitude.trim()} className="flex-1">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{PROMPTS[3]}</p>
              <Textarea value={nextWeekFocus} onChange={e => setNextWeekFocus(e.target.value)}
                placeholder="Not a to-do list. One thing that, if you accomplished it, would make next week a success."
                className="min-h-[80px]" autoFocus />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)} disabled={!nextWeekFocus.trim()} className="flex-1">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">How would you rate this week? (1-10)</p>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    className={cn("h-10 w-10 rounded-lg text-sm font-bold transition-all",
                      rating === n ? (n >= 7 ? "bg-emerald-500 text-white scale-110" : n >= 4 ? "bg-amber-400 text-white scale-110" : "bg-red-400 text-white scale-110")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}>{n}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={save} disabled={rating === 0} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" /> Complete Reflection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why reflect weekly?</strong> Research from Harvard Business School found that employees who
            spent 15 minutes at the end of each day reflecting on lessons learned performed 23% better after
            10 days than those who didn't. Weekly reflection scales this: it catches patterns that daily
            reflection misses and connects your actions to outcomes across longer arcs. Over 52 weeks, you
            have a complete record of your year — growth you can see, lessons you can revisit, and a clear
            trajectory that proves you are moving forward.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
