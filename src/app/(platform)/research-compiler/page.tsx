"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Trash2, Plus, Search, ExternalLink, FolderOpen, Link2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ResearchItem {
  id: string
  title: string
  content: string
  source?: string
  sourceUrl?: string
  category: string
  tags: string[]
  createdAt: string
}

interface ResearchProject {
  id: string
  name: string
  description: string
  items: string[] // item IDs
  createdAt: string
}

export default function ResearchCompilerPage() {
  const [items, setItems] = useState<ResearchItem[]>([])
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [search, setSearch] = useState("")
  const [activeProject, setActiveProject] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [source, setSource] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [category, setCategory] = useState("General")
  const [tags, setTags] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("hfp-research-items") || "[]")) } catch {}
    try { setProjects(JSON.parse(localStorage.getItem("hfp-research-projects") || "[]")) } catch {}
  }, [])

  function saveItems(updated: ResearchItem[]) { setItems(updated); localStorage.setItem("hfp-research-items", JSON.stringify(updated)) }
  function saveProjects(updated: ResearchProject[]) { setProjects(updated); localStorage.setItem("hfp-research-projects", JSON.stringify(updated)) }

  function addItem() {
    if (!title.trim()) return
    const item: ResearchItem = {
      id: `ri-${Date.now()}`, title: title.trim(), content: content.trim(),
      source: source.trim() || undefined, sourceUrl: sourceUrl.trim() || undefined,
      category, tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }
    saveItems([item, ...items])
    setTitle(""); setContent(""); setSource(""); setSourceUrl(""); setTags(""); setShowAddItem(false)
  }

  function addProject() {
    if (!projectName.trim()) return
    const project: ResearchProject = {
      id: `rp-${Date.now()}`, name: projectName.trim(), description: projectDesc.trim(),
      items: [], createdAt: new Date().toISOString(),
    }
    saveProjects([project, ...projects])
    setProjectName(""); setProjectDesc(""); setShowAddProject(false)
  }

  function addToProject(projectId: string, itemId: string) {
    saveProjects(projects.map(p => p.id === projectId ? { ...p, items: [...new Set([...p.items, itemId])] } : p))
  }

  function removeItem(id: string) { saveItems(items.filter(i => i.id !== id)) }
  function removeProject(id: string) { saveProjects(projects.filter(p => p.id !== id)) }

  // Export as markdown (Obsidian-compatible)
  function exportProject(project: ResearchProject) {
    const projectItems = items.filter(i => project.items.includes(i.id))
    let md = `# ${project.name}\n\n${project.description}\n\n---\n\n`
    projectItems.forEach(item => {
      md += `## ${item.title}\n\n`
      md += `${item.content}\n\n`
      if (item.source) md += `**Source:** ${item.source}\n`
      if (item.sourceUrl) md += `**URL:** ${item.sourceUrl}\n`
      if (item.tags.length > 0) md += `**Tags:** ${item.tags.join(", ")}\n`
      md += `**Added:** ${new Date(item.createdAt).toLocaleDateString()}\n\n---\n\n`
    })
    md += `\n\n*Compiled on ${new Date().toLocaleDateString()} from Human Flourishing Platform*\n`

    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  function exportAll() {
    let md = `# Research Compilation\n\n*Exported ${new Date().toLocaleDateString()} from Human Flourishing Platform*\n\n---\n\n`
    items.forEach(item => {
      md += `## ${item.title}\n**Category:** ${item.category}\n\n${item.content}\n\n`
      if (item.source) md += `**Source:** ${item.source}\n`
      if (item.sourceUrl) md += `**URL:** ${item.sourceUrl}\n`
      if (item.tags.length > 0) md += `**Tags:** ${item.tags.join(", ")}\n`
      md += `\n---\n\n`
    })
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "research-compilation.md"; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = items.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.content.toLowerCase().includes(search.toLowerCase()) && !i.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
    if (activeProject) {
      const project = projects.find(p => p.id === activeProject)
      if (project && !project.items.includes(i.id)) return false
    }
    return true
  })

  const categories = [...new Set(items.map(i => i.category))]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Research Compiler</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Save anything you find. Organize into projects. Export as Obsidian-compatible markdown. Build your own knowledge base.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <Badge variant="outline">{items.length} items</Badge>
        <Badge variant="outline">{projects.length} projects</Badge>
        <Badge variant="outline">{categories.length} categories</Badge>
        {items.length > 0 && <Button variant="outline" size="sm" onClick={exportAll} className="ml-auto text-xs"><Download className="h-3 w-3 mr-1" /> Export All (.md)</Button>}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveProject(null)} className={cn("px-3 py-1 rounded-full text-xs border", !activeProject ? "bg-violet-100 border-violet-300 text-violet-700" : "hover:bg-muted/50")}>All Items</button>
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              <button onClick={() => setActiveProject(activeProject === p.id ? null : p.id)} className={cn("px-3 py-1 rounded-l-full text-xs border", activeProject === p.id ? "bg-violet-100 border-violet-300 text-violet-700" : "hover:bg-muted/50")}>
                <FolderOpen className="h-3 w-3 inline mr-1" />{p.name} ({p.items.length})
              </button>
              <button onClick={() => exportProject(p)} className="px-1.5 py-1 rounded-r-full text-xs border-y border-r hover:bg-muted/50" title="Export project"><Download className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your research..." className="h-9 text-sm pl-9" />
      </div>

      {/* Add buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowAddItem(!showAddItem)}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
        <Button variant="outline" size="sm" onClick={() => setShowAddProject(!showAddProject)}><FolderOpen className="h-3 w-3 mr-1" /> New Project</Button>
      </div>

      {/* Add item form */}
      {showAddItem && (
        <Card className="border-2 border-violet-200">
          <CardContent className="p-4 space-y-2">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title / headline..." className="h-8 text-sm" />
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Notes, evidence, analysis..." className="text-sm min-h-[80px]" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={source} onChange={e => setSource(e.target.value)} placeholder="Source name..." className="h-8 text-sm" />
              <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="URL (optional)..." className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-8 text-sm border rounded px-2">
                <option>General</option><option>Politics</option><option>Health</option><option>Finance</option><option>Science</option><option>Corporate</option><option>Legal</option><option>Media</option><option>Investigation</option>
              </select>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="h-8 text-sm" />
            </div>
            <Button onClick={addItem} size="sm" disabled={!title.trim()}>Save Item</Button>
          </CardContent>
        </Card>
      )}

      {/* Add project form */}
      {showAddProject && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 space-y-2">
            <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..." className="h-8 text-sm" />
            <Input value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="Description (optional)..." className="h-8 text-sm" />
            <Button onClick={addProject} size="sm" disabled={!projectName.trim()}>Create Project</Button>
          </CardContent>
        </Card>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
            {items.length === 0 ? "No research items yet. Start adding data you find." : "No items match your search."}
          </CardContent></Card>
        ) : filtered.map(item => (
          <Card key={item.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <Badge variant="outline" className="text-[8px]">{item.category}</Badge>
                  </div>
                  {item.content && <p className="text-[10px] text-muted-foreground line-clamp-2">{item.content}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {item.source && <span className="text-[9px] text-muted-foreground">{item.source}</span>}
                    {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600"><ExternalLink className="h-2.5 w-2.5 inline" /></a>}
                    {item.tags.map((t, i) => <Badge key={i} variant="outline" className="text-[7px]">{t}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {projects.length > 0 && (
                    <select onChange={e => { if (e.target.value) addToProject(e.target.value, item.id); e.target.value = "" }} className="h-6 text-[9px] border rounded px-1 w-20" defaultValue="">
                      <option value="">+ Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-violet-200 bg-violet-50/10">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>How to use this:</strong> As you browse the platform — Canada analysis, climate data, investigations,
            health research — save anything important here. Organize into projects. When you've compiled enough,
            export as markdown and import into Obsidian, Notion, or any knowledge management tool. Build your own
            interconnected web of knowledge. The platform helps you find the data — this tool helps you keep it.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/investigate" className="text-sm text-slate-600 hover:underline">Investigate</a>
        <a href="/climate-data" className="text-sm text-green-600 hover:underline">Climate Data</a>
        <a href="/canada" className="text-sm text-red-600 hover:underline">Canada Analysis</a>
        <a href="/world-data" className="text-sm text-blue-600 hover:underline">World Data</a>
        <a href="/book-library" className="text-sm text-amber-600 hover:underline">Book Library</a>
      </div>
    </div>
  )
}
