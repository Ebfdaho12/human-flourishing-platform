"use client"

import { useState } from "react"
import {
  Heart, Clock, AlertTriangle, ArrowRight, ChevronDown, Users,
  DollarSign, Globe2, TrendingDown, Stethoscope, Pill, Building2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const WAIT_TIMES = [
  { procedure: "Family doctor (new patient)", wait: "2-5 years", benchmark: "24-48 hours (Netherlands)", note: "6.5 million Canadians have no family doctor. Walk-in clinics are the de facto primary care system." },
  { procedure: "Specialist referral (median)", wait: "27.7 weeks", benchmark: "3-6 weeks (Germany)", note: "This is AFTER you see a GP. Many wait months just to see the GP who then refers. Total journey: 6-18 months." },
  { procedure: "Hip replacement", wait: "42 weeks", benchmark: "6-8 weeks (Australia)", note: "Patients live in pain for nearly a year waiting. Some deteriorate to the point where surgery becomes more complex." },
  { procedure: "Knee replacement", wait: "44 weeks", benchmark: "8-10 weeks (France)", note: "Canada ranks last in the OECD for orthopedic wait times. Quality of life impact is devastating." },
  { procedure: "Cataract surgery", wait: "20 weeks", benchmark: "2-4 weeks (UK)", note: "Vision impairment for 5 months. Increases fall risk in elderly. A relatively simple surgery delayed by system congestion." },
  { procedure: "MRI scan", wait: "10-16 weeks", benchmark: "1-3 weeks (Japan)", note: "Canada has 10 MRI machines per million people. Japan has 55. The US has 40. The equipment shortage is a policy choice." },
  { procedure: "CT scan", wait: "4-8 weeks", benchmark: "1-2 weeks (Germany)", note: "Diagnostic imaging delays mean conditions worsen before they are even identified." },
  { procedure: "Cancer treatment (after diagnosis)", wait: "4-6 weeks to start", benchmark: "2 weeks (Denmark)", note: "The one area where Canada has improved. Still slower than top performers." },
  { procedure: "Mental health (psychiatrist)", wait: "6-18 months", benchmark: "2-4 weeks (Netherlands)", note: "The mental health crisis meets the healthcare crisis. Kids in crisis wait over a year for help." },
  { procedure: "Emergency room", wait: "4-8 hours median", benchmark: "30-90 min (France)", note: "ER hallway medicine: patients treated in hallways for hours or days. Some ERs have closed entirely due to staffing." },
]

const SPENDING_VS_OUTCOMES = [
  { metric: "Healthcare spending (% of GDP)", canada: "12.2%", oecd: "9.2%", best: "France: 12.1% (better outcomes)", verdict: "Canada spends MORE than average but gets LESS" },
  { metric: "Doctors per 1,000 people", canada: "2.7", oecd: "3.7", best: "Austria: 5.4", verdict: "30% fewer doctors than OECD average" },
  { metric: "Hospital beds per 1,000", canada: "2.5", oecd: "4.3", best: "Japan: 12.6", verdict: "40% fewer beds than average — explains hallway medicine" },
  { metric: "MRI machines per million", canada: "10", oecd: "17", best: "Japan: 55", verdict: "Equipment shortage is a policy choice, not a resource constraint" },
  { metric: "Nurses per 1,000", canada: "10.0", oecd: "8.8", best: "Norway: 18.2", verdict: "Above average but burned out — 1 in 4 planning to leave" },
  { metric: "Out-of-pocket spending", canada: "15%", oecd: "20%", best: "France: 9%", verdict: "Universal but not comprehensive — dental, vision, drugs not covered for most" },
  { metric: "Life expectancy", canada: "81.7 years", oecd: "80.3", best: "Japan: 84.8", verdict: "Good — but declining relative to peers since 2015" },
  { metric: "Avoidable mortality", canada: "Rank: 16th", oecd: "Average", best: "Switzerland: 1st", verdict: "Middle of the pack — many deaths are preventable with faster care" },
]

const WHY_BROKEN = [
  {
    cause: "Fee-for-Service Payment Model",
    impact: "Incentivizes volume over outcomes",
    explanation: "Doctors are paid per visit, not per health outcome. A doctor who sees 40 patients for 5 minutes each earns more than one who sees 20 patients for 15 minutes and actually solves their problems. This creates a system optimized for throughput, not health. The sickest patients generate the most revenue — there is zero financial incentive for prevention.",
    fix: "Capitation + outcome bonuses: pay doctors a fixed amount per patient per year, with bonuses for keeping patients healthy (fewer ER visits, better chronic disease management). Countries that do this (Netherlands, Denmark) have shorter wait times and better outcomes.",
  },
  {
    cause: "Provincial Monopoly on Delivery",
    impact: "No competition = no accountability",
    explanation: "In most provinces, the government is the sole healthcare provider. There is no regulated private alternative for most services. When you are the only option, there is no pressure to improve. If a hospital has 12-month wait times, patients cannot go elsewhere — they wait or they leave the country. Every other universal healthcare system (France, Germany, Australia, UK) allows a mix of public and regulated private delivery.",
    fix: "Mixed delivery: keep universal public coverage (everyone gets care regardless of ability to pay) but allow regulated private clinics for non-emergency services. France does this — universal coverage, shorter waits, better outcomes. The key is regulation: private clinics must accept the public rate for insured services.",
  },
  {
    cause: "Doctor Shortage (Self-Inflicted)",
    impact: "6.5 million Canadians have no family doctor",
    explanation: "Canada has fewer medical school seats per capita than most peer nations. We train fewer doctors than we need, then lose many to the US (higher pay, lower taxes). International medical graduates face years of recredentialing. Meanwhile, nurse practitioners are restricted from practicing independently in most provinces — even though they can handle 80% of primary care visits. The doctor shortage is not because people don't want to be doctors — it's because the system limits how many can become doctors.",
    fix: "Double medical school seats. Fast-track international medical graduate recognition (currently takes 3-7 years). Allow nurse practitioners full independent practice in all provinces. Fund 50 new community health clinics per year staffed by NPs. Loan forgiveness for doctors who practice in underserved areas for 5+ years.",
  },
  {
    cause: "No National Health Data System",
    impact: "Your records don't follow you between provinces or even between hospitals",
    explanation: "Canada has no unified electronic health record system. Your family doctor, specialist, hospital, and pharmacist often have completely separate records. When you move provinces, your health history doesn't follow. When you show up at the ER, they can't see your medical history. This wastes billions in duplicate tests, delays diagnosis, and causes medication errors.",
    fix: "National digital health record. Estonia built one for $100M. Denmark has one. Canada has spent billions on failed provincial systems that don't talk to each other. This is not a technology problem — it's a political will problem. Make it a federal standard with provincial implementation.",
  },
  {
    cause: "Dental, Vision, and Pharmaceuticals Not Covered",
    impact: "Universal in name, not in practice",
    explanation: "Canada's 'universal' healthcare doesn't cover dental, vision, or most prescription drugs for working-age adults. 33% of Canadians have no dental coverage. A family spending $500/year on prescriptions, $400 on dental, and $200 on vision is paying $1,100/year out of pocket for basic healthcare. The federal pharmacare program (2024) covers some drugs but is narrow in scope.",
    fix: "Phase in dental, vision, and pharmacare coverage over 5 years. Negotiate drug prices nationally (like every other universal system does — Canadian drug prices are 25% higher than the OECD average because provinces negotiate separately instead of collectively). Bulk purchasing saves 20-40%.",
  },
  {
    cause: "ER as Primary Care",
    impact: "Most expensive possible care delivery model",
    explanation: "When 6.5 million people have no family doctor, they go to the ER for everything — including issues that a nurse practitioner could handle in 10 minutes. An ER visit costs the system $300-$1,500. The same issue at a walk-in clinic costs $50-$100. At a nurse practitioner clinic: $30-$60. Canada is paying premium prices for basic care because it hasn't built the basic care infrastructure.",
    fix: "Community health clinics in every neighborhood — open evenings and weekends, staffed by NPs and GPs, handling everything that doesn't need a hospital. This exists in Finland, Cuba, and Brazil. It works. It costs a fraction of ER visits.",
  },
]

const WHAT_WORKS_ELSEWHERE = [
  { country: "France", model: "Universal coverage + mixed delivery (public/private)", wait: "Specialist: 3-4 weeks", spend: "12.1% GDP", key: "Patients choose between public and private providers. Doctors compete on quality. Government sets prices. Outcomes are among the best in the world." },
  { country: "Germany", model: "Statutory health insurance (non-profit) + private option", wait: "Specialist: 2-3 weeks", spend: "12.7% GDP", key: "Competing non-profit insurance funds. Generous coverage. Strong primary care. Patients have real choice." },
  { country: "Australia", model: "Medicare (public) + optional private insurance", wait: "Specialist: 4-6 weeks", spend: "10.0% GDP", key: "Public system provides base coverage. Private insurance (47% of population) provides faster access to elective surgery. Two-tier but universal safety net." },
  { country: "Netherlands", model: "Mandatory private insurance (regulated)", wait: "GP: same day. Specialist: 3-5 weeks", spend: "10.1% GDP", key: "Everyone must buy insurance from competing regulated insurers. Strong GP gatekeeping. Excellent digital records. Among highest patient satisfaction globally." },
  { country: "Denmark", model: "Tax-funded universal + strong GP system", wait: "GP: same day. Cancer: 2 weeks", spend: "10.5% GDP", key: "Every Dane is assigned a GP (no doctor shortage). Digital health record since 2003. Cancer fast-track guarantee. Extremely high satisfaction." },
]

export default function CanadaHealthcarePage() {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null)
  const [showComparisons, setShowComparisons] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Healthcare System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          We pay more than most countries and wait longer than almost all of them. Here is why, and what would fix it.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-red-900 mb-2">The Uncomfortable Truth</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canadians are proud of universal healthcare — and the principle is right: nobody should die because they
            cannot afford treatment. But pride in the principle has become a shield against criticizing the delivery.
            The system ranks <strong>last among comparable nations</strong> for wait times and value for money. Saying
            "our system needs reform" is not saying "we should adopt the US model." It is saying we should learn
            from France, Germany, Australia, and Denmark — countries with universal coverage AND short wait times.
          </p>
        </CardContent>
      </Card>

      {/* Wait times */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-500" /> Wait Times — The Real Numbers
        </h2>
        <div className="space-y-2">
          {WAIT_TIMES.map((w, i) => (
            <Card key={i} className="border-red-100">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{w.procedure}</p>
                  <Badge variant="outline" className="text-xs text-red-500 border-red-300">{w.wait}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] mb-1">
                  <span className="text-red-500">Canada: {w.wait}</span>
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="text-emerald-600">Best: {w.benchmark}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{w.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Spending vs outcomes */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-500" /> Spending vs Results
        </h2>
        <p className="text-xs text-muted-foreground mb-3">Canada spends 12.2% of GDP on healthcare — more than the OECD average. What does it get?</p>
        <div className="space-y-2">
          {SPENDING_VS_OUTCOMES.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-1">{s.metric}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Canada:</span> <strong className="text-red-500">{s.canada}</strong></div>
                  <div><span className="text-muted-foreground">OECD avg:</span> <strong>{s.oecd}</strong></div>
                  <div><span className="text-muted-foreground">Best:</span> <strong className="text-emerald-600">{s.best}</strong></div>
                </div>
                <p className="text-[10px] text-amber-700 mt-1">{s.verdict}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why it's broken */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> 6 Reasons the System Fails
        </h2>
        <div className="space-y-3">
          {WHY_BROKEN.map((w, i) => {
            const isOpen = expandedWhy === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedWhy(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{w.cause}</p>
                      <p className="text-xs text-red-500">{w.impact}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-7">
                      <p className="text-xs text-muted-foreground leading-relaxed">{w.explanation}</p>
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                        <p className="text-xs text-emerald-700"><strong>Fix:</strong> {w.fix}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* What works elsewhere */}
      <Card className="cursor-pointer" onClick={() => setShowComparisons(!showComparisons)}>
        <CardContent className="p-4 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold">What Works in Other Universal Systems</p>
            <p className="text-[10px] text-muted-foreground">5 countries with universal coverage AND short wait times</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showComparisons && "rotate-180")} />
        </CardContent>
      </Card>
      {showComparisons && (
        <div className="space-y-3">
          {WHAT_WORKS_ELSEWHERE.map((c, i) => (
            <Card key={i} className="border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{c.country}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">{c.wait}</Badge>
                    <Badge variant="outline" className="text-[9px]">{c.spend}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1"><strong>Model:</strong> {c.model}</p>
                <p className="text-xs text-emerald-700">{c.key}</p>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground italic">
            Every country above has universal coverage — nobody goes bankrupt from medical bills. The difference is how care is delivered, not whether it is funded publicly.
          </p>
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Canadian Institute for Health Information (CIHI), Fraser Institute wait time survey,
            OECD Health Statistics, Commonwealth Fund International Health Policy Survey, WHO, provincial health
            ministry reports. Wait times are medians — many patients wait significantly longer.
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
