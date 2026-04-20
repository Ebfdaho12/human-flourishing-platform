"use client"

import { useState, useEffect } from "react"
import { Star, Plus, CheckCircle, DollarSign, Trophy, Trash2, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Child {
  id: string
  name: string
  age: number
  chores: { name: string; value: number; done: boolean }[]
  earned: number
  totalEarned: number
}

const AGE_CHORES: Record<string, string[]> = {
  "3-5": ["Put toys away", "Put clothes in hamper", "Help set table", "Feed pet", "Water plants", "Wipe up spills", "Make bed (with help)"],
  "6-8": ["Make bed", "Set/clear table", "Load dishwasher", "Sort laundry", "Sweep floors", "Take out garbage", "Tidy bedroom", "Feed and water pets"],
  "9-12": ["Vacuum", "Do dishes", "Fold laundry", "Clean bathroom sink/counter", "Take out recycling", "Rake leaves", "Help with cooking", "Organize pantry", "Mop floors"],
  "13+": ["Mow lawn", "Cook simple meals", "Do own laundry completely", "Clean bathroom fully", "Babysit younger siblings", "Grocery shopping (with list)", "Shovel snow", "Basic car cleaning"],
}

export default function KidsChoresPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState(6)

  useEffect(() => {
    const stored = localStorage.getItem("hfp-kids-chores")
    if (stored) setChildren(JSON.parse(stored))
  }, [])

  function save(updated: Child[]) {
    setChildren(updated)
    localStorage.setItem("hfp-kids-chores", JSON.stringify(updated))
  }

  function addChild() {
    if (!newName.trim()) return
    save([...children, { id: Date.now().toString(36), name: newName.trim(), age: newAge, chores: [], earned: 0, totalEarned: 0 }])
    setNewName("")
  }

  function addChore(childId: string, choreName: string, value: number) {
    save(children.map(c => c.id === childId ? { ...c, chores: [...c.chores, { name: choreName, value, done: false }] } : c))
  }

  function toggleChore(childId: string, choreIdx: number) {
    save(children.map(c => {
      if (c.id !== childId) return c
      const chores = c.chores.map((ch, i) => i === choreIdx ? { ...ch, done: !ch.done } : ch)
      const earned = chores.filter(ch => ch.done).reduce((s, ch) => s + ch.value, 0)
      return { ...c, chores, earned }
    }))
  }

  function resetWeek(childId: string) {
    save(children.map(c => {
      if (c.id !== childId) return c
      return { ...c, chores: c.chores.map(ch => ({ ...ch, done: false })), totalEarned: c.totalEarned + c.earned, earned: 0 }
    }))
  }

  function removeChild(id: string) { save(children.filter(c => c.id !== id)) }

  function getAgeGroup(age: number): string {
    if (age <= 5) return "3-5"
    if (age <= 8) return "6-8"
    if (age <= 12) return "9-12"
    return "13+"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Star className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Kids Chores & Allowance</h1>
        </div>
        <p className="text-sm text-muted-foreground">Teach responsibility, earn rewards. The best financial education starts at home.</p>
      </div>

      {/* Add child */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Child's name" className="flex-1"
              onKeyDown={e => e.key === "Enter" && addChild()} />
            <Input type="number" value={newAge} onChange={e => setNewAge(Number(e.target.value) || 3)} className="w-20" min={3} max={17} />
            <Button onClick={addChild} disabled={!newName.trim()}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {children.map(child => {
        const ageGroup = getAgeGroup(child.age)
        const suggestions = AGE_CHORES[ageGroup] || []
        const completed = child.chores.filter(c => c.done).length
        const total = child.chores.length

        return (
          <Card key={child.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{child.name} <span className="text-xs text-muted-foreground font-normal">(age {child.age})</span></p>
                    <p className="text-xs text-muted-foreground">{completed}/{total} done · ${child.earned.toFixed(2)} earned this week</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => resetWeek(child.id)}>
                    <RotateCcw className="h-3 w-3" /> New Week
                  </Button>
                  <button onClick={() => removeChild(child.id)} className="text-muted-foreground/30 hover:text-destructive p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
                </div>
              )}

              {/* Chore list */}
              {child.chores.length > 0 && (
                <div className="space-y-1">
                  {child.chores.map((chore, ci) => (
                    <div key={ci} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all",
                      chore.done ? "bg-emerald-50/50 opacity-70" : "hover:bg-muted/30"
                    )} onClick={() => toggleChore(child.id, ci)}>
                      {chore.done ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                      <span className={cn("text-xs flex-1", chore.done && "line-through text-muted-foreground")}>{chore.name}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">${chore.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Age-appropriate chores (tap to add):</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions.filter(s => !child.chores.some(c => c.name === s)).map(s => (
                    <button key={s} onClick={() => addChore(child.id, s, child.age <= 5 ? 0.25 : child.age <= 8 ? 0.5 : child.age <= 12 ? 1 : 2)}
                      className="text-[10px] rounded-full border border-border px-2 py-0.5 hover:bg-amber-50 hover:border-amber-300 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* All done celebration */}
              {total > 0 && completed === total && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                  <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-amber-700">All chores done!</p>
                  <p className="text-xs text-muted-foreground">Total earned: ${child.earned.toFixed(2)} · All-time: ${(child.totalEarned + child.earned).toFixed(2)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {children.length === 0 && (
        <Card><CardContent className="py-12 text-center">
          <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">Add your children to get started.</p>
          <p className="text-sm text-muted-foreground mt-1">Age-appropriate chores will be suggested automatically.</p>
        </CardContent></Card>
      )}

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why chores matter:</strong> A 75-year Harvard study found that children who did chores grew up to be
            happier, healthier, and more successful adults. Chores teach responsibility, time management, and the
            connection between effort and reward. Tying allowance to chores teaches the most fundamental financial
            lesson: money is earned, not given. Start small. Be consistent. Celebrate effort, not just completion.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/education/finance" className="text-sm text-emerald-600 hover:underline">Financial Literacy</a>
        <a href="/family-meeting" className="text-sm text-violet-600 hover:underline">Family Meeting</a>
        <a href="/screen-time" className="text-sm text-blue-600 hover:underline">Screen Time</a>
      </div>
    </div>
  )
}
