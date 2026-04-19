import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Plus, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { AchievementsBadges } from "@/components/profile/AchievementsBadges"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { profile: true, claims: { orderBy: { leafIndex: "asc" } } },
  })

  const did = user?.didIdentifier ?? `did:fp:${user?.id}`
  const merkleRoot = user?.merkleRoot

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Identity</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your self-sovereign identity and verified credentials
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/profile/edit">
            <Plus className="h-4 w-4" /> Add claim
          </Link>
        </Button>
      </div>

      {/* DID Card */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-600/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-base">Decentralized Identity</CardTitle>
          </div>
          <CardDescription>
            Your DID is a placeholder for the ZK-proof identity layer (upgrade pending)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">DID Identifier</p>
            <code className="text-xs font-mono bg-secondary px-2 py-1 rounded break-all">{did}</code>
          </div>
          {merkleRoot && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Identity commitment root{" "}
                <span className="text-amber-400/70">(SHA-256 stub — Pedersen upgrade pending)</span>
              </p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded break-all text-muted-foreground">
                {merkleRoot}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Achievements</CardTitle>
          <CardDescription>Badges earned through genuine platform engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementsBadges />
        </CardContent>
      </Card>

      {/* Claims list */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Identity Claims ({user?.claims.length ?? 0})
        </h2>

        {user?.claims.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                No claims yet. Add your first claim to build your identity and earn 50 FOUND.
              </p>
              <Button asChild size="sm">
                <Link href="/profile/edit">Add first claim</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {user?.claims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {claim.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{claim.displayLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Leaf #{claim.leafIndex} · Added {formatDate(claim.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {claim.isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
