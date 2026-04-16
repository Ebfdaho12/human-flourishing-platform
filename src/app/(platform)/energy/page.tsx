"use client"
import { useState } from "react"
import useSWR from "swr"
import { Zap, Plus, Sun, Wind, Droplets, Battery, Plug, Gauge, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SOURCE_META: Record<string, { label: string; icon: any; color: string; renewable: boolean }> = {
  SOLAR: { label: "Solar", icon: Sun, color: "text-yellow-400", renewable: true },
  WIND: { label: "Wind", icon: Wind, color: "text-cyan-400", renewable: true },
  HYDRO: { label: "Hydro", icon: Droplets, color: "text-blue-400", renewable: true },
  BATTERY: { label: "Battery", icon: Battery, color: "text-violet-400", renewable: false },
  GRID: { label: "Grid", icon: Plug, color: "text-gray-400", renewable: false },
  GENERATOR: { label: "Generator", icon: Gauge, color: "text-orange-400", renewable: false },
  OTHER: { label: "Other", icon: Zap, color: "text-muted-foreground", renewable: false },
}

const LOG_TYPES = [
  { value: "PRODUCTION", label: "Energy Produced" },
  { value: "CONSUMPTION", label: "Energy Consumed" },
  { value: "STORAGE_CHARGE", label: "Battery Charging" },
  { value: "STORAGE_DISCHARGE", label: "Battery Discharging" },
]

function LogEnergyDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [logType, setLogType] = useState("PRODUCTION")
  const [sourceType, setSourceType] = useState("SOLAR")
  const [amountKwh, setAmountKwh] = useState("")
  const [pricePerKwh, setPricePerKwh] = useState("")
  const [co2SavedKg, setCo2SavedKg] = useState("")
  const [peakDemand, setPeakDemand] = useState(false)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!amountKwh) return
    setLoading(true)
    await fetch("/api/energy/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logType, sourceType,
        amountKwh: parseFloat(amountKwh),
        pricePerKwh: pricePerKwh ? parseFloat(pricePerKwh) : null,
        co2SavedKg: co2SavedKg ? parseFloat(co2SavedKg) : null,
        peakDemand,
        notes: notes || null,
      }),
    })
    setLoading(false)
    setOpen(false)
    setAmountKwh(""); setPricePerKwh(""); setCo2SavedKg(""); setNotes(""); setPeakDemand(false)
    onSaved()
  }

  const srcMeta = SOURCE_META[sourceType]
  const SrcIcon = srcMeta.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Log Energy</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Energy Activity</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Activity type</Label>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LOG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Energy source</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(SOURCE_META).map(([key, meta]) => {
                const Icon = meta.icon
                return (
                  <button
                    key={key}
                    onClick={() => setSourceType(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                      sourceType === key ? "border-violet-500/50 bg-violet-500/10" : "border-border"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", meta.color)} />
                    <span className="text-muted-foreground">{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount (kWh)</Label>
              <Input type="number" step="0.1" placeholder="e.g. 5.2" value={amountKwh} onChange={(e) => setAmountKwh(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Price/kWh (optional)</Label>
              <Input type="number" step="0.001" placeholder="e.g. 0.12" value={pricePerKwh} onChange={(e) => setPricePerKwh(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>CO₂ saved (kg, optional)</Label>
            <Input type="number" step="0.1" placeholder="e.g. 2.3" value={co2SavedKg} onChange={(e) => setCo2SavedKg(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPeakDemand(!peakDemand)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                peakDemand ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-border text-muted-foreground"
              )}
            >
              <Gauge className="h-4 w-4" />
              Peak demand
            </button>
            <p className="text-xs text-muted-foreground">Mark if during peak grid hours</p>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !amountKwh}>
            {loading ? "Saving..." : "Log entry · +10 FOUND (renewable)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EnergyPage() {
  const { data, mutate } = useSWR("/api/energy/logs?limit=100", fetcher)

  const logs: any[] = data?.logs ?? []
  const stats = data?.stats ?? { totalProduced: 0, totalConsumed: 0, totalCO2Saved: 0, renewableKwh: 0 }

  const renewablePct = stats.totalProduced > 0
    ? Math.round((stats.renewableKwh / stats.totalProduced) * 100)
    : 0

  const netEnergy = stats.totalProduced - stats.totalConsumed

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Decentralized Energy Grid</h1>
          </div>
          <p className="text-sm text-muted-foreground">Energy sovereignty for every community.</p>
        </div>
        <LogEnergyDialog onSaved={mutate} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold text-yellow-400">{stats.totalProduced.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">kWh produced</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold text-gray-400">{stats.totalConsumed.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">kWh consumed</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className={cn("text-xl font-bold", netEnergy >= 0 ? "text-emerald-400" : "text-red-400")}>
            {netEnergy >= 0 ? "+" : ""}{netEnergy.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">kWh net</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold text-emerald-400">{stats.totalCO2Saved.toFixed(1)} kg</p>
          <p className="text-xs text-muted-foreground mt-1">CO₂ saved</p>
        </CardContent></Card>
      </div>

      {/* Renewable breakdown */}
      {logs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium">Renewable share</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{renewablePct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                style={{ width: `${renewablePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{stats.renewableKwh.toFixed(1)} kWh renewable</span>
              <span>{(stats.totalProduced - stats.renewableKwh).toFixed(1)} kWh non-renewable</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
        </TabsList>

        {[
          { tab: "all", filter: null },
          { tab: "production", filter: "PRODUCTION" },
          { tab: "consumption", filter: "CONSUMPTION" },
        ].map(({ tab, filter }) => {
          const filtered = filter ? logs.filter((l) => l.logType === filter) : logs
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {filtered.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No logs yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Log renewable energy production to earn 10 FOUND per entry.</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {filtered.map((log: any) => {
                    const srcMeta = SOURCE_META[log.sourceType] ?? SOURCE_META.OTHER
                    const SrcIcon = srcMeta.icon
                    const logTypeMeta = LOG_TYPES.find((t) => t.value === log.logType)
                    return (
                      <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 px-3 py-2.5">
                        <SrcIcon className={cn("h-4 w-4 shrink-0", srcMeta.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{srcMeta.label}</span>
                            <Badge variant="outline" className="text-xs py-0">{logTypeMeta?.label ?? log.logType}</Badge>
                            {srcMeta.renewable && <Leaf className="h-3 w-3 text-emerald-400" />}
                            {log.peakDemand && <Badge variant="outline" className="text-xs py-0 text-amber-400 border-amber-500/30">Peak</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.recordedAt).toLocaleDateString()}
                            {log.pricePerKwh && ` · $${log.pricePerKwh}/kWh`}
                            {log.co2SavedKg && ` · ${log.co2SavedKg}kg CO₂ saved`}
                            {log.notes && ` · ${log.notes}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("text-sm font-bold", log.logType === "PRODUCTION" ? "text-yellow-400" : "text-gray-400")}>
                            {log.logType === "CONSUMPTION" ? "-" : "+"}{log.amountKwh} kWh
                          </p>
                          {log.pricePerKwh && (
                            <p className="text-xs text-muted-foreground">
                              ${(log.amountKwh * log.pricePerKwh).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
