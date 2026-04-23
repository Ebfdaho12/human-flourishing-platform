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
 * GET /api/correlations?days=90           — server-side correlations only
 * POST /api/correlations  body: { days, waterByDay, habitsByDay,
 *   gratitudeByDay, focusByDay }         — fuses client-side local data
 *   (water/habits/gratitude/focus live in localStorage) with server
 *   mood/sleep/exercise data and returns additional Pearson correlations
 *   and lag/delta insights.
 *
 * Each *ByDay parameter is a map { "YYYY-MM-DD": number }. The POST
 * handler falls back gracefully when a stream is missing.
 */

// ─── Statistics helpers ───────────────────────────────────────────────

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null
  const n = xs.length
  const sumX = xs.reduce((s, v) => s + v, 0)
  const sumY = ys.reduce((s, v) => s + v, 0)
  const meanX = sumX / n
  const meanY = sumY / n
  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  // Guard against zero variance (all same values = no correlation defined)
  if (denX === 0 || denY === 0) return null
  const r = num / Math.sqrt(denX * denY)
  if (!Number.isFinite(r)) return null
  // Clamp to [-1, 1] to absorb float drift
  return Math.max(-1, Math.min(1, Math.round(r * 1000) / 1000))
}

function significance(r: number, n: number): "strong" | "moderate" | "weak" | "noise" {
  const abs = Math.abs(r)
  if (n < 7) return "noise"
  if (abs >= 0.5) return "strong"
  if (abs >= 0.3) return "moderate"
  if (abs >= 0.15) return "weak"
  return "noise"
}

// Pair two date→value maps into aligned numeric arrays (same-day join).
function pairByDay(
  a: Record<string, number>,
  b: Record<string, number>,
): { xs: number[]; ys: number[]; dates: string[] } {
  const xs: number[] = []
  const ys: number[] = []
  const dates: string[] = []
  for (const date of Object.keys(a)) {
    if (date in b) {
      const x = a[date]
      const y = b[date]
      if (Number.isFinite(x) && Number.isFinite(y)) {
        xs.push(x)
        ys.push(y)
        dates.push(date)
      }
    }
  }
  return { xs, ys, dates }
}

// Lag join: value on day D in `a` vs value on day D+lag in `b`.
function pairByDayLag(
  a: Record<string, number>,
  b: Record<string, number>,
  lagDays: number,
): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  for (const date of Object.keys(a)) {
    const shifted = new Date(date + "T00:00:00Z")
    shifted.setUTCDate(shifted.getUTCDate() + lagDays)
    const shiftedKey = shifted.toISOString().split("T")[0]
    if (shiftedKey in b) {
      const x = a[date]
      const y = b[shiftedKey]
      if (Number.isFinite(x) && Number.isFinite(y)) {
        xs.push(x)
        ys.push(y)
      }
    }
  }
  return { xs, ys }
}

