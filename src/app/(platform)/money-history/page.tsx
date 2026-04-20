"use client"

import { useState } from "react"
import { Coins, ChevronDown, AlertTriangle, ArrowRight, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const TIMELINE = [
  {
    era: "Barter & Commodity Money",
    years: "~10,000 BC – 600 BC",
    color: "bg-amber-600",
    summary: "Before money, people traded directly. A farmer traded grain for a blacksmith's tools. The problem: what if the blacksmith didn't want grain?",
    details: [
      "Double coincidence of wants — both parties must want what the other has. This limits trade dramatically.",
      "Commodity money emerged naturally: salt, cattle, shells, beads — anything scarce and widely desired became money.",
      "The word 'salary' comes from 'sal' (Latin for salt) — Roman soldiers were paid in salt.",
      "Money was not invented by governments. It emerged spontaneously from human trade. Governments came later.",
    ],
    lesson: "Money is just a technology for storing and exchanging value. It can be anything people agree on.",
  },
  {
    era: "Gold & Silver Coins",
    years: "~600 BC – 1600s AD",
    color: "bg-yellow-500",
    summary: "The Kingdom of Lydia (modern Turkey) minted the first standardized coins around 600 BC. Gold and silver became universal money because they are scarce, durable, divisible, and recognizable.",
    details: [
      "Gold became money because of its properties: it does not corrode, it is scarce (all gold ever mined fits in 3 Olympic pools), it is divisible, and it is beautiful.",
      "Roman denarius started at 95% silver. Over 200 years, emperors reduced the silver content to pay for wars and bread subsidies. By the end: less than 5% silver.",
      "This is the first recorded currency debasement — and it contributed directly to the fall of Rome.",
      "Pattern: EVERY empire in history has eventually debased its currency when it could not afford its spending.",
      "China invented paper money (7th century) — and experienced the world's first hyperinflation when they printed too much.",
    ],
    lesson: "Gold held its value for 5,000 years because no government could print more of it. Every time humans switched to money that could be created at will, inflation followed.",
  },
  {
    era: "The Gold Standard",
    years: "1700s – 1914",
    color: "bg-amber-500",
    summary: "Nations tied their currencies to a fixed amount of gold. One US dollar = 1/20 of an ounce of gold. This limited how much money governments could create.",
    details: [
      "The gold standard forced fiscal discipline: governments could only spend what they collected in taxes (plus gold reserves).",
      "International trade balanced automatically — if a country imported more than it exported, gold flowed out, reducing the money supply and making exports cheaper.",
      "The era of the classical gold standard (1870-1914) saw the lowest sustained inflation in history and massive economic growth.",
      "Critics: the gold standard limited government's ability to respond to crises. Supporters: that limitation was the entire point — it prevented governments from inflating away people's savings.",
      "World War I ended the classical gold standard — governments needed to print money to fund the war.",
    ],
    lesson: "The gold standard's constraint on money printing was not a bug — it was the feature. It forced honest accounting and stable prices for over a century.",
  },
  {
    era: "Bretton Woods",
    years: "1944 – 1971",
    color: "bg-blue-500",
    summary: "After WW2, 44 nations agreed: all currencies would be pegged to the US dollar, and the dollar would be convertible to gold at $35/ounce. America promised the world: our dollar is as good as gold.",
    details: [
      "This made the US dollar the world's reserve currency — every country needed dollars to trade.",
      "The system worked while America ran balanced budgets. But the Vietnam War and Great Society programs cost more than tax revenue covered.",
      "The US began printing more dollars than it had gold to back. France's Charles de Gaulle noticed and started demanding gold for dollars.",
      "By 1971, so many countries were exchanging dollars for gold that the US gold reserves were draining rapidly.",
      "The fundamental problem: the US promised every dollar was backed by gold, but it had printed far more dollars than it had gold. It was a lie that could not be sustained.",
    ],
    lesson: "Bretton Woods proved that even partial gold backing only works if governments keep their promise not to print excess money. They never do.",
  },
  {
    era: "The Nixon Shock — August 15, 1971",
    years: "1971",
    color: "bg-red-500",
    summary: "President Nixon announced the US would no longer convert dollars to gold. In a single broadcast, the entire global monetary system changed. Every currency on Earth became fiat — backed by nothing except government promises.",
    details: [
      "Nixon called it 'temporary.' It has been 50+ years.",
      "Before 1971: governments had to earn or tax money before spending it. After 1971: they could simply create it.",
      "This is the single most important economic event of the last 100 years, and most people have never heard of it.",
      "After 1971, the correlation between productivity and wages broke. Workers became more productive, but wages stopped keeping up. The gap went to asset owners and financial markets.",
      "After 1971, housing prices decoupled from incomes. Debt exploded. The wealth gap widened. The middle class began its slow erosion.",
      "After 1971, the US national debt went from $370 billion to $35+ trillion.",
      "The dollar has lost 87% of its purchasing power since 1971. What cost $1 then costs $7.80 today.",
    ],
    lesson: "1971 is the year that money stopped being tied to anything real. Everything that happened after — wage stagnation, housing crisis, wealth inequality, exploding debt — traces back to this single decision.",
  },
  {
    era: "The Fiat Era",
    years: "1971 – Present",
    color: "bg-red-400",
    summary: "All modern money is fiat — Latin for 'let it be done.' It has value because the government says it does and because people accept it. There is no gold, no silver, no physical thing backing it.",
    details: [
      "Fiat money gives governments unlimited spending power. The result: every fiat currency in history has eventually gone to zero.",
      "The average lifespan of a fiat currency is 27 years. The US dollar has survived 50+ years as fiat — longer than average, but following the same pattern.",
      "Quantitative easing (2008-2014, 2020-2022): the Federal Reserve created $8+ trillion out of nothing. This money went to banks and financial markets first (Cantillon Effect), inflating asset prices while wages stagnated.",
      "COVID stimulus: US government distributed $5+ trillion in 2020-2021. Inflation surged to 9.1% by June 2022 — the highest in 40 years.",
      "Central banks now face an impossible choice: keep printing (inflation) or stop printing (recession/depression). There is no painless exit from 50 years of money creation.",
    ],
    lesson: "Fiat money is an experiment. Every previous version of this experiment has ended in currency collapse. The question is not IF but WHEN and WHAT REPLACES IT.",
  },
  {
    era: "Bitcoin & Digital Money",
    years: "2009 – Present",
    color: "bg-orange-500",
    summary: "In 2009, an anonymous person (Satoshi Nakamoto) created Bitcoin — digital money with a hard cap of 21 million coins that no government, bank, or individual can change. For the first time, money could be scarce AND digital.",
    details: [
      "Bitcoin's genesis block contains a message: 'Chancellor on brink of second bailout for banks.' — a direct reference to the failure of fiat money and bank bailouts.",
      "21 million hard cap — unlike every fiat currency, no one can print more Bitcoin. This makes it deflationary by design.",
      "Decentralized — no government, bank, or company controls it. It runs on math and consensus, not trust.",
      "Critics: volatile, energy-intensive, used for crime. Supporters: all new money technologies face these criticisms. The internet was 'used for crime' too.",
      "Central Bank Digital Currencies (CBDCs) — governments are creating their own digital currencies. Unlike Bitcoin, these give governments MORE control over money: they can track every transaction, freeze accounts, and program money to expire.",
      "The fundamental question: should money be controlled by governments (fiat/CBDC) or by mathematical rules (Bitcoin/gold)? This debate will define the next century.",
    ],
    lesson: "Bitcoin is the first money in history that cannot be debased. Whether it succeeds or fails, it has permanently changed the conversation about what money should be.",
  },
]

const AFTER_1971 = [
  { metric: "Wage-Productivity Gap", before: "Wages and productivity grew together", after: "Productivity up 300%, wages up 17% (adjusted)", source: "Bureau of Labor Statistics" },
  { metric: "Home Price to Income", before: "2.3x median income", after: "5.2x median income (10x+ in major cities)", source: "Federal Reserve, NAR" },
  { metric: "National Debt (US)", before: "$370 billion", after: "$35+ trillion", source: "US Treasury" },
  { metric: "Dollar Purchasing Power", before: "$1.00", after: "$0.13 (lost 87%)", source: "BLS CPI Calculator" },
  { metric: "Personal Savings Rate", before: "12-15%", after: "3-5%", source: "Federal Reserve FRED" },
  { metric: "Household Debt", before: "~$500 billion", after: "$17.5+ trillion", source: "Federal Reserve" },
  { metric: "Wealth of Bottom 50%", before: "Share growing", after: "Own 2.6% of total wealth", source: "Federal Reserve SCF" },
  { metric: "Wealth of Top 1%", before: "Share declining", after: "Own 32% of total wealth", source: "Federal Reserve SCF" },
]

export default function MoneyHistoryPage() {
  const [expanded, setExpanded] = useState<number | null>(4) // Start at Nixon Shock

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">The History of Money</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How money went from gold coins you could hold to digital numbers a central bank creates with a keystroke — and why 1971 changed everything.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-0 relative">
        <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-300 via-blue-300 to-red-400" />
        {TIMELINE.map((era, i) => {
          const isOpen = expanded === i
          return (
            <div key={i} className="relative">
              <div className="cursor-pointer flex gap-4 py-3" onClick={() => setExpanded(isOpen ? null : i)}>
                <div className={cn("h-10 w-10 shrink-0 rounded-full z-10 flex items-center justify-center text-white text-[10px] font-bold", era.color)}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold">{era.era}</p>
                    <Badge variant="outline" className="text-[9px]">{era.years}</Badge>
                    {i === 4 && <Badge className="text-[9px] bg-red-500 text-white">The Turning Point</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{era.summary}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform", isOpen && "rotate-180")} />
              </div>
              {isOpen && (
                <div className="ml-14 mb-4 space-y-2">
                  {era.details.map((d, j) => (
                    <p key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-amber-400 shrink-0">-</span><span>{d}</span>
                    </p>
                  ))}
                  <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-3 mt-2">
                    <p className="text-xs text-amber-800"><strong>Key takeaway:</strong> {era.lesson}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* What changed after 1971 */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Before and After 1971
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Every single one of these metrics changed direction in 1971 — the year money stopped being backed by gold.
        </p>
        <div className="space-y-2">
          {AFTER_1971.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-1">{item.metric}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-600 font-medium">{item.before}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-red-500 font-medium">{item.after}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Source: {item.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sources */}
      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Further reading:</strong> <em>What Has Government Done to Our Money?</em> (Murray Rothbard) —
            short, free online. <em>The Bitcoin Standard</em> (Saifedean Ammous). <em>When Money Dies</em> (Adam Fergusson) —
            the Weimar Republic hyperinflation. wtfhappenedin1971.com — visual data showing every metric that changed
            direction after the gold standard ended. All data from Federal Reserve FRED, BLS, US Treasury, and World Bank.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/education/economics" className="text-sm text-amber-600 hover:underline">Economics Education</a>
        <a href="/civilizations" className="text-sm text-red-600 hover:underline">Civilizations</a>
        <a href="/compound-interest" className="text-sm text-emerald-600 hover:underline">Compound Interest</a>
        <a href="/education/finance" className="text-sm text-blue-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
