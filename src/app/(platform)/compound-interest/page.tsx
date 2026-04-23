"use client"

import { useState, useEffect, useMemo } from "react"
import { TrendingUp, Sparkles, Coins, Target, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

interface NetWorthData {
  entries?: { type: "asset" | "liability"; amount: number; category?: string }[]
  history?: { date: string; netWorth: number }[]
}

interface BudgetData {
  incomes?: number[]
  expenses?: number[][]
}

// ---------- helpers ----------
function futureValue(initial: number, monthly: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return initial + monthly * n
  return initial * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r)
}

// Years until FV * 0.04 >= annualExpense, i.e. 25× expenses rule
function yearsToFI(initial: number, monthly: number, annualRate: number, annualExpense: number, maxYears = 60): number | null {
  if (annualExpense <= 0) return null
  const target = annualExpense * 25
  if (initial >= target) return 0
  for (let y = 1; y <= maxYears; y++) {
    const fv = futureValue(initial, monthly, annualRate, y)
    if (fv >= target) {
      // refine to month precision
      for (let m = 1; m <= 12; m++) {
        const exact = futureValue(initial, monthly, annualRate, y - 1 + m / 12)
        if (exact >= target) return Math.round((y - 1 + m / 12) * 10) / 10
      }
      return y
    }
  }
  return null
}

// ---------- curve viz ----------
function GrowthCurveSVG({
  years,
  rates,
  initial,
  monthly,
}: {
  years: number
  rates: { pct: number; color: string; label: string }[]
  initial: number
  monthly: number
}) {
  const W = 640, H = 240, PAD_L = 56, PAD_R = 12, PAD_T = 12, PAD_B = 26
  const months = years * 12
  const sampleMonths = Array.from({ length: Math.min(months, 120) + 1 }, (_, i) => Math.round((i * months) / Math.min(months, 120)))

  const seriesList = rates.map(r => {
    const rMo = r.pct / 100 / 12
    let bal = initial
    const pts: { m: number; v: number }[] = [{ m: 0, v: initial }]
    const byMonth: number[] = [initial]
    for (let m = 1; m <= months; m++) {
      bal = bal * (1 + rMo) + monthly
      byMonth.push(bal)
    }
    for (const m of sampleMonths) pts.push({ m, v: byMonth[m] })
    return { ...r, pts: pts.filter((p, i, arr) => i === 0 || p.m !== arr[i - 1].m) }
  })

  const allVals = seriesList.flatMap(s => s.pts.map(p => p.v))
  const yMax = Math.max(...allVals, 1)
  const yMin = 0
  const xMax = months

  const sx = (m: number) => PAD_L + (m / Math.max(1, xMax)) * (W - PAD_L - PAD_R)
  const sy = (v: number) => H - PAD_B - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * (H - PAD_T - PAD_B)

  const ticks = Array.from({ length: 5 }, (_, i) => (yMax * i) / 4)
  const xTicks = Array.from({ length: Math.min(6, years + 1) }, (_, i) => Math.round((i * months) / Math.min(5, years)))

  function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${Math.round(v)}`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Compound growth curves">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={sy(t)} x2={W - PAD_R} y2={sy(t)} stroke="currentColor" className="text-muted-foreground/15" />
          <text x={PAD_L - 6} y={sy(t) + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">{fmt(t)}</text>
        </g>
      ))}
      {xTicks.map((m, i) => (
        <text key={i} x={sx(m)} y={H - 10} textAnchor="middle" fontSize={9} className="fill-muted-foreground">{(m / 12).toFixed(0)}y</text>
      ))}
      {seriesList.map((s, idx) => (
        <path
          key={idx}
          d={s.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.m).toFixed(1)} ${sy(p.v).toFixed(1)}`).join(" ")}
          fill="none"
          className={s.color}
          strokeWidth={2}
        />
      ))}
      {/* contributions line (flat slope monthly*m + initial) */}
      {(() => {
        const pts: string[] = []
        for (const m of sampleMonths) {
          const v = initial + monthly * m
          pts.push(`${pts.length === 0 ? "M" : "L"} ${sx(m).toFixed(1)} ${sy(v).toFixed(1)}`)
        }
        return <path d={pts.join(" ")} fill="none" className="stroke-muted-foreground/70" strokeWidth={1.25} strokeDasharray="4 3" />
      })()}
      <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="currentColor" className="text-muted-foreground/30" />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="currentColor" className="text-muted-foreground/30" />
    </svg>
  )
}

