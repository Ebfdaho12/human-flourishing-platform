import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Related Content API — cross-module content suggestions
 *
 * GET /api/related?module=health
 * Returns suggestions from other modules that connect to the current one.
 *
 * This creates the "interconnected" experience — health connects to mental health,
 * governance connects to economics, education connects to DeSci.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const module = req.nextUrl.searchParams.get("module") ?? "health"
    const userId = session.user.id

    const suggestions: { module: string; title: string; description: string; href: string }[] = []

    switch (module) {
      case "health":
        // Health → Mental Health
        const recentMood = await prisma.moodEntry.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } })
        if (!recentMood) {
          suggestions.push({ module: "MENTAL_HEALTH", title: "Track your mood too", description: "Health and mental health are deeply connected. A daily mood check-in takes 30 seconds.", href: "/mental-health" })
        }
        // Health → DeSci
        suggestions.push({ module: "DESCI", title: "Check research bias", description: "Before following medical advice, check who funded the research.", href: "/desci" })
        // Health → Anonymous cases
        suggestions.push({ module: "HEALTH", title: "Get anonymous practitioner input", description: "Share your health concerns anonymously and get treatment proposals from practitioners.", href: "/health/cases" })
        break

      case "mental-health":
        suggestions.push({ module: "HEALTH", title: "Track physical health too", description: "Physical and mental health are inseparable. Sleep, exercise, and nutrition directly affect mood.", href: "/health" })
        suggestions.push({ module: "EDUCATION", title: "Learn about psychology", description: "Understanding cognitive biases and emotional regulation can be transformative.", href: "/education" })
        break

      case "education":
        suggestions.push({ module: "DESCI", title: "Apply what you learn", description: "Pre-register a study and test your knowledge with real research methodology.", href: "/desci" })
        suggestions.push({ module: "ECONOMICS", title: "Study real-world economics", description: "See how economic theories play out with real FRED data.", href: "/economics" })
        break

      case "governance":
        suggestions.push({ module: "ECONOMICS", title: "Follow the money", description: "Economic policy and governance are inseparable. See ROI data for development interventions.", href: "/economics" })
        suggestions.push({ module: "ENERGY", title: "Track energy policy impact", description: "Government energy policies affect your community. Track production and costs.", href: "/energy" })
        suggestions.push({ module: "INFRASTRUCTURE", title: "Track infrastructure spending", description: "How are your tax dollars being spent on infrastructure? Quality matters.", href: "/infrastructure" })
        break

      case "desci":
        suggestions.push({ module: "EDUCATION", title: "Deepen your knowledge", description: "Use AI tutoring to learn the methodology behind your research.", href: "/education" })
        suggestions.push({ module: "GOVERNANCE", title: "Track science policy", description: "Government funding decisions shape what research gets done.", href: "/governance" })
        break

      case "economics":
        suggestions.push({ module: "GOVERNANCE", title: "Connect to policy", description: "Economic outcomes are shaped by political decisions. Track who votes for what.", href: "/governance" })
        suggestions.push({ module: "INFRASTRUCTURE", title: "Infrastructure ROI", description: "The biggest economic gains often come from quality infrastructure investment.", href: "/infrastructure" })
        suggestions.push({ module: "ENERGY", title: "Energy economics", description: "Energy costs affect every economic calculation. Track your community's energy profile.", href: "/energy" })
        break

      case "infrastructure":
        suggestions.push({ module: "ECONOMICS", title: "Measure economic impact", description: "Every infrastructure project has an ROI. Score it with the Copenhagen Consensus method.", href: "/economics" })
        suggestions.push({ module: "ENERGY", title: "Energy infrastructure", description: "Energy production and grid management are critical infrastructure.", href: "/energy" })
        break

      case "energy":
        suggestions.push({ module: "INFRASTRUCTURE", title: "Energy infrastructure", description: "Grid reliability depends on infrastructure quality. Track projects and TCO.", href: "/infrastructure" })
        suggestions.push({ module: "ECONOMICS", title: "Energy economics", description: "Compare energy investment ROI with other development interventions.", href: "/economics" })
        suggestions.push({ module: "GOVERNANCE", title: "Energy policy", description: "Track how your representatives vote on energy legislation.", href: "/governance" })
        break
    }

    return NextResponse.json({ module, suggestions })

  } catch (error) {
    console.error("[API] GET /api/related:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
