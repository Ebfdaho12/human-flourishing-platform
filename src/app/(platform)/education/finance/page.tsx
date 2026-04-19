"use client"

import { useState } from "react"
import { DollarSign, ChevronDown, ChevronUp, Lightbulb, BookOpen, TrendingUp, Shield, Coins, Building2, Globe2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Simple explanation component — hover/click for ELI15 version
 */
function Explain({ text, simple }: { text: string; simple: string }) {
  const [showSimple, setShowSimple] = useState(false)

  return (
    <span className="relative inline">
      <span>{text}</span>
      <button
        onClick={() => setShowSimple(!showSimple)}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold ml-1 align-super cursor-pointer hover:bg-violet-200 transition-colors"
        title="Click for simple explanation"
      >?</button>
      {showSimple && (
        <span className="block mt-1 mb-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700 leading-relaxed">
          <Lightbulb className="h-3 w-3 inline mr-1" />
          <strong>Simply put:</strong> {simple}
        </span>
      )}
    </span>
  )
}

const MODULES = [
  {
    id: "money-basics",
    title: "Money Basics",
    icon: Coins,
    color: "from-emerald-500 to-teal-600",
    lessons: [
      {
        title: "What is money, really?",
        content: "Money is anything that a group of people agrees has value and can be exchanged for goods and services. Throughout history, this has been shells, gold, paper, and now digital numbers on a screen.",
        simple: "Money is just a way to trade. Instead of swapping a chicken for shoes, you use money as the in-between step. It only works because everyone agrees it has value.",
        keyTerms: [
          { term: "Fiat currency", definition: "Money that has value because a government says it does, not because it's made of something valuable", simple: "Government-backed money like dollars — it's paper, but the government says it's worth something, so everyone treats it that way" },
          { term: "Purchasing power", definition: "How much goods and services your money can buy", simple: "What your money can actually get you. $100 bought way more groceries in 1990 than it does today" },
          { term: "Inflation", definition: "The rate at which the general level of prices rises, eroding purchasing power", simple: "When everything gets more expensive over time. Your $10 buys less stuff each year" },
        ],
      },
      {
        title: "Income, expenses, and the gap between them",
        content: "Financial health comes down to one equation: Income minus Expenses equals Savings. The size of that gap determines your financial future more than how much you earn.",
        simple: "It doesn't matter if you make $30,000 or $300,000 — what matters is how much you KEEP. A person earning $50K who saves $10K is financially healthier than someone earning $200K who spends $210K.",
        keyTerms: [
          { term: "Net income", definition: "Your total earnings after taxes and deductions", simple: "What actually hits your bank account after the government takes their cut" },
          { term: "Fixed expenses", definition: "Costs that stay the same each month (rent, insurance, subscriptions)", simple: "Bills you have to pay every month no matter what — rent, car payment, Netflix" },
          { term: "Variable expenses", definition: "Costs that change month to month (food, entertainment, gas)", simple: "Spending that goes up or down — eating out, gas, shopping" },
          { term: "Emergency fund", definition: "3-6 months of expenses saved in an accessible account", simple: "Money you don't touch unless something goes really wrong — job loss, medical emergency, car breaks down" },
        ],
      },
      {
        title: "Compound interest — the most powerful force in finance",
        content: "Compound interest means earning interest on your interest. $1,000 at 10% annual return becomes $1,100 after year 1, $1,210 after year 2, $1,331 after year 3. After 30 years: $17,449. You turned $1,000 into $17,449 by doing nothing.",
        simple: "Your money makes money, and then THAT money makes money too. It's like a snowball rolling downhill — starts small but gets huge over time. Start early and it does most of the work for you.",
        keyTerms: [
          { term: "Compound interest", definition: "Interest calculated on both the initial principal and the accumulated interest from previous periods", simple: "You earn interest on your interest. It's why starting to save at 20 beats starting at 30 even if you save less per month" },
          { term: "Rule of 72", definition: "Divide 72 by the interest rate to estimate how many years to double your money", simple: "Quick math trick: 72 ÷ interest rate = years to double. At 8% returns, your money doubles every 9 years" },
          { term: "Time value of money", definition: "A dollar today is worth more than a dollar tomorrow because of its potential earning capacity", simple: "$100 today is worth more than $100 next year because you could invest today's $100 and have $108 next year" },
        ],
      },
    ],
  },
  {
    id: "taxes",
    title: "Taxes Explained",
    icon: Building2,
    color: "from-amber-500 to-orange-600",
    lessons: [
      {
        title: "How income tax actually works",
        content: "Income tax uses brackets — you don't pay the same rate on all your income. The first chunk is taxed at a low rate, the next chunk at a higher rate, and so on. Only the money IN that bracket gets taxed at that rate.",
        simple: "Earning more doesn't mean ALL your money gets taxed more. Think of it like filling buckets — the first bucket (say $10,000) is taxed at 10%, the next bucket at 12%, and so on. Moving to a higher bracket only taxes the NEW money at the higher rate.",
        keyTerms: [
          { term: "Tax bracket", definition: "Income ranges that are taxed at specific rates in a progressive tax system", simple: "Different buckets your income falls into. Each bucket has its own tax rate. You never lose money by earning more" },
          { term: "Marginal tax rate", definition: "The tax rate paid on the last dollar earned", simple: "The rate on your NEWEST income, not ALL your income. If you're in the 22% bracket, only the money above the previous bracket line is taxed at 22%" },
          { term: "Effective tax rate", definition: "The actual percentage of total income paid in taxes after all brackets are applied", simple: "What you actually pay overall. Even if your top bracket is 22%, your effective rate might be 14% because the first chunks were taxed lower" },
          { term: "Tax deduction", definition: "An expense that reduces your taxable income", simple: "Things you can subtract from your income before calculating tax. If you earn $50K and deduct $5K, you only pay tax on $45K" },
          { term: "Tax credit", definition: "A direct dollar-for-dollar reduction of your tax bill", simple: "Even better than a deduction — this takes money directly off what you owe. A $1,000 credit means you pay $1,000 less in taxes" },
        ],
      },
      {
        title: "Types of taxes you pay",
        content: "Income tax is just one type. You also pay payroll taxes (Social Security, Medicare), sales tax, property tax, capital gains tax, and potentially estate tax. Understanding all of them helps you plan better.",
        simple: "The government taxes you in a lot of ways — when you earn money, when you spend money, when you own property, and when your investments make money. Knowing which is which helps you keep more of what you earn.",
        keyTerms: [
          { term: "Capital gains tax", definition: "Tax on profit from selling an asset (stocks, property) for more than you paid", simple: "When you buy a stock at $10 and sell at $15, you pay tax on the $5 profit. Hold it longer than a year and the rate is lower" },
          { term: "Payroll tax", definition: "Taxes deducted from wages to fund Social Security and Medicare", simple: "The 7.65% taken from your paycheck (your employer pays another 7.65%) that funds retirement and healthcare for older people" },
          { term: "Sales tax", definition: "A consumption tax charged at the point of sale on goods and services", simple: "The extra percentage added when you buy stuff. Varies by state — some states have 0%, others up to 10%" },
        ],
      },
    ],
  },
  {
    id: "blockchain",
    title: "Blockchain & Crypto",
    icon: Globe2,
    color: "from-blue-500 to-indigo-600",
    lessons: [
      {
        title: "What is blockchain?",
        content: "A blockchain is a shared digital ledger that records transactions across a network of computers. Once data is recorded, it can't be changed without changing every copy simultaneously — making it practically tamper-proof.",
        simple: "Imagine a Google Doc that thousands of people have copies of. Every time someone adds a line, everyone's copy updates. Nobody can secretly change old lines because everyone would see the mismatch. That's blockchain — a shared record nobody can cheat.",
        keyTerms: [
          { term: "Blockchain", definition: "A distributed, immutable digital ledger of transactions maintained across a network of computers", simple: "A shared notebook that nobody can erase. Every transaction ever made is recorded permanently and everyone can verify it" },
          { term: "Decentralization", definition: "Distribution of control away from a single central authority", simple: "No single company or government controls it. It's run by thousands of computers worldwide — shut one down and the rest keep going" },
          { term: "Smart contract", definition: "Self-executing code stored on a blockchain that automatically enforces the terms of an agreement", simple: "A digital vending machine for agreements — put in the conditions, and when they're met, it automatically does the thing. No lawyers needed" },
          { term: "Consensus mechanism", definition: "The method by which a blockchain network agrees on the current state of the ledger", simple: "How all the computers agree on what's true. Like a classroom vote — if most computers say 'this transaction is valid,' it gets recorded" },
        ],
      },
      {
        title: "DeFi vs CeFi — the future of finance",
        content: "CeFi (Centralized Finance) is traditional banking — a company holds your money and processes transactions. DeFi (Decentralized Finance) removes the middleman — code on a blockchain handles everything automatically.",
        simple: "CeFi = a bank holds your money and you trust them not to lose it. DeFi = computer code holds your money and nobody can change the rules. It's like the difference between asking a librarian to find a book vs searching Google yourself.",
        keyTerms: [
          { term: "DeFi (Decentralized Finance)", definition: "Financial services built on blockchain that operate without traditional intermediaries", simple: "Banking without banks. You can lend, borrow, trade, and earn interest using just code — no bank account needed, open 24/7, available to anyone with internet" },
          { term: "CeFi (Centralized Finance)", definition: "Traditional financial services controlled by centralized entities like banks and brokerages", simple: "Normal banking — Chase, PayPal, Coinbase. A company controls your money, sets the rules, and can freeze your account" },
          { term: "Stablecoin", definition: "A cryptocurrency pegged to a stable asset, typically the US dollar", simple: "Crypto that's always worth $1. It combines the speed of crypto with the stability of dollars. USDC and USDT are the biggest ones" },
          { term: "Yield farming", definition: "The practice of lending or staking crypto assets to earn returns", simple: "Like putting money in a savings account, but for crypto. You lend your coins to a protocol and earn interest — often much higher than bank rates, but with more risk" },
          { term: "Wallet", definition: "Software or hardware that stores the private keys needed to access cryptocurrency", simple: "Your crypto keychain. It doesn't actually hold coins — it holds the password (private key) that proves the coins are yours. Lose the key, lose the coins" },
        ],
      },
      {
        title: "Why crypto is inevitable",
        content: "Digital currencies are faster, cheaper, and more efficient than traditional banking. Cross-border payments take seconds instead of days. Transaction fees are cents instead of percentages. And it works 24/7 without holidays or banking hours.",
        simple: "Sending money through a bank is like sending a letter through the post office — slow, expensive, and closed on weekends. Crypto is like sending a text message — instant, nearly free, and works anytime. The entire financial system will eventually upgrade, just like we upgraded from letters to email.",
        keyTerms: [
          { term: "CBDC (Central Bank Digital Currency)", definition: "A digital form of fiat currency issued by a central bank", simple: "Government-made crypto. Like the dollar but fully digital. China, Europe, and others are building theirs. Some people worry it gives governments too much control over spending" },
          { term: "Layer 2", definition: "A secondary protocol built on top of a main blockchain to improve speed and reduce costs", simple: "A fast lane on top of the main road. Bitcoin and Ethereum can be slow — Layer 2 solutions process transactions faster and cheaper, then settle on the main chain" },
          { term: "Self-custody", definition: "Holding your own private keys rather than trusting a third party", simple: "Being your own bank. YOU hold the key to your money, not a company. More responsibility, but nobody can freeze your account or tell you what to do with your money" },
        ],
      },
    ],
  },
  {
    id: "investing",
    title: "Investing Fundamentals",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-600",
    lessons: [
      {
        title: "Why investing matters more than saving",
        content: "A savings account earning 0.5% while inflation runs at 3% means you're losing 2.5% purchasing power every year. Investing is how you make your money grow faster than inflation.",
        simple: "Money in a savings account actually LOSES value over time because prices go up faster than the tiny interest you earn. Investing is the only way to make your money actually grow. Even a simple index fund has averaged ~10% per year over the last 100 years.",
        keyTerms: [
          { term: "Index fund", definition: "A fund that tracks a specific market index (like the S&P 500), providing broad diversification at low cost", simple: "Instead of picking individual stocks, you buy a tiny piece of the 500 biggest companies all at once. One purchase, instant diversification, very low fees" },
          { term: "Dollar-cost averaging", definition: "Investing a fixed amount at regular intervals regardless of market conditions", simple: "Invest the same amount every month no matter what. When prices are high you buy less, when prices are low you buy more. Over time, it averages out and removes the stress of timing" },
          { term: "Diversification", definition: "Spreading investments across different asset classes to reduce risk", simple: "Don't put all your eggs in one basket. Own stocks AND bonds AND maybe some real estate. If one drops, the others might hold steady" },
          { term: "Risk tolerance", definition: "The degree of variability in investment returns an investor is willing to accept", simple: "How much can you stomach watching your account drop? If a 30% dip would make you panic-sell, you need less risky investments" },
        ],
      },
    ],
  },
]

export default function FinancePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [simpleMode, setSimpleMode] = useState(false)

  const module = MODULES.find(m => m.id === activeModule)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Financial Literacy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Everything about money they should have taught in school. From taxes to blockchain.</p>
      </div>

      {/* Simple mode toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm">Simple explanations</span>
        </div>
        <button
          onClick={() => setSimpleMode(!simpleMode)}
          className={cn("relative h-6 w-11 rounded-full transition-colors", simpleMode ? "bg-violet-500" : "bg-muted")}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", simpleMode ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      </div>

      {!module ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map(m => {
            const Icon = m.icon
            return (
              <Card key={m.id} className="card-hover cursor-pointer" onClick={() => setActiveModule(m.id)}>
                <CardContent className="p-5">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white mb-3", m.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{m.lessons.length} lessons</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setActiveModule(null)} className="text-sm text-violet-600 hover:underline">← All modules</button>

          <Card className={cn("bg-gradient-to-r text-white", module.color)}>
            <CardContent className="p-5">
              <h2 className="text-xl font-bold">{module.title}</h2>
              <p className="text-white/70 text-sm">{module.lessons.length} lessons</p>
            </CardContent>
          </Card>

          {module.lessons.map((lesson, i) => {
            const isExpanded = expandedLesson === `${module.id}-${i}`
            return (
              <Card key={i} className="overflow-hidden">
                <button
                  onClick={() => setExpandedLesson(isExpanded ? null : `${module.id}-${i}`)}
                  className="w-full text-left p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">{i + 1}</div>
                    <p className="font-semibold text-sm">{lesson.title}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-4">
                    {/* Main content or simple version */}
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-sm leading-relaxed">
                        {simpleMode ? lesson.simple : lesson.content}
                      </p>
                      {!simpleMode && (
                        <button onClick={() => setSimpleMode(true)} className="text-xs text-violet-600 hover:underline mt-2 block">
                          Show simpler explanation →
                        </button>
                      )}
                    </div>

                    {/* Key terms */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Terms</p>
                      <div className="space-y-2">
                        {lesson.keyTerms.map((term, j) => (
                          <div key={j} className="rounded-lg border border-border p-3">
                            <p className="text-sm font-semibold">{term.term}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {simpleMode ? term.simple : term.definition}
                            </p>
                            {!simpleMode && (
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                className="group relative"
                              >
                                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold mt-1 cursor-pointer hover:bg-violet-200">?</span>
                                <span className="hidden group-hover:block absolute bottom-full left-0 mb-1 w-64 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700 shadow-lg z-10">
                                  <strong>Simply:</strong> {term.simple}
                                </span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <a href="/education" className="text-sm text-violet-600 hover:underline">← Education</a>
        <a href="/education/personalized" className="text-sm text-purple-600 hover:underline">Personalized Learning →</a>
        <a href="/education/paths" className="text-sm text-blue-600 hover:underline">Learning Paths →</a>
      </div>
    </div>
  )
}
