import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/security"

/**
 * Data Export API — Your data belongs to you.
 *
 * GET /api/export?type=health&format=csv
 * GET /api/export?type=mood&format=json
 * GET /api/export?type=journal&format=csv
 * GET /api/export?type=all&format=json
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  // Rate limit exports: 5 per 5 minutes
  if (!rateLimit(`export:${userId}`, 5, 300000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const type = req.nextUrl.searchParams.get("type") ?? "all"
  const format = req.nextUrl.searchParams.get("format") ?? "json"

  const exportData: Record<string, any> = {}

  // Health entries
  if (type === "health" || type === "all") {
    const entries = await prisma.healthEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      select: { entryType: true, data: true, notes: true, recordedAt: true },
    })
    exportData.health = entries.map((e) => ({
      type: e.entryType,
      ...JSON.parse(e.data || "{}"),
      notes: e.notes,
      date: e.recordedAt.toISOString(),
    }))
  }

  // Health goals
  if (type === "goals" || type === "all") {
    const goals = await prisma.healthGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { goalType: true, title: true, target: true, current: true, isActive: true, deadline: true, completedAt: true, createdAt: true },
    })
    exportData.healthGoals = goals.map((g) => ({
      type: g.goalType,
      title: g.title,
      target: JSON.parse(g.target || "{}"),
      current: g.current ? JSON.parse(g.current) : null,
      active: g.isActive,
      deadline: g.deadline?.toISOString() ?? null,
      completed: g.completedAt?.toISOString() ?? null,
      created: g.createdAt.toISOString(),
    }))
  }

  // Mood entries
  if (type === "mood" || type === "all") {
    const entries = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      select: { score: true, emotions: true, triggers: true, notes: true, recordedAt: true },
    })
    exportData.mood = entries.map((e) => ({
      score: e.score,
      emotions: JSON.parse(e.emotions || "[]"),
      triggers: e.triggers ? JSON.parse(e.triggers) : [],
      notes: e.notes,
      date: e.recordedAt.toISOString(),
    }))
  }

  // Journal entries
  if (type === "journal" || type === "all") {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { title: true, content: true, mood: true, tags: true, createdAt: true },
    })
    exportData.journal = entries.map((e) => ({
      title: e.title,
      content: e.content,
      mood: e.mood,
      tags: e.tags ? JSON.parse(e.tags) : [],
      date: e.createdAt.toISOString(),
    }))
  }

  // Education
  if (type === "education" || type === "all") {
    const sessions = await prisma.lessonSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { subject: true, topic: true, level: true, durationS: true, score: true, createdAt: true },
    })
    exportData.education = sessions.map((s) => ({
      subject: s.subject,
      topic: s.topic,
      level: s.level,
      durationMinutes: Math.round(s.durationS / 60),
      score: s.score,
      date: s.createdAt.toISOString(),
    }))
  }

  // Energy
  if (type === "energy" || type === "all") {
    const logs = await prisma.energyLog.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      select: { logType: true, sourceType: true, amountKwh: true, pricePerKwh: true, co2SavedKg: true, peakDemand: true, recordedAt: true },
    })
    exportData.energy = logs.map((l) => ({
      type: l.logType,
      source: l.sourceType,
      kwh: l.amountKwh,
      pricePerKwh: l.pricePerKwh,
      co2SavedKg: l.co2SavedKg,
      peakDemand: l.peakDemand,
      date: l.recordedAt.toISOString(),
    }))
  }

  // Governance
  if (type === "governance" || type === "all") {
    const records = await prisma.govRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { entityType: true, title: true, jurisdiction: true, party: true, office: true, notes: true, sourceUrl: true, createdAt: true },
    })
    exportData.governance = records.map((r) => ({
      type: r.entityType,
      title: r.title,
      jurisdiction: r.jurisdiction,
      party: r.party,
      office: r.office,
      notes: r.notes,
      source: r.sourceUrl,
      date: r.createdAt.toISOString(),
    }))
  }

  if (format === "csv") {
    // For CSV, flatten and return the first data type found
    const key = Object.keys(exportData)[0]
    const rows = exportData[key] ?? []
    if (rows.length === 0) {
      return new NextResponse("No data to export", { status: 200, headers: { "Content-Type": "text/plain" } })
    }
    const headers = Object.keys(rows[0])
    const csvLines = [
      headers.join(","),
      ...rows.map((row: any) =>
        headers.map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ""
          const str = typeof val === "object" ? JSON.stringify(val) : String(val)
          return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str
        }).join(",")
      ),
    ]
    const csv = csvLines.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hfp-${key}-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  // JSON format
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hfp-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  })
}
