import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { moduleId } = await req.json()
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 })

  try {

    await prisma.moduleInterest.upsert({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
      update: {},
      create: { userId: session.user.id, moduleId },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[API] POST /api/modules/interest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
