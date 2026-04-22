"use client"

import { useState } from "react"
import { TrendingUp, Zap, Star, Plus, X, Target } from "lucide-react"
import { useSyncedStorage } from "@/hooks/use-synced-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Skill { id: string; name: string; level: number; focused: boolean }
interface Category { id: string; name: string; color: string; gradient: string; skills: Skill[] }

const LEVEL_LABELS: Record<string, string> = { "1": "Beginner", "2": "Beginner", "3": "Novice", "4": "Novice", "5": "Intermediate", "6": "Intermediate", "7": "Advanced", "8": "Advanced", "9": "Expert", "10": "Expert" }
const LEVEL_DESC: Record<string, string> = { "1": "Just started learning", "2": "Just started learning", "3": "Understand basics", "4": "Understand basics", "5": "Can apply in practice", "6": "Can apply in practice", "7": "Can teach others", "8": "Can teach others", "9": "Among the best you know", "10": "Among the best you know" }

const DEFAULT_CATS: Omit<Category, "skills">[] = [
  { id: "physical", name: "Physical", color: "emerald", gradient: "from-emerald-500 to-green-600" },
  { id: "mental", name: "Mental", color: "violet", gradient: "from-violet-500 to-purple-600" },
  { id: "financial", name: "Financial", color: "amber", gradient: "from-amber-500 to-yellow-600" },
  { id: "social", name: "Social", color: "rose", gradient: "from-rose-500 to-pink-600" },
  { id: "creative", name: "Creative", color: "orange", gradient: "from-orange-500 to-red-500" },
  { id: "technical", name: "Technical", color: "cyan", gradient: "from-cyan-500 to-blue-600" },
  { id: "leadership", name: "Leadership", color: "indigo", gradient: "from-indigo-500 to-blue-700" },
]

const DEFAULT_SKILLS: Record<string, string[]> = {
  physical: ["Strength", "Flexibility", "Endurance", "Nutrition Knowledge", "Sleep Optimization"],
  mental: ["Focus", "Emotional Regulation", "Critical Thinking", "Meditation", "Memory"],
  financial: ["Budgeting", "Investing", "Tax Strategy", "Negotiation", "Business"],
  social: ["Communication", "Active Listening", "Public Speaking", "Conflict Resolution", "Networking"],
  creative: ["Writing", "Music", "Design", "Problem-Solving", "Innovation"],
  technical: ["Programming", "Data Analysis", "Systems Thinking", "Research", "Building"],
  leadership: ["Decision Making", "Delegation", "Vision", "Mentoring", "Resilience"],
}

const BAR_COLORS: Record<string, string> = { emerald: "bg-emerald-500", violet: "bg-violet-500", amber: "bg-amber-500", rose: "bg-rose-500", orange: "bg-orange-500", cyan: "bg-cyan-500", indigo: "bg-indigo-500" }
const TEXT_COLORS: Record<string, string> = { emerald: "text-emerald-600", violet: "text-violet-600", amber: "text-amber-600", rose: "text-rose-600", orange: "text-orange-600", cyan: "text-cyan-600", indigo: "text-indigo-600" }
const BORDER_COLORS: Record<string, string> = { emerald: "border-emerald-300", violet: "border-violet-300", amber: "border-amber-300", rose: "border-rose-300", orange: "border-orange-300", cyan: "border-cyan-300", indigo: "border-indigo-300" }

function initCategories(): Category[] {
  return DEFAULT_CATS.map(c => ({ ...c, skills: DEFAULT_SKILLS[c.id].map((name, i) => ({ id: `${c.id}-${i}`, name, level: 1, focused: false })) }))
}

