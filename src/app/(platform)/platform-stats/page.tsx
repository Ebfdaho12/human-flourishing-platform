"use client"

import { useState } from "react"
import useSWR from "swr"
import { BarChart3, Users, Heart, Brain, TrendingUp, Shield, Globe2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PlatformStatsPage() {
  const [timeframe, setTimeframe] = useState("30d")
  const { data } = useSWR(`/api/analytics/aggregate?timeframe=${timeframe}`, fetcher)

  const stats = data?.stats || {}
  const moduleUsage = data?.moduleUsage || []
  const dayDist = data?.dayDistribution || []

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Platform Insights</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Anonymized, aggregate data showing how the community uses the platform. No individual data — ever.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Privacy-preserving analytics.</strong> These numbers are aggregate counts — "how many" not "who."
            Individual data is encrypted client-side and cannot be read by the platform. This page shows the
            collective pulse of the community without exposing any individual. Minimum 5 users per group to
            prevent identification by deduction.
          </p>
        </CardContent>
      </Card>

      {/* Timeframe selector */}
      <div className="flex gap-2">
        {[
          { value: "7d", label: "7 days" },
          { value: "30d", label: "30 days" },
          { value: "90d", label: "90 days" },
        ].map(t => (
          <button key={t.value} onClick={() => setTimeframe(t.value)}
            className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors",
              timeframe === t.value ? "bg-blue-100 border-blue-300 text-blue-700 font-semibold" : "border-border text-muted-foreground"
            )}>{t.label}</button>
        ))}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
          <p className="text-[10px] text-muted-foreground">Total members</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.activeUsers || 0}</p>
          <p className="text-[10px] text-muted-foreground">Active ({timeframe})</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{stats.totalActivities || 0}</p>
          <p className="text-[10px] text-muted-foreground">Total actions</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.avgActivitiesPerUser || 0}</p>
          <p className="text-[10px] text-muted-foreground">Avg actions/user</p>
        </CardContent></Card>
      </div>

      {/* Module usage */}
      {moduleUsage.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Most Used Features</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {moduleUsage.slice(0, 10).map((m: any, i: number) => {
              const maxCount = moduleUsage[0]?.count || 1
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">{m.module}</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-10 text-right">{m.count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Activity by day */}
      {dayDist.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Activity by Day of Week</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {dayDist.map((d: any, i: number) => {
                const maxCount = Math.max(...dayDist.map((x: any) => x.count), 1)
                const height = (d.count / maxCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-400 rounded-t" style={{ height: `${height}%`, minHeight: d.count > 0 ? "4px" : "0" }} />
                    <span className="text-[9px] text-muted-foreground">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health & wellness aggregate */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" /> Community Health Pulse
        </CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-lg font-bold text-rose-600">{stats.healthEntries || 0}</p><p className="text-[10px] text-muted-foreground">Health logs</p></div>
            <div><p className="text-lg font-bold text-violet-600">{stats.moodEntries || 0}</p><p className="text-[10px] text-muted-foreground">Mood check-ins</p></div>
            <div><p className="text-lg font-bold text-blue-600">{stats.journalEntries || 0}</p><p className="text-[10px] text-muted-foreground">Journal entries</p></div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">
            These are counts only. The content of health logs, mood entries, and journals is encrypted
            and invisible to the platform.
          </p>
        </CardContent>
      </Card>

      {/* What we see vs don't see */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What We See vs What We Don't</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">We CAN see (aggregate)</p>
              <ul className="space-y-0.5 text-[10px] text-emerald-700">
                <li>• Total users per region</li>
                <li>• Feature usage counts</li>
                <li>• Activity patterns (time of day, day of week)</li>
                <li>• Engagement metrics (avg actions/user)</li>
                <li>• General demographics (age bracket, province)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1">We CANNOT see (encrypted)</p>
              <ul className="space-y-0.5 text-[10px] text-red-700">
                <li>• Your health data content</li>
                <li>• Your journal entries</li>
                <li>• Your financial information</li>
                <li>• Your family messages</li>
                <li>• Your personal notes or decisions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/privacy-architecture" className="text-sm text-emerald-600 hover:underline">Privacy Architecture</a>
        <a href="/why" className="text-sm text-violet-600 hover:underline">Why This Exists</a>
        <a href="/community/hub" className="text-sm text-blue-600 hover:underline">Community</a>
        <a href="/about" className="text-sm text-slate-600 hover:underline">About</a>
      </div>
    </div>
  )
}
