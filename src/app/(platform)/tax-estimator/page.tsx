"use client"

import { useState, useEffect, useMemo } from "react"
import { Calculator, DollarSign, ArrowRight, AlertTriangle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type BudgetData = { income?: number }

// 2024 Canadian Federal Tax Brackets
const CA_FEDERAL = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 154906, rate: 0.26 },
  { min: 154906, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
]

// Ontario Provincial (most common province for this user)
const CA_ONTARIO = [
  { min: 0, max: 51446, rate: 0.0505 },
  { min: 51446, max: 102894, rate: 0.0915 },
  { min: 102894, max: 150000, rate: 0.1116 },
  { min: 150000, max: 220000, rate: 0.1216 },
  { min: 220000, max: Infinity, rate: 0.1316 },
]

// 2024 US Federal Tax Brackets (Married Filing Jointly)
const US_MFJ = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
]

// US Single
const US_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
]

function calculateTax(income: number, brackets: typeof CA_FEDERAL): { total: number; effective: number; marginal: number; breakdown: { bracket: string; tax: number }[] } {
  let remaining = income
  let total = 0
  const breakdown: { bracket: string; tax: number }[] = []

  for (const b of brackets) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, b.max - b.min)
    const tax = taxable * b.rate
    total += tax
    breakdown.push({
      bracket: `${(b.rate * 100).toFixed(1)}% on $${b.min.toLocaleString()} – $${b.max === Infinity ? "∞" : b.max.toLocaleString()}`,
      tax: Math.round(tax),
    })
    remaining -= taxable
  }

  const effective = income > 0 ? (total / income) * 100 : 0
  const marginalBracket = brackets.find(b => income >= b.min && income < b.max) || brackets[brackets.length - 1]

  return { total: Math.round(total), effective: Math.round(effective * 10) / 10, marginal: marginalBracket.rate * 100, breakdown }
}

// Canada Child Benefit estimate (simplified)
function estimateCCB(familyIncome: number, children: number): number {
  if (children === 0) return 0
  const basePerChild = 7437 // max per child under 6 (2024)
  const reduction = Math.max(0, familyIncome - 34863) * 0.07
  return Math.max(0, (basePerChild * children) - reduction)
}

