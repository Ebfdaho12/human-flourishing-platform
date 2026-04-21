"use client"

import { useState } from "react"
import { Activity, Droplets, Brain, Heart, Flame, Clock, Users, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Star, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

function Collapsible({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
        <span className="text-sm font-semibold flex-1">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

export default function FasciaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Fascia: The Hidden System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The most overlooked tissue in your body — connecting everything, storing everything, and explaining chronic pain that nothing else can.
        </p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-900 mb-2">Why This Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            For decades, medical science treated fascia as "packing material" — inert wrapping around the real structures.
            We now know fascia is a <strong>sensory organ in its own right</strong>, with more nerve endings than muscle tissue,
            capable of <strong>active contraction</strong>, and deeply connected to chronic pain, movement quality, emotional
            storage, and proprioception. If you have chronic pain, stiffness, or tension that nothing seems to fix —
            fascia is likely the missing piece.
          </p>
        </CardContent>
      </Card>

      {/* What is fascia */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Is Fascia?</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fascia is a continuous, three-dimensional web of <Explain tip="The main structural protein in connective tissue. Makes up 25-35% of all protein in your body. Provides tensile strength and structure">collagen</Explain>,{" "}
            <Explain tip="A protein that allows tissue to stretch and return to its original shape. Gives fascia its elastic, spring-like quality">elastin</Explain>, and{" "}
            <Explain tip="A gel-like substance (mostly hyaluronic acid and water) that surrounds fascia fibers. Its viscosity determines how easily fascial layers slide over each other. Dehydration makes it sticky and stiff">ground substance</Explain> that
            envelops every muscle, bone, nerve, organ, and blood vessel in your body. It is not separate pieces — it is one
            continuous structure from head to toe.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Structural support", desc: "Holds organs, muscles, and bones in place" },
              { label: "Force transmission", desc: "Transfers mechanical force between muscles — you are not just muscles pulling bones, you are a tensegrity structure" },
              { label: "Proprioception", desc: "Contains mechanoreceptors (Ruffini, Pacini) that tell your brain where your body is in space" },
              { label: "Pain signaling", desc: "More nociceptors than muscle — inflamed fascia generates chronic pain independent of joints or muscles" },
              { label: "Fluid dynamics", desc: "Acts as a sponge — movement squeezes waste out, rest lets fresh fluid in" },
              { label: "Emotional storage", desc: "Emerging research suggests fascia stores tension patterns related to emotional experiences and trauma" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-orange-50 border border-orange-200 p-2.5">
                <p className="text-xs font-semibold text-orange-800">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fascial Lines */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fascial Lines (Anatomy Trains)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Mapped by <strong>Tom Myers</strong>, these are continuous myofascial chains that transmit tension throughout
            the body. Pain in one area often originates somewhere else along the same line.
          </p>
          {[
            { name: "Superficial Back Line", path: "Sole of foot → calf → hamstrings → erector spinae → over the skull to the brow ridge", impact: "Governs posture. Tightness here causes forward head, rounded shoulders, low back pain. Most common line of dysfunction in desk workers." },
            { name: "Superficial Front Line", path: "Top of toes → shin → quads → abs → sternocleidomastoid → scalp", impact: "Balances the back line. Shortened from sitting — hip flexor tightness pulls the whole chain." },
            { name: "Lateral Line", path: "Outside of foot → peroneals → IT band → obliques → intercostals → SCM", impact: "Side-to-side stability. IT band syndrome, hip pain, and neck tension often live here." },
            { name: "Spiral Line", path: "Wraps around the body in a helix — skull → opposite shoulder → across ribs → hip → knee → arch of foot", impact: "Rotational stability. Explains how a foot pronation issue creates opposite-shoulder pain." },
            { name: "Deep Front Line", path: "Inner arch → deep calf → pelvic floor → psoas → diaphragm → scalenes → jaw", impact: "The core of the core. Breathing, pelvic stability, jaw tension, and deep emotional holding patterns all live here." },
            { name: "Arm Lines (4)", path: "Front/back, deep/superficial — connecting fingers to chest and spine", impact: "Carpal tunnel, tennis elbow, frozen shoulder — often fascial chain problems, not isolated joint issues." },
          ].map((line, i) => (
            <div key={i} className="rounded-lg border p-2.5">
              <p className="text-xs font-semibold">{line.name}</p>
              <p className="text-[10px] text-rose-600 font-medium">{line.path}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{line.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experts */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Leading Fascia Experts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              name: "Jason Van Blerk",
              role: "Co-founder, Human Garage",
              focus: "Fascial Maneuvers — self-healing technique",
              detail: "Pioneered fascial maneuver techniques that combine slow counter-rotational movements with conscious breathing and mindful self-pressure. His methods have reached millions globally — from elite athletes to people navigating chronic pain and trauma. Human Garage teaches a foundational 15-minute routine designed to release 70-80% of stress held in the body, with 30+ targeted maneuvers for every body area. His work emphasizes that fascia stores emotions and past experiences in your physical structure, and that releasing fascia releases what's stored within it.",
              highlight: true,
            },
            {
              name: "Tom Myers",
              role: "Author of Anatomy Trains",
              focus: "Myofascial meridians and structural integration",
              detail: "Mapped the continuous fascial lines (trains) that run through the body, revolutionizing understanding of how tension transmits across distant body regions. His Anatomy Trains framework is now foundational in physical therapy, yoga, and movement science.",
              highlight: false,
            },
            {
              name: "Robert Schleip, PhD",
              role: "Director, Fascia Research Group, Ulm University",
              focus: "Fascia science, proprioception, contractility",
              detail: "Leading researcher who demonstrated that fascial tissue can actively contract via myofibroblasts — it's not just passive wrapping. His research on fascia's role in proprioception and the hydration mechanics of ground substance has shaped modern understanding.",
              highlight: false,
            },
            {
              name: "Gil Hedley, PhD",
              role: "Anatomist and educator",
              focus: "Cadaver dissection revealing fascial layers",
              detail: "Known for his 'Fuzz Speech' — cadaver dissection videos showing the 'fuzz' (adhesions) that builds up between fascial layers with inactivity. Demonstrates why daily movement is essential: you are literally dissolving fascial adhesions every time you stretch.",
              highlight: false,
            },
            {
              name: "John F. Barnes, PT",
              role: "Pioneer of Myofascial Release",
              focus: "Sustained-pressure hands-on therapy",
              detail: "Developed the sustained-pressure Myofascial Release (MFR) approach — holding pressure for 3-5+ minutes to allow fascial tissue to release. Decades of clinical practice treating chronic pain, fibromyalgia, and post-surgical adhesions.",
              highlight: false,
            },
            {
              name: "Helene Langevin, MD",
              role: "Harvard/NIH researcher",
              focus: "Fascia, acupuncture, and chronic low back pain",
              detail: "Used ultrasound imaging to demonstrate reduced fascial shear (sliding) in chronic low back pain patients. Her research connects fascial dysfunction to inflammation and provides imaging evidence for what manual therapists have felt for decades.",
              highlight: false,
            },
          ].map((expert, i) => (
            <div key={i} className={cn("rounded-lg border p-3", expert.highlight ? "border-rose-300 bg-rose-50/30" : "")}>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold">{expert.name}</p>
                {expert.highlight && <Badge className="bg-rose-500 text-[9px] py-0">Featured</Badge>}
              </div>
              <p className="text-[10px] text-rose-600 font-medium">{expert.role} — {expert.focus}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{expert.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What goes wrong */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What Goes Wrong with Fascia</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-1">
            When fascia becomes dehydrated, inflamed, or develops <Explain tip="Collagen cross-links that form between fascial layers due to injury, surgery, inflammation, immobility, or chronic stress. They restrict movement, cause pain, and create compensation patterns throughout the body">adhesions</Explain>,
            the effects cascade throughout the body:
          </p>
          {[
            { condition: "Chronic low back pain", connection: "Langevin's research shows reduced fascial shear in the thoracolumbar fascia. The tissue can't slide properly — it's stuck, creating constant tension and pain signals." },
            { condition: "Plantar fasciitis", connection: "Inflammation of the plantar fascia on the sole — but often driven by tightness in the entire Superficial Back Line (calf, hamstring, back)." },
            { condition: "Frozen shoulder (adhesive capsulitis)", connection: "Fascial adhesions in the joint capsule restrict movement. Often responds to sustained myofascial release better than aggressive stretching." },
            { condition: "IT band syndrome", connection: "The IT band IS fascia — not a muscle. Foam rolling it directly is painful and controversial. Better to release the muscles that tension it: TFL, glutes, and vastus lateralis." },
            { condition: "Fibromyalgia", connection: "Emerging research links widespread fascial inflammation to fibromyalgia symptoms. The pain is real — it may originate in connective tissue, not just the nervous system." },
            { condition: "TMJ / jaw tension", connection: "The Deep Front Line connects the jaw to the pelvic floor through the diaphragm and psoas. Jaw clenching is often a whole-body fascial tension pattern." },
            { condition: "Post-surgical adhesions", connection: "Surgery cuts through fascial layers. Scar tissue forms cross-links that restrict movement and create pain far from the surgical site along fascial lines." },
            { condition: "Chronic headaches", connection: "Fascial tension in the suboccipital region (base of skull) and along the Superficial Back Line can generate headaches that feel muscular or neurological." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-amber-50/50 border border-amber-200 p-2.5">
              <p className="text-xs font-semibold text-amber-800">{item.condition}</p>
              <p className="text-[10px] text-muted-foreground">{item.connection}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Fascia Health Protocols</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Collapsible title="Fascial Maneuvers (Human Garage Method)" icon={Star} iconColor="text-rose-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Developed by <strong>Jason Van Blerk</strong> and the Human Garage team. Combines slow, counter-rotational
              movements with conscious breathing and mindful self-pressure.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Start with the 15-minute Full Body Reset routine daily — designed to release 70-80% of held stress",
                "Use slow, intentional counter-rotational movements — speed defeats the purpose",
                "Pair every maneuver with conscious breathing — exhale into the release",
                "Notice subtle sensations, patterns of holding, and emotional responses as the body unwinds",
                "Progress through 30+ targeted maneuvers for specific body areas",
                "Consistency matters more than intensity — daily practice creates lasting structural change",
                "Expect emotional release — fascia stores experiences, and releasing tissue can release what's stored within it",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Myofascial Release (John Barnes Method)" icon={Heart} iconColor="text-pink-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sustained pressure held for 3-5+ minutes per area. Unlike massage (which targets muscle), MFR targets
              the collagen barrier of fascia — which takes longer to release.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Apply gentle, sustained pressure — do NOT force through the tissue",
                "Hold for minimum 3-5 minutes per restriction — fascia needs TIME to release (the collagen barrier takes 90-120 seconds just to begin yielding)",
                "Wait for the 'melt' — you'll feel the tissue soften and elongate under your hands or tool",
                "Never use lotion or oil — you need skin traction to engage the fascial layer",
                "Work slowly and systematically along fascial lines, not just isolated trigger points",
                "Self-treatment: use balls (tennis, lacrosse), foam rollers, or your own hands against a wall",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-pink-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Foam Rolling (Self-Myofascial Release)" icon={Activity} iconColor="text-orange-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Research-supported for improved range of motion and reduced delayed onset muscle soreness (DOMS).
              Effective but limited compared to targeted fascial work.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Roll SLOWLY — 1 inch per second. Fast rolling just irritates tissue without releasing it",
                "When you find a tender spot, STOP and hold pressure for 30-90 seconds",
                "Avoid rolling directly on bones, joints, or the low back spine",
                "IT band: roll the muscles around it (quads, TFL, glutes) rather than grinding directly on the band",
                "Best before exercise (improves ROM) and after (reduces DOMS by 20-50% per research)",
                "Softer roller for beginners, firmer as tissue adapts. Lacrosse ball for targeted areas",
                "Combine with breathing: exhale as you sink into tender spots",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Fascial Stretching" icon={Flame} iconColor="text-red-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fascia responds to different stretching than muscles. Longer holds, multi-directional pulls,
              and whole-line stretches are key.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Hold stretches 2+ minutes — fascia's collagen barrier needs significantly more time than muscle (which responds in 30 seconds)",
                "Use multi-directional stretching — fascia is a 3D web, not a 1D rubber band. Add rotation, side-bending, and diagonal pulls",
                "Stretch entire fascial lines, not just individual muscles — a calf stretch should connect to hamstring, back, and neck",
                "Yin yoga is excellent for fascia — 3-5 minute holds in passive positions directly target connective tissue",
                "Move through varied planes daily — repetitive motion in one plane creates adhesions. Fascia thrives on variety",
                "Animal flow, tai chi, and dance-based movement keep fascia supple through multi-planar loading",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Hydration & Nutrition for Fascia" icon={Droplets} iconColor="text-blue-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fascia's ground substance is primarily hyaluronic acid and water. Dehydrated fascia becomes stiff,
              sticky, and adhesion-prone. Hydration is structural, not just "drink water."
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Hydration is a two-part process: drink water AND move. Movement creates the 'sponge squeeze' effect that drives fluid through fascial tissue",
                "Target 2.5-3.5 liters of water daily (more with exercise, heat, altitude)",
                "Electrolytes matter — water without minerals doesn't hydrate tissue effectively. Add salt, magnesium, potassium",
                "Collagen supplementation (10-15g/day) provides building blocks for fascial repair — research shows improved connective tissue synthesis",
                "Vitamin C (250-500mg with collagen) is required for collagen synthesis — they work together",
                "Anti-inflammatory foods: omega-3s, turmeric/curcumin, ginger, berries — reduce fascial inflammation",
                "Avoid chronic dehydrators: excess caffeine, alcohol, high-sodium processed foods",
                "Bone broth provides collagen, glycine, and minerals in bioavailable form",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="Daily Movement for Fascial Health" icon={Clock} iconColor="text-violet-500">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gil Hedley's "fuzz" research shows that fascial adhesions form during immobility and dissolve with
              movement. Every morning, your body has new "fuzz" — and your first movements of the day clear it.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                "Morning movement is non-negotiable — even 5 minutes of whole-body stretching dissolves overnight adhesions",
                "Break up sitting every 30-60 minutes — fascia begins stiffening in static positions within 20 minutes",
                "Vary your movement patterns — repetitive motion creates adhesions along overused planes while other planes stiffen",
                "Hanging (from a bar) is one of the best fascial releases for the entire upper body and spine",
                "Walking on uneven terrain engages more fascial lines than flat-surface walking",
                "Crawling, rolling on the ground, and ground-based movements restore fascial patterns lost in chair-based living",
                "Cold exposure (cold shower, ice bath) causes fascial contraction followed by rebound relaxation and improved fluid dynamics",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      {/* The science */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">The Science</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            Fascia research has exploded in recent years. The <strong>Fascia Research Society</strong> held its
            7th International Congress in 2025 in New Orleans, with 734 fascia-specific research articles published
            in the last 5 years alone. Key findings:
          </p>
          {[
            { finding: "Fascia is a sensory organ", detail: "Contains Ruffini and Pacini mechanoreceptors — critical for proprioception (knowing where your body is in space). More sensory nerve endings than muscle tissue." },
            { finding: "Fascia actively contracts", detail: "Schleip demonstrated that fascial tissue contains myofibroblasts — cells that can contract independently of muscle. This means fascia can tighten on its own in response to stress, inflammation, or hormonal changes." },
            { finding: "Fascial shear correlates with pain", detail: "Langevin (Harvard/NIH) used ultrasound to show that people with chronic low back pain have measurably reduced fascial sliding (shear) compared to pain-free controls." },
            { finding: "Emotion is stored in tissue", detail: "Emerging evidence supports the body-mind connection through fascia. Chronic emotional stress creates sustained fascial tension patterns. Releasing fascia can trigger emotional responses — tears, memories, relief." },
            { finding: "Adhesions form during immobility", detail: "Hedley's cadaver research shows collagen cross-links ('fuzz') forming between fascial layers within hours of immobility. Movement dissolves them. Chronic immobility creates permanent adhesions." },
            { finding: "Fascial training improves performance", detail: "Athletes who incorporate fascial training (elastic recoil, bouncing movements, multi-planar loading) show improved force transmission, injury resilience, and movement efficiency." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-2.5">
              <Brain className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">{item.finding}</p>
                <p className="text-[10px] text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fascia and emotions */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Fascia and Emotional Storage
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            One of the most important and least understood aspects of fascia — and central to Jason Van Blerk's
            work at Human Garage — is its role in storing emotional and traumatic experiences.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>The mechanism:</strong> When you experience stress, fear, or trauma, your body creates a
              protective tension pattern. Muscles tighten, breathing changes, posture shifts. If the stress is
              not resolved, the fascia <em>adapts to that tension pattern</em> — collagen remodels along the
              lines of stress, creating a structural memory of the emotional event in your tissue.
            </p>
            <p>
              <strong>The result:</strong> Years later, the original trigger is gone, but the tension pattern
              remains physically encoded in your fascia. This is why some chronic pain has no structural cause
              on imaging — it lives in the connective tissue, not in bones or discs.
            </p>
            <p>
              <strong>The release:</strong> When fascial restrictions are released (through maneuvers, MFR,
              or sustained stretching), the stored tension pattern unwinds. This can trigger emotional responses —
              tears, memories surfacing, laughter, deep relief, trembling. This is not weakness or imagination.
              It is your body releasing what it has been physically holding.
            </p>
            <p className="text-violet-700 font-medium">
              This is why Human Garage's fascial maneuvers and John Barnes' MFR approach treat the body and
              mind as inseparable — because in fascia, they literally are.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-emerald-900 mb-2">Quick Start: Daily Fascia Practice</p>
          <div className="space-y-2">
            {[
              { time: "Morning (5 min)", action: "Whole-body movement: stretch all fascial lines, hang from a bar, roll on the ground. Dissolve overnight 'fuzz.'" },
              { time: "Every 30-60 min (1 min)", action: "Stand, reach overhead, twist, side-bend. Break up fascial stiffening from sitting." },
              { time: "Pre-workout (5 min)", action: "Foam roll major areas + dynamic multi-planar stretching. Improve ROM and force transmission." },
              { time: "Evening (10-15 min)", action: "Fascial maneuvers (Human Garage method) OR sustained myofascial release on problem areas. Pair with slow breathing." },
              { time: "All day", action: "Stay hydrated (water + electrolytes). Move in varied patterns. Walk on uneven terrain when possible." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 text-[9px] mt-0.5 border-emerald-300 text-emerald-700 min-w-[120px] justify-center">{item.time}</Badge>
                <p className="text-[10px] text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-900">Important Notes</p>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><strong>Start gently.</strong> Aggressive fascia work on restricted tissue can cause inflammation. More pressure is not better — sustained, gentle pressure allows fascia to release on its own terms.</p>
            <p><strong>Emotional release is normal.</strong> If tears, memories, or strong emotions surface during fascia work, allow them. This is the body processing stored experiences. It is healing, not a problem.</p>
            <p><strong>Pain is information, not a target.</strong> Fascia work should feel like "good discomfort" — not sharp pain. Sharp pain means too much pressure or working on an acute injury.</p>
            <p><strong>Results compound over time.</strong> Fascial remodeling takes weeks to months. Daily practice creates permanent structural change. Sporadic work creates temporary relief.</p>
            <p><strong>Consult a professional</strong> for acute injuries, post-surgical adhesions, or conditions like Ehlers-Danlos syndrome (hypermobile connective tissue) before aggressive fascial work.</p>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Resources & Further Learning</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Human Garage</strong> — humangarage.net — Jason Van Blerk's fascial maneuver programs and certification</span></div>
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Anatomy Trains</strong> by Tom Myers — the foundational text on myofascial meridians</span></div>
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Fascia: What It Is and Why It Matters</strong> by David Lesondak — accessible introduction to fascia science</span></div>
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Gil Hedley's "Fuzz Speech"</strong> — YouTube — the video that made millions understand fascia</span></div>
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Fascia Research Society</strong> — fasciaresearchsociety.org — peer-reviewed research and congress proceedings</span></div>
          <div className="flex gap-2 items-center"><BookOpen className="h-3 w-3 text-rose-500 shrink-0" /> <span><strong>Dr. Rangan Chatterjee podcast</strong> — episode with Jason Van Blerk on fascia and emotional healing</span></div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/health-protocols" className="text-sm text-rose-600 hover:underline">Health Protocols</a>
        <a href="/gut-health" className="text-sm text-emerald-600 hover:underline">Gut Health</a>
        <a href="/pain-management" className="text-sm text-amber-600 hover:underline">Pain Management</a>
        <a href="/hormone-health" className="text-sm text-violet-600 hover:underline">Hormone Health</a>
        <a href="/sleep-calculator" className="text-sm text-blue-600 hover:underline">Sleep Calculator</a>
        <a href="/mental-health" className="text-sm text-teal-600 hover:underline">Mental Health</a>
      </div>
    </div>
  )
}
