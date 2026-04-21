"use client"

import { useState } from "react"
import { Shield, AlertTriangle, Droplets, DollarSign, Heart, Zap, CloudRain, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const KIT_ITEMS = [
  { cat: "Water", items: "1 gallon per person per day. Minimum 3 days = 3 gallons each. Store in cool, dark place. Replace every 6 months." },
  { cat: "Food", items: "Non-perishable, no-cook: canned goods (with manual opener), protein bars, peanut butter, dried fruit, crackers, trail mix. 3-day supply per person." },
  { cat: "First Aid", items: "Bandages, gauze, adhesive tape, antiseptic wipes, antibiotic ointment, pain relievers (ibuprofen + acetaminophen), tweezers, scissors, nitrile gloves, CPR mask." },
  { cat: "Light & Power", items: "Flashlight + extra batteries (LED lasts longer). Portable phone charger (fully charged). Battery-powered or hand-crank radio." },
  { cat: "Cash", items: "$200-500 in small bills ($1s, $5s, $10s, $20s). ATMs do not work in power outages. Card readers fail. Cash is king in emergencies." },
  { cat: "Documents", items: "Copies of IDs, insurance cards, medical info in a waterproof bag. Not originals — copies. Keep originals in a fireproof safe or safety deposit box." },
  { cat: "Medications", items: "7-day supply of all prescriptions. Rotate stock so nothing expires. Include any OTC meds you rely on (allergy, acid reflux, etc)." },
  { cat: "Clothing & Gear", items: "Warm layers, rain gear, sturdy closed-toe shoes. Whistle, multi-tool, duct tape, garbage bags, zip ties." },
]

const MEDICAL = [
  { name: "CPR Basics", desc: "Check responsiveness. Call 911. Compress: push hard and fast in center of chest, 100-120 compressions per minute, 2 inches deep. Don't stop until help arrives.", color: "text-red-600" },
  { name: "Choking", desc: "Adults: Heimlich maneuver — stand behind, fist above navel, thrust upward. Infants: 5 back blows (between shoulder blades) then 5 chest thrusts. Never do abdominal thrusts on infants.", color: "text-red-600" },
  { name: "Severe Bleeding", desc: "Apply direct pressure with clean cloth. Elevate above heart if possible. If bleeding won't stop after 10 minutes of pressure, apply tourniquet 2-3 inches above wound as last resort.", color: "text-red-600" },
  { name: "Burns", desc: "Cool water for 10-20 minutes. NOT ice — ice causes further tissue damage. Do not pop blisters. Cover loosely with sterile bandage. Seek medical care for burns larger than your palm.", color: "text-orange-600" },
  { name: "When to Call 911 vs. Urgent Care vs. ER", desc: "911: chest pain, difficulty breathing, uncontrolled bleeding, loss of consciousness, stroke signs (FAST). ER: broken bones, deep cuts, severe pain. Urgent care: minor injuries, infections, sprains.", color: "text-amber-600" },
  { name: "ICE Contacts", desc: "Add ICE (In Case of Emergency) contacts to your phone. First responders check for these. Include name, relationship, phone number, and any critical medical info.", color: "text-blue-600" },
]

const DISASTERS = [
  { name: "Earthquake", steps: "DROP to hands and knees. Take COVER under sturdy furniture. HOLD ON until shaking stops. After: check for gas leaks (smell), water main, structural damage. Do not use elevators." },
  { name: "Flood", steps: "Move to high ground immediately. Never drive through standing water — 6 inches can knock you down, 12 inches can carry a car. Turn off utilities if safe. Do not walk through moving water." },
  { name: "Winter Storm", steps: "Stay inside. Drip faucets to prevent pipe freeze. If pipes freeze, open cabinet doors and use hair dryer (never open flame). Car kit: blankets, sand/kitty litter, jumper cables, food/water." },
  { name: "Fire", steps: "Have 2 evacuation routes from every room. Go-bag by the door. Close doors behind you (slows fire spread). Meeting point outside. Never go back in. Important documents in fireproof bag." },
  { name: "Tornado", steps: "Interior room, lowest floor, away from windows. Bathroom or closet ideal (small rooms with pipes are structurally stronger). Cover yourself with mattress or thick blankets. Mobile homes: leave and find sturdy shelter." },
]

const DOCUMENTS = [
  "IDs: passport, driver's license, Social Security card (copies)",
  "Insurance policies: health, auto, home/renter's, life, disability",
  "Property documents: deed, lease agreement, vehicle titles",
  "Financial accounts: bank, investment, retirement account numbers",
  "Medical records: conditions, allergies, medications, blood type, doctor contacts",
  "Will, power of attorney, healthcare directive, beneficiary designations",
  "Contact list: family, friends, doctors, lawyers, insurance agents (printed, not just in phone)",
  "Digital: password manager master password (stored securely), 2FA backup codes, encrypted backup location",
]

export default function EmergencyPrepPage() {
  const [expanded, setExpanded] = useState<string | null>("kit")

  const toggle = (key: string) => setExpanded(expanded === key ? null : key)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Emergency Preparedness</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Not doomsday prepping. Practical preparation for the emergencies that <strong>actually happen</strong>: power outages, job loss, medical emergencies, natural disasters, financial crises.
        </p>
        <p className="text-sm text-muted-foreground italic mt-1">The best time to prepare is before you need to.</p>
      </div>

      {/* 72-Hour Kit */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("kit")} className="flex items-center gap-2 w-full text-left">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm flex-1">72-Hour Emergency Kit</CardTitle>
            <Badge variant="outline" className="text-[8px] border-red-300 text-red-700 mr-2">Priority #1</Badge>
            {expanded === "kit" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "kit" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {KIT_ITEMS.map((item, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <span className="text-xs font-semibold text-red-700">{item.cat}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.items}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Financial Emergency */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("financial")} className="flex items-center gap-2 w-full text-left">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm flex-1">Financial Emergency</CardTitle>
            <Badge variant="outline" className="text-[8px] border-emerald-300 text-emerald-700 mr-2">Security</Badge>
            {expanded === "financial" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "financial" && (
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="rounded-lg border p-2.5">
              <span className="text-xs font-semibold text-emerald-700">Emergency Fund</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">3-6 months of essential expenses in a <Explain tip="A high-yield savings account earns 4-5% APY vs 0.01% at traditional banks. Your emergency fund should be liquid (accessible in 1-2 days) but not in your checking account where you might spend it.">high-yield savings account</Explain>. This is not optional — it is the single most important financial safety net.</p>
              <a href="/emergency-fund" className="text-[9px] text-emerald-600 hover:underline">Build your emergency fund →</a>
            </div>
            <div className="rounded-lg border p-2.5">
              <span className="text-xs font-semibold text-emerald-700">Where to Cut First</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Subscriptions (audit monthly), dining out, impulse purchases. These three categories typically account for 20-30% of discretionary spending.</p>
            </div>
            <div className="rounded-lg border p-2.5">
              <span className="text-xs font-semibold text-emerald-700">Insurance Review</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Health, auto, home/renter's, disability insurance. Review annually. Disability is the most overlooked — you are far more likely to become disabled than to die young.</p>
            </div>
            <div className="rounded-lg border p-2.5">
              <span className="text-xs font-semibold text-emerald-700">Document Organization</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Will, power of attorney, beneficiaries, account access for a trusted person. If you were incapacitated tomorrow, could someone manage your finances?</p>
            </div>
            <div className="rounded-lg border p-2.5">
              <span className="text-xs font-semibold text-emerald-700">Credit Line of Last Resort</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">HELOC (home equity line of credit), not credit cards. Credit card interest (20-30%) will deepen the crisis. A HELOC (8-10%) is cheaper. Only use as absolute last resort after emergency fund.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Medical Emergency */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("medical")} className="flex items-center gap-2 w-full text-left">
            <Heart className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm flex-1">Medical Emergency</CardTitle>
            <Badge variant="outline" className="text-[8px] border-red-300 text-red-700 mr-2">Life-Saving</Badge>
            {expanded === "medical" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "medical" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {MEDICAL.map((m, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <span className={cn("text-xs font-semibold", m.color)}>{m.name}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            ))}
            <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-2.5">
              <p className="text-[10px] text-muted-foreground"><strong className="text-blue-800">Medical info card:</strong> Keep in your wallet — blood type, allergies, current medications, conditions, emergency contacts. First responders look for this.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Power Outage */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("power")} className="flex items-center gap-2 w-full text-left">
            <Zap className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm flex-1">Power Outage</CardTitle>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700 mr-2">Common</Badge>
            {expanded === "power" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "power" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {[
              "Keep phone charged and a portable charger ready at all times",
              "Flashlights in accessible locations (not buried in a closet) — one per room ideally",
              "Keep freezer closed: food stays safe 48 hours if full, 24 hours if half-full",
              "Generator safety: NEVER run indoors or in garage — carbon monoxide kills silently",
              "Manual can opener (electric ones are useless without power)",
            ].map((item, i) => (
              <div key={i} className="rounded-lg border p-2.5 flex items-start gap-2">
                <Zap className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Natural Disaster */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("disaster")} className="flex items-center gap-2 w-full text-left">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm flex-1">Natural Disaster (by type)</CardTitle>
            <Badge variant="outline" className="text-[8px] border-blue-300 text-blue-700 mr-2">Regional</Badge>
            {expanded === "disaster" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "disaster" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {DISASTERS.map((d, i) => (
              <div key={i} className="rounded-lg border p-2.5">
                <span className="text-xs font-semibold text-blue-700">{d.name}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.steps}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Document Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <button onClick={() => toggle("docs")} className="flex items-center gap-2 w-full text-left">
            <FileText className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-sm flex-1">Document Checklist</CardTitle>
            <Badge variant="outline" className="text-[8px] border-violet-300 text-violet-700 mr-2">Organize Now</Badge>
            {expanded === "docs" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {expanded === "docs" && (
          <CardContent className="p-4 pt-0 space-y-2">
            {DOCUMENTS.map((doc, i) => (
              <div key={i} className="rounded-lg border p-2.5 flex items-start gap-2">
                <FileText className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">{doc}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Connections */}
      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-red-900 mb-2">Connected Systems</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Emergency preparedness connects to everything. Your <Explain tip="An emergency fund is 3-6 months of expenses in liquid savings — it transforms a job loss from a crisis into an inconvenience">emergency fund</Explain> is your financial buffer. Your insurance coverage determines whether a disaster is recoverable. Your <Explain tip="Digital legacy planning ensures someone can access your accounts, passwords, and digital assets if you are incapacitated or deceased">digital legacy plan</Explain> ensures access to critical accounts. Estate planning protects your family if the worst happens.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 flex-wrap">
        <a href="/emergency-fund" className="text-sm text-emerald-600 hover:underline">Emergency Fund</a>
        <a href="/insurance" className="text-sm text-blue-600 hover:underline">Insurance Guide</a>
        <a href="/budget" className="text-sm text-amber-600 hover:underline">Financial Dashboard</a>
        <a href="/digital-legacy" className="text-sm text-violet-600 hover:underline">Digital Legacy</a>
        <a href="/estate-planning" className="text-sm text-rose-600 hover:underline">Estate Planning</a>
      </div>
    </div>
  )
}