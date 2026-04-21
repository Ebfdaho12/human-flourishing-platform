import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getWalletBalance } from "@/lib/tokens"
import { prisma } from "@/lib/prisma"
import { auditLog } from "@/lib/audit"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const wallet = await getWalletBalance(session.user.id)

    auditLog({ userId: session.user.id, action: "READ", resource: "wallet" })

    return NextResponse.json({
      foundBalance: wallet.foundBalance.toString(),
      voiceBalance: wallet.voiceBalance.toString(),
      stakedFound: wallet.stakedFound.toString(),
      stakeStartedAt: wallet.stakeStartedAt,
    })
  } catch (error) {
    console.error("[API] GET /api/wallet:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
