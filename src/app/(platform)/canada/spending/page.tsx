"use client"

import { useState } from "react"
import { DollarSign, AlertTriangle, ArrowRight, TrendingUp, ChevronDown, Scale, Users, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────
// Federal spending breakdown (2023-2024 fiscal year)
// Source: Government of Canada Public Accounts + Budget
// ────────────────────────────────────────────
const SPENDING = [
  {
    category: "Elderly Benefits (OAS, GIS)",
    amount: 72.8,
    pctOfBudget: 15.1,
    trend: "Growing 6%/year — fastest growing line item",
    roi: "Direct poverty reduction for seniors. ROI is social — keeps elderly out of poverty. Efficient delivery.",
    issue: "Sustainable only if working-age population grows. With birth rate of 1.33, fewer workers support more retirees. Immigration is currently the only offset.",
    betterAllocation: null,
  },
  {
    category: "Health Transfers to Provinces",
    amount: 52.1,
    pctOfBudget: 10.8,
    trend: "Increasing but not keeping pace with demand",
    roi: "Mixed. Money goes to provinces who control delivery. Federal government sends money but has limited control over outcomes. Wait times have worsened despite increased funding.",
    issue: "Canada spends 12.2% of GDP on healthcare (OECD average: 9.2%) but ranks 30th in wait times. The money is there — the system is inefficient. More funding without structural reform is throwing money at a broken system.",
    betterAllocation: "Shift funding model from fee-for-service to outcomes-based. Expand nurse practitioner scope (reduce ER visits by 30-40%). Invest in preventive care (every $1 in prevention saves $3-$7 in treatment). Digital health records nationally.",
  },
  {
    category: "Canada Child Benefit (CCB)",
    amount: 27.5,
    pctOfBudget: 5.7,
    trend: "Stable — indexed to inflation",
    roi: "HIGH. The single most effective anti-child-poverty program in Canadian history. Lifted 435,000 children out of poverty since 2016. Money goes directly to families — minimal bureaucracy.",
    issue: "Works well. One of the most efficient government programs. Could be expanded to incentivize higher birth rates (Hungary model: increasing benefits per child).",
    betterAllocation: null,
  },
  {
    category: "National Defence",
    amount: 36.7,
    pctOfBudget: 7.6,
    trend: "Increasing toward 2% GDP target (currently 1.3%)",
    roi: "LOW historically. Procurement is broken — fighter jets took 20 years, naval vessels over budget and behind schedule. Defence spending is necessary but delivery is among the worst in NATO.",
    issue: "Not spending too little — spending badly. Irving Shipbuilding contract ($60B+) is massively over budget. Equipment procurement takes 15-25 years. Military can't recruit enough people.",
    betterAllocation: "Fix procurement (sole-source contracts to Canadian manufacturers instead of 20-year competitions). Arctic infrastructure (deep-water ports, radar). Recruit aggressively — military service as path to citizenship + post-service education benefits.",
  },
  {
    category: "Debt Interest Payments",
    amount: 46.5,
    pctOfBudget: 9.7,
    trend: "SURGING — doubled since 2021 due to rate hikes",
    roi: "ZERO. Interest payments produce nothing. This is the cost of past spending decisions. Every dollar in interest is a dollar that cannot go to healthcare, housing, or infrastructure.",
    issue: "At $46.5B/year, interest costs more than defence, more than CCB, more than all housing programs combined. This is the compound interest visualizer in reverse — working against taxpayers. National debt: $1.2 trillion.",
    betterAllocation: "The only solution is to stop adding to the debt. Every additional $1B borrowed at 4% costs $40M/year in interest — forever. The interest itself compounds.",
  },
  {
    category: "Employment Insurance (EI)",
    amount: 22.2,
    pctOfBudget: 4.6,
    trend: "Stable but system is outdated",
    roi: "MEDIUM. Provides critical safety net for job loss. But the system excludes gig workers, self-employed, and many part-time workers — the fastest growing segments of the workforce.",
    issue: "Only 40% of unemployed Canadians actually qualify for EI. The system was designed for a 1970s economy of full-time permanent jobs. The modern economy has left it behind.",
    betterAllocation: "Modernize eligibility to include gig/contract workers. Convert EI surplus (the fund consistently runs a surplus) into retraining programs — not just income replacement, but skill-building for the next job.",
  },
  {
    category: "Indigenous Services & Crown-Indigenous Relations",
    amount: 18.3,
    pctOfBudget: 3.8,
    trend: "Increasing — but outcomes not improving proportionally",
    roi: "LOW relative to spending — not because the cause isn't critical, but because money is filtered through bureaucracy before reaching communities. 30+ communities still under boil water advisories. Housing on reserves is in crisis. Education outcomes lag national average by decades.",
    issue: "Billions spent but outcomes remain poor. The system is designed for administration, not results. Indigenous communities often have better ideas for their own development than Ottawa does.",
    betterAllocation: "Direct funding to Indigenous governments (bypass federal bureaucracy). Community-led infrastructure decisions. Education funding parity with provincial systems. Clean water for every community — this should have been done years ago.",
  },
  {
    category: "Housing Programs (CMHC + National Housing Strategy)",
    amount: 8.9,
    pctOfBudget: 1.9,
    trend: "Increased but grossly insufficient for the scale of the crisis",
    roi: "LOW. National Housing Strategy promised 160,000 new units — delivered a fraction. CMHC's mandate shifted from building housing to insuring mortgages (backstopping bank risk). Government spends more on mortgage insurance bureaucracy than on building homes.",
    issue: "$8.9B sounds like a lot but the housing deficit is 3.5 million homes. At $400K/unit, closing the gap costs $1.4 TRILLION — 150x current spending. The money isn't even close to sufficient, and much of it goes to incentives and tax credits rather than building.",
    betterAllocation: "Stop subsidizing demand (first-time buyer incentives just raise prices). Start building supply: government-built rental housing (Vienna model), zoning reform (federal incentive to municipalities), modular/prefab housing factories, convert federal land to housing.",
  },
  {
    category: "Climate / Environmental Programs",
    amount: 11.2,
    pctOfBudget: 2.3,
    trend: "Increasing — includes carbon tax rebates",
    roi: "MIXED. Carbon tax is efficient (economists agree) but politically toxic. Most Canadians get more back in rebates than they pay. EV incentives benefit wealthier Canadians who can afford new cars. Green infrastructure spending has high long-term ROI but slow implementation.",
    issue: "Canada is 1.5% of global emissions. Even if Canada hit zero, global warming continues. The most impactful use of climate spending is adaptation (flood infrastructure, fire management, building codes) not just reduction.",
    betterAllocation: "Prioritize adaptation (fireproof communities, flood infrastructure, building codes for extreme weather). Nuclear power expansion (cleanest, most reliable baseload). Electric grid interconnection (export clean hydro from Quebec/Manitoba/BC to replace coal).",
  },
  {
    category: "Foreign Aid (International Assistance)",
    amount: 8.1,
    pctOfBudget: 1.7,
    trend: "Stable",
    roi: "VARIES. Some programs (vaccines, clean water, agricultural development) have exceptional ROI. Others are absorbed by bureaucracy, NGO overhead, or go to governments that don't deliver to citizens.",
    issue: "Canada has communities without clean water domestically while sending billions abroad. This is not an argument to cut all aid — but the optics and priorities are questionable when Nunavut has food insecurity rates of 46%.",
    betterAllocation: "Fix domestic infrastructure first (clean water for Indigenous communities, Northern food security). Maintain aid but restructure: direct-to-community programs over government-to-government transfers.",
  },
]

const WASTE_EXAMPLES = [
  { item: "ArriveCAN app", cost: "$59.5M", context: "A COVID border app that should have cost $2-5M. Outsourced to IT consultants who sub-sub-contracted. Multiple investigations. The Auditor General found 'a disregard for basic management and contracting practices.'", betterUse: "That $59.5M could have built 150 affordable housing units or funded clean water for 10 Indigenous communities." },
  { item: "Phoenix Pay System", cost: "$2.2B+ (and counting)", context: "IBM was hired to build a payroll system for federal employees. Launched in 2016, it immediately failed — underpaying, overpaying, or not paying 150,000+ public servants. 8 years later, still not fully fixed. The system it replaced worked fine.", betterUse: "$2.2B is enough to build 5,500 affordable homes, or fund the entire National Housing Strategy for 2 years." },
  { item: "Temporary Foreign Worker Program oversight", cost: "$Billions in depressed wages", context: "Not a direct cost, but TFW program allows employers to hire foreign workers at lower wages. Suppresses domestic wages in agriculture, food service, and hospitality. Employers use 'labour shortage' claims to justify hiring cheaper foreign workers instead of raising wages to attract Canadian workers.", betterUse: "If wages rose to market-clearing levels, more Canadians would fill these roles, reducing need for the program and increasing tax revenue." },
  { item: "WE Charity contract", cost: "$912M (cancelled)", context: "Government awarded a $912M student volunteer program contract to WE Charity while the PM's and Finance Minister's families had financial relationships with WE. Cancelled after public outcry. Ethics Commissioner found violations.", betterUse: "Direct student grants without middleman organizations. $912M in direct scholarships = 90,000 students receiving $10,000 each." },
  { item: "Senate of Canada (annual cost)", cost: "$120M/year", context: "105 appointed (not elected) senators, serving until age 75. Average annual cost per senator: $1.1M (salary + office + staff + travel). The Senate has been called 'a dumping ground for party faithful' by reformers from all parties.", betterUse: "Abolish or elect. If abolished, $120M/year could fund 1,200 affordable housing units per year, or eliminate the Indigenous boil water advisory list entirely." },
  { item: "Consulting fees (McKinsey, Deloitte, Accenture)", cost: "$15.7B (2022-2023)", context: "Federal government spent $15.7B on external consultants in a single year — nearly double from 5 years ago. This is for advice that internal public servants could often provide. The consulting firms then hire former public servants, creating a revolving door.", betterUse: "$15.7B = the entire National Housing Strategy budget for multiple years. Or: hire permanent public servants at 1/3 the cost of consultants to do the same work." },
]

export default function CanadaSpendingPage() {
  const [expandedSpend, setExpandedSpend] = useState<number | null>(null)

  const totalBudget = SPENDING.reduce((s, item) => s + item.amount, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Where Canada's Money Goes</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Federal budget breakdown: what we spend, what we get, and where the money would have more impact.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Follow the Money</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada's federal government spends approximately <strong>$480 billion per year</strong>. That is $12,000+ per citizen.
            The question is not whether the government spends enough — it is whether the money goes to the right places
            and produces results proportional to what is spent. This page breaks it down honestly, with the ROI
            analysis that government reports never include.
          </p>
        </CardContent>
      </Card>

      {/* Visual spending bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Budget Breakdown (Top 10 Categories)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SPENDING.sort((a, b) => b.amount - a.amount).map((item, i) => (
              <div key={i} className="cursor-pointer" onClick={() => setExpandedSpend(expandedSpend === i ? null : i)}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-muted-foreground w-40 truncate shrink-0">{item.category}</span>
                  <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full",
                      item.roi?.startsWith("ZERO") || item.roi?.startsWith("LOW") ? "bg-red-400" :
                      item.roi?.startsWith("HIGH") ? "bg-emerald-400" : "bg-amber-400"
                    )} style={{ width: `${(item.amount / SPENDING[0].amount) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold w-14 text-right shrink-0">${item.amount}B</span>
                </div>
                {expandedSpend === i && (
                  <Card className="mt-2 mb-3 ml-4">
                    <CardContent className="p-3 space-y-2 text-xs text-muted-foreground">
                      <p><strong>Trend:</strong> {item.trend}</p>
                      <p><strong>ROI Assessment:</strong> {item.roi}</p>
                      <p className="text-amber-700"><strong>Issue:</strong> {item.issue}</p>
                      {item.betterAllocation && (
                        <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2">
                          <p className="text-emerald-700"><strong>Better allocation:</strong> {item.betterAllocation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> High ROI</span>
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Mixed ROI</span>
            <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-red-400" /> Low/Zero ROI</span>
          </div>
        </CardContent>
      </Card>

      {/* Waste examples */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Documented Waste & Misallocation
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          These are not allegations — every example below has been confirmed by the Auditor General, Parliamentary committees, or public investigations.
        </p>
        <div className="space-y-3">
          {WASTE_EXAMPLES.map((w, i) => (
            <Card key={i} className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{w.item}</p>
                  <Badge variant="outline" className="text-xs text-red-500 border-red-300">{w.cost}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{w.context}</p>
                <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-2">
                  <p className="text-xs text-emerald-700"><strong>If redirected:</strong> {w.betterUse}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* The key insight */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The Core Problem</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Canada does not have a revenue problem — it has an allocation problem. The government collects $450B+ in revenue
            annually. If that money were allocated based on measurable outcomes and ROI, Canada could have:
            world-class healthcare with short wait times, affordable housing, clean water for every community,
            a capable military, and zero national debt within a generation. Instead, money flows to consulting firms,
            failed IT projects, bureaucratic overhead, and programs that sound good but deliver poorly. The issue is
            not how much Canada spends — it is what Canada gets for what it spends. Track the outcomes, not the announcements.
            Cross-reference specific politicians and their decisions on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Government of Canada Public Accounts, Parliamentary Budget Officer, Auditor General reports,
            CMHC, Statistics Canada, Department of Finance Budget documents. All data is from official public records.
            This page presents spending data with ROI analysis — it does not endorse any political party.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Sovereignty Report</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
        <a href="/education/economics" className="text-sm text-amber-600 hover:underline">Economics Education</a>
        <a href="/civilizations" className="text-sm text-violet-600 hover:underline">Civilizations</a>
      </div>
    </div>
  )
}
