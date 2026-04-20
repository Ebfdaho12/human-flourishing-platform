"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sparkles, Send, ThumbsUp, Plus, ExternalLink, Clock, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())
const TOPICS = ["FINANCE", "FAMILY", "HEALTH", "CANADA", "EDUCATION", "GROWTH"]

export default function InsightsPage() {
  const [topic, setTopic] = useState<string | null>(null)
  const { data, mutate } = useSWR(`/api/community/insights${topic ? `?topic=${topic}` : ""}`, fetcher)
  const [showCreate, setShowCreate] = useState(false)
  const [content, setContent] = useState("")
  const [newTopic, setNewTopic] = useState("FINANCE")
  const [toolLink, setToolLink] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)

  const insights = data?.insights || []

  async function postInsight() {
    if (content.length < 50) return
    setPosting(true)
    await fetch("/api/community/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, topicTag: newTopic, toolLink: toolLink || undefined, sourceUrl: sourceUrl || undefined, isAnonymous: anonymous }),
    })
    setContent(""); setToolLink(""); setSourceUrl(""); setShowCreate(false); setPosting(false)
    mutate()
  }

  async function vote(insightId: string) {
    await fetch("/api/community/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ insightId, value: 1 }) })
    mutate()
  }

  function timeAgo(date: string): string {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}d`
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Community Insights</h1>
          </div>
          <p className="text-sm text-muted-foreground">Short, evidence-backed learnings from platform members. Not opinions — insights.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4" /> Share</Button>
      </div>

      {/* Create */}
      {showCreate && (
        <Card className="border-2 border-amber-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Share something you learned from using the platform. Min 50 chars, max 500. Evidence encouraged.</p>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What insight changed how you think or act? Be specific — 'I ran the budget calculator and discovered 35% of my income goes to things I don't value...'"
              className="min-h-[80px]" />
            <div className="flex gap-2">
              <select value={newTopic} onChange={e => setNewTopic(e.target.value)}
                className="text-xs rounded-lg border border-border bg-background px-2 py-1.5">
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input value={toolLink} onChange={e => setToolLink(e.target.value)} placeholder="Tool link (optional, e.g., /budget)" className="flex-1 text-xs h-8" />
              <button onClick={() => setAnonymous(!anonymous)}
                className={cn("flex items-center gap-1 text-xs rounded-lg border px-2 py-1",
                  anonymous ? "border-violet-300 bg-violet-50 text-violet-700" : "border-border text-muted-foreground"
                )}>
                {anonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {anonymous ? "Anonymous" : "Named"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn("text-[10px]", content.length >= 50 ? "text-emerald-600" : "text-muted-foreground")}>{content.length}/500</span>
              <Button onClick={postInsight} disabled={posting || content.length < 50} size="sm">
                <Send className="h-3 w-3" /> {posting ? "Sharing..." : "Share Insight"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setTopic(null)}
          className={cn("text-xs rounded-full px-3 py-1 border", !topic ? "bg-amber-100 border-amber-300 text-amber-700 font-semibold" : "border-border text-muted-foreground")}>All</button>
        {TOPICS.map(t => (
          <button key={t} onClick={() => setTopic(topic === t ? null : t)}
            className={cn("text-xs rounded-full px-3 py-1 border capitalize", topic === t ? "bg-amber-100 border-amber-300 text-amber-700 font-semibold" : "border-border text-muted-foreground")}>{t.toLowerCase()}</button>
        ))}
      </div>

      {/* Insights */}
      {insights.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No insights shared yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first — share what you learned from using any tool on this platform.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {insights.map((insight: any) => {
            const authorName = insight.isAnonymous ? "Anonymous" : (insight.author?.profile?.displayName || "Community Member")
            return (
              <Card key={insight.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {insight.isAnonymous ? "?" : authorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{authorName}</span>
                        <Badge variant="outline" className="text-[8px] capitalize">{insight.topicTag.toLowerCase()}</Badge>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(insight.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{insight.content}</p>
                      {insight.toolLink && (
                        <a href={insight.toolLink} className="text-[10px] text-violet-600 hover:underline mt-1 inline-flex items-center gap-0.5">
                          <ExternalLink className="h-2.5 w-2.5" /> {insight.toolLink}
                        </a>
                      )}
                      <div className="mt-2">
                        <button onClick={() => vote(insight.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-500">
                          <ThumbsUp className="h-3 w-3" /> {insight.upvotes} helpful
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/community/hub" className="text-sm text-violet-600 hover:underline">Community Hub</a>
        <a href="/tools" className="text-sm text-blue-600 hover:underline">All Tools</a>
        <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress</a>
      </div>
    </div>
  )
}
