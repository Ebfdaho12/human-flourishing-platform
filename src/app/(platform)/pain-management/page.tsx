"use client"

import { useState } from "react"
import { Zap, ChevronDown, AlertCircle, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const APPROACHES = [
  {
    title: "Movement & Exercise",
    tag: "First-line treatment",
    tagColor: "bg-emerald-100 text-emerald-800",
    how: "Exercise releases endorphins (natural opioids), reduces inflammatory cytokines, improves joint lubrication, strengthens stabilizing muscles, and retrains pain pathways in the brain. Inactivity worsens most chronic pain.",
    helps: "Low back pain, arthritis, fibromyalgia, headaches, neck pain. Evidence is strongest for low back pain — exercise outperforms surgery for most non-emergency cases.",
    start: "Start with 10-minute walks. Gradually add swimming, cycling, or resistance training. The goal is consistent movement, not intensity. Even gentle movement breaks every hour reduce chronic pain signals.",
  },
  {
    title: "Stretching & Yoga",
    tag: "High evidence",
    tagColor: "bg-blue-100 text-blue-800",
    how: "Stretching increases tissue mobility, reduces muscle guarding (protective spasm), improves posture, and decreases nerve tension. Yoga adds breath control and mindfulness, which directly modulates pain perception.",
    helps: "Neck and shoulder pain, low back pain, hip tightness, sciatica, tension headaches. Yoga specifically has strong evidence for chronic low back pain.",
    start: "5 minutes of morning stretching targeting tight areas. YouTube: 'yoga for back pain' yields dozens of evidence-backed routines. Focus on consistency — daily 10 minutes beats weekly 60-minute sessions.",
  },
  {
    title: "Heat & Cold Therapy",
    tag: "Accessible",
    tagColor: "bg-orange-100 text-orange-800",
    how: "Cold reduces acute inflammation and numbs pain signals (vasoconstriction). Heat relaxes muscles, increases blood flow, and reduces stiffness (vasodilation). They address different aspects of pain and are often most effective alternated.",
    helps: "Cold: acute injuries, swelling, post-exercise soreness. Heat: chronic muscle tension, stiffness, menstrual cramps, arthritis. Neither is wrong — use whichever feels better for chronic pain.",
    start: "Ice pack (towel-wrapped, never direct) for 15–20 minutes for acute injuries. Heating pad or hot shower for chronic stiffness. Contrast therapy (alternating hot/cold) used in sports medicine for faster recovery.",
  },
  {
    title: "Sleep Optimization",
    tag: "Often overlooked",
    tagColor: "bg-violet-100 text-violet-800",
    how: "Pain and sleep are bidirectional — pain disrupts sleep, and poor sleep amplifies pain. Sleep is when tissue repair occurs. Sleep deprivation lowers pain threshold (makes everything hurt more) and increases inflammation markers.",
    helps: "All chronic pain conditions. Studies show that improving sleep quality reduces pain intensity by 20–40% independent of other interventions.",
    start: "Consistent sleep/wake times. Room temperature 65–68°F. Darkness. No screens 30 minutes before bed. If pain is disrupting sleep, address sleep positioning (pillow between knees for back pain, elevated head for neck).",
  },
  {
    title: "Stress Reduction",
    tag: "High impact",
    tagColor: "bg-rose-100 text-rose-800",
    how: "Chronic stress elevates cortisol and inflammatory cytokines, lowers pain threshold, increases muscle tension, and activates central sensitization (where the brain amplifies all pain signals). Psychological stress and physical pain share neural pathways.",
    helps: "Fibromyalgia, tension headaches, IBS, TMJ, chronic back pain. Many chronic pain conditions have a strong stress component that is undertreated because it feels less 'medical.'",
    start: "Identify your top 2 stressors. Even 5 minutes of slow breathing (4-7-8 breathing, box breathing) activates the parasympathetic nervous system and measurably reduces pain signals within minutes.",
  },
  {
    title: "Anti-Inflammatory Diet",
    tag: "Foundational",
    tagColor: "bg-yellow-100 text-yellow-800",
    how: "Chronic pain is partly driven by systemic inflammation. Diet directly controls inflammatory markers like CRP, IL-6, and TNF-alpha. The Mediterranean diet pattern consistently shows the strongest anti-inflammatory evidence.",
    helps: "Arthritis, inflammatory bowel disease, neuropathic pain, general chronic pain. Omega-3s specifically reduce prostaglandins that sensitize pain receptors.",
    start: "Add: fatty fish 2x/week, olive oil, leafy greens, berries, turmeric (with black pepper for absorption). Reduce: ultra-processed foods, seed oils, refined sugar, alcohol. You don't need a perfect diet — a consistent shift matters more.",
  },
  {
    title: "Mindfulness & Meditation",
    tag: "Brain-level change",
    tagColor: "bg-cyan-100 text-cyan-800",
    how: "Mindfulness-Based Stress Reduction (MBSR) is the most studied non-pharmaceutical pain intervention. It changes how the brain processes pain signals — reducing the emotional 'suffering' component even when the sensation remains. fMRI studies show measurable changes in pain-processing regions after 8 weeks.",
    helps: "Chronic pain of all types, especially when pain has persisted beyond normal tissue healing time (central sensitization). Also reduces pain catastrophizing, which strongly amplifies suffering.",
    start: "Apps: Waking Up, Insight Timer (free). Start with 5-minute body scan meditations. MBSR programs (8 weeks, group-based) are available in most cities and often covered by insurance for chronic pain.",
  },
  {
    title: "When to See a Doctor",
    tag: "Important",
    tagColor: "bg-red-100 text-red-800",
    how: "Non-pharmaceutical approaches are powerful but are not a substitute for medical evaluation. Some pain signals serious conditions requiring urgent care.",
    helps: "Ruling out structural damage, nerve compression, autoimmune conditions, cancer, infection, and other causes that require specific medical treatment.",
    start: "See a doctor if: pain follows an injury with possible fracture; pain with fever, unexplained weight loss, or night sweats; pain radiating down arms or legs with weakness/numbness; bowel or bladder changes with back pain; chest pain; sudden severe headache unlike previous headaches; pain that worsens steadily over weeks.",
  },
]

export default function PainManagementPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Pain Management</h1>
        </div>
        <p className="text-sm text-muted-foreground">Non-pharmaceutical approaches with real evidence. The body wants to heal — your job is to stop interfering.</p>
      </div>

      <Card className="border-2 border-rose-200 bg-rose-50/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-medium text-rose-900">The most undertreated pain epidemic: chronic pain from inactivity</p>
          <p className="text-sm text-rose-700 mt-1">Over 20% of adults live with chronic pain. The standard response has been opioids — which address sensation but don't fix the underlying cause. Movement, sleep, stress reduction, and diet collectively outperform pharmaceuticals for most chronic (not acute) pain conditions, with no side effects or dependency risk.</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {APPROACHES.map((item, i) => {
          const key = `approach-${i}`
          const isOpen = expanded === key
          return (
            <Card key={i} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-2 text-left">
                    <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="text-sm font-semibold">{item.title}</span>
                    <Badge className={cn("text-xs hidden sm:inline-flex", item.tagColor)}>{item.tag}</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="pb-4 border-t pt-3 space-y-3">
                    <Badge className={cn("text-xs sm:hidden", item.tagColor)}>{item.tag}</Badge>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">How it works</p>
                      <p className="text-sm">{item.how}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What it helps</p>
                      <p className="text-sm">{item.helps}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">How to start</p>
                      <p className="text-sm">{item.start}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border border-amber-200 bg-amber-50/30">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">This page covers non-pharmaceutical approaches and is educational. It is not a substitute for medical diagnosis or treatment, especially for acute injuries, severe or worsening pain, or pain with other concerning symptoms.</p>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/sleep-calculator" className="hover:underline text-foreground">Sleep</a>
        <a href="/mental-health" className="hover:underline text-foreground">Mental Health</a>
        <a href="/gut-health" className="hover:underline text-foreground">Gut Health</a>
        <a href="/hormone-health" className="hover:underline text-foreground">Hormone Health</a>
        <a href="/mens-health" className="hover:underline text-foreground">Men's Health</a>
      </div>
    </div>
  )
}
