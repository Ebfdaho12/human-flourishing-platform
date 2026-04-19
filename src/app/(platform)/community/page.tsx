"use client"

import useSWR from "swr"
import {
  Users, Heart, Brain, GraduationCap, FlaskConical, Landmark, Zap, TrendingUp, Building2,
  Globe, BookOpen, Smile
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_META: Record<string, { label: string; color: string }> = {
  PRE_REGISTERED: { label: "Pre-registered", color: "text-blue-500" },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-500" },
  COMPLETED: { label: "Completed", color: "text-emerald-500" },
  PEER_REVIEWED: { label: "Peer Reviewed", color: "text-violet-500" },
}

export default function CommunityPage() {
  const { data } = useSWR("/api/community", fetcher)

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading community data...</div>

  const { stats, avgCommunityMood, recentPublicStudies, topSubjects } = data

  const platformStats = [
    { label: "Community Members", value: stats.users, icon: Users, color: "from-violet-500 to-purple-600" },
    { label: "Health Entries", value: stats.healthEntries, icon: Heart, color: "from-rose-500 to-red-600" },
    { label: "Mood Check-ins", value: stats.moodEntries, icon: Brain, color: "from-pink-500 to-rose-600" },
    { label: "Journal Entries", value: stats.journalEntries, icon: BookOpen, color: "from-pink-400 to-rose-500" },
    { label: "Tutoring Sessions", value: stats.tutoringSessions, icon: GraduationCap, color: "from-blue-500 to-cyan-600" },
    { label: "Research Studies", value: stats.studies, icon: FlaskConical, color: "from-teal-500 to-green-600" },
    { label: "Governance Records", value: stats.govRecords, icon: Landmark, color: "from-amber-500 to-orange-600" },
    { label: "Energy Logs", value: stats.energyLogs, icon: Zap, color: "from-yellow-500 to-amber-600" },
    { label: "Economic Interventions", value: stats.interventions, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
    { label: "Infrastructure Projects", value: stats.infraProjects, icon: Building2, color: "from-slate-500 to-gray-600" },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Community</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Platform-wide statistics. All data is anonymized and aggregated — no individual information is shared.
        </p>
      </div>

      {/* Community mood */}
      {avgCommunityMood !== null && (
        <Card className="border-pink-200 bg-gradient-to-r from-pink-50/50 to-rose-50/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
              <Smile className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Community Mood</p>
              <p className="text-4xl font-bold mt-1">
                <span className={cn(
                  avgCommunityMood >= 7 ? "text-emerald-500" :
                  avgCommunityMood >= 5 ? "text-amber-500" : "text-red-500"
                )}>
                  {avgCommunityMood}
                </span>
                <span className="text-lg text-muted-foreground font-normal"> / 10</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average across the last 100 community check-ins
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform stats grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform by the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {platformStats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-hover">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${color} mb-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold">{value?.toLocaleString() ?? "0"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Public research */}
      {recentPublicStudies && recentPublicStudies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-500" />
            Public Research Registry
          </h2>
          <div className="space-y-3">
            {recentPublicStudies.map((study: any) => {
              const statusMeta = STATUS_META[study.status] ?? STATUS_META.PRE_REGISTERED
              return (
                <Card key={study.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{study.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <Badge variant="outline" className="text-xs py-0">{study.field}</Badge>
                          <span className={cn("text-xs font-medium", statusMeta.color)}>{statusMeta.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {study._count.replications} replications · {study._count.reviews} reviews
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{study.hypothesis}</p>
                      </div>
                      <Globe className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Top subjects */}
      {topSubjects && topSubjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              Most Studied Subjects
            </CardTitle>
            <CardDescription>What the community is learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSubjects.map((s: any, i: number) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right shrink-0">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{s.subject}</span>
                      <span className="text-xs text-muted-foreground">{s.count} sessions</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.count / (topSubjects[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community principles */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Community Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Privacy is non-negotiable — all community data is anonymized",
              "No leaderboards that rank individuals — we're not competing",
              "Open science: pre-register, replicate, review — truth over prestige",
              "Your data stays yours — export everything, delete everything",
              "AI enhances but never gates — the platform works without any API key",
              "Token incentives align with genuine contribution, not gamification",
            ].map((principle, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <span>{principle}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
