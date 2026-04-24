import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * GET /api/agent/insights
 *
 * Proactive insights endpoint — returns the top N things an ambient agent
 * should proactively surface to the user right now. Ranked by surprise +
 * actionability. Each insight is atomic: headline, body, source, suggested
 * action. Designed so a voice/AR agent can say ONE of them out loud.
 */

type Insight = {
  id: string
  headline: string
  body: string
  tone: "neutral" | "concerned" | "celebratory"
  surpriseScore: number
  suggestedAction?: { label: string; href?: string }
  sources: string[]
}

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`agent-insights:${session.user.id}`, 60, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const top = Math.max(1, Math.min(10, Number(req.nextUrl.searchParams.get("top") ?? 3)))
  const toneFilter = req.nextUrl.searchParams.get("tone") as Insight["tone"] | null

  try {
    const uid = session.user.id
    const now = Date.now()
    const insights: Insight[] = []

    const [moods, sleep, exercise] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: uid, recordedAt: { gte: new Date(now - 60 * 86400000) } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId: uid, entryType: "SLEEP", recordedAt: { gte: new Date(now - 60 * 86400000) } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId: uid, entryType: "EXERCISE", recordedAt: { gte: new Date(now - 30 * 86400000) } },
        orderBy: { recordedAt: "desc" },
      }),
    ])

    // Mood trend (7d vs 30d)
    if (moods.length >= 7) {
      const d7 = moods.filter(m => m.recordedAt.getTime() >= now - 7 * 86400000)
      if (d7.length >= 3) {
        const avg7 = d7.reduce((s, m) => s + m.score, 0) / d7.length
        const avg30 = moods.reduce((s, m) => s + m.score, 0) / moods.length
        const delta = avg7 - avg30
        if (Math.abs(delta) >= 0.8) {
          insights.push({
            id: "mood-trend",
            headline: delta > 0
              ? `Your mood is up ${delta.toFixed(1)} points this week`
              : `Your mood is down ${Math.abs(delta).toFixed(1)} points this week`,
            body: `7-day avg ${avg7.toFixed(1)} vs 30-day avg ${avg30.toFixed(1)}. ${d7.length} logs this week.`,
            tone: delta > 0 ? "celebratory" : "concerned",
            surpriseScore: Math.min(100, Math.round(Math.abs(delta) * 30)),
            suggestedAction: delta > 0
              ? { label: "Log a gratitude", href: "/gratitude" }
              : { label: "Reflect on the week", href: "/weekly-reflection" },
            sources: [`${d7.length} mood logs this week`],
          })
        }
      }
    }

    // Sleep debt
    if (sleep.length >= 4) {
      const last7 = sleep.filter(e => e.recordedAt.getTime() >= now - 7 * 86400000)
      if (last7.length >= 4) {
        const durations = last7
          .map(e => Number(parseJson<{ duration?: number }>(e.data, {}).duration ?? 0))
          .filter(n => n > 0)
        if (durations.length >= 3) {
          const avg = durations.reduce((s, v) => s + v, 0) / durations.length
          if (avg < 6.5) {
            const deficit = (7 - avg) * last7.length
            insights.push({
              id: "sleep-debt",
              headline: `You're running on ${avg.toFixed(1)}h of sleep this week`,
              body: `~${deficit.toFixed(1)} hours of sleep debt across ${last7.length} nights. Amygdala reactivity rises ~60% after poor sleep.`,
              tone: "concerned",
              surpriseScore: Math.round((7 - avg) * 20),
              suggestedAction: { label: "Sleep optimization", href: "/sleep-optimization" },
              sources: [`${last7.length} sleep logs this week`],
            })
          }
        }
      }
    }

    // Exercise gap
    const lastExercise = exercise[0]
    const daysSince = lastExercise
      ? Math.floor((now - lastExercise.recordedAt.getTime()) / 86400000)
      : null
    if (daysSince !== null && daysSince >= 4) {
      insights.push({
        id: "exercise-gap",
        headline: `${daysSince} days since your last workout`,
        body: `Exercise reduces anxiety comparably to SSRIs in multiple meta-analyses. A 10-minute walk counts.`,
        tone: "concerned",
        surpriseScore: Math.min(80, daysSince * 10),
        suggestedAction: { label: "Log a walk", href: "/health" },
        sources: ["exercise log"],
      })
    }

    // No recent mood logs
    if (moods.length > 0) {
      const hoursSince = Math.floor((now - moods[0].recordedAt.getTime()) / 3600000)
      if (hoursSince >= 36) {
        insights.push({
          id: "stale-mood",
          headline: `${Math.round(hoursSince / 24)} days since your last mood check-in`,
          body: "Daily logs produce the richest correlations. Takes five seconds.",
          tone: "neutral",
          surpriseScore: Math.min(50, Math.round(hoursSince / 24) * 8),
          suggestedAction: { label: "Check in now", href: "/mental-health" },
          sources: ["mood log gap"],
        })
      }
    }

    let ranked = insights.sort((a, b) => b.surpriseScore - a.surpriseScore)
    if (toneFilter) ranked = ranked.filter(i => i.tone === toneFilter)
    const topN = ranked.slice(0, top)

    return NextResponse.json({
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      count: topN.length,
      insights: topN,
      guidance: {
        howToUse: "Ordered by surprise + actionability. First result is the single headline for voice/AR. Speak one at a time — do not overload.",
      },
    }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("[API] /api/agent/insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
