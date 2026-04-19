"use client"

import { useState } from "react"
import { Zap, Sun, Wind, Droplets, Battery, DollarSign, Globe2, Lightbulb, ChevronDown, ChevronUp, Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Explain({ text, simple }: { text: string; simple: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline">
      {text}
      <button onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-bold ml-1 align-super cursor-pointer hover:bg-yellow-200">?</button>
      {show && (
        <span className="block mt-1 mb-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 leading-relaxed">
          <Lightbulb className="h-3 w-3 inline mr-1" /><strong>Simply:</strong> {simple}
        </span>
      )}
    </span>
  )
}

export default function EnergyLearnPage() {
  const [monthlyBill, setMonthlyBill] = useState("")
  const [roofSize, setRoofSize] = useState("")
  const [sunHours, setSunHours] = useState("5")

  // Solar ROI calculator
  const bill = parseFloat(monthlyBill) || 0
  const roof = parseFloat(roofSize) || 0
  const sun = parseFloat(sunHours) || 5
  const systemSize = Math.min(roof / 100, bill / 15) // rough kW estimate
  const systemCost = systemSize * 2500 // ~$2.50/watt average
  const annualProduction = systemSize * sun * 365 // kWh/year
  const annualSavings = bill * 12 * 0.85 // assume 85% offset
  const paybackYears = systemCost > 0 && annualSavings > 0 ? Math.round((systemCost * 0.74) / annualSavings * 10) / 10 : 0 // after 26% tax credit
  const twentyYearSavings = annualSavings * 20 - systemCost * 0.74

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Energy Education</h1>
        </div>
        <p className="text-sm text-muted-foreground">Understand energy, calculate your solar ROI, and learn about the decentralized future.</p>
      </div>

      {/* What is the energy module */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-2">What is the Decentralized Energy Grid?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Today, you buy electricity from a utility company that controls the grid. They set the price.
            A decentralized energy grid lets you produce your own energy (solar panels, wind turbines) and
            sell surplus directly to your neighbors — no middleman. Smart contracts handle payment automatically.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Right now</strong>, this module helps you track your energy production and consumption,
            understand your costs, and calculate whether solar makes financial sense for you.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>The future</strong>: real-time P2P energy trading with hardware nodes on each home,
            smart contract settlement in FOUND tokens, and community energy independence.
          </p>
        </CardContent>
      </Card>

      {/* Solar ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-500" /> Solar ROI Calculator
          </CardTitle>
          <CardDescription>Should you go solar? Let's find out with real numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Monthly electric bill ($)</Label>
              <Input type="number" placeholder="e.g. 150" value={monthlyBill} onChange={e => setMonthlyBill(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Roof size (sq ft)</Label>
              <Input type="number" placeholder="e.g. 1500" value={roofSize} onChange={e => setRoofSize(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Avg sun hours/day</Label>
              <Input type="number" step="0.5" placeholder="5" value={sunHours} onChange={e => setSunHours(e.target.value)} />
            </div>
          </div>

          {bill > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                <p className="text-xs text-muted-foreground">System size</p>
                <p className="text-lg font-bold text-amber-700">{systemSize.toFixed(1)} kW</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                <p className="text-xs text-muted-foreground">Cost (after 26% credit)</p>
                <p className="text-lg font-bold text-amber-700">${Math.round(systemCost * 0.74).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                <p className="text-xs text-muted-foreground">Payback period</p>
                <p className="text-lg font-bold text-emerald-700">{paybackYears} years</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                <p className="text-xs text-muted-foreground">20-year savings</p>
                <p className="text-lg font-bold text-emerald-700">${Math.round(twentyYearSavings).toLocaleString()}</p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Estimates based on average US costs ($2.50/watt), 26% federal tax credit, and 85% bill offset.
            Actual results vary by location, roof angle, shading, and local incentives.
          </p>
        </CardContent>
      </Card>

      {/* Energy concepts */}
      <Card>
        <CardHeader><CardTitle className="text-base">Energy Concepts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              icon: Sun, color: "text-yellow-500",
              term: "Solar Energy",
              definition: "Electricity generated by photovoltaic panels that convert sunlight into electrical current",
              simple: "Panels on your roof turn sunlight into electricity. The sun is free — once you buy the panels, the energy costs nothing",
            },
            {
              icon: Wind, color: "text-cyan-500",
              term: "Net Metering",
              definition: "A billing mechanism that credits solar energy system owners for the electricity they add to the grid",
              simple: "When your solar panels make more electricity than you use, it flows back to the grid and your electric meter literally runs backwards. You get credited for it",
            },
            {
              icon: Battery, color: "text-violet-500",
              term: "Battery Storage",
              definition: "Systems that store excess energy for use when production is low (nighttime, cloudy days)",
              simple: "A big battery in your garage that stores extra solar energy during the day so you can use it at night. Tesla Powerwall is the most famous one",
            },
            {
              icon: Globe2, color: "text-emerald-500",
              term: "Peer-to-Peer Energy Trading",
              definition: "Direct buying and selling of energy between producers and consumers without a utility intermediary",
              simple: "Instead of selling your extra solar energy back to the power company for cheap, you sell it directly to your neighbor at a fair price. Both of you win — they pay less than grid rates, you earn more than buyback rates",
            },
            {
              icon: Zap, color: "text-amber-500",
              term: "Smart Grid",
              definition: "An electrical grid that uses digital communication to detect and react to local changes in usage",
              simple: "A power grid that's intelligent — it knows where energy is being produced, where it's being used, and automatically routes it efficiently. Like Google Maps but for electricity",
            },
            {
              icon: DollarSign, color: "text-green-500",
              term: "Levelized Cost of Energy (LCOE)",
              definition: "The average net present cost of electricity generation for a generating plant over its lifetime",
              simple: "The true cost per kWh over the life of a power source. Solar is now cheaper than coal, natural gas, and nuclear in most places — that's why it's growing so fast",
            },
          ].map((concept) => {
            const Icon = concept.icon
            return (
              <div key={concept.term} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", concept.color)} />
                <div>
                  <p className="text-sm font-semibold">{concept.term}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Explain text={concept.definition} simple={concept.simple} />
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Incentives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" /> How You Benefit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">1.</span>
              <p><strong>Track & understand</strong> — Log your production and consumption. See your renewable percentage. Understand where your energy money goes.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">2.</span>
              <p><strong>Earn FOUND tokens</strong> — Every renewable energy log earns 10 FOUND. Week streaks earn 50 FOUND. The platform rewards you for producing clean energy.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">3.</span>
              <p><strong>Calculate your ROI</strong> — Use the solar calculator to see if panels make financial sense. Most systems pay for themselves in 5-8 years, then produce free electricity for 20+ more years.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">4.</span>
              <p><strong>Climate impact</strong> — See your CO2 savings alongside real NOAA/NASA climate data. Your individual contribution matters and is tracked.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">5.</span>
              <p><strong>Future: P2P trading</strong> — When hardware nodes are available, sell surplus energy directly to neighbors at better rates than utility buyback. Smart contracts handle everything.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/energy" className="text-sm text-amber-600 hover:underline">← Energy Grid</a>
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy →</a>
      </div>
    </div>
  )
}
