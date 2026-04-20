"use client"

import { useState } from "react"
import { DollarSign, ChevronDown, Sparkles, ArrowRight, AlertTriangle, PiggyBank, GraduationCap, Home, Baby } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const ACCOUNTS = [
  {
    name: "TFSA",
    fullName: "Tax-Free Savings Account",
    icon: PiggyBank,
    color: "from-emerald-500 to-teal-600",
    limit2024: "$7,000/year",
    lifetimeMax: "$95,000 (since 2009)",
    whoQualifies: "Any Canadian resident 18+ with a SIN",
    howItWorks: "You put in after-tax money. Everything it earns (interest, dividends, capital gains) is NEVER taxed. Withdrawals are NEVER taxed. You get the room back next year if you withdraw.",
    simple: "A magic box where your money grows and the government never takes any of it. Put money in, invest it, and every dollar it earns is yours — forever. No tax when it grows, no tax when you take it out.",
    strategy: [
      "Max this FIRST if you earn under $100K. The tax-free growth is more valuable than the RRSP deduction for most people in lower brackets.",
      "Best for: growth investments (stocks, index funds) because the gains are never taxed. Don't waste TFSA room on savings accounts earning 2%.",
      "If you have unused room from past years, you can contribute the full cumulative amount ($95K if you were 18+ in 2009).",
      "TFSA withdrawals don't count as income — they won't reduce your CCB, GIS, or other income-tested benefits. This is HUGE for families and retirees.",
    ],
    mistake: "Using your TFSA as a savings account earning 2%. Put it in a broad index fund (S&P 500 or Canadian total market). $7K/year at 7% for 30 years = $660K+ tax-free.",
    atIncome: { low: "PRIORITY #1 — tax-free growth + no impact on benefits", mid: "PRIORITY #1-2 — depends on whether you need the RRSP deduction now", high: "PRIORITY #2 — max RRSP first for the tax deduction, then TFSA" },
  },
  {
    name: "RRSP",
    fullName: "Registered Retirement Savings Plan",
    icon: DollarSign,
    color: "from-blue-500 to-indigo-600",
    limit2024: "18% of income, max $31,560/year",
    lifetimeMax: "Cumulative unused room carries forward",
    whoQualifies: "Anyone with earned income and a SIN",
    howItWorks: "Contributions reduce your taxable income THIS year (you get a tax refund). The money grows tax-free inside the account. You pay tax when you withdraw in retirement (at your presumably lower retirement tax rate).",
    simple: "The government lets you delay paying taxes. Put $10K in your RRSP, get a $3K tax refund now. The money grows tax-free for decades. When you retire and take it out, you pay tax — but at a lower rate because your retirement income is usually less than your working income.",
    strategy: [
      "Most valuable at high income levels. If you earn $100K+ and are in the 30%+ marginal bracket, the RRSP deduction is worth $3,000+ per $10K contributed.",
      "At lower incomes ($50-70K), the TFSA often beats the RRSP because the tax deduction is smaller and withdrawals don't affect benefits.",
      "RRSP contribution room carries forward forever. If you haven't contributed in past years, you may have $50K+ in room.",
      "Home Buyers' Plan: withdraw up to $60K ($120K per couple) from RRSP for a first home, tax-free. Repay over 15 years.",
      "Lifelong Learning Plan: withdraw up to $20K for education. Repay over 10 years.",
    ],
    mistake: "Contributing to RRSP when you earn under $50K. The tax deduction is worth less, and withdrawals in retirement will be taxed AND reduce your GIS/OAS. TFSA is almost always better at low incomes.",
    atIncome: { low: "LOWER PRIORITY — TFSA is usually better. The deduction is worth less in lower brackets.", mid: "PRIORITY #2 — good for reducing taxes. Consider saving room for higher-income years.", high: "PRIORITY #1 — max this for the 30-40%+ tax deduction. The refund should go straight into your TFSA." },
  },
  {
    name: "FHSA",
    fullName: "First Home Savings Account",
    icon: Home,
    color: "from-amber-500 to-orange-600",
    limit2024: "$8,000/year (max $40,000 lifetime)",
    lifetimeMax: "$40,000",
    whoQualifies: "Canadian resident 18-71, never owned a home (or spouse didn't own in the past 4 years)",
    howItWorks: "The BEST of both worlds: contributions are tax-deductible (like RRSP) AND withdrawals for a home purchase are tax-free (like TFSA). It's essentially a free $40K toward your first home.",
    simple: "The government gives you a double benefit: you save taxes NOW when you put money in, AND you pay zero tax when you take it out to buy a home. It's free money toward your house. If you don't buy a home, you can transfer it to your RRSP.",
    strategy: [
      "If you are planning to buy a home in the next 5-15 years, this should be your #1 priority. Nothing else gives you both the deduction AND tax-free withdrawal.",
      "Open it as early as possible — you can only contribute $8K/year, so it takes 5 years to max out the $40K.",
      "Unused room carries forward (up to $8K), so if you miss a year, you can contribute $16K the next year.",
      "Combine with Home Buyers' Plan: FHSA ($40K) + HBP ($60K from RRSP) = $100K+ toward your first home, all tax-advantaged.",
      "If you never buy a home, transfer to RRSP (no tax impact) — the money isn't lost.",
    ],
    mistake: "Not opening one. Even if you're not sure you'll buy, open it and start contributing. The contribution room doesn't start accumulating until you open the account.",
    atIncome: { low: "HIGH PRIORITY if planning to buy — double tax benefit", mid: "HIGHEST PRIORITY if planning to buy within 5-15 years", high: "HIGH PRIORITY if first-time buyer — the deduction is valuable at any income level" },
  },
  {
    name: "RESP",
    fullName: "Registered Education Savings Plan",
    icon: GraduationCap,
    color: "from-violet-500 to-purple-600",
    limit2024: "$2,500/year to get max grant",
    lifetimeMax: "$50,000 per child",
    whoQualifies: "Any Canadian resident for a child under 18",
    howItWorks: "The government matches 20% of your contributions through the CESG (Canada Education Savings Grant) up to $500/year per child. The money grows tax-free. Withdrawals for education are taxed in the STUDENT's hands (who usually has little/no income = little/no tax).",
    simple: "Put in $2,500/year for your kid's education. The government adds $500 for free. The money grows tax-free for 18 years. When your kid goes to school, they take it out and pay almost no tax because students earn very little. It's essentially 20% free money + tax-free growth.",
    strategy: [
      "Contribute $2,500/year to get the full $500 CESG — that's an instant 20% return before any investment gains.",
      "Start at birth: $2,500/year for 18 years at 7% growth + $500/year CESG = ~$110,000+ for education. That covers most undergraduate degrees.",
      "If you can't do $2,500/year, do whatever you can — even $50/month ($600/year) gets $120 in CESG. Free money is free money.",
      "Lower-income families qualify for additional grants (CLB — Canada Learning Bond) of up to $2,000 even with ZERO contributions.",
      "If the child doesn't go to school: transfer growth to your RRSP (up to $50K of room), return grants to government, or transfer to a sibling's RESP.",
    ],
    mistake: "Not contributing at least $2,500/year if you can afford it. You're literally leaving $500/year of free government money on the table. Over 18 years that's $9,000 in free grants alone — before growth.",
    atIncome: { low: "PRIORITY — you qualify for CLB ($2,000 free) even with zero contributions. Open it!", mid: "HIGH PRIORITY — $2,500/year to get the full $500 grant. Non-negotiable.", high: "HIGH PRIORITY — max the $2,500 for the grant, then consider additional contributions up to $50K lifetime" },
  },
]

export default function CanadaTaxOptimizationPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [income, setIncome] = useState(80000)
  const incomeLevel = income < 55000 ? "low" : income < 110000 ? "mid" : "high"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canadian Tax Optimization</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          TFSA, RRSP, FHSA, RESP — the accounts that save Canadians $2,000-$10,000+/year in taxes. Most people use them wrong or not at all.
        </p>
      </div>

      {/* Income input */}
      <Card>
        <CardContent className="p-4">
          <label className="text-xs text-muted-foreground">Your approximate gross annual income (for personalized recommendations):</label>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">$</span>
            <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="w-40" />
            <Badge variant="outline" className={cn("text-[9px]",
              incomeLevel === "low" ? "text-blue-600 border-blue-300" :
              incomeLevel === "mid" ? "text-violet-600 border-violet-300" :
              "text-amber-600 border-amber-300"
            )}>{incomeLevel === "low" ? "Under $55K" : incomeLevel === "mid" ? "$55K-$110K" : "Over $110K"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Priority order */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2">Your Priority Order (at ${income.toLocaleString()} income):</p>
          <ol className="space-y-1">
            {ACCOUNTS
              .map((a, i) => ({ ...a, priority: (a.atIncome as any)[incomeLevel] as string, idx: i }))
              .sort((a, b) => {
                const order = (s: string) => s.startsWith("HIGHEST") ? 0 : s.startsWith("PRIORITY #1") ? 1 : s.startsWith("HIGH") ? 2 : s.startsWith("PRIORITY #2") ? 3 : 4
                return order(a.priority) - order(b.priority)
              })
              .map((a, rank) => (
                <li key={a.name} className="flex items-start gap-2 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{rank + 1}</span>
                  <span><strong>{a.name}</strong> — {a.priority}</span>
                </li>
              ))
            }
          </ol>
        </CardContent>
      </Card>

      {/* Account details */}
      <div className="space-y-3">
        {ACCOUNTS.map((a, i) => {
          const Icon = a.icon
          const isOpen = expanded === i
          return (
            <Card key={a.name} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", a.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <Badge variant="outline" className="text-[9px]">{a.limit2024}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{a.fullName}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Annual limit:</span> <strong>{a.limit2024}</strong></div>
                      <div><span className="text-muted-foreground">Lifetime max:</span> <strong>{a.lifetimeMax}</strong></div>
                      <div className="col-span-2"><span className="text-muted-foreground">Who qualifies:</span> {a.whoQualifies}</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">How It Works</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a.howItWorks}</p>
                    </div>

                    <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">Simply Put</p>
                      <p className="text-xs text-violet-700 leading-relaxed">{a.simple}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Strategy</p>
                      <ul className="space-y-1">
                        {a.strategy.map((s, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" /><span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-0.5">Common Mistake</p>
                      <p className="text-xs text-red-700">{a.mistake}</p>
                    </div>

                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">At Your Income Level</p>
                      <p className="text-xs text-emerald-700">{(a.atIncome as any)[incomeLevel]}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The cost of not knowing:</strong> A Canadian who maxes their TFSA ($7K/year) from age 25 to 65 at 7%
            growth will have <strong>$1.5 million tax-free</strong>. Someone who never opens a TFSA has $0 in tax-sheltered
            growth. The difference is not income — it is knowledge. Every year you do not open these accounts,
            you lose contribution room that NEVER comes back (except TFSA). Open them today, even with $50.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/tax-estimator" className="text-sm text-blue-600 hover:underline">Tax Estimator</a>
        <a href="/compound-interest" className="text-sm text-emerald-600 hover:underline">Compound Interest</a>
        <a href="/financial-dashboard" className="text-sm text-violet-600 hover:underline">Financial Dashboard</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
