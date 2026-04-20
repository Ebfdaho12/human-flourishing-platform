"use client"

import { useState } from "react"
import { AlertTriangle, ArrowRight, Clock, ChevronDown, Scale, Target, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ROOT_CAUSES: {
  problem: string
  severity: string
  rootDecision: string
  year: string
  whoDecided: string
  whatHappened: string
  whatShouldHaveDone: string
  bandaidFixes: string[]
  actualFix: string
  cascadeEffects: string[]
}[] = [
  {
    problem: "Housing is unaffordable",
    severity: "CRISIS",
    rootDecision: "Single-family zoning + CMHC shifted from building to insuring",
    year: "1970s-1990s",
    whoDecided: "Municipal governments (zoning) + Federal government (CMHC mandate change)",
    whatHappened: "In the 1970s-80s, municipalities locked 70%+ of residential land into single-family-only zoning to 'protect neighborhood character' (really: protect property values of existing homeowners who vote). Simultaneously, CMHC's mandate shifted from directly building public housing to insuring private mortgages. The government stopped building and started backstopping banks. The supply of affordable housing dropped while demand grew. Prices had only one direction to go.",
    whatShouldHaveDone: "Maintained mixed zoning (allow diverse housing types everywhere). Kept CMHC building public/co-op housing. Vienna kept building — 60% of their residents live in social housing with $600/month rents. Canada built 200,000 social housing units in the 1970s then essentially stopped.",
    bandaidFixes: [
      "First-time buyer incentives (just increase demand and raise prices further)",
      "Foreign buyer ban (addresses 5% of the problem while ignoring 95%)",
      "National Housing Strategy ($8.9B sounds big but deficit is $1.4 trillion)",
      "FHSA savings accounts (helps young people save while prices rise faster than they can save)",
    ],
    actualFix: "Upzone everything. Build government rental housing at scale. Eliminate single-family-only zoning. Development charges reform. Modular/prefab housing factories. This is a supply problem — every demand-side 'solution' makes it worse.",
    cascadeEffects: [
      "Young adults can't afford to leave home — delayed family formation",
      "Birth rate drops because housing costs make children unaffordable",
      "Commute times increase as workers pushed further from cities",
      "Mental health crisis — housing insecurity is a top stressor",
      "Inequality widens — homeowners gain $100K+/year in equity while renters gain nothing",
      "Brain drain — talented young Canadians leave for cheaper US cities",
    ],
  },
  {
    problem: "Healthcare wait times are among the worst in the developed world",
    severity: "CRISIS",
    rootDecision: "Fee-for-service model + provincial monopoly on delivery + no accountability metrics",
    year: "1984 (Canada Health Act) + ongoing",
    whoDecided: "Federal and provincial governments",
    whatHappened: "The Canada Health Act (1984) established universal coverage — the right principle. But the delivery model was never modernized. Doctors are paid per visit (fee-for-service), incentivizing volume over outcomes. Provinces have a monopoly on healthcare delivery with zero competition. There are no published wait time targets with consequences for missing them. Private options are banned in most provinces — not to protect patients, but to protect the public system from comparison. The system is designed for 1984 healthcare needs, not 2024.",
    whatShouldHaveDone: "Universal coverage with mixed delivery (public + regulated private, like Australia, France, Germany — all have universal coverage AND shorter wait times). Outcome-based funding instead of fee-for-service. Published wait time targets. Expanded nurse practitioner scope. Digital health records from the start.",
    bandaidFixes: [
      "Increase health transfers (more money into the same broken system)",
      "Hire more doctors (without changing the model that burns them out)",
      "Virtual care expansion (good for simple issues, doesn't fix ER waits)",
      "Surgery backlogs taskforces (temporary surge, doesn't fix structural issue)",
    ],
    actualFix: "Mixed delivery model (public funding, allow private delivery for non-emergency care — as done in every other universal healthcare country that outperforms Canada). Outcome-based funding. Nurse practitioners as primary care providers. Pharmacists prescribing for minor conditions. National digital health record. Medical school expansion (Canada has fewer med school seats per capita than peer countries).",
    cascadeEffects: [
      "Canadians die waiting — estimated 17,000+ deaths/year attributable to wait times",
      "People cross the border to the US for care they can't get in time at home",
      "Doctors burn out and leave (6,000+ Canadian-trained doctors practicing in the US)",
      "Rural communities have no doctors — some towns have 3-year wait lists for a family physician",
      "Emergency rooms used for primary care — the most expensive possible delivery model",
    ],
  },
  {
    problem: "Canada exports raw materials and imports finished products",
    severity: "HIGH",
    rootDecision: "NAFTA (1994) + National Energy Program destruction + no industrial policy",
    year: "1988-1994",
    whoDecided: "Mulroney (FTA 1988), Chrétien (NAFTA 1994) implementation",
    whatHappened: "Free trade agreements removed tariffs that protected Canadian manufacturing. In theory, everyone specializes in what they do best. In practice, Canada specialized in exporting raw resources and the US/Mexico specialized in manufacturing. 500,000+ Canadian manufacturing jobs disappeared. Canada now ships raw oil to US refineries and buys gasoline back. Ships wheat and buys bread back. Mines lithium and buys batteries from China. The value-added processing — where the real money is — happens elsewhere.",
    whatShouldHaveDone: "Trade agreements WITH strategic protections for value-added processing. South Korea did this — they liberalized trade while aggressively building domestic industries (Samsung, Hyundai, LG). Canada liberalized trade without building anything to replace what was lost. An industrial strategy that said 'we will process our own resources' was needed alongside free trade.",
    bandaidFixes: [
      "Innovation tax credits (subsidize R&D that often moves to the US for commercialization)",
      "Superclusters initiative (federal money to industries that then struggle to scale in Canada)",
      "Buy Canadian campaigns (consumers can't buy Canadian when Canadian manufacturing doesn't exist)",
    ],
    actualFix: "National industrial policy. Battery manufacturing from Canadian lithium. Oil refining in Canada for Canadian use. Food processing (turn wheat into flour into bread HERE). Rare earth processing. Semiconductor fabrication. This requires long-term investment and political will — 15-25 year commitments, not 4-year election-cycle thinking.",
    cascadeEffects: [
      "Hollowed-out middle class — manufacturing jobs were the backbone of middle-class income",
      "Brain drain — engineers and scientists go where the industries are (US, Germany, Japan)",
      "Trade deficit in manufactured goods",
      "Vulnerability to supply chain disruptions (COVID showed this clearly)",
      "Company towns collapse when the mine/mill closes with no alternative industry",
    ],
  },
  {
    problem: "National debt of $1.2 trillion with $46.5B/year interest payments",
    severity: "HIGH",
    rootDecision: "Abandoning balanced budget principle + emergency spending never reversed",
    year: "2008-2024 (accelerated)",
    whoDecided: "Harper (2008 stimulus), Trudeau (2015-2024 spending expansion, COVID response)",
    whatHappened: "Canada had effectively eliminated its deficit under Chrétien/Martin (1997-2007). Then 2008: stimulus spending (reasonable). Then 2015: deliberate 'modest deficits' that became permanent. Then 2020: $500B+ in COVID spending (some necessary, much wasteful). Debt went from $612B (2015) to $1.2T+ (2024). Interest payments doubled from $23B to $46.5B when rates rose. Every dollar in interest is a dollar that cannot fund healthcare, housing, or defence.",
    whatShouldHaveDone: "2008 stimulus was defensible but should have been reversed within 2-3 years (as planned). Post-2015 spending should have been tied to revenue (balanced budget legislation with emergency escape clause). COVID spending should have been more targeted — CERB was necessary but continued too long. Zero accountability on where COVID spending actually went.",
    bandaidFixes: [
      "'Growing our way out of debt' (only works if GDP growth exceeds interest rates — it currently doesn't)",
      "Inflation reducing real debt value (steals from savers to benefit borrowers — including government)",
      "'Revenue measures' (tax increases that reduce economic activity)",
    ],
    actualFix: "Stop running deficits. Not austerity — prioritization. The government collects $450B+ in revenue. If spending is prioritized based on ROI (see spending tracker), a balanced budget is achievable without cutting critical services. It requires saying no to programs that don't produce measurable results — which is politically difficult but mathematically necessary.",
    cascadeEffects: [
      "$46.5B in interest = enough to fund entire National Housing Strategy 5x over, or eliminate every Indigenous boil water advisory, or double military spending",
      "Future generations inherit the debt — taxation without representation",
      "Limits ability to respond to next crisis (less fiscal room for emergencies)",
      "Credit rating risk — if debt continues growing, borrowing costs increase further (vicious cycle)",
      "Inflation pressure — government spending adds to money supply, contributing to price increases",
    ],
  },
  {
    problem: "Indigenous communities lack basic infrastructure (water, housing, education)",
    severity: "CRISIS",
    rootDecision: "Indian Act (1876) + residential schools + on-reserve governance model",
    year: "1876 — ongoing",
    whoDecided: "Every government since Confederation",
    whatHappened: "The Indian Act (1876) created a paternalistic system where the federal government controls Indigenous land, governance, and services. Residential schools (1883-1996) deliberately destroyed Indigenous culture, families, and self-governance capacity. The current system funds reserves through federal transfers — but the money flows through Ottawa bureaucracy, not to communities directly. On-reserve housing is owned by the band, not individuals — meaning residents can't build equity or get mortgages. The result: 30+ boil water advisories, chronic housing shortages, suicide rates 5-7x the national average, and educational outcomes decades behind.",
    whatShouldHaveDone: "Self-determination from the start. Indigenous peoples governed themselves effectively for thousands of years before colonization. The reserve system was designed to control, not support. Modern solution: direct funding to Indigenous governments, property rights on reserve, community-led development, education parity.",
    bandaidFixes: [
      "Increased transfer payments (more money into the same broken delivery system)",
      "Apologies without structural change (words without reform)",
      "Short-term clean water projects (fix one, three more appear because infrastructure is aging)",
      "RCMP investigations without policing reform",
    ],
    actualFix: "Repeal or fundamentally reform the Indian Act. Transfer control to Indigenous governments with direct funding (bypass Ottawa). On-reserve property rights (so individuals can build equity). Education funding parity with provincial systems. Clean water infrastructure with maintenance funding (not just capital, but ongoing operations). Mental health resources at community scale. Economic development partnerships where Indigenous communities are equity partners, not just consulted.",
    cascadeEffects: [
      "Intergenerational trauma from residential schools affects every aspect of community health",
      "Youth suicide rates 5-7x national average",
      "Food insecurity in Nunavut: 46% of households",
      "Overcrowded housing: average of 2-3 families per housing unit on many reserves",
      "Lower life expectancy: 8-15 years below national average depending on region",
      "Economic exclusion: can't build equity, can't access capital, can't develop land",
    ],
  },
  {
    problem: "Cost of living has outpaced wages for 30+ years",
    severity: "CRISIS",
    rootDecision: "Monetary policy (low rates) + immigration without infrastructure + financialization of essentials",
    year: "1990s — ongoing",
    whoDecided: "Bank of Canada + Federal immigration policy + Provincial regulation (or lack thereof)",
    whatHappened: "Three forces combined: (1) The Bank of Canada held interest rates low for decades, inflating asset prices while wages stayed flat. (2) Immigration targets increased to 500K+/year without proportional increases in housing, healthcare, or infrastructure. (3) Essential goods (housing, groceries, telecom) became dominated by oligopolies that face no real competition. Loblaws/Metro/Sobeys control 68% of groceries. Rogers/Bell/Telus control 90% of telecom. 5 banks control 85%+ of banking. Without competition, prices only go one direction.",
    whatShouldHaveDone: "Monetary policy targeting wage growth, not just inflation. Immigration tied to infrastructure capacity. Break up oligopolies or regulate them as utilities. Allow foreign competition in telecom and banking. Land value tax to discourage speculation.",
    bandaidFixes: [
      "Carbon tax rebates (offsets carbon tax but doesn't address underlying cost increases)",
      "Grocery rebate (one-time payment while structural issue persists)",
      "GST holidays (temporary relief, doesn't address root cause)",
      "First-time buyer programs (demand stimulus that raises prices)",
    ],
    actualFix: "Competition policy with teeth — break up grocery/telecom/banking oligopolies or allow foreign competitors. Immigration targets tied to housing/healthcare capacity. Monetary policy that considers asset price inflation (housing) not just consumer inflation. Land value tax. Wage growth targets as part of Bank of Canada mandate.",
    cascadeEffects: [
      "Two-income families still can't afford what one-income families had in 1970",
      "Household debt at record levels: $1.79 for every $1 of disposable income",
      "Birth rate collapse: 1.33 — lowest in Canadian history",
      "Mental health crisis from financial stress",
      "Food bank usage at record highs — 2 million visits/month (2023)",
      "Homelessness visible in every major city — was rare 30 years ago",
    ],
  },
]

export default function CanadaRootCausesPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-amber-700">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Root Causes, Not Bandaids</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every major problem in Canada today traces back to specific decisions by specific people. Here are the receipts.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Why Root Causes Matter</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Politicians propose bandaid fixes because they are visible, fast, and win votes. Root cause fixes are
            slow, structural, and often threaten powerful interests. But bandaids on broken bones do not heal —
            they just hide the damage until it gets worse. This page traces every major Canadian problem to the
            original decision that caused it, shows what should have been done instead, and identifies the actual
            fix versus the bandaids currently being applied. No political labels — just cause and effect.
          </p>
        </CardContent>
      </Card>

      {/* Root causes */}
      <div className="space-y-4">
        {ROOT_CAUSES.map((rc, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className={cn("overflow-hidden",
              rc.severity === "CRISIS" ? "border-red-200" : "border-amber-200"
            )}>
              <div className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={cn("h-5 w-5 shrink-0",
                    rc.severity === "CRISIS" ? "text-red-500" : "text-amber-500"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{rc.problem}</p>
                      <Badge variant="outline" className={cn("text-[9px]",
                        rc.severity === "CRISIS" ? "text-red-500 border-red-300" : "text-amber-600 border-amber-300"
                      )}>{rc.severity}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Root: {rc.rootDecision} ({rc.year})</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CardContent>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Who Decided</p>
                    <p className="text-xs text-muted-foreground">{rc.whoDecided}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">What Happened</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rc.whatHappened}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-2.5">
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">What Should Have Been Done</p>
                    <p className="text-xs text-blue-700">{rc.whatShouldHaveDone}</p>
                  </div>
                  <div className="rounded-lg bg-red-50/50 border border-red-200 p-2.5">
                    <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1">Current Bandaid Fixes (Do Not Solve the Problem)</p>
                    <ul className="space-y-0.5">
                      {rc.bandaidFixes.map((bf, j) => (
                        <li key={j} className="text-xs text-red-600 flex gap-2">
                          <span className="shrink-0">✗</span><span>{bf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2.5">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">The Actual Fix (Root Cause Solution)</p>
                    <p className="text-xs text-emerald-700">{rc.actualFix}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Cascade Effects (What This Broken System Creates)</p>
                    <ul className="space-y-0.5">
                      {rc.cascadeEffects.map((ce, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-2">
                          <ArrowRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /><span>{ce}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Pattern</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every problem above follows the same pattern: a structural decision was made decades ago that created
            perverse incentives. Over time, those incentives produced the crisis we see today. Then politicians
            propose bandaid fixes that address symptoms (visible, fast, cheap) instead of root causes (invisible,
            slow, expensive). The bandaids win votes because they look like action. The root causes persist because
            fixing them threatens powerful interests — homeowners who benefit from high prices, oligopolies that
            benefit from no competition, bureaucracies that benefit from their own existence.
            Real change requires voters who understand root causes and demand structural reform.
            That is what this platform exists to provide.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Parliamentary Budget Officer, Auditor General of Canada, Statistics Canada,
            Bank of Canada, CMHC, OECD, Truth and Reconciliation Commission, Indian Act (RSC 1985),
            Canada Health Act (1984), CUSMA/NAFTA text, provincial housing data. All public records.
            Track the politicians behind these decisions on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Sovereignty</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/housing" className="text-sm text-orange-600 hover:underline">Housing Crisis</a>
        <a href="/civilizations" className="text-sm text-violet-600 hover:underline">Civilizations</a>
      </div>
    </div>
  )
}
