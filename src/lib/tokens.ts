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

export async function unstakeFound(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } })
    if (!wallet) throw new Error("Wallet not found")
    if (wallet.stakedFound === 0n) throw new Error("Nothing staked")

    const amount = wallet.stakedFound
    const newFoundBalance = wallet.foundBalance + amount

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        foundBalance: newFoundBalance,
        stakedFound: 0n,
        stakeStartedAt: null,
      },
    })
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
    await tx.stakingEvent.create({
      data: { walletId: wallet.id, eventType: "UNSTAKE", amount },
    })
  })
}
