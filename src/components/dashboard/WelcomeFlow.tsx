"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, Heart, Brain, CheckSquare, Target, X, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * WelcomeFlow — Adaptive first-time user experience
 *
 * Detects new users (no data in localStorage) and shows a gentle,
 * step-by-step introduction instead of the full dashboard.
 *
 * Steps:
 * 1. Welcome message + what this platform is (5 seconds)
 * 2. "Do your first mood check-in" (30 seconds)
 * 3. "Set up 3 habits" (1 minute)
 * 4. "Explore your path" → links to /my-path quiz
 * 5. Dismisses forever after completion or manual close
 *
 * Returns null for returning users (data exists).
 */

interface Step {
  title: string
  description: string
  action: string
  href: string
  icon: any
  color: string
  checkKey: string // localStorage key to check if done
}

const STEPS: Step[] = [
  {
    title: "Log your first mood",
    description: "Rate how you feel 1-10. Takes 30 seconds. This is the foundation — everything builds on knowing how you feel.",
    action: "Check in now",
    href: "/mental-health",
    icon: Brain,
    color: "text-violet-500 bg-violet-50 border-violet-200",
    checkKey: "mood-done",
  },
  {
    title: "Set up your daily habits",
    description: "10 default habits ready to go — or customize your own. Check them off each day. Streaks build automatically.",
    action: "Set up habits",
    href: "/daily-habits",
    icon: CheckSquare,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    checkKey: "habits-done",
  },
  {
    title: "Find your path",
    description: "Answer 4 quick questions. The platform creates a personalized starting point based on what matters to you.",
    action: "Take the quiz",
    href: "/my-path",
    icon: Target,
    color: "text-blue-500 bg-blue-50 border-blue-200",
    checkKey: "path-done",
  },
]

export function WelcomeFlow() {
  const [show, setShow] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user is new (no significant data yet)
    const hasHabits = localStorage.getItem("hfp-daily-habits")
    const hasGratitude = localStorage.getItem("hfp-gratitude")
    const hasEvening = localStorage.getItem("hfp-evening-review")
    const hasDismissed = localStorage.getItem("hfp-welcome-dismissed")
    const hasPath = localStorage.getItem("hfp-my-path")

    // If user has data OR has dismissed, don't show
    if (hasDismissed || hasGratitude || hasEvening) {
      setShow(false)
      return
    }

    // Check which steps are done
    const done = new Set<string>()

    // Habits initialized counts as done (even if default set)
    if (hasHabits) {
      const habits = JSON.parse(hasHabits)
      if (habits.length > 0) done.add("habits-done")
    }
    if (hasPath) done.add("path-done")

    setCompleted(done)

    // Show for new users
    if (done.size < STEPS.length) {
      setShow(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem("hfp-welcome-dismissed", "true")
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed) return null

  const completedCount = completed.size
  const allDone = completedCount >= STEPS.length

  return (
    <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-50/50 to-purple-50/30 mb-6">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-sm font-bold text-violet-900">Welcome to Your Platform</p>
              <p className="text-[10px] text-muted-foreground">3 quick steps to get started — takes 2 minutes total</p>
            </div>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1" title="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i < completedCount ? "bg-violet-500" : "bg-muted")} />
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isDone = completed.has(step.checkKey)
            return (
              <a key={i} href={step.href} className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-all",
                isDone ? "opacity-50 bg-muted/30" : `${step.color} hover:shadow-md`
              )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold", isDone ? "line-through" : "")}>{step.title}</p>
                  <p className="text-[10px] text-muted-foreground">{step.description}</p>
                </div>
                {isDone ? (
                  <span className="text-[10px] text-emerald-600 font-medium shrink-0">Done ✓</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </a>
            )
          })}
        </div>

        {allDone && (
          <div className="mt-3 text-center">
            <p className="text-xs text-violet-700 font-medium">All set! The platform is yours to explore.</p>
            <Button variant="outline" size="sm" onClick={dismiss} className="mt-2 text-xs">Got it — show me the dashboard</Button>
          </div>
        )}

        <p className="text-[9px] text-muted-foreground text-center mt-3">
          You can always access these from the sidebar. No rush — the platform adapts to your pace.
        </p>
      </CardContent>
    </Card>
  )
}
