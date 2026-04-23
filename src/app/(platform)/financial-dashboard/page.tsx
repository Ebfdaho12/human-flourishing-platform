"use client"

import { useState, useEffect, useMemo } from "react"
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, CreditCard,
  Target, ArrowRight, AlertTriangle, CheckCircle, Shield, Activity, Flame
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface NwSnapshot {
  date: string           // YYYY-MM-DD
  netWorth: number
  assets: number
  liabilities: number
}
interface BudgetSnapshot {
  date: string           // YYYY-MM-01
  startingBalance: number
  totalIncome: number
  totalExpenses: number
  surplus: number
  categories: { category: string; spent: number }[]
}
interface NwEntry { id: string; name: string; type: "asset" | "liability"; category: string; amount: number }
interface Debt { id: string; name: string; balance: number; rate: number; minPayment: number }

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}
function monthLabel(key: string): string {
  const [y, m] = key.split("-")
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${names[Number(m) - 1]} ${y.slice(2)}`
}
function fmt(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `${v < 0 ? "-" : ""}$${Math.round(abs / 1000)}k`
  return `${v < 0 ? "-" : ""}$${abs.toLocaleString()}`
}

export default function FinancialDashboardPage() {
  const [budget, setBudget] = useState<any>(null)
  const [budgetHistory, setBudgetHistory] = useState<BudgetSnapshot[]>([])
  const [debts, setDebts] = useState<any>(null)
  const [netWorth, setNetWorth] = useState<any>(null)
  const [nwHistory, setNwHistory] = useState<NwSnapshot[]>([])
  const [subs, setSubs] = useState<any>(null)
  const [fiTarget, setFiTarget] = useState<number>(0)

  useEffect(() => {
    try {
      const b = localStorage.getItem("hfp-budget"); if (b) setBudget(JSON.parse(b))
      const bh = localStorage.getItem("hfp-budget-history")
      if (bh) {
        const parsed = JSON.parse(bh)
        if (Array.isArray(parsed)) setBudgetHistory(parsed.sort((a: BudgetSnapshot, b: BudgetSnapshot) => a.date.localeCompare(b.date)))
      }
      const d = localStorage.getItem("hfp-debts"); if (d) setDebts(JSON.parse(d))
      const n = localStorage.getItem("hfp-networth"); if (n) setNetWorth(JSON.parse(n))
      const nh = localStorage.getItem("hfp-networth-history")
      if (nh) {
        const parsed = JSON.parse(nh)
        if (Array.isArray(parsed)) setNwHistory(parsed.sort((a: NwSnapshot, b: NwSnapshot) => a.date.localeCompare(b.date)))
      }
      const s = localStorage.getItem("hfp-subscriptions"); if (s) setSubs(JSON.parse(s))
      const fi = localStorage.getItem("hfp-networth-fi-target"); if (fi) setFiTarget(Number(fi) || 0)
    } catch {}
  }, [])

  // ---- Budget aggregates (current) ----
  const incomes: number[] = budget?.incomes || []
  const expenses: number[][] = budget?.expenses || []
  const totalIncome = incomes.reduce((s: number, v: number) => s + (Number(v) || 0), 0)
  const totalExpenses = expenses.reduce((s: number, row: number[]) => s + row.reduce((t, v) => t + (Number(v) || 0), 0), 0)
  const monthlySurplus = totalIncome - totalExpenses

  // Category labels (align with budget page order)
  const CATEGORIES = ["Housing", "Transport", "Food", "Childcare & Kids", "Utilities & Bills", "Insurance & Health", "Debt Payments", "Lifestyle & Subscriptions", "Work-Related Costs"]
  const CATEGORY_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f43f5e", "#06b6d4", "#f59e0b", "#ef4444", "#ec4899", "#64748b"]
  const categoryTotals = CATEGORIES.map((cat, i) => ({
    category: cat,
    color: CATEGORY_COLORS[i],
    total: (expenses[i] || []).reduce((s: number, v: number) => s + (Number(v) || 0), 0),
  }))

  // ---- Debts ----
  const debtList: Debt[] = debts?.debts || []
  const totalDebt = debtList.reduce((s, d) => s + (d.balance || 0), 0)
  const debtCount = debtList.length
  const highestRate = debtList.length > 0 ? Math.max(...debtList.map(d => d.rate || 0)) : 0
  const debtMinimums = debtList.reduce((s, d) => s + (d.minPayment || 0), 0)

  // ---- Net worth ----
  const nwEntries: NwEntry[] = netWorth?.entries || []
  const totalAssets = nwEntries.filter(e => e.type === "asset").reduce((s, e) => s + e.amount, 0)
  const totalLiabilities = nwEntries.filter(e => e.type === "liability").reduce((s, e) => s + e.amount, 0)
  const netWorthValue = totalAssets - totalLiabilities
  const cashAndSavings = nwEntries
    .filter(e => e.type === "asset" && e.category === "Cash & Savings")
    .reduce((s, e) => s + e.amount, 0)

  // ---- Subs ----
  const subList = subs?.subs || []
  const totalSubs = subList.reduce((s: number, sub: any) => s + (Number(sub.cost) || 0), 0)
  const wastefulSubs = subList.filter((s: any) => s.lastUsed === "rarely" || s.lastUsed === "forgot")
  const wastefulAmount = wastefulSubs.reduce((s: number, sub: any) => s + (Number(sub.cost) || 0), 0)

  // ---- Ratios ----
  const savingsRate = totalIncome > 0 ? Math.round((monthlySurplus / totalIncome) * 100) : 0
  const annualIncome = totalIncome * 12
  const debtToIncome = annualIncome > 0 ? Math.round((totalDebt / annualIncome) * 100) : 0
  const emergencyMonths = totalExpenses > 0 ? Math.round((cashAndSavings / totalExpenses) * 10) / 10 : 0

  const hasData = totalIncome > 0 || totalDebt > 0 || nwEntries.length > 0 || subList.length > 0 || budgetHistory.length > 0 || nwHistory.length > 0

  // ---- Net worth history trends ----
  const nwLast = nwHistory[nwHistory.length - 1]
  const nwFirst = nwHistory[0]
  const nwChange90 = useMemo(() => {
    if (nwHistory.length < 2) return null
    const cutoff = Date.now() - 90 * 86400000
    const older = nwHistory.filter(h => new Date(h.date + "T00:00:00").getTime() <= cutoff).slice(-1)[0] || nwHistory[0]
    const latest = nwHistory[nwHistory.length - 1]
    return { delta: latest.netWorth - older.netWorth, from: older.date, to: latest.date }
  }, [nwHistory])
  const nwMonthly = useMemo(() => {
    // compute month-over-month deltas from history (last 12 months by month-end or last obs)
    if (nwHistory.length < 2) return []
    const byMonth = new Map<string, number>()
    for (const h of nwHistory) byMonth.set(h.date.slice(0, 7), h.netWorth)
    const keys = [...byMonth.keys()].sort()
    const last12 = keys.slice(-12)
    const out: { month: string; nw: number; delta: number }[] = []
    for (let i = 0; i < last12.length; i++) {
      const k = last12[i]
      const nw = byMonth.get(k)!
      const prev = i === 0 ? null : byMonth.get(last12[i - 1])!
      out.push({ month: k, nw, delta: prev === null ? 0 : nw - prev })
    }
    return out
  }, [nwHistory])
  const decliningMonths = nwMonthly.filter(m => m.delta < 0).length

  // ---- Cash flow last 6 months (budget history) ----
  const cashFlow6 = useMemo(() => budgetHistory.slice(-6), [budgetHistory])
  const consistentSavingsMonths = budgetHistory.filter(s => s.surplus > 0).length
  const consistentSavingsStreak = (() => {
    let streak = 0
    for (let i = budgetHistory.length - 1; i >= 0; i--) {
      if (budgetHistory[i].surplus > 0) streak++
      else break
    }
    return streak
  })()

  // ---- Top 3 expense categories ----
  const topExpenses = [...categoryTotals].filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 3)
  const topExpensePct = totalExpenses > 0 ? (topExpenses[0]?.total / totalExpenses) * 100 : 0

  // ---- Financial health score (0-100) ----
  let healthScore = 0
  let scoreBreakdown: { label: string; points: number; max: number; note: string }[] = []

  // Savings rate (25)
  let srPts = 0
  if (totalIncome > 0) {
    if (savingsRate >= 20) srPts = 25
    else if (savingsRate >= 15) srPts = 20
    else if (savingsRate >= 10) srPts = 15
    else if (savingsRate >= 5) srPts = 8
    else if (savingsRate >= 0) srPts = 3
    else srPts = 0
  }
  scoreBreakdown.push({ label: "Savings rate", points: srPts, max: 25, note: totalIncome > 0 ? `${savingsRate}%` : "No budget yet" })
  healthScore += srPts

  // Debt-to-income (25)
  let dtiPts = 0
  if (totalIncome > 0) {
    if (totalDebt === 0) dtiPts = 25
    else if (debtToIncome < 15) dtiPts = 22
    else if (debtToIncome < 30) dtiPts = 18
    else if (debtToIncome < 50) dtiPts = 12
    else if (debtToIncome < 80) dtiPts = 6
    else dtiPts = 2
  } else if (totalDebt === 0 && nwEntries.length > 0) {
    dtiPts = 20
  }
  scoreBreakdown.push({ label: "Debt load", points: dtiPts, max: 25, note: totalDebt > 0 ? `${debtToIncome}% DTI` : totalIncome > 0 ? "Debt-free" : "—" })
  healthScore += dtiPts

  // Emergency fund (25)
  let efPts = 0
  if (totalExpenses > 0) {
    if (emergencyMonths >= 6) efPts = 25
    else if (emergencyMonths >= 3) efPts = 18
    else if (emergencyMonths >= 1) efPts = 10
    else if (emergencyMonths > 0) efPts = 4
    else efPts = 0
  }
  scoreBreakdown.push({ label: "Emergency fund", points: efPts, max: 25, note: totalExpenses > 0 ? `${emergencyMonths} months` : "—" })
  healthScore += efPts

  // Net worth growth (25)
  let nwPts = 0
  if (nwHistory.length >= 2 && nwChange90) {
    if (nwChange90.delta > 0) nwPts = 20
    else if (nwChange90.delta === 0) nwPts = 10
    else nwPts = 4
    if (netWorthValue > 0) nwPts += 5
  } else if (netWorthValue > 0) {
    nwPts = 12
  } else if (nwEntries.length > 0) {
    nwPts = 4
  }
  nwPts = Math.min(25, nwPts)
  scoreBreakdown.push({ label: "Net worth growth", points: nwPts, max: 25, note: nwChange90 ? `${nwChange90.delta >= 0 ? "+" : ""}${fmt(nwChange90.delta)} / 90d` : nwEntries.length > 0 ? fmt(netWorthValue) : "—" })
  healthScore += nwPts

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)))

  // ---- FI countdown ----
  const fiProgress = fiTarget > 0 ? Math.max(0, Math.min(100, (netWorthValue / fiTarget) * 100)) : 0
  const fiRemaining = Math.max(0, fiTarget - netWorthValue)
  const fiYears = (monthlySurplus > 0 && fiTarget > netWorthValue)
    ? Math.round((fiRemaining / (monthlySurplus * 12)) * 10) / 10
    : null

  // ---- Red / Green flags ----
  const redFlags: string[] = []
  if (monthlySurplus < 0) redFlags.push(`Spending exceeds income by ${fmt(Math.abs(monthlySurplus))}/mo`)
  if (savingsRate >= 0 && savingsRate < 10 && totalIncome > 0) redFlags.push(`Savings rate only ${savingsRate}% — target 20%+`)
  if (totalExpenses > 0 && cashAndSavings === 0 && totalAssets > 0) redFlags.push("No cash reserves flagged in net worth (add a Cash & Savings entry)")
  if (totalExpenses > 0 && cashAndSavings > 0 && emergencyMonths < 3) redFlags.push(`Emergency fund covers only ${emergencyMonths} months — build to 3-6`)
  if (totalExpenses === 0 && nwEntries.length > 0) redFlags.push("No budget data — cannot calculate emergency fund runway")
  if (highestRate > 15) redFlags.push(`Carrying debt at ${highestRate}% — highest priority to eliminate`)
  if (debtMinimums > 0 && totalIncome > 0 && debtMinimums / totalIncome > 0.20) redFlags.push(`Debt minimums eat ${Math.round((debtMinimums / totalIncome) * 100)}% of monthly income`)
  if (decliningMonths >= 3) redFlags.push(`${decliningMonths} declining net worth months in the last year`)
  if (wastefulAmount > 0) redFlags.push(`${fmt(wastefulAmount)}/mo in rarely-used subscriptions`)
  if (topExpensePct > 45) redFlags.push(`${topExpenses[0].category} is ${Math.round(topExpensePct)}% of spending — concentration risk`)

  const greenFlags: string[] = []
  if (savingsRate >= 20) greenFlags.push(`Savings rate ${savingsRate}% — above the 20% target`)
  if (consistentSavingsStreak >= 3) greenFlags.push(`${consistentSavingsStreak} consecutive surplus months logged`)
  if (emergencyMonths >= 6) greenFlags.push(`Emergency fund covers ${emergencyMonths} months — fully funded`)
  else if (emergencyMonths >= 3) greenFlags.push(`Emergency fund covers ${emergencyMonths} months — solid baseline`)
  if (totalDebt === 0 && totalIncome > 0) greenFlags.push("Debt-free")
  else if (debtToIncome > 0 && debtToIncome < 20 && totalIncome > 0) greenFlags.push(`Low debt load (${debtToIncome}% DTI)`)
  if (nwChange90 && nwChange90.delta > 0) greenFlags.push(`Net worth up ${fmt(nwChange90.delta)} over last 90 days`)
  if (nwFirst && nwLast && nwLast.netWorth > nwFirst.netWorth) greenFlags.push(`Net worth growing since first snapshot (${fmt(nwLast.netWorth - nwFirst.netWorth)})`)
  if (fiTarget > 0 && fiProgress >= 25) greenFlags.push(`${Math.round(fiProgress)}% to financial independence target`)

  // ---- Recommendations ----
  const recommendations: { text: string; link: string; priority: string }[] = []
  if (totalIncome === 0) recommendations.push({ text: "Set up your budget — track where every dollar goes", link: "/budget", priority: "high" })
  if (monthlySurplus < 0) recommendations.push({ text: "You are spending more than you earn. This is urgent.", link: "/budget", priority: "critical" })
  else if (savingsRate < 10 && totalIncome > 0) recommendations.push({ text: `Savings rate is ${savingsRate}%. Target 20%. Review your budget for cuts`, link: "/budget", priority: "high" })
  if (totalExpenses > 0 && emergencyMonths < 3) recommendations.push({ text: `Emergency fund at ${emergencyMonths} months. Build to 3-6 months of expenses`, link: "/net-worth", priority: emergencyMonths < 1 ? "high" : "medium" })
  if (totalDebt > 0) recommendations.push({ text: `${fmt(totalDebt)} in debt. Run avalanche vs snowball projections`, link: "/debt-payoff", priority: totalDebt > 50000 ? "high" : "medium" })
  if (highestRate > 15) recommendations.push({ text: `Debt at ${highestRate}% interest — pay this FIRST (avalanche)`, link: "/debt-payoff", priority: "high" })
  if (wastefulAmount > 0) recommendations.push({ text: `${fmt(wastefulAmount)}/mo in forgotten subscriptions — cancel them (${fmt(wastefulAmount * 12)}/yr)`, link: "/subscriptions", priority: "medium" })
  if (nwEntries.length === 0) recommendations.push({ text: "Track your net worth — the single most important number", link: "/net-worth", priority: "medium" })
  if (totalIncome > 0 && debtCount === 0 && savingsRate >= 20 && emergencyMonths >= 3) recommendations.push({ text: "Strong foundation — model compound growth on your surplus", link: "/compound-interest", priority: "low" })
  if (recommendations.length === 0 && hasData) recommendations.push({ text: "Keep going — you are on track!", link: "/wins", priority: "low" })

  // ---- Net worth SVG chart dimensions ----
  const CHART_W = 640
  const CHART_H = 180
  const PAD_L = 44
  const PAD_R = 12
  const PAD_T = 12
  const PAD_B = 24
  const innerW = CHART_W - PAD_L - PAD_R
  const innerH = CHART_H - PAD_T - PAD_B

  const nwChart = useMemo(() => {
    if (nwHistory.length < 2) return null
    const xs = nwHistory.map(h => new Date(h.date + "T00:00:00").getTime())
    const ys = nwHistory.map(h => h.netWorth)
    const xMin = Math.min(...xs), xMax = Math.max(...xs)
    const yMin = Math.min(0, ...ys)
    const yMax = Math.max(...ys, yMin + 1)
    const xScale = (t: number) => PAD_L + ((t - xMin) / Math.max(1, xMax - xMin)) * innerW
    const yScale = (v: number) => PAD_T + innerH - ((v - yMin) / Math.max(1, yMax - yMin)) * innerH
    const points = nwHistory.map(h => `${xScale(new Date(h.date + "T00:00:00").getTime())},${yScale(h.netWorth)}`).join(" ")
    const areaPath = `M ${xScale(xs[0])},${yScale(yMin)} L ${points.split(" ").join(" L ")} L ${xScale(xs[xs.length - 1])},${yScale(yMin)} Z`
    // y-axis ticks
    const ticks = 4
    const tickVals = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks)
    return { points, areaPath, yScale, xScale, xMin, xMax, yMin, yMax, tickVals }
  }, [nwHistory])

  // ---- Cash flow stacked bars ----
  const cashFlowMax = Math.max(1, ...cashFlow6.map(s => Math.max(s.totalIncome, s.totalExpenses)))

  // ---- Snowball next-out debt (psychological) ----
  const snowballNext = debtList.length > 0
    ? [...debtList].filter(d => d.balance > 0).sort((a, b) => a.balance - b.balance)[0]
    : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your complete financial picture in one place. Pulls from your budget, debts, net worth, and subscriptions.
        </p>
      </div>

      {!hasData ? (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No financial data yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Start with one of these tools to see your dashboard come alive:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <a href="/budget" className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Budget Calculator</a>
              <a href="/net-worth" className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100">Net Worth Tracker</a>
              <a href="/debt-payoff" className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Debt Payoff</a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Health score */}
          <Card className={cn("border-2",
            healthScore >= 70 ? "border-emerald-300 bg-emerald-50/20" :
            healthScore >= 40 ? "border-amber-300 bg-amber-50/20" :
            "border-red-300 bg-red-50/20"
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-6 flex-wrap">
                <div className="text-center min-w-[120px]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    <Explain tip="A score from 0-100 combining savings rate (25pt), debt-to-income (25pt), emergency fund months (25pt), and net worth growth (25pt). Uses YOUR actual data — nothing is guessed">Health Score</Explain>
                  </p>
                  <p className={cn("text-5xl font-bold leading-none",
                    healthScore >= 70 ? "text-emerald-600" : healthScore >= 40 ? "text-amber-600" : "text-red-500"
                  )}>{healthScore}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {healthScore >= 80 ? "Excellent" :
                     healthScore >= 60 ? "Good" :
                     healthScore >= 40 ? "Needs work" :
                     "Urgent"}
                  </p>
                </div>
                <div className="flex-1 min-w-[220px] space-y-1.5">
                  {scoreBreakdown.map((s, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-medium">{s.points}/{s.max} <span className="text-muted-foreground">· {s.note}</span></span>
                      </div>
                      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full",
                            s.points / s.max >= 0.7 ? "bg-emerald-500" :
                            s.points / s.max >= 0.4 ? "bg-amber-500" : "bg-red-400"
                          )}
                          style={{ width: `${(s.points / s.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className={cn("text-base font-bold", netWorthValue >= 0 ? "text-emerald-600" : "text-red-500")}>
                {fmt(netWorthValue)}
              </p>
              <p className="text-[10px] text-muted-foreground">Net worth</p>
            </CardContent></Card>
            {totalIncome > 0 && (
              <Card><CardContent className="p-3 text-center">
                <p className={cn("text-base font-bold", monthlySurplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {monthlySurplus >= 0 ? "+" : ""}{fmt(monthlySurplus)}
                </p>
                <p className="text-[10px] text-muted-foreground">Monthly {monthlySurplus >= 0 ? "surplus" : "deficit"}</p>
              </CardContent></Card>
            )}
            {totalIncome > 0 && (
              <Card><CardContent className="p-3 text-center">
                <p className={cn("text-base font-bold", savingsRate >= 20 ? "text-emerald-600" : savingsRate >= 10 ? "text-amber-600" : "text-red-500")}>
                  {savingsRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">Savings rate</p>
              </CardContent></Card>
            )}
            {totalDebt > 0 && (
              <Card className="border-red-100"><CardContent className="p-3 text-center">
                <p className="text-base font-bold text-red-500">{fmt(totalDebt)}</p>
                <p className="text-[10px] text-muted-foreground">Debt ({debtCount})</p>
              </CardContent></Card>
            )}
            {totalExpenses > 0 && (
              <Card><CardContent className="p-3 text-center">
                <p className={cn("text-base font-bold",
                  emergencyMonths >= 6 ? "text-emerald-600" :
                  emergencyMonths >= 3 ? "text-amber-600" : "text-red-500"
                )}>
                  {emergencyMonths}mo
                </p>
                <p className="text-[10px] text-muted-foreground">Emergency fund</p>
              </CardContent></Card>
            )}
          </div>

          {/* Net worth over time chart */}
          {nwChart && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-500" /> Net Worth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="nwArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* y grid */}
                  {nwChart.tickVals.map((v, i) => (
                    <g key={i}>
                      <line
                        x1={PAD_L} x2={CHART_W - PAD_R}
                        y1={nwChart.yScale(v)} y2={nwChart.yScale(v)}
                        stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 3"
                      />
                      <text x={PAD_L - 4} y={nwChart.yScale(v) + 3} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.5">{fmt(v)}</text>
                    </g>
                  ))}
                  {/* area */}
                  <path d={nwChart.areaPath} fill="url(#nwArea)" />
                  {/* line */}
                  <polyline points={nwChart.points} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {/* endpoint dot */}
                  {(() => {
                    const last = nwHistory[nwHistory.length - 1]
                    const cx = nwChart.xScale(new Date(last.date + "T00:00:00").getTime())
                    const cy = nwChart.yScale(last.netWorth)
                    return <circle cx={cx} cy={cy} r="3" fill="#8b5cf6" />
                  })()}
                  {/* x labels: first, middle, last */}
                  {[0, Math.floor(nwHistory.length / 2), nwHistory.length - 1].map((i, k) => {
                    const h = nwHistory[i]
                    if (!h) return null
                    return (
                      <text key={k}
                        x={nwChart.xScale(new Date(h.date + "T00:00:00").getTime())}
                        y={CHART_H - 6}
                        textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"}
                        fontSize="9" fill="currentColor" fillOpacity="0.5">{h.date}</text>
                    )
                  })}
                </svg>
                <div className="flex items-center justify-between text-[11px] mt-1 px-2">
                  <span className="text-muted-foreground">{nwHistory.length} snapshots</span>
                  {nwChange90 && (
                    <span className={cn(nwChange90.delta >= 0 ? "text-emerald-600" : "text-red-500", "font-medium")}>
                      {nwChange90.delta >= 0 ? "+" : ""}{fmt(nwChange90.delta)} / 90d
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash flow last 6 months */}
          {cashFlow6.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Cash Flow — Last 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-end gap-2 h-32">
                  {cashFlow6.map((s, i) => {
                    const incomeH = (s.totalIncome / cashFlowMax) * 100
                    const expenseH = (s.totalExpenses / cashFlowMax) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end gap-0.5 h-full">
                          <div className="flex-1 bg-emerald-400/80 rounded-t" style={{ height: `${incomeH}%` }} title={`Income ${fmt(s.totalIncome)}`} />
                          <div className="flex-1 bg-red-400/80 rounded-t" style={{ height: `${expenseH}%` }} title={`Expenses ${fmt(s.totalExpenses)}`} />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{monthLabel(s.date)}</span>
                        <span className={cn("text-[9px] font-medium", s.surplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                          {s.surplus >= 0 ? "+" : ""}{fmt(s.surplus)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm bg-emerald-400" /> Income</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm bg-red-400" /> Expenses</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 expense categories */}
          {topExpenses.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" /> Top Spending Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {topExpenses.map((c, i) => {
                  const pct = totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                          {c.category}
                        </span>
                        <span className="text-muted-foreground">{fmt(c.total)}/mo · {Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Red + Green flags */}
          {(redFlags.length > 0 || greenFlags.length > 0) && (
            <div className="grid md:grid-cols-2 gap-3">
              {redFlags.length > 0 && (
                <Card className="border-red-200 bg-red-50/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" /> Red Flags ({redFlags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {redFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {greenFlags.length > 0 && (
                <Card className="border-emerald-200 bg-emerald-50/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="h-4 w-4" /> Green Flags ({greenFlags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {greenFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Financial Independence countdown */}
          {(fiTarget > 0 || netWorthValue > 0) && (
            <Card className="border-violet-200 bg-violet-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-violet-700">
                  <Shield className="h-4 w-4" /> Financial Independence Countdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {fiTarget > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{fmt(netWorthValue)} of {fmt(fiTarget)}</span>
                      <span className="font-medium text-violet-700">{Math.round(fiProgress)}%</span>
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${fiProgress}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-bold text-violet-700">{fmt(fiRemaining)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">At current surplus</p>
                        <p className="font-bold text-violet-700">
                          {fiYears !== null ? `${fiYears} years` : monthlySurplus <= 0 ? "—" : "Already there"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Set a financial independence target in the <a href="/net-worth" className="text-violet-700 font-medium hover:underline">net worth tracker</a> to see a personalized countdown.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Psychological win: next debt to disappear */}
          {snowballNext && (
            <Card className="border-blue-200 bg-blue-50/20">
              <CardContent className="p-3 flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Next debt to disappear: <span className="font-bold">{snowballNext.name}</span> ({fmt(snowballNext.balance)})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Under snowball, this is your smallest balance — target it first for a quick win.
                  </p>
                </div>
                <a href="/debt-payoff" className="text-xs text-blue-700 hover:underline font-medium shrink-0">Plan it →</a>
              </CardContent>
            </Card>
          )}

          {/* Subscription waste alert */}
          {wastefulAmount > 0 && (
            <Card className="border-amber-200 bg-amber-50/20">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {fmt(wastefulAmount)}/month in subscriptions you rarely use
                  </p>
                  <p className="text-xs text-muted-foreground">{wastefulSubs.length} subscription{wastefulSubs.length > 1 ? "s" : ""} flagged — that is {fmt(wastefulAmount * 12)}/year</p>
                </div>
                <a href="/subscriptions" className="text-xs text-amber-700 hover:underline font-medium shrink-0">Review →</a>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommendations</h2>
              <div className="space-y-2">
                {recommendations.map((r, i) => (
                  <a key={i} href={r.link}>
                    <Card className={cn("card-hover",
                      r.priority === "critical" ? "border-red-200 bg-red-50/20" :
                      r.priority === "high" ? "border-amber-200 bg-amber-50/10" : ""
                    )}>
                      <CardContent className="p-3 flex items-center gap-3">
                        {r.priority === "critical" || r.priority === "high"
                          ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          : <Target className="h-4 w-4 text-emerald-500 shrink-0" />
                        }
                        <p className="text-xs flex-1">{r.text}</p>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick links to financial tools */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { href: "/budget", label: "Budget", color: "text-emerald-600" },
              { href: "/net-worth", label: "Net Worth", color: "text-violet-600" },
              { href: "/debt-payoff", label: "Debt Payoff", color: "text-red-600" },
              { href: "/subscriptions", label: "Subscriptions", color: "text-purple-600" },
              { href: "/compound-interest", label: "Investing", color: "text-blue-600" },
              { href: "/tax-estimator", label: "Taxes", color: "text-indigo-600" },
              { href: "/negotiation", label: "Negotiate", color: "text-teal-600" },
              { href: "/side-hustles", label: "Side Hustles", color: "text-amber-600" },
              { href: "/cost-of-living", label: "Cost of Living", color: "text-cyan-600" },
              { href: "/family-economics", label: "Family Econ", color: "text-rose-600" },
            ].map(t => (
              <a key={t.href} href={t.href}
                className="rounded-lg border border-border px-2 py-2 text-center hover:bg-muted/50 transition-colors">
                <span className={cn("text-[10px] font-medium", t.color)}>{t.label}</span>
              </a>
            ))}
          </div>
        </>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This dashboard gets smarter as you add data.</strong> Enter your budget and debts to see your savings
            rate and recommendations. Add subscriptions to catch waste. Track net worth to see your trajectory.
            Every tool you fill in makes this dashboard more useful — and more honest about where you stand.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
