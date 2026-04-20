"use client"

import { useState } from "react"
import { Radio, ChevronDown, Globe2, AlertTriangle, Building2, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const US_MEDIA = [
  {
    parent: "Comcast / NBCUniversal",
    revenue: "$121B",
    outlets: ["NBC", "MSNBC", "CNBC", "Universal Pictures", "DreamWorks", "Sky News", "Telemundo", "Peacock"],
    ceo: "Brian Roberts",
    note: "Roberts family controls the company through super-voting shares — 33% of equity but 100% of voting control. Also owns the largest ISP in America (Xfinity/Comcast).",
  },
  {
    parent: "The Walt Disney Company",
    revenue: "$88B",
    outlets: ["ABC", "ESPN", "FX", "National Geographic", "Hulu", "Disney+", "20th Century Studios", "A&E (50%)", "The History Channel (50%)"],
    ceo: "Bob Iger",
    note: "Controls a massive share of children's entertainment, sports broadcasting, and streaming. Owns Marvel, Star Wars, Pixar — shapes cultural narratives for entire generations.",
  },
  {
    parent: "Fox Corporation",
    revenue: "$14B",
    outlets: ["Fox News", "Fox Business", "Fox Sports", "Fox Broadcasting", "Tubi"],
    ceo: "Lachlan Murdoch",
    note: "Rupert Murdoch family controls Fox Corp and News Corp. Fox News is the most-watched cable news network. The family also owns The Wall Street Journal and New York Post through News Corp.",
  },
  {
    parent: "News Corp (Murdoch)",
    revenue: "$10B",
    outlets: ["The Wall Street Journal", "New York Post", "The Times (UK)", "The Sun (UK)", "The Australian", "HarperCollins", "Dow Jones", "Barron's", "MarketWatch"],
    ceo: "Robert Thomson",
    note: "Murdoch media empire spans US, UK, and Australia. Controls financial media (WSJ, Dow Jones, MarketWatch) that directly influences market sentiment.",
  },
  {
    parent: "Warner Bros. Discovery",
    revenue: "$41B",
    outlets: ["CNN", "HBO", "Max", "Discovery Channel", "TBS", "TNT", "Warner Bros. Pictures", "DC Comics", "Cartoon Network"],
    ceo: "David Zaslav",
    note: "CNN reaches 100M+ US households. HBO/Max is a major streaming platform. The merger of Warner and Discovery consolidated enormous content control under one company.",
  },
  {
    parent: "Paramount Global",
    revenue: "$30B",
    outlets: ["CBS", "Paramount+", "MTV", "Nickelodeon", "BET", "Comedy Central", "Showtime", "Simon & Schuster"],
    ceo: "In transition (Skydance merger)",
    note: "Controlled by the Redstone family through National Amusements. Nickelodeon and MTV shape youth culture. Simon & Schuster is one of the 'Big Five' book publishers.",
  },
]

const CANADA_MEDIA = [
  {
    parent: "Bell Media (BCE Inc.)",
    outlets: ["CTV", "CP24", "BNN Bloomberg", "iHeartRadio Canada", "Crave", "The Globe and Mail (minority)"],
    note: "Bell is also Canada's largest telecom. Owns your phone service AND your news. Received billions in government subsidies while cutting journalists.",
  },
  {
    parent: "Rogers Communications",
    outlets: ["Citytv", "OMNI Television", "Sportsnet", "Maclean's", "Toronto Star (partial)"],
    note: "Rogers also owns the Toronto Blue Jays, Rogers Centre, and is a major telecom. One family controls all of it.",
  },
  {
    parent: "Thomson Reuters / Woodbridge",
    outlets: ["The Globe and Mail", "Thomson Reuters (global news/data)", "CTV News (indirect via Bell)"],
    note: "The Thomson family is the richest in Canada ($70B+). They own the nation's 'newspaper of record' AND the data systems that governments and courts use worldwide (Westlaw, Reuters).",
  },
  {
    parent: "Postmedia Network",
    outlets: ["National Post", "Toronto Sun", "Ottawa Citizen", "Vancouver Sun", "Calgary Herald", "Edmonton Journal", "Montreal Gazette", "Ottawa Sun", "Winnipeg Sun", "300+ local papers"],
    note: "Owned by US hedge fund Chatham Asset Management. A US hedge fund controls Canada's largest newspaper chain. Over 300 newspapers consolidated under one owner with one editorial direction.",
  },
  {
    parent: "Irving Family (Brunswick News)",
    outlets: ["All major English newspapers in New Brunswick — Telegraph-Journal, Times & Transcript, Daily Gleaner"],
    note: "The Irving family owns virtually all English media in New Brunswick AND the province's largest employers (Irving Oil, JD Irving forestry, Irving Shipbuilding). They own the news that covers the government that awards them contracts.",
  },
  {
    parent: "Québecor (Pierre Karl Péladeau)",
    outlets: ["TVA", "Le Journal de Montréal", "Le Journal de Québec", "Vidéotron", "QUB Radio"],
    note: "PKP briefly led the separatist Parti Québécois while controlling Quebec's largest media company. Owns both telecom (Vidéotron) and media.",
  },
  {
    parent: "CBC / Radio-Canada",
    outlets: ["CBC Television", "CBC Radio", "CBC News", "CBC Gem", "Radio-Canada"],
    note: "Government-funded public broadcaster. Budget: ~$1.2B/year from taxpayers. Critics say it favors the governing party. Supporters say it is essential for Canadian content. Both have evidence.",
  },
]

const KEY_FACTS = [
  "In 1983, 50 companies controlled 90% of US media. Today, 6 companies control 90%.",
  "In Canada, 5 companies control over 80% of media — and 3 of them are also telecoms (they own your internet AND your news).",
  "Postmedia — Canada's largest newspaper chain — is owned by a US hedge fund (Chatham Asset Management).",
  "The journalists who work at these outlets are mostly good people doing honest work. The problem is structural: ownership determines editorial direction, story selection, and what does NOT get covered.",
  "Local news has been decimated. Over 2,900 US newspapers have closed since 2005. In Canada, 450+ local news outlets have closed since 2008.",
  "Facebook and Google now capture 80%+ of digital advertising revenue — the money that used to fund journalism. This is why newsrooms are shrinking.",
  "Media concentration means that if a story challenges the interests of the parent company's other businesses, it is less likely to be covered. NBC is unlikely to investigate Comcast's monopoly practices.",
]

export default function MediaOwnershipPage() {
  const [tab, setTab] = useState<"us" | "canada">("canada")
  const [expanded, setExpanded] = useState<number | null>(null)

  const data = tab === "us" ? US_MEDIA : CANADA_MEDIA

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-purple-600">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Who Owns the News?</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          <Explain tip="When a small number of companies own most of the media, they control what stories get told, how they are framed, and — most importantly — what stories are NEVER told">Media concentration</Explain> in the US and Canada. Follow the ownership, follow the incentives.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The news shapes what you think about and how you think about it. If 6 companies control 90% of
            what you see, read, and hear, those 6 companies have enormous power over public opinion. This
            page shows who owns what. The journalists are not the problem — the structure is. When a media
            company is owned by the same corporation that sells you internet, insurance, or military contracts,
            there are stories that simply will not be told.
          </p>
        </CardContent>
      </Card>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => { setTab("canada"); setExpanded(null) }}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px",
            tab === "canada" ? "border-red-500 text-red-700" : "border-transparent text-muted-foreground"
          )}>Canada</button>
        <button onClick={() => { setTab("us"); setExpanded(null) }}
          className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px",
            tab === "us" ? "border-blue-500 text-blue-700" : "border-transparent text-muted-foreground"
          )}>United States</button>
      </div>

      {/* Media companies */}
      <div className="space-y-3">
        {data.map((company, i) => {
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{company.parent}</p>
                    {"revenue" in company && <p className="text-[10px] text-muted-foreground">Revenue: {(company as any).revenue}</p>}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="mt-3 pl-13 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Outlets Owned</p>
                      <div className="flex flex-wrap gap-1.5">
                        {company.outlets.map(o => (
                          <Badge key={o} variant="outline" className="text-[10px]">{o}</Badge>
                        ))}
                      </div>
                    </div>
                    {"ceo" in company && (
                      <p className="text-xs text-muted-foreground"><strong>CEO:</strong> {(company as any).ceo}</p>
                    )}
                    <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
                      <p className="text-xs text-amber-800">{company.note}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Key facts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-500" /> Things to Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {KEY_FACTS.map((fact, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                <span>{fact}</span>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This page does not tell you which media to trust or distrust.</strong> It tells you who owns it.
            Once you know the ownership structure, you can ask better questions: What are this outlet's business
            interests? What stories might they NOT cover? Who are their advertisers? Cross-reference with
            <a href="https://aletheia-truth.vercel.app" className="text-violet-600 hover:underline font-medium mx-1" target="_blank" rel="noopener noreferrer">Aletheia</a>
            for deeper analysis on specific figures and narratives.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/logical-fallacies" className="text-sm text-red-600 hover:underline">Logical Fallacies</a>
        <a href="/governance" className="text-sm text-blue-600 hover:underline">Governance</a>
        <a href="/civilizations" className="text-sm text-amber-600 hover:underline">Civilizations</a>
      </div>
    </div>
  )
}
