"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Globe, BarChart3, Users, DollarSign, Heart, GraduationCap, ThermometerSun, Shield, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Source, SourceList } from "@/components/ui/source-citation"
import { cn } from "@/lib/utils"

// Dynamic import for Leaflet (SSR incompatible)
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">Loading map...</div> })

// ─── Country Data ─────────────────────────────────────────────
interface CountryData {
  name: string
  code: string
  lat: number
  lng: number
  population: number // millions
  gdpPerCapita: number // USD
  lifeExpectancy: number
  healthSpendPct: number // % of GDP
  educationIndex: number // 0-1
  happiness: number // 1-10
  gini: number // 0-100 inequality
  co2PerCapita: number // tonnes
  internetPct: number // % of population
  freedomIndex: number // 0-100
}

const COUNTRIES: CountryData[] = [
  { name: "Canada", code: "CA", lat: 56.13, lng: -106.35, population: 40.1, gdpPerCapita: 52051, lifeExpectancy: 82.3, healthSpendPct: 12.2, educationIndex: 0.89, happiness: 6.96, gini: 33.3, co2PerCapita: 14.3, internetPct: 97, freedomIndex: 87 },
  { name: "United States", code: "US", lat: 37.09, lng: -95.71, population: 334, gdpPerCapita: 76330, lifeExpectancy: 77.5, healthSpendPct: 17.8, educationIndex: 0.90, happiness: 6.89, gini: 39.7, co2PerCapita: 14.4, internetPct: 92, freedomIndex: 83 },
  { name: "United Kingdom", code: "GB", lat: 55.38, lng: -3.44, population: 67.7, gdpPerCapita: 46125, lifeExpectancy: 81.0, healthSpendPct: 11.3, educationIndex: 0.87, happiness: 6.80, gini: 35.1, co2PerCapita: 5.2, internetPct: 96, freedomIndex: 91 },
  { name: "Germany", code: "DE", lat: 51.17, lng: 10.45, population: 83.2, gdpPerCapita: 51384, lifeExpectancy: 80.9, healthSpendPct: 12.8, educationIndex: 0.94, happiness: 6.72, gini: 31.7, co2PerCapita: 8.1, internetPct: 93, freedomIndex: 94 },
  { name: "France", code: "FR", lat: 46.23, lng: 2.21, population: 67.8, gdpPerCapita: 44408, lifeExpectancy: 82.5, healthSpendPct: 12.2, educationIndex: 0.83, happiness: 6.69, gini: 32.4, co2PerCapita: 4.7, internetPct: 92, freedomIndex: 90 },
  { name: "Japan", code: "JP", lat: 36.20, lng: 138.25, population: 125.1, gdpPerCapita: 33815, lifeExpectancy: 84.8, healthSpendPct: 10.9, educationIndex: 0.87, happiness: 6.13, gini: 32.9, co2PerCapita: 8.5, internetPct: 93, freedomIndex: 96 },
  { name: "Australia", code: "AU", lat: -25.27, lng: 133.78, population: 26.4, gdpPerCapita: 63529, lifeExpectancy: 83.3, healthSpendPct: 10.6, educationIndex: 0.93, happiness: 7.06, gini: 34.3, co2PerCapita: 15.0, internetPct: 96, freedomIndex: 95 },
  { name: "South Korea", code: "KR", lat: 35.91, lng: 127.77, population: 51.7, gdpPerCapita: 32255, lifeExpectancy: 83.7, healthSpendPct: 8.4, educationIndex: 0.87, happiness: 5.95, gini: 31.4, co2PerCapita: 11.6, internetPct: 98, freedomIndex: 83 },
  { name: "Norway", code: "NO", lat: 60.47, lng: 8.47, population: 5.5, gdpPerCapita: 87925, lifeExpectancy: 83.2, healthSpendPct: 11.3, educationIndex: 0.94, happiness: 7.39, gini: 27.6, co2PerCapita: 7.5, internetPct: 99, freedomIndex: 100 },
  { name: "Switzerland", code: "CH", lat: 46.82, lng: 8.23, population: 8.8, gdpPerCapita: 93457, lifeExpectancy: 83.5, healthSpendPct: 11.8, educationIndex: 0.90, happiness: 7.24, gini: 33.1, co2PerCapita: 4.0, internetPct: 96, freedomIndex: 96 },
  { name: "Singapore", code: "SG", lat: 1.35, lng: 103.82, population: 5.9, gdpPerCapita: 72795, lifeExpectancy: 83.9, healthSpendPct: 6.1, educationIndex: 0.84, happiness: 6.52, gini: 45.9, co2PerCapita: 8.9, internetPct: 96, freedomIndex: 61 },
  { name: "Brazil", code: "BR", lat: -14.24, lng: -51.93, population: 216, gdpPerCapita: 8920, lifeExpectancy: 75.9, healthSpendPct: 9.6, educationIndex: 0.69, happiness: 6.27, gini: 48.9, co2PerCapita: 2.3, internetPct: 81, freedomIndex: 73 },
  { name: "India", code: "IN", lat: 20.59, lng: 78.96, population: 1428, gdpPerCapita: 2612, lifeExpectancy: 70.8, healthSpendPct: 3.3, educationIndex: 0.57, happiness: 4.04, gini: 35.2, co2PerCapita: 1.9, internetPct: 52, freedomIndex: 66 },
  { name: "China", code: "CN", lat: 35.86, lng: 104.20, population: 1412, gdpPerCapita: 12556, lifeExpectancy: 78.2, healthSpendPct: 5.6, educationIndex: 0.72, happiness: 5.82, gini: 38.2, co2PerCapita: 8.0, internetPct: 73, freedomIndex: 9 },
  { name: "Nigeria", code: "NG", lat: 9.08, lng: 8.68, population: 224, gdpPerCapita: 2184, lifeExpectancy: 54.7, healthSpendPct: 3.8, educationIndex: 0.49, happiness: 4.74, gini: 35.1, co2PerCapita: 0.6, internetPct: 55, freedomIndex: 43 },
  { name: "Mexico", code: "MX", lat: 23.63, lng: -102.55, population: 128.9, gdpPerCapita: 10948, lifeExpectancy: 75.1, healthSpendPct: 5.5, educationIndex: 0.70, happiness: 6.33, gini: 45.4, co2PerCapita: 3.6, internetPct: 76, freedomIndex: 60 },
  { name: "Sweden", code: "SE", lat: 60.13, lng: 18.64, population: 10.5, gdpPerCapita: 55566, lifeExpectancy: 83.0, healthSpendPct: 10.9, educationIndex: 0.91, happiness: 7.34, gini: 28.8, co2PerCapita: 3.6, internetPct: 98, freedomIndex: 100 },
  { name: "New Zealand", code: "NZ", lat: -40.90, lng: 174.89, population: 5.2, gdpPerCapita: 46278, lifeExpectancy: 82.1, healthSpendPct: 9.7, educationIndex: 0.92, happiness: 7.03, gini: 32.0, co2PerCapita: 6.2, internetPct: 96, freedomIndex: 95 },
  { name: "Russia", code: "RU", lat: 61.52, lng: 105.32, population: 144.2, gdpPerCapita: 12173, lifeExpectancy: 73.2, healthSpendPct: 5.7, educationIndex: 0.82, happiness: 5.66, gini: 36.0, co2PerCapita: 11.4, internetPct: 85, freedomIndex: 19 },
  { name: "Saudi Arabia", code: "SA", lat: 23.89, lng: 45.08, population: 36.4, gdpPerCapita: 27680, lifeExpectancy: 78.2, healthSpendPct: 6.4, educationIndex: 0.77, happiness: 6.46, gini: 45.9, co2PerCapita: 16.6, internetPct: 100, freedomIndex: 7 },
]

