"use client"

import { useState } from "react"
import { Globe2, TrendingUp, TrendingDown, ArrowRight, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const METRICS: {
  metric: string
  canada: string
  rank: string
  countries: { name: string; value: string }[]
  verdict: string
  lesson: string
}[] = [
  { metric: "Housing Affordability (price-to-income)", canada: "8.3x", rank: "Worst in G7", countries: [{ name: "Japan", value: "4.0x" }, { name: "Germany", value: "5.2x" }, { name: "US", value: "5.5x" }, { name: "Australia", value: "7.2x" }], verdict: "FAILING", lesson: "Japan allows density everywhere. Germany has strong tenant protections + rent control that actually works. Canada blocks both." },
  { metric: "Healthcare Wait Times (specialist)", canada: "27.7 weeks", rank: "Last in comparable nations", countries: [{ name: "Netherlands", value: "3 weeks" }, { name: "Germany", value: "4 weeks" }, { name: "France", value: "4 weeks" }, { name: "Australia", value: "6 weeks" }], verdict: "FAILING", lesson: "Every country that beats Canada allows mixed public/private delivery. Canada is the ONLY universal system that bans private alternatives." },
  { metric: "Healthcare Spending (% GDP)", canada: "12.2%", rank: "3rd highest in OECD", countries: [{ name: "US", value: "17.6%" }, { name: "Germany", value: "12.7%" }, { name: "France", value: "12.1%" }, { name: "Netherlands", value: "10.1%" }], verdict: "OVERSPENDING", lesson: "Canada spends more than France but gets worse outcomes. The issue is not money — it is system design." },
  { metric: "Wireless Prices (unlimited plan)", canada: "$75-90/mo", rank: "Most expensive in OECD", countries: [{ name: "France", value: "$20/mo" }, { name: "UK", value: "$20/mo" }, { name: "Australia", value: "$30/mo" }, { name: "US", value: "$50/mo" }], verdict: "FAILING", lesson: "Every country with lower prices allows foreign competition. Canada's protectionism costs consumers billions." },
  { metric: "Education (PISA Math)", canada: "497", rank: "16th (was top 5)", countries: [{ name: "Singapore", value: "575" }, { name: "Japan", value: "536" }, { name: "Estonia", value: "510" }, { name: "Finland", value: "484" }], verdict: "DECLINING", lesson: "Countries beating Canada invest in teacher quality over technology. Estonia and Finland use less tech in schools than Canada." },
  { metric: "National Debt (% GDP)", canada: "107%", rank: "5th worst in G7", countries: [{ name: "Norway", value: "37%" }, { name: "Australia", value: "55%" }, { name: "Germany", value: "65%" }, { name: "UK", value: "101%" }], verdict: "CONCERNING", lesson: "Norway saved oil revenue ($1.5T fund). Canada spent it. Same resource, opposite outcome." },
  { metric: "Birth Rate", canada: "1.33", rank: "Among lowest globally", countries: [{ name: "France", value: "1.79" }, { name: "US", value: "1.62" }, { name: "Australia", value: "1.58" }, { name: "Norway", value: "1.41" }], verdict: "CRISIS", lesson: "France offers generous family benefits + affordable childcare. Result: highest birth rate in Europe. Canada's childcare costs + housing costs = families can't afford children." },
  { metric: "Household Debt (% disposable income)", canada: "179%", rank: "Worst in G7", countries: [{ name: "Germany", value: "94%" }, { name: "France", value: "103%" }, { name: "US", value: "101%" }, { name: "Australia", value: "151%" }], verdict: "FAILING", lesson: "Canadians owe $1.79 for every $1 of disposable income. Driven primarily by housing costs and consumer credit. This is structurally unsustainable." },
  { metric: "Ease of Starting a Business", canada: "3rd (World Bank)", rank: "Strong", countries: [{ name: "New Zealand", value: "1st" }, { name: "Singapore", value: "2nd" }, { name: "Canada", value: "3rd" }, { name: "Australia", value: "7th" }], verdict: "STRONG", lesson: "One of Canada's genuine strengths. Low barriers to incorporation. But scaling the business is harder — interprovincial trade barriers, talent shortages." },
  { metric: "Life Expectancy", canada: "81.7 years", rank: "14th globally", countries: [{ name: "Japan", value: "84.8" }, { name: "Switzerland", value: "83.4" }, { name: "Australia", value: "83.0" }, { name: "Norway", value: "83.2" }], verdict: "GOOD", lesson: "Canada's life expectancy is good but declining relative to peers since 2015. Drug crisis (BC) and healthcare access issues pulling it down." },
  { metric: "Income Inequality (Gini)", canada: "0.30", rank: "Mid-pack in OECD", countries: [{ name: "Norway", value: "0.26" }, { name: "Germany", value: "0.29" }, { name: "France", value: "0.29" }, { name: "US", value: "0.39" }], verdict: "OKAY", lesson: "Better than the US, slightly worse than Europe. Wealth inequality (ownership of assets) is more concerning than income inequality." },
  { metric: "Renewable Energy (%)", canada: "68%", rank: "Top 5 globally", countries: [{ name: "Norway", value: "98%" }, { name: "Brazil", value: "83%" }, { name: "Canada", value: "68%" }, { name: "Germany", value: "46%" }], verdict: "STRONG", lesson: "Quebec hydro + BC hydro + Manitoba hydro give Canada a massive clean energy advantage. This should attract energy-intensive industry globally." },
  { metric: "Military Spending (% GDP)", canada: "1.3%", rank: "2nd lowest in NATO", countries: [{ name: "US", value: "3.5%" }, { name: "UK", value: "2.3%" }, { name: "France", value: "2.1%" }, { name: "Australia", value: "2.0%" }], verdict: "FAILING", lesson: "Canada is a defense free-rider under the US umbrella. With Arctic sovereignty at stake, this is a strategic vulnerability." },
  { metric: "Immigration (% of population/year)", canada: "3.2%", rank: "Highest in G7", countries: [{ name: "Australia", value: "2.1%" }, { name: "Germany", value: "1.5%" }, { name: "UK", value: "1.0%" }, { name: "US", value: "0.3%" }], verdict: "UNSUSTAINABLE", lesson: "Immigration is good when matched with infrastructure. At 3.2%/year without matching housing/healthcare capacity, it drives up costs for everyone — including newcomers." },
  { metric: "Trust in Government", canada: "47%", rank: "Below OECD average (51%)", countries: [{ name: "Norway", value: "73%" }, { name: "Switzerland", value: "68%" }, { name: "Netherlands", value: "57%" }, { name: "US", value: "31%" }], verdict: "DECLINING", lesson: "Trust correlates with government competence. Norway has high trust because the government delivers results. Canada's trust is declining because the system is visibly failing on housing, healthcare, and cost of living." },
]

export default function CanadaVsWorldPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const wins = METRICS.filter(m => m.verdict === "STRONG" || m.verdict === "GOOD").length
  const fails = METRICS.filter(m => m.verdict === "FAILING" || m.verdict === "CRISIS").length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-600">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada vs The World</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {METRICS.length} metrics. No politics — just data. Where Canada leads, where it lags, and what we can learn.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{wins}</p>
          <p className="text-xs text-muted-foreground">Strong/Good</p>
        </CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{METRICS.length - wins - fails}</p>
          <p className="text-xs text-muted-foreground">Mid-pack</p>
        </CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{fails}</p>
          <p className="text-xs text-muted-foreground">Failing/Crisis</p>
        </CardContent></Card>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {METRICS.map((m, i) => {
          const isOpen = expanded === i
          const verdictColor = m.verdict === "STRONG" || m.verdict === "GOOD" ? "text-emerald-600 border-emerald-300" :
            m.verdict === "FAILING" || m.verdict === "CRISIS" ? "text-red-500 border-red-300" :
            "text-amber-600 border-amber-300"
          return (
            <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.metric}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold">{m.canada}</span>
                      <span className="text-[10px] text-muted-foreground">{m.rank}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px]", verdictColor)}>{m.verdict}</Badge>
                  <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-4 gap-1.5">
                      {m.countries.map((c, ci) => (
                        <div key={ci} className="rounded-lg bg-muted/30 p-1.5 text-center">
                          <p className="text-[10px] text-muted-foreground">{c.name}</p>
                          <p className="text-xs font-bold">{c.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-2">
                      <p className="text-xs text-blue-700"><strong>Lesson:</strong> {m.lesson}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Bottom Line</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada excels in natural advantages (energy, resources, business environment, life expectancy) but
            fails in man-made systems (housing, healthcare delivery, telecom, debt). Every area where Canada
            fails, at least one comparable country succeeds — meaning the failures are choices, not inevitabilities.
            Norway saved its oil revenue. France built affordable housing. Japan allowed density. Germany built an
            apprenticeship system. The solutions exist. Canada just has not implemented them.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/blueprint" className="text-sm text-emerald-600 hover:underline">Blueprint</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Civilizations</a>
      </div>
    </div>
  )
}
