"use client"

import { useState } from "react"
import useSWR from "swr"
import { Users, MessageCircle, Target, Sparkles, ChevronRight, Send, TrendingUp, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const DEFAULT_ROOMS = [
  { name: "Financial Independence", slug: "financial-independence", description: "Budgeting, investing, debt-free journeys, and building wealth", category: "FINANCE", icon: "💰", members: "Growing" },
  { name: "Canadian Issues", slug: "canadian-issues", description: "Housing, healthcare, policy, and building a better Canada", category: "CANADA", icon: "🍁", members: "Growing" },
  { name: "Family Life", slug: "family-life", description: "Parenting, relationships, meal planning, screen time, and raising great kids", category: "FAMILY", icon: "👨‍👩‍👧‍👦", members: "Growing" },
  { name: "Health & Wellness", slug: "health-wellness", description: "Physical health, mental health, sleep, nutrition, and feeling your best", category: "HEALTH", icon: "❤️", members: "Growing" },
  { name: "Education & Truth", slug: "education-truth", description: "Economics, history, media literacy, critical thinking, and understanding the world", category: "EDUCATION", icon: "📚", members: "Growing" },
  { name: "Side Hustles & Careers", slug: "side-hustles-careers", description: "Building income, career development, entrepreneurship, and skill-building", category: "GENERAL", icon: "🚀", members: "Growing" },
]

export default function CommunityHubPage() {
  const [tab, setTab] = useState<"rooms" | "messages" | "challenges" | "insights">("rooms")
  const { data: roomsData } = useSWR("/api/community/rooms", fetcher)
  const { data: msgsData } = useSWR("/api/community/messages", fetcher)

  const rooms = roomsData?.rooms || []
  const conversations = msgsData?.conversations || []
  const unreadCount = conversations.reduce((s: number, c: any) => s + (c.unread || 0), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Community</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect with people on the same journey. No algorithms. No ads. No outrage. Just real conversations.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>How this is different from social media:</strong> No algorithmic feed (you choose what to see).
            No follower counts (ideas matter, not popularity). No anonymous attacks (your reputation is earned).
            Posts require substance (min 10 characters, encouraged to link evidence). The goal is not engagement —
            it is genuine connection and shared growth.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: "rooms", label: "Discussion Rooms", icon: MessageCircle },
          { key: "messages", label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`, icon: Send },
          { key: "challenges", label: "Group Challenges", icon: Target },
          { key: "insights", label: "Shared Insights", icon: Sparkles },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={cn("px-3 py-2 text-xs font-medium border-b-2 -mb-px flex items-center gap-1.5",
              tab === t.key ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground"
            )}><t.icon className="h-3.5 w-3.5" /> {t.label}</button>
        ))}
      </div>

      {tab === "rooms" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Topic-based discussions. Pick a room, join the conversation.</p>
          {DEFAULT_ROOMS.map((room, i) => {
            const dbRoom = rooms.find((r: any) => r.slug === room.slug)
            const postCount = dbRoom?._count?.posts || 0
            return (
              <a key={i} href={`/community/room/${room.slug}`}>
                <Card className="card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{room.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{room.name}</p>
                      <p className="text-[10px] text-muted-foreground">{room.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-violet-600">{postCount} posts</p>
                      <Badge variant="outline" className="text-[8px]">{room.category}</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      )}

      {tab === "messages" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Private, secure messages between platform members.</p>
          {conversations.length === 0 ? (
            <Card><CardContent className="py-8 text-center">
              <Send className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-muted-foreground">No messages yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Start a conversation from someone's profile or through discussion rooms.</p>
            </CardContent></Card>
          ) : (
            conversations.map((convo: any, i: number) => (
              <Card key={i} className="card-hover cursor-pointer">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-sm font-bold">
                    {(convo.partnerName || "U").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{convo.partnerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <Badge className="bg-violet-500 text-white text-[10px]">{convo.unread}</Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "challenges" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Do 30-day challenges with other people. Accountability multiplies results.</p>
          {[
            { name: "30-Day Health Kickstart", members: 0, startDate: "Next Monday", challenge: "health-30", color: "from-rose-500 to-red-600" },
            { name: "30-Day Money Reset", members: 0, startDate: "Next Monday", challenge: "finance-30", color: "from-emerald-500 to-teal-600" },
            { name: "30-Day Mindset Upgrade", members: 0, startDate: "Next Monday", challenge: "mindset-30", color: "from-violet-500 to-purple-600" },
          ].map((c, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", c.color)}>
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">Starts: {c.startDate} · {c.members} joined</p>
                </div>
                <button className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100">
                  Join Cohort
                </button>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground italic text-center">Cohort challenges launch when the community grows. Be among the first to join!</p>
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Short, evidence-backed insights from platform members. Not status updates — genuine learnings.</p>
          <Card><CardContent className="py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-muted-foreground">No insights shared yet.</p>
            <p className="text-xs text-muted-foreground mt-1">After using any tool, you can share what you learned — anonymously if you prefer.</p>
          </CardContent></Card>
        </div>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Community principles:</strong> Be helpful. Share evidence, not opinions disguised as facts. Disagree
            respectfully — attack ideas, not people. No spam, no self-promotion, no political tribalism. This space
            exists to help each other build better lives — keep it that way. Your FOUND tokens support the community;
            your VOICE tokens shape its governance.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
