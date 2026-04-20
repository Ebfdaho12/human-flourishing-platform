"use client"

import { useState } from "react"
import {
  TrendingUp, ArrowRight, AlertTriangle, ChevronDown, Target,
  Clock, Shield, Globe2, Zap, Home, DollarSign, Users, Landmark
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// Wasted political energy vs high-ROI alternatives
// ────────────────────────────────────────────
const WASTED_VS_IMPACTFUL = [
  {
    wasted: "Firearms ban on registered legal owners",
    timeSpent: "20+ years of political cycles, $2B+ gun registry (scrapped), current $5B+ buyback estimate",
    whyWasted: "97% of gun crime in Canada uses ILLEGAL firearms — smuggled from the US or obtained illegally. Banning registered hunting rifles from licensed, background-checked citizens does nothing to stop criminals who by definition do not register, do not have licenses, and do not care about bans. The US border is the source — not Canadian duck hunters. This is political theatre that FEELS like action while accomplishing nothing measurable.",
    highROI: "Border enforcement + illegal firearms task force",
    roiExplanation: "Invest the $5B buyback cost into: CBSA border technology (scanning every truck crossing), dedicated RCMP firearms trafficking units in Toronto/Vancouver/Montreal, mandatory minimum sentences for illegal gun possession (not legal owners), and intelligence sharing with US ATF. Target the SUPPLY of illegal guns, not the legal owners who are not the problem.",
    roiImpact: "Would actually reduce gun violence by addressing the source (US border smuggling) rather than the scapegoat (licensed hunters). Every dollar spent on border enforcement has 10-50x the impact of a dollar spent on buybacks from legal owners.",
  },
  {
    wasted: "Carbon tax political battle (5+ years of debate)",
    timeSpent: "Billions in implementation, administration, and political capital. The conversation consumed 2 elections.",
    whyWasted: "Canada is 1.5% of global emissions. Even if Canada hit ZERO emissions, global warming continues. Meanwhile, the political energy spent fighting about a carbon tax could have been spent on adaptation (flood infrastructure, fire-resistant communities, building codes) and the investments that actually matter (nuclear power, grid interconnection, refining our own oil instead of importing). The tax itself is economically efficient but politically toxic — and the debate consumed years that could have been spent building.",
    highROI: "Nuclear expansion + east-west energy grid + adaptation infrastructure",
    roiExplanation: "Instead of 5 years debating a tax, spend those 5 years: building 4 SMR reactors ($8B, powers 1M homes each), connecting Quebec hydro to Ontario and Atlantic Canada ($5B, eliminates coal/oil dependence for 6M+ people), and fireproofing every at-risk community in BC/Alberta ($2B). Total: $15B for permanent infrastructure vs $billions/year on a tax that changes consumer behaviour marginally.",
    roiImpact: "Nuclear + hydro interconnection would reduce Canada's emissions 3-5x more than the carbon tax while creating 50,000+ jobs, reducing electricity costs, and building infrastructure that lasts 60+ years. Adaptation infrastructure prevents $billions in disaster damage annually.",
  },
  {
    wasted: "Senate reform debates (40+ years, zero results)",
    timeSpent: "Multiple constitutional conferences, referendums, prime ministers promising reform. Result: zero structural change.",
    whyWasted: "The Senate costs $120M/year. 105 appointed (not elected) members serving until 75. Multiple PMs have promised reform or abolition — none have delivered because it requires constitutional amendment (7 provinces + 50% of population). The debate itself consumes political oxygen that could be spent on things that actually affect citizens.",
    highROI: "Simply cap Senate budget and redirect savings",
    roiExplanation: "If constitutional reform is impossible (it is), do what IS possible: cap the Senate operating budget at $80M (saving $40M/year), reduce staff, eliminate most Senate travel budgets, and redirect savings to Indigenous clean water infrastructure ($40M/year would eliminate ALL boil water advisories within 3 years).",
    roiImpact: "Instead of 40 years of constitutional debate with zero result: clean water for every Indigenous community in Canada. $40M/year solves the problem completely. The Senate debate has been a distraction from actionable solutions.",
  },
  {
    wasted: "Bilingualism enforcement in federal services (diminishing returns)",
    timeSpent: "$2.4B/year on official bilingualism programs. Massive bureaucratic infrastructure.",
    whyWasted: "Bilingualism is important and the principle is right. But the enforcement mechanism creates absurd outcomes: qualified candidates rejected for federal jobs because they don't speak both languages (even for positions in 98% anglophone communities). A nurse in Thunder Bay needs French certification to work at a federal health facility, even though 0.5% of the local population speaks French. The PRINCIPLE is worth protecting. The IMPLEMENTATION has become a jobs program for language testing companies.",
    highROI: "Bilingualism where it matters + invest savings in actual language education",
    roiExplanation: "Require bilingualism for: public-facing federal jobs in bilingual regions (Ottawa, Montreal, New Brunswick). Remove the requirement for: back-office jobs, jobs in overwhelmingly unilingual communities, technical positions. Redirect $500M/year in savings into French immersion programs that actually produce bilingual Canadians from childhood — rather than testing adults who will never use the second language.",
    roiImpact: "More bilingual Canadians through better education, fewer qualified candidates excluded from government jobs, and $500M/year redirected to programs that build real bilingual capacity rather than testing for it.",
  },
  {
    wasted: "ArriveCAN app ($59.5M for a border app)",
    timeSpent: "$59.5M for an app that should have cost $2-5M. Sub-sub-contracted through IT consulting firms.",
    whyWasted: "The Auditor General found 'a disregard for basic management and contracting practices.' The same result could have been achieved with a fraction of the cost if built by internal government developers or a single competent firm. Instead, consulting firms (who charge $1,500-$3,000/hour) were given carte blanche with taxpayer money.",
    highROI: "Internal government tech capacity",
    roiExplanation: "Build a permanent federal digital services team (like the UK's Government Digital Service or US Digital Service). 50 developers at $120K/year = $6M/year total. They could build ArriveCAN in 3 months AND maintain it AND build every other government digital service — for 1/10th the cost of consulting firms. The UK did this in 2011 and has saved billions.",
    roiImpact: "Every federal IT project currently outsourced to McKinsey/Deloitte/Accenture at 5-10x cost could be built internally. Savings: $5-10B/year. The Phoenix Pay System ($2.2B failure) would never have happened with competent internal teams.",
  },
]

// ────────────────────────────────────────────
// Trajectory scenarios
// ────────────────────────────────────────────
const TRAJECTORIES = [
  {
    name: "Status Quo (current trajectory)",
    color: "text-red-500 border-red-300 bg-red-50/20",
    by2035: [
      "Housing: $800K+ average nationally, 15x+ income in major cities",
      "Healthcare: 35+ week specialist waits, 8M+ without family doctor",
      "Debt: $2T+ national debt, $70B+/year in interest (more than healthcare transfers)",
      "Birth rate: below 1.2, population decline without 500K+/year immigration",
      "Infrastructure: further deterioration, more bridge closures, more boil water advisories",
      "Brain drain accelerates: tech, medical, and engineering talent leaves for US",
    ],
    likelihood: "HIGH (this is the default if nothing changes)",
  },
  {
    name: "Short-Term Fixes Only (bandaid approach)",
    color: "text-amber-600 border-amber-300 bg-amber-50/20",
    by2035: [
      "Housing: first-time buyer incentives raise prices further. Supply still inadequate.",
      "Healthcare: more money into same broken system. Wait times stabilize but don't improve.",
      "Debt: deficits continue. $60B+/year in interest. Less money for services each year.",
      "Immigration: cuts to temporary residents reduce pressure slightly but don't fix root cause",
      "Politically popular but structurally unchanged. Problems resurface bigger in 2040.",
    ],
    likelihood: "MODERATE (most likely if any government acts at all)",
  },
  {
    name: "Root Cause Reform (10-year plan)",
    color: "text-blue-600 border-blue-300 bg-blue-50/20",
    by2035: [
      "Housing: upzoned nationally, 400K+ homes/year, price-to-income dropping toward 5x",
      "Healthcare: mixed delivery model, NP-led clinics in every community, digital records, 10-week specialist waits",
      "Energy: 2 SMR reactors online, Quebec hydro → Atlantic Canada, Alberta refining expanded",
      "Birth rate: recovering to 1.5+ from affordable housing + childcare",
      "Debt: balanced budget by Year 5, debt-to-GDP declining",
      "Manufacturing: battery plants, food processing, rare earth processing creating value-added economy",
    ],
    likelihood: "LOW (requires a government willing to make 10-year commitments, not 4-year election promises)",
  },
  {
    name: "1,000-Year Vision (Netherlands approach)",
    color: "text-emerald-600 border-emerald-300 bg-emerald-50/20",
    by2035: [
      "Infrastructure: built to last 100+ years, not 20-30. Every bridge, road, water system designed for permanence",
      "Energy: fully interconnected east-west grid. 90%+ clean. Export clean energy. Nuclear backbone.",
      "Water: freshwater protected by constitutional amendment. Every community has clean water. Great Lakes treated as national treasure.",
      "Housing: social housing (Vienna model) provides permanent affordable stock that never goes private. 30% of housing is purpose-built rental.",
      "Education: national standards, phonics-based literacy, trades pathways, minimal screens before age 12",
      "Arctic: sovereignty infrastructure built. Deep-water ports. Year-round Northwest Passage presence. Resource development with Indigenous equity partnership.",
      "Birth rate: 1.8+ from genuine family support (French model). Birth Fund gives every child a retirement fund from day one.",
      "Defence: 2.5% GDP, domestic manufacturing, Arctic capability. Canada defends itself.",
    ],
    likelihood: "VERY LOW (requires leaders who think in generations, not election cycles. But every great nation was built by leaders who did exactly this.)",
  },
]

// ────────────────────────────────────────────
// Long-term thinking examples from other countries
// ────────────────────────────────────────────
const LONG_TERM_EXAMPLES = [
  {
    country: "Netherlands — The Delta Works",
    timeHorizon: "10,000 years",
    description: "After the 1953 North Sea flood killed 1,836 people, the Netherlands didn't build a temporary seawall. They built the Delta Works — the largest flood protection system on Earth. Designed to withstand a 1-in-10,000-year storm event. Cost: $13B over 40 years. Protects 4M+ people permanently.",
    lesson: "They didn't ask 'what is the cheapest fix for the next election?' They asked 'how do we solve this forever?' Every piece of Canadian infrastructure should be designed with this mindset.",
  },
  {
    country: "Norway — Government Pension Fund",
    timeHorizon: "100+ years (perpetual)",
    description: "Norway found oil in the 1960s — same era as Alberta. Norway saved its oil revenue in a sovereign wealth fund. Today: $1.5 TRILLION (for 5.4M people = $280,000 per citizen). Alberta saved: $18 billion. Same resource, opposite outcome. Norway will be wealthy long after the oil runs out.",
    lesson: "Canada had the same opportunity and chose to spend instead of save. The Birth Fund concept applies this thinking from birth — save consistently, let compounding work over decades, never touch the principal.",
  },
  {
    country: "Japan — Earthquake Infrastructure",
    timeHorizon: "500+ years",
    description: "Japan builds every building to withstand magnitude 8+ earthquakes. The 2011 Tohoku earthquake (9.1 magnitude) caused massive damage from the tsunami — but buildings largely held. Tokyo's skyscrapers swayed but did not fall. This is because Japan builds for the worst-case scenario that may happen once in 500 years.",
    lesson: "Canada builds to minimum code. Japan builds to maximum survival. The upfront cost is 15-20% higher but the structure lasts 3-5x longer and survives catastrophe. Over 100 years, building well is cheaper than rebuilding repeatedly.",
  },
  {
    country: "Singapore — From Swamp to Superpower (60 years)",
    timeHorizon: "One generation (started 1965)",
    description: "In 1965, Singapore was a fishing village with no natural resources, no army, and was kicked out of Malaysia. Lee Kuan Yew built: world-class education, zero corruption, strategic port, financial centre, public housing (80% of citizens live in government-built housing), and a sovereign wealth fund. In ONE generation — from nothing to one of the richest nations on Earth.",
    lesson: "Singapore had NOTHING. Canada has EVERYTHING — water, energy, minerals, farmland, educated population, coastline. If Singapore can become a superpower from a swamp, Canada has no excuse for underperformance. The difference is leadership quality and long-term vision.",
  },
  {
    country: "Switzerland — 700 Years of Neutrality + Direct Democracy",
    timeHorizon: "700+ years",
    description: "Switzerland has held together 4 language groups (German, French, Italian, Romansh) for 700+ years through: direct democracy (citizens vote on major policy), extreme decentralization (cantons have enormous autonomy), neutrality (not wasting resources on foreign wars), and sound money (Swiss franc is one of the most stable currencies in history).",
    lesson: "Canada has 2 language groups and struggles to hold together. Switzerland has 4 and thrives. The difference: decentralization and citizen empowerment. Provincial autonomy + national coordination (not centralization) is the proven formula.",
  },
]

export default function CanadaTrajectoriesPage() {
  const [expandedWaste, setExpandedWaste] = useState<number | null>(null)
  const [expandedTrajectory, setExpandedTrajectory] = useState<number | null>(3) // Open the 1000-year vision

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada's Trajectories</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Where Canada goes depends on what it focuses on. Political theatre or generational infrastructure? Short-term fixes or 1,000-year solutions?
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Fundamental Question</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Netherlands didn't build the <Explain tip="The largest flood protection system on Earth, built after the 1953 North Sea flood. Designed to withstand a 1-in-10,000-year storm. Still standing 70 years later. This is what 'long-term thinking' looks like">Delta Works</Explain> to
            win an election. Norway didn't build a <Explain tip="Norway's Government Pension Fund Global — $1.5 trillion saved from oil revenue. For 5.4 million people, that is $280,000 per citizen. Alberta had the same opportunity and saved $18 billion. Same resource, opposite outcome">$1.5 trillion sovereign wealth fund</Explain> for
            a 4-year term. Singapore didn't go from swamp to superpower by thinking quarter-by-quarter.
            <br /><br />
            Every great nation was built by leaders who thought in <strong>generations, not elections</strong>. Canada has
            spent decades on political theatre — debating issues that sound important but change nothing, while the
            foundations (housing, healthcare, infrastructure, energy, defence) crumble. This page shows what happens
            if Canada keeps doing what it is doing — and what happens if it starts thinking like the Netherlands.
          </p>
        </CardContent>
      </Card>

      {/* Wasted political energy */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Political Theatre vs High-ROI Focus
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Every hour spent on low-impact political debates is an hour NOT spent on infrastructure, healthcare, housing, or energy. Here is what the trade-offs look like:
        </p>
        <div className="space-y-3">
          {WASTED_VS_IMPACTFUL.map((w, i) => {
            const isOpen = expandedWaste === i
            return (
              <Card key={i} className="overflow-hidden">
                <div className="cursor-pointer" onClick={() => setExpandedWaste(isOpen ? null : i)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] text-red-500 border-red-300">LOW ROI</Badge>
                          <p className="text-sm font-medium text-red-600 line-through">{w.wasted}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">HIGH ROI</Badge>
                          <p className="text-sm font-medium text-emerald-700">{w.highROI}</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </CardContent>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-0.5">Time & Money Wasted</p>
                      <p className="text-xs text-red-600">{w.timeSpent}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed"><strong>Why it doesn't work:</strong> {w.whyWasted}</p>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">High-ROI Alternative</p>
                      <p className="text-xs text-emerald-700">{w.roiExplanation}</p>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">{w.roiImpact}</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Trajectory scenarios */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" /> Four Possible Futures for Canada (by 2035)
        </h2>
        <div className="space-y-3">
          {TRAJECTORIES.map((t, i) => {
            const isOpen = expandedTrajectory === i
            return (
              <Card key={i} className={cn("overflow-hidden", t.color)}>
                <div className="cursor-pointer" onClick={() => setExpandedTrajectory(isOpen ? null : i)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">Likelihood: {t.likelihood}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </CardContent>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <ul className="space-y-1.5">
                      {t.by2035.map((item, j) => (
                        <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" /><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Long-term thinking examples */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-violet-500" /> Countries That Think in Centuries, Not Elections
        </h2>
        <div className="space-y-3">
          {LONG_TERM_EXAMPLES.map((e, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{e.country}</p>
                  <Badge variant="outline" className="text-[9px] text-violet-600 border-violet-300">{e.timeHorizon}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{e.description}</p>
                <div className="rounded-lg bg-violet-50 border border-violet-200 p-2">
                  <p className="text-xs text-violet-700"><strong>Lesson for Canada:</strong> {e.lesson}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* The short-term fix paradox */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Short-Term Fix Paradox</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Short-term fixes are not always wrong — if your basement is flooding, you stop the water NOW and then
            fix the foundation. The problem is when governments ONLY do the short-term fix and never get to the
            long-term one. Canada has been pumping water out of the basement for 30 years while the foundation
            continues to crack.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <strong>The rule should be:</strong> Do the emergency fix immediately. Budget the permanent fix within
            30 days. Begin the permanent fix within 90 days. Complete it within the timeline the engineers say
            (not the timeline the politicians want). And design every permanent fix for 100+ years — not 20-30.
            The upfront cost is 15-20% higher. The lifetime cost is 60-80% lower. Every country that thinks
            long-term is wealthier, safer, and more stable than those that do not.
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">What a 1,000-Year Canada Looks Like</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fresh water protected by constitutional amendment — the world's most valuable resource, guarded for
            generations. Energy grid interconnected coast to coast, 95%+ clean, exporting surplus. Housing built
            to last 200 years (like European stone buildings) with 30%+ social housing ensuring affordability permanently.
            Arctic sovereignty established with permanent infrastructure. Every community with clean water, broadband,
            and healthcare. A Birth Fund giving every child a retirement account from day one. Education that produces
            thinkers, builders, and leaders — not test-takers. A military that can defend the world's second-largest
            country. And a democracy where citizens vote on major policy directly — not just on which politician
            gets to make promises they never keep.
            <br /><br />
            This is not utopia. Every piece of it has been done by at least one country. Canada has more natural
            advantages than any of them had when they started. The only ingredient missing is leaders who think
            beyond the next election.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This page presents policy analysis, not partisan positions.</strong> Wasted political energy is
            identified across ALL parties and ALL governments. The firearms example criticizes Liberal policy. The
            Senate example criticizes Conservative inaction. The spending examples criticize both. The goal is not
            left or right — it is effective vs ineffective, short-term vs long-term, theatre vs results.
            Track specific politicians and their track records on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/root-causes" className="text-sm text-violet-600 hover:underline">Root Causes</a>
        <a href="/canada/blueprint" className="text-sm text-emerald-600 hover:underline">Blueprint</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/civilizations" className="text-sm text-blue-600 hover:underline">Rise & Fall of Civilizations</a>
      </div>
    </div>
  )
}
