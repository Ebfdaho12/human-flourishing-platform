import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Correlations API — find patterns between user health/mood data and
 * external factors like moon phases, day of week, season, etc.
 *
 * This doesn't claim causation — it shows interesting correlations
 * and lets users decide what matters to them.
 *
 * GET /api/correlations?days=90
 */

// Moon phase calculation (simple algorithm — accurate enough for correlation)
function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Simplified moon phase algorithm
  let c = 0, e = 0, jd = 0, b = 0

  if (month < 3) {
    const adjustedYear = year - 1
    const adjustedMonth = month + 12
    c = Math.floor(adjustedYear / 100)
    e = Math.floor(c / 4)
    jd = Math.floor(365.25 * (adjustedYear + 4716)) + Math.floor(30.6001 * (adjustedMonth + 1)) + day - 1524.5
  } else {
    c = Math.floor(year / 100)
    e = Math.floor(c / 4)
    jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5
  }

  b = jd - 2451550.1
  const daysInCycle = b / 29.530588853
  const phaseNumber = ((daysInCycle % 1) + 1) % 1
  const illumination = Math.round(phaseNumber * 100)

  let phase: string
  if (phaseNumber < 0.0625) phase = "New Moon"
  else if (phaseNumber < 0.1875) phase = "Waxing Crescent"
  else if (phaseNumber < 0.3125) phase = "First Quarter"
  else if (phaseNumber < 0.4375) phase = "Waxing Gibbous"
  else if (phaseNumber < 0.5625) phase = "Full Moon"
  else if (phaseNumber < 0.6875) phase = "Waning Gibbous"
  else if (phaseNumber < 0.8125) phase = "Last Quarter"
  else if (phaseNumber < 0.9375) phase = "Waning Crescent"
  else phase = "New Moon"

  return { phase, illumination }
}

