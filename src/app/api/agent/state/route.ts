import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * GET /api/agent/state
 *
 * Returns a unified life-state snapshot designed for external agents (voice
 * assistants, AR overlays, MCP clients, ambient displays). Surface-agnostic:
 * same JSON drives any downstream UI.
 *
 * This is the first endpoint in the post-app future layer — agents query
 * this to understand "what's going on with this person right now".
 */

const SCHEMA_VERSION = "1.0"

type Window = "24h" | "7d" | "30d"

function windowMs(w: Window) {
  return w === "24h" ? 86400000 : w === "7d" ? 7 * 86400000 : 30 * 86400000
}

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`agent-state:${session.user.id}`, 60, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const detail = (req.nextUrl.searchParams.get("detail") ?? "summary") as "summary" | "full"

  try {
    const uid = session.user.id
    const now = Date.now()
    const since30 = new Date(now - 30 * 86400000)

    const [moods, healthEntries, healthGoals, learningGoals, wallet] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: uid, recordedAt: { gte: since30 } },
        orderBy: { recordedAt: "desc" },
        take: 200,
      }),
      prisma.healthEntry.findMany({
        where: { userId: uid, recordedAt: { gte: since30 } },
        orderBy: { recordedAt: "desc" },
        take: 300,
      }),
      prisma.healthGoal.findMany({ where: { userId: uid, isActive: true }, take: 20 }),
      prisma.learningGoal.findMany({ where: { userId: uid, isActive: true }, take: 20 }),
      prisma.wallet.findUnique({ where: { userId: uid } }),
    ])

    const windowAgg = (w: Window, values: { at: number; value: number }[]) => {
      const cutoff = now - windowMs(w)
      const filtered = values.filter(v => v.at >= cutoff && Number.isFinite(v.value))
      if (filtered.length === 0) return null
      const vals = filtered.map(v => v.value)
      return {
        n: vals.length,
        avg: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
        min: Math.min(...vals),
        max: Math.max(...vals),
      }
    }

    const moodValues = moods.map(m => ({ at: m.recordedAt.getTime(), value: m.score }))
    const moodSummary = {
      "24h": windowAgg("24h", moodValues),
      "7d": windowAgg("7d", moodValues),
      "30d": windowAgg("30d", moodValues),
    }

    const sleepValues = healthEntries
      .filter(e => e.entryType === "SLEEP")
      .map(e => {
        const parsed = parseJson<{ duration?: number }>(e.data, {})
        return { at: e.recordedAt.getTime(), value: Number(parsed.duration ?? 0) }
      })
      .filter(v => v.value > 0)
    const sleepSummary = {
      "7d": windowAgg("7d", sleepValues),
      "30d": windowAgg("30d", sleepValues),
    }

    const exerciseEntries = healthEntries.filter(e => e.entryType === "EXERCISE")
    const exerciseSummary = {
      "7d": exerciseEntries.filter(e => e.recordedAt.getTime() >= now - 7 * 86400000).length,
      "30d": exerciseEntries.length,
    }

    const hoursSinceMood = moods[0]
      ? Math.round((now - moods[0].recordedAt.getTime()) / 3600000)
      : null
    const hoursSinceHealthLog = healthEntries[0]
      ? Math.round((now - healthEntries[0].recordedAt.getTime()) / 3600000)
      : null

    const goalsCount = healthGoals.length + learningGoals.length
    const goalsSample = [
      ...healthGoals.slice(0, detail === "full" ? 10 : 3).map(g => ({
        id: g.id,
        kind: "health",
        title: g.title,
        goalType: g.goalType,
        target: parseJson<{ value?: number; unit?: string }>(g.target, {}),
        deadline: g.deadline?.toISOString() ?? null,
      })),
      ...learningGoals.slice(0, detail === "full" ? 10 : 3).map(g => ({
        id: g.id,
        kind: "learning",
        title: `${g.subject}: ${g.topic}`,
        level: g.level,
        targetDate: g.targetDate?.toISOString() ?? null,
      })),
    ]

    const response = {
      schemaVersion: SCHEMA_VERSION,
      userId: uid,
      generatedAt: new Date().toISOString(),
      summary: {
        mood: moodSummary,
        sleep: sleepSummary,
        exercise: exerciseSummary,
        goalsOpen: goalsCount,
        hoursSinceLastMood: hoursSinceMood,
        hoursSinceLastHealthLog: hoursSinceHealthLog,
      },
      goals: goalsSample,
      wallet: wallet ? {
        found: wallet.foundBalance.toString(),
        voice: wallet.voiceBalance.toString(),
        stakedFound: wallet.stakedFound.toString(),
      } : null,
      guidance: {
        howToUse: "Structured life-state snapshot. Use for proactive suggestions, voice responses, or ambient display. Null fields mean insufficient data — do not fabricate.",
        missingDataPolicy: "Return 'keep logging' suggestions rather than guessed values.",
        related: {
          log: "/api/agent/log",
          insights: "/api/agent/insights",
          manifest: "/api/agent/manifest",
          streaks: "/api/streaks",
          achievements: "/api/achievements",
        },
      },
    }

    return NextResponse.json(response, {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    console.error("[API] /api/agent/state:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
