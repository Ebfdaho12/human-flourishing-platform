"use client"
import { useState } from "react"
import useSWR from "swr"
import { Building2, Plus, Sparkles, Trash2, MapPin, Calendar, DollarSign, Globe2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PROJECT_TYPES = ["ROAD","BRIDGE","BUILDING","WATER","ENERGY","DIGITAL","SANITATION","OTHER"]
const CLIMATE_ZONES = ["Tropical","Arid","Semi-arid","Temperate","Continental","Polar","Highland"]
const QUALITY_TIERS = [
  { value: "MINIMUM", label: "Minimum Spec", color: "text-red-400", desc: "Lowest upfront cost, highest lifecycle cost" },
  { value: "STANDARD", label: "Standard", color: "text-amber-400", desc: "Balanced cost and durability" },
  { value: "PREMIUM", label: "Premium", color: "text-emerald-400", desc: "Higher upfront, lowest lifecycle cost" },
]
const STATUS_META: Record<string, { label: string; color: string }> = {
  PLANNED: { label: "Planned", color: "text-blue-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400" },
  COMPLETED: { label: "Completed", color: "text-emerald-400" },
  MAINTENANCE: { label: "Maintenance", color: "text-violet-400" },
}

function AddProjectDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [projectType, setProjectType] = useState("")
  const [location, setLocation] = useState("")
  const [climateZone, setClimateZone] = useState("")
  const [budgetUSD, setBudgetUSD] = useState("")
  const [lifespanYears, setLifespanYears] = useState("")
  const [qualityTier, setQualityTier] = useState("STANDARD")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name || !projectType || !location) return
    setLoading(true)
    await fetch("/api/infrastructure/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, projectType, location,
        climateZone: climateZone || null,
        budgetUSD: budgetUSD || null,
        lifespanYears: lifespanYears ? parseInt(lifespanYears) : null,
        qualityTier,
      }),
    })
    setLoading(false)
    setOpen(false)
    setName(""); setProjectType(""); setLocation(""); setBudgetUSD(""); setLifespanYears("")
    onSaved()
  }

  const selectedTier = QUALITY_TIERS.find((t) => t.value === qualityTier)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Add Project</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Infrastructure Project</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground pt-1">AI will calculate Total Cost of Ownership across quality tiers to prove that quality is the cheapest option.</p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Project name</Label>
            <Input placeholder="e.g. Rural highway expansion — Nairobi to Mombasa" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Climate zone</Label>
              <Select value={climateZone} onValueChange={setClimateZone}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CLIMATE_ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="e.g. Nairobi, Kenya" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Budget (USD)</Label>
              <Input type="number" placeholder="5000000" value={budgetUSD} onChange={(e) => setBudgetUSD(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Design lifespan (yrs)</Label>
              <Input type="number" placeholder="30" value={lifespanYears} onChange={(e) => setLifespanYears(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quality tier</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {QUALITY_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setQualityTier(tier.value)}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-colors",
                    qualityTier === tier.value ? "border-violet-500/50 bg-violet-500/10" : "border-border"
                  )}
                >
                  <p className={cn("text-xs font-medium", tier.color)}>{tier.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !name || !projectType || !location}>
            {loading ? "Running TCO analysis..." : "Add project · AI TCO analysis"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InfrastructurePage() {
  const { data, mutate } = useSWR("/api/infrastructure/projects", fetcher)
  const [deleting, setDeleting] = useState<string | null>(null)

  const projects: any[] = data?.projects ?? []
  const hasApiKey: boolean = data?.hasApiKey ?? false

  async function deleteProject(id: string) {
    setDeleting(id)
    await fetch(`/api/infrastructure/projects?id=${id}`, { method: "DELETE" })
    setDeleting(null)
    mutate()
  }

  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetUSD ?? 0), 0)
  const totalSavings = projects.reduce((sum, p) => sum + (p.tcoSavingsUSD ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Infrastructure Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground">Build it right. Build it once.</p>
        </div>
        <AddProjectDialog onSaved={mutate} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{projects.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Projects tracked</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-lg font-bold text-blue-400">
            {totalBudget > 0 ? `$${(totalBudget / 1e6).toFixed(1)}M` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total budget</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-lg font-bold text-emerald-400">
            {totalSavings > 0 ? `$${(totalSavings / 1e6).toFixed(1)}M` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">TCO savings</p>
        </CardContent></Card>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add an infrastructure project to get an AI-powered Total Cost of Ownership analysis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => {
            const statusMeta = STATUS_META[project.status] ?? STATUS_META.PLANNED
            const tierMeta = QUALITY_TIERS.find((t) => t.value === project.qualityTier) ?? QUALITY_TIERS[1]
            return (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{project.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <Badge variant="outline" className="text-xs py-0">{project.projectType.charAt(0) + project.projectType.slice(1).toLowerCase()}</Badge>
                        <span className={cn("text-xs font-medium", statusMeta.color)}>{statusMeta.label}</span>
                        <span className={cn("text-xs font-medium", tierMeta.color)}>{tierMeta.label}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteProject(project.id)} disabled={deleting === project.id} className="p-1 text-muted-foreground/40 hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
                    {project.climateZone && <span>{project.climateZone}</span>}
                    {project.budgetUSD && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${project.budgetUSD.toLocaleString()}</span>}
                    {project.lifespanYears && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.lifespanYears} yr lifespan</span>}
                  </div>

                  {(project.tcoCostUSD || project.tcoSavingsUSD) && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {project.tcoCostUSD && (
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <p className="text-sm font-bold text-blue-400">${(project.tcoCostUSD / 1e6).toFixed(1)}M</p>
                          <p className="text-xs text-muted-foreground">30-yr TCO</p>
                        </div>
                      )}
                      {project.tcoSavingsUSD && (
                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5 text-center">
                          <p className="text-sm font-bold text-emerald-400">${(project.tcoSavingsUSD / 1e6).toFixed(1)}M</p>
                          <p className="text-xs text-muted-foreground">vs min-spec savings</p>
                        </div>
                      )}
                    </div>
                  )}

                  {project.aiAnalysis && (
                    <div className="rounded-lg bg-slate-500/5 border border-slate-500/20 p-2.5">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{project.aiAnalysis}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Global Infrastructure Benchmarks */}
      <Card className="mt-6 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-slate-500" />
            Global Infrastructure Benchmarks
          </CardTitle>
          <CardDescription>Compare your projects against real-world data. Quality infrastructure is the cheapest option over 30 years.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Japan — Road Lifespan", value: "50+ years", context: "Premium concrete mix, 15% higher upfront → 40% lower lifecycle cost", tier: "PREMIUM" },
              { label: "US — Average Bridge Age", value: "44 years", context: "42,000 bridges rated 'structurally deficient', $125B deferred maintenance", tier: "MINIMUM" },
              { label: "Netherlands — Flood Protection", value: "10,000-yr standard", context: "Premium specification since 1953. $0 flood damage since investment", tier: "PREMIUM" },
              { label: "India — Rural Roads (PMGSY)", value: "15 year lifespan", context: "Minimum spec, requires replacement 3x in same period as one premium road", tier: "MINIMUM" },
              { label: "Singapore — Water Infrastructure", value: "99.5% uptime", context: "Premium spec with full redundancy. ROI: $47 return per $1 invested", tier: "PREMIUM" },
              { label: "Global — Deferred Maintenance", value: "$15T backlog", context: "McKinsey estimate. Every $1 deferred costs $4-5 in future repairs", tier: "MINIMUM" },
            ].map((item) => {
              const tierColor = item.tier === "PREMIUM" ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"
              return (
                <div key={item.label} className={cn("rounded-lg border p-3", tierColor)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <Badge variant="outline" className={cn("text-[10px]", item.tier === "PREMIUM" ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700")}>{item.tier}</Badge>
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.context}</p>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Data sourced from World Bank, McKinsey Global Institute, and national infrastructure reports.
            Premium specification consistently delivers 2-5x return on investment over 30-year lifecycle.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
