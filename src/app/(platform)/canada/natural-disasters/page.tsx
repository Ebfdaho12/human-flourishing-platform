"use client"

import { useState } from "react"
import { Map, ChevronDown, AlertTriangle, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const REGIONS = [
  {
    region: "British Columbia",
    risks: ["Earthquakes", "Wildfires", "Flooding"],
    riskLevel: "High",
    riskColor: "bg-red-100 text-red-800",
    details: [
      {
        hazard: "Earthquakes",
        freq: "The 'Big One' (M8.0+ Cascadia Subduction Zone) is overdue — return period ~500 years, last event 1700. Smaller quakes happen regularly.",
        prep: "72-hour kit minimum (7-day recommended for BC). Secure heavy furniture and water heaters. Know 'Drop, Cover, Hold On.' Tsunami risk in coastal areas — know your zone and evacuation routes. Unreinforced masonry buildings are highest risk. Check if your building has been seismically assessed.",
        action: "Shelter-in-place during shaking. Evacuate to high ground immediately after coastal quake (tsunami can arrive in 10–15 minutes in some zones).",
      },
      {
        hazard: "Wildfires",
        freq: "Season runs May–October. Record years: 2017, 2018, 2023. Climate change is expanding the season and severity.",
        prep: "FireSmart your property (clear 10m zone around home, non-combustible materials near foundation). Register for local emergency alerts. Have a go-bag ready from June–October. Know 2+ evacuation routes from your community.",
        action: "Follow evacuation orders immediately — do not wait. Fires move faster than you think. If sheltering-in-place: close all vents, windows, doors. Place wet towels under doors.",
      },
      {
        hazard: "Flooding",
        freq: "Annual spring freshet (snowmelt) plus atmospheric rivers (November–March). Fraser Valley, Sumas Prairie, and Okanagan are highest risk.",
        prep: "Check if your property is in a flood plain (local municipal flood map). Backflow prevention valve in basement. Flood insurance (not included in standard homeowner policies — add it). Sandbags for threshold properties.",
        action: "Never drive through flooded roads. If ordered to evacuate: go. Floodwater is contaminated. 15 cm of fast-moving water can knock a person down; 60 cm can sweep a car.",
      },
    ],
  },
  {
    region: "Prairies (AB, SK, MB)",
    risks: ["Drought", "Tornadoes", "Severe Cold"],
    riskLevel: "Moderate–High",
    riskColor: "bg-orange-100 text-orange-800",
    details: [
      {
        hazard: "Drought",
        freq: "Cyclical — major droughts every 10–20 years. 2001–2002 and 2021 were severe. Climate projections show increased frequency.",
        prep: "Primarily an agricultural and water security issue. Urban residents: water conservation practices, awareness of municipal water restrictions. Farmers: crop insurance, diversification, soil moisture monitoring.",
        action: "Shelter-in-place (not a sudden-onset emergency). Follow municipal water restrictions. Monitor regional drought monitoring at Agriculture Canada.",
      },
      {
        hazard: "Tornadoes",
        freq: "Canada has the second-highest tornado frequency globally after the US — most in the 'Tornado Alley' corridor from southern AB through SK and MB. ~60–80 tornadoes/year nationally, mostly May–August.",
        prep: "Know your shelter location (lowest floor, interior room, away from windows — ideally bathroom or stairwell). Do NOT shelter in a vehicle or mobile home. Sign up for local weather alerts (Environment Canada).",
        action: "Shelter immediately when a tornado warning is issued. Do not try to outrun. If outside with no shelter: lie flat in a low ditch, protect your head. After: watch for downed power lines.",
      },
      {
        hazard: "Severe Cold / Blizzards",
        freq: "Annual. Prairie cold snaps regularly reach –40°C with windchill. Whiteout blizzards make roads impassable within hours.",
        prep: "Winter emergency kit in every vehicle (blanket, candles, matches, high-calorie snacks, sand, shovel, booster cables). Home: extra water, food, heating backup. Never leave the house underdressed.",
        action: "Stay home when Environment Canada issues blizzard or extreme cold warnings. If stranded in a vehicle: stay with the vehicle (easier to find), run engine 10 min/hour for warmth (keep exhaust pipe clear of snow).",
      },
    ],
  },
  {
    region: "Ontario & Quebec",
    risks: ["Ice Storms", "Flooding", "Extreme Heat"],
    riskLevel: "Moderate",
    riskColor: "bg-yellow-100 text-yellow-800",
    details: [
      {
        hazard: "Ice Storms",
        freq: "Major events every 5–15 years. 1998 ice storm remains Canada's most costly natural disaster (3 million without power, some for weeks). Ottawa and Montreal are highest risk.",
        prep: "Keep 72-hour kit with candles, battery-powered radio, manual can opener, extra medications. If you rely on electricity for medical equipment, register with your utility. Generator if possible — but carbon monoxide rules apply (never indoors).",
        action: "Shelter-in-place during the event (roads are impassable ice). Avoid going out — ice-covered sidewalks cause serious injuries. After: beware of overloaded tree branches and power lines.",
      },
      {
        hazard: "Urban & River Flooding",
        freq: "Ottawa River, Rideau River, St. Lawrence tributaries flood regularly. Urban basement flooding during heavy rain is extremely common and underinsured.",
        prep: "Backflow valve. Sump pump with battery backup. Understand your insurance (most standard policies exclude overland flood — add riders). Know your city's flood risk map.",
        action: "Evacuate if ordered. Do not enter flooded basements with active electrical panels. Document all damage with photos before cleanup for insurance.",
      },
      {
        hazard: "Extreme Heat",
        freq: "Increasing. 2021 Western Canada heat dome was extreme, but Ontario/Quebec also sees deadly heat events. Urban heat island effect makes cities significantly hotter than surrounding areas.",
        prep: "Know your nearest cooling centre (libraries, malls, community centres — cities publish lists). Window AC or portable unit if possible. Identify vulnerable neighbours (elderly, infants) who may need check-ins.",
        action: "During heat warnings: stay indoors during peak heat (12–5 PM). Hydrate. Never leave children or pets in vehicles. Check on elderly neighbours. Heat stroke is a medical emergency.",
      },
    ],
  },
  {
    region: "Atlantic Canada (NB, NS, PEI, NL)",
    risks: ["Hurricanes", "Nor'easters", "Storm Surge"],
    riskLevel: "Moderate–High",
    riskColor: "bg-orange-100 text-orange-800",
    details: [
      {
        hazard: "Hurricanes & Post-Tropical Storms",
        freq: "Atlantic hurricane season June–November. Major impacts: Juan (2003), Igor (2010), Dorian (2019), Fiona (2022). Post-tropical systems can retain hurricane-force winds.",
        prep: "Pre-season prep: secure or store outdoor furniture, clear gutters, trim dead branches. Keep 72-hour kit with water (1L/person/day), food, medications, flashlights. Board or shutter windows for direct hits.",
        action: "Follow evacuation orders in coastal and low-lying areas. Shelter-in-place in solid buildings for most storms. Stay away from downed power lines. Fiona-level events can move entire houses — treat warnings seriously.",
      },
      {
        hazard: "Nor'easters & Winter Storms",
        freq: "Multiple times per winter. Heavy snow (50–100 cm in single events not uncommon), hurricane-force winds, blizzard conditions.",
        prep: "Same as prairie winter prep. Heating backup is critical — wood stove or pellet stove for rural areas. Keep several days of food and water in case of power outage.",
        action: "Shelter-in-place during events. Do not travel unless essential. After: roof snow load can cause collapse in heavy events — clear roofs if accumulation is significant.",
      },
      {
        hazard: "Storm Surge & Coastal Flooding",
        freq: "Associated with all major storms. PEI, Cape Breton, and low-lying coastal NB and NL are highest risk.",
        prep: "Know your elevation. Check provincial floodplain maps. Flood insurance. If you live below 5m elevation near the coast, understand your local storm surge risk.",
        action: "Evacuate coastal areas when storm surge warnings are issued. Surge can exceed 2–3m and combine with wave action. Do not return until authorities confirm it is safe.",
      },
    ],
  },
  {
    region: "Northern Canada (YT, NT, NU)",
    risks: ["Permafrost Thaw", "Blizzards", "Isolation"],
    riskLevel: "Unique / Escalating",
    riskColor: "bg-violet-100 text-violet-800",
    details: [
      {
        hazard: "Permafrost Thaw",
        freq: "Not a sudden event — a slow-motion infrastructure disaster. Arctic is warming 3–4x faster than the global average. Permafrost underlies ~50% of Canada's landmass and is destabilizing.",
        prep: "Building and infrastructure risk — thermokarst (ground subsidence) is damaging roads, buildings, and water systems in dozens of northern communities. Residents should be aware of structural changes in buildings. A community-level issue more than individual prep.",
        action: "Report infrastructure damage to local governments. Be aware that roads and trails may become impassable as permafrost thaws in summer. Community relocation is a reality for some northern communities.",
      },
      {
        hazard: "Blizzards & Extreme Cold",
        freq: "Annual. Northern communities can experience –50°C with windchill. Whiteout conditions make outdoor travel lethal.",
        prep: "Survival kit in all vehicles. Never travel between communities in winter without communication device and emergency supplies. Communities are isolated — supply chains can be cut for days.",
        action: "Do not travel during blizzard conditions. If stranded: stay with vehicle, signal for help. Northern communities have strong mutual aid cultures — know your neighbours.",
      },
      {
        hazard: "Isolation & Supply Chain Disruption",
        freq: "Weather events regularly cut off air access (the only way in/out for many communities). Supply chains are fragile and expensive.",
        prep: "Maintain at minimum 2-week food and medication supply. Water storage is critical — pipes freeze and water systems can fail. Solar or battery backup for essential medical devices.",
        action: "Community-level coordination. Northern emergency management relies heavily on local capacity — community emergency management plans, trained local responders, and mutual aid are essential.",
      },
    ],
  },
]

export default function NaturalDisastersPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Map className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Canada Natural Disaster Preparedness</h1>
        </div>
        <p className="text-sm text-muted-foreground">Risk by region, how to prepare, and when to evacuate versus shelter-in-place. Canada has five distinct disaster profiles — know yours.</p>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Universal baseline: the 72-hour kit</p>
              <p className="text-sm text-amber-700 mt-1">Every Canadian household should have: 4L of water per person per day (3-day minimum), non-perishable food for 3–7 days, battery-powered or hand-crank radio, flashlight and extra batteries, first aid kit, 7-day supply of medications, copies of important documents, cash, and a battery bank for phones. Register for your local emergency alerts at getprepared.ca.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {REGIONS.map((r, ri) => {
          const isOpen = expanded === `region-${ri}`
          return (
            <Card key={ri} className="border">
              <CardContent className="pt-0 pb-0">
                <button onClick={() => setExpanded(isOpen ? null : `region-${ri}`)} className="w-full flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{r.region}</span>
                    <Badge className={cn("text-xs", r.riskColor)}>{r.riskLevel}</Badge>
                    <div className="flex gap-1 flex-wrap">{r.risks.map(risk => <Badge key={risk} variant="secondary" className="text-xs">{risk}</Badge>)}</div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="pb-4 border-t pt-3 space-y-4">
                    {r.details.map((d, di) => (
                      <div key={di} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <p className="text-sm font-semibold">{d.hazard}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Frequency & Context</p>
                          <p className="text-sm text-muted-foreground">{d.freq}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">How to Prepare</p>
                          <p className="text-sm text-muted-foreground">{d.prep}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Evacuate or Shelter-in-Place?</p>
                          <p className="text-sm text-muted-foreground">{d.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>Related:</span>
        <a href="/preparedness" className="hover:underline text-foreground">Emergency Preparedness</a>
        <a href="/emergency" className="hover:underline text-foreground">Emergency Fund</a>
        <a href="/canada" className="hover:underline text-foreground">Canada Overview</a>
        <a href="/canada/infrastructure" className="hover:underline text-foreground">Canada Infrastructure</a>
      </div>
    </div>
  )
}
