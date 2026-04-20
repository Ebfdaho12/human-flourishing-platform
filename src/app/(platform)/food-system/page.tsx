"use client"

import { useState } from "react"
import { Apple, ChevronDown, AlertTriangle, Sprout, Factory, ShoppingCart, Leaf, Globe2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const CONTROL = [
  { sector: "Meat Processing", companies: "JBS, Tyson, Cargill, National Beef", share: "85%", note: "4 companies process 85% of beef in the US and Canada. When one plant shuts down, meat prices spike nationally. During COVID, these plants became hotspots while prices surged and farmers received less." },
  { sector: "Grocery Retail (Canada)", companies: "Loblaw, Sobeys/Empire, Metro", share: "68%", note: "3 companies control 68% of Canadian grocery sales. Loblaw alone (Loblaws, No Frills, Shoppers, T&T) has 30%+. During 2023 inflation, all three reported record profits while Canadians struggled to afford food." },
  { sector: "Grocery Retail (US)", companies: "Walmart, Kroger, Costco, Albertsons", share: "65%", note: "4 companies control 65% of US grocery. The proposed Kroger-Albertsons merger would have created a near-monopoly. Walmart alone controls 25% of US grocery spending." },
  { sector: "Seeds & Pesticides", companies: "Bayer/Monsanto, Corteva, Syngenta/ChemChina, BASF", share: "70%", note: "4 companies control 70% of global seed and pesticide markets. Farmers cannot save seeds — they must buy new ones every year due to patents. Monsanto (now Bayer) sued farmers whose fields were contaminated by their patented seeds blowing in from neighboring farms." },
  { sector: "Grain Trading", companies: "Archer Daniels Midland, Bunge, Cargill, Louis Dreyfus", share: "70%", note: "The 'ABCD' companies control 70% of global grain trade. They know crop conditions, shipping routes, and prices before governments do. They profit from volatility — high prices and low prices both generate trading profits." },
  { sector: "Baby Formula (US)", companies: "Abbott, Reckitt, Nestlé", share: "95%", note: "3 companies control 95% of US infant formula. When Abbott's Sturgis plant shut down in 2022, there was a nationwide formula shortage. A critical product for infants controlled by essentially 3 companies." },
]

const LABELS = [
  { label: "Organic", meaning: "USDA/CFIA certified — no synthetic pesticides, fertilizers, GMOs, or antibiotics. Land must be organic for 3+ years. Third-party verified.", real: "The most meaningful label. Not perfect — some organic pesticides exist — but significantly reduces chemical exposure. Worth the cost for the 'Dirty Dozen' (strawberries, spinach, apples, etc.).", trustLevel: "high" },
  { label: "Natural", meaning: "Has NO legal definition in the US or Canada. Any company can put 'natural' on anything.", real: "Meaningless marketing. A bag of chips fried in 'natural' oil with 'natural' flavors is still chips. The word 'natural' is designed to make you FEEL good without the company doing anything.", trustLevel: "low" },
  { label: "Free Range", meaning: "USDA: poultry has 'access to the outdoors.' No minimum space or time requirements.", real: "Can mean a door is opened for 5 minutes a day to a concrete slab. 20,000 chickens in a barn with one small door counts as 'free range.' The label creates an image that rarely matches reality.", trustLevel: "low" },
  { label: "Grass-Fed", meaning: "Animal ate grass at some point. In the US, no consistent standard after USDA dropped its definition in 2016.", real: "Without third-party certification (like the American Grassfed Association), this label is nearly meaningless. '100% Grass-Fed and Finished' is more reliable.", trustLevel: "medium" },
  { label: "Non-GMO", meaning: "Does not contain genetically modified organisms. Verified by Non-GMO Project.", real: "The Non-GMO Project label is legitimate. However, the safety debate around GMOs is more nuanced than marketing suggests — many GMO crops are well-studied and safe. The concern is more about corporate seed control (Monsanto/Bayer patents) than health.", trustLevel: "medium" },
  { label: "Farm Fresh", meaning: "Nothing. No legal definition. No standard. No verification.", real: "Pure marketing. The eggs could be from a factory farm with 500,000 hens. The word 'farm' makes you picture a small family farm. That is the point.", trustLevel: "low" },
  { label: "No Added Hormones (Poultry)", meaning: "Hormones are already illegal in poultry in the US and Canada. This label is legally required to say 'Federal regulations prohibit the use of hormones.'", real: "It is like labeling water 'gluten-free' — technically true but misleading because it was never there in the first place. A marketing trick to charge more.", trustLevel: "low" },
  { label: "Local", meaning: "Generally means within 100-250 miles, but no legal standard.", real: "When genuine, local food is fresher, supports your community, and has lower transport emissions. But verify — some 'local' brands are subsidiaries of national companies.", trustLevel: "medium" },
]

const GROW_YOUR_OWN = [
  { item: "Herbs (basil, cilantro, mint, parsley)", difficulty: "Easy", space: "Windowsill", saves: "$50-100/year", note: "Fresh herbs cost $3-5 per tiny package at the store. A $3 basil plant produces for months." },
  { item: "Lettuce & Greens", difficulty: "Easy", space: "Container or small bed", saves: "$100-200/year", note: "Grows in 30-45 days. Cut-and-come-again — one planting produces for months. No pesticides needed." },
  { item: "Tomatoes", difficulty: "Easy-Medium", space: "Container or garden", saves: "$100-300/year", note: "One tomato plant can produce 20-30 lbs of tomatoes per season. Tastes incomparably better than store-bought." },
  { item: "Peppers", difficulty: "Easy-Medium", space: "Container or garden", saves: "$50-150/year", note: "Easy to grow, productive, and one of the most pesticide-sprayed vegetables at the store." },
  { item: "Zucchini / Squash", difficulty: "Easy", space: "Garden (they spread)", saves: "$50-100/year", note: "Famously productive — you will have more than you can eat. Great for sharing with neighbors." },
  { item: "Potatoes", difficulty: "Easy", space: "Container or garden", saves: "$50-100/year", note: "Can grow in a bag or bucket. Extremely satisfying to harvest. Stores for months." },
  { item: "Garlic", difficulty: "Easy", space: "Small bed", saves: "$30-60/year", note: "Plant in fall, harvest in summer. Zero maintenance. One bulb produces 8-12 new bulbs." },
  { item: "Berries (strawberries, blueberries)", difficulty: "Medium", space: "Container or garden", saves: "$100-300/year", note: "Strawberries produce in the first year. Blueberries take 2-3 years but produce for 20+ years. Berries are one of the most expensive and most pesticide-sprayed produce items." },
]

export default function FoodSystemPage() {
  const [section, setSection] = useState<"control" | "labels" | "grow">("control")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Your Food System</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Who controls your food, what the labels actually mean, and how to take some of that control back.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: "control", label: "Who Controls It", icon: Factory },
          { key: "labels", label: "What Labels Mean", icon: ShoppingCart },
          { key: "grow", label: "Grow Your Own", icon: Sprout },
        ].map(t => (
          <button key={t.key} onClick={() => setSection(t.key as any)}
            className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5",
              section === t.key ? "border-emerald-500 text-emerald-700" : "border-transparent text-muted-foreground"
            )}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {section === "control" && (
        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                A handful of corporations control the majority of what you eat — from the seeds that grow it, to the
                processing, to the shelf it sits on. This is not a conspiracy theory — it is publicly available market
                share data. Concentration reduces competition, raises prices, and makes the food supply fragile.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {CONTROL.map((c, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{c.sector}</p>
                    <Badge variant="outline" className="text-xs text-red-500 border-red-300">{c.share} controlled</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1"><strong>By:</strong> {c.companies}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === "labels" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Food labels are designed to make you feel good about buying a product. Some are meaningful. Many are not.
            Here is what each one actually means — and whether you should trust it.
          </p>
          {LABELS.map((l, i) => (
            <Card key={i} className={cn(
              l.trustLevel === "high" ? "border-emerald-200" :
              l.trustLevel === "medium" ? "border-amber-200" : "border-red-200"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold">{l.label}</p>
                  <Badge variant="outline" className={cn("text-[9px]",
                    l.trustLevel === "high" ? "text-emerald-600 border-emerald-300" :
                    l.trustLevel === "medium" ? "text-amber-600 border-amber-300" : "text-red-500 border-red-300"
                  )}>
                    {l.trustLevel === "high" ? "Meaningful" : l.trustLevel === "medium" ? "Partially meaningful" : "Marketing only"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1"><strong>Official meaning:</strong> {l.meaning}</p>
                <p className="text-xs text-muted-foreground leading-relaxed"><strong>Reality:</strong> {l.real}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === "grow" && (
        <div className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You do not need a farm. A windowsill, a balcony, or a small patch of dirt is enough to start.
                Growing even 10% of your food saves money, improves nutrition, teaches kids where food comes from,
                and reduces your dependency on a supply chain you do not control. Start small — one herb plant on
                a windowsill is a beginning.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {GROW_YOUR_OWN.map((g, i) => (
              <Card key={i}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{g.item}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span>Difficulty: <strong>{g.difficulty}</strong></span>
                      <span>Space: <strong>{g.space}</strong></span>
                      <span className="text-emerald-600 font-medium">Saves: {g.saves}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{g.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The bottom line:</strong> Your food supply is controlled by fewer companies than most people realize.
            Food labels are often marketing, not regulation. But you have power: buy local when possible, read labels
            critically, grow what you can, and teach your children where food actually comes from. A family that can
            feed itself — even partially — is a family that cannot be controlled by a supply chain disruption.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/health/food" className="text-sm text-emerald-600 hover:underline">Food Diary</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
        <a href="/preparedness" className="text-sm text-slate-600 hover:underline">Emergency Preparedness</a>
      </div>
    </div>
  )
}
