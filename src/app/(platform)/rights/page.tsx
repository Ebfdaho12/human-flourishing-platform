"use client"

import { useState } from "react"
import { Shield, ChevronDown, BookOpen, Scale, AlertTriangle, Globe2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CHARTER_RIGHTS = [
  {
    section: "Fundamental Freedoms (Section 2)",
    rights: [
      { right: "Freedom of conscience and religion", simple: "You can believe whatever you want — or believe nothing at all. No government can force a religion on you or punish you for your beliefs.", note: "This includes the right to practice any religion AND the right to practice no religion." },
      { right: "Freedom of thought, belief, opinion and expression", simple: "You can think, believe, and say what you want. This includes freedom of the press and other media. The government cannot punish you for your opinions.", note: "This is the most important right in a democracy. Without it, all other rights are meaningless — because you cannot even discuss whether they are being violated." },
      { right: "Freedom of peaceful assembly", simple: "You can gather with other people peacefully — protests, marches, rallies, meetings. The government cannot prevent you from assembling peacefully.", note: "Key word: PEACEFUL. This right does not protect violence or destruction. But peaceful protest — even loud, uncomfortable protest — is constitutionally protected." },
      { right: "Freedom of association", simple: "You can join any group, club, union, political party, or organization. The government cannot prevent you from associating with other people.", note: "This protects your right to form unions, join political parties, and organize collectively." },
    ],
  },
  {
    section: "Democratic Rights (Sections 3-5)",
    rights: [
      { right: "Right to vote", simple: "Every Canadian citizen has the right to vote in federal and provincial elections. Nobody can take this away.", note: "This applies even to prisoners (Supreme Court ruled in Sauvé v Canada, 2002)." },
      { right: "Maximum duration of Parliament: 5 years", simple: "The government MUST call an election within 5 years. They cannot stay in power indefinitely.", note: "This prevents dictatorship by requiring regular elections. Even in wartime, the maximum is 5 years (with 2/3 vote to extend)." },
      { right: "Annual sitting of Parliament", simple: "Parliament must sit at least once every 12 months. The government cannot simply refuse to meet.", note: "This ensures ongoing democratic accountability. Prorogation (suspending Parliament) has been controversial when used to avoid accountability." },
    ],
  },
  {
    section: "Legal Rights (Sections 7-14)",
    rights: [
      { right: "Life, liberty and security of the person (Section 7)", simple: "The government cannot take your life, your freedom, or your physical/psychological security except through fair legal processes.", note: "This is the broadest protection. Courts have used it to strike down laws on assisted dying, abortion, safe injection sites, and mandatory minimum sentences." },
      { right: "Right against unreasonable search and seizure (Section 8)", simple: "The police cannot search you, your home, your car, or your phone without a warrant or reasonable grounds. Your privacy is protected.", note: "This includes digital privacy. Police generally need a warrant to search your phone (R v Fearon, though exceptions exist)." },
      { right: "Right not to be arbitrarily detained (Section 9)", simple: "The police cannot arrest or detain you without a reason. They need legal grounds.", note: "Random stops and carding programs have been challenged under this section." },
      { right: "Rights on arrest (Section 10)", simple: "When arrested, you have the right to: (a) be told WHY you are being arrested, (b) get a lawyer immediately, (c) be told you have the right to a lawyer.", note: "You do not have to say anything. Anything you say can be used against you. Ask for a lawyer immediately." },
      { right: "Right to be presumed innocent (Section 11d)", simple: "You are innocent until PROVEN guilty. The government must prove you did something wrong — you do not have to prove you are innocent.", note: "The burden of proof is on the prosecution, not you. 'Beyond a reasonable doubt' is the highest standard of proof in law." },
      { right: "Right not to be subjected to cruel and unusual punishment (Section 12)", simple: "The government cannot punish you in ways that are excessively harsh, degrading, or disproportionate to the offense.", note: "This has been used to challenge mandatory minimum sentences, solitary confinement, and prison conditions." },
    ],
  },
  {
    section: "Equality Rights (Section 15)",
    rights: [
      { right: "Equal protection and equal benefit of the law", simple: "Every person is equal before the law regardless of race, national or ethnic origin, colour, religion, sex, age, or mental or physical disability.", note: "This does not mean everyone is treated identically — it means the law cannot discriminate against you based on these characteristics. Affirmative action programs are allowed under Section 15(2)." },
    ],
  },
  {
    section: "The Notwithstanding Clause (Section 33)",
    rights: [
      { right: "Government can override certain Charter rights for 5 years", simple: "Any federal or provincial government can pass a law that violates Sections 2 and 7-15 of the Charter by invoking Section 33. The override expires after 5 years but can be renewed.", note: "This is the most controversial section of the Charter. It means your fundamental rights can be legally overridden by a simple majority vote in any legislature. Quebec has used it for Bill 21 (religious symbols ban). Ontario threatened it for labor disputes. It exists because provinces would not agree to the Charter without it." },
    ],
  },
]

const US_BILL_OF_RIGHTS = [
  { amendment: "1st", right: "Freedom of speech, religion, press, assembly, petition", simple: "You can say what you want, believe what you want, print what you want, gather peacefully, and ask the government to fix problems.", note: "The most powerful protection in American law. Does not protect threats, incitement to violence, or fraud — but protects nearly everything else, including speech you disagree with." },
  { amendment: "2nd", right: "Right to keep and bear arms", simple: "Citizens have the right to own firearms. Originally tied to 'a well regulated Militia' but interpreted by the Supreme Court (2008) as an individual right.", note: "One of the most debated amendments. Both sides have legitimate arguments grounded in the text and history." },
  { amendment: "4th", right: "Protection against unreasonable searches and seizures", simple: "The police cannot search you, your home, or your belongings without a warrant (with limited exceptions). Your privacy is constitutionally protected.", note: "Digital privacy is an evolving area. Carpenter v US (2018) extended 4th Amendment protection to cell phone location data." },
  { amendment: "5th", right: "Right to due process, no self-incrimination, no double jeopardy", simple: "You cannot be forced to testify against yourself ('I plead the fifth'). You cannot be tried twice for the same crime. The government cannot take your property without compensation.", note: "The right to remain silent is one of the most important legal protections in existence." },
  { amendment: "6th", right: "Right to a speedy and public trial, right to a lawyer", simple: "If accused of a crime, you have the right to a fast trial, a jury, to know the charges, to confront witnesses, and to have a lawyer (even if you cannot afford one).", note: "The right to a public defender comes from this amendment (Gideon v Wainwright, 1963)." },
  { amendment: "8th", right: "No excessive bail or cruel and unusual punishment", simple: "The government cannot set impossibly high bail to keep you in jail before trial, and cannot punish you in cruel or extreme ways.", note: "What counts as 'cruel and unusual' evolves over time. The death penalty has been challenged under this amendment." },
  { amendment: "10th", right: "Powers not given to federal government belong to states or people", simple: "If the Constitution does not give a power to the federal government, that power belongs to the states or to the people. The federal government is LIMITED to what is written.", note: "This is the foundation of federalism — the idea that government should be decentralized." },
]

const THINGS_TO_KNOW = [
  "You do NOT have to talk to police beyond identifying yourself. In Canada, you must provide your name if lawfully stopped. Beyond that, you have the right to remain silent. Use it.",
  "You have the right to record police in public in both Canada and the US. They cannot make you stop or delete footage.",
  "Police can lie to you during interrogation. They can say they have evidence they do not have. They can say your friend confessed when they did not. Always get a lawyer.",
  "In Canada, the Charter only applies to GOVERNMENT action — not private companies. Your employer can restrict your speech at work. But the government cannot.",
  "In the US, the 1st Amendment only protects you from GOVERNMENT censorship. A private platform (Facebook, YouTube) can remove your content — it is their right as a private business.",
  "Knowing your rights is not about being difficult — it is about protecting yourself from a system that does not always act in your interest. The system is run by humans, and humans make mistakes and sometimes abuse power.",
  "Teach your children their rights. A teenager who knows they can remain silent and ask for a parent or lawyer is far safer than one who does not know.",
]

export default function RightsPage() {
  const [tab, setTab] = useState<"canada" | "us">("canada")
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-700">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Rights & Freedoms</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every right you have, explained simply. Rights you do not know about are rights you cannot exercise.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Why This Page Exists</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Most people cannot name their basic legal rights. This is not an accident — rights that people do not
            know about are rights they cannot exercise. This page puts every fundamental right in plain language
            so you and your family know exactly what protections you have. This is not legal advice — it is
            legal literacy. Know your rights before you need them.
          </p>
        </CardContent>
      </Card>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => { setTab("canada"); setExpanded(0) }}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px",
            tab === "canada" ? "border-red-500 text-red-700" : "border-transparent text-muted-foreground"
          )}>Canadian Charter</button>
        <button onClick={() => { setTab("us"); setExpanded(0) }}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px",
            tab === "us" ? "border-blue-500 text-blue-700" : "border-transparent text-muted-foreground"
          )}>US Bill of Rights</button>
      </div>

      {tab === "canada" ? (
        <div className="space-y-3">
          {CHARTER_RIGHTS.map((section, i) => {
            const isOpen = expanded === i
            return (
              <Card key={i} className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm font-semibold flex-1">{section.section}</p>
                    <Badge variant="outline" className="text-[9px]">{section.rights.length} rights</Badge>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                  {isOpen && (
                    <div className="mt-3 space-y-3 pl-8">
                      {section.rights.map((r, j) => (
                        <div key={j} className="rounded-lg border border-border p-3">
                          <p className="text-sm font-medium mb-1">{r.right}</p>
                          <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1.5 mb-1.5">
                            <strong>In plain language:</strong> {r.simple}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{r.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {US_BILL_OF_RIGHTS.map((a, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs bg-blue-500">{a.amendment} Amendment</Badge>
                  <p className="text-sm font-medium">{a.right}</p>
                </div>
                <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1.5 mb-1.5">
                  <strong>In plain language:</strong> {a.simple}
                </p>
                <p className="text-[10px] text-muted-foreground">{a.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Practical knowledge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Things Everyone Should Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {THINGS_TO_KNOW.map((fact, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
              <span>{fact}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> Canadian Charter of Rights and Freedoms (1982), Constitution Act. US Bill of Rights (1791).
            Supreme Court of Canada decisions. US Supreme Court decisions. This page provides legal education, not legal advice.
            If you need legal help, consult a licensed lawyer. Legal Aid is available for those who cannot afford a lawyer.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
        <a href="/logical-fallacies" className="text-sm text-red-600 hover:underline">Logical Fallacies</a>
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Civilizations</a>
      </div>
    </div>
  )
}
