"use client"
import { useState } from "react"
import useSWR from "swr"
import { TrendingUp, Plus, Sparkles, Trash2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORIES = ["HEALTH","EDUCATION","NUTRITION","ENERGY","INFRASTRUCTURE","GOVERNANCE","AGRICULTURE","WATER","OTHER"]
const EVIDENCE_LEVELS = [
  { value: "LOW", label: "Low", color: "text-red-400" },
  { value: "MEDIUM", label: "Medium", color: "text-yellow-400" },
  { value: "HIGH", label: "High", color: "text-emerald-400" },
  { value: "VERY_HIGH", label: "Very High", color: "text-blue-400" },
]

function roiColor(score: number) {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-green-400"
  if (score >= 40) return "text-yellow-400"
  if (score >= 20) return "text-orange-400"
  return "text-red-400"
}

function roiLabel(score: number) {
  if (score >= 85) return "Exceptional"
  if (score >= 70) return "Very High"
  if (score >= 55) return "High"
  if (score >= 40) return "Moderate"
  if (score >= 25) return "Low"
  return "Poor"
}

function AddInterventionDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [region, setRegion] = useState("")
  const [costUSD, setCostUSD] = useState("")
  const [description, setDescription] = useState("")
  const [evidenceLevel, setEvidenceLevel] = useState("MEDIUM")
  const [timelineYears, setTimelineYears] = useState("")
  const [beneficiaries, setBeneficiaries] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title || !category || !region || !costUSD || !description) return
    setLoading(true)
    await fetch("/api/economics/interventions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, category, region,
        costUSD: parseFloat(costUSD),
        description, evidenceLevel,
        timelineYears: timelineYears ? parseInt(timelineYears) : null,
        beneficiaries: beneficiaries ? parseInt(beneficiaries) : null,
      }),
    })
    setLoading(false)
    setOpen(false)
    setTitle(""); setCategory(""); setRegion(""); setCostUSD(""); setDescription("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add Intervention</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Development Intervention</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground pt-1">AI will score this using the Copenhagen Consensus methodology — ruthless ROI prioritization.</p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Intervention title</Label>
            <Input placeholder="e.g. Zinc supplementation for under-5s in Sub-Saharan Africa" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Evidence level</Label>
              <Select value={evidenceLevel} onValueChange={setEvidenceLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVIDENCE_LEVELS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Target region</Label>
            <Input placeholder="e.g. Sub-Saharan Africa, Southeast Asia, Global" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Cost (USD)</Label>
              <Input type="number" placeholder="1000000" value={costUSD} onChange={(e) => setCostUSD(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Timeline (yrs)</Label>
              <Input type="number" placeholder="5" value={timelineYears} onChange={(e) => setTimelineYears(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Beneficiaries</Label>
              <Input type="number" placeholder="10000" value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Describe the intervention, mechanism of action, and expected outcomes..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title || !category || !region || !costUSD || !description}>
            {loading ? "Scoring with AI (Copenhagen method)..." : "Add & score intervention"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EconomicsPage() {
  const { data, mutate } = useSWR("/api/economics/interventions", fetcher)
  const [deleting, setDeleting] = useState<string | null>(null)

  const interventions: any[] = data?.interventions ?? []
  const hasApiKey: boolean = data?.hasApiKey ?? false

  async function deleteIntervention(id: string) {
    setDeleting(id)
    await fetch(`/api/economics/interventions?id=${id}`, { method: "DELETE" })
    setDeleting(null)
    mutate()
  }

  const avgRoi = interventions.filter((i) => i.roiScore !== null).length > 0
    ? Math.round(interventions.filter((i) => i.roiScore !== null).reduce((s, i) => s + i.roiScore, 0) / interventions.filter((i) => i.roiScore !== null).length)
    : null

  const topIntervention = interventions.find((i) => i.roiScore !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Economic Blueprint</h1>
          </div>
          <p className="text-sm text-muted-foreground">Ruthless prioritization. Not ideology.</p>
        </div>
        <AddInterventionDialog onSaved={mutate} />
      </div>

      {!hasApiKey && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">AI scoring requires an API key</p>
              <p className="text-xs text-muted-foreground mt-1">Add your API key to get Copenhagen Consensus ROI scores. You can still log interventions manually.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{interventions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Interventions</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className={cn("text-2xl font-bold", avgRoi ? roiColor(avgRoi) : "text-muted-foreground")}>
            {avgRoi ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg ROI score</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {interventions.filter((i) => i.roiScore >= 80).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">High-ROI (&ge;80)</p>
        </CardContent></Card>
      </div>

      {interventions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No interventions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a development intervention to get an AI-powered ROI score using Copenhagen Consensus methodology.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interventions.map((item: any, idx: number) => {
            const evMeta = EVIDENCE_LEVELS.find((e) => e.value === item.evidenceLevel) ?? EVIDENCE_LEVELS[1]
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {idx === 0 && item.roiScore !== null && (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">#1 Priority</Badge>
                        )}
                        <p className="font-medium text-sm">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs py-0">{item.category.charAt(0) + item.category.slice(1).toLowerCase()}</Badge>
                        <span className="text-xs text-muted-foreground">{item.region}</span>
                        <span className={cn("text-xs font-medium", evMeta.color)}>Evidence: {evMeta.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.roiScore !== null && (
                        <div className="text-center">
                          <p className={cn("text-xl font-bold", roiColor(item.roiScore))}>{item.roiScore}</p>
                          <p className="text-xs text-muted-foreground">{roiLabel(item.roiScore)}</p>
                        </div>
                      )}
                      <button onClick={() => deleteIntervention(item.id)} disabled={deleting === item.id} className="p-1 text-muted-foreground/40 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.roiScore !== null && (
                    <div className="mb-3">
                      <Progress value={item.roiScore} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span>Cost: ${item.costUSD.toLocaleString()}</span>
                    {item.timelineYears && <span>· {item.timelineYears} years</span>}
                    {item.beneficiaries && <span>· {item.beneficiaries.toLocaleString()} beneficiaries</span>}
                    {item.beneficiaries && item.costUSD && (
                      <span className="text-emerald-400">· ${(item.costUSD / item.beneficiaries).toFixed(2)}/person</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>

                  {item.aiAnalysis && (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.aiAnalysis}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
