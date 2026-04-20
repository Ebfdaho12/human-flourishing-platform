"use client"

import { useState, useEffect } from "react"
import { Trophy, Plus, Star, Sparkles, Heart, Trash2, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Win {
  id: string
  text: string
  category: string
  date: string
  size: "small" | "medium" | "big"
}

const CATEGORIES = [
  { value: "health", label: "Health", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { value: "career", label: "Career", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "family", label: "Family", color: "bg-rose-100 text-rose-700 border-rose-300" },
  { value: "financial", label: "Financial", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "personal", label: "Personal Growth", color: "bg-violet-100 text-violet-700 border-violet-300" },
  { value: "social", label: "Social", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  { value: "other", label: "Other", color: "bg-slate-100 text-slate-700 border-slate-300" },
]

const SIZE_LABELS = { small: "Daily Win", medium: "Weekly Win", big: "Major Win" }
const SIZE_ICONS = { small: ".", medium: "!", big: "!!" }

const PROMPTS = [
  "What went well today?",
  "What are you proud of this week?",
  "What obstacle did you overcome recently?",
  "What skill did you improve?",
  "What relationship got stronger?",
  "What did you do for your health?",
  "What financial progress did you make?",
  "What made you smile today?",
  "What did your child do that made you proud?",
  "What fear did you face?",
]

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState("")
  const [newCategory, setNewCategory] = useState("personal")
  const [newSize, setNewSize] = useState<Win["size"]>("small")
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-wins")
    if (stored) setWins(JSON.parse(stored))
  }, [])

  function save(updated: Win[]) {
    setWins(updated)
    localStorage.setItem("hfp-wins", JSON.stringify(updated))
  }

  function addWin() {
    if (!newText.trim()) return
    save([{
      id: Date.now().toString(36),
      text: newText.trim(),
      category: newCategory,
      date: new Date().toISOString(),
      size: newSize,
    }, ...wins])
    setNewText("")
    setShowAdd(false)
  }

  function removeWin(id: string) {
    save(wins.filter(w => w.id !== id))
  }

  // Group by month
  const byMonth: Record<string, Win[]> = {}
  for (const win of wins) {
    const key = new Date(win.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(win)
  }

  const streak = calculateStreak(wins)
  const thisWeek = wins.filter(w => {
    const d = new Date(w.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Wins & Gratitude</h1>
          </div>
          <p className="text-sm text-muted-foreground">Celebrate every win. Your brain forgets progress — this page does not.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Win</Button>
      </div>

      {/* Stats */}
      {wins.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{wins.length}</p>
              <p className="text-xs text-muted-foreground">Total wins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{thisWeek}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{streak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card className="border-2 border-amber-200 bg-amber-50/20">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground italic">{prompt}</p>
            <Input value={newText} onChange={e => setNewText(e.target.value)}
              placeholder="What's your win?"
              onKeyDown={e => e.key === "Enter" && addWin()} />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setNewCategory(c.value)}
                  className={cn("rounded-full px-2.5 py-0.5 text-[10px] border transition-all",
                    newCategory === c.value ? c.color + " font-semibold" : "border-border text-muted-foreground hover:bg-muted/50"
                  )}>{c.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["small", "medium", "big"] as const).map(s => (
                <button key={s} onClick={() => setNewSize(s)}
                  className={cn("rounded-lg border px-3 py-1.5 text-xs transition-all flex items-center gap-1.5",
                    newSize === s ? "border-amber-400 bg-amber-50 font-semibold text-amber-700" : "border-border text-muted-foreground"
                  )}>
                  {s === "big" && <Star className="h-3 w-3" />}
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
            <Button onClick={addWin} disabled={!newText.trim()} className="w-full">
              <Sparkles className="h-4 w-4" /> Log This Win
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wins by month */}
      {Object.keys(byMonth).length > 0 ? (
        <div className="space-y-5">
          {Object.entries(byMonth).map(([month, monthWins]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{month}</p>
                <Badge variant="outline" className="text-[9px]">{monthWins.length}</Badge>
              </div>
              <div className="space-y-2">
                {monthWins.map(win => {
                  const cat = CATEGORIES.find(c => c.value === win.category)
                  return (
                    <Card key={win.id} className={cn("card-hover",
                      win.size === "big" ? "border-amber-200 bg-amber-50/10" : ""
                    )}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className={cn("mt-0.5 shrink-0",
                          win.size === "big" ? "text-amber-500" :
                          win.size === "medium" ? "text-violet-400" : "text-muted-foreground/30"
                        )}>
                          {win.size === "big" ? <Star className="h-4 w-4 fill-current" /> :
                           win.size === "medium" ? <Star className="h-4 w-4" /> :
                           <Sparkles className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", win.size === "big" && "font-semibold")}>{win.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {cat && <Badge variant="outline" className={cn("text-[9px]", cat.color)}>{cat.label}</Badge>}
                            <span className="text-[10px] text-muted-foreground">{new Date(win.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => removeWin(win.id)}
                          className="p-1 text-muted-foreground/20 hover:text-destructive shrink-0">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : !showAdd && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No wins logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start small. Drank enough water today? That is a win. Showed up for your kids? Win. Made dinner instead of ordering? Win.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why log wins?</strong> Your brain has a negativity bias — it remembers failures 3x more vividly than successes.
            After a month of logging wins, you have undeniable proof that you ARE making progress, even on hard days.
            Research from Harvard Business School found that people who reflected on daily progress — no matter how
            small — were significantly more motivated, creative, and productive than those who did not.
            The wins add up. This page proves it.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/mental-health/gratitude" className="text-sm text-rose-600 hover:underline">Gratitude Journal</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/life-wheel" className="text-sm text-violet-600 hover:underline">Life Wheel</a>
      </div>
    </div>
  )
}

function calculateStreak(wins: Win[]): number {
  if (wins.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  const day = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dayStr = day.toISOString().split("T")[0]
    const hasWin = wins.some(w => w.date.startsWith(dayStr))
    if (hasWin) {
      streak++
      day.setDate(day.getDate() - 1)
    } else if (i === 0) {
      // Today has no wins yet — check from yesterday
      day.setDate(day.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
