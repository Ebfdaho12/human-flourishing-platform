import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = 20

    const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
    if (!wallet) return NextResponse.json({ transactions: [], total: 0 })

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { walletId: wallet.id } }),
    ])

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toString(),
        balanceAfter: t.balanceAfter.toString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[API] GET /api/wallet/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
