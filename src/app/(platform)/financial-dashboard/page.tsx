"use client"

import { useState, useEffect } from "react"
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, CreditCard,
  Target, ArrowRight, AlertTriangle, CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function FinancialDashboardPage() {
  const [budget, setBudget] = useState<any>(null)
  const [debts, setDebts] = useState<any>(null)
  const [netWorth, setNetWorth] = useState<any>(null)
  const [subs, setSubs] = useState<any>(null)

  useEffect(() => {
    // Pull data from all financial tools
    const b = localStorage.getItem("hfp-budget")
    const d = localStorage.getItem("hfp-debts")
    const n = localStorage.getItem("hfp-networth")
    const s = localStorage.getItem("hfp-subscriptions")
    if (b) setBudget(JSON.parse(b))
    if (d) setDebts(JSON.parse(d))
    if (n) setNetWorth(JSON.parse(n))
    if (s) setSubs(JSON.parse(s))
  }, [])

  // Calculate aggregates
  const totalIncome = budget?.incomes?.reduce((s: number, v: number) => s + v, 0) || 0
  const totalExpenses = budget?.expenses?.flat()?.reduce((s: number, v: number) => s + v, 0) || 0
  const monthlySurplus = totalIncome - totalExpenses

  const totalDebt = debts?.debts?.reduce((s: number, d: any) => s + d.balance, 0) || 0
  const debtCount = debts?.debts?.length || 0
  const highestRate = debts?.debts?.length > 0
    ? Math.max(...debts.debts.map((d: any) => d.rate))
    : 0

  const nwEntries = netWorth?.entries || []
  const totalAssets = nwEntries.filter((e: any) => e.type === "asset").reduce((s: number, e: any) => s + e.amount, 0)
  const totalLiabilities = nwEntries.filter((e: any) => e.type === "liability").reduce((s: number, e: any) => s + e.amount, 0)
  const netWorthValue = totalAssets - totalLiabilities

  const subList = subs?.subs || []
  const totalSubs = subList.reduce((s: number, sub: any) => s + sub.cost, 0)
  const wastefulSubs = subList.filter((s: any) => s.lastUsed === "rarely" || s.lastUsed === "forgot")
  const wastefulAmount = wastefulSubs.reduce((s: number, sub: any) => s + sub.cost, 0)

  const savingsRate = totalIncome > 0 ? Math.round((monthlySurplus / totalIncome) * 100) : 0
  const debtToIncome = totalIncome > 0 ? Math.round((totalDebt / (totalIncome * 12)) * 100) : 0

  const hasData = totalIncome > 0 || totalDebt > 0 || nwEntries.length > 0 || subList.length > 0

  // Financial health score (0-100)
  let healthScore = 50
  if (savingsRate >= 20) healthScore += 15
  else if (savingsRate >= 10) healthScore += 8
  else if (savingsRate < 0) healthScore -= 15
  if (totalDebt === 0) healthScore += 15
  else if (debtToIncome < 30) healthScore += 5
  else if (debtToIncome > 80) healthScore -= 15
  if (netWorthValue > 0) healthScore += 10
  if (wastefulAmount === 0 && subList.length > 0) healthScore += 5
  else if (wastefulAmount > 50) healthScore -= 5
  healthScore = Math.max(0, Math.min(100, healthScore))

  // Personalized recommendations
  const recommendations: { text: string; link: string; priority: string }[] = []
  if (totalIncome === 0) recommendations.push({ text: "Set up your budget — track where every dollar goes", link: "/budget", priority: "high" })
  if (savingsRate < 10 && totalIncome > 0) recommendations.push({ text: `Savings rate is ${savingsRate}%. Target: 20%. Review your budget for cuts`, link: "/budget", priority: "high" })
  if (savingsRate < 0) recommendations.push({ text: "You are spending more than you earn. This is urgent.", link: "/budget", priority: "critical" })
  if (totalDebt > 0) recommendations.push({ text: `$${totalDebt.toLocaleString()} in debt. Use the debt payoff calculator to make a plan`, link: "/debt-payoff", priority: totalDebt > 50000 ? "high" : "medium" })
  if (highestRate > 15) recommendations.push({ text: `You have debt at ${highestRate}% interest. Pay this FIRST (avalanche method)`, link: "/debt-payoff", priority: "high" })
  if (wastefulAmount > 0) recommendations.push({ text: `$${wastefulAmount.toFixed(0)}/month in forgotten subscriptions. Cancel them.`, link: "/subscriptions", priority: "medium" })
  if (nwEntries.length === 0) recommendations.push({ text: "Track your net worth — the single most important number", link: "/net-worth", priority: "medium" })
  if (totalIncome > 0 && debtCount === 0 && savingsRate >= 20) recommendations.push({ text: "You are in great shape. Start investing your surplus.", link: "/compound-interest", priority: "low" })
  if (recommendations.length === 0 && hasData) recommendations.push({ text: "Keep going — you are on track!", link: "/wins", priority: "low" })

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
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                <Explain tip="A score from 0-100 based on your savings rate, debt level, net worth, and subscription waste. Not a credit score — a personal financial health indicator based on YOUR data">Financial Health Score</Explain>
              </p>
              <p className={cn("text-4xl font-bold",
                healthScore >= 70 ? "text-emerald-600" : healthScore >= 40 ? "text-amber-600" : "text-red-500"
              )}>{healthScore}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {healthScore >= 80 ? "Excellent — you are building wealth" :
                 healthScore >= 60 ? "Good — room for improvement" :
                 healthScore >= 40 ? "Needs attention — some financial stress" :
                 "Urgent — take action on the recommendations below"}
              </p>
            </CardContent>
          </Card>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {totalIncome > 0 && (
              <Card><CardContent className="p-3 text-center">
                <p className={cn("text-lg font-bold", monthlySurplus >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {monthlySurplus >= 0 ? "+" : ""}${monthlySurplus.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Monthly surplus</p>
              </CardContent></Card>
            )}
            <Card><CardContent className="p-3 text-center">
              <p className={cn("text-lg font-bold", netWorthValue >= 0 ? "text-emerald-600" : "text-red-500")}>
                ${Math.abs(netWorthValue).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">{netWorthValue >= 0 ? "Net worth" : "Negative net worth"}</p>
            </CardContent></Card>
            {totalDebt > 0 && (
              <Card className="border-red-100"><CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-red-500">${totalDebt.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total debt ({debtCount})</p>
              </CardContent></Card>
            )}
            {totalIncome > 0 && (
              <Card><CardContent className="p-3 text-center">
                <p className={cn("text-lg font-bold", savingsRate >= 20 ? "text-emerald-600" : savingsRate >= 10 ? "text-amber-600" : "text-red-500")}>
                  {savingsRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">Savings rate</p>
              </CardContent></Card>
            )}
          </div>

          {/* Income vs expenses bar */}
          {totalIncome > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Income: ${totalIncome.toLocaleString()}/mo</span>
                  <span>Expenses: ${totalExpenses.toLocaleString()}/mo</span>
                </div>
                <div className="h-4 bg-muted/30 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-400 rounded-l-full" style={{ width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` }} />
                  {monthlySurplus > 0 && <div className="h-full bg-emerald-400 rounded-r-full flex-1" />}
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-400" /> Expenses</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-400" /> Surplus</span>
                </div>
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
                    ${wastefulAmount.toFixed(0)}/month in subscriptions you rarely use
                  </p>
                  <p className="text-xs text-muted-foreground">{wastefulSubs.length} subscription{wastefulSubs.length > 1 ? "s" : ""} flagged — that is ${(wastefulAmount * 12).toFixed(0)}/year</p>
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
