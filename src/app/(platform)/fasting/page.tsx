"use client"

import { Clock, Brain, Heart, ShieldAlert, Zap, Timer, Activity, Utensils, Sparkles, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const PROTOCOLS = [
  { name: "16:8", color: "border-emerald-300 text-emerald-700", label: "Beginner", detail: "Eat within an 8-hour window, fast for 16 hours. Most popular and sustainable. Example: noon to 8 PM eating, skip breakfast.", tip: "Start by pushing breakfast back 1 hour per week until you reach a noon start." },
  { name: "18:6", color: "border-amber-300 text-amber-700", label: "Intermediate", detail: "6-hour eating window. Deeper fat oxidation and early autophagy activation. Example: 1 PM to 7 PM.", tip: "Most people naturally settle here after adapting to 16:8 for a few weeks." },
  { name: "OMAD", color: "border-orange-300 text-orange-700", label: "Advanced", detail: "One Meal A Day. 23:1 ratio. Significant autophagy and insulin sensitivity gains. Requires nutrient-dense meal planning.", tip: "Ensure your single meal has adequate protein (40g+), fats, and micronutrients. Not a license to eat junk." },
  { name: "24-Hour Fast", color: "border-red-300 text-red-700", label: "Weekly Reset", detail: "Dinner to dinner or lunch to lunch. Deep autophagy activation. Recommended 1x per week for metabolic flexibility.", tip: "Stay busy. Hunger comes in waves \u2014 the 18-22 hour window is hardest, then it fades." },
  { name: "48-72 Hour Fast", color: "border-violet-300 text-violet-700", label: "Quarterly Deep Clean", detail: "Extended fast for deep cellular cleanup. Stem cell regeneration peaks around 48-72 hours. Only 2-4x per year.", tip: "Electrolytes are essential: sodium, potassium, magnesium. Break the fast gently with bone broth or light protein." },
  { name: "5:2 Protocol", color: "border-blue-300 text-blue-700", label: "Alternate Approach", detail: "Eat normally 5 days per week, restrict to 500-600 calories on 2 non-consecutive days. Easier compliance for some.", tip: "Place restriction days on low-activity days. Focus on protein and vegetables for your 500 calories." },
]

const TIMELINE = [
  { hour: "0-4 hrs", state: "Fed State", color: "bg-emerald-100 border-emerald-300", desc: "Insulin elevated. Body digesting and absorbing nutrients. Glucose is primary fuel. No fat burning." },
  { hour: "4-8 hrs", state: "Early Post-Absorptive", color: "bg-emerald-50 border-emerald-200", desc: "Insulin falling. Blood sugar normalizing. Body beginning to transition from glucose to stored glycogen." },
  { hour: "8-12 hrs", state: "Glycogen Depletion", color: "bg-amber-50 border-amber-200", desc: "Liver glycogen stores depleting. Body shifting toward fat oxidation. Insulin at low baseline." },
  { hour: "12-16 hrs", state: "Fat Oxidation Ramp", color: "bg-amber-100 border-amber-300", desc: "Fat burning significantly increased. Ketone production beginning. Growth hormone rising. Mental clarity often improves." },
  { hour: "16-18 hrs", state: "Light Autophagy", color: "bg-orange-100 border-orange-300", desc: "Cellular recycling initiating. Damaged proteins and organelles being tagged for cleanup. AMPK pathway activated." },
  { hour: "18-24 hrs", state: "Significant Autophagy", color: "bg-orange-200 border-orange-400", desc: "Autophagy accelerating. Insulin at minimum. Maximum fat oxidation. Norepinephrine elevated \u2014 increased alertness." },
  { hour: "24-36 hrs", state: "Autophagy Peaks", color: "bg-red-100 border-red-300", desc: "Peak autophagic flux. Old immune cells cleared. Gut lining repair. Inflammation markers dropping significantly." },
  { hour: "48-72 hrs", state: "Stem Cell Regeneration", color: "bg-violet-100 border-violet-300", desc: "Stem cell regeneration activates. Deep cellular cleanup. Immune system reboot. Only recommended 2-4x per year with electrolytes." },
]

const BENEFITS = [
  { icon: Sparkles, title: "Autophagy (Nobel Prize)", desc: "Yoshinori Ohsumi won the 2016 Nobel Prize for discovering autophagy mechanisms \u2014 the cell's self-cleaning process that recycles damaged components into raw materials.", source: "Nobel Prize in Physiology or Medicine, 2016", color: "text-amber-600" },
  { icon: Brain, title: "Neurodegenerative Protection", desc: "Emerging research shows autophagy clears the protein aggregates implicated in Alzheimer's (amyloid-beta, tau) and Parkinson's (alpha-synuclein). Fasting may be neuroprotective.", source: "Autophagy, Nature Reviews Neuroscience", color: "text-violet-600" },
  { icon: Heart, title: "Insulin Sensitivity", desc: "Fasting dramatically improves insulin sensitivity by depleting glycogen and forcing metabolic flexibility. Reduces fasting insulin, HbA1c, and metabolic syndrome markers.", source: "Cell Metabolism", color: "text-rose-600" },
  { icon: Activity, title: "Reduced Inflammation", desc: "2025 Journal of Physiology: 121 humans on intermittent time-restricted eating showed significantly increased autophagic flux vs standard care (P=0.04).", source: "Journal of Physiology, 2025", color: "text-emerald-600" },
  { icon: Zap, title: "Dopamine Reset", desc: "Fasting resets dopamine receptor sensitivity by reducing baseline stimulation. Food tastes better, motivation increases, and reward circuits recalibrate.", source: "Huberman Lab, Stanford Neuroscience", color: "text-blue-600" },
  { icon: Utensils, title: "Digestive Rest & Gut Health", desc: "The migrating motor complex (gut's cleaning wave) only activates during fasting. Extended time without food allows gut lining repair and microbiome rebalancing.", source: "Gastroenterology", color: "text-cyan-600" },
]

const BREAKS_FAST = [
  { item: "Calories of any kind", breaks: true },
  { item: "Cream, milk, butter in coffee", breaks: true },
  { item: "Artificial sweeteners (most)", breaks: true },
  { item: "Bone broth (minimal impact)", breaks: false },
  { item: "Black coffee (no sugar)", breaks: false },
  { item: "Plain water / sparkling water", breaks: false },
  { item: "Plain tea (green, black, herbal)", breaks: false },
  { item: "Electrolytes (no sugar/calories)", breaks: false },
]

export default function FastingPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Fasting Protocols & Autophagy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Controlled nutrient scarcity that activates your body's deepest cellular repair mechanisms \u2014 the science of strategic not-eating.</p>
      </div>

      {/* Why Card */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong><Explain tip="Autophagy literally means 'self-eating' \u2014 your cells break down and recycle their own damaged parts, like a factory melting down broken machines to build new ones">Autophagy</Explain> is your body's built-in recycling program.</strong> When you stop eating for extended periods, cells shift from growth mode to cleanup mode \u2014 breaking down damaged proteins, clearing dysfunctional organelles, and recycling components into raw materials for repair. This process won Yoshinori Ohsumi the 2016 Nobel Prize. Fasting is free, requires no equipment, and activates the most powerful cellular maintenance system evolution has produced.
          </p>
        </CardContent>
      </Card>

      {/* The Science */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> The Science</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="rounded bg-violet-50 border border-violet-200 p-2.5 text-[10px] text-muted-foreground space-y-1.5">
            <p><strong>Yoshinori Ohsumi (Nobel Prize, 2016):</strong> Discovered the fundamental mechanisms of autophagy \u2014 how cells degrade and recycle their own components. His work in yeast identified the genes that control this process, which are conserved across all complex life including humans.</p>
            <p><strong>2025 Journal of Physiology:</strong> A study of 121 human participants found that intermittent <Explain tip="Time-restricted eating means limiting all food intake to a specific window each day, like 8 hours, and fasting the rest">time-restricted eating (TRE)</Explain> significantly increased autophagic flux compared to standard care (P=0.04) \u2014 direct human evidence that fasting protocols meaningfully activate autophagy.</p>
            <p><strong>Neurodegenerative Research:</strong> Autophagy clears the protein aggregates implicated in Alzheimer's (amyloid-beta plaques, hyperphosphorylated tau) and Parkinson's (alpha-synuclein Lewy bodies). Impaired autophagy is now considered a hallmark of neurodegeneration.</p>
            <p><strong><Explain tip="AMPK is an enzyme that acts as your cell's fuel gauge \u2014 when energy is low, AMPK activates to switch on fat burning and cellular repair while shutting down growth">AMPK Pathway:</Explain></strong> Fasting activates AMP-activated protein kinase, the master metabolic switch. AMPK inhibits mTOR (growth signaling), activates autophagy, increases fat oxidation, and improves mitochondrial biogenesis.</p>
          </div>
        </CardContent>
      </Card>

      {/* Hour-by-Hour Timeline */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4 text-orange-500" /> What Happens Hour by Hour</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1.5">
            {TIMELINE.map((t, i) => (
              <div key={i} className={cn("flex gap-2 rounded border p-2", t.color)}>
                <div className="shrink-0">
                  <Badge variant="outline" className="text-[8px] border-current">{t.hour}</Badge>
                  <p className="text-[8px] font-semibold mt-0.5 text-center">{t.state}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{t.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Utensils className="h-4 w-4 text-amber-500" /> Fasting Protocols</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {PROTOCOLS.map((p, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[8px]", p.color)}>{p.label}</Badge>
                  <span className="text-xs font-semibold">{p.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.detail}</p>
                <p className="text-[10px] text-amber-700 mt-1">Tip: {p.tip}</p>
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

      {/* What Breaks a Fast */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ban className="h-4 w-4 text-orange-500" /> What Breaks a Fast?</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-1.5">
            {BREAKS_FAST.map((item, i) => (
              <div key={i} className={cn("flex items-center gap-2 rounded border p-2 text-[10px]", item.breaks ? "border-red-200 bg-red-50/30" : "border-emerald-200 bg-emerald-50/30")}>
                <Badge variant="outline" className={cn("text-[8px]", item.breaks ? "border-red-300 text-red-700" : "border-emerald-300 text-emerald-700")}>
                  {item.breaks ? "Breaks" : "OK"}
                </Badge>
                <span className="text-muted-foreground">{item.item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-red-700"><ShieldAlert className="h-4 w-4" /> Who Should NOT Fast</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <p><strong className="text-red-700">Eating disorders:</strong> Anyone with a history of anorexia, bulimia, or disordered eating. Fasting can trigger relapse and reinforce harmful restriction patterns.</p>
            <p><strong className="text-red-700">Pregnant or nursing:</strong> Fetal development and milk production require consistent caloric and nutrient intake. Fasting is contraindicated during pregnancy and breastfeeding.</p>
            <p><strong className="text-red-700">Underweight (BMI &lt; 18.5):</strong> Insufficient body fat reserves make extended fasting dangerous. Risk of muscle wasting, nutrient deficiency, and hormonal disruption.</p>
            <p><strong className="text-red-700">Type 1 Diabetes:</strong> Without endogenous insulin, fasting creates serious risk of diabetic ketoacidosis. Type 2 diabetics on insulin should consult their physician before fasting.</p>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Synergies with Other Protocols</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Dopamine:</strong> Fasting resets <Explain tip="Dopamine is your brain's motivation and reward chemical \u2014 it makes you feel driven, focused, and good">dopamine</Explain> receptor sensitivity by reducing constant stimulation from food reward. After a fast, food tastes extraordinary and baseline motivation improves. <strong>Gut health:</strong> The <Explain tip="The migrating motor complex is a wave of muscular contractions that sweeps through your digestive tract during fasting, clearing debris like a broom">migrating motor complex</Explain> only activates during fasting \u2014 it is the gut's self-cleaning mechanism. Extended fasting allows gut lining repair and microbiome rebalancing. <strong>Sauna:</strong> Combining fasting with <a href="/sauna" className="text-orange-600 hover:underline font-medium">heat exposure</a> amplifies growth hormone release and autophagy through overlapping stress pathways.
          </p>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/sauna" className="text-sm text-orange-600 hover:underline">Sauna & Heat</a>
        <a href="/cold-exposure" className="text-sm text-cyan-600 hover:underline">Cold Exposure</a>
        <a href="/gut-health" className="text-sm text-emerald-600 hover:underline">Gut Health</a>
        <a href="/dopamine" className="text-sm text-violet-600 hover:underline">Dopamine</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/meal-planner" className="text-sm text-amber-600 hover:underline">Meal Planner</a>
      </div>
    </div>
  )
}
