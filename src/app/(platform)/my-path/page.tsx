"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Heart, Brain, DollarSign, Users, BookOpen, Dumbbell, Moon, Target, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  options: { label: string; value: string; icon?: any; description?: string }[]
  multi?: boolean
}

const QUESTIONS: Question[] = [
  {
    id: "focus", question: "What matters most to you right now?", multi: true,
    options: [
      { label: "Physical Health", value: "health", icon: Heart, description: "Sleep, exercise, nutrition, vitals" },
      { label: "Mental Health", value: "mental", icon: Brain, description: "Mood, stress, journaling" },
      { label: "Money & Finances", value: "finance", icon: DollarSign, description: "Budget, debt, investing" },
      { label: "Relationships", value: "relationships", icon: Users, description: "Family, partner, community" },
      { label: "Learning & Growth", value: "learning", icon: BookOpen, description: "Reading, skills, career" },
      { label: "Fitness & Body", value: "fitness", icon: Dumbbell, description: "Exercise, body composition" },
    ],
  },
  {
    id: "challenge", question: "What's your biggest challenge today?",
    options: [
      { label: "I'm overwhelmed — don't know where to start", value: "overwhelmed" },
      { label: "I know what to do but can't stay consistent", value: "consistency" },
      { label: "I want to optimize what's already working", value: "optimize" },
      { label: "I'm going through a major life change", value: "change" },
      { label: "I want to build better habits from scratch", value: "habits" },
    ],
  },
  {
    id: "time", question: "How much time can you invest daily?",
    options: [
      { label: "2 minutes", value: "2min", description: "Just a quick check-in" },
      { label: "5-10 minutes", value: "5min", description: "Morning routine + tracking" },
      { label: "15-30 minutes", value: "15min", description: "Deep engagement" },
      { label: "As much as it takes", value: "unlimited", description: "Full immersion" },
    ],
  },
  {
    id: "curiosity", question: "What else interests you?", multi: true,
    options: [
      { label: "Data privacy / owning my data", value: "privacy" },
      { label: "Seeing correlations in my data", value: "correlations" },
      { label: "Canada analysis / civic engagement", value: "canada" },
      { label: "Moon cycles / natural rhythms", value: "lunar" },
      { label: "Blockchain / FOUND tokens", value: "blockchain" },
      { label: "Community / accountability", value: "community" },
    ],
  },
]

function generatePath(answers: Record<string, string[]>) {
  const focus = answers.focus || []
  const challenge = answers.challenge?.[0] || "habits"
  const time = answers.time?.[0] || "5min"
  const curiosity = answers.curiosity || []

  const steps: { label: string; link: string; icon: any; priority: "start-here" | "this-week" | "explore-later" }[] = []

  steps.push({ label: "Morning Briefing — your daily starting point", link: "/morning-briefing", icon: Sparkles, priority: "start-here" })

  if (focus.includes("mental")) {
    steps.push({ label: "Do your first mood check-in (30 seconds)", link: "/mental-health", icon: Brain, priority: "start-here" })
    steps.push({ label: "Try a breathwork session", link: "/breathwork", icon: Moon, priority: "this-week" })
  }
  if (focus.includes("health")) {
    steps.push({ label: "Log one health metric today", link: "/health", icon: Heart, priority: "start-here" })
    steps.push({ label: "Read about fascia — the hidden system", link: "/fascia", icon: Dumbbell, priority: "this-week" })
    steps.push({ label: "Check your health protocols", link: "/health-protocols", icon: Heart, priority: "this-week" })
  }
  if (focus.includes("finance")) {
    steps.push({ label: "Set up your budget", link: "/budget", icon: DollarSign, priority: "start-here" })
    steps.push({ label: "Calculate your real hourly rate", link: "/real-hourly-rate", icon: DollarSign, priority: "this-week" })
    steps.push({ label: "Open your financial dashboard", link: "/financial-dashboard", icon: DollarSign, priority: "this-week" })
  }
  if (focus.includes("fitness")) {
    steps.push({ label: "Track body composition", link: "/body-composition", icon: Dumbbell, priority: "start-here" })
    steps.push({ label: "Learn about fascia and movement", link: "/fascia", icon: Heart, priority: "this-week" })
  }
  if (focus.includes("relationships")) {
    steps.push({ label: "Check zodiac compatibility", link: "/chinese-zodiac", icon: Users, priority: "this-week" })
    steps.push({ label: "Join or create a family group", link: "/family-group", icon: Users, priority: "this-week" })
  }
  if (focus.includes("learning")) {
    steps.push({ label: "Start your reading log", link: "/reading", icon: BookOpen, priority: "start-here" })
    steps.push({ label: "Explore the knowledge map", link: "/knowledge-map", icon: BookOpen, priority: "this-week" })
  }

  if (challenge === "overwhelmed") steps.push({ label: "Life wheel assessment — see where to focus", link: "/life-wheel", icon: Target, priority: "start-here" })
  if (challenge === "consistency") steps.push({ label: "Build a habit stack", link: "/habit-stack", icon: Target, priority: "this-week" })
  if (challenge === "change") steps.push({ label: "Write your vision", link: "/vision", icon: Target, priority: "start-here" })

  if (curiosity.includes("correlations")) steps.push({ label: "View your pattern correlations", link: "/correlations", icon: Brain, priority: "this-week" })
  if (curiosity.includes("lunar")) steps.push({ label: "Start lunar cycle tracking", link: "/lunar-cycles", icon: Moon, priority: "this-week" })
  if (curiosity.includes("canada")) steps.push({ label: "Explore Canada deep-dive (28 pages)", link: "/canada", icon: BookOpen, priority: "this-week" })
  if (curiosity.includes("privacy")) steps.push({ label: "See how your data is protected", link: "/privacy-architecture", icon: CheckCircle, priority: "this-week" })
  if (curiosity.includes("blockchain")) steps.push({ label: "Learn about FOUND tokens", link: "/tokens", icon: DollarSign, priority: "explore-later" })
  if (curiosity.includes("community")) steps.push({ label: "Join a discussion room", link: "/community", icon: Users, priority: "this-week" })

  steps.push({ label: "See your life trajectory", link: "/trajectory", icon: Target, priority: "explore-later" })
  steps.push({ label: "Do a weekly reflection", link: "/weekly-reflection", icon: Brain, priority: "explore-later" })
  steps.push({ label: "Browse all 200+ tools", link: "/tools", icon: Sparkles, priority: "explore-later" })

  const seen = new Set<string>()
  const unique = steps.filter(s => { if (seen.has(s.link)) return false; seen.add(s.link); return true })

  const title = challenge === "overwhelmed" ? "Your Calm Start" : challenge === "consistency" ? "Your Consistency Path" : challenge === "optimize" ? "Your Optimization Path" : challenge === "change" ? "Your Transition Path" : "Your Personal Path"
  const description = time === "2min" ? "Designed for 2 minutes a day. One action per day builds the habit." : time === "5min" ? "5-10 minutes per day — track, reflect, grow." : time === "15min" ? "15-30 minutes of deep engagement daily." : "Full immersion — the entire platform at your pace."

  return { title, description, steps: unique }
}

