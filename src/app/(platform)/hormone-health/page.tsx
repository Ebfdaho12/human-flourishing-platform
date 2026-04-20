"use client"

import { useState } from "react"
import { Activity, ChevronDown, AlertTriangle, FlaskConical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const HORMONES = [
  {
    name: "Testosterone",
    role: "Muscle synthesis, libido, bone density, mood, motivation, red blood cell production. Present in all sexes — critical for both men and women, just at different levels.",
    low: "Fatigue, low libido, depression, loss of muscle mass, brain fog, poor sleep, increased body fat. In men: erectile dysfunction. In women: low energy, poor motivation.",
    high: "Acne, aggression, hair loss (male-pattern), menstrual irregularities in women, polycythemia (thick blood). Often from exogenous sources (steroids, DHEA supplements).",
    lifestyle: "Resistance training raises it. Sleep deprivation crushes it (one week of 5-hour nights drops levels 10–15%). Chronic stress (cortisol) suppresses it. Obesity converts testosterone to estrogen via aromatase. Zinc and vitamin D are cofactors.",
    testing: "Total testosterone (morning, fasted). Free testosterone if total is borderline. Men: test if symptomatic under 40, routinely after 45. Women: test if low libido, fatigue, or PCOS suspected.",
    color: "blue",
  },
  {
    name: "Estrogen",
    role: "Bone health, cardiovascular protection, mood regulation, skin elasticity, reproductive function, cholesterol balance. Men need it too — too little causes bone loss and joint pain.",
    low: "Hot flashes, night sweats, vaginal dryness, bone loss, joint pain, mood swings, poor sleep, brain fog. Seen in menopause, overtraining (female athlete triad), low body fat.",
    high: "Heavy periods, bloating, breast tenderness, mood swings, fibroids, endometriosis. In men: gynecomastia, low libido, fatigue. Driven by obesity, plastics (xenoestrogens), alcohol.",
    lifestyle: "Body fat produces estrogen (via aromatase) — high body fat = high estrogen in both sexes. Cruciferous vegetables (broccoli, cauliflower) support estrogen metabolism. Alcohol significantly raises estrogen. Phytoestrogens in soy are weak and generally not a concern at normal dietary amounts.",
    testing: "Estradiol (E2) is the main form tested. Women: varies enormously by cycle day — test on day 3 of cycle for baseline. Men: test if gynecomastia, erectile dysfunction, or low libido present.",
    color: "rose",
  },
  {
    name: "Cortisol",
    role: "The stress hormone — but also essential. Regulates blood sugar, reduces inflammation, controls the sleep-wake cycle (peaks in morning, drops at night). Without it: Addison's disease (life-threatening).",
    low: "Extreme fatigue, low blood pressure, dizziness, salt cravings, poor stress response, nausea. 'Adrenal fatigue' is controversial — true adrenal insufficiency is rare and serious.",
    high: "Weight gain (especially belly), high blood sugar, poor sleep, anxiety, immune suppression, memory impairment, high blood pressure. Chronic high cortisol is associated with metabolic syndrome.",
    lifestyle: "Sleep is the single biggest lever — poor sleep spikes cortisol. Chronic psychological stress keeps it elevated. Caffeine raises cortisol (especially on empty stomach in the morning). Regular moderate exercise lowers baseline; overtraining raises it. Meditation and breathwork measurably reduce it.",
    testing: "Salivary cortisol (4-point diurnal testing) is more informative than blood. Blood cortisol for suspected Addison's or Cushing's syndrome. Most 'adrenal fatigue' panels are not clinically validated — see an endocrinologist if symptoms are severe.",
    color: "amber",
  },
  {
    name: "Thyroid (T3/T4/TSH)",
    role: "Master metabolic regulator. Thyroid hormones control metabolic rate, heart rate, body temperature, digestion, muscle function, brain development, bone maintenance. TSH (from pituitary) signals the thyroid to produce more T4, which converts to active T3.",
    low: "Hypothyroidism: fatigue, weight gain, cold intolerance, constipation, dry skin/hair, hair loss, depression, slow heart rate, brain fog. Hashimoto's (autoimmune) is the most common cause.",
    high: "Hyperthyroidism: weight loss despite eating, rapid heart rate, anxiety, heat intolerance, tremors, diarrhea, insomnia, Graves' disease (autoimmune) is the most common cause.",
    lifestyle: "Iodine is required (found in seafood, dairy, iodized salt). Selenium supports T4→T3 conversion. Chronic inflammation (especially autoimmune) disrupts thyroid function. Soy and raw cruciferous vegetables in very large amounts may affect uptake in those with existing thyroid disease — not a concern in normal dietary amounts.",
    testing: "TSH is the primary screen. Free T4 and Free T3 give fuller picture. Thyroid antibodies (TPO, TgAb) if Hashimoto's suspected. Test if: fatigue + weight changes + cold intolerance + family history. Subclinical hypothyroidism (TSH slightly elevated, T4 normal) is controversial — treatment depends on symptoms.",
    color: "emerald",
  },
]

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  rose: "bg-rose-50 border-rose-200 text-rose-900",
  amber: "bg-amber-50 border-amber-200 text-amber-900",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
}

const badgeMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  rose: "bg-rose-100 text-rose-800",
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-800",
}

export default function HormoneHealthPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Hormone Health Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">Hormones are the operating system of your body — they govern nearly everything. This is education, not medical advice. If you suspect a hormonal imbalance, get tested.</p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-violet-900">Why hormones matter more than most people realize</p>
          <p className="text-sm text-violet-700 mt-1">Mood, energy, body composition, libido, sleep quality, and cognitive performance are all largely hormonal. Many people spend years treating symptoms (depression meds, fatigue, weight gain) without ever checking the underlying hormonal picture. A simple blood panel can reveal a lot.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {HORMONES.map((h, i) => {
          const key = `hormone-${i}`
          const isOpen = expanded === key
          const sections = [
            { label: "What it does", content: h.role },
            { label: "Signs of low levels", content: h.low },
            { label: "Signs of high levels", content: h.high },
            { label: "Lifestyle factors", content: h.lifestyle },
            { label: "When & how to test", content: h.testing },
          ]
          return (
            <Card key={i} className={cn("border-2", colorMap[h.color])}>
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-semibold text-sm">{h.name}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="pb-4 space-y-3 border-t pt-3">
                    {sections.map((s, si) => (
                      <div key={si}>
                        <Badge className={cn("text-xs mb-1", badgeMap[h.color])}>{s.label}</Badge>
                        <p className="text-sm">{s.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border border-amber-200 bg-amber-50/30">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Not medical advice</p>
              <p className="text-sm text-amber-700 mt-0.5">Hormonal health is complex and individual. This page provides educational context. If you suspect an imbalance, work with a physician or endocrinologist who can interpret results in the context of your full health picture — not just reference ranges on a lab printout.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/mens-health" className="hover:underline text-foreground">Men's Health</a>
        <a href="/womens-health" className="hover:underline text-foreground">Women's Health</a>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
        <a href="/gut-health" className="hover:underline text-foreground">Gut Health</a>
        <a href="/mental-health" className="hover:underline text-foreground">Mental Health</a>
      </div>
    </div>
  )
}
