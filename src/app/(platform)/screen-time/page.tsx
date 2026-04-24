"use client"

import { useState, useEffect, useMemo } from "react"
import { Monitor, Plus, TrendingDown, Clock, AlertTriangle, Users, Baby, Brain, Trash2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface DayLog {
  date: string
  members: { name: string; hours: number; productive: number }[]
}

interface FamilyMember {
  name: string
  ageGroup: "adult" | "teen" | "child" | "toddler"
}

const AGE_LIMITS: Record<string, { recommended: string; max: number; note: string }> = {
  toddler: { recommended: "0-1 hour", max: 1, note: "AAP recommends no screen time under 18 months except video calls. Ages 2-5: max 1 hour/day of high-quality programming with a parent present." },
  child: { recommended: "1-2 hours", max: 2, note: "Ages 6-12: focus on balance. Every hour of screen time should be matched with physical activity. No screens during meals or 1 hour before bed." },
  teen: { recommended: "2-3 hours", max: 3, note: "Ages 13-17: social media is the biggest risk. Not all screen time is equal — coding and learning count differently than scrolling. Set boundaries together, not top-down." },
  adult: { recommended: "Mindful use", max: 4, note: "Adults average 7+ hours/day of non-work screen time. The goal is not zero — it is intentional. Ask: am I choosing this, or am I defaulting to it because I am tired?" },
}

const ALTERNATIVES = [
  { instead: "Scrolling social media", try: "Read a book for 20 minutes", time: "Same 20 min, 10x more value" },
  { instead: "YouTube rabbit hole", try: "Go for a family walk", time: "30 min of connection + exercise" },
  { instead: "TV while eating", try: "Conversation cards at dinner", time: "Ask: what was the best part of your day?" },
  { instead: "Kids on tablets after school", try: "30 min outdoor play then a project together", time: "Lego, cooking, drawing, fort building" },
  { instead: "Falling asleep to Netflix", try: "Read or listen to an audiobook", time: "Better sleep quality, calmer mind" },
  { instead: "Checking phone first thing", try: "5 min stretch + gratitude journal", time: "Sets a completely different tone for the day" },
  { instead: "Background TV all day", try: "Music or podcasts instead", time: "Background TV fragments attention even when not watching" },
]

const IMPACT_DATA = [
  { stat: "Average child screen time", value: "7.5 hours/day", trend: "up", note: "Up from 4.5 hours pre-2020. More than they spend in school." },
  { stat: "Average adult non-work screen time", value: "7+ hours/day", trend: "up", note: "Includes phone, TV, tablet, gaming. Does not count work screen time." },
  { stat: "Phone pickups per day", value: "96 times", trend: "up", note: "Average person picks up their phone 96 times per day — once every 10 minutes while awake." },
  { stat: "Attention span (sustained focus)", value: "47 seconds", trend: "down", note: "Down from 2.5 minutes in 2004. We can barely focus on one thing for a minute." },
  { stat: "Teen anxiety since smartphones", value: "+70%", trend: "up", note: "Teen anxiety and depression surged 70% between 2012-2019, correlating with smartphone adoption." },
  { stat: "Sleep quality with screens before bed", value: "-40%", trend: "down", note: "Blue light suppresses melatonin. Stimulating content keeps the brain in alert mode. Both wreck sleep." },
  { stat: "Reading scores since tablets in schools", value: "-14%", trend: "down", note: "OECD PISA 2023. Countries that removed screens from schools saw immediate improvement." },
]

export default function ScreenTimePage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [logs, setLogs] = useState<DayLog[]>([])
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState<FamilyMember["ageGroup"]>("child")
  const [todayLog, setTodayLog] = useState<Record<string, { hours: number; productive: number }>>({})

  useEffect(() => {
    const stored = localStorage.getItem("hfp-screen-time")
    if (stored) {
      const data = JSON.parse(stored)
      setMembers(data.members ?? [])
      setLogs(data.logs ?? [])
      setTodayLog(data.todayLog ?? {})
    }
  }, [])

  function save(m: FamilyMember[], l: DayLog[], t: typeof todayLog) {
    setMembers(m); setLogs(l); setTodayLog(t)
    localStorage.setItem("hfp-screen-time", JSON.stringify({ members: m, logs: l, todayLog: t }))
  }

  function addMember() {
    if (!newName.trim()) return
    save([...members, { name: newName.trim(), ageGroup: newAge }], logs, todayLog)
    setNewName("")
  }

  function removeMember(name: string) {
    save(members.filter(m => m.name !== name), logs, { ...todayLog, [name]: undefined } as any)
  }

  function updateToday(name: string, field: "hours" | "productive", value: number) {
    const updated = { ...todayLog, [name]: { ...(todayLog[name] || { hours: 0, productive: 0 }), [field]: value } }
    save(members, logs, updated)
  }

  function logDay() {
    const today = new Date().toISOString().split("T")[0]
    const dayLog: DayLog = {
      date: today,
      members: members.map(m => ({
        name: m.name,
        hours: todayLog[m.name]?.hours || 0,
        productive: todayLog[m.name]?.productive || 0,
      })),
    }
    save(members, [dayLog, ...logs.filter(l => l.date !== today)].slice(0, 90), {})
  }

  const totalToday = Object.values(todayLog).reduce((s, v) => s + (v?.hours || 0), 0)

  const analytics = useMemo(() => {
    if (logs.length < 2) return null
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const last14: { key: string; label: string; total: number; productive: number }[] = []
    const dateMap: Record<string, DayLog> = {}
    sorted.forEach(l => { dateMap[l.date] = l })
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const k = d.toISOString().split("T")[0]
      const log = dateMap[k]
      const total = log ? log.members.reduce((s, m) => s + m.hours, 0) : 0
      const productive = log ? log.members.reduce((s, m) => s + m.productive, 0) : 0
      last14.push({ key: k, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], total, productive })
    }
    const avg14 = last14.reduce((s, d) => s + d.total, 0) / 14
    const last7 = last14.slice(-7).reduce((s, d) => s + d.total, 0) / 7
    const prior7 = last14.slice(0, 7).reduce((s, d) => s + d.total, 0) / 7
    const delta = last7 - prior7

    const byMember: Record<string, { total: number; productive: number; days: number }> = {}
    last14.forEach(d => {
      const log = dateMap[d.key]
      if (!log) return
      log.members.forEach(m => {
        if (!byMember[m.name]) byMember[m.name] = { total: 0, productive: 0, days: 0 }
        byMember[m.name].total += m.hours
        byMember[m.name].productive += m.productive
        byMember[m.name].days += 1
      })
    })

    return { last14, avg14, last7, prior7, delta, byMember }
  }, [logs])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Family Screen Time</h1>
        </div>
        <p className="text-sm text-muted-foreground">Track it. See it. Reduce it intentionally — not by banning, but by replacing.</p>
      </div>

      {/* Impact data */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" /> The Data
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {IMPACT_DATA.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1"><p className="text-xs text-muted-foreground">{d.stat}</p></div>
              <div className="text-right shrink-0">
                <p className={cn("text-xs font-bold", d.trend === "up" ? "text-red-500" : "text-red-500")}>{d.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 14-day trend */}
      {analytics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" /> Family Screen Time — Last 14 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-1 h-16">
              {analytics.last14.map((d, i) => {
                const max = Math.max(...analytics.last14.map(x => x.total), 8)
                const h = (d.total / max) * 100
                const prodH = (d.productive / max) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full relative" style={{ height: `${h}%`, minHeight: d.total > 0 ? 4 : 0 }}>
                      <div className={cn("absolute inset-x-0 bottom-0 rounded-t", d.total > 6 ? "bg-rose-400" : d.total > 3 ? "bg-amber-400" : d.total > 0 ? "bg-emerald-400" : "bg-slate-100")} style={{ height: "100%" }} title={`${d.total.toFixed(1)}h total, ${d.productive.toFixed(1)}h productive`} />
                      {d.productive > 0 && (
                        <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t opacity-70" style={{ height: `${(d.productive / d.total) * 100}%` }} />
                      )}
                    </div>
                    <span className="text-[8px] text-muted-foreground">{d.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border p-2 text-center"><p className="text-[10px] text-muted-foreground uppercase">14d avg</p><p className="font-bold tabular-nums">{analytics.avg14.toFixed(1)}h</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-[10px] text-muted-foreground uppercase">Last 7d</p><p className="font-bold tabular-nums">{analytics.last7.toFixed(1)}h</p></div>
              <div className="rounded-lg border p-2 text-center"><p className="text-[10px] text-muted-foreground uppercase">Week delta</p><p className={cn("font-bold tabular-nums", analytics.delta < 0 ? "text-emerald-600" : "text-amber-600")}>{analytics.delta > 0 ? "+" : ""}{analytics.delta.toFixed(1)}h</p></div>
            </div>
            {Object.keys(analytics.byMember).length > 1 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Per member (14d avg/day)</p>
                <div className="space-y-1">
                  {Object.entries(analytics.byMember).sort((a, b) => b[1].total - a[1].total).map(([name, s]) => {
                    const avg = s.days > 0 ? s.total / s.days : 0
                    const prodPct = s.total > 0 ? (s.productive / s.total) * 100 : 0
                    const maxAvg = Math.max(...Object.values(analytics.byMember).map(x => x.days > 0 ? x.total / x.days : 0), 1)
                    return (
                      <div key={name} className="flex items-center gap-2 text-xs">
                        <span className="w-20 truncate">{name}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${(avg / maxAvg) * 100}%` }} />
                        </div>
                        <span className="w-20 text-right tabular-nums text-[10px] font-mono">{avg.toFixed(1)}h · {Math.round(prodPct)}% prod</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add family members */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Family</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="flex-1"
              onKeyDown={e => e.key === "Enter" && addMember()} />
            <select value={newAge} onChange={e => setNewAge(e.target.value as any)}
              className="text-xs rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="toddler">Toddler (0-5)</option>
              <option value="child">Child (6-12)</option>
              <option value="teen">Teen (13-17)</option>
              <option value="adult">Adult</option>
            </select>
            <Button onClick={addMember} disabled={!newName.trim()}><Plus className="h-4 w-4" /></Button>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              {members.map(m => {
                const limits = AGE_LIMITS[m.ageGroup]
                const today = todayLog[m.name] || { hours: 0, productive: 0 }
                const overLimit = today.hours > limits.max
                return (
                  <Card key={m.name} className={cn(overLimit ? "border-red-200 bg-red-50/10" : "")}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.name}</span>
                          <Badge variant="outline" className="text-[9px]">{m.ageGroup}</Badge>
                          <span className="text-[10px] text-muted-foreground">Recommended: {limits.recommended}</span>
                        </div>
                        <button onClick={() => removeMember(m.name)} className="text-muted-foreground/30 hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Total screen hours today</label>
                          <Input type="number" step="0.5" min={0} max={24}
                            value={today.hours || ""}
                            onChange={e => updateToday(m.name, "hours", Number(e.target.value) || 0)}
                            className={cn("h-8 text-sm", overLimit ? "border-red-300" : "")} />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Of which productive/educational</label>
                          <Input type="number" step="0.5" min={0} max={24}
                            value={today.productive || ""}
                            onChange={e => updateToday(m.name, "productive", Number(e.target.value) || 0)}
                            className="h-8 text-sm" />
                        </div>
                      </div>
                      {overLimit && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" /> Over recommended limit ({limits.max}h) by {(today.hours - limits.max).toFixed(1)}h
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              <Button onClick={logDay} className="w-full" size="sm">Log Today's Screen Time</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternatives */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-500" /> Replace, Don't Ban
        </CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Banning screens creates resistance. Replacing screen time with something BETTER creates new habits.
            The goal is not zero screens — it is intentional use.
          </p>
          <div className="space-y-2">
            {ALTERNATIVES.map((a, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5 flex items-start gap-3">
                <div className="text-red-400 shrink-0 mt-0.5"><Monitor className="h-3.5 w-3.5" /></div>
                <div className="flex-1">
                  <p className="text-xs"><span className="text-red-500 line-through">{a.instead}</span></p>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">→ {a.try}</p>
                  <p className="text-[10px] text-muted-foreground italic">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age-specific guidelines */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(AGE_LIMITS).map(([key, val]) => (
          <Card key={key}>
            <CardContent className="p-3">
              <p className="text-xs font-semibold capitalize mb-1">{key === "toddler" ? "Toddler (0-5)" : key === "child" ? "Child (6-12)" : key === "teen" ? "Teen (13-17)" : "Adult"}</p>
              <p className="text-sm font-bold text-blue-600 mb-1">{val.recommended}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{val.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The real solution is presence.</strong> Children do not crave screens — they crave engagement.
            A child with a present parent who reads, plays, and talks with them naturally has less screen time
            because the screen is filling a void that a person should fill. This connects directly to the
            <a href="/family-economics" className="text-violet-600 hover:underline mx-1">family economics</a>
            argument: a parent at home reduces screen time not by rules, but by being there.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/family-meeting" className="text-sm text-violet-600 hover:underline">Family Meeting</a>
        <a href="/relationships" className="text-sm text-rose-600 hover:underline">Relationships</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
      </div>
    </div>
  )
}