export default function SkillTreePage() {
  const [cats, persist] = useSyncedStorage<Category[]>("hfp-skills", initCategories())
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState("")

  const updateSkill = (catId: string, skillId: string, patch: Partial<Skill>) => {
    persist(cats.map(c => c.id === catId ? { ...c, skills: c.skills.map(s => s.id === skillId ? { ...s, ...patch } : s) } : c))
  }
  const removeSkill = (catId: string, skillId: string) => {
    persist(cats.map(c => c.id === catId ? { ...c, skills: c.skills.filter(s => s.id !== skillId) } : c))
  }
  const addSkill = (catId: string) => {
    if (!newSkill.trim()) return
    persist(cats.map(c => c.id === catId ? { ...c, skills: [...c.skills, { id: `${catId}-${Date.now()}`, name: newSkill.trim(), level: 1, focused: false }] } : c))
    setNewSkill(""); setAddingTo(null)
  }

  const allSkills = cats.flatMap(c => c.skills)
  const totalTracked = allSkills.length
  const avgScore = totalTracked ? (allSkills.reduce((s, sk) => s + sk.level, 0) / totalTracked).toFixed(1) : "—"
  const focused = allSkills.filter(s => s.focused)
  const focusedCat = (skillId: string) => cats.find(c => c.skills.some(s => s.id === skillId))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Skill Tree: Your Growth Map</h1>
        </div>
        <p className="text-sm text-muted-foreground italic">Track the skills you're developing. See your growth. Level up deliberately.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{totalTracked}</p><p className="text-[10px] text-muted-foreground">Skills Tracked</p></CardContent></Card>
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{avgScore}</p><p className="text-[10px] text-muted-foreground">Avg Skill Score</p></CardContent></Card>
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-cyan-500">{focused.length}</p><p className="text-[10px] text-muted-foreground">Focus Areas</p></CardContent></Card>
      </div>

      {focused.length > 0 && (
        <Card className="border-2 border-cyan-300 bg-cyan-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-cyan-500" /> Active Focus Areas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {focused.map(s => {
              const cat = focusedCat(s.id)!
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <Badge className={cn("text-[9px] text-white", BAR_COLORS[cat.color])}>{cat.name}</Badge>
                  <span className="text-xs font-medium flex-1">{s.name}</span>
                  <span className={cn("text-xs font-bold", TEXT_COLORS[cat.color])}>{s.level}/10</span>
                  <Badge variant="outline" className="text-[9px]">{LEVEL_LABELS[s.level.toString()]}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {cats.map(cat => (
        <Card key={cat.id} className={cn("border-2", BORDER_COLORS[cat.color])}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className={cn("h-6 w-6 rounded-lg bg-gradient-to-br flex items-center justify-center", cat.gradient)}>
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              {cat.name}
              <Badge variant="outline" className="text-[9px] ml-auto">{cat.skills.length} skills</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cat.skills.map(skill => (
              <div key={skill.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{skill.name}</span>
                    {skill.focused && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn("text-xs font-bold", TEXT_COLORS[cat.color])}>{skill.level}</span>
                    <span className="text-[9px] text-muted-foreground">({LEVEL_LABELS[skill.level.toString()]})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", BAR_COLORS[cat.color])} style={{ width: `${skill.level * 10}%` }} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[10px]" onClick={() => updateSkill(cat.id, skill.id, { level: Math.max(1, skill.level - 1) })}>-</Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[10px]" onClick={() => updateSkill(cat.id, skill.id, { level: Math.min(10, skill.level + 1) })}>+</Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => updateSkill(cat.id, skill.id, { focused: !skill.focused })}><Star className={cn("h-3 w-3", skill.focused ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} /></Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-400" onClick={() => removeSkill(cat.id, skill.id)}><X className="h-3 w-3" /></Button>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground">{LEVEL_DESC[skill.level.toString()]}</p>
              </div>
            ))}
            {addingTo === cat.id ? (
              <div className="flex gap-2 pt-1">
                <Input className="text-xs h-7 flex-1" placeholder="New skill name" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill(cat.id)} />
                <Button size="sm" className={cn("h-7 text-[10px] text-white", BAR_COLORS[cat.color])} onClick={() => addSkill(cat.id)}>Add</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setAddingTo(null); setNewSkill("") }}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="text-[10px] w-full" onClick={() => setAddingTo(cat.id)}><Plus className="h-3 w-3 mr-1" /> Add Skill</Button>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3 flex-wrap">
        <a href="/character-sheet" className="text-sm text-amber-600 hover:underline">Character Sheet</a>
        <a href="/30-day-challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/book-library" className="text-sm text-violet-600 hover:underline">Book Library</a>
        <a href="/people" className="text-sm text-rose-600 hover:underline">People Tracker</a>
      </div>
    </div>
  )
}
