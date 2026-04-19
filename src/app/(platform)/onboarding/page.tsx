"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, ArrowRight, ArrowLeft, CheckCircle, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    title: "Welcome to Your Platform",
    subtitle: "Nine systems. One identity. Your data.",
    content: "This platform is built around a simple idea: you should own your data, control your identity, and have tools that help you flourish — not tools that exploit you.",
    icon: ShieldCheck,
    color: "from-violet-500 to-purple-600",
    tips: [
      "Everything you do here is private by default",
      "Your data is encrypted with military-grade encryption",
      "You can export or delete everything at any time",
    ],
  },
  {
    title: "Track Your Health",
    subtitle: "Health Intelligence",
    content: "Log vitals, exercise, sleep, nutrition, and symptoms. Set goals and track trends over time. The anonymous health cases feature lets you get practitioner input without revealing your identity.",
    icon: Heart,
    color: "from-rose-500 to-red-600",
    tips: [
      "Start with one daily log — even just your weight or steps",
      "The Trends tab shows your progress over 7 to 90 days",
      "Anonymous cases let doctors help you without knowing who you are",
    ],
  },
  {
    title: "Care for Your Mind",
    subtitle: "Mental Health & Community",
    content: "Daily mood check-ins, private journaling, and guided exercises for anxiety and stress. Real crisis helplines are always one tap away.",
    icon: Brain,
    color: "from-pink-500 to-rose-600",
    tips: [
      "A mood check-in takes 30 seconds",
      "The Self-Care tab has breathing exercises and grounding techniques",
      "If you're ever in crisis, real helplines are always visible",
    ],
  },
  {
    title: "Learn Anything",
    subtitle: "Education Intelligence",
    content: "An AI tutor that teaches through questions, not answers. The Socratic method — available 24/7 across 16 subjects from math to philosophy.",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-600",
    tips: [
      "Start a session on any topic — the tutor meets you where you are",
      "Track your learning streak in the Progress tab",
      "Sessions are scored so you can see your mastery improve",
    ],
  },
  {
    title: "Hold Power Accountable",
    subtitle: "Governance Transparency",
    content: "Track what your politicians say, how they vote, and who funds them. Connected to Aletheia's database of 18,000+ public figures with credibility scores.",
    icon: Landmark,
    color: "from-amber-500 to-orange-600",
    tips: [
      "Search any politician to see their credibility score",
      "The Civic Action Guide shows you exactly how to participate",
      "Track votes and legislation to see if promises are kept",
    ],
  },
  {
    title: "Earn & Govern",
    subtitle: "Token Economy",
    content: "Every meaningful action earns FOUND tokens. Stake FOUND to earn VOICE — governance power over the platform itself. No rent-seeking middlemen.",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    tips: [
      "You already earned 100 FOUND just for signing up",
      "Complete your daily checklist to maintain your streak",
      "Stake FOUND for VOICE to have a say in platform decisions",
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  function next() {
    if (isLast) {
      router.push("/dashboard")
    } else {
      setStep(step + 1)
    }
  }

  function prev() {
    if (step > 0) setStep(step - 1)
  }

  function skip() {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-8 bg-violet-500" : i < step ? "w-2 bg-violet-300" : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-r ${current.color} p-8 text-center`}>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{current.title}</h1>
            <p className="text-white/70 text-sm mt-1">{current.subtitle}</p>
          </div>

          <CardContent className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{current.content}</p>

            <div className="space-y-2">
              {current.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={prev}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {!isLast && (
                  <Button variant="ghost" size="sm" onClick={skip}>
                    Skip tour
                  </Button>
                )}
                <Button onClick={next} className={cn("bg-gradient-to-r text-white", current.color)}>
                  {isLast ? "Go to Dashboard" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
