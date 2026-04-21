import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Personalized Learning API
 *
 * Uses the learner's existing interests/passions to create analogies
 * that make new material stick. If someone loves wrestling and wants
 * to learn ancient Rome, the system frames it through wrestling concepts.
 *
 * GET /api/education/personalized — get user's learning profile
 * POST /api/education/personalized — set interests
 * GET /api/education/personalized?topic=roman_empire — get personalized framing
 */

// Pre-built analogy maps: interest → subject → analogies
// These work without AI. When AI is available, it generates custom ones.
const ANALOGY_MAPS: Record<string, Record<string, string[]>> = {
  wrestling: {
    history: [
      "Ancient Rome was like the biggest wrestling promotion ever — emperors were the champions, the Senate was the authority figure, and the Colosseum was the arena where ratings (public approval) were made",
      "The fall of Rome is like when a dominant wrestling company overexpands — too many territories, internal politics, and eventually the whole thing splits apart",
      "Julius Caesar's assassination was the ultimate heel turn — 23 senators turning on the champion at once",
      "Alexander the Great had the longest undefeated streak in history — conquered from Greece to India without a loss",
    ],
    economics: [
      "Supply and demand works like wrestling ticket prices — if The Rock is on the card, prices go up. If it's a random house show, prices drop",
      "Inflation is like when a wrestling company gives out too many title belts — each one becomes less meaningful",
      "A monopoly is like when one promotion buys all the others — less competition means they can charge whatever they want",
    ],
    politics: [
      "Political parties are like wrestling factions — they team up when it benefits them and betray each other when it doesn't",
      "Filibustering in the Senate is like a wrestler stalling for time to avoid a match they know they'll lose",
      "Campaign promises are like wrestling promos — big talk before the match, but can they actually deliver?",
    ],
    science: [
      "Newton's third law (every action has an equal opposite reaction) — that's the physics of a wrestling suplex. The harder you throw, the harder the impact",
      "Evolution is like how wrestling styles evolved — from catch wrestling to sports entertainment, adapting to survive",
      "The food chain is like the wrestling card — jobbers feed the mid-carders, mid-carders feed the main eventers",
    ],
  },
  gaming: {
    history: [
      "The Roman Empire was the biggest open-world game ever — they kept conquering new territories (expanding the map) until the server couldn't handle it",
      "The Cold War was two players in a strategy game — USA and USSR both stockpiling nukes (max level weapons) but never actually fighting directly",
      "Medieval feudalism worked like a guild system — kings were guild leaders, lords were officers, peasants were the free-to-play players doing all the grinding",
    ],
    economics: [
      "Inflation is when the game devs print too much gold — everything becomes worthless. That's literally what happened to Germany in the 1920s",
      "The stock market is like an auction house — prices change based on what players think items are worth, not what they actually are",
      "Cryptocurrency mining is literally grinding for gold, except the algorithm makes it harder the more people mine",
    ],
    science: [
      "DNA is literally the source code of your body — 3 billion lines of code that compile into you",
      "Quantum mechanics is like when the game only renders what you're looking at — particles don't 'decide' their state until observed",
      "Black holes are like map boundaries — once you cross the event horizon, there's no coming back",
    ],
    mathematics: [
      "Probability is like loot drop rates — a 1% legendary drop means you need about 100 kills on average, not exactly 100",
      "Exponential growth is like compound interest on in-game currency — small numbers become huge if you leave them long enough",
      "Algorithms are just strategy guides for computers — step-by-step instructions to solve problems efficiently",
    ],
  },
  sports: {
    history: [
      "The Roman Empire operated like a sports dynasty — dominant for centuries but eventually the roster got too old and the young teams (Germanic tribes) took over",
      "The American Revolution was the ultimate underdog upset — a colony beating the #1 ranked empire in the world",
      "World War alliances were like sports conferences — you pick your division and have to stick with your team",
    ],
    economics: [
      "The salary cap is government regulation in miniature — without it, the rich teams (companies) buy all the talent and nobody else can compete",
      "Draft picks are like investment portfolios — you're betting on future potential based on limited information",
      "Free agency is a free market — players go where they get the best deal, just like workers in any industry",
    ],
    science: [
      "Aerodynamics in a curveball is the same physics that makes airplanes fly — the spin creates pressure differences",
      "VO2 max is literally your body's processing speed — how fast your cells can convert fuel (oxygen) into energy",
      "Recovery after injury follows the same principles as any biological repair — inflammation, cell regeneration, remodeling",
    ],
  },
  music: {
    history: [
      "The Renaissance was history's greatest remix album — they took ancient Greek and Roman ideas and re-released them with better production",
      "The Reformation was punk rock — Martin Luther was the original rebel saying 'the mainstream (Catholic Church) is corrupt, let's do it ourselves'",
      "Colonial empires were like major record labels — they signed (conquered) artists (countries) and took most of the profits",
    ],
    mathematics: [
      "Musical scales are pure mathematics — the octave is a 2:1 frequency ratio, a perfect fifth is 3:2",
      "Rhythm is fractions — quarter notes, eighth notes, sixteenth notes. 4/4 time is literally a fraction",
      "Harmony is about wave interference — consonance happens when frequencies align, dissonance when they clash",
    ],
    science: [
      "Sound is vibration — every note you hear is air molecules oscillating at a specific frequency",
      "Resonance is why a singer can shatter glass — match the natural frequency of an object and the vibrations amplify until it breaks",
      "Your ear is a biological Fourier transform — it decomposes complex sound waves into individual frequencies",
    ],
  },
  cooking: {
    science: [
      "The Maillard reaction (why food browns) is chemistry you do every day — amino acids and sugars rearranging at high heat to create hundreds of new flavor compounds",
      "Emulsification (making mayo) is forcing water and oil to mix using a molecule (lecithin in egg yolk) that likes both — that's surfactant chemistry",
      "Fermentation is outsourcing work to bacteria — you provide the environment, they transform the food. Same principle as brewing, cheese-making, and your gut microbiome",
    ],
    economics: [
      "Restaurant food costs follow the 30% rule — ingredients should be about 30% of the menu price. The rest is labor, rent, and profit. Same ratios apply across most businesses",
      "Farm-to-table is cutting out the middleman — same concept as direct-to-consumer in any industry",
    ],
  },
  fitness: {
    science: [
      "Progressive overload is your body's adaptation algorithm — it only builds muscle when it detects the current amount isn't enough for the demands you're placing on it",
      "ATP is your body's universal currency of energy — every movement you make costs ATP, and your body has three systems to produce it at different speeds",
      "Muscle memory isn't in your muscles — it's neural pathways your brain builds. Once built, they reactivate quickly even after years off",
    ],
    economics: [
      "Your body has an energy budget just like a financial budget — calories in vs calories out, with savings (fat) and debt (energy deficit)",
      "Diminishing returns in fitness is exactly like diminishing returns in economics — the first 10 hours of training give you way more gains than hours 990-1000",
    ],
  },
}

