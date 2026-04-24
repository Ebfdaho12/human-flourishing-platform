"use client"

import { Bot, DollarSign, Zap, Shield, Users, ArrowRight, Star, Gift, TrendingUp, Globe, CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EarnPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Earn With Your AI</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This platform is free for everyone. You can earn tokens by contributing — and your AI subscription can do the work.
        </p>
      </div>

      {/* The model */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-green-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-3">The Economic Model</p>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              <strong>The platform is 100% free.</strong> No subscription. No premium tier. No paywall.
              Every tool, every page, every feature — free for everyone, forever. We don't sell your data.
              We don't run ads. We don't have investors who need returns.
            </p>
            <p>
              <strong>So how does it sustain itself?</strong> You already pay for an AI subscription — Claude ($20/mo),
              ChatGPT ($20/mo), Perplexity ($20/mo). Right now, that subscription sits idle most of the time.
              What if your AI could <strong>earn you tokens while it's not busy</strong>?
            </p>
            <p>
              <strong>The deal:</strong> Opt in. Point your AI at the Aletheia Truth Protocol. Your AI researches
              public data (politicians, funding, voting records, court documents), structures it, and submits it.
              Every verified submission earns you <strong>VERITAS tokens</strong>. The platform gets data.
              You get tokens. Everyone benefits.
            </p>
            <p className="text-emerald-700 font-medium">
              You're not paying for the platform. The platform is paying YOU — in tokens — for helping build
              the world's truth database. Your AI subscription becomes a productive asset instead of an idle cost.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How it compares */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">How This Compares</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { platform: "Most apps", model: "Free + ads (you're the product)", cost: "$0 + your privacy", youGet: "Tracked, profiled, manipulated" },
              { platform: "Premium apps", model: "Subscription paywall", cost: "$10-50/month", youGet: "Features gated behind payment" },
              { platform: "This platform", model: "Free + opt-in AI contribution", cost: "$0 (use existing AI sub)", youGet: "Full access + earn tokens for contributing" },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg border p-3 ${i === 2 ? "border-2 border-emerald-300 bg-emerald-50/20" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold">{item.platform}</p>
                  {i === 2 && <Badge className="bg-emerald-500 text-[8px]">Our Model</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                  <div><span className="font-medium">Model:</span> {item.model}</div>
                  <div><span className="font-medium">Cost:</span> {item.cost}</div>
                  <div><span className="font-medium">You get:</span> {item.youGet}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token economics */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4 text-amber-500" /> What You Can Earn</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-200 bg-violet-50/20 p-3 text-center">
              <p className="text-lg font-bold text-violet-600">FOUND</p>
              <p className="text-[10px] text-muted-foreground">Earned on HFP for health tracking, habits, learning, engagement</p>
              <p className="text-[9px] text-violet-600 mt-1">Stake → VOICE governance power</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/20 p-3 text-center">
              <p className="text-lg font-bold text-amber-600">VERITAS</p>
              <p className="text-[10px] text-muted-foreground">Earned on Aletheia for data contributions, claim verification</p>
              <p className="text-[9px] text-amber-600 mt-1">Stake on claims → earn more if correct</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Both tokens will be on the Solana blockchain (deployment this weekend). Max supply: 369,369,369 each. Deflationary via burning mechanics.</p>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold">Earning rates (Aletheia contributions):</p>
            {[
              { action: "Submit a public figure", tokens: "5 VERITAS", difficulty: "Easy" },
              { action: "Submit a verifiable claim", tokens: "10 VERITAS", difficulty: "Medium" },
              { action: "Submit voting records", tokens: "15 VERITAS", difficulty: "Medium" },
              { action: "Submit a funding connection", tokens: "25 VERITAS", difficulty: "Hard" },
              { action: "Submit a source document", tokens: "30 VERITAS", difficulty: "Hard" },
              { action: "Verified accuracy bonus", tokens: "+3 credibility", difficulty: "Ongoing" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] rounded border p-2">
                <span>{item.action}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px]">{item.difficulty}</Badge>
                  <Badge className="bg-amber-500 text-[8px]">{item.tokens}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The flywheel */}
      <Card className="border-2 border-violet-200 bg-violet-50/10">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> The Flywheel</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">1</div>
              <p><strong>Platform is free</strong> → more people use it → more people have AI subscriptions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">2</div>
              <p><strong>Users opt-in their AI</strong> → AI agents research public data → submit to Aletheia</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">3</div>
              <p><strong>Database fills</strong> → connections become visible → accountability increases → platform becomes more valuable</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">4</div>
              <p><strong>Users earn tokens</strong> → tokens have utility (governance, staking) → incentive to contribute more</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">5</div>
              <p><strong>More data → more users → more AI agents → more data</strong> → the flywheel spins faster</p>
            </div>
          </div>
          <p className="text-xs text-violet-700 font-medium mt-3">
            No venture capital needed. No advertising needed. No subscription needed. The users ARE the infrastructure. Their AI subscriptions power the truth engine. Everyone earns, everyone benefits.
          </p>
        </CardContent>
      </Card>

      {/* Early contributor guarantee */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> Early Contributor Guarantee</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Your account and everything you earn transfers seamlessly.</strong> The current platform IS the production
            platform — same database, same accounts. When Solana tokens go live, you simply connect a wallet and your
            off-chain token balance bridges to on-chain tokens automatically. Your credibility score, contribution
            history, habits, health data — everything persists. There is no "beta" that gets wiped. What you build
            now is permanent. Early contributors who build credibility and earn tokens today will have those
            advantages on day one of the full blockchain launch.
          </p>
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> Start Earning in 2 Minutes</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><p><a href="https://aletheia-truth.vercel.app/register" target="_blank" className="text-violet-600 hover:underline">Create an Aletheia account</a> (free)</p></div>
            <div className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><p>Go to the <a href="https://aletheia-truth.vercel.app/agent-hub" target="_blank" className="text-violet-600 hover:underline">AI Agent Hub</a></p></div>
            <div className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><p>Copy a prompt for your AI (Claude Code, ChatGPT, or Perplexity)</p></div>
            <div className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><p>Run it. Watch data flow in. Earn VERITAS for every verified submission.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Questions</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div><p className="font-semibold text-foreground">Is this like crypto mining?</p><p>Conceptually yes — but instead of solving pointless math problems, your AI is finding real data about real public figures. Truth mining, not hash mining.</p></div>
          <div><p className="font-semibold text-foreground">What if someone submits fake data?</p><p>The Trust Engine catches it. New accounts are rate-limited. Fake data = credibility loss. Repeated fraud = account suspension. The system makes manipulation expensive.</p></div>
          <div><p className="font-semibold text-foreground">What are the tokens worth?</p><p>Right now, utility value (governance, staking, credibility). Once on Solana blockchain, market-determined. The value comes from the data quality of the network.</p></div>
          <div><p className="font-semibold text-foreground">Do I need technical skills?</p><p>No. Copy a prompt, paste it into your AI, review and submit results. The Quick Submit tool handles everything.</p></div>
          <div><p className="font-semibold text-foreground">Can my AI run overnight?</p><p>Yes — Claude Code has background mode. Set it to fill data gaps while you sleep. Some AI platforms also support autonomous agents.</p></div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" /> Different question: can your actual work earn you a living?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This page is about earning tokens via AI contribution. If you want the platform to synthesize everything it knows about your specific skills, wins, values, and budget into a monetization reading — <a href="/livelihood" className="text-emerald-700 font-semibold hover:underline">try the Livelihood Partner</a>. No upsell. Just evidence.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/livelihood" className="text-sm text-emerald-600 hover:underline font-medium">Livelihood Partner</a>
        <a href="/contribute" className="text-sm text-amber-600 hover:underline">Contribute Guide</a>
        <a href="/wallet" className="text-sm text-violet-600 hover:underline">Your Wallet</a>
        <a href="/tokens" className="text-sm text-emerald-600 hover:underline">Token Economics</a>
        <a href="/hive-mind" className="text-sm text-blue-600 hover:underline">Hive Mind</a>
        <a href="/character-sheet" className="text-sm text-orange-600 hover:underline">Character Sheet</a>
      </div>
    </div>
  )
}
