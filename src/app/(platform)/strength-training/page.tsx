"use client"

import { useState } from "react"
import { Dumbbell, Zap, Brain, Heart, Shield, ChevronDown, ChevronUp, Activity, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const PRINCIPLES = [
  { name: "Progressive Overload", desc: "You must increase weight, reps, or sets over time. This IS the stimulus. Without progressive overload, your body has no reason to adapt. Track every session.", icon: TrendingUp, color: "text-red-600" },
  { name: "Compound Movements", desc: "Squat, deadlift, bench press, barbell row, overhead press. These 5 exercises hit roughly 80% of your total muscle mass. Master them before anything else.", icon: Dumbbell, color: "text-orange-600" },
  { name: "Recovery", desc: "Muscle grows during REST, not during training. Training creates the stimulus; sleep and nutrition create the adaptation. 48-72 hours between muscle groups.", icon: Clock, color: "text-blue-600" },
  { name: "Protein Intake", desc: "0.7-1g protein per pound of bodyweight, daily. Non-negotiable for muscle growth. Spread across 3-5 meals for optimal muscle protein synthesis.", icon: Zap, color: "text-emerald-600" },
  { name: "Sleep", desc: "Growth hormone peaks during deep sleep. Bad sleep = bad recovery = no gains. 7-9 hours is not optional — it is when the actual building happens.", icon: Shield, color: "text-violet-600" },
]

interface ExerciseDay { name: string; exercises: string[] }
interface Program { level: string; badge: string; schedule: string; days: ExerciseDay[]; notes: string }

const PROGRAMS: Program[] = [
  {
    level: "Beginner (0-6 months)",
    badge: "border-emerald-300 text-emerald-700",
    schedule: "Full Body — 3x/week (Mon/Wed/Fri), alternate A/B",
    days: [
      { name: "Day A", exercises: ["Squat — 3×8", "Bench Press — 3×8", "Barbell Row — 3×8", "Overhead Press — 2×10", "Plank — 3×30s"] },
      { name: "Day B", exercises: ["Deadlift — 3×5", "Incline Press — 3×10", "Lat Pulldown — 3×10", "Walking Lunges — 2×10/leg", "Face Pulls — 3×15"] },
    ],
    notes: "Add 5 lbs per session on lower body lifts, 2.5 lbs on upper body. When you stall 3 sessions in a row, deload 10% and build back up. This linear progression works for 4-6 months before you need intermediate programming."
  },
  {
    level: "Intermediate (6-18 months)",
    badge: "border-amber-300 text-amber-700",
    schedule: "Upper/Lower Split — 4x/week (Mon/Tue/Thu/Fri)",
    days: [
      { name: "Upper A (Heavy)", exercises: ["Bench Press — 4×5", "Barbell Row — 4×5", "Overhead Press — 3×8", "Barbell Curl — 3×10", "Tricep Pushdown — 3×10"] },
      { name: "Lower A (Heavy)", exercises: ["Back Squat — 4×5", "Romanian Deadlift — 3×8", "Leg Press — 3×10", "Standing Calf Raise — 4×12", "Ab Wheel Rollout — 3×10"] },
      { name: "Upper B (Volume)", exercises: ["Incline DB Press — 4×10", "Cable Row — 4×10", "Lateral Raise — 3×15", "Face Pulls — 3×15", "Hammer Curl — 3×12"] },
      { name: "Lower B (Volume)", exercises: ["Front Squat — 3×8", "Lying Leg Curl — 4×10", "Bulgarian Split Squat — 3×10/leg", "Seated Calf Raise — 4×15", "Hanging Leg Raise — 3×12"] },
    ],
    notes: "Heavy days focus on strength (lower reps, higher weight). Volume days focus on hypertrophy (higher reps, moderate weight). Progress weekly by adding weight or reps. Use double progression: hit the top of your rep range on all sets before adding weight."
  },
  {
    level: "Advanced (18+ months)",
    badge: "border-red-300 text-red-700",
    schedule: "Push/Pull/Legs — 6x/week (PPL/PPL/Rest)",
    days: [
      { name: "Push", exercises: ["Bench Press — 4×5, Overhead Press — 4×8, Incline DB — 3×10, Lateral Raise — 4×15, Tricep work — 4×12"] },
      { name: "Pull", exercises: ["Deadlift — 3×5, Weighted Pull-ups — 4×6, Cable Row — 4×10, Face Pulls — 3×15, Bicep work — 4×12"] },
      { name: "Legs", exercises: ["Squat — 4×5, RDL — 3×8, Leg Press — 3×12, Leg Curl — 3×12, Calves — 4×15"] },
    ],
    notes: "Each muscle group hit 2x/week with high frequency. Requires solid recovery (sleep, nutrition, stress management). Periodize intensity — not every session should be max effort. Use RPE 7-9 range."
  },
]

export default function StrengthTrainingPage() {
  const [expandedProgram, setExpandedProgram] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Strength Training Programs</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The single most impactful thing you can do for longevity, body composition, and <Explain tip="Hypertrophy means muscle growth — it happens when you challenge muscles with enough volume and weight to trigger adaptation">hypertrophy</Explain>-driven hormone optimization.
        </p>
      </div>

      {/* Key Science */}
      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Muscle mass is the #1 predictor of <Explain tip="All-cause mortality means death from any cause — it's the broadest measure of how likely you are to survive. Having more muscle is more protective than almost any other single factor">all-cause mortality</Explain> in aging.</strong> Srikanthan & Karlamangla (2014) found that higher muscle mass index was associated with significantly lower mortality risk in older adults. Resistance training reduces all-cause mortality by 15-23% across meta-analyses. It is not optional — it is the closest thing to a longevity drug that exists.
          </p>
        </CardContent>
      </Card>

      {/* Principles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-500" /> Principles Before Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <p className="text-[10px] text-muted-foreground mb-2">Programs are interchangeable. These principles are not. <Explain tip="Progressive overload means gradually increasing weight, reps, or sets over time — without it, your body has no reason to get stronger">Progressive overload</Explain>, <Explain tip="Compound movements are exercises that work multiple muscle groups at once (like squats and deadlifts) — they give you the most results for your time">compound movements</Explain>, and proper recovery. Get these right and almost any reasonable program will work.</p>
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="rounded-lg border p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <p.icon className={cn("h-3.5 w-3.5 shrink-0", p.color)} />
                <span className="text-xs font-semibold">{p.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Programs */}
      {PROGRAMS.map((prog, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <button onClick={() => setExpandedProgram(expandedProgram === i ? null : i)} className="flex items-center gap-2 w-full text-left">
              <Dumbbell className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm flex-1">{prog.level}</CardTitle>
              <Badge variant="outline" className={cn("text-[8px] mr-2", prog.badge)}>{prog.schedule.split("—")[0].trim()}</Badge>
              {expandedProgram === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {expandedProgram === i && (
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-[10px] text-muted-foreground">{prog.schedule}</p>
              {prog.days.map((day, j) => (
                <div key={j} className="rounded-lg border p-2.5">
                  <p className="text-xs font-semibold mb-1.5">{day.name}</p>
                  <div className="space-y-1">
                    {day.exercises.map((ex, k) => (
                      <div key={k} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Activity className="h-2.5 w-2.5 shrink-0 text-red-400" />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded bg-orange-50 border border-orange-200 p-2">
                <p className="text-[10px] text-muted-foreground"><strong>Progression:</strong> {prog.notes}</p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Recovery */}
      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
            <Heart className="h-4 w-4" /> Recovery — Where Gains Actually Happen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <p><strong className="text-blue-700">Deload every 4-6 weeks:</strong> Reduce volume by 50% for one week. This is not laziness — it is strategic. Accumulated fatigue masks fitness. After a deload, you come back stronger.</p>
            <p><strong className="text-blue-700">Sleep 7-9 hours:</strong> <Explain tip="Growth hormone is released in pulses during deep sleep — it repairs muscle tissue, burns fat, and strengthens bones">Growth hormone</Explain> peaks during deep sleep stages. Chronic sleep debt directly impairs muscle protein synthesis and increases cortisol.</p>
            <p><strong className="text-blue-700">Post-workout protein:</strong> Consume protein within 2 hours of training. The <Explain tip="The anabolic window is the period after exercise when your body is primed to absorb nutrients and build muscle — it's real but lasts longer than the '30 minute' myth suggests">anabolic window</Explain> is real but wider than bro-science claims — you have 2-3 hours, not 30 minutes.</p>
            <p><strong className="text-blue-700">Foam rolling & mobility:</strong> Address <a href="/fascia" className="text-rose-600 hover:underline font-medium">fascial</a> restrictions that limit range of motion. Rolling before training improves movement quality without reducing performance.</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Supplements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" /> Evidence-Based Supplements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1.5 text-[10px] text-muted-foreground">
            <p><strong>Creatine monohydrate (5g/day):</strong> The most researched supplement in history. Increases strength, power, and lean mass. Also <Explain tip="Creatine has been shown to improve working memory and reduce mental fatigue, especially under stress or sleep deprivation">neuroprotective</Explain>. No loading phase needed.</p>
            <p><strong>Protein powder (as needed):</strong> Whey or plant-based to hit daily protein targets. Supplement, not replacement — whole food first.</p>
            <p><strong>Vitamin D3 (2000-5000 IU/day):</strong> Most people are deficient. Directly impacts testosterone, recovery, and immune function.</p>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-orange-900 mb-2">Connected Systems</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Strength training is the foundation that amplifies everything else. It directly drives <Explain tip="Resistance training is one of the most reliable natural ways to increase testosterone — compound lifts like squats and deadlifts produce the largest hormonal response">testosterone production</Explain>, improves body composition, strengthens fascial integrity, demands better nutrition, and requires quality sleep. It is the keystone habit — get this right and other health behaviors tend to follow.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 flex-wrap">
        <a href="/body-composition" className="text-sm text-emerald-600 hover:underline">Body Composition</a>
        <a href="/hormone-health" className="text-sm text-violet-600 hover:underline">Hormone Health</a>
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/health-protocols" className="text-sm text-blue-600 hover:underline">Health Protocols</a>
        <a href="/nutrition" className="text-sm text-amber-600 hover:underline">Nutrition</a>
        <a href="/cold-exposure" className="text-sm text-cyan-600 hover:underline">Cold Exposure</a>
      </div>
    </div>
  )
}
