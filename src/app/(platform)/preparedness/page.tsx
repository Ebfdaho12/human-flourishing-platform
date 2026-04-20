"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle, AlertTriangle, Droplets, Zap, Utensils, Wrench, Radio, Heart, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CheckItem {
  id: string
  text: string
  why: string
  done: boolean
}

const CATEGORIES: { name: string; icon: any; color: string; desc: string; items: { text: string; why: string }[] }[] = [
  {
    name: "Water",
    icon: Droplets,
    color: "from-blue-500 to-cyan-600",
    desc: "You can survive 3 weeks without food but only 3 days without water",
    items: [
      { text: "4 liters per person per day stored (minimum 3-day supply = 12L each)", why: "Municipal water can fail during floods, ice storms, or infrastructure failure. 3 days is the minimum; 2 weeks is recommended." },
      { text: "Water purification tablets or filter (LifeStraw, Sawyer, Berkey)", why: "If stored water runs out, you need a way to make any water safe. A $25 filter can save your family." },
      { text: "Know where your nearest natural water source is", why: "River, lake, stream — in a prolonged emergency, you need a refill plan." },
    ],
  },
  {
    name: "Food",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    desc: "Store what you eat, eat what you store — rotation is key",
    items: [
      { text: "3-day supply of non-perishable food per person", why: "Minimum for power outages and short emergencies. Canned goods, peanut butter, crackers, dried fruit." },
      { text: "2-week extended supply (rice, beans, oats, canned protein)", why: "Ice storms, supply chain disruptions, and pandemics can last weeks. Rice and beans are cheap and last years." },
      { text: "Manual can opener", why: "Electric ones do not work without power. This is the most commonly forgotten item." },
      { text: "Camp stove or way to cook without electricity", why: "A simple propane camp stove ($30) lets you boil water and cook when the power is out." },
      { text: "Baby food / formula / pet food if applicable", why: "Specialized needs are the first thing to disappear from shelves in emergencies." },
    ],
  },
  {
    name: "Power & Light",
    icon: Zap,
    color: "from-yellow-500 to-amber-600",
    desc: "When the grid goes down, prepared families stay warm and informed",
    items: [
      { text: "Flashlights + extra batteries (LED, long-lasting)", why: "Candles are a fire risk. LED flashlights last 50+ hours on a set of batteries." },
      { text: "Battery bank / portable charger for phones (20,000mAh+)", why: "Your phone is your communication, map, news, and flashlight. Keep it charged." },
      { text: "Battery-powered or hand-crank radio", why: "When internet and cell towers fail, AM/FM radio is how emergency information reaches you." },
      { text: "Generator or solar charger (if budget allows)", why: "Not essential but incredibly useful. Even a small solar panel can keep phones and radios charged indefinitely." },
      { text: "Extra blankets / sleeping bags (warmth without heat)", why: "In winter power outages, hypothermia is the biggest risk. Sleeping bags rated to -10C save lives." },
    ],
  },
  {
    name: "First Aid & Medicine",
    icon: Heart,
    color: "from-red-500 to-rose-600",
    desc: "When you cannot get to a hospital, basic supplies buy you time",
    items: [
      { text: "First aid kit (bandages, antiseptic, gauze, tape, scissors)", why: "Minor injuries become serious without basic wound care. A $30 kit handles most common injuries." },
      { text: "2-week supply of prescription medications", why: "Pharmacies close in emergencies. If you or your family depend on medication, always maintain a buffer." },
      { text: "Pain relievers, antihistamines, anti-diarrheal", why: "Over-the-counter medications for the most common emergency health issues." },
      { text: "Basic first aid knowledge (stop bleeding, CPR basics)", why: "A 30-minute YouTube video on basic first aid could save a life. Watch it with your family." },
    ],
  },
  {
    name: "Documents & Money",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    desc: "When systems fail, paper still works",
    items: [
      { text: "Copies of IDs, insurance, and important documents in waterproof bag", why: "If you need to evacuate, having these documents saves weeks of bureaucracy." },
      { text: "Cash in small bills ($200-$500)", why: "ATMs, debit, and credit cards do not work without power or internet. Cash is king in emergencies." },
      { text: "USB drive with digital copies of all important documents", why: "Encrypted backup of everything — insurance policies, medical records, birth certificates." },
      { text: "Emergency contact list printed on paper", why: "If your phone dies, do you know your family's phone numbers by memory? Write them down." },
    ],
  },
  {
    name: "Tools & Supplies",
    icon: Wrench,
    color: "from-emerald-500 to-teal-600",
    desc: "The basics that let you adapt when systems break",
    items: [
      { text: "Multi-tool or basic tool kit", why: "For improvised repairs, opening things, cutting, and general problem-solving." },
      { text: "Duct tape + zip ties + rope/paracord", why: "These three items can fix, build, or secure almost anything temporarily." },
      { text: "Garbage bags (heavy duty)", why: "Rain protection, waterproofing, sanitation, temporary shelter — surprisingly versatile." },
      { text: "Fire-starting method (matches, lighter, ferro rod)", why: "Warmth, cooking, water purification, signaling — fire is a force multiplier." },
      { text: "Whistle (for signaling)", why: "Your voice gives out after minutes of yelling. A whistle carries further and lasts indefinitely." },
    ],
  },
]

