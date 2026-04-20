"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Clock, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function CompoundInterestPage() {
  const [monthly, setMonthly] = useState(200)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(30)
  const [initial, setInitial] = useState(0)

  // Calculate compound interest
  const monthlyRate = rate / 100 / 12
  const totalMonths = years * 12
  const totalContributed = initial + monthly * totalMonths

  let balance = initial
  const milestones: { year: number; balance: number; contributed: number; interest: number }[] = []

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthly
    if (m % 12 === 0) {
      const contributed = initial + monthly * m
      milestones.push({
        year: m / 12,
        balance: Math.round(balance),
        contributed: Math.round(contributed),
        interest: Math.round(balance - contributed),
      })
    }
  }

  const totalInterest = Math.round(balance - totalContributed)
  const finalBalance = Math.round(balance)

  // Find when interest exceeds contributions
  const crossoverYear = milestones.find(m => m.interest > m.contributed)?.year

  // Key milestone years
  const at10 = milestones.find(m => m.year === 10)
  const at20 = milestones.find(m => m.year === 20)
  const at30 = milestones.find(m => m.year === 30)
  const at40 = milestones.find(m => m.year === 40)

  const maxBalance = milestones.length > 0 ? milestones[milestones.length - 1].balance : 1

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Compound Interest Visualizer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Einstein called it the <Explain tip="Your money earns interest. Then that interest earns interest. Then THAT interest earns interest. Over time, this snowball effect means your money grows faster and faster — the longer you wait, the more explosive the growth becomes">eighth wonder of the world</Explain>. See why time is your most powerful investment tool.
        </p>
      </div>

      {/* Inputs */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Starting amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input type="number" value={initial || ""} onChange={e => setInitial(Number(e.target.value) || 0)} className="pl-7" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monthly contribution</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input type="number" value={monthly || ""} onChange={e => setMonthly(Number(e.target.value) || 0)} className="pl-7" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground"><Explain tip="The average yearly return on your investment. The S&P 500 has averaged about 10% per year over 100 years (7% after inflation). Conservative investments like bonds return 3-5%">Annual return %</Explain></label>
              <Input type="number" value={rate || ""} onChange={e => setRate(Number(e.target.value) || 0)} step="0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Years</label>
              <Input type="number" value={years || ""} onChange={e => setYears(Math.min(50, Number(e.target.value) || 0))} />
            </div>
          </div>
          <input type="range" min={5} max={50} value={years} onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-emerald-500" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5 years</span><span>15</span><span>25</span><span>35</span><span>50 years</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">${finalBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Final balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-600">${totalContributed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">You put in</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-600">${totalInterest.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Interest earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual bar chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Growth Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {milestones.filter((_, i) => i % (years > 30 ? 5 : years > 15 ? 2 : 1) === 0 || i === milestones.length - 1).map(m => (
              <div key={m.year} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">Yr {m.year}</span>
                <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-400 rounded-l-full" style={{ width: `${(m.contributed / maxBalance) * 100}%` }} />
                  <div className="h-full bg-emerald-400" style={{ width: `${(m.interest / maxBalance) * 100}%` }} />
                </div>
                <span className="text-[10px] font-medium w-20 text-right shrink-0">${m.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Your money</span>
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Interest earned</span>
          </div>
        </CardContent>
      </Card>

      {/* Key insight */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> The Key Insight
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {crossoverYear ? (
              <>At year <strong>{crossoverYear}</strong>, your interest earnings EXCEED your total contributions.
              From that point forward, your money is making more money than you are putting in.
              This is the crossover point — where compound interest becomes a wealth engine that runs on its own.</>
            ) : (
              <>With these settings, your interest hasn&apos;t exceeded your contributions yet within the timeframe. Try increasing the years or the return rate to see the crossover point.</>
            )}
          </p>

          {/* Milestone comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {[at10, at20, at30, at40].filter(Boolean).map(m => m && (
              <div key={m.year} className="rounded-lg bg-white/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground">{m.year} years</p>
                <p className="text-sm font-bold text-emerald-600">${m.balance.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">${m.interest.toLocaleString()} interest</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The real-world example */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The most expensive mistake:</strong> Waiting. If you invest $200/month starting at age 25, you will have
            ~$566,000 by age 65 (at 7%). If you wait until 35 to start the same $200/month, you will have ~$264,000.
            Those 10 years of waiting cost you <strong>$302,000</strong> — and you only put in $24,000 less.
            The other $278,000 was lost compound interest. Time is the ingredient you cannot buy back.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/education/economics" className="text-sm text-amber-600 hover:underline">Economics Education</a>
        <a href="/net-worth" className="text-sm text-violet-600 hover:underline">Net Worth</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
      </div>
    </div>
  )
}
