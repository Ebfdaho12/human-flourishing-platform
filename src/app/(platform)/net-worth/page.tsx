"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, Target, Award, AlertTriangle, Activity, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface Entry {
  id: string
  name: string
  type: "asset" | "liability"
  category: string
  amount: number
}

interface Snapshot {
  date: string           // YYYY-MM-DD
  netWorth: number
  assets: number
  liabilities: number
}

const ASSET_CATEGORIES = ["Cash & Savings", "Investments", "Retirement (401k/IRA)", "Real Estate", "Vehicle", "Crypto", "Business", "Other Asset"]
const LIABILITY_CATEGORIES = ["Mortgage", "Student Loans", "Car Loan", "Credit Card", "Medical Debt", "Personal Loan", "Other Debt"]

// Consolidated allocation buckets
const ASSET_BUCKETS: Record<string, { bucket: string; color: string }> = {
  "Cash & Savings": { bucket: "Cash", color: "#10b981" },
  "Investments": { bucket: "Investments", color: "#6366f1" },
  "Retirement (401k/IRA)": { bucket: "Investments", color: "#6366f1" },
  "Real Estate": { bucket: "Real Estate", color: "#f59e0b" },
  "Vehicle": { bucket: "Other", color: "#94a3b8" },
  "Crypto": { bucket: "Crypto", color: "#ec4899" },
  "Business": { bucket: "Other", color: "#94a3b8" },
  "Other Asset": { bucket: "Other", color: "#94a3b8" },
}
const BUCKET_COLORS: Record<string, string> = {
  "Cash": "#10b981",
  "Investments": "#6366f1",
  "Real Estate": "#f59e0b",
  "Crypto": "#ec4899",
  "Other": "#94a3b8",
}

const LIABILITY_COLORS: Record<string, string> = {
  "Mortgage": "#6366f1",
  "Student Loans": "#f59e0b",
  "Car Loan": "#8b5cf6",
  "Credit Card": "#ef4444",
  "Medical Debt": "#ec4899",
  "Personal Loan": "#f97316",
  "Other Debt": "#94a3b8",
}

function todayKey(): string {
  return new Date().toISOString().split("T")[0]
}

function daysBetween(a: string, b: string): number {
  const ta = new Date(a + "T00:00:00").getTime()
  const tb = new Date(b + "T00:00:00").getTime()
  return Math.round((tb - ta) / 86400000)
}

function monthKey(date: string): string {
  return date.slice(0, 7) // YYYY-MM
}

function formatMoney(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `${v < 0 ? "-" : ""}$${Math.round(abs / 1000)}k`
  return `${v < 0 ? "-" : ""}$${abs.toLocaleString()}`
}

