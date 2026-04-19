"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Watch, Upload, CheckCircle, AlertCircle, Smartphone, Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HealthImportPage() {
  const { data: providersData } = useSWR("/api/health/wearables", fetcher)
  const [source, setSource] = useState("")
  const [jsonInput, setJsonInput] = useState("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const providers = providersData?.providers ?? []
  const importCounts = providersData?.importCounts ?? {}

  async function handleImport() {
    if (!source || !jsonInput) return
    setImporting(true)
    setResult(null)

    try {
      const entries = JSON.parse(jsonInput)
      const res = await fetch("/api/health/wearables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, entries: Array.isArray(entries) ? entries : [entries] }),
      })
      const data = await res.json()
      setResult(data)
      if (data.imported > 0) setJsonInput("")
    } catch (e) {
      setResult({ error: "Invalid JSON format. Please check your data." })
    }

    setImporting(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Watch className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Import Health Data</h1>
        </div>
        <p className="text-sm text-muted-foreground">Import data from wearables and health apps. Your data stays yours.</p>
      </div>

      {/* Supported providers */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Supported Sources</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {providers.map((p: any) => {
            const count = importCounts[p.id] ?? 0
            return (
              <Card key={p.id} className={cn("card-hover cursor-pointer", source === p.id && "border-violet-300 bg-violet-50/30")} onClick={() => setSource(p.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    {count > 0 && <Badge variant="outline" className="text-[10px]">{count} imported</Badge>}
                  </div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Import form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-violet-500" />
            Import Data
          </CardTitle>
          <CardDescription>
            Paste your exported health data as JSON. Each entry needs a "type" and "data" field.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {providers.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>JSON Data</Label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "type": "heart_rate",\n    "data": { "heartRate": 72 },\n    "date": "2026-04-18T10:00:00Z"\n  },\n  {\n    "type": "steps",\n    "data": { "steps": 8500 },\n    "date": "2026-04-18T23:59:00Z"\n  }\n]`}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          {result && (
            <div className={cn("rounded-lg p-3 text-sm", result.error ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200")}>
              {result.error ? (
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {result.error}</div>
              ) : (
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {result.message}</div>
              )}
            </div>
          )}

          <Button onClick={handleImport} disabled={importing || !source || !jsonInput} className="w-full">
            {importing ? "Importing..." : "Import data"}
          </Button>
        </CardContent>
      </Card>

      {/* Format reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Format Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium mb-1">Supported types:</p>
              <div className="flex flex-wrap gap-1">
                {["heart_rate", "blood_pressure", "steps", "weight", "sleep", "exercise", "calories", "spo2", "temperature", "stress", "hrv"].map(t => (
                  <code key={t} className="bg-muted px-1.5 py-0.5 rounded">{t}</code>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Example entry:</p>
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto">{`{
  "type": "heart_rate",
  "data": { "heartRate": 72, "source": "apple_watch" },
  "date": "2026-04-18T10:30:00Z",
  "notes": "Resting heart rate"
}`}</pre>
            </div>
            <p className="text-muted-foreground">Maximum 500 entries per import. All data is stored locally and encrypted.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/dashboard" className="text-sm text-rose-600 hover:underline">Health Dashboard →</a>
      </div>
    </div>
  )
}
