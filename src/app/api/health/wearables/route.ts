import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Health Wearable Integration API
 *
 * POST /api/health/wearables — bulk import data from wearable devices
 *
 * Supports: Apple Health, Fitbit, Garmin, Google Fit, Oura, Whoop
 * Data is normalized into HealthEntry format regardless of source.
 *
 * In production: OAuth flows for each provider.
 * For now: accepts JSON bulk import in a standardized format.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { source, entries } = await req.json()

    if (!source || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "source and entries[] required" }, { status: 400 })
    }

    const VALID_SOURCES = ["APPLE_HEALTH", "FITBIT", "GARMIN", "GOOGLE_FIT", "OURA", "WHOOP", "MANUAL_CSV"]
    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: `Invalid source. Use: ${VALID_SOURCES.join(", ")}` }, { status: 400 })
    }

    let imported = 0

    for (const entry of entries.slice(0, 500)) { // Max 500 per batch
      const { type, data, date, notes } = entry

      if (!type || !data) continue

      // Normalize wearable data into our entry types
      const entryType = normalizeType(type)
      if (!entryType) continue

      await prisma.healthEntry.create({
        data: {
          userId: session.user.id,
          entryType,
          data: JSON.stringify({ ...data, source, importedFrom: source }),
          notes: notes ?? `Imported from ${source}`,
          recordedAt: date ? new Date(date) : new Date(),
        },
      })
      imported++
    }

    return NextResponse.json({
      imported,
      source,
      message: `Successfully imported ${imported} entries from ${source}`,
    })
  } catch (error) {
    console.error("[API] POST /api/health/wearables:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function normalizeType(type: string): string | null {
  const map: Record<string, string> = {
    // Apple Health types
    "HKQuantityTypeIdentifierHeartRate": "VITALS",
    "HKQuantityTypeIdentifierBloodPressureSystolic": "VITALS",
    "HKQuantityTypeIdentifierStepCount": "MEASUREMENT",
    "HKQuantityTypeIdentifierBodyMass": "MEASUREMENT",
    "HKCategoryTypeIdentifierSleepAnalysis": "SLEEP",
    "HKQuantityTypeIdentifierActiveEnergyBurned": "EXERCISE",
    "HKQuantityTypeIdentifierDietaryEnergyConsumed": "NUTRITION",

    // Generic types (Fitbit, Garmin, etc.)
    "heart_rate": "VITALS",
    "blood_pressure": "VITALS",
    "steps": "MEASUREMENT",
    "weight": "MEASUREMENT",
    "sleep": "SLEEP",
    "exercise": "EXERCISE",
    "workout": "EXERCISE",
    "nutrition": "NUTRITION",
    "calories": "NUTRITION",
    "spo2": "VITALS",
    "temperature": "VITALS",
    "stress": "SYMPTOM",
    "hrv": "VITALS",

    // Direct mappings
    "VITALS": "VITALS",
    "EXERCISE": "EXERCISE",
    "SLEEP": "SLEEP",
    "NUTRITION": "NUTRITION",
    "MEASUREMENT": "MEASUREMENT",
    "SYMPTOM": "SYMPTOM",
    "MEDICATION": "MEDICATION",
  }

  return map[type] ?? null
}

/**
 * GET /api/health/wearables — returns supported providers and integration status
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const providers = [
      { id: "APPLE_HEALTH", name: "Apple Health", status: "csv_import", description: "Export from Apple Health app, import as JSON" },
      { id: "FITBIT", name: "Fitbit", status: "csv_import", description: "Export from Fitbit dashboard, import as JSON" },
      { id: "GARMIN", name: "Garmin Connect", status: "csv_import", description: "Export from Garmin Connect, import as JSON" },
      { id: "GOOGLE_FIT", name: "Google Fit", status: "csv_import", description: "Export from Google Takeout, import as JSON" },
      { id: "OURA", name: "Oura Ring", status: "csv_import", description: "Export from Oura app, import as JSON" },
      { id: "WHOOP", name: "WHOOP", status: "csv_import", description: "Export from WHOOP app, import as JSON" },
      { id: "MANUAL_CSV", name: "CSV Upload", status: "available", description: "Upload any health data as CSV" },
    ]

    // Count imported entries by source
    const entries = await prisma.healthEntry.findMany({
      where: { userId: session.user.id },
      select: { data: true },
    })

    const importCounts: Record<string, number> = {}
    for (const e of entries) {
      try {
        const d = JSON.parse(e.data || "{}")
        if (d.source) importCounts[d.source] = (importCounts[d.source] ?? 0) + 1
      } catch {}
    }

    return NextResponse.json({ providers, importCounts })
  } catch (error) {
    console.error("[API] GET /api/health/wearables:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
