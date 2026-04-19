"use client"

import { useState, useEffect } from "react"
import { PenLine, Plus, Trash2, Search, Clock, Mic, MicOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Quick Notes / Brain Dump
 *
 * Fast capture for thoughts, ideas, observations. Stored locally
 * for instant access — no server round-trip. Syncs to DB on save.
 *
 * Voice input for hands-free capture.
 */

interface Note {
  id: string
  content: string
  color: string
  createdAt: string
  pinned: boolean
}

const COLORS = [
  { value: "default", bg: "bg-card border-border" },
  { value: "yellow", bg: "bg-yellow-50 border-yellow-200" },
  { value: "green", bg: "bg-emerald-50 border-emerald-200" },
  { value: "blue", bg: "bg-blue-50 border-blue-200" },
  { value: "pink", bg: "bg-pink-50 border-pink-200" },
  { value: "violet", bg: "bg-violet-50 border-violet-200" },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [newColor, setNewColor] = useState("default")
  const [search, setSearch] = useState("")
  const [recording, setRecording] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hfp-notes")
    if (stored) setNotes(JSON.parse(stored))
  }, [])

  function saveNotes(updated: Note[]) {
    setNotes(updated)
    localStorage.setItem("hfp-notes", JSON.stringify(updated))
  }

  function addNote() {
    if (!newNote.trim()) return
    const note: Note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      content: newNote.trim(),
      color: newColor,
      createdAt: new Date().toISOString(),
      pinned: false,
    }
    saveNotes([note, ...notes])
    setNewNote("")
    setNewColor("default")
  }

  function deleteNote(id: string) {
    saveNotes(notes.filter(n => n.id !== id))
  }

  function togglePin(id: string) {
    saveNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setNewNote(prev => prev ? prev + " " + text : text)
      setRecording(false)
    }
    recognition.onend = () => setRecording(false)
    recognition.onerror = () => setRecording(false)

    setRecording(true)
    recognition.start()
  }

  const filtered = search
    ? notes.filter(n => n.content.toLowerCase().includes(search.toLowerCase()))
    : notes

  const pinned = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Quick Notes</h1>
        </div>
        <p className="text-sm text-muted-foreground">Brain dump. Capture thoughts instantly. Type or speak.</p>
      </div>

      {/* New note input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="What's on your mind? Type or click the mic..."
              className="min-h-[80px] flex-1"
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addNote() }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setNewColor(c.value)}
                  className={cn("h-5 w-5 rounded-full border-2 transition-all", c.bg, newColor === c.value ? "ring-2 ring-violet-400 scale-110" : "")} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={startVoice}
                className={cn(recording && "bg-red-100 border-red-300 text-red-600 animate-pulse")}>
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? "Listening..." : "Speak"}
              </Button>
              <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                <Plus className="h-4 w-4" /> Add Note
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Ctrl+Enter to save quickly. Notes are stored locally for instant access.</p>
        </CardContent>
      </Card>

      {/* Search */}
      {notes.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="pl-10" />
        </div>
      )}

      {/* Notes */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PenLine className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No notes yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Capture a thought, idea, or observation. It takes 5 seconds.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pinned</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pinned.map(note => <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} timeAgo={timeAgo} />)}
              </div>
            </div>
          )}

          {/* Regular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {unpinned.map(note => <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} timeAgo={timeAgo} />)}
          </div>

          <p className="text-xs text-center text-muted-foreground">{notes.length} notes · stored locally on this device</p>
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, onDelete, onTogglePin, timeAgo }: { note: Note; onDelete: (id: string) => void; onTogglePin: (id: string) => void; timeAgo: (d: string) => string }) {
  const colorClass = COLORS.find(c => c.value === note.color)?.bg ?? COLORS[0].bg

  return (
    <Card className={cn("card-hover", colorClass)}>
      <CardContent className="p-3">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground">{timeAgo(note.createdAt)}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onTogglePin(note.id)} className={cn("p-1 text-xs", note.pinned ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-500")}>
              {note.pinned ? "📌" : "Pin"}
            </button>
            <button onClick={() => onDelete(note.id)} className="p-1 text-muted-foreground/30 hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
