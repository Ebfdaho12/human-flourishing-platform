"use client"

import { Shield, Heart, Brain, Globe2, Users, Eye, Lock, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function WhyPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center pt-4">
        <h1 className="text-3xl font-bold">Why This Exists</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg mx-auto">
          Not a feature list. Not a pitch. The beliefs that built this platform — and why they matter for your life.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">

        <Card className="border-violet-200 bg-violet-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-violet-500" />
              <h2 className="text-base font-bold text-foreground">Your data belongs to you.</h2>
            </div>
            <p>
              Not to us. Not to advertisers. Not to governments. Every byte of data you create on this platform
              is yours to export, delete, or take with you. We encrypt what needs protecting. We never sell what
              you share. When the platform moves to blockchain, your data will be cryptographically yours — no
              company, including ours, will be able to access it without your keys.
            </p>
            <p className="mt-2">
              This is not a feature. It is a <strong>right</strong>.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">Transparency for power. Privacy for people.</h2>
            </div>
            <p>
              Every politician's vote should be public. Every lobbying dollar should be traceable. Every government
              contract should be auditable. Every media owner should be known. Power should be seen.
            </p>
            <p className="mt-2">
              But your health data, your family conversations, your financial situation, your beliefs, your
              struggles — these are yours alone. Privacy is not about hiding. It is about dignity. You share
              what you choose, when you choose, with whom you choose. Nobody else gets to decide.
            </p>
            <p className="mt-2">
              This is the paradox that makes the platform work: <strong>maximum transparency where power concentrates,
              maximum privacy where individuals live</strong>.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-bold text-foreground">We never tell you what to think.</h2>
            </div>
            <p>
              This platform presents data. It shows both sides. It explains how things work. It gives you tools
              to analyze, compare, and decide. What it never does — and never will — is tell you what to believe.
            </p>
            <p className="mt-2">
              No political labels. No left or right. No "experts say" without showing the data. No algorithms
              designed to make you angry or afraid. No feed optimized for engagement over truth.
            </p>
            <p className="mt-2">
              A person who can evaluate evidence, detect manipulation, and form independent conclusions is
              <strong> impossible to control</strong>. That is the point.
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-rose-500" />
              <h2 className="text-base font-bold text-foreground">The family is the foundation of everything.</h2>
            </div>
            <p>
              Every civilization that thrived invested in families. Every civilization that fell neglected them.
              The Harvard Study of Adult Development — 85 years of data — found that relationships are the single
              strongest predictor of health, happiness, and longevity. Stronger than income. Stronger than fame.
              Stronger than genetics.
            </p>
            <p className="mt-2">
              This platform exists to make families stronger. The financial tools give you control. The parenting
              guides give you knowledge. The family meeting gives you structure. The screen time tracker gives you
              awareness. The family economics page gives you options. The birth fund gives your children a future
              from day one.
            </p>
            <p className="mt-2">
              <strong>A strong family produces strong individuals who build strong communities who create strong nations.</strong> Everything starts at home.
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-bold text-foreground">Built for 1,000 years.</h2>
            </div>
            <p>
              Most software is built to sell in 5 years. This platform is built to serve humanity for as long
              as humans exist. The Netherlands built dams to withstand 10,000-year floods. Norway built a wealth
              fund that will outlast the oil. We build tools that outlast any single team, company, or government.
            </p>
            <p className="mt-2">
              That is why decentralization matters. When the platform runs on blockchain — on thousands of devices
              contributed by users around the world — no single entity can shut it down, censor it, or capture it.
              The truth database cannot be deleted. The governance cannot be overridden. The tokens cannot be inflated.
              The data cannot be stolen.
            </p>
            <p className="mt-2">
              <strong>Not because we are paranoid. Because we are building for your grandchildren's grandchildren.</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-bold text-foreground">You are not a product.</h2>
            </div>
            <p>
              On Facebook, you are the product — your attention sold to advertisers. On Google, your searches
              fund an advertising empire. On Instagram, your insecurity drives engagement metrics.
            </p>
            <p className="mt-2">
              Here, there are no ads. No tracking pixels. No attention harvesting. No dark patterns.
              The platform is funded by token economics — the value flows to the people who use it and
              build it, not to shareholders who extract from it.
            </p>
            <p className="mt-2">
              When a platform is free, you are the product. When a platform pays YOU (FOUND tokens for
              participation, node rewards for contributing hardware), the incentives are aligned.
              <strong> You succeed when the platform succeeds. The platform succeeds when you succeed.</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <h2 className="text-base font-bold text-foreground">Small steps compound into extraordinary lives.</h2>
            </div>
            <p>
              You do not need to use every tool on this platform. You do not need to understand every concept.
              You do not need to optimize every area of your life. You need to do one thing today. And one thing
              tomorrow. And one thing the day after.
            </p>
            <p className="mt-2">
              A person who tracks their budget for 30 days sees their money differently forever. A person who
              does one family meeting sees their family differently. A person who reads about how civilizations
              fall sees their country differently. A person who teaches their child about money sees their child's
              future differently.
            </p>
            <p className="mt-2">
              <strong>Consistency beats intensity. Every time. Start small. Start today. The compound effect will
              take care of the rest.</strong>
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          This platform is open source. The code is public. The data importers are documented. The token
          economics are transparent. The governance will be democratic. We build in the open because we have
          nothing to hide. Treat every line as if existence depends on it.
        </p>
      </div>
    </div>
  )
}
