"use client"

import { useState, useEffect } from "react"
import { Calculator, DollarSign, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface BudgetLine {
  id: string
  label: string
  amount: number
  category: string
}

const INCOME_TEMPLATES: { label: string; placeholder: string }[] = [
  { label: "Primary salary (after tax)", placeholder: "e.g. 4200" },
  { label: "Second income (after tax)", placeholder: "e.g. 2800" },
  { label: "Side income / freelance", placeholder: "e.g. 500" },
  { label: "Child benefits (CCB, etc.)", placeholder: "e.g. 600" },
  { label: "Other income", placeholder: "e.g. 200" },
]

const EXPENSE_CATEGORIES: { category: string; color: string; items: { label: string; placeholder: string }[] }[] = [
  {
    category: "Housing",
    color: "bg-blue-500",
    items: [
      { label: "Rent / Mortgage", placeholder: "e.g. 1800" },
      { label: "Property tax", placeholder: "e.g. 250" },
      { label: "Home insurance", placeholder: "e.g. 100" },
      { label: "Maintenance / repairs", placeholder: "e.g. 100" },
    ],
  },
  {
    category: "Transport",
    color: "bg-violet-500",
    items: [
      { label: "Car payment", placeholder: "e.g. 450" },
      { label: "Car insurance", placeholder: "e.g. 180" },
      { label: "Gas / fuel", placeholder: "e.g. 200" },
      { label: "Maintenance / parking", placeholder: "e.g. 80" },
      { label: "Second vehicle (total)", placeholder: "e.g. 600" },
      { label: "Public transit", placeholder: "e.g. 0" },
    ],
  },
  {
    category: "Food",
    color: "bg-emerald-500",
    items: [
      { label: "Groceries", placeholder: "e.g. 800" },
      { label: "Eating out / takeout", placeholder: "e.g. 300" },
      { label: "Coffee / drinks", placeholder: "e.g. 80" },
    ],
  },
  {
    category: "Childcare & Kids",
    color: "bg-rose-500",
    items: [
      { label: "Daycare / before-after school", placeholder: "e.g. 1500" },
      { label: "Kids activities / sports", placeholder: "e.g. 150" },
      { label: "Kids clothing / supplies", placeholder: "e.g. 100" },
    ],
  },
  {
    category: "Utilities & Bills",
    color: "bg-cyan-500",
    items: [
      { label: "Electricity", placeholder: "e.g. 120" },
      { label: "Gas / heating", placeholder: "e.g. 80" },
      { label: "Water", placeholder: "e.g. 50" },
      { label: "Internet", placeholder: "e.g. 80" },
      { label: "Cell phones", placeholder: "e.g. 120" },
    ],
  },
  {
    category: "Insurance & Health",
    color: "bg-amber-500",
    items: [
      { label: "Health / dental insurance", placeholder: "e.g. 200" },
      { label: "Life insurance", placeholder: "e.g. 50" },
      { label: "Prescriptions / medical", placeholder: "e.g. 40" },
    ],
  },
  {
    category: "Debt Payments",
    color: "bg-red-500",
    items: [
      { label: "Credit cards", placeholder: "e.g. 200" },
      { label: "Student loans", placeholder: "e.g. 300" },
      { label: "Personal loans / LOC", placeholder: "e.g. 150" },
    ],
  },
  {
    category: "Lifestyle & Subscriptions",
    color: "bg-pink-500",
    items: [
      { label: "Streaming (Netflix, etc.)", placeholder: "e.g. 40" },
      { label: "Gym / fitness", placeholder: "e.g. 50" },
      { label: "Clothing (adults)", placeholder: "e.g. 100" },
      { label: "Personal care / haircuts", placeholder: "e.g. 60" },
      { label: "Entertainment / hobbies", placeholder: "e.g. 100" },
      { label: "Other subscriptions", placeholder: "e.g. 30" },
    ],
  },
  {
    category: "Work-Related Costs",
    color: "bg-slate-500",
    items: [
      { label: "Work lunches / coffee", placeholder: "e.g. 150" },
      { label: "Work clothes / dry cleaning", placeholder: "e.g. 50" },
      { label: "Commute (tolls, parking)", placeholder: "e.g. 100" },
      { label: "Convenience spending (because no time)", placeholder: "e.g. 200" },
    ],
  },
]

export default function BudgetPage() {
  const [incomes, setIncomes] = useState<number[]>(new Array(INCOME_TEMPLATES.length).fill(0))
  const [expenses, setExpenses] = useState<number[][]>(
    EXPENSE_CATEGORIES.map(cat => new Array(cat.items.length).fill(0))
  )
  const [showSingleIncome, setShowSingleIncome] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-budget")
    if (stored) {
      const data = JSON.parse(stored)
      if (data.incomes) setIncomes(data.incomes)
      if (data.expenses) setExpenses(data.expenses)
    }
  }, [])

  function save(inc: number[], exp: number[][]) {
    setIncomes(inc)
    setExpenses(exp)
    localStorage.setItem("hfp-budget", JSON.stringify({ incomes: inc, expenses: exp }))
  }

  function updateIncome(i: number, val: string) {
    const updated = [...incomes]
    updated[i] = Number(val) || 0
    save(updated, expenses)
  }

  function updateExpense(catIdx: number, itemIdx: number, val: string) {
    const updated = expenses.map(e => [...e])
    updated[catIdx][itemIdx] = Number(val) || 0
    save(incomes, updated)
  }

  const totalIncome = incomes.reduce((s, v) => s + v, 0)
  const categoryTotals = EXPENSE_CATEGORIES.map((cat, i) => ({
    ...cat,
    total: expenses[i].reduce((s, v) => s + v, 0),
  }))
  const totalExpenses = categoryTotals.reduce((s, c) => s + c.total, 0)
  const surplus = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((surplus / totalIncome) * 100) : 0

  // Single income simulation
  const secondIncome = incomes[1] || 0
  const childcareCost = expenses[3]?.[0] || 0 // daycare
  const workCosts = expenses[8]?.reduce((s, v) => s + v, 0) || 0 // work-related
  const secondVehicle = expenses[1]?.[4] || 0 // second vehicle
  const eatingOutSavings = Math.round((expenses[2]?.[1] || 0) * 0.6) // 60% less eating out
  const singleIncomeTotal = totalIncome - secondIncome
  const singleIncomeExpenses = totalExpenses - childcareCost - workCosts - secondVehicle - eatingOutSavings
  const singleIncomeSurplus = singleIncomeTotal - singleIncomeExpenses

  // CCB increase estimate (rough: lower income = higher CCB)
  const ccbIncrease = secondIncome > 30000 ? Math.round(secondIncome * 0.07) : secondIncome > 20000 ? Math.round(secondIncome * 0.05) : 0
  const adjustedSingleSurplus = singleIncomeSurplus + Math.round(ccbIncrease / 12)

  // 50/30/20 rule comparison
  const needsPct = totalIncome > 0 ? Math.round(((categoryTotals[0].total + categoryTotals[1].total + categoryTotals[4].total + categoryTotals[5].total + categoryTotals[3].total) / totalIncome) * 100) : 0
  const wantsPct = totalIncome > 0 ? Math.round(((categoryTotals[7].total + categoryTotals[2].total - (expenses[2]?.[0] || 0)) / totalIncome) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Budget Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">Enter your real numbers. See where every dollar goes. Find the gaps.</p>
      </div>

      {/* Summary bar */}
      {totalIncome > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">${totalIncome.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly income</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly expenses</p>
            </CardContent>
          </Card>
          <Card className={cn(surplus >= 0 ? "border-emerald-200" : "border-red-200")}>
            <CardContent className="p-3 text-center">
              <p className={cn("text-lg font-bold", surplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{surplus >= 0 ? "Surplus" : "Deficit"} ({savingsRate}%)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Monthly Income (after tax)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INCOME_TEMPLATES.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground w-48 shrink-0">{item.label}</label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={incomes[i] || ""}
                  onChange={e => updateIncome(i, e.target.value)}
                  placeholder={item.placeholder}
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Expenses by category */}
      {EXPENSE_CATEGORIES.map((cat, catIdx) => (
        <Card key={cat.category}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", cat.color)} />
                {cat.category}
              </CardTitle>
              {categoryTotals[catIdx].total > 0 && (
                <Badge variant="outline" className="text-xs">${categoryTotals[catIdx].total.toLocaleString()}/mo</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {cat.items.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-48 shrink-0">{item.label}</label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={expenses[catIdx][itemIdx] || ""}
                    onChange={e => updateExpense(catIdx, itemIdx, e.target.value)}
                    placeholder={item.placeholder}
                    className="pl-7 h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Spending breakdown visual */}
      {totalExpenses > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where Your Money Goes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-6 rounded-full overflow-hidden mb-3">
              {categoryTotals.filter(c => c.total > 0).map((cat, i) => (
                <div key={i} className={cn("h-full", cat.color)}
                  style={{ width: `${(cat.total / totalExpenses) * 100}%` }}
                  title={`${cat.category}: $${cat.total.toLocaleString()} (${Math.round((cat.total / totalExpenses) * 100)}%)`} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryTotals.filter(c => c.total > 0).sort((a, b) => b.total - a.total).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", cat.color)} />
                  <span className="text-xs text-muted-foreground flex-1">{cat.category}</span>
                  <span className="text-xs font-medium">${cat.total.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground">({Math.round((cat.total / totalExpenses) * 100)}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 50/30/20 check */}
      {totalIncome > 0 && totalExpenses > 0 && (
        <Card className={cn("border-2", savingsRate >= 20 ? "border-emerald-200 bg-emerald-50/20" : savingsRate >= 10 ? "border-amber-200 bg-amber-50/20" : "border-red-200 bg-red-50/20")}>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2"><Explain tip="A simple budgeting guideline: spend 50% of your income on NEEDS (housing, food, bills), 30% on WANTS (entertainment, dining out, hobbies), and save/invest 20%. If your needs are over 50%, that is the first place to look for savings">50/30/20 Rule</Explain> Check</p>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="text-center">
                <p className={cn("text-lg font-bold", needsPct <= 50 ? "text-emerald-600" : "text-red-500")}>{needsPct}%</p>
                <p className="text-[10px] text-muted-foreground">Needs (target: 50%)</p>
              </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold", wantsPct <= 30 ? "text-emerald-600" : "text-amber-500")}>{wantsPct}%</p>
                <p className="text-[10px] text-muted-foreground">Wants (target: 30%)</p>
              </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold", savingsRate >= 20 ? "text-emerald-600" : "text-red-500")}>{savingsRate}%</p>
                <p className="text-[10px] text-muted-foreground">Savings (target: 20%)</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 20 ? "You are saving 20%+ — you are building wealth." :
               savingsRate >= 10 ? "You are saving but below the 20% target. Look for the biggest expense you can reduce." :
               savingsRate >= 0 ? "You are barely breaking even. The budget shows exactly where the leaks are." :
               "You are spending more than you earn. This is urgent — focus on the biggest expenses first."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Single income simulation */}
      {secondIncome > 0 && (
        <Card className="border-2 border-violet-200 bg-violet-50/20">
          <div className="cursor-pointer" onClick={() => setShowSingleIncome(!showSingleIncome)}>
            <CardContent className="p-4 flex items-center gap-3">
              <PiggyBank className="h-5 w-5 text-violet-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">What If One Parent Stayed Home?</p>
                <p className="text-[10px] text-muted-foreground">See the real math based on YOUR numbers</p>
              </div>
              <Badge variant="outline" className={cn("text-xs", adjustedSingleSurplus >= 0 ? "text-emerald-600 border-emerald-300" : "text-red-500 border-red-300")}>
                {adjustedSingleSurplus >= 0 ? "+" : ""}${adjustedSingleSurplus.toLocaleString()}/mo
              </Badge>
            </CardContent>
          </div>
          {showSingleIncome && (
            <div className="px-4 pb-4 border-t border-border pt-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current total income</span>
                  <span className="font-medium">${totalIncome.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Remove second income</span>
                  <span>-${secondIncome.toLocaleString()}/mo</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-medium">
                  <span className="text-muted-foreground">Single income</span>
                  <span>${singleIncomeTotal.toLocaleString()}/mo</span>
                </div>

                <div className="mt-3 pt-2 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Expenses That Disappear</p>
                </div>
                {childcareCost > 0 && <div className="flex justify-between text-emerald-600"><span>No daycare needed</span><span>+${childcareCost.toLocaleString()}/mo</span></div>}
                {workCosts > 0 && <div className="flex justify-between text-emerald-600"><span>No work-related costs</span><span>+${workCosts.toLocaleString()}/mo</span></div>}
                {secondVehicle > 0 && <div className="flex justify-between text-emerald-600"><span>No second vehicle</span><span>+${secondVehicle.toLocaleString()}/mo</span></div>}
                {eatingOutSavings > 0 && <div className="flex justify-between text-emerald-600"><span>Less eating out (60% reduction)</span><span>+${eatingOutSavings.toLocaleString()}/mo</span></div>}
                {ccbIncrease > 0 && <div className="flex justify-between text-emerald-600"><span>Estimated CCB increase (lower income)</span><span>+${Math.round(ccbIncrease / 12).toLocaleString()}/mo</span></div>}

                <div className="border-t border-border pt-1.5 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Adjusted single-income expenses</span>
                    <span>${singleIncomeExpenses.toLocaleString()}/mo</span>
                  </div>
                  <div className={cn("flex justify-between font-bold text-sm mt-1", adjustedSingleSurplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                    <span>Net monthly position</span>
                    <span>{adjustedSingleSurplus >= 0 ? "+" : ""}${adjustedSingleSurplus.toLocaleString()}/mo</span>
                  </div>
                </div>

                <div className="rounded-lg bg-violet-100/50 p-3 mt-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {adjustedSingleSurplus >= 0 ? (
                      <><strong className="text-emerald-700">Based on your numbers, single income is financially viable.</strong> You would have ${adjustedSingleSurplus.toLocaleString()}/month surplus. The non-financial benefits — time with kids, home-cooked meals, reduced stress, stronger family — are on top of this.</>
                    ) : adjustedSingleSurplus > -500 ? (
                      <><strong className="text-amber-700">You are ${Math.abs(adjustedSingleSurplus).toLocaleString()}/month short.</strong> That gap is closable. A raise, side income, or moving to a lower cost-of-living area could bridge it. Check <a href="/family-economics" className="text-violet-600 hover:underline">Family Economics</a> for specific strategies.</>
                    ) : (
                      <><strong className="text-red-600">The gap is ${Math.abs(adjustedSingleSurplus).toLocaleString()}/month.</strong> This needs a bigger structural change — higher-paying career path, geographic move, or aggressive debt elimination. It is not impossible, but it requires a plan. Start with <a href="/family-economics" className="text-violet-600 hover:underline">Family Economics</a>.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tips */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The power of seeing your numbers:</strong> Most people have never written down every dollar that comes in and goes out.
            The act of seeing it changes behavior immediately. Studies show that people who track their spending reduce unnecessary
            expenses by 15-20% in the first month — without trying. Your data saves automatically and stays on your device.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/net-worth" className="text-sm text-emerald-600 hover:underline">Net Worth Tracker</a>
        <a href="/cost-of-living" className="text-sm text-teal-600 hover:underline">Cost of Living</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
