"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, CheckCircle, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const QUESTIONS: {
  question: string
  options: { label: string; value: string; emoji: string }[]
}[] = [
  {
    question: "What matters most to you right now?",
    options: [
      { label: "Getting my finances in order", value: "finance", emoji: "💰" },
      { label: "Being a better parent / building family", value: "family", emoji: "👨‍👩‍👧‍👦" },
      { label: "Improving my health", value: "health", emoji: "❤️" },
      { label: "Learning & understanding the world", value: "education", emoji: "📚" },
      { label: "Personal growth & productivity", value: "growth", emoji: "🎯" },
      { label: "Understanding Canada's issues", value: "canada", emoji: "🇨🇦" },
    ],
  },
  {
    question: "Where are you financially?",
    options: [
      { label: "In debt and stressed", value: "debt", emoji: "😰" },
      { label: "Living paycheck to paycheck", value: "paycheck", emoji: "📊" },
      { label: "Stable but not saving enough", value: "stable", emoji: "😐" },
      { label: "Saving and investing", value: "investing", emoji: "📈" },
      { label: "I honestly don't know my numbers", value: "unknown", emoji: "🤷" },
    ],
  },
  {
    question: "What is your family situation?",
    options: [
      { label: "Single, no kids", value: "single", emoji: "🙋" },
      { label: "Couple, no kids", value: "couple", emoji: "💑" },
      { label: "Family with young children (0-5)", value: "young-kids", emoji: "👶" },
      { label: "Family with school-age kids (6-17)", value: "school-kids", emoji: "🧒" },
      { label: "Empty nest / retired or near-retired", value: "empty-nest", emoji: "🏡" },
    ],
  },
  {
    question: "How do you learn best?",
    options: [
      { label: "Give me the data — I'll figure it out", value: "data", emoji: "📊" },
      { label: "Simple explanations first, detail later", value: "simple", emoji: "💡" },
      { label: "Show me what to DO, not just what to know", value: "action", emoji: "⚡" },
      { label: "I want to understand the WHY behind everything", value: "why", emoji: "🧠" },
    ],
  },
]

