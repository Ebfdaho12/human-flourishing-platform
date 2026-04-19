"use client"

import { useState } from "react"
import useSWR from "swr"
import { AlertCircle, Search, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const COMMON_SYMPTOMS = [
  "Headache", "Fatigue", "Back pain", "Insomnia", "Anxiety",
  "Nausea", "Dizziness", "Joint pain", "Stomach ache", "Chest tightness",
  "Brain fog", "Muscle ache", "Shortness of breath", "Skin rash", "Sore throat",
  "Bloating", "Heart palpitations", "Numbness", "Dry eyes", "Earache",
]

export default function SymptomTrackerPage() {
  const { data, mutate } = useSWR("/api/health/entries?limit=200", fetcher)
  const [symptomName, setSymptomName] = useState("")
  const [severity, setSeverity] = useState([5])
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [logging, setLogging] = useState(false)
  const [open, setOpen] = useState(false)

  const entries: any[] = (data?.entries ?? []).filter((e: any) => e.entryType === "SYMPTOM")

  // Group by symptom name for pattern analysis
  const symptomMap: Record<string, { entries: any[]; severities: number[]; dates: string[] }> = {}
  for (const e of entries) {
    const d = JSON.parse(e.data || "{}")
    const name = d.symptom ?? "Unknown"
    if (!symptomMap[name]) symptomMap[name] = { entries: [], severities: [], dates: [] }
    symptomMap[name].entries.push(e)
    if (d.severity) symptomMap[name].severities.push(d.severity)
    symptomMap[name].dates.push(e.recordedAt.split("T")[0])
  }

  const symptomPatterns = Object.entries(symptomMap)
    .map(([name, data]) => ({
      name,
      count: data.entries.length,
      avgSeverity: data.severities.length > 0
        ? Math.round((data.severities.reduce((a, b) => a + b, 0) / data.severities.length) * 10) / 10
        : null,
      lastOccurrence: data.dates[0],
      trending: data.dates.filter(d => {
        const daysDiff = (Date.now() - new Date(d).getTime()) / 86400000
        return daysDiff <= 7
      }).length,
    }))
    .sort((a, b) => b.count - a.count)

  async function logSymptom(name?: string) {
    const symptom = name ?? symptomName
    if (!symptom) return
    setLogging(true)
    await fetch("/api/health/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryType: "SYMPTOM",
        data: {
          symptom,
          severity: severity[0],
          duration: duration ? parseFloat(duration) : null,
        },
        notes: notes || null,
      }),
    })
    setLogging(false)
    setOpen(false)
    setSymptomName("")
    setSeverity([5])
    setDuration("")
    setNotes("")
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Symptom Tracker</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track symptoms over time. Find patterns. Share with your doctor.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><AlertCircle className="h-4 w-4" /> Log Symptom</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Log a Symptom</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Symptom</Label>
                <Input value={symptomName} onChange={e => setSymptomName(e.target.value)} placeholder="What are you experiencing?" />
                <div className="flex flex-wrap gap-1 mt-1">
                  {COMMON_SYMPTOMS.slice(0, 10).map(s => (
                    <button key={s} onClick={() => setSymptomName(s)}
                      className={cn("text-xs rounded-full border px-2 py-0.5 transition-colors",
                        symptomName === s ? "border-amber-400 bg-amber-50 text-amber-700" : "border-border hover:bg-muted"
                      )}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Severity: <span className="font-bold">{severity[0]}/10</span></Label>
                <Slider min={1} max={10} step={1} value={severity} onValueChange={setSeverity} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Mild</span><span>Severe</span></div>
              </div>
              <div className="space-y-1.5">
                <Label>Duration (hours, optional)</Label>
                <Input type="number" step="0.5" placeholder="e.g. 2" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Input placeholder="What were you doing? What did you eat?" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => logSymptom()} disabled={logging || !symptomName}>
                {logging ? "Logging..." : "Log symptom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick log common symptoms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Log</CardTitle>
          <CardDescription>Tap to log with default severity 5/10</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(s => (
              <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => logSymptom(s)} disabled={logging}>
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patterns */}
      {symptomPatterns.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Your Symptom Patterns ({entries.length} total logs)
          </h2>
          <div className="space-y-3">
            {symptomPatterns.map(pattern => (
              <Card key={pattern.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{pattern.name}</p>
                        {pattern.trending > 0 && (
                          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">
                            {pattern.trending}x this week
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pattern.count} occurrences
                        {pattern.avgSeverity && ` · Avg severity: ${pattern.avgSeverity}/10`}
                        {pattern.lastOccurrence && ` · Last: ${new Date(pattern.lastOccurrence).toLocaleDateString()}`}
                      </p>
                    </div>
                    {pattern.avgSeverity && (
                      <div className={cn("text-lg font-bold",
                        pattern.avgSeverity >= 7 ? "text-red-500" :
                        pattern.avgSeverity >= 4 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {pattern.avgSeverity}
                      </div>
                    )}
                  </div>
                  {/* Mini severity chart */}
                  {symptomMap[pattern.name].severities.length > 1 && (
                    <div className="flex items-end gap-[2px] h-8 mt-3">
                      {symptomMap[pattern.name].severities.slice(-14).map((s, i) => (
                        <div
                          key={i}
                          className={cn("flex-1 rounded-t", s >= 7 ? "bg-red-400" : s >= 4 ? "bg-amber-400" : "bg-emerald-400")}
                          style={{ height: `${(s / 10) * 100}%`, opacity: 0.5 + (i / 14) * 0.5 }}
                          title={`Severity: ${s}/10`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No symptoms logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Track symptoms to find patterns and share with your healthcare provider.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why track symptoms?</strong> Patterns emerge over time that you might not notice day-to-day.
            "Every Tuesday I get headaches" or "my joint pain is worse after eating gluten." This data is
            invaluable for doctors — it turns "I sometimes feel bad" into specific, actionable information.
            Use the Health Report page to generate a printable summary for your provider.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/report" className="text-sm text-rose-600 hover:underline">Generate Report →</a>
        <a href="/correlations" className="text-sm text-indigo-600 hover:underline">Find Correlations →</a>
      </div>
    </div>
  )
}
