"use client"

import { useState } from "react"
import useSWR from "swr"
import { Heart, Plus, Sparkles, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function GratitudePage() {
  const { data, mutate } = useSWR("/api/mental-health/journal?limit=50", fetcher)
  const [items, setItems] = useState(["", "", ""])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Filter to gratitude entries
  const allEntries: any[] = data?.entries ?? []
  const gratitudeEntries = allEntries.filter((e: any) => e.title?.startsWith("Gratitude:"))

  // Group by date
  const byDate: Record<string, any[]> = {}
  for (const e of gratitudeEntries) {
    const date = new Date(e.createdAt).toISOString().split("T")[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(e)
  }

  const today = new Date().toISOString().split("T")[0]
  const didToday = !!byDate[today]
  const streak = (() => {
    let s = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().split("T")[0]
      if (byDate[key]) { s++; d.setDate(d.getDate() - 1) }
      else if (s === 0 && key === today) { d.setDate(d.getDate() - 1) } // Allow today to be pending
      else break
    }
    return s
  })()

  async function saveGratitude() {
    const filled = items.filter(i => i.trim())
    if (filled.length === 0) return
    setSaving(true)

    await fetch("/api/mental-health/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Gratitude: ${new Date().toLocaleDateString()}`,
        content: filled.map((item, i) => `${i + 1}. ${item}`).join("\n"),
      }),
    })

    setSaving(false)
    setSaved(true)
    setItems(["", "", ""])
    mutate()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Gratitude Journal</h1>
        </div>
        <p className="text-sm text-muted-foreground">Three good things. Every day. It rewires your brain for positivity.</p>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn("border-2", didToday ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30")}>
          <CardContent className="p-4 text-center">
            <Sparkles className={cn("h-5 w-5 mx-auto mb-1", didToday ? "text-emerald-500" : "text-amber-500")} />
            <p className="text-2xl font-bold">{didToday ? "Done!" : "Not yet"}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600">{streak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's entry */}
      {!didToday && (
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What are you grateful for today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg font-bold text-rose-400 w-6 text-center">{i + 1}</span>
                <Input
                  value={item}
                  onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n) }}
                  placeholder={i === 0 ? "Something good that happened..." : i === 1 ? "Someone you appreciate..." : "A small moment of joy..."}
                  className="flex-1"
                />
              </div>
            ))}
            <Button
              onClick={saveGratitude}
              disabled={saving || items.every(i => !i.trim())}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white"
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save today's gratitude"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {Object.keys(byDate).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Gratitude History ({gratitudeEntries.length} entries)
          </h2>
          <div className="space-y-3">
            {Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, entries]) => (
              <Card key={date} className="border-rose-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-rose-400" />
                    <p className="text-sm font-medium">
                      {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  {entries.map((e: any) => (
                    <p key={e.id} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{e.content}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-rose-100 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science:</strong> Research by Dr. Robert Emmons at UC Davis showed that people who wrote
            down three things they were grateful for each day reported 25% higher well-being, exercised more,
            had fewer physical symptoms, and felt better about their lives overall. The effect is strongest when
            practiced consistently — hence the streak tracker.
          </p>
        </CardContent>
      </Card>

      <a href="/mental-health" className="text-sm text-pink-600 hover:underline block">← Mental Health</a>
    </div>
  )
}
