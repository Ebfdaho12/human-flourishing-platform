"use client"

import { useState } from "react"
import { Home, TrendingUp, AlertTriangle, ArrowRight, DollarSign, Users, ChevronDown, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CITY_DATA = [
  { city: "Vancouver", avg: 1210000, median: 1080000, rent1br: 2800, incomeToPrice: 15.2, vacancy: 0.9, note: "Geographic constraint (mountains + ocean) limits supply. Foreign investment historically massive. Most unaffordable city in North America by income-to-price ratio." },
  { city: "Toronto (GTA)", avg: 1100000, median: 950000, rent1br: 2500, incomeToPrice: 13.6, vacancy: 1.4, note: "Canada's largest city. Zoning has been 70% single-family detached (the 'yellowbelt'). Massive immigration to a city that doesn't build enough. Investor-owned properties estimated at 25-30%." },
  { city: "Hamilton", avg: 780000, median: 700000, rent1br: 1800, incomeToPrice: 10.1, vacancy: 2.1, note: "Toronto spillover. Was affordable 10 years ago. Remote work + GO Transit access made it a commuter city. Prices tripled since 2015." },
  { city: "Ottawa", avg: 650000, median: 590000, rent1br: 2100, incomeToPrice: 7.8, vacancy: 2.4, note: "Government jobs provide stable demand. More affordable than Toronto/Vancouver but prices rose 60%+ since 2020." },
  { city: "Montreal", avg: 560000, median: 490000, rent1br: 1700, incomeToPrice: 7.2, vacancy: 2.8, note: "Historically affordable due to rent control and language barrier to anglophone buyers. Now rising fast as remote workers discover the value." },
  { city: "Calgary", avg: 530000, median: 480000, rent1br: 1800, incomeToPrice: 5.8, vacancy: 1.1, note: "Oil economy provides high wages. No PST. Was affordable but prices surging due to interprovincial migration from Ontario/BC. Building rapidly." },
  { city: "Edmonton", avg: 400000, median: 370000, rent1br: 1400, incomeToPrice: 4.4, vacancy: 2.8, note: "Most affordable major city in Canada. Strong public sector + oil industry. Cold winters are the trade-off." },
  { city: "Winnipeg", avg: 350000, median: 320000, rent1br: 1300, incomeToPrice: 4.4, vacancy: 3.2, note: "Very affordable. Strong economy (agriculture, manufacturing, finance). Underappreciated — best cost-of-living to income ratio of any Canadian city." },
  { city: "Saskatoon", avg: 370000, median: 340000, rent1br: 1250, incomeToPrice: 4.3, vacancy: 2.9, note: "Potash and uranium economy. University of Saskatchewan. Affordable with growing tech sector." },
  { city: "Halifax", avg: 500000, median: 450000, rent1br: 2000, incomeToPrice: 7.1, vacancy: 1.0, note: "Was affordable — prices doubled since 2020. Remote work + immigration drove massive demand. Military base provides stable employment." },
  { city: "St. John's, NL", avg: 310000, median: 280000, rent1br: 1100, incomeToPrice: 3.8, vacancy: 5.0, note: "Most affordable housing in the country. Offshore oil economy. Population declining, creating opportunity for those willing to move." },
  { city: "Moncton, NB", avg: 300000, median: 270000, rent1br: 1200, incomeToPrice: 4.0, vacancy: 1.6, note: "Bilingual city. Growing as remote work destination. Irving family economic influence. Affordable but rising." },
]

const WHY_EXPENSIVE = [
  {
    factor: "Zoning Restrictions",
    impact: "40-60% of price inflation",
    explanation: "In Toronto, 70% of residential land is zoned exclusively for single-family detached homes. You cannot legally build a triplex, a small apartment, or even a laneway suite on most land. This artificial scarcity is the #1 driver of high prices. Cities that allow density (Tokyo, Houston) have affordable housing despite high demand.",
    solution: "Upzone everywhere. Allow 4-plexes on any residential lot (Ontario's Bill 23 started this). Allow 6-story apartments on major streets. Eliminate parking minimums (each required parking space adds $40-80K to construction costs). Minneapolis did this in 2018 — rents stabilized.",
  },
  {
    factor: "Investment / Financialization",
    impact: "20-30% of demand is non-resident or investor",
    explanation: "REITs (Real Estate Investment Trusts), corporations, and individual investors treat Canadian housing as a financial asset. An estimated 25-30% of homes in Toronto and Vancouver are investor-owned. When housing competes with global capital markets for returns, families cannot compete with fund managers.",
    solution: "Tax vacant properties aggressively (Vancouver's empty homes tax reduced vacancies by 25%). Ban corporate REIT purchases of residential homes. Foreign buyer ban (already in place, but enforcement is weak). Speculation tax on properties sold within 2 years.",
  },
  {
    factor: "Immigration Exceeding Housing Capacity",
    impact: "500K+ new residents/year into a system building 200K homes/year",
    explanation: "Canada admitted 471,550 permanent residents in 2023 plus 800K+ temporary residents (international students, TFWs). Total population grew by 1.2M in one year. Housing starts: ~240K. The math does not work. This is not anti-immigration — it is anti-planning. Immigration without proportional housing is a policy choice that hurts both newcomers and existing residents.",
    solution: "Tie immigration targets to housing starts. For every X new homes built, admit Y newcomers. Currently there is zero coordination between the two. Require municipalities to build before population growth is authorized. Ensure newcomers can actually find housing.",
  },
  {
    factor: "Construction Costs & Red Tape",
    impact: "Approval timelines of 3-7 years, development charges of $100K+ per unit",
    explanation: "Building a condo tower in Toronto takes 3-7 years of approvals. Development charges (fees the city charges to build) can exceed $100,000 per unit. These costs are passed to the buyer. A unit that costs $300K to build sells for $600K+ after government fees, taxes, and approval delays.",
    solution: "Streamline approvals (target: 6 months, not 6 years). Cap development charges. Pre-approve standardized building designs. Modular/prefab housing (factory-built, assembled on-site in weeks instead of years). Federal government can tie infrastructure funding to municipal approval speed.",
  },
  {
    factor: "Low Interest Rates (2009-2022)",
    impact: "Cheap money inflated prices by 200-300%",
    explanation: "The Bank of Canada held rates near zero for over a decade. Cheap money meant larger mortgage approvals. A family that qualified for $400K at 5% qualified for $600K+ at 2%. This didn't make housing more affordable — it just allowed higher prices. Prices rose to absorb every dollar of increased borrowing capacity.",
    solution: "Already correcting (rates rose to 5% in 2023). But the damage is done — millions are locked into mortgages based on inflated prices with higher payments. The correction will be painful for those who bought at peak.",
  },
  {
    factor: "Money Laundering",
    impact: "Estimated $40-100B laundered through Canadian real estate",
    explanation: "The Cullen Commission (BC) found that billions in proceeds from organized crime, drug trafficking, and foreign corruption were laundered through Canadian real estate — particularly in Vancouver. Shell companies purchased properties with no verification of funds. Canada was called 'Snow Washing' — the country where dirty money comes to get clean.",
    solution: "Beneficial ownership registry (who actually owns the property — now being implemented). Anti-money laundering enforcement (FinTRAC needs real teeth). Cash transaction reporting for real estate. Due diligence requirements on lawyers who facilitate purchases.",
  },
]

const SOLUTIONS = [
  {
    category: "Build More, Build Faster",
    items: [
      "Target: 500K+ homes/year (currently 200-240K). Double output minimum.",
      "Modular/prefab factories — homes built in factories and assembled on-site. 50-70% faster, 20-30% cheaper.",
      "Federal land: convert surplus government land to housing. Military bases, post offices, parking lots — anything underutilized.",
      "Pre-approved building plans: standardize designs so approvals take weeks, not years.",
      "Public developer: government builds and owns rental housing (Vienna model — 60% of Vienna lives in social housing, rent averages $600/month for a family).",
    ],
  },
  {
    category: "Make Speculation Unprofitable",
    items: [
      "Vacant home tax: 3-5% of property value annually if unoccupied. Vancouver's 1% tax worked — expand and increase it.",
      "Flipping tax: 100% capital gains tax on properties sold within 12 months, 75% within 24 months.",
      "REIT restriction: ban residential REITs from purchasing existing single-family homes. They can build new supply but not buy existing stock.",
      "Foreign buyer ban: strengthen enforcement. Current ban has loopholes (corporations, PR holders purchasing before landing).",
      "Capital gains inclusion rate on investment properties: 100% (currently 66.7%). Your primary residence remains exempt.",
    ],
  },
  {
    category: "Zoning Revolution",
    items: [
      "End single-family-only zoning nationally. Allow 4-plexes on every residential lot.",
      "Allow 6-8 story apartments on any arterial road or transit corridor.",
      "Eliminate minimum parking requirements (adds $40-80K per unit to construction cost).",
      "As-of-right development: if a proposal meets the zoning rules, it is approved automatically. No discretionary 'community consultation' that NIMBYs use to block housing.",
      "Federal incentive: tie infrastructure funding to municipal housing targets. Cities that don't build lose federal money.",
    ],
  },
  {
    category: "Financial Reforms",
    items: [
      "30-year mortgages standard (currently 25-year max for insured). Lowers monthly payments by 15-20%.",
      "Rent-to-own programs: government-backed path from renting to ownership.",
      "Eliminate the stress test for renewals (currently forces people to qualify at higher rates even when staying with their current lender — gives banks leverage).",
      "Co-op housing expansion: non-profit housing where residents pay cost price. 250K+ Canadians already live in co-ops — proven model.",
      "Indigenous housing fund: separate from CMHC. Direct funding for on-reserve and urban Indigenous housing with community-led design.",
    ],
  },
]

export default function CanadaHousingPage() {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-600">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Housing Crisis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The data on why homes cost what they do, who benefits, and what would actually fix it.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Numbers</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Average Canadian home: <strong>$665,000</strong>. Average household income: <strong>$80,000</strong>.
            Ratio: <strong>8.3x</strong>. The OECD considers anything above 5x to be "severely unaffordable."
            In Toronto and Vancouver, the ratio exceeds <strong>13x</strong>. A generation of Canadians has been
            locked out of homeownership — not because they don't work hard enough, but because the system is
            designed to enrich asset owners at the expense of everyone else.
          </p>
        </CardContent>
      </Card>

      {/* City comparison table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" /> Housing by City
        </CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CITY_DATA.map((c, i) => (
              <div key={i} className={cn("rounded-lg border p-2.5",
                c.incomeToPrice > 10 ? "border-red-200 bg-red-50/10" :
                c.incomeToPrice > 6 ? "border-amber-200 bg-amber-50/10" :
                "border-emerald-200 bg-emerald-50/10"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{c.city}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">${(c.avg / 1000).toFixed(0)}K</span>
                    <span className={cn("text-[10px] ml-1.5",
                      c.incomeToPrice > 10 ? "text-red-500" : c.incomeToPrice > 6 ? "text-amber-600" : "text-emerald-600"
                    )}>({c.incomeToPrice}x income)</span>
                  </div>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Rent 1BR: ${c.rent1br.toLocaleString()}</span>
                  <span>Vacancy: {c.vacancy}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{c.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why it's expensive */}
      <div>
        <h2 className="text-lg font-bold mb-3">Why Housing Costs This Much</h2>
        <p className="text-xs text-muted-foreground mb-3">Six factors, ranked by impact. None of them are "people just need to save more."</p>
        <div className="space-y-3">
          {WHY_EXPENSIVE.map((w, i) => {
            const isOpen = expandedWhy === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedWhy(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{w.factor}</p>
                      <p className="text-xs text-red-500">{w.impact}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{w.explanation}</p>
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Solution:</strong> {w.solution}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Solutions */}
      <div>
        <h2 className="text-lg font-bold mb-3">What Would Actually Fix It</h2>
        <div className="space-y-4">
          {SOLUTIONS.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">{s.category}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> CREA, CMHC, Statistics Canada, Bank of Canada, OECD, Cullen Commission (BC),
            Parliamentary Budget Officer, Toronto Regional Real Estate Board, municipal zoning data.
            Cross-reference politicians who blocked housing reform on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Sovereignty</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/cost-of-living" className="text-sm text-teal-600 hover:underline">Cost of Living</a>
      </div>
    </div>
  )
}
