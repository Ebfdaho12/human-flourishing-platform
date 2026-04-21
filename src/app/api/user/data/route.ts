import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * Generic User Data Store API
 *
 * GET /api/user/data?key=daily-habits  → returns the stored data for that key
 * PUT /api/user/data                   → upserts data for a key
 *
 * Data is expected to be encrypted client-side before storage.
 * The server stores opaque JSON blobs it cannot read.
 *
 * Valid keys: daily-habits, gratitude, water-log, decisions, challenges,
 * people, skills, vision-board, energy-log, body-comp, lunar-logs,
 * evening-review, focus-history, flourishing-history, future-letters
 */

const VALID_KEYS = new Set([
  "daily-habits", "gratitude", "water-log", "decisions", "challenges",
  "people", "skills", "vision-board", "energy-log", "body-comp",
  "lunar-logs", "evening-review", "focus-history", "flourishing-history",
  "future-letters", "my-path",
])

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const key = req.nextUrl.searchParams.get("key")
    if (!key || !VALID_KEYS.has(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }

    const record = await prisma.userData.findUnique({
      where: { userId_key: { userId: session.user.id, key } },
    })

    return NextResponse.json({ key, data: record?.data ?? null, updatedAt: record?.updatedAt ?? null })
  } catch (error) {
    console.error("[API] GET /api/user/data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`userdata:${session.user.id}`, 30, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  try {
    const body = await req.json()
    const { key, data } = body

    if (!key || !VALID_KEYS.has(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }
    if (data === undefined || data === null) {
      return NextResponse.json({ error: "data is required" }, { status: 400 })
    }

    // Data should be a string (encrypted JSON blob from client)
    const dataStr = typeof data === "string" ? data : JSON.stringify(data)

    // Max 1MB per key
    if (dataStr.length > 1_000_000) {
      return NextResponse.json({ error: "Data too large (max 1MB)" }, { status: 400 })
    }

    const record = await prisma.userData.upsert({
      where: { userId_key: { userId: session.user.id, key } },
      update: { data: dataStr },
      create: { userId: session.user.id, key, data: dataStr },
    })

    return NextResponse.json({ key, updatedAt: record.updatedAt })
  } catch (error) {
    console.error("[API] PUT /api/user/data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
