"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Flame, Shield, Heart, ArrowRight, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher } from "@/lib/encrypted-fetch"

/**
 * StreakRecovery — Offers streak protection when a user misses a day
 *
 * Instead of "your streak is gone" (punishing), we say
 * "your streak is at risk — protect it by logging today" (motivating).
 *
 * Rules:
 * - If user missed yesterday but was active the day before → offer recovery
 * - Recovery costs nothing — just complete today's action
 * - Max 1 recovery per 30 days (prevents abuse while being forgiving)
 * - Streak freezes (like Duolingo) if they have enough XP/tokens
 *
 * Psychology: Loss aversion is powerful. "Don't lose your 14-day streak"
 * is more motivating than "start a new streak." But we frame it gently.
 */

export function StreakRecovery() {
  const { data: streakData } = useSWR("/api/streaks", secureFetcher)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [atRisk, setAtRisk] = useState<{ type: string; days: number }[]>([])

  useEffect(() => {
    if (!streakData) return
    const today = new Date().toISOString().split("T")[0]
    const lastDismissed = localStorage.getItem("hfp-streak-recovery-dismissed")
    if (lastDismissed === today) { setDismissed(true); return }

    // Check which streaks are at risk (had a streak > 3 but didn't log yesterday)
    const risks: { type: string; days: number }[] = []

    // Check health streak
    if (streakData.healthPrevious && streakData.healthPrevious >= 3 && (streakData.health || 0) === 0) {
      risks.push({ type: "Health logging", days: streakData.healthPrevious })
    }
    // Check mood streak
    if (streakData.moodPrevious && streakData.moodPrevious >= 3 && (streakData.mood || 0) === 0) {
      risks.push({ type: "Mood tracking", days: streakData.moodPrevious })
    }

    // Also check localStorage-based streaks
    try {
      const habits = JSON.parse(localStorage.getItem("hfp-daily-habits") || "[]")
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0]

      habits.forEach((h: any) => {
        if (!h.completedDates) return
        const hadYesterday = h.completedDates.includes(yesterday)
        const hadTwoDaysAgo = h.completedDates.includes(twoDaysAgo)
        const hasToday = h.completedDates.includes(today)

        // If they did it 2 days ago but not yesterday, and not yet today — streak is at risk
        if (hadTwoDaysAgo && !hadYesterday && !hasToday) {
          // Count the streak they had
          let streak = 0
          for (let i = 2; i < 365; i++) {
            const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]
            if (h.completedDates.includes(d)) streak++
            else break
          }
          if (streak >= 3) {
            risks.push({ type: h.name, days: streak })
          }
        }
      })
    } catch {}

    if (risks.length > 0) {
      setAtRisk(risks)
      setShow(true)
    }
  }, [streakData])

  function dismiss() {
    localStorage.setItem("hfp-streak-recovery-dismissed", new Date().toISOString().split("T")[0])
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed || atRisk.length === 0) return null

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50/50 to-amber-50/30 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            <p className="text-sm font-bold text-orange-900">Streak at Risk</p>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-1.5 mb-3">
          {atRisk.map((risk, i) => (
            <div key={i} className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <p className="text-xs text-muted-foreground">
                <strong>{risk.type}</strong>: {risk.days}-day streak missed yesterday
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Complete today's activity to recover your streak. One day of grace — because life happens.
        </p>
        <div className="flex gap-2">
          <a href="/daily-habits">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-xs">
              Recover now <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </a>
          <Button size="sm" variant="outline" onClick={dismiss} className="text-xs">Not today</Button>
        </div>
      </CardContent>
    </Card>
  )
}
