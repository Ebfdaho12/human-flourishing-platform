"use client"

import { useState } from "react"
import { Scale, Shield, ChevronDown, ChevronUp, Sun, Moon, Pause, Eye, Flame, Mountain, Skull, Heart, Telescope, Dumbbell, Link } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const FRAMEWORKS = [
  { name: "Dichotomy of Control", origin: "Epictetus", icon: Scale, color: "text-blue-600", badge: "border-blue-300 text-blue-700",
    idea: "Some things are in your power, some are not. Your opinions, desires, and responses are yours. Other people's actions, the weather, the economy — not yours.",
    application: "For any problem, draw two columns: 'In my control' and 'Not in my control.' Act only on the left column. Release the right." },
  { name: "Memento Mori", origin: "Marcus Aurelius", icon: Skull, color: "text-zinc-600", badge: "border-zinc-300 text-zinc-700",
    idea: "Remember you will die. Not morbid — clarifying. Death is the ultimate deadline that strips away everything trivial.",
    application: "Ask yourself: 'If I had one year left, would I still be doing this?' If no, change course. If yes, do it with full presence." },
  { name: "Amor Fati", origin: "Nietzsche via the Stoics", icon: Flame, color: "text-amber-600", badge: "border-amber-300 text-amber-700",
    idea: "Love your fate. Everything that happens — setbacks, failures, losses — is material for growth. Not just accept it. Love it.",
    application: "When something goes wrong, ask: 'What can this make me? How does this train me?' Reframe every obstacle as curriculum." },
  { name: "Premeditatio Malorum", origin: "Seneca", icon: Eye, color: "text-violet-600", badge: "border-violet-300 text-violet-700",
    idea: "Visualize the worst case in advance. Not to worry — to prepare. Fear of the unknown is always worse than the known.",
    application: "Before any high-stakes event, ask: 'What is the absolute worst that could happen?' Name it. Accept it. Now act freely." },
  { name: "The View from Above", origin: "Marcus Aurelius", icon: Telescope, color: "text-teal-600", badge: "border-teal-300 text-teal-700",
    idea: "Zoom out. Your problem → your neighborhood → your city → your country → Earth → the cosmos. Most of what consumes you is microscopic.",
    application: "When overwhelmed, mentally zoom out in stages. Feel the scale shift. Then return to your problem with proportion restored." },
  { name: "Voluntary Discomfort", origin: "Seneca & Epictetus", icon: Dumbbell, color: "text-rose-600", badge: "border-rose-300 text-rose-700",
    idea: "Deliberately choose hard things — cold showers, fasting, sleeping on the floor. Not punishment. Training. You remove fear of loss by practicing loss.",
    application: "Choose one discomfort per week. Cold shower Monday. Skip a meal Wednesday. Walk in the rain Friday. Build your tolerance floor." },
]

const QUOTES = [
  { author: "Marcus Aurelius", work: "Meditations", text: "You have power over your mind — not outside events. Realize this, and you will find strength.", interpretation: "Your mental framing determines your experience more than circumstances ever will." },
  { author: "Marcus Aurelius", work: "Meditations", text: "The impediment to action advances action. What stands in the way becomes the way.", interpretation: "Obstacles are not separate from the path — they ARE the path. Every block is a lesson in disguise." },
  { author: "Seneca", work: "Letters to Lucilius", text: "We suffer more often in imagination than in reality.", interpretation: "Most of your anxiety is about things that will never happen. The anticipation is worse than the event." },
  { author: "Seneca", work: "On the Shortness of Life", text: "It is not that we have a short time to live, but that we waste a great deal of it.", interpretation: "Life is long enough if you stop giving your hours to things that don't matter to you." },
  { author: "Epictetus", work: "Discourses", text: "It's not what happens to you, but how you react to it that matters.", interpretation: "The event is neutral. Your judgment of it creates your suffering or your growth." },
  { author: "Epictetus", work: "Enchiridion", text: "No man is free who is not master of himself.", interpretation: "Freedom isn't about external conditions — it's about internal sovereignty. Control your responses." },
]

const DAILY_PRACTICE = [
  { phase: "Morning", icon: Sun, color: "text-amber-500", label: "Premeditate", desc: "Before the day begins, consider what challenges may arise. Who might frustrate you? What could go wrong? Decide in advance how you will respond with virtue — patience, courage, justice, temperance." },
  { phase: "Throughout Day", icon: Pause, color: "text-blue-500", label: "Pause Before Reacting", desc: "Between stimulus and response, there is a space. The Stoic lives in that space. When provoked, don't react — respond. Ask: 'Is this in my control? Is this worth my tranquility?'" },
  { phase: "Evening", icon: Moon, color: "text-indigo-500", label: "Review & Reflect", desc: "Seneca's evening practice: review the day. Where did I lose composure? Where did I act well? What would I do differently? Not self-punishment — honest calibration." },
]

