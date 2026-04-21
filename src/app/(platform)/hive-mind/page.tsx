"use client"

import { useState } from "react"
import { Users, Brain, TrendingUp, Shield, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Lock, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SAMPLE = <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700 ml-1">Sample data</Badge>

const INSIGHTS = [
  { stat: "+2.1 pts", text: "Users who exercise 4+ days/week report mood 2.1 points higher on average", n: 1847, confidence: 94 },
  { stat: "-35%", text: "Sleep under 6.5hrs correlates with 35% lower flourishing scores", n: 2203, confidence: 97 },
  { stat: "89%", text: "Gratitude practice >14 days: 89% report improved mood", n: 963, confidence: 91 },
  { stat: "Top 3", text: "Top supplements used by platform users: Vitamin D, Magnesium, Omega-3", n: 3102, confidence: 88 },
  { stat: "-40%", text: "Cold exposure users report 40% fewer sick days", n: 724, confidence: 86 },
  { stat: "+15%", text: "Users who complete evening review score 15% higher on next-day mood", n: 1456, confidence: 92 },
]

const CORRELATIONS = [
  { a: "Sleep", b: "Mood", strength: "strong" as const, dir: "positive" as const },
  { a: "Exercise", b: "Energy", strength: "strong" as const, dir: "positive" as const },
  { a: "Screen Time", b: "Sleep Quality", strength: "moderate" as const, dir: "negative" as const },
  { a: "Meditation", b: "Anxiety", strength: "strong" as const, dir: "negative" as const },
  { a: "Hydration", b: "Focus", strength: "moderate" as const, dir: "positive" as const },
  { a: "Processed Food", b: "Energy", strength: "moderate" as const, dir: "negative" as const },
  { a: "Journaling", b: "Clarity", strength: "moderate" as const, dir: "positive" as const },
  { a: "Cold Exposure", b: "Resilience", strength: "strong" as const, dir: "positive" as const },
  { a: "Social Time", b: "Mood", strength: "moderate" as const, dir: "positive" as const },
]

const strengthColor = { strong: "bg-emerald-500", moderate: "bg-amber-400", weak: "bg-slate-300" }
const dirIcon = { positive: <ArrowUpRight className="h-3 w-3 text-emerald-600" />, negative: <ArrowDownRight className="h-3 w-3 text-red-500" /> }

export default function HiveMindPage() {
  const [tab, setTab] = useState<"insights" | "correlations" | "demographics">("insights")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">The Hive Mind</h1>
          <Badge className="bg-violet-100 text-violet-700 text-[9px]">Collective Intelligence</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Anonymous, aggregate insights from everyone on the platform. Your data stays yours. The patterns belong to all.</p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4 flex gap-3">
          <Shield className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Your data stays encrypted. Your patterns become part of the collective.</strong> No one can see YOUR data — but everyone can see WHAT THE DATA SHOWS.
            Every mood log, health entry, and habit check-in feeds the collective intelligence. Individual data = encrypted. Patterns = visible to all.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(["insights", "correlations", "demographics"] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} className={cn("text-xs capitalize", tab === t && "bg-violet-600 hover:bg-violet-700")} onClick={() => setTab(t)}>
            {t === "insights" && <BarChart3 className="h-3 w-3 mr-1" />}
            {t === "correlations" && <TrendingUp className="h-3 w-3 mr-1" />}
            {t === "demographics" && <Globe className="h-3 w-3 mr-1" />}
            {t}
          </Button>
        ))}
      </div>

      {tab === "insights" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold">Aggregate Insights</h2>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700">Sample data — real aggregate data coming with more users</Badge>
          </div>
          {INSIGHTS.map((ins, i) => (
            <Card key={i} className="border hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 font-bold text-xs shrink-0">{ins.stat}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{ins.text}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[9px] text-muted-foreground">n = {ins.n.toLocaleString()}</span>
                    <span className="text-[9px] text-muted-foreground">Confidence: {ins.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "correlations" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold">Correlation Discoveries</h2>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700">Sample data</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CORRELATIONS.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border p-2.5">
                <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", strengthColor[c.strength])} />
                <p className="text-xs flex-1"><span className="font-medium">{c.a}</span> <span className="text-muted-foreground">{"\u2194"}</span> <span className="font-medium">{c.b}</span></p>
                {dirIcon[c.dir]}
                <Badge variant="outline" className={cn("text-[8px] capitalize", c.strength === "strong" ? "border-emerald-300 text-emerald-700" : "border-amber-300 text-amber-700")}>{c.strength}</Badge>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Strong</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 inline-block" /> Weak</span>
          </div>
        </div>
      )}

      {tab === "demographics" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold">Anonymous Demographics</h2>
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700">Sample data</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[{ label: "Active Users", value: "4,218" }, { label: "Avg Age Range", value: "25-34" }, { label: "Avg Streak", value: "12 days" }, { label: "Data Points", value: "847K" }].map((d, i) => (
              <Card key={i}><CardContent className="p-3 text-center"><p className="text-lg font-bold text-violet-700">{d.value}</p><p className="text-[9px] text-muted-foreground">{d.label}</p></CardContent></Card>
            ))}
          </div>
          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-semibold">Top Focus Areas</p>
              {[{ area: "Sleep Optimization", pct: 68 }, { area: "Exercise Consistency", pct: 61 }, { area: "Mood Tracking", pct: 54 }, { area: "Nutrition", pct: 47 }, { area: "Stress Management", pct: 42 }].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <p className="text-[10px] w-28 shrink-0">{f.area}</p>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${f.pct}%` }} /></div>
                  <p className="text-[9px] text-muted-foreground w-8 text-right">{f.pct}%</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-3">
              <p className="text-xs font-semibold mb-1">Most Popular Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {["Mood Logger", "Sleep Calculator", "Breathwork Timer", "Habit Tracker", "Supplement Log", "Journaling", "Cold Exposure"].map(t => (
                  <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-50/40 to-purple-50/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-semibold text-violet-900">The Vision</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When 10,000+ people track their health, mood, sleep, exercise, and supplements on the same platform — the patterns that emerge will be more valuable than any single clinical trial. This is crowdsourced health science. Every data point you contribute makes the collective intelligence stronger, while your individual data remains fully encrypted and private.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-violet-200">
        <CardContent className="p-4 flex gap-3">
          <Lock className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold mb-1">How Contributing Works</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Every mood log, health entry, habit check-in, and supplement record you create feeds the collective intelligence automatically. Your individual entries are encrypted — no one (not even us) can tie a data point back to you. Only aggregate patterns across many users are surfaced here. More users = better science.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/30-day-challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/mood" className="text-sm text-pink-600 hover:underline">Mood Tracker</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/community" className="text-sm text-blue-600 hover:underline">Community</a>
      </div>
    </div>
  )
}
