"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
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

const ASSET_CATEGORIES = ["Cash & Savings", "Investments", "Retirement (401k/IRA)", "Real Estate", "Vehicle", "Crypto", "Business", "Other Asset"]
const LIABILITY_CATEGORIES = ["Mortgage", "Student Loans", "Car Loan", "Credit Card", "Medical Debt", "Personal Loan", "Other Debt"]

export default function NetWorthPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<"asset" | "liability">("asset")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [history, setHistory] = useState<{ date: string; netWorth: number }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-networth")
    if (stored) {
      const data = JSON.parse(stored)
      setEntries(data.entries ?? [])
      setHistory(data.history ?? [])
    }
  }, [])

  function save(updated: Entry[], hist?: { date: string; netWorth: number }[]) {
    const h = hist ?? history
    setEntries(updated)
    localStorage.setItem("hfp-networth", JSON.stringify({ entries: updated, history: h }))
  }

  function addEntry() {
    if (!name || !amount || !category) return
    const entry: Entry = { id: Date.now().toString(36), name, type, category, amount: parseFloat(amount) }
    save([...entries, entry])
    setName(""); setAmount(""); setCategory("")
  }

  function deleteEntry(id: string) {
    save(entries.filter(e => e.id !== id))
  }

  function snapshot() {
    const nw = totalAssets - totalLiabilities
    const today = new Date().toISOString().split("T")[0]
    const newHistory = [...history.filter(h => h.date !== today), { date: today, netWorth: nw }].sort((a, b) => a.date.localeCompare(b.date))
    setHistory(newHistory)
    save(entries, newHistory)
  }

  const totalAssets = entries.filter(e => e.type === "asset").reduce((s, e) => s + e.amount, 0)
  const totalLiabilities = entries.filter(e => e.type === "liability").reduce((s, e) => s + e.amount, 0)
  const netWorth = totalAssets - totalLiabilities
  const prevNetWorth = history.length >= 2 ? history[history.length - 2].netWorth : null
  const change = prevNetWorth !== null ? netWorth - prevNetWorth : null

  const assetsByCategory: Record<string, number> = {}
  const liabilitiesByCategory: Record<string, number> = {}
  entries.forEach(e => {
    if (e.type === "asset") assetsByCategory[e.category] = (assetsByCategory[e.category] ?? 0) + e.amount
    else liabilitiesByCategory[e.category] = (liabilitiesByCategory[e.category] ?? 0) + e.amount
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Net Worth Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">Assets minus liabilities. The single most important number in personal finance.</p>
      </div>

      {/* Net worth display */}
      <Card className={cn("border-2", netWorth >= 0 ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30")}>
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1"><Explain tip="Your net worth is everything you OWN (assets) minus everything you OWE (debts). If you own a $300K house but owe $200K on the mortgage, that part of your net worth is $100K. It is the single most important number in personal finance">Net Worth</Explain></p>
          <p className={cn("text-4xl font-bold", netWorth >= 0 ? "text-emerald-600" : "text-red-600")}>
            ${Math.abs(netWorth).toLocaleString()}
          </p>
          {change !== null && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {change >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
              <span className={cn("text-sm font-medium", change >= 0 ? "text-emerald-600" : "text-red-500")}>
                {change >= 0 ? "+" : "-"}${Math.abs(change).toLocaleString()} since last snapshot
              </span>
            </div>
          )}
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-emerald-600">Assets: ${totalAssets.toLocaleString()}</span>
            <span className="text-red-500">Debts: ${totalLiabilities.toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={snapshot}>Save snapshot</Button>
        </CardContent>
      </Card>

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

      {/* Trend chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Net Worth Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-20">
              {history.slice(-12).map((h, i) => {
                const min = Math.min(...history.map(x => x.netWorth))
                const max = Math.max(...history.map(x => x.netWorth))
                const range = max - min || 1
                const pct = Math.max(5, ((h.netWorth - min) / range) * 100)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn("w-full rounded-t", h.netWorth >= 0 ? "bg-emerald-500" : "bg-red-400")} style={{ height: `${pct}%`, opacity: 0.5 + (i / 12) * 0.5 }}
                      title={`${h.date}: $${h.netWorth.toLocaleString()}`} />
                    <span className="text-[8px] text-muted-foreground">{h.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets */}
      {entries.filter(e => e.type === "asset").length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Assets (${totalAssets.toLocaleString()})</p>
          <div className="space-y-1.5">
            {entries.filter(e => e.type === "asset").map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">${e.amount.toLocaleString()}</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground/30 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liabilities */}
      {entries.filter(e => e.type === "liability").length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Liabilities (${totalLiabilities.toLocaleString()})</p>
          <div className="space-y-1.5">
            {entries.filter(e => e.type === "liability").map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-500">-${e.amount.toLocaleString()}</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground/30 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why net worth matters more than income:</strong> A person earning $200K but spending $210K has
            a negative net worth. A person earning $50K but saving $10K/year builds wealth steadily. Net worth is
            the scoreboard. Income is just one input. Snapshot monthly to track your real progress.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Money Reset</a>
        <a href="/workforce" className="text-sm text-blue-600 hover:underline">Workforce Analytics</a>
      </div>
    </div>
  )
}
