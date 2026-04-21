"use client"

import { useState } from "react"
import { Pill, ChevronDown, AlertTriangle, Star, Beaker, ShieldAlert, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

type Grade = "A" | "B" | "C" | "D"
interface Supp { name: string; grade: Grade; dose: string; timing: string; what: string; warn: string }

const GRADE_COLORS: Record<Grade, string> = {
  A: "bg-emerald-100 text-emerald-700", B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700", D: "bg-red-100 text-red-700",
}

const TIER1: Supp[] = [
  { name: "Vitamin D3", grade: "A", dose: "3,000-5,000 IU/day", timing: "Morning, with fat",
    what: "Hormone, not vitamin. 70%+ of people are deficient. Immune function, bone health, mood, testosterone. Test your levels (aim 50-70 ng/mL).",
    warn: "Take with K2 to direct calcium properly. Too much without testing can cause toxicity." },
  { name: "Magnesium", grade: "A", dose: "300-400mg glycinate or threonate", timing: "Evening / before bed",
    what: "Most people are deficient. Sleep quality, muscle recovery, mood, testosterone, 300+ enzymatic reactions. Glycinate for sleep/calm, threonate for cognition.",
    warn: "Oxide form is poorly absorbed (cheap multivitamins use it). High doses cause GI distress. Start low." },
  { name: "Omega-3 (EPA/DHA)", grade: "A", dose: "2-3g combined EPA+DHA", timing: "With meals",
    what: "Anti-inflammatory powerhouse. Brain structure, heart health, joint recovery, mood. Most people get way too much omega-6 and not enough omega-3.",
    warn: "Quality matters enormously. Third-party tested (IFOS). Fish burps = poor quality. Blood thinning at high doses." },
  { name: "Creatine Monohydrate", grade: "A", dose: "5g/day", timing: "Any time, daily",
    what: "Most studied supplement in history. Muscle performance, brain energy, cognitive function. Works for everyone. No loading phase needed.",
    warn: "Monohydrate only. Other forms are marketing. Stay hydrated. Safe long-term per decades of research." },
  { name: "Vitamin K2 (MK-7)", grade: "B", dose: "100-200mcg", timing: "With D3 and fat",
    what: "Directs calcium to bones and teeth, not arteries. Essential partner for D3. Most people have no idea they need this.",
    warn: "If on blood thinners (warfarin), consult doctor. MK-7 form lasts longer than MK-4." },
  { name: "Zinc", grade: "A", dose: "15-30mg", timing: "With food",
    what: "Immune function, testosterone production, wound healing, taste/smell. Depleted by sweat, stress, alcohol.",
    warn: "Do NOT exceed 40mg/day. Competes with copper — long-term high zinc needs copper balance. Nausea on empty stomach." },
  { name: "Ashwagandha (KSM-66)", grade: "B", dose: "600mg/day", timing: "Morning or evening",
    what: "Adaptogen. RCTs show cortisol reduction ~27%, testosterone increase ~19% in stressed men. Anxiety reduction, sleep quality, recovery.",
    warn: "Cycle 8 weeks on, 2-4 weeks off. Nightshade family — avoid if sensitivity. May increase thyroid hormones." },
]

const TIER2: Supp[] = [
  { name: "Collagen Peptides", grade: "B", dose: "10-15g/day + vitamin C", timing: "30-60 min before exercise or morning",
    what: "Skin elasticity, joint health, gut lining, fascia repair. Major glycine source. Hydrolyzed for absorption.", warn: "Take with vitamin C (cofactor for synthesis). Results take 8-12 weeks." },
  { name: "NAC", grade: "B", dose: "600-1,800mg", timing: "Away from food",
    what: "Glutathione precursor — your body's master antioxidant. Liver protection, lung health, mental health support, OCD/addiction research.", warn: "May interact with some medications. Can cause GI upset. Start at 600mg." },
  { name: "Berberine", grade: "B", dose: "500mg 2-3x/day", timing: "With meals",
    what: "Blood sugar management, lipid improvement. Called 'nature's metformin.' AMPK activator.", warn: "GI side effects common at first. Do NOT combine with metformin without medical supervision. Can lower blood sugar too much." },
  { name: "Boron", grade: "C", dose: "3-10mg", timing: "With food",
    what: "Trace mineral. Bone health, may lower SHBG (increasing free testosterone), brain function.", warn: "Upper limit ~20mg. Most diets are low in boron. Cheap and underrated." },
  { name: "L-Theanine", grade: "B", dose: "200mg", timing: "As needed / with caffeine",
    what: "Calm, focused attention without sedation. Pairs perfectly with caffeine — removes jitters, keeps focus. Alpha brain waves.", warn: "No tolerance buildup. Very safe. Can cause mild drowsiness in some." },
  { name: "Glycine", grade: "B", dose: "3g before bed", timing: "30 min before sleep",
    what: "Sleep quality (lowers core body temperature), collagen synthesis, neurotransmitter. One of the cheapest useful supplements.", warn: "Very safe. Sweet taste. Can mix in water." },
  { name: "Tongkat Ali", grade: "C", dose: "200-400mg standardized", timing: "Morning",
    what: "Testosterone support in stressed/aging men. Cortisol reduction. Libido. Some solid RCTs.", warn: "Cycle 4-8 weeks on/off. Quality varies. Look for standardized Eurycomanone content." },
]

const TIER3: Supp[] = [
  { name: "Apigenin", grade: "C", dose: "50mg", timing: "Before bed",
    what: "Mild sleep aid, may lower estrogen (aromatase inhibition). Found in chamomile. Calming.", warn: "Limited human data. May interact with hormone-sensitive conditions." },
  { name: "Lion's Mane", grade: "C", dose: "500-1,000mg", timing: "Morning",
    what: "NGF and BDNF stimulation. Cognitive function, nerve repair. Nootropic mushroom.", warn: "Limited human RCTs. Fruiting body extract preferred. Some report reduced libido." },
  { name: "Turkesterone", grade: "D", dose: "500mg", timing: "With food",
    what: "Ecdysteroid. Marketed for muscle growth. Social media hype.", warn: "Evidence is thin. Most studies are in vitro or animal. Expensive for unproven benefit." },
  { name: "Shilajit", grade: "C", dose: "250-500mg purified", timing: "Morning",
    what: "Fulvic acid complex. Traditional Ayurvedic. Some testosterone and energy studies.", warn: "Quality varies wildly. Must be purified (heavy metals). Buy from reputable sources only." },
  { name: "Tart Cherry Extract", grade: "C", dose: "500mg or 8oz juice", timing: "Evening",
    what: "Natural melatonin + anthocyanins. Sleep quality, exercise recovery, anti-inflammatory.", warn: "Juice form has sugar. Extract preferred. Moderate evidence." },
]

function SuppRow({ s }: { s: Supp }) {
  const [open, setOpen] = useState(false)
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left">
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
        <Badge className={cn("text-[10px] font-bold shrink-0", GRADE_COLORS[s.grade])}>{s.grade}</Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{s.name}</p>
          {!open && <p className="text-xs text-muted-foreground truncate">{s.dose} &middot; {s.timing}</p>}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 text-xs">
          <p className="text-muted-foreground leading-relaxed">{s.what}</p>
          <p><span className="font-semibold">Dose:</span> {s.dose} &middot; <span className="font-semibold">Timing:</span> {s.timing}</p>
          <p className="text-amber-700 flex items-start gap-1"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{s.warn}</p>
        </div>
      )}
    </button>
  )
}

