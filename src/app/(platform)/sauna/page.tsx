"use client"

import { Flame, Brain, Heart, ShieldAlert, Zap, Timer, Activity, Thermometer, Droplets, Link } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"

const PROTOCOLS = [
  { level: "Traditional Finnish", color: "border-red-300 text-red-700", temp: "175-195\u00b0F (80-90\u00b0C)", duration: "15-20 min", detail: "Dry sauna with periodic water on rocks for steam bursts. 2-3 rounds with cold shower or outdoor cool-down between rounds.", tip: "Sit on the upper bench for maximum heat. Breathe through your nose to protect airways." },
  { level: "Infrared Sauna", color: "border-amber-300 text-amber-700", temp: "130-150\u00b0F (55-65\u00b0C)", duration: "30-45 min", detail: "Lower air temperature but deep-penetrating infrared waves heat tissue directly. Gentler entry point, still activates heat shock proteins at longer durations.", tip: "Infrared is easier to tolerate but requires longer sessions to match traditional sauna's HSP activation." },
  { level: "Contrast Therapy", color: "border-violet-300 text-violet-700", temp: "Sauna + Cold Plunge", duration: "3-4 rounds", detail: "Alternate 15 min sauna with 1-3 min cold plunge. The vascular cycling (dilation then constriction) maximizes circulatory benefits and brown fat recruitment.", tip: "Always end on cold to maximize brown fat activation. The Scandinavian tradition for centuries." },
]

const BENEFITS = [
  { icon: Heart, title: "63% Reduced Cardiac Death", desc: "Laukkanen Finnish study: 4-7 sauna sessions/week produced a hazard ratio of 0.37 for sudden cardiac death compared to 1x/week over 20 years.", source: "JAMA Internal Medicine, 2015", color: "text-rose-600" },
  { icon: Brain, title: "Heat Shock Proteins", desc: "HSP70 and HSP90 activate at 15-20 min above 170\u00b0F. They repair misfolded proteins, prevent aggregation, and enhance cellular stress tolerance across all tissues.", source: "Journal of Applied Physiology", color: "text-violet-600" },
  { icon: Zap, title: "Growth Hormone Surge", desc: "Single sauna session increases growth hormone 2-5x. Repeated sessions (e.g., two 20-min sessions daily) can produce up to 16x increase.", source: "Leppaeluoto et al., Journal of Clinical Endocrinology", color: "text-amber-600" },
  { icon: Brain, title: "BDNF & Neuroprotection", desc: "Heat exposure increases brain-derived neurotrophic factor through the same pathways as exercise \u2014 promoting neuroplasticity, memory, and mood regulation.", source: "Neuroscience Letters", color: "text-blue-600" },
  { icon: Activity, title: "Cardiovascular Mimicry", desc: "Sauna raises heart rate to 100-150 bpm and dilates blood vessels. Hemodynamic effects mirror moderate cardio exercise, improving vascular compliance over time.", source: "European Journal of Preventive Cardiology", color: "text-emerald-600" },
  { icon: Droplets, title: "Reduced Inflammation", desc: "Regular sauna use lowers C-reactive protein, IL-6, and other inflammatory markers. The 2018 follow-up confirmed dose-response across both genders.", source: "European Journal of Epidemiology, 2018", color: "text-cyan-600" },
]

const TIMELINE = [
  { time: "0-5 min", event: "Core temperature begins rising. Skin vasodilation. Heart rate increases. Sweat glands activate." },
  { time: "5-10 min", event: "Plasma volume shifts. Cardiovascular demand increases. Early norepinephrine release." },
  { time: "10-15 min", event: "Heat shock protein production initiates. Growth hormone release begins. Deep tissue warming." },
  { time: "15-20 min", event: "HSP70/HSP90 fully activated. Peak growth hormone release. BDNF elevation. Maximum cardiovascular benefit zone." },
  { time: "20+ min", event: "Diminishing returns for most people. Risk of overheating increases. Exit and cool down." },
]

