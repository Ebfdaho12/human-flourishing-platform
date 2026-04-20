"use client"

import { useState } from "react"
import { DollarSign, ChevronDown, Baby, GraduationCap, Star, Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const AGE_GROUPS: {
  range: string
  label: string
  color: string
  concepts: string[]
  activities: string[]
  mistakes: string[]
  tools: string
}[] = [
  {
    range: "3-5 years",
    label: "Coins & Choices",
    color: "from-pink-500 to-rose-600",
    concepts: [
      "Money is used to buy things (not infinite)",
      "You have to choose — you can buy THIS or THAT, not both",
      "Coins and bills have different values (sorting game)",
      "Waiting is part of getting what you want (delayed gratification)",
    ],
    activities: [
      "Coin sorting game: sort by size, color, value. Name each coin.",
      "Store play: set up a pretend store. Price items. Let them 'buy' with real coins.",
      "3-jar system: SPEND jar, SAVE jar, GIVE jar. Every allowance gets divided.",
      "Grocery store: 'We have $5 for fruit. What should we pick?' Let them decide and pay the cashier.",
      "Waiting game: 'You can have 1 cookie now or 2 cookies after lunch.' (Marshmallow test in real life.)",
    ],
    mistakes: [
      "Buying everything they ask for (teaches entitlement, not value)",
      "Never letting them see money (they should handle real coins and bills)",
      "Saying 'we can't afford it' for everything (creates scarcity anxiety). Better: 'We choose to spend on X instead of Y.'",
    ],
    tools: "Piggy bank (ideally 3 clear jars so they SEE the money grow), play money set, a weekly 'store' visit where they spend their own money",
  },
  {
    range: "6-8 years",
    label: "Earning & Saving",
    color: "from-amber-500 to-orange-600",
    concepts: [
      "Money is EARNED through effort (chores → allowance)",
      "Saving means giving up something now for something better later",
      "Needs vs wants (food = need, toy = want, both are okay but needs come first)",
      "Prices are different for the same thing in different places",
    ],
    activities: [
      "Chore chart with earnings: clear tasks, clear pay. See /kids-chores for age-appropriate list.",
      "Savings goal tracker: want a $30 toy? Earn $5/week. Mark the chart. 6 weeks of visual progress.",
      "Price comparison: at the grocery store, compare brands. 'This one is $3 and this one is $5. Are they different enough to pay $2 more?'",
      "Entrepreneurship: lemonade stand, craft sale, or bake sale. They set prices, make change, count profit.",
      "Needs vs wants sorting game: cut pictures from flyers. Sort into needs pile and wants pile. Discuss the gray areas.",
    ],
    mistakes: [
      "Giving allowance with no connection to effort (money falls from the sky)",
      "Always bailing them out when they spend their savings impulsively (let them feel the consequence of short-term choices)",
      "Not talking about YOUR financial decisions openly ('We saved for 6 months to buy this couch' is valuable for kids to hear)",
    ],
    tools: "Clear savings jar, chore chart (see /kids-chores), a real bank account (many banks offer kids accounts at age 6-7 with parental oversight)",
  },
  {
    range: "9-12 years",
    label: "Budgeting & Banking",
    color: "from-emerald-500 to-teal-600",
    concepts: [
      "A budget is a PLAN for your money (not a restriction)",
      "Interest: the bank pays you for letting them use your money (savings) or you pay them for borrowing (debt)",
      "Compound interest: money grows faster over time (snowball effect)",
      "Opportunity cost: buying X means you CAN'T buy Y with the same money",
      "Advertising is designed to make you WANT things you don't NEED",
    ],
    activities: [
      "Open a real bank account: take them to the bank. Let them deposit their savings. Check the balance monthly — watch interest grow (even small amounts teach the concept).",
      "Weekly budget: give them a fixed amount for discretionary spending. They track it. When it's gone, it's gone until next week.",
      "Compound interest demonstration: $100 at 7% doubles in 10 years. Use the /compound-interest page together.",
      "Ad decoding: watch commercials together. Ask: 'What are they trying to make you feel? Do you actually need this? What are they NOT telling you?'",
      "Family budget meeting: include them in ONE section of the family budget discussion. 'Here's what we spend on groceries. How could we save $50 this month?'",
    ],
    mistakes: [
      "Hiding family finances completely (they need to understand that resources are finite and choices have trade-offs)",
      "Not letting them make mistakes with their own money (a $20 impulse purchase they regret is a $20 lesson that prevents a $20,000 mistake at 25)",
      "Treating money as taboo (money is a tool — it is not good or bad, it is how you use it)",
    ],
    tools: "Bank account with app access, budget notebook or spreadsheet, /compound-interest page for visual demonstration",
  },
  {
    range: "13-15 years",
    label: "Investing & Earning",
    color: "from-blue-500 to-indigo-600",
    concepts: [
      "Stocks: owning a tiny piece of a company. Index funds: owning a piece of EVERY company.",
      "Risk vs reward: higher potential return = higher potential loss",
      "Time in the market beats timing the market (start early, stay consistent)",
      "Tax basics: income tax, sales tax, why your paycheck is less than your hourly rate × hours",
      "Debt: good debt (education, home) vs bad debt (credit cards, consumer loans). Interest works FOR you (savings) or AGAINST you (debt).",
    ],
    activities: [
      "Open a TFSA in their name (or a joint account): even $25/month into an index fund. Show them the growth monthly. By 18, they'll have ~$1,500-$3,000 that has GROWN — the lesson is visceral.",
      "Stock market game: give them $10,000 of fake money. Let them 'invest' in companies they know (Apple, Nike, Costco). Track performance for 6 months.",
      "First job: when they get their first part-time job, sit down together with their first pay stub. Explain every deduction. Show them their real hourly rate (see /real-hourly-rate).",
      "Credit card simulation: give them a 'credit card' (index card). They can 'charge' up to $100. Interest is 20%/month. Watch how fast debt grows when they don't pay in full.",
      "Business plan: challenge them to create a small business plan. What would they sell? Who would buy it? What would it cost? What's the profit? Even if they never execute, the thinking is the lesson.",
    ],
    mistakes: [
      "Not starting their investing education (if they learn at 15, they have 50 years of compounding ahead of them. Every year you wait costs them tens of thousands.)",
      "Giving them unlimited access to money without consequences (credit cards for teens = debt training)",
      "Not discussing your own financial journey honestly — including mistakes. Your mistakes are their best teacher.",
    ],
    tools: "TFSA or joint investment account (Wealthsimple), pay stub from first job, /investing page, /compound-interest visualizer",
  },
  {
    range: "16-18 years",
    label: "Real-World Finance",
    color: "from-violet-500 to-purple-600",
    concepts: [
      "TFSA vs RRSP (and why to start TFSA immediately at 18)",
      "Apartment rental: first/last month, tenant rights, what to look for, hidden costs",
      "Car costs: the true cost is 2-3x the sticker price (insurance, gas, maintenance, depreciation)",
      "Student loans: compound interest working against you. Minimize borrowing. Scholarships > loans.",
      "Credit score: what it is, how to build it, why it matters for renting and borrowing",
      "Scams: how to identify them (urgency, too-good-to-be-true, requests for personal info)",
    ],
    activities: [
      "Open their own TFSA on their 18th birthday. Deposit $50. Set up automatic monthly contributions. This is the most valuable 18th birthday gift possible.",
      "Apartment hunting simulation: browse rentals together. Calculate ALL costs (rent + utilities + internet + food + transit). Compare to their expected income. Can they afford it?",
      "Car cost reality check: use the /car-buying page. Show them a $25K car actually costs $40K+ over 5 years. Discuss alternatives (transit, cycling, car-sharing).",
      "Mock tax return: walk through a tax return together (use SimpleTax/Wealthsimple Tax — free). Show them what they pay and why. Introduce TFSA contribution.",
      "Scam role-play: send them fake 'phishing' texts/emails. See if they can identify the red flags. Discuss real scams targeting young people.",
    ],
    mistakes: [
      "Not opening their TFSA at 18 (contribution room starts accumulating at 18 — EVERY year they wait is room they can never get back)",
      "Co-signing loans without understanding the risk (you are 100% responsible if they don't pay)",
      "Assuming school taught them this (it didn't — financial literacy education in Canadian schools is minimal to nonexistent)",
    ],
    tools: "TFSA (opened on 18th birthday), free tax software, /investing basics, /canada/tax-optimization, /real-hourly-rate",
  },
]

export default function KidsFinancePage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Teach Your Kids Finance</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Age-by-age money lessons. The financial education schools don't provide.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Why This Is the Most Important Thing You Teach</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Schools spend 13 years teaching algebra, history, and literature — and approximately <strong>zero hours</strong> teaching
            your child how money works, how debt compounds, how to budget, or how to invest. The result: adults who
            earn $80,000/year but cannot explain what a TFSA is, why compound interest matters, or how to read a pay stub.
            Financial literacy is not taught because it is not in the curriculum. That means it is YOUR job. The good
            news: it takes 5 minutes per week, and the payoff is measured in hundreds of thousands of dollars over
            your child's lifetime.
          </p>
        </CardContent>
      </Card>

      {/* Age groups */}
      <div className="space-y-3">
        {AGE_GROUPS.map((a, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="overflow-hidden card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", a.color)}>
                    {a.range.split("-")[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">Ages {a.range}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Concepts to Teach</p>
                      <ul className="space-y-0.5">
                        {a.concepts.map((c, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <Star className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Activities</p>
                      <ul className="space-y-1">
                        {a.activities.map((act, j) => (
                          <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">{j + 1}.</span>{act}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Common Mistakes</p>
                      <ul className="space-y-0.5">
                        {a.mistakes.map((m, j) => (
                          <li key={j} className="text-xs text-red-600 flex gap-2">
                            <span className="shrink-0">✗</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Tools Needed</p>
                      <p className="text-xs text-blue-700">{a.tools}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The compound effect of early financial education:</strong> A child who opens a TFSA at 18 and invests
            $100/month at 7% has <strong>$264,000 at 55</strong> — from $44,400 invested. A child who starts at 30 with the
            same $100/month has <strong>$122,000</strong>. Those 12 years of early education are worth <strong>$142,000</strong>.
            Teach them young. The math is unforgiving to those who start late.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/kids-chores" className="text-sm text-amber-600 hover:underline">Kids Chores</a>
        <a href="/compound-interest" className="text-sm text-emerald-600 hover:underline">Compound Interest</a>
        <a href="/investing" className="text-sm text-blue-600 hover:underline">Investing Basics</a>
        <a href="/education/finance" className="text-sm text-violet-600 hover:underline">Financial Literacy</a>
        <a href="/birth-fund" className="text-sm text-rose-600 hover:underline">Birth Fund</a>
        <a href="/parenting" className="text-sm text-pink-600 hover:underline">Parenting Guide</a>
      </div>
    </div>
  )
}