export default function TaxEstimatorPage() {
  const [budget] = useSyncedStorage<BudgetData>("hfp-budget", {})
  const autoIncome = useMemo(() => {
    const monthly = budget?.income ?? 0
    return monthly > 0 ? Math.round(monthly * 12) : null
  }, [budget])

  const [country, setCountry] = useState<"canada" | "us">("canada")
  const [income, setIncome] = useState(80000)
  const [income2, setIncome2] = useState(0)
  const [filing, setFiling] = useState<"single" | "married">("married")
  const [children, setChildren] = useState(1)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) return
    if (autoIncome) setIncome(autoIncome)
    setHydrated(true)
  }, [autoIncome, hydrated])

  // Canada calculations
  const caFederal = calculateTax(income, CA_FEDERAL)
  const caProvincial = calculateTax(income, CA_ONTARIO)
  const caTotalTax = caFederal.total + caProvincial.total
  const caEffective = income > 0 ? Math.round((caTotalTax / income) * 1000) / 10 : 0
  const caTakeHome = income - caTotalTax
  const caCPP = Math.min(income * 0.0595, 3867) // CPP max
  const caEI = Math.min(income * 0.0166, 1049) // EI max
  const caNetTakeHome = caTakeHome - caCPP - caEI

  // Dual income Canada
  const ca2Federal = calculateTax(income2, CA_FEDERAL)
  const ca2Provincial = calculateTax(income2, CA_ONTARIO)
  const ca2TotalTax = ca2Federal.total + ca2Provincial.total
  const ca2CPP = Math.min(income2 * 0.0595, 3867)
  const ca2EI = Math.min(income2 * 0.0166, 1049)
  const ca2NetTakeHome = income2 - ca2TotalTax - ca2CPP - ca2EI

  // CCB
  const ccbSingle = estimateCCB(income, children)
  const ccbDual = estimateCCB(income + income2, children)
  const ccbDifference = ccbSingle - ccbDual

  // US calculations
  const usBrackets = filing === "married" ? US_MFJ : US_SINGLE
  const usFederal = calculateTax(income, usBrackets)
  const usFICA = Math.min(income, 168600) * 0.0765 // SS + Medicare
  const usTotalTax = usFederal.total + Math.round(usFICA)
  const usEffective = income > 0 ? Math.round((usTotalTax / income) * 1000) / 10 : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Tax Estimator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          See your real tax rate — <Explain tip="Your effective tax rate is the ACTUAL percentage of your total income that goes to taxes. It is always lower than your marginal rate because only income ABOVE each threshold is taxed at the higher rate">effective</Explain> vs <Explain tip="The tax rate on your LAST dollar earned — the highest bracket your income falls into. If you earn $100K, only the dollars ABOVE the bracket threshold are taxed at this rate, not all of them">marginal</Explain>. Compare single vs dual income. See the real math.
        </p>
      </div>

      {autoIncome && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-900">
              Income <span className="font-semibold tabular-nums">${autoIncome.toLocaleString()}</span> auto-filled from your budget (monthly × 12). Override below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Country selector */}
      <div className="flex gap-3">
        <button onClick={() => setCountry("canada")}
          className={cn("rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all",
            country === "canada" ? "border-red-400 bg-red-50/30" : "border-border"
          )}>Canada (Ontario)</button>
        <button onClick={() => setCountry("us")}
          className={cn("rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all",
            country === "us" ? "border-blue-400 bg-blue-50/30" : "border-border"
          )}>United States</button>
      </div>

      {/* Income inputs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Primary income (gross/year)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="pl-7" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Second income (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input type="number" value={income2 || ""} onChange={e => setIncome2(Number(e.target.value) || 0)} className="pl-7" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Filing status</label>
              <div className="flex gap-2 mt-1">
                {(["single", "married"] as const).map(f => (
                  <button key={f} onClick={() => setFiling(f)}
                    className={cn("rounded-lg border px-3 py-1.5 text-xs capitalize transition-all",
                      filing === f ? "border-blue-400 bg-blue-50 font-semibold" : "border-border"
                    )}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Children</label>
              <Input type="number" min={0} max={10} value={children} onChange={e => setChildren(Number(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {country === "canada" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-red-500">${caTotalTax.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total tax</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{caEffective}%</p>
              <p className="text-xs text-muted-foreground">Effective rate</p>
            </CardContent></Card>
            <Card className="border-emerald-200"><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">${caNetTakeHome.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Take home</p>
            </CardContent></Card>
          </div>

          {/* Bracket breakdown */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Federal Tax Brackets</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {caFederal.breakdown.filter(b => b.tax > 0).map((b, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{b.bracket}</span>
                  <span className="font-medium">${b.tax.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1">
                <p className="text-xs text-muted-foreground">+ Ontario provincial: ${caProvincial.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">+ CPP: ${Math.round(caCPP).toLocaleString()} | EI: ${Math.round(caEI).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Single vs Dual income comparison */}
          {income2 > 0 && (
            <Card className="border-2 border-violet-200 bg-violet-50/20">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-3">Single vs Dual Income Tax Comparison</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-muted-foreground mb-1">Single Income (${income.toLocaleString()})</p>
                    <p>Tax: <strong>${caTotalTax.toLocaleString()}</strong></p>
                    <p>CPP+EI: <strong>${Math.round(caCPP + caEI).toLocaleString()}</strong></p>
                    <p>Take home: <strong className="text-emerald-600">${caNetTakeHome.toLocaleString()}</strong></p>
                    {children > 0 && <p>CCB: <strong className="text-emerald-600">+${ccbSingle.toLocaleString()}/yr</strong></p>}
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground mb-1">Dual (${income.toLocaleString()} + ${income2.toLocaleString()})</p>
                    <p>Tax: <strong>${(caTotalTax + ca2TotalTax).toLocaleString()}</strong></p>
                    <p>CPP+EI: <strong>${Math.round(caCPP + caEI + ca2CPP + ca2EI).toLocaleString()}</strong></p>
                    <p>Take home: <strong className="text-emerald-600">${(caNetTakeHome + ca2NetTakeHome).toLocaleString()}</strong></p>
                    {children > 0 && <p>CCB: <strong className="text-emerald-600">+${ccbDual.toLocaleString()}/yr</strong></p>}
                  </div>
                </div>
                {children > 0 && ccbDifference > 0 && (
                  <div className="mt-3 rounded-lg bg-violet-100/50 p-2.5">
                    <p className="text-xs text-violet-800">
                      <strong>CCB impact:</strong> Dropping to single income increases your Canada Child Benefit by
                      <strong> ${ccbDifference.toLocaleString()}/year</strong> (${Math.round(ccbDifference / 12).toLocaleString()}/month).
                      This partially offsets the lost second income.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* US Results */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-red-500">${usTotalTax.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Federal + FICA</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{usEffective}%</p>
              <p className="text-xs text-muted-foreground">Effective rate</p>
            </CardContent></Card>
            <Card className="border-emerald-200"><CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">${(income - usTotalTax).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Take home (before state)</p>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Federal Brackets ({filing === "married" ? "Married Filing Jointly" : "Single"})</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {usFederal.breakdown.filter(b => b.tax > 0).map((b, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{b.bracket}</span>
                  <span className="font-medium">${b.tax.toLocaleString()}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground border-t pt-1 mt-1">
                + FICA (Social Security + Medicare): ${Math.round(usFICA).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground italic">Note: state taxes not included — varies by state (0% in TX, FL, WA vs 13%+ in CA, NY).</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The most important tax concept:</strong> Your <Explain tip="The percentage applied to your LAST dollar earned, not your entire income. If you are in the 26% bracket, only the income ABOVE that bracket's threshold is taxed at 26%. The rest is taxed at lower rates below">marginal rate</Explain> is NOT what you pay on all your income —
            it is only what you pay on your LAST dollar. Someone in the 33% bracket does not pay 33% on everything.
            They pay 15% on the first ~$56K, 20.5% on the next ~$56K, and so on. This is why your{" "}
            <Explain tip="Your effective rate = total tax paid ÷ total income. It is always lower than your marginal rate because your income is taxed in layers, with each layer at a progressively higher rate">effective rate</Explain>{" "}
            is always lower than your marginal rate. Understanding this prevents the #1 tax myth: &quot;If I earn more, I will
            take home less because I will be in a higher bracket.&quot; That is never true.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
