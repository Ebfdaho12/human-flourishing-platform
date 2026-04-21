"use client"

import { useState } from "react"
import { Shield, Heart, Zap, Brain, Clock, Sun, ChevronDown, ChevronUp, AlertTriangle, Activity, Wind, Snowflake, Moon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

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

  const toggle = (key: string) => setExpanded(expanded === key ? null : key)

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
          This is not therapy. This is a toolkit of research-backed techniques you can use RIGHT NOW.
        </p>
      </div>

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
