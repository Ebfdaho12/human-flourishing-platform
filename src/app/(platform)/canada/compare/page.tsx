"use client"

import { useState } from "react"
import { MapPin, ArrowRight, Home, Heart, DollarSign, Users, GraduationCap, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const PROVINCES: Record<string, {
  avgHome: number; medianIncome: number; incomeToHome: number;
  provincialTax: string; hst: string; healthWait: string;
  rentOneBr: number; childcare: number; gasPerL: number;
  minWage: number; unemployment: number; population: string;
  avgTemp: string; birthRate: number;
  strengths: string; weaknesses: string;
}> = {
  "British Columbia": { avgHome: 960000, medianIncome: 84000, incomeToHome: 11.4, provincialTax: "5.06-20.5%", hst: "5% GST + 7% PST", healthWait: "27 weeks", rentOneBr: 2400, childcare: 1200, gasPerL: 1.85, minWage: 17.40, unemployment: 5.2, population: "5.4M", avgTemp: "10°C coast, -3°C interior", birthRate: 1.25, strengths: "Tech, film, ports, hydro, scenery", weaknesses: "Housing (worst), drug crisis, wildfires" },
  "Alberta": { avgHome: 480000, medianIncome: 98000, incomeToHome: 4.9, provincialTax: "10% flat", hst: "5% GST only (no PST)", healthWait: "28 weeks", rentOneBr: 1600, childcare: 1100, gasPerL: 1.55, minWage: 15.00, unemployment: 6.1, population: "4.8M", avgTemp: "-2°C (Calgary)", birthRate: 1.55, strengths: "Oil, high wages, no PST, low housing", weaknesses: "Oil dependency, cold, boom-bust cycles" },
  "Saskatchewan": { avgHome: 340000, medianIncome: 82000, incomeToHome: 4.1, provincialTax: "10.5-14.5%", hst: "5% GST + 6% PST", healthWait: "30 weeks", rentOneBr: 1100, childcare: 900, gasPerL: 1.60, minWage: 15.00, unemployment: 5.0, population: "1.2M", avgTemp: "-5°C (Saskatoon)", birthRate: 1.73, strengths: "Potash, uranium, agriculture, affordable", weaknesses: "Cold, population retention, remote" },
  "Manitoba": { avgHome: 350000, medianIncome: 78000, incomeToHome: 4.5, provincialTax: "10.8-17.4%", hst: "5% GST + 7% RST", healthWait: "32 weeks", rentOneBr: 1200, childcare: 800, gasPerL: 1.55, minWage: 15.80, unemployment: 5.3, population: "1.5M", avgTemp: "-6°C (Winnipeg)", birthRate: 1.62, strengths: "Hydro power, affordable, agriculture, diverse", weaknesses: "Cold, infrastructure, flooding" },
  "Ontario": { avgHome: 880000, medianIncome: 86000, incomeToHome: 10.2, provincialTax: "5.05-13.16%", hst: "13% HST", healthWait: "26 weeks", rentOneBr: 2200, childcare: 1500, gasPerL: 1.70, minWage: 17.20, unemployment: 6.4, population: "15.8M", avgTemp: "6°C (Toronto)", birthRate: 1.28, strengths: "Manufacturing, finance, tech, universities", weaknesses: "Housing, healthcare collapse, cost of living" },
  "Quebec": { avgHome: 480000, medianIncome: 72000, incomeToHome: 6.7, provincialTax: "14-25.75%", hst: "5% GST + 9.975% QST", healthWait: "25 weeks", rentOneBr: 1500, childcare: 250, gasPerL: 1.75, minWage: 15.75, unemployment: 5.4, population: "8.9M", avgTemp: "4°C (Montreal)", birthRate: 1.38, strengths: "Cheapest hydro, aerospace, AI, culture, $10/day childcare", weaknesses: "High taxes, language barrier, infrastructure decay" },
  "New Brunswick": { avgHome: 310000, medianIncome: 68000, incomeToHome: 4.6, provincialTax: "9.4-19.5%", hst: "15% HST", healthWait: "35 weeks", rentOneBr: 1100, childcare: 900, gasPerL: 1.65, minWage: 15.30, unemployment: 7.2, population: "0.8M", avgTemp: "4°C (Moncton)", birthRate: 1.30, strengths: "Bilingual, affordable, tidal energy, Irving refinery", weaknesses: "Irving dominance, aging population, healthcare" },
  "Nova Scotia": { avgHome: 450000, medianIncome: 70000, incomeToHome: 6.4, provincialTax: "8.79-21%", hst: "15% HST", healthWait: "36 weeks", rentOneBr: 1800, childcare: 1000, gasPerL: 1.70, minWage: 15.20, unemployment: 6.8, population: "1.1M", avgTemp: "6°C (Halifax)", birthRate: 1.22, strengths: "Military (Halifax), ocean tech, universities", weaknesses: "Healthcare crisis, housing rising fast, aging" },
  "Prince Edward Island": { avgHome: 380000, medianIncome: 65000, incomeToHome: 5.8, provincialTax: "9.65-16.7%", hst: "15% HST", healthWait: "38 weeks", rentOneBr: 1400, childcare: 850, gasPerL: 1.65, minWage: 15.40, unemployment: 7.5, population: "0.17M", avgTemp: "5°C", birthRate: 1.35, strengths: "Agriculture (potatoes), tourism, wind energy", weaknesses: "Small economy, climate vulnerability, healthcare" },
  "Newfoundland & Labrador": { avgHome: 290000, medianIncome: 72000, incomeToHome: 4.0, provincialTax: "8.7-21.8%", hst: "15% HST", healthWait: "33 weeks", rentOneBr: 1000, childcare: 850, gasPerL: 1.75, minWage: 15.60, unemployment: 10.8, population: "0.5M", avgTemp: "3°C (St. John's)", birthRate: 1.08, strengths: "Offshore oil, Churchill Falls (2041), fisheries", weaknesses: "Oil dependency, population decline, isolation" },
}

const METRICS = [
  { key: "avgHome", label: "Avg Home Price", format: (v: number) => `$${(v/1000).toFixed(0)}K`, better: "lower" },
  { key: "medianIncome", label: "Median Income", format: (v: number) => `$${(v/1000).toFixed(0)}K`, better: "higher" },
  { key: "incomeToHome", label: "Home-to-Income Ratio", format: (v: number) => `${v}x`, better: "lower" },
  { key: "rentOneBr", label: "Rent (1BR)", format: (v: number) => `$${v.toLocaleString()}/mo`, better: "lower" },
  { key: "childcare", label: "Childcare/mo", format: (v: number) => `$${v.toLocaleString()}`, better: "lower" },
  { key: "gasPerL", label: "Gas (per litre)", format: (v: number) => `$${v.toFixed(2)}`, better: "lower" },
  { key: "minWage", label: "Min Wage", format: (v: number) => `$${v.toFixed(2)}/hr`, better: "higher" },
  { key: "unemployment", label: "Unemployment", format: (v: number) => `${v}%`, better: "lower" },
  { key: "birthRate", label: "Birth Rate", format: (v: number) => `${v}`, better: "higher" },
] as const

export default function CanadaComparePage() {
  const provinces = Object.keys(PROVINCES)
  const [provA, setProvA] = useState("Ontario")
  const [provB, setProvB] = useState("Alberta")

  const a = PROVINCES[provA]
  const b = PROVINCES[provB]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Provincial Comparison</h1>
        </div>
        <p className="text-sm text-muted-foreground">Compare any two provinces side by side. Make informed decisions about where to live.</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Province A</label>
          <Select value={provA} onValueChange={setProvA}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Province B</label>
          <Select value={provB} onValueChange={setProvB}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-2 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">{provA}</p>
            <p className="text-xs text-muted-foreground">{a.population} · {a.avgTemp}</p>
            <p className="text-lg font-bold mt-1">${(a.avgHome/1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">{a.incomeToHome}x income</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">{provB}</p>
            <p className="text-xs text-muted-foreground">{b.population} · {b.avgTemp}</p>
            <p className="text-lg font-bold mt-1">${(b.avgHome/1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">{b.incomeToHome}x income</p>
          </CardContent>
        </Card>
      </div>

      {/* Metric comparison */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Side-by-Side Comparison</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {METRICS.map(m => {
            const valA = (a as any)[m.key] as number
            const valB = (b as any)[m.key] as number
            const aWins = m.better === "lower" ? valA < valB : valA > valB
            const bWins = m.better === "lower" ? valB < valA : valB > valA
            return (
              <div key={m.key} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <span className="text-xs text-muted-foreground w-32 shrink-0">{m.label}</span>
                <div className={cn("flex-1 text-right text-sm font-medium", aWins ? "text-emerald-600" : bWins ? "text-red-500" : "")}>
                  {m.format(valA)}
                </div>
                <div className="w-8 text-center">
                  {aWins ? <span className="text-emerald-500 text-xs">←</span> :
                   bWins ? <span className="text-emerald-500 text-xs">→</span> :
                   <span className="text-muted-foreground text-xs">=</span>}
                </div>
                <div className={cn("flex-1 text-left text-sm font-medium", bWins ? "text-emerald-600" : aWins ? "text-red-500" : "")}>
                  {m.format(valB)}
                </div>
              </div>
            )
          })}
          {/* Tax and health */}
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground w-32 shrink-0">Provincial Tax</span>
            <div className="flex-1 text-right text-xs">{a.provincialTax}</div>
            <div className="w-8" />
            <div className="flex-1 text-left text-xs">{b.provincialTax}</div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground w-32 shrink-0">Sales Tax</span>
            <div className="flex-1 text-right text-xs">{a.hst}</div>
            <div className="w-8" />
            <div className="flex-1 text-left text-xs">{b.hst}</div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground w-32 shrink-0">Health Wait (specialist)</span>
            <div className="flex-1 text-right text-xs">{a.healthWait}</div>
            <div className="w-8" />
            <div className="flex-1 text-left text-xs">{b.healthWait}</div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths / weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{provA}</p>
            <p className="text-xs text-emerald-600 mb-1"><strong>Strengths:</strong> {a.strengths}</p>
            <p className="text-xs text-amber-600"><strong>Weaknesses:</strong> {a.weaknesses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{provB}</p>
            <p className="text-xs text-emerald-600 mb-1"><strong>Strengths:</strong> {b.strengths}</p>
            <p className="text-xs text-amber-600"><strong>Weaknesses:</strong> {b.weaknesses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial impact */}
      {a.avgHome !== b.avgHome && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed">
              {a.avgHome > b.avgHome ? (
                <>Moving from <strong>{provA}</strong> to <strong>{provB}</strong> saves <strong>${((a.avgHome - b.avgHome)/1000).toFixed(0)}K</strong> on housing.
                Monthly rent difference: <strong>${Math.abs(a.rentOneBr - b.rentOneBr).toLocaleString()}/mo</strong> (${(Math.abs(a.rentOneBr - b.rentOneBr) * 12).toLocaleString()}/year).
                Childcare difference: <strong>${Math.abs(a.childcare - b.childcare).toLocaleString()}/mo</strong>.</>
              ) : (
                <>Moving from <strong>{provB}</strong> to <strong>{provA}</strong> saves <strong>${((b.avgHome - a.avgHome)/1000).toFixed(0)}K</strong> on housing.
                Monthly rent difference: <strong>${Math.abs(a.rentOneBr - b.rentOneBr).toLocaleString()}/mo</strong>.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-slate-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Sources:</strong> CREA, StatsCan, provincial revenue ministries, CIHI, CMHC. Data is approximate and
            represents provincial averages — cities within provinces vary significantly. Use the{" "}
            <a href="/cost-of-living" className="text-violet-600 hover:underline">Cost of Living tool</a> for city-level comparison.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Sovereignty Report</a>
        <a href="/canada/housing" className="text-sm text-orange-600 hover:underline">Housing Crisis</a>
        <a href="/canada/blueprint" className="text-sm text-emerald-600 hover:underline">Blueprint</a>
        <a href="/cost-of-living" className="text-sm text-teal-600 hover:underline">City Comparison</a>
      </div>
    </div>
  )
}
