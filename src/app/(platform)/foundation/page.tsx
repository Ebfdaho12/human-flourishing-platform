import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CheckCircle, Circle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatFound } from "@/lib/utils"
import { TOKEN_AWARDS } from "@/lib/constants"

export default async function FoundationPage() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { profile: true, claims: true, wallet: true },
  })

  const foundBalance = user?.wallet ? BigInt(user.wallet.foundBalance) : 0n
  const claimCount = user?.claims.length ?? 0

  const checklist = [
    {
      key: "account_created",
      label: "Create account",
      done: true,
      reward: TOKEN_AWARDS.ACCOUNT_CREATED,
      href: null,
    },
    {
      key: "first_claim",
      label: "Add first identity claim",
      done: claimCount > 0,
      reward: TOKEN_AWARDS.FIRST_CLAIM,
      href: "/profile/edit",
    },
    {
      key: "profile_complete",
      label: "Complete identity profile (4+ core claims)",
      done: claimCount >= 4,
      reward: TOKEN_AWARDS.PROFILE_COMPLETE,
      href: "/profile/edit",
    },
  ]

  const completedSteps = checklist.filter((s) => s.done).length
  const progress = Math.round((completedSteps / checklist.length) * 100)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Foundation Protocol</h1>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Your sovereignty layer — identity, wallet, and credentials
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">FOUND Balance</p>
            <p className="text-xl font-bold text-violet-400">{formatFound(foundBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Identity Claims</p>
            <p className="text-xl font-bold text-emerald-400">{claimCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Setup Progress</p>
            <p className="text-xl font-bold text-amber-400">{progress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Getting started</CardTitle>
          <CardDescription>
            Complete these steps to build your identity and earn FOUND tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((step) => (
            <div
              key={step.key}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={`text-sm ${step.done ? "line-through text-muted-foreground" : ""}`}>
                  {step.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-400">
                  +{formatFound(step.reward)} FOUND
                </span>
                {!step.done && step.href && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={step.href}>Go →</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* DID info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Decentralized Identity</CardTitle>
          <CardDescription>
            Your DID is the key to the entire platform. Every module uses it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">DID Identifier</p>
            <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block">
              {user?.didIdentifier ?? `did:fp:${user?.id}`}
            </code>
          </div>
          {user?.merkleRoot && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Merkle root (identity commitment)</p>
              <code className="text-xs font-mono bg-secondary px-2 py-1 rounded block text-muted-foreground break-all">
                {user.merkleRoot}
              </code>
            </div>
          )}
          <Button variant="outline" size="sm" asChild className="mt-2">
            <Link href="/profile">
              <ExternalLink className="h-3 w-3" /> Manage identity
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
