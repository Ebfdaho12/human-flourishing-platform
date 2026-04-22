"use client"

import { useState } from "react"
import { Zap, Moon, Dumbbell, Scale, Brain, Pill, Sun, FlaskConical, ChevronDown, ChevronUp, Users, Droplets, Link, AlertTriangle, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"

function Section({ title, icon: Icon, color, children, defaultOpen = false }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Icon className={cn("h-4 w-4", color)} />{title}</CardTitle>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
      </button>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

const FUNDAMENTALS = [
  { rank: 1, title: "Sleep", tag: "MOST IMPORTANT", tagColor: "bg-violet-100 text-violet-700", icon: Moon, color: "text-violet-600", points: [
    "5 hours of sleep = 10-15% lower testosterone — equivalent to aging 10-15 years hormonally",
    "7-9 hours is optimal. Deep sleep (stages 3-4) is when most T is produced",
    "GnRH pulses during sleep drive the HPG axis and testosterone production",
    "Poor sleep also raises cortisol, which directly suppresses T",
    "Consistent sleep schedule matters more than one long night of catch-up",
  ]},
  { rank: 2, title: "Resistance Training", tag: "HIGH IMPACT", tagColor: "bg-blue-100 text-blue-700", icon: Dumbbell, color: "text-blue-600", points: [
    "Compound lifts (squat, deadlift, bench press, barbell row) increase T acutely 15-30%",
    "Chronic resistance training elevates baseline T over months",
    "45-60 min sessions optimal — beyond 60 min, cortisol rises and blunts the T response",
    "Heavy loads (75-85% 1RM) with 3-5 min rest periods maximize acute T response",
    "Training legs is non-negotiable — largest muscle groups drive the biggest hormonal response",
  ]},
  { rank: 3, title: "Body Fat Management", tag: "CRITICAL", tagColor: "bg-amber-100 text-amber-700", icon: Scale, color: "text-amber-600", points: [
    "Aromatase enzyme in adipose tissue converts testosterone to estrogen",
    "Every 1% body fat reduction improves T levels when above 20% body fat",
    "Sweet spot for men: 12-18% body fat for optimal hormonal balance",
    "Too low (under 8-10%) can crash T — the body perceives starvation and downregulates reproduction",
    "Visceral fat (belly fat) is worse than subcutaneous fat for aromatase activity",
  ]},
  { rank: 4, title: "Stress & Cortisol", tag: "INVERSE RELATIONSHIP", tagColor: "bg-rose-100 text-rose-700", icon: Brain, color: "text-rose-600", points: [
    "Cortisol and testosterone are inversely correlated — when one rises, the other falls",
    "Chronic stress causes HPA axis dysfunction, keeping T perpetually suppressed",
    "Meditation: even 10 min/day reduces cortisol 15-20% over 8 weeks",
    "Breathwork (box breathing, physiological sighs) acutely lowers cortisol",
    "Cold exposure triggers acute stress adaptation, improving long-term stress resilience",
  ]},
]

const NUTRITION = [
  { nutrient: "Zinc", dose: "30-45 mg/day", detail: "Cofactor in steroidogenic enzymes. Zinc deficiency alone can cause low T. Found in oysters, red meat, pumpkin seeds." },
  { nutrient: "Vitamin D", dose: "3,000-5,000 IU/day", detail: "Functions as a hormone, not just a vitamin. D-deficient men have significantly lower T. Test your 25(OH)D levels — aim for 40-60 ng/mL." },
  { nutrient: "Magnesium", dose: "400-600 mg/day", detail: "Supports T production, improves sleep quality, reduces cortisol. Most people are deficient. Glycinate or threonate forms preferred." },
  { nutrient: "Cholesterol", dose: "Dietary sources", detail: "Testosterone is literally synthesized FROM cholesterol. Very low-fat diets can crash T. Eggs, butter, and meat provide the building blocks." },
  { nutrient: "Saturated Fat", dose: "Moderate intake", detail: "Some saturated fat is needed for steroid hormone production. Studies show men on very low-fat diets have 12-15% lower T." },
]

const AVOID = [
  { item: "Excess alcohol", reason: "Increases aromatase activity — converts T directly to estrogen. Even 2-3 drinks acutely suppresses T for 12-24 hours." },
  { item: "Excess soy", reason: "Phytoestrogens can mimic estrogen at high intake. Moderate amounts are fine; daily heavy consumption may be problematic." },
  { item: "Seed oils (excess)", reason: "Highly inflammatory omega-6 fatty acids. Chronic inflammation suppresses HPG axis signaling." },
]

const SUPPLEMENTS = [
  { name: "Ashwagandha (KSM-66)", dose: "600 mg/day", evidence: "Strong", color: "bg-emerald-100 text-emerald-700", detail: "19% increase in T across multiple RCTs. Also reduces cortisol by 27%. Best-studied natural T support." },
  { name: "Tongkat Ali", dose: "200-400 mg/day", evidence: "Moderate-Strong", color: "bg-emerald-100 text-emerald-700", detail: "Restores T in stressed and aging men. Supported by meta-analysis. Also called Longjack (Eurycoma longifolia)." },
  { name: "Boron", dose: "10 mg/day", evidence: "Moderate", color: "bg-amber-100 text-amber-700", detail: "May reduce SHBG, freeing more bioavailable testosterone. Cheap and well-tolerated." },
  { name: "Fenugreek", dose: "500-600 mg/day", evidence: "Mixed", color: "bg-amber-100 text-amber-700", detail: "Some positive RCTs showing modest T increases. May work partly by inhibiting aromatase." },
  { name: "D-Aspartic Acid", dose: "2-3 g/day", evidence: "Weak", color: "bg-orange-100 text-orange-700", detail: "Short-term T boost that fades after 2-3 weeks. Not useful for sustained optimization." },
  { name: "DHEA", dose: "25-50 mg/day", evidence: "Moderate (age 40+)", color: "bg-amber-100 text-amber-700", detail: "Precursor hormone that declines with age. More useful over 40. Can convert to both T and estrogen — monitor levels." },
]

const BLOOD_MARKERS = [
  { marker: "Total Testosterone", range: "400-1000+ ng/dL", note: "Wide 'normal' range — optimize, don't just be 'in range'" },
  { marker: "Free Testosterone", range: "9-25 pg/mL", note: "What your body can actually use. More important than total T" },
  { marker: "SHBG", range: "20-50 nmol/L", note: "Sex Hormone Binding Globulin — high SHBG = less free T" },
  { marker: "Estradiol (E2)", range: "20-35 pg/mL", note: "Too high or too low causes symptoms. Balance matters" },
  { marker: "LH & FSH", range: "2-12 mIU/mL", note: "Signals from pituitary — helps identify primary vs secondary hypogonadism" },
  { marker: "Prolactin", range: "2-18 ng/mL", note: "Elevated prolactin suppresses T. Rule out pituitary issues" },
  { marker: "Thyroid Panel", range: "TSH 0.5-2.5", note: "Hypothyroidism mimics low T symptoms and can lower T" },
  { marker: "DHEA-S", range: "Age-dependent", note: "Adrenal androgen precursor. Low levels suggest adrenal fatigue" },
]

const RELATED = [
  { label: "Sleep Optimization", href: "/sleep-optimization" },
  { label: "Cold Exposure", href: "/cold-exposure" },
  { label: "Breathwork", href: "/breathwork" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Body Composition", href: "/body-composition" },
  { label: "Men's Health", href: "/mens-health" },
  { label: "Women's Health", href: "/womens-health" },
]

export default function TestosteronePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-400">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Testosterone & Hormone Optimization</h1>
        </div>
        <p className="text-sm text-muted-foreground">Evidence-based natural optimization strategies — exhaust these before ever considering TRT or pharmaceutical intervention.</p>
      </div>

      {/* Why It Matters */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-red-700">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Testosterone declines <strong>1-2% per year</strong> after age 30. But the bigger crisis: <strong>modern men have 20% lower T than men of the same age 20 years ago</strong> — driven by endocrine disruptors, sedentary lifestyles, poor sleep, chronic stress, and processed food. Low T affects <Explain tip="Testosterone influences far more than reproduction — it's a master hormone affecting virtually every system in the male body">muscle mass, bone density, mood, cognitive function, libido, energy, body composition, and cardiovascular health</Explain>. The good news: most men can significantly increase T naturally.
          </p>
        </CardContent>
      </Card>

      {/* The Fundamentals */}
      <div>
        <h2 className="text-base font-bold mb-3">The Fundamentals (Ranked by Impact)</h2>
        <div className="space-y-3">
          {FUNDAMENTALS.map((f) => (
            <Section key={f.rank} title={`${f.rank}. ${f.title}`} icon={f.icon} color={f.color} defaultOpen={f.rank === 1}>
              <div className="space-y-2">
                <Badge className={cn("text-[10px]", f.tagColor)}>{f.tag}</Badge>
                <ul className="space-y-1">
                  {f.points.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-muted-foreground/50 shrink-0">-</span>{p}</li>
                  ))}
                </ul>
              </div>
            </Section>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <Section title="5. Nutrition for Testosterone" icon={Droplets} color="text-green-600" defaultOpen={false}>
        <div className="space-y-3">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Key Nutrients</p>
          <div className="space-y-2">
            {NUTRITION.map((n) => (
              <div key={n.nutrient} className="border rounded-lg p-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{n.nutrient}</span>
                  <Badge variant="outline" className="text-[10px]">{n.dose}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{n.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mt-3">What to Minimize</p>
          <div className="space-y-1.5">
            {AVOID.map((a) => (
              <div key={a.item} className="text-xs text-muted-foreground"><strong className="text-foreground">{a.item}:</strong> {a.reason}</div>
            ))}
          </div>
        </div>
      </Section>

      {/* Supplements */}
      <Section title="6. Supplements with Research" icon={Pill} color="text-purple-600" defaultOpen={false}>
        <div className="space-y-2">
          {SUPPLEMENTS.map((s) => (
            <div key={s.name} className="border rounded-lg p-2.5 space-y-0.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-semibold">{s.name}</span>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{s.dose}</Badge>
                  <Badge className={cn("text-[10px]", s.color)}>{s.evidence}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Lifestyle */}
      <Section title="7. Lifestyle & Environmental Factors" icon={Sun} color="text-yellow-600" defaultOpen={false}>
        <ul className="space-y-1.5">
          <li className="text-xs text-muted-foreground"><strong className="text-foreground">Sunlight exposure:</strong> Direct sunlight on skin triggers vitamin D synthesis and other neuroendocrine pathways. 15-30 min morning sun.</li>
          <li className="text-xs text-muted-foreground"><strong className="text-foreground">Cold exposure:</strong> Acute cold stress boosts norepinephrine and may acutely raise T. Improves stress resilience and HPA axis function.</li>
          <li className="text-xs text-muted-foreground"><strong className="text-foreground">Endocrine disruptors:</strong> <Explain tip="Chemicals that mimic or block hormones in your body. Found in everyday products and nearly impossible to fully avoid — but reducing exposure helps significantly">BPA, phthalates, and parabens</Explain> — found in plastics, thermal receipts, personal care products, non-stick cookware. Use glass containers, filter water, choose clean products.</li>
          <li className="text-xs text-muted-foreground"><strong className="text-foreground">Testicular temperature:</strong> Limit phone in front pocket, avoid laptop on lap, wear loose underwear. Testes are external for a reason — they need to be cooler than core body temperature.</li>
          <li className="text-xs text-muted-foreground"><strong className="text-foreground">Competition & social dominance:</strong> Winning (even video games) transiently raises T. Social confidence and assertive behavior create positive feedback loops with T.</li>
        </ul>
      </Section>

      {/* When to Test */}
      <Section title="When to Test & What to Measure" icon={FlaskConical} color="text-cyan-600" defaultOpen={false}>
        <div className="space-y-3">
          <div className="bg-cyan-50/50 border border-cyan-200 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">When to draw blood:</strong> Morning (7-10 AM) when T peaks. Fasted. Avoid heavy exercise 24 hrs before. Test at least twice before drawing conclusions — T fluctuates day to day.</p>
          </div>
          <div className="space-y-1.5">
            {BLOOD_MARKERS.map((b) => (
              <div key={b.marker} className="flex items-start gap-2 text-xs">
                <span className="font-semibold whitespace-nowrap min-w-[120px]">{b.marker}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{b.range}</Badge>
                <span className="text-muted-foreground">{b.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* When Natural Isn't Enough */}
      <Section title="When Natural Optimization Isn't Enough" icon={AlertTriangle} color="text-amber-600" defaultOpen={false}>
        <div className="space-y-2">
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground"><strong className="text-amber-700">This section is informational, not prescriptive.</strong> Always work with a knowledgeable physician. Hormone management is complex and individual.</p>
          </div>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">Consider medical intervention when:</strong> Total T is consistently under 300 ng/dL with symptoms (fatigue, low libido, depression, muscle loss, brain fog) after genuinely optimizing sleep, training, nutrition, body fat, and stress for 3-6 months.</p>
          <div className="space-y-1.5 mt-2">
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">TRT (Testosterone Replacement):</strong> Exogenous testosterone (injections, gels, pellets). Effective but shuts down natural production. Requires ongoing management of estrogen, hematocrit, and fertility.</p>
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">Clomid / Enclomiphene:</strong> SERMs that stimulate your own LH/FSH production, preserving fertility. Often tried before TRT in younger men. Enclomiphene has fewer side effects than clomid.</p>
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">HCG:</strong> Mimics LH to maintain testicular function. Often used alongside TRT to preserve fertility and prevent testicular atrophy.</p>
          </div>
        </div>
      </Section>

      {/* For Women Too */}
      <Section title="Testosterone in Women" icon={Heart} color="text-pink-600" defaultOpen={false}>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Women produce testosterone too — from the ovaries and adrenal glands. Lower amounts than men (~15-70 ng/dL vs 300-1000+ ng/dL), but it is equally vital for <strong>energy, libido, mood, muscle maintenance, bone density, and cognitive sharpness</strong>.</p>
          <p className="text-xs text-muted-foreground">Female T declines gradually with age and drops significantly <strong>post-menopause</strong>. Symptoms of low T in women overlap with perimenopause: fatigue, low motivation, reduced libido, difficulty building muscle, and mood changes.</p>
          <p className="text-xs text-muted-foreground">The same natural strategies apply — sleep, resistance training, stress management, and key nutrients (zinc, vitamin D, magnesium) all support healthy T in women. Hormonal testing should include total T, free T, DHEA-S, and a full female hormone panel.</p>
        </div>
      </Section>

      {/* Sources */}
      <SourceList sources={[
        { id: 1, title: "Effect of 1 Week of Sleep Restriction on Testosterone Levels", authors: "Leproult R, Van Cauter E", journal: "JAMA", year: 2011, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/21632481/", notes: "5hrs sleep = 10-15% lower testosterone." },
        { id: 2, title: "A Prospective Study of the Effect of KSM-66 Ashwagandha on Testosterone", authors: "Lopresti AL, et al.", journal: "Am J Mens Health", year: 2019, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/30854916/", notes: "600mg/day KSM-66: 17% increase in testosterone, 18% increase in DHEA-S." },
        { id: 3, title: "Integrative Natural Approaches for Age-Related Testosterone Decline", authors: "Multiple", journal: "Cureus", year: 2026, type: "review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12887910/", notes: "Comprehensive review of exercise, nutrition, and bioactive compounds for T." },
        { id: 4, title: "Vitamin D supplementation and testosterone concentrations in men", authors: "Pilz S, et al.", journal: "Hormone and Metabolic Research", year: 2011, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/21154195/", notes: "3332 IU D3/day increased testosterone significantly." },
      ]} />

      {/* Related Pages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Link className="h-4 w-4 text-muted-foreground" />Related Pages</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {RELATED.map((r) => (
              <a key={r.href} href={r.href}>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent transition-colors">{r.label}</Badge>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}