import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tutor, hasApiKey, NO_KEY_RESPONSE } from "@/lib/ai"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { rateLimit, rateLimitResponse } from "@/lib/security"
import type { ChatMessage } from "@/lib/ai"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Rate limit AI calls: 10 per minute per user
  if (!rateLimit(`ai:${session.user.id}`, 10, 60000)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 })
  }

  const body = await req.json()
  const { subject, topic, level, messages, goalId, sessionId } = body

  if (!subject || !topic || !messages?.length) {
    return NextResponse.json({ error: "subject, topic, and messages are required" }, { status: 400 })
  }

  const history: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const reply = await tutor(subject, topic, level ?? "BEGINNER", history)

  const updatedMessages = [...messages, { role: "assistant", content: reply }]

  // Upsert session
  let session_record
  if (sessionId) {
    session_record = await prisma.lessonSession.update({
      where: { id: sessionId },
      data: {
        messages: JSON.stringify(updatedMessages),
        durationS: { increment: 30 },
      },
    })
  } else {
    session_record = await prisma.lessonSession.create({
      data: {
        userId: session.user.id,
        goalId: goalId ?? null,
        subject,
        topic,
        level: level ?? "BEGINNER",
        messages: JSON.stringify(updatedMessages),
      },
    })

    // Award for first session
    await awardFound(
      session.user.id,
      "edu_first_session",
      "EDUCATION",
      TOKEN_AWARDS.EDU_FIRST_SESSION,
      "First tutoring session"
    )
  }

  // Award per lesson (per session, once per session)
  if (!sessionId) {
    await awardFound(
      session.user.id,
      `edu_lesson_${session_record.id}`,
      "EDUCATION",
      TOKEN_AWARDS.EDU_LESSON_COMPLETE,
      `Lesson: ${subject} — ${topic}`
    )
  }

  return NextResponse.json({
    reply,
    sessionId: session_record.id,
    hasApiKey,
  })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

  const sessions = await prisma.lessonSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      subject: true,
      topic: true,
      level: true,
      durationS: true,
      score: true,
      createdAt: true,
      goalId: true,
    },
  })

  return NextResponse.json({ sessions, hasApiKey })
}
