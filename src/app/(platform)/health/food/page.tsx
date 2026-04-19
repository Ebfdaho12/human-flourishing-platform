"use client"

import { useState } from "react"
import useSWR from "swr"
import { Apple, Plus, Droplets, Flame, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Beverage", "Supplement"]

// Common foods with approximate calories (no API needed)
const FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number; serving: string }> = {
  "Banana": { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: "1 medium" },
  "Apple": { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium" },
  "Chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  "Brown rice": { calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup cooked" },
  "Egg": { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, serving: "1 large" },
  "Salmon": { calories: 208, protein: 20, carbs: 0, fat: 13, serving: "100g" },
  "Avocado": { calories: 234, protein: 3, carbs: 12, fat: 21, serving: "1 whole" },
  "Oatmeal": { calories: 154, protein: 5.3, carbs: 27, fat: 2.6, serving: "1 cup cooked" },
  "Greek yogurt": { calories: 100, protein: 17, carbs: 6, fat: 0.7, serving: "170g" },
  "Almonds": { calories: 164, protein: 6, carbs: 6, fat: 14, serving: "1 oz (23 nuts)" },
  "Sweet potato": { calories: 103, protein: 2.3, carbs: 24, fat: 0.1, serving: "1 medium" },
  "Broccoli": { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, serving: "1 cup" },
  "Spinach": { calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, serving: "1 cup raw" },
  "Quinoa": { calories: 222, protein: 8, carbs: 39, fat: 3.5, serving: "1 cup cooked" },
  "Blueberries": { calories: 84, protein: 1.1, carbs: 21, fat: 0.5, serving: "1 cup" },
  "Whole wheat bread": { calories: 81, protein: 4, carbs: 14, fat: 1.1, serving: "1 slice" },
  "Coffee": { calories: 2, protein: 0.3, carbs: 0, fat: 0, serving: "1 cup black" },
  "Water": { calories: 0, protein: 0, carbs: 0, fat: 0, serving: "1 cup" },
  "Milk (whole)": { calories: 149, protein: 8, carbs: 12, fat: 8, serving: "1 cup" },
  "Pasta": { calories: 220, protein: 8, carbs: 43, fat: 1.3, serving: "1 cup cooked" },
}

export default function FoodDiaryPage() {
  const { data, mutate } = useSWR("/api/health/entries?limit=100", fetcher)
  const [open, setOpen] = useState(false)
  const [meal, setMeal] = useState("")
  const [mealType, setMealType] = useState("Lunch")
  const [calories, setCalories] = useState("")
  const [waterL, setWaterL] = useState("")
  const [notes, setNotes] = useState("")
  const [logging, setLogging] = useState(false)
  const [foodSearch, setFoodSearch] = useState("")

  const entries: any[] = (data?.entries ?? []).filter((e: any) => e.entryType === "NUTRITION")
  const today = new Date().toISOString().split("T")[0]
  const todayEntries = entries.filter(e => e.recordedAt?.split("T")[0] === today)

  const todayCalories = todayEntries.reduce((s, e) => {
    const d = JSON.parse(e.data || "{}")
    return s + (d.calories ?? 0)
  }, 0)

  const todayWater = todayEntries.reduce((s, e) => {
    const d = JSON.parse(e.data || "{}")
    return s + (d.waterL ?? 0)
  }, 0)

  const todayProtein = todayEntries.reduce((s, e) => {
    const d = JSON.parse(e.data || "{}")
    return s + (d.protein ?? 0)
  }, 0)

  // Search food database
  const searchResults = foodSearch.length >= 2
    ? Object.entries(FOOD_DATABASE).filter(([name]) => name.toLowerCase().includes(foodSearch.toLowerCase()))
    : []

  function selectFood(name: string, info: typeof FOOD_DATABASE[string]) {
    setMeal(name)
    setCalories(String(info.calories))
    setFoodSearch("")
  }

  async function logFood() {
    if (!meal) return
    setLogging(true)
    await fetch("/api/health/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryType: "NUTRITION",
        data: {
          meal: `[${mealType}] ${meal}`,
          calories: calories ? parseInt(calories) : null,
          waterL: waterL ? parseFloat(waterL) : null,
          protein: FOOD_DATABASE[meal]?.protein ?? null,
          carbs: FOOD_DATABASE[meal]?.carbs ?? null,
          fat: FOOD_DATABASE[meal]?.fat ?? null,
        },
        notes: notes || null,
      }),
    })
    setLogging(false)
    setOpen(false)
    setMeal(""); setCalories(""); setWaterL(""); setNotes("")
    mutate()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Apple className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Food Diary</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track meals, calories, macros, and water intake.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Log Food</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Log Food</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Food search */}
              <div className="space-y-1.5">
                <Label>Search food</Label>
                <Input value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="Type to search: banana, chicken, rice..." />
                {searchResults.length > 0 && (
                  <div className="border border-border rounded-lg max-h-32 overflow-y-auto">
                    {searchResults.map(([name, info]) => (
                      <button key={name} onClick={() => selectFood(name, info)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between border-b border-border/30 last:border-0">
                        <span>{name}</span>
                        <span className="text-xs text-muted-foreground">{info.calories} cal · {info.serving}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Meal type</Label>
                  <div className="flex flex-wrap gap-1">
                    {MEAL_TYPES.map(t => (
                      <button key={t} onClick={() => setMealType(t)}
                        className={cn("text-xs rounded-full border px-2 py-1", mealType === t ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>What did you eat?</Label>
                <Input value={meal} onChange={e => setMeal(e.target.value)} placeholder="e.g. Grilled chicken with rice" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Calories (approx)</Label>
                  <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g. 450" />
                </div>
                <div className="space-y-1.5">
                  <Label>Water (liters)</Label>
                  <Input type="number" step="0.1" value={waterL} onChange={e => setWaterL(e.target.value)} placeholder="e.g. 0.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did you feel after eating?" className="min-h-[60px]" />
              </div>

              <Button className="w-full" onClick={logFood} disabled={logging || !meal}>
                {logging ? "Logging..." : "Log meal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600">{todayCalories}</p>
            <p className="text-xs text-muted-foreground">Calories today</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Droplets className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{todayWater.toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">Water today</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Apple className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{todayProtein}g</p>
            <p className="text-xs text-muted-foreground">Protein today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's meals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No meals logged today. Tap "Log Food" to start tracking.</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((e: any) => {
                const d = JSON.parse(e.data || "{}")
                return (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{d.meal}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {d.calories && ` · ${d.calories} cal`}
                        {d.protein && ` · ${d.protein}g protein`}
                      </p>
                    </div>
                    {d.calories && <Badge variant="outline" className="text-xs">{d.calories} cal</Badge>}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent history */}
      {entries.length > todayEntries.length && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {entries.filter(e => e.recordedAt?.split("T")[0] !== today).slice(0, 10).map((e: any) => {
                const d = JSON.parse(e.data || "{}")
                return (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm">{d.meal}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(e.recordedAt).toLocaleDateString()}</p>
                    </div>
                    {d.calories && <span className="text-xs text-muted-foreground">{d.calories} cal</span>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <a href="/health" className="text-sm text-violet-600 hover:underline">← Health Intelligence</a>
        <a href="/health/water" className="text-sm text-blue-600 hover:underline">Water Tracker →</a>
      </div>
    </div>
  )
}
