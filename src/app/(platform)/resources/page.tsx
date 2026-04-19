"use client"

import { BookOpen, ExternalLink, Globe2, Heart, Brain, GraduationCap, Landmark, Zap, FlaskConical, TrendingUp, Building2, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Resources page — curated external resources for each module
 * All links are to real, free, legitimate resources
 */

const RESOURCE_CATEGORIES = [
  {
    title: "Health & Wellness",
    icon: Heart,
    color: "from-rose-500 to-red-600",
    resources: [
      { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", description: "Free access to 36 million biomedical research papers" },
      { name: "Examine.com", url: "https://examine.com", description: "Independent, unbiased analysis of nutrition and supplements" },
      { name: "Cronometer", url: "https://cronometer.com", description: "Free detailed nutrition tracking with micronutrient data" },
      { name: "CDC Health Data", url: "https://data.cdc.gov", description: "Public health data from the Centers for Disease Control" },
      { name: "WHO Data Portal", url: "https://data.who.int", description: "Global health statistics from the World Health Organization" },
    ],
  },
  {
    title: "Mental Health",
    icon: Brain,
    color: "from-pink-500 to-rose-600",
    resources: [
      { name: "988 Lifeline", url: "https://988lifeline.org", description: "24/7 crisis support — call or text 988" },
      { name: "NIMH", url: "https://www.nimh.nih.gov", description: "National Institute of Mental Health — research and resources" },
      { name: "Headspace (free content)", url: "https://www.headspace.com/meditation/free", description: "Free guided meditations" },
      { name: "Insight Timer", url: "https://insighttimer.com", description: "100,000+ free meditations from teachers worldwide" },
      { name: "MoodGym", url: "https://moodgym.com.au", description: "Free CBT-based program for anxiety and depression" },
    ],
  },
  {
    title: "Education",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-600",
    resources: [
      { name: "Khan Academy", url: "https://www.khanacademy.org", description: "Free world-class education in every subject" },
      { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu", description: "Free MIT course materials — lectures, notes, assignments" },
      { name: "Coursera (free courses)", url: "https://www.coursera.org/courses?query=free", description: "Free university courses from top institutions" },
      { name: "Project Gutenberg", url: "https://www.gutenberg.org", description: "70,000+ free ebooks — public domain literature" },
      { name: "Library of Congress", url: "https://www.loc.gov/collections", description: "Free access to millions of historical documents, maps, photos" },
    ],
  },
  {
    title: "Governance & Civic",
    icon: Landmark,
    color: "from-amber-500 to-orange-600",
    resources: [
      { name: "Congress.gov", url: "https://www.congress.gov", description: "Official US legislation tracker" },
      { name: "GovTrack", url: "https://www.govtrack.us", description: "Track bills, votes, and members of Congress" },
      { name: "OpenSecrets", url: "https://www.opensecrets.org", description: "Campaign finance and lobbying data" },
      { name: "FOIA.gov", url: "https://www.foia.gov", description: "Submit Freedom of Information Act requests" },
      { name: "Ballotpedia", url: "https://ballotpedia.org", description: "Encyclopedia of American politics and elections" },
      { name: "Vote.org", url: "https://www.vote.org", description: "Check voter registration and find your polling place" },
    ],
  },
  {
    title: "Science & Research",
    icon: FlaskConical,
    color: "from-teal-500 to-green-600",
    resources: [
      { name: "arXiv", url: "https://arxiv.org", description: "Open access to 2M+ scientific papers (physics, math, CS, bio)" },
      { name: "Sci-Hub", url: "https://sci-hub.se", description: "Free access to research papers (legality varies by country)" },
      { name: "Retraction Watch", url: "https://retractionwatch.com", description: "Tracking retractions of scientific papers" },
      { name: "Open Science Framework", url: "https://osf.io", description: "Free platform for pre-registering and sharing research" },
      { name: "Cochrane Reviews", url: "https://www.cochranelibrary.com", description: "Systematic reviews of healthcare interventions" },
    ],
  },
  {
    title: "Economics & Finance",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    resources: [
      { name: "FRED", url: "https://fred.stlouisfed.org", description: "800,000+ economic data series from the Federal Reserve" },
      { name: "Our World in Data", url: "https://ourworldindata.org", description: "Research and data on global problems" },
      { name: "World Bank Open Data", url: "https://data.worldbank.org", description: "Free development data for every country" },
      { name: "Investopedia", url: "https://www.investopedia.com", description: "Financial education and investment guides" },
      { name: "USAspending.gov", url: "https://www.usaspending.gov", description: "Track every dollar the US government spends" },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    resources: [
      { name: "EFF", url: "https://www.eff.org", description: "Electronic Frontier Foundation — digital rights and privacy" },
      { name: "Privacy Guides", url: "https://www.privacyguides.org", description: "Open-source privacy tools and recommendations" },
      { name: "Have I Been Pwned", url: "https://haveibeenpwned.com", description: "Check if your email was in a data breach" },
      { name: "Signal", url: "https://signal.org", description: "Encrypted messaging — recommended by security experts" },
      { name: "Tor Project", url: "https://www.torproject.org", description: "Anonymous browsing and censorship circumvention" },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Resources</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Curated free resources for every module. All links are to legitimate, verified sources.
        </p>
      </div>

      {RESOURCE_CATEGORIES.map((category) => {
        const Icon = category.icon
        return (
          <div key={category.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${category.color}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-semibold">{category.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.resources.map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="card-hover h-full">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{resource.name}</p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )
      })}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            All resources are free and verified. We have no affiliate relationships with any of these services.
            They're listed because they're genuinely useful.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
