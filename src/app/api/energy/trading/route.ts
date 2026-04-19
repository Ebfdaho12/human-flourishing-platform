import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * P2P Energy Trading Simulation
 *
 * GET /api/energy/trading — get market state and user's position
 * POST /api/energy/trading — place a buy/sell order
 *
 * This simulates a peer-to-peer energy marketplace where:
 * - Producers list surplus energy at their price
 * - Consumers buy at market rates
 * - Smart matching finds the best price
 * - Settlement happens in FOUND tokens
 */

// Simulated market state (in production this would be a database table)
function getMarketState(userLogs: any[]) {
  const produced = userLogs.filter(l => l.logType === "PRODUCTION")
  const consumed = userLogs.filter(l => l.logType === "CONSUMPTION")
  const totalProduced = produced.reduce((s, l) => s + l.amountKwh, 0)
  const totalConsumed = consumed.reduce((s, l) => s + l.amountKwh, 0)
  const surplus = Math.max(0, totalProduced - totalConsumed)
  const deficit = Math.max(0, totalConsumed - totalProduced)

  // Simulated market prices based on supply/demand
  const basePrice = 0.12 // $/kWh
  const renewablePremium = 1.15 // 15% premium for verified renewable
  const peakMultiplier = 1.8

  const renewableKwh = produced.filter(l => ["SOLAR", "WIND", "HYDRO"].includes(l.sourceType)).reduce((s, l) => s + l.amountKwh, 0)
  const renewablePct = totalProduced > 0 ? (renewableKwh / totalProduced) * 100 : 0

  return {
    userPosition: {
      totalProduced: Math.round(totalProduced * 10) / 10,
      totalConsumed: Math.round(totalConsumed * 10) / 10,
      surplus: Math.round(surplus * 10) / 10,
      deficit: Math.round(deficit * 10) / 10,
      renewablePct: Math.round(renewablePct),
      canSell: surplus > 0,
      canBuy: true,
    },
    market: {
      currentPrice: Math.round(basePrice * 100) / 100,
      renewablePrice: Math.round(basePrice * renewablePremium * 100) / 100,
      peakPrice: Math.round(basePrice * peakMultiplier * 100) / 100,
      totalListings: Math.floor(Math.random() * 20) + 5,
      totalVolume: Math.round((Math.random() * 500 + 100) * 10) / 10,
      avgPrice: Math.round((basePrice + Math.random() * 0.04) * 100) / 100,
      lowestAsk: Math.round((basePrice - 0.02 + Math.random() * 0.01) * 100) / 100,
      highestBid: Math.round((basePrice + 0.02 + Math.random() * 0.01) * 100) / 100,
    },
    recentTrades: [
      { type: "SELL", kwh: 12.5, price: 0.13, source: "SOLAR", time: "2 min ago" },
      { type: "BUY", kwh: 8.0, price: 0.11, source: "WIND", time: "5 min ago" },
      { type: "SELL", kwh: 25.0, price: 0.14, source: "SOLAR", time: "12 min ago" },
      { type: "BUY", kwh: 15.2, price: 0.12, source: "GRID", time: "18 min ago" },
      { type: "SELL", kwh: 5.8, price: 0.15, source: "HYDRO", time: "25 min ago" },
    ],
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}:00`,
      price: Math.round((0.10 + Math.sin(i / 4) * 0.03 + Math.random() * 0.02) * 100) / 100,
    })).reverse(),
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.user.id },
    select: { logType: true, sourceType: true, amountKwh: true, pricePerKwh: true },
  })

  const state = getMarketState(logs)
  return NextResponse.json(state)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, kwh, pricePerKwh } = await req.json()

  if (!action || !kwh || !pricePerKwh) {
    return NextResponse.json({ error: "action, kwh, and pricePerKwh required" }, { status: 400 })
  }

  if (!["BUY", "SELL"].includes(action)) {
    return NextResponse.json({ error: "action must be BUY or SELL" }, { status: 400 })
  }

  // In production: create order, match with counterparty, settle in FOUND tokens
  // For now: simulate instant fill
  const totalCost = Math.round(kwh * pricePerKwh * 100) / 100
  const foundReward = Math.round(kwh * 2) // 2 FOUND per kWh traded

  return NextResponse.json({
    order: {
      action,
      kwh,
      pricePerKwh,
      totalCost,
      status: "FILLED",
      foundReward,
    },
    message: `${action === "SELL" ? "Sold" : "Bought"} ${kwh} kWh at $${pricePerKwh}/kWh ($${totalCost} total). Earned ${foundReward} FOUND.`,
  })
}
