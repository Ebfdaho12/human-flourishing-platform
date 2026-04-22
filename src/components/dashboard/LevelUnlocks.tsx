"use client"

import { useState, useEffect } from "react"
import { Lock, Unlock, Crown, Star, Trophy, Sparkles, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * LevelUnlocks — Shows what features unlock at each level
 *
 * Creates aspiration and anticipation. Players see what's coming
 * and are motivated to level up to unlock it.
 *
 * Psychology: Goal gradient effect — motivation increases as you get closer to a reward
 */

interface UnlockTier {
  level: number
  title: string
  rewards: string[]
  icon: any
  color: string
}

// NOTE: Currently all features are accessible at all levels.
// Level "unlocks" are recognition badges, not feature gates.
// True gating will be implemented with blockchain launch.
const UNLOCK_TIERS: UnlockTier[] = [
  { level: 1, title: "Novice", rewards: ["Novice badge earned", "Access to all basic tools"], icon: Star, color: "text-slate-400 border-slate-200 bg-slate-50" },
  { level: 3, title: "Apprentice", rewards: ["Apprentice badge earned", "Recognition in community"], icon: Star, color: "text-blue-400 border-blue-200 bg-blue-50" },
  { level: 5, title: "Adventurer", rewards: ["Adventurer badge on profile", "Higher FOUND earning rate"], icon: Star, color: "text-emerald-500 border-emerald-200 bg-emerald-50" },
  { level: 10, title: "Warrior", rewards: ["Warrior badge", "Priority feedback channel", "Community leadership eligible"], icon: Trophy, color: "text-violet-500 border-violet-200 bg-violet-50" },
  { level: 15, title: "Veteran", rewards: ["Veteran badge", "Beta features early access"], icon: Trophy, color: "text-blue-500 border-blue-200 bg-blue-50" },
  { level: 20, title: "Champion", rewards: ["Champion badge", "Doubled XP events", "Governance participation"], icon: Crown, color: "text-amber-500 border-amber-200 bg-amber-50" },
  { level: 30, title: "Master", rewards: ["Founding member recognition", "Direct platform input"], icon: Crown, color: "text-violet-500 border-violet-200 bg-violet-50" },
  { level: 50, title: "Transcendent", rewards: ["Legendary badge", "Name in platform credits forever"], icon: Sparkles, color: "text-amber-400 border-amber-300 bg-amber-50" },
]

function getPlayerLevel(): number {
  if (typeof window === "undefined") return 1
  try {
    // Quick XP estimation from available data
    const habits = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
    const gratitude = JSON.parse(localStorage.getItem("hfp-gratitude") || "[]")
    const pages = JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]")
    const quests = JSON.parse(localStorage.getItem("hfp-quest-history") || "[]")

    let xp = 0
    xp += habits.reduce((s: number, h: any) => s + (h.completedDates?.length || 0) * 5, 0)
    xp += gratitude.length * 10
    xp += pages.length * 5
    xp += quests.reduce((s: number, q: any) => s + (q.xp || 0), 0)

    // Convert XP to level
    let level = 1
    let remaining = xp
    while (remaining >= Math.floor(100 * Math.pow(1.5, level - 1))) {
      remaining -= Math.floor(100 * Math.pow(1.5, level - 1))
      level++
    }
    return level
  } catch {
    return 1
  }
}

export function LevelUnlocks() {
  const [level, setLevel] = useState(1)

  useEffect(() => {
    setLevel(getPlayerLevel())
  }, [])

  // Find current tier and next tier
  const currentTier = [...UNLOCK_TIERS].reverse().find(t => t.level <= level) || UNLOCK_TIERS[0]
  const nextTier = UNLOCK_TIERS.find(t => t.level > level)

  if (!nextTier) return null // Max level reached

  const NextIcon = nextTier.icon

  return (
    <Card className={cn("border", nextTier.color.split(" ").slice(1).join(" "))}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", nextTier.color)}>
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold">Level {nextTier.level}: {nextTier.title}</p>
              <Badge variant="outline" className="text-[8px]">{nextTier.level - level} levels away</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">Unlocks: {nextTier.rewards[0]}</p>
          </div>
          <Gift className="h-4 w-4 text-muted-foreground/30 shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
