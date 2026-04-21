"use client"

import { useState } from "react"
import useSWR from "swr"
import { Pill, Plus, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { secureFetcher, encryptedPost } from "@/lib/encrypted-fetch"

const fetcher = secureFetcher

export default function MedicationsPage() {
  const { data, mutate } = useSWR("/api/health/entries?limit=100", fetcher)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [dose, setDose] = useState("")
  const [frequency, setFrequency] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const entries: any[] = (data?.entries ?? []).filter((e: any) => e.entryType === "MEDICATION")

  // Group by medication name
  const medMap: Record<string, { entries: any[]; lastTaken: string }> = {}
  for (const e of entries) {
    const d = JSON.parse(e.data || "{}")
    const name = d.name ?? "Unknown"
    if (!medMap[name]) medMap[name] = { entries: [], lastTaken: "" }
    medMap[name].entries.push({ ...e, parsedData: d })
    if (!medMap[name].lastTaken || new Date(e.recordedAt) > new Date(medMap[name].lastTaken)) {
      medMap[name].lastTaken = e.recordedAt
    }
  }

  async function logMedication() {
    if (!name) return
    setLoading(true)
    await encryptedPost("/api/health/entries", {
        entryType: "MEDICATION",
        data: { name, dose, frequency, taken: "yes" },
        notes: notes || null,
      })
    setLoading(false)
    setOpen(false)
    setName(""); setDose(""); setFrequency(""); setNotes("")
    mutate()
  }

  const today = new Date().toISOString().split("T")[0]
  const takenToday = entries.filter(e => e.recordedAt.split("T")[0] === today)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Medications</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track what you take. See your adherence over time.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Log Medication</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Log Medication</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Medication name</Label>
                <Input placeholder="e.g. Vitamin D, Metformin, Lisinopril" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Dose</Label>
                <Input placeholder="e.g. 50mg, 1000 IU, 2 tablets" value={dose} onChange={e => setDose(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Input placeholder="e.g. Daily, Twice daily, As needed" value={frequency} onChange={e => setFrequency(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Input placeholder="e.g. Take with food" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={logMedication} disabled={loading || !name}>
                {loading ? "Logging..." : "Log medication taken"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's status */}
      <Card className={cn("border-2", takenToday.length > 0 ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30")}>
        <CardContent className="p-4 flex items-center gap-4">
          {takenToday.length > 0 ? (
            <>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-700">Today's medications logged</p>
                <p className="text-xs text-muted-foreground">{takenToday.length} medication{takenToday.length > 1 ? "s" : ""} taken today</p>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-semibold text-amber-700">No medications logged today</p>
                <p className="text-xs text-muted-foreground">Log your medications to maintain your health routine</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active medications */}
      {Object.keys(medMap).length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Medications</h2>
          <div className="space-y-3">
            {Object.entries(medMap).map(([medName, data]) => {
              const latest = data.entries[0]?.parsedData
              const daysSinceLast = Math.floor((Date.now() - new Date(data.lastTaken).getTime()) / 86400000)

              return (
                <Card key={medName}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-500" />
                          <p className="font-medium">{medName}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {latest?.dose && <Badge variant="outline" className="text-xs">{latest.dose}</Badge>}
                          {latest?.frequency && <span className="text-xs text-muted-foreground">{latest.frequency}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{data.entries.length} logs</p>
                        <p className={cn("text-xs font-medium", daysSinceLast === 0 ? "text-emerald-500" : daysSinceLast <= 1 ? "text-amber-500" : "text-red-500")}>
                          {daysSinceLast === 0 ? "Taken today" : daysSinceLast === 1 ? "Yesterday" : `${daysSinceLast} days ago`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Pill className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No medications logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Track supplements, prescriptions, or any medication you take.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Privacy:</strong> Medication data is stored locally and encrypted. It is never shared with anyone — not insurance companies, not employers, not anyone. You can export or delete it anytime from Settings.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/report" className="text-sm text-rose-600 hover:underline">Health Report →</a>
      </div>
    </div>
  )
}
