"use client"

import { useState } from "react"
import { Search, DollarSign, Home, Car, Utensils, CreditCard, Smartphone, ArrowRight, Sparkles, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CITY_COSTS: Record<string, { housing: number; groceries: number; transport: number; childcare: number; telecom: number }> = {
  "Toronto": { housing: 2500, groceries: 900, transport: 300, childcare: 1500, telecom: 180 },
  "Vancouver": { housing: 2800, groceries: 950, transport: 280, childcare: 1200, telecom: 180 },
  "Ottawa": { housing: 2100, groceries: 800, transport: 250, childcare: 1200, telecom: 170 },
  "Montreal": { housing: 1700, groceries: 750, transport: 230, childcare: 250, telecom: 160 },
  "Calgary": { housing: 1800, groceries: 820, transport: 280, childcare: 1100, telecom: 160 },
  "Edmonton": { housing: 1400, groceries: 780, transport: 260, childcare: 1000, telecom: 155 },
  "Winnipeg": { housing: 1300, groceries: 720, transport: 230, childcare: 800, telecom: 150 },
  "Saskatoon": { housing: 1250, groceries: 700, transport: 220, childcare: 900, telecom: 150 },
  "Halifax": { housing: 2000, groceries: 810, transport: 240, childcare: 1000, telecom: 170 },
  "Moncton": { housing: 1200, groceries: 680, transport: 200, childcare: 900, telecom: 155 },
  "St. John's": { housing: 1100, groceries: 750, transport: 230, childcare: 850, telecom: 160 },
  "London ON": { housing: 1700, groceries: 760, transport: 240, childcare: 1200, telecom: 165 },
  "Hamilton": { housing: 1900, groceries: 780, transport: 260, childcare: 1300, telecom: 170 },
  "Kingston": { housing: 1600, groceries: 740, transport: 220, childcare: 1100, telecom: 160 },
  "Thunder Bay": { housing: 1100, groceries: 730, transport: 230, childcare: 900, telecom: 155 },
}

const SAVINGS_ACTIONS: {
  action: string
  icon: any
  monthlyRange: [number, number]
  description: string
  difficulty: string
  link: string
}[] = [
  { action: "Switch to one car", icon: Car, monthlyRange: [800, 1200], description: "Insurance + payment + gas + maintenance for a second vehicle", difficulty: "Medium", link: "/budget" },
  { action: "Meal plan instead of eating out", icon: Utensils, monthlyRange: [400, 800], description: "Average family saves $500-$800/month switching from 50% takeout to 90% home cooking", difficulty: "Easy", link: "/meal-planner" },
  { action: "Negotiate 3 bills", icon: Smartphone, monthlyRange: [80, 200], description: "Internet, insurance, phone — 15 minutes each saves $80-200/month", difficulty: "Easy", link: "/negotiation" },
  { action: "Cancel unused subscriptions", icon: CreditCard, monthlyRange: [30, 150], description: "Average person has 2-3 forgotten subscriptions", difficulty: "Easy", link: "/subscriptions" },
  { action: "Refinance or renegotiate mortgage", icon: Home, monthlyRange: [100, 500], description: "Even 0.25% lower rate on $500K = $100/month savings", difficulty: "Medium", link: "/budget" },
  { action: "Move to a cheaper city", icon: MapPin, monthlyRange: [500, 2000], description: "Geographic arbitrage — same remote job, 40-60% lower cost of living", difficulty: "Hard", link: "/canada/compare" },
  { action: "Drop to single income (if second income nets little)", icon: Home, monthlyRange: [0, 800], description: "After childcare + taxes + work costs, the second income often nets near zero", difficulty: "Hard", link: "/family-economics" },
]

export default function SavingsFinderPage() {
  const [currentCity, setCurrentCity] = useState("Toronto")
  const [targetCity, setTargetCity] = useState("Edmonton")
  const [income, setIncome] = useState(80000)
  const [familySize, setFamilySize] = useState(3)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const current = CITY_COSTS[currentCity]
  const target = CITY_COSTS[targetCity]

  const currentTotal = current ? current.housing + current.groceries + current.transport + current.childcare + current.telecom : 0
  const targetTotal = target ? target.housing + target.groceries + target.transport + target.childcare + target.telecom : 0
  const moveSavings = Math.max(0, currentTotal - targetTotal)

  const actionSavings = SAVINGS_ACTIONS.filter((_, i) => selected.has(i))
    .reduce((s, a) => s + Math.round((a.monthlyRange[0] + a.monthlyRange[1]) / 2), 0)

  const totalMonthly = moveSavings + actionSavings
  const totalYearly = totalMonthly * 12

  // Invested projection
  const invested10yr = Math.round(totalMonthly * 12 * ((Math.pow(1 + 0.07/12, 120) - 1) / (0.07/12)))
  const invested20yr = Math.round(totalMonthly * 12 * ((Math.pow(1 + 0.07/12, 240) - 1) / (0.07/12)))

  function toggleAction(i: number) {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setSelected(next)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Search className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Savings Finder</h1>
        </div>
        <p className="text-sm text-muted-foreground">See exactly how much you could save — by moving, by changing habits, or both.</p>
      </div>

      {/* City comparison */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-500" /> Geographic Savings
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Current city</label>
              <select value={currentCity} onChange={e => setCurrentCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {Object.keys(CITY_COSTS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">If you moved to</label>
              <select value={targetCity} onChange={e => setTargetCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {Object.keys(CITY_COSTS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {moveSavings > 0 ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-xs text-muted-foreground">Moving saves</p>
              <p className="text-2xl font-bold text-emerald-600">${moveSavings.toLocaleString()}/month</p>
              <p className="text-xs text-emerald-600">${(moveSavings * 12).toLocaleString()}/year</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center italic">
              {currentCity === targetCity ? "Select a different target city" : `${targetCity} costs about the same or more than ${currentCity}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action savings */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Actions You Can Take (tap to add)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {SAVINGS_ACTIONS.map((a, i) => {
            const Icon = a.icon
            const isSelected = selected.has(i)
            const avg = Math.round((a.monthlyRange[0] + a.monthlyRange[1]) / 2)
            return (
              <div key={i} className={cn("rounded-lg border p-3 cursor-pointer transition-all",
                isSelected ? "border-emerald-300 bg-emerald-50/30" : "border-border hover:bg-muted/30"
              )} onClick={() => toggleAction(i)}>
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-emerald-500" : "text-muted-foreground")} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground">{a.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-bold", isSelected ? "text-emerald-600" : "text-muted-foreground")}>
                      +${avg.toLocaleString()}/mo
                    </p>
                    <Badge variant="outline" className="text-[9px]">{a.difficulty}</Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Total savings */}
      {totalMonthly > 0 && (
        <Card className="border-2 border-emerald-300 bg-emerald-50/20">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Total Potential Savings</p>
            <p className="text-3xl font-bold text-emerald-600">${totalMonthly.toLocaleString()}/month</p>
            <p className="text-sm text-emerald-600">${totalYearly.toLocaleString()}/year</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-[10px] text-muted-foreground">If invested at 7% for 10 years</p>
                <p className="text-lg font-bold text-emerald-600">${invested10yr.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-[10px] text-muted-foreground">If invested at 7% for 20 years</p>
                <p className="text-lg font-bold text-emerald-600">${invested20yr.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              These savings, invested consistently, could build <strong>real wealth</strong>.
              Use the <a href="/compound-interest" className="text-violet-600 hover:underline">Compound Interest Visualizer</a> to model your exact scenario.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/financial-dashboard" className="text-sm text-emerald-600 hover:underline">Financial Dashboard</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/canada/compare" className="text-sm text-red-600 hover:underline">Provincial Comparison</a>
        <a href="/negotiation" className="text-sm text-teal-600 hover:underline">Negotiation Scripts</a>
      </div>
    </div>
  )
}
