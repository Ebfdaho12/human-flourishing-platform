"use client"
import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatFound, formatVoice } from "@/lib/utils"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WalletPage() {
  const { data: wallet, mutate } = useSWR("/api/wallet", fetcher)
  const [stakeAmount, setStakeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n
  const stakedFound = wallet ? BigInt(wallet.stakedFound) : 0n

  async function handleStake(action: "stake" | "unstake") {
    setLoading(true)
    setMessage("")
    const amount = action === "stake" ? BigInt(parseFloat(stakeAmount) * 1_000_000) : undefined

    const res = await fetch("/api/tokens/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, amount: amount?.toString() }),
    })
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your FOUND and VOICE token balances
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-600/5">
          <CardHeader className="pb-2">
            <CardDescription>FOUND Balance</CardDescription>
            <CardTitle className="text-3xl text-violet-400">{formatFound(foundBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Transferable utility token</p>
            {stakedFound > 0n && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatFound(stakedFound)} staked
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-blue-600/5">
          <CardHeader className="pb-2">
            <CardDescription>VOICE Balance</CardDescription>
            <CardTitle className="text-3xl text-indigo-400">{formatVoice(voiceBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Governance power · Non-transferable</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accrues by staking FOUND over time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staking */}
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
            <div className={`rounded-lg px-3 py-2 text-sm ${message.startsWith("Error") ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
              {message}
            </div>
          )}
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
            <Button variant="outline" onClick={() => handleStake("unstake")} disabled={loading}>
              Unstake {formatFound(stakedFound)} FOUND
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Transaction history</p>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/wallet/history">View all →</Link>
        </Button>
      </div>
    </div>
  )
}
