"use client"

import { useState } from "react"
import { Cpu, Zap, HardDrive, Globe2, Shield, TrendingUp, Download, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const NODE_TYPES = [
  {
    type: "Storage Node",
    icon: HardDrive,
    color: "from-blue-500 to-cyan-600",
    earn: "10-50 FOUND/day",
    device: "Raspberry Pi, NAS, old PC, external hard drive",
    requirements: ["10GB+ available storage", "Always-on internet connection", "Run the HFP node daemon"],
    howItWorks: "Your device stores encrypted shards of platform data. No single node has complete data — it is split across many nodes using erasure coding. If your node goes offline, the network reconstructs from other copies. You earn FOUND proportional to storage contributed and uptime.",
    stake: "No FOUND stake required (but staking increases rewards)",
  },
  {
    type: "Compute Node",
    icon: Cpu,
    color: "from-violet-500 to-purple-600",
    earn: "50-500 FOUND/day",
    device: "Desktop PC, GPU (gaming PC, workstation)",
    requirements: ["4+ CPU cores (8+ preferred)", "8GB+ RAM (16+ preferred)", "GPU optional but earns more", "Stable internet"],
    howItWorks: "Your device processes platform tasks: AI insights generation, search indexing, data analysis, Aletheia fact-checking computations. Jobs are distributed across compute nodes — you pick up work, complete it, and get paid. GPU nodes handle heavier AI workloads and earn significantly more.",
    stake: "1,000+ FOUND staked recommended (higher stake = priority for high-value jobs)",
  },
  {
    type: "Edge Node",
    icon: Globe2,
    color: "from-emerald-500 to-teal-600",
    earn: "5-20 FOUND/day",
    device: "Phone, tablet, smart TV, any internet device",
    requirements: ["Internet connection", "HFP app running in background", "Minimal resources used"],
    howItWorks: "Your device caches frequently accessed content and serves it to nearby users — like a personal CDN. When someone near you loads a page, your device can serve the cached version faster than a distant server. You earn FOUND for bandwidth contributed. The app uses minimal battery and data.",
    stake: "No stake required",
  },
  {
    type: "Validator Node",
    icon: Shield,
    color: "from-amber-500 to-orange-600",
    earn: "100-1,000 FOUND/day",
    device: "Dedicated server, high-spec PC (always on)",
    requirements: ["8+ CPU cores", "16GB+ RAM", "100GB+ SSD", "High-speed internet", "99.9%+ uptime", "10,000+ FOUND staked"],
    howItWorks: "Validators are the backbone of the network. They verify content hashes, validate computation results from other nodes, anchor proofs to Solana, and maintain consensus on the truth database. This is the highest-responsibility role — and the highest-earning. Validators must stake significant FOUND as collateral (slashed for misbehavior).",
    stake: "10,000+ FOUND staked (required — slashed if node misbehaves or goes offline)",
  },
]

export default function NodeOperatorPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [registered, setRegistered] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Node Operator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Contribute your idle hardware. Earn FOUND daily. Replace centralized servers with the world's devices.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">The <Explain tip="Decentralized Physical Infrastructure Network — a network where real-world hardware is contributed by users instead of owned by a company. Users earn tokens for running the infrastructure. Examples: Helium (WiFi), Filecoin (storage), Render (GPU). HFP uses this model for ALL its infrastructure">DePIN</Explain> Vision</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Right now, the platform runs on Vercel servers (centralized). The goal: replace those servers with
            <strong> thousands of user-contributed devices</strong>. Your Raspberry Pi stores data. Your PC processes
            AI. Your phone caches content. Every device earns FOUND tokens. No Amazon. No Google. No single point
            of failure. The network belongs to everyone who runs it.
          </p>
        </CardContent>
      </Card>

      {/* Node types */}
      <div className="space-y-3">
        {NODE_TYPES.map((node, i) => {
          const Icon = node.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", node.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{node.type}</p>
                    <p className="text-[10px] text-muted-foreground">{node.device}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{node.earn}</p>
                    <Badge variant="outline" className="text-[8px]">Phase 4</Badge>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Requirements</p>
                      <ul className="space-y-0.5">
                        {node.requirements.map((r, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5">
                      <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">How It Works</p>
                      <p className="text-xs text-blue-700">{node.howItWorks}</p>
                    </div>
                    <p className="text-xs text-muted-foreground"><strong>Staking:</strong> {node.stake}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Network stats (future — shows live once network launches) */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Network Status
        </CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div><p className="text-lg font-bold text-blue-600">0</p><p className="text-[10px] text-muted-foreground">Storage Nodes</p></div>
            <div><p className="text-lg font-bold text-violet-600">0</p><p className="text-[10px] text-muted-foreground">Compute Nodes</p></div>
            <div><p className="text-lg font-bold text-emerald-600">0</p><p className="text-[10px] text-muted-foreground">Edge Nodes</p></div>
            <div><p className="text-lg font-bold text-amber-600">0</p><p className="text-[10px] text-muted-foreground">Validators</p></div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Network launches Phase 4. Join the waitlist to be notified.</p>
        </CardContent>
      </Card>

      {/* Waitlist */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-5 text-center">
          {!registered ? (
            <>
              <p className="text-sm font-semibold mb-2">Join the Node Operator Waitlist</p>
              <p className="text-xs text-muted-foreground mb-3">Be among the first to earn FOUND by running a node. Early operators get bonus rewards.</p>
              <Button onClick={() => setRegistered(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <Cpu className="h-4 w-4" /> Join Waitlist
              </Button>
            </>
          ) : (
            <>
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-700">You are on the waitlist!</p>
              <p className="text-xs text-muted-foreground mt-1">We will notify you when the node software is ready. Early operators get 2x rewards for the first 90 days.</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* How it compares */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Why This Beats Traditional Cloud</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Cost</span><span className="text-emerald-600 font-medium">1/10th of AWS/GCP (idle hardware is nearly free)</span></div>
          <div className="flex justify-between"><span>Resilience</span><span className="text-emerald-600 font-medium">No single point of failure (thousands of nodes)</span></div>
          <div className="flex justify-between"><span>Privacy</span><span className="text-emerald-600 font-medium">No company holds all data (sharded + encrypted)</span></div>
          <div className="flex justify-between"><span>Censorship</span><span className="text-emerald-600 font-medium">No government can order one company to shut it down</span></div>
          <div className="flex justify-between"><span>Incentives</span><span className="text-emerald-600 font-medium">Operators earn from the network they support</span></div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/wallet/connect" className="text-sm text-violet-600 hover:underline">Connect Wallet</a>
        <a href="/wallet" className="text-sm text-amber-600 hover:underline">Token Wallet</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
