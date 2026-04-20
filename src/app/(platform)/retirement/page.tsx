"use client"

import { useState } from "react"
import { Clock, DollarSign, TrendingUp, AlertTriangle, ArrowRight, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function RetirementPage() {
  const [age, setAge] = useState(30)
  const [retireAge, setRetireAge] = useState(65)
  const [income, setIncome] = useState(80000)
  const [rrspBalance, setRrspBalance] = useState(20000)
  const [rrspMonthly, setRrspMonthly] = useState(500)
  const [tfsaBalance, setTfsaBalance] = useState(10000)
  const [tfsaMonthly, setTfsaMonthly] = useState(300)
  const [otherSavings, setOtherSavings] = useState(5000)
  const [desiredIncome, setDesiredIncome] = useState(50000)
  const [returnRate, setReturnRate] = useState(7)

  const yearsToRetire = Math.max(0, retireAge - age)
  const months = yearsToRetire * 12
  const monthlyRate = returnRate / 100 / 12

  // RRSP projection
  let rrspFuture = rrspBalance
  for (let m = 0; m < months; m++) rrspFuture = rrspFuture * (1 + monthlyRate) + rrspMonthly
  rrspFuture = Math.round(rrspFuture)

  // TFSA projection
  let tfsaFuture = tfsaBalance
  for (let m = 0; m < months; m++) tfsaFuture = tfsaFuture * (1 + monthlyRate) + tfsaMonthly
  tfsaFuture = Math.round(tfsaFuture)

  // Other savings (no additional contributions assumed)
  const otherFuture = Math.round(otherSavings * Math.pow(1 + returnRate / 100, yearsToRetire))

  // CPP estimate (simplified — based on years contributing and income level)
  const cppYears = Math.min(39, retireAge - 18) // max contributory period
  const ympe = 68500 // Year's Maximum Pensionable Earnings 2024
  const cppRate = Math.min(income / ympe, 1) // what % of maximum you earn
  const cppMaxMonthly = 1365 // max CPP monthly at 65 (2024)
  const cppMonthly = Math.round(cppMaxMonthly * cppRate * Math.min(cppYears / 39, 1))
  const cppAnnual = cppMonthly * 12
  // Early/late adjustment
  const cppAdjusted = retireAge < 65 ? Math.round(cppMonthly * (1 - (65 - retireAge) * 0.006) * 12) :
    retireAge > 65 ? Math.round(cppMonthly * (1 + (retireAge - 65) * 0.007) * 12) : cppAnnual

  // OAS (universal at 65 with 40 years residence, partial with 10+)
  const oasMax = 8560 // annual 2024
  const oasClawback = Math.max(0, (desiredIncome - 90000) * 0.15) // clawback starts at ~$90K
  const oasAnnual = retireAge >= 65 ? Math.max(0, oasMax - oasClawback) : 0

  // Total retirement picture
  const totalNest = rrspFuture + tfsaFuture + otherFuture
  const governmentIncome = cppAdjusted + oasAnnual
  const portfolioWithdrawal = Math.round(totalNest * 0.04) // 4% rule
  const totalRetirementIncome = governmentIncome + portfolioWithdrawal
  const incomeGap = desiredIncome - totalRetirementIncome
  const funded = desiredIncome > 0 ? Math.min(100, Math.round((totalRetirementIncome / desiredIncome) * 100)) : 0

  // What to change to close the gap
  const additionalMonthlyNeeded = incomeGap > 0 ?
    Math.round(incomeGap / 0.04 / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) || 1)) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Retirement Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground">CPP + OAS + RRSP + TFSA — see if your retirement is funded and what to change if it is not.</p>
      </div>

      {/* Inputs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Situation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Current age</label>
            <Input type="number" value={age} onChange={e => setAge(Number(e.target.value) || 0)} /></div>
            <div><label className="text-xs text-muted-foreground">Retire at age</label>
            <Input type="number" value={retireAge} onChange={e => setRetireAge(Number(e.target.value) || 0)} /></div>
            <div><label className="text-xs text-muted-foreground">Current income</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="pl-7" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">RRSP balance</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={rrspBalance || ""} onChange={e => setRrspBalance(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">RRSP monthly contribution</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={rrspMonthly || ""} onChange={e => setRrspMonthly(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">TFSA balance</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={tfsaBalance || ""} onChange={e => setTfsaBalance(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">TFSA monthly contribution</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={tfsaMonthly || ""} onChange={e => setTfsaMonthly(Number(e.target.value) || 0)} className="pl-7" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Desired retirement income/year</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <Input type="number" value={desiredIncome || ""} onChange={e => setDesiredIncome(Number(e.target.value) || 0)} className="pl-7" /></div></div>
            <div><label className="text-xs text-muted-foreground">Expected return %</label>
            <Input type="number" step="0.5" value={returnRate} onChange={e => setReturnRate(Number(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Funding meter */}
      <Card className={cn("border-2", funded >= 100 ? "border-emerald-300 bg-emerald-50/20" : funded >= 70 ? "border-amber-300 bg-amber-50/20" : "border-red-300 bg-red-50/20")}>
        <CardContent className="p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Retirement Funded</p>
          <p className={cn("text-4xl font-bold", funded >= 100 ? "text-emerald-600" : funded >= 70 ? "text-amber-600" : "text-red-500")}>{funded}%</p>
          <div className="h-3 bg-muted rounded-full overflow-hidden mt-2 mx-auto max-w-xs">
            <div className={cn("h-full rounded-full", funded >= 100 ? "bg-emerald-500" : funded >= 70 ? "bg-amber-500" : "bg-red-400")}
              style={{ width: `${Math.min(funded, 100)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {funded >= 100 ? "You are on track! Your retirement income exceeds your target." :
             `You need $${Math.abs(incomeGap).toLocaleString()}/year more. See recommendations below.`}
          </p>
        </CardContent>
      </Card>

      {/* Income breakdown at retirement */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Retirement Income Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground"><Explain tip="Canada Pension Plan — you contribute from every paycheque. Amount depends on how much you earned and how long you contributed. Max at 65 is ~$1,365/month (2024). You can take it early (reduced) or late (increased)">CPP</Explain> (estimated)</span>
            <span className="font-bold">${cppAdjusted.toLocaleString()}/year</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground"><Explain tip="Old Age Security — paid to all Canadians 65+ who have lived in Canada 10+ years. Maximum ~$8,560/year (2024). Clawed back if income exceeds ~$90K">OAS</Explain></span>
            <span className="font-bold">${oasAnnual.toLocaleString()}/year</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">RRSP withdrawals (<Explain tip="A widely-used guideline: withdraw 4% of your portfolio each year. This gives you ~30 years of income with reasonable market returns. $1M portfolio = $40K/year">4% rule</Explain>)</span>
            <span className="font-bold">${Math.round(rrspFuture * 0.04).toLocaleString()}/year</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">TFSA withdrawals (4% rule, <strong>tax-free</strong>)</span>
            <span className="font-bold text-emerald-600">${Math.round(tfsaFuture * 0.04).toLocaleString()}/year</span>
          </div>
          {otherFuture > 0 && <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Other savings (4% rule)</span>
            <span className="font-bold">${Math.round(otherFuture * 0.04).toLocaleString()}/year</span>
          </div>}
          <div className="border-t pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm font-bold">Total retirement income</span>
            <span className={cn("text-sm font-bold", totalRetirementIncome >= desiredIncome ? "text-emerald-600" : "text-red-500")}>
              ${totalRetirementIncome.toLocaleString()}/year
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target</span>
            <span>${desiredIncome.toLocaleString()}/year</span>
          </div>

          {/* Nest egg at retirement */}
          <div className="border-t pt-2 mt-2 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[10px] text-muted-foreground">RRSP at {retireAge}</p><p className="text-sm font-bold">${(rrspFuture / 1000).toFixed(0)}K</p></div>
            <div><p className="text-[10px] text-muted-foreground">TFSA at {retireAge}</p><p className="text-sm font-bold text-emerald-600">${(tfsaFuture / 1000).toFixed(0)}K</p></div>
            <div><p className="text-[10px] text-muted-foreground">Total nest egg</p><p className="text-sm font-bold">${(totalNest / 1000).toFixed(0)}K</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Gap fix */}
      {incomeGap > 0 && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">How to Close the ${incomeGap.toLocaleString()}/year Gap</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-muted-foreground flex gap-2">
                <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span>Increase monthly savings by <strong>${additionalMonthlyNeeded.toLocaleString()}/month</strong> to fully fund retirement</span>
              </li>
              <li className="text-xs text-muted-foreground flex gap-2">
                <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span>Delay retirement by <strong>3-5 years</strong> — CPP increases 8.4%/year after 65, more years of savings compound</span>
              </li>
              <li className="text-xs text-muted-foreground flex gap-2">
                <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span>Reduce desired income by <strong>${incomeGap.toLocaleString()}/year</strong> — possible if home is paid off and kids are independent</span>
              </li>
              <li className="text-xs text-muted-foreground flex gap-2">
                <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span>Build a <a href="/side-hustles" className="text-violet-600 hover:underline">side income</a> that continues into semi-retirement</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The power of starting now:</strong> Every year you delay saving for retirement costs you roughly
            <strong> 10% of your final nest egg</strong> due to lost compound growth. Starting at 25 vs 35 with the
            same monthly contribution results in nearly <strong>double the final amount</strong>. The best time to
            start was 10 years ago. The second best time is today. Use the{" "}
            <a href="/canada/tax-optimization" className="text-violet-600 hover:underline">Tax Optimization Guide</a> to
            pick the right accounts.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada/tax-optimization" className="text-sm text-emerald-600 hover:underline">Tax Optimization</a>
        <a href="/compound-interest" className="text-sm text-blue-600 hover:underline">Compound Interest</a>
        <a href="/financial-dashboard" className="text-sm text-violet-600 hover:underline">Financial Dashboard</a>
        <a href="/budget" className="text-sm text-amber-600 hover:underline">Budget</a>
      </div>
    </div>
  )
}
