"use client"

import { useState } from "react"
import { Lightbulb, ChevronDown, ArrowRight, Layers, Brain, ShieldAlert, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface Model {
  name: string
  summary: string
  howToUse: string
  example: string
}

const categories: { title: string; color: string; icon: React.ReactNode; models: Model[] }[] = [
  {
    title: "Decision Making",
    color: "blue",
    icon: <ArrowRight className="h-4 w-4" />,
    models: [
      { name: "First Principles Thinking", summary: "Break problems down to fundamental truths, then rebuild from there.", howToUse: "Ask 'What do I know to be absolutely true?' Strip away assumptions until you hit bedrock facts, then reason upward.", example: "Elon Musk calculated battery costs from raw materials ($80/kWh) instead of accepting the market price ($600/kWh). That insight launched Tesla's battery strategy." },
      { name: "Inversion", summary: "Instead of asking 'how do I succeed,' ask 'how would I guarantee failure — and avoid that.'", howToUse: "Flip the problem. List every way to fail, then systematically eliminate those failure modes.", example: "Charlie Munger's favorite model. Want a great marriage? List everything that destroys marriages (contempt, dishonesty, neglect) and avoid those." },
      { name: "Second-Order Thinking", summary: "'And then what?' Most people stop at first-order consequences.", howToUse: "After identifying the immediate effect, ask 'and then what happens?' at least two more times.", example: "Rent control (1st order: cheaper rent). 2nd order: landlords stop maintaining buildings. 3rd order: housing supply drops, prices rise elsewhere." },
      { name: "Probabilistic Thinking", summary: "Assign probabilities, not certainties. Update beliefs as new evidence arrives.", howToUse: "Estimate the likelihood of outcomes as percentages. When new information appears, update your estimates (Bayesian updating).", example: "A doctor who thinks 'there is a 70% chance this is condition A and 20% chance it is condition B' will run better tests than one who locks onto a single diagnosis." },
      { name: "Reversibility (Type 1/Type 2)", summary: "If a decision is reversible, decide fast. If irreversible, decide slow.", howToUse: "Classify every decision: Type 2 (reversible, two-way door) = move quickly. Type 1 (irreversible, one-way door) = deliberate carefully.", example: "Jeff Bezos: most decisions are Type 2. Launching a new product feature? Reversible — ship it fast. Selling the company? Irreversible — take your time." },
    ],
  },
  {
    title: "Understanding Systems",
    color: "emerald",
    icon: <Layers className="h-4 w-4" />,
    models: [
      { name: "Pareto Principle (80/20)", summary: "20% of inputs produce 80% of outputs. Find the 20%.", howToUse: "In any domain, identify which few inputs drive most results. Double down on those, cut or delegate the rest.", example: "20% of customers generate 80% of revenue. 20% of bugs cause 80% of crashes. 20% of your habits drive 80% of your results." },
      { name: "Feedback Loops", summary: "Positive loops amplify change; negative loops stabilize. Most systems have both.", howToUse: "Map the loops in any system. Ask: is this loop amplifying (growth, panic, viral spread) or stabilizing (thermostat, market corrections)?", example: "Social media: more engagement = more visibility = more engagement (positive loop). Your body temperature: too hot = sweat = cool down (negative loop)." },
      { name: "Compounding", summary: "Small consistent actions over time produce exponential results.", howToUse: "Find areas where gains build on previous gains. Be patient early, be amazed later. Works for money, health, knowledge, and relationships.", example: "$100/month at 10% annual return = $226,000 in 30 years. You contributed $36,000. Compounding added $190,000. Time is the variable." },
      { name: "Leverage", summary: "Find the smallest input that produces the largest output.", howToUse: "Ask: where can I apply a small force to get an outsized result? Code, media, capital, and labor are all forms of leverage.", example: "Archimedes: 'Give me a lever long enough and I shall move the world.' Software is the ultimate lever — write once, distribute to billions at zero marginal cost." },
      { name: "Map vs Territory", summary: "The model is not reality. All models are wrong, some are useful.", howToUse: "Always ask: am I looking at the thing itself or a representation of it? Financial models, org charts, and political labels are maps — not territory.", example: "A restaurant's menu (map) is not the food (territory). A company's org chart does not show you who actually has influence. GDP does not measure well-being." },
    ],
  },
  {
    title: "Avoiding Errors",
    color: "amber",
    icon: <ShieldAlert className="h-4 w-4" />,
    models: [
      { name: "Occam's Razor", summary: "The simplest explanation is usually correct. Don't add complexity unnecessarily.", howToUse: "When choosing between explanations, favor the one with fewer assumptions. Complexity should be added only when simplicity fails.", example: "Your friend didn't reply to your text. Occam's Razor: they are busy. Not: they secretly hate you and are plotting to end the friendship." },
      { name: "Hanlon's Razor", summary: "Never attribute to malice what is adequately explained by ignorance or incompetence.", howToUse: "Before assuming someone acted with bad intent, consider whether they simply didn't know better, made a mistake, or were careless.", example: "A colleague takes credit for your idea in a meeting. Hanlon's Razor: they may not have realized it was yours, rather than deliberately stealing it." },
      { name: "Circle of Competence", summary: "Know what you know and what you don't. Stay within your circle or expand it deliberately.", howToUse: "Map your areas of genuine expertise. Inside the circle: act decisively. Outside: seek experts, study, or abstain.", example: "Warren Buffett avoided tech stocks for decades — not because tech was bad, but because it was outside his circle. He only invested when he understood the business." },
      { name: "Survivorship Bias", summary: "You see the winners, not the losers. The failures are invisible.", howToUse: "When studying success, always ask: what about those who did the same thing and failed? Where are the missing data points?", example: "College dropout billionaires (Gates, Zuck) are famous. The millions of dropouts who struggled are not. Don't confuse surviving the odds with a strategy." },
      { name: "Regret Minimization", summary: "Project yourself to age 80 — will you regret NOT doing this?", howToUse: "For big decisions, ask: 'When I am 80 years old, will I regret not having tried this?' Minimize lifetime regret, not short-term discomfort.", example: "Jeff Bezos used this to leave a lucrative Wall Street job to start Amazon. 'I knew that when I was 80, I would never regret having tried.'" },
    ],
  },
  {
    title: "Understanding People",
    color: "violet",
    icon: <Users className="h-4 w-4" />,
    models: [
      { name: "Incentives", summary: "'Show me the incentives and I'll show you the outcome.' — Charlie Munger", howToUse: "Before trying to understand behavior, look at the incentive structure. People respond to incentives — often in ways the designer did not intend.", example: "Cobra bounty in colonial India: government paid for dead cobras. People bred cobras for the bounty. Incentives created the opposite of the intended outcome." },
      { name: "Social Proof", summary: "People do what others do. Powerful for good and dangerous for bad.", howToUse: "Recognize when you are following the crowd vs. thinking independently. Use social proof ethically (testimonials, case studies) and resist it when it misleads.", example: "Empty restaurant = avoided. Full restaurant = trusted. Nobody checked the food quality — they checked the crowd. Tip jars are seeded with cash for this reason." },
      { name: "Reciprocity", summary: "Give first, receive later. Works in every domain of human interaction.", howToUse: "Provide value before asking for anything. People feel compelled to return favors — this is one of the deepest human instincts.", example: "Free samples at grocery stores increase sales by 2,000%. The Hare Krishnas give you a flower, then ask for a donation. You feel obligated." },
      { name: "Status Games", summary: "Most human behavior is status-seeking. Understand it to see clearly.", howToUse: "When someone's behavior seems irrational, ask: what status are they trying to gain or protect? Status explains politics, fashion, social media, and most conflicts.", example: "A person buys a luxury car they can't afford. Economically irrational. Status-wise? They are buying perceived respect, belonging, and social ranking." },
      { name: "Fundamental Attribution Error", summary: "You judge others by their actions but yourself by your intentions.", howToUse: "When someone behaves badly, consider their situation before judging their character. Grant others the same context you give yourself.", example: "Someone cuts you off in traffic = 'terrible person.' You cut someone off = 'I didn't see them / I'm running late.' Same action, different attribution." },
    ],
  },
]

const colorMap: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  blue: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200", bg: "bg-blue-50/30", text: "text-blue-600" },
  emerald: { badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50/30", text: "text-emerald-600" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200", bg: "bg-amber-50/30", text: "text-amber-600" },
  violet: { badge: "bg-violet-100 text-violet-700", border: "border-violet-200", bg: "bg-violet-50/30", text: "text-violet-600" },
}

