"use client"

import { Brain, Zap, Smartphone, TrendingDown, TrendingUp, Sun, Timer, ShoppingCart, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const supernormalStimuli = [
  { name: "Social media", spike: "Variable reward — same mechanism as slot machines", baseline: "Fragmented attention, anxiety, FOMO, reduced deep focus capacity" },
  { name: "Pornography", spike: "Unlimited novelty — Coolidge effect on demand", baseline: "Desensitization, escalation, reduced motivation for real-world connection" },
  { name: "Processed sugar", spike: "Rapid glucose spike triggers massive dopamine release", baseline: "Insulin resistance, energy crashes, increasing cravings over time" },
  { name: "Gambling / trading", spike: "Variable ratio reinforcement — the most addictive reward schedule known", baseline: "Compulsive behavior, financial ruin, inability to enjoy predictable rewards" },
  { name: "Drugs / alcohol", spike: "Direct neurotransmitter manipulation — 2x to 10x normal dopamine", baseline: "Physical dependence, tolerance requiring escalating doses, withdrawal" },
]

const healthyDopamine = [
  { source: "Cold exposure", boost: "+250% baseline (sustained 2-3 hrs)", color: "text-blue-700 bg-blue-50 border-blue-200", note: "Cold shower, ice bath. Sustained norepinephrine and dopamine elevation — no crash." },
  { source: "Exercise", boost: "+200% baseline", color: "text-emerald-700 bg-emerald-50 border-emerald-200", note: "Resistance training and intense cardio. Also increases dopamine receptor density over time." },
  { source: "Sunlight (AM)", boost: "+30-50% baseline", color: "text-amber-700 bg-amber-50 border-amber-200", note: "First 30 min of morning light. Sets circadian rhythm and primes dopamine circuits for the day." },
  { source: "Achievement / learning", boost: "Sustained elevation", color: "text-violet-700 bg-violet-50 border-violet-200", note: "Completing hard tasks. The dopamine comes from effort toward a goal, not the reward itself." },
  { source: "Music (with frisson)", boost: "+9-21% per peak", color: "text-rose-700 bg-rose-50 border-rose-200", note: "The chills you get from music. Dopamine release in the nucleus accumbens — same reward pathway as food and sex." },
]

export default function DopaminePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Dopamine & The Attention Economy</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Dopamine isn't the "pleasure molecule" — it's the motivation molecule. Understanding it changes how you see every habit, craving, and impulse you have.
        </p>
      </div>

      {/* What dopamine actually is */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-amber-600" /> What Dopamine Actually Is</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Dopamine drives wanting, not liking.</strong> It's released in anticipation of reward, not during the reward itself. This is why scrolling feels compelling but leaves you empty — the promise of something interesting keeps you going, but the payoff never satisfies.</p>
          <p><strong>Your <Explain tip="The resting level of dopamine in your brain. Higher baseline = more motivation, drive, and enjoyment of everyday life. Lower baseline = everything feels flat and boring.">dopamine baseline</Explain> determines your daily experience.</strong> High baseline: motivated, focused, enjoying ordinary things. Low baseline: bored, restless, needing stronger stimuli to feel anything. Every supernormal stimulus that spikes dopamine above baseline causes a proportional drop BELOW baseline afterward.</p>
          <p><strong>The pleasure-pain balance</strong> (Anna Lembke, <em>Dopamine Nation</em>): Your brain maintains homeostasis. Every spike is followed by a dip. The more intense and frequent the spikes, the lower your baseline drops. This is the mechanism behind tolerance — and it applies to behavior, not just substances.</p>
        </CardContent>
      </Card>

      {/* Supernormal Stimuli */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> <Explain tip="Artificially amplified versions of natural rewards. Like how junk food is a supernormal version of natural food — it hijacks circuits designed for survival.">Supernormal Stimuli</Explain> That Lower Your Baseline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {supernormalStimuli.map(s => (
            <div key={s.name} className="rounded-lg border p-3">
              <p className="text-sm font-semibold mb-1">{s.name}</p>
              <p className="text-xs text-amber-700"><strong>Spike:</strong> {s.spike}</p>
              <p className="text-xs text-red-700"><strong>Cost:</strong> {s.baseline}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground mt-1">This isn't a moral judgment. It's neurochemistry. These stimuli exploit circuits that evolved for survival — they are designed to be hard to resist.</p>
        </CardContent>
      </Card>

      {/* Attention Economy */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">The Attention Economy</p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Every app on your phone employs teams of engineers whose explicit job is to maximize the time you spend on it. This isn't conspiracy — it's their business model. Your attention is the product being sold to advertisers.</p>
            <p><strong>Techniques used:</strong> Variable ratio reinforcement (pull-to-refresh), social validation feedback loops (likes/hearts), infinite scroll (removing natural stopping cues), notification interrupts (breaking focus to re-engage), autoplay (eliminating the decision to continue).</p>
            <p><strong>The result:</strong> The average person checks their phone 96 times per day. Each check fragments attention. Deep work requires 23 minutes to re-enter a flow state. The math doesn't work.</p>
            <a href="/screen-time" className="text-amber-600 hover:underline flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> Deep dive: Screen Time</a>
          </div>
        </CardContent>
      </Card>

      {/* Healthy Dopamine */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Healthy Dopamine Sources</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {healthyDopamine.map(h => (
            <div key={h.source} className={cn("rounded-lg border p-3", h.color.split(" ").slice(1).join(" "))}>
              <div className="flex items-center gap-2 mb-1">
                <p className={cn("text-sm font-semibold", h.color.split(" ")[0])}>{h.source}</p>
                <Badge variant="outline" className="text-[9px]">{h.boost}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{h.note}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">Key difference: these raise your baseline without the crash. Cold exposure data from European Journal of Applied Physiology. Exercise data from Neuropsychopharmacology.</p>
        </CardContent>
      </Card>

      {/* Dopamine Reset Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Timer className="h-4 w-4 text-violet-600" /> Reset Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-semibold mb-1">24-48 Hour Reset</p>
            <p>Remove all high-dopamine inputs for 24-48 hours: no phone, no social media, no junk food, no music, no screens. Just exist. Walk, read physical books, journal, cook simple food. The first 12 hours are uncomfortable. By hour 24, ordinary things start feeling rewarding again. This works because you allow your dopamine receptors to upregulate.</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-semibold mb-1">Gradual Reduction (30-Day)</p>
            <p>More sustainable for most people. Week 1: remove notifications and set screen time limits. Week 2: replace one high-dopamine habit with exercise or cold exposure. Week 3: add a morning routine before any screen use. Week 4: evaluate what you actually miss vs. what was just compulsion. Most people find they miss very little.</p>
          </div>
        </CardContent>
      </Card>

      {/* Dopamine and Spending */}
      <Card className="border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-semibold text-orange-900">Dopamine & Your Finances</p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong>Impulse purchases are dopamine-driven.</strong> The excitement is in the anticipation and the click, not in owning the thing. This is why online shopping is more addictive than in-store — faster feedback loop, lower friction, variable discovery (recommendations).</p>
            <p><strong>The 48-hour rule:</strong> Wait 48 hours before any non-essential purchase over $50. By then, the dopamine surge has passed and you can evaluate with your prefrontal cortex instead of your nucleus accumbens.</p>
            <a href="/financial-independence" className="text-orange-600 hover:underline flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> See: Financial Independence Calculator</a>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/screen-time" className="text-sm text-amber-600 hover:underline">Screen Time</a>
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/financial-independence" className="text-sm text-emerald-600 hover:underline">Financial Independence</a>
        <a href="/cold-exposure" className="text-sm text-blue-600 hover:underline">Cold Exposure</a>
        <a href="/sleep-calculator" className="text-sm text-indigo-600 hover:underline">Sleep Calculator</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
      </div>
    </div>
  )
}
