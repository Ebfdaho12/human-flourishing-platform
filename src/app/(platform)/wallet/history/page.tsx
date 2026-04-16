"use client"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { formatFound, formatVoice, formatDateTime } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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

export default function TransactionHistoryPage() {
  const { data } = useSWR("/api/wallet/transactions?page=1", fetcher)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/wallet"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-xl font-bold">Transaction History</h1>
      </div>

      {!data ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : data.transactions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No transactions yet.</p>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((tx: any) => {
            const amount = BigInt(tx.amount)
            const isCredit = amount > 0n
            const isFOUND = tx.tokenType === "FOUND"

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {TX_TYPE_LABELS[tx.txType] ?? tx.txType} · {formatDateTime(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                    {isCredit ? "+" : ""}
                    {isFOUND ? formatFound(amount < 0n ? -amount : amount) : formatVoice(amount < 0n ? -amount : amount)}
                    {" "}{tx.tokenType}
                  </p>
                  <Badge variant="outline" className="text-[10px]">{tx.tokenType}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
