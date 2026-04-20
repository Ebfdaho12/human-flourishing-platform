"use client"

import { useState } from "react"
import { MapPin, DollarSign, Home, Car, Apple, GraduationCap, Heart, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CITIES: Record<string, {
  country: string
  housing: number // median rent 1BR
  food: number // monthly groceries
  transport: number // monthly
  healthcare: number // monthly insurance
  utilities: number // monthly
  medianIncome: number // monthly after tax
  index: number // cost of living index (NYC = 100)
}> = {
  "New York City": { country: "US", housing: 3500, food: 450, transport: 130, healthcare: 450, utilities: 180, medianIncome: 5200, index: 100 },
  "San Francisco": { country: "US", housing: 3200, food: 420, transport: 110, healthcare: 430, utilities: 160, medianIncome: 5800, index: 95 },
  "Los Angeles": { country: "US", housing: 2400, food: 380, transport: 140, healthcare: 420, utilities: 140, medianIncome: 4200, index: 78 },
  "Chicago": { country: "US", housing: 1800, food: 340, transport: 105, healthcare: 400, utilities: 130, medianIncome: 3800, index: 65 },
  "Austin": { country: "US", housing: 1600, food: 320, transport: 95, healthcare: 380, utilities: 150, medianIncome: 3900, index: 58 },
  "Miami": { country: "US", housing: 2200, food: 360, transport: 100, healthcare: 410, utilities: 160, medianIncome: 3500, index: 72 },
  "Denver": { country: "US", housing: 1700, food: 330, transport: 90, healthcare: 390, utilities: 120, medianIncome: 4000, index: 60 },
  "London": { country: "UK", housing: 2200, food: 380, transport: 180, healthcare: 0, utilities: 200, medianIncome: 3800, index: 75 },
  "Toronto": { country: "CA", housing: 2000, food: 350, transport: 130, healthcare: 0, utilities: 150, medianIncome: 3400, index: 68 },
  "Vancouver": { country: "CA", housing: 2300, food: 360, transport: 120, healthcare: 0, utilities: 130, medianIncome: 3200, index: 72 },
  "Sydney": { country: "AU", housing: 2400, food: 400, transport: 140, healthcare: 150, utilities: 160, medianIncome: 4000, index: 76 },
  "Berlin": { country: "DE", housing: 1200, food: 280, transport: 95, healthcare: 0, utilities: 250, medianIncome: 3000, index: 50 },
  "Tokyo": { country: "JP", housing: 1100, food: 350, transport: 80, healthcare: 100, utilities: 130, medianIncome: 2800, index: 48 },
  "Singapore": { country: "SG", housing: 2500, food: 400, transport: 120, healthcare: 200, utilities: 140, medianIncome: 4500, index: 80 },
  "Dubai": { country: "AE", housing: 1800, food: 380, transport: 100, healthcare: 300, utilities: 150, medianIncome: 4200, index: 65 },
  "Lisbon": { country: "PT", housing: 1000, food: 250, transport: 40, healthcare: 50, utilities: 120, medianIncome: 1800, index: 38 },
  "Mexico City": { country: "MX", housing: 600, food: 200, transport: 30, healthcare: 80, utilities: 50, medianIncome: 1200, index: 25 },
  "Bangkok": { country: "TH", housing: 500, food: 200, transport: 40, healthcare: 60, utilities: 80, medianIncome: 1000, index: 22 },
  "Bali (Denpasar)": { country: "ID", housing: 400, food: 180, transport: 35, healthcare: 50, utilities: 60, medianIncome: 600, index: 18 },
  "Medelliin": { country: "CO", housing: 450, food: 200, transport: 30, healthcare: 70, utilities: 60, medianIncome: 800, index: 20 },
}

export default function CostOfLivingPage() {
  const [cityA, setCityA] = useState("New York City")
  const [cityB, setCityB] = useState("Austin")

  const a = CITIES[cityA]
  const b = CITIES[cityB]
  if (!a || !b) return null

  const totalA = a.housing + a.food + a.transport + a.healthcare + a.utilities
  const totalB = b.housing + b.food + b.transport + b.healthcare + b.utilities
  const savingsA = a.medianIncome - totalA
  const savingsB = b.medianIncome - totalB

  const categories = [
    { label: "Housing (1BR)", icon: Home, a: a.housing, b: b.housing },
    { label: "Groceries", icon: Apple, a: a.food, b: b.food },
    { label: "Transport", icon: Car, a: a.transport, b: b.transport },
    { label: "Healthcare", icon: Heart, a: a.healthcare, b: b.healthcare },
    { label: "Utilities", icon: DollarSign, a: a.utilities, b: b.utilities },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cost of Living Comparison</h1>
        </div>
        <p className="text-sm text-muted-foreground">Compare real costs between cities. Make informed decisions about where to live.</p>
      </div>

      {/* City selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">City A</label>
          <Select value={cityA} onValueChange={setCityA}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.keys(CITIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">City B</label>
          <Select value={cityB} onValueChange={setCityB}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.keys(CITIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn("border-2", totalA <= totalB ? "border-emerald-200 bg-emerald-50/20" : "border-red-200 bg-red-50/20")}>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">{cityA}</p>
            <p className="text-2xl font-bold">${totalA.toLocaleString()}/mo</p>
            <p className="text-xs text-muted-foreground">Index: {a.index}</p>
            <p className={cn("text-sm font-medium mt-1", savingsA >= 0 ? "text-emerald-600" : "text-red-500")}>
              {savingsA >= 0 ? "+" : ""}${savingsA.toLocaleString()} savings
            </p>
          </CardContent>
        </Card>
        <Card className={cn("border-2", totalB <= totalA ? "border-emerald-200 bg-emerald-50/20" : "border-red-200 bg-red-50/20")}>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">{cityB}</p>
            <p className="text-2xl font-bold">${totalB.toLocaleString()}/mo</p>
            <p className="text-xs text-muted-foreground">Index: {b.index}</p>
            <p className={cn("text-sm font-medium mt-1", savingsB >= 0 ? "text-emerald-600" : "text-red-500")}>
              {savingsB >= 0 ? "+" : ""}${savingsB.toLocaleString()} savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(cat => {
              const Icon = cat.icon
              const diff = cat.a - cat.b
              const pctDiff = cat.b > 0 ? Math.round(((cat.a - cat.b) / cat.b) * 100) : 0
              return (
                <div key={cat.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]",
                      diff > 0 ? "border-red-200 text-red-600" : diff < 0 ? "border-emerald-200 text-emerald-600" : ""
                    )}>
                      {diff > 0 ? "+" : ""}{pctDiff}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">{cityA}</span>
                      <span className="text-sm font-bold">${cat.a.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">{cityB}</span>
                      <span className="text-sm font-bold">${cat.b.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Total + Income */}
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Median income</p>
                  <p className="text-lg font-bold">${a.medianIncome.toLocaleString()}/mo</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Median income</p>
                  <p className="text-lg font-bold">${b.medianIncome.toLocaleString()}/mo</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key insight */}
      <Card className="border-teal-200 bg-teal-50/20">
        <CardContent className="p-4">
          <p className="text-sm leading-relaxed">
            {totalA > totalB ? (
              <><strong>{cityA}</strong> costs <strong>${(totalA - totalB).toLocaleString()}/month more</strong> than {cityB} ({Math.round(((totalA - totalB) / totalB) * 100)}% higher). </>
            ) : totalB > totalA ? (
              <><strong>{cityB}</strong> costs <strong>${(totalB - totalA).toLocaleString()}/month more</strong> than {cityA} ({Math.round(((totalB - totalA) / totalA) * 100)}% higher). </>
            ) : (
              <>Both cities have similar costs. </>
            )}
            {savingsA > savingsB ? (
              <>But <strong>{cityA}</strong> has higher income, leaving <strong>${(savingsA - savingsB).toLocaleString()}/month more</strong> after expenses.</>
            ) : savingsB > savingsA ? (
              <>And <strong>{cityB}</strong> leaves <strong>${(savingsB - savingsA).toLocaleString()}/month more</strong> after expenses despite {totalB > totalA ? "higher costs" : "lower costs"}.</>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Data approximates based on Numbeo, BLS, and local surveys. Healthcare = $0 in countries with universal coverage. Actual costs vary by lifestyle.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/workforce" className="text-sm text-blue-600 hover:underline">Workforce Analytics</a>
        <a href="/net-worth" className="text-sm text-emerald-600 hover:underline">Net Worth Tracker</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
