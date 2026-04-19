"use client"

import { useState, useEffect } from "react"
import { Brain, Plus, TrendingUp, Star, CheckCircle, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  name: string
  level: number // 1-10
  category: string
  targetLevel: number
  lastUpdated: string
}

const SKILL_CATEGORIES = [
  "Technical", "Communication", "Leadership", "Creative",
  "Analytical", "Physical", "Financial", "Social", "Language", "Other"
]

const LEVEL_LABELS: Record<number, string> = {
  1: "Aware", 2: "Novice", 3: "Beginner", 4: "Developing",
  5: "Competent", 6: "Proficient", 7: "Advanced", 8: "Expert",
  9: "Master", 10: "World-class"
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newCategory, setNewCategory] = useState("Technical")
  const [newLevel, setNewLevel] = useState([3])

  useEffect(() => {
    const stored = localStorage.getItem("hfp-skills")
    if (stored) setSkills(JSON.parse(stored))
  }, [])

  function save(updated: Skill[]) {
    setSkills(updated)
    localStorage.setItem("hfp-skills", JSON.stringify(updated))
  }

  function addSkill() {
    if (!newSkill.trim()) return
    save([...skills, {
      id: Date.now().toString(36),
      name: newSkill.trim(),
      level: newLevel[0],
      category: newCategory,
      targetLevel: Math.min(10, newLevel[0] + 2),
      lastUpdated: new Date().toISOString(),
    }])
    setNewSkill("")
    setNewLevel([3])
  }

  function updateLevel(id: string, level: number) {
    save(skills.map(s => s.id === id ? { ...s, level, lastUpdated: new Date().toISOString() } : s))
  }

  function deleteSkill(id: string) {
    save(skills.filter(s => s.id !== id))
  }

  // Group by category
  const byCategory: Record<string, Skill[]> = {}
  for (const skill of skills) {
    if (!byCategory[skill.category]) byCategory[skill.category] = []
    byCategory[skill.category].push(skill)
  }

  const avgLevel = skills.length > 0 ? Math.round(skills.reduce((s, sk) => s + sk.level, 0) / skills.length * 10) / 10 : 0
  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 3)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Skill Inventory</h1>
        </div>
        <p className="text-sm text-muted-foreground">Map everything you know. See gaps. Build strategically.</p>
      </div>

      {/* Stats */}
      {skills.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-cyan-600">{skills.length}</p>
              <p className="text-xs text-muted-foreground">Skills tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{avgLevel}</p>
              <p className="text-xs text-muted-foreground">Avg level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{skills.filter(s => s.level >= 7).length}</p>
              <p className="text-xs text-muted-foreground">Advanced+</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add skill */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill: Python, Public speaking, Spanish..." className="flex-1"
              onKeyDown={e => e.key === "Enter" && addSkill()} />
            <Button onClick={addSkill} disabled={!newSkill.trim()}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-3">
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="text-xs rounded-lg border border-border bg-background px-2 py-1.5">
              {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">Level: {newLevel[0]} — {LEVEL_LABELS[newLevel[0]]}</span>
            <Slider min={1} max={10} step={1} value={newLevel} onValueChange={setNewLevel} className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Top skills */}
      {topSkills.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Star className="h-3 w-3" /> Your Strongest Skills
          </p>
          <div className="flex gap-2">
            {topSkills.map(s => (
              <Badge key={s.id} variant="outline" className="text-sm py-1 px-3 border-cyan-300 text-cyan-700 bg-cyan-50">
                {s.name} ({s.level}/10)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Skills by category */}
      {Object.keys(byCategory).length > 0 ? (
        <div className="space-y-4">
          {SKILL_CATEGORIES.filter(c => byCategory[c]?.length > 0).map(cat => (
            <div key={cat}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
              <div className="space-y-2">
                {byCategory[cat].sort((a, b) => b.level - a.level).map(skill => (
                  <Card key={skill.id} className="card-hover">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{LEVEL_LABELS[skill.level]}</span>
                              <span className="text-sm font-bold text-cyan-600">{skill.level}/10</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all",
                              skill.level >= 8 ? "bg-emerald-500" : skill.level >= 5 ? "bg-cyan-500" : "bg-amber-500"
                            )} style={{ width: `${skill.level * 10}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => updateLevel(skill.id, Math.min(10, skill.level + 1))}
                            className="text-xs text-emerald-500 hover:text-emerald-700 px-1">+</button>
                          <button onClick={() => updateLevel(skill.id, Math.max(1, skill.level - 1))}
                            className="text-xs text-amber-500 hover:text-amber-700 px-1">-</button>
                          <button onClick={() => deleteSkill(skill.id)}
                            className="text-xs text-muted-foreground/30 hover:text-destructive px-1">x</button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No skills mapped yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add everything you know — programming languages, soft skills, languages, tools. See the full picture.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-cyan-200 bg-cyan-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why map your skills?</strong> Most people underestimate what they know and overestimate what they
            lack. Seeing all your skills in one place reveals patterns: where you are strong, where the gaps are,
            and which gaps matter most for your goals. Update levels as you grow — watching your numbers go up
            is genuine motivation.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/career-path" className="text-sm text-emerald-600 hover:underline">Career Path Explorer</a>
        <a href="/education" className="text-sm text-blue-600 hover:underline">Learn New Skills</a>
        <a href="/life-wheel" className="text-sm text-violet-600 hover:underline">Life Wheel</a>
      </div>
    </div>
  )
}