export default function MentalModelsPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Mental Models: The Thinking Toolkit</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          The best thinkers don't just think harder — they think with better tools.
        </p>
      </div>

      {/* Munger Quote */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "You've got to have models in your head. And you've got to array your experience on this latticework of models."
            <span className="not-italic font-semibold"> — Charlie Munger</span>
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.map(cat => {
        const c = colorMap[cat.color]
        return (
          <div key={cat.title} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", c.badge)}>{cat.icon}</span>
              <h2 className="text-sm font-bold">{cat.title}</h2>
              <Badge variant="outline" className={cn("text-[9px]", c.badge)}>{cat.models.length} models</Badge>
            </div>
            {cat.models.map((m, i) => {
              const key = `${cat.title}-${i}`
              const isOpen = open[key]
              return (
                <Card key={key} className={cn("transition-all cursor-pointer", isOpen && c.border)} onClick={() => toggle(key)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                      <span className="text-sm font-semibold">{m.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{m.summary}</p>
                    {isOpen && (
                      <div className={cn("mt-3 ml-6 space-y-2 rounded-lg p-3 text-xs leading-relaxed", c.bg)}>
                        <p><strong className={c.text}>How to use it:</strong> {m.howToUse}</p>
                        <p><strong className={c.text}>Real-life example:</strong> {m.example}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      })}

      {/* How to Use Mental Models */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> How to Use Mental Models
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>1. Collect them.</strong> Build your latticework over time. You don't need all 20 at once — start with the five that resonate most.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>2. Practice applying them.</strong> When you face a decision, explicitly ask: "Which <Explain tip="A mental model is a thinking tool — a reliable pattern or framework you can apply to understand situations and make better decisions">mental model</Explain> applies here?" Name it. Use it.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>3. Combine multiple models on the same problem.</strong> The real power comes from looking at one situation through multiple lenses. A business decision viewed through incentives + second-order thinking + inversion yields far better results than gut feeling alone.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The goal:</strong> develop a reflexive habit of reaching for the right model at the right time — until better thinking becomes automatic.
          </p>
        </CardContent>
      </Card>

      {/* Nav Links */}
      <div className="flex gap-3 flex-wrap">
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/scientific-literacy" className="text-sm text-blue-600 hover:underline">Scientific Literacy</a>
        <a href="/stoicism" className="text-sm text-stone-600 hover:underline">Stoicism</a>
        <a href="/decision-journal" className="text-sm text-violet-600 hover:underline">Decision Journal</a>
        <a href="/logical-fallacies" className="text-sm text-orange-600 hover:underline">Logical Fallacies</a>
      </div>
    </div>
  )
}
