"use client"

import { useState, useEffect } from "react"
import { Heart, Plus, Sparkles, Calendar, TrendingUp, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GratitudeEntry {
  date: string
  items: string[]
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

export default function GratitudePage() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [item1, setItem1] = useState("")
  const [item2, setItem2] = useState("")
  const [item3, setItem3] = useState("")
  const today = getToday()

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hfp-gratitude")
      if (saved) setEntries(JSON.parse(saved))
    } catch {}
  }, [])

  function save(updated: GratitudeEntry[]) {
    setEntries(updated)
    localStorage.setItem("hfp-gratitude", JSON.stringify(updated))
  }

  function submit() {
    const items = [item1, item2, item3].filter(i => i.trim())
    if (items.length === 0) return
    const entry: GratitudeEntry = { date: today, items }
    const updated = [entry, ...entries.filter(e => e.date !== today)]
    save(updated)
    setItem1(""); setItem2(""); setItem3("")
  }

  const todayEntry = entries.find(e => e.date === today)
  const totalEntries = entries.length
  const totalItems = entries.reduce((sum, e) => sum + e.items.length, 0)

  // Streak
  let streak = 0
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length > 0) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    if (sorted[0].date === today || sorted[0].date === yesterday) {
      streak = 1
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].date)
        const curr = new Date(sorted[i].date)
        if ((prev.getTime() - curr.getTime()) / 86400000 === 1) streak++
        else break
      }
    }
  }

  // Word cloud - most common words
  const wordCounts: Record<string, number> = {}
  entries.forEach(e => e.items.forEach(item => {
    item.toLowerCase().split(/\s+/).forEach(w => {
      if (w.length > 3 && !["that", "this", "with", "from", "have", "been", "were", "very", "much", "really", "about", "their", "would", "could", "should"].includes(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1
      }
    })
  }))
  const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Gratitude Journal</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Three things. Every day. The simplest practice with the most research backing it.
        </p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science:</strong> Gratitude journaling for 21 days rewires your brain's reticular activating system to scan for positives instead of threats. UC Davis research shows: 25% happier, better sleep, more exercise, fewer physician visits, stronger immune response, and measurably higher life satisfaction. Three things. Takes 90 seconds. Changes your neurology.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <p className="text-xl font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-violet-500" />
            <p className="text-xl font-bold">{totalEntries}</p>
            <p className="text-[10px] text-muted-foreground">Days logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Heart className="h-4 w-4 mx-auto mb-1 text-rose-500" />
            <p className="text-xl font-bold">{totalItems}</p>
            <p className="text-[10px] text-muted-foreground">Gratitudes total</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's entry */}
      {todayEntry ? (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-700 mb-2">Today's Gratitudes ✓</p>
            <div className="space-y-1.5">
              {todayEntry.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-emerald-600 mt-2">You can update by submitting again.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">What are you grateful for today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Be specific. "My health" is generic. "The way my coffee tasted this morning" is real. Specificity activates the gratitude neural pathway more strongly.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-400 w-4">1.</span>
                <Input value={item1} onChange={e => setItem1(e.target.value)} placeholder="I'm grateful for..." className="h-9 text-sm" autoFocus />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-400 w-4">2.</span>
                <Input value={item2} onChange={e => setItem2(e.target.value)} placeholder="I'm grateful for..." className="h-9 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-400 w-4">3.</span>
                <Input value={item3} onChange={e => setItem3(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="I'm grateful for..." className="h-9 text-sm" />
              </div>
            </div>
            <Button onClick={submit} className="w-full bg-rose-500 hover:bg-rose-600" disabled={!item1.trim()}>
              <Heart className="h-4 w-4 mr-1" /> Save Today's Gratitudes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* What you're grateful for most (word cloud) */}
      {topWords.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">What You're Most Grateful For</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topWords.map(([word, count], i) => (
                <Badge key={i} variant="outline" className={cn("text-xs", i < 3 ? "border-rose-300 text-rose-700 bg-rose-50" : i < 7 ? "border-pink-200 text-pink-600" : "")}>
                  {word} <span className="text-muted-foreground ml-1">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Entries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {entries.slice(0, 14).map((entry, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <div className="space-y-1">
                  {entry.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Sparkles className="h-3 w-3 text-rose-300 shrink-0 mt-0.5" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/daily-habits" className="text-sm text-emerald-600 hover:underline">Daily Habits</a>
        <a href="/morning-briefing" className="text-sm text-amber-600 hover:underline">Morning Briefing</a>
        <a href="/evening-review" className="text-sm text-indigo-600 hover:underline">Evening Review</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/weekly-reflection" className="text-sm text-blue-600 hover:underline">Weekly Reflection</a>
      </div>
    </div>
  )
}
