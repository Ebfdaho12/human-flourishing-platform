"use client"

import { useState } from "react"
import useSWR from "swr"
import { Moon, Sun, Clock, TrendingUp, AlertTriangle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SleepPage() {
  const { data: entriesData, mutate } = useSWR("/api/health/entries?limit=100", fetcher)
  const { data: analysis } = useSWR("/api/health/sleep-analysis?days=30", fetcher)
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState("")
  const [quality, setQuality] = useState([7])
  const [bedtime, setBedtime] = useState("")
  const [wakeTime, setWakeTime] = useState("")
  const [notes, setNotes] = useState("")
  const [logging, setLogging] = useState(false)

  const entries: any[] = (entriesData?.entries ?? []).filter((e: any) => e.entryType === "SLEEP")
  const summary = analysis?.summary
  const weekdayAvg = analysis?.weekdayAvg ?? []
  const recommendations = analysis?.recommendations ?? []

  async function logSleep() {
    if (!hours) return
    setLogging(true)
    await fetch("/api/health/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryType: "SLEEP",
        data: {
          hoursSlept: parseFloat(hours),
          quality: quality[0],
          bedtime: bedtime || null,
          wakeTime: wakeTime || null,
        },
        notes: notes || null,
      }),
    })
    setLogging(false)
    setOpen(false)
    setHours(""); setQuality([7]); setBedtime(""); setWakeTime(""); setNotes("")
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <Moon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Sleep Tracker</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track sleep duration, quality, and patterns. Better sleep = better everything.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Log Sleep</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Log Last Night's Sleep</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Hours slept</Label>
                <Input type="number" step="0.5" placeholder="e.g. 7.5" value={hours} onChange={e => setHours(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Quality: <span className="font-bold">{quality[0]}/10</span></Label>
                <Slider min={1} max={10} step={1} value={quality} onValueChange={setQuality} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Terrible</span><span>Perfect</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Bedtime</Label>
                  <Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Wake time</Label>
                  <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Input placeholder="Dreams, disruptions, how you feel..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={logSleep} disabled={logging || !hours}>
                {logging ? "Logging..." : "Log sleep"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <Moon className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
              <p className="text-2xl font-bold text-indigo-600">{summary.avgHours}h</p>
              <p className="text-xs text-muted-foreground">Avg sleep</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-violet-500" />
              <p className="text-2xl font-bold text-violet-600">{summary.avgQuality ?? "—"}/10</p>
              <p className="text-xs text-muted-foreground">Avg quality</p>
            </CardContent>
          </Card>
          <Card className={cn("bg-gradient-to-br border", summary.totalDebt > 5 ? "from-red-50 to-orange-50 border-red-200" : "from-emerald-50 to-green-50 border-emerald-200")}>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              <p className={cn("text-2xl font-bold", summary.totalDebt > 5 ? "text-red-600" : "text-emerald-600")}>{summary.totalDebt}h</p>
              <p className="text-xs text-muted-foreground">Sleep debt</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-4 text-center">
              <Sun className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold text-amber-600">{summary.consistencyScore}%</p>
              <p className="text-xs text-muted-foreground">Consistency</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Day of week chart */}
      {weekdayAvg.length > 0 && weekdayAvg.some((d: any) => d.avg !== null) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Sleep by Day of Week</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-24">
              {weekdayAvg.map((d: any) => {
                const pct = d.avg ? (d.avg / 10) * 100 : 0
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    {d.avg && <p className="text-xs font-bold">{d.avg}h</p>}
                    <div className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${Math.max(4, pct)}%`, opacity: d.avg ? 0.8 : 0.1 }} />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-base">Sleep Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent logs */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Sleep Logs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.slice(0, 10).map((e: any) => {
                const d = JSON.parse(e.data || "{}")
                return (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{d.hoursSlept}h sleep</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.recordedAt).toLocaleDateString()}
                        {d.bedtime && ` · ${d.bedtime} → ${d.wakeTime ?? "?"}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {d.quality && <Badge variant="outline" className={cn("text-xs", d.quality >= 7 ? "border-emerald-300 text-emerald-600" : d.quality >= 4 ? "border-amber-300 text-amber-600" : "border-red-300 text-red-600")}>{d.quality}/10</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Moon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No sleep data yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Log your sleep to see patterns, debt calculations, and personalized insights.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/correlations" className="text-sm text-indigo-600 hover:underline">Sleep Correlations →</a>
      </div>
    </div>
  )
}
