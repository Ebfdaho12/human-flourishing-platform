"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, Heart, DollarSign, Brain, Target, BookOpen, Flame,
  Users, CheckCircle, Star, Clock, Trophy
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProgressData {
  checkIns: number
  currentStreak: number
  budgetFilled: boolean
  netWorthEntries: number
  debtsTracked: number
  subscriptionsAudited: number
  booksTracked: number
  booksFinished: number
  skillsTracked: number
  challengesDays: number
  habitsActive: number
  notesCount: number
  winsLogged: number
  decisionsLogged: number
  decisionsReviewed: number
  mealsPlanned: number
  relationshipsTracked: number
  choresActive: boolean
  screenTimeTracked: boolean
  maintenanceDone: number
  maintenanceTotal: number
  preparednessPct: number
}

function loadProgress(): ProgressData {
  const get = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || "null") } catch { return null } }

  const checkIns = get("hfp-daily-checkins") || []
  const budget = get("hfp-budget")
  const netWorth = get("hfp-networth")
  const debts = get("hfp-debts")
  const subs = get("hfp-subscriptions")
  const reading = get("hfp-reading") || []
  const skills = get("hfp-skills") || []
  const challenges = get("hfp-challenges")
  const habits = get("hfp-habit-stacks") || []
  const notes = get("hfp-notes") || []
  const wins = get("hfp-wins") || []
  const decisions = get("hfp-decisions") || []
  const meals = get("hfp-meal-plan")
  const relationships = get("hfp-relationships") || []
  const chores = get("hfp-kids-chores") || []
  const screen = get("hfp-screen-time")
  const maintenance = get("hfp-home-maintenance") || {}
  const preparedness = get("hfp-preparedness") || {}

  // Calculate streak
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    if (checkIns.some((c: any) => c.date === dateStr && c.completed)) streak++
    else if (i > 0) break
  }

  const maintenanceChecked = Object.values(maintenance).filter(Boolean).length
  const prepChecked = Object.values(preparedness).filter(Boolean).length

  return {
    checkIns: checkIns.filter((c: any) => c.completed).length,
    currentStreak: streak,
    budgetFilled: !!(budget?.incomes?.some((v: number) => v > 0)),
    netWorthEntries: netWorth?.entries?.length || 0,
    debtsTracked: debts?.debts?.length || 0,
    subscriptionsAudited: subs?.subs?.length || 0,
    booksTracked: reading.length,
    booksFinished: reading.filter((b: any) => b.status === "finished").length,
    skillsTracked: skills.length,
    challengesDays: challenges?.progress ? Object.values(challenges.progress).flat().filter(Boolean).length : 0,
    habitsActive: habits.length,
    notesCount: notes.length,
    winsLogged: wins.length,
    decisionsLogged: decisions.length,
    decisionsReviewed: decisions.filter((d: any) => d.reviewed).length,
    mealsPlanned: meals?.plan ? Object.values(meals.plan).reduce((s: number, day: any) => s + Object.values(day || {}).filter(Boolean).length, 0) : 0,
    relationshipsTracked: relationships.length,
    choresActive: chores.length > 0,
    screenTimeTracked: !!screen?.members?.length,
    maintenanceDone: maintenanceChecked,
    maintenanceTotal: 21, // total tasks in the maintenance schedule
    preparednessPct: Math.round((prepChecked / 27) * 100), // 27 total checklist items
  }
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null)

  useEffect(() => { setData(loadProgress()) }, [])

  if (!data) return null

  // Calculate overall score (0-100)
  let score = 0
  if (data.checkIns > 0) score += 5
  if (data.currentStreak >= 7) score += 10
  else if (data.currentStreak >= 3) score += 5
  if (data.budgetFilled) score += 10
  if (data.netWorthEntries > 0) score += 8
  if (data.debtsTracked > 0) score += 5
  if (data.subscriptionsAudited > 0) score += 5
  if (data.booksTracked > 0) score += 5
  if (data.booksFinished > 0) score += 5
  if (data.skillsTracked >= 5) score += 5
  if (data.habitsActive > 0) score += 5
  if (data.winsLogged >= 5) score += 5
  if (data.decisionsLogged > 0) score += 5
  if (data.mealsPlanned >= 7) score += 5
  if (data.relationshipsTracked >= 3) score += 5
  if (data.maintenanceDone > 5) score += 5
  if (data.preparednessPct >= 50) score += 5
  if (data.notesCount >= 3) score += 2
  score = Math.min(100, score)

  const sections = [
    {
      title: "Daily Habits",
      icon: Flame,
      color: "text-amber-500",
      items: [
        { label: "Daily check-ins completed", value: data.checkIns, target: "Daily", done: data.checkIns > 0 },
        { label: "Current streak", value: `${data.currentStreak} days`, target: "7+ days", done: data.currentStreak >= 7 },
        { label: "Wins logged", value: data.winsLogged, target: "5+", done: data.winsLogged >= 5 },
      ],
    },
    {
      title: "Financial Health",
      icon: DollarSign,
      color: "text-emerald-500",
      items: [
        { label: "Budget set up", value: data.budgetFilled ? "Yes" : "No", target: "Complete", done: data.budgetFilled },
        { label: "Net worth tracked", value: `${data.netWorthEntries} entries`, target: "1+", done: data.netWorthEntries > 0 },
        { label: "Debts tracked", value: data.debtsTracked, target: "All listed", done: data.debtsTracked > 0 },
        { label: "Subscriptions audited", value: data.subscriptionsAudited, target: "All listed", done: data.subscriptionsAudited > 0 },
      ],
    },
    {
      title: "Personal Growth",
      icon: Brain,
      color: "text-violet-500",
      items: [
        { label: "Books tracked", value: data.booksTracked, target: "5+", done: data.booksTracked >= 5 },
        { label: "Books finished", value: data.booksFinished, target: "1+", done: data.booksFinished > 0 },
        { label: "Skills mapped", value: data.skillsTracked, target: "5+", done: data.skillsTracked >= 5 },
        { label: "Decisions journaled", value: data.decisionsLogged, target: "1+", done: data.decisionsLogged > 0 },
        { label: "Habits active", value: data.habitsActive, target: "1+", done: data.habitsActive > 0 },
      ],
    },
    {
      title: "Family & Home",
      icon: Users,
      color: "text-rose-500",
      items: [
        { label: "Meals planned this week", value: data.mealsPlanned, target: "7+", done: data.mealsPlanned >= 7 },
        { label: "Relationships tracked", value: data.relationshipsTracked, target: "3+", done: data.relationshipsTracked >= 3 },
        { label: "Kids chores set up", value: data.choresActive ? "Yes" : "No", target: "Active", done: data.choresActive },
        { label: "Screen time tracked", value: data.screenTimeTracked ? "Yes" : "No", target: "Active", done: data.screenTimeTracked },
        { label: "Home maintenance", value: `${data.maintenanceDone}/${data.maintenanceTotal}`, target: "Seasonal", done: data.maintenanceDone > 5 },
      ],
    },
    {
      title: "Preparedness",
      icon: Target,
      color: "text-slate-500",
      items: [
        { label: "Emergency readiness", value: `${data.preparednessPct}%`, target: "80%+", done: data.preparednessPct >= 80 },
        { label: "Notes & ideas captured", value: data.notesCount, target: "3+", done: data.notesCount >= 3 },
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Progress</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          One view of how your life is improving across every tool you use.
        </p>
      </div>

      {/* Overall score */}
      <Card className={cn("border-2",
        score >= 70 ? "border-emerald-300 bg-emerald-50/20" :
        score >= 40 ? "border-amber-300 bg-amber-50/20" : "border-slate-300 bg-slate-50/20"
      )}>
        <CardContent className="p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Progress Score</p>
          <p className={cn("text-5xl font-bold",
            score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-slate-500"
          )}>{score}</p>
          <div className="h-3 bg-muted rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
            <div className={cn("h-full rounded-full transition-all",
              score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-slate-400"
            )} style={{ width: `${score}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {score >= 80 ? "Outstanding — you are building something real." :
             score >= 60 ? "Great progress. Keep the momentum going." :
             score >= 40 ? "Good start. Focus on the areas with empty checkmarks below." :
             score >= 20 ? "You have started. Every step counts. Pick one area and go deeper." :
             "Start with one tool today. The score rises fast once you begin."}
          </p>
        </CardContent>
      </Card>

      {/* Section breakdowns */}
      <div className="space-y-4">
        {sections.map((section, si) => {
          const Icon = section.icon
          const sectionDone = section.items.filter(i => i.done).length
          return (
            <Card key={si}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn("h-5 w-5", section.color)} />
                  <p className="text-sm font-semibold flex-1">{section.title}</p>
                  <Badge variant="outline" className="text-[9px]">{sectionDone}/{section.items.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      {item.done
                        ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                      }
                      <span className={cn("text-xs flex-1", item.done ? "text-muted-foreground" : "")}>{item.label}</span>
                      <span className={cn("text-xs font-medium", item.done ? "text-emerald-600" : "text-muted-foreground")}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This score is private.</strong> Nobody sees it but you. It is not a competition — it is a mirror.
            The goal is not 100/100. The goal is progress. If your score is higher than last week, you are winning.
            Small consistent steps compound into an extraordinary life.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/tools" className="text-sm text-violet-600 hover:underline">All Tools</a>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
        <a href="/wins" className="text-sm text-amber-600 hover:underline">Wins & Gratitude</a>
        <a href="/financial-dashboard" className="text-sm text-emerald-600 hover:underline">Financial Dashboard</a>
      </div>
    </div>
  )
}
