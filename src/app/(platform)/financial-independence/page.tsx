"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Clock, Brain, Target, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

export default function FinancialIndependencePage() {
  const [savings, setSavings] = useState(50000)
  const [monthlySavings, setMonthlySavings] = useState(1500)
  const [returnRate, setReturnRate] = useState(7)
  const [monthlyExpenses, setMonthlyExpenses] = useState(3500)

  const annualExpenses = monthlyExpenses * 12
  const fiNumber = annualExpenses * 25
  const monthlyRate = returnRate / 100 / 12

  // Calculate years to FI
  let balance = savings
  let yearsToFI = 0
  const milestones: { year: number; balance: number }[] = []
  for (let m = 1; m <= 600; m++) {
    balance = balance * (1 + monthlyRate) + monthlySavings
    if (m % 12 === 0) {
      milestones.push({ year: m / 12, balance: Math.round(balance) })
      if (balance >= fiNumber && yearsToFI === 0) yearsToFI = m / 12
    }
  }
  if (yearsToFI === 0) yearsToFI = 50

  // Scenario comparisons
  const calcYears = (s: number, ms: number, r: number, me: number) => {
    const target = me * 12 * 25; let b = s; const mr = r / 100 / 12
    for (let m = 1; m <= 600; m++) { b = b * (1 + mr) + ms; if (b >= target) return m / 12 }
    return 50
  }
  const scenarioMore = calcYears(savings, monthlySavings + 200, returnRate, monthlyExpenses)
  const scenarioLess = calcYears(savings, monthlySavings, returnRate, monthlyExpenses - 500)
  const scenarioReturn = calcYears(savings, monthlySavings, returnRate + 1, monthlyExpenses)

  const maxBal = milestones.length > 0 ? Math.max(...milestones.map(m => m.balance), fiNumber) : fiNumber
  const displayMilestones = milestones.filter(m => m.year <= Math.min(yearsToFI + 5, 50) && m.year % 5 === 0)

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Financial Independence Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          FI isn't about quitting your job. It's about reaching the point where work becomes a choice, not a requirement.
        </p>
      </div>

      {/* The Math */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Core Math</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong><Explain tip="If you withdraw 4% of your portfolio each year, historically it lasts 30+ years. Based on the Trinity Study (1998) analyzing market data from 1926-1995.">The 4% Rule</Explain>:</strong> You can safely withdraw 4% of your portfolio per year without running out of money (historically, over 30-year periods).</p>
            <p><strong><Explain tip="If you need $40K/year, you need $40K x 25 = $1M invested. Because 4% of $1M is $40K.">The 25x Rule</Explain>:</strong> Your FI number = annual expenses x 25. That's the inverse of 4%.</p>
            <p><strong>Your FI number: <span className="text-emerald-700 font-bold">{fmt(fiNumber)}</span></strong> ({fmt(annualExpenses)}/yr x 25)</p>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Inputs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" /> Your Numbers</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Current Savings ($)</label>
            <Input type="number" value={savings} onChange={e => setSavings(+e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Monthly Savings ($)</label>
            <Input type="number" value={monthlySavings} onChange={e => setMonthlySavings(+e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Expected Return (%)</label>
            <Input type="number" value={returnRate} step={0.5} onChange={e => setReturnRate(+e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Monthly Expenses ($)</label>
            <Input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(+e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="border-2 border-emerald-400 bg-emerald-50/30">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Years to Financial Independence</p>
          <p className="text-4xl font-bold text-emerald-700">{yearsToFI < 50 ? `${yearsToFI.toFixed(1)}` : "50+"}</p>
          <p className="text-xs text-muted-foreground mt-1">Target: {fmt(fiNumber)} at {returnRate}% avg return</p>
        </CardContent>
      </Card>

      {/* Milestone Projection */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" /> Net Worth Projection</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {displayMilestones.map(m => (
            <div key={m.year} className="flex items-center gap-3">
              <span className="text-xs font-mono w-14 text-muted-foreground">Year {m.year}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                <div className={cn("h-full rounded-full transition-all", m.balance >= fiNumber ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${Math.min((m.balance / maxBal) * 100, 100)}%` }} />
                {/* FI line */}
                <div className="absolute top-0 h-full border-r-2 border-dashed border-emerald-600" style={{ left: `${(fiNumber / maxBal) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold w-16 text-right">{fmt(m.balance)}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-right">Dashed line = FI target ({fmt(fiNumber)})</p>
        </CardContent>
      </Card>

      {/* What Changes Your Timeline */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> What Changes Your Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "+$200/mo savings", years: scenarioMore, color: "text-blue-700 bg-blue-50 border-blue-200" },
            { label: "-$500/mo expenses", years: scenarioLess, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "+1% return rate", years: scenarioReturn, color: "text-violet-700 bg-violet-50 border-violet-200" },
          ].map(s => {
            const diff = yearsToFI - s.years
            return (
              <div key={s.label} className={cn("rounded-lg border p-3 flex items-center justify-between", s.color.split(" ").slice(1).join(" "))}>
                <span className={cn("text-sm font-semibold", s.color.split(" ")[0])}>{s.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold">{s.years < 50 ? `${s.years.toFixed(1)} yrs` : "50+"}</span>
                  {diff > 0 && <Badge variant="outline" className="ml-2 text-[9px] border-emerald-300 text-emerald-700">-{diff.toFixed(1)} yrs</Badge>}
                </div>
              </div>
            )
          })}
          <p className="text-[10px] text-muted-foreground">Notice: cutting expenses is doubly powerful — it lowers your FI number AND frees up more to invest.</p>
        </CardContent>
      </Card>

      {/* Psychology */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-rose-500" /> The Psychology</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong><Explain tip="No matter how much more money you make, you quickly get used to it and feel the same — so you keep wanting more">Hedonic treadmill</Explain>:</strong> Research shows income above ~$75-100K (depending on location) has diminishing returns on happiness. The treadmill makes you spend every raise, keeping you on the hamster wheel.</p>
          <p><strong>Lifestyle inflation</strong> is the silent killer of financial independence. You get a 20% raise and expenses rise 25%. The gap between income and spending is the ONLY number that determines when you reach FI.</p>
          <p><strong>Enough-ness:</strong> The most powerful financial skill isn't earning more — it's knowing what "enough" looks like for you. Without a defined "enough," no amount of money will feel like freedom.</p>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>FI isn't about retirement.</strong> Most people who reach financial independence keep working — they just work on what matters to them instead of what pays the bills. The point isn't to stop contributing. It's to contribute from a position of freedom rather than desperation. When you don't NEED the paycheck, every "yes" becomes genuine and every "no" becomes possible.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/compound-interest" className="text-sm text-blue-600 hover:underline">Compound Interest</a>
        <a href="/budget" className="text-sm text-teal-600 hover:underline">Budget</a>
        <a href="/dopamine" className="text-sm text-amber-600 hover:underline">Dopamine & Spending</a>
        <a href="/career-path" className="text-sm text-violet-600 hover:underline">Career Path</a>
        <a href="/accountability" className="text-sm text-rose-600 hover:underline">Accountability</a>
      </div>
    </div>
  )
}
