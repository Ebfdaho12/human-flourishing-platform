"use client"

import { useState, useEffect, useMemo } from "react"
import { Snowflake, Flame, ShieldAlert, Zap, Brain, Heart, ThermometerSnowflake, Timer, Plus, Trash2, Activity, Droplets, Link, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"

interface Session { date: string; duration: number; temp: string; feeling: string }

const PROTOCOLS = [
  { level: "Beginner", color: "border-emerald-300 text-emerald-700", label: "Cold Shower Finish", detail: "Last 30 seconds of your normal shower on cold. Focus on slow nasal breathing.", time: "30 sec", tip: "Start lukewarm and gradually decrease. Exhale slowly through the discomfort." },
  { level: "Intermediate", color: "border-amber-300 text-amber-700", label: "Full Cold Shower", detail: "1-2 minutes fully cold. Practice controlled breathing throughout. Build up over 2 weeks.", time: "1-2 min", tip: "Breathe through the initial gasp reflex. It subsides after 30 seconds." },
  { level: "Advanced", color: "border-orange-300 text-orange-700", label: "Cold Immersion", detail: "2-5 min in ice bath or cold plunge at 50-59°F (10-15°C). Deliberate calm.", time: "2-5 min", tip: "Enter slowly. Hands and feet last (or keep them out initially)." },
  { level: "Elite", color: "border-red-300 text-red-700", label: "Winter Swimming / Extended", detail: "Open water swimming in cold conditions. 5+ min sub-50°F. Requires significant adaptation.", time: "5+ min", tip: "Always with experienced partners. Know your exit strategy before entering." },
]

const BENEFITS = [
  { icon: Brain, title: "250% Dopamine Increase", desc: "Cold water immersion raises dopamine 2.5x above baseline, lasting 2-3 hours with no crash — unlike caffeine or stimulants.", source: "Molecular Psychiatry", color: "text-violet-600" },
  { icon: Flame, title: "Brown Fat Activation", desc: "Cold triggers brown adipose tissue (BAT) to burn white fat for heat. Regular exposure increases BAT volume over time.", source: "Søberg et al., Cell Reports Medicine", color: "text-orange-600" },
  { icon: ShieldAlert, title: "Immune System Boost", desc: "Trained cold exposure practitioners had 29% fewer sick days and significantly reduced inflammatory cytokines.", source: "Radboud University Medical Center, 2014", color: "text-emerald-600" },
  { icon: Activity, title: "Reduced Inflammation", desc: "Norepinephrine release during cold exposure suppresses pro-inflammatory pathways. Accelerates exercise recovery.", source: "European Journal of Applied Physiology", color: "text-blue-600" },
  { icon: Heart, title: "Mental Resilience", desc: "Voluntary discomfort builds stress inoculation. You train your brain that discomfort is survivable and temporary.", source: "Huberman Lab, Stanford", color: "text-rose-600" },
  { icon: Droplets, title: "Circulation & Skin", desc: "Vasoconstriction/vasodilation cycling improves vascular tone. Tightens pores, reduces puffiness, improves lymphatic flow.", source: "Journal of Clinical Investigation", color: "text-cyan-600" },
]

const HORMETIC_STRESSORS = [
  { name: "Exercise", desc: "Micro-tears in muscle fibers trigger repair and growth", link: "/health-protocols" },
  { name: "Fasting", desc: "Nutrient scarcity activates autophagy and cellular cleanup", link: "/health-protocols" },
  { name: "Heat / Sauna", desc: "Heat shock proteins protect cells and boost growth hormone", link: "/health-protocols" },
  { name: "Sunlight", desc: "UV stress triggers melanin production and vitamin D synthesis", link: "/health-protocols" },
  { name: "Cold Exposure", desc: "Cold shock proteins, norepinephrine (adrenaline-like focus chemical), brown fat activation", link: "/cold-exposure" },
]

export default function ColdExposurePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [form, setForm] = useState({ duration: "", temp: "", feeling: "" })
  const [showTracker, setShowTracker] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cold-sessions")
    if (saved) setSessions(JSON.parse(saved))
  }, [])

  function addSession() {
    if (!form.duration) return
    const next = [{ date: new Date().toISOString().slice(0, 10), duration: Number(form.duration), temp: form.temp, feeling: form.feeling }, ...sessions]
    setSessions(next)
    localStorage.setItem("cold-sessions", JSON.stringify(next))
    setForm({ duration: "", temp: "", feeling: "" })
  }

  function removeSession(i: number) {
    const next = sessions.filter((_, j) => j !== i)
    setSessions(next)
    localStorage.setItem("cold-sessions", JSON.stringify(next))
  }

  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    const now = Date.now()
    const last30 = sessions.filter(s => new Date(s.date).getTime() >= now - 30 * 86400000)
    const last7 = sessions.filter(s => new Date(s.date).getTime() >= now - 7 * 86400000)
    const total = sessions.length
    const totalSec = sessions.reduce((s, x) => s + x.duration, 0)
    const avgSec = totalSec / total
    const longestSec = sessions.reduce((a, b) => b.duration > a.duration ? b : a).duration

    // Current streak of consecutive days
    const daySet = new Set(sessions.map(s => s.date))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10)
      if (daySet.has(d)) streak++
      else if (i > 0) break
    }

    // 14-day dot grid
    const last14: { date: string; count: number; totalSec: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10)
      const day = sessions.filter(s => s.date === d)
      last14.push({ date: d, count: day.length, totalSec: day.reduce((x, y) => x + y.duration, 0) })
    }

    return { total, totalSec, avgSec, longestSec, last30Count: last30.length, last7Count: last7.length, streak, last14 }
  }, [sessions])

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
            <Snowflake className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cold Exposure & Hormesis</h1>
        </div>
        <p className="text-sm text-muted-foreground">Controlled stress adaptation — how small doses of cold make your body and mind fundamentally stronger.</p>
      </div>

      {/* Why Card */}
      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong><Explain tip="Hormesis is when a small amount of stress actually makes you stronger — like how a vaccine uses a tiny bit of a virus to train your immune system">Hormesis</Explain> is biology's master principle:</strong> small, controlled stressors trigger adaptation cascades that make you more resilient. Cold exposure is one of the most accessible and well-researched hormetic tools — free, fast, and backed by decades of peer-reviewed science. The discomfort is the signal your body needs to upgrade.
          </p>
        </CardContent>
      </Card>

      {/* The Science */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> The Science</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="rounded bg-violet-50 border border-violet-200 p-2.5 text-[10px] text-muted-foreground space-y-1.5">
            <p><strong>Huberman Lab (Stanford):</strong> Dr. Andrew Huberman's protocols emphasize deliberate cold exposure at the end of the day for dopamine, or morning for alertness. Key finding: cold must be uncomfortably cold but safe — adaptation defeats the purpose if there is no stress signal.</p>
            <p><strong>Radboud University (2014):</strong> <Explain tip="Wim Hof is a Dutch athlete famous for extreme cold feats — he ran a half marathon barefoot in the Arctic">Wim Hof</Explain> method practitioners were injected with endotoxin. They showed voluntary control of their innate immune system — something previously thought impossible. 29% fewer sick days in trained group.</p>
            <p><strong>Susanna Soberg (Cell Reports Medicine):</strong> <Explain tip="Brown fat is a special type of fat that burns calories to generate heat, unlike regular white fat that stores energy">Brown fat</Explain> activation increases with regular cold exposure. Her research shows ending on cold (not rewarming artificially) maximizes brown fat recruitment. The shiver is the signal.</p>
            <p><strong>Molecular Psychiatry:</strong> Cold water immersion produces a 250% increase in <Explain tip="Dopamine is your brain's motivation and reward chemical — it makes you feel driven, focused, and good">dopamine</Explain> above <Explain tip="Your dopamine baseline is your normal resting level of dopamine — cold exposure raises it sustainably without the crash that comes from stimulants">baseline</Explain>, lasting 2-3 hours. Unlike caffeine (which peaks and crashes), cold-induced dopamine has a gradual, sustained release with no subsequent deficit.</p>
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ThermometerSnowflake className="h-4 w-4 text-cyan-500" /> Progressive Protocols</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {PROTOCOLS.map((p, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[8px]", p.color)}>{p.level}</Badge>
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{p.time}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.detail}</p>
                <p className="text-[10px] text-cyan-700 mt-1">Tip: {p.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2">
        {BENEFITS.map((b, i) => (
          <Card key={i} className="border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <b.icon className={cn("h-3.5 w-3.5 shrink-0", b.color)} />
                <p className="text-xs font-semibold">{b.title}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{b.desc}</p>
              <p className="text-[9px] text-muted-foreground/60 mt-1 italic">{b.source}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-red-700"><ShieldAlert className="h-4 w-4" /> Safety — Read Before Starting</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <p><strong className="text-red-700">Never alone:</strong> Always have someone nearby, especially for immersion. Drowning risk is real even in shallow water.</p>
            <p><strong className="text-red-700">Cardiac conditions:</strong> Cold triggers a vagal response and blood pressure spike. Consult a doctor if you have heart conditions, hypertension, or Raynaud's.</p>
            <p><strong className="text-red-700">Gradual progression:</strong> Start with 30-second cold shower finishes. Add 15 seconds per week. Never jump to ice baths without weeks of adaptation.</p>
            <p><strong className="text-red-700">Hypothermia signs:</strong> Uncontrollable shivering, confusion, slurred speech, loss of coordination. Exit immediately if these occur. Rewarm gradually.</p>
          </div>
        </CardContent>
      </Card>

      {/* Hormesis Framework */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> The Hormesis Framework</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-[10px] text-muted-foreground mb-2">Cold is one of many <Explain tip="Hormetic stressors are small controlled doses of stress that trigger your body to adapt and become stronger">hormetic stressors</Explain>. Stacking multiple types amplifies adaptation through overlapping pathways.</p>
          <div className="space-y-1.5">
            {HORMETIC_STRESSORS.map((h, i) => (
              <div key={i} className="flex items-center gap-2 rounded border p-2">
                <Zap className={cn("h-3 w-3 shrink-0", h.name === "Cold Exposure" ? "text-cyan-500" : "text-amber-500")} />
                <span className="text-xs font-semibold w-28 shrink-0">{h.name}</span>
                <span className="text-[10px] text-muted-foreground">{h.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fascia Connection */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Connection to Fascia</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Cold causes rapid <Explain tip="Fascia is the web of connective tissue that wraps every muscle, organ, and nerve in your body — like a full-body suit under your skin">fascial</Explain> contraction, squeezing interstitial fluid out of tissues. Upon rewarming, the rebound relaxation creates a pumping effect that improves fluid dynamics, nutrient delivery, and waste removal throughout the fascial network. This is why cold plunges reduce muscle soreness — the fascia gets flushed. Pair with <a href="/fascia" className="text-rose-600 hover:underline font-medium">fascial release work</a> for compounding benefits.
          </p>
        </CardContent>
      </Card>

      {/* Analytics — only when sessions exist */}
      {stats && (
        <Card className="border-cyan-200 bg-cyan-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-cyan-600" /> Your Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg border bg-white p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total sessions</p>
                <p className="text-sm font-bold tabular-nums">{stats.total}</p>
              </div>
              <div className="rounded-lg border bg-white p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Flame className="h-2.5 w-2.5" /> Streak</p>
                <p className="text-sm font-bold tabular-nums text-amber-600">{stats.streak}d</p>
              </div>
              <div className="rounded-lg border bg-white p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg duration</p>
                <p className="text-sm font-bold tabular-nums">{Math.round(stats.avgSec)}s</p>
              </div>
              <div className="rounded-lg border bg-white p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Longest</p>
                <p className="text-sm font-bold tabular-nums text-cyan-700">{stats.longestSec}s</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Last 14 days · {stats.last7Count}/7 this week</p>
              <div className="flex gap-0.5">
                {stats.last14.map((d, i) => {
                  const intensity = d.totalSec === 0 ? 0 : d.totalSec < 60 ? 1 : d.totalSec < 180 ? 2 : 3
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 aspect-square rounded",
                        intensity === 0 && "bg-slate-100",
                        intensity === 1 && "bg-cyan-200",
                        intensity === 2 && "bg-cyan-400",
                        intensity === 3 && "bg-cyan-600",
                      )}
                      title={`${d.date}: ${d.count} session${d.count === 1 ? "" : "s"}, ${d.totalSec}s`}
                    />
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => setShowTracker(!showTracker)} className="flex items-center gap-2 w-full text-left">
            <Timer className="h-4 w-4 text-cyan-500" />
            <CardTitle className="text-sm">Session Tracker</CardTitle>
            <Badge variant="outline" className="text-[8px] ml-auto">{sessions.length} logged</Badge>
          </button>
        </CardHeader>
        {showTracker && (
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Duration (sec)</label>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="border rounded px-2 py-1 text-xs w-20" placeholder="60" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Temp (°F)</label>
                <input type="text" value={form.temp} onChange={e => setForm({ ...form, temp: e.target.value })} className="border rounded px-2 py-1 text-xs w-20" placeholder="55" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">How you felt</label>
                <input type="text" value={form.feeling} onChange={e => setForm({ ...form, feeling: e.target.value })} className="border rounded px-2 py-1 text-xs w-32" placeholder="Energized" />
              </div>
              <button onClick={addSession} className="flex items-center gap-1 rounded bg-cyan-600 text-white px-2.5 py-1 text-xs hover:bg-cyan-700"><Plus className="h-3 w-3" /> Log</button>
            </div>
            {sessions.length > 0 && (
              <div className="space-y-1">
                {sessions.slice(0, 10).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded border p-2 text-[10px]">
                    <span className="text-muted-foreground w-20">{s.date}</span>
                    <Badge variant="outline" className="text-[8px]">{s.duration}s</Badge>
                    {s.temp && <span className="text-cyan-700">{s.temp}°F</span>}
                    <span className="text-muted-foreground flex-1">{s.feeling}</span>
                    <button onClick={() => removeSession(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <SourceList title="Sources & References" sources={[
        { id: 1, title: "Voluntary activation of the sympathetic nervous system and attenuation of the innate immune response in humans", authors: "Kox M, van Eijk LT, Zwaag J, et al.", journal: "Proc Natl Acad Sci USA", year: 2014, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/24799686/", notes: "Radboud University Wim Hof study. n=24. 29% fewer sick days in trained group." },
        { id: 2, title: "Human physiological responses to immersion into water of different temperatures", authors: "Šrámek P, Šimečková M, Janský L, et al.", journal: "European Journal of Applied Physiology", year: 2000, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/10751106/", notes: "Dopamine 250% increase at 14°C water immersion, lasting 2-3 hours." },
        { id: 3, title: "Habitual cold exposure and brown fat activation", authors: "Søberg S, Löfgren J, Philipsen FE, et al.", journal: "Cell Reports Medicine", year: 2021, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/34755128/", notes: "Susanna Søberg's research on cold-induced brown adipose tissue activation." },
        { id: 4, title: "The Effect of Cold Showering on Health and Work: A Randomized Controlled Trial", authors: "Buijze GA, Sierevelt IN, van der Heijden BC, et al.", journal: "PLoS ONE", year: 2016, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/27631616/", notes: "3,018 participants. 30-90sec cold shower = 29% reduction in sick days." },
        { id: 5, title: "Deliberate Cold Exposure Protocols — Huberman Lab Podcast", authors: "Huberman A", journal: "Huberman Lab", year: 2022, type: "article", url: "https://www.hubermanlab.com/episode/the-science-and-use-of-cold-exposure-for-health-and-performance", notes: "Comprehensive review of cold exposure science and protocols." },
        { id: 6, title: "Winter swimming improves general well-being", authors: "Huttunen P, Kokko L, Ylijukuri V", journal: "International Journal of Circumpolar Health", year: 2004, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/15736170/", notes: "Regular winter swimmers report improved mood, energy, and reduced stress." },
      ]} />

      {/* Navigation Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/hormone-health" className="text-sm text-violet-600 hover:underline">Hormone Health</a>
      </div>
    </div>
  )
}
