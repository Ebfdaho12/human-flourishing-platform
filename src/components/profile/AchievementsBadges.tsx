"use client"

import useSWR from "swr"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", label: "Bronze" },
  silver: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-700", label: "Silver" },
  gold: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", label: "Gold" },
  platinum: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700", label: "Platinum" },
}

export function AchievementsBadges() {
  const { data } = useSWR("/api/achievements", fetcher)

  if (!data) return null

  const { badges, earned, total, completionPct } = data

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold">{earned}/{total} badges earned</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${completionPct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{completionPct}%</span>
          </div>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {badges.map((badge: any) => {
          const tier = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
          return (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border p-3 transition-all",
                badge.earned ? `${tier.bg} ${tier.border}` : "bg-muted/30 border-border/50 opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={cn("text-xs font-semibold", badge.earned ? tier.text : "text-muted-foreground")}>
                  {badge.name}
                </p>
                {badge.earned && (
                  <span className={cn("text-[9px] font-bold uppercase", tier.text)}>{tier.label}</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              {!badge.earned && badge.target && (
                <div className="mt-1.5">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30 rounded-full" style={{ width: `${Math.min(100, ((badge.progress ?? 0) / badge.target) * 100)}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{badge.progress ?? 0}/{badge.target}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
