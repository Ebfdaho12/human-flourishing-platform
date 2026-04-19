"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bell, Heart, Brain, Sparkles, Shield, Flame, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  REMINDER: { icon: Flame, color: "text-amber-500", bg: "bg-amber-100" },
  ACTION: { icon: Shield, color: "text-emerald-500", bg: "bg-emerald-100" },
  INFO: { icon: Sparkles, color: "text-violet-500", bg: "bg-violet-100" },
  CELEBRATION: { icon: Heart, color: "text-pink-500", bg: "bg-pink-100" },
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data } = useSWR("/api/notifications", fetcher, { refreshInterval: 60000 })

  const notifications = data?.notifications ?? []
  const count = notifications.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`${count} notifications`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n: any) => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.INFO
                  const Icon = meta.icon
                  return (
                    <a
                      key={n.id}
                      href={n.action ?? "#"}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-3 py-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.bg)}>
                        <Icon className={cn("h-4 w-4", meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      </div>
                      {n.action && <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
