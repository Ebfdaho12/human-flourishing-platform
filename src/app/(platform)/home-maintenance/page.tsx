"use client"

import { useState, useEffect } from "react"
import { Wrench, CheckCircle, Clock, AlertTriangle, Home, ChevronDown, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

const SCHEDULE: { season: string; color: string; icon: any; tasks: { task: string; frequency: string; cost: string; why: string; diy: boolean }[] }[] = [
  {
    season: "Spring",
    color: "from-green-500 to-emerald-600",
    icon: "🌱",
    tasks: [
      { task: "Clean gutters and downspouts", frequency: "Twice/year", cost: "$0 DIY, $150-$300 pro", why: "Clogged gutters cause water damage to foundation, fascia, and soffits. The #1 preventable cause of basement flooding.", diy: true },
      { task: "Inspect roof for winter damage", frequency: "Yearly", cost: "$0 (visual), $200-$400 pro inspection", why: "Missing/damaged shingles let water in. A $20 shingle repair prevents a $10,000 roof leak.", diy: true },
      { task: "Service AC / heat pump", frequency: "Yearly", cost: "$100-$200", why: "Clean filters, check refrigerant, clear debris. A serviced unit runs 15-25% more efficiently. Skipping leads to $3,000-$8,000 replacement.", diy: false },
      { task: "Check window and door seals", frequency: "Yearly", cost: "$20-$50 caulk", why: "Cracked caulk and weatherstripping waste 25-30% of heating/cooling energy. $20 in caulk can save $200/year in energy.", diy: true },
      { task: "Test sump pump", frequency: "Twice/year", cost: "$0", why: "Pour a bucket of water in the pit. If it does not kick on, fix it BEFORE the spring rains flood your basement.", diy: true },
      { task: "Aerate and fertilize lawn", frequency: "Yearly", cost: "$30-$50 DIY, $100-$200 pro", why: "Compacted soil = weak grass = weeds. Aeration lets water and nutrients reach roots.", diy: true },
    ],
  },
  {
    season: "Summer",
    color: "from-yellow-500 to-orange-500",
    icon: "☀️",
    tasks: [
      { task: "Pressure wash deck, driveway, siding", frequency: "Yearly", cost: "$50 rental, $200-$400 pro", why: "Mold, algae, and grime break down surfaces. A $50 pressure wash extends deck life by years.", diy: true },
      { task: "Stain/seal deck if needed", frequency: "Every 2-3 years", cost: "$50-$150 DIY", why: "An unsealed deck rots in 5-7 years. A sealed deck lasts 20+. This single task saves thousands.", diy: true },
      { task: "Check and repair caulking around tub/shower", frequency: "Yearly", cost: "$10 tube of caulk", why: "Water behind tiles causes mold and structural damage. A $10 recaulk prevents a $5,000 bathroom reno.", diy: true },
      { task: "Clean dryer vent", frequency: "Yearly", cost: "$0 DIY, $100-$150 pro", why: "Dryer lint buildup is a top cause of house fires. Pull the vent, brush it out. 10 minutes could save your home.", diy: true },
      { task: "Inspect and repair grout in bathrooms", frequency: "Yearly", cost: "$15-$30 grout", why: "Cracked grout = water behind tiles = mold and rot. Cheap fix that prevents expensive damage.", diy: true },
    ],
  },
  {
    season: "Fall",
    color: "from-orange-500 to-red-600",
    icon: "🍂",
    tasks: [
      { task: "Clean gutters (again)", frequency: "Twice/year", cost: "$0 DIY", why: "Fall leaves clog gutters fast. Do this after most leaves have fallen but before the first freeze.", diy: true },
      { task: "Service furnace / heating system", frequency: "Yearly", cost: "$100-$200", why: "A furnace tune-up catches problems before winter. Carbon monoxide leaks are deadly and silent.", diy: false },
      { task: "Drain and shut off outdoor faucets", frequency: "Yearly", cost: "$0", why: "Water left in outdoor pipes freezes, expands, and bursts the pipe. A $0 task prevents a $1,000+ plumbing emergency.", diy: true },
      { task: "Check smoke and CO detectors", frequency: "Twice/year", cost: "$0 (test), $20-$40 batteries", why: "Test every detector. Replace batteries. Replace the entire unit every 10 years. This saves lives.", diy: true },
      { task: "Reverse ceiling fans", frequency: "Twice/year", cost: "$0", why: "Clockwise in winter pushes warm air down from the ceiling. Can reduce heating costs 10-15%.", diy: true },
      { task: "Insulate pipes in unheated areas", frequency: "Once", cost: "$10-$30 foam sleeves", why: "Frozen pipes burst. $10 in pipe insulation prevents thousands in water damage.", diy: true },
    ],
  },
  {
    season: "Winter",
    color: "from-blue-500 to-indigo-600",
    icon: "❄️",
    tasks: [
      { task: "Check attic for ice dams / ventilation", frequency: "Yearly", cost: "$0 visual", why: "Ice dams form when attic heat melts snow that refreezes at the edge. Proper ventilation and insulation prevent this.", diy: true },
      { task: "Test GFCI outlets", frequency: "Monthly", cost: "$0", why: "Press the test button on outlets near water (kitchen, bathroom, garage). They should trip instantly. If not, replace immediately — they prevent electrocution.", diy: true },
      { task: "Clean range hood filter", frequency: "Monthly", cost: "$0", why: "Grease buildup is a fire hazard. Soak in hot soapy water for 15 minutes. Takes 2 minutes of actual effort.", diy: true },
      { task: "Flush hot water heater", frequency: "Yearly", cost: "$0", why: "Sediment builds up and reduces efficiency by 20-30%. A garden hose and 15 minutes saves you energy costs and extends tank life by years.", diy: true },
    ],
  },
]

export default function HomeMaintenancePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<number | null>(getCurrentSeason())

  useEffect(() => {
    const stored = localStorage.getItem("hfp-home-maintenance")
    if (stored) setChecked(JSON.parse(stored))
  }, [])

  function toggle(key: string) {
    const updated = { ...checked, [key]: !checked[key] }
    setChecked(updated)
    localStorage.setItem("hfp-home-maintenance", JSON.stringify(updated))
  }

  const totalTasks = SCHEDULE.reduce((s, season) => s + season.tasks.length, 0)
  const completedTasks = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Home Maintenance Schedule</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Preventive maintenance saves 10x what emergency repairs cost. This is your year-round checklist.
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Annual progress</span>
            <span className="text-sm font-bold">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Seasons */}
      <div className="space-y-3">
        {SCHEDULE.map((season, si) => {
          const isOpen = expanded === si
          const seasonChecked = season.tasks.filter((_, ti) => checked[`${si}-${ti}`]).length
          return (
            <Card key={season.season}>
              <div className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : si)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-lg", season.color)}>
                    {season.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{season.season}</p>
                    <p className="text-[10px] text-muted-foreground">{seasonChecked}/{season.tasks.length} complete</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CardContent>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {season.tasks.map((task, ti) => {
                    const key = `${si}-${ti}`
                    const done = !!checked[key]
                    return (
                      <div key={ti}
                        className={cn("rounded-lg border p-3 cursor-pointer transition-all",
                          done ? "border-emerald-200 bg-emerald-50/30 opacity-70" : "border-border hover:bg-muted/30"
                        )}
                        onClick={e => { e.stopPropagation(); toggle(key) }}>
                        <div className="flex items-start gap-3">
                          {done ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>{task.task}</p>
                              {task.diy && <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">DIY</Badge>}
                            </div>
                            <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                              <span>{task.frequency}</span>
                              <span>{task.cost}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{task.why}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="border-amber-200 bg-amber-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>The 1% rule:</strong> Budget 1% of your home's value per year for maintenance. A $400,000 home =
            $4,000/year in maintenance. Most of the tasks on this list cost $0-$50 if you do them yourself.
            The expensive repairs happen when you SKIP the cheap preventive maintenance. A $0 gutter cleaning
            prevents a $10,000 foundation repair. A $100 furnace tune-up prevents a $5,000 emergency replacement
            in January. Prevention is always cheaper than repair.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <a href="/preparedness" className="text-sm text-slate-600 hover:underline">Emergency Preparedness</a>
        <a href="/budget" className="text-sm text-emerald-600 hover:underline">Budget Calculator</a>
        <a href="/family-economics" className="text-sm text-rose-600 hover:underline">Family Economics</a>
      </div>
    </div>
  )
}

function getCurrentSeason(): number {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 0 // Spring
  if (month >= 5 && month <= 7) return 1 // Summer
  if (month >= 8 && month <= 10) return 2 // Fall
  return 3 // Winter
}
