"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Share2, Copy, CheckCircle, Gift, Users, Zap, MessageCircle, Mail, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function InvitePage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = "https://human-flourishing-platform.vercel.app"
  const referralLink = `${baseUrl}/register`
  const aletheiaLink = "https://aletheia-truth.vercel.app/register"

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareMessages = [
    {
      platform: "General",
      icon: Share2,
      message: `I've been using this free platform with 330+ tools for health, finance, and self-improvement. RPG gamification, daily quests, military-grade encryption, no ads. It's like if Habitica, MyFitnessPal, YNAB, and Wikipedia had a baby.\n\n${referralLink}`,
    },
    {
      platform: "To a health-conscious friend",
      icon: MessageCircle,
      message: `Found this free platform with research-backed health tools: cold exposure protocols (Huberman), fasting science (autophagy), peptide guide (20+ compounds), sleep optimization (Walker), breathwork (7 protocols), and a supplement guide rated by evidence. Everything sourced with PubMed links.\n\n${referralLink}`,
    },
    {
      platform: "To a gamer friend",
      icon: Zap,
      message: `There's this platform that turns real life into an RPG. Character sheet with stats (VIT, RES, WIS, AWR, WLT, SOC), XP from healthy actions, levels from Novice to Transcendent, daily quests with combo multipliers, achievement badges, and a flourishing score. Like Habitica but 100x deeper. Free.\n\n${referralLink}`,
    },
    {
      platform: "To someone interested in truth/accountability",
      icon: Globe,
      message: `Check out Aletheia — a truth protocol tracking 17,500+ public figures, funding connections, voting records. Both sides of every issue, follow the money, sources on everything. You can contribute with your AI subscription and earn tokens.\n\n${aletheiaLink}`,
    },
    {
      platform: "To someone with an AI subscription",
      icon: Mail,
      message: `Your AI subscription sits idle most of the time. There's a platform where you can point your AI at a truth database — it researches public records, submits sourced data, and you earn VERITAS tokens. Your idle compute becomes productive. The platform is free, and your AI pays YOU.\n\n${aletheiaLink}/agent-hub`,
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Invite & Share</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The platform is free for everyone. Share it with people who would benefit — or whose AI could help build the truth database.
        </p>
      </div>

      {/* Quick share links */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Quick Share Links</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Input value={referralLink} readOnly className="h-9 text-sm font-mono" />
            <Button variant="outline" size="sm" onClick={() => copy(referralLink, "hfp")}>
              {copied === "hfp" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input value={aletheiaLink} readOnly className="h-9 text-sm font-mono" />
            <Button variant="outline" size="sm" onClick={() => copy(aletheiaLink, "aletheia")}>
              {copied === "aletheia" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pre-written messages */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4 text-violet-500" /> Pre-Written Messages</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Copy a message tailored to who you're sharing with:</p>
          {shareMessages.map((msg, i) => {
            const Icon = msg.icon
            return (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-violet-500" />
                    <p className="text-xs font-semibold">{msg.platform}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => copy(msg.message, `msg-${i}`)}>
                    {copied === `msg-${i}` ? <><CheckCircle className="h-3 w-3 text-emerald-500 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground whitespace-pre-line">{msg.message}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Why share */}
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2"><Gift className="h-4 w-4" /> Why Share?</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>For them:</strong> Free access to 330+ tools for health, wealth, and self-improvement. RPG gamification makes it engaging. Military-grade encryption keeps their data safe.</p>
            <p><strong>For the hive:</strong> More users = more AI agents contributing data = better truth database = stronger platform for everyone.</p>
            <p><strong>For you:</strong> More people tracking data = better correlations and aggregate insights. The hive mind gets smarter with every person who joins.</p>
            <p><strong>Future:</strong> Referral rewards in FOUND tokens are planned — early sharers will be credited retroactively.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/earn" className="text-sm text-emerald-600 hover:underline">Earn With Your AI</a>
        <a href="/why" className="text-sm text-violet-600 hover:underline">Why This Exists</a>
        <a href="/hive-mind" className="text-sm text-blue-600 hover:underline">Hive Mind</a>
        <a href="/whats-new" className="text-sm text-amber-600 hover:underline">What's New</a>
      </div>
    </div>
  )
}
