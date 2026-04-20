"use client"

import { useState } from "react"
import { Car, DollarSign, AlertTriangle, ArrowRight, ChevronDown, Calculator, Clock, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function CarBuyingPage() {
  const [carPrice, setCarPrice] = useState(35000)
  const [downPayment, setDownPayment] = useState(5000)
  const [rate, setRate] = useState(6.5)
  const [termMonths, setTermMonths] = useState(60)
  const [hourlyRate, setHourlyRate] = useState(25)

  const financed = carPrice - downPayment
  const monthlyRate = rate / 100 / 12
  const monthly = monthlyRate > 0
    ? financed * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
    : financed / termMonths
  const totalPaid = Math.round(monthly * termMonths) + downPayment
  const totalInterest = totalPaid - carPrice

  // True cost of ownership per year
  const insurance = 200 // /month avg
  const gas = 200
  const maintenance = 100
  const depreciation = Math.round(carPrice * 0.15) // ~15%/year first 5 years
  const annualCost = Math.round(monthly * 12) + (insurance + gas + maintenance) * 12 + depreciation
  const lifeHours = hourlyRate > 0 ? Math.round(annualCost / hourlyRate) : 0

  const NEW_VS_USED = [
    { factor: "Depreciation", new: "Loses 20-35% in first 2 years", used: "Someone else already paid the depreciation. A 3-year-old car costs 40% less but has 85% of its life left.", winner: "used" },
    { factor: "Interest rate", new: "0-3% promotional rates from manufacturers", used: "4-8% typical (higher risk for lender)", winner: "new" },
    { factor: "Warranty", new: "Full manufacturer warranty (3-5 years)", used: "May have remaining warranty. Extended warranties available but often overpriced.", winner: "new" },
    { factor: "Insurance", new: "Higher — more expensive to replace", used: "Lower — less to insure", winner: "used" },
    { factor: "Reliability", new: "Unpredictable (new model issues)", used: "Proven — known problems are documented online. Check carcomplaints.com", winner: "tie" },
    { factor: "True 5-year cost", new: "$45K car: $28K in payments + $15K depreciation + $30K operating = $73K", used: "$25K car: $18K in payments + $5K depreciation + $28K operating = $51K", winner: "used" },
  ]

  const NEGOTIATION = [
    "NEVER tell the dealer your monthly payment target — they will stretch the loan term to make any price 'fit.' Negotiate the TOTAL price only.",
    "Research invoice price before going: Unhaggle.ca (Canada) or CarCostCanada.com. This is what the dealer paid. Offer invoice + $500-$1,000.",
    "Get pre-approved financing from your bank or credit union BEFORE going to the dealer. This gives you a rate to beat. Dealer financing is often 1-3% higher.",
    "NEVER buy on the first visit. Say 'I need to think about it.' The follow-up call will often include a better offer.",
    "End of month, end of quarter (March, June, Sept, Dec), and end of model year (Sept-Nov) are the best times — dealers need to hit targets.",
    "On trade-in: get an independent appraisal FIRST (Canadian Black Book, CarGurus). Negotiate car price and trade-in SEPARATELY — never let them combine.",
    "Extended warranties are almost never worth it. The dealer makes 50-60% margin. If you want peace of mind, buy a 3-year-old certified pre-owned instead.",
    "The 'documentation fee' ($300-$700) is pure profit. Negotiate it down or out. It costs them $50 to process paperwork.",
  ]

  const RULES = [
    { rule: "The 20/4/10 Rule", explanation: "20% down payment, 4-year (48 month) maximum loan term, 10% or less of gross monthly income on total car costs (payment + insurance + gas). If a car doesn't fit this rule, you can't afford it.", icon: "📏" },
    { rule: "Never Finance for 7+ Years", explanation: "84-month loans make expensive cars 'affordable' by stretching payments. But you pay thousands more in interest AND the car depreciates faster than you pay it off. You end up owing more than the car is worth (underwater).", icon: "⏰" },
    { rule: "Buy 2-3 Years Old", explanation: "A car loses 20-35% of its value in the first 2 years. Buying a 2-3 year old version of the same car saves $8,000-$20,000 while still getting a nearly-new vehicle with most of its warranty remaining.", icon: "🎯" },
    { rule: "Total Cost, Not Monthly Payment", explanation: "A $400/month payment over 84 months = $33,600. A $500/month payment over 48 months = $24,000. The 'cheaper' monthly payment costs $9,600 MORE. Always calculate total cost.", icon: "💰" },
    { rule: "Keep It 10 Years", explanation: "The cheapest car is the one you already own. Maintenance on a paid-off car ($200/month) is always cheaper than a new car payment ($500+/month). Drive it until it costs more to fix than it's worth.", icon: "🔧" },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-blue-700">
            <Car className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Car Buying Guide (Canada)</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The real cost of a car, how to negotiate, and the rules that save thousands.
        </p>
      </div>

      {/* Calculator */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-500" /> True Cost Calculator
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Car price</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={carPrice || ""} onChange={e => setCarPrice(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Down payment</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={downPayment || ""} onChange={e => setDownPayment(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Interest rate %</label>
            <Input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value) || 0)} /></div>
            <div><label className="text-xs text-muted-foreground">Loan term (months)</label>
            <div className="flex gap-1">
              {[36, 48, 60, 72, 84].map(t => (
                <button key={t} onClick={() => setTermMonths(t)}
                  className={cn("text-xs rounded px-2 py-1 border", termMonths === t ? "border-blue-400 bg-blue-50 font-bold" : "border-border")}>{t}</button>
              ))}
            </div></div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="text-center"><p className="text-lg font-bold text-blue-600">${Math.round(monthly).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Monthly payment</p></div>
            <div className="text-center"><p className="text-lg font-bold text-red-500">${totalInterest.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Total interest</p></div>
            <div className="text-center"><p className="text-lg font-bold text-amber-600">${totalPaid.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Total you pay</p></div>
            <div className="text-center"><p className="text-lg font-bold text-slate-600">${annualCost.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">True annual cost</p></div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Your hourly rate: $</span>
            <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value) || 0)} className="w-16 h-7 text-xs" />
            <span className="text-xs text-red-500 font-medium">= {lifeHours} hours/year of your life just for this car</span>
          </div>
        </CardContent>
      </Card>

      {/* 5 rules */}
      <div>
        <h2 className="text-lg font-bold mb-3">5 Rules That Save Thousands</h2>
        <div className="space-y-2">
          {RULES.map((r, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-start gap-3">
                <span className="text-lg shrink-0">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{r.rule}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.explanation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New vs used */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">New vs Used — The Honest Comparison</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {NEW_VS_USED.map((n, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <p className="text-xs font-semibold mb-1">{n.factor}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className={cn(n.winner === "new" ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                  <strong>New:</strong> {n.new}
                </div>
                <div className={cn(n.winner === "used" ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                  <strong>Used:</strong> {n.used}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Negotiation tips */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">How to Negotiate (Word for Word)</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {NEGOTIATION.map((n, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span><span>{n}</span>
            </p>
          ))}
          <p className="text-xs text-muted-foreground italic mt-2">
            For the full word-for-word negotiation script, see the <a href="/negotiation" className="text-violet-600 hover:underline">Negotiation Scripts</a> page.
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The bottom line:</strong> A car is the 2nd largest purchase most people make — and the one they
            lose the most money on. A $45K new car financed for 84 months at 7% costs you <strong>$57,000+</strong> by
            the time you are done paying, and is worth <strong>$15,000</strong>. The same model 3 years old costs $28K,
            financed for 48 months costs <strong>$32,000</strong> total, and is worth <strong>$12,000</strong> when paid off.
            The used buyer saves <strong>$25,000+</strong> and drives essentially the same car. Think in total cost, not monthly payments.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/real-hourly-rate" className="text-sm text-amber-600 hover:underline">Real Hourly Rate</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/negotiation" className="text-sm text-teal-600 hover:underline">Negotiation Scripts</a>
        <a href="/debt-payoff" className="text-sm text-red-600 hover:underline">Debt Payoff</a>
      </div>
    </div>
  )
}
