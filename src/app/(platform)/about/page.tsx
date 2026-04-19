import { ShieldCheck, Heart, Globe2, Lock, Database, Eye, Users, Code, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">About Human Flourishing Platform</h1>
            <p className="text-sm text-muted-foreground">Version 0.1.0 · Open Source</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardContent className="p-6">
          <p className="text-lg leading-relaxed">
            Nine interconnected systems for health, education, governance, energy, science,
            economics, infrastructure, and mental health — unified under a sovereignty-first
            identity layer where you own every byte of your data.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Why This Exists</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The current internet is built on a model where companies harvest your data, sell it to advertisers,
            and show you content designed to keep you scrolling. Your health data is locked in your doctor's system.
            Your education is locked in your school's system. Your civic participation is a vote every 4 years.
          </p>
          <p>
            This platform is different. Your health data belongs to you, not a hospital. Your education happens
            on your terms. Your civic participation is continuous. Truth is computed from data, not declared by
            authorities. And the code is open — anyone can verify nothing shady is happening.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Lock, title: "Privacy by Architecture", desc: "Your data is encrypted with AES-256-GCM. We can't read it even if we wanted to." },
            { icon: Database, title: "Data Sovereignty", desc: "Export everything. Delete everything. No lock-in. Your data goes where you go." },
            { icon: Eye, title: "Radical Transparency", desc: "Open source code. No hidden algorithms. No secret data collection." },
            { icon: Globe2, title: "Connected to Truth", desc: "Governance and economics modules connect to Aletheia's 30,000+ figure database." },
            { icon: Scale, title: "No Political Labels", desc: "Ideas evaluated on evidence, not team affiliation. Left/right doesn't exist here." },
            { icon: Heart, title: "Honesty Rewarded", desc: "Admitting you're wrong earns more credibility than being right. Self-correction is strength." },
            { icon: Users, title: "Community Owned", desc: "VOICE tokens give governance power to active participants, not shareholders." },
            { icon: Code, title: "Open Source Forever", desc: "Every line of code is public. Fork it, audit it, improve it. Truth belongs to everyone." },
          ].map((principle) => {
            const Icon = principle.icon
            return (
              <Card key={principle.title} className="card-hover">
                <CardContent className="p-4 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{principle.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{principle.desc}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "49", label: "Platform Pages" },
            { value: "62", label: "API Endpoints" },
            { value: "9", label: "Core Modules" },
            { value: "96", label: "Automated Tests" },
            { value: "30,726", label: "Public Figures (Aletheia)" },
            { value: "14,022", label: "Investigated Narratives" },
            { value: "6,471", label: "Funding Links" },
            { value: "57", label: "Data Importers" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-violet-600">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Connected to Aletheia</h2>
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Globe2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Aletheia Truth Protocol</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A database of 30,000+ public figures, 14,000+ investigated narratives, and 6,400+ funding connections.
                  Every narrative shows both supporting AND counter-evidence. The platform never tells you what to think —
                  it gives you data to decide. Connected to HFP's governance, economics, DeSci, and energy modules.
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  Aletheia (ἀλήθεια) — Greek for "truth as unhiddenness." We don't claim to know the truth. We remove the hiding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Built with conviction that human flourishing is not a feature — it's the entire point.
        Open source. Privacy first. Built for everyone.
      </p>
    </div>
  )
}
