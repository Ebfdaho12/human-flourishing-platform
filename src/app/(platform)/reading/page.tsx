"use client"

import { useState, useEffect } from "react"
import { BookOpen, Plus, CheckCircle, Clock, Star, Trash2, Quote, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  status: "reading" | "finished" | "want"
  rating: number // 0-5, 0 = unrated
  notes: string
  startDate: string
  finishDate?: string
  pages?: number
  currentPage?: number
}

const CURATED_LISTS: Record<string, { title: string; books: { title: string; author: string; why: string }[] }> = {
  mindset: {
    title: "Mindset & Growth",
    books: [
      { title: "Atomic Habits", author: "James Clear", why: "How tiny changes compound into remarkable results" },
      { title: "Mindset", author: "Carol Dweck", why: "Fixed vs growth mindset — changes how you see failure" },
      { title: "The Obstacle Is the Way", author: "Ryan Holiday", why: "Stoic philosophy applied to modern challenges" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", why: "Finding purpose even in the worst circumstances" },
      { title: "Deep Work", author: "Cal Newport", why: "Focus is the new IQ — how to actually concentrate" },
    ],
  },
  money: {
    title: "Money & Wealth",
    books: [
      { title: "The Psychology of Money", author: "Morgan Housel", why: "Why behavior matters more than knowledge in finance" },
      { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", why: "Assets vs liabilities — how the wealthy think" },
      { title: "The Simple Path to Wealth", author: "JL Collins", why: "Index funds and the case against financial complexity" },
      { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", why: "Practical, no-guilt approach to automating your finances" },
      { title: "The Millionaire Next Door", author: "Thomas Stanley", why: "Real millionaires look nothing like what you expect" },
    ],
  },
  truth: {
    title: "Truth & Critical Thinking",
    books: [
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", why: "How your brain tricks you — and how to notice" },
      { title: "Factfulness", author: "Hans Rosling", why: "The world is better than you think — data proves it" },
      { title: "The Art of Thinking Clearly", author: "Rolf Dobelli", why: "99 cognitive biases and how to overcome them" },
      { title: "Sapiens", author: "Yuval Noah Harari", why: "How stories (money, religion, nations) hold civilization together" },
      { title: "Manufacturing Consent", author: "Noam Chomsky", why: "How media shapes what you believe — both sides" },
    ],
  },
  health: {
    title: "Health & Longevity",
    books: [
      { title: "Why We Sleep", author: "Matthew Walker", why: "Sleep is the single most important thing for health" },
      { title: "Outlive", author: "Peter Attia", why: "The science of longevity — exercise, nutrition, emotional health" },
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", why: "How trauma lives in the body and how to heal" },
      { title: "Breath", author: "James Nestor", why: "How you breathe affects anxiety, sleep, and performance" },
      { title: "Spark", author: "John Ratey", why: "Exercise is the single best thing for your brain" },
    ],
  },
}

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newAuthor, setNewAuthor] = useState("")
  const [tab, setTab] = useState<"library" | "discover">("library")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-reading")
    if (stored) setBooks(JSON.parse(stored))
  }, [])

  function save(updated: Book[]) {
    setBooks(updated)
    localStorage.setItem("hfp-reading", JSON.stringify(updated))
  }

  function addBook(title: string, author: string, status: Book["status"] = "want") {
    if (!title.trim()) return
    // Don't add duplicates
    if (books.some(b => b.title.toLowerCase() === title.toLowerCase())) return
    save([...books, {
      id: Date.now().toString(36),
      title: title.trim(),
      author: author.trim(),
      status,
      rating: 0,
      notes: "",
      startDate: status === "reading" ? new Date().toISOString() : "",
    }])
    setNewTitle("")
    setNewAuthor("")
    setShowAdd(false)
  }

  function updateStatus(id: string, status: Book["status"]) {
    save(books.map(b => {
      if (b.id !== id) return b
      const updates: Partial<Book> = { status }
      if (status === "reading" && !b.startDate) updates.startDate = new Date().toISOString()
      if (status === "finished") updates.finishDate = new Date().toISOString()
      return { ...b, ...updates }
    }))
  }

  function updateRating(id: string, rating: number) {
    save(books.map(b => b.id === id ? { ...b, rating } : b))
  }

  function removeBook(id: string) {
    save(books.filter(b => b.id !== id))
  }

  const reading = books.filter(b => b.status === "reading")
  const finished = books.filter(b => b.status === "finished")
  const wantToRead = books.filter(b => b.status === "want")

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Reading List</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track what you read. Discover what to read next. Build knowledge intentionally.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Add Book</Button>
      </div>

      {/* Stats */}
      {books.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{reading.length}</p>
              <p className="text-xs text-muted-foreground">Reading now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{finished.length}</p>
              <p className="text-xs text-muted-foreground">Finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{wantToRead.length}</p>
              <p className="text-xs text-muted-foreground">Want to read</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add book form */}
      {showAdd && (
        <Card className="border-2 border-amber-200">
          <CardContent className="p-4 space-y-3">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Book title"
              onKeyDown={e => e.key === "Enter" && newAuthor && addBook(newTitle, newAuthor, "reading")} />
            <Input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author"
              onKeyDown={e => e.key === "Enter" && newTitle && addBook(newTitle, newAuthor, "reading")} />
            <div className="flex gap-2">
              <Button onClick={() => addBook(newTitle, newAuthor, "reading")} disabled={!newTitle.trim()} className="flex-1">
                <Eye className="h-4 w-4" /> Currently Reading
              </Button>
              <Button variant="outline" onClick={() => addBook(newTitle, newAuthor, "want")} disabled={!newTitle.trim()} className="flex-1">
                <Clock className="h-4 w-4" /> Want to Read
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("library")}
          className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "library" ? "border-amber-500 text-amber-700" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>My Library</button>
        <button onClick={() => setTab("discover")}
          className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "discover" ? "border-amber-500 text-amber-700" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>Discover</button>
      </div>

      {tab === "library" ? (
        <div className="space-y-5">
          {/* Currently reading */}
          {reading.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Eye className="h-3 w-3" /> Currently Reading
              </p>
              <div className="space-y-2">
                {reading.map(book => (
                  <BookCard key={book.id} book={book}
                    onStatusChange={s => updateStatus(book.id, s)}
                    onRatingChange={r => updateRating(book.id, r)}
                    onRemove={() => removeBook(book.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Want to read */}
          {wantToRead.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Want to Read
              </p>
              <div className="space-y-2">
                {wantToRead.map(book => (
                  <BookCard key={book.id} book={book}
                    onStatusChange={s => updateStatus(book.id, s)}
                    onRatingChange={r => updateRating(book.id, r)}
                    onRemove={() => removeBook(book.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Finished */}
          {finished.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" /> Finished
              </p>
              <div className="space-y-2">
                {finished.map(book => (
                  <BookCard key={book.id} book={book}
                    onStatusChange={s => updateStatus(book.id, s)}
                    onRatingChange={r => updateRating(book.id, r)}
                    onRemove={() => removeBook(book.id)} />
                ))}
              </div>
            </div>
          )}

          {books.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">No books yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Add a book or check the Discover tab for curated recommendations.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Discover tab */
        <div className="space-y-5">
          {Object.entries(CURATED_LISTS).map(([key, list]) => (
            <div key={key}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{list.title}</p>
              <div className="space-y-2">
                {list.books.map(book => {
                  const alreadyAdded = books.some(b => b.title.toLowerCase() === book.title.toLowerCase())
                  return (
                    <Card key={book.title} className="card-hover">
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 italic">{book.why}</p>
                        </div>
                        {alreadyAdded ? (
                          <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300 shrink-0">Added</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs"
                            onClick={() => addBook(book.title, book.author, "want")}>
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Why read */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why track reading?</strong> The average CEO reads 50+ books per year. Warren Buffett reads 5-6 hours
            per day. Reading is the highest-ROI activity for personal growth — each book is a compressed lifetime of
            someone else's learning that you absorb in hours. Tracking what you read creates a feedback loop:
            you read more, you remember more, you grow faster.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/education" className="text-sm text-blue-600 hover:underline">Learning Paths</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/notes" className="text-sm text-violet-600 hover:underline">Quick Notes</a>
      </div>
    </div>
  )
}

function BookCard({ book, onStatusChange, onRatingChange, onRemove }: {
  book: Book
  onStatusChange: (s: Book["status"]) => void
  onRatingChange: (r: number) => void
  onRemove: () => void
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            book.status === "reading" ? "bg-amber-100 text-amber-600" :
            book.status === "finished" ? "bg-emerald-100 text-emerald-600" :
            "bg-slate-100 text-slate-500"
          )}>
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{book.title}</p>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            {/* Rating */}
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => onRatingChange(book.rating === s ? 0 : s)}
                  className="p-0">
                  <Star className={cn("h-3.5 w-3.5 transition-colors",
                    s <= book.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
                  )} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {book.status === "want" && (
              <button onClick={() => onStatusChange("reading")}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                title="Start reading">
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            {book.status === "reading" && (
              <button onClick={() => onStatusChange("finished")}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                title="Mark finished">
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={onRemove}
              className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-destructive hover:bg-red-50 transition-colors"
              title="Remove">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
