import { NextResponse } from "next/server"

/**
 * Crisis Resources API — returns emergency contacts and support resources
 * These are real, verified helplines and resources.
 */
export async function GET() {
  try {

    return NextResponse.json({
      crisis: [
        { name: "988 Suicide & Crisis Lifeline", phone: "988", url: "https://988lifeline.org", country: "United States", available: "24/7", description: "Free, confidential support for people in distress" },
        { name: "Crisis Text Line", phone: "Text HOME to 741741", url: "https://crisistextline.org", country: "United States", available: "24/7", description: "Text-based crisis support" },
        { name: "Crisis Services Canada", phone: "1-833-456-4566", url: "https://www.crisisservicescanada.ca", country: "Canada", available: "24/7", description: "National suicide prevention service" },
        { name: "Kids Help Phone", phone: "1-800-668-6868", url: "https://kidshelpphone.ca", country: "Canada", available: "24/7", description: "Support for young people" },
        { name: "Samaritans", phone: "116 123", url: "https://www.samaritans.org", country: "United Kingdom", available: "24/7", description: "Emotional support for anyone in distress" },
        { name: "Lifeline Australia", phone: "13 11 14", url: "https://www.lifeline.org.au", country: "Australia", available: "24/7", description: "Crisis support and suicide prevention" },
        { name: "Veterans Crisis Line", phone: "988, Press 1", url: "https://www.veteranscrisisline.net", country: "United States", available: "24/7", description: "Support for veterans and their families" },
        { name: "Trevor Project", phone: "1-866-488-7386", url: "https://www.thetrevorproject.org", country: "United States", available: "24/7", description: "Crisis support for LGBTQ+ youth" },
        { name: "SAMHSA Helpline", phone: "1-800-662-4357", url: "https://www.samhsa.gov/find-help/national-helpline", country: "United States", available: "24/7", description: "Substance abuse and mental health treatment referral" },
      ],
      selfCare: [
        { title: "Grounding Exercise (5-4-3-2-1)", description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present moment." },
        { title: "Box Breathing", description: "Breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4. Repeat 4 times. Used by Navy SEALs for stress management." },
        { title: "Progressive Muscle Relaxation", description: "Starting from your toes, tense each muscle group for 5 seconds then release. Work up through your body to your face." },
        { title: "Journaling Prompt", description: "Write for 5 minutes about: What am I feeling right now? What triggered it? What would I tell a friend in this situation?" },
        { title: "The 3-3-3 Rule for Anxiety", description: "Name 3 things you see, 3 sounds you hear, move 3 parts of your body. Interrupts the anxiety cycle." },
      ],
    })

  } catch (error) {
    console.error("[API] GET /api/mental-health/resources:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
