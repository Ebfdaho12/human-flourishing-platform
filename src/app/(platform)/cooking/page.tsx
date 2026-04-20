"use client"

import { useState } from "react"
import { Utensils, Clock, DollarSign, ChevronDown, Star, Users, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const RECIPES: {
  name: string
  time: string
  cost: string
  takeoutEquiv: string
  serves: number
  difficulty: string
  ingredients: string[]
  steps: string[]
  tip: string
  category: string
}[] = [
  {
    name: "One-Pot Pasta (Spaghetti)",
    time: "20 min",
    cost: "$4-6",
    takeoutEquiv: "$25-35",
    serves: 4,
    difficulty: "Easy",
    category: "Staple",
    ingredients: ["1 lb spaghetti", "1 jar pasta sauce (or canned tomatoes + garlic + basil)", "1 lb ground beef or turkey (optional)", "Parmesan cheese", "Salt, pepper, olive oil"],
    steps: ["Brown meat in large pot (5 min). Drain fat.", "Add sauce + 2 cups water. Bring to boil.", "Add pasta. Stir. Cover. Simmer 12 min, stirring every 3 min.", "Season with salt and pepper. Top with parmesan.", "Done. Total time: 20 minutes. Total cost: ~$5 for 4 servings."],
    tip: "Make double and freeze half. Reheats perfectly. One cooking session = two meals.",
  },
  {
    name: "Sheet Pan Chicken + Veggies",
    time: "35 min",
    cost: "$6-8",
    takeoutEquiv: "$30-40",
    serves: 4,
    difficulty: "Easy",
    category: "Staple",
    ingredients: ["4 chicken thighs (bone-in, skin-on — cheaper and juicier than breast)", "2 cups chopped vegetables (broccoli, peppers, sweet potato — whatever you have)", "Olive oil, salt, pepper, garlic powder, paprika"],
    steps: ["Preheat oven to 425°F (220°C).", "Toss chicken + veggies with oil, salt, pepper, garlic powder, paprika on a sheet pan.", "Spread in single layer. Chicken skin-side up.", "Bake 30 min. Chicken should be 165°F internal.", "That is it. One pan. One mess. Four servings."],
    tip: "Bone-in thighs are 50% cheaper than boneless breast AND more flavorful. The bone keeps them moist. This is the cheat code of home cooking.",
  },
  {
    name: "Stir Fry (Any Protein + Rice)",
    time: "25 min",
    cost: "$5-8",
    takeoutEquiv: "$35-50",
    serves: 4,
    difficulty: "Easy",
    category: "Staple",
    ingredients: ["2 cups rice", "1 lb protein (chicken, beef, tofu, shrimp)", "3 cups mixed vegetables (frozen stir fry mix works)", "Soy sauce (3 tbsp)", "Sesame oil (1 tsp)", "Garlic (2 cloves), ginger (1 tsp)", "Cornstarch (1 tbsp in 2 tbsp water — thickener)"],
    steps: ["Start rice (rice cooker or pot: 2 cups rice + 2.5 cups water, boil then simmer 15 min covered).", "Slice protein thin. Cook in hot oil 3-4 min. Remove.", "Same pan: cook veggies 3 min on high heat.", "Add protein back. Add soy sauce + sesame oil + garlic + ginger.", "Add cornstarch slurry. Stir 1 min until sauce thickens. Serve over rice."],
    tip: "Frozen stir fry vegetable mix is $3-4 for 750g and is already cut. No prep, no waste. Keep 3-4 bags in your freezer at all times.",
  },
  {
    name: "Slow Cooker Chili",
    time: "15 min prep + 6-8 hrs slow cook",
    cost: "$8-12",
    takeoutEquiv: "$40-50",
    serves: 8,
    difficulty: "Easy",
    category: "Batch",
    ingredients: ["2 lbs ground beef or turkey", "2 cans diced tomatoes", "2 cans kidney beans (drained)", "1 can black beans (drained)", "1 onion, diced", "Chili powder (2 tbsp), cumin (1 tbsp), garlic (3 cloves)", "Salt, pepper"],
    steps: ["Brown meat in a pan. Drain fat.", "Put everything in slow cooker.", "Low for 6-8 hours or high for 3-4 hours.", "Season to taste. Serve with sour cream, cheese, bread.", "Freeze leftovers in portions. You now have 4-5 meals for $8-12 total."],
    tip: "This is the king of batch cooking. 15 minutes of work produces 8 servings. Freeze in individual containers. Reheat in 3 min. Cheaper and better than any canned chili.",
  },
  {
    name: "Tacos (Ground Beef or Turkey)",
    time: "20 min",
    cost: "$6-10",
    takeoutEquiv: "$30-45",
    serves: 4,
    difficulty: "Easy",
    category: "Crowd Pleaser",
    ingredients: ["1 lb ground beef/turkey", "Taco shells or tortillas", "Taco seasoning (1 packet or: chili powder, cumin, garlic, onion powder, paprika)", "Toppings: shredded cheese, lettuce, tomato, sour cream, salsa"],
    steps: ["Brown meat. Drain fat.", "Add taco seasoning + 1/3 cup water. Simmer 5 min.", "Warm shells/tortillas.", "Set up topping station. Let everyone build their own.", "Kids love this. Adults love this. 20 minutes. $2/person."],
    tip: "Make your own taco seasoning in bulk: 4 tbsp chili powder, 2 tbsp cumin, 1 tbsp garlic powder, 1 tbsp onion powder, 1 tsp paprika, salt, pepper. Costs $0.50 vs $2+ for a packet.",
  },
  {
    name: "Homemade Pizza Night",
    time: "30-40 min (or 15 with store dough)",
    cost: "$5-8",
    takeoutEquiv: "$25-40",
    serves: 4,
    difficulty: "Medium",
    category: "Crowd Pleaser",
    ingredients: ["Pizza dough (store-bought $3 or homemade: flour, yeast, water, oil, salt)", "Pizza sauce (or canned crushed tomatoes + garlic + oregano)", "Mozzarella cheese (shredded)", "Toppings of choice"],
    steps: ["Preheat oven to highest setting (475-500°F).", "Roll dough on floured surface. Place on oiled baking sheet.", "Spread sauce. Add cheese. Add toppings.", "Bake 10-12 min until crust is golden and cheese bubbles.", "Let kids make their own personal pizzas. This is an activity AND a meal."],
    tip: "Store-bought pizza dough from the bakery section costs $3 and is excellent. No shame in shortcuts. The goal is cooking at home, not making everything from scratch.",
  },
  {
    name: "Breakfast for Dinner (Eggs, Bacon, Pancakes)",
    time: "20 min",
    cost: "$4-6",
    takeoutEquiv: "$25-35",
    serves: 4,
    difficulty: "Easy",
    category: "Crowd Pleaser",
    ingredients: ["8 eggs", "8 strips bacon (or sausage)", "Pancake mix + milk (or from scratch: flour, baking powder, egg, milk, butter)", "Maple syrup, butter"],
    steps: ["Cook bacon in oven (400°F, 15 min on a sheet pan — less mess than stovetop).", "Mix pancake batter. Cook on medium griddle — flip when bubbles form.", "Scramble eggs in butter (low heat, stir constantly for fluffy eggs).", "Serve family-style. Kids love breakfast for dinner.", "Total: 20 min, $5, and everyone is happy."],
    tip: "Eggs are the cheapest protein in the grocery store ($0.30-0.50 per egg). A family dinner of scrambled eggs, toast, and fruit costs under $5 and takes 10 minutes. No shame in simple meals.",
  },
  {
    name: "Oatmeal 5 Ways (Weekly Breakfast Prep)",
    time: "5 min prep (overnight) or 10 min cook",
    cost: "$0.50-1.00 per serving",
    takeoutEquiv: "$5-8 per serving at a cafe",
    serves: 1,
    difficulty: "Easy",
    category: "Breakfast",
    ingredients: ["1/2 cup oats", "1 cup milk or water", "Toppings: banana, berries, peanut butter, honey, cinnamon, nuts, seeds"],
    steps: ["Overnight oats: mix oats + milk in jar. Refrigerate overnight. Add toppings in morning.", "Stovetop: boil water/milk, add oats, simmer 5 min. Add toppings.", "Make 5 jars Sunday night = breakfast handled for the entire work week.", "Top with: PB+banana, berries+honey, apple+cinnamon, nuts+seeds, chocolate+coconut.", "Cost: ~$0.50-$1.00 per serving vs $5-8 for a cafe bowl."],
    tip: "Buy oats in the large bag (not individual packets). A 1kg bag costs $3-4 and makes 20 servings = $0.15-0.20 per serving for the oats alone. Add a banana ($0.25) and peanut butter ($0.15) = full breakfast for $0.55.",
  },
]

const CATEGORIES = [...new Set(RECIPES.map(r => r.category))]

export default function CookingPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = filterCat ? RECIPES.filter(r => r.category === filterCat) : RECIPES
  const totalSavings = RECIPES.reduce((s, r) => {
    const takeout = parseInt(r.takeoutEquiv.replace(/[^0-9]/g, ""))
    const home = parseInt(r.cost.replace(/[^0-9]/g, ""))
    return s + (takeout - home)
  }, 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cooking Basics</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          8 meals every family should know. Simple, cheap, and better than takeout. Total savings: $600+/month.
        </p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>You do not need to be a chef.</strong> You need 8-10 meals you can make reliably. Rotate them weekly.
            A family that cooks 5 nights and orders 2 saves <strong>$500-$800/month</strong> vs eating out every night.
            Every recipe below costs under $10 for 4 servings. Every one takes under 35 minutes (most under 20).
            If you can boil water and follow steps, you can make every meal on this page.
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat(null)}
          className={cn("text-xs rounded-full px-3 py-1 border",
            !filterCat ? "bg-orange-100 border-orange-300 text-orange-700 font-semibold" : "border-border text-muted-foreground"
          )}>All ({RECIPES.length})</button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className={cn("text-xs rounded-full px-3 py-1 border",
              filterCat === cat ? "bg-orange-100 border-orange-300 text-orange-700 font-semibold" : "border-border text-muted-foreground"
            )}>{cat}</button>
        ))}
      </div>

      {/* Recipes */}
      <div className="space-y-3">
        {filtered.map((r, i) => {
          const globalIdx = RECIPES.indexOf(r)
          const isOpen = expanded === globalIdx
          return (
            <Card key={r.name} className="card-hover cursor-pointer overflow-hidden" onClick={() => setExpanded(isOpen ? null : globalIdx)}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-3">
                  <Flame className="h-5 w-5 text-orange-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {r.time}</span>
                      <span className="text-emerald-600 font-medium">{r.cost}</span>
                      <span>vs takeout: {r.takeoutEquiv}</span>
                      <span><Users className="h-2.5 w-2.5 inline" /> {r.serves}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{r.difficulty}</Badge>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ingredients</p>
                      <ul className="grid grid-cols-2 gap-0.5">
                        {r.ingredients.map((ing, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-1">
                            <span className="text-orange-400">•</span>{ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Steps</p>
                      <ol className="space-y-1">
                        {r.steps.map((step, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-orange-500 font-bold shrink-0">{j + 1}.</span>{step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                      <p className="text-xs text-amber-700"><strong>Pro tip:</strong> {r.tip}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The math:</strong> These 8 meals rotated through a week feed a family of 4 for <strong>$40-$60/week</strong> in
            groceries. The same meals from takeout/restaurants: <strong>$200-$350/week</strong>. That is
            <strong> $8,000-$15,000/year in savings</strong> — just from learning to cook 8 simple meals. Use the{" "}
            <a href="/meal-planner" className="text-violet-600 hover:underline">Meal Planner</a> to organize your week.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/meal-planner" className="text-sm text-orange-600 hover:underline">Meal Planner</a>
        <a href="/food-system" className="text-sm text-emerald-600 hover:underline">Food System</a>
        <a href="/budget" className="text-sm text-blue-600 hover:underline">Budget Calculator</a>
        <a href="/health/food" className="text-sm text-rose-600 hover:underline">Food Diary</a>
      </div>
    </div>
  )
}
