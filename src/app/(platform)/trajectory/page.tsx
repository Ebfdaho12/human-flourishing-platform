"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Heart, Brain, Users, Home, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TrajectoryPage() {
  const [age, setAge] = useState(30)
  const [income, setIncome] = useState(70000)
  const [monthlySavings, setMonthlySavings] = useState(500)
  const [currentDebt, setCurrentDebt] = useState(15000)
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState(400)
  const [exerciseDays, setExerciseDays] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [screenHours, setScreenHours] = useState(4)
  const [booksPerYear, setBooksPerYear] = useState(5)

  // Project forward
  const yearsOut = [1, 5, 10, 20]

  function projectFinance(years: number) {
    const monthlyRate = 0.07 / 12
    let savings = 0
    for (let m = 0; m < years * 12; m++) savings = savings * (1 + monthlyRate) + monthlySavings
    const debtMonths = monthlyDebtPayment > 0 ? Math.ceil(currentDebt / monthlyDebtPayment) : Infinity
    const debtFree = debtMonths <= years * 12
    const netWorth = Math.round(savings - (debtFree ? 0 : currentDebt - monthlyDebtPayment * years * 12))
    return { savings: Math.round(savings), debtFree, netWorth, debtFreeIn: Math.round(debtMonths / 12 * 10) / 10 }
  }

  function projectHealth(years: number) {
    // Simplified health projection based on habits
    const exerciseScore = Math.min(100, exerciseDays * 15 + years * 2)
    const sleepScore = sleepHours >= 7 ? 85 + years * 0.5 : 60 - years * 1
    const screenImpact = screenHours > 4 ? -years * 2 : 0
    const overall = Math.min(100, Math.round((exerciseScore + sleepScore + screenImpact) / 2))
    return {
      overall,
      fitness: exerciseDays >= 3 ? `Strong at ${age + years}` : `Declining at ${age + years}`,
      energy: sleepHours >= 7 ? "High" : sleepHours >= 6 ? "Moderate" : "Low and declining",
      risk: exerciseDays >= 3 && sleepHours >= 7 ? "Below average" : "Above average",
    }
  }

  function projectGrowth(years: number) {
    const totalBooks = booksPerYear * years
    const knowledgeLevel = totalBooks >= 100 ? "Expert breadth" : totalBooks >= 50 ? "Well-read" : totalBooks >= 20 ? "Building" : "Starting"
    const screenTimeLifeHours = screenHours * 365 * years
    const readingLifeHours = booksPerYear * 8 * years // ~8 hrs per book
    return {
      booksRead: totalBooks,
      knowledgeLevel,
      screenTimeHours: Math.round(screenTimeLifeHours),
      readingHours: Math.round(readingLifeHours),
      screenVsReading: Math.round(screenTimeLifeHours / Math.max(1, readingLifeHours)),
    }
  }

  const projections = yearsOut.map(y => ({
    years: y,
    age: age + y,
    finance: projectFinance(y),
    health: projectHealth(y),
    growth: projectGrowth(y),
  }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Life Trajectory</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          If you keep doing exactly what you're doing today — here's where you'll be in 1, 5, 10, and 20 years.
        </p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This is not a prediction — it is a projection.</strong> Small changes in daily habits compound
            into dramatically different outcomes over time. Adding $200/month to savings changes your net worth by
            $100K+ over 20 years. One extra hour of sleep changes your health trajectory. Two more books per year
            changes your knowledge level. The point of this page is not to scare you — it is to show you
            <strong> the extraordinary power of small, consistent changes</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Your Current Situation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-[10px] text-muted-foreground">Age</label>
            <Input type="number" value={age} onChange={e => setAge(Number(e.target.value) || 25)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Annual income</label>
            <Input type="number" value={income || ""} onChange={e => setIncome(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Monthly savings</label>
            <Input type="number" value={monthlySavings || ""} onChange={e => setMonthlySavings(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-[10px] text-muted-foreground">Total debt</label>
            <Input type="number" value={currentDebt || ""} onChange={e => setCurrentDebt(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Debt payment/mo</label>
            <Input type="number" value={monthlyDebtPayment || ""} onChange={e => setMonthlyDebtPayment(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Exercise days/wk</label>
            <Input type="number" min={0} max={7} value={exerciseDays} onChange={e => setExerciseDays(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-[10px] text-muted-foreground">Sleep hours/night</label>
            <Input type="number" step="0.5" value={sleepHours} onChange={e => setSleepHours(Number(e.target.value) || 6)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Screen hours/day</label>
            <Input type="number" value={screenHours} onChange={e => setScreenHours(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Books/year</label>
            <Input type="number" value={booksPerYear} onChange={e => setBooksPerYear(Number(e.target.value) || 0)} className="h-8 text-sm" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline projections */}
      <div className="space-y-4">
        {projections.map((p, i) => (
          <Card key={i} className={cn(i === projections.length - 1 ? "border-2 border-violet-300" : "")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn("text-xs",
                  i === 0 ? "bg-blue-500" : i === 1 ? "bg-violet-500" : i === 2 ? "bg-indigo-500" : "bg-purple-600"
                )}>{p.years} year{p.years > 1 ? "s" : ""}</Badge>
                <span className="text-sm font-semibold">You at age {p.age}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Financial */}
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500 mb-1" />
                  <p className="text-xs font-semibold text-emerald-800">${p.finance.savings.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-600">Invested savings</p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {p.finance.debtFree ? "Debt free ✓" : `Debt free in ${p.finance.debtFreeIn}yr`}
                  </p>
                </div>

                {/* Health */}
                <div className={cn("rounded-lg border p-2.5",
                  p.health.overall >= 70 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
                )}>
                  <Heart className="h-3.5 w-3.5 text-blue-500 mb-1" />
                  <p className={cn("text-xs font-semibold", p.health.overall >= 70 ? "text-blue-800" : "text-amber-800")}>
                    {p.health.overall}/100
                  </p>
                  <p className="text-[9px] text-muted-foreground">{p.health.fitness}</p>
                  <p className="text-[9px] text-muted-foreground">Energy: {p.health.energy}</p>
                </div>

                {/* Growth */}
                <div className="rounded-lg bg-violet-50 border border-violet-200 p-2.5">
                  <Brain className="h-3.5 w-3.5 text-violet-500 mb-1" />
                  <p className="text-xs font-semibold text-violet-800">{p.growth.booksRead} books</p>
                  <p className="text-[9px] text-violet-600">{p.growth.knowledgeLevel}</p>
                  <p className="text-[9px] text-muted-foreground">
                    Screen: {p.growth.screenTimeHours.toLocaleString()}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The power of change */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> What Changes If You Adjust
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong>+$200/month savings:</strong> In 20 years at 7%, that extra $200 becomes <strong>${Math.round(200 * ((Math.pow(1 + 0.07/12, 240) - 1) / (0.07/12))).toLocaleString()}</strong> more.</p>
            <p><strong>+1 hour of sleep:</strong> Going from 6 to 7 hours improves cognitive function by 30%, reduces disease risk by 20-40%, and adds an estimated 2-3 years of healthy life.</p>
            <p><strong>+2 exercise days/week:</strong> Going from sedentary to active reduces all-cause mortality by 30-40%. The single most impactful health change possible.</p>
            <p><strong>+10 books/year:</strong> In 20 years that is 200 additional books — the difference between average knowledge and exceptional understanding of the world.</p>
            <p><strong>-2 hours of screen time:</strong> That is 730 hours per year redirected to: exercise, reading, family, sleep, or building something meaningful.</p>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-3">
            Adjust the numbers above to see YOUR trajectory change in real-time. The future is not fixed — it is shaped by what you do today.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/progress" className="text-sm text-emerald-600 hover:underline">Progress Dashboard</a>
        <a href="/compound-interest" className="text-sm text-blue-600 hover:underline">Compound Interest</a>
        <a href="/health-protocols" className="text-sm text-rose-600 hover:underline">Health Protocols</a>
        <a href="/weekly-reflection" className="text-sm text-violet-600 hover:underline">Weekly Reflection</a>
        <a href="/financial-dashboard" className="text-sm text-amber-600 hover:underline">Financial Dashboard</a>
      </div>
    </div>
  )
}
