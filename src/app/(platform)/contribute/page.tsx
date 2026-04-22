"use client"

import { Bot, Globe, Zap, ArrowRight, Users, Shield, Gift, Terminal, ClipboardPaste, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ContributePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Contribute to Aletheia</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Help build the world's truth database. Use your AI subscription to find data. Earn VERITAS tokens.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/30 to-orange-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">The Human Flourishing Platform + Aletheia Truth Protocol</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            HFP helps you flourish individually — health, wealth, mind, relationships. Aletheia makes sure the
            systems around you are honest — tracking what public figures say vs what they do, where the money goes,
            and who benefits. They work together. Your personal sovereignty (HFP) is only as strong as the
            institutional transparency (Aletheia) around you.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="https://aletheia-truth.vercel.app/agent-hub" target="_blank" rel="noopener noreferrer" className="rounded-xl border-2 border-violet-200 bg-violet-50/20 p-4 hover:bg-violet-50/40 transition-colors text-center">
          <Bot className="h-6 w-6 text-violet-500 mx-auto mb-2" />
          <p className="text-xs font-semibold">AI Agent Hub</p>
          <p className="text-[10px] text-muted-foreground mt-1">Connect your AI subscription. Copy-paste prompts for Claude Code, ChatGPT, Perplexity.</p>
          <p className="text-[10px] text-violet-600 mt-2 flex items-center justify-center gap-1">Open on Aletheia <ArrowRight className="h-3 w-3" /></p>
        </a>
        <a href="https://aletheia-truth.vercel.app/quick-submit" target="_blank" rel="noopener noreferrer" className="rounded-xl border-2 border-blue-200 bg-blue-50/20 p-4 hover:bg-blue-50/40 transition-colors text-center">
          <ClipboardPaste className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs font-semibold">Quick Submit</p>
          <p className="text-[10px] text-muted-foreground mt-1">Paste Perplexity research directly. Auto-parses and submits.</p>
          <p className="text-[10px] text-blue-600 mt-2 flex items-center justify-center gap-1">Open on Aletheia <ArrowRight className="h-3 w-3" /></p>
        </a>
        <a href="https://aletheia-truth.vercel.app/data-gaps" target="_blank" rel="noopener noreferrer" className="rounded-xl border-2 border-red-200 bg-red-50/20 p-4 hover:bg-red-50/40 transition-colors text-center">
          <Search className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs font-semibold">Data Gaps</p>
          <p className="text-[10px] text-muted-foreground mt-1">See what's missing. Focus your AI on the highest-priority gaps.</p>
          <p className="text-[10px] text-red-600 mt-2 flex items-center justify-center gap-1">Open on Aletheia <ArrowRight className="h-3 w-3" /></p>
        </a>
      </div>

      {/* The best workflow */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The Best Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { step: "1", title: "Research with Perplexity", desc: "Perplexity.ai auto-cites every source. Ask it about any topic — politicians, funding, voting records, corporate connections. It returns sourced data.", icon: Search, color: "text-blue-500" },
              { step: "2", title: "Submit via Quick Submit", desc: "Copy Perplexity's output. Paste into Aletheia's Quick Submit. It auto-parses entries, detects sources, and lets you batch submit.", icon: ClipboardPaste, color: "text-cyan-500" },
              { step: "3", title: "OR use Claude Code for automation", desc: "Clone the Aletheia repo. Claude Code reads CLAUDE.md and knows how to research + submit automatically. Set it to run in background.", icon: Terminal, color: "text-violet-500" },
              { step: "4", title: "Earn VERITAS tokens", desc: "Every verified submission earns tokens. Harder data = more tokens. Build credibility over time for auto-approval.", icon: Gift, color: "text-emerald-500" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">{item.step}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <p className="text-xs font-semibold">{item.title}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Why Contribute?</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>For you:</strong> Earn VERITAS tokens. Build credibility. Get auto-approval status. Early contributors get the most rewards (low-hanging fruit is still available).</p>
            <p><strong>For society:</strong> Every data point makes the truth database more complete. More connections become visible. More accountability becomes possible. The web of power becomes transparent.</p>
            <p><strong>For the platform:</strong> More data = better correlations, better investigations, better tools for everyone. Your AI's idle time becomes meaningful work.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-amber-500" /><p className="text-sm font-semibold text-amber-900">Quality Matters</p></div>
          <p className="text-xs text-muted-foreground">Every submission must have a source. The trust engine tracks your accuracy. Verified data earns +3 credibility. Refuted data loses -5. Spam loses -15. Fake documents lose -30. The system rewards accuracy over volume. If you wouldn't cite it in a research paper, don't submit it.</p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/hive-mind" className="text-sm text-violet-600 hover:underline">Hive Mind</a>
        <a href="/investigate" className="text-sm text-slate-600 hover:underline">Investigate</a>
        <a href="/connections" className="text-sm text-blue-600 hover:underline">Connection Map</a>
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Analysis</a>
      </div>
    </div>
  )
}
