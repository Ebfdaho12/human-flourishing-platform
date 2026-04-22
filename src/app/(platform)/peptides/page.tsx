"use client"

import { useState } from "react"
import { FlaskConical, Shield, AlertTriangle, ChevronDown, ChevronUp, Brain, Heart, Dna, Sparkles, Syringe, Scale, Sun, BookOpen, FileWarning } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Explain } from "@/components/ui/explain"
import { Source, SourceList } from "@/components/ui/source-citation"

/* ── data ──────────────────────────────────────────────────────────── */

interface Peptide {
  name: string; alias?: string; summary: string; mechanism: string
  research: string; protocol: string; sideEffects: string; status: string
}

const CATEGORIES: { id: string; title: string; icon: typeof Brain; color: string; borderColor: string; peptides: Peptide[] }[] = [
  { id: "healing", title: "Healing & Recovery", icon: Heart, color: "text-rose-600", borderColor: "border-rose-200", peptides: [
    { name: "BPC-157", alias: "Body Protection Compound", summary: "Gastric pentadecapeptide (15 amino acids) originally isolated from human gastric juice. Potent tissue-repair signaling across gut, tendon, ligament, muscle, and nerve injury models.", mechanism: "Upregulates VEGF (vascular endothelial growth factor) driving angiogenesis, modulates the NO (nitric oxide) system, enhances GH receptor expression, and activates GABAergic pathways. Reduces inflammatory cytokines TNF-α and IL-6 in injury models.", research: "544 articles reviewed (1993-2024): 35 preclinical studies + 1 clinical trial. Knee pain study (2024): 7 of 12 patients reported pain relief sustained >6 months. 2025 IV safety case report: 2 adults tolerated 20mg IV with zero adverse events reported. Extensive rodent data shows accelerated healing in gut ulcers, torn Achilles tendons, and muscle crush injuries.", protocol: "250-500 mcg subcutaneous injection 1-2x/day near injury site. Typical cycles: 4-6 weeks. Some use oral capsules for gut-specific healing.", sideEffects: "Minimal adverse events reported in available studies. Occasional injection-site redness. Long-term human safety data lacking.", status: "Returned to compounding pharmacy access Feb 2026 (RFK Jr. executive action). Not FDA-approved as a drug." },
    { name: "TB-500", alias: "Thymosin Beta-4", summary: "43-amino-acid polypeptide naturally produced by the thymus. Key role in tissue remodeling, wound healing, and blood vessel formation. Upregulates actin to promote cell migration to injury sites.", mechanism: "Sequesters G-actin monomers, promoting cytoskeletal reorganization and enabling cell migration. Upregulates anti-inflammatory cytokines. Promotes hair follicle stem cell migration in dermal wound models.", research: "Primarily preclinical data. Rodent cardiac injury models show reduced scar formation and improved ejection fraction. Equine studies (racehorses) show accelerated tendon healing. Human RCTs are extremely limited.", protocol: "Loading: 2.5-5 mg subcutaneous 2x/week for 4-6 weeks. Maintenance: 2.5-5 mg 1x/week. Often stacked with BPC-157.", sideEffects: "Head rush, lethargy, and temporary hypotension reported anecdotally. Theoretical concern about promoting growth in existing tumors.", status: "Returned to compounding access Feb 2026. Not FDA-approved." },
    { name: "GHK-Cu", alias: "Copper Peptide", summary: "Copper-binding tripeptide (Gly-His-Lys + Cu²⁺) naturally present in human plasma. Declines significantly with age — abundant at 20, reduced ~60% by age 60. Affects expression of approximately 4,000 human genes.", mechanism: "Resets gene expression patterns toward youthful profiles. Upregulates collagen I/III synthesis, decorin, and antioxidant enzymes (SOD, glutathione). Downregulates inflammatory NFκB signaling. Stimulates glycosaminoglycan synthesis in skin.", research: "Gene array studies (Pickart et al.) show broad gene-resetting effects across 4,000+ genes. Multiple dermatology studies confirm improved skin thickness, elasticity, and reduced fine lines with topical application. Injectable research is limited to animal models.", protocol: "Topical: 1-2% copper peptide serums (widely available, FDA-compliant cosmetics). Injectable: 1-2 mg/day subcutaneous (limited evidence base). Often cycled 2-4 weeks on, 2-4 weeks off.", sideEffects: "Topical is well-tolerated. Injectable: theoretical copper toxicity with excessive dosing. Skin irritation at injection site.", status: "FDA-approved topically as cosmetic ingredient. Injectable returned to compounding Feb 2026." },
  ]},
  { id: "gh", title: "Growth Hormone Secretagogues", icon: Dna, color: "text-blue-600", borderColor: "border-blue-200", peptides: [
    { name: "CJC-1295", alias: "GHRH Analog", summary: "Modified growth hormone-releasing hormone analog. The DAC (Drug Affinity Complex) version binds albumin for extended half-life of 6-8 days, producing sustained pulsatile GH release.", mechanism: "Binds GHRH receptors on anterior pituitary somatotrophs, amplifying natural GH pulse amplitude without disrupting pulsatile rhythm. The DAC modification prevents DPP-IV degradation.", research: "Published human study: dose-dependent sustained increases in GH and IGF-1 in healthy adults aged 21-61 (Teichman et al., JCEM 2006). 2-fold increase in mean GH levels. IGF-1 elevated for 6-14 days after single dose.", protocol: "CJC-1295 no-DAC: 100 mcg subcutaneous before bed (to align with natural GH pulse). With DAC: 2 mg 1x/week. Often combined with ipamorelin.", sideEffects: "Flushing, headache, dizziness, injection-site reactions. Water retention. Potential IGF-1-related growth concerns with chronic use.", status: "Not FDA-approved. Available through compounding pharmacies." },
    { name: "Ipamorelin", alias: "Selective GH Secretagogue", summary: "Pentapeptide ghrelin mimetic. The most selective GH secretagogue — stimulates GH release without significantly elevating cortisol, prolactin, or ACTH, unlike older secretagogues like GHRP-6.", mechanism: "Binds the ghrelin/GHS receptor (GHSR) on pituitary somatotrophs. Selectivity comes from minimal activation of non-GH pathways. Does not trigger appetite increase like other ghrelin mimetics.", research: "Phase II clinical trials showed dose-dependent GH release in healthy volunteers. Favorable side-effect profile vs GHRP-2/GHRP-6 in head-to-head comparisons. Used in post-surgical bowel recovery trials.", protocol: "200-300 mcg subcutaneous 1-3x/day (typically before bed and/or post-workout). Synergistic when combined with CJC-1295.", sideEffects: "Headache, lightheadedness. Minimal hunger increase (unlike GHRP-6). Water retention possible.", status: "Not FDA-approved. Available through compounding pharmacies." },
    { name: "Tesamorelin", alias: "Egrifta", summary: "Synthetic GHRH analog. The most well-studied GH-releasing peptide — FDA-approved for HIV-associated lipodystrophy (excess visceral abdominal fat).", mechanism: "Binds pituitary GHRH receptors, stimulating natural pulsatile GH release. Preserves hypothalamic-pituitary feedback loops. Reduces visceral adipose tissue (VAT) selectively.", research: "Multiple large Phase III RCTs (>800 patients). Reduced trunk fat by 18% over 26 weeks. Improved triglycerides and body composition without worsening glucose tolerance. OPTIMIZE trial confirmed sustained benefits at 12 months.", protocol: "2 mg subcutaneous once daily (FDA-approved dosing). Typically abdomen injection, rotating sites.", sideEffects: "Injection-site reactions (erythema, pruritus). Arthralgia, myalgia. Peripheral edema. Potential IGF-1 elevation above normal range in ~5% of patients.", status: "FDA-approved (Egrifta®) for HIV lipodystrophy. Prescribed off-label for body composition." },
    { name: "MK-677", alias: "Ibutamoren", summary: "Oral growth hormone secretagogue (technically a non-peptide small molecule, included for completeness). Increases GH and IGF-1 for a full 24 hours after a single dose.", mechanism: "Non-peptide ghrelin receptor agonist. Orally bioavailable. Mimics ghrelin signaling to sustainably elevate GH secretion without injections. Increases both GH pulse amplitude and frequency.", research: "Multiple published human trials. 2-year study in elderly: increased GH/IGF-1, increased fat-free mass, but no significant strength gains. Improved sleep quality (increased Stage IV sleep). Nass et al., JCEM 2008.", protocol: "10-25 mg orally once daily, typically before bed (to leverage natural GH pulse and manage appetite increase during sleep).", sideEffects: "Significant appetite increase. Water retention and bloating. Lethargy. Elevated fasting glucose and insulin resistance with chronic use. Concern: sustained IGF-1 elevation may promote cancer growth.", status: "Not FDA-approved. Investigational. Widely available as a 'research chemical.'" },
  ]},
  { id: "neuro", title: "Cognitive & Neuroprotective", icon: Brain, color: "text-violet-600", borderColor: "border-violet-200", peptides: [
    { name: "Semax", alias: "ACTH(4-10) Analog", summary: "Heptapeptide analog of ACTH fragment (4-10) with a Pro-Gly-Pro C-terminal extension for stability. Developed at the Institute of Molecular Genetics, Russian Academy of Sciences. Approved in Russia since 2011.", mechanism: "Increases BDNF (brain-derived neurotrophic factor) expression in hippocampus and cortex. Enhances dopaminergic and serotonergic neurotransmission. Modulates NGF and TrkB receptor signaling. Exhibits neuroprotective effects against oxidative stress.", research: "Russian clinical trials: improved cognitive recovery in ischemic stroke patients. Enhanced memory and attention in healthy volunteers (Eremin et al., 2004). Neuroprotective in rodent models of cerebral ischemia. Limited Western peer-reviewed data.", protocol: "Intranasal: 200-600 mcg/day, divided into 2-3 doses. Typical cycle: 10-20 days. N-Acetyl Semax Amidate variant has improved BBB penetration.", sideEffects: "Generally well-tolerated. Occasional nasal irritation. Hair shedding reported anecdotally (possibly via ACTH-melanocortin pathway).", status: "Approved in Russia/Ukraine for stroke, cognitive disorders, peptic ulcers. Not FDA-approved. Available through peptide suppliers." },
    { name: "Selank", alias: "Tuftsin Analog", summary: "Heptapeptide analog of the immunomodulatory peptide tuftsin, with added Gly-Pro for metabolic stability. Developed alongside Semax at the Russian Academy of Sciences. Anxiolytic and nootropic.", mechanism: "Modulates GABAergic neurotransmission (anxiolytic effect). Influences serotonin and dopamine metabolism. Stabilizes enkephalin degradation, prolonging endogenous opioid signaling. Also enhances IL-6 and affects T-helper cell balance.", research: "Russian clinical trials show anxiolytic effects comparable to benzodiazepines without sedation or dependence. Improved cognitive function under stress. Immunomodulatory effects confirmed in multiple Russian studies. Very limited Western clinical data.", protocol: "Intranasal: 250-500 mcg/day, divided into 2-3 doses. Typical cycle: 14-21 days. Can be combined with Semax.", sideEffects: "Fatigue in some users. Nasal irritation. Considered very well-tolerated in available literature.", status: "Approved in Russia as anxiolytic. Not FDA-approved." },
    { name: "Cerebrolysin", alias: "Porcine Brain Peptides", summary: "Enzymatic digest of porcine (pig) brain tissue yielding a mixture of low-molecular-weight neuropeptides and free amino acids. Used clinically in over 50 countries for neurological conditions.", mechanism: "Multimodal neurotrophic activity mimicking BDNF, NGF, and CNTF. Reduces amyloid-beta aggregation. Promotes neuronal sprouting, synaptic remodeling, and neurogenesis in damaged brain regions.", research: "Cochrane review (2013): evidence of benefit in acute ischemic stroke (modest). CASTA trial (n=1,070): improved neurological outcomes at 90 days. Multiple trials in vascular dementia and Alzheimer's show mixed but generally positive cognitive outcomes.", protocol: "IM or IV: 10-30 mL/day for 10-20 days. Hospital or clinical administration. Repeated courses every 3-6 months in chronic conditions.", sideEffects: "Dizziness, headache, injection-site pain. Rare: agitation, insomnia. Allergic reactions possible (porcine-derived).", status: "Not FDA-approved. Approved in Europe, Asia, and South America for stroke, TBI, and dementia." },
    { name: "Dihexa", alias: "Cognitive Research Peptide", summary: "Hexapeptide analog of angiotensin IV. Described as 10 million times more potent than BDNF at activating hepatocyte growth factor (HGF) receptor in animal models. Extremely experimental.", mechanism: "Binds HGF/c-Met receptor, driving synaptogenesis and dendritic spine formation. Crosses the blood-brain barrier. Promotes new synaptic connections in hippocampal neurons.", research: "Animal studies only (McCoy et al., 2013): restored cognitive function in scopolamine-impaired rats. Enhanced novel object recognition and spatial memory. Zero human clinical trials published.", protocol: "Oral or subcutaneous: 10-20 mg/day reported in anecdotal use. No established human dosing. Extremely limited safety data.", sideEffects: "Unknown in humans. Theoretical cancer risk — HGF/c-Met pathway is implicated in tumor growth and metastasis. Proceed with extreme caution.", status: "Research compound only. No regulatory approval anywhere. No human trials." },
  ]},
  { id: "immune", title: "Immune & Longevity", icon: Shield, color: "text-emerald-600", borderColor: "border-emerald-200", peptides: [
    { name: "Thymosin Alpha-1", alias: "Ta1 / Zadaxin", summary: "28-amino-acid peptide naturally produced by the thymus gland. Master immune regulator. Approved in 30+ countries for hepatitis B/C and as cancer immunotherapy adjunct.", mechanism: "Activates toll-like receptors (TLR2, TLR9) on dendritic cells. Enhances T-cell maturation, NK cell cytotoxicity, and MHC class I expression. Shifts Th1/Th2 balance toward Th1 (antiviral/antitumor) response.", research: "FDA Phase III trials for hepatitis B (improved viral clearance). Used adjunctively in hepatocellular carcinoma and melanoma (improved survival in Italian RCTs). COVID-19 retrospective studies showed reduced mortality in severe cases (2020-2021).", protocol: "1.6 mg subcutaneous 1-2x/week. Cancer protocols: daily dosing for initial loading. Cycles of 2-3 months.", sideEffects: "Generally well-tolerated. Injection-site discomfort. Rare: rash, fatigue. Theoretical autoimmune flare risk in predisposed individuals.", status: "Approved in 30+ countries (Zadaxin®). Returned to US compounding access Feb 2026. Not FDA-approved as a drug." },
    { name: "Epithalon", alias: "Epitalon", summary: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on epithalamin, a pineal gland extract studied by Prof. Vladimir Khavinson over 35+ years. The most-studied peptide in telomere biology.", mechanism: "Activates telomerase (hTERT) in somatic cells, enabling telomere elongation. Regulates melatonin production via pineal gland. Modulates gene expression related to aging and antioxidant defense.", research: "Khavinson et al.: 20-year follow-up in elderly patients showed 28% reduction in cardiovascular mortality. Cell studies confirm telomerase activation. Rodent lifespan studies show 13% mean lifespan extension. Criticism: most data from a single research group; limited independent replication.", protocol: "5-10 mg subcutaneous daily for 10-20 consecutive days. Repeat cycle every 4-6 months. Some use 3-5 mg intranasal as alternative.", sideEffects: "Minimal reported in available studies. Injection-site reactions. Theoretical concern: telomerase activation in pre-cancerous cells.", status: "Not approved in any country as a drug. Research peptide only." },
    { name: "KPV", alias: "Alpha-MSH Fragment", summary: "Tripeptide (Lys-Pro-Val) derived from the C-terminal end of alpha-melanocyte-stimulating hormone (α-MSH). Potent anti-inflammatory and antimicrobial properties without melanogenic effects.", mechanism: "Enters cells and inhibits NF-κB nuclear translocation (master inflammatory switch). Reduces TNF-α, IL-6, and IL-1β. Antimicrobial activity against Staphylococcus aureus and Candida albicans. Does not activate melanocortin receptors (no tanning).", research: "Preclinical: reduced colon inflammation in IBD mouse models by 50-70%. Accelerated wound healing with reduced scarring. Antimicrobial effects confirmed in vitro. No human clinical trials published.", protocol: "Oral: 200-500 mcg 1-2x/day (gut-targeted). Subcutaneous: 200-500 mcg/day. Topical for skin inflammation. Cycles of 4-8 weeks.", sideEffects: "Limited safety data. Generally considered well-tolerated in anecdotal reports. Headache, mild nausea reported.", status: "Not FDA-approved. Research peptide. Available through compounding pharmacies." },
  ]},
  { id: "sexual", title: "Sexual Health", icon: Sparkles, color: "text-pink-600", borderColor: "border-pink-200", peptides: [
    { name: "PT-141", alias: "Bremelanotide / Vyleesi", summary: "Cyclic heptapeptide melanocortin receptor agonist. The only FDA-approved peptide for hypoactive sexual desire disorder (HSDD) in premenopausal women. Works centrally in the brain, not peripherally.", mechanism: "Activates melanocortin-4 receptors (MC4R) in the hypothalamus, modulating neural pathways involved in sexual arousal and desire. Unlike PDE5 inhibitors (Viagra), it affects desire/motivation rather than blood flow mechanics.", research: "RECONNECT Phase III trials (n=1,267): statistically significant increase in satisfying sexual events and sexual desire vs placebo. ~25% of patients reported meaningful improvement (vs 17% placebo). FDA-approved 2019.", protocol: "1.75 mg subcutaneous injection (auto-injector) 45+ minutes before anticipated activity. Maximum 1 dose per 24 hours, ≤8 doses per month.", sideEffects: "Nausea (40% of patients — most common reason for discontinuation). Flushing, headache. Transient hypertension. Skin hyperpigmentation with repeated use. NOT for patients with uncontrolled hypertension or CVD.", status: "FDA-approved (Vyleesi®) for premenopausal HSDD. Prescription required." },
  ]},
  { id: "metabolic", title: "Weight & Metabolic", icon: Scale, color: "text-amber-600", borderColor: "border-amber-200", peptides: [
    { name: "AOD-9604", alias: "GH Fragment 176-191", summary: "Modified fragment of human growth hormone (amino acids 176-191). Developed specifically for anti-obesity effects — stimulates lipolysis and inhibits lipogenesis without the diabetogenic or growth-promoting effects of full GH.", mechanism: "Mimics the lipolytic region of GH without binding the GH receptor. Stimulates beta-3 adrenergic receptor-mediated fat breakdown. Does not increase IGF-1 or cause insulin resistance.", research: "Phase IIb human trial (n=300+): modest reduction in body fat vs placebo over 12 weeks. Failed to meet primary endpoints for FDA approval as an obesity drug. Australian TGA approved it as a food supplement category. Limited efficacy data.", protocol: "250-500 mcg subcutaneous daily, typically morning fasted. Cycles of 8-12 weeks. Sometimes combined with CJC-1295/Ipamorelin.", sideEffects: "Headache, injection-site reactions. Generally well-tolerated. Theoretical concern: unknown long-term effects of chronic GH fragment administration.", status: "Returned to US compounding access Feb 2026. TGA (Australia) listed. Not FDA-approved." },
    { name: "GLP-1 Agonists", alias: "Semaglutide / Tirzepatide", summary: "Not traditional 'research peptides' but the most studied and impactful peptides in modern medicine. Semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro/Zepbound) have transformed obesity and diabetes treatment globally.", mechanism: "Semaglutide: GLP-1 receptor agonist — mimics incretin hormone to enhance insulin secretion, suppress glucagon, slow gastric emptying, and reduce appetite centrally. Tirzepatide: dual GIP/GLP-1 agonist with enhanced efficacy.", research: "STEP trials (semaglutide): 15-17% body weight loss over 68 weeks. SURMOUNT trials (tirzepatide): up to 22.5% weight loss. SELECT trial: 20% cardiovascular event reduction. Largest peptide evidence base in history — thousands of patients across dozens of RCTs.", protocol: "Semaglutide: 0.25 mg weekly titrated to 2.4 mg weekly (SubQ). Tirzepatide: 2.5 mg weekly titrated to 15 mg weekly. Prescription medical supervision required.", sideEffects: "Nausea, vomiting, diarrhea (GI side effects in 30-50%). Pancreatitis risk. Gallbladder disease. Muscle mass loss concern. Thyroid C-cell tumor signal in rodents (boxed warning). Rebound weight gain upon cessation.", status: "FDA-approved. Prescription only. Covered by many insurance plans for diabetes; weight loss coverage varies." },
  ]},
  { id: "cosmetic", title: "Skin & Cosmetic", icon: Sun, color: "text-orange-600", borderColor: "border-orange-200", peptides: [
    { name: "Melanotan II", alias: "MT-II", summary: "Synthetic analog of alpha-melanocyte-stimulating hormone (α-MSH). Produces skin darkening (tanning) without UV exposure. Also affects sexual arousal (led to PT-141 development). Widely used recreationally despite significant safety concerns.", mechanism: "Non-selective melanocortin receptor agonist (MC1R through MC5R). MC1R activation stimulates melanocytes to produce eumelanin (dark pigment). MC4R activation causes sexual arousal effects. MC3R activation affects appetite.", research: "Early clinical trials at University of Arizona confirmed dose-dependent tanning. Abandoned for pharmaceutical development due to non-selectivity and side effects. Ongoing concern: may promote growth or obscure detection of melanoma by darkening moles.", protocol: "Loading: 250-500 mcg subcutaneous daily for 2-3 weeks. Maintenance: 250-500 mcg 1-2x/week. UV exposure synergizes with effect.", sideEffects: "Nausea (common, especially initially). Facial flushing. Mole darkening and new mole development (melanoma screening concern). Spontaneous erections. Appetite suppression. Potential melanoma promotion — this is the primary safety concern.", status: "NOT FDA-approved. Banned in many countries. Available illegally online. Multiple regulatory warnings issued (TGA, EMA, FDA)." },
  ]},
]

/* ── component ─────────────────────────────────────────────────────── */

function PeptideCard({ p }: { p: Peptide }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded-lg p-3 space-y-2 bg-white/60">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left gap-2">
        <div>
          <span className="font-semibold text-sm">{p.name}</span>
          {p.alias && <span className="text-xs text-muted-foreground ml-2">({p.alias})</span>}
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.summary}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-2 pt-2 border-t text-xs leading-relaxed">
          <div><Badge variant="outline" className="text-[10px] mr-1">Mechanism</Badge><span className="text-muted-foreground">{p.mechanism}</span></div>
          <div><Badge variant="outline" className="text-[10px] mr-1 border-blue-300 text-blue-700">Research</Badge><span className="text-muted-foreground">{p.research}</span></div>
          <div><Badge variant="outline" className="text-[10px] mr-1 border-emerald-300 text-emerald-700">Protocol</Badge><span className="text-muted-foreground">{p.protocol}</span></div>
          <div><Badge variant="outline" className="text-[10px] mr-1 border-amber-300 text-amber-700">Side Effects</Badge><span className="text-muted-foreground">{p.sideEffects}</span></div>
          <div><Badge variant="outline" className="text-[10px] mr-1 border-violet-300 text-violet-700">Status</Badge><span className="text-muted-foreground">{p.status}</span></div>
        </div>
      )}
    </div>
  )
}

