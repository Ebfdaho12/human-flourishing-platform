"use client"

import { Server, Cpu, HardDrive, Wifi, Smartphone, Monitor, Car, Zap, Shield, DollarSign, Users, Globe, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useState } from "react"

function Section({ title, icon: Icon, color, defaultOpen, children }: { title: string; icon: any; color: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen || false)
  return (
    <div className="rounded-lg border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
        <Icon className={cn("h-4 w-4 shrink-0", color)} />
        <span className="text-sm font-semibold flex-1">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

export default function DePINPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Server className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold"><Explain tip="Decentralized Physical Infrastructure Network — instead of renting servers from Amazon or Google, the platform runs on hardware contributed by users around the world. You contribute your device, the platform uses a fraction of its resources, you earn tokens.">DePIN</Explain>: Power the Network</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Contribute your hardware — any device with internet — to run the platform. Replace corporate servers with people-powered infrastructure. Earn tokens for every cycle.
        </p>
      </div>

      <Card className="border-2 border-cyan-200 bg-cyan-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-cyan-900 mb-2">Why DePIN?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Right now, this platform runs on <Explain tip="Vercel is a cloud hosting company. They rent server space from Amazon Web Services (AWS). So ultimately, Amazon controls the physical infrastructure. If Amazon decides to shut us down, they can.">Vercel servers (Amazon infrastructure)</Explain>.
            That means Amazon could theoretically shut it down. A government could pressure Amazon to remove it.
            <strong> DePIN makes that impossible.</strong> If the platform runs on 10,000 devices owned by 10,000 different people
            in 50 different countries — no single entity can shut it all down. It's like trying to shut down BitTorrent
            or email. You'd have to shut down the entire internet.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <strong>Plus:</strong> you earn <Explain tip="FOUND tokens are the Human Flourishing Platform's utility token. 369,369,369 max supply. Earned by contributing to the platform — health tracking, data contribution, AND running DePIN nodes. Will be on Solana blockchain.">FOUND tokens</Explain> for
            every minute your device contributes compute, storage, or bandwidth to the network.
          </p>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">How It Works — Simply</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { step: "1", title: "Install the node software", desc: "Download a small program (or Docker container) that runs in the background on your device. It uses a fraction of your CPU, RAM, storage, and internet — you set the limits." },
              { step: "2", title: "Your device joins the network", desc: "It connects to other nodes around the world. Together, all the nodes store data, serve web pages, process requests, and validate transactions — the same things a server does, but distributed across thousands of devices." },
              { step: "3", title: "You earn FOUND tokens", desc: "Every minute your node is online and contributing, you earn tokens. More powerful hardware = more tokens. But even a Raspberry Pi earns something. The network rewards ANY contribution." },
              { step: "4", title: "The platform becomes unstoppable", desc: "With enough nodes, no single company, government, or entity can shut down the platform. The data is replicated across nodes. If one goes offline, others have copies. This is true decentralization." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">{item.step}</div>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What devices can contribute */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Devices Can Contribute?</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Almost anything with an internet connection and a processor. You set limits on how much each device contributes — never more than you're comfortable with.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { device: "Desktop / Laptop", icon: Monitor, contribution: "CPU: 1-8 cores, RAM: 100MB-4GB, Storage: 1-100GB, Bandwidth: 1-50 Mbps", reward: "High", note: "Best contributor — most resources available", suitable: true },
              { device: "Raspberry Pi", icon: Cpu, contribution: "CPU: 1-4 cores, RAM: 100MB-1GB, Storage: 1-32GB, Bandwidth: 1-10 Mbps", reward: "Low-Medium", note: "Perfect always-on node. $35-80 hardware, runs 24/7 on 5W power", suitable: true },
              { device: "Old Smartphone", icon: Smartphone, contribution: "CPU: 1-2 cores, RAM: 100MB-512MB, Storage: 1-16GB, Bandwidth: WiFi", reward: "Low", note: "That old phone in your drawer? It can still contribute. Plug in, connect to WiFi, run the node.", suitable: true },
              { device: "Current Smartphone", icon: Smartphone, contribution: "CPU: 1-4 cores, RAM: 100MB-2GB, Storage: 1-32GB, Bandwidth: WiFi/5G", reward: "Medium", note: "Runs in background when on WiFi and charging. Pauses when you're actively using the phone.", suitable: true },
              { device: "Smart TV", icon: Monitor, contribution: "CPU: 1-2 cores, RAM: 100MB, Storage: 1-8GB, Bandwidth: WiFi", reward: "Low", note: "Smart TVs have processors that sit idle 90% of the time. Android-based TVs can run the node app.", suitable: true },
              { device: "Tesla / Connected Vehicle", icon: Car, contribution: "CPU: 2-8 cores (MCU), RAM: 1-4GB, Storage: 10-100GB, Bandwidth: LTE", reward: "Medium-High", note: "Modern vehicles have powerful computers. While parked and connected to WiFi, they can contribute significant resources. Tesla's Linux-based system is particularly suitable.", suitable: true },
              { device: "NAS / Home Server", icon: HardDrive, contribution: "CPU: 2-8 cores, RAM: 2-16GB, Storage: 1TB+, Bandwidth: Gigabit", reward: "Very High", note: "Synology, QNAP, or any Linux NAS. Already running 24/7. Perfect storage node.", suitable: true },
              { device: "Cloud VPS", icon: Globe, contribution: "CPU: 1-8 cores, RAM: 1-8GB, Storage: 10-100GB, Bandwidth: 100Mbps+", reward: "High", note: "If you already rent a VPS ($5-20/mo), running a node earns tokens that offset the cost.", suitable: true },
            ].map((d, i) => {
              const Icon = d.icon
              return (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-cyan-500" />
                    <p className="text-xs font-semibold">{d.device}</p>
                    <Badge variant="outline" className={cn("text-[8px]", d.reward === "Very High" || d.reward === "High" ? "border-emerald-300 text-emerald-700" : d.reward === "Medium-High" || d.reward === "Medium" ? "border-blue-300 text-blue-700" : "border-amber-300 text-amber-700")}>{d.reward} reward</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-mono">{d.contribution}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{d.note}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Node types */}
      <Section title="Node Types — What Your Device Actually Does" icon={Server} color="text-cyan-500" defaultOpen>
        <div className="space-y-2">
          {[
            { type: "Storage Node", desc: "Stores encrypted data (health records, investigation files, figure profiles). Your device holds a piece of the global database. Data is encrypted — you can't read it, you just store it.", resources: "Needs: storage space (1GB-1TB). Low CPU/RAM.", reward: "Paid per GB stored per month", icon: HardDrive },
            { type: "Compute Node", desc: "Processes requests — serves web pages, runs search queries, computes correlations. When someone opens the platform, your device may serve part of their request.", resources: "Needs: CPU cores + RAM. Storage less important.", reward: "Paid per computation cycle", icon: Cpu },
            { type: "Edge Node", desc: "Caches frequently accessed content close to users in your geographic area. Reduces latency — the platform loads faster for people near your node.", resources: "Needs: bandwidth + moderate storage. Low CPU.", reward: "Paid per bandwidth served", icon: Wifi },
            { type: "Validator Node", desc: "Validates transactions on the Solana blockchain — token transfers, staking events, governance votes. Requires staking FOUND tokens as collateral.", resources: "Needs: reliable uptime (99%+), moderate CPU/RAM, fast internet.", reward: "Highest reward — but requires stake", icon: Shield },
          ].map((node, i) => {
            const Icon = node.icon
            return (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-cyan-500" />
                  <p className="text-xs font-semibold">{node.type}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{node.desc}</p>
                <p className="text-[9px] text-cyan-600 mt-1"><strong>Resources:</strong> {node.resources}</p>
                <p className="text-[9px] text-emerald-600"><strong>Reward:</strong> {node.reward}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Resource allocation */}
      <Section title="You Control the Limits" icon={Cpu} color="text-blue-500">
        <p className="text-xs text-muted-foreground mb-2">You decide exactly how much of your device the network can use. Set it once, adjust anytime.</p>
        <div className="rounded-lg bg-slate-50 border p-3 font-mono text-[10px] space-y-1">
          <p>CPU cores:     <span className="text-cyan-600">[1] [2] [4] [8] [custom]</span> — how many cores to dedicate</p>
          <p>RAM:           <span className="text-cyan-600">[100MB] [512MB] [1GB] [2GB] [4GB]</span> — memory limit</p>
          <p>Storage:       <span className="text-cyan-600">[1GB] [10GB] [50GB] [100GB] [500GB] [1TB]</span></p>
          <p>Bandwidth:     <span className="text-cyan-600">[1Mbps] [5Mbps] [10Mbps] [50Mbps] [unlimited]</span></p>
          <p>Active hours:  <span className="text-cyan-600">[always] [9pm-7am only] [when charging] [when idle]</span></p>
          <p>Power mode:    <span className="text-cyan-600">[eco] [balanced] [performance]</span></p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Example: "Use 1 CPU core, 512MB RAM, 10GB storage, only when I'm on WiFi and charging, from 11pm to 7am."
          That's enough to be a useful storage node and earn tokens while you sleep.
        </p>
      </Section>

      {/* Security */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">Security & Privacy</p>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Your data is safe:</strong> The node software runs in a <Explain tip="A sandbox is an isolated environment. The node software can only access what you explicitly allow — it can't read your files, photos, messages, or anything else on your device.">sandboxed container</Explain>. It cannot access your personal files, photos, or any data outside its designated storage area.</p>
            <p><strong>Stored data is encrypted:</strong> Data stored on your node is <Explain tip="AES-256-GCM encryption means the data stored on your device is scrambled. You don't have the key. You're just providing storage — like a safe deposit box where only the owner has the key.">AES-256-GCM encrypted</Explain>. You store it but can't read it. You're a custodian, not an observer.</p>
            <p><strong>No admin access:</strong> The node software doesn't need root/admin permissions. It runs with the minimum privileges necessary.</p>
            <p><strong>You can stop anytime:</strong> Shut down the node, delete it, revoke access. Your device, your rules. The network redistributes your data to other nodes automatically.</p>
            <p><strong>Open source:</strong> The node software code is public. Anyone can audit it. If it did anything malicious, thousands of developers would see it.</p>
          </div>
        </CardContent>
      </Card>

      {/* The vision */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> The Vision: People-Powered Infrastructure</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Imagine 100,000 devices across 100 countries — Raspberry Pis in garages, old phones on nightstands,
            NAS boxes in basements, Teslas in parking lots — all contributing a small slice of their idle resources.
            Together, they form a network more resilient than any corporate data center. No single point of failure.
            No company to pressure. No server to seize. The truth protocol runs on the same infrastructure principle
            as the internet itself: distributed, redundant, unstoppable.
          </p>
          <p className="text-xs text-violet-700 font-medium mt-2">
            Your old phone isn't obsolete — it's a node in the truth network. Your Raspberry Pi isn't a toy — it's
            critical infrastructure. Every device contributes. Every contribution earns. The network gets stronger
            with every node that joins.
          </p>
        </CardContent>
      </Card>

      {/* Coming soon */}
      <Card className="border-slate-200 bg-slate-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Status:</strong> The DePIN node software is in development. The Solana blockchain deployment (this weekend)
            is the first step — tokens on-chain. The node registration system is designed
            (see <code className="bg-muted px-1 rounded text-[10px]">blockchain/programs/found-token/src/lib.rs</code> — register_node function).
            The node software itself (Rust/Go daemon) is next after blockchain deployment.
            Join the waitlist by registering on the platform.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/earn" className="text-sm text-emerald-600 hover:underline">Earn With Your AI</a>
        <a href="/staking-guide" className="text-sm text-violet-600 hover:underline">Staking Guide</a>
        <a href="/tokens" className="text-sm text-amber-600 hover:underline">Token Economics</a>
        <a href="/wallet" className="text-sm text-blue-600 hover:underline">Your Wallet</a>
        <a href="/privacy-architecture" className="text-sm text-emerald-600 hover:underline">Privacy Architecture</a>
      </div>
    </div>
  )
}