export default function MyPathPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [showResults, setShowResults] = useState(false)

  // Check for saved path
  useEffect(() => {
    const saved = localStorage.getItem("hfp-my-path")
    if (saved) { setShowResults(true); setAnswers(JSON.parse(saved)) }
  }, [])

  const question = QUESTIONS[step]
  const selected = answers[question?.id] || []

  function toggle(value: string) {
    const current = answers[question.id] || []
    if (question.multi) {
      setAnswers({ ...answers, [question.id]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] })
    } else {
      const updated = { ...answers, [question.id]: [value] }
      setAnswers(updated)
      if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 300)
      else { localStorage.setItem("hfp-my-path", JSON.stringify(updated)); setTimeout(() => setShowResults(true), 300) }
    }
  }

  function next() {
    if (step < QUESTIONS.length - 1) setStep(step + 1)
    else { localStorage.setItem("hfp-my-path", JSON.stringify(answers)); setShowResults(true) }
  }

  function retake() { setShowResults(false); setStep(0); setAnswers({}); localStorage.removeItem("hfp-my-path") }

  const path = showResults ? generatePath(answers) : null

  if (showResults && path) {
    const startHere = path.steps.filter(s => s.priority === "start-here")
    const thisWeek = path.steps.filter(s => s.priority === "this-week")
    const later = path.steps.filter(s => s.priority === "explore-later")

    return (
      <div className="space-y-6 max-w-2xl">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-violet-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
        </div>

        {startHere.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Start Here (Today)</p>
            <div className="space-y-2">
              {startHere.map((s, i) => { const Icon = s.icon; return (
                <a key={i} href={s.link} className="flex items-center gap-3 rounded-lg border-2 border-emerald-200 bg-emerald-50/20 p-3 hover:bg-emerald-50/40 transition-colors">
                  <Icon className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium flex-1">{s.label}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </a>
              )})}
            </div>
          </div>
        )}

        {thisWeek.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">This Week</p>
            <div className="space-y-2">
              {thisWeek.map((s, i) => { const Icon = s.icon; return (
                <a key={i} href={s.link} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <Icon className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm flex-1">{s.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>
              )})}
            </div>
          </div>
        )}

        {later.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore Later</p>
            <div className="space-y-1">
              {later.map((s, i) => (
                <a key={i} href={s.link} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 text-sm text-muted-foreground">
                  <span className="flex-1">{s.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={retake}>Retake Quiz</Button>
          <Button onClick={() => router.push(startHere[0]?.link || "/dashboard")} className="bg-violet-600 hover:bg-violet-700">
            Start Now <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Question {step + 1} of {QUESTIONS.length}</p>
        <div className="flex gap-1 justify-center mb-4">
          {QUESTIONS.map((_, i) => <div key={i} className={cn("h-1.5 w-8 rounded-full", i <= step ? "bg-violet-500" : "bg-muted")} />)}
        </div>
        <h1 className="text-xl font-bold">{question.question}</h1>
        {question.multi && <p className="text-xs text-muted-foreground mt-1">Select all that apply</p>}
      </div>

      <div className="grid gap-2">
        {question.options.map((opt, i) => {
          const Icon = opt.icon; const isSelected = selected.includes(opt.value)
          return (
            <button key={i} onClick={() => toggle(opt.value)} className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors", isSelected ? "border-violet-400 bg-violet-50/30 ring-1 ring-violet-400" : "hover:bg-muted/50")}>
              {Icon && <Icon className={cn("h-5 w-5 shrink-0", isSelected ? "text-violet-500" : "text-muted-foreground")} />}
              <div className="flex-1">
                <p className="text-sm font-medium">{opt.label}</p>
                {opt.description && <p className="text-[10px] text-muted-foreground">{opt.description}</p>}
              </div>
              {isSelected && <CheckCircle className="h-4 w-4 text-violet-500 shrink-0" />}
            </button>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        {question.multi && <Button onClick={next} disabled={selected.length === 0}>{step === QUESTIONS.length - 1 ? "See My Path" : "Next"} <ArrowRight className="h-4 w-4 ml-1" /></Button>}
      </div>
    </div>
  )
}
