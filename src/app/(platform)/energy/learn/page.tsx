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

      {/* How P2P Energy Trading Actually Works */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" /> How Do I Actually Sell Energy to My Neighbor?
          </CardTitle>
          <CardDescription>Step by step — from solar panels to getting paid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* The story */}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm leading-relaxed text-yellow-900">
              Let's say it's a sunny Tuesday afternoon. Your solar panels are producing 8 kW but your house is only
              using 3 kW. That's 5 kW of extra electricity being generated. Right now, that surplus goes back to the
              utility company — and they pay you a fraction of what they charge everyone else for it. That's not fair.
              Here's how it works when YOU control your energy:
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <StepCard number={1} title="You produce more than you use"
              content="Your solar panels generate electricity. Your home uses some of it. The rest is surplus — energy that would otherwise be wasted or sold to the utility company for pennies."
              simple="You make more electricity than your house needs. Instead of giving it away cheap, you keep it to sell yourself."
            />

            <StepCard number={2} title="A small device on your meter tracks it"
              content="A hardware node (about the size of a phone charger, costs ~$15) plugs into your electrical panel. It measures exactly how much energy you produce, consume, and have available as surplus — in real-time."
              simple="A tiny device on your electric panel counts exactly how much extra energy you have. It's like a fitness tracker but for your electricity."
            />

            <StepCard number={3} title="Your surplus gets listed on the marketplace"
              content="The device automatically lists your available surplus on the P2P energy marketplace. It sets a price based on your preferences — maybe $0.10/kWh, which is less than the grid charges ($0.15/kWh) but more than the utility would pay you ($0.04/kWh)."
              simple="Your extra energy automatically shows up in a marketplace — like listing something on eBay. You set the price. It's more than the utility would pay you, but less than what your neighbor pays the power company. Everyone wins."
            />

            <StepCard number={4} title="Your neighbor buys it"
              content="Your neighbor (or anyone nearby on the local grid) sees your listing. Their device automatically buys your surplus because it's cheaper than grid electricity. They don't have to do anything — their device is set to 'buy cheapest available energy.'"
              simple="Your neighbor's device automatically buys your cheaper energy instead of the expensive utility energy. They save money without doing anything. It happens automatically."
            />

            <StepCard number={5} title="Smart contract handles payment"
              content="A smart contract on the blockchain automatically transfers payment from your neighbor's account to yours. No invoice. No bank. No waiting. The transaction is instant, transparent, and can't be faked."
              simple="You get paid instantly and automatically. No bills, no banks, no waiting. Computer code handles the whole transaction — nobody can cheat because it's all recorded publicly."
            />

            <StepCard number={6} title="You earn FOUND tokens on top"
              content="In addition to the energy payment, the platform rewards you with FOUND tokens for producing renewable energy. These tokens give you governance power over the energy grid and can be used across the entire Human Flourishing Platform."
              simple="On top of getting paid for your energy, you earn bonus tokens just for producing clean energy. It's like cashback rewards for being green."
            />
          </div>

          {/* The math */}
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-3">The Math: Why Everyone Wins</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">What the utility pays you for surplus</span>
                <span className="font-bold text-red-500">$0.03–0.05/kWh</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">What P2P marketplace pays you</span>
                <span className="font-bold text-emerald-600">$0.08–0.12/kWh</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">What grid charges your neighbor</span>
                <span className="font-bold text-red-500">$0.12–0.20/kWh</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">What your neighbor pays on P2P</span>
                <span className="font-bold text-emerald-600">$0.08–0.12/kWh</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>You earn 2-3x more</strong> than selling to the utility.
              <strong> Your neighbor pays 20-40% less</strong> than grid rates.
              The utility company — the middleman — is the only one who loses. That's why they fight P2P trading.
            </p>
          </div>

          {/* Current reality */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <h3 className="font-semibold text-sm mb-2">Where Are We Today?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">What works now:</strong> Track your production and consumption,
                calculate solar ROI, see your climate impact, earn FOUND tokens, practice with the trading simulator.
              </p>
              <p>
                <strong className="text-foreground">What's coming:</strong> Hardware nodes (~$15), real-time metering,
                actual P2P trading with smart contract settlement, community energy pools.
              </p>
              <p>
                <strong className="text-foreground">What exists elsewhere:</strong> Australia's Power Ledger,
                Brooklyn Microgrid in NYC, and several European pilot programs have proven P2P energy trading works.
                The technology exists. The regulations are catching up.
              </p>
            </div>
          </div>

          {/* Who benefits most */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Who Benefits Most?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { who: "Solar homeowners", why: "Earn 2-3x more for surplus energy than utility buyback rates" },
                { who: "Renters & non-solar homes", why: "Buy cheaper, cleaner energy from neighbors instead of the grid" },
                { who: "Rural communities", why: "Build energy independence — less reliance on distant power plants and aging infrastructure" },
                { who: "Developing regions", why: "Skip the expensive centralized grid entirely — like how Africa skipped landlines and went straight to mobile phones" },
              ].map(item => (
                <div key={item.who} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold">{item.who}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.why}</p>
                </div>
              ))}
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

function StepCard({ number, title, content, simple }: { number: number; title: string; content: string; simple: string }) {
  const [showSimple, setShowSimple] = useState(false)

  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-sm font-bold shadow">
        {number}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {showSimple ? simple : content}
        </p>
        <button onClick={() => setShowSimple(!showSimple)} className="text-[10px] text-amber-600 hover:underline mt-1">
          {showSimple ? "Show detailed version" : "Explain it simpler →"}
        </button>
      </div>
    </div>
  )
}
