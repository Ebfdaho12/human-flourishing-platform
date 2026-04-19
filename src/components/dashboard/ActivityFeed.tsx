"use client"

import useSWR from "swr"
import { Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical, TrendingUp, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MODULE_META: Record<string, { icon: any; color: string; label: string; slug: string }> = {
  HEALTH: { icon: Heart, color: "text-rose-500", label: "Health", slug: "health" },
  MENTAL_HEALTH: { icon: Brain, color: "text-pink-500", label: "Mental Health", slug: "mental-health" },
  EDUCATION: { icon: GraduationCap, color: "text-blue-500", label: "Education", slug: "education" },
  GOVERNANCE: { icon: Landmark, color: "text-amber-500", label: "Governance", slug: "governance" },
  ENERGY: { icon: Zap, color: "text-yellow-500", label: "Energy", slug: "energy" },
  DESCI: { icon: FlaskConical, color: "text-teal-500", label: "DeSci", slug: "desci" },
  ECONOMICS: { icon: TrendingUp, color: "text-emerald-500", label: "Economics", slug: "economics" },
  INFRASTRUCTURE: { icon: Building2, color: "text-slate-500", label: "Infrastructure", slug: "infrastructure" },
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

export function ActivityFeed() {
  const { data } = useSWR("/api/dashboard/activity", fetcher)

  const feed: any[] = data?.feed ?? []

  if (feed.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No activity yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Start using modules to see your activity here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {feed.map((item) => {
        const meta = MODULE_META[item.module] ?? MODULE_META.HEALTH
        const Icon = meta.icon
        return (
          <a key={item.id} href={`/${meta.slug}`} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
            <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{item.action}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}

export function ModuleStats() {
  const { data } = useSWR("/api/dashboard/activity", fetcher)

  const stats = data?.stats
  if (!stats) return null

  const totalActivities = Object.values(stats as Record<string, number>).reduce((sum: number, v: number) => sum + v, 0)
  if (totalActivities === 0) return null

  const items = [
    { label: "Health Entries", value: stats.health, color: "text-rose-500" },
    { label: "Mood Check-ins", value: stats.mood, color: "text-pink-500" },
    { label: "Journal Entries", value: stats.journal, color: "text-pink-400" },
    { label: "Tutor Sessions", value: stats.education, color: "text-blue-500" },
    { label: "Gov Records", value: stats.governance, color: "text-amber-500" },
    { label: "Studies", value: stats.desci, color: "text-teal-500" },
    { label: "Interventions", value: stats.economics, color: "text-emerald-500" },
    { label: "Infra Projects", value: stats.infrastructure, color: "text-slate-500" },
    { label: "Energy Logs", value: stats.energy, color: "text-yellow-500" },
  ].filter((i) => i.value > 0)

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border/50 bg-card/50 p-2.5 text-center">
          <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
          <p className="text-[10px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
