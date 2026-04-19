"use client"

import { Phone, Shield, Heart, AlertTriangle, ExternalLink, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

/**
 * Emergency Resources Page — always accessible, no login required for the data
 * Real, verified helplines and emergency information
 */
export default function EmergencyPage() {
  const emergencyNumbers = [
    { name: "Emergency Services (US)", number: "911", type: "All emergencies", always: true },
    { name: "Emergency Services (UK)", number: "999", type: "All emergencies", always: true },
    { name: "Emergency Services (EU)", number: "112", type: "All emergencies (Europe-wide)", always: true },
    { name: "Emergency Services (AU)", number: "000", type: "All emergencies", always: true },
  ]

  const crisisLines = [
    { name: "988 Suicide & Crisis Lifeline", phone: "988", url: "https://988lifeline.org", country: "US", available: "24/7", description: "Free, confidential support for people in distress" },
    { name: "Crisis Text Line", phone: "Text HOME to 741741", url: "https://crisistextline.org", country: "US", available: "24/7", description: "Text-based crisis support" },
    { name: "Veterans Crisis Line", phone: "988 (Press 1)", url: "https://www.veteranscrisisline.net", country: "US", available: "24/7", description: "Support for veterans and their families" },
    { name: "Trevor Project", phone: "1-866-488-7386", url: "https://www.thetrevorproject.org", country: "US", available: "24/7", description: "Crisis support for LGBTQ+ youth" },
    { name: "SAMHSA Helpline", phone: "1-800-662-4357", url: "https://www.samhsa.gov/find-help/national-helpline", country: "US", available: "24/7", description: "Substance abuse and mental health referral" },
    { name: "National Domestic Violence Hotline", phone: "1-800-799-7233", url: "https://www.thehotline.org", country: "US", available: "24/7", description: "Support for domestic violence survivors" },
    { name: "RAINN Sexual Assault Hotline", phone: "1-800-656-4673", url: "https://www.rainn.org", country: "US", available: "24/7", description: "Sexual assault support" },
    { name: "Poison Control", phone: "1-800-222-1222", url: "https://www.poison.org", country: "US", available: "24/7", description: "Poison emergency and information" },
    { name: "Samaritans", phone: "116 123", url: "https://www.samaritans.org", country: "UK", available: "24/7", description: "Emotional support for anyone in distress" },
    { name: "Crisis Services Canada", phone: "1-833-456-4566", url: "https://www.crisisservicescanada.ca", country: "CA", available: "24/7", description: "National suicide prevention" },
    { name: "Kids Help Phone", phone: "1-800-668-6868", url: "https://kidshelpphone.ca", country: "CA", available: "24/7", description: "Support for young people" },
    { name: "Lifeline Australia", phone: "13 11 14", url: "https://www.lifeline.org.au", country: "AU", available: "24/7", description: "Crisis support and suicide prevention" },
    { name: "Beyond Blue", phone: "1300 22 4636", url: "https://www.beyondblue.org.au", country: "AU", available: "24/7", description: "Anxiety and depression support" },
  ]

  const selfCareSteps = [
    { title: "Breathe", instruction: "Take 4 slow breaths: inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat." },
    { title: "Ground yourself", instruction: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste." },
    { title: "Move your body", instruction: "Stand up. Stretch. Walk to another room. Physical movement interrupts the stress response." },
    { title: "Drink water", instruction: "Dehydration amplifies anxiety. Drink a full glass of water slowly." },
    { title: "Call someone", instruction: "You don't have to explain. Just hearing a familiar voice helps. Call a friend, family member, or any helpline above." },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Emergency Resources</h1>
        </div>
        <p className="text-white/80">If you are in immediate danger, call your local emergency number. All resources on this page are real, verified, and available 24/7.</p>
      </div>

      {/* Emergency numbers */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <Phone className="h-4 w-4" /> Emergency Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {emergencyNumbers.map((e) => (
              <div key={e.number} className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{e.number}</p>
                <p className="text-sm font-medium mt-1">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Immediate self-care */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-amber-600" /> If You're Struggling Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selfCareSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-700 text-sm font-bold">{i + 1}</div>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crisis helplines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" /> Crisis Helplines
          </CardTitle>
          <CardDescription>All verified, all free, all confidential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {crisisLines.map((line) => (
              <div key={line.name} className="flex items-start justify-between rounded-lg border border-border/50 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{line.name}</p>
                    <Badge variant="outline" className="text-[10px] py-0">{line.country}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{line.description}</p>
                  <p className="text-sm font-bold text-rose-600 mt-1">{line.phone}</p>
                  <p className="text-[10px] text-muted-foreground">{line.available}</p>
                </div>
                <a href={line.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground/50 hover:text-rose-500 shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            You are not alone. Whatever you're going through, there are people who want to help.
            Every helpline listed here is staffed by trained professionals who care.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
