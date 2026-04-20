"use client"

import { useState } from "react"
import { Smile, ChevronDown, AlertCircle, DollarSign, Baby, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MYTHS = [
  { myth: "Flossing doesn't actually matter", truth: "FALSE — sort of. A controversial 2016 AP investigation challenged flossing evidence. The dental consensus: flossing still removes plaque between teeth where brushes can't reach. Interproximal cleaning (floss OR interdental brushes) reduces gum disease. Use what you'll actually do consistently.", good: true },
  { myth: "Sugar causes cavities", truth: "PARTIALLY TRUE. Sugar itself doesn't cause cavities — sugar feeds the bacteria (Streptococcus mutans) that produce acid, and acid dissolves enamel. Frequency matters more than quantity: sipping sugary drinks all day is worse than eating sugar at one meal. Sticky, slow-dissolving sugars (gummies, caramels) are the worst offenders.", good: true },
  { myth: "Fluoride is dangerous", truth: "FALSE at normal levels. Fluoride strengthens enamel by replacing hydroxyapatite with fluorapatite, which is more acid-resistant. At concentrations in municipal water (0.7 ppm) and toothpaste (1000–1450 ppm), it is safe and effective. Dental fluorosis (white specks) from excessive intake in childhood is cosmetic, not harmful.", good: true },
  { myth: "Whitening damages enamel", truth: "AT HIGH DOSES OR FREQUENCY — yes. Professional whitening with 10–40% peroxide is generally safe when used as directed. Over-the-counter strips at lower concentrations are very safe. Over-whitening causes tooth sensitivity and temporary enamel weakening. Follow instructions; don't DIY with high-concentration products.", good: false },
  { myth: "You only need a dentist when something hurts", truth: "FALSE. The whole point of dental checkups is catching problems before they hurt. A cavity costs $150–300 to fill. A root canal costs $1,000–2,000. An extraction and implant: $4,000–6,000. Pain means the problem has progressed. Preventive care is 10–20x cheaper than restorative care.", good: false },
]

const PROVINCIAL_COSTS = [
  { province: "Ontario", checkup: "$150–250", filling: "$170–350", root_canal: "$900–1,500", implant: "$3,500–6,000", notes: "No universal adult dental. Canadian Dental Care Plan (federal) launched 2024 for lower-income adults under 65 without employer coverage." },
  { province: "BC", checkup: "$130–220", filling: "$160–320", root_canal: "$850–1,400", implant: "$3,000–5,500", notes: "BC follows the BC Dental Fee Guide. Some variation between fee guide and actual charges." },
  { province: "Alberta", checkup: "$130–200", filling: "$150–300", root_canal: "$800–1,300", implant: "$3,000–5,000", notes: "Alberta has no fee guide — dentists set their own rates. Price variation is significant." },
  { province: "Quebec", checkup: "$100–180", filling: "$130–280", root_canal: "$750–1,200", implant: "$2,800–4,500", notes: "Quebec Dental Fee Guide sets maximums. Generally lower costs than Ontario/BC." },
  { province: "All provinces", checkup: "—", filling: "—", root_canal: "—", implant: "—", notes: "Children under 12 are covered by the Canadian Dental Benefit (federal program). Provinces have varying programs for social assistance recipients." },
]

const AFFORDABLE_OPTIONS = [
  { option: "Canadian Dental Care Plan", desc: "Federal program launched 2024. Covers adults and seniors without employer dental coverage earning under $90K/year. Apply at canada.ca/dental. Covers preventive and basic restorative care." },
  { option: "Dental school clinics", desc: "Dental schools in every province offer care at 40–60% reduced cost, performed by supervised students. Quality is very high — students are closely supervised and take more time. Search '[your city] dental school clinic.'" },
  { option: "Community health centres", desc: "Many cities have community health centres offering sliding-scale dental care based on income. Often completely free for low-income individuals." },
  { option: "Dental therapy programs", desc: "Some provinces allow dental therapists (lower scope than dentists) to provide basic care at lower cost. Saskatchewan and Ontario have been expanding these roles." },
  { option: "Dental discount plans", desc: "Not insurance — annual membership ($100–200/year) gives access to negotiated rates. Useful if you have no insurance and can't access other programs. Examples: Dental Card Canada, Careington." },
]

const KIDS_HABITS = [
  { age: "0–2", habit: "First tooth = first dental visit. Clean gums with a damp cloth. Never put babies to sleep with a bottle (bottle rot is severe decay)." },
  { age: "2–5", habit: "Parent-assisted brushing twice daily. Use a rice-sized amount of fluoride toothpaste. Make it a non-negotiable routine, like seatbelts." },
  { age: "6–12", habit: "Supervised brushing until age 8–9 (children lack fine motor control). First flossing when teeth touch. First visit to an orthodontist at age 7 (early screening, not necessarily treatment)." },
  { age: "12+", habit: "Independent brushing 2x/day, floss daily, fluoride toothpaste. Limit soda and sports drinks. Mouthguard for contact sports. Wisdom tooth monitoring begins." },
]

export default function DentalHealthPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
            <Smile className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Dental Health Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">What actually prevents cavities, how much dental care costs in Canada, how to find affordable options, and how to build dental habits in kids.</p>
      </div>

      <Card className="border-2 border-sky-200 bg-sky-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-sky-900">Key insight: Canada has no universal adult dental coverage.</p>
          <p className="text-sm text-sky-700 mt-1">Unlike most developed countries, Canadian adults without employer insurance pay fully out-of-pocket. The federal Canadian Dental Care Plan (2024) is beginning to change this for lower-income Canadians — but most working adults still bear the full cost.</p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold">Myths vs. Reality</p>
        </div>
        <div className="space-y-2">
          {MYTHS.map((item, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `myth-${i}` ? null : `myth-${i}`)} className="w-full flex items-center justify-between py-3">
                  <p className="text-sm text-left pr-4">{item.myth}</p>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", expanded === `myth-${i}` && "rotate-180")} />
                </button>
                {expanded === `myth-${i}` && (
                  <div className={cn("pb-3 pt-2 text-sm border-t", item.good ? "text-emerald-800" : "text-amber-800")}>
                    {item.truth}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold">Costs by Province</p>
          <Badge variant="secondary" className="text-xs">Approximate 2024</Badge>
        </div>
        <div className="space-y-2">
          {PROVINCIAL_COSTS.map((p, i) => (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(expanded === `prov-${i}` ? null : `prov-${i}`)} className="w-full flex items-center justify-between py-3">
                  <span className="text-sm font-semibold">{p.province}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {p.checkup !== "—" && <span>Checkup: {p.checkup}</span>}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded === `prov-${i}` && "rotate-180")} />
                  </div>
                </button>
                {expanded === `prov-${i}` && (
                  <div className="pb-3 pt-2 border-t grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><span className="text-muted-foreground">Filling:</span> {p.filling}</div>
                    <div><span className="text-muted-foreground">Root canal:</span> {p.root_canal}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Implant:</span> {p.implant}</div>
                    <div className="col-span-2 text-muted-foreground text-xs mt-1">{p.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">Finding Affordable Dental Care</p>
        </div>
        <div className="space-y-2">
          {AFFORDABLE_OPTIONS.map((opt, i) => (
            <Card key={i} className="border border-amber-100">
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-semibold">{opt.option}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Baby className="h-4 w-4 text-rose-500" />
          <p className="text-sm font-semibold">Teaching Kids Dental Habits</p>
        </div>
        <div className="space-y-2">
          {KIDS_HABITS.map((item, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="secondary" className="text-xs h-fit mt-0.5 shrink-0">{item.age}</Badge>
              <p className="text-sm text-muted-foreground">{item.habit}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/gut-health" className="hover:underline text-foreground">Gut Health</a>
        <a href="/canada/healthcare" className="hover:underline text-foreground">Canada Healthcare</a>
        <a href="/parenting" className="hover:underline text-foreground">Parenting</a>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
      </div>
    </div>
  )
}