function getSeason(date: Date): string {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return "Spring"
  if (month >= 5 && month <= 7) return "Summer"
  if (month >= 8 && month <= 10) return "Fall"
  return "Winter"
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {

    const { searchParams } = new URL(req.url)
    const days = Math.min(365, parseInt(searchParams.get("days") ?? "90"))
    const since = new Date(Date.now() - days * 86400000)
    const userId = session.user.id

    // Fetch mood and health data
    const [moodEntries, healthEntries, sleepEntries] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId, recordedAt: { gte: since } },
        select: { score: true, emotions: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId, entryType: "VITALS", recordedAt: { gte: since } },
        select: { data: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId, entryType: "SLEEP", recordedAt: { gte: since } },
        select: { data: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
    ])

    // ─── Moon Phase Correlations ───
    const moodByMoonPhase: Record<string, number[]> = {}
    for (const entry of moodEntries) {
      const { phase } = getMoonPhase(new Date(entry.recordedAt))
      if (!moodByMoonPhase[phase]) moodByMoonPhase[phase] = []
      moodByMoonPhase[phase].push(entry.score)
    }

    const moonCorrelations = Object.entries(moodByMoonPhase).map(([phase, scores]) => ({
      phase,
      avgMood: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      entries: scores.length,
    })).sort((a, b) => b.avgMood - a.avgMood)

    // ─── Day of Week Correlations ───
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const moodByDay: Record<string, number[]> = {}
    for (const entry of moodEntries) {
      const day = dayNames[new Date(entry.recordedAt).getDay()]
      if (!moodByDay[day]) moodByDay[day] = []
      moodByDay[day].push(entry.score)
    }

    const dayCorrelations = dayNames.map(day => ({
      day,
      avgMood: moodByDay[day]?.length > 0
        ? Math.round((moodByDay[day].reduce((a, b) => a + b, 0) / moodByDay[day].length) * 10) / 10
        : null,
      entries: moodByDay[day]?.length ?? 0,
    }))

    // ─── Season Correlations ───
    const moodBySeason: Record<string, number[]> = {}
    for (const entry of moodEntries) {
      const season = getSeason(new Date(entry.recordedAt))
      if (!moodBySeason[season]) moodBySeason[season] = []
      moodBySeason[season].push(entry.score)
    }

    const seasonCorrelations = ["Spring", "Summer", "Fall", "Winter"].map(season => ({
      season,
      avgMood: moodBySeason[season]?.length > 0
        ? Math.round((moodBySeason[season].reduce((a, b) => a + b, 0) / moodBySeason[season].length) * 10) / 10
        : null,
      entries: moodBySeason[season]?.length ?? 0,
    }))

    // ─── Time of Day (when do they log?) ───
    const logsByHour: Record<number, number> = {}
    for (const entry of moodEntries) {
      const hour = new Date(entry.recordedAt).getHours()
      logsByHour[hour] = (logsByHour[hour] ?? 0) + 1
    }

    const hourActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      count: logsByHour[i] ?? 0,
    }))

    // ─── Sleep vs Mood ───
    const sleepMoodPairs: { sleep: number; mood: number }[] = []
    for (const sleep of sleepEntries) {
      const sleepDate = new Date(sleep.recordedAt).toISOString().split("T")[0]
      const matchingMood = moodEntries.find(m =>
        new Date(m.recordedAt).toISOString().split("T")[0] === sleepDate
      )
      if (matchingMood) {
        const sleepData = JSON.parse(sleep.data || "{}")
        if (sleepData.hoursSlept) {
          sleepMoodPairs.push({ sleep: sleepData.hoursSlept, mood: matchingMood.score })
        }
      }
    }

    // Simple correlation coefficient
    let sleepMoodCorrelation = null
    if (sleepMoodPairs.length >= 5) {
      const n = sleepMoodPairs.length
      const sumX = sleepMoodPairs.reduce((s, p) => s + p.sleep, 0)
      const sumY = sleepMoodPairs.reduce((s, p) => s + p.mood, 0)
      const sumXY = sleepMoodPairs.reduce((s, p) => s + p.sleep * p.mood, 0)
      const sumX2 = sleepMoodPairs.reduce((s, p) => s + p.sleep ** 2, 0)
      const sumY2 = sleepMoodPairs.reduce((s, p) => s + p.mood ** 2, 0)
      const num = n * sumXY - sumX * sumY
      const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
      sleepMoodCorrelation = den !== 0 ? Math.round((num / den) * 100) / 100 : null
    }

    // ─── Exercise vs Mood ───
    const exerciseEntries = await prisma.healthEntry.findMany({
      where: { userId, entryType: "EXERCISE", recordedAt: { gte: since } },
      select: { data: true, recordedAt: true },
      orderBy: { recordedAt: "asc" },
    })

    const exerciseDates = new Set(exerciseEntries.map(e => new Date(e.recordedAt).toISOString().split("T")[0]))
    const moodOnExerciseDays: number[] = []
    const moodOnRestDays: number[] = []
    for (const entry of moodEntries) {
      const dateStr = new Date(entry.recordedAt).toISOString().split("T")[0]
      if (exerciseDates.has(dateStr)) moodOnExerciseDays.push(entry.score)
      else moodOnRestDays.push(entry.score)
    }

    const exerciseMoodDelta = moodOnExerciseDays.length >= 3 && moodOnRestDays.length >= 3
      ? Math.round(((moodOnExerciseDays.reduce((a, b) => a + b, 0) / moodOnExerciseDays.length)
        - (moodOnRestDays.reduce((a, b) => a + b, 0) / moodOnRestDays.length)) * 10) / 10
      : null

    // ─── Generate Smart Insights ───
    const insights: { text: string; type: "positive" | "warning" | "neutral"; confidence: "high" | "medium" | "low" }[] = []

    // Sleep-mood insight
    if (sleepMoodCorrelation !== null && Math.abs(sleepMoodCorrelation) > 0.3) {
      insights.push({
        text: sleepMoodCorrelation > 0
          ? `Your mood correlates positively with sleep (r=${sleepMoodCorrelation}). On nights you sleep more, your mood the next day tends to be ${Math.abs(sleepMoodCorrelation) > 0.5 ? "significantly" : "noticeably"} higher.`
          : `Unusually, your mood shows a negative correlation with sleep hours (r=${sleepMoodCorrelation}). This might indicate oversleeping on low-mood days rather than sleep causing low mood.`,
        type: sleepMoodCorrelation > 0 ? "positive" : "neutral",
        confidence: Math.abs(sleepMoodCorrelation) > 0.5 ? "high" : "medium",
      })
    }

    // Exercise-mood insight
    if (exerciseMoodDelta !== null && Math.abs(exerciseMoodDelta) > 0.3) {
      insights.push({
        text: exerciseMoodDelta > 0
          ? `Your mood averages ${exerciseMoodDelta} points higher on days you exercise (${moodOnExerciseDays.length} exercise days vs ${moodOnRestDays.length} rest days). Movement measurably improves your mood.`
          : `Your mood is slightly lower on exercise days (${Math.abs(exerciseMoodDelta)} points). This might indicate you exercise when stressed, or that your exercise routine is too intense.`,
        type: exerciseMoodDelta > 0.5 ? "positive" : "neutral",
        confidence: moodOnExerciseDays.length >= 10 ? "high" : "medium",
      })
    }

    // Day-of-week insight
    const validDays = dayCorrelations.filter((d: any) => d.avgMood !== null && d.entries >= 3)
    if (validDays.length >= 5) {
      const best = validDays.reduce((a: any, b: any) => a.avgMood > b.avgMood ? a : b)
      const worst = validDays.reduce((a: any, b: any) => a.avgMood < b.avgMood ? a : b)
      if (best.avgMood - worst.avgMood > 0.5) {
        insights.push({
          text: `${best.day}s are your best day (avg mood ${best.avgMood}), while ${worst.day}s are your lowest (${worst.avgMood}). The gap of ${Math.round((best.avgMood - worst.avgMood) * 10) / 10} points suggests your weekly rhythm significantly affects your wellbeing.`,
          type: "neutral",
          confidence: "high",
        })
      }
    }

    // Moon phase insight
    if (moonCorrelations.length >= 4) {
      const bestMoon = moonCorrelations[0]
      const worstMoon = moonCorrelations[moonCorrelations.length - 1]
      if (bestMoon.avgMood - worstMoon.avgMood > 0.5 && bestMoon.entries >= 3 && worstMoon.entries >= 3) {
        insights.push({
          text: `Your mood tends to be highest during ${bestMoon.phase} (${bestMoon.avgMood}/10) and lowest during ${worstMoon.phase} (${worstMoon.avgMood}/10). Based on ${moodEntries.length} mood entries over ${days} days.`,
          type: "neutral",
          confidence: moodEntries.length >= 30 ? "medium" : "low",
        })
      }
    }

    // Low sleep warning
    const recentSleep = sleepEntries.slice(-7)
    if (recentSleep.length >= 5) {
      const avgRecentSleep = recentSleep.reduce((sum, s) => {
        const d = JSON.parse(s.data || "{}"); return sum + (d.hoursSlept || 0)
      }, 0) / recentSleep.length
      if (avgRecentSleep < 6.5 && avgRecentSleep > 0) {
        insights.push({
          text: `Your average sleep this week is ${Math.round(avgRecentSleep * 10) / 10} hours — below the 7-hour minimum for cognitive function. Research shows this reduces reaction time, decision-making quality, and emotional regulation.`,
          type: "warning",
          confidence: "high",
        })
      }
    }

    // Current moon phase
    const currentMoon = getMoonPhase(new Date())

    return NextResponse.json({
      period: { days, from: since.toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
      currentMoon,
      moonCorrelations,
      dayCorrelations,
      seasonCorrelations,
      hourActivity,
      sleepMoodCorrelation,
      sleepMoodPairs: sleepMoodPairs.length,
      exerciseMoodDelta,
      exerciseDayCount: moodOnExerciseDays.length,
      restDayCount: moodOnRestDays.length,
      insights,
      dataPoints: moodEntries.length,
      disclaimer: "Correlations are not causation. These patterns are for personal exploration only — not medical advice.",
    })

  } catch (error) {
    console.error("[API] GET /api/correlations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
