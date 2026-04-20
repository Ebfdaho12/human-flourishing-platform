"use client"

import { useState } from "react"
import { Clock, DollarSign, Car, Utensils, Shirt, ArrowRight, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function RealHourlyRatePage() {
  const [salary, setSalary] = useState(70000)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [commuteMin, setCommuteMin] = useState(30)
  const [decompressMin, setDecompressMin] = useState(30)
  const [workClothes, setWorkClothes] = useState(100)
  const [workLunches, setWorkLunches] = useState(200)
  const [commuteCost, setCommuteCost] = useState(300)
  const [childcareCost, setChildcareCost] = useState(0)

  // Calculations
  const weeksPerYear = 48 // 52 minus 4 weeks vacation/holidays
  const grossHours = hoursPerWeek * weeksPerYear
  const commuteHoursPerWeek = (commuteMin * 2 * 5) / 60 // round trip, 5 days
  const decompressHoursPerWeek = (decompressMin * 5) / 60
  const prepHoursPerWeek = 2.5 // getting ready, packing lunch, etc

  const totalHoursPerWeek = hoursPerWeek + commuteHoursPerWeek + decompressHoursPerWeek + prepHoursPerWeek
  const totalHoursPerYear = totalHoursPerWeek * weeksPerYear

  // After-tax income (rough Ontario estimate)
  const taxRate = salary < 55000 ? 0.25 : salary < 100000 ? 0.30 : salary < 150000 ? 0.35 : 0.40
  const afterTaxIncome = salary * (1 - taxRate)

  // Work-related costs
  const annualWorkCosts = (workClothes + workLunches + commuteCost + childcareCost) * 12
  const netIncome = afterTaxIncome - annualWorkCosts

  // Rates
  const apparentHourly = salary / grossHours
  const afterTaxHourly = afterTaxIncome / grossHours
  const realHourly = netIncome / totalHoursPerYear

  // Purchase converter
  const [purchaseAmount, setPurchaseAmount] = useState(500)
  const hoursForPurchase = purchaseAmount / realHourly
  const daysForPurchase = hoursForPurchase / (totalHoursPerWeek / 5)

  // Common purchases
  const purchases = [
    { item: "Coffee ($6/day)", annual: 6 * 250, icon: "☕" },
    { item: "New iPhone ($1,400)", annual: 1400, icon: "📱" },
    { item: "Car payment ($500/mo)", annual: 6000, icon: "🚗" },
    { item: "Netflix + Spotify ($30/mo)", annual: 360, icon: "📺" },
    { item: "Eating out ($150/week)", annual: 7800, icon: "🍕" },
    { item: "New car ($45,000)", annual: 45000, icon: "🚘" },
    { item: "Vacation ($5,000)", annual: 5000, icon: "✈️" },
    { item: "Kids' activities ($200/mo)", annual: 2400, icon: "⚽" },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Real Hourly Rate</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your salary says one number. After taxes, work costs, and hidden hours — the real number is very different.
        </p>
      </div>

      {/* Inputs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Work Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Gross annual salary</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={salary || ""} onChange={e => setSalary(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hours worked/week</label>
              <Input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Commute (minutes, one way)</label>
              <Input type="number" value={commuteMin} onChange={e => setCommuteMin(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground"><Explain tip="Time needed after work to decompress before you are fully 'home' — changing clothes, scrolling, unwinding from the day. This is real time consumed by the job">Decompress time</Explain> (min/day)</label>
              <Input type="number" value={decompressMin} onChange={e => setDecompressMin(Number(e.target.value) || 0)} />
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground mt-2">Monthly work-related costs:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Work clothes/dry cleaning</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={workClothes || ""} onChange={e => setWorkClothes(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Work lunches/coffee</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={workLunches || ""} onChange={e => setWorkLunches(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Commuting (gas/transit/parking)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={commuteCost || ""} onChange={e => setCommuteCost(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Childcare (if work-dependent)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={childcareCost || ""} onChange={e => setChildcareCost(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The reveal */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Apparent rate</p>
            <p className="text-lg font-bold text-blue-600">${apparentHourly.toFixed(2)}/hr</p>
            <p className="text-[10px] text-muted-foreground">Before taxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">After-tax rate</p>
            <p className="text-lg font-bold text-amber-600">${afterTaxHourly.toFixed(2)}/hr</p>
            <p className="text-[10px] text-muted-foreground">Taxes removed</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200 bg-red-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">REAL rate</p>
            <p className="text-2xl font-bold text-red-600">${realHourly.toFixed(2)}/hr</p>
            <p className="text-[10px] text-muted-foreground">After everything</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-sm leading-relaxed">
            Your <strong>apparent rate</strong> is ${apparentHourly.toFixed(2)}/hr but your <strong>real rate</strong> is{" "}
            <strong className="text-red-600">${realHourly.toFixed(2)}/hr</strong> — that is{" "}
            <strong>{Math.round((1 - realHourly / apparentHourly) * 100)}% less</strong> than you think.
            You spend <strong>{Math.round(totalHoursPerWeek)} hours/week</strong> on work (including commute, prep, decompress)
            but only get paid for {hoursPerWeek}.
          </p>
        </CardContent>
      </Card>

      {/* Purchase converter */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Things REALLY Cost You (in hours of life)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {purchases.map((p, i) => {
              const hours = p.annual / realHourly
              const days = hours / (totalHoursPerWeek / 5)
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <span className="text-lg">{p.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{p.item}</p>
                    <p className="text-[10px] text-muted-foreground">${p.annual.toLocaleString()}/year</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{Math.round(hours)} hours</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(days)} work days</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2">Custom purchase:</p>
            <div className="flex gap-2 items-center">
              <span className="text-xs">$</span>
              <Input type="number" value={purchaseAmount || ""} onChange={e => setPurchaseAmount(Number(e.target.value) || 0)} className="w-28" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-red-600">{Math.round(hoursForPurchase * 10) / 10} hours</span>
              <span className="text-xs text-muted-foreground">({Math.round(daysForPurchase * 10) / 10} work days)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this matters:</strong> When you think of purchases in hours instead of dollars, spending habits
            change immediately. A $45,000 car is not "$45,000" — it is <strong>{Math.round(45000 / realHourly)} hours of your life</strong>.
            A $6/day coffee habit is not "$2,190/year" — it is <strong>{Math.round(2190 / realHourly)} hours</strong> you worked
            just for coffee. Once you see the trade-off in life hours, you naturally spend on what matters and cut what does not.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/savings-finder" className="text-sm text-teal-600 hover:underline">Savings Finder</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/subscriptions" className="text-sm text-purple-600 hover:underline">Subscription Audit</a>
      </div>
    </div>
  )
}