type MetricKey = "gdpPerCapita" | "lifeExpectancy" | "healthSpendPct" | "happiness" | "gini" | "co2PerCapita" | "freedomIndex" | "population" | "educationIndex" | "internetPct"

const METRICS: { key: MetricKey; label: string; icon: any; unit: string; description: string; source: string; higherIsBetter: boolean }[] = [
  { key: "gdpPerCapita", label: "GDP per Capita", icon: DollarSign, unit: "USD", description: "Total economic output divided by population. Measures average economic productivity per person.", source: "World Bank / IMF", higherIsBetter: true },
  { key: "lifeExpectancy", label: "Life Expectancy", icon: Heart, unit: "years", description: "Average number of years a person born today is expected to live. Reflects healthcare, nutrition, safety.", source: "WHO / World Bank", higherIsBetter: true },
  { key: "healthSpendPct", label: "Health Spending (% GDP)", icon: Heart, unit: "% GDP", description: "Percentage of GDP spent on healthcare. Higher ≠ better outcomes (US spends most, ranks poorly).", source: "WHO Global Health Expenditure", higherIsBetter: false },
  { key: "happiness", label: "Happiness Index", icon: Users, unit: "/10", description: "Self-reported life satisfaction. Based on income, social support, freedom, generosity, corruption, health.", source: "World Happiness Report 2024 (Gallup)", higherIsBetter: true },
  { key: "gini", label: "Inequality (Gini)", icon: BarChart3, unit: "0-100", description: "Income inequality coefficient. 0 = perfect equality, 100 = one person has everything. Lower = more equal.", source: "World Bank", higherIsBetter: false },
  { key: "co2PerCapita", label: "CO₂ per Capita", icon: ThermometerSun, unit: "tonnes", description: "Annual CO₂ emissions per person. Reflects energy use, industry, and lifestyle carbon footprint.", source: "Global Carbon Project / Our World in Data", higherIsBetter: false },
  { key: "freedomIndex", label: "Freedom Index", icon: Shield, unit: "/100", description: "Political rights + civil liberties score. 100 = most free, 0 = least free.", source: "Freedom House", higherIsBetter: true },
  { key: "educationIndex", label: "Education Index", icon: GraduationCap, unit: "0-1", description: "Combined measure of expected years of schooling and mean years of schooling.", source: "UNDP Human Development Report", higherIsBetter: true },
  { key: "internetPct", label: "Internet Access", icon: Globe, unit: "%", description: "Percentage of population using the internet. Proxy for digital infrastructure and access.", source: "ITU / World Bank", higherIsBetter: true },
  { key: "population", label: "Population", icon: Users, unit: "M", description: "Total population in millions.", source: "UN Population Division", higherIsBetter: false },
]

