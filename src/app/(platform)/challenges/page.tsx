"use client"

import { useState, useEffect } from "react"
import { Flame, CheckCircle, Clock, Trophy, ChevronRight, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 30-day challenges that build real habits
const CHALLENGES = [
  {
    id: "health-30",
    title: "30-Day Health Kickstart",
    desc: "Build the foundation of a healthy life in one month",
    color: "from-rose-500 to-red-600",
    days: [
      "Log your weight and take a photo (day 1 baseline)",
      "Drink 2 liters of water today — track it",
      "Walk 5,000 steps — just walk",
      "Log everything you eat today — no judgment, just awareness",
      "Do 10 push-ups, 10 squats, 10 sit-ups — that is all",
      "Sleep 7+ hours tonight — set an alarm for bedtime",
      "No added sugar today — read labels",
      "Stretch for 5 minutes before bed",
      "Cook one meal from scratch",
      "Walk 7,500 steps — push a little further",
      "Track your mood — notice how exercise affects it",
      "Try a new vegetable you do not usually eat",
      "Do the 5-minute bodyweight circuit twice",
      "No screens 1 hour before bed",
      "Drink only water today — no soda, juice, or alcohol",
      "Walk 10,000 steps — milestone day",
      "Do a 3-minute breathing exercise",
      "Meal prep tomorrow's lunch tonight",
      "20-minute workout — whatever you enjoy",
      "Log your sleep quality — rate 1-10",
      "Cold shower for 30 seconds at the end",
      "Eat at least 3 servings of vegetables",
      "25-minute workout — push harder",
      "No eating after 8pm",
      "Do the full bodyweight circuit 3 times",
      "Walk 10,000 steps AND 20-minute workout",
      "Fast for 16 hours (skip breakfast, eat 12pm-8pm)",
      "Cook all meals from scratch today",
      "30-minute workout — your best effort",
      "Log weight, take photo, compare to day 1. You did it.",
    ],
  },
  {
    id: "mindset-30",
    title: "30-Day Mindset Upgrade",
    desc: "Rewire your thinking patterns in one month",
    color: "from-violet-500 to-purple-600",
    days: [
      "Write 3 things you are grateful for",
      "No complaining for 24 hours — catch yourself",
      "Write down your 3 biggest goals",
      "Meditate for 3 minutes — just breathe",
      "Write a letter to your future self (1 year from now)",
      "List 5 things you have accomplished that you are proud of",
      "No social media until after 12pm",
      "Read for 20 minutes — any book",
      "Write one fear and why it is probably not as bad as you think",
      "Do something that scares you slightly today",
      "Journal: what would I do if I could not fail?",
      "Compliment 3 people genuinely",
      "Meditate for 5 minutes",
      "Write down 3 limiting beliefs and reframe them",
      "No news or social media for 24 hours",
      "Teach someone one thing you know well",
      "Journal: what am I tolerating that I should not be?",
      "Spend 30 minutes learning something new",
      "Write a forgiveness letter (you do not have to send it)",
      "Meditate for 7 minutes",
      "Say no to one thing you would normally say yes to out of guilt",
      "Journal: what does my ideal day look like?",
      "Do a random act of kindness for a stranger",
      "Read for 30 minutes",
      "Write a list of 10 things that make you unique",
      "Meditate for 10 minutes",
      "Journal: what would I tell my 15-year-old self?",
      "Spend the day without checking your phone first thing in the morning",
      "Write your personal mission statement in one sentence",
      "Read everything you wrote this month. Notice the growth.",
    ],
  },
  {
    id: "finance-30",
    title: "30-Day Money Reset",
    desc: "Take control of your finances in one month",
    color: "from-emerald-500 to-teal-600",
    days: [
      "Write down your total income and all monthly expenses",
      "Check all bank and credit card balances — know your number",
      "List every subscription you pay for — cancel ones you forgot about",
      "Track every dollar you spend today — carry a note",
      "Calculate your net worth (assets minus debts)",
      "Set up automatic savings — even $10/week",
      "Read one article about compound interest",
      "No unnecessary spending today — needs only",
      "Research your employer's retirement match — free money?",
      "Track spending: day 2 — are patterns emerging?",
      "Call one bill provider and negotiate a lower rate",
      "Learn what an index fund is (S&P 500)",
      "No eating out today — cook at home",
      "Calculate your hourly rate (salary / 2080 hours)",
      "Is that $50 purchase worth X hours of your life?",
      "Create a simple budget: income - needs - wants - savings",
      "Research one side hustle related to your skills",
      "No spending on wants today — only needs",
      "Learn the difference between good debt and bad debt",
      "Check your credit score (free at annualcreditreport.com)",
      "Set a 30-day financial goal and write it down",
      "Learn about tax-advantaged accounts (401k, IRA, HSA)",
      "Track your net worth compared to day 5",
      "Find 3 ways to reduce your biggest expense",
      "Learn what dollar-cost averaging means",
      "Sell something you own but do not use",
      "Calculate how much you need for 3-month emergency fund",
      "Set up a separate savings account for emergencies",
      "Review your budget — adjust based on what you learned",
      "You know your numbers now. That is power. Keep going.",
    ],
  },
]

export default function ChallengesPage() {
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, boolean[]>>({})

  useEffect(() => {
    const stored = localStorage.getItem("hfp-challenges")
    if (stored) {
      const data = JSON.parse(stored)
      setProgress(data.progress ?? {})
      setActiveChallenge(data.active ?? null)
    }
  }, [])

  function saveProgress(active: string | null, prog: Record<string, boolean[]>) {
    setActiveChallenge(active)
    setProgress(prog)
    localStorage.setItem("hfp-challenges", JSON.stringify({ active, progress: prog }))
  }

  function startChallenge(id: string) {
    const challenge = CHALLENGES.find(c => c.id === id)
    if (!challenge) return
    const prog = { ...progress, [id]: new Array(challenge.days.length).fill(false) }
    saveProgress(id, prog)
  }

  function toggleDay(challengeId: string, dayIndex: number) {
    const prog = { ...progress }
    if (!prog[challengeId]) return
    prog[challengeId] = [...prog[challengeId]]
    prog[challengeId][dayIndex] = !prog[challengeId][dayIndex]
    saveProgress(activeChallenge, prog)
  }

  const active = activeChallenge ? CHALLENGES.find(c => c.id === activeChallenge) : null
  const activeProgress = activeChallenge ? (progress[activeChallenge] ?? []) : []
  const completedDays = activeProgress.filter(Boolean).length
  const currentDay = activeProgress.findIndex(d => !d)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">30-Day Challenges</h1>
        </div>
        <p className="text-sm text-muted-foreground">Pick a challenge. One task per day. 30 days to build a real habit.</p>
      </div>

      {!active ? (
        <div className="space-y-4">
          {CHALLENGES.map(challenge => {
            const prog = progress[challenge.id]
            const done = prog ? prog.filter(Boolean).length : 0
            const started = !!prog
            return (
              <Card key={challenge.id} className="card-hover cursor-pointer" onClick={() => started ? setActiveChallenge(challenge.id) : startChallenge(challenge.id)}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", challenge.color)}>
                    <Flame className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{challenge.desc}</p>
                    {started && <p className="text-xs font-medium text-violet-600 mt-1">{done}/30 days completed</p>}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setActiveChallenge(null)}>← All challenges</Button>

          <Card className={cn("bg-gradient-to-r text-white", active.color)}>
            <CardContent className="p-5">
              <h2 className="text-xl font-bold">{active.title}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-white/80">{completedDays}/30 days</span>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(completedDays / 30) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's task highlighted */}
          {currentDay >= 0 && currentDay < 30 && (
            <Card className="border-2 border-amber-300 bg-amber-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Today — Day {currentDay + 1}</p>
                <p className="text-sm font-medium">{active.days[currentDay]}</p>
                <Button size="sm" className="mt-3" onClick={() => toggleDay(active.id, currentDay)}>
                  <CheckCircle className="h-4 w-4" /> Mark Complete
                </Button>
              </CardContent>
            </Card>
          )}

          {completedDays === 30 && (
            <Card className="border-emerald-300 bg-emerald-50/30">
              <CardContent className="p-6 text-center">
                <Trophy className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-emerald-700">Challenge Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">30 days. You built something real.</p>
              </CardContent>
            </Card>
          )}

          {/* All days */}
          <div className="space-y-1.5">
            {active.days.map((day, i) => (
              <div key={i}
                className={cn("flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer",
                  activeProgress[i] ? "border-emerald-200 bg-emerald-50/30 opacity-70" :
                  i === currentDay ? "border-amber-300 bg-amber-50/20" : "border-border"
                )}
                onClick={() => toggleDay(active.id, i)}>
                {activeProgress[i] ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-[10px] text-muted-foreground">Day {i + 1}</p>
                  <p className={cn("text-sm", activeProgress[i] && "line-through text-muted-foreground")}>{day}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why 30 days?</strong> Research from University College London found it takes an average of
            66 days to form a habit, but 30 days of consistency builds enough momentum that most people continue
            naturally. The key is not perfection — missing one day does not reset your progress. Just do the next day.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Circle({ className }: { className?: string }) {
  return <div className={cn("h-5 w-5 rounded-full border-2 border-muted-foreground/30", className)} />
}
