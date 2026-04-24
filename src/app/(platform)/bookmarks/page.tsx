"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Bookmark, Plus, Trash2, ExternalLink, Search, Folder, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CATEGORIES = [
  { value: "research", label: "Research" },
  { value: "health", label: "Health" },
  { value: "learning", label: "Learning" },
  { value: "governance", label: "Governance" },
  { value: "finance", label: "Finance" },
  { value: "aletheia", label: "Aletheia" },
  { value: "general", label: "General" },
]

export default function BookmarksPage() {
  const { data, mutate } = useSWR("/api/bookmarks", fetcher)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [note, setNote] = useState("")
  const [category, setCategory] = useState("general")
  const [filter, setFilter] = useState("")
  const [saving, setSaving] = useState(false)

  const bookmarks: any[] = data?.bookmarks ?? []
  const filtered = filter
    ? bookmarks.filter(b => b.title?.toLowerCase().includes(filter.toLowerCase()) || b.note?.toLowerCase().includes(filter.toLowerCase()) || b.url?.toLowerCase().includes(filter.toLowerCase()))
    : bookmarks

  const stats = useMemo(() => {
    if (bookmarks.length === 0) return null
    const byCategory: Record<string, number> = {}
    const byDomain: Record<string, number> = {}
    bookmarks.forEach(b => {
      byCategory[b.category ?? "general"] = (byCategory[b.category ?? "general"] ?? 0) + 1
      if (b.url?.startsWith("http")) {
        try {
          const d = new URL(b.url).hostname.replace(/^www\./, "")
          byDomain[d] = (byDomain[d] ?? 0) + 1
        } catch {}
      } else if (b.url?.startsWith("/")) {
        byDomain["(internal)"] = (byDomain["(internal)"] ?? 0) + 1
      }
    })
    const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    const topDomains = Object.entries(byDomain).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const weekAgo = Date.now() - 7 * 86400000
    const recent = bookmarks.filter(b => new Date(b.createdAt ?? 0).getTime() >= weekAgo).length
    return { total: bookmarks.length, topCat, topDomains, recent, byCategory }
  }, [bookmarks])

  async function addBookmark() {
    if (!title || !url) return
    setSaving(true)
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, note, category }),
    })
    setSaving(false)
    setOpen(false)
    setTitle(""); setUrl(""); setNote(""); setCategory("general")
    mutate()
  }

  async function removeBookmark(id: string) {
    await fetch(`/api/bookmarks?id=${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Bookmark className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Bookmarks</h1>
          </div>
          <p className="text-sm text-muted-foreground">Save pages, resources, research — anything you want to return to.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Bookmark</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Bookmark</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What is this about?" />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://... or /health or /education" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Note (optional)</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Why did you save this?" />
              </div>
              <Button className="w-full" onClick={addBookmark} disabled={saving || !title || !url}>
                {saving ? "Saving..." : "Save Bookmark"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && stats.total > 2 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p><p className="text-lg font-bold text-amber-600 tabular-nums">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">This week</p><p className="text-lg font-bold text-emerald-600 tabular-nums">{stats.recent}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Folder className="h-2.5 w-2.5" /> Top category</p><p className="text-sm font-bold truncate">{stats.topCat?.[0] ?? "—"}</p><p className="text-[10px] text-muted-foreground">{stats.topCat?.[1]}x</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Globe className="h-2.5 w-2.5" /> Top domain</p><p className="text-sm font-bold truncate">{stats.topDomains[0]?.[0] ?? "—"}</p><p className="text-[10px] text-muted-foreground">{stats.topDomains[0]?.[1]}x</p></CardContent></Card>
        </div>
      )}

      {/* Search */}
      {bookmarks.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search bookmarks..." className="pl-10" />
        </div>
      )}

      {/* Bookmarks list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">{bookmarks.length === 0 ? "No bookmarks yet." : "No matches found."}</p>
            <p className="text-sm text-muted-foreground mt-1">Save pages, Aletheia figures, research papers — anything you want to revisit.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((b: any) => (
            <Card key={b.id} className="card-hover">
              <CardContent className="p-3 flex items-start gap-3">
                <Bookmark className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a href={b.url} className="text-sm font-medium hover:text-violet-600 hover:underline truncate">{b.title}</a>
                    <Badge variant="outline" className="text-[9px] shrink-0">{b.category}</Badge>
                  </div>
                  {b.note && <p className="text-xs text-muted-foreground mt-0.5">{b.note}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a href={b.url} target={b.url.startsWith("http") ? "_blank" : undefined} className="p-1 text-muted-foreground/40 hover:text-violet-500">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => removeBookmark(b.id)} className="p-1 text-muted-foreground/40 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
