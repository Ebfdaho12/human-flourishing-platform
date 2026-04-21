"use client"

import { useState } from "react"
import { Moon, Brain, Sun, Thermometer, Eye, Clock, Apple, Bed, Pill, Dumbbell, AlertTriangle, Heart, Activity, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

function Collapsible({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
        <span className="text-sm font-semibold flex-1">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

function ProtocolList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <CheckCircle className={cn("h-3 w-3 shrink-0 mt-0.5", color)} />
          <p className="text-[10px] text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  )
}

export default function SleepOptimizationPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Sleep Optimization</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sleep is the foundation of every system in your body. Optimize it first — everything else improves downstream.
        </p>
      </div>

      {/* Why it matters */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-indigo-900 mb-2">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Matthew Walker's research at UC Berkeley demonstrates that <strong>every major disease killing people in developed nations has a causal link to insufficient sleep</strong> — Alzheimer's, cancer, cardiovascular disease, obesity, diabetes, depression. Cognitive performance drops <strong>~40% after just one night of 6 hours of sleep</strong>. Reaction time, emotional regulation, memory consolidation, immune function, and hormone balance all degrade measurably. Sleep is not rest — it is active recovery, repair, and reorganization. There is no biological system that does not benefit from adequate sleep, and none that is not damaged by its absence.
          </p>
        </CardContent>
      </Card>

      {/* Sleep Architecture */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Sleep Architecture</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sleep is not one uniform state — it cycles through distinct stages in <Explain tip="Each sleep cycle lasts roughly 90 minutes. You go through 4-6 cycles per night. Earlier cycles are rich in deep sleep; later cycles have more REM. This is why both early and late sleep hours matter.">~90-minute cycles</Explain>, each serving different functions. Cutting sleep short doesn't just reduce quantity — it eliminates specific stages.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { stage: "N1 (Light Sleep)", pct: "~5%", desc: "Transition stage. Easy to wake from. Muscle twitches (hypnic jerks) are normal here." },
              { stage: "N2 (Core Sleep)", pct: "~45%", desc: "Sleep spindles and K-complexes consolidate motor skills and procedural memory. The bulk of your sleep." },
              { stage: "N3 (Deep / Slow-Wave)", pct: "~25%", desc: "Growth hormone release, immune repair, cellular restoration, memory consolidation. Dominates early-night cycles. Hardest to wake from." },
              { stage: "REM (Dream Sleep)", pct: "~25%", desc: "Emotional processing, creativity, memory integration. Dominates late-night cycles. Muscle paralysis prevents acting out dreams." },
            ].map((s, i) => (
              <div key={i} className="rounded-lg bg-indigo-50 border border-indigo-200 p-2.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-indigo-800">{s.stage}</p>
                  <Badge className="bg-indigo-500 text-[9px] py-0">{s.pct}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Key insight:</strong> Deep sleep concentrates in the first half of the night; REM concentrates in the second half. Going to bed late robs you of deep sleep. Waking early robs you of REM. Both are irreplaceable.
          </p>
        </CardContent>
      </Card>

      {/* Circadian Rhythm */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Circadian Rhythm & Light</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your <Explain tip="A 24-hour internal clock (actually ~24.2 hours) driven by the suprachiasmatic nucleus in the hypothalamus. It governs sleep-wake timing, hormone release, body temperature, and metabolism. Light is the primary signal that keeps it synchronized.">circadian rhythm</Explain> is the master clock governing when you feel alert and when you feel sleepy. Light is its primary input signal.
          </p>
          <div className="space-y-2">
            {[
              { time: "Morning (within 1hr of waking)", action: "Get 10-30 min of sunlight exposure. Triggers cortisol pulse that sets your wake clock and starts the ~16hr countdown to melatonin release. Overcast days still work — outdoor light is 10-50x brighter than indoor.", color: "text-amber-500" },
              { time: "Midday", action: "Cortisol naturally peaks, body temperature rises. Alertness is highest. This is your biological performance window.", color: "text-orange-500" },
              { time: "Evening (2hrs before bed)", action: "Melatonin begins rising in dim light. Blue and green wavelengths suppress melatonin production by up to 50%. Dim your environment, use warm/red lighting, wear blue-light-blocking glasses if needed.", color: "text-rose-500" },
              { time: "Night", action: "Core body temperature drops ~1-2°F. Melatonin peaks. Any bright light exposure (bathroom, phone) can reset the clock and delay sleep onset by 30-60 minutes.", color: "text-indigo-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 text-[9px] mt-0.5 border-indigo-300 text-indigo-700 min-w-[140px] justify-center">{item.time}</Badge>
                <p className="text-[10px] text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Optimization Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Collapsible title="Temperature" icon={Thermometer} iconColor="text-blue-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Core body temperature must drop 1-2°F for sleep onset. Manipulating this is one of the most powerful sleep tools.</p>
            <ProtocolList color="text-blue-400" items={[
              "Keep bedroom at 65-68°F (18-20°C) — cooler is almost always better for sleep",
              "Hot bath or shower 90 minutes before bed — warms skin, vasodilates, then core temp drops rapidly as you cool",
              "Warm feet, cool core — wear socks if extremities are cold, but keep the room cool",
              "Cooling mattress pads (e.g., Eight Sleep) can drop skin temperature and measurably increase deep sleep %",
              "Avoid heavy blankets that trap heat — or use a fan to keep air moving over exposed skin",
            ]} />
          </Collapsible>

          <Collapsible title="Light Exposure" icon={Sun} iconColor="text-amber-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Light is the single strongest input to your circadian clock. Get it right and sleep becomes dramatically easier.</p>
            <ProtocolList color="text-amber-400" items={[
              "Morning sunlight within 1 hour of waking: 10 min on clear days, 20-30 min on overcast — sets your entire circadian clock",
              "Blue-light-blocking glasses 2 hours before bed — blocks the wavelengths (460-480nm) that suppress melatonin",
              "Switch to red/amber lighting in the evening — red wavelengths have minimal impact on melatonin",
              "If you must use screens, enable night mode AND reduce brightness to minimum usable level",
              "Complete darkness for sleep — blackout curtains, cover LED indicators, no hallway light under the door",
            ]} />
          </Collapsible>

          <Collapsible title="Timing & Consistency" icon={Clock} iconColor="text-violet-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Consistent wake time is the single most impactful behavioral change. It anchors your entire circadian system.</p>
            <ProtocolList color="text-violet-400" items={[
              "Same wake time every day (including weekends) — this is more important than bedtime. Vary by no more than 30 minutes.",
              "Understand sleep pressure: adenosine builds during waking hours and creates sleepiness. Caffeine blocks adenosine receptors but doesn't eliminate the debt.",
              "Caffeine half-life is ~6 hours. A coffee at 2 PM means half the caffeine is still active at 8 PM. Cut off by noon for most people.",
              "Avoid naps after 3 PM — they reduce sleep pressure and delay nighttime sleep onset",
              "If you can't sleep within 20 minutes, get up and do something boring in dim light. Return when sleepy. Don't train your brain that bed = frustration.",
            ]} />
          </Collapsible>

          <Collapsible title="Nutrition" icon={Apple} iconColor="text-green-500">
            <p className="text-xs text-muted-foreground leading-relaxed">What and when you eat directly affects sleep onset, depth, and architecture.</p>
            <ProtocolList color="text-green-400" items={[
              "Magnesium glycinate (300-400mg before bed) — calms the nervous system and supports deep sleep. One of the best-supported sleep supplements.",
              "No large meals 2-3 hours before bed — digestion raises core temperature and can cause reflux in supine position",
              "Alcohol destroys REM sleep — even 1-2 drinks fragments sleep architecture. You may fall asleep faster but the quality is dramatically worse.",
              "Tart cherry juice contains natural melatonin precursors — 1 oz concentrate shown to increase sleep time by ~84 minutes in research",
              "High-glycemic carbs 4 hours before bed can increase tryptophan availability, but avoid simple sugars close to bed",
            ]} />
          </Collapsible>

          <Collapsible title="Environment" icon={Bed} iconColor="text-slate-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Your sleep environment should signal one thing to your brain: this is where sleep happens.</p>
            <ProtocolList color="text-slate-400" items={[
              "Dark: blackout curtains or a quality sleep mask. Even dim light through closed eyelids reduces melatonin.",
              "Cool: 65-68°F. Your thermostat is a sleep tool.",
              "Quiet: earplugs, white noise machine, or both. Intermittent noise (traffic, snoring) is worse than constant background.",
              "No screens in bed — reserve the bed exclusively for sleep. Your brain learns associations quickly.",
              "Dedicated sleep surface — a quality mattress and pillow matter. Replace pillows every 1-2 years, mattress every 7-10.",
            ]} />
          </Collapsible>

          <Collapsible title="Supplements" icon={Pill} iconColor="text-emerald-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Evidence-based supplements that support sleep without dependency. Always start with behavioral changes first.</p>
            <ProtocolList color="text-emerald-400" items={[
              "Magnesium glycinate (300-400mg) — best-supported, calms nervous system, most people are deficient",
              "Glycine (3g before bed) — lowers core body temperature, improves subjective sleep quality in multiple studies",
              "Tart cherry extract — natural melatonin and anti-inflammatory compounds",
              "Apigenin (50mg, from chamomile) — mild sedative, reduces anxiety. Andrew Huberman's stack includes this.",
              "L-theanine (100-200mg) — promotes alpha brain waves, reduces racing thoughts without sedation",
              "Note on melatonin: effective short-term for jet lag or shift work, but long-term exogenous use can downregulate natural production. Not recommended as a nightly supplement.",
            ]} />
          </Collapsible>

          <Collapsible title="Exercise" icon={Dumbbell} iconColor="text-orange-500">
            <p className="text-xs text-muted-foreground leading-relaxed">Exercise is one of the most effective sleep interventions — but timing matters.</p>
            <ProtocolList color="text-orange-400" items={[
              "Morning or afternoon exercise improves deep sleep duration and reduces sleep onset latency",
              "Intense exercise within 2-3 hours of bed can delay sleep onset — raises core temp and cortisol",
              "Moderate exercise (walking, yoga) in the evening is generally fine and may help wind down",
              "Consistent exercisers show 65% improvement in daytime alertness and reduced daytime sleepiness",
              "Even 30 minutes of moderate activity improves sleep quality on that same night",
            ]} />
          </Collapsible>
        </CardContent>
      </Card>

      {/* What Kills Sleep */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Kills Sleep</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { factor: "Alcohol", detail: "Sedation is not sleep. Alcohol fragments sleep architecture, blocks REM by 20-50%, causes middle-of-night waking as the liver metabolizes it, and suppresses growth hormone." },
            { factor: "Caffeine after noon", detail: "Half-life of ~6 hours means a 2 PM coffee leaves 25% of the caffeine active at 2 AM. Blocks adenosine receptors, reducing both sleep pressure and deep sleep percentage." },
            { factor: "Blue light at night", detail: "Screens emit 460-480nm light that directly suppresses melatonin production via melanopsin receptors in the retina. Even 8 lux of blue light delays melatonin onset." },
            { factor: "Inconsistent schedule", detail: "Social jet lag — varying sleep/wake times by 2+ hours on weekends — disrupts circadian rhythm as severely as crossing time zones." },
            { factor: "Stress & cortisol", detail: "Elevated evening cortisol prevents the natural drop needed for sleep onset. Chronic stress keeps the HPA axis activated, fragmenting sleep architecture." },
            { factor: "Hot bedroom", detail: "Core temperature must drop for sleep initiation. A room above 70°F fights this process, reducing deep sleep and increasing nighttime awakenings." },
            { factor: "Large late meals", detail: "Digestion raises metabolic rate and core temperature. Lying down with a full stomach increases reflux risk. The GI system should be winding down, not working." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-red-50/50 border border-red-200 p-2.5">
              <p className="text-xs font-semibold text-red-800">{item.factor}</p>
              <p className="text-[10px] text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connection to Mood */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Sleep & Mood Connection
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In user data on this platform, <strong>sleep-mood correlation is consistently the strongest signal</strong> — stronger than exercise, nutrition, or social connection. One night of poor sleep increases amygdala reactivity by 60% (Walker et al.), meaning you are physiologically more anxious, irritable, and emotionally volatile. REM sleep specifically processes emotional memories — without it, negative experiences are not properly integrated, and they accumulate. If you track your mood on the <a href="/correlations" className="text-violet-600 hover:underline font-medium">correlations page</a>, sleep will likely emerge as the single most predictive variable.
          </p>
        </CardContent>
      </Card>

      {/* Connection to Fascia */}
      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Sleep & Fascia
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gil Hedley's cadaver research revealed that <strong>fascial adhesions ("fuzz") form overnight</strong> during the hours of immobility while you sleep. This is the stiffness you feel every morning — it is real, physical collagen cross-links forming between fascial layers. This is why <strong>morning movement is non-negotiable</strong>: even 5 minutes of whole-body stretching dissolves the overnight fuzz before it becomes permanent. Chronic immobility (sleeping in the same curled position, never stretching upon waking) allows these adhesions to compound, contributing to chronic stiffness and pain. See the <a href="/fascia" className="text-rose-600 hover:underline font-medium">fascia page</a> for protocols.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/correlations" className="text-sm text-violet-600 hover:underline">Correlations</a>
      </div>
    </div>
  )
}
