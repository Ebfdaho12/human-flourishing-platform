import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import * as argon2 from "argon2"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit, rateLimitResponse, validatePassword } from "@/lib/security"

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 registrations per IP per minute
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"
    if (!rateLimit(`register:${ip}`, 5, 60000)) {
      return NextResponse.json(rateLimitResponse(), { status: 429 })
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await argon2.hash(password)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          didIdentifier: `did:fp:${Date.now().toString(36)}`,
          profile: { create: {} },
          wallet: { create: {} },
        },
      })
      return newUser
    })

    // Award onboarding FOUND (idempotent)
    await awardFound(
      user.id,
      "account_created",
      "FOUNDATION",
      TOKEN_AWARDS.ACCOUNT_CREATED,
      "Welcome to the Human Flourishing Platform"
    )

    // Send verification email (fire-and-forget; don't block registration)
    try {
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.emailVerification.create({ data: { userId: user.id, token, expiresAt } })
      await sendVerificationEmail(normalizedEmail, token)
    } catch (emailErr) {
      console.warn("Failed to send verification email:", emailErr)
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
