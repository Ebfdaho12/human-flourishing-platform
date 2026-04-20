"use client"

import { useState } from "react"
import { Activity, ChevronDown, AlertCircle, CheckCircle, XCircle, Utensils, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const GOOD_FOODS = [
  { name: "Fermented foods", examples: "Yogurt, kefir, sauerkraut, kimchi, kombucha, miso, tempeh", why: "Contain live bacteria (probiotics) that add to gut microbiome diversity. Aim for 1–2 servings daily." },
  { name: "High-fibre vegetables", examples: "Artichokes, garlic, onions, leeks, asparagus, bananas (slightly underripe)", why: "These are prebiotics — food for your gut bacteria. Without fibre, beneficial bacteria starve and die off." },
  { name: "Legumes", examples: "Lentils, chickpeas, black beans, kidney beans", why: "Some of the highest-fibre foods available. Also feed specific bacteria that produce short-chain fatty acids, which reduce gut inflammation." },
  { name: "Whole grains", examples: "Oats, barley, quinoa, whole wheat (if tolerated)", why: "Provide both fibre and resistant starch. Oats in particular have beta-glucan, which feeds Lactobacillus and Bifidobacterium." },
  { name: "Polyphenol-rich foods", examples: "Berries, dark chocolate (70%+), green tea, olive oil, red wine (moderate)", why: "Polyphenols are mostly not digested — they pass to the colon where gut bacteria convert them to beneficial compounds." },
  { name: "Bone broth and collagen", examples: "Slow-cooked bone broth, collagen powder", why: "Rich in glycine and gelatin, which support the gut lining. Particularly useful if you have gut permeability issues." },
]

const BAD_FOODS = [
  { name: "Ultra-processed foods", examples: "Packaged snacks, fast food, processed meats, sugary cereals", why: "Contain emulsifiers (carrageenan, polysorbate-80) that disrupt the gut lining. Associated with reduced microbiome diversity." },
  { name: "Artificial sweeteners", examples: "Aspartame, sucralose, saccharin", why: "Multiple studies show these alter gut bacteria composition in ways that may impair glucose metabolism — the opposite of their intended benefit." },
  { name: "Excess alcohol", examples: "More than 7 drinks/week consistently", why: "Alcohol increases gut permeability ('leaky gut'), disrupts the microbiome, and promotes growth of harmful bacteria over beneficial ones." },
  { name: "Refined sugar in excess", examples: "Added sugar beyond ~25g/day", why: "Feeds pathogenic bacteria and yeasts (like Candida). High sugar intake correlates with lower microbiome diversity." },
  { name: "Unnecessary antibiotics", examples: "Taking antibiotics for viral infections (they don't work on viruses)", why: "Broad-spectrum antibiotics kill beneficial and harmful bacteria alike. A course of antibiotics can alter the microbiome for months to years." },
]

const RESET_DAYS = [
  { day: "Day 1–2", focus: "Remove and hydrate", actions: "Remove ultra-processed foods, alcohol, and excess sugar. Drink 2–3L water. Add one fermented food." },
  { day: "Day 3–4", focus: "Add diversity", actions: "Eat at least 5 different vegetables. Try a new legume (lentil soup, hummus). Add a probiotic supplement if not eating fermented foods." },
  { day: "Day 5–6", focus: "Increase fibre slowly", actions: "Slowly increase is key — rapid fibre increase causes bloating. Add one serving of beans or extra veg per day. Chew thoroughly." },
  { day: "Day 7", focus: "Assess and continue", actions: "Notice energy, digestion, mood. Most people report clearer thinking and better digestion by day 7. This is the new baseline — not a 7-day fix." },
]

const SECTIONS = [
  {
    id: "microbiome",
    label: "What is the microbiome?",
    icon: Activity,
    badge: "The basics",
    content: "Your gut contains approximately 38 trillion bacteria — roughly the same number as cells in your entire body. These bacteria, plus fungi, viruses, and other microorganisms, form your gut microbiome. They aren't passengers — they're active participants in digestion, immune function, hormone production, and even mood regulation. A diverse microbiome (many different species) is associated with better health outcomes across almost every system studied.",
  },
  {
    id: "prebiotics-probiotics",
    label: "Prebiotics vs Probiotics",
    icon: Utensils,
    badge: "Key distinction",
    content: "Probiotics are live beneficial bacteria found in fermented foods and supplements. Prebiotics are the fibre and plant compounds that FEED your existing gut bacteria. Think of probiotics as seeds and prebiotics as water and fertilizer. Without prebiotics (fibre), probiotic bacteria can't survive long-term. Most people need more prebiotics (fibre from whole plants) far more than they need expensive probiotic supplements.",
  },
  {
    id: "gut-brain",
    label: "The Gut-Brain Connection",
    icon: Brain,
    badge: "Emerging science",
    content: "The gut has its own nervous system (enteric nervous system) with 500 million neurons — sometimes called 'the second brain.' The vagus nerve connects the gut and brain bidirectionally; 90% of signals travel from gut to brain, not the other way around. Gut bacteria produce 95% of the body's serotonin and large amounts of dopamine precursors. Emerging research links gut microbiome composition to anxiety, depression, and even cognitive function. This field is early but the signal is strong.",
  },
]

export default function GutHealthPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showGood, setShowGood] = useState(true)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Gut Health Basics</h1>
        </div>
        <p className="text-sm text-muted-foreground">The microbiome explained simply — what to eat, what to avoid, and why your gut health affects almost everything. Not medical advice.</p>
      </div>

      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-green-900">Key insight: Diversity is everything.</p>
          <p className="text-sm text-green-700 mt-1">The single best predictor of gut microbiome health is diversity — how many different species of bacteria you have. The single best predictor of diversity is the number of different plant foods you eat per week. Research suggests 30+ different plant foods per week as a target.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {SECTIONS.map(section => {
          const Icon = section.icon
          const isOpen = expanded === section.id
          return (
            <Card key={section.id} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(isOpen ? null : section.id)} className="w-full flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{section.label}</span>
                    <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </button>
                {isOpen && <p className="pb-4 text-sm text-muted-foreground border-t pt-4">{section.content}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setShowGood(true)} className={cn("flex-1 text-sm py-2 rounded-lg font-medium border transition-all", showGood ? "bg-emerald-500 text-white border-emerald-500" : "border-border")}>
            <CheckCircle className="h-3.5 w-3.5 inline mr-1" />Foods that help
          </button>
          <button onClick={() => setShowGood(false)} className={cn("flex-1 text-sm py-2 rounded-lg font-medium border transition-all", !showGood ? "bg-red-500 text-white border-red-500" : "border-border")}>
            <XCircle className="h-3.5 w-3.5 inline mr-1" />Foods that harm
          </button>
        </div>
        <div className="space-y-2">
          {(showGood ? GOOD_FOODS : BAD_FOODS).map((food, i) => (
            <Card key={i} className={cn("border", showGood ? "border-emerald-100" : "border-red-100")}>
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-semibold">{food.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{food.examples}</p>
                <p className="text-sm text-muted-foreground">{food.why}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">7-Day Gut Reset: The Concept</p>
        <div className="space-y-2">
          {RESET_DAYS.map((day, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">{i + 1}</div>
              <div className="pb-2 border-b flex-1">
                <p className="text-sm font-semibold">{day.day} — {day.focus}</p>
                <p className="text-sm text-muted-foreground">{day.actions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3 flex gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">When to see a doctor</p>
            <p className="text-sm text-amber-800 mt-1">Persistent bloating, blood in stool, significant unintentional weight loss, chronic diarrhea or constipation, pain after eating, or any sudden change in bowel habits. These warrant medical investigation — do not self-treat with supplements.</p>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/cooking" className="hover:underline text-foreground">Cooking</a>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
        <a href="/dental-health" className="hover:underline text-foreground">Dental Health</a>
        <a href="/canada/mental-health-crisis" className="hover:underline text-foreground">Mental Health</a>
      </div>
    </div>
  )
}
