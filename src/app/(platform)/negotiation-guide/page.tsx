"use client"

import { useState } from "react"
import { DollarSign, Handshake, ChevronDown, Briefcase, Home, Car, Heart, CreditCard, Users, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

const principles: { term: string; tip: string; desc: string }[] = [
  { term: "BATNA", tip: "Best Alternative To a Negotiated Agreement — your walk-away option. The stronger your BATNA, the more power you hold", desc: "Your best alternative if this deal falls through. Never negotiate without one." },
  { term: "Anchoring", tip: "The first number spoken disproportionately shapes the entire negotiation. Whoever sets the anchor controls the range", desc: "The first number sets the range. Set it high (selling) or let them go first (buying)." },
  { term: "ZOPA", tip: "Zone Of Possible Agreement — the overlap between what the buyer will pay and what the seller will accept", desc: "The overlap where both sides can say yes. No ZOPA, no deal — walk away." },
  { term: "Information asymmetry", tip: "The party with more information has more leverage. Research is the single highest-ROI negotiation activity", desc: "Whoever knows more wins. Research everything before you sit down." },
  { term: "The power of silence", tip: "Most people cannot tolerate silence and will fill it with concessions. After making your ask, stop talking", desc: "State your position, then stop talking. Silence creates pressure they fill with concessions." },
  { term: "Never split the difference", tip: "Chris Voss's core principle: splitting the difference is lazy and leaves value on the table. Creative deals beat compromises", desc: "Compromise is lazy. Push for creative solutions that give both sides more." },
]

const scenarios: { title: string; icon: React.ReactNode; color: string; scripts: string[]; tips: string[] }[] = [
  {
    title: "Salary Negotiation",
    icon: <Briefcase className="h-4 w-4" />,
    color: "emerald",
    scripts: [
      "\"Based on my research and the value I bring, I'm targeting the $X-Y range.\"",
      "\"I'm excited about this role. Can you help me understand how you arrived at that number?\"",
      "\"If the base salary is firm, I'd love to explore a signing bonus, additional equity, remote flexibility, or extra PTO.\"",
    ],
    tips: [
      "Research market rate on Levels.fyi, Glassdoor, and Payscale before any conversation",
      "Never give the first number — let them anchor, then counter with data",
      "Negotiate beyond salary: signing bonus, equity, remote days, PTO, title, review timeline",
      "Get the offer in writing before accepting verbally",
      "The best time to negotiate is after they say they want you but before you say yes",
    ],
  },
  {
    title: "Rent Negotiation",
    icon: <Home className="h-4 w-4" />,
    color: "blue",
    scripts: [
      "\"I'd love to sign a longer lease. Would you consider $X for a 2-year commitment?\"",
      "\"I noticed [maintenance issue / age of unit / comparable listings at lower price]. Would you be open to adjusting the rent to reflect that?\"",
      "\"I'm a quiet, reliable tenant with great references. I'd like to stay long-term if we can find the right number.\"",
    ],
    tips: [
      "Research comparable units on Zillow, Apartments.com, and Craigslist within the same neighborhood",
      "Point out specific issues: deferred maintenance, appliance age, lack of updates",
      "Best times to negotiate: winter months, end of month, during high vacancy periods",
      "Offer something in return: longer lease, upfront payment, handling minor maintenance yourself",
      "A landlord's worst expense is turnover — use that leverage",
    ],
  },
  {
    title: "Car Buying",
    icon: <Car className="h-4 w-4" />,
    color: "amber",
    scripts: [
      "\"What's your best out-the-door price including all taxes and fees?\"",
      "\"I have quotes from three other dealerships. Can you beat $X?\"",
      "\"I'm ready to buy today if we can agree on the right number.\"",
    ],
    tips: [
      "Never negotiate monthly payment — always negotiate the total out-the-door price",
      "Get pre-approved for a loan from your bank or credit union before stepping on the lot",
      "Email 5+ dealers with the exact car spec and ask for their best price — let them compete",
      "Never go on weekends (less negotiation flexibility). Go on a weekday near end of month",
      "Be willing to walk away — they will call you back if there's margin",
      "Say no to every add-on in the finance office (extended warranty, paint protection, etc.)",
    ],
  },
  {
    title: "Medical Bills",
    icon: <Heart className="h-4 w-4" />,
    color: "red",
    scripts: [
      "\"Can I get an itemized bill with every charge broken out?\" (often drops 30-50%)",
      "\"Is there a cash-pay or self-pay discount available?\"",
      "\"Can we set up a no-interest payment plan?\"",
      "\"I'd like to discuss financial hardship options or charity care programs.\"",
    ],
    tips: [
      "Always request an itemized bill — vague charges often disappear when forced into specifics",
      "Negotiate before procedures when possible (especially elective or planned)",
      "Hospitals have financial assistance programs they rarely advertise — ask",
      "Medical debt in collections can often be settled for 20-40 cents on the dollar",
      "Never put medical bills on a credit card — you lose all negotiation leverage",
    ],
  },
  {
    title: "Subscriptions & Bills",
    icon: <CreditCard className="h-4 w-4" />,
    color: "violet",
    scripts: [
      "\"I've been a loyal customer for X years. I've found a better rate at [competitor]. Can you match or beat that?\"",
      "\"I'm considering cancelling. What can you offer to keep me?\"",
      "\"Is there a loyalty discount or promotional rate available for existing customers?\"",
    ],
    tips: [
      "Ask for the retention department — they have far more authority to offer discounts",
      "Call at the end of your billing cycle when they're most motivated to retain you",
      "Works for: cable, internet, insurance, phone plans, gym memberships, SaaS subscriptions",
      "Be polite but firm. The person on the phone didn't set the prices",
      "If the first rep can't help, hang up and call again — different reps have different authority",
    ],
  },
  {
    title: "Freelance & Business Rates",
    icon: <Users className="h-4 w-4" />,
    color: "stone",
    scripts: [
      "\"Based on the ROI this will generate for your business, the investment is $X.\"",
      "\"I can adjust the scope to fit a different budget. Which deliverables are highest priority?\"",
      "\"My rate reflects the quality and reliability you're getting. I'm happy to share references.\"",
    ],
    tips: [
      "Use value-based pricing, not hourly — tie your price to the outcome, not the time",
      "Anchor high. It's easier to come down than to go up",
      "Never discount without removing scope — train clients that discounts mean less work",
      "Present three tiers (bronze/silver/gold) to anchor the middle option as the obvious choice",
      "Require deposits. Clients who won't pay 50% upfront often won't pay at all",
    ],
  },
]

const vossTechniques: { name: string; tip: string; example: string }[] = [
  { name: "Mirroring", tip: "Repeat the last 1-3 words they said as a question. It makes them elaborate and feel heard", example: "Them: 'We just can't go that high.' You: 'Can't go that high?'" },
  { name: "Labeling", tip: "Name their emotion to defuse it and build trust. Start with 'It seems like...' or 'It sounds like...'", example: "\"It seems like you're under a lot of pressure to keep costs down.\"" },
  { name: "Calibrated Questions", tip: "Open-ended 'how' and 'what' questions that make the other side solve your problem for you", example: "\"How am I supposed to do that?\" / \"What does a good outcome look like for you?\"" },
  { name: "Tactical Empathy", tip: "Understand their feelings and perspective not to agree, but to gain leverage and build rapport", example: "\"I understand this isn't the number you were hoping to hear, and I respect the constraints you're working with.\"" },
]

const colorMap: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  emerald: { badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50/30", text: "text-emerald-600" },
  blue: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200", bg: "bg-blue-50/30", text: "text-blue-600" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200", bg: "bg-amber-50/30", text: "text-amber-600" },
  red: { badge: "bg-red-100 text-red-700", border: "border-red-200", bg: "bg-red-50/30", text: "text-red-600" },
  violet: { badge: "bg-violet-100 text-violet-700", border: "border-violet-200", bg: "bg-violet-50/30", text: "text-violet-600" },
  stone: { badge: "bg-stone-100 text-stone-700", border: "border-stone-200", bg: "bg-stone-50/30", text: "text-stone-600" },
}

