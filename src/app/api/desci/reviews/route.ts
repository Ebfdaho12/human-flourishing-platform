import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { studyId, quality, rigor, comments } = await req.json()
  if (!studyId || !quality || !rigor || !comments) {
    return NextResponse.json({ error: "studyId, quality, rigor, and comments required" }, { status: 400 })
  }

  const study = await prisma.researchStudy.findFirst({ where: { id: studyId } })
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 })

  if (study.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot review your own study" }, { status: 400 })
  }

  const review = await prisma.peerReview.upsert({
    where: { studyId_userId: { studyId, userId: session.user.id } },
    create: { studyId, userId: session.user.id, quality, rigor, comments },
    update: { quality, rigor, comments },
  })

  await awardFound(session.user.id, `desci_review_${studyId}`, "DESCI", TOKEN_AWARDS.DESCI_PEER_REVIEW, "Peer review submitted")

  return NextResponse.json({ review }, { status: 201 })
}
