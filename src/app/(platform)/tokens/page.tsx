"use client"

import { Coins, Vote, Lock, TrendingUp, Shield, Users, Zap, Gift, ArrowRight, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function TokensPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">FOUND & VOICE Tokens</h1>
        <p className="text-sm text-muted-foreground mt-1">How the token economy works — everything you need to know</p>
      </div>

      {/* Token overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-violet-700">FOUND</h2>
                <p className="text-xs text-violet-500">Utility Token</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-violet-100">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">Utility · Transferable</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-violet-100">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-medium">369,369,369 FOUND</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-violet-100">
                <span className="text-muted-foreground">Emission</span>
                <span className="font-medium">Earned through activity</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-violet-100">
                <span className="text-muted-foreground">Precision</span>
                <span className="font-medium">6 decimals (micro-FOUND)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Can stake?</span>
                <span className="font-medium text-violet-600">Yes → earns VOICE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-700">VOICE</h2>
                <p className="text-xs text-indigo-500">Governance Token</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-indigo-100">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">Governance · Non-transferable</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-indigo-100">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-medium">No cap (earned through staking)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-indigo-100">
                <span className="text-muted-foreground">Emission</span>
                <span className="font-medium">1 VOICE per 1,000 FOUND / 90 days</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-indigo-100">
                <span className="text-muted-foreground">Transferable?</span>
                <span className="font-medium text-red-500">No — soulbound</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">On unstake?</span>
                <span className="font-medium text-amber-600">Burns all VOICE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How FOUND works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-violet-500" /> How FOUND Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Section title="What is it?" icon={HelpCircle}>
            FOUND is the utility token of the Human Flourishing Platform. You earn it by doing meaningful things — logging health data, learning, tracking governance, contributing to science. It's the platform's way of recognizing and rewarding genuine engagement.
          </Section>

          <Section title="Finite supply" icon={Shield}>
            Total supply is capped at <strong>369,369,369 FOUND</strong>. No more will ever be created. As the platform grows and more users earn FOUND, each token becomes harder to earn — similar to how Bitcoin mining gets harder over time. This creates natural scarcity without artificial inflation.
          </Section>

          <Section title="How you earn it" icon={Gift}>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { action: "Create account", amount: "100" },
                { action: "Complete profile", amount: "200" },
                { action: "First health log", amount: "25" },
                { action: "Week health streak", amount: "50" },
                { action: "Month health streak", amount: "200" },
                { action: "First mood check-in", amount: "25" },
                { action: "Complete tutoring session", amount: "10" },
                { action: "Pre-register study", amount: "100" },
                { action: "Peer review", amount: "50" },
                { action: "Submit replication", amount: "75" },
                { action: "Track civic action", amount: "15" },
                { action: "Log renewable energy", amount: "10" },
              ].map(item => (
                <div key={item.action} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-1.5">
                  <span className="text-xs">{item.action}</span>
                  <span className="text-xs font-bold text-violet-600">+{item.amount}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="What you can do with it" icon={Zap}>
            <ul className="space-y-1.5 mt-1 text-sm text-muted-foreground">
              <li>• <strong>Stake for VOICE</strong> — lock FOUND to earn governance power over the platform</li>
              <li>• <strong>Tip contributors</strong> — reward people who add valuable data (coming soon)</li>
              <li>• <strong>Unlock features</strong> — premium analytics and priority support (coming soon)</li>
              <li>• <strong>Fund bounties</strong> — post rewards for specific research or data contributions (coming soon)</li>
            </ul>
          </Section>
        </CardContent>
      </Card>

      {/* How VOICE works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Vote className="h-4 w-4 text-indigo-500" /> How VOICE Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Section title="What is it?" icon={HelpCircle}>
            VOICE is governance power. It gives you a say in how the platform is run — what features get built, how the token economy evolves, what policies are adopted. The more VOICE you have, the more weight your vote carries.
          </Section>

          <Section title="How you earn it" icon={TrendingUp}>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 mt-2">
              <p className="text-sm font-medium text-indigo-700">Stake FOUND → Earn VOICE</p>
              <p className="text-xs text-indigo-600 mt-1">
                Rate: <strong>1 VOICE per 1,000 FOUND staked per 90 days</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Example: Stake 5,000 FOUND for 90 days → earn 5 VOICE. Stake for 180 days → earn 10 VOICE.
                The longer you stake, the more governance power you accumulate.
              </p>
            </div>
          </Section>

          <Section title="Why it's non-transferable" icon={Lock}>
            VOICE can't be bought, sold, or transferred. You can only earn it through staking. This prevents whales from buying governance power — the only way to get VOICE is through genuine long-term commitment to the platform. If you unstake your FOUND, all your accumulated VOICE burns.
          </Section>

          <Section title="What you vote on" icon={Users}>
            <ul className="space-y-1.5 mt-1 text-sm text-muted-foreground">
              <li>• Feature priorities — what gets built next</li>
              <li>• Token economy changes — emission rates, staking terms</li>
              <li>• Platform policies — moderation, privacy, data handling</li>
              <li>• Module additions — new systems and integrations</li>
              <li>• Fund allocation — how platform revenue is distributed</li>
            </ul>
          </Section>
        </CardContent>
      </Card>

      {/* Staking flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The Staking Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 text-center">
            {[
              { icon: Gift, label: "Earn FOUND", desc: "Through platform activity", color: "bg-violet-100 text-violet-600" },
              { icon: Lock, label: "Stake FOUND", desc: "Lock tokens for 90+ days", color: "bg-amber-100 text-amber-600" },
              { icon: Vote, label: "Earn VOICE", desc: "1 per 1,000 FOUND / 90 days", color: "bg-indigo-100 text-indigo-600" },
              { icon: Users, label: "Govern", desc: "Vote on platform decisions", color: "bg-emerald-100 text-emerald-600" },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", step.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold mt-2">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                  </div>
                  {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground/30 hidden md:block" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key design principles */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardHeader>
          <CardTitle className="text-base">Why It's Designed This Way</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">No pump-and-dump:</strong> FOUND has a capped supply and is earned through genuine activity, not purchased on exchanges. Value comes from utility, not speculation.</p>
          <p><strong className="text-foreground">Governance can't be bought:</strong> VOICE is non-transferable and only earned through staking. This means the people with the most governance power are the ones most committed to the platform's success.</p>
          <p><strong className="text-foreground">Incentive alignment:</strong> Every action that earns FOUND is something that makes the platform better — more health data, more learning, more civic participation, more science. The reward system and the platform's mission are the same thing.</p>
          <p><strong className="text-foreground">Long-term thinking:</strong> Burning VOICE on unstake creates a strong incentive to stay staked long-term. This prevents short-term governance manipulation and ensures decision-makers have skin in the game.</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/wallet" className="text-sm text-violet-600 hover:underline">← Your Wallet</a>
        <a href="/about" className="text-sm text-muted-foreground hover:underline">About the Platform →</a>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed pl-6">
        {children}
      </div>
    </div>
  )
}
