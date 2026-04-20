"use client"

import { useState } from "react"
import { Home, DollarSign, ChevronDown, AlertTriangle, CheckCircle, ArrowRight, Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    step: 1,
    title: "Know Your Numbers (Before Looking at Houses)",
    items: [
      "Calculate max affordable price: your gross household income × 4 = MAX price. Banks will approve more (5-6x) — DO NOT use the maximum. Over-extending is the #1 cause of mortgage stress.",
      "Down payment: 5% minimum (under $500K), 10% for $500K-$999K portion, 20% for $1M+. Under 20% requires CMHC mortgage insurance (adds 2.8-4% to your mortgage).",
      "FHSA: if you haven't opened one, do it NOW. $8K/year, $40K lifetime — tax-deductible contributions AND tax-free withdrawal for a home purchase.",
      "Home Buyers' Plan (HBP): withdraw up to $60K per person ($120K per couple) from your RRSP tax-free for a first home. Repay over 15 years.",
      "Check your credit score: free at Borrowell or Credit Karma. Above 680 = good rates. Below 620 = difficulty getting approved.",
    ],
  },
  {
    step: 2,
    title: "Get Pre-Approved (Not Pre-Qualified)",
    items: [
      "Pre-APPROVAL (bank reviews your finances and commits to a rate) is different from pre-QUALIFICATION (estimate, not binding). Get pre-approved.",
      "Get pre-approved at YOUR BANK first. Then check a mortgage broker — they shop 30+ lenders and often find rates 0.1-0.3% lower.",
      "Lock in the rate for 90-120 days. If rates drop, most lenders will give you the lower rate. If rates rise, you're protected.",
      "Do NOT change jobs, take on new debt, or open new credit cards between pre-approval and closing. Any change can kill the approval.",
    ],
  },
  {
    step: 3,
    title: "The True Cost of Owning (Not Just the Price)",
    items: [
      "Mortgage payment: use the financial calculator. At 5%, $500K mortgage over 25 years = $2,908/month.",
      "Property tax: 0.5-1.5% of assessed value per year. $500K home = $2,500-$7,500/year ($200-$625/month).",
      "Home insurance: $100-$250/month depending on location, coverage, and home age.",
      "Maintenance: budget 1% of home value per year ($500K = $5,000/year = $417/month). This is not optional — homes degrade.",
      "Utilities: $250-$500/month (heat, electricity, water, internet) — significantly more than most apartments.",
      "Closing costs: 1.5-4% of purchase price. On a $500K home: $7,500-$20,000 (land transfer tax, legal fees, inspection, appraisal, title insurance, moving).",
      "TOTAL TRUE COST: for a $500K home at 5%, expect $4,000-$4,500/month ALL IN — not just the $2,908 mortgage payment.",
    ],
  },
  {
    step: 4,
    title: "What to Look For (and What to Avoid)",
    items: [
      "ALWAYS get a home inspection ($400-$600). Never waive it, even in a competitive market. Inspection catches $10K-$100K problems before you own them.",
      "Foundation: cracks, water stains in basement, bowing walls = expensive. Walk away or negotiate $20K+ off price.",
      "Roof: ask the age. A 20-year-old roof needs replacement ($8K-$15K) within 1-5 years. Factor this into your offer.",
      "Electrical panel: if it's still a fuse box (not breakers) or knob-and-tube wiring, budget $5K-$15K for upgrade. Insurance may require it.",
      "Location > everything: you can renovate a house but you can't move it. Check: commute time, school quality, neighborhood safety, future development plans, flood risk.",
      "Avoid buying the most expensive house on the street (your appreciation is limited by cheaper neighbors). Buy the cheapest house on a nice street.",
    ],
  },
  {
    step: 5,
    title: "Negotiate the Purchase",
    items: [
      "Your first offer should be 5-10% below asking (in a balanced market). In a buyer's market: 10-15% below. In a seller's market: at or slightly above asking.",
      "NEVER reveal your maximum budget to the agent — they work for the seller (even 'your' buyer's agent is paid by the seller's commission).",
      "Conditions to include: financing (5-7 days), home inspection (7-10 days), insurance approval. Never go unconditional unless you truly cannot lose.",
      "Negotiate repairs based on inspection findings. Seller can fix them, credit you, or reduce the price. If they refuse major issues, walk away.",
      "Closing date: 30-90 days is typical. Longer favors the buyer (more time to arrange everything). Shorter favors the seller (they get money faster).",
    ],
  },
  {
    step: 6,
    title: "After You Buy",
    items: [
      "Change the locks immediately. Previous owners (and their realtors, contractors, etc.) may have keys.",
      "Set up automatic mortgage payments — never miss one. Even one missed payment hurts your credit for 6+ years.",
      "Start a home maintenance fund (1% of home value/year). Use the home maintenance schedule on this platform.",
      "Do NOT over-renovate in the first year. Live in the house for 6-12 months to understand what actually needs changing vs what you assumed.",
      "Apply for the homeowner's amount on your tax return ($10,000 credit = ~$1,500 tax savings for first-time buyers).",
    ],
  },
]

