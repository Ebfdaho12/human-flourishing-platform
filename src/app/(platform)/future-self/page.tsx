"use client"

import { useState, useEffect } from "react"
import { Mail, Send, Lock, BookOpen, Clock, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"

interface Letter { id: string; content: string; createdAt: string; deliveryDate: string; read: boolean }
const STORAGE_KEY = "hfp-future-letters"
const PROMPTS = ["What are you working on right now?", "What are you afraid of?", "What do you hope is different?", "What would you tell your future self to remember?"]
const DELAYS = [{ label: "1 month", months: 1 }, { label: "3 months", months: 3 }, { label: "6 months", months: 6 }, { label: "1 year", months: 12 }, { label: "5 years", months: 60 }]

function getLetters(): Letter[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
}
function saveLetters(letters: Letter[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(letters)) }
function daysUntil(date: string) { return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000) }

export default function FutureSelfPage() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [content, setContent] = useState("")
  const [delay, setDelay] = useState(3)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setLetters(getLetters()); setMounted(true) }, [])

  function sendLetter() {
    if (!content.trim()) return
    const delivery = new Date()
    delivery.setMonth(delivery.getMonth() + delay)
    const letter: Letter = {
      id: crypto.randomUUID(), content: content.trim(),
      createdAt: new Date().toISOString(), deliveryDate: delivery.toISOString(), read: false,
    }
    const next = [letter, ...letters]
    setLetters(next); saveLetters(next); setContent("")
  }

  function markRead(id: string) {
    const next = letters.map(l => l.id === id ? { ...l, read: true } : l)
    setLetters(next); saveLetters(next)
  }

  function deleteLetter(id: string) {
    const next = letters.filter(l => l.id !== id)
    setLetters(next); saveLetters(next)
  }

  const sealed = letters.filter(l => daysUntil(l.deliveryDate) > 0)
  const ready = letters.filter(l => daysUntil(l.deliveryDate) <= 0 && !l.read)
  const opened = letters.filter(l => l.read)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Letter to Your Future Self</h1>
        </div>
        <p className="text-sm text-muted-foreground">Write a time capsule. Seal it. Open it when the time comes.</p>
      </div>

      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why this matters:</strong> Your future self is a stranger who will inherit the consequences of your
            current decisions. Writing to them creates accountability and perspective that nothing else can. You will be
            surprised what you forgot, what you feared, and what actually happened.
          </p>
        </CardContent>
      </Card>

      {/* Writing prompts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Need help starting?</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPTS.map(p => (
              <button key={p} onClick={() => setContent(prev => prev ? prev + "\n\n" + p + "\n" : p + "\n")}
                className="text-left text-xs p-2 rounded-lg border hover:bg-violet-50 hover:border-violet-300 transition-colors text-muted-foreground">
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compose */}
      <Card className="border-2 border-violet-200">
        <CardContent className="p-4 space-y-3">
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
            placeholder="Dear future me..." className="resize-none" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Open in:</span>
            {DELAYS.map(d => (
              <button key={d.months} onClick={() => setDelay(d.months)}
                className={cn("text-xs px-3 py-1 rounded-full border transition-colors",
                  delay === d.months ? "bg-violet-600 text-white border-violet-600" : "hover:border-violet-300")}>
                {d.label}
              </button>
            ))}
          </div>
          <Button onClick={sendLetter} disabled={!content.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
            <Send className="h-4 w-4" /> Seal &amp; Send to the Future
          </Button>
        </CardContent>
      </Card>

      {/* Ready to open */}
      {mounted && ready.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-500" /> Ready to Open</h2>
          {ready.map(l => (
            <Card key={l.id} className="border-amber-300 bg-amber-50/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Written {new Date(l.createdAt).toLocaleDateString()}</p>
                  <Badge className="bg-amber-100 text-amber-700 text-[9px]">Ready</Badge>
                </div>
                <Button onClick={() => markRead(l.id)} variant="outline" className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-100">
                  <BookOpen className="h-4 w-4" /> Read This Letter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sealed */}
      {mounted && sealed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-violet-500" /> Sealed Letters</h2>
          {sealed.map(l => {
            const days = daysUntil(l.deliveryDate)
            return (
              <Card key={l.id} className="border-violet-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Written {new Date(l.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-violet-500" />
                      <Explain tip="This letter is sealed until its delivery date arrives.">Opens in {days} day{days !== 1 ? "s" : ""}</Explain>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] text-violet-600 border-violet-300">Sealed</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Opened history */}
      {mounted && opened.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-500" /> Opened Letters</h2>
          {opened.map(l => (
            <Card key={l.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Written {new Date(l.createdAt).toLocaleDateString()} &middot; Delivered {new Date(l.deliveryDate).toLocaleDateString()}
                  </p>
                  <button onClick={() => deleteLetter(l.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{l.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <a href="/journal" className="text-sm text-violet-600 hover:underline">Journal</a>
        <a href="/goals" className="text-sm text-blue-600 hover:underline">Goals</a>
        <a href="/gratitude" className="text-sm text-amber-600 hover:underline">Gratitude</a>
        <a href="/character-sheet" className="text-sm text-emerald-600 hover:underline">Character Sheet</a>
      </div>
    </div>
  )
}
