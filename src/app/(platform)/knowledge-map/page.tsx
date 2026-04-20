"use client"

import { useState } from "react"
import { Globe2, ChevronRight, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Knowledge clusters — groups of related tools with connections shown
const CLUSTERS: {
  name: string
  color: string
  description: string
  tools: { name: string; href: string; connections: string[] }[]
}[] = [
  {
    name: "Financial Foundation",
    color: "border-emerald-300 bg-emerald-50/20",
    description: "Start here → build outward. Each tool feeds into the next.",
    tools: [
      { name: "Budget Calculator", href: "/budget", connections: ["Financial Dashboard", "Debt Payoff", "Savings Finder"] },
      { name: "Financial Dashboard", href: "/financial-dashboard", connections: ["Budget Calculator", "Net Worth", "Subscriptions"] },
      { name: "Emergency Fund", href: "/emergency-fund", connections: ["Budget Calculator", "Investing Basics"] },
      { name: "Debt Payoff", href: "/debt-payoff", connections: ["Budget Calculator", "Credit Score"] },
      { name: "Investing Basics", href: "/investing", connections: ["Compound Interest", "Retirement Calculator", "Tax Optimization"] },
      { name: "Compound Interest", href: "/compound-interest", connections: ["Investing Basics", "Birth Fund", "Retirement Calculator"] },
      { name: "Retirement Calculator", href: "/retirement", connections: ["Investing Basics", "Tax Optimization", "Compound Interest"] },
      { name: "Tax Optimization", href: "/canada/tax-optimization", connections: ["Tax Estimator", "Benefits Finder", "Investing Basics"] },
      { name: "Negotiation Scripts", href: "/negotiation", connections: ["Budget Calculator", "Side Hustles", "Real Hourly Rate"] },
    ],
  },
  {
    name: "Family Ecosystem",
    color: "border-rose-300 bg-rose-50/20",
    description: "Tools that strengthen the family unit — each one amplifies the others.",
    tools: [
      { name: "Family Economics", href: "/family-economics", connections: ["Budget Calculator", "Birth Fund", "Savings Finder"] },
      { name: "Family Meeting", href: "/family-meeting", connections: ["Budget Calculator", "Screen Time", "Marriage Finance"] },
      { name: "Parenting Guide", href: "/parenting", connections: ["Critical Thinking", "Kids Finance", "Screen Time"] },
      { name: "Kids Finance", href: "/kids-finance", connections: ["Kids Chores", "Compound Interest", "Investing Basics"] },
      { name: "Critical Thinking", href: "/critical-thinking", connections: ["Logical Fallacies", "Propaganda", "Parenting Guide"] },
      { name: "Screen Time", href: "/screen-time", connections: ["Family Meeting", "Parenting Guide", "Sleep Calculator"] },
      { name: "Marriage Finance", href: "/marriage-finance", connections: ["Budget Calculator", "Family Meeting", "Difficult Conversations"] },
      { name: "Birth Fund", href: "/birth-fund", connections: ["Compound Interest", "Family Economics", "Retirement Calculator"] },
      { name: "Cooking Basics", href: "/cooking", connections: ["Meal Planner", "Budget Calculator", "Food System"] },
    ],
  },
  {
    name: "Understanding the World",
    color: "border-amber-300 bg-amber-50/20",
    description: "Connected knowledge — each piece makes every other piece clearer.",
    tools: [
      { name: "Economics Education", href: "/education/economics", connections: ["Money History", "Civilizations", "Canada Spending"] },
      { name: "Money History", href: "/money-history", connections: ["Economics Education", "Inflation Calculator", "Civilizations"] },
      { name: "Civilizations", href: "/civilizations", connections: ["Money History", "Democracy History", "Canada Trajectories"] },
      { name: "Logical Fallacies", href: "/logical-fallacies", connections: ["Propaganda", "Critical Thinking", "Statistics Guide"] },
      { name: "Propaganda", href: "/propaganda", connections: ["Logical Fallacies", "Media Ownership", "Critical Thinking"] },
      { name: "Media Ownership", href: "/media-ownership", connections: ["Propaganda", "Canada Oligopolies"] },
      { name: "Your Rights", href: "/rights", connections: ["How Laws Work", "Democracy History", "Governance"] },
      { name: "Statistics Guide", href: "/statistics-guide", connections: ["Logical Fallacies", "Critical Thinking"] },
    ],
  },
  {
    name: "Canada Deep Dive",
    color: "border-red-300 bg-red-50/20",
    description: "The complete picture of Canadian systems — problems, causes, and solutions.",
    tools: [
      { name: "Sovereignty Report", href: "/canada", connections: ["Blueprint", "Trajectories", "vs World"] },
      { name: "Blueprint", href: "/canada/blueprint", connections: ["Sovereignty Report", "Root Causes", "Energy"] },
      { name: "Trajectories", href: "/canada/trajectories", connections: ["Root Causes", "Spending", "Civilizations"] },
      { name: "Root Causes", href: "/canada/root-causes", connections: ["Housing Crisis", "Healthcare", "Trajectories"] },
      { name: "Housing Crisis", href: "/canada/housing", connections: ["Root Causes", "Immigration", "Provincial Compare"] },
      { name: "Healthcare", href: "/canada/healthcare", connections: ["Root Causes", "Spending", "vs World"] },
      { name: "Spending", href: "/canada/spending", connections: ["Tax Burden", "Root Causes", "Trajectories"] },
      { name: "Promise Tracker", href: "/promise-tracker", connections: ["Governance", "Spending", "Root Causes"] },
    ],
  },
  {
    name: "Health & Wellbeing",
    color: "border-blue-300 bg-blue-50/20",
    description: "Physical and mental health tools that compound when used together.",
    tools: [
      { name: "Health Dashboard", href: "/health", connections: ["Sleep Calculator", "Exercise", "Mental Health"] },
      { name: "Sleep Calculator", href: "/sleep-calculator", connections: ["Health Dashboard", "Routine", "Focus Timer"] },
      { name: "Mental Health", href: "/mental-health", connections: ["Gratitude Journal", "Breathing", "Meditation"] },
      { name: "Daily Routines", href: "/routine", connections: ["Habit Stacking", "Sleep Calculator", "Focus Timer"] },
      { name: "Habit Science", href: "/habit-science", connections: ["Habit Stacking", "30-Day Challenges", "Daily Routines"] },
      { name: "Habit Stacking", href: "/habit-stack", connections: ["Habit Science", "Daily Routines", "Challenges"] },
    ],
  },
  {
    name: "Personal Growth",
    color: "border-violet-300 bg-violet-50/20",
    description: "Know yourself → set direction → build skills → track progress.",
    tools: [
      { name: "Life Wheel", href: "/life-wheel", connections: ["Core Values", "Vision Board", "Progress"] },
      { name: "Core Values", href: "/values", connections: ["Life Wheel", "Decision Journal", "Family Constitution"] },
      { name: "Decision Journal", href: "/decisions", connections: ["Core Values", "Logical Fallacies"] },
      { name: "Skill Inventory", href: "/skills", connections: ["Career Path", "Side Hustles", "Reading List"] },
      { name: "Progress Dashboard", href: "/progress", connections: ["Life Wheel", "Wins & Gratitude", "Daily Check-In"] },
      { name: "Memory Techniques", href: "/memory-techniques", connections: ["Time Management", "Reading List"] },
    ],
  },
]

export default function KnowledgeMapPage() {
  const [activeCluster, setActiveCluster] = useState<number | null>(0)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Knowledge Map</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          See how every tool connects. Tap any tool to see what it links to. Follow the connections to discover what you didn't know you needed.
        </p>
      </div>

      {/* Cluster selector */}
      <div className="flex gap-2 flex-wrap">
        {CLUSTERS.map((c, i) => (
          <button key={i} onClick={() => { setActiveCluster(activeCluster === i ? null : i); setActiveTool(null) }}
            className={cn("text-xs rounded-full px-3 py-1.5 border transition-all font-medium",
              activeCluster === i ? c.color + " border-2" : "border-border text-muted-foreground hover:bg-muted/50"
            )}>{c.name}</button>
        ))}
      </div>

      {/* Active cluster */}
      {activeCluster !== null && (
        <div>
          <Card className={cn("border-2 mb-4", CLUSTERS[activeCluster].color)}>
            <CardContent className="p-4">
              <p className="text-sm font-semibold">{CLUSTERS[activeCluster].name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{CLUSTERS[activeCluster].description}</p>
            </CardContent>
          </Card>

          {/* Visual flow */}
          <div className="space-y-2">
            {CLUSTERS[activeCluster].tools.map((tool, ti) => {
              const isActive = activeTool === tool.name
              return (
                <div key={ti}>
                  <div className={cn("rounded-xl border-2 p-3 cursor-pointer transition-all",
                    isActive ? "border-violet-400 bg-violet-50/30 shadow-sm" : "border-border hover:border-violet-200"
                  )} onClick={() => setActiveTool(isActive ? null : tool.name)}>
                    <div className="flex items-center gap-3">
                      <a href={tool.href} onClick={e => e.stopPropagation()}
                        className="text-sm font-medium hover:text-violet-600 hover:underline">
                        {tool.name}
                      </a>
                      <div className="flex-1" />
                      <div className="flex gap-1">
                        {tool.connections.map((conn, ci) => (
                          <Badge key={ci} variant="outline" className="text-[8px] text-muted-foreground">{conn}</Badge>
                        ))}
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-violet-500" /> Connected Tools
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tool.connections.map((conn, ci) => {
                            // Find the connected tool's href
                            const connTool = CLUSTERS.flatMap(c => c.tools).find(t => t.name === conn)
                            return (
                              <a key={ci} href={connTool?.href || "#"}
                                className="flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50/50 px-2.5 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors">
                                <ArrowRight className="h-2.5 w-2.5" />
                                {conn}
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual connector line */}
                  {ti < CLUSTERS[activeCluster].tools.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <div className="w-0.5 h-3 bg-muted-foreground/10" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why connections matter:</strong> A tool in isolation is useful. A tool connected to related tools
            is powerful. Your budget feeds your financial dashboard. Your financial dashboard reveals your debt.
            Your debt payoff plan connects to your emergency fund. Your emergency fund enables investing. Investing
            connects to retirement. Everything is connected — and the platform is designed so that each tool makes
            every other tool more valuable. Follow the connections.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/tools" className="text-sm text-violet-600 hover:underline">All Tools</a>
        <a href="/quiz" className="text-sm text-amber-600 hover:underline">Personalization Quiz</a>
        <a href="/favorites" className="text-sm text-rose-600 hover:underline">Favorites</a>
        <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress Dashboard</a>
      </div>
    </div>
  )
}
