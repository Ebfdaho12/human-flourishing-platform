"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Heart, Phone, MessageCircle, Calendar, Star, Trash2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Person {
  id: string
  name: string
  circle: "inner" | "close" | "regular" | "acquaintance"
  lastContact: string // ISO date
  notes: string
  contactFrequency: number // days between ideal contact
}

const CIRCLES: Record<string, { label: string; color: string; desc: string; frequency: number }> = {
  inner: { label: "Inner Circle", color: "text-rose-600 border-rose-300 bg-rose-50", desc: "Family, partner, best friends — the 3-5 people who matter most", frequency: 3 },
  close: { label: "Close Friends", color: "text-violet-600 border-violet-300 bg-violet-50", desc: "People you trust deeply and see regularly", frequency: 14 },
  regular: { label: "Friends", color: "text-blue-600 border-blue-300 bg-blue-50", desc: "Good friends you enjoy spending time with", frequency: 30 },
  acquaintance: { label: "Acquaintances", color: "text-slate-600 border-slate-300 bg-slate-50", desc: "People you know and could build a deeper connection with", frequency: 90 },
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function contactStatus(person: Person): { label: string; color: string } {
  const days = daysSince(person.lastContact)
  if (days <= person.contactFrequency) return { label: "Connected", color: "text-emerald-600" }
  if (days <= person.contactFrequency * 1.5) return { label: "Reach out soon", color: "text-amber-600" }
  return { label: "Overdue", color: "text-red-500" }
}

export default function RelationshipsPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCircle, setNewCircle] = useState<Person["circle"]>("close")
  const [newNotes, setNewNotes] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-relationships")
    if (stored) setPeople(JSON.parse(stored))
  }, [])

  function save(updated: Person[]) {
    setPeople(updated)
    localStorage.setItem("hfp-relationships", JSON.stringify(updated))
  }

  function addPerson() {
    if (!newName.trim()) return
    save([...people, {
      id: Date.now().toString(36),
      name: newName.trim(),
      circle: newCircle,
      lastContact: new Date().toISOString(),
      notes: newNotes.trim(),
      contactFrequency: CIRCLES[newCircle].frequency,
    }])
    setNewName("")
    setNewNotes("")
    setShowAdd(false)
  }

  function logContact(id: string) {
    save(people.map(p => p.id === id ? { ...p, lastContact: new Date().toISOString() } : p))
  }

  function removePerson(id: string) {
    save(people.filter(p => p.id !== id))
  }

  function moveCircle(id: string, circle: Person["circle"]) {
    save(people.map(p => p.id === id ? { ...p, circle, contactFrequency: CIRCLES[circle].frequency } : p))
  }

  // Stats
  const overdue = people.filter(p => daysSince(p.lastContact) > p.contactFrequency * 1.5).length
  const reachOut = people.filter(p => {
    const days = daysSince(p.lastContact)
    return days > p.contactFrequency && days <= p.contactFrequency * 1.5
  }).length

  // People who need attention first
  const needAttention = [...people]
    .sort((a, b) => {
      const aRatio = daysSince(a.lastContact) / a.contactFrequency
      const bRatio = daysSince(b.lastContact) / b.contactFrequency
      return bRatio - aRatio
    })
    .slice(0, 5)
    .filter(p => daysSince(p.lastContact) > p.contactFrequency * 0.8)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Relationships</h1>
          </div>
          <p className="text-sm text-muted-foreground">The people in your life are your greatest asset. Nurture them intentionally.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Person</Button>
      </div>

      {/* Stats */}
      {people.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-rose-600">{people.length}</p>
              <p className="text-xs text-muted-foreground">People</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{reachOut}</p>
              <p className="text-xs text-muted-foreground">Reach out soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add person form */}
      {showAdd && (
        <Card className="border-2 border-rose-200">
          <CardContent className="p-4 space-y-3">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name"
              onKeyDown={e => e.key === "Enter" && addPerson()} />
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(CIRCLES) as Person["circle"][]).map(c => (
                <button key={c} onClick={() => setNewCircle(c)}
                  className={cn("rounded-full px-3 py-1 text-xs border transition-all",
                    newCircle === c ? CIRCLES[c].color + " font-semibold" : "border-border text-muted-foreground hover:bg-muted/50"
                  )}>
                  {CIRCLES[c].label}
                </button>
              ))}
            </div>
            <Input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes (how you met, shared interests, etc.)" />
            <Button onClick={addPerson} disabled={!newName.trim()} className="w-full">Add to {CIRCLES[newCircle].label}</Button>
          </CardContent>
        </Card>
      )}

      {/* Reach out nudge */}
      {needAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Time to reach out
            </p>
            <div className="space-y-2">
              {needAttention.map(p => {
                const status = contactStatus(p)
                const days = daysSince(p.lastContact)
                return (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{days} days ago</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => logContact(p.id)} className="h-7 text-xs">
                      <MessageCircle className="h-3 w-3" /> Connected
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* People by circle */}
      {people.length > 0 ? (
        <div className="space-y-5">
          {(Object.keys(CIRCLES) as Person["circle"][]).map(circleKey => {
            const circleInfo = CIRCLES[circleKey]
            const circlePeople = people.filter(p => p.circle === circleKey)
              .sort((a, b) => daysSince(b.lastContact) / b.contactFrequency - daysSince(a.lastContact) / a.contactFrequency)
            if (circlePeople.length === 0) return null
            return (
              <div key={circleKey}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{circleInfo.label}</p>
                  <Badge variant="outline" className="text-[9px]">{circlePeople.length}</Badge>
                </div>
                <div className="space-y-2">
                  {circlePeople.map(person => {
                    const status = contactStatus(person)
                    const days = daysSince(person.lastContact)
                    return (
                      <Card key={person.id} className="card-hover">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 font-semibold text-sm">
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{person.name}</span>
                                <span className={cn("text-[10px] font-medium", status.color)}>{status.label}</span>
                              </div>
                              {person.notes && <p className="text-xs text-muted-foreground truncate">{person.notes}</p>}
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => logContact(person.id)}
                                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                                title="Log contact">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => removePerson(person.id)}
                                className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-destructive hover:bg-red-50 transition-colors"
                                title="Remove">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No one added yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start with your inner circle — the 3-5 people who matter most.</p>
          </CardContent>
        </Card>
      )}

      {/* Why */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why track relationships?</strong> The Harvard Study of Adult Development — the longest study on happiness
            ever conducted (85+ years) — found that the quality of your close relationships is the single strongest predictor
            of health and happiness. Stronger than income, fame, IQ, or social class. The people who were most satisfied
            in their relationships at age 50 were the healthiest at age 80. This tool helps you be intentional about
            the connections that matter most.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/mental-health" className="text-sm text-violet-600 hover:underline">Mental Health</a>
        <a href="/life-wheel" className="text-sm text-cyan-600 hover:underline">Life Wheel</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
      </div>
    </div>
  )
}
