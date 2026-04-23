"use client"

import { useState } from "react"
import { Activity, TrendingUp, TrendingDown, Target, Ruler, Scale, Zap, AlertTriangle, CheckCircle, Minus, LineChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

interface Entry {
  date: string
  weight: number
  bodyFat?: number
  waist?: number
  chest?: number
  hips?: number
  arms?: number
  thighs?: number
  neck?: number
}

function calcBMI(weight: number, heightIn: number): number {
  return Math.round((weight / (heightIn * heightIn)) * 703 * 10) / 10
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" }
  if (bmi < 25) return { label: "Normal", color: "text-emerald-600" }
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600" }
  return { label: "Obese", color: "text-red-600" }
}

function calcFFMI(weight: number, bodyFat: number, heightIn: number): number {
  const weightKg = weight * 0.453592
  const heightM = heightIn * 0.0254
  const leanMass = weightKg * (1 - bodyFat / 100)
  return Math.round((leanMass / (heightM * heightM)) * 10) / 10
}

function ffmiCategory(ffmi: number, isMale: boolean): string {
  if (isMale) {
    if (ffmi < 18) return "Below average"
    if (ffmi < 20) return "Average"
    if (ffmi < 22) return "Above average"
    if (ffmi < 25) return "Excellent / Athletic"
    return "Elite / Suspicious without PEDs"
  }
  if (ffmi < 14) return "Below average"
  if (ffmi < 16) return "Average"
  if (ffmi < 18) return "Above average"
  if (ffmi < 21) return "Excellent / Athletic"
  return "Elite"
}

// Navy method body fat estimation
function navyBodyFat(waist: number, neck: number, height: number, isMale: boolean, hips?: number): number | null {
  if (!waist || !neck || !height) return null
  if (isMale) {
    const bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
    return Math.round(bf * 10) / 10
  }
  if (!hips) return null
  const bf = 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387
  return Math.round(bf * 10) / 10
}

export default function BodyCompositionPage() {
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(10)
  const [isMale, setIsMale] = useState(true)
  const [entries, setEntries] = useSyncedStorage<Entry[]>("hfp-body-comp", [])

  // New entry form
  const [weight, setWeight] = useState<number | "">("")
  const [bodyFat, setBodyFat] = useState<number | "">("")
  const [waist, setWaist] = useState<number | "">("")
  const [chest, setChest] = useState<number | "">("")
  const [hips, setHips] = useState<number | "">("")
  const [neck, setNeck] = useState<number | "">("")
  const [arms, setArms] = useState<number | "">("")
  const [thighs, setThighs] = useState<number | "">("")

  const totalHeightIn = heightFt * 12 + heightIn

  function addEntry() {
    if (!weight) return
    const entry: Entry = {
      date: new Date().toISOString().split("T")[0],
      weight: Number(weight),
      ...(bodyFat ? { bodyFat: Number(bodyFat) } : {}),
      ...(waist ? { waist: Number(waist) } : {}),
      ...(chest ? { chest: Number(chest) } : {}),
      ...(hips ? { hips: Number(hips) } : {}),
      ...(neck ? { neck: Number(neck) } : {}),
      ...(arms ? { arms: Number(arms) } : {}),
      ...(thighs ? { thighs: Number(thighs) } : {}),
    }
    const updated = [...entries.filter(e => e.date !== entry.date), entry].sort((a, b) => b.date.localeCompare(a.date))
    setEntries(updated)
  }

  const latest = entries[0]
  const previous = entries[1]

  const bmi = latest ? calcBMI(latest.weight, totalHeightIn) : null
  const bmiCat = bmi ? bmiCategory(bmi) : null
  const ffmi = latest?.bodyFat ? calcFFMI(latest.weight, latest.bodyFat, totalHeightIn) : null
  const ffmiCat = ffmi ? ffmiCategory(ffmi, isMale) : null

  // Navy body fat estimate
  const navyBF = latest ? navyBodyFat(
    latest.waist || 0, latest.neck || 0, totalHeightIn, isMale, latest.hips
  ) : null

  // Trends
  const weightTrend = latest && previous ? Math.round((latest.weight - previous.weight) * 10) / 10 : null
  const waistTrend = latest?.waist && previous?.waist ? Math.round((latest.waist - previous.waist) * 10) / 10 : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Body Composition Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Weight is one number. Body composition is the whole story. Track measurements, see trends, understand what's changing.
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The scale lies.</strong> A person who weighs 180 lbs at 15% body fat looks and feels completely
            different from someone at 180 lbs and 30% body fat. <Explain tip="Body Mass Index — a simple ratio of weight to height. It doesn't distinguish muscle from fat, so fit, muscular people often score as 'overweight'">BMI</Explain> doesn't distinguish between muscle and fat.
            What matters is <strong>body composition</strong>: how much of your weight is lean mass vs. fat mass (<Explain tip="The percentage of your total weight that is fat tissue — a much better health indicator than weight alone">body fat percentage</Explain>).
            Track waist circumference, body fat %, and measurements — not just weight.
          </p>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Height (ft)</label>
              <Input type="number" value={heightFt} onChange={e => setHeightFt(Number(e.target.value) || 5)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Height (in)</label>
              <Input type="number" value={heightIn} onChange={e => setHeightIn(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground">Sex (for calculations)</label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setIsMale(true)} className={cn("px-3 py-1 rounded text-xs border", isMale ? "bg-blue-100 border-blue-300 text-blue-700" : "")}>Male</button>
                <button onClick={() => setIsMale(false)} className={cn("px-3 py-1 rounded text-xs border", !isMale ? "bg-rose-100 border-rose-300 text-rose-700" : "")}>Female</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log entry */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Log Measurements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Weight (lbs)*</label>
            <Input type="number" value={weight} onChange={e => setWeight(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Body fat %</label>
            <Input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Waist (in)</label>
            <Input type="number" step="0.25" value={waist} onChange={e => setWaist(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Neck (in)</label>
            <Input type="number" step="0.25" value={neck} onChange={e => setNeck(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Chest (in)</label>
            <Input type="number" step="0.25" value={chest} onChange={e => setChest(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Hips (in)</label>
            <Input type="number" step="0.25" value={hips} onChange={e => setHips(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Arms (in)</label>
            <Input type="number" step="0.25" value={arms} onChange={e => setArms(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
            <div><label className="text-[10px] text-muted-foreground">Thighs (in)</label>
            <Input type="number" step="0.25" value={thighs} onChange={e => setThighs(e.target.value ? Number(e.target.value) : "")} className="h-8 text-sm" /></div>
          </div>
          <Button onClick={addEntry} disabled={!weight} className="w-full bg-blue-600 hover:bg-blue-700">Log Today's Measurements</Button>
        </CardContent>
      </Card>

      {/* Current stats */}
      {latest && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Scale className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xl font-bold">{latest.weight} lbs</p>
              <p className="text-[10px] text-muted-foreground">Weight</p>
              {weightTrend !== null && (
                <p className={cn("text-[10px] font-medium", weightTrend > 0 ? "text-red-500" : weightTrend < 0 ? "text-emerald-500" : "text-muted-foreground")}>
                  {weightTrend > 0 ? "+" : ""}{weightTrend} lbs
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-violet-500" />
              <p className="text-xl font-bold">{bmi}</p>
              <p className="text-[10px] text-muted-foreground">BMI</p>
              {bmiCat && <p className={cn("text-[10px] font-medium", bmiCat.color)}>{bmiCat.label}</p>}
            </CardContent>
          </Card>
          {(latest.bodyFat || navyBF) && (
            <Card>
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto mb-1 text-rose-500" />
                <p className="text-xl font-bold">{latest.bodyFat || navyBF}%</p>
                <p className="text-[10px] text-muted-foreground">{latest.bodyFat ? "Body Fat" : <><Explain tip="The Navy method estimates body fat using just your neck, waist, and height measurements — no calipers or special equipment needed">Navy method</Explain> est.</>}</p>
              </CardContent>
            </Card>
          )}
          {ffmi && (
            <Card>
              <CardContent className="p-3 text-center">
                <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <p className="text-xl font-bold">{ffmi}</p>
                <p className="text-[10px] text-muted-foreground">FFMI</p>
                <p className="text-[10px] text-amber-600">{ffmiCat}</p>
              </CardContent>
            </Card>
          )}
          {latest.waist && (
            <Card>
              <CardContent className="p-3 text-center">
                <Ruler className="h-4 w-4 mx-auto mb-1 text-cyan-500" />
                <p className="text-xl font-bold">{latest.waist}"</p>
                <p className="text-[10px] text-muted-foreground">Waist</p>
                {waistTrend !== null && (
                  <p className={cn("text-[10px] font-medium", waistTrend > 0 ? "text-red-500" : waistTrend < 0 ? "text-emerald-500" : "text-muted-foreground")}>
                    {waistTrend > 0 ? "+" : ""}{waistTrend}"
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {entries.slice(0, 20).map((e, i) => (
                <div key={i} className="flex items-center gap-3 rounded border p-2 text-xs">
                  <span className="text-muted-foreground w-20 shrink-0">{e.date}</span>
                  <span className="font-semibold">{e.weight} lbs</span>
                  {e.bodyFat && <Badge variant="outline" className="text-[8px]">{e.bodyFat}% BF</Badge>}
                  {e.waist && <span className="text-muted-foreground">Waist: {e.waist}"</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress charts — SVG line charts over time */}
      {entries.length >= 3 && (() => {
        // Chronological order (oldest first) for charting
        const chrono = [...entries].sort((a, b) => a.date.localeCompare(b.date))
        const weightSeries = chrono.map(e => ({ date: e.date, value: e.weight }))
        const waistSeries = chrono.filter(e => typeof e.waist === "number").map(e => ({ date: e.date, value: e.waist as number }))
        const bfSeries = chrono.filter(e => typeof e.bodyFat === "number").map(e => ({ date: e.date, value: e.bodyFat as number }))

        function renderChart(series: { date: string; value: number }[], label: string, unit: string, colorHex: string, gradId: string) {
          if (series.length < 3) return null
          const w = 600, h = 140
          const pad = { t: 10, r: 10, b: 18, l: 36 }
          const innerW = w - pad.l - pad.r
          const innerH = h - pad.t - pad.b
          const n = series.length
          const vals = series.map(s => s.value)
          const minV = Math.min(...vals)
          const maxV = Math.max(...vals)
          const buf = Math.max(0.5, (maxV - minV) * 0.15)
          const lo = minV - buf
          const hi = maxV + buf
          const range = Math.max(0.001, hi - lo)
          const xAt = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
          const yAt = (v: number) => pad.t + innerH - ((v - lo) / range) * innerH
          const linePath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.value)}`).join(" ")
          const areaPath = `${linePath} L ${xAt(n - 1)} ${pad.t + innerH} L ${xAt(0)} ${pad.t + innerH} Z`
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{series[0].value}{unit} → {series[n - 1].value}{unit}</p>
              </div>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorHex} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={colorHex} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + innerH * t} y2={pad.t + innerH * t} stroke="currentColor" className="text-muted/30" strokeWidth={0.5} strokeDasharray="2 3" />
                ))}
                {[0, 0.5, 1].map((t, i) => {
                  const val = Math.round((hi - (hi - lo) * t) * 10) / 10
                  return <text key={i} x={pad.l - 4} y={pad.t + innerH * t + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8">{val}{unit}</text>
                })}
                <path d={areaPath} fill={`url(#${gradId})`} />
                <path d={linePath} fill="none" stroke={colorHex} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {series.map((p, i) => (
                  <circle key={i} cx={xAt(i)} cy={yAt(p.value)} r={2} fill={colorHex}>
                    <title>{p.date}: {p.value}{unit}</title>
                  </circle>
                ))}
              </svg>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>{series[0].date}</span>
                <span>{series[n - 1].date}</span>
              </div>
            </div>
          )
        }

        const weightChart = renderChart(weightSeries, "Weight over time", " lbs", "rgb(59, 130, 246)", "wGrad")
        const waistChart = waistSeries.length >= 3 ? renderChart(waistSeries, "Waist over time", "\"", "rgb(6, 182, 212)", "waGrad") : null
        const bfChart = bfSeries.length >= 3 ? renderChart(bfSeries, "Body fat % over time", "%", "rgb(244, 63, 94)", "bfGrad") : null

        if (!weightChart && !waistChart && !bfChart) return null

        return (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LineChart className="h-4 w-4 text-blue-500" /> Progress Charts</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {weightChart}
              {waistChart}
              {bfChart}
            </CardContent>
          </Card>
        )
      })()}

      {/* Progress insights — requires 7+ days of data */}
      {entries.length >= 2 && (() => {
        const chrono = [...entries].sort((a, b) => a.date.localeCompare(b.date))
        const first = chrono[0]
        const last = chrono[chrono.length - 1]
        const firstTs = new Date(first.date).getTime()
        const lastTs = new Date(last.date).getTime()
        const daysSpan = Math.max(1, Math.round((lastTs - firstTs) / (1000 * 60 * 60 * 24)))
        if (daysSpan < 7) return null

        // Rate of change per week (weight)
        const weightDelta = last.weight - first.weight
        const weeks = daysSpan / 7
        const weightPerWeek = Math.round((weightDelta / weeks) * 10) / 10

        // Longest streak of logging (consecutive days)
        let longest = 1
        let current = 1
        for (let i = 1; i < chrono.length; i++) {
          const prev = new Date(chrono[i - 1].date).getTime()
          const curr = new Date(chrono[i].date).getTime()
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
          if (diffDays === 1) {
            current++
            if (current > longest) longest = current
          } else {
            current = 1
          }
        }

        const trendDirection = Math.abs(weightPerWeek) < 0.3 ? "stable" : weightPerWeek > 0 ? "up" : "down"
        const TrendDirIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus
        const trendColor = trendDirection === "stable" ? "text-muted-foreground" : trendDirection === "down" ? "text-emerald-600" : "text-amber-600"
        const absPerWeek = Math.abs(weightPerWeek)

        return (
          <Card className="border-blue-200 bg-blue-50/20">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Progress Insights</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <TrendDirIcon className={cn("h-4 w-4", trendColor)} />
                <p>
                  Your weight is trending <strong className={trendColor}>{trendDirection}</strong>
                  {trendDirection !== "stable" && <> at <strong>{absPerWeek} lbs/week</strong></>}
                  <span className="text-muted-foreground"> (over {daysSpan} days)</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" />
                <p>Total change: <strong className={weightDelta < 0 ? "text-emerald-600" : weightDelta > 0 ? "text-amber-600" : ""}>{weightDelta > 0 ? "+" : ""}{Math.round(weightDelta * 10) / 10} lbs</strong> since {first.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <p>Longest logging streak: <strong>{longest} {longest === 1 ? "day" : "consecutive days"}</strong></p>
              </div>
              {absPerWeek > 2 && trendDirection === "down" && (
                <p className="text-amber-700 text-[11px] pt-1">⚠ Rate of loss exceeds 2 lbs/week — sustainable fat loss is typically 0.5-1% of body weight per week.</p>
              )}
              {absPerWeek > 1 && trendDirection === "up" && (
                <p className="text-amber-700 text-[11px] pt-1">⚠ Rate of gain exceeds 1 lb/week — fast weight gain is typically more fat than muscle.</p>
              )}
            </CardContent>
          </Card>
        )
      })()}

      {/* Reference charts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Body Fat % Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">Men</p>
              <div className="space-y-1">
                {[
                  { range: "2-5%", label: "Essential (competition)", color: "text-red-600" },
                  { range: "6-13%", label: "Athletic", color: "text-blue-600" },
                  { range: "14-17%", label: "Fitness", color: "text-emerald-600" },
                  { range: "18-24%", label: "Average", color: "text-amber-600" },
                  { range: "25%+", label: "Above average", color: "text-red-500" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className={r.color}>{r.range}</span>
                    <span className="text-muted-foreground">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">Women</p>
              <div className="space-y-1">
                {[
                  { range: "10-13%", label: "Essential (competition)", color: "text-red-600" },
                  { range: "14-20%", label: "Athletic", color: "text-blue-600" },
                  { range: "21-24%", label: "Fitness", color: "text-emerald-600" },
                  { range: "25-31%", label: "Average", color: "text-amber-600" },
                  { range: "32%+", label: "Above average", color: "text-red-500" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className={r.color}>{r.range}</span>
                    <span className="text-muted-foreground">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">Realistic Expectations</p>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Fat loss:</strong> 0.5-1% body fat per week is realistic and sustainable. 1-2 lbs/week on the scale.</p>
            <p><strong>Muscle gain:</strong> 1-2 lbs/month for beginners, 0.5-1 lb/month for intermediates. This is SLOW.</p>
            <p><strong>Body recomposition:</strong> Losing fat while gaining muscle simultaneously is possible but slower than doing each separately. Best for beginners and people returning after a break.</p>
            <p><strong>Waist circumference</strong> is the single best predictor of metabolic health. More important than weight or BMI. Track it weekly.</p>
            <p><strong><Explain tip="Fat-Free Mass Index — like BMI but only counts your lean tissue. It shows how muscular you are relative to your height">FFMI</Explain> above 25</strong> for men or 21 for women is extremely difficult to achieve naturally. Don't compare yourself to enhanced athletes.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/health" className="text-sm text-rose-600 hover:underline">Health Dashboard</a>
        <a href="/fascia" className="text-sm text-orange-600 hover:underline">Fascia Health</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/gut-health" className="text-sm text-emerald-600 hover:underline">Gut Health</a>
        <a href="/trajectory" className="text-sm text-violet-600 hover:underline">Life Trajectory</a>
      </div>
    </div>
  )
}
