"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, ArrowRight, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// Canadian CPI multipliers relative to 2024 (approximate)
const CPI: Record<number, number> = {
  1950: 0.067, 1955: 0.073, 1960: 0.080, 1965: 0.087, 1970: 0.097,
  1971: 0.100, 1975: 0.130, 1980: 0.180, 1985: 0.230, 1990: 0.290,
  1995: 0.330, 2000: 0.370, 2005: 0.420, 2010: 0.470, 2015: 0.520,
  2020: 0.570, 2021: 0.590, 2022: 0.630, 2023: 0.660, 2024: 0.680,
}

// For simplicity, interpolate between known years
function getCPI(year: number): number {
  if (CPI[year]) return CPI[year]
  const knownYears = Object.keys(CPI).map(Number).sort((a, b) => a - b)
  const lower = knownYears.filter(y => y <= year).pop() || knownYears[0]
  const upper = knownYears.find(y => y >= year) || knownYears[knownYears.length - 1]
  if (lower === upper) return CPI[lower]
  const ratio = (year - lower) / (upper - lower)
  return CPI[lower] + (CPI[upper] - CPI[lower]) * ratio
}

const EVERYDAY_ITEMS: { item: string; price1970: number; price2024: number; increase: string }[] = [
  { item: "Loaf of bread", price1970: 0.24, price2024: 3.50, increase: "1,358%" },
  { item: "Gallon of milk", price1970: 0.62, price2024: 6.50, increase: "948%" },
  { item: "Dozen eggs", price1970: 0.60, price2024: 4.50, increase: "650%" },
  { item: "Pound of beef", price1970: 0.90, price2024: 8.00, increase: "789%" },
  { item: "Movie ticket", price1970: 1.50, price2024: 16.00, increase: "967%" },
  { item: "Stamp", price1970: 0.06, price2024: 1.07, increase: "1,683%" },
  { item: "Average new car", price1970: 3500, price2024: 55000, increase: "1,471%" },
  { item: "Average home (Canada)", price1970: 23000, price2024: 665000, increase: "2,791%" },
  { item: "University tuition (1 year)", price1970: 500, price2024: 7000, increase: "1,300%" },
  { item: "Minimum wage (hourly)", price1970: 1.65, price2024: 16.55, increase: "903%" },
]

const KEY_DATES = [
  { year: 1971, event: "Nixon ends gold standard", impact: "Dollar loses anchor to anything real. Printing begins." },
  { year: 1973, event: "Oil crisis — OPEC embargo", impact: "Energy prices quadruple. First inflation shock." },
  { year: 1980, event: "Inflation hits 12.5% in Canada", impact: "Bank of Canada raises rates to 21%. Painful but effective." },
  { year: 1991, event: "Inflation targeting begins (2%)", impact: "Bank of Canada adopts 2% target. Inflation stabilizes for 30 years." },
  { year: 2008, event: "Financial crisis — rates cut to near zero", impact: "Beginning of ultra-low rates that inflate asset prices." },
  { year: 2020, event: "COVID — massive money printing", impact: "Bank of Canada balance sheet 5x in 18 months. $400B+ created." },
  { year: 2022, event: "Inflation hits 8.1% (40-year high)", impact: "Rate hikes to 5%. Mortgage payments double for millions." },
]

export default function InflationPage() {
  const [amount, setAmount] = useState(100)
  const [fromYear, setFromYear] = useState(1970)
  const [toYear, setToYear] = useState(2024)

  const fromCPI = getCPI(fromYear)
  const toCPI = getCPI(toYear)
  const adjustedAmount = fromCPI > 0 ? Math.round(amount * (toCPI / fromCPI) * 100) / 100 : 0
  const totalInflation = fromCPI > 0 ? Math.round(((toCPI / fromCPI) - 1) * 10000) / 100 : 0

  // Reverse: what would today's price have cost in the past?
  const reverseAmount = toCPI > 0 ? Math.round(amount * (fromCPI / toCPI) * 100) / 100 : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Inflation Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          See what things used to cost, what your money is really worth, and why prices only go up.
        </p>
      </div>

      {/* Calculator */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={amount || ""} onChange={e => setAmount(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">From year</label>
              <Input type="number" min={1950} max={2024} value={fromYear} onChange={e => setFromYear(Number(e.target.value) || 1970)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To year</label>
              <Input type="number" min={1950} max={2024} value={toYear} onChange={e => setToYear(Number(e.target.value) || 2024)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-amber-200 bg-amber-50/20">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">${amount} in {fromYear} equals</p>
                <p className="text-2xl font-bold text-amber-600">${adjustedAmount.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">in {toYear} ({totalInflation}% inflation)</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/20">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">${amount} today would have cost</p>
                <p className="text-2xl font-bold text-blue-600">${reverseAmount.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">in {fromYear}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Everyday items */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Things Used to Cost (1970 vs 2024)</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {EVERYDAY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
              <span className="text-xs text-muted-foreground w-36 shrink-0">{item.item}</span>
              <span className="text-xs text-emerald-600 w-16 text-right">${item.price1970 < 10 ? item.price1970.toFixed(2) : item.price1970.toLocaleString()}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-red-500 font-medium w-16 text-right">${item.price2024 < 10 ? item.price2024.toFixed(2) : item.price2024.toLocaleString()}</span>
              <Badge variant="outline" className="text-[9px] text-red-500 border-red-300 ml-auto">{item.increase}</Badge>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground italic mt-2">
            Note: wages increased ~903% (minimum wage) over the same period. Housing increased 2,791%. This gap is why families feel poorer despite earning more.
          </p>
        </CardContent>
      </Card>

      {/* Key inflation events */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" /> Key Inflation Events in Canadian History
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {KEY_DATES.map((d, i) => (
            <div key={i} className="flex gap-3 items-start">
              <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">{d.year}</Badge>
              <div>
                <p className="text-xs font-medium">{d.event}</p>
                <p className="text-[10px] text-muted-foreground">{d.impact}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why prices only go up:</strong> <Explain tip="Inflation is the general increase in prices over time. It happens when the money supply grows faster than the production of goods and services. More dollars chasing the same amount of stuff = each dollar buys less">Inflation</Explain> is
            not natural or inevitable — it is a policy choice. When governments spend more than they collect in taxes,
            the difference is created as new money. More money chasing the same goods = higher prices. Your savings
            lose purchasing power every year. This is why investing (growing your money faster than inflation erodes it)
            is not optional — it is survival. Cash in a bank account earning 1% while inflation is 3% means you LOSE
            2% of your purchasing power every year. See <a href="/money-history" className="text-violet-600 hover:underline">Money History</a> for
            the full story of why this happens.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/money-history" className="text-sm text-amber-600 hover:underline">Money History</a>
        <a href="/compound-interest" className="text-sm text-emerald-600 hover:underline">Compound Interest</a>
        <a href="/investing" className="text-sm text-blue-600 hover:underline">Investing Basics</a>
        <a href="/education/economics" className="text-sm text-violet-600 hover:underline">Economics Education</a>
      </div>
    </div>
  )
}
