"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MEDITATIONS = [
  {
    name: "Body Scan",
    duration: 300, // 5 minutes
    color: "from-indigo-500 to-violet-500",
    description: "Systematically relax every part of your body from toes to head.",
    guide: [
      { at: 0, text: "Close your eyes. Take three deep breaths." },
      { at: 15, text: "Bring your attention to your feet. Notice any tension. Let it go." },
      { at: 45, text: "Move up to your calves and shins. Soften them." },
      { at: 75, text: "Notice your thighs and hips. Release any tightness." },
      { at: 105, text: "Feel your belly rise and fall with each breath." },
      { at: 135, text: "Relax your lower back. Let it melt into the surface beneath you." },
      { at: 165, text: "Soften your chest and upper back." },
      { at: 195, text: "Release your shoulders. Let them drop away from your ears." },
      { at: 225, text: "Relax your arms, hands, and fingers." },
      { at: 255, text: "Soften your neck, jaw, and face." },
      { at: 275, text: "Feel your whole body relaxed and at ease." },
      { at: 290, text: "Gently begin to bring your awareness back to the room." },
    ],
  },
  {
    name: "Loving Kindness",
    duration: 300,
    color: "from-rose-400 to-pink-500",
    description: "Send compassion to yourself and others. Scientifically shown to increase empathy.",
    guide: [
      { at: 0, text: "Sit comfortably. Close your eyes. Breathe naturally." },
      { at: 20, text: "Think of yourself. Silently repeat: 'May I be happy. May I be healthy. May I be safe.'" },
      { at: 60, text: "Continue: 'May I live with ease. May I be free from suffering.'" },
      { at: 100, text: "Now think of someone you love. Send them the same wishes." },
      { at: 140, text: "'May you be happy. May you be healthy. May you be safe.'" },
      { at: 180, text: "Think of someone neutral — a stranger. Send them kindness too." },
      { at: 220, text: "'May you be happy. May you be healthy. May you be safe.'" },
      { at: 250, text: "Expand this feeling to everyone. All beings everywhere." },
      { at: 280, text: "'May all beings be happy. May all beings be free from suffering.'" },
      { at: 295, text: "Gently return to the present. Open your eyes when ready." },
    ],
  },
  {
    name: "Breath Awareness",
    duration: 180, // 3 minutes
    color: "from-cyan-500 to-blue-500",
    description: "The simplest meditation. Just observe your breath. Nothing else.",
    guide: [
      { at: 0, text: "Sit still. Close your eyes." },
      { at: 10, text: "Notice your breath. Don't change it. Just observe." },
      { at: 30, text: "Feel the air enter your nostrils. Cool on the way in." },
      { at: 50, text: "Feel your chest and belly expand." },
      { at: 70, text: "Feel the warm air leave. Your body relaxes." },
      { at: 90, text: "If your mind wanders, that's normal. Gently return to the breath." },
      { at: 120, text: "Every time you notice you've wandered, that IS the practice." },
      { at: 150, text: "One more minute. Just breathing. Just being." },
      { at: 175, text: "Slowly open your eyes. Notice how you feel." },
    ],
  },
  {
    name: "Gratitude Meditation",
    duration: 240, // 4 minutes
    color: "from-emerald-400 to-teal-500",
    description: "Cultivate gratitude through visualization. Changes your brain's default mode.",
    guide: [
      { at: 0, text: "Close your eyes. Take a slow, deep breath." },
      { at: 15, text: "Think of one thing you're grateful for today. Something simple." },
      { at: 40, text: "Really feel it. What does gratitude feel like in your body?" },
      { at: 70, text: "Think of a person you're grateful for. Picture their face." },
      { at: 100, text: "Silently thank them. Feel the warmth of connection." },
      { at: 130, text: "Think of your body. It carried you through today. Thank it." },
      { at: 160, text: "Think of a challenge that taught you something. Be grateful for the lesson." },
      { at: 190, text: "Expand this gratitude to the present moment. You are here. You are alive." },
      { at: 220, text: "Hold this feeling. Carry it with you when you open your eyes." },
      { at: 235, text: "Gently open your eyes." },
    ],
  },
  {
    name: "10-Minute Sit",
    duration: 600,
    color: "from-violet-500 to-purple-600",
    description: "No guidance. Just sit in silence for 10 minutes. Timer only.",
    guide: [
      { at: 0, text: "Sit comfortably. Close your eyes. Begin." },
      { at: 300, text: "Halfway." },
      { at: 570, text: "30 seconds remaining." },
      { at: 595, text: "Open your eyes when ready." },
    ],
  },
]

