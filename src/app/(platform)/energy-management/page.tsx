"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Zap, Battery, Heart, Brain, Sparkles, ChevronDown, ChevronUp, Plus, Trash2, Clock, TrendingUp, Coffee, Moon, Activity, Target, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { secureFetcher } from "@/lib/encrypted-fetch"

interface EnergyEntry { time: string; level: number; activity: string; timestamp: number }

const STORAGE_KEY = "hfp-energy-log"
const today = () => new Date().toISOString().slice(0, 10)

function loadEntries(): Record<string, EnergyEntry[]> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") } catch { return {} }
}
function saveEntries(data: Record<string, EnergyEntry[]>) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

const DIMENSIONS = [
  { key: "physical", label: "Physical Energy", icon: Battery, color: "emerald", badge: "Foundation",
    intro: "When physical energy is low, everything else crashes. This is the non-negotiable base layer.",
    items: [
      { title: "Sleep (7-9 hours)", desc: "Sleep is not recovery — it's when your body actually builds. Growth hormone, memory consolidation, immune repair all peak during deep sleep." },
      { title: "Nutrition (blood sugar stability)", desc: "Stable blood sugar = stable energy. Spikes and crashes from refined carbs create the afternoon slump. Protein + fat + fiber at every meal." },
      { title: "Exercise (energizing, not depleting)", desc: "Movement creates energy. But overtraining depletes it. Zone 2 cardio builds mitochondria — the literal energy factories of your cells." },
      { title: "Hydration", desc: "Even 2% dehydration measurably reduces cognitive performance and physical output. Most people are chronically under-hydrated." },
      { title: "Breathing", desc: "Nasal breathing, diaphragmatic breathing, and breathwork protocols directly regulate your autonomic nervous system and energy state." },
    ]},
  { key: "emotional", label: "Emotional Energy", icon: Heart, color: "rose", badge: "Quality",
    intro: "Positive emotions fuel. Negative emotions drain. Emotional labor is real and costs energy. This is not soft — it's metabolic.",
    items: [
      { title: "Gratitude practice", desc: "Shifts neural circuitry from threat-detection to reward-detection. 3 specific things daily rewires your baseline emotional state within 8 weeks." },
      { title: "Social connection", desc: "Loneliness is as harmful as smoking 15 cigarettes/day (Holt-Lunstad, 2015). One quality conversation can restore hours of emotional energy." },
      { title: "Laughter and play", desc: "Releases endorphins, reduces cortisol, and activates reward circuits. Adults who stop playing don't mature — they decay." },
      { title: "Boundaries and recovery", desc: "Saying no is not selfish — it's energy management. Every yes to something low-value is a no to something that matters." },
      { title: "Nature exposure", desc: "20 minutes in nature measurably reduces cortisol (Huberman, 2021). Forest bathing isn't woo — it's biochemistry." },
    ]},
  { key: "mental", label: "Mental Energy", icon: Brain, color: "blue", badge: "Focus",
    intro: "Focus capacity is finite — roughly 4 hours of deep work per day for most people. Manage it like a precious, non-renewable resource.",
    items: [
      { title: "Deep work blocks (90-120 min)", desc: "Your brain operates in ultradian cycles. Work with them, not against them. 90 minutes on, 15-20 minutes genuine recovery." },
      { title: "Decision fatigue management", desc: "Steve Jobs wore the same outfit. Obama had two suit colors. Every trivial decision depletes the same pool used for important ones. Automate the trivial." },
      { title: "Batch similar tasks", desc: "Context-switching costs 23 minutes to regain full focus (UC Irvine). Group emails, calls, admin into blocks instead of scattering them." },
      { title: "Single-tasking over multitasking", desc: "Multitasking is a myth. Your brain rapidly switches, losing efficiency each time. Single-tasking is 40% more productive (APA)." },
      { title: "Cognitive load reduction", desc: "Externalize everything: lists, calendars, systems. Your brain is for having ideas, not holding them. Free working memory = better thinking." },
    ]},
  { key: "spiritual", label: "Spiritual Energy", icon: Sparkles, color: "violet", badge: "Purpose",
    intro: "Alignment between actions and values. Burnout is often values misalignment, not overwork. 'Why' provides fuel that willpower cannot.",
    items: [
      { title: "Values alignment", desc: "When your daily actions match your core values, work becomes energizing. When they don't, even easy tasks feel draining." },
      { title: "Purpose clarity", desc: "People with a clear sense of purpose live 7+ years longer (Blue Zones research). Purpose doesn't require grand ambition — it requires honest alignment." },
      { title: "Weekly reflection", desc: "15 minutes weekly: What gave me energy? What drained me? Am I moving toward what matters? This single practice prevents months of drift." },
      { title: "Contribution and service", desc: "Helping others activates the brain's reward system more strongly than receiving help. Service is not sacrifice — it's a net energy gain." },
    ]},
] as const

