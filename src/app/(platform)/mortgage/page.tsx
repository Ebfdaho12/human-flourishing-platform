"use client"

import { useState, useEffect, useMemo } from "react"
import { Home, DollarSign, TrendingUp, AlertTriangle, ArrowRight, Scale, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type BudgetData = { income?: number; expenses?: { category: string; amount: number }[] }
type NetWorthData = { assets?: { name?: string; type?: string; category?: string; value: number }[]; liabilities?: { name?: string; value: number }[] }

function calcMortgage(principal: number, rateAnnual: number, years: number) {
  const r = rateAnnual / 100 / 12
  const n = years * 12
  if (r === 0) return { monthly: principal / n, totalPaid: principal, totalInterest: 0 }
  const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPaid = monthly * n
  return { monthly: Math.round(monthly), totalPaid: Math.round(totalPaid), totalInterest: Math.round(totalPaid - principal) }
}

export default function MortgagePage() {
  const [netWorth] = useSyncedStorage<NetWorthData>("hfp-net-worth", {})
  const [budget] = useSyncedStorage<BudgetData>("hfp-budget", {})

  const auto = useMemo(() => {
    const mortgageLiab = (netWorth?.liabilities ?? []).find(l => /mortgage|home loan/i.test(l.name ?? ""))?.value ?? 0
    const housing = (budget?.expenses ?? []).find(e => /mortgage|housing|rent/i.test(e.category))?.amount ?? 0
    return {
      principal: mortgageLiab > 0 ? Math.round(mortgageLiab) : null,
      monthlyCurrent: housing > 0 ? Math.round(housing) : null,
    }
  }, [netWorth, budget])

  const [principal, setPrincipal] = useState(500000)
  const [fixedRate, setFixedRate] = useState(4.99)
  const [variableRate, setVariableRate] = useState(5.45)
  const [amort25, setAmort25] = useState(true)
  const [creditUnionRate, setCreditUnionRate] = useState(4.79)
  const [brokerRate, setBrokerRate] = useState(4.69)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) return
    if (auto.principal) setPrincipal(auto.principal)
    setHydrated(true)
  }, [auto, hydrated])

  const amortYears = amort25 ? 25 : 30

  const fixed = calcMortgage(principal, fixedRate, amortYears)
  const variable = calcMortgage(principal, variableRate, amortYears)
  const creditUnion = calcMortgage(principal, creditUnionRate, amortYears)
  const broker = calcMortgage(principal, brokerRate, amortYears)

  // Accelerated biweekly calculation
  const biweeklyPayment = Math.round(fixed.monthly / 2)
  const biweeklyAnnual = biweeklyPayment * 26 // 26 biweekly = 13 months of payments
  const normalAnnual = fixed.monthly * 12
  const extraAnnual = biweeklyAnnual - normalAnnual
  // Rough estimate: accelerated biweekly saves ~3-4 years on 25yr mortgage
  const biweeklySavedYears = amortYears === 25 ? 3.5 : 4.5
  const biweeklySavedInterest = Math.round(fixed.totalInterest * (biweeklySavedYears / amortYears) * 0.8)

  // Lump sum impact
  const lumpSum = 10000
  const lumpSumSaved = Math.round(lumpSum * (fixedRate / 100) * (amortYears * 0.6)) // rough estimate of interest saved

  const scenarios = [
    { label: `Big Bank Fixed (${fixedRate}%)`, ...fixed, rate: fixedRate, color: "text-red-500" },
    { label: `Big Bank Variable (${variableRate}%)`, ...variable, rate: variableRate, color: "text-amber-600" },
    { label: `Credit Union (${creditUnionRate}%)`, ...creditUnion, rate: creditUnionRate, color: "text-blue-600" },
    { label: `Mortgage Broker (${brokerRate}%)`, ...broker, rate: brokerRate, color: "text-emerald-600" },
  ].sort((a, b) => a.monthly - b.monthly)

  const cheapest = scenarios[0]
  const mostExpensive = scenarios[scenarios.length - 1]
  const monthlySavings = mostExpensive.monthly - cheapest.monthly
  const totalSavings = mostExpensive.totalPaid - cheapest.totalPaid

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Mortgage Comparison</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fixed vs variable. Big bank vs credit union vs broker. See the TOTAL cost — not just the monthly payment.
        </p>
      </div>

      {(auto.principal || auto.monthlyCurrent) && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900">
              {auto.principal && <span>Mortgage balance <span className="font-semibold tabular-nums">${auto.principal.toLocaleString()}</span> pulled from your net worth liabilities.</span>}
              {auto.monthlyCurrent && <span> Current payment <span className="font-semibold tabular-nums">${auto.monthlyCurrent.toLocaleString()}/mo</span> from budget — compare against scenarios below.</span>}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Inputs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Mortgage amount</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={principal || ""} onChange={e => setPrincipal(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amortization</label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setAmort25(true)} className={cn("rounded-lg border px-3 py-1.5 text-xs", amort25 ? "border-blue-400 bg-blue-50 font-semibold" : "border-border")}>25 years</button>
                <button onClick={() => setAmort25(false)} className={cn("rounded-lg border px-3 py-1.5 text-xs", !amort25 ? "border-blue-400 bg-blue-50 font-semibold" : "border-border")}>30 years</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Big Bank Fixed %</label>
            <Input type="number" step="0.01" value={fixedRate} onChange={e => setFixedRate(Number(e.target.value) || 0)} className="text-xs h-8" /></div>
            <div><label className="text-[10px] text-muted-foreground">Big Bank Variable %</label>
            <Input type="number" step="0.01" value={variableRate} onChange={e => setVariableRate(Number(e.target.value) || 0)} className="text-xs h-8" /></div>
            <div><label className="text-[10px] text-muted-foreground">Credit Union %</label>
            <Input type="number" step="0.01" value={creditUnionRate} onChange={e => setCreditUnionRate(Number(e.target.value) || 0)} className="text-xs h-8" /></div>
            <div><label className="text-[10px] text-muted-foreground">Broker Best %</label>
            <Input type="number" step="0.01" value={brokerRate} onChange={e => setBrokerRate(Number(e.target.value) || 0)} className="text-xs h-8" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="space-y-2">
        {scenarios.map((s, i) => (
          <Card key={i} className={cn(i === 0 ? "border-2 border-emerald-300 bg-emerald-50/10" : "")}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.label}</p>
                  {i === 0 && <Badge className="text-[9px] bg-emerald-500 text-white">Best Rate</Badge>}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                  <span>Total paid: ${s.totalPaid.toLocaleString()}</span>
                  <span className="text-red-500">Interest: ${s.totalInterest.toLocaleString()}</span>
                </div>
              </div>
              <p className={cn("text-xl font-bold", i === 0 ? "text-emerald-600" : s.color)}>
                ${s.monthly.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Savings */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm leading-relaxed">
            Shopping around saves <strong>${monthlySavings.toLocaleString()}/month</strong> (${(monthlySavings * 12).toLocaleString()}/year).
            Over {amortYears} years, the cheapest option saves <strong>${totalSavings.toLocaleString()}</strong> in total interest
            vs the most expensive. That difference — from a single phone call to a mortgage broker — is a used car, a year of education, or 5 years of family vacations.
          </p>
        </CardContent>
      </Card>

      {/* Money-saving strategies */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">3 Strategies That Save Tens of Thousands</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-1">1. <Explain tip="Instead of monthly payments, pay half your monthly amount every two weeks. Because there are 26 biweekly periods (not 24), you make one extra monthly payment per year — without feeling it">Accelerated Biweekly Payments</Explain></p>
            <p className="text-xs text-muted-foreground">Pay ${biweeklyPayment.toLocaleString()} every 2 weeks instead of ${fixed.monthly.toLocaleString()}/month.
            Saves ~<strong>${biweeklySavedInterest.toLocaleString()}</strong> in interest and pays off ~<strong>{biweeklySavedYears} years early</strong>. Costs you only ${Math.round(extraAnnual).toLocaleString()} extra/year.</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-1">2. Annual Lump Sum Payments</p>
            <p className="text-xs text-muted-foreground">Most mortgages allow 10-20% lump sum annually. A single ${lumpSum.toLocaleString()} lump sum
            saves approximately <strong>${lumpSumSaved.toLocaleString()}</strong> in interest over the life of the mortgage — because every dollar of
            principal paid early stops earning interest for the bank for {amortYears} years.</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-1">3. Shop at Renewal (Don't Just Sign)</p>
            <p className="text-xs text-muted-foreground">Your bank sends a renewal letter with a rate. <strong>DO NOT just sign it.</strong> Get quotes from 2-3 other lenders
            and a mortgage broker. The renewal offer is almost never the best rate. A 0.2% difference on a $500K mortgage = $1,000+/year.
            The stress test makes switching harder — but a broker can navigate this for free (they are paid by the lender).</p>
          </div>
        </CardContent>
      </Card>

      {/* Fixed vs Variable explainer */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fixed vs Variable — Which to Choose?</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5">
            <p><strong>Fixed rate:</strong> Same payment for the entire term (usually 5 years). You know exactly what you pay. Best when: you value certainty, rates are low and likely to rise, or your budget is tight with no room for payment increases.</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
            <p><strong>Variable rate:</strong> Rate moves with the Bank of Canada rate. Historically saves money over fixed ~60% of the time. Best when: you can handle payment fluctuations (±$200-$400/month), rates are high and likely to drop, or you plan to sell/refinance before term ends.</p>
          </div>
          <p className="italic">Historically, variable saves money more often than not. But the peace of mind of fixed has real value — especially for families on tight budgets. There is no wrong answer as long as you can afford the payment at the HIGHER of the two rates.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> Rates shown are examples — check current posted and discounted rates at your bank, credit union,
            and a mortgage broker (try nesto, Breezeful, or a local broker — they shop 30+ lenders for free).
            This calculator shows principal + interest only — total housing cost includes property tax, insurance,
            maintenance, and utilities. See the <a href="/home-buying" className="text-violet-600 hover:underline">Home Buying Guide</a> for the full picture.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/home-buying" className="text-sm text-blue-600 hover:underline">Home Buying Guide</a>
        <a href="/canada/housing" className="text-sm text-red-600 hover:underline">Housing Crisis</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/canada/tax-optimization" className="text-sm text-violet-600 hover:underline">FHSA Guide</a>
      </div>
    </div>
  )
}
