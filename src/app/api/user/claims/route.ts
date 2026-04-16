import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateClaim, encryptClaimValue, computeLeafHash, computeMerkleRoot } from "@/lib/claims"
import { awardFound } from "@/lib/tokens"
import { TOKEN_AWARDS } from "@/lib/constants"
import { CLAIM_TYPES } from "@/lib/claims"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const claims = await prisma.identityClaim.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  // Return claims without decrypting — client reveals on demand
  return NextResponse.json(claims.map((c) => ({
    id: c.id,
    claimType: c.claimType,
    displayLabel: c.displayLabel,
    isVerified: c.isVerified,
    verifiedAt: c.verifiedAt,
    leafIndex: c.leafIndex,
    createdAt: c.createdAt,
    // encryptedValue intentionally omitted from list view
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { claimType, value } = await req.json()
  if (!claimType || !value) return NextResponse.json({ error: "claimType and value required" }, { status: 400 })

  const typeEntry = CLAIM_TYPES.find((t) => t.value === claimType)
  if (!typeEntry) return NextResponse.json({ error: "Invalid claim type" }, { status: 400 })

  const validation = validateClaim(claimType, value)
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 })

  const encryptedValue = encryptClaimValue(value, session.user.id)
  const valueHash = computeLeafHash(claimType, value)

  // Count existing claims to assign leaf index
  const existingCount = await prisma.identityClaim.count({ where: { userId: session.user.id } })

  const claim = await prisma.identityClaim.upsert({
    where: { userId_claimType: { userId: session.user.id, claimType } },
    update: { encryptedValue, valueHash, displayLabel: typeEntry.label },
    create: {
      userId: session.user.id,
      claimType,
      displayLabel: typeEntry.label,
      leafIndex: existingCount,
      encryptedValue,
      valueHash,
    },
  })

  // Recompute Merkle root
  const allClaims = await prisma.identityClaim.findMany({ where: { userId: session.user.id } })
  const newRoot = computeMerkleRoot(allClaims.map((c) => ({ claimType: c.claimType, valueHash: c.valueHash })))
  await prisma.user.update({ where: { id: session.user.id }, data: { merkleRoot: newRoot } })

  // First claim award
  await awardFound(session.user.id, "first_claim", "FOUNDATION", TOKEN_AWARDS.FIRST_CLAIM, "Added first identity claim")

  // Profile complete award (if 4+ core claims present)
  const coreClaims = ["FULL_NAME", "DATE_OF_BIRTH", "EMAIL_ADDRESS", "RESIDENTIAL_REGION"]
  const userClaimTypes = allClaims.map((c) => c.claimType)
  const hasCoreClaims = coreClaims.every((t) => userClaimTypes.includes(t))
  if (hasCoreClaims) {
    await awardFound(session.user.id, "profile_complete", "FOUNDATION", TOKEN_AWARDS.PROFILE_COMPLETE, "Identity profile complete")
  }

  return NextResponse.json({ success: true, claimId: claim.id })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { claimId } = await req.json()
  await prisma.identityClaim.deleteMany({
    where: { id: claimId, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
}
