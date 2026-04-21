"use client"

import { Activity, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Monitor, Smartphone, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"
import { useState } from "react"

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
        <Icon className={cn("h-4 w-4 shrink-0", color)} />
        <span className="text-sm font-semibold flex-1">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

export default function PosturePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
            <ArrowUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Posture & Structural Health</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your posture is not just aesthetics — it determines breathing capacity, nerve function, pain patterns, and how your fascia remodels over time.
        </p>
      </div>

      <Card className="border-2 border-teal-200 bg-teal-50/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The modern posture crisis:</strong> The average person spends 7-10 hours per day sitting and 4+ hours looking at a phone. This creates <Explain tip="Forward Head Posture: the head migrates forward of the shoulder line. Every inch of forward head adds 10 lbs of effective weight on the cervical spine. Most desk workers have 2-3 inches of forward migration.">forward head posture</Explain>, <Explain tip="Thoracic kyphosis: excessive rounding of the upper back. Compresses the lungs (reducing breathing capacity by 30%), rounds the shoulders, and shifts the entire kinetic chain.">rounded upper back</Explain>, <Explain tip="Anterior pelvic tilt: the pelvis tilts forward, creating excessive arch in the lower back. Caused by tight hip flexors (from sitting) and weak glutes. Creates chronic low back pain and compressed lumbar discs.">anterior pelvic tilt</Explain>, and <Explain tip="Internal shoulder rotation: shoulders roll forward and inward. Compresses the shoulder joint, creates impingement, and shortens the chest muscles while lengthening the upper back muscles.">internal shoulder rotation</Explain>. These aren't just cosmetic — they compress nerves, restrict breathing, create chronic pain, and cause your fascia to remodel around the dysfunction.
          </p>
        </CardContent>
      </Card>

      {/* The chain of dysfunction */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The Chain of Dysfunction</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { issue: "Phone/screen use → Forward head", impact: "Every inch forward adds 10 lbs of load on cervical spine. Causes headaches, neck pain, jaw tension, compressed nerves in arms/hands." },
            { issue: "Sitting → Hip flexor shortening", impact: "Psoas and iliacus shorten and tighten. Pulls the pelvis into anterior tilt, creates low back compression, inhibits glute activation." },
            { issue: "Desk work → Rounded shoulders", impact: "Pec minor and anterior deltoid shorten. Upper back muscles lengthen and weaken. Reduces lung capacity by 30%. Creates shoulder impingement." },
            { issue: "Shallow breathing → Diaphragm dysfunction", impact: "The diaphragm connects to the Deep Front Line fascia. Chronic shallow breathing locks the diaphragm, affecting the psoas, pelvic floor, and jaw." },
            { issue: "All of the above → Fascial remodeling", impact: "Fascia adapts to whatever position you hold most often. The collagen remodels along lines of stress. After months/years, the dysfunction becomes structural — your fascia has literally reshaped around bad posture." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-amber-200 bg-amber-50/10 p-3">
              <p className="text-xs font-semibold text-amber-800">{item.issue}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Correction protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Correction Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Section title="Forward Head Posture" icon={Smartphone} color="text-blue-500">
            <div className="space-y-1.5">
              {[
                "Chin tucks: pull chin straight back (making a double chin) and hold 5 seconds. 10 reps, 3x/day.",
                "Suboccipital release: lie on two tennis balls at the base of your skull for 2-3 minutes. Releases the deep neck extensors.",
                "Thoracic extension: foam roll or use a peanut ball on your upper back. 2 minutes daily.",
                "Phone position: hold your phone at eye level. Every time you catch yourself looking down, correct it.",
                "Monitor position: top of screen at eye level, arm's length distance. Non-negotiable for desk workers.",
                "Fascia connection: the Superficial Back Line runs from the soles of your feet over the skull to your brow ridge. Forward head strains this entire line.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Rounded Shoulders / Upper Cross Syndrome" icon={Monitor} color="text-violet-500">
            <div className="space-y-1.5">
              {[
                "Doorway pec stretch: forearm on doorframe, lean through. Hold 60 seconds each side. 2x/day.",
                "Band pull-aparts: 3 sets of 15 with light resistance band. Activates rhomboids and lower traps.",
                "Face pulls: cable or band. 3 sets of 15. The single best exercise for shoulder posture.",
                "Wall angels: stand with back flat against wall, arms in W position, slide up and down. 10 reps, 2x/day.",
                "Serratus anterior activation: wall push-ups with full protraction at the top. 3x10.",
                "Dead hangs from a pull-up bar: 30-60 seconds. Decompresses the spine, stretches the entire Arm Line fascia, opens the shoulder joint.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Anterior Pelvic Tilt / Low Back Pain" icon={Activity} color="text-rose-500">
            <div className="space-y-1.5">
              {[
                "Hip flexor stretch (half-kneeling): 90 seconds each side, 2x/day. The #1 stretch for desk workers.",
                "Glute bridges: 3 sets of 15. Reactivates inhibited glutes (sitting turns them off).",
                "Dead bugs: 3 sets of 10. Teaches anterior core to stabilize the pelvis in neutral.",
                "90/90 breathing: lying on back, legs on chair at 90°, breathe diaphragmatically. Resets pelvic position.",
                "Psoas release: lie on tennis ball at hip crease area for 2 minutes each side. The psoas connects your spine to your legs and is chronically tight in sitters.",
                "Standing desk: alternate sitting/standing every 30-60 minutes. Even standing still is better than prolonged sitting for pelvic position.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Daily Posture Reset (5 minutes)" icon={ArrowUp} color="text-emerald-500">
            <div className="space-y-1.5">
              {[
                "Minute 1: Chin tucks (10 reps) + neck rotation each direction",
                "Minute 2: Doorway pec stretch (30 sec each side)",
                "Minute 3: Hip flexor stretch (30 sec each side, half-kneeling)",
                "Minute 4: Glute bridges (15 reps) + dead bugs (10 reps)",
                "Minute 5: Dead hang (30 sec) OR wall angels (10 reps)",
                "Do this EVERY DAY. These 5 minutes counteract 8+ hours of sitting. Non-negotiable if you work at a desk.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Section>
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-violet-900 mb-2">Posture = Fascia</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your posture is not held by muscles — it is held by <a href="/fascia" className="text-rose-600 hover:underline">fascia</a>.
            Tom Myers' Anatomy Trains shows that posture is a whole-body tensegrity structure, not isolated muscles
            pulling bones. This is why stretching one tight muscle often doesn't fix posture — the tension pattern
            exists along an entire fascial line. Correcting forward head requires addressing the entire Superficial
            Back Line. Fixing anterior pelvic tilt requires releasing the Deep Front Line. Jason Van Blerk's
            fascial maneuvers at <a href="/fascia" className="text-rose-600 hover:underline">Human Garage</a> address
            posture at the fascial level rather than the muscular level — which is why they produce faster, more
            lasting structural changes.
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">Important</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Posture correction is a process of weeks to months, not days. Your fascia took years to remodel into its current pattern — it needs consistent daily work to remodel back. The 5-minute daily reset is minimum effective dose. Combine with fascial maneuvers, breathwork (diaphragm is part of the Deep Front Line), and regular movement breaks. If you have acute pain, disc issues, or nerve symptoms, see a qualified professional before starting correction protocols.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/fascia" className="text-sm text-rose-600 hover:underline">Fascia Health</a>
        <a href="/breathwork" className="text-sm text-cyan-600 hover:underline">Breathwork</a>
        <a href="/cold-exposure" className="text-sm text-blue-600 hover:underline">Cold Exposure</a>
        <a href="/body-composition" className="text-sm text-blue-500 hover:underline">Body Composition</a>
        <a href="/health-protocols" className="text-sm text-emerald-600 hover:underline">Health Protocols</a>
        <a href="/pain-management" className="text-sm text-amber-600 hover:underline">Pain Management</a>
      </div>
    </div>
  )
}
