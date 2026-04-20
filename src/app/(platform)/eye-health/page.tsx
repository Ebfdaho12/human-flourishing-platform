"use client"

import { useState } from "react"
import { Eye, ChevronDown, AlertTriangle, Monitor } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const BLUE_LIGHT = [
  { claim: "Blue light causes permanent eye damage", verdict: "MYTH", detail: "The American Academy of Ophthalmology states there is no scientific evidence that blue light from screens causes eye disease or permanent damage. The amount of blue light from screens is far lower than from sunlight. Blue light blocking glasses have no proven benefit for digital eye strain." },
  { claim: "Screens cause digital eye strain", verdict: "FACT", detail: "Digital eye strain (computer vision syndrome) is real — but the cause is reduced blink rate (from 15 to ~5 blinks/minute), not blue light. Staring at screens causes dry eyes, muscle fatigue, and blur. The fix is the 20-20-20 rule and conscious blinking, not blue light glasses." },
  { claim: "Blue light disrupts sleep", verdict: "FACT (evening only)", detail: "Blue light in the evening (2–3 hours before bed) suppresses melatonin production and delays sleep onset. This is a real, evidence-backed concern. However, it is a sleep issue, not an eye damage issue. Night mode/warm display settings in the evening have genuine benefit for sleep quality." },
  { claim: "Children are more vulnerable to screen damage", verdict: "PARTIALLY TRUE", detail: "Children's eyes are developing, and their lenses transmit more blue light to the retina than adult lenses. More importantly, the myopia epidemic (nearsightedness) is driven by near-work and lack of outdoor time — not blue light specifically. Outdoor light appears protective against myopia progression." },
]

const SCREEN_SETUP = [
  { item: "Distance", ideal: "Arm's length away (50–70 cm / 20–28 inches). Laptop screens often too close — use an external monitor or stand." },
  { item: "Height", ideal: "Top of screen at or slightly below eye level. Looking slightly down is natural. Phone use requires chin-down posture — raises neck strain risk." },
  { item: "Brightness", ideal: "Match screen brightness to ambient room lighting. If your screen looks like a light source in the room, it's too bright. Auto-brightness helps." },
  { item: "Contrast & text size", ideal: "High contrast (dark text on light background or vice versa). Use larger text rather than squinting — squinting causes muscle tension." },
  { item: "Room lighting", ideal: "Avoid bright lights directly behind or reflected on the screen. Side lighting is better than overhead. Matte screen filters reduce glare." },
  { item: "Blink reminders", ideal: "Set a reminder to blink fully every few minutes. Use lubricating eye drops if working in dry environments or on air-conditioned spaces." },
]

const EYE_EXAMS_BY_AGE = [
  { age: "0–5", rec: "Eye exam at 6 months, 3 years, and before starting school. Amblyopia (lazy eye) and strabismus are only treatable early. Many are missed because children don't know what normal vision looks like." },
  { age: "6–18", rec: "Annual exam during school years — vision changes rapidly. Undetected myopia is a top cause of academic underperformance. If your child holds books close, squints at the board, or gets headaches: get tested." },
  { age: "18–39", rec: "Every 2 years if no symptoms or risk factors. Annually if wearing glasses/contacts, diabetic, family history of glaucoma, or any vision changes." },
  { age: "40–64", rec: "Every 1–2 years. Presbyopia (difficulty with close focus) typically starts at 40–45. Glaucoma risk rises. Annual exams if diabetic or family history of eye disease." },
  { age: "65+", rec: "Annually. Glaucoma, cataracts, macular degeneration, and diabetic retinopathy all increase with age. Early detection is everything — most are manageable if caught early." },
]

const MYOPIA = [
  { point: "Scale of the problem", detail: "Myopia rates have roughly doubled in the past 30 years. In some East Asian countries, 80–90% of young adults are myopic. In Canada and the US, roughly 40% of adults — up from 25% in the 1970s. The change is too fast to be genetic." },
  { point: "The real cause: near work + no outdoor time", detail: "The leading theory: eyes grow too long when spending excessive time doing close-focus tasks without enough bright outdoor light. Outdoor light (bright, full-spectrum) appears to stimulate dopamine release in the retina, which regulates eye growth. Even 60–90 minutes outdoors daily is significantly protective." },
  { point: "Screen time as a proxy", detail: "Screen time itself may not be the direct cause — it's what replaces outdoor time. Studies show children in East Asia who spend the same hours outdoors as Western children have similar myopia rates. The intervention that works: time outside, not less screen time per se." },
  { point: "What parents can do now", detail: "Aim for 60–90 minutes of outdoor time daily for children. Even cloudy outdoor light is far brighter than indoor light. Orthokeratology (overnight contact lenses), atropine eye drops, and special myopia-control lenses have evidence for slowing progression — ask an optometrist." },
]

export default function EyeHealthPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Eye Health & Screen Protection</h1>
        </div>
        <p className="text-sm text-muted-foreground">Separating screen myths from real risks, the 20-20-20 rule, optimal screen setup, and the myopia epidemic in children.</p>
      </div>

      <Card className="border-2 border-sky-200 bg-sky-50/40">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-sky-900">The 20-20-20 Rule</p>
          <p className="text-sm text-sky-700 mt-1">Every <strong>20 minutes</strong>, look at something <strong>20 feet away</strong> for <strong>20 seconds</strong>. This relaxes the ciliary muscles that control lens focus. Set a timer. It dramatically reduces digital eye strain — the most common screen-related eye complaint.</p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="h-4 w-4 text-sky-600" />
          <p className="text-sm font-semibold">Blue Light: Facts vs. Myths</p>
        </div>
        <div className="space-y-2">
          {BLUE_LIGHT.map((item, i) => {
            const key = `blue-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-2 text-left">
                      <Badge className={cn("text-xs shrink-0", item.verdict === "MYTH" ? "bg-red-100 text-red-800" : item.verdict === "FACT" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{item.verdict}</Badge>
                      <span className="text-sm">{item.claim}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{item.detail}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold">Optimal Screen Setup</p>
        </div>
        <div className="space-y-2">
          {SCREEN_SETUP.map((item, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="secondary" className="text-xs h-fit mt-0.5 shrink-0">{item.item}</Badge>
              <p className="text-sm text-muted-foreground">{item.ideal}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold">Eye Exams by Age</p>
        </div>
        <div className="space-y-2">
          {EYE_EXAMS_BY_AGE.map((item, i) => {
            const key = `exam-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3">
                    <span className="text-sm font-semibold">Ages {item.age}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{item.rec}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">The Myopia Epidemic in Children</p>
          <Badge className="bg-amber-100 text-amber-800 text-xs">Urgent</Badge>
        </div>
        <div className="space-y-2">
          {MYOPIA.map((item, i) => {
            const key = `myopia-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border border-amber-100">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3">
                    <span className="text-sm font-semibold">{item.point}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{item.detail}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/screen-time" className="hover:underline text-foreground">Screen Time</a>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
        <a href="/parenting" className="hover:underline text-foreground">Parenting</a>
        <a href="/dental-health" className="hover:underline text-foreground">Dental Health</a>
      </div>
    </div>
  )
}
