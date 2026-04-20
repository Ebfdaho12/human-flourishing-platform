"use client"

import { useState } from "react"
import { Shield, ChevronDown, AlertTriangle, Heart, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DECADES = [
  {
    label: "In Your 20s",
    age: "Ages 18–29",
    color: "from-green-500 to-emerald-600",
    screenings: [
      "Blood pressure check every 2 years (annually if elevated)",
      "Cholesterol panel by age 20, then every 5 years if normal",
      "STI screening if sexually active — especially chlamydia, gonorrhea, HIV",
      "Testicular self-exam monthly — the most common cancer in men 15–35",
      "Skin check annually if high sun exposure",
      "Dental exam every 6–12 months",
    ],
    warnings: [
      "Persistent lump or change in a testicle — see a doctor same week",
      "Chest pain or shortness of breath during exercise",
      "Blood in urine or stool",
      "Moles that change shape, colour, or bleed",
    ],
    lifestyle: [
      "Establish baseline health numbers now (weight, BP, cholesterol) — you'll need them for comparison later",
      "Sleep 7–9 hours. This decade sets your metabolic baseline.",
      "Build strength now — muscle mass peaks in your 30s, then declines without resistance training",
      "Learn to cook real food. Dietary habits formed now persist for life.",
    ],
    mental: "Men in their 20s have the highest suicide rate relative to attempts. Social isolation post-education is a major risk factor. Build and maintain close male friendships — this is a health intervention, not a luxury.",
  },
  {
    label: "In Your 30s",
    age: "Ages 30–39",
    color: "from-blue-500 to-indigo-600",
    screenings: [
      "Annual physical with blood panel (glucose, cholesterol, liver function)",
      "Blood pressure annually",
      "Blood sugar / prediabetes screening if overweight or family history",
      "STI screening if new partners",
      "Eye exam every 1–2 years",
      "Skin cancer check if high-risk",
    ],
    warnings: [
      "Persistent fatigue that doesn't resolve with rest",
      "Weight gain concentrated around the abdomen — a specific metabolic risk",
      "Sleep apnea symptoms: loud snoring, waking unrefreshed, partner reports breathing pauses",
      "Erectile dysfunction — a reliable early warning of cardiovascular disease",
    ],
    lifestyle: [
      "If you haven't started strength training, start now. After 30 you lose 3–8% of muscle mass per decade without resistance training.",
      "Watch alcohol intake — liver resilience declines. Two drinks daily accumulates real damage over decades.",
      "Prioritize sleep over performance. Chronic sleep deprivation at this age predicts dementia risk later.",
      "Know your family history — many genetic risks become clinically relevant now.",
    ],
    mental: "Career pressure, relationship stress, and the first encounter with parenting or 'failing' at life milestones make the 30s a high-risk decade for depression and anxiety. Help-seeking is lowest in men this age. If you've had two weeks of low mood or loss of pleasure in things you enjoy — that's clinical, not weakness.",
  },
  {
    label: "In Your 40s",
    age: "Ages 40–49",
    color: "from-amber-500 to-orange-600",
    screenings: [
      "Colorectal cancer screening begins at 45 — colonoscopy or stool-based test",
      "PSA (prostate-specific antigen) discussion with your doctor — not universal, but warranted if Black, family history, or symptoms",
      "Comprehensive metabolic panel annually",
      "Blood pressure, cholesterol, glucose annually",
      "Cardiac stress test if risk factors are present",
      "Vision and hearing check",
    ],
    warnings: [
      "Urinary changes: frequency, urgency, weak stream, incomplete emptying",
      "Chest pain, jaw pain, or arm pain — any of these can indicate cardiac events",
      "Unexplained weight loss of 5%+ body weight",
      "Persistent back pain (can signal kidney or prostate issues, not just muscle)",
    ],
    lifestyle: [
      "Testosterone naturally declines ~1% per year after 30. Symptoms (fatigue, low libido, depression, weight gain) are real and treatable — but get levels tested before assuming.",
      "Zone 2 cardio (conversational pace for 30–45 min) is the single most evidence-backed longevity intervention. Do it 3–5 days/week.",
      "Manage stress actively. Chronic cortisol elevation in the 40s directly accelerates arterial aging.",
      "Invest in relationships. Social disconnection at this stage predicts worse health outcomes at 60+ than smoking.",
    ],
    mental: "The 'midlife crisis' is real but misunderstood — it's often genuine dissatisfaction with a life that wasn't consciously chosen. This is a valid signal, not a joke. Therapy and honest self-examination at this stage can redirect the next 40 years.",
  },
  {
    label: "In Your 50s+",
    age: "Ages 50 and beyond",
    color: "from-red-500 to-rose-600",
    screenings: [
      "Colorectal cancer screening every 5–10 years (colonoscopy) or annually (stool test)",
      "Prostate cancer discussion with doctor annually — PSA plus digital rectal exam",
      "Abdominal aortic aneurysm screening once (ultrasound) for men 65–75 who have smoked",
      "Lung cancer screening: annual low-dose CT if 50–80, 20+ pack-year history, current or quit within 15 years",
      "Bone density scan (DEXA) if risk factors — men get osteoporosis too",
      "Comprehensive cardiac workup",
    ],
    warnings: [
      "Any change in bowel habits lasting more than 3 weeks",
      "Blood in urine — don't wait, this is urgent",
      "Cognitive changes noticed by you or people close to you",
      "Shortness of breath with minimal exertion that wasn't present before",
    ],
    lifestyle: [
      "Resistance training becomes critical — sarcopenia (muscle loss) is the primary driver of decline and dependence.",
      "Bone health: calcium, vitamin D, weight-bearing exercise. Falls are the leading cause of injury death in older men.",
      "Review all medications for interactions — polypharmacy risk rises steeply in this decade.",
      "Stay cognitively engaged. Novel learning, social connection, and sleep quality are the top three evidence-backed dementia prevention strategies.",
    ],
    mental: "Depression in older men is frequently undiagnosed because it presents differently — as irritability, physical complaints, or withdrawal rather than sadness. Isolation after retirement or loss of identity tied to work is a real risk. Purpose and connection are not optional at any age.",
  },
]

const AVOIDANCE_REASONS = [
  { reason: "Fear of bad news", reframe: "The news doesn't change by not knowing. Early detection gives you options. Late detection removes them." },
  { reason: "Toughness and stoicism", reframe: "Getting screened is exactly what a competent, responsible person does. Avoiding it isn't strength — it's risk-blindness." },
  { reason: "No symptoms", reframe: "Most cancers, high blood pressure, high cholesterol, and type 2 diabetes have zero symptoms until they're advanced. That's the entire point of screening." },
  { reason: "Too busy or expensive", reframe: "A preventive visit is hours and a copay. Treatment for advanced cancer is months, bankrupting, and sometimes fatal. Calculate the actual cost." },
  { reason: "Embarrassment", reframe: "Every doctor has performed the exam thousands of times. Your embarrassment lasts 30 seconds. Your survival lasts decades." },
]

export default function MensHealthPage() {
  const [openDecade, setOpenDecade] = useState<number | null>(null)
  const [openReason, setOpenReason] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">Men's Health Checklist by Decade</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Men die an average of 5 years earlier than women. Most of those deaths are preventable. Here's what to do, decade by decade.
        </p>
        <div className="flex gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 mt-2">
          <Heart className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Key stat:</strong> Early detection of most cancers = 90%+ survival rate. Late detection (stage 4) = 20–30%. The screening IS the intervention.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DECADES.map((d, i) => {
          const isOpen = openDecade === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-blue-500/30")}>
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
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Warning Signs — Act Immediately</p>
                    <ul className="space-y-1">
                      {d.warnings.map((w, j) => (
                        <li key={j} className="flex gap-2 text-sm">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lifestyle Priorities</p>
                    <ul className="space-y-1">
                      {d.lifestyle.map((l, j) => (
                        <li key={j} className="flex gap-2 text-sm"><span className="text-blue-500 shrink-0">→</span>{l}</li>
                      ))}
                    </ul>
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
        <h2 className="text-lg font-bold">Why Men Avoid Doctors — And Why They Shouldn't</h2>
        {AVOIDANCE_REASONS.map((r, i) => {
          const isOpen = openReason === i
          return (
            <Card key={i}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenReason(isOpen ? null : i)}
              >
                <p className="font-medium text-sm text-muted-foreground">"{r.reason}"</p>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm pt-3">{r.reframe}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Women's Health", "/womens-health"], ["Sleep Calculator", "/sleep-calculator"], ["Mental Health", "/relationships"], ["Emergency Prep", "/emergency"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
