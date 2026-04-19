"use client"

import useSWR from "swr"
import {
  Clock, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, Shield, BookOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MODULE_META: Record<string, { icon: any; color: string; bg: string }> = {
  HEALTH: { icon: Heart, color: "text-rose-500", bg: "bg-rose-100" },
  MENTAL_HEALTH: { icon: Brain, color: "text-pink-500", bg: "bg-pink-100" },
  EDUCATION: { icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-100" },
  GOVERNANCE: { icon: Landmark, color: "text-amber-500", bg: "bg-amber-100" },
  ENERGY: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
  DESCI: { icon: FlaskConical, color: "text-teal-500", bg: "bg-teal-100" },
  ECONOMICS: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100" },
  INFRASTRUCTURE: { icon: Building2, color: "text-slate-500", bg: "bg-slate-100" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function TimelinePage() {
  const { data } = useSWR("/api/dashboard/activity", fetcher)

  const feed: any[] = data?.feed ?? []

  // Group by date
  const grouped: Record<string, any[]> = {}
  for (const item of feed) {
    const date = new Date(item.timestamp).toISOString().split("T")[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Timeline</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your journey across all modules — chronological view</p>
      </div>

      {feed.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No activity yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start using any module to see your timeline populate.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-border" />

          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mb-8">
              {/* Date header */}
              <div className="relative flex items-center gap-3 mb-4">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 border-2 border-background">
                  <Clock className="h-4 w-4 text-violet-500" />
                </div>
                <p className="font-semibold text-sm">{formatDate(date)}</p>
              </div>

              {/* Items */}
              <div className="ml-[19px] pl-8 space-y-3">
                {items.map((item: any) => {
                  const meta = MODULE_META[item.module] ?? MODULE_META.HEALTH
                  const Icon = meta.icon
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.bg)}>
                        <Icon className={cn("h-4 w-4", meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{item.action}</p>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
