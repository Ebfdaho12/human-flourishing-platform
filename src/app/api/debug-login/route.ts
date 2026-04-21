import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as argon2 from "argon2"

/**
 * TEMPORARY: Test login endpoint to debug auth issues
 * DELETE THIS after fixing the login problem
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase()?.trim() } })

    if (!user) {
      return NextResponse.json({ step: "user_lookup", found: false, email: email?.toLowerCase()?.trim() })
    }

    let valid = false
    let verifyError = null
    try {
      valid = await argon2.verify(user.passwordHash, password)
    } catch (e: any) {
      verifyError = e.message
    }

    return NextResponse.json({
      step: "verify",
      userFound: true,
      userEmail: user.email,
      hashPrefix: user.passwordHash.substring(0, 30),
      passwordValid: valid,
      verifyError,
      argon2Version: typeof argon2.verify,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 200) }, { status: 500 })
  }
}
