"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Compass, Play, Square, Eye, Sun, Moon, Clock, Feather, Mountain,
  Flame, Sparkles, Leaf, Infinity as InfinityIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSyncedStorage } from "@/hooks/use-synced-storage"

/**
 * Presence
 *
 * The being-layer counterpart to /livelihood. Contemplative practice as a
 * first-class concern — meditation, awe, undistracted time, stillness,
 * wisdom from traditions that have thought about this longer than tech has
 * existed.
 *
 * Design tension deliberately held: tracking is available but optional.
 * A "Silent sit" button exists for pure practice with no metrics at all.
 * Gamification ruins contemplation — this UI tries not to commit that sin.
 *
 * Intentional design choices:
 * - More whitespace than other pages
 * - Lower color intensity (muted palette, fewer accents)
 * - Longer line-height
 * - Slower practice-timer animations
 * - Contemplative prompts appear one at a time, not in grids
 */

type MeditationSession = { id: string; at: string; minutes: number; intention?: string; note?: string; silent?: boolean }
type AweMoment = { id: string; at: string; text: string }
type StillnessLog = { id: string; at: string; minutes: number; context?: string }
type UndistractedLog = { date: string; minutes: number }

type Tradition = {
  key: string
  name: string
  origin: string
  oneLine: string
  practice: string
  quote: string
  attribution: string
}

const TRADITIONS: Tradition[] = [
  {
    key: "zen",
    name: "Zen Buddhism",
    origin: "Japan (from China, 6th c.)",
    oneLine: "Practice is the point. Sit; don't sit to become anything.",
    practice: "Zazen — seated attention, spine upright, eyes half-open, breath noticed but not directed. Thought arises; return to the breath. Thirty minutes once is not the goal. The practice is the practice.",
    quote: "Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water.",
    attribution: "Zen proverb",
  },
  {
    key: "yoga",
    name: "Classical Yoga",
    origin: "India (codified ~200 BCE)",
    oneLine: "Yoga is the stilling of the fluctuations of the mind.",
    practice: "The eight limbs (Patañjali) — ethical foundations (yama, niyama), then posture (asana), breath (pranayama), withdrawal (pratyahara), concentration (dharana), meditation (dhyana), and absorption (samadhi). Modern postural yoga is one step of eight.",
    quote: "Yogaś citta-vṛtti-nirodhaḥ.",
    attribution: "Patañjali, Yoga Sutras 1.2",
  },
  {
    key: "advaita",
    name: "Advaita Vedanta",
    origin: "India (classical period)",
    oneLine: "The seeker is what is sought. Ask: who is asking?",
    practice: "Self-inquiry — turn the attention back on itself. When a thought arises, ask: 'to whom does this thought occur?' The answer is always 'to me' — then ask 'who am I?' The question, held, dissolves the questioner.",
    quote: "The Self alone is real; the world is appearance.",
    attribution: "Ramana Maharshi",
  },
  {
    key: "taoism",
    name: "Taoism",
    origin: "China (6th c. BCE)",
    oneLine: "The way that can be named is not the way.",
    practice: "Wu wei — action without forcing. Observe water: it finds the lowest ground and yet erodes stone. Align with what is, rather than imposing what you want. Stillness in motion, motion in stillness.",
    quote: "Those who know do not speak. Those who speak do not know.",
    attribution: "Lao Tzu, Tao Te Ching 56",
  },
  {
    key: "stoicism",
    name: "Stoicism",
    origin: "Greece (3rd c. BCE), Rome",
    oneLine: "You have power over your mind, not over events.",
    practice: "Dichotomy of control — before reacting, ask whether this is in your power. If yes, act. If not, release. Evening review: where did I act with virtue? Where did I not? Premeditatio malorum — visualize the worst case to reduce fear of it.",
    quote: "Confine yourself to the present.",
    attribution: "Marcus Aurelius, Meditations",
  },
  {
    key: "sufi",
    name: "Sufism",
    origin: "Persia, Islamic world (8th c.)",
    oneLine: "The heart is the organ of perception.",
    practice: "Dhikr — remembrance. Repeated phrase or breath, letting the discursive mind fall away. Sama — listening to music or poetry as contemplation. The whirling of the dervishes is moving meditation: the body spins, the heart rests.",
    quote: "Silence is the language of God; all else is poor translation.",
    attribution: "Rumi",
  },
  {
    key: "indigenous",
    name: "Indigenous Wisdom",
    origin: "Global, pre-colonial",
    oneLine: "Land is the teacher. Reciprocity is the practice.",
    practice: "Relation with place — knowing the specific trees, waters, animals, seasons of where you live. Gratitude as ceremony, not performance. Many traditions teach that attention to the more-than-human world restores attention to self. The specifics differ; the depth of presence to place is universal.",
    quote: "All my relations.",
    attribution: "Lakota invocation",
  },
  {
    key: "christian",
    name: "Christian Contemplation",
    origin: "Desert Fathers, 3rd-4th c.",
    oneLine: "Be still, and know.",
    practice: "Centering prayer — sit, use a sacred word as anchor, let thoughts pass without engagement. Lectio divina — slow reading of a short passage, hearing it rather than analyzing. The cloud of unknowing: let go of concepts, rest in not-knowing.",
    quote: "Be still, and know that I am God.",
    attribution: "Psalm 46:10",
  },
]

