import {
  ShieldCheck,
  Heart,
  GraduationCap,
  Landmark,
  Zap,
  FlaskConical,
  TrendingUp,
  Building2,
  Brain,
  type LucideIcon,
} from "lucide-react"

export type ModuleStatus = "ACTIVE" | "COMING_SOON"

export type ModuleMeta = {
  id: string
  title: string
  slug: string
  status: ModuleStatus
  icon: LucideIcon
  description: string
  tagline: string
  capabilities: string[]
  color: string
  estimatedLaunch?: string
}

export const MODULES: ModuleMeta[] = [
  {
    id: "FOUNDATION",
    title: "Foundation Protocol",
    slug: "foundation",
    status: "ACTIVE",
    icon: ShieldCheck,
    description: "Your identity, wallet, and the sovereignty layer that powers everything else.",
    tagline: "Own your identity. Own your data.",
    capabilities: [
      "ZK-proof-based self-sovereign identity",
      "FOUND + VOICE token wallet",
      "Merkle-tree credential structure",
      "Privacy-preserving claim proofs",
    ],
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "HEALTH",
    title: "Health Intelligence",
    slug: "health",
    status: "ACTIVE",
    icon: Heart,
    description: "AI-powered health insights that stay private on your device.",
    tagline: "Your health data belongs to you.",
    capabilities: [
      "Longitudinal health trend modeling",
      "Metabolic health scoring",
      "Wearable device integration",
      "ZK-proof health milestone rewards",
    ],
    color: "from-rose-500 to-red-600",
  },
  {
    id: "EDUCATION",
    title: "Education Intelligence",
    slug: "education",
    status: "ACTIVE",
    icon: GraduationCap,
    description: "Adaptive AI tutoring that works offline for every learner on Earth.",
    tagline: "Learning that meets you where you are.",
    capabilities: [
      "Socratic AI tutoring engine",
      "Offline-first — works without internet",
      "Neurodivergent learning optimization",
      "Mastery-based credential proofs",
    ],
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "GOVERNANCE",
    title: "Governance Transparency",
    slug: "governance",
    status: "ACTIVE",
    icon: Landmark,
    description: "Neutral, tamper-proof public records and civic intelligence.",
    tagline: "Radical transparency. Zero capture.",
    capabilities: [
      "AI-neutral political record analysis",
      "Immutable legislative vote tracking",
      "ZK-private civic engagement rewards",
      "Anti-capture architecture by design",
    ],
    color: "from-amber-500 to-orange-600",
    estimatedLaunch: "Q4 2026",
  },
  {
    id: "ENERGY",
    title: "Decentralized Energy Grid",
    slug: "energy",
    status: "ACTIVE",
    icon: Zap,
    description: "P2P energy trading and grid management from village to city.",
    tagline: "Energy sovereignty for every community.",
    capabilities: [
      "Peer-to-peer energy trading",
      "Hardware nodes from $15",
      "Offline-first grid control",
      "Token rewards for energy production",
    ],
    color: "from-yellow-500 to-amber-600",
    estimatedLaunch: "Q1 2027",
  },
  {
    id: "DESCI",
    title: "DeSci Platform",
    slug: "desci",
    status: "ACTIVE",
    icon: FlaskConical,
    description: "Restructuring science to reward truth, not impressive-sounding results.",
    tagline: "Fix science. Fund truth.",
    capabilities: [
      "Pre-registration commitment system",
      "Replication market incentives",
      "Immutable research data archive",
      "Peer review token economy",
    ],
    color: "from-teal-500 to-green-600",
    estimatedLaunch: "Q4 2026",
  },
  {
    id: "ECONOMICS",
    title: "Economic Blueprint",
    slug: "economics",
    status: "ACTIVE",
    icon: TrendingUp,
    description: "Evidence-based development ROI for every region on Earth.",
    tagline: "Ruthless prioritization. Not ideology.",
    capabilities: [
      "Lomborg Copenhagen Consensus ROI engine",
      "Regional baseline assessment",
      "Corruption-adjusted intervention scoring",
      "20-year lifecycle cost modeling",
    ],
    color: "from-emerald-500 to-teal-600",
    estimatedLaunch: "Q2 2027",
  },
  {
    id: "INFRASTRUCTURE",
    title: "Infrastructure Intelligence",
    slug: "infrastructure",
    status: "ACTIVE",
    icon: Building2,
    description: "Proving that quality infrastructure is the cheapest option.",
    tagline: "Build it right. Build it once.",
    capabilities: [
      "Total lifecycle cost modeling",
      "Climate-adapted material specifications",
      "Construction quality verification",
      "Deferred maintenance liability tracking",
    ],
    color: "from-slate-500 to-gray-600",
    estimatedLaunch: "Q2 2027",
  },
  {
    id: "MENTAL_HEALTH",
    title: "Mental Health & Community",
    slug: "mental-health",
    status: "ACTIVE",
    icon: Brain,
    description: "Human connection first. AI as bridge, not destination.",
    tagline: "10-minute connection standard. No exceptions.",
    capabilities: [
      "Crisis detection with near-zero false negatives",
      "Community interest matching",
      "Lifestyle-first evidence protocol",
      "Privacy beyond any other module",
    ],
    color: "from-pink-500 to-rose-600",
  },
]

