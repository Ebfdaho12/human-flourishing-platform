"use client"

import { useState } from "react"
import { Zap, ChevronDown, RefreshCw, CheckCircle, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const LOOP_PARTS = [
  {
    label: "Cue",
    color: "from-blue-500 to-indigo-600",
    what: "A trigger that tells your brain to initiate a behaviour. Can be a time, place, emotional state, preceding action, or other person.",
    examples: ["Waking up → coffee routine", "Sitting at your desk → social media check", "Feeling stressed → reaching for snacks", "Lunch break → short walk"],
    design: "To build a new habit, design a reliable cue. Tie it to something that already happens consistently (this is 'habit stacking'). Example: 'After I pour my morning coffee, I will open my book for 10 minutes.'",
  },
  {
    label: "Routine",
    color: "from-violet-500 to-purple-600",
    what: "The behaviour itself — physical, mental, or emotional. This is what most people think of when they think of 'the habit,' but it is only one part of three.",
    examples: ["The actual workout", "The scroll through Instagram", "The cigarette", "The meditation session"],
    design: "Make it as small as possible to start. Not 'go to the gym for an hour' — 'put on workout clothes.' The routine grows naturally once the loop is established. Friction is the enemy: reduce every barrier to the desired behaviour.",
  },
  {
    label: "Reward",
    color: "from-emerald-500 to-teal-600",
    what: "The benefit that your brain receives — which teaches it that this loop is worth repeating. Rewards do not have to be large. They must be immediate.",
    examples: ["The caffeine hit from coffee", "Dopamine from a notification", "The sense of calm after exercise", "The satisfaction of a checked-off task"],
    design: "If a new habit does not produce an immediate reward, add one artificially. Track your streak (the streak itself becomes the reward). Enjoy a specific podcast only during workouts. Give yourself a point. Make progress visible.",
  },
]

const FOUR_LAWS: {
  law: string
  tagline: string
  color: string
  apply: string[]
  invert: string[]
}[] = [
  {
    law: "1. Make It Obvious",
    tagline: "Design your environment so good choices are visible and bad choices are hidden",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    apply: ["Put the book on your pillow (you will see it)", "Set your workout clothes out the night before", "Put fruit on the counter, junk food in the back of a high shelf", "Leave the guitar in the middle of the room"],
    invert: ["Put your phone in another room at bedtime", "Delete social media from your phone's home screen", "Remove the TV from the bedroom", "Keep cigarettes off your person"],
  },
  {
    law: "2. Make It Attractive",
    tagline: "Bundle habits you need to do with things you want to do",
    color: "bg-rose-100 text-rose-700 border-rose-300",
    apply: ["Only listen to your favourite podcast while exercising", "Join a social fitness class — the social connection is the reward", "Make healthy food in the recipes you actually enjoy", "Pair a boring task with a good playlist or great coffee"],
    invert: ["Unfollow accounts that make you feel bad — the feed becomes unattractive", "Block addictive websites — make the bad habit more effortful to start", "Remove yourself from environments where bad habits feel normal"],
  },
  {
    law: "3. Make It Easy",
    tagline: "Reduce friction for good habits to near zero. Increase friction for bad habits",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    apply: ["Lay out gym clothes at night", "Meal prep once a week so healthy food requires no decision", "Use the 2-minute rule: start any habit with a version that takes 2 minutes", "Automate savings — set up auto-transfer the day you get paid"],
    invert: ["Unplug the TV and put it in the closet", "Log out of apps every time you use them", "Leave your wallet at home if you overspend", "Use a website blocker during work hours"],
  },
  {
    law: "4. Make It Satisfying",
    tagline: "Create an immediate reward for completing the habit — the brain learns from what happens immediately after",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    apply: ["Track your streak on a calendar — never break the chain", "Log your workout immediately after — the logging is the reward", "A habit journal entry at the end of the day", "Small immediate treat tied exclusively to the habit"],
    invert: ["Make the cost of bad habits immediate and visible — track every dollar spent, every cigarette, every skipped workout", "Use a commitment device: put money on the line with an accountability partner"],
  },
]

const IDENTITY_SHIFTS = [
  { old: "I want to exercise more", new: "I am someone who moves their body every day", why: "Goal-based thinking creates temporary motivation. Identity-based thinking creates permanent change. Each workout is not a task — it is a vote for the person you are becoming." },
  { old: "I am trying to eat healthier", new: "I am someone who takes care of their body through food", why: "The goal ends when achieved (or abandoned). The identity continues. When you see yourself as a healthy person, unhealthy choices feel like a betrayal of self — a far stronger motivator than willpower." },
  { old: "I want to read more books", new: "I am a reader", why: "When you are offered a distraction, a reader thinks 'that's not what I do.' Someone 'trying to read more' has no such anchor. Identity is the most powerful filter for decision-making." },
  { old: "I should meditate", new: "I am someone who starts each day with quiet reflection", why: "The 'should' implies it is external. The identity implies it is who you are. You do not skip things that are part of who you are — you skip things that are on your to-do list." },
]

export default function HabitSciencePage() {
  const [expandedLoop, setExpandedLoop] = useState<number | null>(0)
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null)
  const [expandedIdentity, setExpandedIdentity] = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">The Science of Habit Formation</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Why habits work, why they fail, and how to design your environment to make good behaviour the default.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Habits are not about discipline.</strong> They are about systems.
            The person who goes to the gym every morning is not more disciplined than you — they have
            built a system where showing up requires less decision-making than not showing up.
            Willpower is a finite, depletable resource. Environmental design is permanent.
            This is the science behind both.
          </p>
        </CardContent>
      </Card>

      {/* The Habit Loop */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">The Habit Loop</p>
        <p className="text-[10px] text-muted-foreground mb-2">Every habit — good or bad — runs on the same three-part loop (Duhigg, 2012 / Clear, 2018). Understanding it gives you leverage over any behaviour.</p>
        <div className="flex items-center gap-2 mb-3">
          {["Cue", "→", "Routine", "→", "Reward"].map((item, i) => (
            <span key={i} className={cn("text-xs font-semibold", item === "→" ? "text-muted-foreground" : "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent")}>{item}</span>
          ))}
        </div>
        <div className="space-y-2">
          {LOOP_PARTS.map((p, i) => {
            const isOpen = expandedLoop === i
            return (
              <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpandedLoop(isOpen ? null : i)}>
                <CardContent className="p-0">
                  <div className="p-3 flex items-center gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", p.color)}>
                      {p.label[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{p.what}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 border-t border-border space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Examples</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.examples.map((ex, j) => <Badge key={j} variant="outline" className="text-[10px]">{ex}</Badge>)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">How to design it</p>
                        <p className="text-xs text-emerald-800 leading-relaxed">{p.design}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Willpower */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Why Willpower Fails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Willpower is a real, measurable cognitive resource — and it depletes with use. This is called 'ego depletion'
            (Baumeister, 1998). Every decision, every act of self-control, every resisted temptation draws from the same
            finite pool. By 9pm, after a full day of decisions, resisting the second serving, the phone, or the cigarette
            is genuinely harder than it was at 9am — not because you are weaker, but because the resource is partially spent.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The implication:</strong> do not rely on willpower. Design environments where the right choice is automatic.
            Schedule the most important habits early in the day when willpower is highest. Use commitment devices
            (auto-transfers, website blockers, removing temptations from the house) to eliminate the need for willpower entirely.
            Willpower is for emergencies. Systems are for everyday life.
          </p>
        </CardContent>
      </Card>

      {/* 4 Laws */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">The 4 Laws of Behaviour Change (James Clear)</p>
        <div className="space-y-2">
          {FOUR_LAWS.map((law, i) => {
            const isOpen = expandedLaw === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedLaw(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge className={cn("text-[10px] border shrink-0", law.color)}>{law.law}</Badge>
                    <p className="text-xs text-muted-foreground flex-1">{law.tagline}</p>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Build with it</p>
                        {law.apply.map((a, j) => (
                          <p key={j} className="text-xs text-muted-foreground flex gap-1.5 mb-0.5"><span className="text-emerald-400 shrink-0">+</span>{a}</p>
                        ))}
                      </div>
                      <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Break bad habits</p>
                        {law.invert.map((inv, j) => (
                          <p key={j} className="text-xs text-muted-foreground flex gap-1.5 mb-0.5"><span className="text-red-400 shrink-0">−</span>{inv}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Identity */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Identity-Based Habits</p>
        <p className="text-[10px] text-muted-foreground mb-2">"I am a person who..." creates behaviour. "I want to..." creates intentions that fade.</p>
        <div className="space-y-2">
          {IDENTITY_SHIFTS.map((id, i) => {
            const isOpen = expandedIdentity === i
            return (
              <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpandedIdentity(isOpen ? null : i)}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-muted-foreground line-through">{id.old}</p>
                      <p className="text-xs font-semibold text-emerald-700">{id.new}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform mt-0.5", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-1">{id.why}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How long it takes */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold text-violet-900">How Long Does It Really Take?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Not 21 days.</strong> The '21-day habit' myth originated from a 1960s plastic surgeon's
            observation about patients adapting to physical changes — never from habit research.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A 2010 study by Phillippa Lally (University College London) tracked 96 people forming a new habit over
            84 days. The average time for a behaviour to become automatic was <strong>66 days</strong> — ranging
            from 18 to 254 days depending on the person and complexity of the habit.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>What this means for you:</strong> expect 2-3 months of deliberate effort before a habit feels
            natural. Missing one day has no measurable effect on habit formation — it is the pattern that matters,
            not perfection. Never miss twice. A missed day is information; two missed days is the beginning of a
            new habit (not doing it).
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/memory-techniques" className="text-sm text-violet-600 hover:underline">Memory Techniques</a>
        <a href="/focus" className="text-sm text-amber-600 hover:underline">Focus & Deep Work</a>
        <a href="/routine" className="text-sm text-emerald-600 hover:underline">Daily Routine Builder</a>
        <a href="/sleep-calculator" className="text-sm text-blue-600 hover:underline">Sleep Calculator</a>
        <a href="/time-management" className="text-sm text-rose-600 hover:underline">Time Management</a>
      </div>
    </div>
  )
}
