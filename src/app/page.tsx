import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight } from "lucide-react"
import { MODULES } from "@/lib/constants"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Human Flourishing Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" variant="gradient" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Open Source · Privacy First · Sovereignty by Design
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-6">
          A platform built for{" "}
          <span className="gradient-text">human flourishing</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl">
          Nine interconnected systems — health, education, governance, energy, science, economics,
          infrastructure, and mental health — unified under one sovereignty-first identity layer.
        </p>

        <div className="flex gap-4">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/register">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      {/* Modules grid */}
      <div className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest">
          9 Systems. 1 Platform.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.id} className="rounded-xl border border-border bg-card p-4">
                <div className={`mb-3 h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${mod.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium">{mod.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{mod.tagline}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
