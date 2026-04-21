"use client"

import { useState } from "react"
import useSWR from "swr"
import { Dumbbell, Play, Clock, Flame, ChevronRight, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { secureFetcher, encryptedPost } from "@/lib/encrypted-fetch"

const fetcher = secureFetcher

const EXERCISE_LIBRARY = [
  {
    category: "Bodyweight",
    exercises: [
      { name: "Push-ups", muscles: "Chest, shoulders, triceps", difficulty: "Beginner", instructions: "Start in plank position. Lower chest to floor, push back up. Keep core tight, back straight." },
      { name: "Squats", muscles: "Quads, glutes, hamstrings", difficulty: "Beginner", instructions: "Stand feet shoulder-width apart. Lower hips back and down as if sitting. Keep knees over toes. Stand back up." },
      { name: "Lunges", muscles: "Quads, glutes, hamstrings", difficulty: "Beginner", instructions: "Step forward, lower back knee toward ground. Front knee stays over ankle. Push back to standing." },
      { name: "Plank", muscles: "Core, shoulders", difficulty: "Beginner", instructions: "Forearms and toes on ground. Body in straight line from head to heels. Hold position." },
      { name: "Burpees", muscles: "Full body", difficulty: "Intermediate", instructions: "From standing: squat down, jump feet back to plank, do a push-up, jump feet forward, jump up." },
      { name: "Mountain Climbers", muscles: "Core, shoulders, legs", difficulty: "Intermediate", instructions: "Start in plank. Drive knees alternately toward chest rapidly." },
      { name: "Pull-ups", muscles: "Back, biceps", difficulty: "Advanced", instructions: "Hang from bar, palms facing away. Pull chin above bar. Lower with control." },
      { name: "Handstand Push-ups", muscles: "Shoulders, triceps", difficulty: "Advanced", instructions: "Kick up to handstand against wall. Lower head toward ground, push back up." },
    ]
  },
  {
    category: "Cardio",
    exercises: [
      { name: "Walking", muscles: "Legs, cardiovascular", difficulty: "Beginner", instructions: "Walk at a brisk pace. Aim for 30+ minutes. Swing arms naturally." },
      { name: "Jogging", muscles: "Legs, cardiovascular", difficulty: "Beginner", instructions: "Light run at conversational pace. Start with 15 minutes, build to 30+." },
      { name: "Jump Rope", muscles: "Calves, shoulders, cardiovascular", difficulty: "Intermediate", instructions: "Light bouncing on toes. Keep elbows close, wrists do the turning." },
      { name: "HIIT Intervals", muscles: "Full body, cardiovascular", difficulty: "Intermediate", instructions: "30 seconds max effort, 30 seconds rest. Repeat 8-12 rounds." },
      { name: "Swimming", muscles: "Full body, cardiovascular", difficulty: "Intermediate", instructions: "Any stroke. Great low-impact cardio. Aim for 20-30 minutes continuous." },
      { name: "Cycling", muscles: "Legs, cardiovascular", difficulty: "Beginner", instructions: "Stationary or outdoor. Maintain steady cadence. 30-60 minutes." },
    ]
  },
  {
    category: "Flexibility & Recovery",
    exercises: [
      { name: "Hamstring Stretch", muscles: "Hamstrings", difficulty: "Beginner", instructions: "Sit on floor, legs straight. Reach for toes. Hold 30 seconds." },
      { name: "Hip Flexor Stretch", muscles: "Hip flexors", difficulty: "Beginner", instructions: "Kneel on one knee, other foot forward. Push hips forward. Hold 30 seconds each side." },
      { name: "Cat-Cow Stretch", muscles: "Spine", difficulty: "Beginner", instructions: "On hands and knees. Arch back up (cat), then dip belly down (cow). Repeat 10 times." },
      { name: "Child's Pose", muscles: "Back, hips", difficulty: "Beginner", instructions: "Kneel, sit back on heels, stretch arms forward on floor. Breathe deeply." },
      { name: "Foam Rolling", muscles: "Full body", difficulty: "Beginner", instructions: "Roll slowly over muscle groups: quads, IT band, upper back, calves. 1-2 minutes per area." },
      { name: "Sun Salutation", muscles: "Full body", difficulty: "Intermediate", instructions: "Flow through: mountain pose, forward fold, plank, cobra, downward dog. 5-10 rounds." },
    ]
  },
  {
    category: "Strength",
    exercises: [
      { name: "Deadlifts", muscles: "Back, glutes, hamstrings", difficulty: "Intermediate", instructions: "Feet hip-width. Grip bar outside knees. Drive through heels, stand tall. Keep bar close to body." },
      { name: "Bench Press", muscles: "Chest, shoulders, triceps", difficulty: "Intermediate", instructions: "Lie on bench. Lower bar to chest, press up. Keep feet flat, back slightly arched." },
      { name: "Rows", muscles: "Back, biceps", difficulty: "Intermediate", instructions: "Bend at hips, pull weight toward lower chest. Squeeze shoulder blades together." },
      { name: "Overhead Press", muscles: "Shoulders, triceps", difficulty: "Intermediate", instructions: "Press weight from shoulders overhead. Full lockout at top. Lower with control." },
      { name: "Kettlebell Swings", muscles: "Hips, glutes, core", difficulty: "Intermediate", instructions: "Hinge at hips, swing kettlebell between legs, drive hips forward to swing up to chest height." },
    ]
  },
]

export default function ExerciseLibraryPage() {
  const { mutate } = useSWR("/api/health/entries?limit=10", fetcher)
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [logging, setLogging] = useState(false)
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState("")
  const [logOpen, setLogOpen] = useState(false)

  async function logExercise() {
    if (!selectedExercise || !duration) return
    setLogging(true)
    await encryptedPost("/api/health/entries", {
        entryType: "EXERCISE",
        data: {
          activity: selectedExercise.name,
          durationMin: parseInt(duration),
          intensity: intensity ? parseInt(intensity) : null,
        },
        notes: `${selectedExercise.name} — ${selectedExercise.muscles}`,
      })
    setLogging(false)
    setLogOpen(false)
    setDuration("")
    setIntensity("")
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {EXERCISE_LIBRARY.reduce((s, c) => s + c.exercises.length, 0)} exercises across {EXERCISE_LIBRARY.length} categories. Tap any exercise to log it.
        </p>
      </div>

      {/* Log dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log: {selectedExercise?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">{selectedExercise?.muscles}</p>
            <div className="space-y-1.5">
              <Label>Duration (minutes)</Label>
              <Input type="number" placeholder="e.g. 30" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Intensity (1-10, optional)</Label>
              <Input type="number" min="1" max="10" placeholder="e.g. 7" value={intensity} onChange={e => setIntensity(e.target.value)} />
            </div>
            <Button className="w-full" onClick={logExercise} disabled={logging || !duration}>
              {logging ? "Logging..." : "Log exercise"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise categories */}
      {EXERCISE_LIBRARY.map((category) => (
        <div key={category.category}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category.category}</h2>
          <div className="space-y-2">
            {category.exercises.map((exercise) => (
              <Card
                key={exercise.name}
                className="card-hover cursor-pointer"
                onClick={() => { setSelectedExercise(exercise); setLogOpen(true) }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    exercise.difficulty === "Beginner" ? "bg-emerald-100 text-emerald-600" :
                    exercise.difficulty === "Intermediate" ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{exercise.name}</p>
                      <Badge variant="outline" className={cn("text-[10px]",
                        exercise.difficulty === "Beginner" ? "border-emerald-300 text-emerald-600" :
                        exercise.difficulty === "Intermediate" ? "border-amber-300 text-amber-600" :
                        "border-red-300 text-red-600"
                      )}>{exercise.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{exercise.muscles}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exercise.instructions}</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <a href="/health" className="text-sm text-violet-600 hover:underline block">← Health Intelligence</a>
    </div>
  )
}
