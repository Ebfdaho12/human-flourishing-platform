"use client"

import { useState } from "react"
import { Heart, Brain, GraduationCap, Landmark, Zap, Shield, CheckCircle, ChevronRight, Sparkles, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const QUICK_WINS = [
  {
    title: "Do a mood check-in",
    desc: "Takes 30 seconds. Rate how you feel 1-10, pick emotions, done.",
    href: "/mental-health",
    icon: Brain,
    color: "text-pink-500",
    bg: "bg-pink-50 border-pink-200",
    reward: "+25 FOUND",
  },
  {
    title: "Log something about your health",
    desc: "Weight, sleep, steps, a meal — anything. Start tracking.",
    href: "/health",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-50 border-rose-200",
    reward: "+25 FOUND",
  },
  {
    title: "Write 3 things you are grateful for",
    desc: "Scientifically proven to improve well-being in 2 weeks.",
    href: "/mental-health/gratitude",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    reward: "+25 FOUND",
  },
  {
    title: "Set a learning goal",
    desc: "What do you want to learn? Math, history, coding — anything.",
    href: "/education",
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    reward: "+25 FOUND",
  },
  {
    title: "Try a breathing exercise",
    desc: "2 minutes of box breathing. Your nervous system will thank you.",
    href: "/mental-health/breathe",
    icon: Shield,
    color: "text-cyan-500",
    bg: "bg-cyan-50 border-cyan-200",
    reward: "Free",
  },
  {
    title: "Explore what your politicians are doing",
    desc: "Search any politician on Aletheia. See their credibility score.",
    href: "/governance",
    icon: Landmark,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    reward: "+25 FOUND",
  },
  {
    title: "Calculate your solar ROI",
    desc: "Could solar panels save you money? Find out in 30 seconds.",
    href: "/energy/learn",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200",
    reward: "Free",
  },
  {
    title: "Set your interests for personalized learning",
    desc: "Tell us what you love. We will teach new subjects through it.",
    href: "/education/personalized",
    icon: Target,
    color: "text-violet-500",
    bg: "bg-violet-50 border-violet-200",
    reward: "Free",
  },
]

export default function GettingStartedPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  function markDone(index: number) {
    setCompleted(prev => new Set([...prev, index]))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Getting Started</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quick wins to get the most out of the platform. Each one takes under 2 minutes.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {completed.size}/{QUICK_WINS.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {QUICK_WINS.map((item, i) => {
          const Icon = item.icon
          const done = completed.has(i)
          return (
            <a key={i} href={item.href} onClick={() => markDone(i)} className="block">
              <Card className={cn("card-hover transition-all", done ? "opacity-50 border-emerald-200" : item.bg)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", done ? "bg-emerald-100" : "bg-white/60")}>
                    {done ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Icon className={cn("h-5 w-5", item.color)} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", done && "line-through")}>{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.reward !== "Free" && (
                      <span className="text-xs font-bold text-violet-600">{item.reward}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>

      {completed.size === QUICK_WINS.length && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-emerald-700">All done!</p>
            <p className="text-sm text-muted-foreground mt-1">You have explored the platform. Now make it a daily habit.</p>
            <a href="/dashboard" className="text-sm text-violet-600 hover:underline mt-3 block">Go to Dashboard</a>
          </CardContent>
        </Card>
      )}

      {/* Platform overview */}
      <div>
        <h2 className="text-lg font-bold mb-3">What is On This Platform</h2>
        <p className="text-xs text-muted-foreground mb-4">60+ tools across 10 categories. Everything you need for health, wealth, family, and personal growth — in one place.</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Financial Tools", count: "11", desc: "Budget, debt payoff, taxes, investments, negotiation", href: "/tools", color: "border-emerald-200 bg-emerald-50/30" },
            { label: "Family", count: "7", desc: "Family economics, meetings, screen time, chores, dates", href: "/tools", color: "border-rose-200 bg-rose-50/30" },
            { label: "Health & Wellness", count: "8", desc: "Body, sleep, food, exercise, symptoms, medications", href: "/tools", color: "border-red-200 bg-red-50/30" },
            { label: "Mental Health", count: "6", desc: "Gratitude, breathing, meditation, affirmations, journaling", href: "/tools", color: "border-violet-200 bg-violet-50/30" },
            { label: "Personal Growth", count: "10", desc: "Life wheel, values, skills, decisions, challenges, habits", href: "/tools", color: "border-cyan-200 bg-cyan-50/30" },
            { label: "Productivity", count: "5", desc: "Planner, routines, focus timer, notes, goals", href: "/tools", color: "border-blue-200 bg-blue-50/30" },
            { label: "Education", count: "8", desc: "Economics, civilizations, money history, rights, fallacies", href: "/tools", color: "border-amber-200 bg-amber-50/30" },
            { label: "Home", count: "3", desc: "Maintenance schedule, emergency prep, food system", href: "/tools", color: "border-orange-200 bg-orange-50/30" },
          ].map(cat => (
            <a key={cat.label} href={cat.href}>
              <Card className={cn("card-hover h-full", cat.color)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{cat.label}</p>
                    <span className="text-xs text-muted-foreground">{cat.count} tools</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{cat.desc}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        <a href="/tools" className="block text-center mt-3">
          <span className="text-sm text-violet-600 hover:underline font-medium">Browse all 60+ tools →</span>
        </a>
      </div>

      {/* Popular starting points */}
      <div>
        <h2 className="text-lg font-bold mb-3">Most Popular Starting Points</h2>
        <div className="space-y-2">
          {[
            { label: "I want to get my finances in order", href: "/budget", desc: "Start with the Budget Calculator → see where your money goes → build a plan" },
            { label: "I want to improve my family life", href: "/family-economics", desc: "Read Family Economics → try a Family Meeting → set up Screen Time tracking" },
            { label: "I want to learn things school never taught", href: "/education/economics", desc: "Economics Education → Money History → Logical Fallacies → Your Rights" },
            { label: "I want to get healthier", href: "/health", desc: "Health Dashboard → Sleep Calculator → 30-Day Health Challenge" },
            { label: "I want to understand the world better", href: "/civilizations", desc: "Civilizations → Media Ownership → Economics → Governance" },
          ].map(item => (
            <a key={item.label} href={item.href}>
              <Card className="card-hover">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>No pressure.</strong> Do one thing today. Come back tomorrow and do another.
            The platform adapts to your pace. Every small action compounds over time.
            Consistency beats intensity, every time. Your data stays on your device — you own every byte.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
