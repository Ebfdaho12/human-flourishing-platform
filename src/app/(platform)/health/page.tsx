"use client"
import { useState, useCallback } from "react"
import useSWR from "swr"
import { Heart, Plus, Target, Sparkles, Activity, Moon, Dumbbell, Apple, Pill, Ruler, AlertCircle, Shield, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ENTRY_TYPES = [
  { value: "VITALS", label: "Vitals", icon: Activity, color: "text-rose-400", fields: [
    { name: "heartRate", label: "Heart Rate (bpm)", type: "number" },
    { name: "systolic", label: "BP Systolic", type: "number" },
    { name: "diastolic", label: "BP Diastolic", type: "number" },
    { name: "temperature", label: "Temperature (°F)", type: "number" },
    { name: "oxygenSat", label: "O₂ Saturation (%)", type: "number" },
  ]},
  { value: "EXERCISE", label: "Exercise", icon: Dumbbell, color: "text-orange-400", fields: [
    { name: "activity", label: "Activity", type: "text" },
    { name: "durationMin", label: "Duration (min)", type: "number" },
    { name: "intensity", label: "Intensity (1-10)", type: "number" },
    { name: "calories", label: "Calories burned", type: "number" },
  ]},
  { value: "SLEEP", label: "Sleep", icon: Moon, color: "text-indigo-400", fields: [
    { name: "hoursSlept", label: "Hours slept", type: "number" },
    { name: "quality", label: "Quality (1-10)", type: "number" },
    { name: "bedtime", label: "Bedtime", type: "time" },
    { name: "wakeTime", label: "Wake time", type: "time" },
  ]},
  { value: "NUTRITION", label: "Nutrition", icon: Apple, color: "text-green-400", fields: [
    { name: "meal", label: "Meal description", type: "text" },
    { name: "calories", label: "Calories (approx)", type: "number" },
    { name: "waterL", label: "Water (liters)", type: "number" },
  ]},
  { value: "MEASUREMENT", label: "Measurement", icon: Ruler, color: "text-cyan-400", fields: [
    { name: "weight", label: "Weight (lbs)", type: "number" },
    { name: "waist", label: "Waist (inches)", type: "number" },
    { name: "steps", label: "Steps today", type: "number" },
  ]},
  { value: "SYMPTOM", label: "Symptom", icon: AlertCircle, color: "text-yellow-400", fields: [
    { name: "symptom", label: "Symptom description", type: "text" },
    { name: "severity", label: "Severity (1-10)", type: "number" },
    { name: "duration", label: "Duration (hours)", type: "number" },
  ]},
  { value: "MEDICATION", label: "Medication", icon: Pill, color: "text-purple-400", fields: [
    { name: "name", label: "Medication name", type: "text" },
    { name: "dose", label: "Dose", type: "text" },
    { name: "taken", label: "Taken? (yes/no)", type: "text" },
  ]},
]

function getEntryMeta(type: string) {
  return ENTRY_TYPES.find((t) => t.value === type) ?? ENTRY_TYPES[0]
}

function formatEntryData(type: string, data: Record<string, string | number>) {
  const meta = getEntryMeta(type)
  return meta.fields
    .filter((f) => data[f.name] !== undefined && data[f.name] !== "")
    .map((f) => `${f.label}: ${data[f.name]}`)
    .join(" · ") || "No data recorded"
}

function LogEntryDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [entryType, setEntryType] = useState("VITALS")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const meta = getEntryMeta(entryType)
  const Icon = meta.icon

  async function handleSubmit() {
    setLoading(true)
    const numericData: Record<string, string | number> = {}
    meta.fields.forEach((f) => {
      const val = fields[f.name]
      if (val !== undefined && val !== "") {
        numericData[f.name] = f.type === "number" ? parseFloat(val) : val
      }
    })
    await fetch("/api/health/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryType, data: numericData, notes: notes || null }),
    })
    setLoading(false)
    setOpen(false)
    setFields({})
    setNotes("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Log Entry</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", meta.color)} />
            Log Health Entry
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Entry type</Label>
            <Select value={entryType} onValueChange={(v) => { setEntryType(v); setFields({}) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTRY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {meta.fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input
                id={f.name}
                type={f.type === "number" ? "number" : f.type === "time" ? "time" : "text"}
                value={fields[f.name] ?? ""}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddGoalDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [goalType, setGoalType] = useState("STEPS")
  const [title, setTitle] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  const GOAL_TYPES = [
    { value: "STEPS", label: "Daily Steps", unit: "steps/day" },
    { value: "WEIGHT", label: "Target Weight", unit: "lbs" },
    { value: "SLEEP_HOURS", label: "Sleep Duration", unit: "hours/night" },
    { value: "WATER_L", label: "Daily Water", unit: "liters/day" },
    { value: "EXERCISE_MIN", label: "Exercise Time", unit: "min/day" },
    { value: "CUSTOM", label: "Custom Goal", unit: "" },
  ]

  const selectedType = GOAL_TYPES.find((g) => g.value === goalType)

  async function handleSubmit() {
    if (!title || !targetValue) return
    setLoading(true)
    await fetch("/api/health/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalType, title,
        target: { value: parseFloat(targetValue) || targetValue, unit: selectedType?.unit },
        deadline: deadline || null,
      }),
    })
    setLoading(false)
    setOpen(false)
    setTitle("")
    setTargetValue("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Target className="h-4 w-4" /> Add Goal</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Set Health Goal</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Goal type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Goal title</Label>
            <Input placeholder="e.g. Walk 10,000 steps daily" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Target value ({selectedType?.unit || "unit"})</Label>
            <Input placeholder="e.g. 10000" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Target date (optional)</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title || !targetValue}>
            {loading ? "Saving..." : "Set goal · +10 FOUND"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TrendChart({ points, dataKey, label, color, unit }: { points: any[]; dataKey: string; label: string; color: string; unit?: string }) {
  const values = points.map((p) => p[dataKey]).filter((v): v is number => typeof v === "number")
  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{values[values.length - 1]}{unit ? ` ${unit}` : ""}</p>
      </div>
      <div className="flex items-end gap-[2px] h-16">
        {values.slice(-30).map((v, i) => {
          const height = Math.max(4, ((v - min) / range) * 100)
          return (
            <div
              key={i}
              className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{ height: `${height}%`, backgroundColor: color, minWidth: 3, opacity: 0.7 + (i / values.length) * 0.3 }}
              title={`${points[points.length - values.length + i]?.date}: ${v}${unit ? ` ${unit}` : ""}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Min: {min}{unit ? ` ${unit}` : ""}</span>
        <span>Avg: {Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10}{unit ? ` ${unit}` : ""}</span>
        <span>Max: {max}{unit ? ` ${unit}` : ""}</span>
      </div>
    </div>
  )
}

function HealthTrendsPanel() {
  const [trendType, setTrendType] = useState("VITALS")
  const [days, setDays] = useState(30)
  const { data } = useSWR(`/api/health/trends?type=${trendType}&days=${days}`, fetcher)

  const points: any[] = data?.points ?? []
  const summary: Record<string, any> = data?.summary ?? {}

  const TREND_CONFIGS: Record<string, { fields: { key: string; label: string; color: string; unit?: string }[] }> = {
    VITALS: { fields: [
      { key: "heartRate", label: "Heart Rate", color: "#f43f5e", unit: "bpm" },
      { key: "systolic", label: "BP Systolic", color: "#ef4444", unit: "mmHg" },
      { key: "diastolic", label: "BP Diastolic", color: "#f97316", unit: "mmHg" },
      { key: "oxygenSat", label: "O2 Saturation", color: "#06b6d4", unit: "%" },
    ]},
    EXERCISE: { fields: [
      { key: "durationMin", label: "Duration", color: "#f97316", unit: "min" },
      { key: "intensity", label: "Intensity", color: "#ef4444", unit: "/10" },
      { key: "calories", label: "Calories", color: "#eab308", unit: "kcal" },
    ]},
    SLEEP: { fields: [
      { key: "hoursSlept", label: "Hours Slept", color: "#6366f1", unit: "hrs" },
      { key: "quality", label: "Sleep Quality", color: "#8b5cf6", unit: "/10" },
    ]},
    MEASUREMENT: { fields: [
      { key: "weight", label: "Weight", color: "#06b6d4", unit: "lbs" },
      { key: "steps", label: "Steps", color: "#10b981", unit: "" },
      { key: "waist", label: "Waist", color: "#f59e0b", unit: "in" },
    ]},
    NUTRITION: { fields: [
      { key: "calories", label: "Calories", color: "#22c55e", unit: "kcal" },
      { key: "waterL", label: "Water", color: "#3b82f6", unit: "L" },
    ]},
  }

  const config = TREND_CONFIGS[trendType] ?? TREND_CONFIGS.VITALS

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={trendType} onValueChange={setTrendType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="VITALS">Vitals</SelectItem>
            <SelectItem value="EXERCISE">Exercise</SelectItem>
            <SelectItem value="SLEEP">Sleep</SelectItem>
            <SelectItem value="MEASUREMENT">Measurements</SelectItem>
            <SelectItem value="NUTRITION">Nutrition</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          {[7, 14, 30, 60, 90].map((d) => (
            <Button key={d} variant={days === d ? "default" : "outline"} size="sm" className="text-xs h-7 px-2" onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No {trendType.toLowerCase()} data in the last {days} days.</p>
            <p className="text-xs text-muted-foreground mt-1">Log some entries to see your trends.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-6">
              {config.fields.map((f) => (
                <TrendChart key={f.key} points={points} dataKey={f.key} label={f.label} color={f.color} unit={f.unit} />
              ))}
            </CardContent>
          </Card>

          {Object.keys(summary).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(summary).map(([key, stats]: [string, any]) => {
                const fieldMeta = config.fields.find((f) => f.key === key)
                return (
                  <Card key={key}>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{fieldMeta?.label ?? key}</p>
                      <p className="text-lg font-bold mt-1">{stats.latest}{fieldMeta?.unit ? ` ${fieldMeta.unit}` : ""}</p>
                      <p className="text-[10px] text-muted-foreground">{stats.count} readings · avg {stats.avg}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">{points.length} data points over {days} days</p>
        </div>
      )}
    </div>
  )
}

export default function HealthPage() {
  const { data: entriesData, mutate: mutateEntries } = useSWR("/api/health/entries?limit=50", fetcher)
  const { data: goalsData, mutate: mutateGoals } = useSWR("/api/health/goals", fetcher)
  const { data: insightsData, mutate: mutateInsights } = useSWR("/api/health/insights", fetcher)
  const [loadingInsight, setLoadingInsight] = useState(false)

  const entries: any[] = entriesData?.entries ?? []
  const goals: any[] = goalsData?.goals ?? []
  const insights: any[] = insightsData?.insights ?? []
  const hasApiKey: boolean = insightsData?.hasApiKey ?? false

  const refreshAll = useCallback(() => {
    mutateEntries()
    mutateGoals()
    mutateInsights()
  }, [mutateEntries, mutateGoals, mutateInsights])

  async function requestInsight() {
    setLoadingInsight(true)
    await fetch("/api/health/insights", { method: "POST" })
    setLoadingInsight(false)
    mutateInsights()
  }

  const activeGoals = goals.filter((g) => g.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Health Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your health data belongs to you.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <AddGoalDialog onSaved={refreshAll} />
          <LogEntryDialog onSaved={refreshAll} />
        </div>
      </div>

      {/* Anonymous Cases CTA */}
      <a href="/health/cases" className="block">
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 card-hover">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Anonymous Health Cases</p>
              <p className="text-xs text-muted-foreground">Share symptoms anonymously. Get practitioner proposals. Your identity stays hidden until you choose to connect.</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </a>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-rose-400">{entries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total entries</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Active goals</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{insights.length}</p>
              <p className="text-xs text-muted-foreground mt-1">AI insights</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Recent Entries</CardTitle></CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No entries yet. Use "Log Entry" to start tracking your health.
                </p>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 8).map((entry: any) => {
                    const meta = getEntryMeta(entry.entryType)
                    const Icon = meta.icon
                    const data = JSON.parse(entry.data || "{}")
                    return (
                      <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 px-3 py-2.5">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{meta.label}</span>
                            <Badge variant="outline" className="text-xs py-0">
                              {new Date(entry.recordedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{formatEntryData(entry.entryType, data)}</p>
                          {entry.notes && <p className="text-xs text-muted-foreground/60 mt-0.5 italic">{entry.notes}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {activeGoals.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Active Goals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {activeGoals.slice(0, 3).map((goal: any) => {
                  const target = JSON.parse(goal.target || "{}")
                  const current = goal.current ? JSON.parse(goal.current) : null
                  const pct = current && target.value ? Math.min(100, Math.round((current.value / target.value) * 100)) : 0
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        Target: {target.value} {target.unit}
                        {goal.deadline && ` · Due ${new Date(goal.deadline).toLocaleDateString()}`}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <HealthTrendsPanel />
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Entries</CardTitle>
              <CardDescription>{entries.length} entries recorded</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No entries yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry: any) => {
                    const meta = getEntryMeta(entry.entryType)
                    const Icon = meta.icon
                    const data = JSON.parse(entry.data || "{}")
                    return (
                      <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 px-3 py-3">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{meta.label}</span>
                            <Badge variant="outline" className="text-xs py-0">
                              {new Date(entry.recordedAt).toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatEntryData(entry.entryType, data)}</p>
                          {entry.notes && <p className="text-xs text-muted-foreground/60 mt-0.5 italic">{entry.notes}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <div className="space-y-3">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No goals yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Set your first goal to earn 10 FOUND.</p>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal: any) => {
                const target = JSON.parse(goal.target || "{}")
                const current = goal.current ? JSON.parse(goal.current) : null
                const pct = current && target.value ? Math.min(100, Math.round((current.value / target.value) * 100)) : 0
                return (
                  <Card key={goal.id} className={cn(!goal.isActive && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {goal.goalType} · Target: {target.value} {target.unit}
                            {goal.deadline && ` · Due ${new Date(goal.deadline).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge variant={goal.completedAt ? "default" : goal.isActive ? "secondary" : "outline"} className="text-xs">
                          {goal.completedAt ? "Done" : goal.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <Progress value={pct} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground">{pct}% toward goal</p>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4 space-y-4">
          {!hasApiKey && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">AI insights not yet enabled</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your Anthropic API key to <code className="bg-muted px-1 rounded text-xs">.env.local</code> to unlock personalized health analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {hasApiKey && entries.length > 0 && (
            <Button onClick={requestInsight} disabled={loadingInsight} className="w-full" variant="outline">
              <Sparkles className="h-4 w-4" />
              {loadingInsight ? "Analyzing your health data..." : "Generate new insight"}
            </Button>
          )}
          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No insights yet.</p>
                {entries.length === 0 && <p className="text-xs text-muted-foreground mt-1">Log some health entries first.</p>}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight: any) => (
                <Card key={insight.id} className={cn(!insight.isRead && "border-violet-500/30")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm leading-relaxed">{insight.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(insight.createdAt).toLocaleDateString()}
                          {insight.dataContext && ` · Based on ${insight.dataContext}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
