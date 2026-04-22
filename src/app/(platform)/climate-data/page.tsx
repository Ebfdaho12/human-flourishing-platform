"use client"

import { useState } from "react"
import { Globe, ThermometerSun, Droplets, Factory, DollarSign, FlaskConical, AlertTriangle, Scale, ChevronDown, ChevronUp, Users, BookOpen, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Explain } from "@/components/ui/explain"
import { cn } from "@/lib/utils"

function Collapsible({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
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

export default function ClimateDataPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-teal-700">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Climate Data & Analysis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          All the data. Both sides. Who funds whom. You decide what it means.
        </p>
      </div>

      <Card className="border-2 border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Our approach:</strong> This page does not tell you what to believe about climate. It presents
            the raw data, the key arguments from both sides, the funding sources behind the research, and the
            methodology quality of the studies. The platform's job is to make you <strong>more informed</strong>,
            not more ideological. Follow the data. Follow the money. Think for yourself.
          </p>
        </CardContent>
      </Card>

      {/* The Raw Data */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ThermometerSun className="h-4 w-4 text-red-500" /> The Raw Data (What Is Not Disputed)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">These data points are measured, not modeled. Both sides of the debate accept these numbers.</p>
          {[
            { metric: "CO₂ levels", data: "Pre-industrial: ~280 ppm. Current (2026): ~425 ppm. Source: Mauna Loa Observatory (continuous since 1958), ice core records (800,000+ years). The rise correlates with industrialization.", source: "NOAA / Scripps" },
            { metric: "Global avg temperature", data: "~1.1-1.3°C warmer than pre-industrial baseline (1850-1900). Each of the last 4 decades has been warmer than the previous. 2023-2025 were the warmest years on record.", source: "NASA GISS, HadCRUT, Berkeley Earth, NOAA" },
            { metric: "Sea level", data: "~21-24 cm rise since 1880. Rate accelerating: 1.4mm/yr (1900-1990) → 3.6mm/yr (2006-2015). Satellite altimetry since 1993.", source: "NASA, CSIRO, Church & White" },
            { metric: "Arctic sea ice", data: "September minimum extent declining ~13% per decade since 1979 (satellite era). 2012 lowest on record. Antarctic more complex — East gaining, West losing.", source: "NSIDC satellite data" },
            { metric: "Ocean pH", data: "Decreased from ~8.2 to ~8.1 since pre-industrial (30% increase in acidity). CO₂ dissolves in seawater forming carbonic acid. Rate of change unprecedented in 300 million years of geological record.", source: "NOAA, multiple ocean monitoring stations" },
            { metric: "Glacier mass", data: "Global glacier mass loss accelerating. ~267 Gt/yr lost (2000-2019). Retreat documented on every continent. Some tropical glaciers (Kilimanjaro, Andes) may disappear by 2050.", source: "WGMS, GRACE satellite" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">{item.metric}</p>
                <Badge variant="outline" className="text-[8px]">{item.source}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{item.data}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Side A: Consensus Position */}
      <Collapsible title="Position A: Anthropogenic Climate Change (Scientific Consensus)" icon={FlaskConical} color="text-blue-500">
        <p className="text-xs text-muted-foreground mb-2">Held by: IPCC, 97% of publishing climate scientists (Cook et al. 2013, Lynas et al. 2021 — 99.85% of 88,125 studies), NASA, NOAA, every national science academy.</p>
        <div className="space-y-2">
          {[
            { claim: "Human CO₂ emissions are the primary driver of warming", evidence: "Isotopic signature of atmospheric CO₂ matches fossil fuel origin (depleted in C-13). Natural sources (volcanoes: ~0.3 Gt CO₂/yr) are dwarfed by human emissions (~37 Gt CO₂/yr). The timing and rate match industrialization." },
            { claim: "Climate sensitivity is 2.5-4°C per doubling of CO₂", evidence: "IPCC AR6 (2021): likely range 2.5-4°C, best estimate 3°C. Based on paleoclimate data, radiative forcing calculations, and multiple model ensembles. Narrower range than previous reports." },
            { claim: "Continued emissions will cause severe impacts", evidence: "Sea level rise 0.3-1.0m by 2100 (depending on emissions), more extreme weather events, crop yield changes, ocean acidification threatening marine ecosystems, species extinction acceleration." },
            { claim: "The window for action is narrowing", evidence: "IPCC carbon budget: ~500 Gt CO₂ remaining for 50% chance of staying under 1.5°C. At current rates (~37 Gt/yr), this budget is exhausted by ~2040." },
          ].map((item, i) => (
            <div key={i} className="rounded bg-blue-50 border border-blue-200 p-2.5">
              <p className="text-[10px] font-semibold text-blue-800">{item.claim}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.evidence}</p>
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Side B: Skeptic/Dissenting Position */}
      <Collapsible title="Position B: Climate Skepticism / Dissent" icon={Scale} color="text-amber-500">
        <p className="text-xs text-muted-foreground mb-2">Held by: a minority of scientists, some independent researchers, certain think tanks. Arguments range from questioning severity to questioning causation.</p>
        <div className="space-y-2">
          {[
            { claim: "Climate sensitivity is lower than IPCC estimates", evidence: "Some researchers (Lindzen, Spencer, Curry) argue sensitivity is 1-2°C, not 3°C. Lewis & Curry (2018): 1.5-2.2°C range using observational energy balance methods. Lower sensitivity = less severe outcomes." },
            { claim: "Natural variability is underestimated", evidence: "Solar cycles, ocean oscillations (PDO, AMO, ENSO), volcanic activity, cosmic ray flux. The Medieval Warm Period and Little Ice Age occurred without industrial CO₂. Some argue current warming is within natural variation range." },
            { claim: "Models overpredict warming", evidence: "Some earlier models (CMIP5) projected more warming than observed. The 'hot model' problem — some CMIP6 models show unrealistically high sensitivity. Tropospheric hot spot predicted by models has been elusive in observations." },
            { claim: "CO₂ has benefits (greening, crop yields)", evidence: "Satellite data shows 15-30% increase in global leaf area (1982-2015). CO₂ fertilization increases crop yields in controlled conditions. Moderate warming extends growing seasons in northern latitudes." },
            { claim: "Economic costs of mitigation exceed adaptation", evidence: "Lomborg, Nordhaus (Nobel 2018): aggressive decarbonization costs may exceed damages in some economic models. Developing nations need cheap energy for poverty reduction. Net-zero by 2050 costs $50-100+ trillion globally." },
          ].map((item, i) => (
            <div key={i} className="rounded bg-amber-50 border border-amber-200 p-2.5">
              <p className="text-[10px] font-semibold text-amber-800">{item.claim}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.evidence}</p>
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Follow the Money */}
      <Card className="border-2 border-red-200">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-red-500" /> Follow the Money (Both Sides)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Every claim should be evaluated alongside its funding source.</strong> This applies to BOTH sides. Financial incentives can bias research in any direction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50/20 p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">Consensus Side Funding</p>
              <div className="space-y-1 text-[10px] text-muted-foreground">
                <p>• <strong>Government grants</strong>: NOAA, NASA, NSF, DOE — tens of billions globally. Grant funding can create incentive to find significant results.</p>
                <p>• <strong>Green energy industry</strong>: Solar, wind, EV companies benefit from climate policy. Lobbying: ~$500M+ annually in the US.</p>
                <p>• <strong>Carbon credit markets</strong>: $850B+ market that exists because of climate policy.</p>
                <p>• <strong>NGOs</strong>: Greenpeace, Sierra Club, WWF — fundraising tied to climate urgency.</p>
                <p>• <strong>ESG investment</strong>: $35+ trillion in ESG assets under management.</p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/20 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">Skeptic Side Funding</p>
              <div className="space-y-1 text-[10px] text-muted-foreground">
                <p>• <strong>Fossil fuel industry</strong>: ExxonMobil, Koch Industries, Peabody Energy — documented funding of skeptic think tanks and researchers.</p>
                <p>• <strong>Think tanks</strong>: Heartland Institute, GWPF, Cato Institute, CEI — receive fossil fuel industry donations.</p>
                <p>• <strong>Exxon internal research</strong>: Internal documents (1977-2003) show Exxon scientists accurately predicted warming while public messaging cast doubt.</p>
                <p>• <strong>Dark money networks</strong>: Donors Trust, DonorsTrust — anonymous funding to climate-skeptic organizations.</p>
                <p>• <strong>Political interests</strong>: Nations dependent on fossil fuel exports (Saudi Arabia, Russia) have geopolitical incentives.</p>
              </div>
            </div>
          </div>

          <Card className="border-red-300 bg-red-50/20">
            <CardContent className="p-3">
              <p className="text-[10px] text-red-800 font-medium">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                The existence of funding does not automatically invalidate research. But it SHOULD make you look harder at the methodology, sample sizes, and whether the conclusions go beyond what the data supports. Apply the <a href="/scientific-literacy" className="text-teal-600 hover:underline">scientific literacy</a> framework to ALL claims from ALL sides.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Key Scientists — Both Sides */}
      <Collapsible title="Key Scientists & Researchers (Both Sides)" icon={Users} color="text-violet-500">
        <p className="text-xs text-muted-foreground mb-2">Notable researchers, their positions, and their affiliations/funding. Check Aletheia for deeper profiles.</p>
        <div className="space-y-1.5">
          {[
            { name: "Michael Mann", position: "Consensus", affiliation: "UPenn", known: "Hockey stick graph (MBH98). Central to IPCC AR3. Funded by: NSF, NOAA, DOE grants.", note: "Graph methodology debated (McIntyre & McKitrick critique), but overall conclusion replicated by multiple independent reconstructions." },
            { name: "James Hansen", position: "Consensus", affiliation: "Columbia (formerly NASA GISS)", known: "1988 Congressional testimony that brought climate change to public attention. Predicted warming trends that proved accurate.", note: "Activist as well as scientist. Some argue this blurs objectivity. His early predictions track reality well." },
            { name: "Judith Curry", position: "Skeptic-leaning", affiliation: "Georgia Tech (emeritus)", known: "Former IPCC contributor. Now argues uncertainty is underestimated, models overpredict. Runs Climate Etc. blog.", note: "Published in mainstream journals. Argues she was pushed out for questioning consensus, not for bad science." },
            { name: "Richard Lindzen", position: "Skeptic", affiliation: "MIT (emeritus)", known: "Iris hypothesis (negative cloud feedback). Argues climate sensitivity is ~1°C. Published extensively in peer-reviewed literature.", note: "Acknowledged receiving fossil fuel industry consulting fees. His iris hypothesis has not been confirmed by observations." },
            { name: "Roy Spencer", position: "Skeptic", affiliation: "UAH (Alabama)", known: "UAH satellite temperature dataset. Argues most warming is natural (PDO, internal variability).", note: "UAH dataset shows less warming than surface records. Signed Cornwall Alliance declaration (religious statement on environment)." },
            { name: "Bjorn Lomborg", position: "Lukewarmer", affiliation: "Copenhagen Consensus", known: "Accepts warming is real and human-caused, but argues mitigation costs exceed benefits. Advocates adaptation + innovation.", note: "Funded by government and private donors. Criticized for cherry-picking economic data. Not a climate scientist (political scientist)." },
            { name: "Katharine Hayhoe", position: "Consensus", affiliation: "Texas Tech", known: "Climate communication expert. Evangelical Christian who advocates for climate action. IPCC contributor.", note: "Bridging science and faith communities. Funded by NSF, USAID." },
            { name: "Willie Soon", position: "Skeptic", affiliation: "Harvard-Smithsonian (affiliated)", known: "Solar variability as primary driver. Published in multiple journals.", note: "Received $1.2M from fossil fuel industry (2001-2012, per Greenpeace FOI documents). Journals retracted some papers." },
          ].map((s, i) => (
            <div key={i} className={cn("rounded-lg border p-2.5", s.position === "Consensus" ? "border-blue-200" : s.position === "Skeptic" ? "border-amber-200" : "border-violet-200")}>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] font-semibold">{s.name}</p>
                <Badge variant="outline" className={cn("text-[8px]",
                  s.position === "Consensus" ? "border-blue-300 text-blue-700" :
                  s.position === "Skeptic" ? "border-amber-300 text-amber-700" :
                  "border-violet-300 text-violet-700"
                )}>{s.position}</Badge>
                <span className="text-[8px] text-muted-foreground">{s.affiliation}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{s.known}</p>
              <p className="text-[9px] text-muted-foreground/70 mt-0.5 italic">{s.note}</p>
            </div>
          ))}
        </div>
      </Collapsible>

      {/* What You Can Do With This */}
      <Collapsible title="Methodology: How to Evaluate Climate Claims" icon={BookOpen} color="text-teal-500">
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <p><strong>1. Check the source data.</strong> Is the claim based on direct measurement (thermometers, satellites, ice cores) or model projections? Measurements are stronger evidence than models.</p>
          <p><strong>2. Check sample size and timeframe.</strong> A cold week doesn't disprove warming. A warm year doesn't prove catastrophe. Climate is 30-year averages. Weather is daily.</p>
          <p><strong>3. Check who funded the research.</strong> Both government grants and industry money can create bias. Look for replication by independently funded groups.</p>
          <p><strong>4. Check if the conclusion matches the data.</strong> "CO₂ has risen 50%" is data. "We're all going to die" is interpretation. Separate fact from extrapolation.</p>
          <p><strong>5. Look for what BOTH sides agree on.</strong> Almost everyone agrees CO₂ has risen, temperatures have increased, and humans contribute. The debate is about HOW MUCH, HOW FAST, and WHAT TO DO.</p>
          <p><strong>6. Be suspicious of certainty.</strong> Anyone who says "the science is settled" or "it's all a hoax" is selling you something. Complex systems resist simple answers.</p>
          <p><strong>7. Apply the <a href="/scientific-literacy" className="text-teal-600 hover:underline">scientific literacy</a> framework.</strong> P-values, confidence intervals, replication, conflicts of interest — use the same tools for climate that you use for health claims.</p>
        </div>
      </Collapsible>

      {/* Historical context */}
      <Collapsible title="Historical Climate Context" icon={Globe} color="text-green-600">
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <p><strong>Ice ages and interglacials:</strong> Earth has cycled between ice ages (~80,000 yr) and warm interglacials (~10,000 yr) for millions of years, driven by Milankovitch orbital cycles. We are currently in an interglacial (Holocene, ~11,700 years).</p>
          <p><strong>CO₂ and temperature in the ice record:</strong> Over 800,000 years, CO₂ and temperature track closely. Historically, temperature led CO₂ by ~800 years (orbital forcing warms oceans → release CO₂). Current CO₂ rise leads temperature — this is the opposite direction, driven by emissions.</p>
          <p><strong>Paleocene-Eocene Thermal Maximum (56 Ma):</strong> ~5°C warming over ~20,000 years, likely from volcanic CO₂. Mass ocean acidification, species shifts. Current CO₂ rise rate is ~10x faster.</p>
          <p><strong>Medieval Warm Period (900-1300 AD):</strong> Regional warming, especially North Atlantic. Global extent debated. Wine production in England, Viking Greenland settlement. Temperatures likely below current levels globally.</p>
          <p><strong>Little Ice Age (1300-1850):</strong> Cooler period. Thames froze, glaciers advanced. Causes: reduced solar activity (Maunder Minimum), volcanic eruptions, possibly ocean circulation changes.</p>
          <p><strong>Key context:</strong> Earth's climate has always changed. The question is whether current changes are within natural bounds or unprecedented in rate, and whether the cause is primarily human activity.</p>
        </div>
      </Collapsible>

      {/* The nuanced position */}
      <Card className="border-violet-200 bg-violet-50/20">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-violet-900 mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> The Platform's Position (No Position)</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We do not have a position on climate. We have data. The temperature record, CO₂ measurements, ice core data,
            and sea level observations are physical measurements — they are what they are. The interpretation of that data
            — how sensitive the climate is, what will happen in 50 years, and what policies should follow — involves models,
            assumptions, and value judgments that reasonable people can disagree on.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            What we DO believe: <strong>follow the money on both sides</strong>, <strong>evaluate methodology not headlines</strong>,
            and <strong>be deeply suspicious of anyone who tells you the answer is simple</strong>. Complex systems — climate,
            economics, human health — resist simple narratives. The truth is usually more nuanced than either side admits.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <a href="/scientific-literacy" className="text-sm text-teal-600 hover:underline">Scientific Literacy</a>
        <a href="/canada/energy" className="text-sm text-blue-600 hover:underline">Canada Energy</a>
        <a href="/mental-models" className="text-sm text-amber-600 hover:underline">Mental Models</a>
        <a href="/cognitive-biases" className="text-sm text-red-600 hover:underline">Cognitive Biases</a>
        <a href="/hive-mind" className="text-sm text-violet-600 hover:underline">Hive Mind</a>
      </div>
    </div>
  )
}
