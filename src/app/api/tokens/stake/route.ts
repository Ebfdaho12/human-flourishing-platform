import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stakeFound, unstakeFound } from "@/lib/tokens"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, amount } = await req.json()

  try {
    if (action === "stake") {
      if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
      await stakeFound(session.user.id, BigInt(amount))
      return NextResponse.json({ success: true })
    } else if (action === "unstake") {
      await unstakeFound(session.user.id)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
