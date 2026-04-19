"use client"

import useSWR from "swr"
import {
  Users, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, Shield, Activity, Database, BarChart3,
  BookOpen, FileText, Server
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  const { data } = useSWR("/api/admin/stats", fetcher, { refreshInterval: 30000 })

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading admin dashboard...</div>

  const { users, content, system } = data

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform health and metrics — refreshes every 30 seconds</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </Badge>
      </div>

      {/* User metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard icon={Users} label="Total Users" value={users.total} color="text-violet-500" />
          <MetricCard icon={Activity} label="Active Today" value={users.activeToday} color="text-emerald-500" />
          <MetricCard icon={Users} label="New Today" value={users.today} color="text-blue-500" />
          <MetricCard icon={Users} label="New This Week" value={users.thisWeek} color="text-cyan-500" />
          <MetricCard icon={Users} label="New This Month" value={users.thisMonth} color="text-indigo-500" />
        </div>
      </div>

      {/* Content metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard icon={Heart} label="Health Entries" value={content.healthEntries} sub={`+${content.healthToday} today`} color="text-rose-500" />
          <MetricCard icon={Brain} label="Mood Check-ins" value={content.moodEntries} sub={`+${content.moodToday} today`} color="text-pink-500" />
          <MetricCard icon={BookOpen} label="Journal Entries" value={content.journalEntries} color="text-pink-400" />
          <MetricCard icon={GraduationCap} label="Tutor Sessions" value={content.tutoringSessions} color="text-blue-500" />
          <MetricCard icon={FlaskConical} label="Studies" value={content.researchStudies} color="text-teal-500" />
          <MetricCard icon={Landmark} label="Gov Records" value={content.govRecords} color="text-amber-500" />
          <MetricCard icon={Zap} label="Energy Logs" value={content.energyLogs} color="text-yellow-500" />
          <MetricCard icon={TrendingUp} label="Interventions" value={content.interventions} color="text-emerald-500" />
          <MetricCard icon={Building2} label="Infra Projects" value={content.infraProjects} color="text-slate-500" />
          <MetricCard icon={Shield} label="Health Cases" value={content.healthCases} color="text-emerald-600" />
          <MetricCard icon={FileText} label="Case Proposals" value={content.caseProposals} color="text-teal-600" />
          <MetricCard icon={Database} label="Total Records" value={content.totalRecords} color="text-violet-500" />
        </div>
      </div>

      {/* System metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">System</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={BarChart3} label="Transactions" value={system.transactions} color="text-violet-500" />
          <MetricCard icon={Activity} label="AI Insights" value={system.aiInsights} color="text-purple-500" />
          <MetricCard icon={Database} label="DB Models" value={system.dbModels} color="text-blue-500" />
          <MetricCard icon={Server} label="API Routes" value={system.apiRoutes} color="text-cyan-500" />
        </div>
      </div>

      {/* Platform health */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Platform Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HealthIndicator label="Database" status="operational" />
            <HealthIndicator label="Authentication" status="operational" />
            <HealthIndicator label="API Endpoints" status="operational" />
            <HealthIndicator label="Rate Limiting" status="operational" />
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/community", label: "Community" },
              { href: "/health/cases", label: "Health Cases" },
              { href: "/settings", label: "Settings" },
              { href: "/onboarding", label: "Onboarding Tour" },
            ].map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number; sub?: string; color: string
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-3 text-center">
        <Icon className={cn("h-4 w-4 mx-auto mb-1.5", color)} />
        <p className="text-lg font-bold">{value?.toLocaleString() ?? "0"}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-emerald-500 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function HealthIndicator({ label, status }: { label: string; status: "operational" | "degraded" | "down" }) {
  const colors = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-red-500",
  }
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", colors[status])} />
      <span className="text-sm">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto capitalize">{status}</span>
    </div>
  )
}
