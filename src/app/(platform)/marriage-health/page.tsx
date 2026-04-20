"use client"

import { useState } from "react"
import { Heart, ChevronDown, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DIMENSIONS = [
  { id: "communication", label: "Communication", desc: "Can you speak openly about difficult topics? Do you feel heard?", lowNote: "Gottman research: contempt (eye-rolling, sarcasm) is the #1 predictor of divorce.", highNote: "You've built psychological safety — each partner feels heard without fear of judgment." },
  { id: "finances", label: "Financial Alignment", desc: "Do you share financial goals and handle money without ongoing conflict?", lowNote: "Money conflict is the #2 cause of divorce. Different money personalities need explicit bridging.", highNote: "You've built financial trust — rare and powerful. Keep the money dates regular." },
  { id: "intimacy", label: "Intimacy & Affection", desc: "Emotional and physical connection — do you feel close and desired?", lowNote: "Intimacy operates on a demand-withdraw pattern. The less it's offered, the less it's sought.", highNote: "Strong intimacy is a buffer against almost every other stressor. Protect it actively." },
  { id: "goals", label: "Shared Goals", desc: "Do you have a vision for your future together that you're both building toward?", lowNote: "Couples who grow in different directions often drift apart before either notices.", highNote: "A shared map creates shared momentum. You're building something real together." },
  { id: "conflict", label: "Conflict Resolution", desc: "When you fight, do you repair well and reach understanding?", lowNote: "It's not about never fighting. It's about the repair. Contempt without repair is the danger.", highNote: "Healthy conflict is a sign of genuine engagement. You fight AND fix — that's the formula." },
  { id: "trust", label: "Trust & Safety", desc: "Do you feel emotionally safe? Can you be fully honest?", lowNote: "Trust erodes in micro-moments: the dismissal, the broken small promise, the half-truth.", highNote: "Deep trust took years to build. It's the foundation everything else sits on." },
  { id: "time", label: "Quality Time", desc: "Are you present with each other, not just in the same room?", lowNote: "Parallel lives with shared logistics is a common late-stage drift pattern.", highNote: "Presence is the gift. You're showing up for each other beyond obligation." },
  { id: "parenting", label: "Parenting Alignment", desc: "If applicable — do you agree on values, discipline, and parenting approach?", lowNote: "Parenting conflict bleeds into marital conflict. Kids notice and internalize the divide.", highNote: "Parenting as a team models partnership for your children. Generational impact." },
  { id: "growth", label: "Individual Growth", desc: "Does this relationship support you both becoming better individuals?", lowNote: "Relationships that stagnate often do so because individual growth was sacrificed for stability.", highNote: "A secure base and a launching pad — that's the ideal marriage structure." },
  { id: "future", label: "Future Vision", desc: "Are you excited about your future together? Does it energize you?", lowNote: "Loss of shared future vision is a quiet warning sign. 'We just got comfortable' can become 'we grew apart.'", highNote: "A compelling shared future is motivating and creates mutual investment in the relationship." },
]

export default function MarriageHealthPage() {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const rated = Object.keys(scores).length
  const total = DIMENSIONS.length
  const avg = rated > 0 ? (Object.values(scores).reduce((a, b) => a + b, 0) / rated).toFixed(1) : null
  const strengths = DIMENSIONS.filter(d => (scores[d.id] || 0) >= 7)
  const needsWork = DIMENSIONS.filter(d => scores[d.id] !== undefined && scores[d.id] <= 5)

  function getBarColor(score: number) {
    if (score >= 8) return "bg-emerald-500"
    if (score >= 6) return "bg-amber-400"
    return "bg-red-400"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Marriage Health Check</h1>
        </div>
        <p className="text-sm text-muted-foreground">10-dimension self-assessment based on Gottman Institute research. Rate each area 1–10 for an honest snapshot of where you are.</p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-rose-900">Key insight: The goal is not a perfect 10 in every area.</p>
          <p className="text-sm text-rose-700 mt-1">Gottman's 40 years of research show it's not about perfection — it's about the ratio of positive to negative interactions (5:1 is the magic number) and how well you repair after conflict.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {DIMENSIONS.map(dim => {
          const score = scores[dim.id]
          const isExpanded = expanded === dim.id
          return (
            <Card key={dim.id} className={cn("border", score !== undefined && score >= 7 && "border-emerald-200", score !== undefined && score <= 5 && "border-red-200")}>
              <CardContent className="pt-4 pb-3">
                <button onClick={() => setExpanded(isExpanded ? null : dim.id)} className="w-full flex items-center justify-between mb-2">
                  <div className="text-left">
                    <p className="text-sm font-semibold">{dim.label}</p>
                    <p className="text-xs text-muted-foreground">{dim.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {score !== undefined && <Badge variant="secondary" className="text-xs">{score}/10</Badge>}
                    <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", isExpanded && "rotate-180")} />
                  </div>
                </button>

                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      onClick={() => setScores(s => ({ ...s, [dim.id]: n }))}
                      className={cn(
                        "flex-1 h-7 rounded text-xs font-medium transition-all",
                        score === n ? getBarColor(n) + " text-white" : "bg-muted hover:bg-muted/70 text-muted-foreground"
                      )}
                    >{n}</button>
                  ))}
                </div>

                {isExpanded && score !== undefined && (
                  <div className={cn("mt-3 p-3 rounded-lg text-sm", score >= 7 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
                    {score >= 7 ? dim.highNote : dim.lowNote}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {rated >= 5 && (
        <div className="space-y-3">
          {avg && (
            <Card className="border-2 border-slate-200">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Overall Score</p>
                  <span className={cn("text-2xl font-bold", parseFloat(avg) >= 7 ? "text-emerald-600" : parseFloat(avg) >= 5 ? "text-amber-600" : "text-red-500")}>{avg}<span className="text-sm text-muted-foreground font-normal">/10</span></span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full", parseFloat(avg) >= 7 ? "bg-emerald-500" : parseFloat(avg) >= 5 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${(parseFloat(avg) / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{rated} of {total} dimensions rated</p>
              </CardContent>
            </Card>
          )}

          {strengths.length > 0 && (
            <Card className="border-2 border-emerald-200 bg-emerald-50/30">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-900">Celebrate these strengths</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strengths.map(d => <Badge key={d.id} className="bg-emerald-100 text-emerald-700">{d.label} — {scores[d.id]}/10</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {needsWork.length > 0 && (
            <Card className="border-2 border-amber-200 bg-amber-50/30">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-900">Areas to work on</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {needsWork.map(d => <Badge key={d.id} className="bg-amber-100 text-amber-700">{d.label} — {scores[d.id]}/10</Badge>)}
                </div>
                <p className="text-xs text-amber-700 mt-2">Consider couples therapy as an investment, not a last resort. The best time to go is before crisis — when you still have goodwill to build on.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/date-nights" className="hover:underline text-foreground">Date Nights</a>
        <a href="/difficult-conversations" className="hover:underline text-foreground">Difficult Conversations</a>
        <a href="/family-constitution" className="hover:underline text-foreground">Family Constitution</a>
        <a href="/divorce-finance" className="hover:underline text-foreground">Divorce Finances</a>
      </div>
    </div>
  )
}
