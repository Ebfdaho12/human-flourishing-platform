import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, sanitizeInput } from "@/lib/security"

/**
 * Universal Search API — search across all user data within HFP
 *
 * GET /api/search?q=headache&type=all
 * Types: all, health, mood, journal, education, governance, desci, economics, infrastructure, energy
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  if (!rateLimit(`search:${userId}`, 30, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const rawQ = req.nextUrl.searchParams.get("q")?.trim()
  const type = req.nextUrl.searchParams.get("type") ?? "all"

  if (!rawQ || rawQ.length < 2) return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })

  const q = sanitizeInput(rawQ).slice(0, 200)

  const results: { id: string; module: string; title: string; detail: string; date: string }[] = []

  // Health entries — search notes and data
  if (type === "all" || type === "health") {
    const health = await prisma.healthEntry.findMany({
      where: { userId, OR: [{ notes: { contains: q } }, { data: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, entryType: true, notes: true, recordedAt: true },
    })
    for (const e of health) {
      results.push({ id: e.id, module: "HEALTH", title: `${e.entryType} entry`, detail: e.notes ?? "Health log", date: e.recordedAt.toISOString() })
    }
  }

  // Journal entries
  if (type === "all" || type === "journal") {
    const journals = await prisma.journalEntry.findMany({
      where: { userId, OR: [{ title: { contains: q } }, { content: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, content: true, createdAt: true },
    })
    for (const e of journals) {
      results.push({ id: e.id, module: "MENTAL_HEALTH", title: e.title ?? "Journal entry", detail: e.content.slice(0, 120), date: e.createdAt.toISOString() })
    }
  }

  // Education sessions
  if (type === "all" || type === "education") {
    const sessions = await prisma.lessonSession.findMany({
      where: { userId, OR: [{ subject: { contains: q } }, { topic: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, subject: true, topic: true, createdAt: true },
    })
    for (const e of sessions) {
      results.push({ id: e.id, module: "EDUCATION", title: `${e.subject}: ${e.topic}`, detail: "Tutoring session", date: e.createdAt.toISOString() })
    }
  }

  // Governance records
  if (type === "all" || type === "governance") {
    const gov = await prisma.govRecord.findMany({
      where: { userId, OR: [{ title: { contains: q } }, { notes: { contains: q } }, { jurisdiction: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, entityType: true, title: true, notes: true, createdAt: true },
    })
    for (const e of gov) {
      results.push({ id: e.id, module: "GOVERNANCE", title: e.title, detail: `${e.entityType} — ${e.notes?.slice(0, 80) ?? ""}`, date: e.createdAt.toISOString() })
    }
  }

  // Research studies
  if (type === "all" || type === "desci") {
    const studies = await prisma.researchStudy.findMany({
      where: { userId, OR: [{ title: { contains: q } }, { hypothesis: { contains: q } }, { field: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, field: true, hypothesis: true, createdAt: true },
    })
    for (const e of studies) {
      results.push({ id: e.id, module: "DESCI", title: e.title, detail: `${e.field} — ${e.hypothesis.slice(0, 80)}`, date: e.createdAt.toISOString() })
    }
  }

  // Economic interventions
  if (type === "all" || type === "economics") {
    const econ = await prisma.econIntervention.findMany({
      where: { userId, OR: [{ title: { contains: q } }, { description: { contains: q } }, { region: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, category: true, region: true, createdAt: true },
    })
    for (const e of econ) {
      results.push({ id: e.id, module: "ECONOMICS", title: e.title, detail: `${e.category} — ${e.region}`, date: e.createdAt.toISOString() })
    }
  }

  // Infrastructure projects
  if (type === "all" || type === "infrastructure") {
    const infra = await prisma.infraProject.findMany({
      where: { userId, OR: [{ name: { contains: q } }, { location: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, projectType: true, location: true, createdAt: true },
    })
    for (const e of infra) {
      results.push({ id: e.id, module: "INFRASTRUCTURE", title: e.name, detail: `${e.projectType} — ${e.location}`, date: e.createdAt.toISOString() })
    }
  }

  // Sort by date
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ results: results.slice(0, 30), total: results.length, query: q })
}
