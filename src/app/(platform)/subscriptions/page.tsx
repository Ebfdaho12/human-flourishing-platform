"use client"

import { useState, useEffect, useMemo } from "react"
import { CreditCard, Plus, Trash2, AlertTriangle, DollarSign, Clock, PieChart, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Sub {
  id: string
  name: string
  cost: number // monthly
  category: string
  essential: boolean
  lastUsed: string // "daily" | "weekly" | "monthly" | "rarely" | "forgot"
}

const CATEGORIES = ["Streaming", "Music", "Software", "Gaming", "News", "Fitness", "Food", "Cloud Storage", "Other"]

const COMMON_SUBS = [
  { name: "Netflix", cost: 16.49, category: "Streaming" },
  { name: "Spotify", cost: 11.99, category: "Music" },
  { name: "Disney+", cost: 13.99, category: "Streaming" },
  { name: "Amazon Prime", cost: 14.99, category: "Streaming" },
  { name: "YouTube Premium", cost: 13.99, category: "Streaming" },
  { name: "Apple Music", cost: 10.99, category: "Music" },
  { name: "HBO Max", cost: 15.99, category: "Streaming" },
  { name: "Paramount+", cost: 11.99, category: "Streaming" },
  { name: "Hulu", cost: 7.99, category: "Streaming" },
  { name: "Crave", cost: 19.99, category: "Streaming" },
  { name: "ChatGPT Plus", cost: 20, category: "Software" },
  { name: "iCloud+", cost: 3.99, category: "Cloud Storage" },
  { name: "Google One", cost: 3.99, category: "Cloud Storage" },
  { name: "Adobe Creative Cloud", cost: 59.99, category: "Software" },
  { name: "Xbox Game Pass", cost: 16.99, category: "Gaming" },
  { name: "PlayStation Plus", cost: 13.99, category: "Gaming" },
  { name: "Gym Membership", cost: 50, category: "Fitness" },
  { name: "Meal Kit (HelloFresh etc.)", cost: 80, category: "Food" },
]

const USAGE_LABELS: Record<string, { label: string; color: string; verdict: string }> = {
  daily: { label: "Daily", color: "text-emerald-600 border-emerald-300", verdict: "Worth it" },
  weekly: { label: "Weekly", color: "text-blue-600 border-blue-300", verdict: "Probably worth it" },
  monthly: { label: "Monthly", color: "text-amber-600 border-amber-300", verdict: "Evaluate" },
  rarely: { label: "Rarely", color: "text-orange-600 border-orange-300", verdict: "Consider cancelling" },
  forgot: { label: "Forgot I had it", color: "text-red-500 border-red-300", verdict: "Cancel immediately" },
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCost, setNewCost] = useState("")
  const [newCat, setNewCat] = useState("Streaming")
  const [hourlyRate, setHourlyRate] = useState(25)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-subscriptions")
    if (stored) {
      const data = JSON.parse(stored)
      setSubs(data.subs ?? [])
      setHourlyRate(data.hourlyRate ?? 25)
    }
  }, [])

  function save(s: Sub[], rate: number) {
    setSubs(s); setHourlyRate(rate)
    localStorage.setItem("hfp-subscriptions", JSON.stringify({ subs: s, hourlyRate: rate }))
  }

  function addSub(name: string, cost: number, category: string) {
    if (!name) return
    save([...subs, { id: Date.now().toString(36), name, cost, category, essential: false, lastUsed: "weekly" }], hourlyRate)
    setNewName(""); setNewCost("")
    setShowAdd(false)
  }

  function updateUsage(id: string, lastUsed: string) {
    save(subs.map(s => s.id === id ? { ...s, lastUsed } : s), hourlyRate)
  }

  function toggleEssential(id: string) {
    save(subs.map(s => s.id === id ? { ...s, essential: !s.essential } : s), hourlyRate)
  }

  function removeSub(id: string) {
    save(subs.filter(s => s.id !== id), hourlyRate)
  }

  const totalMonthly = subs.reduce((s, sub) => s + sub.cost, 0)
  const totalYearly = totalMonthly * 12
  const wasteful = subs.filter(s => s.lastUsed === "rarely" || s.lastUsed === "forgot")
  const wastefulMonthly = wasteful.reduce((s, sub) => s + sub.cost, 0)
  const hoursWorked = hourlyRate > 0 ? Math.round(totalYearly / hourlyRate) : 0

  const breakdown = useMemo(() => {
    const byCat: Record<string, number> = {}
    subs.forEach(s => { byCat[s.category] = (byCat[s.category] ?? 0) + s.cost })
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1])
    return { byCat, sorted }
  }, [subs])

  const pricePerUse = useMemo(() => {
    const USES_PER_MONTH: Record<string, number> = { daily: 30, weekly: 4, monthly: 1, rarely: 0.25, forgot: 0 }
    return subs.map(s => {
      const uses = USES_PER_MONTH[s.lastUsed] ?? 4
      const per = uses > 0 ? s.cost / uses : Infinity
      return { name: s.name, cost: s.cost, lastUsed: s.lastUsed, usesPerMonth: uses, pricePerUse: per }
    }).sort((a, b) => b.pricePerUse - a.pricePerUse)
  }, [subs])

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Subscription Audit</h1>
          </div>
          <p className="text-sm text-muted-foreground">Find the subscriptions you forgot about. See what they really cost you in hours of your life.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {/* Stats */}
      {subs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-violet-600">${totalMonthly.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">/month</p>
          </CardContent></Card>
          <Card className="border-red-200"><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-500">${totalYearly.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/year</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{hoursWorked}h</p>
            <p className="text-xs text-muted-foreground">hours worked/yr</p>
          </CardContent></Card>
          <Card className={wastefulMonthly > 0 ? "border-red-200 bg-red-50/20" : ""}><CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-500">${(wastefulMonthly * 12).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">wasted/year</p>
          </CardContent></Card>
        </div>
      )}

      {/* Hourly rate */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Your hourly rate: $</span>
        <Input type="number" value={hourlyRate} onChange={e => save(subs, Number(e.target.value) || 0)}
          className="w-20 h-7 text-sm" />
        <span className="text-[10px] text-muted-foreground">(used to calculate hours worked to pay for subscriptions)</span>
      </div>

      {/* Quick add common subs */}
      {showAdd && (
        <Card className="border-2 border-violet-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground font-semibold">Quick add common subscriptions:</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBS.filter(c => !subs.some(s => s.name === c.name)).map(c => (
                <button key={c.name} onClick={() => addSub(c.name, c.cost, c.category)}
                  className="rounded-full border border-border px-2.5 py-1 text-[10px] hover:bg-violet-50 hover:border-violet-300 transition-colors">
                  {c.name} (${c.cost})
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Or add custom:</p>
              <div className="flex gap-2">
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="flex-1" />
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="Cost" className="pl-5" type="number" />
                </div>
                <Button onClick={() => addSub(newName, Number(newCost) || 0, newCat)} disabled={!newName}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription list */}
      {subs.length > 0 ? (
        <div className="space-y-2">
          {subs.sort((a, b) => b.cost - a.cost).map(sub => {
            const usage = USAGE_LABELS[sub.lastUsed] || USAGE_LABELS.weekly
            const hoursForThis = hourlyRate > 0 ? Math.round((sub.cost * 12) / hourlyRate * 10) / 10 : 0
            return (
              <Card key={sub.id} className={cn(
                sub.lastUsed === "forgot" ? "border-red-200 bg-red-50/10" :
                sub.lastUsed === "rarely" ? "border-orange-200 bg-orange-50/10" : ""
              )}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sub.name}</span>
                        <Badge variant="outline" className="text-[9px]">{sub.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-violet-600">${sub.cost.toFixed(2)}/mo</span>
                        <span className="text-[10px] text-muted-foreground">{hoursForThis}h of work/yr</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select value={sub.lastUsed} onChange={e => updateUsage(sub.id, e.target.value)}
                        className={cn("text-[10px] rounded border px-1.5 py-0.5 bg-transparent", usage.color)}>
                        {Object.entries(USAGE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <button onClick={() => removeSub(sub.id)} className="p-1 text-muted-foreground/30 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {(sub.lastUsed === "rarely" || sub.lastUsed === "forgot") && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {usage.verdict} — ${(sub.cost * 12).toFixed(0)}/year = {hoursForThis} hours of your life
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : !showAdd && (
        <Card><CardContent className="py-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No subscriptions added yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add your subscriptions to see the real cost. The average person has 12 subscriptions and has forgotten about 2-3 of them.</p>
        </CardContent></Card>
      )}

      {/* Category breakdown */}
      {subs.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4 text-violet-600" /> Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {breakdown.sorted.map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-muted-foreground truncate">{cat}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-400 to-pink-500" style={{ width: `${(amt / totalMonthly) * 100}%` }} />
                  </div>
                  <span className="w-24 text-right tabular-nums font-mono text-[10px]">${amt.toFixed(0)}/mo · {Math.round((amt / totalMonthly) * 100)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price per use */}
      {pricePerUse.length >= 2 && pricePerUse.some(p => isFinite(p.pricePerUse)) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-rose-600" /> Price per Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground mb-2">Based on typical usage frequency. High prices per use = reconsider or actually use more.</p>
            <div className="space-y-1">
              {pricePerUse.slice(0, 8).map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{p.name}</span>
                  <Badge variant="outline" className="text-[9px] ml-2">
                    {isFinite(p.pricePerUse)
                      ? `$${p.pricePerUse.toFixed(p.pricePerUse > 10 ? 0 : 2)}/use`
                      : "never used"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The subscription trap:</strong> The average North American household spends $219/month on subscriptions —
            $2,628/year. Studies show people underestimate their subscription spending by 2-3x. At a $25/hour wage,
            that is 105 hours of work per year — over two and a half full work weeks — just for subscriptions.
            The ones you forgot about are the most expensive, because they cost money while providing zero value.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/debt-payoff" className="text-sm text-red-600 hover:underline">Debt Payoff</a>
      </div>
    </div>
  )
}
