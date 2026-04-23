"use client"

import { Apple, Droplets, Clock, Leaf, FlaskConical, Salad, ShieldCheck, ArrowRight, Plus, Trash2, Flame, Sprout } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"
import { useMemo, useState } from "react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type Meal = { id: string; date: string; time: string; name: string; protein?: number; carbs?: number; fat?: number; plants?: string[]; notes?: string }

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}
const minToTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

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
  const [meals, setMeals] = useSyncedStorage<Meal[]>("hfp-meals", [])
  const [water] = useSyncedStorage<Record<string, number>>("hfp-water-log", {})
  const [targets, setTargets] = useSyncedStorage<{ protein: number; carbs: number; fat: number }>("hfp-nutrition-targets", { protein: 150, carbs: 200, fat: 70 })
  const [form, setForm] = useState<Partial<Meal>>({ date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5) })
  const [showForm, setShowForm] = useState(false)
  const [plantInput, setPlantInput] = useState("")

  const analytics = useMemo(() => {
    const today = dayKey(new Date())
    const todayMeals = meals.filter(m => m.date === today).sort((a, b) => timeToMin(a.time) - timeToMin(b.time))
    const todayTotals = todayMeals.reduce((s, m) => ({
      protein: s.protein + (m.protein ?? 0),
      carbs: s.carbs + (m.carbs ?? 0),
      fat: s.fat + (m.fat ?? 0),
      plants: new Set([...Array.from(s.plants), ...(m.plants ?? [])]),
    }), { protein: 0, carbs: 0, fat: 0, plants: new Set<string>() })
    const todayCalories = todayTotals.protein * 4 + todayTotals.carbs * 4 + todayTotals.fat * 9

    const weekPlants = new Set<string>()
    const weekStart = Date.now() - 7 * 86400000
    meals.filter(m => new Date(m.date).getTime() >= weekStart).forEach(m => (m.plants ?? []).forEach(p => weekPlants.add(p.toLowerCase().trim())))

    const eatingWindow = todayMeals.length >= 2 ? {
      start: todayMeals[0].time,
      end: todayMeals[todayMeals.length - 1].time,
      hours: (timeToMin(todayMeals[todayMeals.length - 1].time) - timeToMin(todayMeals[0].time)) / 60,
    } : null

    const last7Days: { key: string; protein: number; carbs: number; fat: number; plants: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const k = dayKey(d)
      const dayMeals = meals.filter(m => m.date === k)
      const p = new Set<string>()
      dayMeals.forEach(m => (m.plants ?? []).forEach(x => p.add(x.toLowerCase().trim())))
      last7Days.push({
        key: k,
        protein: dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0),
        carbs: dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0),
        fat: dayMeals.reduce((s, m) => s + (m.fat ?? 0), 0),
        plants: p.size,
      })
    }
    const daysLogged = last7Days.filter(d => d.protein + d.carbs + d.fat > 0).length
    const avgProtein = daysLogged ? last7Days.filter(d => d.protein > 0).reduce((s, d) => s + d.protein, 0) / daysLogged : 0

    const todayWater = water[today] ?? 0

    return { todayMeals, todayTotals, todayCalories, weekPlants, eatingWindow, last7Days, daysLogged, avgProtein, todayWater }
  }, [meals, water])

  function addMeal() {
    if (!form.name || !form.date || !form.time) return
    const meal: Meal = {
      id: crypto.randomUUID(),
      date: form.date!,
      time: form.time!,
      name: form.name!,
      protein: Number(form.protein) || undefined,
      carbs: Number(form.carbs) || undefined,
      fat: Number(form.fat) || undefined,
      plants: form.plants ?? [],
      notes: form.notes,
    }
    setMeals([meal, ...meals])
    setForm({ date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5) })
    setPlantInput("")
    setShowForm(false)
  }

  function addPlant(p: string) {
    if (!p.trim()) return
    setForm({ ...form, plants: [...(form.plants ?? []), p.trim()] })
    setPlantInput("")
  }

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

      {/* Today's intake + log */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-green-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2"><Flame className="h-4 w-4 text-emerald-600" /> Today — {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            <span className="text-xs font-normal text-muted-foreground">{analytics.todayMeals.length} meals · {Math.round(analytics.todayCalories)} cal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["protein", "carbs", "fat"] as const).map(k => {
              const val = analytics.todayTotals[k]
              const target = targets[k]
              const pct = Math.min(100, (val / target) * 100)
              const colors = { protein: "text-red-600 bg-red-100", carbs: "text-amber-600 bg-amber-100", fat: "text-yellow-600 bg-yellow-100" }
              const barColors = { protein: "bg-red-500", carbs: "bg-amber-500", fat: "bg-yellow-500" }
              return (
                <div key={k} className="rounded-lg border bg-white p-2">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className={cn("text-[10px] uppercase tracking-wide font-semibold", colors[k].split(" ")[0])}>{k}</span>
                    <span className="text-xs tabular-nums font-mono">{Math.round(val)}/{target}g</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", barColors[k])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-muted-foreground">Plants this week:</span>
              <span className={cn("font-bold tabular-nums", analytics.weekPlants.size >= 30 ? "text-emerald-600" : analytics.weekPlants.size >= 15 ? "text-amber-600" : "text-slate-600")}>{analytics.weekPlants.size}</span>
              <span className="text-muted-foreground">/ 30</span>
            </div>
            {analytics.eatingWindow && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-muted-foreground">Window:</span>
                <span className="font-semibold">{analytics.eatingWindow.start}–{analytics.eatingWindow.end}</span>
                <span className="text-muted-foreground">({analytics.eatingWindow.hours.toFixed(1)}h)</span>
              </div>
            )}
            {analytics.todayWater > 0 && (
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-muted-foreground">Water:</span>
                <span className="font-semibold tabular-nums">{analytics.todayWater}oz</span>
              </div>
            )}
          </div>

          {analytics.todayMeals.length > 0 && (
            <div className="space-y-1">
              {analytics.todayMeals.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-xs rounded-md bg-white border p-2">
                  <span className="text-muted-foreground font-mono tabular-nums w-10">{m.time}</span>
                  <span className="flex-1 font-medium">{m.name}</span>
                  {(m.protein || m.carbs || m.fat) && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {m.protein ? `P${m.protein}` : ""} {m.carbs ? `C${m.carbs}` : ""} {m.fat ? `F${m.fat}` : ""}
                    </span>
                  )}
                  {m.plants && m.plants.length > 0 && <span className="text-[10px] text-emerald-600">{m.plants.length} 🌱</span>}
                  <button onClick={() => setMeals(meals.filter(x => x.id !== m.id))} className="text-slate-400 hover:text-rose-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 py-2 text-sm text-emerald-700 hover:bg-emerald-50/40 transition">
              <Plus className="h-4 w-4" /> Log a meal
            </button>
          ) : (
            <div className="rounded-lg border bg-white p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.date ?? ""} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-md border px-2 py-1 text-xs" />
                <input type="time" value={form.time ?? ""} onChange={e => setForm({ ...form, time: e.target.value })} className="rounded-md border px-2 py-1 text-xs" />
              </div>
              <input placeholder="Meal name (e.g. chicken + sweet potato + broccoli)" value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border px-2 py-1.5 text-xs" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Protein g" value={form.protein ?? ""} onChange={e => setForm({ ...form, protein: Number(e.target.value) || undefined })} className="rounded-md border px-2 py-1 text-xs" />
                <input type="number" placeholder="Carbs g" value={form.carbs ?? ""} onChange={e => setForm({ ...form, carbs: Number(e.target.value) || undefined })} className="rounded-md border px-2 py-1 text-xs" />
                <input type="number" placeholder="Fat g" value={form.fat ?? ""} onChange={e => setForm({ ...form, fat: Number(e.target.value) || undefined })} className="rounded-md border px-2 py-1 text-xs" />
              </div>
              <div className="flex gap-1 flex-wrap items-center">
                <input placeholder="Add plant (press enter)" value={plantInput} onChange={e => setPlantInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPlant(plantInput) } }} className="flex-1 min-w-32 rounded-md border px-2 py-1 text-xs" />
                {(form.plants ?? []).map((p, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] cursor-pointer" onClick={() => setForm({ ...form, plants: (form.plants ?? []).filter((_, j) => j !== i) })}>{p} ×</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addMeal} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg py-1.5">Save</button>
                <button onClick={() => setShowForm(false)} className="flex-1 border rounded-lg text-xs py-1.5">Cancel</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7-day trend (only if data exists) */}
      {analytics.daysLogged >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">Last 7 Days — Protein vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-20 mb-2">
              {analytics.last7Days.map((d, i) => {
                const pct = Math.min(100, (d.protein / targets.protein) * 100)
                const date = new Date(d.key)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={cn("w-full rounded-t transition-all relative", pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : d.protein > 0 ? "bg-rose-300" : "bg-slate-100")} style={{ height: `${pct}%`, minHeight: d.protein > 0 ? 6 : 0 }}>
                      {d.protein > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono">{Math.round(d.protein)}</span>}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              7-day avg: <span className="font-semibold text-foreground tabular-nums">{Math.round(analytics.avgProtein)}g protein</span> across {analytics.daysLogged} logged days · target {targets.protein}g
            </p>
          </CardContent>
        </Card>
      )}

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

      {/* Sources */}
      <SourceList sources={[
        { id: 1, title: "Ultra-Processed Foods and Health Outcomes: A Narrative Review", authors: "Hall KD, et al.", journal: "Cell Metabolism", year: 2019, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/31105044/", notes: "RCT: ultra-processed diet caused 500 cal/day more intake and 2lbs weight gain in 2 weeks." },
        { id: 2, title: "Prevalence of Vitamin D Deficiency by Region", authors: "Cashman KD, et al.", journal: "Dermato-Endocrinology", year: 2019, type: "review", url: "https://pubmed.ncbi.nlm.nih.gov/31700717/", notes: "40-70% of adults worldwide are vitamin D insufficient." },
        { id: 3, title: "Dietary protein and muscle mass in older persons", authors: "Baum JI, et al.", journal: "Nutrients", year: 2016, type: "review", url: "https://pubmed.ncbi.nlm.nih.gov/27338461/", notes: "0.7-1g/lb protein recommended for muscle maintenance." },
      ]} />

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
