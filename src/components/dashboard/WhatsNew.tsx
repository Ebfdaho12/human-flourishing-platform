"use client"

import { useState, useEffect } from "react"
import { Bell, ChevronRight, X, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Latest platform updates — add new items at the TOP
const UPDATES = [
  { date: "2026-04-20", title: "Community Hub launched", desc: "Discussion rooms, direct messages, and accountability partners. Connect with people on the same journey.", link: "/community/hub", tag: "Social" },
  { date: "2026-04-20", title: "Knowledge Map", desc: "Visual canvas showing how every tool connects. Follow the connections to discover what you didn't know you needed.", link: "/knowledge-map", tag: "Discovery" },
  { date: "2026-04-20", title: "25 Canada deep-dive pages", desc: "Sovereignty, spending, housing, healthcare, education, energy, water, defence, food security, demographics, and more.", link: "/canada/index", tag: "Canada" },
  { date: "2026-04-20", title: "Political Promise Tracker", desc: "What they promised vs what they did. Carney, Trudeau, Harper, Poilievre, Singh — all tracked equally.", link: "/promise-tracker", tag: "Accountability" },
  { date: "2026-04-20", title: "Birth Fund proposal", desc: "What if every child had a compounding investment from birth? $250/month from day one = $2.1M by age 60.", link: "/birth-fund", tag: "Policy" },
  { date: "2026-04-20", title: "Smart Recommendations", desc: "The dashboard now suggests tools based on what you've used. Personalized discovery gets smarter over time.", link: "/dashboard", tag: "Feature" },
  { date: "2026-04-20", title: "16 new financial tools", desc: "Budget, debt payoff, mortgage comparison, rent vs buy, emergency fund, retirement calculator, and more.", link: "/financial-dashboard", tag: "Finance" },
  { date: "2026-04-20", title: "Propaganda & Logical Fallacies", desc: "35 manipulation techniques and logical fallacies with real-world examples. Once you see them, you can't unsee them.", link: "/propaganda", tag: "Education" },
  { date: "2026-04-20", title: "Parenting + Kids Finance + Critical Thinking", desc: "Age-by-age guides for raising kids who think clearly and understand money.", link: "/parenting", tag: "Family" },
  { date: "2026-04-20", title: "Aly now has text input", desc: "Type commands to Aly when you can't speak out loud. She also knows all 185 pages.", link: "/dashboard", tag: "Feature" },
  { date: "2026-04-19", title: "Data Backup & Export", desc: "One-click backup of all your tool data. Restore on any device.", link: "/data-backup", tag: "Security" },
  { date: "2026-04-19", title: "Progress Dashboard", desc: "See how your life is improving across every tool. Overall score based on what you've built.", link: "/progress", tag: "Feature" },
]

const TAG_COLORS: Record<string, string> = {
  Social: "text-violet-600 border-violet-300",
  Discovery: "text-amber-600 border-amber-300",
  Canada: "text-red-600 border-red-300",
  Accountability: "text-blue-600 border-blue-300",
  Policy: "text-emerald-600 border-emerald-300",
  Feature: "text-cyan-600 border-cyan-300",
  Finance: "text-emerald-600 border-emerald-300",
  Education: "text-amber-600 border-amber-300",
  Family: "text-rose-600 border-rose-300",
  Security: "text-slate-600 border-slate-300",
}

export function WhatsNew() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-dismissed-updates")
    if (stored) setDismissed(new Set(JSON.parse(stored)))
  }, [])

  function dismiss(title: string) {
    const next = new Set(dismissed)
    next.add(title)
    setDismissed(next)
    localStorage.setItem("hfp-dismissed-updates", JSON.stringify([...next]))
  }

  const visible = UPDATES.filter(u => !dismissed.has(u.title))
  const display = showAll ? visible : visible.slice(0, 4)

  if (visible.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> What's New
        </h2>
        {visible.length > 4 && (
          <button onClick={() => setShowAll(!showAll)} className="text-[10px] text-violet-600 hover:underline">
            {showAll ? "Show less" : `Show all (${visible.length})`}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {display.map((update, i) => (
          <a key={i} href={update.link} className="block group">
            <Card className="card-hover border-amber-100/50">
              <CardContent className="p-2.5 flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium truncate group-hover:text-violet-600">{update.title}</p>
                    <Badge variant="outline" className={cn("text-[8px] shrink-0", TAG_COLORS[update.tag] || "")}>{update.tag}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{update.desc}</p>
                </div>
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); dismiss(update.title) }}
                  className="text-muted-foreground/20 hover:text-muted-foreground p-1 shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
