"use client"

import { useState } from "react"
import { Scale, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PROMISES: {
  politician: string
  party: string
  promise: string
  when: string
  status: "kept" | "broken" | "partial" | "in-progress" | "abandoned"
  evidence: string
  impact: string
}[] = [
  // Carney (current PM)
  { politician: "Mark Carney", party: "Liberal", promise: "Build 500,000 homes per year", when: "2025 campaign", status: "in-progress", evidence: "Announced housing targets but implementation details scarce. Current pace: ~225K/year. Reaching 500K requires 2x current output.", impact: "If achieved: housing crisis begins to ease in 3-5 years. If not: prices continue rising." },
  { politician: "Mark Carney", party: "Liberal", promise: "Respond to US tariffs and strengthen economic sovereignty", when: "2025 campaign", status: "in-progress", evidence: "Trade negotiations ongoing. Some retaliatory measures. Diversification rhetoric but 75% of trade still with US.", impact: "Critical for economic independence. Progress needed within 12 months to be credible." },

  // Trudeau (former PM)
  { politician: "Justin Trudeau", party: "Liberal", promise: "Balance the budget by 2019", when: "2015 campaign", status: "broken", evidence: "Ran deficits every year from 2015-2025. National debt increased from $612B to $1.2T+. Never balanced.", impact: "$46.5B/year in interest payments. Every dollar of interest is a dollar that can't fund healthcare or housing." },
  { politician: "Justin Trudeau", party: "Liberal", promise: "Electoral reform — 2015 will be the last FPTP election", when: "2015 campaign", status: "abandoned", evidence: "Struck a committee, then abandoned the promise in 2017. Said 'Canadians don't want reform.' No referendum held.", impact: "FPTP continues to produce majority governments with 32-39% of the vote. Promised and broken." },
  { politician: "Justin Trudeau", party: "Liberal", promise: "End all long-term drinking water advisories on reserves by 2021", when: "2015 platform", status: "broken", evidence: "Reduced from 105 to ~30 advisories, but missed the 2021 deadline by years. Some lifted were replaced by new ones.", impact: "Progress was real but insufficient. 30+ communities still without clean water in 2025." },
  { politician: "Justin Trudeau", party: "Liberal", promise: "$10/day childcare across Canada", when: "2021 platform", status: "partial", evidence: "Agreements signed with all provinces. Fees reduced in most. But SPACES are insufficient — waitlists are years long in many cities. The price dropped but availability didn't keep up.", impact: "Where spaces exist: transformative for families. Where they don't: a promise on paper that can't be used." },
  { politician: "Justin Trudeau", party: "Liberal", promise: "Modest deficits under $10B/year", when: "2015 campaign", status: "broken", evidence: "Pre-COVID deficits exceeded $10B every year. COVID deficit: $327B (2020-21). Never achieved 'modest' deficits.", impact: "Debt doubled during his time in office. Not all COVID spending was wasteful, but the 'modest deficit' promise was abandoned immediately." },

  // Harper (former PM)
  { politician: "Stephen Harper", party: "Conservative", promise: "Senate reform (elected, term-limited)", when: "2006 campaign", status: "abandoned", evidence: "Appointed 59 senators (more than any PM before him). Referred to Supreme Court which said reform requires constitutional amendment. Abandoned.", impact: "The Senate remains appointed. $120M/year. Harper promised reform and then used the system as-is." },
  { politician: "Stephen Harper", party: "Conservative", promise: "Accountability and transparency in government", when: "2006 (Federal Accountability Act)", status: "partial", evidence: "Passed the Accountability Act (2006) — good legislation. But later muzzled scientists, limited media access, omnibus bills, prorogued Parliament twice to avoid accountability. Mixed record.", impact: "The Act itself was valuable. The practice of transparency declined over his tenure." },

  // Poilievre (Opposition Leader)
  { politician: "Pierre Poilievre", party: "Conservative", promise: "Axe the carbon tax", when: "2022-ongoing", status: "in-progress", evidence: "Core campaign promise. Would require winning government and passing legislation. Carbon tax remains in effect under current government.", impact: "Carbon tax costs average family $1,200-$2,400/year (offset by rebates for most). Removal would lower consumer costs but remove climate pricing signal." },
  { politician: "Pierre Poilievre", party: "Conservative", promise: "Build more homes by tying federal funding to municipal housing approvals", when: "2023-ongoing", status: "in-progress", evidence: "Opposition — cannot implement yet. Similar to a federal approach already partially adopted by current government. Concept is sound — tie infrastructure dollars to housing output.", impact: "If implemented: could accelerate approvals. Key question: would it actually result in more homes or just more approved permits?" },

  // Singh (NDP)
  { politician: "Jagmeet Singh", party: "NDP", promise: "National pharmacare", when: "Supply-and-confidence agreement 2022", status: "partial", evidence: "Pharmacare Act passed (2024) but covers only diabetes medication and contraception initially. Not the comprehensive pharmacare promised. Full coverage timeline unclear.", impact: "A start, but far from universal pharmacare. Drug costs remain among highest in the OECD for most Canadians." },
  { politician: "Jagmeet Singh", party: "NDP", promise: "Dental care for all Canadians", when: "Supply-and-confidence agreement 2022", status: "partial", evidence: "Canadian Dental Care Plan launched (2024). Covers low-income seniors, then expanding. Slow rollout. Dentists complaining about low reimbursement rates — some refusing to participate.", impact: "Meaningful for those enrolled. But 'dental care for all' is years away from full implementation. Many dentists not participating." },
]

const STATUS_CONFIG = {
  kept: { label: "Kept", color: "text-emerald-600 border-emerald-300 bg-emerald-50", icon: CheckCircle },
  broken: { label: "Broken", color: "text-red-500 border-red-300 bg-red-50", icon: XCircle },
  partial: { label: "Partially Kept", color: "text-amber-600 border-amber-300 bg-amber-50", icon: AlertTriangle },
  "in-progress": { label: "In Progress", color: "text-blue-600 border-blue-300 bg-blue-50", icon: Clock },
  abandoned: { label: "Abandoned", color: "text-slate-600 border-slate-300 bg-slate-50", icon: XCircle },
}

export default function PromiseTrackerPage() {
  const [filterPolitician, setFilterPolitician] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const politicians = [...new Set(PROMISES.map(p => p.politician))]
  const filtered = PROMISES.filter(p => {
    if (filterPolitician && p.politician !== filterPolitician) return false
    if (filterStatus && p.status !== filterStatus) return false
    return true
  })

  const keptCount = PROMISES.filter(p => p.status === "kept").length
  const brokenCount = PROMISES.filter(p => p.status === "broken" || p.status === "abandoned").length
  const partialCount = PROMISES.filter(p => p.status === "partial").length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-blue-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Political Promise Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What they promised. What they did. No spin — just receipts. Cross-reference on{" "}
          <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Aletheia</a>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{PROMISES.length}</p>
          <p className="text-[10px] text-muted-foreground">Tracked</p>
        </CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{keptCount}</p>
          <p className="text-[10px] text-muted-foreground">Kept</p>
        </CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{brokenCount}</p>
          <p className="text-[10px] text-muted-foreground">Broken/Abandoned</p>
        </CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{partialCount}</p>
          <p className="text-[10px] text-muted-foreground">Partial</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterPolitician(null)}
            className={cn("text-xs rounded-full px-3 py-1 border", !filterPolitician ? "bg-violet-100 border-violet-300 text-violet-700 font-semibold" : "border-border text-muted-foreground")}>All</button>
          {politicians.map(p => (
            <button key={p} onClick={() => setFilterPolitician(filterPolitician === p ? null : p)}
              className={cn("text-xs rounded-full px-3 py-1 border", filterPolitician === p ? "bg-violet-100 border-violet-300 text-violet-700 font-semibold" : "border-border text-muted-foreground")}>{p.split(" ").pop()}</button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? null : key)}
              className={cn("text-[10px] rounded-full px-2.5 py-0.5 border", filterStatus === key ? config.color + " font-semibold" : "border-border text-muted-foreground")}>{config.label}</button>
          ))}
        </div>
      </div>

      {/* Promises */}
      <div className="space-y-2">
        {filtered.map((p, i) => {
          const config = STATUS_CONFIG[p.status]
          const Icon = config.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.color.split(" ")[0])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-semibold">{p.politician}</span>
                      <Badge variant="outline" className="text-[9px]">{p.party}</Badge>
                      <Badge variant="outline" className={cn("text-[9px]", config.color)}>{config.label}</Badge>
                    </div>
                    <p className="text-sm font-medium">{p.promise}</p>
                    <p className="text-[10px] text-muted-foreground">{p.when}</p>
                  </div>
                  <ChevronDown className={cn("h-3 w-3 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-2 pl-7 space-y-1.5">
                    <p className="text-xs text-muted-foreground"><strong>Evidence:</strong> {p.evidence}</p>
                    <p className="text-xs text-amber-700"><strong>Impact:</strong> {p.impact}</p>
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
            <strong>This tracker covers all major parties equally.</strong> Broken promises are identified across
            Liberal, Conservative, and NDP. The goal is accountability, not partisanship. If a politician makes a
            promise, it should be tracked. If they break it, it should be documented. If they keep it, they deserve
            credit. Democracy works when citizens hold leaders to their words. Detailed voting records and lobbying
            connections are tracked on{" "}
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Aletheia</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
        <a href="/canada/spending" className="text-sm text-amber-600 hover:underline">Government Spending</a>
        <a href="/canada/trajectories" className="text-sm text-emerald-600 hover:underline">Trajectories</a>
        <a href="/logical-fallacies" className="text-sm text-red-600 hover:underline">Logical Fallacies</a>
      </div>
    </div>
  )
}
