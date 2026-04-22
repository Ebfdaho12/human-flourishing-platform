"use client"

import { useState } from "react"
import { Droplets, Plus, Minus, Flame, GlassWater, Trophy, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { SourceList } from "@/components/ui/source-citation"
import Link from "next/link"

interface WaterEntry { amount: number; time: string }
interface DayLog { date: string; entries: WaterEntry[]; total: number }

const today = () => new Date().toISOString().slice(0, 10)
const fmt = (ml: number) => ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`

export default function WaterTrackerPage() {
  const [log, saveLog] = useSyncedStorage<DayLog[]>("hfp-water-log", [])
  const [goal, setGoal] = useState(2500)
  const [customAmt, setCustomAmt] = useState(300)
  const [showSigns, setShowSigns] = useState(false)

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
    saveLog(updated)
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

  // Hydration insights — computed from last7
  const daysWithData = last7.filter(d => d.total > 0)
  const avgIntake = daysWithData.length > 0 ? Math.round(daysWithData.reduce((s, d) => s + d.total, 0) / daysWithData.length) : 0
  const bestDay = last7.reduce((best, d) => d.total > best.total ? d : best, last7[0])
  const worstDay = last7.reduce((worst, d) => {
    if (d.total === 0 && worst.total === 0) return worst
    if (d.total === 0) return d
    if (worst.total === 0) return worst
    return d.total < worst.total ? d : worst
  }, last7[0])
  const goalHitDays = last7.filter(d => d.total >= goal).length

  // Most common drinking time — scan all entries from last 7 days
  const timeSlots = { morning: 0, afternoon: 0, evening: 0 }
  last7.forEach(d => {
    const dayLog = log.find(l => l.date === d.date)
    dayLog?.entries.forEach(e => {
      const hour = parseInt(e.time.split(":")[0], 10)
      const isPM = e.time.toLowerCase().includes("pm")
      const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour)
      if (h24 < 12) timeSlots.morning++
      else if (h24 < 17) timeSlots.afternoon++
      else timeSlots.evening++
    })
  })
  const peakTime = timeSlots.morning >= timeSlots.afternoon && timeSlots.morning >= timeSlots.evening
    ? "morning" : timeSlots.afternoon >= timeSlots.evening ? "afternoon" : "evening"
  const totalEntries = timeSlots.morning + timeSlots.afternoon + timeSlots.evening

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

      {/* Hydration Timeline — today's intake as a visual timeline */}
      {todayLog && todayLog.entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Droplets className="h-4 w-4 text-sky-500" /> Hydration Timeline</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-sky-200" />
              {todayLog.entries.map((e, i) => {
                const cumulativeTotal = todayLog.entries.slice(0, i + 1).reduce((s, x) => s + x.amount, 0)
                const cumulativePct = Math.min(100, Math.round((cumulativeTotal / goal) * 100))
                return (
                  <div key={i} className="relative flex items-center gap-3 pb-3 last:pb-0">
                    <div className={cn("absolute left-[-14px] h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm", cumulativeTotal >= goal ? "bg-emerald-400" : "bg-sky-400")} />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{e.time}</span>
                        <span className="text-xs text-muted-foreground">—</span>
                        <Badge variant="outline" className="text-[10px]">+{fmt(e.amount)}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{fmt(cumulativeTotal)} ({cumulativePct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Hydration Chart — enhanced bar chart with goal line */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Hydration Chart</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            {/* Goal line */}
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-red-300 z-10" style={{ bottom: `${maxBar ? (goal / maxBar) * 100 : 0}%`, height: 0 }}>
              <span className="absolute -top-3.5 right-0 text-[8px] font-semibold text-red-400">Goal: {fmt(goal)}</span>
            </div>
            <div className="flex items-end gap-2 h-36">
              {last7.map(d => {
                const hitGoal = d.total >= goal
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="text-[9px] font-medium">{d.total > 0 ? fmt(d.total) : ""}</span>
                    <div className="w-full rounded-t bg-slate-100 relative" style={{ height: "100%" }}>
                      <div
                        className={cn("absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500", hitGoal ? "bg-emerald-400" : "bg-amber-400")}
                        style={{ height: `${maxBar ? (d.total / maxBar) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={cn("text-[9px] font-medium", d.date === today() ? "text-sky-600" : "text-muted-foreground")}>{d.label}</span>
                    {d.date === today() && <div className="h-1 w-1 rounded-full bg-sky-500 -mt-0.5" />}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-400" /> Hit Goal</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-400" /> Below Goal</span>
            <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t-2 border-dashed border-red-300" /> Target</span>
          </div>
        </CardContent>
      </Card>

      {/* Hydration Insights */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-blue-500" /> Hydration Insights</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 bg-white/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">7-Day Average</p>
              <p className="text-lg font-bold text-blue-700">{fmt(avgIntake)}<span className="text-xs text-muted-foreground font-normal"> / day</span></p>
              {avgIntake > 0 && (
                <div className="mt-1 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (avgIntake / goal) * 100)}%` }} />
                </div>
              )}
            </div>

            <div className="rounded-lg border p-3 bg-white/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Goal Consistency</p>
              <p className="text-lg font-bold">
                <span className="text-emerald-600">{goalHitDays}</span>
                <span className="text-sm text-muted-foreground font-normal"> of 7 days</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {goalHitDays === 7 ? "Perfect week!" : goalHitDays >= 5 ? "Strong consistency." : goalHitDays >= 3 ? "Building the habit." : "Room to grow. Small sips add up."}
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-white/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Best vs Worst Day</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs"><span className="text-emerald-600 font-semibold">{bestDay.label}</span> — {fmt(bestDay.total)}</p>
                  {worstDay.total > 0 && <p className="text-xs"><span className="text-amber-600 font-semibold">{worstDay.label}</span> — {fmt(worstDay.total)}</p>}
                </div>
                {bestDay.total > 0 && worstDay.total > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(((bestDay.total - worstDay.total) / worstDay.total) * 100)}% gap
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-white/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Peak Hydration Time</p>
              {totalEntries > 0 ? (
                <>
                  <p className="text-lg font-bold capitalize text-violet-600">{peakTime}</p>
                  <div className="flex gap-2 mt-1">
                    {[
                      { label: "AM", count: timeSlots.morning, color: "bg-amber-400" },
                      { label: "PM", count: timeSlots.afternoon, color: "bg-sky-400" },
                      { label: "Eve", count: timeSlots.evening, color: "bg-indigo-400" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                        {s.label}: {s.count}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet — drink water and check back.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hydration Science Card */}
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50/40 to-blue-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm">The Science of Hydration</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5 shrink-0">💧</span>
                <p>Your brain is roughly <Explain tip="The brain is about 75% water by weight. Even mild dehydration (1-2% loss) impairs attention, working memory, and mood regulation.">75% water</Explain>. Even 2% dehydration measurably reduces cognitive performance — reaction time, short-term memory, and mood all decline before you feel thirsty.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5 shrink-0">🧬</span>
                <p><Link href="/fascia" className="text-rose-600 hover:underline font-medium"><Explain tip="The connective tissue matrix surrounding every muscle, organ, and nerve — its ground substance is primarily hyaluronic acid and water">Fascia</Explain></Link> depends on hydration to maintain its <Explain tip="The gel-like matrix between fascia fibers — composed of hyaluronic acid, proteoglycans, and water. When dehydrated, it becomes viscous and adhesion-prone.">ground substance</Explain>. Dehydrated fascia becomes stiff, adhesion-prone, and painful. Water is literally structural.</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 shrink-0">🫀</span>
                <p><Explain tip="Kidneys filter ~150 liters of blood per day. Chronic mild dehydration is associated with kidney stones, UTIs, and progressive decline in renal function.">Kidney function</Explain>, <Explain tip="Water is critical for sweating and vasodilation — your body's primary mechanisms for dissipating heat during exercise or in warm environments.">temperature regulation</Explain>, and <Explain tip="Synovial fluid in joints is mostly water. Adequate hydration keeps joints lubricated, reducing friction and wear on cartilage.">joint lubrication</Explain> all depend on consistent water intake — not just chugging when you remember.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">⚡</span>
                <p><Explain tip="Sodium, potassium, magnesium, and chloride — minerals that carry electrical charges across cell membranes, enabling nerve signals, muscle contractions, and cellular hydration">Electrolytes</Explain> matter more than volume. Water without minerals doesn&apos;t hydrate tissue effectively — it passes through. Add a pinch of salt, or eat mineral-rich foods alongside your water.</p>
              </div>
            </div>
          </div>
          <SourceList sources={[
            { id: 1, title: "Water, Hydration and Health", authors: "Popkin BM, D'Anci KE, Rosenberg IH", journal: "Nutrition Reviews", year: 2010, type: "review", url: "https://pubmed.ncbi.nlm.nih.gov/20646222/", notes: "Comprehensive review of hydration's role in cognitive performance, kidney function, and chronic disease prevention." },
            { id: 2, title: "Mild Dehydration Impairs Cognitive Performance and Mood", authors: "Ganio MS, et al.", journal: "British Journal of Nutrition", year: 2011, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/21736786/", notes: "1.36% dehydration produced significant degradation in vigilance, working memory, and increased fatigue/anxiety." },
            { id: 3, title: "Role of Hydration in Fascial Health and Myofascial Pain", authors: "Stecco C, et al.", journal: "Journal of Bodywork and Movement Therapies", year: 2013, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/23768278/", notes: "Hyaluronic acid viscosity in fascial layers increases with dehydration, contributing to stiffness and pain." },
          ]} title="Hydration Science Sources" />
        </CardContent>
      </Card>

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
