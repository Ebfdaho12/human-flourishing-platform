"use client"

import { useState, useMemo } from "react"
import { Shield, Heart, Zap, Brain, Clock, Sun, ChevronDown, ChevronUp, AlertTriangle, Activity, Wind, Snowflake, Moon, Plus, TrendingDown, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type Episode = {
  id: string
  at: string
  intensity: number
  durationMin?: number
  trigger?: string
  technique?: string
  relief?: number
  notes?: string
}

const TRIGGERS = ["Work", "Money", "Relationship", "Health", "News", "Social", "Sleep", "Caffeine", "Unknown"]
const TECHNIQUES = ["Physiological sigh", "Box breathing", "Cold water", "5-4-3-2-1 grounding", "Walk", "Cold exposure", "Journal", "Humming / vagal", "Call someone", "Other"]

const IMMEDIATE = [
  { name: "Physiological Sigh", desc: "Double inhale through the nose, long exhale through the mouth. 1-3 breaths. The fastest scientifically validated method for real-time stress reduction.", source: "Huberman Lab, Cell Reports Medicine 2023", link: "/breathwork" },
  { name: "Cold Water on Face/Wrists", desc: "Triggers the mammalian dive reflex — activates the vagus nerve, drops heart rate within 30 seconds. Splash cold water or hold ice on wrists.", source: "Autonomic Neuroscience" },
  { name: "5-4-3-2-1 Grounding", desc: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Interrupts the anxious thought loop by forcing present-moment sensory awareness.", source: "CBT clinical protocols" },
  { name: "Box Breathing (4-4-4-4)", desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs for acute stress control. Activates the parasympathetic nervous system.", source: "Military performance research", link: "/breathwork" },
  { name: "Bilateral Stimulation", desc: "Alternate cross-body tapping (tap left knee with right hand, then right knee with left hand) or horizontal eye movements. Based on EMDR principles — activates both hemispheres, reducing emotional charge.", source: "EMDR International Association" },
]

const SHORT_TERM = [
  { name: "Body Scan Meditation", desc: "Progressive awareness from toes to head. Notice tension without trying to fix it. Identify where anxiety physically lives in your body — jaw, chest, stomach, shoulders.", source: "Jon Kabat-Zinn, MBSR protocol" },
  { name: "Cold Exposure (2 min)", desc: "A 2-minute cold shower raises dopamine 250% and norepinephrine significantly. Acute controlled stress replaces chronic uncontrolled stress — your nervous system resets.", source: "Molecular Psychiatry", link: "/cold-exposure" },
  { name: "Gentle Movement (10 min)", desc: "A 10-minute walk reduces anxiety as effectively as medication in some studies. NOT intense exercise — gentle, rhythmic movement. Walk outside if possible.", source: "JAMA Psychiatry meta-analysis" },
  { name: "Expressive Writing", desc: "Pennebaker protocol: write continuously about your anxiety for 15-20 minutes, 3-4 consecutive days. Don't edit, don't censor. Measurable cortisol reduction and immune improvement.", source: "Pennebaker & Beall, 1986; replicated extensively" },
  { name: "Vagal Nerve Activation", desc: "Humming, gargling vigorously, or singing all activate the vagus nerve through the laryngeal muscles. The vagus nerve is your body's built-in calm-down switch.", source: "Frontiers in Neuroscience" },
]

const DAILY = [
  { name: "Morning Sunlight (10-30 min)", desc: "Sets circadian rhythm and properly times cortisol peak. Cortisol should be HIGH in the morning and LOW at night — disrupted timing drives chronic anxiety.", icon: Sun },
  { name: "Regular Breathwork Practice", desc: "Daily breathwork builds vagal tone, measurable via heart rate variability (HRV). Higher HRV = greater stress resilience. Even 5 minutes/day compounds.", icon: Wind },
  { name: "Magnesium Glycinate (400mg)", desc: "Before bed. Magnesium calms the nervous system — most people are deficient. Glycinate form crosses the blood-brain barrier and promotes sleep.", icon: Moon },
  { name: "Exercise 3-5x/Week", desc: "Reduces anxiety as effectively as SSRIs in multiple meta-analyses. The mechanism: BDNF release, serotonin synthesis, cortisol regulation, improved sleep.", icon: Activity },
  { name: "Sleep 7-9 Hours", desc: "Sleep deprivation increases amygdala reactivity by 60%. One bad night measurably worsens anxiety. This is non-negotiable for mental health.", icon: Moon },
  { name: "Limit Caffeine After Noon", desc: "Caffeine half-life is 6 hours. A 2pm coffee means 50% is still active at 8pm. Caffeine amplifies anxiety by blocking adenosine and raising cortisol.", icon: AlertTriangle },
  { name: "Cold Exposure Habit", desc: "Regular cold exposure builds stress tolerance through hormesis — you train your nervous system that discomfort is temporary and survivable.", icon: Snowflake },
]

const COGNITIVE = [
  { name: "The STOP Method", desc: "Stop what you're doing. Take a breath. Observe — what am I actually feeling right now? Proceed with intention rather than reaction.", color: "text-violet-600" },
  { name: "Cognitive Reframing", desc: "Ask: 'What would I tell a friend in this exact situation?' We are consistently kinder and more rational toward others than ourselves.", color: "text-blue-600" },
  { name: "Worry Window", desc: "Schedule 15 minutes per day specifically for worrying. Outside that window, write the worry down and defer it. This contains anxiety instead of letting it bleed into everything.", color: "text-amber-600" },
  { name: "Worst-Case Scenario", desc: "Write out the worst case fully and specifically. Usually it is far less catastrophic than the vague, undefined anxiety suggests. Naming the fear shrinks it.", color: "text-rose-600" },
]

export default function AnxietyToolkitPage() {
  const [expanded, setExpanded] = useState<string | null>("immediate")
  const [episodes, setEpisodes] = useSyncedStorage<Episode[]>("hfp-anxiety-episodes", [])
  const [showLog, setShowLog] = useState(false)
  const [form, setForm] = useState<Partial<Episode>>({
    at: new Date().toISOString().slice(0, 16),
    intensity: 5,
  })

  const toggle = (key: string) => setExpanded(expanded === key ? null : key)

  function logEpisode() {
    if (!form.at || !form.intensity) return
    const ep: Episode = {
      id: crypto.randomUUID(),
      at: form.at!,
      intensity: form.intensity!,
      durationMin: form.durationMin,
      trigger: form.trigger,
      technique: form.technique,
      relief: form.relief,
      notes: form.notes,
    }
    setEpisodes([ep, ...episodes])
    setForm({ at: new Date().toISOString().slice(0, 16), intensity: 5 })
    setShowLog(false)
  }

  const analytics = useMemo(() => {
    if (episodes.length === 0) return null
    const weekAgo = Date.now() - 7 * 86400000
    const monthAgo = Date.now() - 30 * 86400000

    const lastWeek = episodes.filter(e => new Date(e.at).getTime() >= weekAgo)
    const lastMonth = episodes.filter(e => new Date(e.at).getTime() >= monthAgo)
    const priorWeek = episodes.filter(e => {
      const t = new Date(e.at).getTime()
      return t >= weekAgo - 7 * 86400000 && t < weekAgo
    })

    const avgIntensity = lastMonth.length ? lastMonth.reduce((s, e) => s + e.intensity, 0) / lastMonth.length : 0
    const weekDelta = lastWeek.length - priorWeek.length

    const triggerCounts: Record<string, number> = {}
    lastMonth.forEach(e => {
      if (e.trigger) triggerCounts[e.trigger] = (triggerCounts[e.trigger] ?? 0) + 1
    })
    const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]

    const techStats: Record<string, { uses: number; totalRelief: number }> = {}
    lastMonth.forEach(e => {
      if (!e.technique) return
      if (!techStats[e.technique]) techStats[e.technique] = { uses: 0, totalRelief: 0 }
      techStats[e.technique].uses++
      techStats[e.technique].totalRelief += e.relief ?? 0
    })
    const bestTechnique = Object.entries(techStats)
      .filter(([_, s]) => s.uses >= 2)
      .map(([name, s]) => ({ name, uses: s.uses, avgRelief: s.totalRelief / s.uses }))
      .sort((a, b) => b.avgRelief - a.avgRelief)[0]

    const byDay: { day: string; count: number; avgIntensity: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const k = d.toISOString().slice(0, 10)
      const day = episodes.filter(e => e.at.slice(0, 10) === k)
      byDay.push({
        day: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
        count: day.length,
        avgIntensity: day.length ? day.reduce((s, e) => s + e.intensity, 0) / day.length : 0,
      })
    }

    return { lastWeek, lastMonth, weekDelta, avgIntensity, topTrigger, bestTechnique, byDay }
  }, [episodes])

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Anxiety & Stress Toolkit</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This is not therapy. This is a toolkit of research-backed techniques to activate your <Explain tip="The part of your nervous system responsible for calming you down — it slows heart rate and triggers the 'rest and digest' state">parasympathetic</Explain> nervous system and lower <Explain tip="Your body's main stress hormone — useful in short bursts, but harmful when it stays elevated for days or weeks">cortisol</Explain>. Use them RIGHT NOW.
        </p>
      </div>

      {/* Episode tracker */}
      <Card className="border-teal-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-teal-600" /> Episode Tracker</span>
            {!showLog && (
              <button onClick={() => setShowLog(true)} className="flex items-center gap-1 rounded-md border border-teal-300 text-teal-700 px-2 py-1 text-xs hover:bg-teal-50">
                <Plus className="h-3 w-3" /> Log
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {showLog && (
            <div className="rounded-lg border bg-slate-50/40 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">When</label>
                  <input type="datetime-local" value={form.at ?? ""} onChange={e => setForm({ ...form, at: e.target.value })} className="w-full rounded-md border px-2 py-1 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Duration (min)</label>
                  <input type="number" placeholder="opt" value={form.durationMin ?? ""} onChange={e => setForm({ ...form, durationMin: Number(e.target.value) || undefined })} className="w-full rounded-md border px-2 py-1 text-xs" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Intensity: {form.intensity}/10</label>
                <input type="range" min={1} max={10} value={form.intensity ?? 5} onChange={e => setForm({ ...form, intensity: Number(e.target.value) })} className="w-full accent-teal-600" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Trigger</label>
                  <select value={form.trigger ?? ""} onChange={e => setForm({ ...form, trigger: e.target.value || undefined })} className="w-full rounded-md border px-2 py-1 text-xs">
                    <option value="">—</option>
                    {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">What helped</label>
                  <select value={form.technique ?? ""} onChange={e => setForm({ ...form, technique: e.target.value || undefined })} className="w-full rounded-md border px-2 py-1 text-xs">
                    <option value="">—</option>
                    {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {form.technique && (
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Relief: {form.relief ?? 0}/10</label>
                  <input type="range" min={0} max={10} value={form.relief ?? 0} onChange={e => setForm({ ...form, relief: Number(e.target.value) })} className="w-full accent-emerald-500" />
                </div>
              )}
              <textarea placeholder="Notes (optional)" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border px-2 py-1.5 text-xs" rows={2} />
              <div className="flex gap-2">
                <button onClick={logEpisode} className="flex-1 rounded-lg bg-teal-600 text-white text-xs font-medium py-1.5 hover:bg-teal-700">Save</button>
                <button onClick={() => setShowLog(false)} className="flex-1 rounded-lg border text-xs py-1.5">Cancel</button>
              </div>
            </div>
          )}

          {analytics ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">This week</p>
                  <p className="text-sm font-bold tabular-nums">{analytics.lastWeek.length}<span className="text-[10px] text-muted-foreground font-normal"> episodes</span></p>
                  {analytics.weekDelta !== 0 && (
                    <p className={cn("text-[10px] tabular-nums", analytics.weekDelta < 0 ? "text-emerald-600" : "text-amber-600")}>
                      {analytics.weekDelta < 0 ? "↓" : "↑"} {Math.abs(analytics.weekDelta)} vs prior
                    </p>
                  )}
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg intensity</p>
                  <p className={cn("text-sm font-bold tabular-nums", analytics.avgIntensity > 7 ? "text-rose-600" : analytics.avgIntensity > 4 ? "text-amber-600" : "text-emerald-600")}>{analytics.avgIntensity.toFixed(1)}<span className="text-[10px] text-muted-foreground font-normal">/10</span></p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Top trigger</p>
                  <p className="text-sm font-bold">{analytics.topTrigger?.[0] ?? "—"}</p>
                  {analytics.topTrigger && <p className="text-[10px] text-muted-foreground">{analytics.topTrigger[1]}x last 30d</p>}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Last 14 days</p>
                <div className="flex items-end gap-0.5 h-12">
                  {analytics.byDay.map((d, i) => {
                    const max = Math.max(...analytics.byDay.map(x => x.count), 1)
                    const h = (d.count / max) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={cn("w-full rounded-t", d.avgIntensity > 7 ? "bg-rose-400" : d.avgIntensity > 4 ? "bg-amber-400" : d.count > 0 ? "bg-teal-400" : "bg-slate-100")} style={{ height: `${h}%`, minHeight: d.count > 0 ? 3 : 0 }} title={d.count > 0 ? `${d.count} episode${d.count > 1 ? "s" : ""}, avg ${d.avgIntensity.toFixed(1)}/10` : "none"} />
                        <span className="text-[8px] text-muted-foreground">{d.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {analytics.bestTechnique && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 flex items-start gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-900 leading-snug">
                    <span className="font-semibold">{analytics.bestTechnique.name}</span> is your most effective technique — {analytics.bestTechnique.uses} uses, avg relief <span className="font-bold tabular-nums">{analytics.bestTechnique.avgRelief.toFixed(1)}/10</span>. Lean on it.
                  </p>
                </div>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Recent episodes ({episodes.length})</summary>
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {episodes.slice(0, 10).map(e => (
                    <div key={e.id} className="flex items-center gap-2 rounded border p-1.5 text-[11px]">
                      <span className="text-muted-foreground font-mono tabular-nums w-20 shrink-0">{new Date(e.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className={cn("font-bold tabular-nums w-8", e.intensity > 7 ? "text-rose-600" : e.intensity > 4 ? "text-amber-600" : "text-emerald-600")}>{e.intensity}/10</span>
                      <span className="flex-1 text-muted-foreground truncate">{[e.trigger, e.technique].filter(Boolean).join(" → ")}</span>
                      <button onClick={() => setEpisodes(episodes.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </details>
            </>
          ) : !showLog ? (
            <p className="text-xs text-muted-foreground">
              Log an episode to start tracking patterns — which triggers hit you, what actually works. Data reveals what memory distorts.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-2 border-teal-200 bg-teal-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Anxiety is a physiological state, not a character flaw.</strong> Your <Explain tip="The amygdala is the brain's alarm system — it detects threats and triggers the fight-or-flight response before your conscious mind even knows what's happening">amygdala</Explain> is doing its job — it just needs better calibration. Every technique below targets a specific mechanism in your nervous system. They are organized by speed of effect so you can find what you need in the moment.
          </p>
        </CardContent>
      </Card>

      {/* Immediate */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("immediate")} className="flex items-center gap-2 w-full text-left">
            <Zap className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm flex-1">Immediate (seconds to minutes)</CardTitle>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700 mr-2">Fastest</Badge>
            {expanded === "immediate" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "immediate" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {IMMEDIATE.map((t, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold">{t.name}</span>
                  {t.link && <a href={t.link} className="text-[9px] text-teal-600 hover:underline ml-auto">Practice this →</a>}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1 italic">{t.source}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Short-term */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("short")} className="flex items-center gap-2 w-full text-left">
            <Clock className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm flex-1">Short-Term (minutes to hours)</CardTitle>
            <Badge variant="outline" className="text-[8px] border-blue-300 text-blue-700 mr-2">Deeper</Badge>
            {expanded === "short" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "short" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {SHORT_TERM.map((t, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold">{t.name}</span>
                  {t.link && <a href={t.link} className="text-[9px] text-teal-600 hover:underline ml-auto">Learn more →</a>}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1 italic">{t.source}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Daily Practices */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("daily")} className="flex items-center gap-2 w-full text-left">
            <Sun className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-sm flex-1">Daily Practices (prevention)</CardTitle>
            <Badge variant="outline" className="text-[8px] border-orange-300 text-orange-700 mr-2">Foundation</Badge>
            {expanded === "daily" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "daily" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {DAILY.map((t, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <t.icon className="h-3 w-3 text-orange-500 shrink-0" />
                  <span className="text-xs font-semibold">{t.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Cognitive Tools */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("cognitive")} className="flex items-center gap-2 w-full text-left">
            <Brain className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-sm flex-1">Cognitive Tools</CardTitle>
            <Badge variant="outline" className="text-[8px] border-violet-300 text-violet-700 mr-2">Reframe</Badge>
            {expanded === "cognitive" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "cognitive" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {COGNITIVE.map((t, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className={cn("h-3 w-3 shrink-0", t.color)} />
                  <span className="text-xs font-semibold">{t.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* When to Seek Help */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" /> When to Seek Professional Help
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <p><strong className="text-red-700">Persistent anxiety:</strong> If anxiety lasts more than 2 weeks and interferes with daily functioning, talk to a professional.</p>
            <p><strong className="text-red-700">Panic attacks:</strong> Recurring episodes of intense fear with physical symptoms (chest pain, shortness of breath, dizziness).</p>
            <p><strong className="text-red-700">Suicidal ideation:</strong> If you are having thoughts of self-harm, call 988 (Suicide & Crisis Lifeline) immediately.</p>
            <p><strong className="text-red-700">Substance use to cope:</strong> Using alcohol, drugs, or other substances to manage anxiety is a sign professional support is needed.</p>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="border-teal-200 bg-teal-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-teal-900 mb-2">Connected Systems</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Anxiety lives at the intersection of every major body system. Your <Explain tip="The vagus nerve is the longest nerve in your body — it connects your brain to your gut, heart, and lungs, and controls the 'rest and digest' response">vagus nerve</Explain> connects breathwork to gut health. Your <Explain tip="Fascia is the connective tissue network that wraps every muscle and organ — it stores physical tension from emotional stress">fascia</Explain> stores emotional tension physically. Your sleep quality directly controls amygdala reactivity. Treating anxiety as an isolated mental issue misses the full picture — it is a whole-body state.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 flex-wrap">
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/cold-exposure" className="text-sm text-blue-600 hover:underline">Cold Exposure</a>
        <a href="/stoicism" className="text-sm text-amber-600 hover:underline">Stoicism</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Optimization</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
      </div>
    </div>
  )
}
