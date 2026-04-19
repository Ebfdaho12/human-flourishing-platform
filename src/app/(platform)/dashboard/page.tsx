import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MODULES } from "@/lib/constants"
import { ModuleGrid } from "@/components/dashboard/ModuleGrid"
import { ActivityFeed, ModuleStats } from "@/components/dashboard/ActivityFeed"
import { StreakWidget } from "@/components/dashboard/StreakWidget"
import { formatFound, formatVoice } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const wallet = await prisma.wallet.findUnique({ where: { userId: session!.user.id } })
  const claimCount = await prisma.identityClaim.count({ where: { userId: session!.user.id } })
  const activeCount = MODULES.filter((m) => m.status === "ACTIVE").length

  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your platform for health, education, and human flourishing.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="FOUND Balance" value={formatFound(foundBalance)} unit="FOUND" color="text-violet-500" />
        <StatCard label="VOICE Power" value={formatVoice(voiceBalance)} unit="VOICE" color="text-indigo-500" />
        <StatCard label="Identity Claims" value={claimCount.toString()} unit="claims" color="text-emerald-500" />
        <StatCard label="Active Modules" value={activeCount.toString()} unit={`of ${MODULES.length}`} color="text-amber-500" />
      </div>

      {/* Streaks + daily checklist */}
      <StreakWidget />

      {/* Module usage */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-3">Module Usage</p>
        <ModuleStats />
      </div>

      {/* Activity feed */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest actions across all modules</p>
        </div>
        <div className="p-2">
          <ActivityFeed />
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Modules</h2>
        <ModuleGrid />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  )
}