export default function SaunaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Sauna & Heat Exposure</h1>
        </div>
        <p className="text-sm text-muted-foreground">The other half of hormesis \u2014 deliberate heat stress that builds cardiovascular resilience, triggers cellular repair, and extends healthspan.</p>
      </div>

      {/* Why Card */}
      <Card className="border-2 border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong><Explain tip="Hormesis is when a small amount of stress actually makes you stronger \u2014 like how a vaccine uses a tiny bit of a virus to train your immune system">Heat is hormesis in its oldest form.</Explain></strong> Finnish sauna culture has practiced deliberate heat exposure for thousands of years. Modern research now validates what they instinctively knew: regular sauna use dramatically reduces all-cause mortality, cardiovascular disease, and neurodegenerative risk. Where <a href="/cold-exposure" className="text-cyan-600 hover:underline font-medium">cold exposure</a> activates cold shock proteins and dopamine, heat activates heat shock proteins and growth hormone \u2014 complementary pathways that together build extraordinary resilience.
          </p>
        </CardContent>
      </Card>

      {/* Landmark Research */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> Landmark Research</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="rounded bg-violet-50 border border-violet-200 p-2.5 text-[10px] text-muted-foreground space-y-1.5">
            <p><strong>Laukkanen Finnish Study (2015):</strong> Tracked 2,315 middle-aged men over 20 years. Men who used sauna 4-7 times per week had a 63% lower risk of sudden cardiac death (HR 0.37), 50% lower risk of cardiovascular mortality, and 40% lower all-cause mortality compared to 1x/week users. One of the most powerful longevity interventions ever measured.</p>
            <p><strong>2018 Follow-Up (European Journal of Epidemiology):</strong> Expanded to include both genders and confirmed a clear <Explain tip="Dose-response means the more you do it (within safe limits), the greater the benefit \u2014 4x/week is better than 2x, which is better than 1x">dose-response relationship</Explain> \u2014 more frequent sauna use correlated with greater risk reduction in cardiovascular events, stroke, and hypertension across populations.</p>
            <p><strong>Dr. Rhonda Patrick (FoundMyFitness):</strong> Synthesized heat exposure research showing sauna activates the same longevity pathways as caloric restriction \u2014 including <Explain tip="FOXO3 is a gene linked to extreme longevity. It activates cellular repair, antioxidant defense, and stress resistance">FOXO3 gene activation</Explain>, improved insulin sensitivity, and enhanced DNA repair mechanisms. Her work highlights sauna as one of the most accessible lifespan interventions.</p>
            <p><strong>Heat Shock Proteins:</strong> <Explain tip="Heat shock proteins are molecular chaperones \u2014 they help other proteins fold correctly and repair those that have been damaged by stress">HSP70 and HSP90</Explain> activate after 15-20 min above 170\u00b0F. These proteins repair misfolded proteins (implicated in Alzheimer\u2019s, Parkinson\u2019s), prevent protein aggregation, and enhance the cell\u2019s ability to handle future stress of any kind.</p>
          </div>
        </CardContent>
      </Card>

      {/* What Happens in the Sauna */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4 text-orange-500" /> What Happens Minute by Minute</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1.5">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-2 rounded border p-2">
                <Badge variant="outline" className="text-[8px] border-orange-300 text-orange-700 shrink-0 mt-0.5">{t.time}</Badge>
                <span className="text-[10px] text-muted-foreground">{t.event}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Thermometer className="h-4 w-4 text-red-500" /> Protocols</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {PROTOCOLS.map((p, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[8px]", p.color)}>{p.level}</Badge>
                  <span className="text-xs font-semibold">{p.temp}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{p.duration}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.detail}</p>
                <p className="text-[10px] text-orange-700 mt-1">Tip: {p.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid */}
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
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-red-700"><ShieldAlert className="h-4 w-4" /> Safety \u2014 Non-Negotiable Rules</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <p><strong className="text-red-700">Hydration:</strong> Drink 16-32 oz water before entering. You lose 1-2 pints of sweat per session. Electrolytes recommended for sessions over 20 min.</p>
            <p><strong className="text-red-700">No alcohol:</strong> Alcohol + sauna dramatically increases risk of arrhythmia, hypotension, and sudden death. The Finnish study deaths were almost all alcohol-related.</p>
            <p><strong className="text-red-700">Cardiac conditions:</strong> Sauna raises heart rate to 100-150 bpm. Consult a physician if you have heart disease, uncontrolled hypertension, or recent cardiac events.</p>
            <p><strong className="text-red-700">Pregnancy:</strong> Elevated core temperature is teratogenic in the first trimester. Pregnant women should avoid sauna or limit to under 150\u00b0F for 10 min max with physician approval.</p>
          </div>
        </CardContent>
      </Card>

      {/* Fascia Connection */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-rose-900 mb-1 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Connection to Fascia & Cold Exposure</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Heat increases <Explain tip="Fascia is the web of connective tissue that wraps every muscle, organ, and nerve in your body \u2014 like a full-body suit under your skin">fascial</Explain> pliability by warming the ground substance (the gel-like matrix between collagen fibers). This is why stretching and mobility work are most effective when tissues are warm. Pair sauna with <a href="/fascia" className="text-rose-600 hover:underline font-medium">fascial release</a> for maximum tissue remodeling. When combined with <a href="/cold-exposure" className="text-cyan-600 hover:underline font-medium">cold exposure</a> in contrast therapy, the vascular cycling (dilation then constriction) creates a powerful pump that flushes metabolic waste and delivers nutrients deep into connective tissue.
          </p>
        </CardContent>
      </Card>

      {/* Sources */}
      <SourceList sources={[
        { id: 1, title: "Association between sauna bathing and fatal cardiovascular and all-cause mortality events", authors: "Laukkanen T, Khan H, Zaccardi F, Laukkanen JA", journal: "JAMA Internal Medicine", year: 2015, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/25705824/", notes: "2,315 men, 20.7yr follow-up. 4-7x/week = 63% reduced sudden cardiac death (HR 0.37)." },
        { id: 2, title: "Sauna bathing is associated with reduced cardiovascular mortality in men and women", authors: "Laukkanen T, Kunutsor S, Kauhanen J, Laukkanen JA", journal: "BMC Medicine", year: 2018, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/30486813/", notes: "Expanded to both genders. Dose-response relationship confirmed." },
        { id: 3, title: "Heat acclimation increases heat shock protein 72 in humans", authors: "Kuennen M, Gillum T, Dokladny K, et al.", journal: "Journal of Applied Physiology", year: 2011, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/21474695/", notes: "HSP70/90 activation with repeated heat exposure." },
        { id: 4, title: "Endocrine effects of repeated sauna bathing", authors: "Leppäluoto J, Huttunen P, Hirvonen J, et al.", journal: "Acta Physiologica Scandinavica", year: 1986, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/3788567/", notes: "Growth hormone increases 2-5x single session, up to 16x with repeated sessions." },
        { id: 5, title: "Found My Fitness — Sauna Benefits Deep Dive", authors: "Patrick R", journal: "Found My Fitness", year: 2023, type: "article", url: "https://www.foundmyfitness.com/topics/sauna", notes: "Comprehensive review of sauna research and longevity connections." },
      ]} />

      {/* Navigation Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/cold-exposure" className="text-sm text-cyan-600 hover:underline">Cold Exposure</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/hormone-health" className="text-sm text-violet-600 hover:underline">Hormone Health</a>
      </div>
    </div>
  )
}