export default function PreparednessPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<number | null>(0)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-preparedness")
    if (stored) setChecklist(JSON.parse(stored))
  }, [])

  function toggleItem(categoryIdx: number, itemIdx: number) {
    const key = `${categoryIdx}-${itemIdx}`
    const updated = { ...checklist, [key]: !checklist[key] }
    setChecklist(updated)
    localStorage.setItem("hfp-preparedness", JSON.stringify(updated))
  }

  const totalItems = CATEGORIES.reduce((s, c) => s + c.items.length, 0)
  const checkedItems = Object.values(checklist).filter(Boolean).length
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-700">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Emergency Preparedness</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Not paranoia — responsibility. 72 hours of self-sufficiency is the difference between an inconvenience and a crisis.
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your readiness</span>
            <span className={cn("text-sm font-bold",
              pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500"
            )}>{pct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all",
              pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"
            )} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{checkedItems}/{totalItems} items ready</p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORIES.map((cat, catIdx) => {
          const Icon = cat.icon
          const isOpen = expanded === catIdx
          const catChecked = cat.items.filter((_, i) => checklist[`${catIdx}-${i}`]).length
          const catComplete = catChecked === cat.items.length
          return (
            <Card key={catIdx} className={cn(catComplete && "border-emerald-200")}>
              <div className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : catIdx)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", cat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{cat.name}</p>
                      {catComplete && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{catChecked}/{cat.items.length} ready</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CardContent>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground italic mb-3">{cat.desc}</p>
                  <div className="space-y-2">
                    {cat.items.map((item, itemIdx) => {
                      const key = `${catIdx}-${itemIdx}`
                      const checked = !!checklist[key]
                      return (
                        <div key={itemIdx}
                          className={cn("rounded-lg border p-3 cursor-pointer transition-all",
                            checked ? "border-emerald-200 bg-emerald-50/30 opacity-70" : "border-border hover:bg-muted/30"
                          )}
                          onClick={(e) => { e.stopPropagation(); toggleItem(catIdx, itemIdx) }}>
                          <div className="flex items-start gap-3">
                            {checked
                              ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                            }
                            <div>
                              <p className={cn("text-sm", checked && "line-through text-muted-foreground")}>{item.text}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{item.why}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why prepare?</strong> The Canadian Red Cross and FEMA both recommend every household be self-sufficient
            for a minimum of 72 hours. In reality, major events (ice storms, floods, pandemics, infrastructure failures)
            can last 1-2 weeks before help arrives or systems restore. The families who prepared did not panic.
            The families who did not were the ones in lines. Preparation is not about fear — it is about removing
            fear by being ready. Total cost of basic preparedness: $150-$300. That is insurance you can actually use.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/health" className="text-sm text-emerald-600 hover:underline">Health Dashboard</a>
        <a href="/resources" className="text-sm text-blue-600 hover:underline">Resources</a>
      </div>
    </div>
  )
}
