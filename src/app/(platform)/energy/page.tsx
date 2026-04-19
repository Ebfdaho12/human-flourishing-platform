"use client"
import { useState } from "react"
import useSWR from "swr"
import { Zap, Plus, Sun, Wind, Droplets, Battery, Plug, Gauge, Leaf, Globe2, Thermometer, ExternalLink, ArrowUpDown, TrendingUp, DollarSign } from "lucide-react"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

      {/* Learn about energy */}
      <a href="/energy/learn" className="block">
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 card-hover">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">How does P2P energy trading work?</p>
              <p className="text-xs text-amber-600">Learn how to sell your solar energy to neighbors, calculate your ROI, and understand the decentralized grid</p>
            </div>
            <ExternalLink className="h-4 w-4 text-amber-400 shrink-0" />
          </CardContent>
        </Card>
      </a>

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
          <TabsTrigger value="trading">P2P Trading</TabsTrigger>
          <TabsTrigger value="climate">Climate Data</TabsTrigger>
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
        <TabsContent value="trading" className="mt-4">
          <P2PTradingPanel />
        </TabsContent>

        <TabsContent value="climate" className="mt-4">
          <ClimateDataPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function P2PTradingPanel() {
  const { data, mutate: mutateTrading } = useSWR("/api/energy/trading", fetcher)
  const [tradeKwh, setTradeKwh] = useState("")
  const [tradePrice, setTradePrice] = useState("")
  const [tradeAction, setTradeAction] = useState<"BUY" | "SELL">("BUY")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  if (!data) return <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Loading market data...</CardContent></Card>

  const { userPosition, market, recentTrades, priceHistory } = data

  async function executeTrade() {
    if (!tradeKwh || !tradePrice) return
    setLoading(true)
    setMessage("")
    const res = await fetch("/api/energy/trading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: tradeAction, kwh: parseFloat(tradeKwh), pricePerKwh: parseFloat(tradePrice) }),
    })
    const result = await res.json()
    setLoading(false)
    setMessage(result.message ?? result.error)
    setTradeKwh(""); setTradePrice("")
    mutateTrading()
  }

  return (
    <div className="space-y-4">
      {/* Market overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Market Price</p>
          <p className="text-lg font-bold text-amber-500">${market.currentPrice}/kWh</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Renewable Premium</p>
          <p className="text-lg font-bold text-emerald-500">${market.renewablePrice}/kWh</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Active Listings</p>
          <p className="text-lg font-bold">{market.totalListings}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">24h Volume</p>
          <p className="text-lg font-bold">{market.totalVolume} kWh</p>
        </CardContent></Card>
      </div>

      {/* Price chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            24h Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-[2px] h-20">
            {priceHistory.map((p: any, i: number) => {
              const min = Math.min(...priceHistory.map((x: any) => x.price))
              const max = Math.max(...priceHistory.map((x: any) => x.price))
              const range = max - min || 0.01
              const height = Math.max(8, ((p.price - min) / range) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 transition-colors"
                  style={{ height: `${height}%`, opacity: 0.6 + (i / priceHistory.length) * 0.4 }}
                  title={`${p.hour}: $${p.price}/kWh`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{priceHistory[0]?.hour}</span>
            <span>{priceHistory[priceHistory.length - 1]?.hour}</span>
          </div>
        </CardContent>
      </Card>

      {/* Trade form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-violet-500" />
            Place Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-muted-foreground">Your surplus: <strong className="text-foreground">{userPosition.surplus} kWh</strong></p>
            <p className="text-xs text-muted-foreground">· Renewable: <strong className="text-emerald-500">{userPosition.renewablePct}%</strong></p>
          </div>

          {message && (
            <div className={cn("rounded-lg px-3 py-2 text-xs", message.includes("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200")}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTradeAction("BUY")}
              className={cn("rounded-lg border p-3 text-center text-sm font-medium transition-colors", tradeAction === "BUY" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground")}
            >Buy Energy</button>
            <button
              onClick={() => setTradeAction("SELL")}
              className={cn("rounded-lg border p-3 text-center text-sm font-medium transition-colors", tradeAction === "SELL" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-border text-muted-foreground")}
            >Sell Energy</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount (kWh)</Label>
              <Input type="number" step="0.1" placeholder="e.g. 10" value={tradeKwh} onChange={(e) => setTradeKwh(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Price ($/kWh)</Label>
              <Input type="number" step="0.01" placeholder={`e.g. ${market.currentPrice}`} value={tradePrice} onChange={(e) => setTradePrice(e.target.value)} />
            </div>
          </div>

          {tradeKwh && tradePrice && (
            <p className="text-xs text-muted-foreground">
              Total: <strong>${(parseFloat(tradeKwh) * parseFloat(tradePrice)).toFixed(2)}</strong>
              {" · "}Reward: <strong className="text-violet-600">{Math.round(parseFloat(tradeKwh) * 2)} FOUND</strong>
            </p>
          )}

          <Button onClick={executeTrade} disabled={loading || !tradeKwh || !tradePrice} className="w-full">
            <DollarSign className="h-4 w-4" />
            {loading ? "Executing..." : `${tradeAction === "BUY" ? "Buy" : "Sell"} ${tradeKwh || "0"} kWh`}
          </Button>
        </CardContent>
      </Card>

      {/* Recent trades */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Community Trades</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {recentTrades.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px] py-0", t.type === "SELL" ? "border-amber-300 text-amber-600" : "border-emerald-300 text-emerald-600")}>{t.type}</Badge>
                  <span>{t.kwh} kWh</span>
                  <span className="text-xs text-muted-foreground">({t.source})</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">${t.price}/kWh</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>P2P Energy Trading:</strong> In production, this marketplace connects energy producers directly with consumers.
            Solar panel owners sell surplus. Neighbors buy at below-grid rates. Smart contracts handle settlement in FOUND tokens.
            No utility middlemen. Energy sovereignty for every community.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ClimateDataPanel() {
  const { data } = useSWR("/api/energy/climate-bridge", fetcher)

  if (!data) return <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Loading climate data...</CardContent></Card>

  const connected = data.connected
  const climateData: any[] = data.climate?.data ?? data.climate?.indicators ?? []

  return (
    <div className="space-y-4">
      {!connected && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3 flex items-start gap-2">
            <Globe2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">{data.climate?.note ?? "Start Aletheia on port 3001 for live NOAA/NASA climate data."}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {climateData.map((item: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">{item.name ?? item.metric}</p>
              </div>
              <p className="text-2xl font-bold">{item.latest ?? item.value ?? "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{item.source}</span>
                <span className="text-xs text-muted-foreground">{item.period ?? item.year}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connected && (
        <p className="text-xs text-center text-muted-foreground">Live data from Aletheia — NOAA, NASA, and peer-reviewed climate datasets</p>
      )}

      <Card className="border-sky-200 bg-sky-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your personal energy data connects to global climate context. Every kWh of renewable energy you produce contributes
            to the transition. Track your impact alongside real-world environmental data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
