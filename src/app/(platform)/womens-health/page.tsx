"use client"

import { useState } from "react"
import { Heart, ChevronDown, AlertTriangle, Brain, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DECADES = [
  {
    label: "In Your 20s",
    age: "Ages 18–29",
    color: "from-pink-500 to-rose-600",
    screenings: [
      "Pap smear (cervical screening) starting at 21 — every 3 years if normal",
      "STI screening if sexually active — chlamydia, gonorrhea, HIV",
      "Blood pressure check every 2 years",
      "Clinical breast awareness — know your normal",
      "Skin check annually if high sun exposure",
      "Dental exam every 6–12 months",
      "HPV vaccine if not yet received — recommended up to age 45",
    ],
    reproductive: "Establish care with a gynaecologist or family doctor who takes reproductive health seriously. Track your menstrual cycle — changes in length, heaviness, or pain are clinical data, not something to just endure. Conditions like endometriosis and PCOS are frequently dismissed and take an average of 7–10 years to diagnose.",
    bone: "Peak bone density is built in your 20s. Weight-bearing exercise and adequate calcium (1000mg/day) now determines fracture risk at 70.",
    heart: "Low apparent risk — but this is when cardiovascular habits are set. Blood pressure creep starting in your 20s is a major long-term predictor.",
    mental: "Highest rates of eating disorders, anxiety disorders, and first-episode depression occur in this decade. Social comparison, body image, and identity pressures are peak here. Therapy is a legitimate and effective intervention — not a last resort.",
  },
  {
    label: "In Your 30s",
    age: "Ages 30–39",
    color: "from-orange-500 to-amber-600",
    screenings: [
      "Pap smear + HPV co-test every 5 years (or Pap alone every 3 years)",
      "Annual physical with full blood panel",
      "Blood pressure and cholesterol",
      "Blood glucose if overweight, family history, or PCOS diagnosis",
      "Thyroid function test — thyroid disorders are far more common in women; symptoms mimic depression and fatigue",
      "Skin cancer check",
    ],
    reproductive: "Fertility declines gradually after 32 and more sharply after 37 — this is biology, not judgment. If pregnancy is a future goal, discuss egg freezing or fertility baseline testing (AMH levels) with a specialist around 32–35. If not, this is when to be intentional about long-term contraception planning.",
    bone: "Maintain the bone density you built in your 20s. Resistance training 2–3x/week is essential. Vitamin D deficiency is common and directly affects bone and mood.",
    heart: "Hypertension and high cholesterol can appear in the 30s, especially with family history or pregnancies (preeclampsia raises lifetime cardiac risk). Know your numbers.",
    mental: "Burnout peaks in this decade — caregiving responsibilities for children and aging parents often converge with career demands. Chronic stress at this stage has direct cardiovascular and immune consequences. This is not a productivity problem; it is a health problem.",
  },
  {
    label: "In Your 40s",
    age: "Ages 40–49",
    color: "from-purple-500 to-violet-600",
    screenings: [
      "Mammogram starting at 40 — annually or every 2 years depending on risk (discuss with your doctor)",
      "Colorectal cancer screening begins at 45",
      "Pap smear + HPV co-test every 5 years",
      "Comprehensive blood panel annually: lipids, glucose, thyroid, iron",
      "Blood pressure annually",
      "Bone density scan (DEXA) if risk factors present",
      "Eye and hearing exam",
    ],
    reproductive: "Perimenopause typically begins 2–10 years before the final period and can start in the early 40s. Symptoms include irregular periods, hot flashes, sleep disruption, mood changes, brain fog, and vaginal changes. These are hormonal — not psychological weakness. Menopause hormone therapy (MHT) is safe and highly effective for most women under 60.",
    bone: "Estrogen decline accelerates bone loss. The first 5 years after menopause are when fracture risk rises fastest. This is when bone density screening and supplementation become critical.",
    heart: "Post-menopause cardiac risk increases sharply. Estrogen was protective. Cholesterol panels, blood pressure monitoring, and lifestyle management now require more attention than in previous decades.",
    mental: "Perimenopausal hormonal shifts directly affect brain chemistry — depression and anxiety in this decade are frequently hormonal in origin, not purely psychological. Treating the hormonal cause is often more effective than antidepressants alone.",
  },
  {
    label: "In Your 50s+",
    age: "Ages 50 and beyond",
    color: "from-teal-500 to-cyan-600",
    screenings: [
      "Mammogram annually or every 2 years — continue until at least 74",
      "Colorectal cancer: colonoscopy every 10 years or stool test annually",
      "Bone density scan (DEXA) at menopause and every 2 years after",
      "Cardiovascular workup: lipids, blood pressure, glucose annually",
      "Lung cancer screening if 50–80, 20+ pack-year smoking history",
      "Vision, hearing, and dental exams",
      "Abdominal aortic aneurysm screening (ultrasound) if smoked",
    ],
    reproductive: "Menopause is confirmed 12 months after the last period. Post-menopausal women remain at risk for UTIs, vaginal atrophy, and osteoporosis — all of which are manageable with treatment. Pelvic floor health (incontinence, prolapse) affects quality of life significantly and is almost universally undertreated.",
    bone: "Osteoporosis risk is highest now. A hip fracture in an older woman has a 20–30% mortality rate within one year. Fall prevention — strength, balance training, home safety — is one of the most important interventions of this decade.",
    heart: "After 55, women's cardiac risk equals and then exceeds men's. Heart attacks in women present differently — jaw pain, nausea, fatigue, and back pain are common, while classic chest-crushing pain is less common. This leads to underdiagnosis. Know the atypical signs.",
    mental: "Post-menopause cognitive changes are real but usually temporary. Persistent cognitive decline warrants evaluation. Social connection and purpose remain the strongest predictors of healthy aging — protect them actively.",
  },
]

const HORMONAL_BASICS = [
  {
    topic: "The Menstrual Cycle",
    content: "A normal cycle is 21–35 days. The average is 28 days — but normal varies widely. Tracking your cycle reveals a lot: irregular periods can signal thyroid issues, PCOS, stress, or nutritional deficiency. Heavy bleeding (soaking through a pad/tampon hourly, or passing clots larger than a quarter) warrants investigation — it may be fibroids, endometriosis, or a bleeding disorder.",
  },
  {
    topic: "Perimenopause",
    content: "The transition phase before menopause, lasting 2–10 years. Can begin in the early 40s. Estrogen and progesterone fluctuate wildly before declining. Symptoms: irregular periods, hot flashes, night sweats, sleep disruption, mood swings, brain fog, joint pain, low libido, vaginal dryness. These are hormone-driven — not 'just stress' or 'just aging.'",
  },
  {
    topic: "Menopause",
    content: "Defined as 12 consecutive months without a period. Average age in Canada is 51. This marks the end of reproductive capacity, but not health, vitality, or sexuality. Hormone therapy, when started within 10 years of menopause or before 60, has a favourable risk-benefit profile for most women and dramatically improves quality of life.",
  },
]

export default function WomensHealthPage() {
  const [openDecade, setOpenDecade] = useState<number | null>(null)
  const [openHormone, setOpenHormone] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
            <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-3xl font-bold">Women's Health Checklist by Decade</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Screenings, warning signs, and health priorities — from your 20s through 50s and beyond.
        </p>
        <div className="flex gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 mt-2">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            <strong>Key stat:</strong> Heart disease is the #1 killer of women — responsible for 1 in 3 female deaths. It kills more women than all cancers combined. Yet surveys show most women identify breast cancer as their greatest health risk. This misconception has real consequences.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DECADES.map((d, i) => {
          const isOpen = openDecade === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-rose-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenDecade(isOpen ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-10 rounded-full bg-gradient-to-b", d.color)} />
                  <div>
                    <p className="font-semibold">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.age}</p>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-5 px-5 border-t space-y-4">
                  <div className="pt-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Screenings</p>
                    <ul className="space-y-1">
                      {d.screenings.map((s, j) => (
                        <li key={j} className="flex gap-2 text-sm"><span className="text-green-500 shrink-0">✓</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 space-y-1">
                    <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">Reproductive Health</p>
                    <p className="text-sm text-pink-700 dark:text-pink-300">{d.reproductive}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <p className="text-xs font-semibold text-slate-500">Bone Health</p>
                      <p className="text-xs">{d.bone}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 space-y-1">
                      <p className="text-xs font-semibold text-red-500">Heart Health</p>
                      <p className="text-xs text-red-700 dark:text-red-300">{d.heart}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Brain className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">Mental Health</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">{d.mental}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-pink-500" /> Hormonal Health Basics</h2>
        {HORMONAL_BASICS.map((h, i) => {
          const isOpen = openHormone === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-pink-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenHormone(isOpen ? null : i)}
              >
                <p className="font-semibold text-sm">{h.topic}</p>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm pt-3">{h.content}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Men's Health", "/mens-health"], ["Sleep Calculator", "/sleep-calculator"], ["Routine Builder", "/routine"], ["Emergency Prep", "/emergency"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
