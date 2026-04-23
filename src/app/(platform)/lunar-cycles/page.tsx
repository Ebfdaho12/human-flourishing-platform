"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { Moon, TrendingUp, Brain, Heart, Droplets, DollarSign, Users, Activity, Sun, Eye, BarChart3, AlertTriangle, Zap, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { secureFetcher } from "@/lib/encrypted-fetch"
import { cn } from "@/lib/utils"

// Moon phase calculation (simplified but accurate to ~1 day)
function getMoonPhase(date: Date): { phase: string; illumination: number; emoji: string; daysInCycle: number } {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Reference new moon: January 6, 2000
  const refNew = new Date(2000, 0, 6, 18, 14, 0).getTime()
  const synodicMonth = 29.53058868 // days
  const diff = (date.getTime() - refNew) / (1000 * 60 * 60 * 24)
  const cycleDay = ((diff % synodicMonth) + synodicMonth) % synodicMonth

  let phase: string
  let emoji: string
  let illumination: number

  if (cycleDay < 1.85) { phase = "New Moon"; emoji = "🌑"; illumination = 0 }
  else if (cycleDay < 7.38) { phase = "Waxing Crescent"; emoji = "🌒"; illumination = Math.round((cycleDay - 1.85) / 5.53 * 50) }
  else if (cycleDay < 9.23) { phase = "First Quarter"; emoji = "🌓"; illumination = 50 }
  else if (cycleDay < 14.77) { phase = "Waxing Gibbous"; emoji = "🌔"; illumination = 50 + Math.round((cycleDay - 9.23) / 5.54 * 50) }
  else if (cycleDay < 16.61) { phase = "Full Moon"; emoji = "🌕"; illumination = 100 }
  else if (cycleDay < 22.15) { phase = "Waning Gibbous"; emoji = "🌖"; illumination = 100 - Math.round((cycleDay - 16.61) / 5.54 * 50) }
  else if (cycleDay < 24.0) { phase = "Last Quarter"; emoji = "🌗"; illumination = 50 }
  else if (cycleDay < 29.53) { phase = "Waning Crescent"; emoji = "🌘"; illumination = Math.round((29.53 - cycleDay) / 5.53 * 50) }
  else { phase = "New Moon"; emoji = "🌑"; illumination = 0 }

  return { phase, illumination, emoji, daysInCycle: Math.round(cycleDay * 10) / 10 }
}

// Get next few moon phase dates
function getUpcomingPhases(from: Date, count: number): { date: Date; phase: string; emoji: string }[] {
  const phases: { date: Date; phase: string; emoji: string }[] = []
  const d = new Date(from)
  let lastPhase = getMoonPhase(d).phase
  for (let i = 0; i < 120 && phases.length < count; i++) {
    d.setDate(d.getDate() + 1)
    const current = getMoonPhase(d)
    if (current.phase !== lastPhase && (current.phase === "New Moon" || current.phase === "First Quarter" || current.phase === "Full Moon" || current.phase === "Last Quarter")) {
      phases.push({ date: new Date(d), phase: current.phase, emoji: current.emoji })
    }
    lastPhase = current.phase
  }
  return phases
}

const PHASE_ORDER = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
const PHASE_EMOJI: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓", "Waxing Gibbous": "🌔",
  "Full Moon": "🌕", "Waning Gibbous": "🌖", "Last Quarter": "🌗", "Waning Crescent": "🌘",
}

