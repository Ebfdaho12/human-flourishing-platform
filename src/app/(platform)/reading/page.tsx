"use client"

import { useState, useEffect, useMemo } from "react"
import { BookOpen, Plus, CheckCircle, Clock, Star, Trash2, Eye, Target, Flame, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  status: "reading" | "finished" | "want" | "abandoned"
  rating: number // 0-5, 0 = unrated
  notes: string
  startDate: string
  finishDate?: string
  pages?: number
  currentPage?: number
  genre?: string
  pageLog?: { date: string; page: number }[] // pages-read-by-date entries
}

const GENRES = ["Mindset", "Money", "Truth", "Health", "History", "Fiction", "Biography", "Science", "Other"]
const GENRE_COLORS: Record<string, string> = {
  Mindset: "#f59e0b", Money: "#10b981", Truth: "#8b5cf6", Health: "#ef4444",
  History: "#06b6d4", Fiction: "#ec4899", Biography: "#6366f1", Science: "#0ea5e9", Other: "#64748b",
}

const CURATED_LISTS: Record<string, { title: string; books: { title: string; author: string; why: string; genre: string }[] }> = {
  mindset: {
    title: "Mindset & Growth",
    books: [
      { title: "Atomic Habits", author: "James Clear", why: "How tiny changes compound into remarkable results", genre: "Mindset" },
      { title: "Mindset", author: "Carol Dweck", why: "Fixed vs growth mindset — changes how you see failure", genre: "Mindset" },
      { title: "The Obstacle Is the Way", author: "Ryan Holiday", why: "Stoic philosophy applied to modern challenges", genre: "Mindset" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", why: "Finding purpose even in the worst circumstances", genre: "Mindset" },
      { title: "Deep Work", author: "Cal Newport", why: "Focus is the new IQ — how to actually concentrate", genre: "Mindset" },
    ],
  },
  money: {
    title: "Money & Wealth",
    books: [
      { title: "The Psychology of Money", author: "Morgan Housel", why: "Why behavior matters more than knowledge in finance", genre: "Money" },
      { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", why: "Assets vs liabilities — how the wealthy think", genre: "Money" },
      { title: "The Simple Path to Wealth", author: "JL Collins", why: "Index funds and the case against financial complexity", genre: "Money" },
      { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", why: "Practical, no-guilt approach to automating your finances", genre: "Money" },
      { title: "The Millionaire Next Door", author: "Thomas Stanley", why: "Real millionaires look nothing like what you expect", genre: "Money" },
    ],
  },
  truth: {
    title: "Truth & Critical Thinking",
    books: [
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", why: "How your brain tricks you — and how to notice", genre: "Truth" },
      { title: "Factfulness", author: "Hans Rosling", why: "The world is better than you think — data proves it", genre: "Truth" },
      { title: "The Art of Thinking Clearly", author: "Rolf Dobelli", why: "99 cognitive biases and how to overcome them", genre: "Truth" },
      { title: "Sapiens", author: "Yuval Noah Harari", why: "How stories hold civilization together", genre: "History" },
      { title: "Manufacturing Consent", author: "Noam Chomsky", why: "How media shapes what you believe — both sides", genre: "Truth" },
    ],
  },
  health: {
    title: "Health & Longevity",
    books: [
      { title: "Why We Sleep", author: "Matthew Walker", why: "Sleep is the single most important thing for health", genre: "Health" },
      { title: "Outlive", author: "Peter Attia", why: "The science of longevity — exercise, nutrition, emotional health", genre: "Health" },
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", why: "How trauma lives in the body and how to heal", genre: "Health" },
      { title: "Breath", author: "James Nestor", why: "How you breathe affects anxiety, sleep, and performance", genre: "Health" },
      { title: "Spark", author: "John Ratey", why: "Exercise is the single best thing for your brain", genre: "Health" },
    ],
  },
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newAuthor, setNewAuthor] = useState("")
  const [newPages, setNewPages] = useState("")
  const [newGenre, setNewGenre] = useState("Other")
  const [tab, setTab] = useState<"library" | "analytics" | "discover">("library")
  const [yearGoal, setYearGoal] = useState(12)
  const [logFor, setLogFor] = useState<string | null>(null)
  const [logPage, setLogPage] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-reading")
    if (stored) setBooks(JSON.parse(stored))
    const g = localStorage.getItem("hfp-reading-goal")
    if (g) setYearGoal(parseInt(g) || 12)
  }, [])

  function save(updated: Book[]) {
    setBooks(updated)
    localStorage.setItem("hfp-reading", JSON.stringify(updated))
  }

  function saveGoal(n: number) {
    setYearGoal(n)
    localStorage.setItem("hfp-reading-goal", String(n))
  }

  function addBook(title: string, author: string, status: Book["status"] = "want", pages?: number, genre: string = "Other") {
    if (!title.trim()) return
    if (books.some(b => b.title.toLowerCase() === title.toLowerCase())) return
    save([...books, {
      id: Date.now().toString(36),
      title: title.trim(),
      author: author.trim(),
      status,
      rating: 0,
      notes: "",
      startDate: status === "reading" ? new Date().toISOString() : "",
      pages,
      currentPage: 0,
      genre,
      pageLog: [],
    }])
    setNewTitle(""); setNewAuthor(""); setNewPages(""); setNewGenre("Other")
    setShowAdd(false)
  }

  function updateStatus(id: string, status: Book["status"]) {
    save(books.map(b => {
      if (b.id !== id) return b
      const updates: Partial<Book> = { status }
      if (status === "reading" && !b.startDate) updates.startDate = new Date().toISOString()
      if (status === "finished") {
        updates.finishDate = new Date().toISOString()
        if (b.pages) updates.currentPage = b.pages
      }
      return { ...b, ...updates }
    }))
  }

  function updateRating(id: string, rating: number) {
    save(books.map(b => b.id === id ? { ...b, rating } : b))
  }

  function removeBook(id: string) {
    save(books.filter(b => b.id !== id))
  }

  function logPages(id: string, page: number) {
    save(books.map(b => {
      if (b.id !== id) return b
      const today = new Date().toISOString().slice(0, 10)
      const pageLog = [...(b.pageLog || [])]
      const idx = pageLog.findIndex(e => e.date === today)
      if (idx >= 0) pageLog[idx] = { date: today, page }
      else pageLog.push({ date: today, page })
      return { ...b, currentPage: page, pageLog }
    }))
    setLogFor(null); setLogPage("")
  }

  const reading = books.filter(b => b.status === "reading")
  const finished = books.filter(b => b.status === "finished")
  const wantToRead = books.filter(b => b.status === "want")
  const abandoned = books.filter(b => b.status === "abandoned")

  // --- ANALYTICS (computed from real book data) ---
  const analytics = useMemo(() => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const lastYear = thisYear - 1

    // Finished books by year
    const finishedThisYear = finished.filter(b => b.finishDate && new Date(b.finishDate).getFullYear() === thisYear)
    const finishedLastYear = finished.filter(b => b.finishDate && new Date(b.finishDate).getFullYear() === lastYear)

    // Books per month (last 12 months) sparkline
    const monthsBack = 12
    const perMonth: number[] = Array.from({ length: monthsBack }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1)
      const y = d.getFullYear(), m = d.getMonth()
      return finished.filter(b => {
        if (!b.finishDate) return false
        const fd = new Date(b.finishDate)
        return fd.getFullYear() === y && fd.getMonth() === m
      }).length
    })

    // Most-read month in past year
    let topMonthIdx = -1, topMonthCount = 0
    perMonth.forEach((c, i) => { if (c > topMonthCount) { topMonthCount = c; topMonthIdx = i } })
    const topMonthDate = topMonthIdx >= 0 ? new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - topMonthIdx), 1) : null

    // Genre distribution (finished + reading)
    const genreMap = new Map<string, number>()
    ;[...finished, ...reading].forEach(b => {
      const g = b.genre || "Other"
      genreMap.set(g, (genreMap.get(g) || 0) + 1)
    })
    const genres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1])
    const totalGenre = genres.reduce((s, [, n]) => s + n, 0)

    // Completion rate
    const attempted = finished.length + abandoned.length
    const completionRate = attempted > 0 ? Math.round((finished.length / attempted) * 100) : 0

    // Reading streak: consecutive days ending today with any pageLog entry across any book
    const readingDates = new Set<string>()
    books.forEach(b => (b.pageLog || []).forEach(e => readingDates.add(e.date)))
    // Also count day a book was finished as a read day
    finished.forEach(b => { if (b.finishDate) readingDates.add(b.finishDate.slice(0, 10)) })
    let streak = 0
    const check = new Date()
    for (let i = 0; i < 365; i++) {
      const k = check.toISOString().slice(0, 10)
      if (readingDates.has(k)) { streak++; check.setDate(check.getDate() - 1) }
      else if (i === 0) { check.setDate(check.getDate() - 1) } // allow no entry today
      else break
    }

    // Average reading time per finished book (days)
    const durations = finished
      .filter(b => b.startDate && b.finishDate)
      .map(b => Math.max(1, Math.round((new Date(b.finishDate!).getTime() - new Date(b.startDate).getTime()) / 86400000)))
    const avgDays = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0

    // Yearly goal pace
    const dayOfYear = Math.floor((now.getTime() - new Date(thisYear, 0, 1).getTime()) / 86400000) + 1
    const expected = (dayOfYear / 365) * yearGoal
    const paceDelta = finishedThisYear.length - expected // positive = ahead
    const onTrack = paceDelta >= -0.5
    const goalPct = Math.min(100, Math.round((finishedThisYear.length / Math.max(1, yearGoal)) * 100))

    // Estimated finish for current book
    const currentBook = reading.find(b => b.pages && b.currentPage && b.pageLog && b.pageLog.length >= 2)
    let estFinish: { book: Book; days: number; date: string } | null = null
    if (currentBook && currentBook.pages && currentBook.pageLog && currentBook.pageLog.length >= 2) {
      const log = [...currentBook.pageLog].sort((a, b) => a.date.localeCompare(b.date))
      const first = log[0], last = log[log.length - 1]
      const spanDays = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000)
      const pagesRead = last.page - first.page
      const rate = pagesRead / spanDays // pages/day
      if (rate > 0) {
        const remaining = currentBook.pages - last.page
        const days = Math.ceil(remaining / rate)
        const when = new Date(); when.setDate(when.getDate() + days)
        estFinish = { book: currentBook, days, date: when.toLocaleDateString([], { month: "short", day: "numeric" }) }
      }
    }

    return {
      finishedThisYear, finishedLastYear, perMonth, topMonthDate, topMonthCount,
      genres, totalGenre, completionRate, attempted, streak, avgDays,
      expected, paceDelta, onTrack, goalPct, estFinish, dayOfYear,
    }
  }, [books, finished, reading, abandoned, yearGoal])

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
        <div className="grid grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{reading.length}</p>
            <p className="text-xs text-muted-foreground">Reading now</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{finished.length}</p>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{wantToRead.length}</p>
            <p className="text-xs text-muted-foreground">Want to read</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5" />{analytics.streak}
            </p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </CardContent></Card>
        </div>
      )}

      {/* Add book form */}
      {showAdd && (
        <Card className="border-2 border-amber-200">
          <CardContent className="p-4 space-y-3">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Book title" />
            <Input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author" />
            <div className="flex gap-2">
              <Input value={newPages} onChange={e => setNewPages(e.target.value)} placeholder="Pages (optional)" type="number" className="flex-1" />
              <select value={newGenre} onChange={e => setNewGenre(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm">
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addBook(newTitle, newAuthor, "reading", newPages ? parseInt(newPages) : undefined, newGenre)} disabled={!newTitle.trim()} className="flex-1">
                <Eye className="h-4 w-4" /> Currently Reading
              </Button>
              <Button variant="outline" onClick={() => addBook(newTitle, newAuthor, "want", newPages ? parseInt(newPages) : undefined, newGenre)} disabled={!newTitle.trim()} className="flex-1">
                <Clock className="h-4 w-4" /> Want to Read
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(["library", "analytics", "discover"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
              tab === t ? "border-amber-500 text-amber-700" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>{t === "library" ? "My Library" : t}</button>
        ))}
      </div>

      {tab === "library" && (
        <div className="space-y-5">
          {reading.length > 0 && (
            <Section label="Currently Reading" icon={<Eye className="h-3 w-3" />}>
              {reading.map(book => (
                <BookCard key={book.id} book={book}
                  onStatusChange={s => updateStatus(book.id, s)}
                  onRatingChange={r => updateRating(book.id, r)}
                  onRemove={() => removeBook(book.id)}
                  onLogPages={() => { setLogFor(book.id); setLogPage(String(book.currentPage || 0)) }} />
              ))}
              {logFor && (
                <Card className="border-amber-300 border-2 mt-2">
                  <CardContent className="p-3 flex gap-2">
                    <Input type="number" value={logPage} onChange={e => setLogPage(e.target.value)}
                      placeholder="Current page" className="flex-1" autoFocus />
                    <Button size="sm" onClick={() => logPages(logFor, parseInt(logPage) || 0)}>Log</Button>
                    <Button size="sm" variant="outline" onClick={() => { setLogFor(null); setLogPage("") }}>Cancel</Button>
                  </CardContent>
                </Card>
              )}
            </Section>
          )}
          {wantToRead.length > 0 && (
            <Section label="Want to Read" icon={<Clock className="h-3 w-3" />}>
              {wantToRead.map(book => (
                <BookCard key={book.id} book={book}
                  onStatusChange={s => updateStatus(book.id, s)}
                  onRatingChange={r => updateRating(book.id, r)}
                  onRemove={() => removeBook(book.id)} />
              ))}
            </Section>
          )}
          {finished.length > 0 && (
            <Section label={`Finished (${finished.length})`} icon={<CheckCircle className="h-3 w-3" />}>
              {finished.map(book => (
                <BookCard key={book.id} book={book}
                  onStatusChange={s => updateStatus(book.id, s)}
                  onRatingChange={r => updateRating(book.id, r)}
                  onRemove={() => removeBook(book.id)} />
              ))}
            </Section>
          )}
          {abandoned.length > 0 && (
            <Section label={`Abandoned (${abandoned.length})`} icon={<Trash2 className="h-3 w-3" />}>
              {abandoned.map(book => (
                <BookCard key={book.id} book={book}
                  onStatusChange={s => updateStatus(book.id, s)}
                  onRatingChange={r => updateRating(book.id, r)}
                  onRemove={() => removeBook(book.id)} />
              ))}
            </Section>
          )}
          {books.length === 0 && (
            <Card><CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No books yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Add a book or check the Discover tab.</p>
            </CardContent></Card>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          {finished.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No finished books yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Analytics unlock once you mark at least one book finished.</p>
            </CardContent></Card>
          ) : (
            <>
              {/* Yearly goal pace */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-600" /> {new Date().getFullYear()} Goal Pace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-3xl font-bold text-amber-700">{analytics.finishedThisYear.length} <span className="text-base text-muted-foreground font-normal">/ {yearGoal}</span></p>
                      <p className="text-xs text-muted-foreground">
                        Last year: {analytics.finishedLastYear.length} {analytics.finishedThisYear.length > analytics.finishedLastYear.length && <span className="text-emerald-600">(+{analytics.finishedThisYear.length - analytics.finishedLastYear.length})</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(analytics.onTrack ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-orange-100 text-orange-700 border-orange-300")} variant="outline">
                        {analytics.onTrack ? "On track" : "Behind pace"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Expected by today: {analytics.expected.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  {/* Goal progress bar with pace marker */}
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                      style={{ width: `${analytics.goalPct}%` }} />
                    <div className="absolute inset-y-0 w-0.5 bg-slate-700"
                      style={{ left: `${Math.min(100, (analytics.expected / yearGoal) * 100)}%` }} title="Expected pace" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <label className="text-xs text-muted-foreground">Yearly goal:</label>
                    <Input type="number" value={yearGoal} onChange={e => saveGoal(parseInt(e.target.value) || 1)}
                      className="h-7 w-20 text-sm" />
                    <span className="text-xs text-muted-foreground">books</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sparkline: books/month */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" /> Books Finished — Last 12 Months
                </CardTitle></CardHeader>
                <CardContent>
                  <Sparkline data={analytics.perMonth} />
                  {analytics.topMonthDate && analytics.topMonthCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-amber-600" />
                      Most-read month: <strong className="text-foreground">{MONTHS[analytics.topMonthDate.getMonth()]} {analytics.topMonthDate.getFullYear()}</strong>
                      <span>({analytics.topMonthCount} book{analytics.topMonthCount === 1 ? "" : "s"})</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Genre donut */}
              {analytics.totalGenre > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Genre Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Donut segments={analytics.genres.map(([name, count]) => ({
                        name, value: count, color: GENRE_COLORS[name] || "#64748b"
                      }))} size={140} />
                      <div className="flex-1 space-y-1.5">
                        {analytics.genres.map(([name, count]) => {
                          const pct = Math.round((count / analytics.totalGenre) * 100)
                          return (
                            <div key={name} className="flex items-center gap-2 text-xs">
                              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: GENRE_COLORS[name] || "#64748b" }} />
                              <span className="flex-1">{name}</span>
                              <span className="text-muted-foreground tabular-nums">{count} ({pct}%)</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Completion + avg time */}
              <div className="grid grid-cols-2 gap-3">
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-emerald-700">{analytics.completionRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {finished.length} finished · {abandoned.length} abandoned
                  </p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Reading Time</p>
                  <p className="text-2xl font-bold text-amber-700">{analytics.avgDays > 0 ? `${analytics.avgDays}d` : "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.avgDays > 0 ? `Across ${finished.filter(b => b.startDate && b.finishDate).length} books` : "Need start+finish dates"}
                  </p>
                </CardContent></Card>
              </div>

              {/* Estimated finish for current book */}
              {analytics.estFinish && (
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-1">Estimated Finish</p>
                    <p className="text-sm font-medium">{analytics.estFinish.book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      At current pace ({analytics.estFinish.book.currentPage}/{analytics.estFinish.book.pages} pages),
                      you'll finish in <strong className="text-amber-700">{analytics.estFinish.days} days</strong> (around {analytics.estFinish.date}).
                    </p>
                  </CardContent>
                </Card>
              )}

              {reading.length > 0 && !analytics.estFinish && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      Log pages (2+ entries) on a current book with page count set to get an estimated finish date.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {tab === "discover" && (
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
                            onClick={() => addBook(book.title, book.author, "want", undefined, book.genre)}>
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

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why track reading?</strong> The average CEO reads 50+ books per year. Warren Buffett reads 5-6 hours per day.
            Reading is the highest-ROI activity for personal growth — each book is a compressed lifetime of someone else's learning
            that you absorb in hours. Tracking creates a feedback loop: you read more, you remember more, you grow faster.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/education" className="text-sm text-blue-600 hover:underline">Learning Paths</a>
        <a href="/challenges" className="text-sm text-orange-600 hover:underline">30-Day Challenges</a>
        <a href="/notes" className="text-sm text-violet-600 hover:underline">Quick Notes</a>
      </div>
    </div>
  )
}

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function BookCard({ book, onStatusChange, onRatingChange, onRemove, onLogPages }: {
  book: Book
  onStatusChange: (s: Book["status"]) => void
  onRatingChange: (r: number) => void
  onRemove: () => void
  onLogPages?: () => void
}) {
  const pct = book.pages && book.currentPage ? Math.round((book.currentPage / book.pages) * 100) : 0
  return (
    <Card className="card-hover">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            book.status === "reading" ? "bg-amber-100 text-amber-600" :
            book.status === "finished" ? "bg-emerald-100 text-emerald-600" :
            book.status === "abandoned" ? "bg-red-50 text-red-500" :
            "bg-slate-100 text-slate-500"
          )}>
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">{book.title}</p>
              {book.genre && <Badge variant="outline" className="text-[9px]">{book.genre}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            {book.status === "reading" && book.pages && (
              <div className="mt-1.5">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Page {book.currentPage || 0} / {book.pages} ({pct}%)
                </p>
              </div>
            )}
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => onRatingChange(book.rating === s ? 0 : s)} className="p-0">
                  <Star className={cn("h-3.5 w-3.5 transition-colors",
                    s <= book.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
                  )} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {book.status === "reading" && onLogPages && book.pages && (
              <button onClick={onLogPages}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title="Log pages read">
                <TrendingUp className="h-3.5 w-3.5" />
              </button>
            )}
            {book.status === "want" && (
              <button onClick={() => onStatusChange("reading")}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                title="Start reading">
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            {book.status === "reading" && (
              <>
                <button onClick={() => onStatusChange("finished")}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                  title="Mark finished">
                  <CheckCircle className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onStatusChange("abandoned")}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Abandon">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {book.status !== "reading" && (
              <button onClick={onRemove}
                className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-destructive hover:bg-red-50 transition-colors"
                title="Remove">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const w = 560, h = 80, pad = 6
  const max = Math.max(1, ...data)
  const step = (w - pad * 2) / Math.max(1, data.length - 1)
  const pts = data.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const)
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`
  const now = new Date()
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-amber" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark-amber)" />
        <path d={path} stroke="#d97706" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={data[i] === max && max > 0 ? 3 : 1.8}
            fill={data[i] === max && max > 0 ? "#d97706" : "#fbbf24"} />
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
        {data.map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (data.length - 1 - i), 1)
          return <span key={i}>{MONTHS[d.getMonth()][0]}</span>
        })}
      </div>
    </div>
  )
}

function Donut({ segments, size = 140 }: { segments: { name: string; value: number; color: string }[]; size?: number }) {
  const r = size / 2 - 8
  const cx = size / 2, cy = size / 2
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let angle = -Math.PI / 2
  const paths = segments.map(seg => {
    const frac = seg.value / total
    const a2 = angle + frac * Math.PI * 2
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle)
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
    const large = frac > 0.5 ? 1 : 0
    const d = `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`
    angle = a2
    return { d, color: seg.color }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />)}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <text x={cx} y={cy - 3} textAnchor="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 700 }}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>books</text>
    </svg>
  )
}
