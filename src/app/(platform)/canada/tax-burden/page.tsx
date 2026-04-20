"use client"

import { useState } from "react"
import { Calculator, DollarSign, AlertTriangle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// Ontario as default — most common
function calcFederalTax(income: number): number {
  const brackets = [
    { max: 55867, rate: 0.15 }, { max: 111733, rate: 0.205 },
    { max: 154906, rate: 0.26 }, { max: 220000, rate: 0.29 },
    { max: Infinity, rate: 0.33 },
  ]
  let tax = 0, remaining = income
  for (const b of brackets) {
    if (remaining <= 0) break
    const prev = brackets.indexOf(b) > 0 ? brackets[brackets.indexOf(b) - 1].max : 0
    const taxable = Math.min(remaining, b.max - prev)
    tax += taxable * b.rate
    remaining -= taxable
  }
  // Basic personal amount deduction
  return Math.max(0, tax - 15705 * 0.15)
}

function calcOntarioTax(income: number): number {
  const brackets = [
    { max: 51446, rate: 0.0505 }, { max: 102894, rate: 0.0915 },
    { max: 150000, rate: 0.1116 }, { max: 220000, rate: 0.1216 },
    { max: Infinity, rate: 0.1316 },
  ]
  let tax = 0, remaining = income
  for (const b of brackets) {
    if (remaining <= 0) break
    const prev = brackets.indexOf(b) > 0 ? brackets[brackets.indexOf(b) - 1].max : 0
    const taxable = Math.min(remaining, b.max - prev)
    tax += taxable * b.rate
    remaining -= taxable
  }
  return Math.max(0, tax - 11141 * 0.0505)
}

export default function CanadaTaxBurdenPage() {
  const [income, setIncome] = useState(80000)
  const [spending, setSpending] = useState(4000) // monthly spending for consumption tax calc
  const [homeValue, setHomeValue] = useState(500000)
  const [gasMonthly, setGasMonthly] = useState(200)

  // Income taxes
  const federalTax = calcFederalTax(income)
  const provincialTax = calcOntarioTax(income)
  const incomeTax = federalTax + provincialTax

  // Payroll taxes
  const cpp = Math.min(income * 0.0595, 3867)
  const ei = Math.min(income * 0.0166, 1049)
  const payrollTax = cpp + ei

  // Consumption taxes (HST on spending)
  const annualSpending = spending * 12
  // Roughly 60% of spending is HST-taxable (food basics are exempt)
  const hstTaxable = annualSpending * 0.6
  const hst = hstTaxable * 0.13

  // Property tax (Ontario average ~1.1% of assessed value)
  const propertyTax = homeValue * 0.011

  // Gas tax (federal excise + carbon levy + provincial)
  // ~$0.40/litre in combined taxes (federal excise + carbon + provincial + HST on gas)
  const annualGas = gasMonthly * 12
  const gasTaxRate = 0.35 // approx portion that is tax on a $1.70/L price
  const gasTax = annualGas * gasTaxRate

  // Carbon tax (included in gas but also on natural gas heating)
  // Average household: ~$600-$1000/year in direct carbon costs (net of rebate)
  const carbonGross = 900
  const carbonRebate = income < 60000 ? 700 : income < 100000 ? 600 : 400
  const carbonNet = Math.max(0, carbonGross - carbonRebate)

  // Alcohol & tobacco excise (average Canadian: ~$500/year if moderate drinker)
  const alcoholExcise = 400

  // Hidden taxes: regulatory costs embedded in prices
  // OECD estimates regulatory compliance adds 3-5% to consumer prices
  const regulatoryTax = annualSpending * 0.04

  // Telecom oligopoly premium (paying 2-3x global average = effective tax)
  const telecomPremium = 100 * 12 // ~$100/month more than competitive market price

  // Total
  const totalVisible = incomeTax + payrollTax + hst + propertyTax + gasTax + carbonNet + alcoholExcise
  const totalHidden = regulatoryTax + telecomPremium
  const totalAll = totalVisible + totalHidden

  const effectiveRate = income > 0 ? Math.round((totalVisible / income) * 1000) / 10 : 0
  const trueRate = income > 0 ? Math.round((totalAll / income) * 1000) / 10 : 0

  const afterTax = income - totalAll
  const monthsWorkedForGov = Math.round((totalAll / income) * 12 * 10) / 10
  const taxFreedomDay = (() => {
    const dayOfYear = Math.round((totalAll / income) * 365)
    const date = new Date(2024, 0, 1)
    date.setDate(date.getDate() + dayOfYear)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
  })()

  const items = [
    { label: "Federal income tax", amount: federalTax, pct: (federalTax / income * 100), color: "bg-red-400" },
    { label: "Provincial income tax (Ontario)", amount: provincialTax, pct: (provincialTax / income * 100), color: "bg-red-300" },
    { label: "CPP contributions", amount: cpp, pct: (cpp / income * 100), color: "bg-orange-400" },
    { label: "EI premiums", amount: ei, pct: (ei / income * 100), color: "bg-orange-300" },
    { label: "HST/GST on spending", amount: hst, pct: (hst / income * 100), color: "bg-amber-400" },
    { label: "Property tax", amount: propertyTax, pct: (propertyTax / income * 100), color: "bg-yellow-400" },
    { label: "Gas taxes & levies", amount: gasTax, pct: (gasTax / income * 100), color: "bg-lime-400" },
    { label: "Carbon tax (net of rebate)", amount: carbonNet, pct: (carbonNet / income * 100), color: "bg-green-400" },
    { label: "Alcohol & tobacco excise", amount: alcoholExcise, pct: (alcoholExcise / income * 100), color: "bg-teal-400" },
    { label: "Regulatory compliance costs", amount: regulatoryTax, pct: (regulatoryTax / income * 100), color: "bg-cyan-400" },
    { label: "Telecom oligopoly premium", amount: telecomPremium, pct: (telecomPremium / income * 100), color: "bg-blue-400" },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Real Tax Burden</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Income tax is just the beginning. Here is EVERYTHING the government takes — visible and hidden.
        </p>
      </div>

      {/* Inputs */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Gross annual income</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monthly spending (non-housing)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={spending || ""} onChange={e => setSpending(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Home value (for property tax)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={homeValue || ""} onChange={e => setHomeValue(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monthly gas spending</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={gasMonthly || ""} onChange={e => setGasMonthly(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-200 bg-red-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{trueRate}%</p>
            <p className="text-[10px] text-muted-foreground">True total tax rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-500">${Math.round(totalAll).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total paid/year</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">${Math.round(afterTax).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">What you keep</p>
          </CardContent>
        </Card>
      </div>

      {/* Key insights */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            You work <strong>{monthsWorkedForGov} months per year</strong> just to pay all forms of taxation.
            Your <Explain tip="The date in the year when you have finally earned enough to pay all your taxes. Everything you earn after this date is actually yours. In Canada, Tax Freedom Day typically falls in mid-June — meaning you work nearly half the year for the government">Tax Freedom Day</Explain> is approximately <strong>{taxFreedomDay}</strong>.
            Everything you earn before that date goes to some form of government revenue.
          </p>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Complete Breakdown</CardTitle></CardHeader>
        <CardContent>
          {/* Visual bar */}
          <div className="flex h-8 rounded-full overflow-hidden mb-3">
            {items.filter(i => i.amount > 0).map((item, idx) => (
              <div key={idx} className={cn("h-full", item.color)}
                style={{ width: `${(item.amount / totalAll) * 100}%` }}
                title={`${item.label}: $${Math.round(item.amount).toLocaleString()}`} />
            ))}
          </div>

          <div className="space-y-1.5">
            {items.filter(i => i.amount > 0).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.color)} />
                <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                <span className="text-xs font-medium">${Math.round(item.amount).toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground w-10 text-right">{item.pct.toFixed(1)}%</span>
              </div>
            ))}
            <div className="border-t border-border pt-1.5 mt-1.5 flex items-center gap-2">
              <span className="text-xs font-bold flex-1">TOTAL</span>
              <span className="text-xs font-bold text-red-600">${Math.round(totalAll).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-red-600 w-10 text-right">{trueRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What most people think vs reality */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">What You Think vs Reality</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Most people think they pay</p>
              <p className="text-2xl font-bold text-amber-600">{effectiveRate > 10 ? Math.round(effectiveRate * 0.7) : 15}%</p>
              <p className="text-[10px] text-muted-foreground">(just income tax marginal rate)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">They actually pay</p>
              <p className="text-2xl font-bold text-red-600">{trueRate}%</p>
              <p className="text-[10px] text-muted-foreground">(all taxes combined)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The difference is the taxes you never see: HST on everything you buy, property tax, gas taxes, payroll taxes,
            carbon levies, regulatory costs baked into prices, and the oligopoly premium you pay for telecom/banking/groceries
            because the government blocks competition. These invisible taxes often exceed your visible income tax.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> This calculator uses Ontario rates. Other provinces may differ (Alberta has no PST,
            Quebec has higher income tax + lower childcare costs). Regulatory cost and oligopoly premium estimates
            are based on OECD and Fraser Institute research — these are approximations, not exact figures.
            The point is not the precise number — it is that your real tax burden is significantly higher than your
            income tax rate suggests.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/tax-estimator" className="text-sm text-blue-600 hover:underline">Tax Estimator</a>
        <a href="/canada/tax-optimization" className="text-sm text-emerald-600 hover:underline">Tax Optimization</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/budget" className="text-sm text-violet-600 hover:underline">Budget Calculator</a>
      </div>
    </div>
  )
}
