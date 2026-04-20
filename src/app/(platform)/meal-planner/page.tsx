"use client"

import { useState, useEffect } from "react"
import { Utensils, Plus, Trash2, ShoppingCart, ChevronDown, Copy, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"]

interface MealPlan {
  [day: string]: { [meal: string]: string }
}

const QUICK_MEALS: Record<string, string[]> = {
  Breakfast: [
    "Oatmeal + banana + peanut butter",
    "Scrambled eggs + toast + fruit",
    "Greek yogurt + granola + berries",
    "Smoothie (banana, spinach, protein)",
    "Overnight oats + chia seeds",
    "Avocado toast + eggs",
    "Pancakes + maple syrup + fruit",
  ],
  Lunch: [
    "Chicken rice bowl + veggies",
    "Turkey + cheese sandwich + apple",
    "Pasta salad + grilled chicken",
    "Quesadilla + salsa + sour cream",
    "Soup + bread (make a big batch Sunday)",
    "Leftovers from last night's dinner",
    "Tuna wrap + carrot sticks",
    "Rice + beans + avocado bowl",
  ],
  Dinner: [
    "Spaghetti + meat sauce + garlic bread",
    "Sheet pan chicken + roasted veggies",
    "Stir fry (chicken/beef + rice + veggies)",
    "Tacos (ground beef/turkey + toppings)",
    "Salmon + rice + steamed broccoli",
    "Slow cooker chili (big batch → leftovers)",
    "Homemade pizza night",
    "Chicken curry + naan + rice",
    "Burgers + sweet potato fries",
    "Mac and cheese + side salad",
    "Pork chops + mashed potatoes + green beans",
    "Baked potato bar (toppings station)",
    "Soup and sandwich night",
    "Breakfast for dinner (eggs, bacon, pancakes)",
  ],
  Snack: [
    "Apple + peanut butter",
    "Trail mix",
    "Cheese + crackers",
    "Veggies + hummus",
    "Banana + almond butter",
    "Popcorn (homemade)",
    "Yogurt + berries",
  ],
}

export default function MealPlannerPage() {
  const [plan, setPlan] = useState<MealPlan>({})
  const [showGrocery, setShowGrocery] = useState(false)
  const [customItems, setCustomItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("hfp-meal-plan")
    if (stored) {
      const data = JSON.parse(stored)
      setPlan(data.plan ?? {})
      setCustomItems(data.customItems ?? [])
    }
  }, [])

  function save(p: MealPlan, items: string[]) {
    setPlan(p); setCustomItems(items)
    localStorage.setItem("hfp-meal-plan", JSON.stringify({ plan: p, customItems: items }))
  }

  function setMeal(day: string, meal: string, value: string) {
    const updated = { ...plan, [day]: { ...(plan[day] || {}), [meal]: value } }
    save(updated, customItems)
  }

  function randomize() {
    const newPlan: MealPlan = {}
    for (const day of DAYS) {
      newPlan[day] = {}
      for (const meal of MEALS) {
        const options = QUICK_MEALS[meal]
        newPlan[day][meal] = options[Math.floor(Math.random() * options.length)]
      }
    }
    save(newPlan, customItems)
  }

  function clearPlan() {
    save({}, customItems)
  }

  // Generate grocery list from meals
  function getGroceryItems(): string[] {
    const meals = new Set<string>()
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const value = plan[day]?.[meal]
        if (value) meals.add(value)
      }
    }
    return [...meals]
  }

  function addGroceryItem() {
    if (!newItem.trim()) return
    save(plan, [...customItems, newItem.trim()])
    setNewItem("")
  }

  function removeGroceryItem(idx: number) {
    save(plan, customItems.filter((_, i) => i !== idx))
  }

  const filledMeals = DAYS.reduce((s, d) => s + MEALS.filter(m => plan[d]?.[m]).length, 0)
  const totalSlots = DAYS.length * MEALS.length

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Meal Planner</h1>
          </div>
          <p className="text-sm text-muted-foreground">Plan your week. Generate a grocery list. Save $800+/month vs eating out.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={randomize}><RotateCcw className="h-3 w-3" /> Auto-Fill</Button>
          <Button variant="outline" size="sm" onClick={() => setShowGrocery(!showGrocery)}>
            <ShoppingCart className="h-3 w-3" /> Grocery List
          </Button>
        </div>
      </div>

      {/* Progress */}
      {filledMeals > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(filledMeals / totalSlots) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{filledMeals}/{totalSlots} planned</span>
        </div>
      )}

      {/* Meal plan grid */}
      <div className="space-y-3">
        {DAYS.map(day => (
          <Card key={day}>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{day}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MEALS.map(meal => (
                  <div key={meal}>
                    <p className="text-[10px] text-muted-foreground mb-0.5">{meal}</p>
                    <div className="relative">
                      <Input
                        value={plan[day]?.[meal] || ""}
                        onChange={e => setMeal(day, meal, e.target.value)}
                        placeholder="Tap to plan..."
                        className="h-8 text-xs pr-6"
                        list={`suggestions-${meal}`}
                      />
                      {!plan[day]?.[meal] && (
                        <button onClick={() => {
                          const options = QUICK_MEALS[meal]
                          setMeal(day, meal, options[Math.floor(Math.random() * options.length)])
                        }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-violet-500" title="Random suggestion">
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Datalists for autocomplete */}
      {MEALS.map(meal => (
        <datalist key={meal} id={`suggestions-${meal}`}>
          {QUICK_MEALS[meal].map(m => <option key={m} value={m} />)}
        </datalist>
      ))}

      {/* Grocery list */}
      {showGrocery && (
        <Card className="border-2 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" /> Grocery List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">From your meal plan:</p>
              <div className="space-y-1">
                {getGroceryItems().map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 rounded border border-muted-foreground/30 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                {getGroceryItems().length === 0 && <p className="text-xs text-muted-foreground italic">Plan some meals to auto-generate items</p>}
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Custom items:</p>
              <div className="flex gap-2 mb-2">
                <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item..."
                  className="flex-1 h-7 text-xs" onKeyDown={e => e.key === "Enter" && addGroceryItem()} />
                <Button size="sm" onClick={addGroceryItem} className="h-7 text-xs"><Plus className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-1">
                {customItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 rounded border border-muted-foreground/30 shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button onClick={() => removeGroceryItem(i)} className="text-muted-foreground/30 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-orange-200 bg-orange-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Why meal planning saves more than anything else:</strong> The average family spends $1,000-$1,500/month
            on food (groceries + eating out). Families who meal plan spend $400-$600/month — a savings of
            $6,000-$10,000/year. That is because meal planning eliminates the three biggest money drains:
            impulse grocery purchases, food waste (30-40% of food purchased is thrown away), and last-minute
            takeout when nobody knows what to cook. 30 minutes of planning on Sunday saves 5+ hours and
            hundreds of dollars during the week.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/health/food" className="text-sm text-emerald-600 hover:underline">Food Diary</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/food-system" className="text-sm text-green-600 hover:underline">Food System</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}