export default function HomeBuyingPage() {
  const [homePrice, setHomePrice] = useState(500000)
  const [downPayment, setDownPayment] = useState(50000)
  const [rate, setRate] = useState(5.0)
  const [amort, setAmort] = useState(25)

  const mortgage = homePrice - downPayment
  const downPct = homePrice > 0 ? Math.round((downPayment / homePrice) * 100) : 0
  const needsInsurance = downPct < 20
  const insurancePct = downPct < 10 ? 4.0 : downPct < 15 ? 2.8 : downPct < 20 ? 2.4 : 0
  const insuredMortgage = mortgage * (1 + insurancePct / 100)
  const monthlyRate = rate / 100 / 12
  const payments = amort * 12
  const monthlyPayment = insuredMortgage * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1)
  const totalPaid = monthlyPayment * payments
  const totalInterest = totalPaid - insuredMortgage

  const propertyTax = Math.round(homePrice * 0.01 / 12)
  const insurance = 150
  const maintenance = Math.round(homePrice * 0.01 / 12)
  const utilities = 350
  const trueMonthly = Math.round(monthlyPayment) + propertyTax + insurance + maintenance + utilities

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Home Buying Guide (Canada)</h1>
        </div>
        <p className="text-sm text-muted-foreground">Step by step: from saving to keys in hand. The stuff nobody tells you.</p>
      </div>

      {/* Quick calculator */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-500" /> Mortgage Calculator
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Home price</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={homePrice || ""} onChange={e => setHomePrice(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Down payment</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={downPayment || ""} onChange={e => setDownPayment(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Interest rate %</label>
            <Input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value) || 0)} /></div>
            <div><label className="text-xs text-muted-foreground">Amortization (years)</label>
            <Input type="number" value={amort} onChange={e => setAmort(Number(e.target.value) || 0)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">${Math.round(monthlyPayment).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Mortgage/mo</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">${trueMonthly.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">TRUE cost/mo</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">${Math.round(totalInterest).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total interest</p>
            </div>
          </div>
          {needsInsurance && (
            <p className="text-[10px] text-amber-600">
              ⚠️ Down payment is {downPct}% — <Explain tip="If your down payment is less than 20%, you must buy CMHC mortgage insurance. This protects the BANK (not you) if you default. It adds 2.4-4% to your mortgage amount. On a $450K mortgage, that is $10,800-$18,000 added to your debt">CMHC insurance</Explain> adds ${Math.round(insuredMortgage - mortgage).toLocaleString()} to your mortgage ({insurancePct}%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">{s.step}</div>
                <p className="text-sm font-semibold">{s.title}</p>
              </div>
              <ul className="space-y-1.5 pl-11">
                {s.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <ArrowRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The honest truth:</strong> Buying a home is the right move ONLY if: you plan to stay 5+ years (closing costs
            eat your equity otherwise), the true monthly cost is under 30% of your gross income, and you have 3 months of
            expenses saved AFTER the down payment. If any of these are not true, renting is not "throwing money away" —
            it is the financially responsible choice. Use the <a href="/canada/compare" className="text-violet-600 hover:underline">Provincial Comparison</a> to
            find where your money goes furthest.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada/housing" className="text-sm text-red-600 hover:underline">Housing Crisis</a>
        <a href="/canada/tax-optimization" className="text-sm text-emerald-600 hover:underline">FHSA Guide</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/home-maintenance" className="text-sm text-amber-600 hover:underline">Home Maintenance</a>
      </div>
    </div>
  )
}