// ---------- page ----------
export default function CompoundInterestPage() {
  const [monthly, setMonthly] = useState(200)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(30)
  const [initial, setInitial] = useState(0)
  const [annualExpense, setAnnualExpense] = useState(40000)
  const [autofilled, setAutofilled] = useState(false)

  // Pull real user data
  useEffect(() => {
    try {
      const nwRaw = localStorage.getItem("hfp-networth")
      const budgetRaw = localStorage.getItem("hfp-budget")

      let didPrincipal = false
      let didMonthly = false
      let didExpense = false

      if (nwRaw) {
        const nw: NetWorthData = JSON.parse(nwRaw)
        const assets = (nw.entries ?? []).filter(e => e.type === "asset").reduce((s, e) => s + (Number(e.amount) || 0), 0)
        const liabilities = (nw.entries ?? []).filter(e => e.type === "liability").reduce((s, e) => s + (Number(e.amount) || 0), 0)
        const principal = Math.max(0, assets - liabilities)
        if (principal > 0) {
          setInitial(Math.round(principal))
          didPrincipal = true
        }
      }

      if (budgetRaw) {
        const budget: BudgetData = JSON.parse(budgetRaw)
        const totalIncome = (budget.incomes ?? []).reduce((s, v) => s + (Number(v) || 0), 0)
        const totalExpense = (budget.expenses ?? []).reduce((s, row) => s + (row ?? []).reduce((r, v) => r + (Number(v) || 0), 0), 0)
        const surplus = totalIncome - totalExpense
        if (surplus > 0) {
          setMonthly(Math.round(surplus))
          didMonthly = true
        }
        if (totalExpense > 0) {
          setAnnualExpense(Math.round(totalExpense * 12))
          didExpense = true
        }
      }

      if (didPrincipal || didMonthly || didExpense) setAutofilled(true)
    } catch {}
  }, [])

  // ---------- core calcs ----------
  const monthlyRate = rate / 100 / 12
  const totalMonths = years * 12
  const totalContributed = initial + monthly * totalMonths

  const { finalBalance, totalInterest, milestones, crossoverYear } = useMemo(() => {
    let balance = initial
    const ms: { year: number; balance: number; contributed: number; interest: number; yearlyGrowth: number; yearlyInterest: number }[] = []
    let prevBal = initial
    let prevInt = 0
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthly
      if (m % 12 === 0) {
        const contributed = initial + monthly * m
        const interest = balance - contributed
        ms.push({
          year: m / 12,
          balance: Math.round(balance),
          contributed: Math.round(contributed),
          interest: Math.round(interest),
          yearlyGrowth: Math.round(balance - prevBal),
          yearlyInterest: Math.round(interest - prevInt),
        })
        prevBal = balance
        prevInt = interest
      }
    }
    const final = balance
    const interestTotal = final - totalContributed
    const cross = ms.find(m => m.interest > m.contributed)?.year
    return { finalBalance: Math.round(final), totalInterest: Math.round(interestTotal), milestones: ms, crossoverYear: cross }
  }, [initial, monthly, monthlyRate, totalMonths, totalContributed])

  // Alternate scenarios at different rates
  const rateScenarios = useMemo(() => [5, 7, 10].map(r => ({
    rate: r,
    final: Math.round(futureValue(initial, monthly, r, years)),
  })), [initial, monthly, years])

  // +$100/mo scenario
  const plus100 = useMemo(() => Math.round(futureValue(initial, monthly + 100, rate, years)), [initial, monthly, rate, years])
  const plus100Delta = plus100 - finalBalance

  // FI calculations
  const fiByRate = useMemo(() => [5, 7, 10].map(r => ({
    rate: r,
    years: yearsToFI(initial, monthly, r, annualExpense),
  })), [initial, monthly, annualExpense])

  // Penny doubling — 30 days
  const pennyValues = useMemo(() => {
    const vals: number[] = []
    let p = 0.01
    for (let d = 1; d <= 30; d++) {
      vals.push(p)
      p *= 2
    }
    return vals
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Compound Interest</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Einstein called it the{" "}
          <Explain tip="Your money earns interest. Then that interest earns interest. Over time, this snowball effect compounds — the longer you wait, the more explosive the growth.">
            eighth wonder of the world
          </Explain>
          . Seeded from your real net worth and budget.
        </p>
      </div>

      {autofilled && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-3 flex items-start gap-2">
            <Wallet className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>Auto-filled from your data.</strong> Principal pulled from{" "}
              <a className="underline" href="/net-worth">Net Worth</a>; monthly contribution and annual expenses pulled from{" "}
              <a className="underline" href="/budget">Budget</a>. Edit any field below to override.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Inputs */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Starting amount (principal)</label>
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
              <label className="text-xs text-muted-foreground">
                <Explain tip="The average yearly return. The S&P 500 has averaged ~10% per year over 100 years (~7% after inflation). Bonds return 3-5%.">
                  Annual return %
                </Explain>
              </label>
              <Input type="number" value={rate || ""} onChange={e => setRate(Number(e.target.value) || 0)} step="0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Years</label>
              <Input type="number" value={years || ""} onChange={e => setYears(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">
                <Explain tip="Your annual spending. At 25× annual spending, the 4% safe-withdrawal rule says you can live off portfolio returns indefinitely — this is your financial independence number.">
                  Annual expenses (for FI target)
                </Explain>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input type="number" value={annualExpense || ""} onChange={e => setAnnualExpense(Number(e.target.value) || 0)} className="pl-7" />
              </div>
            </div>
          </div>
          <input type="range" min={5} max={50} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-emerald-500" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5 years</span><span>15</span><span>25</span><span>35</span><span>50 years</span>
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
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

      {/* Multi-rate curves */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Projection at 5% / 7% / 10%</CardTitle></CardHeader>
        <CardContent>
          <GrowthCurveSVG
            years={years}
            initial={initial}
            monthly={monthly}
            rates={[
              { pct: 5, color: "stroke-blue-400", label: "5%" },
              { pct: 7, color: "stroke-emerald-500", label: "7%" },
              { pct: 10, color: "stroke-amber-500", label: "10%" },
            ]}
          />
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            {rateScenarios.map(s => (
              <div key={s.rate} className={cn("rounded-lg border p-2 text-center",
                s.rate === 5 ? "bg-blue-50 border-blue-200" : s.rate === 7 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              )}>
                <p className="text-[10px] text-muted-foreground">At {s.rate}% · {years}y</p>
                <p className={cn("font-bold",
                  s.rate === 5 ? "text-blue-700" : s.rate === 7 ? "text-emerald-700" : "text-amber-700"
                )}>${s.final.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><div className="h-0.5 w-6 bg-blue-400" /> 5%</span>
            <span className="flex items-center gap-1"><div className="h-0.5 w-6 bg-emerald-500" /> 7%</span>
            <span className="flex items-center gap-1"><div className="h-0.5 w-6 bg-amber-500" /> 10%</span>
            <span className="flex items-center gap-1"><div className="h-0.5 w-6 border-b border-dashed border-muted-foreground" /> Contributions only</span>
          </div>
        </CardContent>
      </Card>

      {/* +$100/mo scenario */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" /> If You Add $100/month More
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white/60 p-3">
              <p className="text-[10px] text-muted-foreground">Current monthly</p>
              <p className="font-semibold">${monthly.toLocaleString()} · {years}y @ {rate}%</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">${finalBalance.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-emerald-100/60 p-3">
              <p className="text-[10px] text-muted-foreground">With +$100/month</p>
              <p className="font-semibold">${(monthly + 100).toLocaleString()} · {years}y @ {rate}%</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">${plus100.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-[10px] text-muted-foreground">Extra wealth created</p>
              <p className="font-semibold text-amber-700">+${plus100Delta.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                from only ${(100 * years * 12).toLocaleString()} additional deposits
              </p>
            </div>
          </div>
          <p className="text-[11px] text-emerald-900 mt-3 leading-relaxed">
            Adding <strong>$100/month</strong> turns into <strong>${plus100Delta.toLocaleString()}</strong> over {years} years at {rate}%.
            {plus100Delta > 0 && ` That's $${Math.round(plus100Delta / (100 * years * 12)).toLocaleString()} of final wealth per $1 of extra contribution.`}
          </p>
        </CardContent>
      </Card>

      {/* FI / 4% rule */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" /> Time to Financial Independence (4% Rule)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The <Explain tip="The Trinity Study found that retirees who withdraw 4% of their portfolio per year have a very high chance of the money lasting 30+ years. Flipped around: once your portfolio is 25× your annual spending, you can theoretically stop working.">4% safe-withdrawal rule</Explain>
            {" "}says your FI target is <strong>{annualExpense > 0 ? `$${(annualExpense * 25).toLocaleString()}` : "—"}</strong>{" "}
            (25 × ${annualExpense.toLocaleString()}/yr).
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {fiByRate.map(f => (
              <div key={f.rate} className={cn("rounded-lg border p-3 text-center",
                f.rate === 5 ? "bg-blue-50 border-blue-200" : f.rate === 7 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              )}>
                <p className="text-[10px] text-muted-foreground">At {f.rate}% return</p>
                <p className="font-bold text-lg">
                  {f.years === null ? "—" : f.years === 0 ? "Now" : `${f.years} yr`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {f.years === null ? "target not reached in 60y" : f.years === 0 ? "already FI" : `at current pace`}
                </p>
              </div>
            ))}
          </div>
          {annualExpense > 0 && monthly > 0 && (
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Cutting annual expenses by <strong>$2,400/yr ($200/mo)</strong> lowers your FI target by{" "}
              <strong>${(2400 * 25).toLocaleString()}</strong> — a double-whammy: less to save for, more to invest.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Growth bar chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Annual Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-1.5 pr-3">Year</th>
                  <th className="py-1.5 pr-3 text-right">Contributed</th>
                  <th className="py-1.5 pr-3 text-right">Interest</th>
                  <th className="py-1.5 pr-3 text-right">Balance</th>
                  <th className="py-1.5 text-right">Yr growth</th>
                </tr>
              </thead>
              <tbody>
                {milestones.filter((_, i, arr) => {
                  const step = years > 30 ? 5 : years > 15 ? 2 : 1
                  return i % step === 0 || i === arr.length - 1
                }).map(m => (
                  <tr key={m.year} className={cn("border-b border-muted/30",
                    crossoverYear && m.year === crossoverYear ? "bg-emerald-50/60" : ""
                  )}>
                    <td className="py-1.5 pr-3 font-medium">
                      Yr {m.year}
                      {crossoverYear === m.year && <Badge variant="secondary" className="ml-2 text-[9px]">crossover</Badge>}
                    </td>
                    <td className="py-1.5 pr-3 text-right text-blue-700">${m.contributed.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right text-emerald-700">${m.interest.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right font-semibold">${m.balance.toLocaleString()}</td>
                    <td className="py-1.5 text-right text-muted-foreground">+${m.yearlyGrowth.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {crossoverYear ? (
            <p className="text-[11px] text-emerald-700 mt-3 leading-relaxed">
              <strong>Year {crossoverYear}:</strong> your total accumulated interest exceeds your total contributions. From this point
              forward, your money earns more than you deposit. This is where compound interest becomes a wealth engine.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-3">
              Crossover (interest &gt; contributions) not yet reached within {years}y. Extend the horizon or raise the rate to see it.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Penny doubled */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" /> The Penny Doubled Daily
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Would you rather have <strong>$1,000,000 today</strong>, or a <strong>penny that doubles every day for 30 days</strong>?
            Most people pick the million. Watch what happens:
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 text-[10px]">
            {pennyValues.map((v, i) => (
              <div key={i} className={cn("rounded border p-1 text-center",
                i < 10 ? "bg-white/60 border-muted" :
                i < 20 ? "bg-amber-50 border-amber-200" :
                i < 27 ? "bg-amber-100 border-amber-300" :
                "bg-amber-200 border-amber-400 font-semibold"
              )}>
                <p className="text-[9px] text-muted-foreground">D{i + 1}</p>
                <p className="text-[10px] leading-tight">
                  {v < 1 ? `${(v * 100).toFixed(0)}¢` : v < 1000 ? `$${v.toFixed(0)}` : v < 1_000_000 ? `$${(v / 1000).toFixed(0)}k` : `$${(v / 1_000_000).toFixed(1)}M`}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Day 30: <strong>${pennyValues[29].toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> — over{" "}
            <strong>{Math.round(pennyValues[29] / 1_000_000)}×</strong> the million. Notice: on day 20, the penny is only worth{" "}
            <strong>${pennyValues[19].toFixed(0)}</strong>. The explosive growth happens in the final 10 days.{" "}
            <em>This is why compound investing feels slow for years and then suddenly changes your life.</em>
          </p>
        </CardContent>
      </Card>

      {/* The cost of waiting */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          {(() => {
            const start25 = futureValue(0, monthly, rate, 40)
            const start35 = futureValue(0, monthly, rate, 30)
            const diff = start25 - start35
            return (
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>The price of waiting 10 years</strong> at your current <strong>${monthly}/month</strong> and{" "}
                <strong>{rate}%</strong>: starting at 25 gives you <strong>${Math.round(start25).toLocaleString()}</strong> by 65;
                waiting until 35 gives you <strong>${Math.round(start35).toLocaleString()}</strong>. Those 10 years cost{" "}
                <strong>${Math.round(diff).toLocaleString()}</strong> — and you only contributed <strong>${(monthly * 120).toLocaleString()}</strong> less.
                The rest was lost compound growth. <em>Time is the ingredient you cannot buy back.</em>
              </p>
            )
          })()}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/trajectory" className="text-sm text-violet-600 hover:underline">Life Trajectory</a>
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/net-worth" className="text-sm text-amber-600 hover:underline">Net Worth</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget</a>
        <a href="/financial-dashboard" className="text-sm text-indigo-600 hover:underline">Financial Dashboard</a>
      </div>
    </div>
  )
}
