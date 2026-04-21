"use client"

import { useState } from "react"
import {
  Users, TrendingUp, Home, Heart, AlertTriangle, ArrowRight,
  ChevronDown, Globe2, DollarSign, GraduationCap, Briefcase
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { AletheiaConnection } from "@/components/AletheiaConnection"

const NUMBERS = [
  { year: "2015", permanent: 271845, temporary: 350000, total: 621845, housing: 195000, note: "Pre-Trudeau baseline. Immigration roughly matched housing capacity." },
  { year: "2016", permanent: 296346, temporary: 370000, total: 666346, housing: 198000, note: "Targets increase begins." },
  { year: "2019", permanent: 341180, temporary: 580000, total: 921180, housing: 209000, note: "Temporary residents surge. Housing starts not keeping pace." },
  { year: "2021", permanent: 405330, temporary: 610000, total: 1015330, housing: 271000, note: "Post-COVID catch-up. Record permanent + temp. Housing has best year but still falls short." },
  { year: "2022", permanent: 437180, temporary: 810000, total: 1247180, housing: 262000, note: "Population grows by 1M+ in a single year. Housing deficit accelerates dramatically." },
  { year: "2023", permanent: 471550, temporary: 850000, total: 1321550, housing: 240000, note: "1.3M new residents vs 240K homes built. The math is impossible. Every new resident needs housing that doesn't exist." },
  { year: "2024", permanent: 485000, temporary: 700000, total: 1185000, housing: 225000, note: "Government announces cuts to temporary residents. Too little, too late — deficit is already 1.5M+ homes." },
]

const CATEGORIES = [
  {
    type: "Permanent Residents",
    annual: "~485,000 (2024)",
    breakdown: [
      { stream: "Economic Class", pct: "58%", desc: "Skilled workers, provincial nominees, Canadian Experience Class. These are the immigrants Canada CHOOSES based on skills." },
      { stream: "Family Class", pct: "24%", desc: "Spouses, parents, grandparents of existing residents. Family reunification — emotionally important, economically neutral." },
      { stream: "Refugees", pct: "15%", desc: "Protected persons and resettled refugees. Canada's humanitarian commitment. Important for global reputation." },
      { stream: "Other", pct: "3%", desc: "Humanitarian, compassionate, and other grounds." },
    ],
  },
  {
    type: "Temporary Residents",
    annual: "~700,000-850,000 (varies)",
    breakdown: [
      { stream: "International Students", pct: "50%+", desc: "~800,000 study permits active. Many use education as a pathway to PR. Colleges have become immigration businesses — enrolling students in programs designed for PR pathway, not education. Some 'colleges' are diploma mills." },
      { stream: "Temporary Foreign Workers (TFW)", pct: "30%", desc: "Hired when employers claim 'no Canadians available.' Critics argue many could fill these jobs if wages were higher. The program suppresses wages in hospitality, agriculture, food service." },
      { stream: "Work Permit Holders", pct: "20%", desc: "Post-graduation work permits, spousal permits, open work permits. Many transition to permanent residence." },
    ],
  },
]

const IMPACT = [
  {
    area: "Housing",
    icon: Home,
    data: "Canada needs 3.5M additional homes by 2030 to restore affordability (CMHC). Currently building 225K/year. At current rates, the deficit GROWS by 500K-800K/year.",
    connection: "Every new resident needs housing. 1.3M new residents in 2023 vs 240K homes built = 1.06M people competing for existing housing. This is the primary driver of rent increases and home price inflation in major cities.",
    solution: "Tie immigration targets to housing starts. Formula: for every X homes built, admit Y newcomers. Currently there is ZERO coordination between immigration policy (federal) and housing capacity (municipal/provincial).",
  },
  {
    area: "Healthcare",
    icon: Heart,
    data: "6.5M Canadians have no family doctor. Wait times are the worst in the OECD. Every new resident needs a doctor that doesn't exist.",
    connection: "Ontario alone needs 3,000+ new family doctors. Adding 500K+ people per year to a system that is already failing means wait times get worse for EVERYONE — newcomers and existing residents alike.",
    solution: "Fast-track foreign-trained doctors. A doctor who practiced in India, Nigeria, or the Philippines for 10 years should not wait 5-7 years to practice in Canada. Credential recognition is the bottleneck, not talent supply.",
  },
  {
    area: "Wages",
    icon: DollarSign,
    data: "Temporary Foreign Worker program allows employers to hire at lower wages. Sectors with high TFW use (food service, hospitality, agriculture) have the lowest wage growth.",
    connection: "When employers can hire TFWs at minimum wage instead of raising wages to attract Canadian workers, wages stagnate. This is not the workers' fault — it is a program design that benefits employers at the expense of both Canadian and foreign workers.",
    solution: "Require TFW wages to be 20% ABOVE median for the role (not at or below). If the job truly has no Canadian applicants at competitive wages, the premium is worth it. If Canadians would do the job at fair pay, the TFW request should be denied.",
  },
  {
    area: "Infrastructure",
    icon: AlertTriangle,
    data: "Transit, roads, schools, water systems — all designed for a smaller population. Adding 1M+ people per year to cities that take 5-10 years to build a transit line creates permanent congestion.",
    connection: "Toronto's subway was designed for 2M people. The GTA has 7M+. Vancouver's SkyTrain, Montreal's metro, Ottawa's LRT — all at or beyond capacity. Schools in Surrey, Brampton, and Scarborough are in portables.",
    solution: "Infrastructure investment BEFORE population growth, not after. Pre-build transit, schools, and water capacity. Tie immigration targets to infrastructure readiness.",
  },
  {
    area: "Education",
    icon: GraduationCap,
    data: "International students: ~800K active permits. Many attend 'designated learning institutions' that are essentially diploma mills — low-quality education designed as an immigration pathway, not for learning.",
    connection: "The international student program has been exploited by both institutions (revenue) and applicants (PR pathway). This devalues Canadian educational credentials, strains services, and creates a two-tier education system.",
    solution: "Cap international student enrollment at quality institutions only. Eliminate diploma mill designation. Require genuine educational outcomes. Students who complete quality programs should have a streamlined PR path — those at diploma mills should not.",
  },
  {
    area: "Labour Market",
    icon: Briefcase,
    data: "Unemployment: 6.4% (2024). Youth unemployment: 13%+. Despite this, the government claims 'labour shortages' justify high immigration. The shortage is often in wages, not workers.",
    connection: "In a genuinely free labour market, shortages are solved by raising wages. When the government provides unlimited low-cost foreign labour, employers never need to raise wages. The result: wage suppression disguised as 'filling shortages.'",
    solution: "Distinguish between genuine shortages (healthcare, trades) and wage shortages (fast food, hospitality). For genuine shortages: fast-track immigration. For wage shortages: let market forces work — higher wages attract workers.",
  },
]

const HONEST_TAKE = [
  "Immigration is NOT the problem. BAD PLANNING around immigration is the problem.",
  "Canada NEEDS immigration — the birth rate (1.33) means the population shrinks without it. The question is not whether to immigrate but HOW MANY and at WHAT PACE.",
  "Most immigrants are hardworking people who contribute enormously to Canada. Blaming them for systemic failures (housing, healthcare) is wrong and unproductive.",
  "The system fails BOTH existing residents AND newcomers. A family that immigrates to Canada expecting affordable housing and healthcare finds neither.",
  "The solution is not 'stop immigration' — it is 'match immigration to capacity.' Build the infrastructure FIRST, then welcome people into a system that can serve them.",
  "Every country that handles immigration well (Australia, New Zealand) uses a points-based system AND ties numbers to economic capacity. Canada has the points system but ignores the capacity constraint.",
  "This is not a left vs right issue. Progressives should care because overcapacity hurts the vulnerable most. Conservatives should care because it suppresses wages and strains services. Everyone should care because it affects housing, healthcare, and quality of life for ALL Canadians.",
]

export default function CanadaImmigrationPage() {
  const [expandedImpact, setExpandedImpact] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Immigration Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The honest numbers. Not anti-immigration — anti-bad-planning. The data nobody presents without spin.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Core Problem</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In 2023, Canada added <strong>1.3 million residents</strong> (permanent + temporary). In the same year,
            Canada built <strong>240,000 homes</strong>. That is a deficit of over <strong>1 million housing units in a single year</strong>.
            The same math applies to doctors, school seats, transit capacity, and water infrastructure. The issue
            is not whether immigration is good — it is whether the pace matches the capacity to absorb. Right now, it does not.
          </p>
        </CardContent>
      </Card>

      {/* Numbers by year */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Immigration vs Housing Capacity (2015-2024)</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {NUMBERS.map((n, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5",
              n.total - n.housing * 4 > 500000 ? "border-red-200 bg-red-50/10" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-bold">{n.year}</span>
                <div className="flex gap-3 text-xs">
                  <span>Newcomers: <strong>{n.total.toLocaleString()}</strong></span>
                  <span>Homes built: <strong>{n.housing.toLocaleString()}</strong></span>
                  <span className={cn("font-bold", n.total > n.housing * 3 ? "text-red-500" : "text-amber-600")}>
                    Gap: {(n.total - n.housing).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{n.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{cat.type}</p>
                <Badge variant="outline" className="text-xs">{cat.annual}</Badge>
              </div>
              <div className="space-y-1.5">
                {cat.breakdown.map((b, j) => (
                  <div key={j} className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-[9px] shrink-0 w-10 justify-center">{b.pct}</Badge>
                    <div>
                      <span className="font-medium">{b.stream}:</span>{" "}
                      <span className="text-muted-foreground">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Impact areas */}
      <div>
        <h2 className="text-lg font-bold mb-3">Impact on Canadian Systems</h2>
        <div className="space-y-3">
          {IMPACT.map((imp, i) => {
            const Icon = imp.icon
            const isOpen = expandedImpact === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedImpact(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm font-semibold flex-1">{imp.area}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-8">
                      <p className="text-xs text-muted-foreground"><strong>Data:</strong> {imp.data}</p>
                      <p className="text-xs text-amber-700"><strong>Connection:</strong> {imp.connection}</p>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                        <p className="text-xs text-emerald-700"><strong>Solution:</strong> {imp.solution}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* The honest take */}
      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-blue-900 mb-2">The Honest Take — Both Sides</p>
          <ul className="space-y-1.5">
            {HONEST_TAKE.map((point, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <ArrowRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" /><span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> IRCC (Immigration, Refugees and Citizenship Canada) annual reports, Statistics Canada
            population estimates, CMHC housing starts data, CIHI healthcare data, StatsCan Labour Force Survey.
            This page presents data without political labels. The numbers speak for themselves.
          </p>
        </CardContent>
      </Card>

      <AletheiaConnection topic="immigration" />

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/housing" className="text-sm text-orange-600 hover:underline">Housing Crisis</a>
        <a href="/canada/healthcare" className="text-sm text-rose-600 hover:underline">Healthcare</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/workforce" className="text-sm text-blue-600 hover:underline">Workforce Analytics</a>
      </div>
    </div>
  )
}