function TierSection({ title, icon, color, supps }: { title: string; icon: React.ReactNode; color: string; supps: Supp[] }) {
  const [open, setOpen] = useState(true)
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full">
        <CardHeader className="pb-0 flex flex-row items-center gap-2">
          {icon}
          <CardTitle className="text-sm flex-1 text-left">{title}</CardTitle>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </CardHeader>
      </button>
      {open && <CardContent className="p-2 pt-2 divide-y">{supps.map(s => <SuppRow key={s.name} s={s} />)}</CardContent>}
    </Card>
  )
}

export default function SupplementsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Supplements: Evidence-Based Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">Not selling anything. Rating by evidence quality so you can make informed decisions.</p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Philosophy:</strong> Food first. Supplements fill gaps. Most are unnecessary. A few are game-changers.
            The supplement industry is 90% marketing and 10% science. This guide focuses on the 10% — what actually has
            evidence behind it, at what dose, and what to watch out for.
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 bg-emerald-50/10">
        <CardContent className="p-4">
          <p className="text-xs font-semibold mb-1.5 flex items-center gap-1"><Explain tip="Grade reflects quality and quantity of human RCTs, not popularity.">Evidence Grades</Explain></p>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <Badge className={GRADE_COLORS.A}>A — Strong RCT evidence</Badge>
            <Badge className={GRADE_COLORS.B}>B — Good evidence, some gaps</Badge>
            <Badge className={GRADE_COLORS.C}>C — Emerging / limited</Badge>
            <Badge className={GRADE_COLORS.D}>D — Mostly hype</Badge>
          </div>
        </CardContent>
      </Card>

      <TierSection title="Tier 1 — Strong Evidence (Grade A-B)" color="emerald"
        icon={<Star className="h-4 w-4 text-emerald-600" />} supps={TIER1} />
      <TierSection title="Tier 2 — Moderate Evidence (Grade B-C)" color="blue"
        icon={<Beaker className="h-4 w-4 text-blue-600" />} supps={TIER2} />
      <TierSection title="Tier 3 — Emerging / Limited (Grade C-D)" color="amber"
        icon={<ShieldAlert className="h-4 w-4 text-amber-600" />} supps={TIER3} />

      {/* What to avoid */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" /> What to Avoid / Waste of Money
        </CardTitle></CardHeader>
        <CardContent className="p-4 pt-0 space-y-1 text-xs text-muted-foreground">
          <p><strong>Most multivitamins</strong> — wrong forms, wrong doses, fairy-dusted with 30 things at 5% effective dose.</p>
          <p><strong>Testosterone boosters with proprietary blends</strong> — if they hide the doses, they are hiding the truth.</p>
          <p><strong>Fat burners</strong> — caffeine + fillers with a 1000% markup. Just drink coffee.</p>
          <p><strong>BCAAs</strong> — if you eat enough protein (0.7g/lb+), BCAAs are redundant. Whey already has them.</p>
          <p><strong>Most greens powders</strong> — eat vegetables. No powder replaces real food fiber and micronutrients.</p>
        </CardContent>
      </Card>

      {/* Interactions */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" /> Key Interactions &amp; Timing
        </CardTitle></CardHeader>
        <CardContent className="p-4 pt-0 space-y-1 text-xs text-muted-foreground">
          <p><strong>D3 + K2:</strong> Always take together. K2 directs calcium where D3 sends it.</p>
          <p><strong>Zinc + Copper:</strong> Long-term zinc depletes copper. Consider 2mg copper if zinc &gt;30mg/day.</p>
          <p><strong>Iron + Zinc/Calcium:</strong> Compete for absorption. Separate by 2+ hours.</p>
          <p><strong>Magnesium + Zinc:</strong> Fine together at moderate doses; both benefit from evening dosing.</p>
          <p><strong>NAC:</strong> Take away from food for best absorption. 30 min before or 2 hours after meals.</p>
          <p><strong>Berberine + Metformin:</strong> Do NOT combine without medical supervision — both lower blood sugar.</p>
          <p><strong>Fat-soluble vitamins (D3, K2):</strong> Must be taken with dietary fat or absorption drops drastically.</p>
        </CardContent>
      </Card>

      {/* The Stack */}
      <Card className="border-2 border-emerald-300 bg-emerald-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-600" /> The Stack — If You Could Only Take 5
        </CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {["D3 + K2", "Magnesium", "Omega-3", "Creatine", "Zinc"].map((s, i) => (
              <div key={s} className="flex flex-col items-center p-2 rounded-lg bg-white border border-emerald-200 text-center">
                <span className="text-lg font-bold text-emerald-600">{i + 1}</span>
                <span className="text-xs font-medium">{s}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            These five cover the most common deficiencies and have the strongest evidence. Get bloodwork done. Fix
            deficiencies first. Then consider adding from Tier 2 based on your specific goals. Most people taking
            20 supplements would be better served by these 5, good sleep, and real food.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/nutrition" className="text-sm text-emerald-600 hover:underline">Nutrition</a>
        <a href="/sleep" className="text-sm text-blue-600 hover:underline">Sleep</a>
        <a href="/exercise" className="text-sm text-orange-600 hover:underline">Exercise</a>
        <a href="/bloodwork" className="text-sm text-red-600 hover:underline">Bloodwork</a>
      </div>
    </div>
  )
}
