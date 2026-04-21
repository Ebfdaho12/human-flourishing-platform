"use client"

import { useState, useEffect } from "react"
import { Users, Heart, Phone, Plus, X, Gift, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type RelType = "Partner" | "Family" | "Close Friend" | "Friend" | "Mentor" | "Colleague"
const REL_TYPES: RelType[] = ["Partner", "Family", "Close Friend", "Friend", "Mentor", "Colleague"]
const REL_COLORS: Record<RelType, string> = { Partner: "bg-rose-500", Family: "bg-amber-500", "Close Friend": "bg-violet-500", Friend: "bg-blue-500", Mentor: "bg-emerald-500", Colleague: "bg-slate-500" }

interface Person { id: string; name: string; type: RelType; birthday: string; notes: string; lastContact: string; quality: number; reminderDays: number; zodiacYear: string }

const LS_KEY = "hfp-people"
const today = () => new Date().toISOString().split("T")[0]
const daysSince = (d: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999
const status = (p: Person): "green" | "yellow" | "red" => { const d = daysSince(p.lastContact); return d <= p.reminderDays * 0.5 ? "green" : d <= p.reminderDays ? "yellow" : "red" }
const STATUS_STYLE = { green: "border-emerald-400 bg-emerald-50/30", yellow: "border-amber-400 bg-amber-50/30", red: "border-red-400 bg-red-50/30" }
const STATUS_DOT = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-red-500" }

function load(): Person[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") } catch { return [] } }
function save(p: Person[]) { localStorage.setItem(LS_KEY, JSON.stringify(p)) }

function upcomingBirthdays(people: Person[]) {
  const now = new Date(), m = now.getMonth(), y = now.getFullYear()
  return people.filter(p => p.birthday).map(p => {
    const [, bm, bd] = p.birthday.split("-").map(Number)
    const next = new Date(y, bm - 1, bd)
    if (next < now) next.setFullYear(y + 1)
    return { ...p, nextBday: next, daysUntil: Math.ceil((next.getTime() - now.getTime()) / 86400000) }
  }).filter(b => b.daysUntil <= 60).sort((a, b) => a.daysUntil - b.daysUntil)
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", type: "Friend" as RelType, birthday: "", notes: "", zodiacYear: "" })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => setPeople(load()), [])
  const persist = (p: Person[]) => { setPeople(p); save(p) }

  const addPerson = () => {
    if (!form.name.trim()) return
    const p: Person = { id: Date.now().toString(), name: form.name.trim(), type: form.type, birthday: form.birthday, notes: form.notes, lastContact: "", quality: 5, reminderDays: 14, zodiacYear: form.zodiacYear }
    persist([...people, p]); setForm({ name: "", type: "Friend", birthday: "", notes: "", zodiacYear: "" }); setAdding(false)
  }

  const logContact = (id: string) => persist(people.map(p => p.id === id ? { ...p, lastContact: today() } : p))
  const remove = (id: string) => persist(people.filter(p => p.id !== id))
  const update = (id: string, patch: Partial<Person>) => persist(people.map(p => p.id === id ? { ...p, ...patch } : p))

  const overdue = people.filter(p => status(p) === "red")
  const avgQuality = people.length ? (people.reduce((s, p) => s + p.quality, 0) / people.length).toFixed(1) : "—"
  const bdays = upcomingBirthdays(people)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">People: Your Relationship Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground italic">The Harvard Study of Adult Development (1938-present, 80+ years, 724 participants): the #1 predictor of happiness and health in old age is not money, fame, or achievement — it is the quality of your close relationships.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{people.length}</p><p className="text-[10px] text-muted-foreground">People Tracked</p></CardContent></Card>
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold">{avgQuality}</p><p className="text-[10px] text-muted-foreground">Avg Quality</p></CardContent></Card>
        <Card className="border"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-500">{overdue.length}</p><p className="text-[10px] text-muted-foreground">Overdue</p></CardContent></Card>
      </div>

      {overdue.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Reach Out Today</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {overdue.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-xs font-medium">{p.name}</span><Badge className={cn("text-[9px] text-white", REL_COLORS[p.type])}>{p.type}</Badge><span className="text-[10px] text-red-500">{daysSince(p.lastContact)}d ago</span></div>
                <Button size="sm" className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700" onClick={() => logContact(p.id)}><Phone className="h-3 w-3 mr-1" />Contacted</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {bdays.length > 0 && (
        <Card className="border border-amber-300 bg-amber-50/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gift className="h-4 w-4 text-amber-500" /> Upcoming Birthdays</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {bdays.map(b => (
              <div key={b.id} className="flex items-center gap-2 text-xs"><span className="font-medium">{b.name}</span><span className="text-muted-foreground">{b.birthday}</span><Badge variant="outline" className="text-[9px]">{b.daysUntil === 0 ? "Today!" : `in ${b.daysUntil}d`}</Badge></div>
            ))}
          </CardContent>
        </Card>
      )}

      {!adding ? (
        <Button className="w-full bg-rose-600 hover:bg-rose-700 text-xs" onClick={() => setAdding(true)}><Plus className="h-3 w-3 mr-1" /> Add Person</Button>
      ) : (
        <Card className="border-dashed border-2 border-rose-300">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold">Add a Person</p>
            <Input className="text-xs h-8" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="w-full rounded border px-2 py-1 text-xs bg-background" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as RelType })}>{REL_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <Input className="text-xs h-8" type="date" placeholder="Birthday" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
            <Input className="text-xs h-8" placeholder="Zodiac year (e.g. 1996)" value={form.zodiacYear} onChange={e => setForm({ ...form, zodiacYear: e.target.value })} />
            <Input className="text-xs h-8" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs" onClick={addPerson}>Add</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {people.map(p => {
          const s = status(p); const editing = editId === p.id
          return (
            <Card key={p.id} className={cn("border-2 transition-all", STATUS_STYLE[s])}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[s])} />
                    <span className="text-sm font-semibold">{p.name}</span>
                    <Badge className={cn("text-[9px] text-white", REL_COLORS[p.type])}>{p.type}</Badge>
                    {p.birthday && <span className="text-[10px] text-muted-foreground">{p.birthday}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setEditId(editing ? null : p.id)}>{editing ? "Done" : "Edit"}</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400" onClick={() => remove(p.id)}><X className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>Last contact: {p.lastContact || "Never"}{p.lastContact && ` (${daysSince(p.lastContact)}d ago)`}</span>
                  <span>Quality: {p.quality}/10</span>
                  <span>Remind: {p.reminderDays}d</span>
                </div>
                {p.notes && <p className="text-[10px] text-muted-foreground italic">{p.notes}</p>}
                {editing && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2"><span className="text-[10px] w-16">Quality:</span><input type="range" min={1} max={10} value={p.quality} onChange={e => update(p.id, { quality: +e.target.value })} className="flex-1 h-2" /><span className="text-xs font-bold w-6">{p.quality}</span></div>
                    <div className="flex items-center gap-2"><span className="text-[10px] w-16">Remind:</span>
                      {[7, 14, 30].map(d => <Button key={d} size="sm" variant={p.reminderDays === d ? "default" : "outline"} className="h-6 text-[10px]" onClick={() => update(p.id, { reminderDays: d })}>{d}d</Button>)}
                    </div>
                    <Input className="text-xs h-7" placeholder="Update notes" value={p.notes} onChange={e => update(p.id, { notes: e.target.value })} />
                    {p.zodiacYear && <span className="text-[10px] text-muted-foreground">Zodiac year: {p.zodiacYear}</span>}
                  </div>
                )}
                <Button size="sm" className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700" onClick={() => logContact(p.id)}><Phone className="h-3 w-3 mr-1" />I contacted {p.name} today</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/communication-toolkit" className="text-sm text-blue-600 hover:underline">Communication Toolkit</a>
        <a href="/chinese-zodiac" className="text-sm text-red-600 hover:underline">Chinese Zodiac</a>
        <a href="/attachment-styles" className="text-sm text-violet-600 hover:underline">Attachment Styles</a>
        <a href="/skill-tree" className="text-sm text-cyan-600 hover:underline">Skill Tree</a>
        <a href="/character-sheet" className="text-sm text-amber-600 hover:underline">Character Sheet</a>
      </div>
    </div>
  )
}