// Split a same-day joined series into above/below threshold on x, and
// return the mean-y delta so we can say "mood is X% higher on days you
// did Y > Z" — a more human-legible framing than a raw coefficient.
function thresholdDelta(
  xs: number[],
  ys: number[],
  threshold: number,
): { above: number; below: number; deltaPct: number; nAbove: number; nBelow: number } | null {
  const above: number[] = []
  const below: number[] = []
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] > threshold) above.push(ys[i])
    else below.push(ys[i])
  }
  if (above.length < 3 || below.length < 3) return null
  const mAbove = above.reduce((s, v) => s + v, 0) / above.length
  const mBelow = below.reduce((s, v) => s + v, 0) / below.length
  if (mBelow === 0) return null
  const deltaPct = Math.round(((mAbove - mBelow) / mBelow) * 1000) / 10
  return {
    above: Math.round(mAbove * 100) / 100,
    below: Math.round(mBelow * 100) / 100,
    deltaPct,
    nAbove: above.length,
    nBelow: below.length,
  }
}

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

    // ─── Exercise Duration vs Mood ───
    const exerciseDurationMoodPairs: { duration: number; mood: number }[] = []
    for (const ex of exerciseEntries) {
      const exDate = new Date(ex.recordedAt).toISOString().split("T")[0]
      const matchingMood = moodEntries.find(m =>
        new Date(m.recordedAt).toISOString().split("T")[0] === exDate
      )
      if (matchingMood) {
        const exData = JSON.parse(ex.data || "{}")
        const duration = exData.durationMinutes ?? exData.duration ?? null
        if (duration && typeof duration === "number" && duration > 0) {
          exerciseDurationMoodPairs.push({ duration, mood: matchingMood.score })
        }
      }
    }

    let exerciseDurationMoodCorrelation = null
    if (exerciseDurationMoodPairs.length >= 5) {
      const n = exerciseDurationMoodPairs.length
      const sumX = exerciseDurationMoodPairs.reduce((s, p) => s + p.duration, 0)
      const sumY = exerciseDurationMoodPairs.reduce((s, p) => s + p.mood, 0)
      const sumXY = exerciseDurationMoodPairs.reduce((s, p) => s + p.duration * p.mood, 0)
      const sumX2 = exerciseDurationMoodPairs.reduce((s, p) => s + p.duration ** 2, 0)
      const sumY2 = exerciseDurationMoodPairs.reduce((s, p) => s + p.mood ** 2, 0)
      const num = n * sumXY - sumX * sumY
      const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
      exerciseDurationMoodCorrelation = den !== 0 ? Math.round((num / den) * 100) / 100 : null
    }

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
    const validDays = dayCorrelations
      .filter((d: any) => d.avgMood !== null && d.entries >= 3)
      .map((d: any) => ({ day: d.day as string, avgMood: d.avgMood as number, entries: d.entries as number }))
    if (validDays.length >= 5) {
      const best = validDays.reduce((a, b) => a.avgMood > b.avgMood ? a : b)
      const worst = validDays.reduce((a, b) => a.avgMood < b.avgMood ? a : b)
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

    // Exercise duration insight
    if (exerciseDurationMoodCorrelation !== null && Math.abs(exerciseDurationMoodCorrelation) > 0.2) {
      insights.push({
        text: exerciseDurationMoodCorrelation > 0
          ? `Longer exercise sessions correlate with better mood (r=${exerciseDurationMoodCorrelation}, based on ${exerciseDurationMoodPairs.length} sessions). More time moving tends to mean a better day for you.`
          : `Interestingly, longer exercise sessions correlate with slightly lower mood (r=${exerciseDurationMoodCorrelation}). Shorter, more intense sessions may work better for you — or you may exercise longer on already-tough days.`,
        type: exerciseDurationMoodCorrelation > 0.3 ? "positive" : "neutral",
        confidence: exerciseDurationMoodPairs.length >= 15 ? "high" : "medium",
      })
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
      exerciseDurationMoodCorrelation,
      exerciseDurationPairs: exerciseDurationMoodPairs.length,
      insights,
      dataPoints: moodEntries.length,
      disclaimer: "Correlations are not causation. These patterns are for personal exploration only — not medical advice.",
    })

  } catch (error) {
    console.error("[API] GET /api/correlations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ─── POST: deep correlation analysis with client-side local data ───
//
// Body: {
//   days?: number (default 90, max 365)
//   waterByDay?:     { [YYYY-MM-DD]: number }  // ml total
//   habitsByDay?:    { [YYYY-MM-DD]: number }  // 0..1 completion ratio
//   gratitudeByDay?: { [YYYY-MM-DD]: number }  // items logged that day
//   focusByDay?:     { [YYYY-MM-DD]: number }  // focus minutes
// }
//
// Returns a rich analytics object with Pearson r, sample size, significance,
// same-day threshold deltas, and lag-shifted correlations.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const days = Math.min(365, Math.max(7, parseInt(String(body.days ?? 90))))
    const since = new Date(Date.now() - days * 86400000)
    const userId = session.user.id

    const waterByDay: Record<string, number> = sanitizeDayMap(body.waterByDay)
    const habitsByDay: Record<string, number> = sanitizeDayMap(body.habitsByDay)
    const gratitudeByDay: Record<string, number> = sanitizeDayMap(body.gratitudeByDay)
    const focusByDay: Record<string, number> = sanitizeDayMap(body.focusByDay)

    const [moodEntries, sleepEntries, exerciseEntries] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId, recordedAt: { gte: since } },
        select: { score: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId, entryType: "SLEEP", recordedAt: { gte: since } },
        select: { data: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.healthEntry.findMany({
        where: { userId, entryType: "EXERCISE", recordedAt: { gte: since } },
        select: { data: true, recordedAt: true },
        orderBy: { recordedAt: "asc" },
      }),
    ])

    // Aggregate server data to day-keyed maps (average per day when multiple
    // entries exist, which is the only sensible join for day-level correlation).
    const moodByDay: Record<string, number> = averageDayMap(
      moodEntries.map(e => ({ date: toDay(e.recordedAt), value: e.score })),
    )

    const sleepByDay: Record<string, number> = averageDayMap(
      sleepEntries.flatMap(e => {
        try {
          const d = JSON.parse(e.data || "{}")
          const hours = typeof d.hoursSlept === "number" ? d.hoursSlept : null
          return hours && hours > 0 ? [{ date: toDay(e.recordedAt), value: hours }] : []
        } catch { return [] }
      }),
    )

    const exerciseDurationByDay: Record<string, number> = sumDayMap(
      exerciseEntries.flatMap(e => {
        try {
          const d = JSON.parse(e.data || "{}")
          const mins =
            typeof d.durationMinutes === "number" ? d.durationMinutes :
            typeof d.duration === "number" ? d.duration : null
          return mins && mins > 0 ? [{ date: toDay(e.recordedAt), value: mins }] : []
        } catch { return [] }
      }),
    )

    // Mood data points drive most analyses; fail gracefully if too few.
    const moodDays = Object.keys(moodByDay).length
    if (moodDays < 7) {
      return NextResponse.json({
        ready: false,
        moodDays,
        needed: 7,
        message: "Keep logging — insights appear after 7 days of mood data.",
      })
    }

    // ─── Pairwise Pearson correlations with mood as the outcome ───
    const metrics: Array<{
      key: string
      label: string
      unit: string
      icon: string           // lucide-react icon name (resolved on client)
      source: Record<string, number>
      threshold?: { value: number; unit: string; verb: string }
    }> = [
      { key: "sleep",        label: "Sleep duration",     unit: "hrs",   icon: "Moon",     source: sleepByDay,            threshold: { value: 7,    unit: "hrs",     verb: "slept more than" } },
      { key: "exercise",     label: "Exercise duration",  unit: "min",   icon: "Dumbbell", source: exerciseDurationByDay, threshold: { value: 20,   unit: "min",     verb: "exercised over" } },
      { key: "water",        label: "Water intake",       unit: "ml",    icon: "Droplets", source: waterByDay,            threshold: { value: 2000, unit: "ml",      verb: "drank over" } },
      { key: "habits",       label: "Habit completion",   unit: "%",     icon: "CheckSquare", source: habitsByDay,        threshold: { value: 0.5,  unit: "% (half)", verb: "completed over half your habits" } },
      { key: "focus",        label: "Focus time",         unit: "min",   icon: "Timer",    source: focusByDay,            threshold: { value: 30,   unit: "min",     verb: "focused over" } },
      { key: "gratitude",    label: "Gratitude items",    unit: "items", icon: "Heart",    source: gratitudeByDay,        threshold: { value: 0,    unit: "items",   verb: "logged any gratitude" } },
    ]

    const correlations = metrics.map(m => {
      const { xs, ys, dates } = pairByDay(m.source, moodByDay)
      const r = pearson(xs, ys)
      const sig = r === null ? "noise" : significance(r, xs.length)
      let delta = null
      if (m.threshold && xs.length >= 7) {
        delta = thresholdDelta(xs, ys, m.threshold.value)
      }
      // Lag analyses: mood ~ metric(lag). Positive lag means "metric today
      // predicts mood in N days" (e.g. gratitude today → focus 2 days later).
      const lags: Array<{ lag: number; r: number | null; n: number }> = []
      for (const lag of [1, 2, 3]) {
        const { xs: lx, ys: ly } = pairByDayLag(m.source, moodByDay, lag)
        const lr = pearson(lx, ly)
        lags.push({ lag, r: lr, n: lx.length })
      }
      return {
        key: m.key,
        label: m.label,
        unit: m.unit,
        icon: m.icon,
        r,
        n: xs.length,
        significance: sig,
        threshold: m.threshold ?? null,
        delta,
        lags,
        // Keep scatter-plot data capped to keep payload lean.
        scatter: xs.slice(-120).map((x, i) => ({
          x,
          y: ys[xs.length - Math.min(120, xs.length) + i] ?? ys[i],
          date: dates[xs.length - Math.min(120, xs.length) + i] ?? dates[i],
        })),
      }
    })

    // ─── Cross-metric correlation matrix (heatmap) ───
    // Only compute cells with enough overlap to be meaningful.
    const allStreams: Array<{ key: string; label: string; data: Record<string, number> }> = [
      { key: "mood",      label: "Mood",     data: moodByDay },
      { key: "sleep",     label: "Sleep",    data: sleepByDay },
      { key: "exercise",  label: "Exercise", data: exerciseDurationByDay },
      { key: "water",     label: "Water",    data: waterByDay },
      { key: "habits",    label: "Habits",   data: habitsByDay },
      { key: "focus",     label: "Focus",    data: focusByDay },
      { key: "gratitude", label: "Gratitude",data: gratitudeByDay },
    ]

    const matrix: Array<Array<{ r: number | null; n: number; significance: string }>> = []
    for (let i = 0; i < allStreams.length; i++) {
      const row: Array<{ r: number | null; n: number; significance: string }> = []
      for (let j = 0; j < allStreams.length; j++) {
        if (i === j) {
          row.push({ r: 1, n: Object.keys(allStreams[i].data).length, significance: "strong" })
          continue
        }
        const { xs, ys } = pairByDay(allStreams[i].data, allStreams[j].data)
        const r = pearson(xs, ys)
        row.push({ r, n: xs.length, significance: r === null ? "noise" : significance(r, xs.length) })
      }
      matrix.push(row)
    }

    // ─── Non-obvious pattern discovery ───
    const patterns: Array<{ text: string; weight: number; tag: string }> = []

    for (const c of correlations) {
      if (c.delta && Math.abs(c.delta.deltaPct) >= 5 && c.delta.nAbove >= 3 && c.delta.nBelow >= 3 && c.threshold) {
        const direction = c.delta.deltaPct > 0 ? "higher" : "lower"
        const abspct = Math.abs(c.delta.deltaPct)
        const thr = c.threshold
        const thrStr = thr.value === 0 ? `you ${thr.verb}` : `you ${thr.verb} ${thr.value} ${thr.unit}`
        patterns.push({
          text: `Mood is ${abspct}% ${direction} on days ${thrStr} (${c.delta.above} vs ${c.delta.below}, n=${c.delta.nAbove + c.delta.nBelow}).`,
          weight: abspct * (c.delta.nAbove + c.delta.nBelow),
          tag: c.key,
        })
      }
      // Lead-lag: find the strongest lag correlation > same-day, if any.
      const bestLag = c.lags.filter(l => l.r !== null && l.n >= 7)
        .sort((a, b) => Math.abs(b.r!) - Math.abs(a.r!))[0]
      if (bestLag && c.r !== null && Math.abs(bestLag.r!) > Math.max(0.3, Math.abs(c.r) + 0.1)) {
        patterns.push({
          text: `Your mood peaks ${bestLag.lag} day${bestLag.lag > 1 ? "s" : ""} after high ${c.label.toLowerCase()} days (r=${bestLag.r}, n=${bestLag.n}).`,
          weight: Math.abs(bestLag.r!) * bestLag.n,
          tag: `${c.key}-lag`,
        })
      }
    }

    // Sleep-after-exercise delta (distinct from mood): does exercising add minutes of sleep?
    const exerciseSleepNext = pairByDayLag(exerciseDurationByDay, sleepByDay, 1)
    if (exerciseSleepNext.xs.length >= 7) {
      const delta = thresholdDelta(exerciseSleepNext.xs, exerciseSleepNext.ys, 20)
      if (delta && Math.abs(delta.above - delta.below) >= 0.25) {
        const mins = Math.round((delta.above - delta.below) * 60)
        patterns.push({
          text: `You sleep ${Math.abs(mins)} min ${mins > 0 ? "better" : "worse"} the night after exercise days (${delta.above}h vs ${delta.below}h, n=${delta.nAbove + delta.nBelow}).`,
          weight: Math.abs(mins) * (delta.nAbove + delta.nBelow),
          tag: "exercise-sleep-lag",
        })
      }
    }

    patterns.sort((a, b) => b.weight - a.weight)

    return NextResponse.json({
      ready: true,
      period: { days, from: since.toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
      moodDays,
      streams: Object.fromEntries(allStreams.map(s => [s.key, Object.keys(s.data).length])),
      correlations,
      matrix: {
        labels: allStreams.map(s => s.label),
        keys: allStreams.map(s => s.key),
        cells: matrix,
      },
      patterns: patterns.slice(0, 8),
      disclaimer: "Correlation is not causation. These are personal patterns in your own data, not medical or scientific claims.",
    })
  } catch (error) {
    console.error("[API] POST /api/correlations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ─── Local helpers for POST handler ───

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/

function sanitizeDayMap(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object") return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!DAY_KEY.test(k)) continue
    const num = typeof v === "number" ? v : Number(v)
    if (Number.isFinite(num)) out[k] = num
  }
  return out
}

function toDay(d: Date | string): string {
  return new Date(d).toISOString().split("T")[0]
}

function averageDayMap(entries: Array<{ date: string; value: number }>): Record<string, number> {
  const bucket: Record<string, number[]> = {}
  for (const { date, value } of entries) {
    if (!Number.isFinite(value)) continue
    ;(bucket[date] ||= []).push(value)
  }
  const out: Record<string, number> = {}
  for (const [date, vs] of Object.entries(bucket)) {
    out[date] = vs.reduce((s, v) => s + v, 0) / vs.length
  }
  return out
}

function sumDayMap(entries: Array<{ date: string; value: number }>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const { date, value } of entries) {
    if (!Number.isFinite(value)) continue
    out[date] = (out[date] ?? 0) + value
  }
  return out
}
