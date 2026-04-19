"use client"

import { useState } from "react"
import { Compass, ChevronRight, Sparkles, Target, Lightbulb, TrendingUp, Star, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Career paths with complementary skills that create unique combinations
const CAREER_PATHS: Record<string, {
  title: string
  desc: string
  coreSkills: string[]
  complementarySkills: { skill: string; why: string; edgeLevel: "high" | "medium" | "unique" }[]
  emergingCombos: { combo: string; opportunity: string }[]
  resources: string[]
}> = {
  software: {
    title: "Software Development",
    desc: "Building applications, systems, and digital products",
    coreSkills: ["Programming", "Data structures", "System design", "Version control", "Testing"],
    complementarySkills: [
      { skill: "Psychology / UX", why: "Understanding how people think makes you build products people actually want to use. Most devs skip this — massive edge.", edgeLevel: "high" },
      { skill: "Writing / Communication", why: "Code is read more than written. Engineers who communicate well get promoted faster and lead teams.", edgeLevel: "high" },
      { skill: "Finance / Accounting", why: "Understanding business models means you build features that make money, not just features that are cool.", edgeLevel: "medium" },
      { skill: "Design / Visual arts", why: "Full-stack developers who can design are 2x more valuable. Most can't.", edgeLevel: "high" },
      { skill: "Blockchain / Crypto", why: "Decentralized systems are the next infrastructure layer. Early expertise = career moat.", edgeLevel: "unique" },
      { skill: "Biology / Bioinformatics", why: "Biotech is exploding. Programmers who understand biology build the next generation of health tech.", edgeLevel: "unique" },
    ],
    emergingCombos: [
      { combo: "AI + Domain expertise", opportunity: "AI tools need people who understand specific industries. AI + healthcare, AI + law, AI + education." },
      { combo: "Code + Content creation", opportunity: "Technical content creators (YouTube, blogs) earn more than most senior devs and build lasting assets." },
      { combo: "Engineering + Sales", opportunity: "Technical founders who can sell close deals 3x faster. Most engineers avoid sales — that is the edge." },
    ],
    resources: ["/education", "/education/finance", "/education/paths"],
  },
  healthcare: {
    title: "Healthcare / Medicine",
    desc: "Healing, research, patient care, public health",
    coreSkills: ["Biology", "Chemistry", "Patient care", "Diagnostics", "Ethics"],
    complementarySkills: [
      { skill: "Data science / Statistics", why: "Evidence-based medicine runs on data. Doctors who understand statistics catch bad research others miss.", edgeLevel: "high" },
      { skill: "Technology / Programming", why: "Health tech is a trillion-dollar industry. Medical professionals who code build the tools everyone else uses.", edgeLevel: "unique" },
      { skill: "Business / Administration", why: "Most doctors are terrible at business. The ones who aren't run the practices, hospitals, and startups.", edgeLevel: "high" },
      { skill: "Psychology / Counseling", why: "Half of medicine is helping people change behavior. Technical skill without empathy misses half the patient.", edgeLevel: "high" },
      { skill: "Nutrition / Functional medicine", why: "Root cause medicine is growing. Patients are tired of symptom management — prevention is the future.", edgeLevel: "medium" },
      { skill: "Public speaking / Media", why: "Medical professionals who communicate to the public build massive influence and trust.", edgeLevel: "unique" },
    ],
    emergingCombos: [
      { combo: "Medicine + AI", opportunity: "AI-assisted diagnostics, drug discovery, personalized treatment plans. The doctors who understand AI will lead." },
      { combo: "Healthcare + Blockchain", opportunity: "Patient data ownership, supply chain verification, credential portability. Health + crypto = massive opportunity." },
      { combo: "Clinical + Research", opportunity: "Translational researchers who see patients AND publish papers bridge the gap between lab and bedside." },
    ],
    resources: ["/health", "/desci", "/education/paths"],
  },
  business: {
    title: "Business / Entrepreneurship",
    desc: "Building companies, leading teams, creating value",
    coreSkills: ["Leadership", "Sales", "Finance", "Strategy", "Operations"],
    complementarySkills: [
      { skill: "Programming / No-code", why: "Founders who can build prototypes move 10x faster than those waiting for developers.", edgeLevel: "high" },
      { skill: "Psychology / Persuasion", why: "Business is people. Understanding motivation, bias, and decision-making is the ultimate competitive advantage.", edgeLevel: "high" },
      { skill: "Design thinking", why: "The best products come from understanding human needs deeply, not from spreadsheets.", edgeLevel: "medium" },
      { skill: "Data analysis", why: "Decisions backed by data beat gut feelings. Most small business owners fly blind.", edgeLevel: "high" },
      { skill: "Content / Marketing", why: "Building an audience before building a product means you launch to customers, not to silence.", edgeLevel: "unique" },
      { skill: "International relations / Languages", why: "Global markets are underserved. Speaking a second language opens doors most competitors cannot enter.", edgeLevel: "unique" },
    ],
    emergingCombos: [
      { combo: "Business + AI automation", opportunity: "Companies that automate early will outcompete those that don't. Understanding AI tools is table stakes." },
      { combo: "Entrepreneurship + Community", opportunity: "Community-led growth is replacing paid advertising. Build the audience, then build the product." },
      { combo: "Business + Climate tech", opportunity: "The transition to clean energy is the biggest economic opportunity in history. $130 trillion market." },
    ],
    resources: ["/education/finance", "/economics", "/energy/learn"],
  },
  creative: {
    title: "Creative Arts / Design",
    desc: "Visual arts, music, writing, film, content creation",
    coreSkills: ["Artistic technique", "Storytelling", "Visual design", "Creative process", "Critique"],
    complementarySkills: [
      { skill: "Technology / Digital tools", why: "AI art, 3D modeling, motion graphics — creatives who master digital tools access markets traditional artists cannot.", edgeLevel: "high" },
      { skill: "Marketing / Business", why: "The starving artist myth exists because most artists never learn to sell. Art + business = sustainable career.", edgeLevel: "high" },
      { skill: "Psychology / Human behavior", why: "The best art moves people. Understanding why humans feel what they feel makes your work resonate deeper.", edgeLevel: "medium" },
      { skill: "Data / Analytics", why: "Understanding what performs and why (without compromising art) is how you grow an audience.", edgeLevel: "medium" },
      { skill: "Teaching / Education", why: "The best teachers are working artists. Teaching deepens your own understanding and creates recurring income.", edgeLevel: "unique" },
      { skill: "Coding / Web development", why: "Interactive art, generative design, creative coding — the intersection of art and code is wide open.", edgeLevel: "unique" },
    ],
    emergingCombos: [
      { combo: "Art + AI tools", opportunity: "AI doesn't replace artists — it gives them superpowers. Artists who master AI tools create 10x more." },
      { combo: "Content + Community", opportunity: "Direct-to-fan models (Patreon, YouTube, newsletters) mean you don't need a gallery or label anymore." },
      { combo: "Design + UX research", opportunity: "Designers who can research user needs AND create beautiful interfaces are the most in-demand role in tech." },
    ],
    resources: ["/education", "/education/personalized"],
  },
  science: {
    title: "Science / Research",
    desc: "Discovery, experimentation, pushing the boundaries of knowledge",
    coreSkills: ["Scientific method", "Statistics", "Lab techniques", "Literature review", "Critical thinking"],
    complementarySkills: [
      { skill: "Programming / Data science", why: "Computational skills multiply research output. Scientists who code publish more and get more citations.", edgeLevel: "high" },
      { skill: "Communication / Writing", why: "Great research that nobody reads has zero impact. Scientists who communicate to the public change the world.", edgeLevel: "high" },
      { skill: "Entrepreneurship", why: "Translating research into products that help people. Most discoveries die in journals — founders bring them to life.", edgeLevel: "unique" },
      { skill: "Policy / Government", why: "Science that informs policy has exponential impact. Understanding how government works amplifies your research.", edgeLevel: "medium" },
      { skill: "Philosophy / Ethics", why: "CRISPR, AI, nuclear — science without ethics is dangerous. Researchers who think about consequences lead responsibly.", edgeLevel: "medium" },
      { skill: "Teaching / Mentoring", why: "Training the next generation is how your impact outlives you. Great mentors create scientific dynasties.", edgeLevel: "high" },
    ],
    emergingCombos: [
      { combo: "Science + Open source", opportunity: "Open science, pre-registration, open data — transparency is becoming the standard. Early adopters build credibility." },
      { combo: "Research + AI", opportunity: "AI-accelerated drug discovery, protein folding, climate modeling. AI is the new microscope." },
      { combo: "Science + Media", opportunity: "Science communicators (Neil deGrasse Tyson, Kurzgesagt) have more influence than most journal editors." },
    ],
    resources: ["/desci", "/education", "/education/paths"],
  },
  trades: {
    title: "Skilled Trades / Hands-on",
    desc: "Electrician, plumber, carpenter, mechanic, welder",
    coreSkills: ["Technical proficiency", "Problem solving", "Safety", "Tool mastery", "Code compliance"],
    complementarySkills: [
      { skill: "Business / Estimating", why: "Tradespeople who run their own business earn 2-5x more than employees. Business skills are the multiplier.", edgeLevel: "high" },
      { skill: "Technology / Smart home", why: "Smart home, solar, EV charging — electricians who understand tech install the future. Premium pricing.", edgeLevel: "unique" },
      { skill: "Teaching / YouTube", why: "Skilled trades content gets millions of views. Most tradespeople don't make content — zero competition.", edgeLevel: "unique" },
      { skill: "Green energy / Solar", why: "Solar installation is the fastest-growing job in America. Electricians who add solar certification double their rate.", edgeLevel: "high" },
      { skill: "Project management", why: "Leading crews and managing timelines separates $30/hr workers from $100K+ business owners.", edgeLevel: "high" },
      { skill: "Real estate / Investing", why: "Tradespeople who invest in property they can renovate themselves have the ultimate unfair advantage.", edgeLevel: "unique" },
    ],
    emergingCombos: [
      { combo: "Trades + Technology", opportunity: "Smart buildings, IoT, automated systems — the trades are going high-tech. Early adopters command premium rates." },
      { combo: "Trades + Content", opportunity: "Plumbers and electricians on YouTube make more than most office workers. The niche is wide open." },
      { combo: "Trades + Energy transition", opportunity: "Heat pumps, solar, EV infrastructure — every building needs upgrading. Decades of work guaranteed." },
    ],
    resources: ["/energy/learn", "/education/finance", "/infrastructure"],
  },
}

const PATH_OPTIONS = Object.entries(CAREER_PATHS).map(([key, path]) => ({ value: key, label: path.title }))

export default function CareerPathPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [customInterests, setCustomInterests] = useState("")

  const path = selectedPath ? CAREER_PATHS[selectedPath] : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Career Path Explorer</h1>
        </div>
        <p className="text-sm text-muted-foreground">Find the skills that complement your path and create an unfair advantage.</p>
      </div>

      {/* Path selection */}
      {!path ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">What field are you in or interested in?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PATH_OPTIONS.map(opt => (
              <Card key={opt.value} className="card-hover cursor-pointer" onClick={() => setSelectedPath(opt.value)}>
                <CardContent className="p-4 text-center">
                  <Compass className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-sm">{opt.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedPath(null)}>← All paths</Button>

          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-5">
              <h2 className="text-xl font-bold">{path.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{path.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {path.coreSkills.map(s => (
                  <Badge key={s} variant="outline" className="text-xs border-emerald-300 text-emerald-700">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Complementary skills — the edge */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Skills That Separate You From Everyone Else
            </h2>
            <div className="space-y-3">
              {path.complementarySkills.map(skill => (
                <Card key={skill.skill} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{skill.skill}</p>
                          <Badge variant="outline" className={cn("text-[10px]",
                            skill.edgeLevel === "unique" ? "border-violet-300 text-violet-700 bg-violet-50" :
                            skill.edgeLevel === "high" ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                            "border-amber-300 text-amber-700 bg-amber-50"
                          )}>
                            {skill.edgeLevel === "unique" ? "Rare combo" : skill.edgeLevel === "high" ? "High edge" : "Solid add"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{skill.why}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Emerging combos */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" /> Emerging Opportunities
            </h2>
            <div className="space-y-2">
              {path.emergingCombos.map(combo => (
                <Card key={combo.combo} className="border-amber-200 bg-amber-50/30">
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold text-amber-800">{combo.combo}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{combo.opportunity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform resources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-500" /> Start Building These Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {path.resources.map(r => (
                  <a key={r} href={r} className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-sm text-violet-700 hover:bg-violet-100 transition-colors">
                    {r.replace("/education/", "").replace("/", "").replace("-", " ") || "Education"} →
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The T-shaped professional:</strong> Go deep in one field (the vertical bar of the T) and
            develop complementary skills across others (the horizontal bar). A programmer who understands
            design, a doctor who can code, a tradesperson who runs a YouTube channel — these combinations
            are rare and therefore extremely valuable. The skills that seem unrelated to your field are often
            the ones that create the biggest edge.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
