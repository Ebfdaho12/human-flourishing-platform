import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { studyId, outcome, notes } = await req.json()
  if (!studyId || !outcome) return NextResponse.json({ error: "studyId and outcome required" }, { status: 400 })

  try {

    const study = await prisma.researchStudy.findFirst({ where: { id: studyId } })
    if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 })

    const replication = await prisma.replication.create({
      data: { studyId, userId: session.user.id, outcome, notes: notes ?? null },
    })

    await awardFound(session.user.id, `desci_rep_${replication.id}`, "DESCI", TOKEN_AWARDS.DESCI_REPLICATION, "Replication submitted")

    return NextResponse.json({ replication }, { status: 201 })

  } catch (error) {
    console.error("[API] POST /api/desci/replications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
