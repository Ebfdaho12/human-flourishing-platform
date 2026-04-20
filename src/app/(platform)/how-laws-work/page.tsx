"use client"

import { useState } from "react"
import { Scale, ChevronDown, CheckCircle, ExternalLink, Users, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const BILL_STAGES = [
  {
    step: 1,
    stage: "The Idea",
    house: "Before Parliament",
    description: "A policy idea can originate from a minister, a backbench MP, a senator, a lobby group, a petition, or a citizen. Government bills originate in Cabinet. Private members' bills originate with individual MPs.",
    citizen: false,
  },
  {
    step: 2,
    stage: "Drafting",
    house: "Department of Justice",
    description: "Legislative drafters translate the policy idea into precise legal language. Government bills go through Cabinet approval. Private members' bills are drafted by the MP, sometimes with legal help.",
    citizen: false,
  },
  {
    step: 3,
    stage: "First Reading",
    house: "House of Commons",
    description: "The bill is formally introduced and given a number (C-### for Commons bills, S-### for Senate bills). The title is read. No debate. This is a procedural step — the bill now exists officially.",
    citizen: false,
  },
  {
    step: 4,
    stage: "Second Reading",
    house: "House of Commons",
    description: "Debate on the principle of the bill — should it exist at all? MPs speak for and against. Ends in a vote. If passed, the bill moves to committee. This is where media attention is highest.",
    citizen: false,
  },
  {
    step: 5,
    stage: "Committee Stage",
    house: "Standing Committee",
    description: "A small group of MPs study the bill in detail, hear from expert witnesses, and propose amendments (changes). This is where substantive changes happen. Committees hold public hearings — anyone can apply to testify.",
    citizen: true,
  },
  {
    step: 6,
    stage: "Report Stage",
    house: "House of Commons",
    description: "The committee reports back to the full House with any amendments. MPs can debate and vote on those amendments. Additional amendments can be proposed from the floor.",
    citizen: false,
  },
  {
    step: 7,
    stage: "Third Reading",
    house: "House of Commons",
    description: "Final debate and vote on the bill as amended. If it passes, it moves to the Senate. If defeated here, the bill dies.",
    citizen: false,
  },
  {
    step: 8,
    stage: "Senate Review",
    house: "Senate of Canada",
    description: "The Senate repeats First, Second, and Third Readings plus committee study. Senators may amend the bill. If they do, it returns to the Commons for approval of changes. This is called 'ping pong.'",
    citizen: true,
  },
  {
    step: 9,
    stage: "Royal Assent",
    house: "Governor General",
    description: "The Governor General (representing the King) formally signs the bill into law. It becomes an Act of Parliament. It may come into force immediately or on a date set by Cabinet (called 'proclamation').",
    citizen: false,
  },
]

const BILL_TYPES = [
  { type: "Government Bills (C-###)", description: "Introduced by Cabinet ministers. Carry the full weight of the government. Almost always pass if the government holds a majority. Most significant legislation comes from here." },
  { type: "Private Member's Bills (C-###)", description: "Introduced by backbench MPs (not ministers). Debated in limited time slots. Rarely pass without government support — but they can force a vote on an issue and create political pressure." },
  { type: "Senate Bills (S-###)", description: "Introduced by senators. Follow the same path in reverse — Senate first, then Commons. Less common for major legislation." },
]

const CITIZEN_ACTIONS = [
  { action: "Testify at Committee", how: "Contact the committee clerk. Request to appear as a witness. Prepare a 5-minute opening statement. This is the most direct way to put your argument on the official record." },
  { action: "Write Your MP", how: "Not email — a letter or a meeting request gets more attention. Be specific: name the bill by number, state exactly what you want changed, explain why. MPs track constituent contact volumes on issues." },
  { action: "Sign or Start a Petition", how: "E-petitions to the House of Commons require 500 signatures to be presented in Parliament and receive a government response. parl.ca/en/petitions has the form." },
  { action: "Public Consultations", how: "Before many bills are drafted, the government runs open consultations online. canada.ca/en/government/system/consultations has all active consultations." },
]

export default function HowLawsWorkPage() {
  const [openStage, setOpenStage] = useState<number | null>(null)
  const [openType, setOpenType] = useState<number | null>(null)
  const [openAction, setOpenAction] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
            <Scale className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold">How Laws Are Made (Canada)</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Every federal law in Canada follows this path. Understanding the process tells you exactly where — and how — citizens can actually change things.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> The 9 Stages of a Federal Bill</h2>
        {BILL_STAGES.map((s, i) => {
          const isOpen = openStage === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-red-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenStage(isOpen ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold text-sm shrink-0">{s.step}</span>
                  <div>
                    <p className="font-semibold">{s.stage}</p>
                    <p className="text-xs text-muted-foreground">{s.house}</p>
                  </div>
                  {s.citizen && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs">Citizen Entry Point</Badge>}
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm pt-3">{s.description}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Types of Bills</h2>
        {BILL_TYPES.map((b, i) => {
          const isOpen = openType === i
          return (
            <Card key={i}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenType(isOpen ? null : i)}
              >
                <p className="font-semibold text-sm">{b.type}</p>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm pt-3">{b.description}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5" /> How Citizens Can Actually Influence Legislation</h2>
        {CITIZEN_ACTIONS.map((a, i) => {
          const isOpen = openAction === i
          return (
            <Card key={i} className={cn("transition-all", isOpen && "ring-2 ring-green-500/30")}>
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenAction(isOpen ? null : i)}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="font-semibold text-sm">{a.action}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-4 px-5 border-t">
                  <p className="text-sm pt-3">{a.how}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><ExternalLink className="h-4 w-4" /> Where to Find Bills and Track Progress</h3>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">parl.ca</span> — official Parliament of Canada site. Search any bill by number or keyword.</li>
            <li><span className="font-semibold">legisinfo.parl.ca</span> — dedicated bill tracking. Shows every reading, vote, amendment, and committee stage.</li>
            <li><span className="font-semibold">ourcommons.ca</span> — find your MP, committee membership, and contact information.</li>
            <li><span className="font-semibold">canada.ca/en/government/system/consultations</span> — all open public consultations on upcoming policy.</li>
          </ul>
          <p className="text-xs text-muted-foreground">How to read a bill: the preamble states the purpose. Numbered sections are the operative law. "Notwithstanding" clauses override other laws. "Whereas" clauses in preambles are not legally binding — they're context only.</p>
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Related on this platform</p>
        <div className="flex flex-wrap gap-2">
          {[["Rights & Freedoms", "/rights"], ["Canada Guide", "/canada"], ["Critical Thinking", "/critical-thinking"], ["Community Resources", "/community-resources"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