export default function StoicismPage() {
  const [expandedFramework, setExpandedFramework] = useState<number | null>(null)
  const [showQuotes, setShowQuotes] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-zinc-400">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Practical Stoicism</h1>
        </div>
        <p className="text-sm text-muted-foreground">Ancient operating system for modern life — not academic philosophy, but actionable mental frameworks you can use today.</p>
      </div>

      {/* Not academic philosophy */}
      <Card className="border-2 border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This is not a philosophy lecture.</strong> Stoicism is a <Explain tip="A practical system for making decisions, handling stress, and staying focused — like software that runs your thinking">mental operating system</Explain> built 2,300 years ago that is more relevant now than ever. No togas required. Marcus Aurelius ran the Roman Empire with these tools. You can run your life with them.
          </p>
        </CardContent>
      </Card>

      {/* Three Pillars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-slate-600" /> The Three Stoic Pillars</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { pillar: "Perception", color: "bg-blue-50 border-blue-200", text: "How you see things. You can't control events, but you control the lens. Train your perception to see clearly, without emotional distortion." },
            { pillar: "Action", color: "bg-emerald-50 border-emerald-200", text: "What you do about it. Right action guided by wisdom, justice, courage, and temperance. Not reaction — deliberate, principled response." },
            { pillar: "Will", color: "bg-amber-50 border-amber-200", text: "What you accept. The discipline to accept what you cannot change and focus your energy exclusively on what you can." },
          ].map((p) => (
            <div key={p.pillar} className={cn("rounded-lg border p-3", p.color)}>
              <p className="text-xs leading-relaxed"><strong>{p.pillar}:</strong> {p.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Frameworks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Six Frameworks for Daily Life</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FRAMEWORKS.map((f, i) => (
            <div key={f.name} className="rounded-lg border p-3">
              <button onClick={() => setExpandedFramework(expandedFramework === i ? null : i)} className="flex items-center justify-between w-full text-left gap-2">
                <div className="flex items-center gap-2">
                  <f.icon className={cn("h-4 w-4", f.color)} />
                  <span className="text-sm font-semibold">{f.name}</span>
                  <Badge variant="outline" className={cn("text-[8px]", f.badge)}>{f.origin}</Badge>
                </div>
                {expandedFramework === i ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
              </button>
              {expandedFramework === i && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.idea}</p>
                  <div className="rounded bg-emerald-50 border border-emerald-200 px-3 py-2">
                    <p className="text-xs text-emerald-800 leading-relaxed"><strong>Practical application:</strong> {f.application}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quotes */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => setShowQuotes(!showQuotes)} className="flex items-center justify-between w-full">
            <CardTitle className="text-base">Words from the Masters</CardTitle>
            {showQuotes ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {showQuotes && (
          <CardContent className="space-y-3">
            {QUOTES.map((q, i) => (
              <div key={i} className="rounded-lg border-l-4 border-slate-300 bg-slate-50/50 pl-3 pr-3 py-2">
                <p className="text-xs italic leading-relaxed">"{q.text}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">— {q.author}, <em>{q.work}</em></p>
                <p className="text-[10px] text-slate-600 mt-1"><strong>Modern read:</strong> {q.interpretation}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Daily Practice */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">The Daily Stoic Practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAILY_PRACTICE.map((d) => (
            <div key={d.phase} className="flex gap-3 items-start rounded-lg border p-3">
              <d.icon className={cn("h-5 w-5 mt-0.5", d.color)} />
              <div>
                <p className="text-sm font-semibold">{d.phase}: {d.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{d.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="border-2 border-zinc-200 bg-zinc-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4 text-zinc-600" /> Connections Across the Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Cold Exposure", desc: "Voluntary discomfort in practice", href: "/cold-exposure" },
              { label: "Breathwork", desc: "Perception control through breath", href: "/breathwork" },
              { label: "Weekly Reflection", desc: "The Stoic evening review, systematized", href: "/weekly-reflection" },
              { label: "Character Sheet", desc: "Virtue tracking as the Stoics intended", href: "/character-sheet" },
            ].map((c) => (
              <a key={c.label} href={c.href} className="rounded-lg border p-2 hover:bg-slate-50 transition-colors block">
                <p className="text-xs font-semibold">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/cold-exposure" className="text-sm text-cyan-600 hover:underline">Cold Exposure</a>
        <a href="/breathwork" className="text-sm text-teal-600 hover:underline">Breathwork</a>
        <a href="/scientific-literacy" className="text-sm text-emerald-600 hover:underline">Scientific Literacy</a>
        <a href="/weekly-reflection" className="text-sm text-violet-600 hover:underline">Weekly Reflection</a>
      </div>
    </div>
  )
}