export const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m]))

// Token amounts in micro-FOUND (1 FOUND = 1_000_000 micro-FOUND)
export const TOKEN_AWARDS = {
  // Foundation
  ACCOUNT_CREATED: 100_000_000n,      // 100 FOUND
  FIRST_CLAIM: 50_000_000n,           // 50 FOUND
  PROFILE_COMPLETE: 200_000_000n,     // 200 FOUND
  EMAIL_VERIFIED: 25_000_000n,        // 25 FOUND
  // Health
  HEALTH_FIRST_LOG: 25_000_000n,      // 25 FOUND
  HEALTH_GOAL_SET: 10_000_000n,       // 10 FOUND
  HEALTH_WEEK_STREAK: 50_000_000n,    // 50 FOUND
  HEALTH_MONTH_STREAK: 200_000_000n,  // 200 FOUND
  // Mental Health
  MOOD_FIRST_LOG: 25_000_000n,        // 25 FOUND
  MOOD_WEEK_STREAK: 50_000_000n,      // 50 FOUND
  JOURNAL_FIRST_ENTRY: 25_000_000n,   // 25 FOUND
  JOURNAL_TEN_ENTRIES: 100_000_000n,  // 100 FOUND
  // Education
  EDU_GOAL_SET: 25_000_000n,          // 25 FOUND
  EDU_LESSON_COMPLETE: 10_000_000n,   // 10 FOUND
  EDU_FIRST_SESSION: 50_000_000n,     // 50 FOUND
  EDU_WEEK_STREAK: 100_000_000n,      // 100 FOUND
  // Governance
  GOV_FIRST_RECORD: 25_000_000n,      // 25 FOUND
  GOV_CIVIC_ACTION: 15_000_000n,      // 15 FOUND
  GOV_WEEK_STREAK: 50_000_000n,       // 50 FOUND
  // DeSci
  DESCI_PRE_REGISTER: 100_000_000n,   // 100 FOUND
  DESCI_PEER_REVIEW: 50_000_000n,     // 50 FOUND
  DESCI_REPLICATION: 75_000_000n,     // 75 FOUND
  // Economics
  ECON_FIRST_INTERVENTION: 25_000_000n, // 25 FOUND
  ECON_HIGH_ROI_FOUND: 50_000_000n,   // 50 FOUND
  // Infrastructure
  INFRA_FIRST_PROJECT: 25_000_000n,   // 25 FOUND
  INFRA_TCO_ANALYSIS: 50_000_000n,    // 50 FOUND
  // Energy
  ENERGY_FIRST_LOG: 25_000_000n,      // 25 FOUND
  ENERGY_RENEWABLE: 10_000_000n,      // 10 FOUND per renewable log
  ENERGY_WEEK_STREAK: 50_000_000n,    // 50 FOUND
} as const