const PROMPTS = [
  "What did you notice today that you might have missed?",
  "When was the last time you were truly unhurried?",
  "What are you moving toward? What are you moving away from?",
  "If this moment is all there is, is it enough?",
  "What would you attend to more carefully if you had 10 years to live? 10 months? 10 days?",
  "What have you outgrown that you are still carrying?",
  "Who have you not thanked in a long time?",
  "What does your body know that your mind has not caught up to yet?",
  "Where is the edge of your attention right now?",
  "What, if you let it, would move you to tears?",
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function daysSinceTs(ts: number) {
  return (Date.now() - ts) / 86400000
}

export default function PresencePage() {
  const [meditations, setMeditations] = useSyncedStorage<MeditationSession[]>("hfp-meditations", [])
  const [awe, setAwe] = useSyncedStorage<AweMoment[]>("hfp-awe-log", [])
  const [stillness, setStillness] = useSyncedStorage<StillnessLog[]>("hfp-stillness", [])
  const [undistracted, setUndistracted] = useSyncedStorage<Record<string, number>>("hfp-undistracted", {})

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ─── Timer state (pure — no metrics written until user chooses) ───
  const [timerMode, setTimerMode] = useState<"idle" | "running">("idle")
  const [timerMinutes, setTimerMinutes] = useState(10)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [silentMode, setSilentMode] = useState(false)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (timerMode !== "running") return
    const t = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [timerMode])

  function startSit(silent: boolean) {
    startRef.current = Date.now()
    setElapsedSec(0)
    setSilentMode(silent)
    setTimerMode("running")
  }

  function endSit() {
    const minutes = Math.round(elapsedSec / 60)
    if (!silentMode && minutes >= 1) {
      const session: MeditationSession = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        minutes,
        intention,
        note: sessionNote,
      }
      setMeditations([session, ...meditations])
    }
    setTimerMode("idle")
    setElapsedSec(0)
    setIntention("")
    setSessionNote("")
  }

  const [intention, setIntention] = useState("")
  const [sessionNote, setSessionNote] = useState("")

  // ─── Awe log ───
  const [aweText, setAweText] = useState("")
  function addAwe() {
    if (!aweText.trim()) return
    setAwe([{ id: crypto.randomUUID(), at: new Date().toISOString(), text: aweText.trim().slice(0, 500) }, ...awe])
    setAweText("")
  }

  // ─── Undistracted time ───
  const [undistractedInput, setUndistractedInput] = useState("")
  function addUndistracted() {
    const m = parseInt(undistractedInput)
    if (!Number.isFinite(m) || m <= 0) return
    const k = todayKey()
    setUndistracted({ ...undistracted, [k]: (undistracted[k] ?? 0) + m })
    setUndistractedInput("")
  }

  // ─── Rotating prompt (stable per day) ───
  const prompt = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000)
    return PROMPTS[day % PROMPTS.length]
  }, [])

  // ─── Rotating tradition of the day ───
  const tradition = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000)
    return TRADITIONS[day % TRADITIONS.length]
  }, [])

  // ─── Gentle stats (tracked users only) — not streaks, not scores ───
  const stats = useMemo(() => {
    const now = Date.now()
    const last7 = meditations.filter(m => now - new Date(m.at).getTime() <= 7 * 86400000)
    const minutes7 = last7.reduce((s, m) => s + m.minutes, 0)
    const awe7 = awe.filter(a => now - new Date(a.at).getTime() <= 7 * 86400000).length
    const undistracted7 = Object.entries(undistracted)
      .filter(([k]) => now - new Date(k).getTime() <= 7 * 86400000)
      .reduce((s, [, v]) => s + v, 0)
    const hasAnyHistory = meditations.length > 0 || awe.length > 0 || Object.keys(undistracted).length > 0
    return { minutes7, awe7, undistracted7, hasAnyHistory, totalMeditations: meditations.length }
  }, [meditations, awe, undistracted])

  const displayTime = useMemo(() => {
    const mins = Math.floor(elapsedSec / 60)
    const secs = elapsedSec % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }, [elapsedSec])

  const shouldBell = timerMode === "running" && !silentMode && Math.floor(elapsedSec / 60) >= timerMinutes && elapsedSec % 60 === 0
  useEffect(() => {
    if (shouldBell) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = 528
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3)
        osc.connect(gain).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 3)
      } catch {}
    }
  }, [shouldBell])

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Hero — deliberately simple */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-zinc-400">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Presence</h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The being-layer. As AI takes more of the doing, the experience of being alive becomes more valuable — and more scarce if we don't protect it. Cultures have thought about this for thousands of years. This is a small place to practice.
        </p>
      </div>

      {/* Timer — the center of the page */}
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          {timerMode === "idle" ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Sit</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Pick a duration. Or use Silent Sit — a timer with no duration, no tracking, no metrics recorded. Just you, sitting.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[5, 10, 15, 20, 30, 45].map(m => (
                  <button
                    key={m}
                    onClick={() => setTimerMinutes(m)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-all",
                      timerMinutes === m
                        ? "border-slate-600 bg-slate-100 text-slate-900"
                        : "border-slate-200 text-muted-foreground hover:border-slate-400"
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="Intention (optional) — what are you sitting with?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-transparent focus:border-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => startSit(false)}
                  className="rounded-full bg-slate-700 hover:bg-slate-800 text-white text-sm px-6 py-2.5 flex items-center gap-2"
                >
                  <Play className="h-3.5 w-3.5" /> Begin {timerMinutes}m
                </button>
                <button
                  onClick={() => startSit(true)}
                  className="rounded-full border border-slate-300 text-muted-foreground hover:text-slate-900 hover:border-slate-500 text-sm px-5 py-2.5 flex items-center gap-2"
                  title="No timer bell, no tracking. Just sit."
                >
                  <InfinityIcon className="h-3.5 w-3.5" /> Silent sit
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-4">
              {silentMode && (
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Silent — nothing is being recorded</p>
              )}
              <p className="text-7xl font-light tabular-nums text-slate-700 tracking-tight">{displayTime}</p>
              {intention && !silentMode && (
                <p className="text-sm text-muted-foreground italic">&ldquo;{intention}&rdquo;</p>
              )}
              {!silentMode && (
                <div className="max-w-sm mx-auto">
                  <input
                    type="text"
                    value={sessionNote}
                    onChange={e => setSessionNote(e.target.value)}
                    placeholder="One-line note (optional, for after)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-transparent focus:border-slate-500 outline-none text-center"
                  />
                </div>
              )}
              <button
                onClick={endSit}
                className="rounded-full border border-slate-300 text-muted-foreground hover:text-slate-900 hover:border-slate-500 text-sm px-6 py-2.5 inline-flex items-center gap-2"
              >
                <Square className="h-3.5 w-3.5" /> End
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's prompt */}
      <div className="text-center py-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">For today</p>
        <p className="text-lg text-slate-700 leading-relaxed italic font-light max-w-xl mx-auto">
          {prompt}
        </p>
      </div>

      {/* Awe log */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 font-normal"><Sparkles className="h-4 w-4 text-slate-500" /> Awe log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Capture what moved you — a sunset, a child's question, a piece of music, the way light hit a room. Brief. One line is enough. (Research: awe has outsize effects on wellbeing and experienced time.)
          </p>
          <textarea
            value={aweText}
            onChange={e => setAweText(e.target.value)}
            placeholder="What moved you today?"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-transparent focus:border-slate-500 outline-none"
          />
          <button
            onClick={addAwe}
            disabled={!aweText.trim()}
            className="rounded-full bg-slate-700 hover:bg-slate-800 text-white text-xs px-4 py-1.5 disabled:opacity-40"
          >
            Save
          </button>

          {awe.length > 0 && (
            <div className="pt-3 border-t space-y-2">
              {awe.slice(0, 5).map(a => (
                <div key={a.id} className="text-xs text-muted-foreground italic leading-relaxed">
                  <span className="text-slate-400 not-italic tabular-nums mr-2">{new Date(a.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  {a.text}
                </div>
              ))}
              {awe.length > 5 && <p className="text-[10px] text-muted-foreground">{awe.length - 5} more moments logged</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Undistracted time */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 font-normal"><Eye className="h-4 w-4 text-slate-500" /> Undistracted time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Phone in another room. Computer closed. Not working, not doing — just with whatever is in front of you. Minutes count. This is the inverse of screen time.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={720}
              value={undistractedInput}
              onChange={e => setUndistractedInput(e.target.value)}
              placeholder="Minutes today"
              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-transparent focus:border-slate-500 outline-none"
            />
            <button
              onClick={addUndistracted}
              className="rounded-full bg-slate-700 hover:bg-slate-800 text-white text-xs px-4 py-2 disabled:opacity-40"
            >
              Add to today
            </button>
          </div>
          {stats.undistracted7 > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {stats.undistracted7} minutes undistracted in the last 7 days. <span className="italic">That&apos;s {(stats.undistracted7 / 60).toFixed(1)} hours of just being.</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tradition of the day */}
      <Card className="border-slate-200 bg-slate-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 font-normal">
            <Leaf className="h-4 w-4 text-slate-500" /> From a tradition that has thought about this longer than tech has existed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{tradition.name}</p>
            <p className="text-[10px] text-muted-foreground italic">{tradition.origin}</p>
          </div>
          <p className="text-base text-slate-800 leading-relaxed font-light">{tradition.oneLine}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{tradition.practice}</p>
          <div className="border-l-2 border-slate-300 pl-3 italic text-sm text-slate-700 font-light">
            &ldquo;{tradition.quote}&rdquo;
            <p className="text-[10px] text-muted-foreground mt-1 not-italic">— {tradition.attribution}</p>
          </div>
        </CardContent>
      </Card>

      {/* Gentle stats — collapsed by default, for those who want them */}
      {stats.hasAnyHistory && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-slate-700 text-center">
            Show gentle stats (opt-in)
          </summary>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sat 7d</p>
              <p className="text-xl font-light text-slate-700 tabular-nums">{stats.minutes7}<span className="text-[10px] text-muted-foreground">m</span></p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Awe 7d</p>
              <p className="text-xl font-light text-slate-700 tabular-nums">{stats.awe7}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Undistracted 7d</p>
              <p className="text-xl font-light text-slate-700 tabular-nums">{stats.undistracted7}<span className="text-[10px] text-muted-foreground">m</span></p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic text-center mt-3 max-w-md mx-auto leading-relaxed">
            No streaks. No levels. These numbers are information about your practice, not prizes. If watching them becomes grasping, stop watching them.
          </p>
        </details>
      )}

      {/* All traditions — for browsing when ready */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-slate-700">Browse all 8 traditions</summary>
        <div className="mt-4 space-y-3">
          {TRADITIONS.map(t => (
            <div key={t.key} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[10px] text-muted-foreground italic">{t.origin}</p>
              </div>
              <p className="text-xs text-slate-700 font-light leading-relaxed">{t.oneLine}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{t.practice}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground italic leading-relaxed pt-2">
            These are starting points, not complete pictures. Each tradition has centuries of depth, commentary, and lineage. If one calls to you, seek an actual teacher in that tradition — not a platform summary.
          </p>
        </div>
      </details>

      {/* Related */}
      <div className="flex gap-3 flex-wrap justify-center pt-4 border-t border-slate-100">
        <a href="/breathwork" className="text-xs text-muted-foreground hover:text-slate-700">Breathwork</a>
        <a href="/stoicism" className="text-xs text-muted-foreground hover:text-slate-700">Stoicism</a>
        <a href="/gratitude" className="text-xs text-muted-foreground hover:text-slate-700">Gratitude</a>
        <a href="/cold-exposure" className="text-xs text-muted-foreground hover:text-slate-700">Cold</a>
        <a href="/fasting" className="text-xs text-muted-foreground hover:text-slate-700">Fasting</a>
        <a href="/mental-health" className="text-xs text-muted-foreground hover:text-slate-700">Mind</a>
        <a href="/livelihood" className="text-xs text-muted-foreground hover:text-slate-700">Livelihood</a>
      </div>
    </div>
  )
}
