"use client"
import { useState } from "react"
import useSWR from "swr"
import { FlaskConical, Plus, Sparkles, RefreshCw, Star, CheckCircle, XCircle, MinusCircle, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const FIELDS = ["Biology","Chemistry","Physics","Psychology","Economics","Medicine","Computer Science","Sociology","Neuroscience","Climate Science","Nutrition","Other"]
const STATUS_META: Record<string, { label: string; color: string }> = {
  PRE_REGISTERED: { label: "Pre-registered", color: "text-blue-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400" },
  COMPLETED: { label: "Completed", color: "text-emerald-400" },
  PEER_REVIEWED: { label: "Peer Reviewed", color: "text-violet-400" },
}
const OUTCOME_META: Record<string, { label: string; icon: any; color: string }> = {
  CONFIRMED: { label: "Confirmed", icon: CheckCircle, color: "text-emerald-400" },
  REFUTED: { label: "Refuted", icon: XCircle, color: "text-red-400" },
  INCONCLUSIVE: { label: "Inconclusive", icon: MinusCircle, color: "text-yellow-400" },
}

function PreRegisterDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [field, setField] = useState("")
  const [hypothesis, setHypothesis] = useState("")
  const [methodology, setMethodology] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title || !field || !hypothesis || !methodology) return
    setLoading(true)
    await fetch("/api/desci/studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, field, hypothesis, methodology, isPublic }),
    })
    setLoading(false)
    setOpen(false)
    setTitle(""); setField(""); setHypothesis(""); setMethodology("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Pre-register Study</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Pre-register Research Study</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">Pre-registration locks in your hypothesis before data collection — the cornerstone of reproducible science.</p>
          <div className="space-y-1.5">
            <Label>Study title</Label>
            <Input placeholder="e.g. Effect of sleep duration on cognitive performance" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>{FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Hypothesis</Label>
            <Textarea placeholder="State your specific, testable hypothesis before collecting any data..." value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} className="min-h-[100px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Methodology</Label>
            <Textarea placeholder="Describe your study design, sample size, controls, measurement approach, and analysis plan..." value={methodology} onChange={(e) => setMethodology(e.target.value)} className="min-h-[100px]" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors", isPublic ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-border text-muted-foreground")}
            >
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {isPublic ? "Public" : "Private"}
            </button>
            <p className="text-xs text-muted-foreground">{isPublic ? "Visible to other researchers for replication" : "Only visible to you"}</p>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title || !field || !hypothesis || !methodology}>
            {loading ? "Pre-registering... (AI review running)" : "Pre-register · +100 FOUND"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReplicationDialog({ studyId, studyTitle, onSaved }: { studyId: string; studyTitle: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!outcome) return
    setLoading(true)
    await fetch("/api/desci/replications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId, outcome, notes }),
    })
    setLoading(false)
    setOpen(false)
    setOutcome(""); setNotes("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-7"><RefreshCw className="h-3 w-3" /> Replicate</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Submit Replication</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground pt-1">"{studyTitle}"</p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Confirmed — results replicated</SelectItem>
                <SelectItem value="REFUTED">Refuted — results did not replicate</SelectItem>
                <SelectItem value="INCONCLUSIVE">Inconclusive — mixed results</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Describe your replication methodology and key findings..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !outcome}>
            {loading ? "Submitting..." : "Submit replication · +75 FOUND"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReviewDialog({ studyId, studyTitle, onSaved }: { studyId: string; studyTitle: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [quality, setQuality] = useState([3])
  const [rigor, setRigor] = useState([3])
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!comments) return
    setLoading(true)
    await fetch("/api/desci/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId, quality: quality[0], rigor: rigor[0], comments }),
    })
    setLoading(false)
    setOpen(false)
    setComments("")
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-7"><Star className="h-3 w-3" /> Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Peer Review</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground pt-1">"{studyTitle}"</p>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Methodology quality: <span className="font-bold text-foreground">{quality[0]}/5</span></Label>
            <Slider min={1} max={5} step={1} value={quality} onValueChange={setQuality} />
          </div>
          <div className="space-y-2">
            <Label>Statistical rigor: <span className="font-bold text-foreground">{rigor[0]}/5</span></Label>
            <Slider min={1} max={5} step={1} value={rigor} onValueChange={setRigor} />
          </div>
          <div className="space-y-1.5">
            <Label>Review comments</Label>
            <Textarea placeholder="Provide constructive feedback on methodology, analysis, and conclusions..." value={comments} onChange={(e) => setComments(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !comments}>
            {loading ? "Submitting..." : "Submit review · +50 FOUND"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DesciPage() {
  const { data: myData, mutate: mutateMine } = useSWR("/api/desci/studies?view=mine", fetcher)
  const { data: pubData, mutate: mutatePublic } = useSWR("/api/desci/studies?view=public", fetcher)

  const myStudies: any[] = myData?.studies ?? []
  const publicStudies: any[] = pubData?.studies ?? []
  const refreshAll = () => { mutateMine(); mutatePublic() }

  const stats = {
    preRegistered: myStudies.filter((s) => s.status === "PRE_REGISTERED").length,
    completed: myStudies.filter((s) => s.status === "COMPLETED" || s.status === "PEER_REVIEWED").length,
    public: myStudies.filter((s) => s.isPublic).length,
  }

  function StudyCard({ study, showActions }: { study: any; showActions: boolean }) {
    const statusMeta = STATUS_META[study.status] ?? STATUS_META.PRE_REGISTERED
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-medium text-sm">{study.title}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <Badge variant="outline" className="text-xs py-0">{study.field}</Badge>
                <span className={cn("text-xs font-medium", statusMeta.color)}>{statusMeta.label}</span>
                {study.isPublic ? <Globe className="h-3 w-3 text-muted-foreground/50" /> : <Lock className="h-3 w-3 text-muted-foreground/50" />}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span>{study._count?.replications ?? 0} rep.</span>
              <span>{study._count?.reviews ?? 0} rev.</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            <span className="font-medium text-foreground/70">H: </span>{study.hypothesis}
          </p>

          {study.aiReview && (
            <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-2.5 mb-2">
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{study.aiReview}</p>
              </div>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 mt-2">
              <ReplicationDialog studyId={study.id} studyTitle={study.title} onSaved={refreshAll} />
              <ReviewDialog studyId={study.id} studyTitle={study.title} onSaved={refreshAll} />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-green-600">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">DeSci Platform</h1>
          </div>
          <p className="text-sm text-muted-foreground">Fix science. Fund truth.</p>
        </div>
        <PreRegisterDialog onSaved={refreshAll} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.preRegistered}</p>
          <p className="text-xs text-muted-foreground mt-1">Pre-registered</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-teal-400">{publicStudies.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Public studies</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My Studies</TabsTrigger>
          <TabsTrigger value="public">Public Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4 space-y-3">
          {myStudies.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <FlaskConical className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No studies pre-registered yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Pre-registering earns 100 FOUND and gets an AI methodology review.</p>
            </CardContent></Card>
          ) : myStudies.map((s) => <StudyCard key={s.id} study={s} showActions={false} />)}
        </TabsContent>

        <TabsContent value="public" className="mt-4 space-y-3">
          {publicStudies.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No public studies yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Pre-register your first public study to start the registry.</p>
            </CardContent></Card>
          ) : publicStudies.map((s) => <StudyCard key={s.id} study={s} showActions={s.userId !== undefined} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
