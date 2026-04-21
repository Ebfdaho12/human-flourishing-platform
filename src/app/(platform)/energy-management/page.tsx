"use client"

import { useState, useEffect } from "react"
import { Zap, Battery, Heart, Brain, Sparkles, ChevronDown, ChevronUp, Plus, Trash2, Clock, TrendingUp, Coffee, Moon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

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

export default function EnergyManagementPage() {
  const [expanded, setExpanded] = useState<string | null>("physical")
  const [entries, setEntries] = useState<Record<string, EnergyEntry[]>>({})
  const [newLevel, setNewLevel] = useState(5)
  const [newActivity, setNewActivity] = useState("")
  const [newTime, setNewTime] = useState(TIME_SLOTS[0])

  useEffect(() => { setEntries(loadEntries()) }, [])

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

  const avgToday = todayEntries.length ? (todayEntries.reduce((s, e) => s + e.level, 0) / todayEntries.length).toFixed(1) : "—"
  const colorMap: Record<string, string> = { emerald: "border-emerald-300 bg-emerald-50/30", rose: "border-rose-300 bg-rose-50/30", blue: "border-blue-300 bg-blue-50/30", violet: "border-violet-300 bg-violet-50/30" }
  const textMap: Record<string, string> = { emerald: "text-emerald-600", rose: "text-rose-600", blue: "text-blue-600", violet: "text-violet-600" }

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
              <div key={z} className="flex items-start gap-1.5 text-xs text-muted-foreground"><span className="text-red-400 mt-0.5">✕</span>{z}</div>
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
