import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MODULES } from "@/lib/constants"
import { ModuleGrid } from "@/components/dashboard/ModuleGrid"
import { ActivityFeed, ModuleStats } from "@/components/dashboard/ActivityFeed"
import { StreakWidget } from "@/components/dashboard/StreakWidget"
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn"
import { Discover } from "@/components/dashboard/Discover"
import { WhatsNew } from "@/components/dashboard/WhatsNew"
import { DailyRhythm } from "@/components/dashboard/DailyRhythm"
import { SmartSuggestions } from "@/components/dashboard/SmartSuggestions"
import { formatFound, formatVoice } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const wallet = await prisma.wallet.findUnique({ where: { userId: session!.user.id } })
  const profile = await prisma.userProfile.findUnique({ where: { userId: session!.user.id } })
  const claimCount = await prisma.identityClaim.count({ where: { userId: session!.user.id } })
  const activeCount = MODULES.filter((m) => m.status === "ACTIVE").length

  const foundBalance = wallet ? BigInt(wallet.foundBalance) : 0n
  const voiceBalance = wallet ? BigInt(wallet.voiceBalance) : 0n
  const displayName = profile?.displayName || session?.user?.email?.split("@")[0] || ""

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your platform for health, wealth, education, and human flourishing.
        </p>
        {!profile?.displayName && (
          <a href="/profile/edit" className="text-xs text-violet-600 hover:underline mt-1 block">Set your display name →</a>
        )}
      </div>

      {/* Daily rhythm — the core engagement loop */}
      <DailyRhythm />

      {/* Smart suggestions — personalized next actions */}
      <SmartSuggestions />

      {/* Daily check-in — mood + health quick log */}
      <DailyCheckIn />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="FOUND Balance" value={formatFound(foundBalance)} unit="FOUND" color="text-violet-500" />
        <StatCard label="VOICE Power" value={formatVoice(voiceBalance)} unit="VOICE" color="text-indigo-500" />
        <StatCard label="Identity Claims" value={claimCount.toString()} unit="claims" color="text-emerald-500" />
        <StatCard label="Active Modules" value={activeCount.toString()} unit={`of ${MODULES.length}`} color="text-amber-500" />
      </div>

      {/* Streaks + daily checklist */}
      <StreakWidget />

      {/* Quick access tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Quick Access</h2>
          <a href="/tools" className="text-xs text-violet-600 hover:underline">All 110+ tools →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: "/budget", label: "Budget", emoji: "💰" },
            { href: "/health", label: "Health", emoji: "❤️" },
            { href: "/planner", label: "Planner", emoji: "📋" },
            { href: "/family-meeting", label: "Family Meeting", emoji: "👨‍👩‍👧‍👦" },
            { href: "/notes", label: "Quick Notes", emoji: "📝" },
            { href: "/focus", label: "Focus Timer", emoji: "⏱️" },
            { href: "/mental-health", label: "Mental Health", emoji: "🧠" },
            { href: "/goals", label: "Goals", emoji: "🎯" },
          ].map(t => (
            <a key={t.href} href={t.href} className="rounded-xl border border-border bg-card p-3 hover:bg-accent/50 transition-colors flex items-center gap-2.5">
              <span className="text-lg">{t.emoji}</span>
              <span className="text-sm font-medium">{t.label}</span>
            </a>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {[
            { href: "/canada/index", label: "Canada Analysis", color: "text-red-600" },
            { href: "/community/hub", label: "Community", color: "text-violet-600" },
            { href: "/progress", label: "Your Progress", color: "text-emerald-600" },
            { href: "/knowledge-map", label: "Knowledge Map", color: "text-blue-600" },
            { href: "/family-economics", label: "Family Economics", color: "text-rose-600" },
            { href: "/financial-dashboard", label: "Financial Overview", color: "text-teal-600" },
          ].map(t => (
            <a key={t.href} href={t.href} className="rounded-lg border border-border px-3 py-2 hover:bg-accent/50 transition-colors text-center">
              <span className={`text-xs font-medium ${t.color}`}>{t.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* What's new — platform updates feed */}
      <WhatsNew />

      {/* Smart discovery — personalized recommendations */}
      <Discover />

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
