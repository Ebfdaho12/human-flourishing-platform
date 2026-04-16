"use client"
import { useState } from "react"
import { MODULE_MAP } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, CheckCircle, Lock } from "lucide-react"

export function ComingSoonBanner({ moduleId }: { moduleId: string }) {
  const mod = MODULE_MAP[moduleId]
  const [interested, setInterested] = useState(false)
  const [loading, setLoading] = useState(false)
  const Icon = mod.icon

  async function handleInterest() {
    setLoading(true)
    await fetch("/api/modules/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    })
    setLoading(false)
    setInterested(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto space-y-8">
      <div className={cn("flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br opacity-70", mod.color)}>
        <Icon className="h-10 w-10 text-white" />
      </div>

      <div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">{mod.title}</h1>
          <Badge variant="outline" className="text-muted-foreground">
            {mod.estimatedLaunch ?? "Coming soon"}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">{mod.tagline}</p>
      </div>

      <p className="text-sm text-muted-foreground max-w-sm">{mod.description}</p>

      <div className="w-full space-y-2">
        {mod.capabilities.map((cap, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-left">
            <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <span className="text-sm text-muted-foreground">{cap}</span>
          </div>
        ))}
      </div>

      {interested ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="h-4 w-4" />
          You&apos;ll be notified when this launches
        </div>
      ) : (
        <Button onClick={handleInterest} disabled={loading} variant="outline">
          <Bell className="h-4 w-4" />
          {loading ? "Saving..." : "Notify me when available"}
        </Button>
      )}
    </div>
  )
}