export default function WorldDataPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("gdpPerCapita")
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const metric = METRICS.find(m => m.key === selectedMetric)!
  const sorted = [...COUNTRIES].sort((a, b) => metric.higherIsBetter ? b[selectedMetric] - a[selectedMetric] : a[selectedMetric] - b[selectedMetric])
  const max = Math.max(...COUNTRIES.map(c => c[selectedMetric]))
  const selected = selectedCountry ? COUNTRIES.find(c => c.code === selectedCountry) : null

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">World Data Explorer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Interactive global data with sources. Choose a metric, see the map, compare countries, zoom into the numbers.
        </p>
      </div>

      {/* Metric selector */}
      <div className="flex gap-2 flex-wrap">
        {METRICS.map(m => {
          const Icon = m.icon
          return (
            <button key={m.key} onClick={() => setSelectedMetric(m.key)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors", selectedMetric === m.key ? "bg-blue-100 border-blue-300 text-blue-700 font-medium" : "hover:bg-muted/50")}>
              <Icon className="h-3 w-3" />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <MapView
            countries={COUNTRIES}
            selectedMetric={selectedMetric}
            metric={metric}
            onSelectCountry={setSelectedCountry}
            selectedCountry={selectedCountry}
          />
        </CardContent>
      </Card>

      {/* Selected country detail */}
      {selected && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4">
            <p className="text-lg font-bold mb-2">{selected.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {METRICS.slice(0, 5).map(m => (
                <div key={m.key} className="text-center">
                  <p className="text-lg font-bold">{typeof selected[m.key] === "number" && selected[m.key] > 1000 ? selected[m.key].toLocaleString() : selected[m.key]}</p>
                  <p className="text-[9px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current metric info */}
      <Card className="border-blue-200 bg-blue-50/10">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-1">{metric.label}</p>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
          <p className="text-[10px] text-muted-foreground mt-1"><strong>Source:</strong> {metric.source}</p>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Rankings: {metric.label}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {sorted.map((country, i) => {
              const val = country[selectedMetric]
              const pct = (val / max) * 100
              return (
                <div key={country.code} onClick={() => setSelectedCountry(country.code)} className={cn("flex items-center gap-2 rounded-lg p-1.5 cursor-pointer transition-colors", selectedCountry === country.code ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-muted/50")}>
                  <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">#{i + 1}</span>
                  <span className="text-xs w-24 shrink-0 truncate">{country.name}</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", i < 3 ? "bg-emerald-400" : i < 10 ? "bg-blue-400" : "bg-amber-400")} style={{ width: `${metric.higherIsBetter ? pct : ((max - val) / max) * 100 + 20}%` }} />
                  </div>
                  <span className="text-xs font-bold w-16 text-right shrink-0">
                    {val > 1000 ? `$${(val / 1000).toFixed(1)}K` : val} {metric.unit === "%" || metric.unit === "/10" || metric.unit === "/100" ? metric.unit : ""}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <SourceList title="Data Sources" sources={[
        { id: 1, title: "World Bank Open Data", type: "dataset", url: "https://data.worldbank.org/", notes: "GDP, Gini, health spending, education, internet access" },
        { id: 2, title: "World Happiness Report 2024", type: "report", url: "https://worldhappiness.report/", notes: "Self-reported life satisfaction, Gallup World Poll" },
        { id: 3, title: "WHO Global Health Observatory", type: "dataset", url: "https://www.who.int/data/gho", notes: "Life expectancy, health expenditure" },
        { id: 4, title: "Our World in Data — CO₂ Emissions", type: "dataset", url: "https://ourworldindata.org/co2-emissions", notes: "Per capita CO₂ from Global Carbon Project" },
        { id: 5, title: "Freedom House — Freedom in the World 2024", type: "report", url: "https://freedomhouse.org/report/freedom-world", notes: "Political rights and civil liberties scores" },
        { id: 6, title: "UNDP Human Development Report 2024", type: "report", url: "https://hdr.undp.org/", notes: "Education index, HDI components" },
        { id: 7, title: "Visual Capitalist", type: "article", url: "https://www.visualcapitalist.com/", notes: "Data visualization reference — uses same underlying sources" },
      ]} />

      <div className="flex gap-3 flex-wrap">
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Deep-Dive</a>
        <a href="/climate-data" className="text-sm text-green-600 hover:underline">Climate Data</a>
        <a href="/hive-mind" className="text-sm text-violet-600 hover:underline">Hive Mind</a>
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
      </div>
    </div>
  )
}
