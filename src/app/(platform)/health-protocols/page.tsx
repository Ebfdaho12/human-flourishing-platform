"use client"

import { useState } from "react"
import {
  Heart, Zap, Moon, Apple, Brain, Dumbbell, Sun, Droplets,
  ChevronDown, Clock, AlertTriangle, CheckCircle, Flame, Shield
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PROTOCOLS: {
  category: string
  icon: any
  color: string
  description: string
  practices: { name: string; evidence: string; howTo: string; timing: string; warning?: string }[]
}[] = [
  {
    category: "Sleep Optimization",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
    description: "Sleep is the foundation. Everything else works better when sleep is dialed in.",
    practices: [
      { name: "Consistent sleep/wake time (±30 min, even weekends)", evidence: "Strongest single predictor of sleep quality (Walker, 2017). Regulates circadian rhythm. Inconsistency causes 'social jet lag' equivalent to flying 2-3 time zones every week.", howTo: "Pick a wake time and stick to it 7 days/week. Bedtime follows naturally (wake time minus 7.5-8 hours). Set an alarm for BEDTIME, not just morning.", timing: "Every day, non-negotiable" },
      { name: "Cool room (18-20°C / 65-68°F)", evidence: "Core body temperature must drop 1-2°F to initiate sleep. Cool room accelerates this process. Heating pad on feet + cool room = fastest sleep onset.", howTo: "Set thermostat to 18-19°C. Warm feet (socks or hot water bottle), cool room. This combination is the most effective.", timing: "30 min before bed" },
      { name: "No screens 60 min before bed", evidence: "Blue light from screens suppresses melatonin production for up to 90 minutes (Harvard study). Content stimulation keeps brain in alert mode independent of light.", howTo: "Phone/laptop away 60 min before bed. If you must use screens: Night Shift / blue light filter at maximum. Better: read a physical book.", timing: "60 min before bed" },
      { name: "Morning sunlight (10-30 min within first hour)", evidence: "Sunlight exposure in the first 60 min after waking sets the circadian clock, increases cortisol peak (healthy morning spike), and advances melatonin onset by 12+ hours. Huberman Lab's most recommended single intervention.", howTo: "Get outside within 30 min of waking. Face the sun (don't stare directly). 10 min on bright days, 20-30 on cloudy. Through glass doesn't count — need direct outdoor light.", timing: "Within first hour of waking" },
      { name: "No caffeine after 12-1pm", evidence: "Caffeine half-life is 5-6 hours. A coffee at 2pm means 50% of the caffeine is active at 8pm. Even if you 'can fall asleep' with caffeine, it reduces deep sleep quality by 20-30%.", howTo: "Last caffeine by noon-1pm. If you currently drink caffeine late, push back by 1 hour per week.", timing: "Before noon", warning: "Withdrawal headaches are normal for 3-5 days when shifting timing." },
    ],
  },
  {
    category: "Exercise (The #1 Intervention)",
    icon: Dumbbell,
    color: "from-red-500 to-orange-600",
    description: "Exercise is the single most effective intervention for nearly every health metric. Nothing else comes close.",
    practices: [
      { name: "Zone 2 cardio (3-5x/week, 30-60 min)", evidence: "Builds mitochondrial density (your cells' power plants). Improves fat oxidation, insulin sensitivity, cardiovascular health. Zone 2 = can speak in sentences but slightly breathless. Peter Attia: 'If you could only do one thing for longevity, this is it.'", howTo: "Brisk walk, cycling, incline treadmill, easy jogging, swimming. Heart rate: 60-70% of max (roughly 180 minus age). You should be able to hold a conversation but prefer not to.", timing: "3-5x/week, 30-60 min per session", warning: "If starting from zero: begin with 15 min walks and build up over 4-6 weeks." },
      { name: "Resistance training (2-4x/week)", evidence: "Preserves muscle mass (which declines 3-5% per decade after 30). Prevents osteoporosis. Improves insulin sensitivity. Reduces all-cause mortality by 15-20%. Muscle is the organ of longevity.", howTo: "Full-body or upper/lower split. Compound movements: squat, deadlift, bench press, rows, overhead press. 3-4 sets of 6-12 reps. Progressive overload (add weight or reps over time).", timing: "2-4x/week, 45-60 min" },
      { name: "HIIT / sprints (1-2x/week MAX)", evidence: "Triggers mitochondrial efficiency upgrades. Improves VO2max (strongest predictor of longevity after not smoking). But: too much HIIT without Zone 2 base = burnout and cortisol spike.", howTo: "10-30 second hard efforts with 2-3 min recovery. 4-8 rounds. Bike sprints, hill sprints, rowing. Should feel unable to continue at the end of each interval.", timing: "1-2x/week ONLY. More is counterproductive." },
      { name: "Daily movement (10,000+ steps)", evidence: "Independent of exercise sessions. All-cause mortality decreases linearly up to ~10,000 steps/day. Sitting for 8+ hours is an independent risk factor even if you exercise.", howTo: "Walk during calls. Take stairs. Park far away. After-meal walk (also helps glucose response). Standing desk. Track with phone or watch.", timing: "Throughout the day" },
    ],
  },
  {
    category: "Nutrition Fundamentals",
    icon: Apple,
    color: "from-green-500 to-emerald-600",
    description: "Not a diet — a framework. What you eat consistently matters more than any single superfood.",
    practices: [
      { name: "Protein: 1.6-2.2g per kg body weight", evidence: "Optimal for muscle protein synthesis, satiety, and metabolic health. Most people eat 50-70% of what they need. Protein is the most satiating macronutrient — increasing it reduces cravings naturally.", howTo: "Calculate: body weight in kg × 1.6-2.2 = daily grams. 80kg person needs 128-176g/day. Spread across 3-4 meals (30-50g per meal). Sources: chicken, fish, eggs, beef, Greek yogurt, lentils, tofu.", timing: "Every meal should have 30-50g protein" },
      { name: "30+ different plants per week", evidence: "The American Gut Project (largest microbiome study) found that people eating 30+ plant species per week had the most diverse, healthy gut microbiomes. Diversity = resilience.", howTo: "Doesn't mean 30 servings — means 30 different types. Herbs count. Spices count. A mixed salad with 8 ingredients = 8 plants. Stir-fry with 6 vegetables = 6. It's easier than it sounds.", timing: "Spread across the week" },
      { name: "Minimize ultra-processed food", evidence: "Ultra-processed food (chips, candy, fast food, packaged snacks) is linked to: obesity, type 2 diabetes, cardiovascular disease, depression, and all-cause mortality. The processing — not just the calories — changes how your body responds.", howTo: "The test: could your grandmother recognize all the ingredients? If not, it's ultra-processed. Cook from whole ingredients when possible. 80/20 rule: 80% whole foods, 20% whatever you want. Perfection is the enemy of good.", timing: "Ongoing habit", warning: "Don't eliminate everything at once. Replace one ultra-processed item per week with a whole food version." },
      { name: "Time-restricted eating (10-12 hour window)", evidence: "Eating within a 10-12 hour window improves metabolic markers, insulin sensitivity, and circadian rhythm alignment. Not extreme fasting — just not eating at midnight.", howTo: "First meal at 8am → last meal by 6-8pm. OR first at 10am → last by 8-10pm. Match to your schedule. The window matters more than the exact hours.", timing: "Daily, flexible" },
    ],
  },
  {
    category: "Stress Management",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    description: "Chronic stress destroys health faster than a bad diet. These are the proven reducers.",
    practices: [
      { name: "Physiological sigh (immediate stress relief)", evidence: "Discovered by Stanford's Huberman Lab. Double inhale through nose → long exhale through mouth. Activates parasympathetic nervous system within 1-2 breaths. Fastest known biological stress reducer.", howTo: "Inhale through nose → short top-up inhale through nose → long slow exhale through mouth. Repeat 2-3 times. Works in real-time during stressful moments.", timing: "Anytime — takes 15 seconds" },
      { name: "10-20 min daily meditation", evidence: "Hundreds of RCTs show: reduced cortisol, lower anxiety, improved emotional regulation, better focus, reduced inflammation. MBSR (Mindfulness-Based Stress Reduction) has the strongest evidence base.", howTo: "Sit comfortably. Focus on breath. When mind wanders, notice and return to breath. That's it. Apps: Waking Up (Sam Harris), Headspace, or just a timer. Consistency > duration — 10 min daily beats 60 min weekly.", timing: "Morning or evening, consistent time" },
      { name: "Cold exposure (1-3 min cold shower)", evidence: "Increases norepinephrine 200-300% (sustained for hours). Improves mood, alertness, and stress resilience. Builds tolerance to discomfort (mental toughness training). Huberman/Susanna Søberg research.", howTo: "End your shower with 30-90 seconds of cold (as cold as it goes). Build up: start with 15 seconds, add 15 per week. OR: cold plunge at 10-15°C for 1-3 minutes. The discomfort IS the benefit.", timing: "Morning preferred (alertness boost). Not before bed (too stimulating).", warning: "Avoid if you have heart conditions. Start gradual. Never do alone in open water." },
      { name: "Nature exposure (20+ min)", evidence: "20 minutes in nature reduces cortisol by 20-30% (University of Michigan). Independent of exercise — just being in green space. Forest bathing (shinrin-yoku) is an established medical practice in Japan.", howTo: "Walk in a park, forest, by water. Leave phone in pocket. Pay attention to surroundings — trees, sounds, smells. This is not exercise — it's sensory exposure to nature.", timing: "Daily if possible, minimum 3x/week" },
    ],
  },
  {
    category: "Red Light Therapy",
    icon: Sun,
    color: "from-red-500 to-rose-600",
    description: "Photobiomodulation — using specific wavelengths of light to enhance cellular function.",
    practices: [
      { name: "Red light (630-670nm) + Near-infrared (810-850nm)", evidence: "Stimulates cytochrome c oxidase in mitochondria → increases ATP production. Proven benefits: skin health, wound healing, joint pain reduction, muscle recovery, eye health. 4,000+ peer-reviewed studies.", howTo: "Use a quality panel (Joovv, Mito Red, or DIY with correct wavelengths). 10-20 min per session, 6-12 inches from skin. Target area: face, thyroid, joints, muscles.", timing: "Morning or after exercise. 3-5x/week." },
      { name: "Morning red light for circadian benefit", evidence: "Red/near-infrared light does NOT suppress melatonin (unlike blue light). Can be used as gentle morning light exposure before the sun is up. Supports mitochondrial function in skin and eyes.", howTo: "5-10 min exposure to face/body in the morning while doing other routines. NOT a replacement for sunlight — a supplement when sun isn't available.", timing: "First 30 min after waking", warning: "Buy from reputable manufacturers. Cheap panels may have incorrect wavelengths or flicker." },
    ],
  },
  {
    category: "Hydration & Electrolytes",
    icon: Droplets,
    color: "from-blue-500 to-cyan-600",
    description: "Most people are chronically mildly dehydrated. It affects everything from cognition to energy.",
    practices: [
      { name: "0.5oz per lb of body weight daily (minimum)", evidence: "Even 1-2% dehydration impairs cognitive function, energy, and mood. Most people drink half of what they need. Thirst is a LATE indicator — by the time you're thirsty, you're already dehydrated.", howTo: "Body weight in lbs ÷ 2 = ounces of water per day. 180 lbs = 90 oz = ~2.7 liters. Start the day with 16-24 oz before coffee. Carry a water bottle everywhere.", timing: "Throughout the day. Front-load in the morning." },
      { name: "Electrolytes (sodium, potassium, magnesium)", evidence: "Water alone isn't enough — you need electrolytes for cellular hydration. Most people are low in magnesium (60%+ of population) and potassium. Low magnesium = poor sleep, muscle cramps, anxiety.", howTo: "Magnesium glycinate: 200-400mg before bed (helps sleep). Electrolyte mix in morning water (LMNT, Nuun, or DIY: 1/4 tsp salt + squeeze of lemon). Potassium-rich foods: bananas, avocado, sweet potato.", timing: "Magnesium: before bed. Electrolytes: morning and post-exercise." },
    ],
  },
  {
    category: "Supplement Stack (Evidence-Based Only)",
    icon: Shield,
    color: "from-amber-500 to-orange-600",
    description: "Only supplements with strong evidence. Most supplements are marketing — these actually work.",
    practices: [
      { name: "Vitamin D3 (2,000-5,000 IU/day)", evidence: "70%+ of people in northern latitudes are deficient. Affects: immune function, bone health, mood, testosterone, insulin sensitivity. The single most impactful supplement for most people.", howTo: "Take with fat (it's fat-soluble). Get blood levels tested: aim for 40-60 ng/mL. Most people need 2,000-5,000 IU daily, more in winter.", timing: "Morning, with food containing fat" },
      { name: "Omega-3 (EPA+DHA, 2-3g/day)", evidence: "Anti-inflammatory. Supports brain, heart, and joint health. Most people eat 10x more omega-6 than omega-3 (ideal ratio: 1-4:1). Fish oil or algae oil (vegan).", howTo: "Look for total EPA+DHA content, not total fish oil. Minimum 1g EPA + 1g DHA. Store in fridge (prevents rancidity). Brands: Nordic Naturals, Carlson's.", timing: "With meals (reduces fish burps)" },
      { name: "Magnesium glycinate (200-400mg)", evidence: "Involved in 300+ enzymatic reactions. Deficient in 60%+ of population. Glycinate form: best for sleep, anxiety, muscle relaxation. Doesn't cause digestive issues like citrate or oxide.", howTo: "200-400mg, 30-60 min before bed. Start at 200mg and increase if needed.", timing: "Before bed" },
      { name: "Creatine monohydrate (3-5g/day)", evidence: "The most studied supplement in existence. Benefits: muscle strength, brain function, bone density, methylation. Safe for kidneys (hundreds of studies confirm). Not just for athletes — benefits everyone.", howTo: "3-5g daily, every day. No loading phase needed. Mix in water or any beverage. Tasteless. Monohydrate is the only form with evidence — ignore 'fancy' versions.", timing: "Anytime — consistency matters more than timing", warning: "May cause slight water retention initially (1-2 lbs). Normal and harmless." },
    ],
  },
  {
    category: "Sauna / Heat Exposure",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    description: "Heat stress triggers powerful adaptive responses — similar to exercise but complementary.",
    practices: [
      { name: "Sauna (80-100°C, 15-20 min, 3-4x/week)", evidence: "Finnish studies (20+ years of data): 4-7 sauna sessions/week reduces all-cause mortality by 40%, cardiovascular death by 50%. Increases heat shock proteins (repair damaged proteins), improves cardiovascular function, mimics moderate exercise.", howTo: "Traditional or infrared sauna. 80-100°C for 15-20 min. Drink water before and after. Cool down gradually (cold shower optional but enhances benefit).", timing: "Post-workout or evening. 3-4x/week minimum for longevity benefits.", warning: "Hydrate well. Avoid alcohol + sauna combination. Not recommended during pregnancy." },
    ],
  },
]

const DAILY_STACK = [
  { time: "Morning (within 30 min of waking)", items: ["16-24oz water + electrolytes", "Morning sunlight 10-30 min (or red light if dark)", "Vitamin D3 + Omega-3 with breakfast", "Creatine 3-5g (any time)"] },
  { time: "Mid-morning", items: ["Last caffeine by noon-1pm", "Zone 2 cardio or resistance training"] },
  { time: "Afternoon", items: ["10,000 step target (walk during breaks)", "Nature exposure if possible (20 min)"] },
  { time: "Evening", items: ["Dinner by 7-8pm (10-12 hour eating window)", "Sauna 3-4x/week if available", "Screens off 60 min before bed", "Magnesium glycinate 200-400mg"] },
  { time: "Bedtime", items: ["Cool room (18-20°C)", "Consistent sleep time (±30 min)", "7.5-8.5 hours of sleep opportunity"] },
]

export default function HealthProtocolsPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Health Best Practices</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Evidence-based protocols that actually work. Compiled from peer-reviewed research, clinical data, and expert consensus. No trends, no fads — just science.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The 80/20 of Health</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            80% of health outcomes come from 4 things: <strong>sleep</strong> (7.5-8.5 hours, consistent timing),
            <strong> exercise</strong> (Zone 2 cardio + resistance training), <strong>nutrition</strong> (adequate protein,
            whole foods, minimal ultra-processed), and <strong>stress management</strong> (breathwork, nature, social
            connection). Master these four before worrying about supplements, biohacking, or optimization protocols.
            The basics, done consistently, beat any advanced protocol done inconsistently.
          </p>
        </CardContent>
      </Card>

      {/* Daily protocol stack */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-500" /> Daily Protocol Stack
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {DAILY_STACK.map((block, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{block.time}</p>
              <div className="space-y-0.5">
                {block.items.map((item, j) => (
                  <p key={j} className="text-xs text-muted-foreground flex gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />{item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Protocol categories */}
      <div className="space-y-3">
        {PROTOCOLS.map((protocol, i) => {
          const Icon = protocol.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", protocol.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{protocol.category}</p>
                    <p className="text-[10px] text-muted-foreground">{protocol.practices.length} practices</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                    <p className="text-xs text-muted-foreground italic">{protocol.description}</p>
                    {protocol.practices.map((p, j) => (
                      <div key={j} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <Badge variant="outline" className="text-[8px]">{p.timing}</Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                            <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">Evidence</p>
                            <p className="text-xs text-blue-700">{p.evidence}</p>
                          </div>
                          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">How To</p>
                            <p className="text-xs text-emerald-700">{p.howTo}</p>
                          </div>
                          {p.warning && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" /> Warning
                              </p>
                              <p className="text-xs text-amber-700">{p.warning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Matthew Walker (<em>Why We Sleep</em>), Peter Attia (<em>Outlive</em>),
            Andrew Huberman (Huberman Lab), Rhonda Patrick (FoundMyFitness), Susanna Søberg (cold exposure research),
            Finnish Sauna studies (Laukkanen et al.), American Gut Project, ACSM exercise guidelines,
            Examine.com (supplement evidence database). This is education, not medical advice. Consult your
            doctor before starting any new protocol, especially if you have existing conditions.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/health" className="text-sm text-emerald-600 hover:underline">Health Dashboard</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/routine" className="text-sm text-amber-600 hover:underline">Daily Routines</a>
        <a href="/cooking" className="text-sm text-orange-600 hover:underline">Cooking Basics</a>
      </div>
    </div>
  )
}
