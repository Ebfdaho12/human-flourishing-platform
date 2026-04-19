"use client"

import { useState, useEffect } from "react"
import { Star, Plus, Trash2, Edit3, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface VisionItem {
  id: string
  title: string
  description: string
  category: string
  timeframe: string
  createdAt: string
}

const CATEGORIES = [
  { value: "health", label: "Health & Body", color: "from-rose-400 to-red-500" },
  { value: "career", label: "Career & Purpose", color: "from-amber-400 to-orange-500" },
  { value: "finance", label: "Financial Freedom", color: "from-emerald-400 to-green-500" },
  { value: "relationships", label: "Relationships", color: "from-pink-400 to-rose-500" },
  { value: "learning", label: "Learning & Growth", color: "from-blue-400 to-indigo-500" },
  { value: "lifestyle", label: "Lifestyle & Travel", color: "from-cyan-400 to-teal-500" },
  { value: "impact", label: "Impact & Contribution", color: "from-violet-400 to-purple-500" },
  { value: "spiritual", label: "Inner Peace", color: "from-indigo-400 to-violet-500" },
]

const TIMEFRAMES = ["3 months", "6 months", "1 year", "3 years", "5 years", "10 years", "Lifetime"]

export default function VisionBoardPage() {
  const [items, setItems] = useState<VisionItem[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("health")
  const [timeframe, setTimeframe] = useState("1 year")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-vision")
    if (stored) setItems(JSON.parse(stored))
  }, [])

  function save(updated: VisionItem[]) {
    setItems(updated)
    localStorage.setItem("hfp-vision", JSON.stringify(updated))
  }

  function addItem() {
    if (!title.trim()) return
    save([...items, {
      id: Date.now().toString(36),
      title: title.trim(),
      description: description.trim(),
      category,
      timeframe,
      createdAt: new Date().toISOString(),
    }])
    setOpen(false)
    setTitle(""); setDescription(""); setCategory("health"); setTimeframe("1 year")
  }

  function deleteItem(id: string) {
    save(items.filter(i => i.id !== id))
  }

  // Group by category
  const byCategory: Record<string, VisionItem[]> = {}
  for (const item of items) {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category].push(item)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Vision Board</h1>
          </div>
          <p className="text-sm text-muted-foreground">Define what you want your life to look like. Then build it.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Vision</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add to Your Vision Board</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">What do you want?</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Run a marathon, start a business, learn Spanish" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Why does it matter? (optional)</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What would achieving this mean for your life?" className="min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEFRAMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={addItem} disabled={!title.trim()}>Add to Vision Board</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-medium text-lg">Your vision board is empty</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              What does your ideal life look like? Add visions for health, career, finances, relationships —
              whatever matters to you. Seeing it daily keeps you moving toward it.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.filter(c => byCategory[c.value]?.length > 0).map(cat => (
            <div key={cat.value}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {byCategory[cat.value].map(item => (
                  <Card key={item.id} className={cn("overflow-hidden card-hover")}>
                    <div className={cn("h-1.5 bg-gradient-to-r", cat.color)} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] rounded-full bg-muted px-2 py-0.5">{item.timeframe}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="p-1 text-muted-foreground/30 hover:text-destructive shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science of visualization:</strong> A study at Dominican University found that people who
            wrote down their goals were 42% more likely to achieve them. Visualization activates the same neural
            pathways as actually performing the action. Olympic athletes, surgeons, and CEOs all use visualization.
            Your vision board makes the abstract concrete — you cannot hit a target you cannot see.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/life-wheel" className="text-sm text-violet-600 hover:underline">Life Wheel Assessment</a>
        <a href="/values" className="text-sm text-indigo-600 hover:underline">Core Values</a>
        <a href="/goals" className="text-sm text-amber-600 hover:underline">Goals</a>
      </div>
    </div>
  )
}
