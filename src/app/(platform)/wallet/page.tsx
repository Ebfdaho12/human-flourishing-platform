"use client"
import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatFound, formatVoice, formatDateTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Coins, Vote, Lock, ArrowUpRight, ArrowDownRight, TrendingUp, Clock } from "lucide-react"
import { secureFetcher, encryptedPost } from "@/lib/encrypted-fetch"

const fetcher = secureFetcher

const TX_TYPE_LABELS: Record<string, string> = {
  EARN_CONTRIBUTION: "Earned",
  EARN_ONBOARDING: "Onboarding",
  EARN_GOVERNANCE: "Governance",
  STAKE: "Staked",
  UNSTAKE: "Unstaked",
  VOICE_ACCRUAL: "VOICE Accrued",
  VOICE_BURN: "VOICE Burned",
  SPEND_SERVICE: "Spent",
  ADMIN_ADJUSTMENT: "Adjustment",
}

export default function WalletPage() {
  const { data: wallet, mutate } = useSWR("/api/wallet", fetcher)
  const { data: txData } = useSWR("/api/wallet/transactions?page=1", fetcher)
  const [stakeAmount, setStakeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n
  const stakedFound = wallet ? BigInt(wallet.stakedFound) : 0n
  const transactions: any[] = txData?.transactions ?? []

  // Calculate earnings breakdown
  const earned = transactions.filter((tx) => BigInt(tx.amount) > 0n && tx.tokenType === "FOUND")
  const totalEarned = earned.reduce((sum, tx) => sum + BigInt(tx.amount), 0n)
  const earningsByModule: Record<string, bigint> = {}
  for (const tx of earned) {
    const mod = tx.moduleId ?? "ONBOARDING"
    earningsByModule[mod] = (earningsByModule[mod] ?? 0n) + BigInt(tx.amount)
  }

  async function handleStake(action: "stake" | "unstake") {
    setLoading(true)
    setMessage("")
    const amount = action === "stake" ? BigInt(parseFloat(stakeAmount) * 1_000_000) : undefined

    const res = await encryptedPost("/api/tokens/stake", { action, amount: amount?.toString() })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setMessage(`Error: ${data.error}`)
    } else {
      setMessage(action === "stake" ? "FOUND staked successfully" : "FOUND unstaked successfully")
      setStakeAmount("")
      mutate()
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your FOUND and VOICE token balances
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-violet-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">FOUND</p>
            </div>
            <p className="text-3xl font-bold text-violet-600">{formatFound(foundBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">Transferable utility token</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Vote className="h-4 w-4 text-indigo-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">VOICE</p>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{formatVoice(voiceBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">Governance power</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">STAKED</p>
            </div>
            <p className="text-3xl font-bold text-amber-600">{formatFound(stakedFound)}</p>
            <p className="text-xs text-muted-foreground mt-1">Earning VOICE over time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        {/* Activity */}
        <TabsContent value="activity" className="mt-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Complete activities in any module to earn FOUND tokens.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {transactions.slice(0, 15).map((tx: any) => {
                const amount = BigInt(tx.amount)
                const isCredit = amount > 0n
                const isFOUND = tx.tokenType === "FOUND"
                const absAmount = amount < 0n ? -amount : amount

                return (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", isCredit ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                        {isCredit ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {TX_TYPE_LABELS[tx.txType] ?? tx.txType} · {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", isCredit ? "text-emerald-600" : "text-red-500")}>
                        {isCredit ? "+" : "-"}
                        {isFOUND ? formatFound(absAmount) : formatVoice(absAmount)}
                      </p>
                      <Badge variant="outline" className="text-[10px] py-0">{tx.tokenType}</Badge>
                    </div>
                  </div>
                )
              })}
              {transactions.length > 15 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/wallet/history">View all transactions</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Staking */}
        <TabsContent value="staking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stake FOUND → Earn VOICE</CardTitle>
              <CardDescription>
                Stake your FOUND to earn VOICE governance power. Rate: 1 VOICE per 1,000 FOUND staked per 90 days.
                Unstaking burns all accrued VOICE.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && (
                <div className={cn("rounded-lg px-3 py-2 text-sm", message.startsWith("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200")}>
                  {message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Available to stake</p>
                  <p className="text-lg font-bold text-violet-600">{formatFound(foundBalance)}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Currently staked</p>
                  <p className="text-lg font-bold text-amber-600">{formatFound(stakedFound)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount to stake (FOUND)"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="1"
                  step="1"
                />
                <Button onClick={() => handleStake("stake")} disabled={loading || !stakeAmount}>
                  Stake
                </Button>
              </div>
              {stakedFound > 0n && (
                <Button variant="outline" onClick={() => handleStake("unstake")} disabled={loading} className="w-full">
                  Unstake {formatFound(stakedFound)} FOUND (burns VOICE)
                </Button>
              )}

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>How staking works:</strong> VOICE accrues linearly while your FOUND is staked.
                  1,000 FOUND staked for 90 days = 1 VOICE. VOICE is non-transferable governance power —
                  it gives you say in platform decisions. Unstaking returns your FOUND but burns accumulated VOICE.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings breakdown */}
        <TabsContent value="earnings" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Earnings Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-emerald-600">{formatFound(totalEarned)}</p>
                <p className="text-xs text-muted-foreground">Total FOUND earned</p>
              </div>

              {Object.entries(earningsByModule).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(earningsByModule)
                    .sort(([, a], [, b]) => Number(b - a))
                    .map(([mod, amount]) => (
                      <div key={mod} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 shrink-0 capitalize">{mod.toLowerCase().replace("_", " ")}</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            style={{ width: `${totalEarned > 0n ? Number((amount * 100n) / totalEarned) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-20 text-right">{formatFound(amount)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No earnings yet. Use platform modules to earn FOUND.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-violet-200 bg-violet-50/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">How to earn FOUND:</strong> Complete meaningful actions across any module.
                Log health data, do mood check-ins, complete tutoring sessions, pre-register studies, track civic actions,
                log energy production, and more. Every genuine contribution earns tokens.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
