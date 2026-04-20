"use client"

import { useState } from "react"
import { Wrench, AlertTriangle, ArrowRight, ChevronDown, DollarSign, Droplets, Zap, Car, Train, Wifi, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const SECTORS: {
  sector: string
  icon: any
  grade: string
  deficit: string
  condition: string
  details: string[]
  solution: string
}[] = [
  {
    sector: "Roads & Bridges",
    icon: Car,
    grade: "C",
    deficit: "$115B+ deferred maintenance",
    condition: "40% of municipal roads rated 'fair' or 'poor'. 25% of bridges are 50+ years old and need major rehabilitation or replacement.",
    details: [
      "Canada has 1.1M km of roads. 38,000 bridges. Much was built in the 1960s-70s infrastructure boom and is now reaching end-of-life.",
      "The Champlain Bridge (Montreal) had to be emergency-replaced — it was literally crumbling. Cost: $4.2B. This is what happens when maintenance is deferred.",
      "Potholes cost Canadian drivers $3B/year in vehicle damage. A $1 pothole repair prevents $10-$30 in vehicle damage.",
      "Winter makes everything worse — freeze-thaw cycles accelerate deterioration. Canada's roads degrade faster than those in milder climates.",
    ],
    solution: "Increase municipal infrastructure funding by $5B/year (from federal gas tax transfers). Prioritize repair over new construction — maintaining what we have is cheaper than building new. Asset management systems to track condition and prioritize spending by need.",
  },
  {
    sector: "Water & Wastewater",
    icon: Droplets,
    grade: "C-",
    deficit: "$80-100B+ needed over 10 years",
    condition: "30+ Indigenous communities under boil water advisories. Many urban water systems are 80-100 years old. Lead service lines still exist in Montreal, Toronto, and other cities.",
    details: [
      "Canada has the most freshwater of any country but some of the oldest water infrastructure in the developed world.",
      "Flint, Michigan was the wake-up call for the US. Canada has DOZENS of communities with similar or worse water quality — most are Indigenous.",
      "Montreal's water mains break 1,200+ times per year. Each break costs $50K-$500K in emergency repair + road damage + property damage.",
      "Wastewater: Victoria, BC dumped raw sewage into the ocean until 2020. Other municipalities have combined sewer systems that overflow into waterways during storms.",
    ],
    solution: "Federal clean water guarantee: every community has safe drinking water within 3 years. This is achievable — the cost is ~$3-5B total (less than the Phoenix Pay System). Replace lead service lines in every city (Montral, Toronto lead pipe replacement programs exist but are too slow). Separate storm and sanitary sewers in combined systems.",
  },
  {
    sector: "Public Transit",
    icon: Train,
    grade: "D+",
    deficit: "$50B+ in expansion + maintenance backlog",
    condition: "Only 6 cities have rapid transit (subway/LRT). Most Canadians have no viable alternative to driving. Transit ridership fell 30-50% during COVID and has not fully recovered.",
    details: [
      "Toronto's Line 1 (Yonge-University) was designed for 800,000 daily riders. It carries 1M+. It is at 130% capacity.",
      "Canada has 1/5th the rapid transit per capita of comparable European cities. Most Canadian cities were built for cars, not people.",
      "Ottawa's LRT (Confederation Line): $2.1B system that broke down repeatedly in its first year. Doors froze, axles cracked, software failed. Emblematic of Canadian infrastructure procurement.",
      "Vancouver's SkyTrain is the success story — but even it is at capacity. Broadway Extension was 10 years in planning for 5 km of track.",
      "Rural Canada has essentially zero public transit. No bus, no train, no alternative to a car.",
    ],
    solution: "National transit strategy (Canada is the only G7 country without one). Dedicated federal transit fund ($5B/year). Priority: connect suburbs to city cores (where most people commute). Electric bus rapid transit (BRT) is 1/10th the cost of subway and can be built in 2 years, not 20. Intercity rail: Toronto-Montreal in 3 hours (currently 5+) would transform the corridor.",
  },
  {
    sector: "Broadband & Digital",
    icon: Wifi,
    grade: "C+",
    deficit: "$10-15B to reach universal coverage",
    condition: "87% of Canadians have access to 50/10 Mbps broadband. The other 13% (mostly rural and Indigenous) have little or no reliable internet. This is a participation gap, not just a convenience gap.",
    details: [
      "In 2026, not having internet is like not having a phone in 1990 — it excludes you from the economy, education, healthcare (telehealth), and government services.",
      "Rural internet in Canada: often satellite-only, 5-25 Mbps, $100+/month, data-capped. Urban internet: 150+ Mbps, $80-100/month, unlimited.",
      "Starlink has changed the game for some rural areas — but at $140/month + $800 equipment, it is expensive for low-income families.",
      "The CRTC declared 50/10 Mbps as the basic service objective in 2016. Eight years later, 13% of Canadians still don't have it.",
    ],
    solution: "Treat broadband as essential infrastructure (like water and electricity). Municipal broadband programs (Olds, AB built gigabit fiber for $60/month — proof it can be done). Subsidize rural connectivity through the Universal Broadband Fund (increase from $2.75B to $5B). Open telecom networks to competition.",
  },
  {
    sector: "Housing Stock",
    icon: Building2,
    grade: "D",
    deficit: "3.5M homes short (CMHC)",
    condition: "Canada needs 5.8M new homes by 2030 to restore affordability. Building 225K/year. At current pace, the deficit GROWS every year. This is a national emergency that is being treated as a policy discussion.",
    details: [
      "Canada has the fewest housing units per capita of any G7 country (424 per 1,000 people vs 480+ in France, Germany, UK).",
      "The average age of Canadian housing stock is increasing. 30% of homes were built before 1970 and need major renovation.",
      "Energy efficiency: most existing homes are poorly insulated by modern standards. Heating costs are 2-3x what they would be with proper insulation.",
      "The construction industry cannot find enough workers — skilled trades shortage means even funded projects face delays.",
    ],
    solution: "See the Housing Crisis page for comprehensive solutions. Short version: upzone everywhere, build government rental housing, modular housing factories, train 100K+ trades workers, tie immigration to housing starts.",
  },
  {
    sector: "Energy Grid",
    icon: Zap,
    grade: "B-",
    deficit: "$35B+ for grid modernization",
    condition: "Canada's electricity grid is generally reliable but aging and not interconnected. Atlantic Canada imports Saudi oil while Alberta has surplus. Quebec has cheap hydro that Ontario needs. East-west energy trade barely exists.",
    details: [
      "Canada has a north-south energy relationship (provinces sell to US states) but almost no east-west (province to province) trade.",
      "Quebec's hydro surplus could replace Ontario's natural gas plants — reducing emissions AND costs. The transmission lines don't exist.",
      "Atlantic Canada burns imported oil and coal for heat and electricity while Quebec has clean hydro surplus 200 km away.",
      "Alberta's grid nearly collapsed during a cold snap in January 2024 — rolling blackouts were narrowly avoided. The grid was not designed for extreme weather that is becoming common.",
    ],
    solution: "National energy grid interconnection (east-west HVDC transmission lines). Quebec hydro → Ontario/Atlantic. BC hydro → Alberta. Nuclear expansion in Ontario + Saskatchewan (SMRs). Grid modernization for electric vehicle charging + heat pump adoption. Energy storage (batteries, pumped hydro).",
  },
]

export default function CanadaInfrastructurePage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const totalDeficit = "$400B+"
  const avgGrade = "C-"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-slate-700">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Infrastructure Report Card</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The systems that keep the country running — and how badly they need repair. Grade: {avgGrade}. Deficit: {totalDeficit}.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Infrastructure Deficit</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada's <Explain tip="The total cost of all maintenance, repair, and upgrades that should have been done but were deferred to save money in the short term. It compounds — every year of delay makes the eventual cost higher">infrastructure deficit</Explain> exceeds
            <strong> $400 billion</strong>. This is the accumulated cost of decades of deferred maintenance — governments choosing to
            cut ribbons on new projects instead of maintaining what already exists. A bridge that costs $5M to maintain
            costs $50M to replace when it fails. Canada has chosen the $50M option for 30+ years across every sector.
          </p>
        </CardContent>
      </Card>

      {/* Grade summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {SECTORS.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className={cn("cursor-pointer", s.grade.includes("D") ? "border-red-200" : s.grade.includes("C") ? "border-amber-200" : "border-blue-200")}
              onClick={() => setExpanded(expanded === i ? null : i)}>
              <CardContent className="p-2 text-center">
                <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className={cn("text-lg font-bold",
                  s.grade.includes("D") ? "text-red-500" : s.grade.includes("C") ? "text-amber-600" : "text-blue-600"
                )}>{s.grade}</p>
                <p className="text-[9px] text-muted-foreground">{s.sector}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sector details */}
      <div className="space-y-3">
        {SECTORS.map((s, i) => {
          const Icon = s.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{s.sector}</p>
                      <Badge variant="outline" className={cn("text-xs",
                        s.grade.includes("D") ? "text-red-500 border-red-300" :
                        s.grade.includes("C") ? "text-amber-600 border-amber-300" : "text-blue-600 border-blue-300"
                      )}>{s.grade}</Badge>
                    </div>
                    <p className="text-[10px] text-red-500">{s.deficit}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 space-y-2 pl-8">
                    <p className="text-xs text-muted-foreground"><strong>Condition:</strong> {s.condition}</p>
                    <ul className="space-y-1">
                      {s.details.map((d, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /><span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                      <p className="text-xs text-emerald-700"><strong>Solution:</strong> {s.solution}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Canadian Infrastructure Report Card (2019), FCM (Federation of Canadian Municipalities),
            CMHC, Canadian Urban Transit Association, CRTC Broadband Report, Canadian Electricity Association,
            Parliamentary Budget Officer infrastructure assessments, and provincial asset management reports.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/canada/blueprint" className="text-sm text-emerald-600 hover:underline">Blueprint</a>
      </div>
    </div>
  )
}