export default function LunarCyclesPage() {
  const [today] = useState(new Date())
  const currentMoon = getMoonPhase(today)
  const upcoming = useMemo(() => getUpcomingPhases(today, 8), [today])

  // Pull user's mood and sleep data from other platform features
  const { data: moodData } = useSWR("/api/mental-health/mood?limit=200", secureFetcher)
  const { data: healthData } = useSWR("/api/health/entries?limit=500", secureFetcher)

  // Log entries
  const [logs, setLogs] = useState<{ date: string; mood: number; sleep: number; energy: number; focus: number; pain: number; social: number; note: string }[]>([])
  const [mood, setMood] = useState(5)
  const [sleep, setSleep] = useState(7)
  const [energy, setEnergy] = useState(5)
  const [focus, setFocus] = useState(5)
  const [pain, setPain] = useState(1)
  const [social, setSocial] = useState(5)
  const [note, setNote] = useState("")

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hfp-lunar-logs")
      if (saved) setLogs(JSON.parse(saved))
    } catch {}
  }, [])

  function logToday() {
    const entry = { date: today.toISOString().split("T")[0], mood, sleep, energy, focus, pain, social, note }
    const updated = [...logs.filter(l => l.date !== entry.date), entry].sort((a, b) => b.date.localeCompare(a.date))
    setLogs(updated)
    localStorage.setItem("hfp-lunar-logs", JSON.stringify(updated))
    setNote("")
  }

  // Analyze patterns from logs
  const analysis = useMemo(() => {
    if (logs.length < 7) return null
    const byPhase: Record<string, { mood: number[]; sleep: number[]; energy: number[]; focus: number[]; pain: number[] }> = {}
    logs.forEach(log => {
      const phase = getMoonPhase(new Date(log.date)).phase
      if (!byPhase[phase]) byPhase[phase] = { mood: [], sleep: [], energy: [], focus: [], pain: [] }
      byPhase[phase].mood.push(log.mood)
      byPhase[phase].sleep.push(log.sleep)
      byPhase[phase].energy.push(log.energy)
      byPhase[phase].focus.push(log.focus)
      byPhase[phase].pain.push(log.pain)
    })
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0
    return Object.entries(byPhase).map(([phase, data]) => ({
      phase,
      mood: avg(data.mood),
      sleep: avg(data.sleep),
      energy: avg(data.energy),
      focus: avg(data.focus),
      pain: avg(data.pain),
      count: data.mood.length,
    }))
  }, [logs])

  // ===== Personal lunar patterns from mood/sleep data =====
  const personalLunarPatterns = useMemo(() => {
    const moods = moodData?.entries || []
    const healthEntries = healthData?.entries || []
    const sleepEntries = healthEntries.filter((e: any) => e.entryType === "SLEEP")

    if (moods.length < 5 && sleepEntries.length < 5) return null

    const byPhase: Record<string, { moods: number[]; sleepHours: number[] }> = {}
    PHASE_ORDER.forEach(p => { byPhase[p] = { moods: [], sleepHours: [] } })

    moods.forEach((m: any) => {
      if (!m.score || !m.createdAt) return
      const phase = getMoonPhase(new Date(m.createdAt)).phase
      if (byPhase[phase]) byPhase[phase].moods.push(m.score)
    })

    sleepEntries.forEach((e: any) => {
      try {
        const hrs = JSON.parse(e.data)?.hoursSlept || 0
        if (!hrs || !e.createdAt) return
        const phase = getMoonPhase(new Date(e.createdAt)).phase
        if (byPhase[phase]) byPhase[phase].sleepHours.push(hrs)
      } catch {}
    })

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)
    const rows = PHASE_ORDER.map(phase => {
      const m = avg(byPhase[phase].moods)
      const s = avg(byPhase[phase].sleepHours)
      return {
        phase,
        emoji: PHASE_EMOJI[phase],
        mood: m !== null ? Math.round(m * 10) / 10 : null,
        moodCount: byPhase[phase].moods.length,
        sleep: s !== null ? Math.round(s * 10) / 10 : null,
        sleepCount: byPhase[phase].sleepHours.length,
      }
    })

    // Best / worst insights
    const moodRows = rows.filter(r => r.mood !== null && r.moodCount >= 2)
    const sleepRows = rows.filter(r => r.sleep !== null && r.sleepCount >= 2)

    let bestMood = null, worstMood = null, bestSleep = null, worstSleep = null
    if (moodRows.length >= 2) {
      bestMood = moodRows.reduce((a, b) => ((b.mood as number) > (a.mood as number) ? b : a))
      worstMood = moodRows.reduce((a, b) => ((b.mood as number) < (a.mood as number) ? b : a))
    }
    if (sleepRows.length >= 2) {
      bestSleep = sleepRows.reduce((a, b) => ((b.sleep as number) > (a.sleep as number) ? b : a))
      worstSleep = sleepRows.reduce((a, b) => ((b.sleep as number) < (a.sleep as number) ? b : a))
    }

    const totalMoodEntries = moodRows.reduce((s, r) => s + r.moodCount, 0)
    const totalSleepEntries = sleepRows.reduce((s, r) => s + r.sleepCount, 0)

    return { rows, bestMood, worstMood, bestSleep, worstSleep, totalMoodEntries, totalSleepEntries }
  }, [moodData, healthData])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-800">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Lunar Cycles & Correlation Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your mood, sleep, energy, pain, and focus against moon phases. Measure first. Understand later.
          "Only once things can be measured can we start to understand them."
        </p>
      </div>

      <Card className="border-2 border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The case for tracking:</strong> The human body is approximately 70% water — much of it stored
            in fascial tissue. The moon's gravitational pull moves entire oceans. The question is not whether the
            moon <em>can</em> affect biological systems — it is whether the effect is <strong>measurable</strong>.
            Research shows correlations between lunar cycles and: sleep quality (Current Biology, 2013 — 20 min less
            deep sleep at full moon), hospital admissions, birth rates, seizure frequency, and animal behavior.
            None of this is "voodoo." It is physics, biology, and pattern recognition. The only way to know if it
            affects <strong>you</strong> is to track it. So let's track it.
          </p>
        </CardContent>
      </Card>

      {/* Current moon */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{currentMoon.emoji}</span>
            <div>
              <p className="font-bold text-lg">{currentMoon.phase}</p>
              <p className="text-xs text-muted-foreground">{currentMoon.illumination}% illuminated — Day {currentMoon.daysInCycle} of 29.5</p>
              <p className="text-xs text-muted-foreground">{today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"].map((e, i) => (
              <div key={i} className={cn("text-center px-1.5 py-1 rounded text-lg", currentMoon.emoji === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "opacity-40")}>
                {e}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Upcoming Phases</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {upcoming.slice(0, 8).map((p, i) => (
              <div key={i} className="rounded-lg border p-2 text-center">
                <span className="text-lg">{p.emoji}</span>
                <p className="text-[10px] font-semibold">{p.phase}</p>
                <p className="text-[9px] text-muted-foreground">{p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily log */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-2"><CardTitle className="text-base">Daily Log — {currentMoon.phase} {currentMoon.emoji}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Rate each dimension 1-10. Log daily to build your personal lunar correlation dataset.</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Heart className="h-2.5 w-2.5" /> Mood (1-10)</label>
              <Input type="number" min={1} max={10} value={mood} onChange={e => setMood(Number(e.target.value) || 5)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Moon className="h-2.5 w-2.5" /> Sleep hours</label>
              <Input type="number" step="0.5" min={0} max={14} value={sleep} onChange={e => setSleep(Number(e.target.value) || 7)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Energy (1-10)</label>
              <Input type="number" min={1} max={10} value={energy} onChange={e => setEnergy(Number(e.target.value) || 5)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Brain className="h-2.5 w-2.5" /> Focus (1-10)</label>
              <Input type="number" min={1} max={10} value={focus} onChange={e => setFocus(Number(e.target.value) || 5)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="h-2.5 w-2.5" /> Pain (1-10)</label>
              <Input type="number" min={1} max={10} value={pain} onChange={e => setPain(Number(e.target.value) || 1)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="h-2.5 w-2.5" /> Social (1-10)</label>
              <Input type="number" min={1} max={10} value={social} onChange={e => setSocial(Number(e.target.value) || 5)} className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Notes (anything notable today)</label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Arguments, breakthroughs, injuries, great sleep, vivid dreams..." className="h-8 text-sm" />
          </div>
          <button onClick={logToday} className="w-full h-9 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            Log Today — {currentMoon.phase}
          </button>
        </CardContent>
      </Card>

      {/* Personal patterns */}
      {analysis && analysis.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Your Patterns (So Far)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">
              Based on {logs.length} log entries. More data = more reliable patterns. Aim for 2+ full cycles (60+ days).
            </p>
            <div className="space-y-2">
              {analysis.sort((a, b) => {
                const order = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
                return order.indexOf(a.phase) - order.indexOf(b.phase)
              }).map((row, i) => (
                <div key={i} className="rounded-lg border p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold">{row.phase}</p>
                    <Badge variant="outline" className="text-[8px]">{row.count} entries</Badge>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-[9px]">
                    <div><span className="text-muted-foreground">Mood:</span> <span className={cn("font-bold", row.mood >= 7 ? "text-emerald-600" : row.mood <= 4 ? "text-red-600" : "")}>{row.mood}</span></div>
                    <div><span className="text-muted-foreground">Sleep:</span> <span className="font-bold">{row.sleep}h</span></div>
                    <div><span className="text-muted-foreground">Energy:</span> <span className={cn("font-bold", row.energy >= 7 ? "text-emerald-600" : row.energy <= 4 ? "text-red-600" : "")}>{row.energy}</span></div>
                    <div><span className="text-muted-foreground">Focus:</span> <span className="font-bold">{row.focus}</span></div>
                    <div><span className="text-muted-foreground">Pain:</span> <span className={cn("font-bold", row.pain >= 5 ? "text-red-600" : "text-emerald-600")}>{row.pain}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Known correlations */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Documented Lunar Correlations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            These are correlations observed in peer-reviewed research or large datasets. Correlation is not
            causation — but correlation is the first step toward understanding causation.
          </p>
          {[
            { domain: "Sleep Quality", icon: Moon, color: "text-indigo-500", finding: "Current Biology (2013): subjects slept 20 minutes less during full moon, with 30% less deep sleep (EEG-measured), even in windowless rooms with no moon visibility. Melatonin levels dropped. Replicated in multiple studies.", strength: "Strong" },
            { domain: "Hospital Admissions", icon: Activity, color: "text-red-500", finding: "Multiple studies show 3-5% increase in emergency room visits during full moons. Bradford Royal Infirmary (2000): significant increase in animal bite admissions. Effect size is small but consistent across large datasets.", strength: "Moderate" },
            { domain: "Birth Rates", icon: Heart, color: "text-rose-500", finding: "Controversial — some large studies show slight peaks around full moon, others find no effect. Japanese study (2007): 1% more births on days surrounding full moon in 5 million records. Small effect, large sample.", strength: "Weak-Moderate" },
            { domain: "Seizure Frequency", icon: Brain, color: "text-violet-500", finding: "Epilepsy & Behavior (2004): seizure frequency correlated with lunar phases in some patient groups, possibly linked to changes in melatonin and electromagnetic sensitivity. Not universal but statistically significant in subpopulations.", strength: "Moderate" },
            { domain: "Mood & Mental Health", icon: Heart, color: "text-amber-500", finding: "Bipolar cycling has shown lunar correlations in case studies. General population effects are subtle — likely mediated through sleep disruption rather than direct gravitational effects. Your personal data is the only data that matters here.", strength: "Weak-Moderate" },
            { domain: "Financial Markets", icon: DollarSign, color: "text-emerald-500", finding: "Ilia Dichev (2001, American Economic Review): stock returns around new moons are roughly double those around full moons, across 48 countries over 100 years. The 'lunar effect' in markets may reflect collective mood/risk appetite shifts tied to sleep and biological rhythms.", strength: "Moderate" },
            { domain: "Agriculture", icon: Sun, color: "text-green-600", finding: "Biodynamic farming (planting by lunar calendar) has millennia of traditional practice. Modern research is limited but some studies show germination rate differences by lunar phase. The gravitational effect on soil moisture is real, however small.", strength: "Traditional" },
            { domain: "Crime Rates", icon: AlertTriangle, color: "text-red-600", finding: "Mixed evidence. Some police departments report full moon spikes. Large meta-analyses show weak or no effect. But: if sleep disruption increases around full moons (which is proven), and sleep deprivation increases impulsivity and aggression (also proven), the chain of causation is plausible.", strength: "Weak" },
            { domain: "Animal Behavior", icon: Eye, color: "text-blue-500", finding: "Well-documented: marine animals (coral spawning, crab migration), predator-prey dynamics (more hunting during full moon light), insect behavior, bird migration. The biological world responds to lunar cycles. Humans are biological.", strength: "Strong" },
            { domain: "Election Cycles", icon: Users, color: "text-slate-600", finding: "No direct lunar-election research, but voter behavior correlates with collective mood, which correlates with sleep quality, which correlates with lunar phase. The chain is indirect but each link is documented. Worth tracking election outcomes against lunar phases.", strength: "Speculative" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                  <p className="text-xs font-semibold flex-1">{item.domain}</p>
                  <Badge variant="outline" className={cn("text-[8px]",
                    item.strength === "Strong" ? "border-emerald-300 text-emerald-700" :
                    item.strength === "Moderate" ? "border-blue-300 text-blue-700" :
                    item.strength === "Weak" ? "border-amber-300 text-amber-700" :
                    "border-slate-300 text-slate-600"
                  )}>{item.strength}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{item.finding}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Moon phases explained */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The 8 Phases & Traditional Associations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Traditional systems (Chinese, Ayurvedic, biodynamic) associate each phase with different energy states.
            Track your experience against these — validate or invalidate them with your own data.
          </p>
          {[
            { emoji: "🌑", phase: "New Moon", days: "Day 0-1", association: "Reset, intention-setting, low energy, introspection. Traditionally: plant seeds (literal and metaphorical), start new projects. Your body may want rest." },
            { emoji: "🌒", phase: "Waxing Crescent", days: "Day 2-6", association: "Building momentum. Energy rises. Motivation increases. Good for taking first steps on intentions set at new moon." },
            { emoji: "🌓", phase: "First Quarter", days: "Day 7-8", association: "Decision point, challenges surface. Energy for action. Traditionally: obstacles appear that test commitment. Push through or course-correct." },
            { emoji: "🌔", phase: "Waxing Gibbous", days: "Day 9-13", association: "Refinement, adjustment, patience. Almost there but not quite. Fine-tuning rather than starting new things." },
            { emoji: "🌕", phase: "Full Moon", days: "Day 14-15", association: "Peak illumination and energy. Emotions amplified. Sleep often disrupted (research-confirmed). Heightened social energy. Culmination of what was started at new moon." },
            { emoji: "🌖", phase: "Waning Gibbous", days: "Day 16-20", association: "Gratitude, sharing, teaching. The harvest phase. Energy begins to decrease. Good for giving back and reflecting." },
            { emoji: "🌗", phase: "Last Quarter", days: "Day 21-22", association: "Release, letting go, forgiveness. Clearing what no longer serves. Traditionally: prune, clean, simplify." },
            { emoji: "🌘", phase: "Waning Crescent", days: "Day 23-28", association: "Surrender, rest, recuperation. Lowest energy. The void before renewal. Traditionally: sleep more, dream, be still." },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-2.5">
              <span className="text-xl shrink-0">{p.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{p.phase}</p>
                  <Badge variant="outline" className="text-[8px]">{p.days}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.association}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* The bigger picture */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> The Bigger Picture: Cycles Within Cycles
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              The moon is one cycle. But the world runs on overlapping cycles that all interact:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { cycle: "Lunar cycle", period: "29.5 days", affects: "Sleep, mood, tides, biological rhythms" },
                { cycle: "Solar cycle", period: "11 years", affects: "Geomagnetic activity, radio, climate patterns" },
                { cycle: "Circadian rhythm", period: "24 hours", affects: "Cortisol, melatonin, body temperature, cognition" },
                { cycle: "Seasonal/circannual", period: "365 days", affects: "Vitamin D, mood (SAD), immune function" },
                { cycle: "Market cycles", period: "~7-10 years", affects: "Bull/bear markets, credit, employment" },
                { cycle: "Election cycles", period: "2-4 years", affects: "Policy, regulation, government spending, market sentiment" },
                { cycle: "Menstrual cycle", period: "~28 days", affects: "Hormones, mood, energy, pain — closely mirrors lunar cycle" },
                { cycle: "Generational cycles", period: "~80 years", affects: "Cultural values, risk appetite, institutional trust (Strauss-Howe theory)" },
              ].map((c, i) => (
                <div key={i} className="rounded bg-violet-50 border border-violet-200 p-2">
                  <p className="text-[10px] font-semibold text-violet-800">{c.cycle}</p>
                  <p className="text-[9px] text-violet-600">{c.period}</p>
                  <p className="text-[9px] text-muted-foreground">{c.affects}</p>
                </div>
              ))}
            </div>
            <p className="text-violet-700 font-medium mt-2">
              When you zoom out far enough, individual events start to look like waves in a larger ocean.
              The platform's job is to help you see the waves — not just the individual drops of water.
              Track everything. Measure everything. Patterns emerge from data, not from belief.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Water and fascia connection */}
      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Droplets className="h-4 w-4" /> The Water-Fascia-Moon Connection
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your body is approximately 70% water — and a significant portion of that water is stored in
            your <a href="/fascia" className="text-rose-600 hover:underline">fascial tissue</a> as part
            of the <Explain tip="A gel-like matrix of hyaluronic acid and water that surrounds fascial fibers. Its viscosity determines tissue flexibility. When hydrated: supple, sliding, pain-free. When dehydrated: stiff, sticky, painful">ground substance</Explain>.
            The moon moves entire oceans through gravitational pull. The question of whether that same
            gravitational variation affects the fluid dynamics within your connective tissue is not supernatural —
            it is a question of <strong>scale and sensitivity thresholds</strong>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            We know: fascia is extremely sensitive to hydration changes (Schleip's research). We know: the moon
            affects fluid systems. We know: sleep disruption at full moon is real (Current Biology). Whether the
            chain <strong>moon → fluid dynamics → fascial tension → pain/mood/sleep</strong> is direct or indirect
            — the correlations are worth measuring in your own body. That is all we are saying.
          </p>
        </CardContent>
      </Card>

      {/* Methodology note */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">How to Use This Correctly</p>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Log consistently.</strong> The data is only as good as the logging. Aim for daily entries for at least 2 full lunar cycles (60 days) before drawing any conclusions.</p>
            <p><strong>Don't confirm what you want to see.</strong> Confirmation bias is the enemy of good data. Log honestly, then look at the numbers. If there's no pattern — that IS the finding.</p>
            <p><strong>Control for confounders.</strong> Full moon = more light = worse sleep is a real mechanism but not mysterious. Weekends affect mood. Seasons affect energy. The goal is to isolate the lunar variable after controlling for others.</p>
            <p><strong>Sample size matters.</strong> One bad full moon night is an anecdote. Twenty bad full moon nights across 2 years is a pattern. The platform will aggregate anonymous data across all users — the more people tracking, the clearer the signal.</p>
            <p><strong>Correlation ≠ causation.</strong> Even a strong correlation is just the starting point. The mechanism matters. We present the data — you form the conclusions.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Future feature:</strong> Anonymous aggregate analysis — when enough users are logging daily,
            the platform will show population-level correlations between moon phases and mood/sleep/energy/pain
            across thousands of data points. Individual data stays encrypted. The aggregate patterns become visible
            to everyone. This is how you build knowledge: one data point at a time, across many people, over long
            periods, without declaring truth in advance.
          </p>
        </CardContent>
      </Card>

      {/* ===== Your Personal Lunar Patterns (from mood + sleep data) ===== */}
      {personalLunarPatterns && (
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-violet-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Your Personal Lunar Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Computed from your logged mood ({personalLunarPatterns.totalMoodEntries} entries) and sleep
              ({personalLunarPatterns.totalSleepEntries} entries) data across the platform. Phases with fewer than
              2 data points are shown but not used for "best/worst" detection.
            </p>

            {/* Insight summary */}
            <div className="space-y-1.5">
              {personalLunarPatterns.bestMood && personalLunarPatterns.worstMood &&
                personalLunarPatterns.bestMood.phase !== personalLunarPatterns.worstMood.phase && (
                  <div className="rounded-lg border bg-background p-2.5 flex items-center gap-2">
                    <span className="text-lg shrink-0">{personalLunarPatterns.bestMood.emoji}</span>
                    <p className="text-xs flex-1">
                      Your data suggests you <span className="font-semibold text-emerald-600">feel best</span> during{" "}
                      <span className="font-semibold">{personalLunarPatterns.bestMood.phase}</span>{" "}
                      (avg mood {personalLunarPatterns.bestMood.mood}/10),
                      and <span className="font-semibold text-red-600">worst</span> during{" "}
                      <span className="font-semibold">{personalLunarPatterns.worstMood.phase}</span>{" "}
                      (avg mood {personalLunarPatterns.worstMood.mood}/10).
                    </p>
                  </div>
              )}
              {personalLunarPatterns.bestSleep && personalLunarPatterns.worstSleep &&
                personalLunarPatterns.bestSleep.phase !== personalLunarPatterns.worstSleep.phase && (
                  <div className="rounded-lg border bg-background p-2.5 flex items-center gap-2">
                    <span className="text-lg shrink-0">{personalLunarPatterns.worstSleep.emoji}</span>
                    <p className="text-xs flex-1">
                      You <span className="font-semibold text-emerald-600">sleep longest</span> during{" "}
                      <span className="font-semibold">{personalLunarPatterns.bestSleep.phase}</span>{" "}
                      ({personalLunarPatterns.bestSleep.sleep}hrs avg),
                      and <span className="font-semibold text-red-600">sleep least</span> during{" "}
                      <span className="font-semibold">{personalLunarPatterns.worstSleep.phase}</span>{" "}
                      ({personalLunarPatterns.worstSleep.sleep}hrs avg).
                    </p>
                  </div>
              )}
              {!personalLunarPatterns.bestMood && !personalLunarPatterns.bestSleep && (
                <div className="rounded-lg border bg-background p-2.5">
                  <p className="text-xs text-muted-foreground">
                    Not enough data yet to detect phase-based patterns. Keep logging — patterns need 2+ entries per phase.
                  </p>
                </div>
              )}
            </div>

            {/* Phase-by-phase breakdown */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Averages by phase</p>
              {personalLunarPatterns.rows.map((row, i) => {
                const bestMoodPhase = personalLunarPatterns.bestMood?.phase
                const worstMoodPhase = personalLunarPatterns.worstMood?.phase
                const bestSleepPhase = personalLunarPatterns.bestSleep?.phase
                const worstSleepPhase = personalLunarPatterns.worstSleep?.phase
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 bg-background",
                    row.phase === bestMoodPhase && "ring-1 ring-emerald-300",
                    row.phase === worstMoodPhase && "ring-1 ring-red-300",
                  )}>
                    <span className="text-lg shrink-0">{row.emoji}</span>
                    <p className="text-xs font-semibold w-32 shrink-0">{row.phase}</p>
                    <div className="flex items-center gap-3 flex-1 text-[10px]">
                      <div className="flex items-center gap-1">
                        <Heart className="h-2.5 w-2.5 text-rose-500" />
                        <span className="text-muted-foreground">mood:</span>
                        <span className={cn(
                          "font-bold",
                          row.mood !== null && row.mood >= 7 ? "text-emerald-600" :
                          row.mood !== null && row.mood <= 4 ? "text-red-600" : ""
                        )}>{row.mood !== null ? row.mood : "—"}</span>
                        <span className="text-muted-foreground">({row.moodCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Moon className="h-2.5 w-2.5 text-indigo-500" />
                        <span className="text-muted-foreground">sleep:</span>
                        <span className={cn(
                          "font-bold",
                          row.phase === bestSleepPhase ? "text-emerald-600" :
                          row.phase === worstSleepPhase ? "text-red-600" : ""
                        )}>{row.sleep !== null ? `${row.sleep}h` : "—"}</span>
                        <span className="text-muted-foreground">({row.sleepCount})</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-[10px] text-muted-foreground italic">
              Based on your actual platform data — not astrology, not traditional associations. Cross-check against
              the daily log above and the "Your Patterns (So Far)" section for a full picture.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/chinese-zodiac" className="text-sm text-red-600 hover:underline">Chinese Zodiac</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/correlations" className="text-sm text-violet-600 hover:underline">Correlations</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/trajectory" className="text-sm text-blue-600 hover:underline">Life Trajectory</a>
      </div>
    </div>
  )
}
