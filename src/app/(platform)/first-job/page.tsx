"use client"

import { useState, useEffect } from "react"
import { Briefcase, CheckCircle, DollarSign, Shield, TrendingUp, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CHECKLIST: { task: string; why: string; timeframe: string; priority: string }[] = [
  { task: "Understand your pay stub", why: "Your gross pay is NOT what you take home. Deductions: income tax (federal + provincial), CPP, EI. Know where every dollar goes. Your real hourly rate is lower than you think.", timeframe: "Day 1", priority: "essential" },
  { task: "Set up direct deposit + a free chequing account", why: "Many employers require direct deposit. Get a no-fee chequing account (Simplii, Tangerine, or credit union — NOT a Big 5 bank charging $15/month for nothing).", timeframe: "Week 1", priority: "essential" },
  { task: "Open a TFSA immediately", why: "You get $7,000/year of contribution room starting at age 18. Every year you don't open one, you lose room forever. Even $50/month invested at 7% from age 18 to 65 = $218,000. From age 25 = $144,000. Those 7 years cost $74,000.", timeframe: "Week 1", priority: "essential" },
  { task: "Build a 1-month emergency fund", why: "Before investing, before anything — save 1 month of expenses in a HISA. Then grow to 3 months. This prevents credit card debt when unexpected costs hit.", timeframe: "Month 1-3", priority: "essential" },
  { task: "Enroll in workplace benefits (if offered)", why: "Employer health insurance, dental, life insurance, RRSP matching — read every benefit. RRSP matching is FREE MONEY: if your employer matches 50% up to 3% of salary, that is a 50% instant return. Never leave it on the table.", timeframe: "Week 1", priority: "essential" },
  { task: "Set up automatic savings (pay yourself first)", why: "The day your pay hits: automatically move 10-20% to savings/TFSA before you can spend it. You will adjust to living on the rest. If you wait until 'after expenses' to save, there's never anything left.", timeframe: "Month 1", priority: "high" },
  { task: "Get a credit card — use it correctly", why: "Build credit history from day one. Use for small purchases (gas, groceries). Pay in FULL every month. Never carry a balance. Set up autopay for full statement balance. This builds a credit score without costing a cent in interest.", timeframe: "Month 1-2", priority: "high" },
  { task: "Learn your tax situation", why: "File your taxes even if income is low — you may get a GST credit ($400-$500/year), climate action incentive, or provincial credits. Use free software: Wealthsimple Tax or SimpleTax. Filing takes 20 minutes and can put $1,000+ back in your pocket.", timeframe: "By April of first year", priority: "high" },
  { task: "Avoid lifestyle inflation", why: "When your income goes up, keep expenses flat. The gap between income and expenses is the ONLY thing that builds wealth. A person earning $50K who saves $10K builds wealth faster than a person earning $100K who saves $5K.", timeframe: "Ongoing", priority: "high" },
  { task: "Start investing ($50/month minimum)", why: "Once emergency fund is started and debt is under control: invest in a low-cost index fund (VEQT or XEQT) inside your TFSA. $50/month at 7% for 40 years = $131,000 from $24,000 invested. Start now, increase as income grows.", timeframe: "Month 3-6", priority: "medium" },
  { task: "Negotiate your salary (even at the start)", why: "The average person who negotiates their first salary earns $500K-$1M more over their career. Even $2K more at the start compounds: $2K/year × 40 years + raises based on higher base = $100K+ more lifetime earnings.", timeframe: "Before or at start", priority: "medium" },
  { task: "Track your spending for 30 days", why: "You cannot manage what you cannot see. Track every dollar for one month. Most people are shocked by how much goes to eating out, subscriptions, and impulse purchases. Awareness alone reduces unnecessary spending 15-20%.", timeframe: "Month 1", priority: "medium" },
]

export default function FirstJobPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem("hfp-first-job")
    if (stored) setChecked(new Set(JSON.parse(stored)))
  }, [])

  function toggle(i: number) {
    const next = new Set(checked)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setChecked(next)
    localStorage.setItem("hfp-first-job", JSON.stringify([...next]))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">First Job Financial Checklist</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Just got your first real job? These 12 steps set you up for life. Most people wish they'd done them at 18.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm font-bold">{checked.size}/{CHECKLIST.length}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(checked.size / CHECKLIST.length) * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {CHECKLIST.map((item, i) => {
          const isDone = checked.has(i)
          return (
            <Card key={i} className={cn("cursor-pointer transition-all", isDone ? "border-emerald-200 bg-emerald-50/10 opacity-70" : "")}
              onClick={() => toggle(i)}>
              <CardContent className="p-3 flex items-start gap-3">
                {isDone
                  ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>{item.task}</p>
                    <Badge variant="outline" className={cn("text-[9px]",
                      item.priority === "essential" ? "text-red-500 border-red-300" :
                      item.priority === "high" ? "text-amber-600 border-amber-300" : "text-blue-600 border-blue-300"
                    )}>{item.priority === "essential" ? "Essential" : item.priority === "high" ? "High" : "Important"}</Badge>
                    <Badge variant="outline" className="text-[9px]">{item.timeframe}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{item.why}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The 7-year head start:</strong> Someone who does these 12 things at 18 will be in a better financial
            position at 25 than most people are at 40. Not because they earn more — because they started earlier.
            Compound interest, credit history, and good habits all reward time. The best time to start was yesterday.
            The second best time is today. Share this with anyone starting their first job.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/kids-finance" className="text-sm text-amber-600 hover:underline">Kids Finance</a>
        <a href="/credit-score" className="text-sm text-blue-600 hover:underline">Credit Score</a>
        <a href="/investing" className="text-sm text-emerald-600 hover:underline">Investing Basics</a>
        <a href="/canada/tax-optimization" className="text-sm text-violet-600 hover:underline">Tax Optimization</a>
        <a href="/emergency-fund" className="text-sm text-indigo-600 hover:underline">Emergency Fund</a>
      </div>
    </div>
  )
}
