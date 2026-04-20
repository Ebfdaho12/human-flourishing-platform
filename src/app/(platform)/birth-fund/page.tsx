"use client"

import { useState } from "react"
import {
  Baby, TrendingUp, DollarSign, Clock, Sparkles, ArrowRight,
  Shield, ChevronDown, Gift, Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// The tier system
// ────────────────────────────────────────────
const TIERS = [
  { year: 15, label: "Tier 1: Age 15", taxOnWithdrawal: "25%", keepRate: 75, color: "text-amber-600", desc: "Child can access funds at 15 (with guardian approval). Higher tax reflects shorter compounding benefit. Useful for education funding." },
  { year: 30, label: "Tier 2: Age 30", taxOnWithdrawal: "15%", keepRate: 85, color: "text-blue-600", desc: "First major milestone. 30 years of growth. Lower tax rate rewards patience. Could fund a home purchase, business start, or continued growth." },
  { year: 45, label: "Tier 3: Age 45", taxOnWithdrawal: "5%", keepRate: 95, color: "text-violet-600", desc: "45 years of compounding. Near-zero tax rewards long-term commitment. Significant wealth accumulated. Could fund children's education or semi-retirement." },
  { year: 60, label: "Tier 4: Age 60", taxOnWithdrawal: "0%", keepRate: 100, color: "text-emerald-600", desc: "Full 60 years. ZERO tax on withdrawal. The fund has had a lifetime to compound. This is true generational wealth — created from modest monthly contributions." },
]

// Grace period: at each tier mark, you have 30 days to withdraw penalty-free at that tier's rate
// If you miss the window, you can still withdraw but at the NEXT lower tier rate (higher tax)
// Or simply let it grow to the next tier

export default function BirthFundPage() {
  const [monthlyFromCCB, setMonthlyFromCCB] = useState(200) // portion of CCB redirected
  const [additionalMonthly, setAdditionalMonthly] = useState(50) // parent adds extra
  const [returnRate, setReturnRate] = useState(7)
  const [showTiers, setShowTiers] = useState(false)

  const totalMonthly = monthlyFromCCB + additionalMonthly
  const monthlyRate = returnRate / 100 / 12

  // Calculate fund value at each tier
  const projections = TIERS.map(tier => {
    const months = tier.year * 12
    // CCB contributions only for first 18 years, then additional contributions could continue or stop
    let balance = 0
    for (let m = 1; m <= months; m++) {
      const contribution = m <= 18 * 12 ? totalMonthly : additionalMonthly // CCB stops at 18, parent contribution optional after
      balance = balance * (1 + monthlyRate) + contribution
    }
    const totalContributed = (totalMonthly * Math.min(months, 18 * 12)) + (months > 18 * 12 ? additionalMonthly * (months - 18 * 12) : 0)
    const interestEarned = balance - totalContributed
    const afterTax = balance * (tier.keepRate / 100)
    return {
      ...tier,
      balance: Math.round(balance),
      totalContributed: Math.round(totalContributed),
      interestEarned: Math.round(interestEarned),
      afterTax: Math.round(afterTax),
      multiplier: totalContributed > 0 ? Math.round(balance / totalContributed * 10) / 10 : 0,
    }
  })

  // Compare to starting at 25
  const startAt25Balance = (() => {
    let b = 0
    for (let m = 1; m <= 35 * 12; m++) b = b * (1 + monthlyRate) + totalMonthly
    return Math.round(b)
  })()
  const startAt25Contributed = totalMonthly * 35 * 12

  // The power comparison
  const birthTo60 = projections[3]
  const age25To60 = {
    balance: startAt25Balance,
    contributed: startAt25Contributed,
    afterTax: startAt25Balance, // assume regular investment tax
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Birth Fund — Retirement From Day One</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What if every child had a compounding investment from birth? Here is what the numbers look like — and a proposal for how it could work.
        </p>
      </div>

      {/* The concept */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Idea</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada already gives families the <Explain tip="Canada Child Benefit — up to $7,437/year per child under 6, $6,275/child aged 6-17. Income-tested. Most families receive $300-$600/month per child">Canada Child Benefit</Explain> (CCB).
            What if a portion — say $200/month — was automatically invested in a <Explain tip="A dedicated long-term growth fund, similar to a TFSA but specifically designed for lifelong compounding. Invested in diversified index funds. The longer you hold, the lower the tax when you withdraw">Birth Fund</Explain> for
            the child from day one? Parents could add more if they choose. The fund grows tax-free. Withdrawals are
            taxed on a tier system: the longer you hold, the less you pay — reaching <strong>0% tax at age 60</strong>.
            The result: <strong>every Canadian child would have a retirement fund growing from the moment they are born.</strong>
            No one starts at zero. No one enters adulthood with nothing. 60 years of compounding does what 30 years never can.
          </p>
        </CardContent>
      </Card>

      {/* Calculator */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Simulator
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">From CCB (monthly)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={monthlyFromCCB || ""} onChange={e => setMonthlyFromCCB(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Parent adds (monthly)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input type="number" value={additionalMonthly || ""} onChange={e => setAdditionalMonthly(Number(e.target.value) || 0)} className="pl-7" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Annual return %</label>
              <Input type="number" step="0.5" value={returnRate} onChange={e => setReturnRate(Number(e.target.value) || 0)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Total: <strong>${totalMonthly}/month</strong> from birth to 18 (CCB stops at 18).
            {additionalMonthly > 0 && <> Parent continues ${additionalMonthly}/month after 18 (optional).</>}
          </p>
        </CardContent>
      </Card>

      {/* Tier projections */}
      <div className="space-y-3">
        {projections.map((p, i) => (
          <Card key={i} className={cn("transition-all",
            i === 3 ? "border-2 border-emerald-300 bg-emerald-50/10" : ""
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", p.color)}>{p.label}</Badge>
                  {i === 3 && <Badge className="text-[9px] bg-emerald-500 text-white">0% TAX</Badge>}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">${p.balance.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">After tax: ${p.afterTax.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                <div>Contributed: <strong>${p.totalContributed.toLocaleString()}</strong></div>
                <div>Interest: <strong className="text-emerald-600">${p.interestEarned.toLocaleString()}</strong></div>
                <div>Multiplier: <strong>{p.multiplier}x</strong></div>
                <div>Tax: <strong className={i === 3 ? "text-emerald-600" : "text-amber-600"}>{p.taxOnWithdrawal}</strong></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The power of starting at birth vs 25 */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-3">Birth vs Starting at 25 — Same Monthly Amount</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Birth Fund (${totalMonthly}/mo from birth)</p>
              <p className="text-2xl font-bold text-emerald-600">${birthTo60.balance.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Put in: ${birthTo60.totalContributed.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Tax at 60: 0%</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Start at 25 (${totalMonthly}/mo for 35 years)</p>
              <p className="text-2xl font-bold text-slate-600">${age25To60.balance.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Put in: ${age25To60.contributed.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Taxed at normal rates</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            <strong>The Birth Fund has ${(birthTo60.balance - age25To60.balance).toLocaleString()} MORE</strong> —
            and you actually contributed <strong>${(age25To60.contributed - birthTo60.totalContributed).toLocaleString()} LESS</strong>.
            That is the power of 25 extra years of compounding.
          </p>
        </CardContent>
      </Card>

      {/* How the tier system works */}
      <Card className="cursor-pointer" onClick={() => setShowTiers(!showTiers)}>
        <CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-violet-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">How the Tier System Would Work</p>
            <p className="text-[10px] text-muted-foreground">Incentive structure that rewards patience without trapping anyone</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showTiers && "rotate-180")} />
        </CardContent>
      </Card>
      {showTiers && (
        <div className="space-y-3">
          {[
            { title: "Automatic Enrollment at Birth", desc: "When a child is born and registered for CCB, a Birth Fund account is automatically created. A portion of CCB (chosen by parents: $100-$400/month) is redirected to the fund. Parents can add additional contributions anytime." },
            { title: "Invested in a National Index Fund", desc: "The fund invests in a diversified global index (similar to VEQT/CPP Investment Board model). Managed at institutional scale = very low fees (0.05-0.10% MER). No individual stock picking. The CPP Investment Board has returned 10%+ annually over 20 years — the same team could manage this." },
            { title: "15-Year Tier Windows", desc: "At ages 15, 30, 45, and 60, a 30-day grace window opens. During this window, the holder can withdraw ALL or PART of the fund at that tier's tax rate. If they do nothing, the fund continues growing to the next tier. Early withdrawal outside grace windows pays the higher tax rate of the tier below." },
            { title: "Tax Incentive Structure", desc: "Age 15: 25% tax (still better than income tax for most). Age 30: 15% tax. Age 45: 5% tax. Age 60: 0% tax. This is not a penalty — it is a reward for patience. The government benefits too: longer-held funds reduce future pension/OAS burden." },
            { title: "Partial Withdrawals Allowed", desc: "At each tier window, you can withdraw part and leave the rest growing. Take 50% at 30 for a house down payment, leave 50% compounding to 60 for retirement. Flexibility without fully exiting." },
            { title: "Death / Hardship Provisions", desc: "If the holder dies, the fund transfers to beneficiaries (spouse, children) at the current tier rate. Serious hardship (disability, terminal illness, foreclosure prevention) allows early access at a reduced penalty rate." },
            { title: "No Government Access", desc: "The fund is owned by the individual, not the government. It cannot be seized, taxed, or redirected by any government. It is held in a private trust structure managed by the CPP Investment Board or similar independent entity. Politicians cannot touch it." },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">{i + 1}</div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* What this solves */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">What This Solves</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Retirement crisis:</strong> No one starts at zero. By 60, even modest contributions from birth produce $500K-$2M+ depending on amounts and returns.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Wealth inequality:</strong> Every child — rich or poor — gets a compounding fund from birth. The CCB already flows to lower-income families at higher rates, meaning this is progressive by design.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>OAS/CPP sustainability:</strong> If citizens have private retirement wealth from birth, future governments spend less on elderly benefits. The fund pays for itself over 60 years.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Financial literacy:</strong> Children grow up knowing they have an investment fund. They learn about compounding, markets, and long-term thinking from childhood. This creates financially literate adults.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Home buying:</strong> At 30, even a partial withdrawal provides a significant down payment — funded by 30 years of compounding, not 5 years of desperate saving.</span></li>
            <li className="flex gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /> <span><strong>Intergenerational wealth:</strong> First-generation Canadians and lower-income families — who typically have no family wealth to pass down — now have a mechanism to build it from day one.</span></li>
          </ul>
        </CardContent>
      </Card>

      {/* Precedent */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">This Is Not Without Precedent</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { country: "Singapore", program: "CPF (Central Provident Fund)", desc: "Mandatory savings from first job. Government matches contributions. Covers housing, healthcare, AND retirement. Singapore has one of the highest savings rates and lowest elderly poverty rates in the world." },
            { country: "UK", program: "Child Trust Fund (2005-2011)", desc: "Government gave every newborn £250-£500 at birth in a tax-free investment account. Parents could contribute. Cancelled in 2011 due to austerity. First generation turned 18 in 2023 — those who left it invested for 18 years had £1,000-£5,000+." },
            { country: "Norway", program: "Government Pension Fund", desc: "$1.5 trillion sovereign wealth fund built from oil revenue. Every Norwegian citizen benefits. Invested globally. Returns compound for the nation. Proof that patient investing at national scale works." },
            { country: "Alaska", program: "Permanent Fund Dividend", desc: "Every Alaskan resident receives an annual payment from oil revenue investment returns ($1,000-$3,000/year). A Birth Fund is this concept but INVESTED rather than spent — compounding instead of consuming." },
          ].map((p, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold">{p.country}</p>
                <Badge variant="outline" className="text-[9px]">{p.program}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* The ask */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2">How to Make This Happen</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This does not require new money — it redirects money that already flows through the CCB. The infrastructure
            exists: the CPP Investment Board already manages $600B+ with world-class returns. The RESP system already
            proves Canadians will invest for their children when the accounts exist. The Birth Fund combines the
            universality of CCB, the investment discipline of CPP, and the tax incentive structure of the TFSA — applied
            from day one. The only thing missing is a government willing to think in 60-year horizons instead of 4-year
            election cycles. Share this idea. Run the numbers for your family. Show people what compound time can do
            when you start at birth instead of at 25.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> This is a policy proposal and thought experiment, not an existing program. The calculator
            uses historical average returns (S&P 500: ~10%/year nominal, ~7% after inflation). Actual returns will vary.
            The tier tax rates and grace periods are proposed — actual implementation would require legislation.
            The concept is sound: every additional year of compounding from birth dramatically increases the final outcome.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/compound-interest" className="text-sm text-emerald-600 hover:underline">Compound Interest</a>
        <a href="/canada/tax-optimization" className="text-sm text-blue-600 hover:underline">Tax Optimization</a>
        <a href="/retirement" className="text-sm text-violet-600 hover:underline">Retirement Calculator</a>
        <a href="/investing" className="text-sm text-amber-600 hover:underline">Investing Basics</a>
        <a href="/canada/benefits" className="text-sm text-rose-600 hover:underline">Benefits Finder</a>
      </div>
    </div>
  )
}