export default function NegotiationGuidePage() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <Handshake className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">The Negotiation Playbook</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Everything in life is a negotiation. Most people leave money and opportunities on the table because nobody taught them how.
        </p>
      </div>

      {/* Core Principles */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Core Principles
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {principles.map(p => (
            <div key={p.term} className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-emerald-600"><Explain tip={p.tip}>{p.term}</Explain>:</strong> {p.desc}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scenarios */}
      {scenarios.map((s, si) => {
        const c = colorMap[s.color]
        const key = `scenario-${si}`
        const isOpen = open[key]
        return (
          <Card key={key} className={cn("transition-all cursor-pointer", isOpen && c.border)} onClick={() => toggle(key)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", c.badge)}>{s.icon}</span>
                <span className="text-sm font-semibold">{s.title}</span>
                <Badge variant="outline" className={cn("text-[9px] ml-auto", c.badge)}>{s.scripts.length} scripts</Badge>
              </div>
              {isOpen && (
                <div className={cn("mt-3 ml-8 space-y-3 rounded-lg p-3 text-xs leading-relaxed", c.bg)}>
                  <div>
                    <strong className={c.text}>Scripts:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">{s.scripts.map((sc, i) => <li key={i}>{sc}</li>)}</ul>
                  </div>
                  <div>
                    <strong className={c.text}>Tips:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">{s.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Chris Voss Techniques */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-emerald-500" /> Chris Voss Techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {vossTechniques.map(t => (
            <div key={t.name} className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-emerald-600"><Explain tip={t.tip}>{t.name}</Explain>:</strong> {t.example}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/car-buying" className="text-sm text-amber-600 hover:underline">Car Buying Guide</a>
        <a href="/financial-independence" className="text-sm text-emerald-600 hover:underline">Financial Independence</a>
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/mental-models" className="text-sm text-violet-600 hover:underline">Mental Models</a>
        <a href="/book-library" className="text-sm text-amber-600 hover:underline">Book Library</a>
      </div>
    </div>
  )
}