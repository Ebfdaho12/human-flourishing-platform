"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2, X, Sparkles, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { secureFetcher, encryptedPost } from "@/lib/encrypted-fetch"

/**
 * Aly — Voice Assistant for HFP
 *
 * Uses the Web Speech API (free, built into browsers).
 * No API cost. Processes commands locally.
 *
 * "Hey Aly, I'm feeling a 7 today" → logs mood
 * "Aly, what's my streak?" → reads it back
 * "Log 8 hours of sleep" → logs health entry
 * "How much FOUND do I have?" → reads balance
 */

// Command patterns Aly understands
function parseCommand(text: string): { action: string; data: any } | null {
  const lower = text.toLowerCase().trim()

  // Mood check-in: "I'm feeling a 7" or "mood 8" or "feeling great"
  const moodMatch = lower.match(/(?:feeling|mood|i'?m?\s+a?\s*)(\d+)/)
  if (moodMatch) {
    const score = parseInt(moodMatch[1])
    if (score >= 1 && score <= 10) return { action: "mood", data: { score } }
  }

  // Mood words
  if (/feeling (?:great|amazing|wonderful|fantastic)/i.test(lower)) return { action: "mood", data: { score: 9 } }
  if (/feeling (?:good|nice|well|fine|okay|ok)/i.test(lower)) return { action: "mood", data: { score: 7 } }
  if (/feeling (?:alright|meh|so-so)/i.test(lower)) return { action: "mood", data: { score: 5 } }
  if (/feeling (?:bad|down|low|sad|rough|terrible)/i.test(lower)) return { action: "mood", data: { score: 3 } }

  // Sleep: "logged 8 hours of sleep" or "slept 7 hours"
  const sleepMatch = lower.match(/(?:slept?|sleep)\s*(\d+\.?\d*)\s*hours?/)
  if (sleepMatch) return { action: "sleep", data: { hours: parseFloat(sleepMatch[1]) } }

  // Water: "drank 2 glasses" or "water 0.5 liters"
  const waterMatch = lower.match(/(?:water|drank?)\s*(\d+\.?\d*)\s*(?:glass|liter|l\b|cup)/)
  if (waterMatch) {
    const amount = parseFloat(waterMatch[1])
    const isLiters = /liter|l\b/i.test(lower)
    return { action: "water", data: { liters: isLiters ? amount : amount * 0.25 } }
  }

  // Weight: "weight 185" or "I weigh 170"
  const weightMatch = lower.match(/(?:weigh|weight)\s*(\d+\.?\d*)/)
  if (weightMatch) return { action: "weight", data: { weight: parseFloat(weightMatch[1]) } }

  // Steps: "walked 8000 steps"
  const stepsMatch = lower.match(/(\d+)\s*steps/)
  if (stepsMatch) return { action: "steps", data: { steps: parseInt(stepsMatch[1]) } }

  // Queries
  if (/streak|how.?s my streak/i.test(lower)) return { action: "query_streak", data: {} }
  if (/balance|found|how much/i.test(lower)) return { action: "query_balance", data: {} }
  if (/how am i doing|progress|summary/i.test(lower)) return { action: "query_summary", data: {} }

  // Navigation — Aly knows every page on the platform
  const NAV_MAP: [RegExp, string][] = [
    // Core pages
    [/dashboard|home\b/i, "/dashboard"],
    [/all tools|tool directory|browse tools/i, "/tools"],
    [/getting started|start here|new here/i, "/getting-started"],
    [/explore|search/i, "/explore"],
    [/settings/i, "/settings"],
    [/profile|identity/i, "/profile"],
    [/wallet|token|found\b/i, "/wallet"],
    [/bookmarks?/i, "/bookmarks"],
    [/report|issue|bug/i, "/report-issue"],
    [/community/i, "/community"],
    [/about/i, "/about"],
    [/privacy/i, "/privacy"],
    [/resources/i, "/resources"],

    // Health
    [/health|vitals/i, "/health"],
    [/sleep track/i, "/health/sleep"],
    [/sleep calc|bedtime|wake.?up time/i, "/sleep-calculator"],
    [/exercise|workout|gym/i, "/health/exercise"],
    [/food diary|food log|nutrition/i, "/health/food"],
    [/water track|hydration/i, "/health/water"],
    [/medic(?:ation|ine)|pills/i, "/health/medications"],
    [/symptom/i, "/health/symptoms"],
    [/body|bmi|weight track/i, "/health/body"],

    // Mental health
    [/mental|mood|self.?care/i, "/mental-health"],
    [/gratitude|grateful/i, "/mental-health/gratitude"],
    [/breath|breathing/i, "/mental-health/breathe"],
    [/meditat/i, "/mental-health/meditate"],
    [/affirm/i, "/mental-health/affirmations"],
    [/journal prompt/i, "/mental-health/prompts"],

    // Financial
    [/budget/i, "/budget"],
    [/net worth/i, "/net-worth"],
    [/debt|payoff|snowball|avalanche/i, "/debt-payoff"],
    [/compound interest|investing calculator/i, "/compound-interest"],
    [/tax|taxes/i, "/tax-estimator"],
    [/subscription|audit/i, "/subscriptions"],
    [/cost of living|cities/i, "/cost-of-living"],
    [/negotiat/i, "/negotiation"],
    [/side hustle|extra income|freelance/i, "/side-hustles"],
    [/financial literacy|money basics/i, "/education/finance"],

    // Family
    [/family econom|single income|one income|stay.?at.?home/i, "/family-economics"],
    [/family meeting/i, "/family-meeting"],
    [/screen time/i, "/screen-time"],
    [/chores|allowance|kids chore/i, "/kids-chores"],
    [/date night/i, "/date-nights"],
    [/meal plan|grocery/i, "/meal-planner"],
    [/relationship|inner circle|friends/i, "/relationships"],

    // Personal growth
    [/life wheel|life balance/i, "/life-wheel"],
    [/core values|values discovery/i, "/values"],
    [/vision board/i, "/vision"],
    [/skill invent/i, "/skills"],
    [/career path/i, "/career-path"],
    [/decision journal/i, "/decisions"],
    [/wins|celebrate|gratitude wall/i, "/wins"],
    [/reading list|books/i, "/reading"],
    [/challenge|30.?day/i, "/challenges"],
    [/habit stack/i, "/habit-stack"],

    // Productivity
    [/planner|daily plan/i, "/planner"],
    [/routine|morning routine|evening routine/i, "/routine"],
    [/focus|pomodoro|timer/i, "/focus"],
    [/notes?|brain dump/i, "/notes"],
    [/goals?/i, "/goals"],

    // Home
    [/home maintenance|repair schedule/i, "/home-maintenance"],
    [/emergency|preparedness|survival/i, "/preparedness"],
    [/food system|food labels|organic|grow your own/i, "/food-system"],

    // Education
    [/economics education|austrian|friedman|hayek|keynes/i, "/education/economics"],
    [/civiliz|empire|rise and fall|dalio/i, "/civilizations"],
    [/money history|1971|gold standard|nixon/i, "/money-history"],
    [/fallac|logical|argument/i, "/logical-fallacies"],
    [/media ownership|who owns the news/i, "/media-ownership"],
    [/rights|charter|bill of rights|freedom|constitution/i, "/rights"],
    [/learn|education|study|tutor/i, "/education"],
    [/personalized learn/i, "/education/personalized"],

    // Workforce / Career
    [/workforce|labor shortage|birth rate/i, "/workforce"],

    // Core modules
    [/governance|politic|legislation|vote/i, "/governance"],
    [/desci|science|research|peer review/i, "/desci"],
    [/economics? data|fred|gdp/i, "/economics"],
    [/energy|solar|p2p energy/i, "/energy"],
    [/infrastructure/i, "/infrastructure"],
  ]

  for (const [pattern, path] of NAV_MAP) {
    if (pattern.test(lower)) return { action: "navigate", data: { path } }
  }

  // Help / what can you do
  if (/help|what can you do|commands/i.test(lower)) return { action: "help", data: {} }

  return null
}

// Voice preference — stored in localStorage
function getVoicePreference(): "female" | "male" {
  if (typeof window === "undefined") return "female"
  return (localStorage.getItem("aly-voice") as "female" | "male") ?? "female"
}

function setVoicePreference(pref: "female" | "male") {
  localStorage.setItem("aly-voice", pref)
}

function getBestVoice(gender: "female" | "male"): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return null

  // Ranked preferences for most natural-sounding voices per platform
  const femalePreferences = [
    "Microsoft Aria Online (Natural)",   // Edge — very natural
    "Microsoft Jenny Online (Natural)",  // Edge
    "Google US English",                 // Chrome — decent
    "Samantha",                          // macOS — excellent
    "Microsoft Zira",                    // Windows fallback
    "Google UK English Female",          // Chrome
  ]

  const malePreferences = [
    "Microsoft Guy Online (Natural)",    // Edge — very natural
    "Microsoft Ryan Online (Natural)",   // Edge
    "Google US English Male",            // Chrome
    "Alex",                              // macOS
    "Microsoft David",                   // Windows fallback
    "Google UK English Male",            // Chrome
    "Daniel",                            // macOS
  ]

  const preferences = gender === "female" ? femalePreferences : malePreferences

  // Try exact matches first
  for (const name of preferences) {
    const match = voices.find(v => v.name.includes(name))
    if (match) return match
  }

  // Try keyword matching
  if (gender === "female") {
    const natural = voices.find(v => v.name.includes("Natural") && (v.name.includes("Aria") || v.name.includes("Jenny") || v.name.includes("Sara")))
    if (natural) return natural
    const female = voices.find(v => (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Hazel")) && v.lang.startsWith("en"))
    if (female) return female
  } else {
    const natural = voices.find(v => v.name.includes("Natural") && (v.name.includes("Guy") || v.name.includes("Ryan") || v.name.includes("Davis")))
    if (natural) return natural
    const male = voices.find(v => (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Alex")) && v.lang.startsWith("en"))
    if (male) return male
  }

  // Last resort: any English voice
  return voices.find(v => v.lang.startsWith("en")) ?? voices[0] ?? null
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    // Cancel any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95   // Slightly slower = more natural
    utterance.pitch = getVoicePreference() === "female" ? 1.05 : 0.9
    utterance.volume = 0.85

    // Voices sometimes load async — retry if needed
    const voice = getBestVoice(getVoicePreference())
    if (voice) utterance.voice = voice

    speechSynthesis.speak(utterance)
  }
}

// Preload voices (some browsers load them async)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  speechSynthesis.getVoices()
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices()
}

export function AlyVoice() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [visible, setVisible] = useState(false)
  const [voicePref, setVoicePref] = useState<"female" | "male">("female")
  const recognitionRef = useRef<any>(null)

  // Load voice preference
  useEffect(() => {
    setVoicePref(getVoicePreference())
  }, [])

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      setTranscript(text)

      if (result.isFinal) {
        handleCommand(text)
      }
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
  }, [])

  async function handleCommand(text: string) {
    const command = parseCommand(text)

    if (!command) {
      const msg = "I didn't catch that. Try: 'I'm feeling a 7', 'slept 8 hours', 'open budget', 'go to family meeting', or say 'help' to hear everything I can do."
      setResponse(msg)
      speak(msg)
      return
    }

    switch (command.action) {
      case "mood": {
        await encryptedPost("/api/mental-health/mood", { score: command.data.score, emotions: [], triggers: [] })
        const msg = `Got it! Logged your mood as ${command.data.score} out of 10. ${command.data.score >= 7 ? "Glad you're doing well!" : command.data.score >= 5 ? "Hanging in there." : "I'm here if you need anything."}`
        setResponse(msg)
        speak(msg)
        break
      }

      case "sleep": {
        await encryptedPost("/api/health/entries", { entryType: "SLEEP", data: { hoursSlept: command.data.hours } })
        const msg = `Logged ${command.data.hours} hours of sleep. ${command.data.hours >= 7 ? "Nice, that's solid rest." : "Try to aim for 7 to 9 hours when you can."}`
        setResponse(msg)
        speak(msg)
        break
      }

      case "water": {
        await encryptedPost("/api/health/entries", { entryType: "NUTRITION", data: { waterL: command.data.liters } })
        const msg = `Logged ${command.data.liters} liters of water. Stay hydrated!`
        setResponse(msg)
        speak(msg)
        break
      }

      case "weight": {
        await encryptedPost("/api/health/entries", { entryType: "MEASUREMENT", data: { weight: command.data.weight } })
        const msg = `Logged your weight at ${command.data.weight} pounds.`
        setResponse(msg)
        speak(msg)
        break
      }

      case "steps": {
        await encryptedPost("/api/health/entries", { entryType: "MEASUREMENT", data: { steps: command.data.steps } })
        const msg = `Logged ${command.data.steps.toLocaleString()} steps. ${command.data.steps >= 10000 ? "Amazing, you hit 10K!" : "Keep moving!"}`
        setResponse(msg)
        speak(msg)
        break
      }

      case "query_streak": {
        const res = await fetch("/api/streaks").then(r => r.json())
        const msg = `Your current streak is ${res.streaks?.overall?.current ?? 0} days. ${res.streaks?.overall?.current > 0 ? "Keep it going!" : "Start a streak by logging something today."}`
        setResponse(msg)
        speak(msg)
        break
      }

      case "query_balance": {
        const res = await secureFetcher("/api/wallet")
        const found = res.foundBalance ? Number(BigInt(res.foundBalance) / 1000000n) : 0
        const msg = `You have ${found} FOUND tokens.`
        setResponse(msg)
        speak(msg)
        break
      }

      case "query_summary": {
        const res = await fetch("/api/digest").then(r => r.json())
        const msg = `This week you've been active ${res.summary?.activeDays ?? 0} out of 7 days with ${res.summary?.totalActions ?? 0} total actions. ${res.summary?.totalActions > 10 ? "You're doing great!" : "Every small step counts."}`
        setResponse(msg)
        speak(msg)
        break
      }

      case "navigate": {
        window.location.href = command.data.path
        const msg = `Taking you there.`
        setResponse(msg)
        speak(msg)
        break
      }

      case "help": {
        const msg = `I can do a lot! Say things like: log my mood, slept 8 hours, drank 3 glasses of water, what's my streak. Or navigate anywhere: take me to budget, open family meeting, show me my rights, go to debt payoff, open civilizations. I know all 100 pages on this platform.`
        setResponse(msg)
        speak(msg)
        break
      }
    }
  }

  function startListening() {
    if (!recognitionRef.current) {
      setResponse("Voice recognition isn't available in this browser. Try Chrome or Edge.")
      return
    }
    setTranscript("")
    setResponse("")
    setListening(true)
    setVisible(true)
    recognitionRef.current.start()
  }

  function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop()
    setListening(false)
  }

  const [textInput, setTextInput] = useState("")

  function handleTextSubmit() {
    if (!textInput.trim()) return
    setTranscript(textInput.trim())
    handleCommand(textInput.trim())
    setTextInput("")
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const voiceSupported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window

  return (
    <>
      {/* Aly button */}
      <button
        onClick={() => {
          if (visible) {
            if (listening) stopListening()
            else if (voiceSupported) startListening()
          } else {
            setVisible(true)
            if (voiceSupported) startListening()
          }
        }}
        className={cn(
          "fixed bottom-20 left-6 z-40 flex items-center gap-2 rounded-full shadow-xl transition-all",
          listening
            ? "bg-red-500 text-white px-4 py-3 animate-pulse"
            : "bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 hover:scale-105"
        )}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="text-sm font-medium">Aly</span>
      </button>

      {/* Response panel */}
      {visible && (
        <div className="fixed bottom-32 left-6 z-40 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white font-medium text-sm">Aly</span>
            </div>
            <button onClick={() => { setVisible(false); stopListening() }} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {transcript && (
              <div className="text-sm text-muted-foreground italic">
                "{transcript}"
              </div>
            )}
            {response && (
              <div className="text-sm flex items-start gap-2">
                <Volume2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <span>{response}</span>
              </div>
            )}
            {listening && !transcript && (
              <p className="text-sm text-muted-foreground animate-pulse">Listening...</p>
            )}
          </div>
          <div className="px-4 pb-3 space-y-2">
            {/* Voice selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Voice:</span>
              <button
                onClick={() => { setVoicePreference("female"); setVoicePref("female"); speak("Hi, I'm Aly.") }}
                className={cn("text-[10px] rounded-full px-2 py-0.5 transition-colors", voicePref === "female" ? "bg-pink-100 text-pink-700 font-medium" : "text-muted-foreground hover:bg-muted")}
              >Female</button>
              <button
                onClick={() => { setVoicePreference("male"); setVoicePref("male"); speak("Hi, I'm Aly.") }}
                className={cn("text-[10px] rounded-full px-2 py-0.5 transition-colors", voicePref === "male" ? "bg-blue-100 text-blue-700 font-medium" : "text-muted-foreground hover:bg-muted")}
              >Male</button>
            </div>
            {/* Text input — works even without voice */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
                placeholder="Type a command..."
                className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
              <button onClick={handleTextSubmit} disabled={!textInput.trim()}
                className="rounded-lg bg-violet-600 text-white px-2 py-1.5 disabled:opacity-30 hover:bg-violet-700">
                <Send className="h-3 w-3" />
              </button>
              {voiceSupported && (
                <button onClick={listening ? stopListening : startListening}
                  className={cn("rounded-lg px-2 py-1.5", listening ? "bg-red-500 text-white animate-pulse" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  {listening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Try: "open budget" · "go to family meeting" · "mood 7" · "slept 8 hours" · "help"
            </p>
          </div>
        </div>
      )}
    </>
  )
}
