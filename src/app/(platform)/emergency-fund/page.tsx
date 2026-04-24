"use client"

import { useEffect, useMemo, useState } from "react"
import { Shield, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle, Sparkles, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type BudgetExpense = { category: string; amount: number }
type BudgetData = { income?: number; expenses?: BudgetExpense[]; monthlyExpenses?: number }
type NetWorthData = { assets?: { name?: string; type?: string; category?: string; value: number }[] }
type FundSnapshot = { date: string; saved: number; target: number }

export default function EmergencyFundPage() {
  const [budget] = useSyncedStorage<BudgetData>("hfp-budget", {})
  const [netWorth] = useSyncedStorage<NetWorthData>("hfp-net-worth", {})
  const [history, setHistory] = useSyncedStorage<FundSnapshot[]>("hfp-emergency-fund-history", [])

  const autoExpenses = useMemo(() => {
    const total = (budget?.expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
    return total || budget?.monthlyExpenses || 0
  }, [budget])

  const autoSaved = useMemo(() => {
    return (netWorth?.assets ?? [])
      .filter(a => /cash|checking|savings|hisa|tfsa|emergency/i.test(`${a.name ?? ""} ${a.type ?? ""} ${a.category ?? ""}`))
      .reduce((s, a) => s + (a.value ?? 0), 0)
  }, [netWorth])

  const [monthlyExpenses, setMonthlyExpenses] = useState(4000)
  const [currentSaved, setCurrentSaved] = useState(2000)
  const [monthlySaving, setMonthlySaving] = useState(300)
  const [targetMonths, setTargetMonths] = useState(3)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) return
    if (autoExpenses > 0) setMonthlyExpenses(autoExpenses)
    if (autoSaved > 0) setCurrentSaved(autoSaved)
    setHydrated(true)
  }, [autoExpenses, autoSaved, hydrated])

  const target = monthlyExpenses * targetMonths
  const gap = Math.max(0, target - currentSaved)
  const monthsToGoal = monthlySaving > 0 ? Math.ceil(gap / monthlySaving) : Infinity
  const pctFunded = target > 0 ? Math.min(100, Math.round((currentSaved / target) * 100)) : 0

  const historyAnalysis = useMemo(() => {
    if (history.length < 2) return null
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const grown = last.saved - first.saved
    const days = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000)
    const perDay = grown / days
    const perMonth = perDay * 30
    return { sorted, first, last, grown, perMonth }
  }, [history])

  function saveSnapshot() {
    const today = new Date().toISOString().slice(0, 10)
    const existing = history.findIndex(h => h.date === today)
    const snap: FundSnapshot = { date: today, saved: currentSaved, target }
    if (existing >= 0) {
      const next = [...history]
      next[existing] = snap
      setHistory(next)
    } else {
      setHistory([...history, snap].slice(-365))
    }
  }

  const sparkPath = useMemo(() => {
    if (!historyAnalysis || historyAnalysis.sorted.length < 2) return ""
    const pts = historyAnalysis.sorted
    const W = 280, H = 40
    const max = Math.max(...pts.map(p => p.saved), 1)
    const min = Math.min(...pts.map(p => p.saved), 0)
    const range = max - min || 1
    return pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * W
      const y = H - ((p.saved - min) / range) * H
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    }).join(" ")
  }, [historyAnalysis])

  const levels = [
    { months: 1, label: "Starter", desc: "Covers a car repair or minor emergency", color: "text-amber-600" },
    { months: 3, label: "Basic Safety Net", desc: "Covers job loss while you find new work. Minimum recommended.", color: "text-blue-600" },
    { months: 6, label: "Solid Protection", desc: "Covers extended job loss, medical issue, or major home repair. Ideal for most families.", color: "text-emerald-600" },
    { months: 12, label: "Fortress", desc: "Near-bulletproof. Covers anything short of catastrophe. Gives you freedom to take career risks.", color: "text-violet-600" },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Emergency Fund Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How much you need, how fast you can build it, and why it is the foundation of all financial security.
        </p>
      </div>

      {/* Auto-filled from your data */}
      {(autoExpenses > 0 || autoSaved > 0) && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-900">
              Auto-filled from your data:
              {autoExpenses > 0 && <span> expenses <span className="font-semibold tabular-nums">${Math.round(autoExpenses).toLocaleString()}</span> (from budget)</span>}
              {autoExpenses > 0 && autoSaved > 0 && <span> ·</span>}
              {autoSaved > 0 && <span> cash savings <span className="font-semibold tabular-nums">${Math.round(autoSaved).toLocaleString()}</span> (from net worth)</span>}
              . Adjust below if needed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calculator */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Monthly essential expenses</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={monthlyExpenses || ""} onChange={e => setMonthlyExpenses(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Currently saved</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={currentSaved || ""} onChange={e => setCurrentSaved(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monthly savings toward fund</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={monthlySaving || ""} onChange={e => setMonthlySaving(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Target (months of expenses)</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 3, 6, 12].map(m => (
                  <button key={m} onClick={() => setTargetMonths(m)}
                    className={cn("rounded-lg border px-3 py-1.5 text-xs", targetMonths === m ? "border-blue-400 bg-blue-50 font-bold" : "border-border")}>{m}mo</button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className={cn("border-2", pctFunded >= 100 ? "border-emerald-300 bg-emerald-50/20" : pctFunded >= 50 ? "border-amber-300 bg-amber-50/20" : "border-red-300 bg-red-50/20")}>
        <CardContent className="p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            <Explain tip="An emergency fund is money set aside ONLY for unexpected expenses: job loss, car breakdown, medical emergency, home repair. It is NOT for vacations, shopping, or planned purchases. It sits in a high-interest savings account (HISA) where you can access it within 1-2 days">Emergency Fund</Explain> Progress
          </p>
          <p className={cn("text-4xl font-bold", pctFunded >= 100 ? "text-emerald-600" : pctFunded >= 50 ? "text-amber-600" : "text-red-500")}>{pctFunded}%</p>
          <div className="h-3 bg-muted rounded-full overflow-hidden mt-2 max-w-xs mx-auto">
            <div className={cn("h-full rounded-full", pctFunded >= 100 ? "bg-emerald-500" : pctFunded >= 50 ? "bg-amber-500" : "bg-red-400")}
              style={{ width: `${pctFunded}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm font-bold">${target.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Saved</p><p className="text-sm font-bold text-emerald-600">${currentSaved.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Gap</p><p className="text-sm font-bold text-red-500">${gap.toLocaleString()}</p></div>
          </div>
          {gap > 0 && monthlySaving > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              At ${monthlySaving}/month, you reach your goal in <strong>{monthsToGoal} months</strong> ({Math.round(monthsToGoal / 12 * 10) / 10} years)
            </p>
          )}
          {pctFunded >= 100 && (
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1 justify-center">
              <CheckCircle className="h-3 w-3" /> Your emergency fund is fully funded! Now invest everything above this amount.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Levels */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Emergency Fund Levels</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {levels.map((l, i) => {
            const levelTarget = monthlyExpenses * l.months
            const levelPct = levelTarget > 0 ? Math.min(100, Math.round((currentSaved / levelTarget) * 100)) : 0
            return (
              <div key={i} className={cn("rounded-lg border p-3", currentSaved >= levelTarget ? "border-emerald-200 bg-emerald-50/10" : "border-border")}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", l.color)}>{l.label}</span>
                    <Badge variant="outline" className="text-[9px]">{l.months} month{l.months > 1 ? "s" : ""}</Badge>
                  </div>
                  <span className="text-sm font-bold">${levelTarget.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                  <div className={cn("h-full rounded-full", levelPct >= 100 ? "bg-emerald-500" : "bg-blue-400")} style={{ width: `${levelPct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{l.desc}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Growth history */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Your Growth</p>
            <button onClick={saveSnapshot} className="flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] hover:bg-blue-50">
              <Camera className="h-3 w-3" /> Save today&apos;s snapshot
            </button>
          </div>
          {historyAnalysis ? (
            <div className="space-y-2">
              <svg viewBox="0 0 280 40" className="w-full h-10">
                <defs>
                  <linearGradient id="ef-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparkPath + ` L 280 40 L 0 40 Z`} fill="url(#ef-grad)" />
                <path d={sparkPath} stroke="#3b82f6" strokeWidth="1.5" fill="none" />
              </svg>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-[10px] text-muted-foreground">Since</p><p className="text-xs font-semibold">{new Date(historyAnalysis.first.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Grown</p><p className={cn("text-xs font-semibold tabular-nums", historyAnalysis.grown >= 0 ? "text-emerald-600" : "text-rose-600")}>{historyAnalysis.grown >= 0 ? "+" : ""}${Math.round(historyAnalysis.grown).toLocaleString()}</p></div>
                <div><p className="text-[10px] text-muted-foreground">~Pace</p><p className={cn("text-xs font-semibold tabular-nums", historyAnalysis.perMonth >= 0 ? "text-emerald-600" : "text-rose-600")}>{historyAnalysis.perMonth >= 0 ? "+" : ""}${Math.round(historyAnalysis.perMonth).toLocaleString()}<span className="text-[9px] text-muted-foreground font-normal">/mo</span></p></div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Save snapshots to see your emergency fund grow over time. {history.length === 1 ? `One snapshot saved on ${new Date(history[0].date).toLocaleDateString()} — save another to start a trend.` : ""}</p>
          )}
        </CardContent>
      </Card>

      {/* Where to keep it */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Where to Keep Your Emergency Fund</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
            <p><strong>Best:</strong> <Explain tip="A savings account that pays 3-5% interest, much higher than a regular savings account (0.01-0.05%). Offered by online banks (EQ Bank, Tangerine, Simplii) and credit unions. Your money is accessible within 1-2 days and grows while you wait.">High-Interest Savings Account (HISA)</Explain> inside your TFSA. Tax-free growth + instant access. EQ Bank (5%+), Tangerine, Simplii, or your credit union.</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5">
            <p><strong>Good:</strong> Regular HISA (non-registered). Still earns 3-5%. Interest is taxable but accessible.</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
            <p><strong>Bad:</strong> Regular chequing account (0% interest), under your mattress (earns nothing, at risk of theft/fire), or invested in stocks (could lose value exactly when you need it).</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The #1 financial priority:</strong> Before investing, before paying off low-interest debt, before
            anything else — build at least 1 month of expenses. Then grow to 3. Then 6. An emergency fund is the
            difference between a $1,000 car repair being an inconvenience vs a financial crisis. 56% of Canadians
            cannot cover a $1,000 emergency without borrowing. Do not be in that 56%.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/financial-dashboard" className="text-sm text-blue-600 hover:underline">Financial Dashboard</a>
        <a href="/debt-payoff" className="text-sm text-red-600 hover:underline">Debt Payoff</a>
        <a href="/investing" className="text-sm text-violet-600 hover:underline">Investing Basics</a>
      </div>
    </div>
  )
}