function CategorySection({ cat }: { cat: typeof CATEGORIES[number] }) {
  const [open, setOpen] = useState(false)
  const Icon = cat.icon
  return (
    <Card className={cn("border", cat.borderColor)}>
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Icon className={cn("h-4 w-4", cat.color)} />{cat.title}<Badge variant="secondary" className="text-[10px]">{cat.peptides.length}</Badge></span>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="space-y-3 pt-0">
          {cat.peptides.map(p => <PeptideCard key={p.name} p={p} />)}
        </CardContent>
      )}
    </Card>
  )
}

/* ── page ───────────────────────────────────────────────────────────── */

export default function PeptidesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-400">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Peptides: The Complete Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">Signaling molecules that regulate healing, cognition, immunity, metabolism, and more — every claim linked to its evidence.</p>
      </div>

      {/* Philosophy */}
      <Card className="border-2 border-violet-200 bg-violet-50/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Our philosophy:</strong> We present the research. We present the risks. We don&apos;t sell peptides and we don&apos;t recommend specific protocols. The information below is compiled from published literature, clinical trials, and regulatory filings for educational purposes. <strong>Consult a licensed physician before using any peptide.</strong>
          </p>
        </CardContent>
      </Card>

      {/* What are peptides */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-violet-600" />What Are Peptides?</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            <Explain tip="Amino acids are the building blocks of protein — like letters that spell out biological instructions">Peptides</Explain> are short chains of <strong>2 to 50 amino acids</strong> linked by peptide bonds — smaller than proteins (which have 50+), but large enough to carry precise biological instructions. Your body already produces thousands of them: insulin is a peptide, oxytocin is a peptide, and the endorphins that reduce pain are peptides.
          </p>
          <p>
            They act as <Explain tip="Like a text message between cells — a peptide tells one cell what another cell needs it to do">signaling molecules</Explain>, binding to specific receptors on cell surfaces to trigger cascading biological effects: tissue repair, immune modulation, neurotransmitter release, hormone secretion, and gene expression changes. Exogenous peptides (those taken from outside the body) attempt to amplify or mimic these natural signals.
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Syringe className="h-4 w-4 text-violet-600" />Peptide Categories & Profiles</h2>
        <p className="text-xs text-muted-foreground -mt-2">Click any category to expand. Each peptide includes mechanism, research, protocols, side effects, and regulatory status.</p>
        {CATEGORIES.map(cat => <CategorySection key={cat.id} cat={cat} />)}
      </div>

      {/* Regulatory Landscape */}
      <Card className="border-2 border-amber-200 bg-amber-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-amber-600" />Regulatory Landscape</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p><strong>2023 — FDA crackdown:</strong> The FDA added dozens of peptides to the &quot;category 2&quot; bulk substances list, effectively banning compounding pharmacies from producing them. BPC-157, thymosin alpha-1, AOD-9604, and many others became unavailable through legal compounding.</p>
          <p><strong>February 2026 — RFK Jr. reversal:</strong> Under HHS Secretary Robert F. Kennedy Jr., 14 peptides were returned to compounding pharmacy access, including BPC-157, thymosin alpha-1, GHK-Cu, AOD-9604, and others. This does <em>not</em> make them FDA-approved drugs — it means licensed compounding pharmacies can again produce them with a physician&apos;s prescription.</p>
          <p><strong>Key distinctions:</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li><strong>FDA-approved peptides</strong> (e.g., tesamorelin, PT-141, semaglutide): prescribed normally, covered by insurance, full clinical trial data.</li>
            <li><strong>Compounding-legal peptides</strong> (e.g., BPC-157, Ta1): require a prescription, produced by 503A/503B pharmacies, variable but regulated quality.</li>
            <li><strong>Research chemicals</strong> (e.g., epithalon, dihexa): sold &quot;for research purposes only,&quot; no prescription required, unregulated quality and purity — highest risk category.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card className="border-2 border-red-300 bg-red-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" />Critical Safety Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p><strong className="text-red-700">Contamination risk:</strong> Peptides from unregulated sources (online &quot;research chemical&quot; vendors) may contain heavy metals, endotoxins, incorrect dosing, or wrong compounds entirely. Third-party testing (COA with HPLC/MS data) is essential but not always reliable.</p>
          <p><strong className="text-red-700">Injection technique matters:</strong> Subcutaneous injections require sterile technique — bacteriostatic water for reconstitution, alcohol swabs, insulin syringes, proper storage (refrigerated, light-protected). Infections from poor technique are a real and documented risk.</p>
          <p><strong className="text-red-700">Cancer risk with GH-related peptides:</strong> Any peptide that raises IGF-1 (CJC-1295, ipamorelin, MK-677, tesamorelin) carries theoretical risk of accelerating pre-existing cancers. IGF-1 is a growth signal — it does not distinguish between healthy and cancerous cells. Baseline and periodic cancer screening is prudent.</p>
          <p><strong className="text-red-700">Drug interactions:</strong> Peptides can interact with blood thinners (BPC-157 affects NO system), immunosuppressants (thymosin alpha-1), diabetes medications (GLP-1 agonists, MK-677), and blood pressure medications (PT-141). Disclose all peptide use to your physician.</p>
          <p><strong className="text-red-700">Blood work:</strong> Before starting any peptide protocol: comprehensive metabolic panel, CBC, IGF-1, fasting insulin, fasting glucose, liver enzymes, and cancer markers appropriate for age/sex. Repeat at 6-8 week intervals during use.</p>
          <p><strong>Never self-prescribe.</strong> Work with a physician who understands peptide therapy.</p>
        </CardContent>
      </Card>

      {/* Research Quality Disclaimer */}
      <Card className="border border-zinc-300 bg-zinc-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><FileWarning className="h-4 w-4 text-zinc-600" />Research Quality Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>The vast majority of peptide research is <strong>preclinical</strong> — conducted in cell cultures or animal models. Only a handful of peptides listed here have undergone large-scale, randomized, placebo-controlled human trials (semaglutide, tirzepatide, tesamorelin, PT-141, thymosin alpha-1).</p>
          <p>For most peptides, the evidence hierarchy looks like: <em>in vitro studies → rodent/animal models → small open-label human studies → anecdotal reports</em>. This is not nothing, but it is far from the standard required for medical certainty.</p>
          <p><strong>Absence of evidence is not evidence of absence</strong> — but it is also not evidence of efficacy. A peptide that heals rat tendons may do nothing in humans, or may do something entirely different. We report what exists; we do not extrapolate beyond it.</p>
        </CardContent>
      </Card>

      {/* Sources */}
      <SourceList sources={[
        { id: 1, title: "Emerging Use of BPC-157 in Orthopaedic Sports Medicine", authors: "Vasireddi N, et al.", journal: "OJSM Systematic Review", year: 2025, type: "review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12313605/", notes: "544 articles reviewed (1993-2024). 35 preclinical + 1 clinical study." },
        { id: 2, title: "Safety of Intravenous Infusion of BPC157 in Humans: A Pilot Study", authors: "Lee J, Burgess A", journal: "PubMed", year: 2025, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/40131143/", notes: "2 adults tolerated IV BPC-157 up to 20mg with no adverse events." },
        { id: 3, title: "Prolonged stimulation of GH and IGF-I by CJC-1295", authors: "Teichman SL, et al.", journal: "JCEM", year: 2006, type: "study", url: "https://pubmed.ncbi.nlm.nih.gov/16352683/", notes: "Sustained dose-dependent GH/IGF-1 increases in healthy adults." },
        { id: 4, title: "Therapeutic peptides in gerontology: mechanisms for healthy aging", authors: "Multiple", journal: "Frontiers in Aging", year: 2026, type: "review", url: "https://www.frontiersin.org/journals/aging/articles/10.3389/fragi.2026.1790247/full", notes: "Comprehensive review of peptides for longevity and healthspan." },
      ]} />
    </div>
  )
}
