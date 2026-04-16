"use client"
import { useState, useCallback } from "react"
import useSWR from "swr"
import { Landmark, Plus, Sparkles, Vote, User2, FileText, CheckSquare, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ENTITY_TYPES = [
  { value: "POLITICIAN", label: "Politician", icon: User2, color: "text-blue-400" },
  { value: "VOTE", label: "Vote Record", icon: Vote, color: "text-amber-400" },
  { value: "LEGISLATION", label: "Legislation", icon: FileText, color: "text-violet-400" },
  { value: "CIVIC_ACTION", label: "Civic Action", icon: CheckSquare, color: "text-emerald-400" },
]

const PARTIES = ["Democrat", "Republican", "Independent", "Green", "Libertarian", "Labour", "Conservative", "Other", "None/NA"]

function getTypeMeta(type: string) {
  return ENTITY_TYPES.find((t) => t.value === type) ?? ENTITY_TYPES[0]
}

function AddRecordDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [entityType, setEntityType] = useState("POLITICIAN")
  const [title, setTitle] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [party, setParty] = useState("")
  const [office, setOffice] = useState("")
  const [notes, setNotes] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title) return
    setLoading(true)
    await fetch("/api/governance/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, title, jurisdiction, party, office, notes, sourceUrl, data: {} }),
    })
    setLoading(false)
    setOpen(false)
    setTitle(""); setJurisdiction(""); setParty(""); setOffice(""); setNotes(""); setSourceUrl("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add Record</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Governance Record</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Record type</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title / Name</Label>
            <Input placeholder={entityType === "POLITICIAN" ? "e.g. Jane Smith" : "e.g. Infrastructure Bill 2024"} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {(entityType === "POLITICIAN" || entityType === "VOTE") && (
            <>
              <div className="space-y-1.5">
                <Label>Jurisdiction</Label>
                <Input placeholder="e.g. California, US Senate, EU Parliament" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Party</Label>
                <Select value={party} onValueChange={setParty}>
                  <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                  <SelectContent>{PARTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Office / Position</Label>
                <Input placeholder="e.g. Senator, Mayor, Representative" value={office} onChange={(e) => setOffice(e.target.value)} />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Key facts, voting record details, policy positions..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Source URL (optional)</Label>
            <Input placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title}>
            {loading ? "Saving..." : "Save record · +25 FOUND (first)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GovernancePage() {
  const { data, mutate } = useSWR("/api/governance/records", fetcher)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [localAnalysis, setLocalAnalysis] = useState<Record<string, string>>({})

  const records: any[] = data?.records ?? []

  async function analyzeRecord(recordId: string) {
    setAnalyzing(recordId)
    const res = await fetch("/api/governance/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId }),
    })
    const result = await res.json()
    setAnalyzing(null)
    if (result.analysis) {
      setLocalAnalysis((prev) => ({ ...prev, [recordId]: result.analysis }))
      mutate()
    }
  }

  async function deleteRecord(id: string) {
    setDeleting(id)
    await fetch(`/api/governance/records?id=${id}`, { method: "DELETE" })
    setDeleting(null)
    mutate()
  }

  const byType = ENTITY_TYPES.reduce((acc, t) => {
    acc[t.value] = records.filter((r) => r.entityType === t.value)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Governance Transparency</h1>
          </div>
          <p className="text-sm text-muted-foreground">Radical transparency. Zero capture.</p>
        </div>
        <AddRecordDialog onSaved={mutate} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {ENTITY_TYPES.map((t) => {
          const Icon = t.icon
          return (
            <Card key={t.value}><CardContent className="p-4 text-center">
              <Icon className={cn("h-5 w-5 mx-auto mb-1", t.color)} />
              <p className="text-xl font-bold">{byType[t.value]?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t.label}s</p>
            </CardContent></Card>
          )
        })}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {ENTITY_TYPES.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>

        {["all", ...ENTITY_TYPES.map((t) => t.value)].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
            {(tab === "all" ? records : byType[tab] ?? []).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Landmark className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No records yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Track politicians, votes, legislation, and your civic actions.</p>
                </CardContent>
              </Card>
            ) : (
              (tab === "all" ? records : byType[tab]).map((record: any) => {
                const meta = getTypeMeta(record.entityType)
                const Icon = meta.icon
                const analysis = localAnalysis[record.id] || record.aiAnalysis
                return (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.color)} />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{record.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <Badge variant="outline" className="text-xs py-0">{meta.label}</Badge>
                              {record.party && <Badge variant="outline" className="text-xs py-0">{record.party}</Badge>}
                              {record.jurisdiction && <span className="text-xs text-muted-foreground">{record.jurisdiction}</span>}
                              {record.office && <span className="text-xs text-muted-foreground">· {record.office}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {record.sourceUrl && (
                            <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-muted-foreground/50 hover:text-muted-foreground">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button onClick={() => deleteRecord(record.id)} disabled={deleting === record.id} className="p-1 text-muted-foreground/40 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {record.notes && <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{record.notes}</p>}

                      {analysis ? (
                        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 mt-2">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{analysis}</p>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="mt-2 text-xs h-7" onClick={() => analyzeRecord(record.id)} disabled={analyzing === record.id}>
                          <Sparkles className="h-3 w-3" />
                          {analyzing === record.id ? "Analyzing..." : "AI neutral analysis"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
