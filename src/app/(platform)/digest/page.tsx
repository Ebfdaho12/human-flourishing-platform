"use client"

import useSWR from "swr"
import {
  BarChart3, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, Calendar, Flame, Trophy, BookOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DigestPage() {
  const { data } = useSWR("/api/digest", fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading your weekly digest...</div>

  const { week, summary, health, mentalHealth, education, governance, science, energy, economics, infrastructure, highlights } = data

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Weekly Digest</h1>
            <p className="text-sm text-muted-foreground">{week.startDate} to {week.endDate}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <Flame className={cn("h-6 w-6 mx-auto mb-2", summary.activeDays >= 5 ? "text-orange-500" : "text-muted-foreground/30")} />
            <p className="text-3xl font-bold">{summary.activeDays}/7</p>
            <p className="text-xs text-muted-foreground">Active days</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-3xl font-bold">{summary.totalActions}</p>
            <p className="text-xs text-muted-foreground">Total actions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-500" />
            <p className="text-3xl font-bold">{summary.foundBalance}</p>
            <p className="text-xs text-muted-foreground">FOUND balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">This Week's Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {health.entries > 0 && (
          <ModuleCard icon={Heart} color="text-rose-500" bg="from-rose-50 to-red-50" border="border-rose-200"
            title="Health" stats={[`${health.entries} entries logged`]} />
        )}
        {(mentalHealth.moodCheckIns > 0 || mentalHealth.journalEntries > 0) && (
          <ModuleCard icon={Brain} color="text-pink-500" bg="from-pink-50 to-rose-50" border="border-pink-200"
            title="Mental Health" stats={[
              mentalHealth.moodCheckIns > 0 ? `${mentalHealth.moodCheckIns} check-ins (avg: ${mentalHealth.avgMood}/10)` : null,
              mentalHealth.journalEntries > 0 ? `${mentalHealth.journalEntries} journal entries` : null,
            ].filter(Boolean) as string[]} />
        )}
        {education.sessions > 0 && (
          <ModuleCard icon={GraduationCap} color="text-blue-500" bg="from-blue-50 to-cyan-50" border="border-blue-200"
            title="Education" stats={[
              `${education.sessions} sessions (${education.minutes} min)`,
              education.subjects.length > 0 ? `Subjects: ${education.subjects.join(", ")}` : null,
              education.avgScore ? `Avg score: ${education.avgScore}/100` : null,
            ].filter(Boolean) as string[]} />
        )}
        {governance.records > 0 && (
          <ModuleCard icon={Landmark} color="text-amber-500" bg="from-amber-50 to-orange-50" border="border-amber-200"
            title="Governance" stats={[`${governance.records} records tracked`]} />
        )}
        {energy.logs > 0 && (
          <ModuleCard icon={Zap} color="text-yellow-500" bg="from-yellow-50 to-amber-50" border="border-yellow-200"
            title="Energy" stats={[
              `${energy.produced} kWh produced`,
              `${energy.consumed} kWh consumed`,
              energy.renewableKwh > 0 ? `${energy.renewableKwh} kWh renewable` : null,
            ].filter(Boolean) as string[]} />
        )}
        {science.studies > 0 && (
          <ModuleCard icon={FlaskConical} color="text-teal-500" bg="from-teal-50 to-green-50" border="border-teal-200"
            title="DeSci" stats={[`${science.studies} studies`]} />
        )}
        {economics.interventions > 0 && (
          <ModuleCard icon={TrendingUp} color="text-emerald-500" bg="from-emerald-50 to-teal-50" border="border-emerald-200"
            title="Economics" stats={[`${economics.interventions} interventions`]} />
        )}
        {infrastructure.projects > 0 && (
          <ModuleCard icon={Building2} color="text-slate-500" bg="from-slate-50 to-gray-50" border="border-slate-200"
            title="Infrastructure" stats={[`${infrastructure.projects} projects`]} />
        )}
      </div>

      {summary.totalActions === 0 && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 text-violet-300 mx-auto mb-3" />
            <p className="font-medium">No activity this week</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start with a quick mood check-in or health log — it takes 30 seconds and keeps your streak alive.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <a href="/health" className="text-sm text-violet-600 hover:underline">Log health →</a>
              <a href="/mental-health" className="text-sm text-pink-600 hover:underline">Mood check-in →</a>
              <a href="/education" className="text-sm text-blue-600 hover:underline">Learn something →</a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ModuleCard({ icon: Icon, color, bg, border, title, stats }: {
  icon: any; color: string; bg: string; border: string; title: string; stats: string[]
}) {
  return (
    <Card className={cn("bg-gradient-to-br", bg, border)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", color)} />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="space-y-1">
          {stats.map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground">{s}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