const ZAPPERS = [
  "Processed food (blood sugar rollercoaster)", "Dehydration (cognitive and physical decline)",
  "Poor sleep (debt compounds daily)", "Unresolved conflict (background CPU drain)",
  "Doom scrolling (dopamine depletion + cortisol)", "Decision fatigue (depletes willpower)",
  "Multitasking (23-min recovery per switch)", "Chronic sitting (reduces circulation and alertness)",
]

const TIME_SLOTS = ["Morning (6-10am)", "Midday (10am-2pm)", "Afternoon (2-6pm)", "Evening (6-10pm)"]
const SLOT_MIDPOINT: Record<string, number> = { "Morning (6-10am)": 8, "Midday (10am-2pm)": 12, "Afternoon (2-6pm)": 16, "Evening (6-10pm)": 20 }
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 3) return 0
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b }
  const d = Math.sqrt(dx * dy)
  return d === 0 ? 0 : num / d
}

export default function EnergyManagementPage() {
  const [expanded, setExpanded] = useState<string | null>("physical")
  const [entries, setEntries] = useState<Record<string, EnergyEntry[]>>({})
  const [newLevel, setNewLevel] = useState(5)
  const [newActivity, setNewActivity] = useState("")
  const [newTime, setNewTime] = useState(TIME_SLOTS[0])

  useEffect(() => { setEntries(loadEntries()) }, [])

  const { data: healthData } = useSWR("/api/health/entries?limit=200", secureFetcher)

  const todayEntries = entries[today()] || []

  function addEntry() {
    if (!newActivity.trim()) return
    const updated = { ...entries }
    const entry: EnergyEntry = { time: newTime, level: newLevel, activity: newActivity.trim(), timestamp: Date.now() }
    updated[today()] = [...(updated[today()] || []), entry]
    setEntries(updated); saveEntries(updated); setNewActivity("")
  }
  function removeEntry(idx: number) {
    const updated = { ...entries }; updated[today()] = todayEntries.filter((_, i) => i !== idx)
    setEntries(updated); saveEntries(updated)
  }

  // Flatten entries across all days
  const flat = useMemo(() => {
    const out: { date: string; slot: string; level: number; activity: string; hour: number; dow: number }[] = []
    for (const [date, list] of Object.entries(entries)) {
      if (!Array.isArray(list)) continue
      const d = new Date(date + "T00:00:00")
      const dow = d.getDay()
      for (const e of list) {
        if (typeof e?.level !== "number") continue
        out.push({ date, slot: e.time, level: e.level, activity: e.activity || "", hour: SLOT_MIDPOINT[e.time] ?? 12, dow })
      }
    }
    return out.sort((a, b) => a.date.localeCompare(b.date))
  }, [entries])

  // Heatmap grid: 30 days x 4 slots
  const heatmap = useMemo(() => {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    const grid = days.map(date => {
      const dayEntries = entries[date] || []
      return TIME_SLOTS.map(slot => {
        const match = dayEntries.filter(e => e.time === slot)
        if (!match.length) return null
        return match.reduce((s, e) => s + e.level, 0) / match.length
      })
    })
    return { days, grid }
  }, [entries])

  // Day-of-week averages
  const dowStats = useMemo(() => {
    const sums = Array(7).fill(0), counts = Array(7).fill(0)
    flat.forEach(e => { sums[e.dow] += e.level; counts[e.dow]++ })
    return sums.map((s, i) => ({ dow: i, label: DAY_LABELS[i], avg: counts[i] ? s / counts[i] : null, count: counts[i] }))
  }, [flat])

  // Peak slot (best time of day averaged)
  const slotStats = useMemo(() => {
    return TIME_SLOTS.map(slot => {
      const pts = flat.filter(e => e.slot === slot)
      return { slot, avg: pts.length ? pts.reduce((s, e) => s + e.level, 0) / pts.length : null, count: pts.length }
    })
  }, [flat])

  // Sleep correlation: for each date with both sleep + an energy entry, pair hoursSlept with that day's avg energy
  const sleepCorrelation = useMemo(() => {
    const entriesRaw: any[] = healthData?.entries || []
    const sleepByDate: Record<string, number> = {}
    for (const e of entriesRaw) {
      if (e.entryType !== "SLEEP") continue
      try {
        const d = JSON.parse(e.data || "{}")
        const h = Number(d?.hoursSlept || d?.hours || 0)
        if (h > 0) {
          const date = new Date(e.recordedAt || e.createdAt).toISOString().slice(0, 10)
          sleepByDate[date] = h
        }
      } catch {}
    }
    const pairs: { sleep: number; energy: number; date: string }[] = []
    for (const [date, list] of Object.entries(entries)) {
      if (!Array.isArray(list) || !list.length || !sleepByDate[date]) continue
      const avg = list.reduce((s, e) => s + e.level, 0) / list.length
      pairs.push({ sleep: sleepByDate[date], energy: avg, date })
    }
    const r = pearson(pairs.map(p => p.sleep), pairs.map(p => p.energy))
    return { pairs, r }
  }, [entries, healthData])

  // Energy-draining activities: low-energy entries grouped by word
  const drainPatterns = useMemo(() => {
    const counts: Record<string, { total: number; levels: number[]; low: number }> = {}
    flat.forEach(e => {
      const words = e.activity.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 4)
      for (const w of words) {
        if (!counts[w]) counts[w] = { total: 0, levels: [], low: 0 }
        counts[w].total++
        counts[w].levels.push(e.level)
        if (e.level <= 4) counts[w].low++
      }
    })
    return Object.entries(counts)
      .filter(([, v]) => v.total >= 3)
      .map(([word, v]) => ({ word, avg: v.levels.reduce((s, x) => s + x, 0) / v.levels.length, count: v.total, lowRate: v.low / v.total }))
      .filter(x => x.avg < 5.5)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
  }, [flat])

  // 30-day trendline data
  const trend = useMemo(() => {
    const points: { date: string; avg: number | null; dayIdx: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      const list = entries[date] || []
      const avg = list.length ? list.reduce((s, e) => s + e.level, 0) / list.length : null
      points.push({ date, avg, dayIdx: 29 - i })
    }
    const valid = points.filter(p => p.avg !== null)
    return { points, validCount: valid.length, overall: valid.length ? valid.reduce((s, p) => s + (p.avg as number), 0) / valid.length : null }
  }, [entries])

  const avgToday = todayEntries.length ? (todayEntries.reduce((s, e) => s + e.level, 0) / todayEntries.length).toFixed(1) : "—"
  const colorMap: Record<string, string> = { emerald: "border-emerald-300 bg-emerald-50/30", rose: "border-rose-300 bg-rose-50/30", blue: "border-blue-300 bg-blue-50/30", violet: "border-violet-300 bg-violet-50/30" }
  const textMap: Record<string, string> = { emerald: "text-emerald-600", rose: "text-rose-600", blue: "text-blue-600", violet: "text-violet-600" }

  const hasData = flat.length > 0
  const peakSlot = slotStats.filter(s => s.avg !== null).sort((a, b) => (b.avg as number) - (a.avg as number))[0]
  const worstSlot = slotStats.filter(s => s.avg !== null).sort((a, b) => (a.avg as number) - (b.avg as number))[0]
  const bestDow = dowStats.filter(d => d.avg !== null).sort((a, b) => (b.avg as number) - (a.avg as number))[0]
  const worstDow = dowStats.filter(d => d.avg !== null).sort((a, b) => (a.avg as number) - (b.avg as number))[0]

  function heatColor(v: number | null): string {
    if (v === null) return "fill-muted/20"
    if (v >= 8) return "fill-emerald-500"
    if (v >= 6.5) return "fill-emerald-400"
    if (v >= 5) return "fill-amber-300"
    if (v >= 3.5) return "fill-orange-400"
    return "fill-red-500"
  }

  // Trendline SVG scaling
  const TW = 640, TH = 140, TPAD_L = 30, TPAD_R = 10, TPAD_T = 12, TPAD_B = 22
  const plotW = TW - TPAD_L - TPAD_R, plotH = TH - TPAD_T - TPAD_B
  const tx = (i: number) => TPAD_L + (i / 29) * plotW
  const ty = (v: number) => TPAD_T + plotH - ((v - 1) / 9) * plotH

  const trendPath = useMemo(() => {
    const segments: string[] = []
    let open = false
    trend.points.forEach((p, i) => {
      if (p.avg === null) { open = false; return }
      segments.push(`${open ? "L" : "M"}${tx(i).toFixed(1)},${ty(p.avg).toFixed(1)}`)
      open = true
    })
    return segments.join(" ")
  }, [trend])

  // Linear fit for trendline
  const trendFit = useMemo(() => {
    const pts = trend.points.filter(p => p.avg !== null) as { dayIdx: number; avg: number }[]
    if (pts.length < 3) return null
    const n = pts.length
    const mx = pts.reduce((s, p) => s + p.dayIdx, 0) / n
    const my = pts.reduce((s, p) => s + p.avg, 0) / n
    let num = 0, den = 0
    pts.forEach(p => { num += (p.dayIdx - mx) * (p.avg - my); den += (p.dayIdx - mx) ** 2 })
    if (den === 0) return null
    const slope = num / den
    const intercept = my - slope * mx
    return { slope, intercept, weekly: slope * 7 }
  }, [trend])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Energy Management</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Time management is dead. Energy management is everything. You don&apos;t need more hours — you need more energy in the hours you have.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on Tony Schwartz&apos;s <em>The Energy Project</em> and Andrew Huberman&apos;s protocols. Energy operates across
            four dimensions — physical, emotional, mental, and spiritual. Manage all four or the weakest one
            becomes your ceiling. <Explain tip="Your body cycles between high alertness and recovery roughly every 90-120 minutes throughout the day">Ultradian rhythms</Explain> govern
            your natural energy cycles: 90-120 min focus blocks with 15-20 min genuine recovery (not checking your phone).
          </p>
        </CardContent>
      </Card>

      {/* Your Data — Summary */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-amber-600" /> Your Energy Data</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          {!hasData ? (
            <p className="text-xs text-muted-foreground">Start logging entries below. After 3-5 days, patterns emerge: peak hours, crash times, draining activities, and the sleep-energy link.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Entries logged</p>
                <p className="text-2xl font-bold tabular-nums">{flat.length}</p>
                <p className="text-[10px] text-muted-foreground">across {new Set(flat.map(f => f.date)).size} days</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">30-day avg</p>
                <p className="text-2xl font-bold tabular-nums">{trend.overall !== null ? trend.overall.toFixed(1) : "—"}<span className="text-sm text-muted-foreground">/10</span></p>
                <p className="text-[10px] text-muted-foreground">{trend.validCount} active days</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Peak window</p>
                <p className="text-sm font-bold">{peakSlot ? peakSlot.slot.split(" ")[0] : "—"}</p>
                <p className="text-[10px] text-muted-foreground">avg {peakSlot?.avg?.toFixed(1) ?? "—"}/10</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Crash window</p>
                <p className="text-sm font-bold">{worstSlot && worstSlot.slot !== peakSlot?.slot ? worstSlot.slot.split(" ")[0] : "—"}</p>
                <p className="text-[10px] text-muted-foreground">avg {worstSlot?.avg?.toFixed(1) ?? "—"}/10</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 30-day trendline */}
      {hasData && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-600" /> 30-Day Energy Trend</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <svg viewBox={`0 0 ${TW} ${TH}`} className="w-full h-auto" role="img" aria-label="30-day energy trend">
              {[2, 5, 8].map(v => (
                <g key={v}>
                  <line x1={TPAD_L} y1={ty(v)} x2={TW - TPAD_R} y2={ty(v)} stroke="currentColor" className="text-muted-foreground/15" strokeDasharray="2 3" />
                  <text x={TPAD_L - 4} y={ty(v) + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">{v}</text>
                </g>
              ))}
              {trendFit && (
                <line
                  x1={tx(0)} y1={ty(Math.max(1, Math.min(10, trendFit.intercept)))}
                  x2={tx(29)} y2={ty(Math.max(1, Math.min(10, trendFit.intercept + trendFit.slope * 29)))}
                  stroke="currentColor" className="text-amber-400" strokeDasharray="4 3" strokeWidth={1.25}
                />
              )}
              <path d={trendPath} fill="none" className="stroke-amber-600" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {trend.points.map((p, i) => p.avg !== null ? (
                <circle key={i} cx={tx(i)} cy={ty(p.avg)} r={2.5} className="fill-amber-600" />
              ) : null)}
              <line x1={TPAD_L} y1={TH - TPAD_B} x2={TW - TPAD_R} y2={TH - TPAD_B} stroke="currentColor" className="text-muted-foreground/25" />
              <text x={tx(0)} y={TH - 6} fontSize={9} className="fill-muted-foreground" textAnchor="middle">30 days ago</text>
              <text x={tx(14)} y={TH - 6} fontSize={9} className="fill-muted-foreground" textAnchor="middle">15 days ago</text>
              <text x={tx(29)} y={TH - 6} fontSize={9} className="fill-muted-foreground" textAnchor="middle">today</text>
            </svg>
            {trendFit && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Trend: <span className={cn("font-semibold", trendFit.weekly > 0.2 ? "text-emerald-700" : trendFit.weekly < -0.2 ? "text-red-700" : "text-amber-700")}>
                  {trendFit.weekly > 0 ? "+" : ""}{trendFit.weekly.toFixed(2)} pts/week
                </span> — {trendFit.weekly > 0.2 ? "your average energy is climbing." : trendFit.weekly < -0.2 ? "your average energy is dropping. Check sleep, load, and stressors." : "roughly stable week over week."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Heatmap: 30 days x 4 time slots */}
      {hasData && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Peak-Hour Heatmap (30 days x 4 windows)</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <svg viewBox="0 0 640 140" className="w-full h-auto" role="img" aria-label="Energy heatmap">
              {/* slot labels */}
              {TIME_SLOTS.map((slot, row) => (
                <text key={slot} x={56} y={22 + row * 26} textAnchor="end" fontSize={9} className="fill-muted-foreground">
                  {slot.split(" ")[0]}
                </text>
              ))}
              {/* cells */}
              {heatmap.days.map((date, col) => (
                heatmap.grid[col].map((v, row) => (
                  <rect
                    key={`${col}-${row}`}
                    x={62 + col * 18.5}
                    y={14 + row * 26}
                    width={16}
                    height={22}
                    rx={2}
                    className={heatColor(v)}
                    opacity={v === null ? 0.3 : 0.9}
                  >
                    <title>{date} {TIME_SLOTS[row]}: {v === null ? "no entry" : `${v.toFixed(1)}/10`}</title>
                  </rect>
                ))
              ))}
              {/* date ticks */}
              <text x={62 + 0 * 18.5} y={130} fontSize={9} className="fill-muted-foreground">-29d</text>
              <text x={62 + 14 * 18.5} y={130} fontSize={9} className="fill-muted-foreground">-15d</text>
              <text x={62 + 29 * 18.5} y={130} fontSize={9} className="fill-muted-foreground">today</text>
            </svg>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" />crash (1-3)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400" />low (4)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" />mid (5-6)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" />high (7-8)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" />peak (9-10)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day-of-week bars */}
      {hasData && dowStats.some(d => d.avg !== null) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-amber-600" /> Energy by Day of Week</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <svg viewBox="0 0 400 130" className="w-full h-auto" role="img" aria-label="Energy by day of week">
              {[2, 5, 8].map(v => (
                <line key={v} x1={28} y1={15 + (10 - v) * 9} x2={395} y2={15 + (10 - v) * 9} stroke="currentColor" className="text-muted-foreground/10" strokeDasharray="2 3" />
              ))}
              <text x={24} y={15 + 9 * 2 + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">8</text>
              <text x={24} y={15 + 9 * 5 + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">5</text>
              <text x={24} y={15 + 9 * 8 + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">2</text>
              {dowStats.map((d, i) => {
                const h = d.avg !== null ? d.avg * 9 : 0
                const x = 35 + i * 52
                const color = d.avg === null ? "fill-muted/30" : d.avg >= 7 ? "fill-emerald-500" : d.avg >= 5 ? "fill-amber-400" : "fill-red-400"
                return (
                  <g key={i}>
                    <rect x={x} y={15 + (90 - h)} width={40} height={h} rx={3} className={color} opacity={0.85} />
                    <text x={x + 20} y={120} textAnchor="middle" fontSize={10} className="fill-muted-foreground">{d.label}</text>
                    {d.avg !== null && <text x={x + 20} y={12 + (90 - h)} textAnchor="middle" fontSize={9} className="fill-foreground font-semibold">{d.avg.toFixed(1)}</text>}
                    {d.avg === null && <text x={x + 20} y={105} textAnchor="middle" fontSize={8} className="fill-muted-foreground italic">—</text>}
                  </g>
                )
              })}
            </svg>
            {bestDow && worstDow && bestDow.label !== worstDow.label && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Your best day is <span className="font-semibold text-emerald-700">{bestDow.label} ({bestDow.avg!.toFixed(1)})</span>;
                your hardest is <span className="font-semibold text-red-700">{worstDow.label} ({worstDow.avg!.toFixed(1)})</span>.
                {(bestDow.avg! - worstDow.avg!) > 1.5 && " That is a meaningful spread — check what makes those days different."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sleep correlation */}
      {sleepCorrelation.pairs.length >= 3 && (
        <Card className="border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Moon className="h-4 w-4 text-indigo-600" /> Sleep x Energy Correlation</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <svg viewBox="0 0 400 150" className="w-full h-auto" role="img" aria-label="Sleep vs energy scatter">
              <line x1={35} y1={130} x2={395} y2={130} stroke="currentColor" className="text-muted-foreground/30" />
              <line x1={35} y1={10} x2={35} y2={130} stroke="currentColor" className="text-muted-foreground/30" />
              <text x={31} y={14} textAnchor="end" fontSize={8} className="fill-muted-foreground">10</text>
              <text x={31} y={132} textAnchor="end" fontSize={8} className="fill-muted-foreground">1</text>
              <text x={35} y={145} fontSize={9} className="fill-muted-foreground">4h</text>
              <text x={395} y={145} fontSize={9} textAnchor="end" className="fill-muted-foreground">10h</text>
              <text x={215} y={148} textAnchor="middle" fontSize={9} className="fill-muted-foreground">hours slept</text>
              {sleepCorrelation.pairs.map((p, i) => (
                <circle key={i}
                  cx={35 + ((Math.min(10, Math.max(4, p.sleep)) - 4) / 6) * 360}
                  cy={130 - ((Math.max(1, Math.min(10, p.energy)) - 1) / 9) * 120}
                  r={3}
                  className="fill-indigo-500" opacity={0.65}>
                  <title>{p.date}: {p.sleep.toFixed(1)}h sleep, {p.energy.toFixed(1)}/10 energy</title>
                </circle>
              ))}
            </svg>
            <p className="text-xs mt-2">
              <Explain tip="Pearson correlation coefficient — ranges from -1 to +1. Above 0.3 is a notable positive relationship; below -0.3 is negative.">Correlation (r)</Explain>: <span className={cn("font-semibold tabular-nums", sleepCorrelation.r > 0.3 ? "text-emerald-700" : sleepCorrelation.r < -0.3 ? "text-red-700" : "text-muted-foreground")}>{sleepCorrelation.r.toFixed(2)}</span>
              <span className="text-muted-foreground"> ({sleepCorrelation.pairs.length} paired days)</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {sleepCorrelation.r > 0.5 ? "Strong link: more sleep reliably predicts higher energy for you. Protect your sleep window."
                : sleepCorrelation.r > 0.2 ? "Positive but modest link. Sleep helps, but other factors also drive your energy."
                : sleepCorrelation.r < -0.2 ? "Inverse — possibly oversleeping on low-energy days. Track wake time and quality, not just duration."
                : "No clear link yet. Log sleep + energy for 2+ weeks to see the pattern."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Draining patterns */}
      {drainPatterns.length > 0 && (
        <Card className="border-red-200 bg-red-50/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-red-700"><AlertTriangle className="h-4 w-4" /> Your Energy-Draining Patterns</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <p className="text-[11px] text-muted-foreground">Activities you logged with consistently low energy (avg &lt; 5.5, 3+ occurrences):</p>
            {drainPatterns.map(d => (
              <div key={d.word} className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="border-red-300 text-red-700 text-[10px] w-12 justify-center tabular-nums">{d.avg.toFixed(1)}</Badge>
                <span className="font-medium">&quot;{d.word}&quot;</span>
                <span className="text-muted-foreground">— {d.count}x logged, {Math.round(d.lowRate * 100)}% crashed</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Routine suggestion */}
      {peakSlot && peakSlot.avg !== null && peakSlot.avg >= 6 && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-emerald-800"><Target className="h-4 w-4" /> Your Optimal Routine (from your data)</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2 text-xs text-muted-foreground">
            <p>
              Your data says peak energy hits in the <span className="font-semibold text-emerald-700">{peakSlot.slot.toLowerCase()}</span> window (avg {peakSlot.avg.toFixed(1)}/10).
              Schedule your hardest cognitive work there — deep work, difficult conversations, creative problem-solving.
            </p>
            {worstSlot && worstSlot.avg !== null && worstSlot.slot !== peakSlot.slot && (
              <p>
                Protect the <span className="font-semibold text-red-700">{worstSlot.slot.toLowerCase()}</span> window (avg {worstSlot.avg.toFixed(1)}/10) with low-stakes admin, walks, or recovery.
                Never schedule important decisions here.
              </p>
            )}
            {bestDow && worstDow && bestDow.avg !== null && worstDow.avg !== null && (bestDow.avg - worstDow.avg) > 1 && (
              <p>Front-load ambitious work on <span className="font-semibold text-emerald-700">{bestDow.label}s</span>; keep <span className="font-semibold text-red-700">{worstDow.label}s</span> lighter or purely recovery.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Four dimensions */}
      <div className="space-y-2">
        {DIMENSIONS.map(dim => {
          const Icon = dim.icon; const open = expanded === dim.key
          return (
            <Card key={dim.key} className={cn("transition-colors", open && colorMap[dim.color])}>
              <button onClick={() => setExpanded(open ? null : dim.key)} className="flex w-full items-center gap-3 p-4 text-left">
                <Icon className={cn("h-5 w-5 shrink-0", textMap[dim.color])} />
                <span className="text-sm font-semibold flex-1">{dim.label}</span>
                <Badge variant="outline" className="text-[9px] mr-2">{dim.badge}</Badge>
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {open && (
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <p className="text-xs text-muted-foreground italic">{dim.intro}</p>
                  {dim.items.map(item => (
                    <div key={item.title} className="rounded-lg border bg-background/60 p-3">
                      <p className="text-xs font-semibold mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-500" /> Energy Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="rounded-lg border p-3">
            <p className="font-semibold text-foreground mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Ultradian Work Cycles</p>
            <p>90-120 min deep focus, then 15-20 min <em>real</em> recovery — walk, breathwork, nap. Not phone-checking. Your biology already runs this cycle; stop fighting it.</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-semibold text-foreground mb-0.5 flex items-center gap-1"><Coffee className="h-3 w-3" /> Strategic Recovery</p>
            <p>Nap (10-20 min, before 2pm), nature walk (20 min), breathwork (5 min box breathing), cold exposure (1-3 min), or quality social interaction. These are not breaks — they are performance tools.</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-semibold text-foreground mb-0.5 flex items-center gap-1"><Moon className="h-3 w-3" /> Energy Audit</p>
            <p>Track your energy 1-10 at four times daily for one week. Patterns emerge fast: you will discover your peak hours, your crash triggers, and your most effective recovery methods. Use the log below.</p>
          </div>
        </CardContent>
      </Card>

      {/* Energy zappers */}
      <Card className="border-red-200 bg-red-50/10">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">Energy Zappers</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 gap-1.5">
            {ZAPPERS.map(z => (
              <div key={z} className="flex items-start gap-1.5 text-xs text-muted-foreground"><span className="text-red-400 mt-0.5">x</span>{z}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy log */}
      <Card className="border-2 border-amber-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Energy Log — Today</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Time</label>
              <select value={newTime} onChange={e => setNewTime(e.target.value)} className="block text-xs border rounded px-2 py-1.5 bg-background">
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Energy (1-10)</label>
              <div className="flex items-center gap-1">
                <input type="range" min={1} max={10} value={newLevel} onChange={e => setNewLevel(+e.target.value)} className="w-20" />
                <Badge variant="outline" className={cn("text-xs w-7 justify-center", newLevel >= 7 ? "border-emerald-300 text-emerald-700" : newLevel >= 4 ? "border-amber-300 text-amber-700" : "border-red-300 text-red-700")}>{newLevel}</Badge>
              </div>
            </div>
            <div className="space-y-1 flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted-foreground">What were you doing?</label>
              <input value={newActivity} onChange={e => setNewActivity(e.target.value)} onKeyDown={e => e.key === "Enter" && addEntry()} placeholder="e.g., deep work, meetings..." className="block w-full text-xs border rounded px-2 py-1.5 bg-background" />
            </div>
            <Button size="sm" onClick={addEntry} className="bg-amber-600 hover:bg-amber-700"><Plus className="h-3 w-3 mr-1" /> Log</Button>
          </div>

          {todayEntries.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Avg: {avgToday}/10</span><span>{todayEntries.length} entries</span></div>
              {todayEntries.map((e, i) => (
                <div key={e.timestamp} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0">
                  <Badge variant="outline" className={cn("text-[10px] w-7 justify-center", e.level >= 7 ? "border-emerald-300 text-emerald-700" : e.level >= 4 ? "border-amber-300 text-amber-700" : "border-red-300 text-red-700")}>{e.level}</Badge>
                  <span className="text-muted-foreground w-32 shrink-0">{e.time}</span>
                  <span className="flex-1">{e.activity}</span>
                  <button onClick={() => removeEntry(i)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/nutrition" className="text-sm text-emerald-600 hover:underline">Nutrition</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/dopamine-guide" className="text-sm text-pink-600 hover:underline">Dopamine Guide</a>
        <a href="/daily-habits" className="text-sm text-amber-600 hover:underline">Daily Habits</a>
        <a href="/focus-timer" className="text-sm text-blue-600 hover:underline">Focus Timer</a>
        <a href="/anxiety-toolkit" className="text-sm text-violet-600 hover:underline">Anxiety Toolkit</a>
        <a href="/water-tracker" className="text-sm text-sky-600 hover:underline">Water Tracker</a>
      </div>
    </div>
  )
}
