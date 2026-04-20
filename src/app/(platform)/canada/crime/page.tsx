"use client"

import { useState } from "react"
import { Shield, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, ChevronDown, MapPin, Users, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CITY_CRIME = [
  { city: "Ottawa", csi: 57.2, violent: 66.8, property: 47.3, homicides: 1.2, trend: "stable", note: "Capital city. Below national average. Government employment provides economic stability." },
  { city: "Toronto", csi: 60.3, violent: 72.1, property: 52.7, homicides: 2.1, trend: "rising", note: "Gun violence concentrated in specific neighborhoods. Most of city is very safe. Auto theft surging (2023-24)." },
  { city: "Montreal", csi: 62.1, violent: 68.5, property: 55.2, homicides: 1.5, trend: "stable", note: "Historically lower crime than Toronto/Vancouver. Some organized crime presence." },
  { city: "Vancouver", csi: 86.4, violent: 92.3, property: 81.7, homicides: 2.5, trend: "rising", note: "Highest property crime of any major city. Drug crisis drives much of the crime. Downtown Eastside is ground zero." },
  { city: "Calgary", csi: 75.8, violent: 82.1, property: 68.4, homicides: 2.3, trend: "rising", note: "Rising with population growth. Property crime up significantly since 2019." },
  { city: "Edmonton", csi: 107.8, violent: 128.9, property: 89.2, homicides: 3.8, trend: "rising", note: "Highest crime rate of any major Canadian city. Violent crime well above national average. Poverty and drug use are primary drivers." },
  { city: "Winnipeg", csi: 119.3, violent: 155.2, property: 93.1, homicides: 4.5, trend: "high", note: "Highest violent crime rate in Canada. Deep poverty, methamphetamine crisis, and gang activity. North End and downtown most affected." },
  { city: "Saskatoon", csi: 112.5, violent: 138.6, property: 88.4, homicides: 3.2, trend: "high", note: "High crime correlated with poverty, substance abuse, and inadequate social services." },
  { city: "Halifax", csi: 70.2, violent: 78.4, property: 62.1, homicides: 1.8, trend: "rising", note: "Rising from historically low base. Growing population bringing growing pains." },
  { city: "National Average", csi: 73.7, violent: 82.3, property: 63.8, homicides: 2.0, trend: "rising", note: "CSI has risen 5 consecutive years (2019-2023). First sustained increase since the mid-1990s." },
]

const WHAT_ACTUALLY_WORKS = [
  {
    approach: "Economic opportunity in high-crime areas",
    evidence: "Every 1% drop in unemployment reduces property crime by 1-2% and violent crime by 0.5-1%. The strongest predictor of crime is economic despair — not policing levels.",
    examples: "Richmond, VA reduced violent crime 40% by investing in job training + community development in high-crime neighborhoods. Canada's Youth Employment Strategy in Indigenous communities showed similar results where implemented.",
    cost: "$$ — but every $1 spent on prevention saves $4-7 in policing, courts, and incarceration.",
  },
  {
    approach: "Addressing addiction and mental health",
    evidence: "70%+ of property crime is committed by people with substance use disorders. Drug treatment courts reduce reoffending by 40-60% vs incarceration. BC's overdose crisis drives both crime AND victimization.",
    examples: "Portugal decriminalized ALL drugs in 2001 and invested in treatment. Result: drug use down 50%, drug-related crime down 60%, HIV from drug use down 95%. But: they invested heavily in TREATMENT — decriminalization alone (without treatment) does not work (as BC learned).",
    cost: "Treatment: $8,000-$15,000/person. Incarceration: $120,000/person/year. Treatment is 8-15x cheaper AND more effective.",
  },
  {
    approach: "Community design (CPTED)",
    evidence: "Crime Prevention Through Environmental Design — how streets, buildings, and parks are designed affects crime rates by 30-50%. Well-lit streets, visible storefronts, maintained public spaces, mixed-use neighborhoods = less crime.",
    examples: "Regent Park (Toronto) was redesigned from isolated public housing towers to mixed-income, mixed-use neighborhood. Crime dropped 30%+ without increasing police presence. The design itself prevents crime.",
    cost: "$ — often costs the same or less than traditional development. Just requires intentional design.",
  },
  {
    approach: "Targeted policing (hot spots)",
    evidence: "5% of street addresses generate 50%+ of crime calls. Focusing police resources on these specific locations (not entire neighborhoods) reduces crime 15-30% without displacing it elsewhere.",
    examples: "Hamilton Police hot-spot policing pilot: 15% reduction in violent crime in target areas. No increase in surrounding areas. Evidence from 80+ studies globally supports this approach.",
    cost: "$ — reallocates existing resources rather than requiring new spending.",
  },
  {
    approach: "After-school and youth programs",
    evidence: "The peak hours for juvenile crime are 3pm-6pm (after school, before parents get home). Every dollar spent on after-school programs returns $3-8 in reduced crime, court, and incarceration costs.",
    examples: "Pathways to Education (Canada): dropout rates cut by 75%, crime involvement cut by 50% in participating communities. Costs $3,500/student/year. Youth incarceration costs $250,000+/year.",
    cost: "$3,500/student/year for prevention vs $250,000/year for incarceration. 70x ROI.",
  },
  {
    approach: "Border enforcement (illegal firearms)",
    evidence: "70-95% of crime guns in Canada are smuggled from the US. The supply enters through the border — not from licensed Canadian gun owners. Yet Canada has spent billions on domestic gun control while border enforcement receives a fraction of that investment.",
    examples: "CBSA seizes 300-500 firearms at the border annually but estimates this is 5-10% of total smuggled. The US has 400M+ civilian firearms — the supply is essentially infinite. Detection technology (X-ray, backscatter) at border crossings is the most effective intervention.",
    cost: "$1-2B for comprehensive border scanning technology. Compare to $5B+ estimated cost of the firearms buyback program targeting legal owners.",
  },
]

const WHAT_DOESNT_WORK = [
  { approach: "Banning legally registered firearms from licensed owners", why: "97% of gun crime uses illegal firearms. Licensed gun owners commit crime at 1/3 the rate of the general population. The $5B+ buyback targets the wrong group entirely. Politically visible but statistically meaningless." },
  { approach: "Longer prison sentences alone", why: "Incarceration costs $120K+/person/year. Recidivism rate after prison: 40-60%. After treatment + community support: 15-25%. Locking people up without addressing the root cause produces a revolving door." },
  { approach: "Decriminalization without treatment (BC model)", why: "BC decriminalized small amounts of drugs in 2023. Overdose deaths continued rising. Crime did not decrease. Without investment in treatment, decriminalization just normalizes use without providing help. Portugal's success was TREATMENT, not just decriminalization." },
  { approach: "Defunding police", why: "Reducing police presence in high-crime areas leads to increased crime (as seen in multiple US cities, 2020-2022). The answer is not less policing — it is SMARTER policing + community investment. Both/and, not either/or." },
]

export default function CanadaCrimePage() {
  const [expandedWorks, setExpandedWorks] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-red-700">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Crime & Public Safety</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Real crime data by city. What actually reduces crime (and what is just political theatre).
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Trend</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada's <Explain tip="The Crime Severity Index measures both the VOLUME and SEVERITY of crime. A CSI of 100 means the same level as the baseline year (2006). Above 100 = more crime than 2006. Below 100 = less. It weights violent crimes more heavily than property crimes.">Crime Severity Index</Explain> (CSI)
            has risen for <strong>5 consecutive years</strong> (2019-2023) — the first sustained increase since the 1990s.
            Violent crime is up 30%+ since 2014. Auto theft doubled in 2 years. The causes are not mysterious:
            economic inequality, addiction crisis, housing instability, and inadequate social supports.
            The solutions are not mysterious either — they are just not the ones politicians talk about.
          </p>
        </CardContent>
      </Card>

      {/* City comparison */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" /> Crime by City (Crime Severity Index)
        </CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {CITY_CRIME.map((c, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5",
              c.csi > 100 ? "border-red-200 bg-red-50/10" :
              c.csi > 75 ? "border-amber-200 bg-amber-50/10" : "border-emerald-200 bg-emerald-50/10"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn("text-sm font-medium", c.city === "National Average" && "italic")}>{c.city}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn("text-[9px]",
                    c.csi > 100 ? "text-red-500 border-red-300" :
                    c.csi > 75 ? "text-amber-600 border-amber-300" : "text-emerald-600 border-emerald-300"
                  )}>CSI: {c.csi}</Badge>
                  <Badge variant="outline" className={cn("text-[9px]",
                    c.trend === "rising" ? "text-red-500 border-red-300" :
                    c.trend === "high" ? "text-red-600 border-red-300" : "text-blue-600 border-blue-300"
                  )}>{c.trend}</Badge>
                </div>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>Violent: {c.violent}</span>
                <span>Property: {c.property}</span>
                <span>Homicides: {c.homicides}/100K</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What works */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-700">
          <Shield className="h-5 w-5" /> What Actually Reduces Crime (Evidence-Based)
        </h2>
        <div className="space-y-3">
          {WHAT_ACTUALLY_WORKS.map((w, i) => {
            const isOpen = expandedWorks === i
            return (
              <Card key={i} className="border-emerald-200 card-hover cursor-pointer" onClick={() => setExpandedWorks(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p className="text-sm font-semibold flex-1">{w.approach}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground"><strong>Evidence:</strong> {w.evidence}</p>
                      <p className="text-xs text-emerald-700"><strong>Examples:</strong> {w.examples}</p>
                      <p className="text-xs text-blue-700"><strong>Cost:</strong> {w.cost}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* What doesn't work */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" /> What Does NOT Work (Despite Political Claims)
        </h2>
        <div className="space-y-2">
          {WHAT_DOESNT_WORK.map((w, i) => (
            <Card key={i} className="border-red-200 bg-red-50/10">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-red-700 mb-1">{w.approach}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{w.why}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Statistics Canada (Uniform Crime Reporting Survey), Canadian Centre for Justice Statistics,
            Crime Severity Index data, Juristat publications, RCMP annual reports, municipal police reports.
            International evidence from: Portugal drug policy evaluation, US hot-spot policing studies, UK CPTED research.
            This page presents evidence from criminology research, not political talking points.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/trajectories" className="text-sm text-emerald-600 hover:underline">Trajectories</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/promise-tracker" className="text-sm text-blue-600 hover:underline">Promise Tracker</a>
        <a href="/community-resources" className="text-sm text-rose-600 hover:underline">Community Resources</a>
      </div>
    </div>
  )
}
