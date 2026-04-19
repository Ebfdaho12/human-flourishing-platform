import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck, ArrowRight, Heart, GraduationCap, Landmark, Zap, FlaskConical,
  TrendingUp, Building2, Brain, Lock, Eye, Database, Globe2, Users, Sparkles,
  CheckCircle, ChevronRight
} from "lucide-react"
import { MODULES } from "@/lib/constants"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm">Human Flourishing</span>
              <span className="text-xs text-muted-foreground ml-1">Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>

        <div className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 backdrop-blur px-4 py-2 text-xs text-violet-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Open Source · Privacy First · Your Data, Your Rules
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Nine systems for{" "}
            <span className="gradient-text">human flourishing</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Health intelligence. Socratic education. Governance transparency. Decentralized energy.
            Open science. Economic blueprints. All connected by a sovereignty-first identity layer
            that puts you in control of your data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 text-base px-8 h-12">
              <Link href="/register">
                Start your journey <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 text-base px-8 border-violet-200 hover:bg-violet-50">
              <Link href="/login">Sign in to dashboard</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-violet-500" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-violet-500" />
              <span>Zero-knowledge proofs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-violet-500" />
              <span>You own your data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">The Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nine interconnected systems</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each module works independently, but together they create a complete picture of human potential.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.id} className="group rounded-2xl border border-border bg-white/80 backdrop-blur p-5 card-hover">
                <div className={`mb-4 h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">{mod.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{mod.tagline}</p>
                <ul className="space-y-1.5">
                  {mod.capabilities.slice(0, 2).map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent via-violet-50/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps to sovereignty</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your identity",
                description: "Your decentralized identity (DID) is generated locally. No email required for core features. Your claims are encrypted with AES-256-GCM.",
                icon: ShieldCheck,
                color: "from-violet-500 to-purple-600",
              },
              {
                step: "02",
                title: "Track what matters",
                description: "Log health data, journal your mental health, learn with AI tutoring, track civic actions, run energy audits — all in one place, all yours.",
                icon: Heart,
                color: "from-rose-500 to-red-600",
              },
              {
                step: "03",
                title: "Earn & govern",
                description: "Every meaningful action earns FOUND tokens. Stake FOUND for VOICE — governance power over the platform itself. No rent-seeking middlemen.",
                icon: Sparkles,
                color: "from-amber-500 to-orange-600",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xs font-bold text-violet-600 mb-2">{item.step}</p>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">Our Principles</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built different, on purpose</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Privacy by architecture", desc: "Zero-knowledge proofs, encrypted claims, no tracking. We can't see your data even if we wanted to.", icon: Lock },
            { title: "Your data belongs to you", desc: "Export everything. Delete everything. No lock-in, no hostage data. CSV, JSON, or take the whole database.", icon: Database },
            { title: "AI as bridge, not destination", desc: "AI tutoring, health insights, and analysis tools. But the platform works fully without any API key — AI enhances, never gates.", icon: Sparkles },
            { title: "Connected to truth", desc: "Governance and economics modules connect to Aletheia's truth protocol — 14,000+ public figures, both sides of every issue.", icon: Globe2 },
            { title: "Token-aligned incentives", desc: "FOUND tokens for meaningful actions. VOICE governance power through staking. No pump-and-dump — utility drives value.", icon: TrendingUp },
            { title: "Open source forever", desc: "Every line of code is public. Fork it, audit it, improve it. Truth and human flourishing belong to everyone.", icon: Users },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-white/60 p-5 card-hover">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Aletheia connection */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">Powered by Truth</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Connected to Aletheia</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your governance and economics modules pull from Aletheia's truth protocol —
                14,000+ public figures, 800+ investigated narratives, credibility scores computed from data,
                funding links that follow the money. Both sides of every issue. We never tell you what to think.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-amber-800">
                <span className="rounded-full bg-amber-100 px-3 py-1">14,000+ public figures</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">800+ narratives</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">3,300+ funding links</span>
                <span className="rounded-full bg-amber-100 px-3 py-1">Both sides always</span>
              </div>
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/25">
              <Globe2 className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Free to start. Free to leave. Your data goes with you.
          </p>
          <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 text-base px-10 h-12">
            <Link href="/register">
              Create your identity <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Human Flourishing Platform</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Open source. Privacy first. Built for everyone.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