const RECOMMENDATIONS: Record<string, { title: string; tools: { name: string; href: string; why: string }[] }> = {
  finance: {
    title: "Your Financial Foundation",
    tools: [
      { name: "Budget Calculator", href: "/budget", why: "See where every dollar goes — the first step to control" },
      { name: "Financial Dashboard", href: "/financial-dashboard", why: "Your complete financial picture in one view" },
      { name: "Debt Payoff Calculator", href: "/debt-payoff", why: "Make a plan to become debt-free" },
      { name: "Real Hourly Rate", href: "/real-hourly-rate", why: "What you ACTUALLY earn per hour (it's less than you think)" },
      { name: "Canadian Tax Optimization", href: "/canada/tax-optimization", why: "TFSA, RRSP, FHSA — save $2K-$10K/year in taxes" },
      { name: "Negotiation Scripts", href: "/negotiation", why: "Word-for-word scripts that save thousands immediately" },
    ],
  },
  family: {
    title: "Building a Strong Family",
    tools: [
      { name: "Family Economics", href: "/family-economics", why: "Can one parent stay home? The math is surprising" },
      { name: "Family Meeting", href: "/family-meeting", why: "30 minutes/week that transforms communication" },
      { name: "Parenting Guide", href: "/parenting", why: "Age-by-age milestones, activities, and what matters most" },
      { name: "Screen Time Tracker", href: "/screen-time", why: "Replace, don't ban — reduce screens intentionally" },
      { name: "Meal Planner", href: "/meal-planner", why: "Save $500-$800/month and eat better" },
      { name: "Birth Fund", href: "/birth-fund", why: "A retirement fund for your child from day one" },
    ],
  },
  health: {
    title: "Your Health Journey",
    tools: [
      { name: "Health Dashboard", href: "/health", why: "Track everything in one place" },
      { name: "Sleep Calculator", href: "/sleep-calculator", why: "Wake up refreshed instead of groggy" },
      { name: "30-Day Health Challenge", href: "/challenges", why: "Build habits in 30 days — one task per day" },
      { name: "Mental Health Hub", href: "/mental-health", why: "Breathing, meditation, journaling, affirmations" },
      { name: "Daily Routines", href: "/routine", why: "Science-backed morning and evening routines" },
      { name: "Cooking Basics", href: "/cooking", why: "8 meals that save money and improve nutrition" },
    ],
  },
  education: {
    title: "Understanding the World",
    tools: [
      { name: "Economics Education", href: "/education/economics", why: "What school never taught you — Austrian, Chicago, Keynesian" },
      { name: "Rise & Fall of Civilizations", href: "/civilizations", why: "5,000 years of patterns that repeat" },
      { name: "Money History", href: "/money-history", why: "How money works and why 1971 changed everything" },
      { name: "Logical Fallacies", href: "/logical-fallacies", why: "20 tricks people use to win without being right" },
      { name: "Media Ownership", href: "/media-ownership", why: "Who owns the news — and why it matters" },
      { name: "Your Rights", href: "/rights", why: "Charter of Rights + Bill of Rights in plain language" },
    ],
  },
  growth: {
    title: "Personal Growth Path",
    tools: [
      { name: "Life Wheel Assessment", href: "/life-wheel", why: "See your balance across 10 life areas" },
      { name: "Core Values Discovery", href: "/values", why: "Know yourself — decide with clarity" },
      { name: "Decision Journal", href: "/decisions", why: "Track decisions and learn from patterns" },
      { name: "Skill Inventory", href: "/skills", why: "Map everything you know, find strategic gaps" },
      { name: "Habit Stacking", href: "/habit-stack", why: "Chain habits together for unstoppable routines" },
      { name: "Reading List", href: "/reading", why: "Track books + curated recommendations" },
    ],
  },
  canada: {
    title: "Understanding Canada",
    tools: [
      { name: "Canada Sovereignty Report", href: "/canada", why: "What Canada has, lacks, and needs" },
      { name: "Canada Trajectories", href: "/canada/trajectories", why: "Political theatre vs 1,000-year solutions" },
      { name: "Housing Crisis", href: "/canada/housing", why: "Why homes cost what they do — and what fixes it" },
      { name: "Government Spending", href: "/canada/spending", why: "Where the money goes + documented waste" },
      { name: "Root Causes", href: "/canada/root-causes", why: "Trace every problem to the decision that caused it" },
      { name: "Canada vs World", href: "/canada/vs-world", why: "15 metrics — where Canada leads and fails" },
    ],
  },
}

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState(false)

  function answer(value: string) {
    const updated = [...answers, value]
    setAnswers(updated)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setDone(true)
      localStorage.setItem("hfp-quiz", JSON.stringify(updated))
    }
  }

  const primaryFocus = answers[0] || "finance"
  const recs = RECOMMENDATIONS[primaryFocus] || RECOMMENDATIONS.finance

  if (done) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Your Personalized Path</h1>
          <p className="text-sm text-muted-foreground mt-1">Based on your answers, here is where to start:</p>
        </div>

        <Card className="border-2 border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-emerald-900 mb-3">{recs.title}</p>
            <div className="space-y-2">
              {recs.tools.map((t, i) => (
                <a key={i} href={t.href}>
                  <Card className="card-hover">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.why}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => { setStep(0); setAnswers([]); setDone(false) }}>
            Retake Quiz
          </Button>
          <a href="/tools" className="block mt-3 text-sm text-violet-600 hover:underline">Or browse all 130+ tools →</a>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[step]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Find Your Starting Point</h1>
        </div>
        <p className="text-sm text-muted-foreground">4 questions. 30 seconds. Get personalized tool recommendations.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full",
            i < step ? "bg-emerald-400" : i === step ? "bg-violet-400" : "bg-muted"
          )} />
        ))}
      </div>

      <Card className="border-2 border-violet-200">
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Question {step + 1} of {QUESTIONS.length}</p>
          <p className="text-lg font-semibold mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => answer(opt.value)}
                className="w-full flex items-center gap-3 rounded-xl border-2 border-border p-3 hover:border-violet-400 hover:bg-violet-50/30 transition-all text-left">
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
