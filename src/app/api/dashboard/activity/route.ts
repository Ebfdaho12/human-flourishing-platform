import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Dashboard Activity Feed — aggregates recent activity across all modules
 * Returns the latest actions from health, mental health, education, governance, etc.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id

    // Fetch recent items from all modules in parallel
    const [
      healthEntries,
      moodEntries,
      journalEntries,
      learningGoals,
      lessonSessions,
      govRecords,
      studies,
      interventions,
      infraProjects,
      energyLogs,
    ] = await Promise.all([
      prisma.healthEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, entryType: true, createdAt: true } }),
      prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, score: true, createdAt: true } }),
      prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, createdAt: true } }),
      prisma.learningGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, subject: true, topic: true, createdAt: true } }),
      prisma.lessonSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, subject: true, topic: true, score: true, createdAt: true } }),
      prisma.govRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, entityType: true, title: true, createdAt: true } }),
      prisma.researchStudy.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, field: true, status: true, createdAt: true } }),
      prisma.econIntervention.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, roiScore: true, createdAt: true } }),
      prisma.infraProject.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, projectType: true, createdAt: true } }),
      prisma.energyLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, logType: true, sourceType: true, amountKwh: true, createdAt: true } }),
    ])

    // Normalize into a unified feed
    const feed: { id: string; module: string; action: string; detail: string; timestamp: string }[] = []

    for (const e of healthEntries) feed.push({ id: e.id, module: "HEALTH", action: "Logged health entry", detail: e.entryType.toLowerCase(), timestamp: e.createdAt.toISOString() })
    for (const e of moodEntries) feed.push({ id: e.id, module: "MENTAL_HEALTH", action: "Mood check-in", detail: `Score: ${e.score}/10`, timestamp: e.createdAt.toISOString() })
    for (const e of journalEntries) feed.push({ id: e.id, module: "MENTAL_HEALTH", action: "Journal entry", detail: e.title ?? "Untitled", timestamp: e.createdAt.toISOString() })
    for (const e of learningGoals) feed.push({ id: e.id, module: "EDUCATION", action: "Set learning goal", detail: `${e.subject}: ${e.topic}`, timestamp: e.createdAt.toISOString() })
    for (const e of lessonSessions) feed.push({ id: e.id, module: "EDUCATION", action: "Tutoring session", detail: `${e.subject} — ${e.topic}${e.score ? ` (${e.score}/100)` : ""}`, timestamp: e.createdAt.toISOString() })
    for (const e of govRecords) feed.push({ id: e.id, module: "GOVERNANCE", action: `Added ${e.entityType.toLowerCase()}`, detail: e.title, timestamp: e.createdAt.toISOString() })
    for (const e of studies) feed.push({ id: e.id, module: "DESCI", action: "Pre-registered study", detail: `${e.field}: ${e.title}`, timestamp: e.createdAt.toISOString() })
    for (const e of interventions) feed.push({ id: e.id, module: "ECONOMICS", action: "Added intervention", detail: `${e.title}${e.roiScore ? ` (ROI: ${e.roiScore})` : ""}`, timestamp: e.createdAt.toISOString() })
    for (const e of infraProjects) feed.push({ id: e.id, module: "INFRASTRUCTURE", action: "Added project", detail: `${e.projectType}: ${e.name}`, timestamp: e.createdAt.toISOString() })
    for (const e of energyLogs) feed.push({ id: e.id, module: "ENERGY", action: `${e.logType.toLowerCase()} logged`, detail: `${e.amountKwh} kWh (${e.sourceType.toLowerCase()})`, timestamp: e.createdAt.toISOString() })

    // Sort by time, most recent first
    feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Module stats
    const stats = {
      health: healthEntries.length > 0 ? await prisma.healthEntry.count({ where: { userId } }) : 0,
      mood: moodEntries.length > 0 ? await prisma.moodEntry.count({ where: { userId } }) : 0,
      journal: journalEntries.length > 0 ? await prisma.journalEntry.count({ where: { userId } }) : 0,
      education: lessonSessions.length > 0 ? await prisma.lessonSession.count({ where: { userId } }) : 0,
      governance: govRecords.length > 0 ? await prisma.govRecord.count({ where: { userId } }) : 0,
      desci: studies.length > 0 ? await prisma.researchStudy.count({ where: { userId } }) : 0,
      economics: interventions.length > 0 ? await prisma.econIntervention.count({ where: { userId } }) : 0,
      infrastructure: infraProjects.length > 0 ? await prisma.infraProject.count({ where: { userId } }) : 0,
      energy: energyLogs.length > 0 ? await prisma.energyLog.count({ where: { userId } }) : 0,
    }

    return NextResponse.json({ feed: feed.slice(0, 15), stats })

  } catch (error) {
    console.error("[API] GET /api/dashboard/activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
