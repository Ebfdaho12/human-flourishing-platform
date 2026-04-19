"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Shield, Plus, Eye, EyeOff, Send, CheckCircle, XCircle, Clock,
  Stethoscope, FileText, User2, ChevronDown, ChevronUp
} from "lucide-react"
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

const SPECIALTIES = [
  { value: "CARDIOLOGY", label: "Cardiology" },
  { value: "NEUROLOGY", label: "Neurology" },
  { value: "DERMATOLOGY", label: "Dermatology" },
  { value: "ENDOCRINOLOGY", label: "Endocrinology" },
  { value: "GASTRO", label: "Gastroenterology" },
  { value: "ORTHOPEDIC", label: "Orthopedic" },
  { value: "PULMONARY", label: "Pulmonary" },
  { value: "PSYCHIATRY", label: "Psychiatry" },
  { value: "GENERAL", label: "General Medicine" },
  { value: "OTHER", label: "Other" },
]

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: "Open", color: "text-emerald-500", icon: Eye },
  IN_REVIEW: { label: "In Review", color: "text-amber-500", icon: Clock },
  MATCHED: { label: "Matched", color: "text-violet-500", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "text-muted-foreground", icon: EyeOff },
}

function CreateCaseDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [timeline, setTimeline] = useState("")
  const [priorTreatment, setPriorTreatment] = useState("")
  const [seekingHelp, setSeekingHelp] = useState("")
  const [ageRange, setAgeRange] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title || !specialty || !symptoms) return
    setLoading(true)
    await fetch("/api/health/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, specialty, symptoms, timeline,
        priorTreatment, seekingHelp,
        demographics: ageRange ? { ageRange } : null,
      }),
    })
    setLoading(false)
    setOpen(false)
    setTitle(""); setSpecialty(""); setSymptoms(""); setTimeline("")
    setPriorTreatment(""); setSeekingHelp(""); setAgeRange("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Share Anonymous Case</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Share Anonymous Health Case
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
          Your identity is completely anonymous. Practitioners will only see your symptoms and health data — never your name, email, or any identifying information. You control what to share.
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Case title (brief summary)</Label>
            <Input placeholder="e.g. Chronic fatigue with unexplained weight gain" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Medical specialty needed</Label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Symptoms & concerns</Label>
            <Textarea placeholder="Describe your symptoms in detail. Include severity, frequency, and what makes them better or worse..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="min-h-[100px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Timeline (optional)</Label>
            <Input placeholder="e.g. Started 6 months ago, gradually worsening" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>What have you already tried? (optional)</Label>
            <Textarea placeholder="Previous treatments, medications, lifestyle changes..." value={priorTreatment} onChange={(e) => setPriorTreatment(e.target.value)} className="min-h-[60px]" />
          </div>
          <div className="space-y-1.5">
            <Label>What kind of help are you looking for? (optional)</Label>
            <Input placeholder="e.g. Root cause diagnosis, treatment options, second opinion" value={seekingHelp} onChange={(e) => setSeekingHelp(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Age range (optional, helps practitioners)</Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-45">36-45</SelectItem>
                <SelectItem value="46-55">46-55</SelectItem>
                <SelectItem value="56-65">56-65</SelectItem>
                <SelectItem value="65+">65+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title || !specialty || !symptoms}>
            {loading ? "Sharing anonymously..." : "Share case anonymously"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SubmitProposalDialog({ caseId, caseTitle, onSaved }: { caseId: string; caseTitle: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [credentials, setCredentials] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [proposedTreatment, setProposedTreatment] = useState("")
  const [rootCauseTheory, setRootCauseTheory] = useState("")
  const [evidence, setEvidence] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!credentials || !analysis || !proposedTreatment) return
    setLoading(true)
    await fetch("/api/health/cases/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, credentials, analysis, proposedTreatment, rootCauseTheory, evidence }),
    })
    setLoading(false)
    setOpen(false)
    setCredentials(""); setAnalysis(""); setProposedTreatment(""); setRootCauseTheory(""); setEvidence("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Stethoscope className="h-3.5 w-3.5" /> Propose Treatment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Treatment Proposal</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">For: "{caseTitle}"</p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Your credentials</Label>
            <Input placeholder="e.g. Board-certified endocrinologist, 12 years experience" value={credentials} onChange={(e) => setCredentials(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Your analysis of this case</Label>
            <Textarea placeholder="Based on the symptoms described, my analysis is..." value={analysis} onChange={(e) => setAnalysis(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Root cause theory (optional)</Label>
            <Textarea placeholder="What do you believe is the underlying cause?" value={rootCauseTheory} onChange={(e) => setRootCauseTheory(e.target.value)} className="min-h-[60px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Proposed treatment approach</Label>
            <Textarea placeholder="Recommended treatment, lifestyle changes, further testing..." value={proposedTreatment} onChange={(e) => setProposedTreatment(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Supporting evidence / research (optional)</Label>
            <Textarea placeholder="Links to studies, clinical guidelines, or evidence base..." value={evidence} onChange={(e) => setEvidence(e.target.value)} className="min-h-[60px]" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !credentials || !analysis || !proposedTreatment}>
            {loading ? "Submitting..." : "Submit proposal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function HealthCasesPage() {
  const [specialty, setSpecialty] = useState("")
  const { data: browseData, mutate: mutateBrowse } = useSWR(
    `/api/health/cases?view=browse${specialty ? `&specialty=${specialty}` : ""}`,
    fetcher
  )
  const { data: myData, mutate: mutateMine } = useSWR("/api/health/cases?view=mine", fetcher)

  const browseCases: any[] = browseData?.cases ?? []
  const myCases: any[] = myData?.cases ?? []

  const refreshAll = () => { mutateBrowse(); mutateMine() }

  const [expandedCase, setExpandedCase] = useState<string | null>(null)

  async function respondToProposal(proposalId: string, action: "ACCEPTED" | "DECLINED") {
    await fetch("/api/health/cases/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId, action }),
    })
    refreshAll()
  }

  async function deleteCase(id: string) {
    await fetch(`/api/health/cases?id=${id}`, { method: "DELETE" })
    refreshAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Anonymous Health Cases</h1>
          </div>
          <p className="text-sm text-muted-foreground">ZK-protected. Your identity is never revealed unless you choose.</p>
        </div>
        <CreateCaseDialog onSaved={refreshAll} />
      </div>

      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">How it works:</strong></p>
          <p>1. <strong>Patients</strong> share anonymized health cases — symptoms, timeline, what you've tried</p>
          <p>2. <strong>Practitioners</strong> browse cases in their specialty and submit treatment proposals with evidence</p>
          <p>3. <strong>Patients review proposals</strong> — accept the reasoning? Reveal your contact to that practitioner only</p>
          <p>4. Your identity is ZK-proven (you're a real user) but <strong>never revealed</strong> until you consent</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Cases</TabsTrigger>
          <TabsTrigger value="mine">My Cases ({myCases.length})</TabsTrigger>
        </TabsList>

        {/* Browse open cases (practitioner view) */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All specialties" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All specialties</SelectItem>
                {SPECIALTIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{browseCases.length} open cases</p>
          </div>

          {browseCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No open cases{specialty ? " in this specialty" : ""}.</p>
                <p className="text-xs text-muted-foreground mt-1">Share your own case to get practitioner input.</p>
              </CardContent>
            </Card>
          ) : (
            browseCases.map((c: any) => {
              const expanded = expandedCase === c.id
              const statusMeta = STATUS_META[c.status] ?? STATUS_META.OPEN
              const demographics = c.demographics ? JSON.parse(c.demographics) : null
              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <Badge variant="outline" className="text-xs py-0">{SPECIALTIES.find((s) => s.value === c.specialty)?.label ?? c.specialty}</Badge>
                          <span className={cn("text-xs", statusMeta.color)}>{statusMeta.label}</span>
                          {demographics?.ageRange && <span className="text-xs text-muted-foreground">Age: {demographics.ageRange}</span>}
                          <span className="text-xs text-muted-foreground">{c._count.proposals} proposals</span>
                        </div>
                      </div>
                      <button onClick={() => setExpandedCase(expanded ? null : c.id)} className="p-1 text-muted-foreground">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.symptoms}</p>

                    {expanded && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        {c.timeline && <p className="text-xs text-muted-foreground"><strong>Timeline:</strong> {c.timeline}</p>}
                        {c.priorTreatment && <p className="text-xs text-muted-foreground"><strong>Prior treatment:</strong> {c.priorTreatment}</p>}
                        {c.seekingHelp && <p className="text-xs text-muted-foreground"><strong>Seeking:</strong> {c.seekingHelp}</p>}
                        <div className="pt-2">
                          <SubmitProposalDialog caseId={c.id} caseTitle={c.title} onSaved={refreshAll} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* My cases (patient view) */}
        <TabsContent value="mine" className="mt-4 space-y-4">
          {myCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No cases shared yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Share an anonymous health case to get practitioner input.</p>
              </CardContent>
            </Card>
          ) : (
            myCases.map((c: any) => {
              const statusMeta = STATUS_META[c.status] ?? STATUS_META.OPEN
              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className="text-xs py-0">{SPECIALTIES.find((s) => s.value === c.specialty)?.label}</Badge>
                          <span className={cn("text-xs font-medium", statusMeta.color)}>{statusMeta.label}</span>
                          <span className="text-xs text-muted-foreground">Anonymous ID: {c.anonId.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteCase(c.id)}>Close</Button>
                    </div>

                    {/* Proposals received */}
                    {c.proposals.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No proposals yet. Practitioners are reviewing your case.</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-medium">{c.proposals.length} proposal{c.proposals.length > 1 ? "s" : ""} received:</p>
                        {c.proposals.map((p: any) => (
                          <div key={p.id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Stethoscope className="h-3.5 w-3.5 text-teal-500" />
                              <span className="text-xs font-medium">{p.credentials}</span>
                              <Badge variant="outline" className={cn("text-[10px] py-0",
                                p.status === "ACCEPTED" ? "border-emerald-300 text-emerald-600" :
                                p.status === "DECLINED" ? "border-red-300 text-red-600" :
                                "border-amber-300 text-amber-600"
                              )}>
                                {p.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1"><strong>Analysis:</strong> {p.analysis}</p>
                            {p.rootCauseTheory && <p className="text-xs text-muted-foreground mb-1"><strong>Root cause:</strong> {p.rootCauseTheory}</p>}
                            <p className="text-xs text-muted-foreground mb-1"><strong>Treatment:</strong> {p.proposedTreatment}</p>
                            {p.evidence && <p className="text-xs text-muted-foreground mb-1"><strong>Evidence:</strong> {p.evidence}</p>}

                            {p.status === "PENDING" && (
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => respondToProposal(p.id, "ACCEPTED")}>
                                  <CheckCircle className="h-3 w-3" /> Accept & Connect
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => respondToProposal(p.id, "DECLINED")}>
                                  <XCircle className="h-3 w-3" /> Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
