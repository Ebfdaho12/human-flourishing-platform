"use client"

import { useState, useEffect, useMemo } from "react"
import { Calculator, DollarSign, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, CheckCircle, Download, Camera, Activity, Shield, Target, Zap, Droplet } from "lucide-react"
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

interface BudgetSnapshot {
  date: string // YYYY-MM-01
  startingBalance: number
  totalIncome: number
  totalExpenses: number
  surplus: number
  categories: { category: string; spent: number }[]
}

const INCOME_TEMPLATES: { label: string; placeholder: string }[] = [
  { label: "Primary salary (after tax)", placeholder: "e.g. 4200" },
  { label: "Second income (after tax)", placeholder: "e.g. 2800" },
  { label: "Side income / freelance", placeholder: "e.g. 500" },
  { label: "Child benefits (CCB, etc.)", placeholder: "e.g. 600" },
  { label: "Other income", placeholder: "e.g. 200" },
]

const EXPENSE_CATEGORIES: { category: string; color: string; hex: string; items: { label: string; placeholder: string }[] }[] = [
  {
    category: "Housing",
    color: "bg-blue-500",
    hex: "#3b82f6",
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
    hex: "#8b5cf6",
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
    hex: "#10b981",
    items: [
      { label: "Groceries", placeholder: "e.g. 800" },
      { label: "Eating out / takeout", placeholder: "e.g. 300" },
      { label: "Coffee / drinks", placeholder: "e.g. 80" },
    ],
  },
  {
    category: "Childcare & Kids",
    color: "bg-rose-500",
    hex: "#f43f5e",
    items: [
      { label: "Daycare / before-after school", placeholder: "e.g. 1500" },
      { label: "Kids activities / sports", placeholder: "e.g. 150" },
      { label: "Kids clothing / supplies", placeholder: "e.g. 100" },
    ],
  },
  {
    category: "Utilities & Bills",
    color: "bg-cyan-500",
    hex: "#06b6d4",
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
    hex: "#f59e0b",
    items: [
      { label: "Health / dental insurance", placeholder: "e.g. 200" },
      { label: "Life insurance", placeholder: "e.g. 50" },
      { label: "Prescriptions / medical", placeholder: "e.g. 40" },
    ],
  },
  {
    category: "Debt Payments",
    color: "bg-red-500",
    hex: "#ef4444",
    items: [
      { label: "Credit cards", placeholder: "e.g. 200" },
      { label: "Student loans", placeholder: "e.g. 300" },
      { label: "Personal loans / LOC", placeholder: "e.g. 150" },
    ],
  },
  {
    category: "Lifestyle & Subscriptions",
    color: "bg-pink-500",
    hex: "#ec4899",
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
    hex: "#64748b",
    items: [
      { label: "Work lunches / coffee", placeholder: "e.g. 150" },
      { label: "Work clothes / dry cleaning", placeholder: "e.g. 50" },
      { label: "Commute (tolls, parking)", placeholder: "e.g. 100" },
      { label: "Convenience spending (because no time)", placeholder: "e.g. 200" },
    ],
  },
]

