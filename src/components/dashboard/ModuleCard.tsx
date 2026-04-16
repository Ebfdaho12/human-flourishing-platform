"use client"
import Link from "next/link"
import { type ModuleMeta } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Lock, ChevronRight } from "lucide-react"

export function ModuleCard({ module: mod }: { module: ModuleMeta }) {
  const Icon = mod.icon
  const isActive = mod.status === "ACTIVE"

  const card = (
    <div
      className={cn(
        "relative group rounded-xl border bg-card p-5 transition-all duration-200",
        isActive
          ? "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          : "border-border/50 opacity-75 cursor-default"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
          mod.color,
          !isActive && "opacity-40 grayscale"
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Title + badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn("font-semibold text-sm leading-tight", !isActive && "text-muted-foreground")}>
          {mod.title}
        </h3>
        {isActive ? (
          <Badge variant="success" className="ml-2 shrink-0 text-[10px]">Live</Badge>
        ) : (
          <Badge variant="outline" className="ml-2 shrink-0 text-[10px] text-muted-foreground/60">
            {mod.estimatedLaunch ?? "Coming"}
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>

      {/* Active: chevron; Inactive: lock */}
      {isActive ? (
        <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ChevronRight className="h-3 w-3" />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/40">
          <Lock className="h-3 w-3" />
          <span>Not yet available</span>
        </div>
      )}
    </div>
  )

  if (isActive) {
    return <Link href={`/${mod.slug}`}>{card}</Link>
  }
  return card
}
