"use client"

import { useState, useEffect } from "react"
import { Moon, Star, AlertTriangle, Target, Heart, Brain, Zap, CheckCircle, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { useToast } from "@/components/ui/toast-notification"

interface EveningEntry {
  date: string
  dayRating: number
  win: string
  lesson: string
  tomorrowPriority: string
  energyLevel: number
  stressLevel: number
  gratefulFor: string
  wouldChange: string
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

export default function EveningReviewPage() {
  const [entries, setEntries] = useSyncedStorage<EveningEntry[]>("hfp-evening-review", [])
  const [dayRating, setDayRating] = useState([6])
  const [win, setWin] = useState("")
  const [lesson, setLesson] = useState("")
  const [tomorrowPriority, setTomorrowPriority] = useState("")
  const [energyLevel, setEnergyLevel] = useState([5])
  const [stressLevel, setStressLevel] = useState([4])
  const [gratefulFor, setGratefulFor] = useState("")
  const [wouldChange, setWouldChange] = useState("")
  const today = getToday()

  const todayEntry = entries.find(e => e.date === today)

  const { toast } = useToast()

  function submit() {
    const entry: EveningEntry = {
      date: today, dayRating: dayRating[0], win, lesson,
      tomorrowPriority, energyLevel: energyLevel[0],
      stressLevel: stressLevel[0], gratefulFor, wouldChange,
    }
    setEntries([entry, ...entries.filter(e => e.date !== today)])
    toast({ message: "Day closed with intention 🌙", type: "success", xp: 15, duration: 3000 })
  }

  // Weekly averages
  const last7 = entries.slice(0, 7)
  const avgRating = last7.length > 0 ? Math.round(last7.reduce((s, e) => s + e.dayRating, 0) / last7.length * 10) / 10 : null
  const avgEnergy = last7.length > 0 ? Math.round(last7.reduce((s, e) => s + e.energyLevel, 0) / last7.length * 10) / 10 : null
  const avgStress = last7.length > 0 ? Math.round(last7.reduce((s, e) => s + e.stressLevel, 0) / last7.length * 10) / 10 : null

  function ratingColor(n: number) {
    if (n >= 8) return "text-emerald-600"
    if (n >= 6) return "text-blue-600"
    if (n >= 4) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Evening Review</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Close the day with intention. What happened, what you learned, and what matters tomorrow.
        </p>
      </div>

      {/* Weekly snapshot */}
      {avgRating !== null && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              <p className={cn("text-xl font-bold", ratingColor(avgRating))}>{avgRating}</p>
              <p className="text-[10px] text-muted-foreground">Avg day rating (7d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className={cn("text-xl font-bold", ratingColor(avgEnergy!))}>{avgEnergy}</p>
              <p className="text-[10px] text-muted-foreground">Avg energy (7d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-400" />
              <p className={cn("text-xl font-bold", avgStress! <= 4 ? "text-emerald-600" : avgStress! <= 6 ? "text-amber-600" : "text-red-600")}>{avgStress}</p>
              <p className="text-[10px] text-muted-foreground">Avg stress (7d)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {todayEntry ? (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Tonight's Review Complete</p>
            <div className="space-y-2 text-xs">
              <div className="flex gap-2"><Badge variant="outline" className="text-[9px]">{todayEntry.dayRating}/10</Badge> <span>Day rating</span></div>
              {todayEntry.win && <p><strong>Win:</strong> {todayEntry.win}</p>}
              {todayEntry.lesson && <p><strong>Lesson:</strong> {todayEntry.lesson}</p>}
              {todayEntry.tomorrowPriority && <p><strong>Tomorrow:</strong> {todayEntry.tomorrowPriority}</p>}
              {todayEntry.gratefulFor && <p><strong>Grateful for:</strong> {todayEntry.gratefulFor}</p>}
            </div>
            <p className="text-[10px] text-emerald-600 mt-3">Submit again to update.</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Review form */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="pb-2"><CardTitle className="text-base">Tonight's Review</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium">How was your day? <span className={cn("font-bold", ratingColor(dayRating[0]))}>{dayRating[0]}/10</span></label>
            <Slider min={1} max={10} step={1} value={dayRating} onValueChange={setDayRating} className="mt-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Energy level <span className="text-muted-foreground">{energyLevel[0]}/10</span></label>
              <Slider min={1} max={10} step={1} value={energyLevel} onValueChange={setEnergyLevel} className="mt-2" />
            </div>
            <div>
              <label className="text-xs font-medium">Stress level <span className="text-muted-foreground">{stressLevel[0]}/10</span></label>
              <Slider min={1} max={10} step={1} value={stressLevel} onValueChange={setStressLevel} className="mt-2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> Today's biggest win</label>
            <Input value={win} onChange={e => setWin(e.target.value)} placeholder="What went well today?" className="h-9 text-sm mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium flex items-center gap-1"><Brain className="h-3 w-3 text-violet-500" /> What did you learn?</label>
            <Input value={lesson} onChange={e => setLesson(e.target.value)} placeholder="A lesson, insight, or realization..." className="h-9 text-sm mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> What would you change?</label>
            <Input value={wouldChange} onChange={e => setWouldChange(e.target.value)} placeholder="If you could redo one thing..." className="h-9 text-sm mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium flex items-center gap-1"><Heart className="h-3 w-3 text-rose-500" /> What are you grateful for tonight?</label>
            <Input value={gratefulFor} onChange={e => setGratefulFor(e.target.value)} placeholder="One thing you're grateful for..." className="h-9 text-sm mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium flex items-center gap-1"><Target className="h-3 w-3 text-emerald-500" /> Tomorrow's #1 priority</label>
            <Input value={tomorrowPriority} onChange={e => setTomorrowPriority(e.target.value)} placeholder="The one thing that matters most tomorrow..." className="h-9 text-sm mt-1" />
          </div>

          <Button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Moon className="h-4 w-4 mr-1" /> Complete Evening Review
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {entries.filter(e => e.date !== today).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {entries.filter(e => e.date !== today).slice(0, 7).map((entry, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground">{new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[8px]">Day: {entry.dayRating}/10</Badge>
                    <Badge variant="outline" className="text-[8px]">Energy: {entry.energyLevel}/10</Badge>
                  </div>
                </div>
                {entry.win && <p className="text-[10px]"><strong>Win:</strong> {entry.win}</p>}
                {entry.lesson && <p className="text-[10px] text-muted-foreground"><strong>Lesson:</strong> {entry.lesson}</p>}
                {entry.tomorrowPriority && <p className="text-[10px] text-muted-foreground"><strong>Tomorrow:</strong> {entry.tomorrowPriority}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly Trends Analysis */}
      {entries.length >= 5 && (() => {
        const recent = entries.slice(0, 7)
        const chartW = 280; const chartH = 80; const padX = 10; const padY = 5
        const stepX = recent.length > 1 ? (chartW - padX * 2) / (recent.length - 1) : 0
        const reversed = [...recent].reverse()

        function toPath(data: number[], color: string) {
          return data.map((v, i) => {
            const x = padX + i * stepX
            const y = chartH - padY - ((v - 1) / 9) * (chartH - padY * 2)
            return `${i === 0 ? "M" : "L"} ${x} ${y}`
          }).join(" ")
        }
        const ratingPath = toPath(reversed.map(e => e.dayRating), "")
        const energyPath = toPath(reversed.map(e => e.energyLevel), "")
        const stressPath = toPath(reversed.map(e => e.stressLevel), "")

        // Win theme analysis
        const winThemes: Record<string, number> = { work: 0, family: 0, health: 0, personal: 0, creative: 0 }
        const winKeywords: Record<string, string[]> = {
          work: ["work", "job", "project", "meeting", "client", "team", "deadline", "shipped", "launched", "promotion", "career"],
          family: ["family", "kids", "wife", "husband", "partner", "son", "daughter", "mom", "dad", "parents", "friend"],
          health: ["exercise", "gym", "run", "walk", "sleep", "health", "workout", "yoga", "meditat", "energy"],
          personal: ["learn", "read", "book", "course", "skill", "habit", "goal", "progress", "improve"],
          creative: ["create", "write", "design", "build", "art", "music", "code", "idea", "paint", "photo"],
        }
        entries.forEach(e => {
          if (!e.win) return
          const lower = e.win.toLowerCase()
          Object.entries(winKeywords).forEach(([theme, keywords]) => {
            if (keywords.some(kw => lower.includes(kw))) winThemes[theme]++
          })
        })
        const topWinThemes = Object.entries(winThemes).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])

        // Day-of-week analysis
        const dayStats: Record<string, { energy: number[]; stress: number[]; rating: number[] }> = {}
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        entries.forEach(e => {
          const d = dayNames[new Date(e.date + "T12:00:00").getDay()]
          if (!dayStats[d]) dayStats[d] = { energy: [], stress: [], rating: [] }
          dayStats[d].energy.push(e.energyLevel)
          dayStats[d].stress.push(e.stressLevel)
          dayStats[d].rating.push(e.dayRating)
        })
        const dayAvgs = Object.entries(dayStats).map(([day, s]) => ({
          day, avgEnergy: s.energy.reduce((a, b) => a + b, 0) / s.energy.length,
          avgStress: s.stress.reduce((a, b) => a + b, 0) / s.stress.length,
        })).filter(d => d.avgEnergy > 0)
        const peakEnergy = dayAvgs.length > 0 ? dayAvgs.reduce((a, b) => a.avgEnergy > b.avgEnergy ? a : b).day : null
        const dipEnergy = dayAvgs.length > 0 ? dayAvgs.reduce((a, b) => a.avgEnergy < b.avgEnergy ? a : b).day : null
        const peakStress = dayAvgs.length > 0 ? dayAvgs.reduce((a, b) => a.avgStress > b.avgStress ? a : b).day : null

        return (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-500" /> Weekly Trends</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Sparkline charts */}
              <div>
                <p className="text-xs font-medium mb-1">Day Rating Trend (last {recent.length} entries)</p>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-20 bg-muted/30 rounded-lg">
                  <path d={ratingPath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {reversed.map((e, i) => (
                    <circle key={i} cx={padX + i * stepX} cy={chartH - padY - ((e.dayRating - 1) / 9) * (chartH - padY * 2)} r="3" fill="#6366f1" />
                  ))}
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium mb-1">Energy vs Stress</p>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-20 bg-muted/30 rounded-lg">
                  <path d={energyPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={stressPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
                  {reversed.map((e, i) => (
                    <g key={i}>
                      <circle cx={padX + i * stepX} cy={chartH - padY - ((e.energyLevel - 1) / 9) * (chartH - padY * 2)} r="2.5" fill="#3b82f6" />
                      <circle cx={padX + i * stepX} cy={chartH - padY - ((e.stressLevel - 1) / 9) * (chartH - padY * 2)} r="2.5" fill="#ef4444" />
                    </g>
                  ))}
                </svg>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] text-blue-600 flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Energy</span>
                  <span className="text-[10px] text-red-500 flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block border-dashed" /> Stress</span>
                </div>
              </div>

              {/* Win themes */}
              {topWinThemes.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Most Common Win Themes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topWinThemes.map(([theme, count]) => (
                      <Badge key={theme} variant="outline" className="text-xs capitalize">{theme} <span className="text-muted-foreground ml-1">({count})</span></Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-of-week insights */}
              {dayAvgs.length >= 3 && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  {peakEnergy && dipEnergy && peakEnergy !== dipEnergy && (
                    <p>Your energy peaks on <strong className="text-foreground">{peakEnergy}</strong> and dips on <strong className="text-foreground">{dipEnergy}</strong>.</p>
                  )}
                  {peakStress && (
                    <p>Your stress is highest on <strong className="text-foreground">{peakStress}</strong>.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })()}

      {/* The daily rhythm */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Your Daily Rhythm</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Morning:</strong> <a href="/morning-briefing" className="text-amber-600 hover:underline">Morning Briefing</a> — see your day, streaks, and wisdom</p>
            <p><strong>Throughout the day:</strong> <a href="/daily-habits" className="text-emerald-600 hover:underline">Daily Habits</a> — check off your routine</p>
            <p><strong>Any time:</strong> <a href="/gratitude" className="text-rose-600 hover:underline">Gratitude Journal</a> — 3 things, 90 seconds</p>
            <p><strong>Evening:</strong> <a href="/evening-review" className="text-indigo-600 hover:underline">Evening Review</a> — close the day with intention (you are here)</p>
            <p><strong>Weekly:</strong> <a href="/weekly-reflection" className="text-violet-600 hover:underline">Weekly Reflection</a> — zoom out, see the bigger picture</p>
          </div>
          <p className="text-xs text-violet-700 font-medium mt-2">
            This rhythm — morning intention, daily tracking, evening reflection — is the operating system of people who flourish.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
