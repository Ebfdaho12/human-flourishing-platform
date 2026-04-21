"use client"

import { Apple, Droplets, Clock, Leaf, FlaskConical, Salad, ShieldCheck, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const macros = [
  { name: "Protein", role: "Builds and repairs every tissue. Drives satiety. Preserves muscle during fat loss. Most people under-eat it.", target: "0.7-1g per lb bodyweight", color: "text-red-600 bg-red-50 border-red-200" },
  { name: "Carbohydrates", role: "Primary fuel for the brain and high-intensity activity. Regulates serotonin (mood). Not the enemy — context matters.", target: "Match to activity level", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { name: "Fat", role: "Builds hormones (testosterone, estrogen), absorbs fat-soluble vitamins (A/D/E/K), insulates neurons. Essential — you die without it.", target: "25-35% of calories", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
]

const deficiencies = [
  { nutrient: "Magnesium", percent: "~68%", why: "Depleted by stress, caffeine, and processed food. Needed for 300+ enzymatic reactions, sleep quality, and muscle relaxation.", fix: "Magnesium glycinate 200-400mg before bed, or dark chocolate, pumpkin seeds, spinach" },
  { nutrient: "Vitamin D", percent: "~42%", why: "You synthesize it from sunlight. Modern indoor living creates chronic deficiency. It's actually a hormone, not a vitamin.", fix: "Get 15-20 min sunlight daily, or supplement 2000-5000 IU D3 with K2" },
  { nutrient: "Omega-3 (EPA/DHA)", percent: "~90%", why: "Anti-inflammatory. Critical for brain structure (60% of brain is fat). Modern diets are 20:1 omega-6 to omega-3; should be 2:1.", fix: "Fatty fish 2-3x/week, or 2-3g fish oil daily (EPA+DHA combined)" },
  { nutrient: "Zinc", percent: "~15%", why: "Immune function, testosterone production, wound healing, taste/smell. Vegans and heavy exercisers are at higher risk.", fix: "Oysters, red meat, pumpkin seeds. Supplement 15-30mg if needed" },
  { nutrient: "B12", percent: "~6% (40%+ in vegans)", why: "Only found in animal products. Needed for red blood cell formation, neurological function, and DNA synthesis.", fix: "Animal products, or methylcobalamin supplement 1000mcg daily" },
]

export default function NutritionPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Nutrition Fundamentals</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Not a diet page. These principles apply whether you eat keto, vegan, Mediterranean, or carnivore. The science underneath doesn't change.
        </p>
      </div>

      {/* Macronutrients */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4 text-green-600" /> <Explain tip="The three big categories of food your body uses for energy and building materials">Macronutrients</Explain></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {macros.map(m => (
            <div key={m.name} className={cn("rounded-lg border p-3", m.color.split(" ").slice(1).join(" "))}>
              <div className="flex items-center gap-2 mb-1">
                <p className={cn("text-sm font-semibold", m.color.split(" ")[0])}>{m.name}</p>
                <Badge variant="outline" className="text-[9px]">{m.target}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Micronutrient Deficiencies */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-600" /> <Explain tip="Vitamins and minerals your body needs in small amounts but can't function without">Micronutrients</Explain> Most People Lack</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {deficiencies.map(d => (
            <div key={d.nutrient} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">{d.nutrient}</p>
                <Badge variant="outline" className="text-[9px] border-red-300 text-red-700">{d.percent} deficient</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{d.why}</p>
              <p className="text-xs text-emerald-700"><strong>Fix:</strong> {d.fix}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hydration */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-500" /> Hydration</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong>How much:</strong> Roughly half your bodyweight (lbs) in ounces. A 180lb person needs ~90oz. More if you exercise, sweat, or drink caffeine.</p>
          <p><strong>Electrolytes matter more than volume.</strong> Water without sodium, potassium, and magnesium flushes straight through. Add a pinch of salt or use an electrolyte mix — especially morning and post-workout.</p>
          <p><strong>Fascia connection:</strong> Your fascia is 70% water. Chronic dehydration stiffens connective tissue, increasing injury risk and reducing mobility. See <a href="/fascia" className="text-blue-600 hover:underline">Fascia Health</a>.</p>
        </CardContent>
      </Card>

      {/* Meal Timing */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Meal Timing</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Insulin sensitivity peaks in the morning</strong> and declines through the day. Your body handles carbs better earlier. This is why late-night eating correlates with metabolic issues — not because of calories, but because of timing.</p>
          <p><strong>Circadian alignment:</strong> Eat within an 8-12 hour window aligned with daylight. First meal within 1-2 hours of waking, last meal 2-3 hours before bed. This synchronizes your peripheral clocks (liver, gut) with your master clock (SCN in the brain).</p>
          <p><strong>Protein distribution:</strong> Spread protein across meals (30-50g per meal). <Explain tip="Your muscles can only use so much protein at once for building — spreading it out means more muscle synthesis throughout the day">Muscle protein synthesis</Explain> has a ceiling per meal, so 150g at dinner is less effective than 50g across three meals.</p>
        </CardContent>
      </Card>

      {/* Gut Health Connection */}
      <Card className="border-green-200 bg-green-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-green-900">Gut Health Connection</p>
          </div>
          <p className="text-xs text-muted-foreground">Your gut microbiome produces 90% of your serotonin, 50% of your dopamine, and trains 70% of your immune system. Fiber diversity is more important than any single "superfood." Aim for 30+ different plant species per week. Fermented foods (kimchi, sauerkraut, yogurt, kefir) introduce beneficial bacteria directly.</p>
          <a href="/gut-health" className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-2"><ArrowRight className="h-3 w-3" /> Deep dive: Gut Health</a>
        </CardContent>
      </Card>

      {/* Anti-inflammatory + Food Quality */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Salad className="h-4 w-4 text-emerald-600" /> Anti-Inflammatory Foods & Food Quality</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Chronic inflammation</strong> underlies most modern disease: heart disease, cancer, Alzheimer's, depression, autoimmunity. Foods that fight it: fatty fish, berries, turmeric (with black pepper for absorption), extra virgin olive oil, leafy greens, ginger, green tea.</p>
          <p><strong>Ultra-processed food (UPF) research:</strong> The NOVA classification system ranks foods by processing level. Category 4 (ultra-processed) now makes up 60%+ of calories in the US diet. Hall et al. (2019, NIH) showed people eating UPF consumed 500+ extra calories/day vs. whole food diets — even when matched for macros, fiber, and palatability. The processing itself changes how your body responds.</p>
          <p><strong>Rule of thumb:</strong> If it has ingredients your great-grandmother wouldn't recognize, it's probably ultra-processed. This isn't about perfection — it's about shifting the ratio.</p>
        </CardContent>
      </Card>

      {/* Top 5 Changes */}
      <Card className="border-2 border-emerald-300 bg-emerald-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-900">If You Change Nothing Else</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">The five highest-ROI nutrition changes, ranked by impact-per-effort:</p>
          <div className="space-y-2">
            {[
              { n: 1, text: "Eat enough protein (0.7-1g/lb). Most people are at half that. This alone improves body composition, satiety, and energy." },
              { n: 2, text: "Drink water with electrolytes first thing in the morning. You wake up dehydrated after 8 hours without water." },
              { n: 3, text: "Supplement magnesium glycinate and vitamin D3+K2. Two cheapest, most impactful supplements that exist." },
              { n: 4, text: "Reduce ultra-processed food by 50%. You don't have to eliminate it — just shift the ratio toward whole foods." },
              { n: 5, text: "Stop eating 2-3 hours before bed. Improves sleep quality, morning energy, and metabolic health simultaneously." },
            ].map(item => (
              <div key={item.n} className="flex gap-3 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">{item.n}</span>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/gut-health" className="text-sm text-green-600 hover:underline">Gut Health</a>
        <a href="/body-composition" className="text-sm text-orange-600 hover:underline">Body Composition</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/cooking" className="text-sm text-red-600 hover:underline">Cooking</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/budget" className="text-sm text-teal-600 hover:underline">Budget</a>
      </div>
    </div>
  )
}
