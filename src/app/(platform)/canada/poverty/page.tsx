"use client"

import { useState } from "react"
import { TrendingDown, ChevronDown, Users, BarChart2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MEASURES = [
  {
    name: "Market Basket Measure (MBM)",
    status: "Official",
    statusColor: "bg-emerald-100 text-emerald-800",
    desc: "Canada's official poverty line since 2019. Calculates the cost of a specific basket of goods and services (food, clothing, shelter, transportation, other necessities) in different communities. It's regionally adjusted — the poverty line in rural New Brunswick is lower than in Toronto or Vancouver. Most rigorous for capturing real cost of living.",
    rate2023: "~11.1% of Canadians (2021 data, latest available). Down from 14.5% in 2015. Pre-CCB rates were much higher.",
  },
  {
    name: "Low Income Cut-Off (LICO)",
    status: "Legacy measure",
    statusColor: "bg-blue-100 text-blue-800",
    desc: "A family spending more than 63% of pre-tax income on food, shelter, and clothing is considered low-income. Developed in the 1970s. Criticized because it measures inequality, not absolute deprivation — if everyone gets richer but the bottom stays relatively poor, LICO doesn't improve. Still widely cited.",
    rate2023: "~9% after-tax. Used most often in academic research.",
  },
  {
    name: "Low Income Measure (LIM)",
    status: "International comparison",
    statusColor: "bg-violet-100 text-violet-800",
    desc: "A household is low-income if their income is less than 50% of the median Canadian household income (adjusted for household size). Used to compare poverty across countries (OECD standard). Measures relative poverty — it rises when inequality grows even if absolute incomes improve.",
    rate2023: "~12–14%. Canada ranks mid-tier among OECD nations.",
  },
]

const DEMOGRAPHICS = [
  { group: "Children under 18", rate: "~12.4%", context: "Down dramatically from 21% in the late 1990s — the Canada Child Benefit (CCB, 2016) is credited with lifting 435,000 children out of poverty. Still too high, and child poverty in lone-parent households is ~40%.", color: "bg-rose-100 text-rose-800" },
  { group: "Indigenous peoples", rate: "~25–30%", context: "On-reserve poverty rates are significantly higher — some First Nations communities see 50%+ poverty rates. Driven by under-funded services, land dispossession, intergenerational trauma, lack of economic opportunity. Housing crisis on reserve is severe.", color: "bg-red-100 text-red-800" },
  { group: "Seniors (65+)", rate: "~5.4%", context: "OAS and GIS have been highly effective at reducing senior poverty — down from 30%+ in the 1970s. Those who fall through gaps (recent immigrants, women who left workforce for caregiving) are most vulnerable. Senior poverty is rising slightly as housing costs outpace pensions.", color: "bg-amber-100 text-amber-800" },
  { group: "Single-parent households", rate: "~35–40%", context: "By far the highest risk demographic among non-Indigenous Canadians. Usually female-headed. Combines childcare costs, lower earnings, and lack of second income. CCB helps significantly but doesn't close the gap.", color: "bg-orange-100 text-orange-800" },
  { group: "Recent immigrants", rate: "~20–30%", context: "Drops significantly after 5–10 years as people integrate into the labour market and credential recognition improves. Structural barriers include foreign credential non-recognition, discrimination, and language barriers. Refugees face the steepest initial poverty.", color: "bg-yellow-100 text-yellow-800" },
  { group: "People with disabilities", rate: "~28–35%", context: "Income support programs (ODSP in Ontario, AISH in Alberta) pay below poverty line by design in most provinces. Extra costs of disability (medical equipment, accessible housing, specialized care) compound income insufficiency.", color: "bg-violet-100 text-violet-800" },
]

const PROGRAMS = [
  { name: "Canada Child Benefit (CCB)", type: "Federal — highly effective", desc: "Monthly non-taxable payment to families with children under 18, income-tested. Max $7,437/year per child under 6, $6,275 per child 6–17 (2024). Most effective anti-poverty program in Canada's history — measurably responsible for the steepest decline in child poverty ever recorded." },
  { name: "GST/HST Credit", type: "Federal", desc: "Quarterly tax-free payments to low-moderate income Canadians. Indexed to inflation. Up to ~$496/year for singles, $650 for couples, $171 per child. Not poverty-eliminating but offsets regressive consumption taxes." },
  { name: "Old Age Security (OAS) + GIS", type: "Federal", desc: "OAS: universal benefit at 65 ($685/month, 2024). Guaranteed Income Supplement: additional benefit for low-income seniors — up to $1,065/month for singles. Combined, these have been the most successful poverty reduction program in Canadian history for seniors." },
  { name: "Provincial Social Assistance (Welfare)", type: "Provincial — varies widely", desc: "Rates range from inadequate (Ontario Works: ~$733/month for single adults) to barely functional (BC: ~$935). ALL provinces pay below their own poverty lines. Recipients are almost guaranteed to be in poverty. Designed as short-term crisis support but used as long-term income for many." },
  { name: "Workers' Comp / EI", type: "Federal (EI) / Provincial (WC)", desc: "Employment Insurance replaces 55% of insurable earnings for up to 45 weeks when unemployed, sick, or new parent. Workers' Compensation covers workplace injury. Both have significant gaps — self-employed, gig workers, and those without enough hours often don't qualify." },
  { name: "Affordable Housing Programs", type: "Federal/Provincial", desc: "Canada Mortgage and Housing Corporation (CMHC) co-investment fund, provincial social housing, rent supplements. Severely underfunded relative to need. Social housing waitlists in major cities are 5–20+ years. Portable Housing Benefit (new federal program) is a step forward." },
]

const EVIDENCE = [
  { finding: "The Canada Child Benefit worked spectacularly", detail: "After the 2016 CCB redesign, child poverty fell from ~11% to under 8% within 4 years. The evidence is unambiguous. Direct cash transfers to families are more effective than in-kind benefits, means-testing creates better targeting than universality at the same cost, and indexing to inflation preserves value." },
  { finding: "Housing costs are now the biggest poverty driver", detail: "In the 1990s, low income was primarily an earnings problem. Today, housing cost burden is the primary driver — particularly in Vancouver, Toronto, and increasingly Calgary. A person earning $20/hour cannot afford median rent in most major Canadian cities. Anti-poverty policy without housing supply is insufficient." },
  { finding: "Poverty is expensive — for everyone", detail: "The Canadian Centre for Economic Analysis estimates poverty costs Canada $72–$86 billion annually through healthcare, criminal justice, lost productivity, and social services. Prevention costs a fraction of that. This is an economic argument for poverty reduction that transcends political ideology." },
  { finding: "Basic Income pilots showed real results", detail: "Ontario's CERB-like Basic Income Pilot (2017–2018, cancelled by Ford government) and the federal CERB during COVID both showed that direct cash transfers to low-income people were spent on food, housing, and essentials — not alcohol and drugs (the standard objection). Health outcomes and mental health improved measurably in the Ontario pilot." },
  { finding: "Indigenous poverty requires land and sovereignty solutions", detail: "Standard income transfer programs have limited effect on First Nations poverty because the root causes include dispossession of lands, chronically under-funded on-reserve services, and lack of economic self-determination. Self-governed First Nations with land and resource rights have significantly better economic outcomes." },
]

export default function PovertyPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-700">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Poverty Map</h1>
        </div>
        <p className="text-sm text-muted-foreground">Who lives in poverty in Canada, what the different poverty measures mean, what programs exist, and what the evidence says actually reduces poverty.</p>
      </div>

      <Card className="border-2 border-slate-200 bg-slate-50/40">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-slate-900">National headline: ~11% of Canadians live in poverty</p>
          <p className="text-sm text-slate-600 mt-1">That's roughly 4.2 million people. The rate fell sharply after the 2016 Canada Child Benefit redesign and CERB (2020). It has risen slightly since 2021 due to housing costs and inflation. The number masks enormous variation by demographic group and region.</p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-4 w-4 text-slate-600" />
          <p className="text-sm font-semibold">How Canada Measures Poverty</p>
        </div>
        <div className="space-y-2">
          {MEASURES.map((m, i) => {
            const key = `measure-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-sm font-semibold">{m.name}</span>
                      <Badge className={cn("text-xs", m.statusColor)}>{m.status}</Badge>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pb-3 pt-2 border-t space-y-2">
                      <p className="text-sm">{m.desc}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium">Current rate:</span> {m.rate2023}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-rose-600" />
          <p className="text-sm font-semibold">Poverty by Demographic Group</p>
        </div>
        <div className="space-y-2">
          {DEMOGRAPHICS.map((d, i) => {
            const key = `demo-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <div className="flex items-center gap-2 flex-wrap text-left">
                      <span className="text-sm font-semibold">{d.group}</span>
                      <Badge className={cn("text-xs", d.color)}>{d.rate}</Badge>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{d.context}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Programs That Exist</p>
        <div className="space-y-2">
          {PROGRAMS.map((p, i) => {
            const key = `prog-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <div className="text-left">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.type}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{p.desc}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">What the Evidence Shows</p>
        <div className="space-y-2">
          {EVIDENCE.map((e, i) => {
            const key = `ev-${i}`
            const isOpen = expanded === key
            return (
              <Card key={i} className="border border-emerald-100">
                <CardContent className="pt-0 pb-0">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-2">
                    <span className="text-sm font-semibold text-left">{e.finding}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <p className="text-sm text-muted-foreground pb-3 pt-2 border-t">{e.detail}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/canada" className="hover:underline text-foreground">Canada Overview</a>
        <a href="/canada/housing" className="hover:underline text-foreground">Housing</a>
        <a href="/canada/demographics" className="hover:underline text-foreground">Demographics</a>
        <a href="/canada/spending" className="hover:underline text-foreground">Federal Spending</a>
        <a href="/canada/benefits" className="hover:underline text-foreground">Benefits</a>
      </div>
    </div>
  )
}