export default function NetWorthPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<"asset" | "liability">("asset")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [history, setHistory] = useState<Snapshot[]>([])
  const [chartRange, setChartRange] = useState<90 | 365 | 0>(365) // 0 = all
  const [fiTarget, setFiTarget] = useState<number | "">("")
  const [budgetSurplus, setBudgetSurplus] = useState<number | null>(null)
  const [budgetIncome, setBudgetIncome] = useState<number | null>(null)

  // Load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hfp-networth")
      if (stored) {
        const data = JSON.parse(stored)
        setEntries(data.entries ?? [])
      }
    } catch {}

    try {
      const histStored = localStorage.getItem("hfp-networth-history")
      if (histStored) {
        const hist: Snapshot[] = JSON.parse(histStored)
        // normalize & sort
        const clean = hist
          .filter(h => h && h.date && typeof h.netWorth === "number")
          .map(h => ({
            date: h.date,
            netWorth: h.netWorth,
            assets: h.assets ?? 0,
            liabilities: h.liabilities ?? 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
        setHistory(clean)
      } else {
        // migrate legacy history from hfp-networth if present
        try {
          const legacy = localStorage.getItem("hfp-networth")
          if (legacy) {
            const data = JSON.parse(legacy)
            if (Array.isArray(data.history) && data.history.length > 0) {
              const migrated: Snapshot[] = data.history
                .filter((h: any) => h && h.date && typeof h.netWorth === "number")
                .map((h: any) => ({ date: h.date, netWorth: h.netWorth, assets: 0, liabilities: 0 }))
                .sort((a: Snapshot, b: Snapshot) => a.date.localeCompare(b.date))
              setHistory(migrated)
              localStorage.setItem("hfp-networth-history", JSON.stringify(migrated))
            }
          }
        } catch {}
      }
    } catch {}

    try {
      const fi = localStorage.getItem("hfp-networth-fi-target")
      if (fi) setFiTarget(Number(fi) || "")
    } catch {}

    try {
      const budget = localStorage.getItem("hfp-budget")
      if (budget) {
        const data = JSON.parse(budget)
        const inc = Array.isArray(data.incomes) ? data.incomes.reduce((s: number, v: number) => s + (Number(v) || 0), 0) : 0
        const exp = Array.isArray(data.expenses)
          ? data.expenses.reduce((s: number, row: number[]) => s + row.reduce((t, v) => t + (Number(v) || 0), 0), 0)
          : 0
        if (inc > 0) {
          setBudgetIncome(inc)
          setBudgetSurplus(inc - exp)
        }
      }
    } catch {}
  }, [])

  // Derived totals
  const totalAssets = entries.filter(e => e.type === "asset").reduce((s, e) => s + e.amount, 0)
  const totalLiabilities = entries.filter(e => e.type === "liability").reduce((s, e) => s + e.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  // Persistence helpers
  function persistEntries(updated: Entry[]) {
    setEntries(updated)
    localStorage.setItem("hfp-networth", JSON.stringify({ entries: updated }))
    recordSnapshot(updated)
  }

  function recordSnapshot(updated: Entry[]) {
    const a = updated.filter(e => e.type === "asset").reduce((s, e) => s + e.amount, 0)
    const l = updated.filter(e => e.type === "liability").reduce((s, e) => s + e.amount, 0)
    const nw = a - l
    const today = todayKey()
    const filtered = history.filter(h => h.date !== today)
    const next = [...filtered, { date: today, netWorth: nw, assets: a, liabilities: l }].sort((x, y) => x.date.localeCompare(y.date))
    setHistory(next)
    localStorage.setItem("hfp-networth-history", JSON.stringify(next))
  }

  function addEntry() {
    if (!name || !amount || !category) return
    const entry: Entry = { id: Date.now().toString(36), name, type, category, amount: parseFloat(amount) }
    persistEntries([...entries, entry])
    setName(""); setAmount(""); setCategory("")
  }

  function deleteEntry(id: string) {
    persistEntries(entries.filter(e => e.id !== id))
  }

  function updateFiTarget(val: string) {
    const n = Number(val)
    if (!val) { setFiTarget(""); localStorage.removeItem("hfp-networth-fi-target"); return }
    if (isFinite(n) && n >= 0) {
      setFiTarget(n)
      localStorage.setItem("hfp-networth-fi-target", String(n))
    }
  }

  // ===== Historical analysis =====
  const latestSnapshot: Snapshot | null = history.length > 0 ? history[history.length - 1] : null
  const prevSnapshot: Snapshot | null = history.length > 1 ? history[history.length - 2] : null
  const sinceLastChange = prevSnapshot ? netWorth - prevSnapshot.netWorth : null

  // Find snapshot closest to N days ago (for velocity calcs)
  function snapshotNDaysAgo(n: number): Snapshot | null {
    if (!latestSnapshot) return null
    const targetDate = new Date(latestSnapshot.date + "T00:00:00")
    targetDate.setDate(targetDate.getDate() - n)
    const targetKey = targetDate.toISOString().split("T")[0]
    // Find snapshot on-or-before targetKey
    let best: Snapshot | null = null
    for (const h of history) {
      if (h.date <= targetKey) best = h
      else break
    }
    // If we didn't find one on-or-before, use oldest available
    if (!best && history.length > 0) best = history[0]
    return best
  }

  function velocity(daysBack: number): { dollarsPerWeek: number; pctPerWeek: number; days: number } | null {
    if (!latestSnapshot) return null
    const past = snapshotNDaysAgo(daysBack)
    if (!past || past.date === latestSnapshot.date) return null
    const actualDays = daysBetween(past.date, latestSnapshot.date)
    if (actualDays < 1) return null
    const delta = latestSnapshot.netWorth - past.netWorth
    const dollarsPerWeek = (delta / actualDays) * 7
    const pctPerWeek = past.netWorth !== 0 ? (delta / Math.abs(past.netWorth)) * (7 / actualDays) * 100 : 0
    return { dollarsPerWeek, pctPerWeek, days: actualDays }
  }

  const v30 = velocity(30)
  const v90 = velocity(90)
  const v365 = velocity(365)

  // ===== Allocation buckets =====
  const allocation: { bucket: string; amount: number; pct: number; color: string }[] = (() => {
    const buckets: Record<string, number> = {}
    entries.filter(e => e.type === "asset").forEach(e => {
      const b = ASSET_BUCKETS[e.category]?.bucket ?? "Other"
      buckets[b] = (buckets[b] ?? 0) + e.amount
    })
    const entriesList = Object.entries(buckets).map(([bucket, amt]) => ({
      bucket,
      amount: amt,
      pct: totalAssets > 0 ? (amt / totalAssets) * 100 : 0,
      color: BUCKET_COLORS[bucket] ?? "#94a3b8",
    })).sort((a, b) => b.amount - a.amount)
    return entriesList
  })()

  // ===== Liability breakdown =====
  const liabilityBreakdown: { category: string; amount: number; pct: number; color: string }[] = (() => {
    const buckets: Record<string, number> = {}
    entries.filter(e => e.type === "liability").forEach(e => {
      buckets[e.category] = (buckets[e.category] ?? 0) + e.amount
    })
    return Object.entries(buckets).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      pct: totalLiabilities > 0 ? (amt / totalLiabilities) * 100 : 0,
      color: LIABILITY_COLORS[cat] ?? "#94a3b8",
    })).sort((a, b) => b.amount - a.amount)
  })()

  // ===== Debt-to-asset ratio =====
  const dta = totalAssets > 0 ? totalLiabilities / totalAssets : null
  const dtaLabel = dta === null ? "—" : dta < 0.3 ? "Healthy" : dta < 0.5 ? "Manageable" : dta < 0.8 ? "Elevated" : "Critical"
  const dtaColor = dta === null ? "slate" : dta < 0.3 ? "emerald" : dta < 0.5 ? "amber" : dta < 0.8 ? "orange" : "red"

  // ===== Savings rate =====
  const savingsRate = budgetIncome && budgetIncome > 0 && budgetSurplus !== null
    ? Math.round((budgetSurplus / budgetIncome) * 100)
    : null

  // ===== Years-to-FI =====
  const fiProjection: { years: number; date: string; rateUsed: string } | null = (() => {
    if (!fiTarget || fiTarget <= 0) return null
    if (netWorth >= fiTarget) return { years: 0, date: todayKey(), rateUsed: "reached" }
    // Use best available velocity (prefer 1y, then 90d, then 30d, then monthly surplus)
    let dollarsPerYear: number | null = null
    let rateUsed = ""
    if (v365 && v365.dollarsPerWeek > 0) { dollarsPerYear = v365.dollarsPerWeek * 52; rateUsed = "1-year velocity" }
    else if (v90 && v90.dollarsPerWeek > 0) { dollarsPerYear = v90.dollarsPerWeek * 52; rateUsed = "90-day velocity" }
    else if (v30 && v30.dollarsPerWeek > 0) { dollarsPerYear = v30.dollarsPerWeek * 52; rateUsed = "30-day velocity" }
    else if (budgetSurplus && budgetSurplus > 0) { dollarsPerYear = budgetSurplus * 12; rateUsed = "monthly surplus" }
    if (!dollarsPerYear || dollarsPerYear <= 0) return null
    // Compound at 7% real return on existing balance; contributions grow at same
    const r = 0.07
    const P = netWorth
    const C = dollarsPerYear
    const T = fiTarget as number
    // Solve: P*(1+r)^t + C*((1+r)^t - 1)/r = T
    // (P + C/r)*(1+r)^t = T + C/r
    const lhsBase = P + C / r
    const rhs = T + C / r
    if (lhsBase <= 0 || rhs / lhsBase <= 1) return null
    const years = Math.log(rhs / lhsBase) / Math.log(1 + r)
    if (!isFinite(years) || years < 0 || years > 80) return null
    const target = new Date()
    target.setFullYear(target.getFullYear() + Math.floor(years))
    target.setMonth(target.getMonth() + Math.round((years - Math.floor(years)) * 12))
    return { years, date: target.toISOString().split("T")[0], rateUsed }
  })()

  // ===== Chart data (time-series) =====
  const chartData: Snapshot[] = (() => {
    if (history.length === 0) return []
    if (chartRange === 0) return history
    const latest = history[history.length - 1]
    const cutoff = new Date(latest.date + "T00:00:00")
    cutoff.setDate(cutoff.getDate() - chartRange)
    const cutoffKey = cutoff.toISOString().split("T")[0]
    return history.filter(h => h.date >= cutoffKey)
  })()

  // ===== Monthly table =====
  const monthlyRows: { month: string; start: number; end: number; delta: number; pct: number }[] = (() => {
    if (history.length === 0) return []
    const byMonth: Record<string, Snapshot[]> = {}
    history.forEach(h => {
      const m = monthKey(h.date)
      byMonth[m] = byMonth[m] ?? []
      byMonth[m].push(h)
    })
    const months = Object.keys(byMonth).sort()
    const rows = months.map(m => {
      const snaps = byMonth[m].sort((a, b) => a.date.localeCompare(b.date))
      const end = snaps[snaps.length - 1].netWorth
      // "start" = last snapshot of previous month if available, else first of this month
      const idx = months.indexOf(m)
      const prevMonth = idx > 0 ? months[idx - 1] : null
      const start = prevMonth
        ? byMonth[prevMonth][byMonth[prevMonth].length - 1].netWorth
        : snaps[0].netWorth
      const delta = end - start
      const pct = start !== 0 ? (delta / Math.abs(start)) * 100 : 0
      return { month: m, start, end, delta, pct }
    })
    return rows.slice(-12).reverse()
  })()

  // Best / worst month
  const bestMonth = monthlyRows.length > 0
    ? [...monthlyRows].sort((a, b) => b.delta - a.delta)[0]
    : null
  const worstMonth = monthlyRows.length > 0
    ? [...monthlyRows].sort((a, b) => a.delta - b.delta)[0]
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Net Worth Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">Assets minus liabilities — the single most important number in personal finance.</p>
      </div>

      {/* Net worth headline */}
      <Card className={cn("border-2", netWorth >= 0 ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30")}>
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            <Explain tip="Your net worth is everything you OWN (assets) minus everything you OWE (debts). If you own a $300K house but owe $200K on the mortgage, that part of your net worth is $100K. It is the single most important number in personal finance.">Net Worth</Explain>
          </p>
          <p className={cn("text-5xl font-bold", netWorth >= 0 ? "text-emerald-600" : "text-red-600")}>
            {netWorth < 0 ? "-" : ""}${Math.abs(netWorth).toLocaleString()}
          </p>
          {sinceLastChange !== null && sinceLastChange !== 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {sinceLastChange >= 0
                ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                : <TrendingDown className="h-4 w-4 text-red-500" />}
              <span className={cn("text-sm font-medium", sinceLastChange >= 0 ? "text-emerald-600" : "text-red-500")}>
                {sinceLastChange >= 0 ? "+" : "-"}${Math.abs(sinceLastChange).toLocaleString()} since last change
              </span>
            </div>
          )}
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-emerald-600">Assets: ${totalAssets.toLocaleString()}</span>
            <span className="text-red-500">Debts: ${totalLiabilities.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {history.length > 0 ? `${history.length} daily snapshot${history.length === 1 ? "" : "s"} recorded — auto-saved on every change` : "Add your first entry to begin tracking"}
          </p>
        </CardContent>
      </Card>

      {/* Growth velocity */}
      {(v30 || v90 || v365) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <Explain tip="Velocity measures how fast your net worth is changing. Dollars-per-week tells you the absolute growth rate. Percent-per-week shows whether your wealth is compounding (growing faster) or stagnating.">Growth Velocity</Explain>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ label: "30-day", v: v30 }, { label: "90-day", v: v90 }, { label: "1-year", v: v365 }].map(({ label, v }) => (
              <div key={label} className={cn(
                "rounded-lg border p-3 text-center",
                v && v.dollarsPerWeek >= 0 ? "border-emerald-200 bg-emerald-50/20" : v ? "border-red-200 bg-red-50/20" : "border-muted"
              )}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                {v ? (
                  <>
                    <p className={cn("text-lg font-bold", v.dollarsPerWeek >= 0 ? "text-emerald-600" : "text-red-500")}>
                      {v.dollarsPerWeek >= 0 ? "+" : "-"}${Math.abs(Math.round(v.dollarsPerWeek)).toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/wk</span>
                    </p>
                    <p className={cn("text-xs font-medium", v.pctPerWeek >= 0 ? "text-emerald-600" : "text-red-500")}>
                      {v.pctPerWeek >= 0 ? "+" : ""}{v.pctPerWeek.toFixed(2)}%/wk
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">over {v.days}d</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">Need more history</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Time-series chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Net Worth Over Time</CardTitle>
              <div className="flex gap-1">
                {[
                  { label: "90d", val: 90 as const },
                  { label: "1y", val: 365 as const },
                  { label: "All", val: 0 as const },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setChartRange(opt.val)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                      chartRange === opt.val ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Add entry */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setType("asset")}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", type === "asset" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
              Asset
            </button>
            <button onClick={() => setType("liability")}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", type === "liability" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground")}>
              Liability
            </button>
          </div>
          <div className="flex gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={type === "asset" ? "e.g. Savings account" : "e.g. Student loan"} className="flex-1" />
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount $" className="w-32" />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {(type === "asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={addEntry} disabled={!name || !amount || !category}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Allocation + Liability breakdown */}
      {(allocation.length > 0 || liabilityBreakdown.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allocation.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Explain tip="Asset allocation shows how your wealth is divided. Diversification across cash, investments, real estate, and other assets reduces risk. Too concentrated in one bucket (e.g., 90% crypto) means a single bad event can wipe you out.">Asset Allocation</Explain>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <DonutChart data={allocation.map(a => ({ label: a.bucket, value: a.amount, color: a.color }))} total={totalAssets} />
                  <div className="flex-1 space-y-1">
                    {allocation.map(a => (
                      <div key={a.bucket} className="flex items-center gap-2 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                        <span className="flex-1 text-muted-foreground">{a.bucket}</span>
                        <span className="font-medium">${a.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground w-10 text-right">{a.pct.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {liabilityBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Liability Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <LiabilityBars data={liabilityBreakdown} max={liabilityBreakdown[0]?.amount ?? 0} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* DTA + savings rate + FI target */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Debt-to-asset */}
        <Card className={cn(
          "border-2",
          dtaColor === "emerald" && "border-emerald-200 bg-emerald-50/20",
          dtaColor === "amber" && "border-amber-200 bg-amber-50/20",
          dtaColor === "orange" && "border-orange-200 bg-orange-50/20",
          dtaColor === "red" && "border-red-200 bg-red-50/20",
          dtaColor === "slate" && "border-muted",
        )}>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <Explain tip="Debt-to-asset ratio = total debts ÷ total assets. Under 30% is healthy. 30-50% is manageable. 50-80% is elevated risk. Over 80% means a small drop in asset values could push you underwater. Lenders look at this when approving loans.">Debt-to-Asset</Explain>
            </p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              dtaColor === "emerald" && "text-emerald-600",
              dtaColor === "amber" && "text-amber-600",
              dtaColor === "orange" && "text-orange-600",
              dtaColor === "red" && "text-red-600",
              dtaColor === "slate" && "text-muted-foreground",
            )}>
              {dta !== null ? `${Math.round(dta * 100)}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">{dtaLabel}</p>
          </CardContent>
        </Card>

        {/* Savings rate */}
        <Card className={cn(
          "border-2",
          savingsRate === null ? "border-muted" :
          savingsRate >= 20 ? "border-emerald-200 bg-emerald-50/20" :
          savingsRate >= 10 ? "border-amber-200 bg-amber-50/20" :
          "border-red-200 bg-red-50/20"
        )}>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <Explain tip="Savings rate = (income − expenses) ÷ income. At 20%+, you're building wealth. At 10%, you're stable but slow. Under 10%, you're vulnerable to shocks. Pulled from your Budget tool.">Savings Rate</Explain>
            </p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              savingsRate === null ? "text-muted-foreground" :
              savingsRate >= 20 ? "text-emerald-600" :
              savingsRate >= 10 ? "text-amber-600" :
              "text-red-600"
            )}>
              {savingsRate !== null ? `${savingsRate}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {savingsRate === null ? (
                <a href="/budget" className="hover:underline">Set budget →</a>
              ) : budgetSurplus !== null ? (
                `${budgetSurplus >= 0 ? "+" : ""}$${budgetSurplus.toLocaleString()}/mo`
              ) : ""}
            </p>
          </CardContent>
        </Card>

        {/* FI target */}
        <Card className="border-2 border-violet-200 bg-violet-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <Explain tip="Financial Independence = having enough invested that you don't NEED to work for income. The classic rule: 25x your annual expenses (the 4% rule). Enter your target and we'll project when you'll reach it based on your current growth velocity and a 7% real return assumption.">FI Target</Explain>
            </p>
            <div className="mt-1">
              <Input
                type="number"
                value={fiTarget}
                onChange={e => updateFiTarget(e.target.value)}
                placeholder="e.g. 1000000"
                className="h-7 text-sm text-center"
              />
            </div>
            {typeof fiTarget === "number" && fiTarget > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {netWorth >= fiTarget
                  ? <span className="text-emerald-600 font-medium">Reached!</span>
                  : `${Math.round((netWorth / fiTarget) * 100)}% of the way`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FI projection */}
      {fiProjection && fiProjection.rateUsed !== "reached" && (
        <Card className="border-violet-200 bg-violet-50/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-violet-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Projected FI date: <span className="text-violet-700">{new Date(fiProjection.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {fiProjection.years.toFixed(1)} years from today, assuming your {fiProjection.rateUsed} continues at a 7% real return. Increase your savings rate to pull this forward.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {fiProjection && fiProjection.rateUsed === "reached" && (
        <Card className="border-2 border-emerald-300 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Financial Independence reached.</p>
              <p className="text-[11px] text-muted-foreground">Net worth ${netWorth.toLocaleString()} is at or above your target of ${(fiTarget as number).toLocaleString()}.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best / worst month callouts */}
      {bestMonth && worstMonth && bestMonth.month !== worstMonth.month && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-emerald-200 bg-emerald-50/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">Best month ever</p>
              </div>
              <p className="text-lg font-bold text-emerald-600">
                +${Math.round(bestMonth.delta).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">({bestMonth.pct >= 0 ? "+" : ""}{bestMonth.pct.toFixed(1)}%)</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(bestMonth.month + "-01T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-xs font-semibold text-red-600">Tough month</p>
              </div>
              <p className="text-lg font-bold text-red-500">
                {worstMonth.delta >= 0 ? "+" : ""}${Math.round(worstMonth.delta).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">({worstMonth.pct >= 0 ? "+" : ""}{worstMonth.pct.toFixed(1)}%)</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(worstMonth.month + "-01T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly table */}
      {monthlyRows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" /> Last {monthlyRows.length} Month{monthlyRows.length === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b">
                    <th className="text-left px-4 py-2 font-medium">Month</th>
                    <th className="text-right px-4 py-2 font-medium">Start</th>
                    <th className="text-right px-4 py-2 font-medium">End</th>
                    <th className="text-right px-4 py-2 font-medium">Δ</th>
                    <th className="text-right px-4 py-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map(row => (
                    <tr key={row.month} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-2 text-xs">
                        {new Date(row.month + "-01T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground">${Math.round(row.start).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium">${Math.round(row.end).toLocaleString()}</td>
                      <td className={cn("px-4 py-2 text-right text-xs font-medium", row.delta >= 0 ? "text-emerald-600" : "text-red-500")}>
                        {row.delta >= 0 ? "+" : ""}${Math.round(row.delta).toLocaleString()}
                      </td>
                      <td className={cn("px-4 py-2 text-right text-xs", row.pct >= 0 ? "text-emerald-600" : "text-red-500")}>
                        {row.pct >= 0 ? "+" : ""}{row.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets list */}
      {entries.filter(e => e.type === "asset").length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Assets (${totalAssets.toLocaleString()})</p>
          <div className="space-y-1.5">
            {entries.filter(e => e.type === "asset").sort((a, b) => b.amount - a.amount).map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">${e.amount.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{totalAssets > 0 ? Math.round((e.amount / totalAssets) * 100) : 0}%</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground/30 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liabilities list */}
      {entries.filter(e => e.type === "liability").length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Liabilities (${totalLiabilities.toLocaleString()})</p>
          <div className="space-y-1.5">
            {entries.filter(e => e.type === "liability").sort((a, b) => b.amount - a.amount).map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-500">-${e.amount.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{totalLiabilities > 0 ? Math.round((e.amount / totalLiabilities) * 100) : 0}%</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground/30 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Philosophy */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why net worth matters more than income:</strong> A person earning $200K but spending $210K has
            a negative net worth. A person earning $50K but saving $10K/year builds wealth steadily. Net worth is
            the scoreboard. Income is just one input. Every change here auto-saves a daily snapshot — the chart is your
            real financial trajectory, not a story.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget</a>
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/30-day-challenges" className="text-sm text-orange-600 hover:underline">30-Day Money Reset</a>
        <a href="/workforce" className="text-sm text-blue-600 hover:underline">Workforce Analytics</a>
        <a href="/life-os" className="text-sm text-violet-600 hover:underline">Life OS</a>
      </div>
    </div>
  )
}

/* ============================================================
   SVG Time-series chart (gradient fill, axis, peak/trough)
   ============================================================ */
function TimeSeriesChart({ data }: { data: Snapshot[] }) {
  const W = 640
  const H = 220
  const padL = 48, padR = 16, padT = 20, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const values = data.map(d => d.netWorth)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || Math.abs(max) || 1
  const yPad = range * 0.1

  const yMin = min - yPad
  const yMax = max + yPad
  const yRange = yMax - yMin || 1

  const t0 = new Date(data[0].date + "T00:00:00").getTime()
  const tN = new Date(data[data.length - 1].date + "T00:00:00").getTime()
  const tSpan = Math.max(1, tN - t0)

  function x(date: string): number {
    const t = new Date(date + "T00:00:00").getTime()
    return padL + ((t - t0) / tSpan) * innerW
  }
  function y(v: number): number {
    return padT + (1 - (v - yMin) / yRange) * innerH
  }

  const peakIdx = values.indexOf(max)
  const troughIdx = values.indexOf(min)
  const peak = data[peakIdx]
  const trough = data[troughIdx]

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.date).toFixed(1)},${y(d.netWorth).toFixed(1)}`).join(" ")
  const areaD = `${pathD} L${x(data[data.length - 1].date).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(data[0].date).toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  // y-axis ticks (5)
  const ticks = Array.from({ length: 5 }, (_, i) => yMin + (yRange * i) / 4)
  // x-axis ticks (start, middle, end)
  const xTicks = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]

  const latestPositive = data[data.length - 1].netWorth >= 0
  const strokeColor = latestPositive ? "#10b981" : "#ef4444"
  const fillColor = latestPositive ? "#10b981" : "#ef4444"

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 480 }}>
        <defs>
          <linearGradient id="nwGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
              {formatMoney(v)}
            </text>
          </g>
        ))}

        {/* Zero line if in range */}
        {yMin < 0 && yMax > 0 && (
          <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 2" />
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#nwGradient)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Peak marker */}
        {peak && peakIdx !== troughIdx && (
          <g>
            <circle cx={x(peak.date)} cy={y(peak.netWorth)} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
            <text
              x={x(peak.date)}
              y={y(peak.netWorth) - 8}
              textAnchor={x(peak.date) > W - 80 ? "end" : "middle"}
              fontSize="9"
              fontWeight="600"
              fill="#059669"
            >
              Peak {formatMoney(peak.netWorth)}
            </text>
          </g>
        )}

        {/* Trough marker */}
        {trough && peakIdx !== troughIdx && (
          <g>
            <circle cx={x(trough.date)} cy={y(trough.netWorth)} r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
            <text
              x={x(trough.date)}
              y={y(trough.netWorth) + 14}
              textAnchor={x(trough.date) > W - 80 ? "end" : "middle"}
              fontSize="9"
              fontWeight="600"
              fill="#dc2626"
            >
              Low {formatMoney(trough.netWorth)}
            </text>
          </g>
        )}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={x(t.date)}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            fontSize="9"
            fill="currentColor"
            opacity="0.5"
          >
            {new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
          </text>
        ))}
      </svg>
    </div>
  )
}

/* ============================================================
   SVG Donut chart
   ============================================================ */
function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  const size = 120
  const r = 50
  const stroke = 18
  const cx = size / 2
  const cy = size / 2

  if (total <= 0 || data.length === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} />
      </svg>
    )
  }

  let cumulative = 0
  const C = 2 * Math.PI * r

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={stroke} />
      {data.map((d, i) => {
        const frac = d.value / total
        const dash = frac * C
        const offset = -cumulative * C
        cumulative += frac
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={offset}
          />
        )
      })}
      <g transform={`rotate(90 ${cx} ${cy})`}>
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
          ${total >= 1_000_000 ? (total / 1_000_000).toFixed(1) + "M" : total >= 1000 ? Math.round(total / 1000) + "k" : total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">ASSETS</text>
      </g>
    </svg>
  )
}

/* ============================================================
   SVG Liability bars
   ============================================================ */
function LiabilityBars({ data, max }: { data: { category: string; amount: number; pct: number; color: string }[]; max: number }) {
  if (data.length === 0 || max === 0) return null
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.category}>
          <div className="flex items-center justify-between text-[11px] mb-0.5">
            <span className="text-muted-foreground">{d.category}</span>
            <span className="font-medium">${d.amount.toLocaleString()} <span className="text-muted-foreground">({d.pct.toFixed(0)}%)</span></span>
          </div>
          <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.amount / max) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
