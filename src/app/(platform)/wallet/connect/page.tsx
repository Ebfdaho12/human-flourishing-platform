"use client"

import { useState } from "react"
import { Wallet, Shield, Zap, Globe2, ArrowRight, CheckCircle, AlertTriangle, Cpu } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

export default function WalletConnectPage() {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  async function connectPhantom() {
    setConnecting(true)
    try {
      const provider = (window as any)?.phantom?.solana
      if (!provider) {
        window.open("https://phantom.app/", "_blank")
        setConnecting(false)
        return
      }
      const resp = await provider.connect()
      setWalletAddress(resp.publicKey.toString())
      setConnected(true)
    } catch (e) {
      console.error(e)
    }
    setConnecting(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Connect Solana Wallet</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Link your Solana wallet to claim FOUND tokens, participate in governance, and run a network node.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2">Why Connect a Wallet?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your FOUND tokens earned on the platform will be claimable to your Solana wallet. Once on-chain,
            they are <strong>yours forever</strong> — no company, government, or platform can take them, freeze them,
            or inflate them. The wallet also enables: governance voting (VOICE), claim staking (VERITAS on Aletheia),
            and node operator rewards. Your wallet is your key to the decentralized version of this platform.
          </p>
        </CardContent>
      </Card>

      {/* Connection status */}
      {connected ? (
        <Card className="border-2 border-emerald-300 bg-emerald-50/20">
          <CardContent className="p-5 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-emerald-700">Wallet Connected!</p>
            <p className="text-xs font-mono text-muted-foreground mt-2 break-all">{walletAddress}</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg bg-white/50 p-2 text-center">
                <p className="text-sm font-bold text-violet-600">0</p>
                <p className="text-[10px] text-muted-foreground">FOUND (claimable soon)</p>
              </div>
              <div className="rounded-lg bg-white/50 p-2 text-center">
                <p className="text-sm font-bold text-indigo-600">0</p>
                <p className="text-[10px] text-muted-foreground">VOICE</p>
              </div>
              <div className="rounded-lg bg-white/50 p-2 text-center">
                <p className="text-sm font-bold text-amber-600">0</p>
                <p className="text-[10px] text-muted-foreground">VERITAS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Button onClick={connectPhantom} disabled={connecting}
            className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base">
            <Wallet className="h-5 w-5 mr-2" />
            {connecting ? "Connecting..." : "Connect Phantom Wallet"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Don't have a wallet? <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Get Phantom</a> (free, 2 minutes).
            Also compatible with: Solflare, Backpack, Ledger.
          </p>
        </div>
      )}

      {/* What you unlock */}
      <div>
        <h2 className="text-lg font-bold mb-3">What Your Wallet Unlocks</h2>
        <div className="space-y-2">
          {[
            { icon: Zap, title: "Claim FOUND Tokens", desc: "Transfer your earned FOUND from the platform to your personal wallet. Once on-chain, they are truly yours.", status: "Coming Phase 1" },
            { icon: Shield, title: "Governance Voting", desc: "Stake FOUND → earn VOICE → vote on platform proposals. Your voice shapes the platform's direction.", status: "Coming Phase 2" },
            { icon: Globe2, title: "Claim Staking (VERITAS)", desc: "Stake VERITAS on claims in Aletheia. Correct = 1.8x return. Incentivizes truth-seeking.", status: "Coming Phase 3" },
            { icon: Cpu, title: "Node Operator Rewards", desc: "Contribute hardware (Raspberry Pi, PC, phone) to the distributed network. Earn FOUND for uptime and service.", status: "Coming Phase 4" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i}>
                <CardContent className="p-3 flex items-start gap-3">
                  <Icon className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge variant="outline" className="text-[8px]">{item.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Node operator preview */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-500" /> Become a Node Operator
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The platform will run on a distributed network of user-contributed hardware instead of centralized
            cloud servers. Contribute your idle devices and earn FOUND daily:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: "Storage Node", device: "Raspberry Pi / NAS / old PC", earn: "10-50 FOUND/day", req: "10GB+ storage, always-on" },
              { type: "Compute Node", device: "Desktop PC / GPU", earn: "50-500 FOUND/day", req: "4+ cores, 8GB+ RAM" },
              { type: "Edge Node", device: "Phone / Tablet / Smart TV", earn: "5-20 FOUND/day", req: "Internet, background app" },
              { type: "Validator Node", device: "High-spec server", earn: "100-1,000 FOUND/day", req: "8+ cores, 16GB+, 10K FOUND stake" },
            ].map((n, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5">
                <p className="text-xs font-semibold">{n.type}</p>
                <p className="text-[10px] text-muted-foreground">{n.device}</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{n.earn}</p>
                <p className="text-[10px] text-muted-foreground">{n.req}</p>
              </div>
            ))}
          </div>
          <Badge variant="outline" className="text-[9px]">Node software launching Phase 4</Badge>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Security note:</strong> Connecting your wallet only gives the platform READ access to your public
            address. It cannot move funds, sign transactions, or access private keys without your explicit
            approval for each action. Your wallet, your keys, your tokens. Always.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/wallet" className="text-sm text-violet-600 hover:underline">Current Wallet</a>
        <a href="/tokens" className="text-sm text-amber-600 hover:underline">Token Economy</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