const INTEREST_OPTIONS = [
  "wrestling", "gaming", "sports", "music", "cooking", "fitness",
  "art", "movies", "anime", "cars", "nature", "travel",
  "fashion", "technology", "photography", "dance", "martial_arts",
  "skateboarding", "surfing", "fishing", "gardening", "crafts",
  "comedy", "podcasts", "animals", "space", "history_buff",
]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const topic = req.nextUrl.searchParams.get("topic")

  try {
    // Get user's interests from profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { bio: true },
    })

    // Parse interests from bio (stored as JSON in a special format)
    let interests: string[] = []
    try {
      const bioData = profile?.bio ?? ""
      const match = bioData.match(/\[INTERESTS:(.*?)\]/)
      if (match) interests = match[1].split(",").map(s => s.trim())
    } catch {}

    if (topic && interests.length > 0) {
      // Generate personalized analogies for this topic
      const analogies: { interest: string; analogies: string[] }[] = []

      for (const interest of interests) {
        const map = ANALOGY_MAPS[interest.toLowerCase()]
        if (map) {
          // Find matching subject area
          for (const [subject, items] of Object.entries(map)) {
            if (topic.toLowerCase().includes(subject) || subject.includes(topic.toLowerCase())) {
              analogies.push({ interest, analogies: items })
            }
          }
          // If no exact match, try broader matching
          if (analogies.length === 0) {
            const allAnalogies = Object.values(map).flat()
            if (allAnalogies.length > 0) {
              analogies.push({ interest, analogies: allAnalogies.slice(0, 3) })
            }
          }
        }
      }

      return NextResponse.json({
        topic,
        interests,
        analogies,
        tip: "These analogies connect new material to things you already understand deeply. Your brain builds new knowledge faster when it can attach it to existing mental models.",
      })
    }

    return NextResponse.json({
      interests,
      availableInterests: INTEREST_OPTIONS,
      hasProfile: interests.length > 0,
      analogyTopics: Object.keys(ANALOGY_MAPS),
    })
  } catch (error) {
    console.error("[API] GET /api/education/personalized:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { interests } = await req.json()

  if (!interests || !Array.isArray(interests)) {
    return NextResponse.json({ error: "interests array required" }, { status: 400 })
  }

  try {
    // Store interests in profile bio (appended as tag)
    const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    const existingBio = profile?.bio?.replace(/\s*\[INTERESTS:.*?\]/, "") ?? ""
    const newBio = `${existingBio} [INTERESTS:${interests.join(",")}]`.trim()

    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { bio: newBio },
    })

    return NextResponse.json({ success: true, interests, message: "Learning profile updated! Your education experience is now personalized." })
  } catch (error) {
    console.error("[API] POST /api/education/personalized:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