export default function MeditatePage() {
  const [selected, setSelected] = useState<typeof MEDITATIONS[0] | null>(null)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentGuide, setCurrentGuide] = useState("")
  const [complete, setComplete] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function start(meditation: typeof MEDITATIONS[0]) {
    setSelected(meditation)
    setRunning(true)
    setComplete(false)
    setElapsed(0)
    setCurrentGuide(meditation.guide[0]?.text ?? "")

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1
        // Update guide text
        const guide = meditation.guide.filter(g => g.at <= next)
        if (guide.length > 0) setCurrentGuide(guide[guide.length - 1].text)

        if (next >= meditation.duration) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setComplete(true)
          setSessionsToday(s => s + 1)
          return meditation.duration
        }
        return next
      })
    }, 1000)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setSelected(null)
    setComplete(false)
    setElapsed(0)
  }

  const remaining = selected ? selected.duration - elapsed : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = selected ? (elapsed / selected.duration) * 100 : 0

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Meditation</h1>
        </div>
        <p className="text-sm text-muted-foreground">Guided meditations backed by neuroscience. Start with 3 minutes.</p>
      </div>

      {/* Active session */}
      {(running || complete) && selected && (
        <Card className={cn("overflow-hidden border-2", complete ? "border-emerald-300" : "border-violet-200")}>
          <div className={cn("h-1.5 transition-all duration-1000 bg-gradient-to-r", selected.color)} style={{ width: `${progress}%` }} />
          <CardContent className="p-8 text-center">
            {complete ? (
              <div>
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-emerald-600">Session Complete</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(selected.duration / 60)} minutes of presence. That's {sessionsToday} session{sessionsToday > 1 ? "s" : ""} today.
                </p>
                <Button className="mt-4" onClick={stop}>Done</Button>
              </div>
            ) : (
              <div>
                {/* Pulsing circle */}
                <div className="flex h-36 w-36 mx-auto items-center justify-center rounded-full bg-violet-50 mb-6 animate-pulse" style={{ animationDuration: "4s" }}>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100">
                    <p className="text-3xl font-bold font-mono text-violet-600">
                      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                    </p>
                  </div>
                </div>

                {/* Guide text */}
                <p className="text-sm text-muted-foreground italic leading-relaxed min-h-[40px] transition-all">
                  "{currentGuide}"
                </p>

                <Button variant="outline" className="mt-4" onClick={stop}>
                  <Pause className="h-4 w-4" /> End session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meditation selection */}
      {!running && !complete && (
        <div className="space-y-3">
          {MEDITATIONS.map((m) => (
            <Card key={m.name} className="card-hover cursor-pointer" onClick={() => start(m)}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", m.color)}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    <span className="text-xs text-muted-foreground">{Math.round(m.duration / 60)} min</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                </div>
                <Play className="h-5 w-5 text-muted-foreground/30 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {sessionsToday > 0 && !running && !complete && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-emerald-600">{sessionsToday} session{sessionsToday > 1 ? "s" : ""} completed today</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The science:</strong> 8 weeks of meditation physically changes your brain — increasing gray matter in
            areas linked to self-awareness, compassion, and introspection, while shrinking the amygdala (stress center).
            Studies at Harvard, Yale, and Johns Hopkins confirm benefits for anxiety, depression, pain, and cognitive function.
            Even 3 minutes a day shows measurable effects after 2 weeks.
          </p>
        </CardContent>
      </Card>

      <a href="/mental-health" className="text-sm text-pink-600 hover:underline block">← Mental Health</a>
    </div>
  )
}
