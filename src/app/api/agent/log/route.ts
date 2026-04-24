import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * POST /api/agent/log
 *
 * Freeform capture endpoint — for voice, text, ambient agents. One
 * endpoint any surface can hit to log mood/sleep/exercise/water/note
 * without touching a UI. Write-side of the post-app foundation.
 *
 * Request body:
 *   { type: "mood" | "sleep" | "exercise" | "water" | "note",
 *     value?: number,        // score 1-10 mood, hours sleep, minutes exercise, oz water
 *     text?: string,         // freeform note (required for type=note)
 *     at?: string (ISO8601)  // default: now
 *   }
 *
 * Server does NOT parse natural language — agents parse transcripts into
 * typed payloads before calling.
 */

const VALID_TYPES = new Set(["mood", "sleep", "exercise", "water", "note"])

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`agent-log:${session.user.id}`, 60, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  try {
    const body = await req.json()
    const { type, value, text, at } = body ?? {}

    if (!type || typeof type !== "string" || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { error: "Invalid type. Allowed: mood, sleep, exercise, water, note" },
        { status: 400 }
      )
    }

    const when = at ? new Date(at) : new Date()
    if (isNaN(when.getTime())) {
      return NextResponse.json({ error: "Invalid `at` timestamp" }, { status: 400 })
    }

    const uid = session.user.id
    const note = typeof text === "string" ? text.slice(0, 1000) : null

    if (type === "mood") {
      const score = Number(value)
      if (!Number.isFinite(score) || score < 1 || score > 10) {
        return NextResponse.json({ error: "mood value must be 1-10" }, { status: 400 })
      }
      const entry = await prisma.moodEntry.create({
        data: {
          userId: uid,
          score: Math.round(score),
          emotions: "[]",
          notes: note,
          recordedAt: when,
        },
      })
      return NextResponse.json({ ok: true, type, id: entry.id, at: entry.recordedAt.toISOString() })
    }

    if (type === "sleep") {
      const hours = Number(value)
      if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
        return NextResponse.json({ error: "sleep value must be hours (0-24)" }, { status: 400 })
      }
      const entry = await prisma.healthEntry.create({
        data: {
          userId: uid,
          entryType: "SLEEP",
          data: JSON.stringify({ duration: hours }),
          notes: note,
          recordedAt: when,
        },
      })
      return NextResponse.json({ ok: true, type, id: entry.id, at: entry.recordedAt.toISOString() })
    }

    if (type === "exercise") {
      const minutes = Number(value)
      if (!Number.isFinite(minutes) || minutes < 0 || minutes > 600) {
        return NextResponse.json({ error: "exercise value must be minutes (0-600)" }, { status: 400 })
      }
      const entry = await prisma.healthEntry.create({
        data: {
          userId: uid,
          entryType: "EXERCISE",
          data: JSON.stringify({ duration: minutes }),
          notes: note,
          recordedAt: when,
        },
      })
      return NextResponse.json({ ok: true, type, id: entry.id, at: entry.recordedAt.toISOString() })
    }

    if (type === "water") {
      const oz = Number(value)
      if (!Number.isFinite(oz) || oz < 0 || oz > 500) {
        return NextResponse.json({ error: "water value must be ounces (0-500)" }, { status: 400 })
      }
      const entry = await prisma.healthEntry.create({
        data: {
          userId: uid,
          entryType: "MEASUREMENT",
          data: JSON.stringify({ kind: "water", ounces: oz }),
          notes: note,
          recordedAt: when,
        },
      })
      return NextResponse.json({ ok: true, type, id: entry.id, at: entry.recordedAt.toISOString() })
    }

    if (type === "note") {
      if (typeof text !== "string" || !text.trim()) {
        return NextResponse.json({ error: "note requires non-empty `text`" }, { status: 400 })
      }
      const entry = await prisma.journalEntry.create({
        data: {
          userId: uid,
          content: text.slice(0, 5000),
          createdAt: when,
        },
      })
      return NextResponse.json({ ok: true, type, id: entry.id, at: when.toISOString() })
    }

    return NextResponse.json({ error: "Unhandled type" }, { status: 400 })
  } catch (error) {
    console.error("[API] /api/agent/log:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
