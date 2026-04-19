"use client"

import { useState } from "react"
import { Users, TrendingUp, TrendingDown, AlertTriangle, GraduationCap, BarChart3, Globe2, Baby, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Real data from BLS, Census Bureau, and industry reports
const WORKFORCE_DATA = [
  {
    career: "Plumbing",
    category: "Trades",
    avgAge: 55,
    retiringSoon: "47% of plumbers are over 55",
    currentWorkers: 500000,
    projectedShortage: 200000,
    timeframe: "by 2030",
    avgSalary: "$60,000 - $90,000",
    topEarners: "$100,000+",
    studentEnrollment: "Declining 3% annually",
    completionRate: "62%",
    demandTrend: "rising",
    insight: "Massive shortage incoming. Average age is 55. Retirement wave starts now. New construction + aging infrastructure = decades of guaranteed work. Apprenticeships pay while you learn.",
    urgency: "critical",
  },
  {
    career: "Electrician",
    category: "Trades",
    avgAge: 52,
    retiringSoon: "42% over 55",
    currentWorkers: 740000,
    projectedShortage: 300000,
    timeframe: "by 2031",
    avgSalary: "$62,000 - $95,000",
    topEarners: "$100,000+ (solar/EV specialists)",
    studentEnrollment: "Flat",
    completionRate: "58%",
    demandTrend: "rising",
    insight: "EV charging, solar installation, smart homes — every new technology needs electricians. Add solar certification and your rate doubles. The energy transition guarantees demand for 30+ years.",
    urgency: "critical",
  },
  {
    career: "Welding",
    category: "Trades",
    avgAge: 54,
    retiringSoon: "44% over 55",
    currentWorkers: 430000,
    projectedShortage: 175000,
    timeframe: "by 2029",
    avgSalary: "$48,000 - $75,000",
    topEarners: "$120,000+ (underwater/pipeline)",
    studentEnrollment: "Declining 5% annually",
    completionRate: "55%",
    demandTrend: "rising",
    insight: "Infrastructure bill guarantees work. Underwater welders and pipeline specialists earn $100K+. Robotic welding is growing but skilled manual welders remain essential for custom and repair work.",
    urgency: "critical",
  },
  {
    career: "Nursing",
    category: "Healthcare",
    avgAge: 44,
    retiringSoon: "28% over 55",
    currentWorkers: 3100000,
    projectedShortage: 500000,
    timeframe: "by 2030",
    avgSalary: "$65,000 - $95,000",
    topEarners: "$120,000+ (nurse practitioners)",
    studentEnrollment: "Growing but not fast enough",
    completionRate: "72%",
    demandTrend: "rising",
    insight: "Aging population + pandemic burnout = massive shortage. Nurse practitioners can practice independently in many states. Travel nurses earn $2,000+/week. Healthcare is recession-proof.",
    urgency: "high",
  },
  {
    career: "Software Engineering",
    category: "Technology",
    avgAge: 33,
    retiringSoon: "8% over 55",
    currentWorkers: 1850000,
    projectedShortage: -200000,
    timeframe: "by 2030 (oversupply in entry-level)",
    avgSalary: "$90,000 - $150,000",
    topEarners: "$300,000+ (senior/FAANG)",
    studentEnrollment: "Growing 15% annually",
    completionRate: "45% (bootcamp), 65% (degree)",
    demandTrend: "mixed",
    insight: "Entry-level is getting crowded. Mid and senior roles still in massive demand. AI changes what developers do but does not eliminate the role. Specialize early — AI/ML, security, blockchain, or embedded systems.",
    urgency: "moderate",
  },
  {
    career: "HVAC Technician",
    category: "Trades",
    avgAge: 53,
    retiringSoon: "40% over 55",
    currentWorkers: 390000,
    projectedShortage: 150000,
    timeframe: "by 2031",
    avgSalary: "$52,000 - $80,000",
    topEarners: "$95,000+ (commercial)",
    studentEnrollment: "Declining 4% annually",
    completionRate: "60%",
    demandTrend: "rising",
    insight: "Heat pumps are replacing gas furnaces everywhere — government incentives guarantee demand. Climate change = more AC demand. Every building needs HVAC. Cannot be outsourced or automated.",
    urgency: "critical",
  },
  {
    career: "Truck Driving (CDL)",
    category: "Transportation",
    avgAge: 55,
    retiringSoon: "50% over 55",
    currentWorkers: 3500000,
    projectedShortage: 160000,
    timeframe: "by 2030",
    avgSalary: "$50,000 - $75,000",
    topEarners: "$95,000+ (specialized/owner-operator)",
    studentEnrollment: "Declining",
    completionRate: "70%",
    demandTrend: "declining long-term",
    insight: "Short-term shortage is real — but autonomous trucks are coming. Best strategy: specialize in last-mile delivery or hazmat which are hardest to automate. Owner-operators earn more but carry risk.",
    urgency: "high",
  },
  {
    career: "Cybersecurity",
    category: "Technology",
    avgAge: 38,
    retiringSoon: "12% over 55",
    currentWorkers: 750000,
    projectedShortage: 350000,
    timeframe: "by 2028",
    avgSalary: "$95,000 - $145,000",
    topEarners: "$200,000+ (CISO)",
    studentEnrollment: "Growing 25% annually",
    completionRate: "55%",
    demandTrend: "rising",
    insight: "3.5 million unfilled positions globally. Every company needs security. Certifications (CISSP, CEH) matter more than degrees. Cannot be fully automated — human judgment is essential.",
    urgency: "high",
  },
  {
    career: "Teaching (K-12)",
    category: "Education",
    avgAge: 42,
    retiringSoon: "25% over 55",
    currentWorkers: 3700000,
    projectedShortage: 300000,
    timeframe: "by 2028",
    avgSalary: "$45,000 - $70,000",
    topEarners: "$85,000+ (admin/specialized)",
    studentEnrollment: "Declining 8% annually",
    completionRate: "75%",
    demandTrend: "rising",
    insight: "Teacher shortage is a crisis. Math, science, and special education teachers are in extreme demand. Pay is improving in many states. Some districts now offer $60K+ starting salary and signing bonuses.",
    urgency: "high",
  },
  {
    career: "Carpentry",
    category: "Trades",
    avgAge: 49,
    retiringSoon: "35% over 55",
    currentWorkers: 730000,
    projectedShortage: 200000,
    timeframe: "by 2031",
    avgSalary: "$48,000 - $72,000",
    topEarners: "$90,000+ (finish/custom)",
    studentEnrollment: "Declining 6% annually",
    completionRate: "52%",
    demandTrend: "rising",
    insight: "Housing shortage means building demand for decades. Custom and finish carpenters command premium rates. General contractors who manage crews earn $100K+. Cannot be outsourced.",
    urgency: "high",
  },
]

// Demographic / birth rate data
const DEMOGRAPHIC_DATA = [
  { country: "United States", birthRate: 1.64, replacement: 2.1, trend: "declining", population2024: "336M", projected2050: "375M", note: "Below replacement since 1971. Immigration accounts for 80% of population growth." },
  { country: "Canada", birthRate: 1.33, replacement: 2.1, trend: "declining", population2024: "41M", projected2050: "49M", note: "Lowest birth rate in history. Relies heavily on immigration for workforce growth." },
  { country: "Japan", birthRate: 1.20, replacement: 2.1, trend: "declining", population2024: "124M", projected2050: "104M", note: "Shrinking population. 30% will be over 65 by 2030. Labor shortage across all sectors." },
  { country: "Germany", birthRate: 1.53, replacement: 2.1, trend: "stable", population2024: "84M", projected2050: "79M", note: "Aging workforce. Trades shortage acute. Immigration partially offsets decline." },
  { country: "South Korea", birthRate: 0.72, replacement: 2.1, trend: "declining", population2024: "52M", projected2050: "40M", note: "Lowest birth rate on Earth. Population will shrink 23% by 2050 without intervention." },
  { country: "Nigeria", birthRate: 5.10, replacement: 2.1, trend: "declining slowly", population2024: "230M", projected2050: "400M", note: "Youngest population on Earth. Median age 18. Massive workforce potential if education scales." },
  { country: "India", birthRate: 2.00, replacement: 2.1, trend: "declining", population2024: "1.44B", projected2050: "1.67B", note: "Now the most populous country. Approaching replacement rate. Massive young workforce." },
  { country: "Australia", birthRate: 1.58, replacement: 2.1, trend: "declining", population2024: "27M", projected2050: "33M", note: "Trades shortage severe. Immigration-dependent for growth. Mining and construction booming." },
  { country: "United Kingdom", birthRate: 1.49, replacement: 2.1, trend: "declining", population2024: "68M", projected2050: "72M", note: "Post-Brexit labor shortages in healthcare, agriculture, hospitality. Birth rate at historic low." },
  { country: "China", birthRate: 1.09, replacement: 2.1, trend: "declining rapidly", population2024: "1.41B", projected2050: "1.21B", note: "Population already shrinking. One-child policy legacy. Will lose 200M working-age people by 2050." },
]

const URGENCY_COLORS = {
  critical: "border-red-300 bg-red-50 text-red-700",
  high: "border-amber-300 bg-amber-50 text-amber-700",
  moderate: "border-blue-300 bg-blue-50 text-blue-700",
}

export default function WorkforcePage() {
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null)
  const [showDemographics, setShowDemographics] = useState(false)
  const [sortBy, setSortBy] = useState<"shortage" | "salary" | "urgency">("urgency")

  const sorted = [...WORKFORCE_DATA].sort((a, b) => {
    if (sortBy === "shortage") return b.projectedShortage - a.projectedShortage
    if (sortBy === "salary") return parseInt(b.avgSalary.replace(/\D/g, "")) - parseInt(a.avgSalary.replace(/\D/g, ""))
    const urgencyOrder = { critical: 3, high: 2, moderate: 1 }
    return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 0) - (urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 0)
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Workforce Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground">Labor shortages, demographic projections, and career demand data. Make decisions with data, not guesses.</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        <button onClick={() => setShowDemographics(false)}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", !showDemographics ? "bg-violet-100 text-violet-700" : "bg-muted text-muted-foreground")}>
          Career Shortages
        </button>
        <button onClick={() => setShowDemographics(true)}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", showDemographics ? "bg-violet-100 text-violet-700" : "bg-muted text-muted-foreground")}>
          Demographics & Birth Rates
        </button>
      </div>

      {!showDemographics ? (
        <>
          {/* Sort controls */}
          <div className="flex gap-2">
            <span className="text-xs text-muted-foreground mt-1">Sort by:</span>
            {[
              { value: "urgency", label: "Urgency" },
              { value: "shortage", label: "Biggest shortage" },
              { value: "salary", label: "Highest pay" },
            ].map(s => (
              <button key={s.value} onClick={() => setSortBy(s.value as any)}
                className={cn("text-xs rounded-full px-2 py-1 transition-colors", sortBy === s.value ? "bg-violet-100 text-violet-700" : "text-muted-foreground hover:bg-muted")}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Career cards */}
          <div className="space-y-3">
            {sorted.map(career => {
              const expanded = expandedCareer === career.career
              return (
                <Card key={career.career} className="card-hover cursor-pointer" onClick={() => setExpandedCareer(expanded ? null : career.career)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{career.career}</p>
                          <Badge variant="outline" className="text-[10px]">{career.category}</Badge>
                          <Badge variant="outline" className={cn("text-[10px]", URGENCY_COLORS[career.urgency as keyof typeof URGENCY_COLORS])}>
                            {career.urgency === "critical" ? "Critical shortage" : career.urgency === "high" ? "High demand" : "Moderate"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Avg age: {career.avgAge}</span>
                          <span>{career.retiringSoon}</span>
                          <span className="font-medium text-emerald-600">{career.avgSalary}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-lg font-bold", career.projectedShortage > 0 ? "text-red-500" : "text-amber-500")}>
                          {career.projectedShortage > 0 ? `-${(career.projectedShortage / 1000).toFixed(0)}K` : `+${(Math.abs(career.projectedShortage) / 1000).toFixed(0)}K`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{career.timeframe}</p>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-muted-foreground">Current workers:</span> <strong>{career.currentWorkers.toLocaleString()}</strong></div>
                          <div><span className="text-muted-foreground">Top earners:</span> <strong>{career.topEarners}</strong></div>
                          <div><span className="text-muted-foreground">Student enrollment:</span> <strong>{career.studentEnrollment}</strong></div>
                          <div><span className="text-muted-foreground">Completion rate:</span> <strong>{career.completionRate}</strong></div>
                        </div>
                        <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
                          <p className="text-sm text-violet-800 leading-relaxed">{career.insight}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Demographics */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Why birth rates matter for careers:</strong> A country with a 1.3 birth rate today will have
                40% fewer 20-year-olds entering the workforce in 20 years. That means labor shortages in EVERY field,
                not just trades. Countries below replacement rate (2.1) must either increase births, increase immigration,
                or automate — there is no fourth option.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {DEMOGRAPHIC_DATA.map(country => (
              <Card key={country.country} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{country.country}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Pop: {country.population2024}</span>
                        <span>2050: {country.projected2050}</span>
                        <span className="flex items-center gap-1">
                          {country.trend === "declining" || country.trend === "declining rapidly" ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                           country.trend === "declining slowly" ? <TrendingDown className="h-3 w-3 text-amber-500" /> :
                           <TrendingUp className="h-3 w-3 text-emerald-500" />}
                          {country.trend}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-2xl font-bold", country.birthRate >= 2.1 ? "text-emerald-600" : country.birthRate >= 1.5 ? "text-amber-600" : "text-red-600")}>
                        {country.birthRate}
                      </p>
                      <p className="text-[10px] text-muted-foreground">births/woman</p>
                      <p className="text-[10px] text-muted-foreground">(replacement: {country.replacement})</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{country.note}</p>
                  {/* Birth rate vs replacement visual */}
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden relative">
                    <div className="absolute h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (country.birthRate / 3) * 100)}%` }} />
                    <div className="absolute h-full w-0.5 bg-foreground" style={{ left: `${(country.replacement / 3) * 100}%` }} title="Replacement rate" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card className="border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Data sources:</strong> Bureau of Labor Statistics (BLS), Census Bureau population projections,
            National Center for Education Statistics (NCES), UN World Population Prospects, industry association
            reports. Shortage projections account for retirements, enrollment trends, and completion rates.
            Birth rate data from World Bank (2023). Salary ranges reflect median with regional variation.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/career-path" className="text-sm text-emerald-600 hover:underline">Career Path Explorer</a>
        <a href="/skills" className="text-sm text-cyan-600 hover:underline">Skill Inventory</a>
        <a href="/education/finance" className="text-sm text-amber-600 hover:underline">Financial Literacy</a>
      </div>
    </div>
  )
}
