"use client"

import { useState } from "react"
import { DollarSign, ChevronDown, Brain, Shield, Sparkles, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const QUESTIONS = [
  { id: 1, text: "When you get an unexpected $500, your first instinct is to:", options: ["Save it immediately — you never know what's coming", "Pay down debt or a bill", "Spend it on something you've wanted", "Give some away or invest in an experience"] },
  { id: 2, text: "Money is fundamentally:", options: ["Security — a buffer against disaster", "A tool for building wealth", "A means to enjoy life now", "A resource that should flow and be shared"] },
  { id: 3, text: "When you think about retirement savings, you feel:", options: ["Anxious — you worry it will never be enough", "Focused — you have a plan and stick to it", "Disconnected — future-you feels abstract", "Conflicted — you want to enjoy the present too"] },
  { id: 4, text: "Your earliest money memory involves:", options: ["Scarcity or financial stress in the home", "Being taught to save and be responsible", "Being rewarded or treated with purchases", "Money causing conflict or moral discomfort"] },
  { id: 5, text: "You feel guilty when:", options: ["You spend money on non-essentials", "You're not maximizing returns on savings", "You DON'T spend on experiences or pleasure", "You accumulate wealth without giving back"] },
  { id: 6, text: "Your financial goal is:", options: ["Build a safety net that lets me sleep at night", "Achieve financial independence and wealth", "Fund the experiences that make life rich", "Use money as a force for good"] },
  { id: 7, text: "When a friend asks to borrow money:", options: ["You feel deeply uncomfortable — what if they don't repay?", "You evaluate it like a business decision", "You usually say yes — money should be shared", "You prefer to give it rather than loan it"] },
  { id: 8, text: "Financial stress for you looks like:", options: ["Any account balance dropping below your target", "Missing a financial milestone or growth target", "Not being able to do something you want", "Feeling trapped or controlled by money obligations"] },
  { id: 9, text: "Your relationship with debt:", options: ["Avoid at all costs — debt is dangerous", "Strategic debt can build wealth", "Not a big concern if life is good", "Debt feels like a moral failure"] },
  { id: 10, text: "In 10 years, you want money to have given you:", options: ["Complete security — never worrying again", "Financial freedom and significant assets", "A life full of rich experiences and memories", "A positive impact on others and the world"] },
]

const TYPES = {
  Guardian: {
    icon: Shield,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    desc: "You see money primarily as protection. Financial security is your north star — the ability to weather any storm.",
    strengths: ["Disciplined saver — never blows a budget", "Excellent emergency fund habits", "Rarely carries consumer debt", "Handles financial crises calmly"],
    weaknesses: ["May under-invest due to fear of loss", "Can struggle to spend on joy even when you can afford it", "Risk aversion may cost long-term wealth", "Money anxiety can persist regardless of balance"],
    balance: "Your safety comes from security — and that's real. The growth edge: distinguish between 'need' and 'fear.' A fully funded emergency fund IS enough. Practice intentional spending on things that matter to you.",
  },
  Accumulator: {
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    desc: "You're wired for wealth-building. You think in compound interest, asset allocation, and financial milestones.",
    strengths: ["Excellent long-term investor", "Naturally maximizes opportunities", "Motivated by growth metrics", "Often builds significant net worth"],
    weaknesses: ["Can sacrifice present joy for future numbers", "Relationships may suffer if family feels like a budget line", "May confuse net worth with self-worth", "Difficulty knowing 'enough'"],
    balance: "Your wealth-building instinct is powerful. The growth edge: money is a tool, not a scoreboard. Define what 'enough' looks like. Schedule guilt-free spending on experiences. Your richest memories won't be the day you hit a number.",
  },
  PleasureSeeker: {
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    desc: "You live fully in the present. Money's purpose is to enable rich experiences, joy, and connection — right now.",
    strengths: ["High quality of life and enjoyment", "Generous and fun to be around", "Not burdened by scarcity thinking", "Values experiences over things"],
    weaknesses: ["May under-save for future security", "Vulnerable to lifestyle inflation", "Future financial stress is common", "Can struggle with long-term planning"],
    balance: "Your ability to extract joy from money is a gift many people never develop. The growth edge: future-you deserves the same care as present-you. Automate savings so you never choose — the joy still flows, and security builds silently.",
  },
  Idealist: {
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    desc: "You have a complex relationship with wealth. Money feels morally loaded — you want it to do good, and large accumulation feels uncomfortable.",
    strengths: ["Highly generous and community-oriented", "Not driven by status or consumption", "Strong values alignment with spending", "Often motivates others toward social good"],
    weaknesses: ["May under-earn or under-charge due to money discomfort", "Wealth guilt can prevent building security", "May give beyond personal means", "Financial planning feels distasteful"],
    balance: "Your values are a strength — the world needs more people who think about money's impact. The growth edge: you can't pour from an empty cup. Financial security makes you MORE able to give generously, not less. Abundance and ethics coexist.",
  },
}

const SCORE_MAP: Record<number, keyof typeof TYPES> = { 0: "Guardian", 1: "Accumulator", 2: "PleasureSeeker", 3: "Idealist" }

export default function MoneyRelationshipPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<keyof typeof TYPES | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  function handleAnswer(qId: number, idx: number) {
    const next = { ...answers, [qId]: idx }
    setAnswers(next)
    if (Object.keys(next).length === QUESTIONS.length) {
      const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
      Object.values(next).forEach(v => { counts[v] = (counts[v] || 0) + 1 })
      const top = parseInt(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0])
      setResult(SCORE_MAP[top])
    }
  }

  const type = result ? TYPES[result] : null
  const TypeIcon = type?.icon

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Relationship With Money</h1>
        </div>
        <p className="text-sm text-muted-foreground">10-question assessment based on financial psychology research. Discover your money personality and what it means.</p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-emerald-900">Key insight: Your money behaviours are shaped by your earliest experiences — not logic.</p>
          <p className="text-sm text-emerald-700 mt-1">Understanding your money type is the first step to changing your financial story. None of the four types is wrong — each has strengths to leverage and blind spots to address.</p>
        </CardContent>
      </Card>

      {!result && (
        <div className="space-y-4">
          {QUESTIONS.map((q, qi) => (
            <Card key={q.id} className={cn("border", answers[q.id] !== undefined && "border-emerald-300")}>
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold mb-3">{qi + 1}. {q.text}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.id, oi)}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg border transition-all",
                        answers[q.id] === oi
                          ? "bg-emerald-100 border-emerald-400 font-medium text-emerald-900"
                          : "border-border hover:border-emerald-300 hover:bg-muted/50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground text-center">{Object.keys(answers).length} of {QUESTIONS.length} answered</p>
        </div>
      )}

      {result && type && TypeIcon && (
        <div className="space-y-4">
          <Card className={cn("border-2", type.bg)}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", type.color)}>
                  <TypeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Badge className={type.badge}>Your Type</Badge>
                  <h2 className="text-xl font-bold mt-0.5">The {result}</h2>
                </div>
              </div>
              <p className="text-sm">{type.desc}</p>
            </CardContent>
          </Card>

          {[
            { key: "strengths", label: "Strengths", items: type.strengths },
            { key: "weaknesses", label: "Watch Out For", items: type.weaknesses },
          ].map(section => (
            <Card key={section.key} className="border">
              <CardContent className="pt-0 pb-0">
                <button
                  onClick={() => setExpanded(expanded === section.key ? null : section.key)}
                  className="w-full flex items-center justify-between py-4 text-sm font-semibold"
                >
                  {section.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded === section.key && "rotate-180")} />
                </button>
                {expanded === section.key && (
                  <div className="pb-4 space-y-1">
                    {section.items.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-foreground font-medium">•</span>{item}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="border-2 border-violet-200 bg-violet-50/30">
            <CardContent className="pt-4 pb-3">
              <p className="text-sm font-semibold text-violet-900 mb-1">How to balance your type</p>
              <p className="text-sm text-violet-800">{type.balance}</p>
            </CardContent>
          </Card>

          <button onClick={() => { setAnswers({}); setResult(null); setExpanded(null) }} className="text-sm text-muted-foreground underline underline-offset-2">Retake assessment</button>
        </div>
      )}

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/budget" className="hover:underline text-foreground">Budget</a>
        <a href="/debt-payoff" className="hover:underline text-foreground">Debt Payoff</a>
        <a href="/values" className="hover:underline text-foreground">Personal Values</a>
        <a href="/divorce-finance" className="hover:underline text-foreground">Divorce Finances</a>
      </div>
    </div>
  )
}
