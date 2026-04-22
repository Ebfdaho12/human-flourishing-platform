"use client"

import { Coins, ArrowRight, Shield, Zap, Lock, Unlock, TrendingUp, AlertTriangle, CheckCircle, Vote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"

export default function StakingGuidePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Staking Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How staking works on both platforms — step by step, with every term explained.
        </p>
      </div>

      {/* What is staking */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2">What Is <Explain tip="Staking means locking up your tokens for a period of time. In return, you get something — governance power, rewards, or credibility. Think of it like a security deposit: you put tokens down to show you're serious, and you get benefits while they're locked up.">Staking</Explain>?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Staking is locking your tokens to earn rewards or gain power. It's like putting money in a savings account
            — you can't spend it while it's locked, but it works for you. On this platform, staking serves two purposes:
            <strong> governance</strong> (have a say in platform decisions) and <strong>truth verification</strong>
            (put tokens behind claims you believe are true or false).
          </p>
        </CardContent>
      </Card>

      {/* HFP Staking: FOUND → VOICE */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Coins className="h-4 w-4 text-violet-500" /> HFP: Stake FOUND → Get VOICE</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { step: "1", title: "Earn FOUND tokens", desc: "Use the platform — log health data, complete habits, do daily quests, run DePIN nodes. Every action earns FOUND.", icon: Zap },
              { step: "2", title: "Go to your wallet", desc: "Navigate to /wallet. You'll see your FOUND balance. Choose how many to stake.", icon: Coins },
              { step: "3", title: "Stake your FOUND", desc: "Lock your FOUND tokens. While locked, they generate VOICE tokens. VOICE = governance power.", icon: Lock },
              { step: "4", title: "Receive VOICE", desc: "VOICE tokens are soulbound — they can't be transferred or sold. They represent your voting power in platform governance.", icon: Vote },
              { step: "5", title: "Vote on proposals", desc: "Use VOICE to vote on platform decisions: feature priorities, token economics, community rules. More VOICE = more weight.", icon: CheckCircle },
              { step: "6", title: "Unstake anytime", desc: "Withdraw your FOUND. But: a graduated burn applies — unstaking early burns a percentage. This prevents pump-and-dump.", icon: Unlock },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">{item.step}</div>
                  <div>
                    <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-violet-500" /><p className="text-xs font-semibold">{item.title}</p></div>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
            <p className="text-[10px] font-semibold text-violet-700 mb-1">The Burn Schedule</p>
            <p className="text-[10px] text-muted-foreground">
              <Explain tip="When you unstake FOUND, a percentage is permanently destroyed (burned). This prevents people from staking just to get VOICE, voting on something, then immediately unstaking. The longer you stake, the less you lose when unstaking. It rewards long-term commitment.">Graduated burn</Explain> on unstaking:
            </p>
            <div className="grid grid-cols-4 gap-1 mt-1 text-[9px] text-center">
              <div className="rounded bg-red-50 border border-red-200 p-1"><p className="font-bold text-red-600">30 days</p><p>10% burn</p></div>
              <div className="rounded bg-amber-50 border border-amber-200 p-1"><p className="font-bold text-amber-600">90 days</p><p>5% burn</p></div>
              <div className="rounded bg-blue-50 border border-blue-200 p-1"><p className="font-bold text-blue-600">180 days</p><p>2% burn</p></div>
              <div className="rounded bg-emerald-50 border border-emerald-200 p-1"><p className="font-bold text-emerald-600">365+ days</p><p>0% burn</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aletheia Staking: VERITAS on Claims */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /> Aletheia: Stake VERITAS on Claims</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            On Aletheia, staking means putting your tokens behind truth. See a claim about a politician?
            <Explain tip="Claim staking is putting VERITAS tokens behind your assessment of whether a claim is TRUE or FALSE. If the community later verifies you were correct, you get 1.8x your stake back. If wrong, you lose 30% (you still get 70% back — the system is forgiving to encourage participation)."> Stake VERITAS</Explain> on
            whether you think it's true or false. Right = profit. Wrong = loss. Your tokens back your judgment.
          </p>

          <div className="space-y-2">
            {[
              { step: "1", title: "Find a claim", desc: "Browse figures on Aletheia. Each has claims — things they said or did. Some are verified, some are disputed, some are pending." },
              { step: "2", title: "Evaluate the evidence", desc: "Read the evidence for and against. Check the sources. Form your assessment: TRUE or FALSE." },
              { step: "3", title: "Stake your VERITAS", desc: "Put tokens behind your assessment. Minimum 10 VERITAS. Maximum depends on your credibility score." },
              { step: "4", title: "Wait for resolution", desc: "When enough people have staked (or time passes), the claim resolves based on community consensus and evidence." },
              { step: "5", title: "Outcome", desc: "CORRECT: You get 1.8x your stake back (80% profit). WRONG: You get 70% back (30% loss). The odds favor participation over sitting out." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{item.step}</div>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-[10px] font-semibold text-amber-700 mb-1">The Math</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded bg-emerald-50 border border-emerald-200 p-2 text-center">
                <p className="font-bold text-emerald-600">You're RIGHT</p>
                <p className="text-muted-foreground">Stake 100 VERITAS</p>
                <p className="text-emerald-700 font-bold">Get back 180 (+80%)</p>
              </div>
              <div className="rounded bg-red-50 border border-red-200 p-2 text-center">
                <p className="font-bold text-red-600">You're WRONG</p>
                <p className="text-muted-foreground">Stake 100 VERITAS</p>
                <p className="text-red-700 font-bold">Get back 70 (-30%)</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-2">
              <Explain tip="The 1.8x/0.7x ratio is deliberately asymmetric. It means you can be wrong 1 in 3 times and still break even. This encourages people to participate rather than staying silent out of fear of being wrong. The system rewards intellectual courage.">Why 1.8x/0.7x?</Explain> — The asymmetry encourages participation. You can be wrong 1 in 3 times and still break even.
              Staying silent earns nothing. Participating — even imperfectly — grows the truth network.
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-[10px] font-semibold text-blue-700 mb-1"><Explain tip="If you initially stake TRUE on a claim, then later find evidence that it's actually FALSE, you can change your stake. Instead of being penalized, you GAIN credibility — because self-correction shows intellectual honesty. The system rewards changing your mind when evidence warrants it.">Self-Correction Bonus</Explain></p>
            <p className="text-[10px] text-muted-foreground">Changed your mind? That's good. If you correct your own stake (switched from TRUE to FALSE or vice versa) before resolution, you earn a credibility BONUS. The system rewards intellectual honesty over stubbornness.</p>
          </div>
        </CardContent>
      </Card>

      {/* Why staking matters */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Why Staking Matters</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>For governance (FOUND → VOICE):</strong> Without staking, anyone could buy tokens, vote on a proposal to benefit themselves, then sell immediately. Staking means you have <Explain tip="Skin in the game means you have something to lose if things go wrong. When your tokens are staked, your interests are aligned with the platform's long-term success — because your tokens are locked up and their value depends on the platform thriving.">skin in the game</Explain>. Your tokens are locked while you govern — your interests align with the platform's long-term health.</p>
            <p><strong>For truth (VERITAS on claims):</strong> Without staking, claiming something is true or false is free. People could spam false assessments with no cost. When you stake tokens on your assessment, you're saying "I'm willing to lose money if I'm wrong." This filters out trolls and rewards genuine truth-seekers.</p>
            <p><strong>For anti-manipulation:</strong> The burn schedule on FOUND and the loss mechanism on VERITAS make manipulation expensive. Gaming the system costs real tokens.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-sm font-semibold text-amber-900">Important</p></div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Staking involves risk — you can lose tokens if you stake on wrong claims</p>
            <p>• VOICE tokens are <Explain tip="Soulbound means the token is permanently tied to your account. You can't transfer it, sell it, or give it away. This prevents people from buying governance power — you have to EARN it by staking FOUND. Your voice in governance represents your actual commitment to the platform.">soulbound</Explain> — they can't be sold or transferred</p>
            <p>• Never stake more than you can afford to lose</p>
            <p>• The Solana blockchain deployment (coming this weekend) will make staking live on-chain</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/wallet" className="text-sm text-violet-600 hover:underline">Your Wallet</a>
        <a href="/tokens" className="text-sm text-amber-600 hover:underline">Token Economics</a>
        <a href="/earn" className="text-sm text-emerald-600 hover:underline">Earn With Your AI</a>
        <a href="/depin" className="text-sm text-cyan-600 hover:underline">DePIN Nodes</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
      </div>
    </div>
  )
}
