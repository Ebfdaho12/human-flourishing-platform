import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Report API — generates a comprehensive health report for printing or sharing with doctors
 *
 * GET /api/report?days=30
 * Returns a structured report with all health data, trends, and insights
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const days = Math.min(365, parseInt(searchParams.get("days") ?? "30"))
    const since = new Date(Date.now() - days * 86400000)

    const [
      healthEntries,
      moodEntries,
      goals,
      insights,
      profile,
    ] = await Promise.all([
      prisma.healthEntry.findMany({
        where: { userId, recordedAt: { gte: since } },
        orderBy: { recordedAt: "desc" },
        select: { entryType: true, data: true, notes: true, recordedAt: true },
      }),
      prisma.moodEntry.findMany({
        where: { userId, recordedAt: { gte: since } },
        orderBy: { recordedAt: "desc" },
        select: { score: true, emotions: true, triggers: true, recordedAt: true },
      }),
      prisma.healthGoal.findMany({
        where: { userId, isActive: true },
        select: { title: true, goalType: true, target: true, current: true, deadline: true },
      }),
      prisma.aIInsight.findMany({
        where: { userId, moduleId: "HEALTH", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { content: true, createdAt: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { displayName: true },
      }),
    ])

    // Aggregate vitals
    const vitalsSummary: Record<string, { values: number[]; unit: string }> = {}
    for (const e of healthEntries.filter(e => e.entryType === "VITALS")) {
      const d = JSON.parse(e.data || "{}")
      for (const [key, val] of Object.entries(d)) {
        if (typeof val === "number") {
          if (!vitalsSummary[key]) vitalsSummary[key] = { values: [], unit: "" }
          vitalsSummary[key].values.push(val)
        }
      }
    }

    const vitalsReport = Object.entries(vitalsSummary).map(([key, data]) => ({
      metric: key,
      readings: data.values.length,
      latest: data.values[0],
      average: Math.round((data.values.reduce((a, b) => a + b, 0) / data.values.length) * 10) / 10,
      min: Math.min(...data.values),
      max: Math.max(...data.values),
    }))

    // Mood summary
    const avgMood = moodEntries.length > 0
      ? Math.round((moodEntries.reduce((s, m) => s + m.score, 0) / moodEntries.length) * 10) / 10
      : null

    const emotionFrequency: Record<string, number> = {}
    for (const m of moodEntries) {
      for (const e of JSON.parse(m.emotions || "[]")) {
        emotionFrequency[e] = (emotionFrequency[e] ?? 0) + 1
      }
    }

    const topEmotions = Object.entries(emotionFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }))

    return NextResponse.json({
      report: {
        generatedAt: new Date().toISOString(),
        periodDays: days,
        patientName: profile?.displayName ?? "Anonymous",
        disclaimer: "This report is generated from self-reported data. It is not a medical diagnosis. Please consult a healthcare professional for medical advice.",
      },
      vitals: vitalsReport,
      entries: {
        total: healthEntries.length,
        byType: healthEntries.reduce((acc, e) => {
          acc[e.entryType] = (acc[e.entryType] ?? 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
      mood: {
        checkIns: moodEntries.length,
        average: avgMood,
        topEmotions,
      },
      goals: goals.map(g => ({
        title: g.title,
        type: g.goalType,
        target: JSON.parse(g.target || "{}"),
        current: g.current ? JSON.parse(g.current) : null,
        deadline: g.deadline?.toISOString() ?? null,
      })),
      insights: insights.map(i => ({
        content: i.content,
        date: i.createdAt.toISOString(),
      })),
    })

  } catch (error) {
    console.error("[API] GET /api/report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
