"use client"

import { useState } from "react"
import { Home, DollarSign, TrendingUp, Scale, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function RentVsBuyPage() {
  const [rent, setRent] = useState(2000)
  const [homePrice, setHomePrice] = useState(500000)
  const [downPayment, setDownPayment] = useState(50000)
  const [mortgageRate, setMortgageRate] = useState(5.0)
  const [yearsStaying, setYearsStaying] = useState(10)
  const [annualAppreciation, setAnnualAppreciation] = useState(3)
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3)

  const mortgage = homePrice - downPayment
  const monthlyRate = mortgageRate / 100 / 12
  const payments = 25 * 12
  const monthlyMortgage = monthlyRate > 0 ? mortgage * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1) : mortgage / payments

  // Buying costs over the period
  const propertyTax = homePrice * 0.01 / 12
  const insurance = 150
  const maintenance = homePrice * 0.01 / 12
  const monthlyOwning = Math.round(monthlyMortgage + propertyTax + insurance + maintenance)
  const closingCosts = homePrice * 0.03 // land transfer + legal + inspection
  const sellingCosts = homePrice * Math.pow(1 + annualAppreciation / 100, yearsStaying) * 0.05 // realtor fees

  let totalBuyingCost = closingCosts + downPayment
  for (let y = 0; y < yearsStaying; y++) totalBuyingCost += monthlyOwning * 12
  totalBuyingCost += sellingCosts

  const futureHomeValue = Math.round(homePrice * Math.pow(1 + annualAppreciation / 100, yearsStaying))
  // Remaining mortgage after yearsStaying (rough estimate)
  let remainingMortgage = mortgage
  for (let m = 0; m < yearsStaying * 12; m++) {
    const interest = remainingMortgage * monthlyRate
    remainingMortgage = remainingMortgage - (monthlyMortgage - interest)
  }
  const equity = futureHomeValue - Math.max(0, remainingMortgage)
  const netBuying = Math.round(totalBuyingCost - equity)

  // Renting costs + investing the difference
  let totalRenting = 0
  let investmentBalance = downPayment + closingCosts // invest what you'd have spent on down payment + closing
  const monthlyInvestReturn = 0.07 / 12
  let currentRent = rent
  for (let y = 0; y < yearsStaying; y++) {
    const monthlySavings = Math.max(0, monthlyOwning - currentRent)
    for (let m = 0; m < 12; m++) {
      totalRenting += currentRent
      investmentBalance = investmentBalance * (1 + monthlyInvestReturn) + monthlySavings
    }
    currentRent = Math.round(currentRent * (1 + annualRentIncrease / 100))
  }
  const netRenting = Math.round(totalRenting - investmentBalance)

  const buyingWins = netBuying < netRenting
  const difference = Math.abs(netBuying - netRenting)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Rent vs Buy Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">The honest math — not the real estate agent's version. Sometimes renting IS smarter.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Monthly rent</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={rent || ""} onChange={e => setRent(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Home price</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={homePrice || ""} onChange={e => setHomePrice(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Down payment</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={downPayment || ""} onChange={e => setDownPayment(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Mortgage rate %</label>
            <Input type="number" step="0.1" value={mortgageRate} onChange={e => setMortgageRate(Number(e.target.value) || 0)} /></div>
            <div><label className="text-xs text-muted-foreground">Years staying</label>
            <Input type="number" value={yearsStaying} onChange={e => setYearsStaying(Number(e.target.value) || 1)} /></div>
            <div><label className="text-xs text-muted-foreground">Home appreciation %/yr</label>
            <Input type="number" step="0.5" value={annualAppreciation} onChange={e => setAnnualAppreciation(Number(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn("border-2", buyingWins ? "border-emerald-300 bg-emerald-50/20" : "border-red-200 bg-red-50/10")}>
          <CardContent className="p-4 text-center">
            <Home className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-semibold">Buying</p>
            <p className="text-xs text-muted-foreground mb-1">Monthly: ${monthlyOwning.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Equity after {yearsStaying}yr: ${equity.toLocaleString()}</p>
            <p className={cn("text-lg font-bold mt-1", buyingWins ? "text-emerald-600" : "text-red-500")}>
              Net cost: ${netBuying.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className={cn("border-2", !buyingWins ? "border-emerald-300 bg-emerald-50/20" : "border-red-200 bg-red-50/10")}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-1 text-violet-500" />
            <p className="text-sm font-semibold">Renting + Investing</p>
            <p className="text-xs text-muted-foreground mb-1">Starting rent: ${rent.toLocaleString()}/mo</p>
            <p className="text-xs text-muted-foreground">Investment value: ${Math.round(investmentBalance).toLocaleString()}</p>
            <p className={cn("text-lg font-bold mt-1", !buyingWins ? "text-emerald-600" : "text-red-500")}>
              Net cost: ${netRenting.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={cn("border-2", buyingWins ? "border-emerald-200 bg-emerald-50/20" : "border-violet-200 bg-violet-50/20")}>
        <CardContent className="p-4">
          <p className="text-sm leading-relaxed">
            {buyingWins ? (
              <><strong className="text-emerald-700">Buying wins by ${difference.toLocaleString()}</strong> over {yearsStaying} years. You build ${equity.toLocaleString()} in equity and the home appreciates. Buying makes sense if you stay long enough to offset closing/selling costs.</>
            ) : (
              <><strong className="text-violet-700">Renting + investing wins by ${difference.toLocaleString()}</strong> over {yearsStaying} years. By investing the down payment + monthly savings, you build ${Math.round(investmentBalance).toLocaleString()} in liquid wealth. Renting is NOT throwing money away when the math works.</>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Key factors:</strong> Buying wins when you stay 7+ years, appreciation is 3%+, and monthly owning cost is close to rent. Renting wins when you might move within 5 years (closing + selling costs eat your equity), when rent is significantly less than owning, or when you can discipline yourself to actually invest the difference. The calculator assumes renters invest — if they spend the savings instead, buying almost always wins.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/home-buying" className="text-sm text-blue-600 hover:underline">Home Buying Guide</a>
        <a href="/mortgage" className="text-sm text-indigo-600 hover:underline">Mortgage Comparison</a>
        <a href="/canada/housing" className="text-sm text-red-600 hover:underline">Housing Crisis</a>
        <a href="/investing" className="text-sm text-emerald-600 hover:underline">Investing Basics</a>
      </div>
    </div>
  )
}
