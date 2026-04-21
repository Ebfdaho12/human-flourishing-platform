import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    return NextResponse.json({
      id: user?.id,
      email: user?.email,
      didIdentifier: user?.didIdentifier,
      merkleRoot: user?.merkleRoot,
      profile: user?.profile,
      createdAt: user?.createdAt,
    })

  } catch (error) {
    console.error("[API] GET /api/user/profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const data = await req.json()
    const allowed = ["displayName", "bio", "avatarUrl", "location", "timezone", "profileVisibility"]
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    )

    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: filtered,
      create: { userId: session.user.id, ...filtered },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[API] PATCH /api/user/profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
