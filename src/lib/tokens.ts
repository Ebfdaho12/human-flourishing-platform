import { prisma } from "./prisma"

export async function awardFound(
  userId: string,
  activityKey: string,
  moduleId: string,
  amount: bigint,
  description?: string
): Promise<{ alreadyAwarded: boolean }> {
  // Idempotency: if already awarded for this activity, no-op
  const existing = await prisma.moduleActivity.findUnique({
    where: { userId_moduleId_activityKey: { userId, moduleId, activityKey } },
  })
  if (existing) return { alreadyAwarded: true }

  await prisma.$transaction(async (tx) => {
    // Ensure wallet exists
    let wallet = await tx.wallet.findUnique({ where: { userId } })
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { userId } })
    }

    const newBalance = wallet.foundBalance + amount

    await tx.wallet.update({
      where: { userId },
      data: { foundBalance: newBalance },
    })

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        tokenType: "FOUND",
        amount,
        balanceAfter: newBalance,
        txType: "EARN_CONTRIBUTION",
        description: description ?? `Reward: ${activityKey}`,
        moduleId,
      },
    })

    await tx.moduleActivity.create({
      data: { userId, moduleId, activityKey, foundAwarded: amount },
    })
  })

  return { alreadyAwarded: false }
}

export async function getWalletBalance(userId: string) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId } })
  }

  const pendingVoice = computePendingVoice(wallet)

  // Auto-credit VOICE if ≥ 1 unit pending
  if (pendingVoice >= 1n) {
    await prisma.$transaction(async (tx) => {
      const newVoiceBalance = wallet!.voiceBalance + pendingVoice
      await tx.wallet.update({
        where: { id: wallet!.id },
        data: { voiceBalance: newVoiceBalance, stakeStartedAt: new Date() },
      })
      await tx.transaction.create({
        data: {
          walletId: wallet!.id,
          tokenType: "VOICE",
          amount: pendingVoice,
          balanceAfter: newVoiceBalance,
          txType: "VOICE_ACCRUAL",
          description: "VOICE accrued from staked FOUND",
        },
      })
    })
    wallet = await prisma.wallet.findUnique({ where: { userId } })!
  }

  return wallet!
}

export function computePendingVoice(wallet: {
  stakedFound: bigint
  stakeStartedAt: Date | null
  voiceBalance: bigint
}): bigint {
  if (!wallet.stakeStartedAt || wallet.stakedFound === 0n) return 0n
  const msStaked = Date.now() - wallet.stakeStartedAt.getTime()
  const daysStaked = BigInt(Math.floor(msStaked / (1000 * 60 * 60 * 24)))
  // 1 VOICE per 1000 FOUND staked per 90 days
  return (wallet.stakedFound * daysStaked) / (1_000_000_000n * 90n)
}

export async function stakeFound(userId: string, amount: bigint): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } })
    if (!wallet) throw new Error("Wallet not found")
    if (wallet.foundBalance < amount) throw new Error("Insufficient FOUND balance")

    const newFoundBalance = wallet.foundBalance - amount
    const newStaked = wallet.stakedFound + amount

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        foundBalance: newFoundBalance,
        stakedFound: newStaked,
        stakeStartedAt: wallet.stakeStartedAt ?? new Date(),
      },
    })
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        tokenType: "FOUND",
        amount: -amount,
        balanceAfter: newFoundBalance,
        txType: "STAKE",
        description: `Staked ${amount / 1_000_000n} FOUND for VOICE accrual`,
      },
    })
    await tx.stakingEvent.create({
      data: { walletId: wallet.id, eventType: "STAKE", amount },
    })
  })
}

/**
 * Graduated VOICE burn on unstake:
 * - Staked < 90 days: burn 90% of VOICE
 * - Staked 90-180 days: burn 70%
 * - Staked 180-365 days: burn 50%
 * - Staked 1-2 years: burn 30%
 * - Staked 3+ years: burn 10%
 *
 * This rewards loyalty — the longer you've been committed,
 * the more governance power you keep when you leave.
 */
export async function unstakeFound(userId: string): Promise<{ voiceKept: bigint; voiceBurned: bigint }> {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } })
    if (!wallet) throw new Error("Wallet not found")
    if (wallet.stakedFound === 0n) throw new Error("Nothing staked")

    const amount = wallet.stakedFound
    const newFoundBalance = wallet.foundBalance + amount

    // Calculate graduated burn rate based on staking duration
    let burnRate = 90 // default: burn 90%
    if (wallet.stakeStartedAt) {
      const daysStaked = Math.floor((Date.now() - wallet.stakeStartedAt.getTime()) / 86400000)
      if (daysStaked >= 1095) burnRate = 10      // 3+ years: keep 90%
      else if (daysStaked >= 730) burnRate = 20   // 2+ years: keep 80%
      else if (daysStaked >= 365) burnRate = 30   // 1+ year: keep 70%
      else if (daysStaked >= 180) burnRate = 50   // 6+ months: keep 50%
      else if (daysStaked >= 90) burnRate = 70    // 3+ months: keep 30%
      // < 90 days: keep only 10%
    }

    const voiceBurned = (wallet.voiceBalance * BigInt(burnRate)) / 100n
    const voiceKept = wallet.voiceBalance - voiceBurned

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        foundBalance: newFoundBalance,
        stakedFound: 0n,
        stakeStartedAt: null,
        voiceBalance: voiceKept,
      },
    })

    // Log FOUND return
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        tokenType: "FOUND",
        amount,
        balanceAfter: newFoundBalance,
        txType: "UNSTAKE",
        description: `Unstaked ${amount / 1_000_000n} FOUND`,
      },
    })

    // Log VOICE burn
    if (voiceBurned > 0n) {
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          tokenType: "VOICE",
          amount: -voiceBurned,
          balanceAfter: voiceKept,
          txType: "VOICE_BURN",
          description: `${burnRate}% VOICE burned on unstake (${100 - burnRate}% retained for loyalty)`,
        },
      })
    }

    await tx.stakingEvent.create({
      data: { walletId: wallet.id, eventType: "UNSTAKE", amount },
    })

    return { voiceKept, voiceBurned }
  })
}
