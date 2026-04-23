"use client"

import { useState, useEffect, useMemo } from "react"
import { Target, Plus, Trash2, TrendingDown, DollarSign, Zap, Snowflake, ArrowRight, LineChart, Trophy, Camera, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

type DebtSnapshot = { date: string; totalDebt: number; debtCount: number }

interface Debt {
  id: string
  name: string
  balance: number
  rate: number // annual interest rate %
  minPayment: number
}

function calculatePayoff(debts: Debt[], extraPayment: number, method: "avalanche" | "snowball"): {
  months: number
  totalInterest: number
  schedule: { month: number; remaining: number }[]
} {
  if (debts.length === 0) return { months: 0, totalInterest: 0, schedule: [] }

  const working = debts.map(d => ({ ...d, remaining: d.balance }))
  let months = 0
  let totalInterest = 0
  const schedule: { month: number; remaining: number }[] = []

  while (working.some(d => d.remaining > 0) && months < 600) {
    months++
    let extra = extraPayment

    // Sort by method
    const sorted = [...working].filter(d => d.remaining > 0)
    if (method === "avalanche") sorted.sort((a, b) => b.rate - a.rate)
    else sorted.sort((a, b) => a.remaining - b.remaining)

    // Apply minimum payments + interest
    for (const debt of working) {
      if (debt.remaining <= 0) continue
      const interest = (debt.remaining * (debt.rate / 100)) / 12
      totalInterest += interest
      debt.remaining += interest
      const payment = Math.min(debt.remaining, debt.minPayment)
      debt.remaining -= payment
    }

    // Apply extra to highest priority debt
    for (const target of sorted) {
      const actual = working.find(d => d.id === target.id)!
      if (actual.remaining <= 0) continue
      const applied = Math.min(actual.remaining, extra)
      actual.remaining -= applied
      extra -= applied
      if (extra <= 0) break
    }

    // Freed-up minimums from paid-off debts roll into extra next month
    const totalRemaining = working.reduce((s, d) => s + Math.max(0, d.remaining), 0)
    schedule.push({ month: months, remaining: Math.round(totalRemaining) })
  }

  return { months, totalInterest: Math.round(totalInterest), schedule }
}

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [extraPayment, setExtraPayment] = useState(200)
  const [newName, setNewName] = useState("")
  const [newBalance, setNewBalance] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newMin, setNewMin] = useState("")
  const [history, setHistory] = useSyncedStorage<DebtSnapshot[]>("hfp-debt-history", [])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-debts")
    if (stored) {
      const data = JSON.parse(stored)
      setDebts(data.debts ?? [])
      setExtraPayment(data.extra ?? 200)
    }
  }, [])

  function save(d: Debt[], extra: number) {
    setDebts(d)
    setExtraPayment(extra)
    localStorage.setItem("hfp-debts", JSON.stringify({ debts: d, extra }))
    const total = d.reduce((s, x) => s + x.balance, 0)
    const today = new Date().toISOString().slice(0, 10)
    const existing = history.findIndex(h => h.date === today)
    const snap: DebtSnapshot = { date: today, totalDebt: total, debtCount: d.length }
    if (existing >= 0) {
      const next = [...history]
      next[existing] = snap
      setHistory(next)
    } else {
      setHistory([...history, snap].slice(-365))
    }
  }

  function addDebt() {
    if (!newName || !newBalance) return
    save([...debts, {
      id: Date.now().toString(36),
      name: newName.trim(),
      balance: Number(newBalance) || 0,
      rate: Number(newRate) || 0,
      minPayment: Number(newMin) || 25,
    }], extraPayment)
    setNewName(""); setNewBalance(""); setNewRate(""); setNewMin("")
  }

  function removeDebt(id: string) { save(debts.filter(d => d.id !== id), extraPayment) }

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const totalMinimums = debts.reduce((s, d) => s + d.minPayment, 0)
  const avgRate = debts.length > 0 ? Math.round(debts.reduce((s, d) => s + d.rate, 0) / debts.length * 10) / 10 : 0

  const avalanche = calculatePayoff(debts, extraPayment, "avalanche")
  const snowball = calculatePayoff(debts, extraPayment, "snowball")
  const minOnly = calculatePayoff(debts, 0, "avalanche")
  const plus100 = calculatePayoff(debts, extraPayment + 100, "avalanche")
  const plus500 = calculatePayoff(debts, extraPayment + 500, "avalanche")

  const avalancheSaved = minOnly.totalInterest - avalanche.totalInterest
  const snowballSaved = minOnly.totalInterest - snowball.totalInterest

  const progress = useMemo(() => {
    if (history.length < 2) return null
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const paidOff = first.totalDebt - last.totalDebt
    const pctPaid = first.totalDebt > 0 ? (paidOff / first.totalDebt) * 100 : 0
    const days = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000)
    const perDay = paidOff / days
    return { sorted, first, last, paidOff, pctPaid, perDay, peakDebt: Math.max(...sorted.map(s => s.totalDebt)) }
  }, [history])

  const nextSnowballTarget = useMemo(() => {
    if (debts.length === 0) return null
    const sorted = [...debts].filter(d => d.balance > 0).sort((a, b) => a.balance - b.balance)
    if (sorted.length === 0) return null
    const t = sorted[0]
    const monthlyTotal = t.minPayment + extraPayment
    if (monthlyTotal <= 0) return null
    const months = Math.ceil(t.balance / monthlyTotal)
    return { debt: t, months }
  }, [debts, extraPayment])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Debt Payoff Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">Enter your debts. See exactly when you will be free — and how much faster with a strategy.</p>
      </div>

      {/* Stats */}
      {debts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-500">${totalDebt.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total debt</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{avgRate}%</p>
            <p className="text-xs text-muted-foreground">Avg rate</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-violet-600">${totalMinimums.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Min payments/mo</p>
          </CardContent></Card>
        </div>
      )}

      {/* Add debt */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Add a Debt</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (e.g. Visa, Student Loan)" />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="Balance" className="pl-7" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="Interest rate %" type="number" step="0.1" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input value={newMin} onChange={e => setNewMin(e.target.value)} placeholder="Min payment/mo" className="pl-7" type="number" />
            </div>
          </div>
          <Button onClick={addDebt} disabled={!newName || !newBalance} className="w-full"><Plus className="h-4 w-4" /> Add Debt</Button>
        </CardContent>
      </Card>

      {/* Debt list */}
      {debts.length > 0 && (
        <div className="space-y-2">
          {debts.sort((a, b) => b.rate - a.rate).map(d => (
            <Card key={d.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{d.name}</span>
                    <Badge variant="outline" className="text-[9px] text-red-500 border-red-200">{d.rate}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">${d.balance.toLocaleString()} · ${d.minPayment}/mo min</p>
                </div>
                <button onClick={() => removeDebt(d.id)} className="text-muted-foreground/30 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Extra payment slider */}
      {debts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Extra monthly payment</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">$</span>
                <Input type="number" value={extraPayment} onChange={e => save(debts, Number(e.target.value) || 0)}
                  className="w-24 h-8 text-sm text-right" />
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <input type="range" min={0} max={2000} step={25} value={extraPayment}
              onChange={e => save(debts, Number(e.target.value))}
              className="w-full accent-violet-500" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>$0</span><span>$500</span><span>$1,000</span><span>$1,500</span><span>$2,000</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison */}
      {debts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Your Payoff Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Minimum only */}
            <Card className="border-red-200 bg-red-50/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Minimums Only</p>
                <p className="text-2xl font-bold text-red-600">{Math.round(minOnly.months / 12 * 10) / 10} years</p>
                <p className="text-xs text-muted-foreground">{minOnly.months} months</p>
                <p className="text-sm font-medium text-red-500 mt-2">${minOnly.totalInterest.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">total interest paid</p>
              </CardContent>
            </Card>

            {/* Avalanche */}
            <Card className={cn("border-2", avalanche.totalInterest <= snowball.totalInterest ? "border-emerald-300 bg-emerald-50/20" : "border-blue-200 bg-blue-50/20")}>
              <CardContent className="p-4 text-center">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" /> <Explain tip="Pay minimums on everything, then throw all extra money at the debt with the HIGHEST interest rate. Mathematically saves the most money">Avalanche</Explain>
                </p>
                <p className="text-2xl font-bold text-emerald-600">{Math.round(avalanche.months / 12 * 10) / 10} years</p>
                <p className="text-xs text-muted-foreground">{avalanche.months} months</p>
                <p className="text-sm font-medium text-emerald-600 mt-2">${avalanche.totalInterest.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">total interest</p>
                <p className="text-xs font-bold text-emerald-700 mt-1">Saves ${avalancheSaved.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Snowball */}
            <Card className={cn("border-2", snowball.totalInterest < avalanche.totalInterest ? "border-emerald-300 bg-emerald-50/20" : "border-blue-200 bg-blue-50/20")}>
              <CardContent className="p-4 text-center">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                  <Snowflake className="h-3 w-3" /> <Explain tip="Pay minimums on everything, then throw all extra money at the SMALLEST balance first. You pay off debts faster (quick wins) which builds motivation — even though it costs slightly more in interest">Snowball</Explain>
                </p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(snowball.months / 12 * 10) / 10} years</p>
                <p className="text-xs text-muted-foreground">{snowball.months} months</p>
                <p className="text-sm font-medium text-blue-600 mt-2">${snowball.totalInterest.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">total interest</p>
                <p className="text-xs font-bold text-blue-700 mt-1">Saves ${snowballSaved.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Time saved */}
          <Card className="border-violet-200 bg-violet-50/20">
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">
                {extraPayment > 0 ? (
                  <>Adding <strong>${extraPayment}/month</strong> extra pays off all debt <strong>{minOnly.months - avalanche.months} months sooner</strong> and
                  saves <strong>${avalancheSaved.toLocaleString()}</strong> in interest using the avalanche method.
                  {avalanche.totalInterest !== snowball.totalInterest && (
                    <> The snowball method costs <strong>${Math.abs(avalanche.totalInterest - snowball.totalInterest).toLocaleString()}</strong> more in interest but gives you quicker psychological wins.</>
                  )}</>
                ) : (
                  <>Paying only minimums means <strong>{Math.round(minOnly.months / 12 * 10) / 10} years</strong> of debt and <strong>${minOnly.totalInterest.toLocaleString()}</strong> in interest.
                  Even <strong>$100/month extra</strong> can cut years off your payoff date. Use the slider above to see the impact.</>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress tracker (if history exists) */}
      {progress && progress.paidOff > 0 && (
        <Card className="border-emerald-300 bg-emerald-50/30">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-600" /> Your Progress</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, progress.pctPaid)}%` }} />
              </div>
              <span className="text-sm font-bold text-emerald-700 tabular-nums">{Math.round(progress.pctPaid)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ve paid off <span className="font-bold text-emerald-700 tabular-nums">${Math.max(0, Math.round(progress.paidOff)).toLocaleString()}</span> since you started tracking on {new Date(progress.first.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ~<span className="tabular-nums">${Math.round(progress.perDay).toLocaleString()}/day</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payoff curve chart */}
      {debts.length > 0 && avalanche.schedule.length > 1 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LineChart className="h-4 w-4 text-violet-600" /> Payoff Curve</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const mAva = avalanche.schedule
              const mMin = minOnly.schedule
              const mSnow = snowball.schedule
              const W = 540, H = 160, PAD = 28
              const maxMonths = Math.max(mAva.length, mMin.length, mSnow.length, 1)
              const maxDebt = Math.max(...mMin.map(p => p.remaining), ...mAva.map(p => p.remaining), ...mSnow.map(p => p.remaining), 1)
              const xs = (m: number) => PAD + (m / maxMonths) * (W - PAD * 2)
              const ys = (v: number) => H - PAD - (v / maxDebt) * (H - PAD * 2)
              const toPath = (sch: { month: number; remaining: number }[]) => sch.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(p.month)} ${ys(p.remaining)}`).join(" ")
              const yrs = Math.max(1, Math.ceil(maxMonths / 12))
              return (
                <div className="w-full overflow-x-auto">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl h-40">
                    {[0, 0.25, 0.5, 0.75, 1].map(f => (
                      <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)} stroke="currentColor" className="text-slate-200" strokeDasharray="2 2" />
                    ))}
                    <path d={toPath(mMin)} stroke="#ef4444" fill="none" strokeWidth="1.5" opacity="0.6" />
                    <path d={toPath(mSnow)} stroke="#3b82f6" fill="none" strokeWidth="1.5" />
                    <path d={toPath(mAva)} stroke="#10b981" fill="none" strokeWidth="2" />
                    {Array.from({ length: yrs + 1 }, (_, i) => i * 12).filter(m => m <= maxMonths).map(m => (
                      <text key={m} x={xs(m)} y={H - 8} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 8 }}>{m === 0 ? "now" : `${m / 12}y`}</text>
                    ))}
                    <text x={PAD} y={PAD - 4} className="fill-slate-400" style={{ fontSize: 8 }}>${Math.round(maxDebt).toLocaleString()}</text>
                    <text x={PAD} y={H - PAD + 12} className="fill-slate-400" style={{ fontSize: 8 }}>$0</text>
                  </svg>
                </div>
              )
            })()}
            <div className="flex gap-4 text-xs mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500" /> Avalanche</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500" /> Snowball</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 opacity-60" /> Minimums only</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra-payment scenarios */}
      {debts.length > 0 && totalDebt > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-600" /> What if you paid more?</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border bg-white p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current +$0</p>
                <p className="text-sm font-bold tabular-nums">{(avalanche.months / 12).toFixed(1)} yrs</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">${avalanche.totalInterest.toLocaleString()} interest</p>
              </div>
              <div className="rounded-lg border-2 border-amber-300 bg-amber-50/40 p-3">
                <p className="text-[10px] text-amber-700 uppercase tracking-wide font-semibold">+$100/mo</p>
                <p className="text-sm font-bold text-amber-700 tabular-nums">{(plus100.months / 12).toFixed(1)} yrs</p>
                <p className="text-[10px] text-emerald-700 font-semibold tabular-nums">Saves ${Math.max(0, avalanche.totalInterest - plus100.totalInterest).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{avalanche.months - plus100.months}mo sooner</p>
              </div>
              <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/40 p-3">
                <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">+$500/mo</p>
                <p className="text-sm font-bold text-emerald-700 tabular-nums">{(plus500.months / 12).toFixed(1)} yrs</p>
                <p className="text-[10px] text-emerald-700 font-semibold tabular-nums">Saves ${Math.max(0, avalanche.totalInterest - plus500.totalInterest).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{avalanche.months - plus500.months}mo sooner</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next snowball target */}
      {nextSnowballTarget && (
        <Card className="border-blue-300 bg-blue-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Snowflake className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wide text-blue-700 font-semibold">Next to disappear (snowball)</p>
              <p className="text-sm font-semibold">{nextSnowballTarget.debt.name} — ${nextSnowballTarget.debt.balance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">At ${(nextSnowballTarget.debt.minPayment + extraPayment).toLocaleString()}/mo, gone in ~<span className="font-bold text-blue-700 tabular-nums">{nextSnowballTarget.months}</span> months. That momentum rolls into the next debt.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why */}
      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Avalanche vs Snowball:</strong> Mathematically, avalanche (highest interest first) always saves more money.
            But research from Harvard Business Review found that snowball (smallest balance first) has a higher completion
            rate because the psychological boost of paying off a debt keeps people motivated. The best method is the one
            you actually stick with. Both are dramatically better than minimums only.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/net-worth" className="text-sm text-violet-600 hover:underline">Net Worth Tracker</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}
