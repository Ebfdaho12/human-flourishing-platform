"use client"

import { useState, useEffect } from "react"
import { Droplets, Plus, Minus, Flame, GlassWater, Trophy, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface WaterEntry { amount: number; time: string }
interface DayLog { date: string; entries: WaterEntry[]; total: number }

const STORAGE_KEY = "hfp-water-log"
const today = () => new Date().toISOString().slice(0, 10)
const fmt = (ml: number) => ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`

function loadLog(): DayLog[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
}
function saveLog(log: DayLog[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)) }

export default function WaterTrackerPage() {
  const [log, setLog] = useState<DayLog[]>([])
  const [goal, setGoal] = useState(2500)
  const [customAmt, setCustomAmt] = useState(300)
  const [showSigns, setShowSigns] = useState(false)

  useEffect(() => { setLog(loadLog()) }, [])

  const todayLog = log.find(d => d.date === today())
  const current = todayLog?.total || 0
  const pct = Math.min(100, Math.round((current / goal) * 100))
  const fillHeight = Math.min(100, (current / goal) * 100)

  function addWater(ml: number) {
    const entry: WaterEntry = { amount: ml, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    const updated = [...log]
    const idx = updated.findIndex(d => d.date === today())
    if (idx >= 0) { updated[idx].entries.push(entry); updated[idx].total += ml }
    else updated.push({ date: today(), entries: [entry], total: ml })
    setLog(updated); saveLog(updated)
  }

  // 7-day history
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const day = log.find(l => l.date === key)
    return { label: d.toLocaleDateString([], { weekday: "short" }), total: day?.total || 0, date: key }
  })
  const maxBar = Math.max(goal, ...last7.map(d => d.total))

  // Streak
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const day = log.find(l => l.date === key)
    if (day && day.total >= goal) streak++; else break
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Hydration Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">Track daily water intake. Hydration is structural, not optional.</p>
      </div>

      {/* Visual glass + progress */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-2 border-sky-200">
          <CardContent className="p-5 flex flex-col items-center">
            <div className="relative w-24 h-40 rounded-b-2xl rounded-t-md border-4 border-sky-300 overflow-hidden bg-sky-50/40 mb-3">
              <div className={cn("absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-sky-300 transition-all duration-700 ease-out")} style={{ height: `${fillHeight}%` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-sky-900 drop-shadow">{pct}%</span>
              </div>
            </div>
            <p className="text-lg font-bold">{fmt(current)} <span className="text-muted-foreground font-normal text-sm">/ {fmt(goal)}</span></p>
            {pct >= 100 && <Badge className="bg-emerald-100 text-emerald-700 mt-1">Goal Reached!</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Add</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[{ ml: 250, label: "Glass", icon: "🥤" }, { ml: 500, label: "Bottle", icon: "🧴" }, { ml: 750, label: "Large", icon: "🫗" }].map(b => (
                <Button key={b.ml} variant="outline" className="justify-start text-xs" onClick={() => addWater(b.ml)}>
                  <Plus className="h-3 w-3 mr-1" /> {b.icon} {b.ml}ml
                </Button>
              ))}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => addWater(customAmt)}>
                  <Plus className="h-3 w-3 mr-1" /> {customAmt}ml
                </Button>
                <div className="flex flex-col">
                  <button onClick={() => setCustomAmt(a => Math.min(2000, a + 50))} className="text-[10px] px-1 hover:bg-muted rounded"><ChevronUp className="h-3 w-3" /></button>
                  <button onClick={() => setCustomAmt(a => Math.max(50, a - 50))} className="text-[10px] px-1 hover:bg-muted rounded"><ChevronDown className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Goal:</span>
              <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setGoal(g => Math.max(500, g - 250))}><Minus className="h-3 w-3" /></Button>
              <span className="font-semibold text-foreground">{fmt(goal)}</span>
              <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setGoal(g => Math.min(6000, g + 250))}><Plus className="h-3 w-3" /></Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Recommendation: body weight (lbs) ÷ 2 = oz/day. E.g., 160 lbs → 80 oz ≈ 2.4L</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak + Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, color: "text-amber-500", val: streak, label: "Day Streak" },
          { icon: GlassWater, color: "text-sky-500", val: todayLog?.entries.length || 0, label: "Drinks Today" },
          { icon: Flame, color: "text-orange-500", val: fmt(last7.reduce((s, d) => s + d.total, 0)), label: "7-Day Total" },
        ].map(s => (
          <Card key={s.label} className="text-center"><CardContent className="p-3">
            <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
            <p className="text-xl font-bold">{s.val}</p><p className="text-[10px] text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* 7-day bar chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">7-Day History</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="flex items-end gap-2 h-28">
            {last7.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium">{d.total > 0 ? fmt(d.total) : ""}</span>
                <div className="w-full rounded-t bg-sky-100 relative" style={{ height: "100%" }}>
                  <div className={cn("absolute bottom-0 left-0 right-0 rounded-t", d.total >= goal ? "bg-emerald-400" : "bg-sky-400")} style={{ height: `${maxBar ? (d.total / maxBar) * 100 : 0}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{d.label}</span>
              </div>))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-400" /> Goal+</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-sky-400" /> Below</span>
          </div>
        </CardContent>
      </Card>

      {todayLog && todayLog.entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Today&apos;s Log</CardTitle></CardHeader>
          <CardContent className="p-4"><div className="space-y-1 max-h-40 overflow-y-auto">
            {todayLog.entries.map((e, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0">
                <span className="text-muted-foreground">{e.time}</span>
                <Badge variant="outline" className="text-[10px]">+{fmt(e.amount)}</Badge>
              </div>))}
          </div></CardContent>
        </Card>)}

      <Card className="border-sky-200 bg-sky-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-1">Why Hydration Is Structural</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Explain tip="The web of connective tissue surrounding every muscle, nerve, and organ — it holds you together">Fascia</Explain>&apos;s ground substance is primarily <Explain tip="A molecule holding up to 1,000x its weight in water — keeps joints lubricated and tissue hydrated">hyaluronic acid</Explain> and water. Dehydrated fascia becomes stiff, painful, and adhesion-prone. Hydration is structural — it directly affects movement, not just kidney function. Pair water with <Explain tip="Minerals like sodium, potassium, magnesium that carry electrical signals in your body">electrolytes</Explain> for actual cellular hydration.
          </p>
        </CardContent>
      </Card>

      {/* Dehydration signs */}
      <button onClick={() => setShowSigns(!showSigns)} className="flex items-center gap-2 text-sm font-semibold w-full text-left">
        <AlertTriangle className="h-4 w-4 text-amber-500" /> Signs of Dehydration
        {showSigns ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
      </button>
      {showSigns && (
        <div className="grid grid-cols-2 gap-2">
          {["Dark urine (aim for pale yellow)", "Headache or brain fog", "Fatigue and low energy", "Dry mouth and cracked lips", "Reduced cognitive performance", "Dizziness on standing", "Muscle cramps", "Poor skin elasticity"].map(s => (
            <div key={s} className="flex items-start gap-1.5 text-xs text-muted-foreground"><span className="text-amber-500 mt-0.5">•</span>{s}</div>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/nutrition" className="text-sm text-emerald-600 hover:underline">Nutrition</a>
        <a href="/energy-management" className="text-sm text-amber-600 hover:underline">Energy Management</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
      </div>
    </div>
  )
}
