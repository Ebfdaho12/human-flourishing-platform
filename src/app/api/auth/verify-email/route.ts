import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

// POST /api/auth/verify-email  — generate token and send email
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // don't leak existence

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 })
  }

  // Invalidate any unexpired tokens for this user
  await prisma.emailVerification.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() }, // expire immediately
  })

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  await prisma.emailVerification.create({
    data: { userId: user.id, token, expiresAt },
  })

  await sendVerificationEmail(email, token)

  return NextResponse.json({ ok: true })
}

// GET /api/auth/verify-email?token=xxx  — confirm token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 })

  const record = await prisma.emailVerification.findUnique({ where: { token } })

  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  if (record.usedAt) return NextResponse.json({ error: "Token already used" }, { status: 400 })
  if (record.expiresAt < new Date()) return NextResponse.json({ error: "Token expired" }, { status: 400 })

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerification.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
