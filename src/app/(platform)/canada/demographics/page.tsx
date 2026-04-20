"use client"

import { useState } from "react"
import { Users, Baby, TrendingDown, Home, DollarSign, ArrowRight, ChevronDown, Globe2, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const BIRTH_RATES = [
  { year: 1960, rate: 3.81, note: "Baby boom peak. One income could support a family. Housing: 2x income." },
  { year: 1970, rate: 2.33, note: "Birth control pill (1960) + women entering workforce. Still above replacement." },
  { year: 1980, rate: 1.74, note: "First time below replacement (2.1). Housing costs rising. Two incomes becoming necessary." },
  { year: 1990, rate: 1.71, note: "NAFTA approaches. Manufacturing starts leaving. Dual income is the norm." },
  { year: 2000, rate: 1.49, note: "Dot-com era. Housing affordable outside cities. Birth rate stabilizes." },
  { year: 2010, rate: 1.63, note: "Slight recovery. Low interest rates make housing seem affordable." },
  { year: 2015, rate: 1.60, note: "Last year above 1.6. CCB introduced — modest positive effect." },
  { year: 2020, rate: 1.40, note: "COVID baby bust (opposite of expected). Cost of living accelerating." },
  { year: 2022, rate: 1.33, note: "Lowest in Canadian history. Housing crisis + childcare costs + economic uncertainty." },
  { year: 2023, rate: 1.26, note: "New record low. A country that cannot afford children does not have them." },
]

const WHY_COLLAPSING = [
  {
    factor: "Housing Costs",
    impact: "PRIMARY DRIVER",
    explanation: "Young couples delay having children because they cannot afford a home large enough for a family. A 2-bedroom apartment in Toronto costs $2,500+/month. A detached home with a yard (what most families want for children) costs $5,000+/month in mortgage payments. The median age of first-time homebuyers is now 36 — up from 28 in 1990. You cannot start a family if you cannot afford a home.",
    data: "Couples who own homes have 0.5 more children on average than renters (StatsCan). Housing affordability is the #1 predictor of fertility in developed countries.",
  },
  {
    factor: "Childcare Costs",
    impact: "MAJOR DRIVER",
    explanation: "Pre-$10/day childcare: $1,500-$2,000/month per child in Ontario. That is $18,000-$24,000/year AFTER tax — essentially an entire salary. Many couples calculated that having a child would cost MORE than one parent's entire take-home pay. The $10/day program helps but waitlists are years long in most cities — the promise exists but the spaces do not.",
    data: "Quebec (which has had $7-10/day childcare since 1997) has consistently higher birth rates than Ontario. France ($10/day equivalent) has the highest birth rate in Europe (1.79). Affordable childcare = more children. The data is unambiguous.",
  },
  {
    factor: "Economic Uncertainty",
    impact: "MAJOR DRIVER",
    explanation: "Young adults face: record student debt, gig economy jobs without benefits, no pension, no job security, and cost of living rising faster than wages. Having a child is a 20-year financial commitment. People do not make 20-year commitments when they cannot see 2 years ahead. The precariat generation does not have children — it cannot afford to.",
    data: "Countries with the strongest social safety nets (Scandinavia, France) have the highest birth rates in Europe. Countries with the weakest (Southern Europe, East Asia) have the lowest. Security = children. Insecurity = no children.",
  },
  {
    factor: "Cultural Shift",
    impact: "CONTRIBUTING FACTOR",
    explanation: "Delayed marriage (average age: 30+ for first marriage, up from 22 in 1970). Career prioritization. Social media lifestyle expectations. Normalization of childless-by-choice. These are real cultural shifts but they are ACCELERATED by economic conditions — people who say they do not want children often actually mean they cannot afford them.",
    data: "Surveys consistently show that Canadians WANT 2.2 children on average but HAVE 1.3. The gap between desired and actual fertility is entirely explained by economic barriers (housing, childcare, cost of living).",
  },
  {
    factor: "Immigration as a Substitute",
    impact: "POLICY FACTOR",
    explanation: "When the birth rate dropped, governments chose to increase immigration rather than address why Canadians were not having children. Immigration fills the workforce gap in the short term but does not solve the root problem. Immigrants also have lower birth rates after arriving in Canada (converging to Canadian norms within one generation) because they face the same cost pressures.",
    data: "Without immigration, Canada's population would begin shrinking by 2030. Immigration is a treatment, not a cure. The root cause — cost of family formation — remains unaddressed.",
  },
]

const WHAT_WORKS = [
  {
    country: "France",
    birthRate: 1.79,
    policies: [
      "Universal childcare from age 3 (free)",
      "Generous parental leave (16 weeks maternity + 25 days paternity, paid)",
      "Family allowances that INCREASE per child (more money for 2nd, 3rd, etc.)",
      "Tax benefits: 'family quotient' system — larger families pay proportionally less tax",
      "Housing benefits scaled to family size",
      "Cultural support: having children is celebrated and supported by the state",
    ],
    result: "Highest birth rate in Europe. Has been above 1.8 for 20+ years. Proof that policy works.",
  },
  {
    country: "Hungary",
    birthRate: 1.59,
    policies: [
      "Women who have 4+ children pay NO income tax for life",
      "Subsidized housing loans — forgiven after 3rd child",
      "Free IVF treatment",
      "Grandparent childcare leave (grandparents can take leave to care for grandchildren)",
      "Student loan forgiveness after having children",
    ],
    result: "Birth rate increased from 1.23 (2011) to 1.59 (2021). Most dramatic recovery in Europe. Controversial but effective.",
  },
  {
    country: "Sweden",
    birthRate: 1.52,
    policies: [
      "480 days of parental leave (shared between parents, 80% of salary)",
      "Universal childcare from age 1 (max cost ~$150/month)",
      "Flexible work arrangements legally guaranteed for parents",
      "Gender-equal parenting norms (90% of fathers take paternity leave)",
    ],
    result: "Historically higher than most of Europe. Declined recently but still above EU average. The model prioritizes gender equality + family support simultaneously.",
  },
]

const CANADA_PLAN = [
  { policy: "Housing affordability (root cause #1)", impact: "If home-to-income ratio drops from 8.3x to 4x, birth rate could increase 0.2-0.4 points (based on international data)", timeframe: "5-15 years" },
  { policy: "$10/day childcare — ACTUAL spaces, not just promises", impact: "Quebec's birth rate is consistently 0.1-0.15 higher than Ontario. Closing the gap nationally could add 0.1-0.15 to the birth rate", timeframe: "3-5 years to build spaces" },
  { policy: "Enhanced CCB scaled per child (French model)", impact: "Increasing CCB by $2,000/year for 2nd child, $4,000 for 3rd+ would directly incentivize larger families while supporting those who already have children", timeframe: "Immediate (policy change)" },
  { policy: "Tax reform for families (income splitting / family quotient)", impact: "Single-income families pay more tax than dual-income families earning the same total. Fixing this removes a penalty on families with a stay-at-home parent", timeframe: "Immediate (policy change)" },
  { policy: "Student loan forgiveness per child", impact: "Hungary model: forgive 50% of student debt after 2nd child, 100% after 3rd. Removes a major barrier for young adults", timeframe: "Immediate" },
  { policy: "Employer flexibility guarantee", impact: "Legal right to request flexible/remote work for parents of children under 12. Removes the career-vs-family false choice", timeframe: "1-2 years (legislation)" },
]

export default function CanadaDemographicsPage() {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null)
  const [showModels, setShowModels] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Birth Rate Crisis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          1.26 children per woman — the lowest in Canadian history. Why it collapsed, and what would reverse it.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Math</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Explain tip="The number of children per woman needed to maintain a stable population without immigration. It is 2.1 (not 2.0) because some children do not survive to adulthood and the sex ratio is not exactly 50/50">Replacement rate</Explain> is 2.1 children per woman.
            Canada is at <strong>1.26</strong> — 40% below replacement. This means each generation is 40% smaller than the one before.
            Without immigration, Canada's population would peak around 2030 and begin a permanent decline.
            A shrinking population means: fewer workers supporting more retirees, declining tax revenue, shrinking domestic market,
            and eventually — a country that cannot sustain its infrastructure, military, or social programs.
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Birth Rate Timeline (1960-2023)</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {BIRTH_RATES.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-bold w-10 shrink-0">{b.year}</span>
              <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full",
                  b.rate >= 2.1 ? "bg-emerald-400" : b.rate >= 1.6 ? "bg-amber-400" : "bg-red-400"
                )} style={{ width: `${(b.rate / 4) * 100}%` }} />
              </div>
              <span className={cn("text-xs font-bold w-8",
                b.rate >= 2.1 ? "text-emerald-600" : b.rate >= 1.6 ? "text-amber-600" : "text-red-500"
              )}>{b.rate}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-muted-foreground w-10">Target</span>
            <div className="flex-1 border-t-2 border-dashed border-emerald-400 relative">
              <span className="absolute right-0 -top-3 text-[10px] text-emerald-600">Replacement: 2.1</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            From 3.81 (1960) to 1.26 (2023) — a 67% decline in 63 years. The steepest drop correlates with housing price increases post-2015.
          </p>
        </CardContent>
      </Card>

      {/* Why */}
      <div>
        <h2 className="text-lg font-bold mb-3">Why Canadians Are Not Having Children</h2>
        <p className="text-xs text-muted-foreground mb-3">Canadians WANT 2.2 children. They HAVE 1.26. The gap is 100% economic.</p>
        <div className="space-y-3">
          {WHY_COLLAPSING.map((w, i) => {
            const isOpen = expandedWhy === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedWhy(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{w.factor}</p>
                      <Badge variant="outline" className={cn("text-[9px]",
                        w.impact.includes("PRIMARY") ? "text-red-500 border-red-300" :
                        w.impact.includes("MAJOR") ? "text-amber-600 border-amber-300" :
                        "text-blue-600 border-blue-300"
                      )}>{w.impact}</Badge>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{w.explanation}</p>
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                        <p className="text-xs text-blue-700"><strong>Data:</strong> {w.data}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* What works */}
      <Card className="cursor-pointer" onClick={() => setShowModels(!showModels)}>
        <CardContent className="p-4 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Countries That Reversed the Decline</p>
            <p className="text-[10px] text-muted-foreground">Proof that policy works — if the will exists</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showModels && "rotate-180")} />
        </CardContent>
      </Card>
      {showModels && (
        <div className="space-y-3">
          {WHAT_WORKS.map((c, i) => (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{c.country}</p>
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">{c.birthRate}</Badge>
                </div>
                <ul className="space-y-1 mb-2">
                  {c.policies.map((p, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex gap-2">
                      <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />{p}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-emerald-700 font-medium">{c.result}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Canada plan */}
      <div>
        <h2 className="text-lg font-bold mb-3">What Canada Could Do</h2>
        <div className="space-y-2">
          {CANADA_PLAN.map((p, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-1">{p.policy}</p>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-emerald-600"><strong>Impact:</strong> {p.impact}</span>
                  <Badge variant="outline" className="text-[9px]">{p.timeframe}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-900 mb-2">The Choice</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada can either make it affordable and desirable to have children, or it can import a replacement
            population indefinitely. Both are choices. But only one addresses the root cause. France, Hungary,
            and Sweden show that when governments invest in families — affordable housing, childcare, parental leave,
            financial support — people have children. Canada has the resources. It lacks the policy. The{" "}
            <a href="/birth-fund" className="text-violet-600 hover:underline">Birth Fund</a> and{" "}
            <a href="/family-economics" className="text-violet-600 hover:underline">Family Economics</a> pages
            show what is possible at the individual family level. This page shows what is possible at the national level.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/housing" className="text-sm text-orange-600 hover:underline">Housing Crisis</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/birth-fund" className="text-sm text-emerald-600 hover:underline">Birth Fund</a>
        <a href="/canada/immigration" className="text-sm text-blue-600 hover:underline">Immigration</a>
      </div>
    </div>
  )
}
