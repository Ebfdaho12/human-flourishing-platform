"use client"

import { useState } from "react"
import { Heart, Phone, Home, Apple, Shield, Brain, Baby, DollarSign, GraduationCap, Scale, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const RESOURCES: {
  category: string
  icon: any
  color: string
  items: { name: string; contact: string; description: string; coverage: string }[]
}[] = [
  {
    category: "Crisis & Emergency",
    icon: Phone,
    color: "from-red-500 to-rose-600",
    items: [
      { name: "911", contact: "Call 911", description: "Immediate danger to life. Medical emergency. Fire. Crime in progress.", coverage: "National" },
      { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", description: "24/7 suicide prevention and emotional distress support. Free. Confidential.", coverage: "National (Canada & US)" },
      { name: "Crisis Text Line", contact: "Text HOME to 686868", description: "24/7 text-based crisis support. For when you can't or don't want to call.", coverage: "National (Canada)" },
      { name: "Kids Help Phone", contact: "Call 1-800-668-6868 or text CONNECT to 686868", description: "24/7 for children and youth. Counselling, information, referrals. Ages 5-20.", coverage: "National" },
      { name: "Assaulted Women's Helpline", contact: "1-866-863-0511", description: "24/7 crisis counselling for women who have experienced abuse. Multi-language.", coverage: "Ontario (similar lines exist in each province)" },
      { name: "Trans Lifeline", contact: "1-877-330-6366", description: "Peer support for trans people in crisis. By and for trans people.", coverage: "National" },
    ],
  },
  {
    category: "Food & Hunger",
    icon: Apple,
    color: "from-green-500 to-emerald-600",
    items: [
      { name: "Food Banks Canada Locator", contact: "foodbankscanada.ca/find-a-food-bank", description: "Find your nearest food bank. No judgment. No questions. If you need food, go.", coverage: "National" },
      { name: "Community Fridges", contact: "Search '[your city] community fridge'", description: "Free fridges stocked by community members. Take what you need, leave what you can.", coverage: "Most major cities" },
      { name: "Breakfast programs (kids)", contact: "Contact your child's school", description: "Most schools have breakfast/snack programs. Ask the school office. Your child does not have to go hungry.", coverage: "National — most schools" },
      { name: "Meals on Wheels", contact: "mealsonwheels.ca", description: "Prepared meals delivered to seniors and people with disabilities.", coverage: "National" },
    ],
  },
  {
    category: "Housing & Shelter",
    icon: Home,
    color: "from-blue-500 to-indigo-600",
    items: [
      { name: "211 Ontario / 211 Canada", contact: "Call or text 211", description: "Connects you to local housing support, shelters, financial aid, and social services. Available 24/7.", coverage: "National (coverage varies by province)" },
      { name: "Salvation Army shelters", contact: "salvationarmy.ca", description: "Emergency shelter and transitional housing across Canada.", coverage: "National" },
      { name: "CMHC Rental Assistance", contact: "cmhc-schl.gc.ca", description: "Information on rental assistance programs, affordable housing, and housing subsidies.", coverage: "National + provincial programs" },
      { name: "Habitat for Humanity Canada", contact: "habitat.ca", description: "Affordable homeownership program. Apply to build your own home with community support.", coverage: "National" },
    ],
  },
  {
    category: "Mental Health",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    items: [
      { name: "BetterHelp / Talkspace", contact: "Online platforms", description: "Online therapy — often cheaper than in-person ($60-$80/week). Many offer sliding scale.", coverage: "National (online)" },
      { name: "CAMH (Centre for Addiction & Mental Health)", contact: "camh.ca | 416-535-8501", description: "Canada's largest mental health hospital. Programs, research, and referrals.", coverage: "Ontario (national resources online)" },
      { name: "Provincial health line", contact: "Ontario: 811 | BC: 811 | Alberta: 811", description: "Free health advice including mental health. Nurse available 24/7.", coverage: "Provincial (most provinces have 811)" },
      { name: "Wellness Together Canada", contact: "wellnesstogether.ca", description: "Free mental health and substance use support. Online counselling, self-assessment, resources.", coverage: "National" },
    ],
  },
  {
    category: "Financial Help",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    items: [
      { name: "Canada Revenue Agency (benefits)", contact: "canada.ca/benefits", description: "Check which benefits you qualify for: CCB, GST credit, CWB, disability, and more. File your taxes — even at $0 income.", coverage: "National" },
      { name: "Credit Counselling Canada", contact: "creditcounsellingcanada.ca", description: "Free, non-profit credit counselling. Debt management plans. No judgment.", coverage: "National" },
      { name: "Community Legal Clinics", contact: "Search '[your province] legal aid'", description: "Free legal help for low-income individuals. Tenant rights, employment, immigration, family law.", coverage: "Provincial" },
      { name: "Free tax filing (Community Volunteer Income Tax Program)", contact: "canada.ca/taxes-free-tax-clinics", description: "Free tax preparation for low-income individuals. Ensures you get all benefits you're entitled to.", coverage: "National" },
    ],
  },
  {
    category: "Children & Families",
    icon: Baby,
    color: "from-rose-500 to-pink-600",
    items: [
      { name: "Canada Child Benefit", contact: "canada.ca/child-benefit", description: "Up to $7,437/child under 6 per year. Apply when child is born. FILE YOUR TAXES to receive it.", coverage: "National" },
      { name: "Ontario Early Years Centres (or provincial equivalent)", contact: "Search '[your province] early years centre'", description: "Free drop-in programs for children 0-6 and parents. Play, learning, socialization, parenting support.", coverage: "Provincial" },
      { name: "Children's Aid / Family Services", contact: "Search '[your city] family services'", description: "Support for families in crisis. Parenting programs. Child protection. Not just enforcement — also provides help.", coverage: "Provincial" },
    ],
  },
  {
    category: "Education & Skills",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-600",
    items: [
      { name: "Public Library", contact: "Your local library", description: "FREE: books, internet, computers, programs, meeting rooms, job search help, children's programs. The most underused resource in every community.", coverage: "National" },
      { name: "Second Career (Ontario) / Retraining programs", contact: "ontario.ca/secondcareer (or provincial equivalent)", description: "Government-funded retraining for laid-off workers. Covers tuition + living expenses for up to 2 years.", coverage: "Provincial programs vary" },
      { name: "Khan Academy", contact: "khanacademy.org", description: "Free world-class education: math, science, computing, economics, arts. K-12 through university level. 100% free.", coverage: "Global (online)" },
      { name: "Coursera / edX (free audit)", contact: "coursera.org / edx.org", description: "University courses from Harvard, MIT, Stanford — free to audit. Pay only if you want a certificate.", coverage: "Global (online)" },
    ],
  },
]

export default function CommunityResourcesPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-violet-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Community Resources</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          If you or someone you know needs help right now — food, shelter, crisis support, financial aid — start here.
        </p>
      </div>

      <Card className="border-2 border-red-200 bg-red-50/20">
        <CardContent className="p-4 flex items-center gap-3">
          <Phone className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">In immediate danger? Call 911</p>
            <p className="text-sm font-bold text-red-800">Suicidal thoughts? Call or text 988</p>
            <p className="text-xs text-muted-foreground mt-0.5">Both are free, 24/7, confidential.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {RESOURCES.map((cat, i) => {
          const Icon = cat.icon
          const isOpen = expanded === i
          return (
            <Card key={i} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : i)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", cat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{cat.category}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.items.length} resources</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <Badge variant="outline" className="text-[9px]">{item.coverage}</Badge>
                        </div>
                        <p className="text-xs font-mono text-violet-600 mb-1">{item.contact}</p>
                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>There is no shame in asking for help.</strong> These resources exist because communities take care of
            each other. If you are struggling with food, housing, mental health, or money — reaching out is the
            strongest thing you can do. Many of these services are free, confidential, and available right now.
            If you know someone who needs help, share this page with them.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/canada/benefits" className="text-sm text-emerald-600 hover:underline">Benefits Finder</a>
        <a href="/preparedness" className="text-sm text-slate-600 hover:underline">Emergency Preparedness</a>
      </div>
    </div>
  )
}