// Indices used repeatedly
const IDX_HOUSING = 0
const IDX_TRANSPORT = 1
const IDX_FOOD = 2
const IDX_CHILDCARE = 3
const IDX_UTILITIES = 4
const IDX_INSURANCE = 5
const IDX_DEBT = 6
const IDX_LIFESTYLE = 7
const IDX_WORK = 8

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-")
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${names[Number(m) - 1]} ${y.slice(2)}`
}

export default function BudgetPage() {
  const [incomes, setIncomes] = useState<number[]>(new Array(INCOME_TEMPLATES.length).fill(0))
  const [expenses, setExpenses] = useState<number[][]>(
    EXPENSE_CATEGORIES.map(cat => new Array(cat.items.length).fill(0))
  )
  const [showSingleIncome, setShowSingleIncome] = useState(false)
  const [history, setHistory] = useState<BudgetSnapshot[]>([])
  const [cashBalance, setCashBalance] = useState<number>(0)
  const [cashAvailable, setCashAvailable] = useState<boolean>(false)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-budget")
    if (stored) {
      const data = JSON.parse(stored)
      if (data.incomes) setIncomes(data.incomes)
      if (data.expenses) setExpenses(data.expenses)
    }
    const hist = localStorage.getItem("hfp-budget-history")
    if (hist) {
      try {
        const parsed = JSON.parse(hist) as BudgetSnapshot[]
        if (Array.isArray(parsed)) setHistory(parsed)
      } catch {}
    }
    // Try to read cash from net-worth tracker for emergency fund runway
    const nw = localStorage.getItem("hfp-net-worth")
    if (nw) {
      try {
        const parsed = JSON.parse(nw)
        // Look for cash/checking/savings across several possible shapes
        let cash = 0
        let found = false
        const scan = (obj: unknown) => {
          if (!obj || typeof obj !== "object") return
          if (Array.isArray(obj)) { obj.forEach(scan); return }
          for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            const key = k.toLowerCase()
            if (typeof v === "number" && (key.includes("cash") || key.includes("checking") || key.includes("savings") || key.includes("chequing"))) {
              cash += v
              found = true
            } else if (typeof v === "object") {
              scan(v)
            }
          }
        }
        scan(parsed)
        if (found) {
          setCashBalance(cash)
          setCashAvailable(true)
        }
      } catch {}
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
  const childcareCost = expenses[IDX_CHILDCARE]?.[0] || 0
  const workCosts = expenses[IDX_WORK]?.reduce((s, v) => s + v, 0) || 0
  const secondVehicle = expenses[IDX_TRANSPORT]?.[4] || 0
  const eatingOutSavings = Math.round((expenses[IDX_FOOD]?.[1] || 0) * 0.6)
  const singleIncomeTotal = totalIncome - secondIncome
  const singleIncomeExpenses = totalExpenses - childcareCost - workCosts - secondVehicle - eatingOutSavings
  const singleIncomeSurplus = singleIncomeTotal - singleIncomeExpenses

  const ccbIncrease = secondIncome > 30000 ? Math.round(secondIncome * 0.07) : secondIncome > 20000 ? Math.round(secondIncome * 0.05) : 0
  const adjustedSingleSurplus = singleIncomeSurplus + Math.round(ccbIncrease / 12)

  // 50/30/20 rule comparison
  const needsPct = totalIncome > 0 ? Math.round(((categoryTotals[IDX_HOUSING].total + categoryTotals[IDX_TRANSPORT].total + categoryTotals[IDX_UTILITIES].total + categoryTotals[IDX_INSURANCE].total + categoryTotals[IDX_CHILDCARE].total) / totalIncome) * 100) : 0
  const wantsPct = totalIncome > 0 ? Math.round(((categoryTotals[IDX_LIFESTYLE].total + categoryTotals[IDX_FOOD].total - (expenses[IDX_FOOD]?.[0] || 0)) / totalIncome) * 100) : 0

  // === Snapshot current month ===
  function saveSnapshot() {
    const key = monthKey(new Date())
    const snap: BudgetSnapshot = {
      date: key,
      startingBalance: cashAvailable ? cashBalance : 0,
      totalIncome,
      totalExpenses,
      surplus,
      categories: categoryTotals.map(c => ({ category: c.category, spent: c.total })),
    }
    // Replace if same month exists
    const filtered = history.filter(h => h.date !== key)
    const updated = [...filtered, snap].sort((a, b) => a.date.localeCompare(b.date))
    setHistory(updated)
    localStorage.setItem("hfp-budget-history", JSON.stringify(updated))
  }

  function removeSnapshot(key: string) {
    const updated = history.filter(h => h.date !== key)
    setHistory(updated)
    localStorage.setItem("hfp-budget-history", JSON.stringify(updated))
  }

  // === Build 12-month series (real snapshots only) ===
  const last12 = useMemo(() => history.slice(-12), [history])
  const last6 = useMemo(() => history.slice(-6), [history])

  // === Budget adherence score ===
  // Target = median of last 6 months spend per category (or current if no history)
  const categoryAdherence = useMemo(() => {
    return categoryTotals.map((cat) => {
      const historySpends = last6
        .map(h => h.categories.find(c => c.category === cat.category)?.spent ?? 0)
        .filter(v => v > 0)
      if (historySpends.length < 2) {
        return { category: cat.category, hex: cat.hex, color: cat.color, target: cat.total, actual: cat.total, score: 100, deltaPct: 0, hasTarget: false }
      }
      const sorted = [...historySpends].sort((a, b) => a - b)
      const target = sorted[Math.floor(sorted.length / 2)]
      const actual = cat.total
      const deltaPct = target > 0 ? Math.round(((actual - target) / target) * 100) : 0
      // Score: 100 if within 5%, lose 2 points per % deviation thereafter (both over and under)
      const absDev = Math.abs(deltaPct)
      const score = Math.max(0, Math.min(100, 100 - Math.max(0, absDev - 5) * 2))
      return { category: cat.category, hex: cat.hex, color: cat.color, target, actual, score, deltaPct, hasTarget: true }
    })
  }, [categoryTotals, last6])

  const overallAdherenceScore = useMemo(() => {
    const withTarget = categoryAdherence.filter(c => c.hasTarget && c.actual > 0)
    if (withTarget.length === 0) return null
    return Math.round(withTarget.reduce((s, c) => s + c.score, 0) / withTarget.length)
  }, [categoryAdherence])

  // === Money leak / biggest win ===
  const moneyLeak = useMemo(() => {
    const candidates = categoryAdherence.filter(c => c.hasTarget && c.actual > 0 && c.deltaPct > 0)
    if (candidates.length === 0) return null
    return candidates.sort((a, b) => b.deltaPct - a.deltaPct)[0]
  }, [categoryAdherence])

  const biggestWin = useMemo(() => {
    const candidates = categoryAdherence.filter(c => c.hasTarget && c.actual > 0 && c.deltaPct < 0)
    if (candidates.length === 0) return null
    return candidates.sort((a, b) => a.deltaPct - b.deltaPct)[0]
  }, [categoryAdherence])

  // === 50/30/20 bucket split ===
  const needsTotal = (categoryTotals[IDX_HOUSING].total + categoryTotals[IDX_TRANSPORT].total + categoryTotals[IDX_UTILITIES].total + categoryTotals[IDX_INSURANCE].total + categoryTotals[IDX_CHILDCARE].total + (expenses[IDX_FOOD]?.[0] || 0))
  const wantsTotal = (categoryTotals[IDX_LIFESTYLE].total + categoryTotals[IDX_FOOD].total - (expenses[IDX_FOOD]?.[0] || 0) + categoryTotals[IDX_WORK].total)
  const savingsOrDebt = Math.max(0, surplus) + categoryTotals[IDX_DEBT].total
  const bucketTotal = needsTotal + wantsTotal + savingsOrDebt
  const needsBucketPct = bucketTotal > 0 ? (needsTotal / bucketTotal) * 100 : 0
  const wantsBucketPct = bucketTotal > 0 ? (wantsTotal / bucketTotal) * 100 : 0
  const savingsBucketPct = bucketTotal > 0 ? (savingsOrDebt / bucketTotal) * 100 : 0

  // === Emergency fund runway ===
  const runwayMonths = (cashAvailable && totalExpenses > 0) ? cashBalance / totalExpenses : 0

  // === SVG chart geometry ===
  const barChartW = 640
  const barChartH = 180
  const barChartPad = { t: 10, r: 10, b: 22, l: 42 }

  const surplusSeries = last12.map(h => h.surplus)
  const maxSurplusAbs = Math.max(1, ...surplusSeries.map(v => Math.abs(v)))
  const zeroY = barChartPad.t + (barChartH - barChartPad.t - barChartPad.b) / 2
  const halfH = (barChartH - barChartPad.t - barChartPad.b) / 2
  const bandW = last12.length > 0 ? (barChartW - barChartPad.l - barChartPad.r) / last12.length : 0

  // Stacked bars for 6-month
  const stackedChartH = 200
  const stackedMax = Math.max(1, ...last6.map(h => h.totalExpenses))
  const stackedBandW = last6.length > 0 ? (barChartW - barChartPad.l - barChartPad.r) / last6.length : 0

  // Savings rate sparkline
  const sparkSeries = last12.map(h => h.totalIncome > 0 ? ((h.totalIncome - h.totalExpenses) / h.totalIncome) * 100 : 0)
  const sparkW = 220
  const sparkH = 44
  const sparkMin = Math.min(-5, ...sparkSeries)
  const sparkMax = Math.max(25, ...sparkSeries)
  const sparkRange = sparkMax - sparkMin || 1
  const sparkPath = sparkSeries.length > 1
    ? sparkSeries.map((v, i) => {
        const x = (i / (sparkSeries.length - 1)) * sparkW
        const y = sparkH - ((v - sparkMin) / sparkRange) * sparkH
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
      }).join(" ")
    : ""

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

      {/* Snapshot controls */}
      {(totalIncome > 0 || totalExpenses > 0) && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <Camera className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-semibold">Save this month's snapshot</p>
              <p className="text-[11px] text-muted-foreground">
                {history.length === 0 ? "No history yet. Save a snapshot each month to unlock trend charts." :
                  `${history.length} snapshot${history.length === 1 ? "" : "s"} saved. Latest: ${monthLabel(history[history.length - 1].date)}.`}
              </p>
            </div>
            <Button size="sm" onClick={saveSnapshot} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save {monthLabel(monthKey(new Date()))} snapshot
            </Button>
          </CardContent>
        </Card>
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

      {/* 50/30/20 check (existing) */}
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

      {/* 50/30/20 bucket visualization (new) */}
      {bucketTotal > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-500" /> 50 / 30 / 20 Bucket Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Target bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Recommended</span>
                <span>50% needs · 30% wants · 20% savings/debt</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div className="h-full bg-slate-300" style={{ width: "50%" }} />
                <div className="h-full bg-slate-400" style={{ width: "30%" }} />
                <div className="h-full bg-slate-500" style={{ width: "20%" }} />
              </div>
            </div>
            {/* Actual bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Your actual</span>
                <span>
                  {needsBucketPct.toFixed(0)}% · {wantsBucketPct.toFixed(0)}% · {savingsBucketPct.toFixed(0)}%
                </span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div className="h-full bg-blue-500" style={{ width: `${needsBucketPct}%` }} title={`Needs: $${needsTotal.toLocaleString()}`} />
                <div className="h-full bg-pink-500" style={{ width: `${wantsBucketPct}%` }} title={`Wants: $${wantsTotal.toLocaleString()}`} />
                <div className="h-full bg-emerald-500" style={{ width: `${savingsBucketPct}%` }} title={`Savings/debt: $${savingsOrDebt.toLocaleString()}`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Needs</span>
                </div>
                <p className={cn("text-sm font-bold", needsBucketPct <= 55 ? "text-emerald-600" : "text-red-500")}>
                  {needsBucketPct.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground">${needsTotal.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Wants</span>
                </div>
                <p className={cn("text-sm font-bold", wantsBucketPct <= 35 ? "text-emerald-600" : "text-amber-500")}>
                  {wantsBucketPct.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground">${wantsTotal.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Savings/Debt</span>
                </div>
                <p className={cn("text-sm font-bold", savingsBucketPct >= 20 ? "text-emerald-600" : "text-red-500")}>
                  {savingsBucketPct.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground">${savingsOrDebt.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Savings/debt combines surplus you can save plus required debt payments — both build net worth over time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 12-month surplus / deficit chart */}
      {last12.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Monthly Surplus / Deficit
              <span className="text-[10px] font-normal text-muted-foreground ml-auto">{last12.length} of 12 months</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${barChartW} ${barChartH}`} className="w-full h-auto" preserveAspectRatio="none">
              {/* Zero line */}
              <line
                x1={barChartPad.l} y1={zeroY}
                x2={barChartW - barChartPad.r} y2={zeroY}
                stroke="currentColor" strokeOpacity="0.2" strokeWidth="1"
              />
              {/* Y-axis labels */}
              <text x={barChartPad.l - 4} y={barChartPad.t + 8} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
                +${Math.round(maxSurplusAbs).toLocaleString()}
              </text>
              <text x={barChartPad.l - 4} y={zeroY + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">$0</text>
              <text x={barChartPad.l - 4} y={barChartH - barChartPad.b - 2} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
                -${Math.round(maxSurplusAbs).toLocaleString()}
              </text>
              {/* Bars */}
              {last12.map((h, i) => {
                const barH = (Math.abs(h.surplus) / maxSurplusAbs) * halfH
                const x = barChartPad.l + i * bandW + bandW * 0.15
                const w = bandW * 0.7
                const isPositive = h.surplus >= 0
                return (
                  <g key={h.date}>
                    <rect
                      x={x}
                      y={isPositive ? zeroY - barH : zeroY}
                      width={w}
                      height={barH}
                      fill={isPositive ? "#10b981" : "#ef4444"}
                      opacity="0.85"
                      rx="1.5"
                    >
                      <title>{`${monthLabel(h.date)}: ${isPositive ? "+" : ""}$${h.surplus.toLocaleString()}`}</title>
                    </rect>
                    {i % Math.max(1, Math.ceil(last12.length / 6)) === 0 && (
                      <text
                        x={x + w / 2}
                        y={barChartH - barChartPad.b + 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill="currentColor"
                        opacity="0.55"
                      >
                        {monthLabel(h.date)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </CardContent>
        </Card>
      )}

      {/* 6-month stacked category bars */}
      {last6.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-violet-500" /> Category Spend Over Time
              <span className="text-[10px] font-normal text-muted-foreground ml-auto">Last {last6.length} months</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${barChartW} ${stackedChartH}`} className="w-full h-auto" preserveAspectRatio="none">
              {/* Y-axis grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const y = barChartPad.t + (1 - r) * (stackedChartH - barChartPad.t - barChartPad.b)
                return (
                  <g key={i}>
                    <line x1={barChartPad.l} y1={y} x2={barChartW - barChartPad.r} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                    <text x={barChartPad.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
                      ${Math.round(stackedMax * r).toLocaleString()}
                    </text>
                  </g>
                )
              })}
              {/* Stacked bars */}
              {last6.map((h, i) => {
                const x = barChartPad.l + i * stackedBandW + stackedBandW * 0.15
                const w = stackedBandW * 0.7
                const plotH = stackedChartH - barChartPad.t - barChartPad.b
                let runningY = stackedChartH - barChartPad.b
                return (
                  <g key={h.date}>
                    {EXPENSE_CATEGORIES.map((cat, cIdx) => {
                      const spent = h.categories.find(c => c.category === cat.category)?.spent ?? 0
                      if (spent <= 0) return null
                      const segH = (spent / stackedMax) * plotH
                      runningY -= segH
                      return (
                        <rect
                          key={cat.category}
                          x={x}
                          y={runningY}
                          width={w}
                          height={segH}
                          fill={cat.hex}
                          opacity="0.88"
                        >
                          <title>{`${monthLabel(h.date)} — ${cat.category}: $${spent.toLocaleString()}`}</title>
                        </rect>
                      )
                    })}
                    <text x={x + w / 2} y={stackedChartH - barChartPad.b + 12} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">
                      {monthLabel(h.date)}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 mt-3">
              {EXPENSE_CATEGORIES.map(cat => (
                <div key={cat.category} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", cat.color)} />
                  <span className="text-[10px] text-muted-foreground">{cat.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings rate sparkline */}
      {sparkSeries.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Savings Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 flex-wrap">
            <svg viewBox={`0 0 ${sparkW} ${sparkH + 6}`} className="w-full max-w-[260px] h-auto">
              {/* 20% target line */}
              {sparkMin <= 20 && sparkMax >= 20 && (
                <line
                  x1="0"
                  y1={sparkH - ((20 - sparkMin) / sparkRange) * sparkH}
                  x2={sparkW}
                  y2={sparkH - ((20 - sparkMin) / sparkRange) * sparkH}
                  stroke="#10b981"
                  strokeDasharray="2,2"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
              )}
              {/* Zero line */}
              {sparkMin <= 0 && sparkMax >= 0 && (
                <line
                  x1="0"
                  y1={sparkH - ((0 - sparkMin) / sparkRange) * sparkH}
                  x2={sparkW}
                  y2={sparkH - ((0 - sparkMin) / sparkRange) * sparkH}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
              )}
              <path d={sparkPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {sparkSeries.map((v, i) => {
                const x = (i / (sparkSeries.length - 1)) * sparkW
                const y = sparkH - ((v - sparkMin) / sparkRange) * sparkH
                return (
                  <circle key={i} cx={x} cy={y} r="2" fill={v >= 20 ? "#10b981" : v >= 0 ? "#f59e0b" : "#ef4444"}>
                    <title>{`${monthLabel(last12[i].date)}: ${v.toFixed(1)}%`}</title>
                  </circle>
                )
              })}
            </svg>
            <div className="flex-1 min-w-[150px]">
              <p className="text-2xl font-bold">
                <span className={cn(sparkSeries[sparkSeries.length - 1] >= 20 ? "text-emerald-600" : sparkSeries[sparkSeries.length - 1] >= 0 ? "text-amber-500" : "text-red-500")}>
                  {sparkSeries[sparkSeries.length - 1].toFixed(1)}%
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Latest savings rate · {sparkSeries.length}-month avg: {(sparkSeries.reduce((s, v) => s + v, 0) / sparkSeries.length).toFixed(1)}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Dashed line = 20% target
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget adherence score */}
      {overallAdherenceScore !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" /> Budget Adherence Score
              <span className={cn("ml-auto text-lg font-bold",
                overallAdherenceScore >= 80 ? "text-emerald-600" :
                overallAdherenceScore >= 60 ? "text-amber-500" : "text-red-500")}>
                {overallAdherenceScore}/100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground mb-3">
              Each category is scored against your own 6-month median. Within 5% of target = 100. Score drops 2 points per % deviation beyond that.
            </p>
            <div className="space-y-1.5">
              {categoryAdherence.filter(c => c.hasTarget && c.actual > 0).sort((a, b) => a.score - b.score).map(c => (
                <div key={c.category} className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", c.color)} />
                  <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">{c.category}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full",
                        c.score >= 80 ? "bg-emerald-500" :
                        c.score >= 60 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums w-10 text-right text-muted-foreground">
                    {c.deltaPct > 0 ? "+" : ""}{c.deltaPct}%
                  </span>
                  <span className={cn("text-xs font-medium tabular-nums w-8 text-right",
                    c.score >= 80 ? "text-emerald-600" :
                    c.score >= 60 ? "text-amber-500" : "text-red-500")}>
                    {c.score}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Money leak + biggest win */}
      {(moneyLeak || biggestWin) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {moneyLeak && (
            <Card className="border-red-200 bg-red-50/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="h-4 w-4 text-red-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Money Leak</p>
                </div>
                <p className="text-lg font-bold">{moneyLeak.category}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-500 font-semibold">+{moneyLeak.deltaPct}%</span> over your 6-month median.
                  Spent ${moneyLeak.actual.toLocaleString()} vs. typical ${moneyLeak.target.toLocaleString()}.
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  This is the single biggest place to cut before next month. A ${(moneyLeak.actual - moneyLeak.target).toLocaleString()} reset here is more powerful than trimming five smaller categories.
                </p>
              </CardContent>
            </Card>
          )}
          {biggestWin && (
            <Card className="border-emerald-200 bg-emerald-50/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Biggest Win</p>
                </div>
                <p className="text-lg font-bold">{biggestWin.category}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-600 font-semibold">{biggestWin.deltaPct}%</span> under your 6-month median.
                  Spent ${biggestWin.actual.toLocaleString()} vs. typical ${biggestWin.target.toLocaleString()}.
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  You saved ${(biggestWin.target - biggestWin.actual).toLocaleString()} here. Lock in the behaviour that made this possible — it compounds.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Emergency fund runway */}
      {cashAvailable && totalExpenses > 0 && (
        <Card className={cn("border-2",
          runwayMonths >= 6 ? "border-emerald-200 bg-emerald-50/20" :
          runwayMonths >= 3 ? "border-amber-200 bg-amber-50/20" :
          "border-red-200 bg-red-50/20")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <Explain tip="Number of months your cash reserves could cover your current expenses if all income stopped. Standard guidance: 3 months is a minimum cushion, 6 months is strong, 12 months gives full optionality">Emergency Fund Runway</Explain>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={cn("text-3xl font-bold",
                runwayMonths >= 6 ? "text-emerald-600" :
                runwayMonths >= 3 ? "text-amber-500" : "text-red-500")}>
                {runwayMonths.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">months of expenses covered</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className={cn("h-full",
                  runwayMonths >= 6 ? "bg-emerald-500" :
                  runwayMonths >= 3 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${Math.min(100, (runwayMonths / 12) * 100)}%` }}
              />
              {/* 3-month marker */}
              <div className="absolute top-0 bottom-0 w-px bg-foreground/40" style={{ left: "25%" }} title="3 months (minimum)" />
              {/* 6-month marker */}
              <div className="absolute top-0 bottom-0 w-px bg-foreground/40" style={{ left: "50%" }} title="6 months (strong)" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>3mo</span>
              <span>6mo</span>
              <span>12mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Cash available: <span className="font-medium text-foreground">${cashBalance.toLocaleString()}</span> (from Net Worth tracker) &middot;
              Monthly burn: <span className="font-medium text-foreground">${totalExpenses.toLocaleString()}</span>.
              {runwayMonths < 3 && " Priority #1 is building this to 3 months before anything else. A cash cushion is what lets you take risks elsewhere."}
              {runwayMonths >= 3 && runwayMonths < 6 && " Solid foundation. Push to 6 months if your income is variable or you have kids."}
              {runwayMonths >= 6 && " Strong position. Excess cash above 6-12 months is generally better deployed in investments."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* History list */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saved Snapshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...history].reverse().map(h => (
                <div key={h.date} className="flex items-center gap-2 text-xs py-1 border-b border-border/50 last:border-0">
                  <span className="w-16 font-medium">{monthLabel(h.date)}</span>
                  <span className="text-emerald-600 tabular-nums w-20 text-right">${h.totalIncome.toLocaleString()}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-red-500 tabular-nums w-20 text-right">${h.totalExpenses.toLocaleString()}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className={cn("tabular-nums w-20 text-right font-medium", h.surplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {h.surplus >= 0 ? "+" : ""}${h.surplus.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeSnapshot(h.date)}
                    className="ml-auto text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label={`Remove ${monthLabel(h.date)} snapshot`}
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
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
