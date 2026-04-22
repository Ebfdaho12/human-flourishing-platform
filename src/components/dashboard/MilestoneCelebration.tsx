"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "hfp-milestones-seen"

type Milestone = {
  id: string
  name: string
  message: string
  category: string
}

const STREAK_THRESHOLDS = [7, 14, 30, 60, 100, 365]
const TOKEN_THRESHOLDS = [100, 500, 1000, 5000, 10000]
const HEALTH_THRESHOLDS = [10, 50, 100, 500]
const PAGE_THRESHOLDS = [10, 50, 100, 188]

const MESSAGES: Record<string, string[]> = {
  streak: [
    "Your consistency is building something powerful.",
    "Dedication like this changes lives.",
    "You show up for yourself — that matters.",
    "Relentless. Keep going.",
    "A full year of commitment. Extraordinary.",
  ],
  token: [
    "Your engagement is paying off — literally.",
    "Halfway to a thousand. Nice.",
    "Four digits of FOUND earned through real effort.",
    "You're stacking proof of your commitment.",
    "Five figures. You're a pillar of this community.",
  ],
  health: [
    "Ten entries — awareness begins.",
    "Fifty data points paint a real picture.",
    "A hundred logs of self-knowledge.",
    "Five hundred entries. You know yourself deeply.",
  ],
  pages: [
    "Curiosity unlocked — 10 pages explored.",
    "Fifty pages deep. You're a true explorer.",
    "One hundred pages of knowledge absorbed.",
    "Every single page visited. Completionist unlocked.",
  ],
}

function getSeenMilestones(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markSeen(id: string) {
  const seen = getSeenMilestones()
  seen.add(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
}

function getPageVisitCount(): number {
  try {
    const raw = localStorage.getItem("hfp-pages-visited")
    return raw ? JSON.parse(raw).length : 0
  } catch {
    return 0
  }
}

function buildMilestones(streak: number, tokens: number, healthLogs: number, pageVisits: number): Milestone[] {
  const seen = getSeenMilestones()
  const pending: Milestone[] = []

  STREAK_THRESHOLDS.forEach((t, i) => {
    const id = `streak-${t}`
    if (streak >= t && !seen.has(id))
      pending.push({ id, name: `${t}-Day Streak`, message: MESSAGES.streak[Math.min(i, MESSAGES.streak.length - 1)], category: "Streak" })
  })

  TOKEN_THRESHOLDS.forEach((t, i) => {
    const id = `token-${t}`
    if (tokens >= t && !seen.has(id))
      pending.push({ id, name: `${t.toLocaleString()} FOUND Earned`, message: MESSAGES.token[Math.min(i, MESSAGES.token.length - 1)], category: "Tokens" })
  })

  HEALTH_THRESHOLDS.forEach((t, i) => {
    const id = `health-${t}`
    if (healthLogs >= t && !seen.has(id))
      pending.push({ id, name: `${t} Health Entries`, message: MESSAGES.health[Math.min(i, MESSAGES.health.length - 1)], category: "Health" })
  })

  PAGE_THRESHOLDS.forEach((t, i) => {
    const id = `pages-${t}`
    if (pageVisits >= t && !seen.has(id))
      pending.push({ id, name: `${t} Pages Visited`, message: MESSAGES.pages[Math.min(i, MESSAGES.pages.length - 1)], category: "Discovery" })
  })

  return pending
}

export function MilestoneCelebration() {
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const [streakRes, walletRes] = await Promise.all([
          fetch("/api/streaks").then((r) => r.ok ? r.json() : null),
          fetch("/api/wallet").then((r) => r.ok ? r.json() : null),
        ])

        const streak = streakRes?.health ?? streakRes?.mood ?? streakRes?.platform ?? 0
        const tokens = Number(walletRes?.wallet?.foundBalance ?? walletRes?.foundBalance ?? 0)
        // Count health logs from localStorage since API doesn't return count
        let healthLogs = 0
        try { const v = JSON.parse(localStorage.getItem("hfp-pages-visited") || "[]"); healthLogs = v.length } catch {}
        const pageVisits = getPageVisitCount()

        const pending = buildMilestones(streak, tokens, healthLogs, pageVisits)
        if (pending.length > 0) {
          setMilestone(pending[0])
          requestAnimationFrame(() => setVisible(true))
        }
      } catch { /* silent — milestones are non-critical */ }
    }
    check()
  }, [])

  function dismiss() {
    setVisible(false)
    if (milestone) markSeen(milestone.id)
    setTimeout(() => setMilestone(null), 300)
  }

  if (!milestone) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Confetti particles — pure CSS */}
      <style>{`
        @keyframes hfp-confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
        }
        .hfp-particle {
          position: fixed; top: -10px; width: 8px; height: 8px; border-radius: 2px;
          animation: hfp-confetti 2.5s ease-out forwards;
        }
      `}</style>
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="hfp-particle"
          style={{
            left: `${4 + (i * 4)}%`,
            backgroundColor: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6", "#ef4444"][i % 6],
            animationDelay: `${(i * 0.08).toFixed(2)}s`,
            width: `${6 + (i % 3) * 3}px`,
            height: `${6 + (i % 3) * 3}px`,
          }}
        />
      ))}

      <Card className="relative w-full max-w-sm mx-4 border-primary/30 shadow-lg shadow-primary/10">
        <CardContent className="pt-6 pb-4 text-center space-y-4">
          <div className="text-4xl">&#127942;</div>
          <Badge variant="success" className="text-xs">{milestone.category}</Badge>
          <h2 className="text-xl font-bold tracking-tight">{milestone.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{milestone.message}</p>
          <button
            onClick={dismiss}
            className="mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
