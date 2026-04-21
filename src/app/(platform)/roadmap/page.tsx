"use client"

import { CheckCircle, Clock, Circle, Rocket, Shield, Globe2, Cpu, Users, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PHASES = [
  {
    phase: "Phase 1: Foundation",
    status: "complete",
    color: "border-emerald-300 bg-emerald-50/20",
    icon: CheckCircle,
    items: [
      { name: "190+ tools and pages", done: true },
      { name: "9 core modules (Health, Education, Governance, etc.)", done: true },
      { name: "28 Canada deep-dive pages", done: true },
      { name: "Financial toolkit (budget, debt, investing, tax, retirement)", done: true },
      { name: "Family toolkit (parenting, meals, meetings, chores, screen time)", done: true },
      { name: "Education library (economics, civilizations, rights, fallacies, propaganda)", done: true },
      { name: "Health protocols (evidence-based, compiled from research)", done: true },
      { name: "Aly voice + text assistant on both platforms", done: true },
      { name: "FOUND / VOICE / VERITAS token design", done: true },
      { name: "Client-side encryption (zero-knowledge architecture)", done: true },
      { name: "Feedback reward system (FOUND tokens for quality reports)", done: true },
      { name: "Data backup and export", done: true },
    ],
  },
  {
    phase: "Phase 2: Community & Social",
    status: "complete",
    color: "border-emerald-300 bg-emerald-50/20",
    icon: CheckCircle,
    items: [
      { name: "Discussion rooms (6 topics)", done: true },
      { name: "Direct messaging (encrypted)", done: true },
      { name: "Accountability partners", done: true },
      { name: "Family groups (private, invite-code)", done: true },
      { name: "Community insights (evidence-backed sharing)", done: true },
      { name: "Anonymized platform analytics", done: true },
      { name: "Knowledge Map (visual tool connections)", done: true },
      { name: "Smart recommendations (usage-based)", done: true },
    ],
  },
  {
    phase: "Phase 3: Blockchain (Solana)",
    status: "in-progress",
    color: "border-amber-300 bg-amber-50/20",
    icon: Clock,
    items: [
      { name: "FOUND token program (Anchor/Rust) — written", done: true },
      { name: "VOICE governance program — written", done: true },
      { name: "VERITAS claim staking program — written", done: true },
      { name: "Token claim bridge (off-chain → on-chain) — written", done: true },
      { name: "Wallet connection UI (Phantom)", done: true },
      { name: "Deploy to Solana devnet", done: false },
      { name: "Smart contract audit", done: false },
      { name: "Deploy to Solana mainnet", done: false },
      { name: "Burn mint authority (lock supply forever)", done: false },
      { name: "On-chain governance (proposals + voting)", done: false },
    ],
  },
  {
    phase: "Phase 4: DePIN Network",
    status: "planned",
    color: "border-blue-300 bg-blue-50/20",
    icon: Circle,
    items: [
      { name: "Node operator software (lightweight daemon)", done: false },
      { name: "Storage nodes (Raspberry Pi, NAS)", done: false },
      { name: "Compute nodes (PC, GPU — AI processing)", done: false },
      { name: "Edge nodes (phone, TV — content caching)", done: false },
      { name: "Validator nodes (proof verification, Solana anchoring)", done: false },
      { name: "Proof of Storage / Proof of Compute challenges", done: false },
      { name: "Node reward distribution (FOUND earnings)", done: false },
      { name: "Replace centralized servers with distributed network", done: false },
    ],
  },
  {
    phase: "Phase 5: Full Decentralization",
    status: "planned",
    color: "border-violet-300 bg-violet-50/20",
    icon: Circle,
    items: [
      { name: "Frontend hosted on IPFS (no single server)", done: false },
      { name: "Backend logic in Solana programs", done: false },
      { name: "Data in distributed network (erasure-coded, encrypted)", done: false },
      { name: "Governance fully on-chain (VOICE token holders decide)", done: false },
      { name: "Aletheia claims anchored immutably on Solana", done: false },
      { name: "ZK-proofs for identity (prove things without revealing data)", done: false },
      { name: "Multi-chain bridge (Solana → Cardano → Ethereum)", done: false },
      { name: "Platform runs without any central team", done: false },
    ],
  },
  {
    phase: "Phase 6: Global Expansion",
    status: "future",
    color: "border-slate-300 bg-slate-50/20",
    icon: Circle,
    items: [
      { name: "US sovereignty report (same framework as Canada)", done: false },
      { name: "Americas economic integration analysis", done: false },
      { name: "European country reports", done: false },
      { name: "French language support", done: false },
      { name: "Spanish language support", done: false },
      { name: "Global financial literacy curriculum", done: false },
      { name: "Aletheia expansion: EU Parliament, UK Parliament, global figures", done: false },
      { name: "Mobile app (React Native or PWA)", done: false },
    ],
  },
]

export default function RoadmapPage() {
  const totalItems = PHASES.reduce((s, p) => s + p.items.length, 0)
  const doneItems = PHASES.reduce((s, p) => s + p.items.filter(i => i.done).length, 0)
  const pct = Math.round((doneItems / totalItems) * 100)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Platform Roadmap</h1>
        </div>
        <p className="text-sm text-muted-foreground">Where we are, what's next, and where we're going. Transparent. Always.</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{doneItems}/{totalItems} ({pct}%)</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {PHASES.map((phase, pi) => {
          const Icon = phase.icon
          const done = phase.items.filter(i => i.done).length
          return (
            <Card key={pi} className={cn("overflow-hidden", phase.color)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={cn("h-5 w-5",
                    phase.status === "complete" ? "text-emerald-500" :
                    phase.status === "in-progress" ? "text-amber-500" : "text-muted-foreground/40"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{phase.phase}</p>
                    <p className="text-[10px] text-muted-foreground">{done}/{phase.items.length} complete</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px]",
                    phase.status === "complete" ? "text-emerald-600 border-emerald-300" :
                    phase.status === "in-progress" ? "text-amber-600 border-amber-300" :
                    phase.status === "planned" ? "text-blue-600 border-blue-300" :
                    "text-slate-500 border-slate-300"
                  )}>{phase.status === "complete" ? "Complete" : phase.status === "in-progress" ? "In Progress" : phase.status === "planned" ? "Planned" : "Future"}</Badge>
                </div>
                <div className="space-y-1">
                  {phase.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      {item.done
                        ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                      }
                      <span className={cn("text-xs", item.done ? "text-muted-foreground" : "")}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This roadmap is a living document.</strong> It changes based on community feedback, governance votes
            (once VOICE tokens are live), and real-world priorities. Every completed item was built in response to
            actual user needs. The roadmap is transparent because you deserve to know where your platform is going.
            Want to influence what comes next? Use the <a href="/report-issue" className="text-violet-600 hover:underline">feedback system</a> or
            join the <a href="/community/hub" className="text-violet-600 hover:underline">community discussion</a>.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/why" className="text-sm text-violet-600 hover:underline">Why This Exists</a>
        <a href="/platform-stats" className="text-sm text-blue-600 hover:underline">Platform Stats</a>
        <a href="/privacy-architecture" className="text-sm text-emerald-600 hover:underline">Privacy Architecture</a>
        <a href="/about" className="text-sm text-slate-600 hover:underline">About</a>
      </div>
    </div>
  )
}
