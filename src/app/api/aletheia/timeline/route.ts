import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALETHEIA_URL = process.env.ALETHEIA_API_URL ?? "http://localhost:3001"

/**
 * Aletheia Timeline API — historical events and figures organized chronologically
 *
 * GET /api/aletheia/timeline?era=modern&q=banking
 * Returns events, figures, and narratives organized by time period
 * with connections between related entities
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const era = req.nextUrl.searchParams.get("era") ?? "all"
  const q = req.nextUrl.searchParams.get("q") ?? ""

  // Try to fetch from Aletheia
  try {
    if (q) {
      const [figRes, narRes] = await Promise.all([
        fetch(`${ALETHEIA_URL}/api/figures?search=${encodeURIComponent(q)}&limit=20`),
        fetch(`${ALETHEIA_URL}/api/narratives?search=${encodeURIComponent(q)}&limit=20`),
      ])

      const figures = figRes.ok ? (await figRes.json()).figures ?? [] : []
      const narratives = narRes.ok ? (await narRes.json()).narratives ?? [] : []

      return NextResponse.json({ connected: true, figures, narratives, query: q })
    }
  } catch {}

  // Fallback: curated timeline data (always available, even offline)
  const timeline = {
    eras: [
      {
        name: "Ancient World",
        period: "3000 BCE – 476 CE",
        events: [
          { year: -3000, title: "First writing systems (Sumerian cuneiform)", category: "civilization" },
          { year: -2560, title: "Great Pyramid of Giza constructed", category: "architecture" },
          { year: -1754, title: "Code of Hammurabi — first written law", category: "governance" },
          { year: -508, title: "Athenian democracy established", category: "governance" },
          { year: -399, title: "Trial and death of Socrates", category: "philosophy" },
          { year: -331, title: "Alexander the Great conquers Persian Empire", category: "military" },
          { year: -48, title: "Library of Alexandria partially destroyed", category: "knowledge" },
          { year: -44, title: "Assassination of Julius Caesar", category: "politics" },
          { year: 33, title: "Crucifixion of Jesus of Nazareth", category: "religion" },
          { year: 313, title: "Edict of Milan — Christianity legalized in Rome", category: "religion" },
          { year: 325, title: "Council of Nicaea — Christian canon established", category: "religion" },
          { year: 476, title: "Fall of Western Roman Empire", category: "civilization" },
        ],
      },
      {
        name: "Medieval & Renaissance",
        period: "476 – 1700",
        events: [
          { year: 622, title: "Muhammad's migration to Medina — birth of Islam", category: "religion" },
          { year: 800, title: "Charlemagne crowned Holy Roman Emperor", category: "politics" },
          { year: 1096, title: "First Crusade launched", category: "military" },
          { year: 1215, title: "Magna Carta signed — limiting royal power", category: "governance" },
          { year: 1347, title: "Black Death reaches Europe — kills 1/3 of population", category: "health" },
          { year: 1440, title: "Gutenberg printing press — democratizing knowledge", category: "technology" },
          { year: 1492, title: "Columbus reaches the Americas", category: "exploration" },
          { year: 1517, title: "Martin Luther's 95 Theses — Protestant Reformation", category: "religion" },
          { year: 1543, title: "Copernicus publishes heliocentric model", category: "science" },
          { year: 1687, title: "Newton publishes Principia Mathematica", category: "science" },
        ],
      },
      {
        name: "Enlightenment & Revolution",
        period: "1700 – 1900",
        events: [
          { year: 1776, title: "American Declaration of Independence", category: "governance" },
          { year: 1789, title: "French Revolution begins", category: "politics" },
          { year: 1791, title: "US Bill of Rights ratified", category: "governance" },
          { year: 1848, title: "Marx and Engels publish Communist Manifesto", category: "economics" },
          { year: 1859, title: "Darwin publishes On the Origin of Species", category: "science" },
          { year: 1861, title: "American Civil War begins", category: "military" },
          { year: 1865, title: "13th Amendment — slavery abolished", category: "governance" },
          { year: 1879, title: "Edison demonstrates electric light", category: "technology" },
          { year: 1886, title: "Statue of Liberty dedicated", category: "culture" },
          { year: 1895, title: "X-rays discovered by Röntgen", category: "science" },
        ],
      },
      {
        name: "Modern Era",
        period: "1900 – 1970",
        events: [
          { year: 1913, title: "Federal Reserve System created", category: "economics" },
          { year: 1914, title: "World War I begins", category: "military" },
          { year: 1917, title: "Russian Revolution", category: "politics" },
          { year: 1920, title: "19th Amendment — women's suffrage", category: "governance" },
          { year: 1929, title: "Wall Street crash — Great Depression begins", category: "economics" },
          { year: 1939, title: "World War II begins", category: "military" },
          { year: 1945, title: "Atomic bombs dropped on Hiroshima and Nagasaki", category: "military" },
          { year: 1945, title: "United Nations founded", category: "governance" },
          { year: 1947, title: "CIA established", category: "intelligence" },
          { year: 1948, title: "State of Israel established", category: "politics" },
          { year: 1953, title: "CIA Project MKUltra begins", category: "intelligence" },
          { year: 1963, title: "JFK assassination", category: "politics" },
          { year: 1964, title: "Civil Rights Act signed", category: "governance" },
          { year: 1969, title: "Moon landing — Apollo 11", category: "science" },
        ],
      },
      {
        name: "Information Age",
        period: "1970 – 2010",
        events: [
          { year: 1971, title: "Nixon ends gold standard", category: "economics" },
          { year: 1972, title: "Watergate scandal begins", category: "politics" },
          { year: 1973, title: "OPEC oil embargo", category: "economics" },
          { year: 1986, title: "Chernobyl nuclear disaster", category: "energy" },
          { year: 1989, title: "Berlin Wall falls", category: "politics" },
          { year: 1991, title: "Soviet Union dissolves", category: "politics" },
          { year: 1991, title: "World Wide Web launched", category: "technology" },
          { year: 2001, title: "September 11 attacks", category: "military" },
          { year: 2001, title: "PATRIOT Act signed", category: "surveillance" },
          { year: 2003, title: "Iraq War begins — WMD claims", category: "military" },
          { year: 2007, title: "iPhone launched — mobile revolution", category: "technology" },
          { year: 2008, title: "Global financial crisis — bank bailouts", category: "economics" },
          { year: 2009, title: "Bitcoin whitepaper published", category: "technology" },
        ],
      },
      {
        name: "Current Era",
        period: "2010 – Present",
        events: [
          { year: 2010, title: "Arab Spring begins", category: "politics" },
          { year: 2013, title: "Snowden reveals NSA mass surveillance", category: "surveillance" },
          { year: 2016, title: "Panama Papers leaked", category: "economics" },
          { year: 2016, title: "Brexit referendum", category: "politics" },
          { year: 2020, title: "COVID-19 pandemic", category: "health" },
          { year: 2021, title: "January 6 Capitol attack", category: "politics" },
          { year: 2022, title: "Russia invades Ukraine", category: "military" },
          { year: 2022, title: "ChatGPT launched — AI revolution", category: "technology" },
          { year: 2023, title: "FTX collapse — crypto fraud", category: "economics" },
          { year: 2024, title: "AI regulation debates worldwide", category: "technology" },
        ],
      },
    ],
    categories: ["civilization", "governance", "politics", "military", "economics", "science", "technology", "religion", "health", "intelligence", "surveillance", "energy", "culture", "philosophy", "knowledge", "exploration", "architecture"],
  }

  // Filter by era if specified
  const filteredEras = era === "all" ? timeline.eras : timeline.eras.filter(e => e.name.toLowerCase().includes(era.toLowerCase()))

  return NextResponse.json({ connected: false, timeline: { ...timeline, eras: filteredEras } })
}
