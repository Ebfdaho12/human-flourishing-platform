"use client"

import { useState } from "react"
import { TrendingUp, ChevronDown, AlertTriangle, DollarSign, Shield, Sparkles, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CONCEPTS = [
  {
    title: "Index Funds — The Only Investment Most People Need",
    icon: TrendingUp,
    simple: "Instead of picking individual stocks (gambling), buy a tiny piece of EVERY company at once. An index fund that tracks the S&P 500 gives you a slice of the 500 biggest US companies. You win when the overall economy grows — which it has, every decade, for 100+ years.",
    details: [
      "The S&P 500 has returned ~10%/year on average over 100 years (~7% after inflation)",
      "Over any 20-year period in history, the S&P 500 has NEVER lost money. Not once.",
      "80-90% of professional fund managers FAIL to beat a simple index fund over 10+ years. They charge 1-2% fees to underperform a $0 index fund.",
      "Warren Buffett's advice: 'Put 90% in a low-cost S&P 500 index fund.' He bet $1M that an index fund would beat hedge funds over 10 years — and won.",
      "Canadian option: a Canadian total market index fund (like VEQT or XEQT) gives you global diversification in one purchase.",
    ],
    action: "Open a TFSA at Wealthsimple or Questrade. Buy VEQT (Vanguard All-Equity, global diversification) or XEQT (iShares equivalent). Set up automatic monthly purchases. Never sell. That is the entire strategy.",
  },
  {
    title: "MER — The Fee That Eats Your Retirement",
    icon: DollarSign,
    simple: "MER (Management Expense Ratio) is the annual fee a fund charges. It seems tiny (1-2%) but it compounds against you for decades. A 2% MER on a $500K portfolio costs you $10,000/year — and that $10,000 never compounds for you again.",
    details: [
      "Canadian mutual funds have some of the highest fees in the world — average MER of 2.0-2.5%",
      "ETF index funds charge 0.05-0.25% — that is 10-50x cheaper than mutual funds",
      "On a $500K portfolio over 25 years: 2% MER costs you ~$350,000 in lost growth. 0.2% MER costs ~$40,000. The difference: $310,000.",
      "Your bank's 'financial advisor' earns commission from selling you high-fee mutual funds. They are not obligated to recommend the cheapest option (no fiduciary duty in Canada).",
      "The fee does not buy better performance — high-fee funds underperform low-fee index funds 80-90% of the time.",
    ],
    action: "Check the MER on every fund you own (your bank statement or Morningstar.ca). If it is above 0.5%, you are likely overpaying. Switch to low-cost ETFs (VEQT: 0.24% MER, or TD e-Series: 0.33-0.51%).",
  },
  {
    title: "Dollar-Cost Averaging — Remove Emotion From Investing",
    icon: Shield,
    simple: "Invest the same dollar amount every month, regardless of whether the market is up or down. When prices are high, you buy fewer shares. When prices are low, you buy more shares. Over time, this averages out to a good price and removes the temptation to time the market.",
    details: [
      "Time in the market beats timing the market. Nobody — including professionals — can consistently predict short-term market movements.",
      "Missing just the 10 best days in the market over 20 years cuts your return in HALF.",
      "Automatic monthly purchases remove decision-making and emotion. Set it and forget it.",
      "A person who invested $500/month in the S&P 500 from 2000-2024 (through the dot-com crash, 2008, and COVID) still earned ~10%/year average.",
    ],
    action: "Set up automatic bi-weekly or monthly purchases in your TFSA/RRSP. Match your pay schedule. Never skip a month. Never try to time the market.",
  },
  {
    title: "Diversification — Don't Put All Eggs in One Basket",
    icon: Shield,
    simple: "If you only own one company's stock and it goes bankrupt, you lose everything. If you own 10,000 companies across 40 countries, a few will fail but most will grow. Global diversification is the closest thing to a free lunch in investing.",
    details: [
      "Home bias: Canadians tend to overweight Canadian stocks. Canada is only 3% of the global stock market.",
      "VEQT/XEQT solve this automatically — they hold ~13,000 stocks across 40+ countries in a single ETF",
      "Diversification also means asset classes: stocks (growth), bonds (stability), real estate (inflation hedge)",
      "For most people under 40: 80-100% stocks is appropriate (you have time to ride out downturns). Over 50: start adding bonds (20-40%) for stability.",
    ],
    action: "If you own individual Canadian bank stocks or your employer's stock, you are NOT diversified. One bad year for one company could devastate your savings. A global index fund diversifies automatically.",
  },
  {
    title: "The Power of Starting Early vs Amount",
    icon: Sparkles,
    simple: "A 25-year-old investing $200/month will have MORE at 65 than a 35-year-old investing $400/month. Time beats amount. The 25-year-old invested less total money but had 10 more years of compound growth.",
    details: [
      "Age 25, $200/month at 7% for 40 years = $528,000 (you put in $96,000)",
      "Age 35, $400/month at 7% for 30 years = $486,000 (you put in $144,000)",
      "The 25-year-old invested HALF as much money but ends up with MORE. That is the magic of compound time.",
      "Even $50/month from age 20 is better than $500/month starting at 40.",
      "The excuse 'I don't have enough to invest' is the most expensive excuse in finance.",
    ],
    action: "Start today. Even $25/month. Increase as your income grows. The amount matters less than the habit of starting NOW.",
  },
  {
    title: "TFSA vs RRSP — Which Account First?",
    icon: DollarSign,
    simple: "Under $80K income: TFSA first (tax-free growth, no impact on benefits). Over $100K: RRSP first (bigger tax deduction). Between $80-100K: depends on your situation. If buying a first home soon: FHSA first (best of both).",
    details: [
      "TFSA: put in after-tax money, grows tax-free forever, withdraw tax-free, withdrawals don't affect CCB/GIS",
      "RRSP: tax deduction now (refund), grows tax-sheltered, pay tax on withdrawal in retirement at (hopefully) lower rate",
      "The RRSP refund is NOT free money — it is a tax deferral. You pay it back when you withdraw.",
      "At lower incomes, the RRSP deduction is worth less AND withdrawals in retirement may reduce your GIS. TFSA is almost always better under $55K.",
      "The ideal strategy: max TFSA ($7K/yr) → then RRSP → then non-registered",
    ],
    action: "Check your contribution room: CRA My Account shows both TFSA and RRSP room. Max the one that is right for your income level. See the Tax Optimization guide for your personalized priority.",
  },
  {
    title: "Where to Invest in Canada",
    icon: BookOpen,
    simple: "You need a brokerage account. The two best options for Canadians: Wealthsimple (easiest, no-fee stock/ETF trading, robo-advisor option) or Questrade (more features, free ETF purchases, slightly more complex). Both are legitimate and CDIC-insured.",
    details: [
      "Wealthsimple: free stock/ETF trades, 0% commission, automatic TFSA/RRSP, robo-advisor for hands-off investing. Best for beginners.",
      "Questrade: free ETF purchases, $5-10 per stock trade, more research tools. Best for slightly more experienced investors.",
      "Big bank brokerages (RBC DI, TD DI, BMO InvestorLine): work but charge $5-10 per trade + push their own high-fee funds. Use only if you prefer staying with your bank.",
      "Robo-advisors (Wealthsimple Invest, CI Direct, Justwealth): they invest for you based on your risk profile. Charge 0.4-0.5% MER on top of fund fees. Good if you want zero decisions.",
      "DO NOT use your bank's 'financial advisor' for mutual funds. They are salespeople, not fiduciaries. Their funds charge 2%+ MER.",
    ],
    action: "Open a free Wealthsimple account → open a TFSA → deposit money → buy VEQT or XEQT → set up automatic deposits. Total time: 15 minutes. Total cost: $0. This beats 90% of professional money managers.",
  },
]

export default function InvestingPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Investing Basics (Canada)</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The simple strategy that beats 90% of professionals. No jargon, no complexity, no gambling.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Entire Strategy in 4 Steps</p>
          <ol className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-2"><span className="text-emerald-600 font-bold">1.</span> Open a TFSA at Wealthsimple or Questrade (free, 15 minutes)</li>
            <li className="flex gap-2"><span className="text-emerald-600 font-bold">2.</span> Buy VEQT or XEQT (one fund = global diversification, 0.24% fee)</li>
            <li className="flex gap-2"><span className="text-emerald-600 font-bold">3.</span> Set up automatic monthly purchases (match your pay schedule)</li>
            <li className="flex gap-2"><span className="text-emerald-600 font-bold">4.</span> Never sell. Never time the market. Wait 20+ years.</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2 italic">This outperforms 80-90% of professional fund managers. The rest is detail.</p>
        </CardContent>
      </Card>

      {/* Concepts */}
      <div className="space-y-3">
        {CONCEPTS.map((c, i) => {
          const Icon = c.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-semibold flex-1">{c.title}</p>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
                      <p className="text-xs text-violet-700 leading-relaxed">{c.simple}</p>
                    </div>
                    <ul className="space-y-1.5">
                      {c.details.map((d, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <span className="text-emerald-400 shrink-0">-</span><span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <p className="text-xs text-emerald-700"><strong>Action:</strong> {c.action}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> What NOT to Do
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Do NOT buy individual stocks unless you enjoy gambling (and can afford to lose)</li>
            <li>Do NOT use your bank's mutual funds (2%+ MER eats your retirement)</li>
            <li>Do NOT try to time the market (professionals can't do it, neither can you)</li>
            <li>Do NOT invest money you need within 5 years (use a HISA for short-term)</li>
            <li>Do NOT take investment advice from social media influencers (survivorship bias)</li>
            <li>Do NOT buy crypto with money you cannot afford to lose (speculative, not investing)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Further reading:</strong> <em>The Millionaire Teacher</em> (Andrew Hallam — a Canadian classic),
            <em>Quit Like a Millionaire</em> (Kristy Shen — Canadian FIRE story), Canadian Couch Potato blog (model portfolios).
            None of this is financial advice — it is financial education. Consult a fee-only financial planner
            (NOT a bank advisor who earns commission) for personalized guidance.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada/tax-optimization" className="text-sm text-emerald-600 hover:underline">Tax Optimization</a>
        <a href="/compound-interest" className="text-sm text-blue-600 hover:underline">Compound Interest</a>
        <a href="/retirement" className="text-sm text-violet-600 hover:underline">Retirement Calculator</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
