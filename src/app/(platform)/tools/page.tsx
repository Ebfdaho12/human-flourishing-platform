"use client"

import { useState } from "react"
import {
  Search, Wrench, DollarSign, Heart, Brain, GraduationCap, Users,
  Home, Apple, Shield, Globe2, BookOpen, Target, Calculator, Briefcase,
  Baby, Clock, Flame, Star, PenLine, Scale, Layers, Moon, MessageCircle,
  Trophy, CreditCard, Utensils, Radio, Monitor, Coins, ChevronRight,
  Zap, MapPin, TrendingUp, Landmark, Sparkles, Dumbbell, Thermometer,
  Droplets, Eye, Pill, Leaf, Wind, Activity, Compass, Lightbulb,
  FileText, Library, Mic, Sword, Gamepad2, BarChart3, Sunrise, Sunset,
  CalendarCheck, Orbit, Network, Map, Database, ScrollText, Gift,
  Megaphone, Route, MoonStar, Telescope, LineChart, Handshake, Award,
  Hammer, ShoppingCart, Gem, Lock, Bug, Wallet, Receipt, PiggyBank,
  HeartPulse, Salad, Timer, Puzzle, Waypoints, Crown, Crosshair,
  Newspaper, FolderSearch, Beaker, Cable, CircleDot
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tool {
  name: string
  href: string
  desc: string
  icon: any
  category: string
  tags: string[]
}

const TOOLS: Tool[] = [
  // ─── FINANCIAL ──────────────────────────────────────────────────────────────
  { name: "Budget Calculator", href: "/budget", desc: "Full income/expense tracker with single-income simulator", icon: Calculator, category: "Financial", tags: ["money", "budget", "expenses", "income"] },
  { name: "Net Worth Tracker", href: "/net-worth", desc: "Assets minus liabilities — the most important number", icon: DollarSign, category: "Financial", tags: ["money", "assets", "debt", "wealth"] },
  { name: "Debt Payoff Calculator", href: "/debt-payoff", desc: "Snowball vs avalanche — see exactly when you are free", icon: Target, category: "Financial", tags: ["debt", "loans", "credit", "payoff"] },
  { name: "Compound Interest", href: "/compound-interest", desc: "See your money grow over 10, 20, 30 years", icon: TrendingUp, category: "Financial", tags: ["investing", "savings", "growth", "retirement"] },
  { name: "Tax Estimator", href: "/tax-estimator", desc: "Canadian and US tax brackets, effective vs marginal rate", icon: Calculator, category: "Financial", tags: ["tax", "income", "brackets", "CCB"] },
  { name: "Subscription Audit", href: "/subscriptions", desc: "Find forgotten subscriptions, see cost in hours of life", icon: CreditCard, category: "Financial", tags: ["subscriptions", "waste", "audit", "cancel"] },
  { name: "Cost of Living", href: "/cost-of-living", desc: "Compare real costs between 20 cities worldwide", icon: MapPin, category: "Financial", tags: ["cities", "housing", "cost", "compare"] },
  { name: "Negotiation Scripts", href: "/negotiation", desc: "Word-for-word scripts for raises, bills, rent, cars", icon: MessageCircle, category: "Financial", tags: ["negotiate", "salary", "bills", "save"] },
  { name: "Side Hustle Finder", href: "/side-hustles", desc: "9 proven income sources with realistic numbers", icon: Briefcase, category: "Financial", tags: ["income", "hustle", "freelance", "earn"] },
  { name: "Financial Literacy", href: "/education/finance", desc: "Money, taxes, investing, blockchain — simply explained", icon: GraduationCap, category: "Financial", tags: ["learn", "money", "investing", "taxes"] },
  { name: "Wallet & Tokens", href: "/wallet", desc: "FOUND token balance, staking, and VOICE governance", icon: Coins, category: "Financial", tags: ["tokens", "crypto", "staking", "FOUND"] },

  // ─── FAMILY ─────────────────────────────────────────────────────────────────
  { name: "Family Economics", href: "/family-economics", desc: "How one income can support a thriving family", icon: Home, category: "Family", tags: ["family", "income", "children", "stay home"] },
  { name: "Family Meeting", href: "/family-meeting", desc: "30-min structured weekly agenda for families", icon: Users, category: "Family", tags: ["family", "meeting", "communication", "weekly"] },
  { name: "Screen Time Tracker", href: "/screen-time", desc: "Track and reduce screen time for the whole family", icon: Monitor, category: "Family", tags: ["screen", "kids", "phone", "tablet"] },
  { name: "Kids Chores & Allowance", href: "/kids-chores", desc: "Age-appropriate chores, earn rewards", icon: Star, category: "Family", tags: ["kids", "chores", "allowance", "responsibility"] },
  { name: "Date Night Ideas", href: "/date-nights", desc: "18 date ideas from free to $$$ with random generator", icon: Heart, category: "Family", tags: ["date", "marriage", "relationship", "romance"] },
  { name: "Meal Planner", href: "/meal-planner", desc: "7-day plan with auto-fill and grocery list generator", icon: Utensils, category: "Family", tags: ["meals", "cooking", "grocery", "food", "plan"] },
  { name: "Relationships", href: "/relationships", desc: "Track your inner circle, contact frequency, overdue nudges", icon: Users, category: "Family", tags: ["relationships", "friends", "family", "connect"] },

  // ─── HEALTH ─────────────────────────────────────────────────────────────────
  { name: "Health Dashboard", href: "/health", desc: "Weight, mood, sleep, exercise — all in one place", icon: Heart, category: "Health", tags: ["health", "weight", "mood", "tracking"] },
  { name: "Sleep Calculator", href: "/sleep-calculator", desc: "Optimal bedtime by 90-minute sleep cycles", icon: Moon, category: "Health", tags: ["sleep", "bedtime", "wake", "cycles"] },
  { name: "Exercise Tracker", href: "/health/exercise", desc: "25 exercises with sets, reps, and progress", icon: Flame, category: "Health", tags: ["exercise", "workout", "fitness", "strength"] },
  { name: "Food Diary", href: "/health/food", desc: "Log meals with nutrition database", icon: Apple, category: "Health", tags: ["food", "nutrition", "diet", "calories"] },
  { name: "Water Tracker", href: "/health/water", desc: "Daily water intake logging", icon: Zap, category: "Health", tags: ["water", "hydration", "intake"] },
  { name: "Medication Tracker", href: "/health/medications", desc: "Medication adherence and reminders", icon: Heart, category: "Health", tags: ["medication", "pills", "adherence"] },
  { name: "Symptom Tracker", href: "/health/symptoms", desc: "Track symptoms and find patterns", icon: Heart, category: "Health", tags: ["symptoms", "pain", "patterns", "health"] },
  { name: "Body Metrics", href: "/health/body", desc: "BMI, measurements, and trends over time", icon: Heart, category: "Health", tags: ["body", "BMI", "weight", "measurements"] },

  // ─── MENTAL HEALTH ──────────────────────────────────────────────────────────
  { name: "Mental Health Hub", href: "/mental-health", desc: "Self-care tools, check-ins, and resources", icon: Brain, category: "Mental Health", tags: ["mental", "health", "self-care", "wellness"] },
  { name: "Gratitude Journal", href: "/mental-health/gratitude", desc: "Daily 3 things — rewire your brain for positivity", icon: Heart, category: "Mental Health", tags: ["gratitude", "journal", "positive"] },
  { name: "Breathing Exercises", href: "/mental-health/breathe", desc: "5 techniques for calm, focus, and sleep", icon: Brain, category: "Mental Health", tags: ["breathing", "calm", "anxiety", "relax"] },
  { name: "Meditation", href: "/mental-health/meditate", desc: "5 guided sessions for different needs", icon: Brain, category: "Mental Health", tags: ["meditation", "mindfulness", "peace"] },
  { name: "Affirmations", href: "/mental-health/affirmations", desc: "43 affirmations across 9 categories", icon: Star, category: "Mental Health", tags: ["affirmations", "positive", "mindset"] },
  { name: "Journal Prompts", href: "/mental-health/prompts", desc: "25 prompts across 7 categories", icon: PenLine, category: "Mental Health", tags: ["journal", "writing", "reflection"] },

  // ─── PERSONAL GROWTH ────────────────────────────────────────────────────────
  { name: "Life Wheel Assessment", href: "/life-wheel", desc: "10 life areas — see your balance at a glance", icon: Target, category: "Personal Growth", tags: ["life", "balance", "assessment", "wheel"] },
  { name: "Core Values Discovery", href: "/values", desc: "40 values, 3-step process to find yours", icon: Shield, category: "Personal Growth", tags: ["values", "purpose", "identity"] },
  { name: "Vision Board", href: "/vision", desc: "Visualize your ideal life across 8 categories", icon: Star, category: "Personal Growth", tags: ["vision", "goals", "dream", "future"] },
  { name: "Skill Inventory", href: "/skills", desc: "Map everything you know, find strategic gaps", icon: Brain, category: "Personal Growth", tags: ["skills", "learning", "gaps", "expertise"] },
  { name: "Career Path Explorer", href: "/career-path", desc: "6 paths with complementary skills and edge ratings", icon: Briefcase, category: "Personal Growth", tags: ["career", "jobs", "skills", "path"] },
  { name: "Decision Journal", href: "/decisions", desc: "Log decisions before outcomes, review after 3 months", icon: Scale, category: "Personal Growth", tags: ["decisions", "thinking", "review"] },
  { name: "Wins & Gratitude", href: "/wins", desc: "Celebrate progress — your brain forgets, this does not", icon: Trophy, category: "Personal Growth", tags: ["wins", "gratitude", "progress", "celebrate"] },
  { name: "Reading List", href: "/reading", desc: "Track books + 20 curated recommendations", icon: BookOpen, category: "Personal Growth", tags: ["books", "reading", "learning"] },
  { name: "30-Day Challenges", href: "/challenges", desc: "Health, Mindset, and Money — one task per day", icon: Flame, category: "Personal Growth", tags: ["challenge", "habits", "30 days"] },
  { name: "Habit Stacking", href: "/habit-stack", desc: "Chain habits together for unstoppable routines", icon: Layers, category: "Personal Growth", tags: ["habits", "routine", "atomic", "stacking"] },

  // ─── PRODUCTIVITY ───────────────────────────────────────────────────────────
  { name: "Daily Planner", href: "/planner", desc: "Time blocks, priority levels, progress tracking", icon: Clock, category: "Productivity", tags: ["planner", "schedule", "tasks", "day"] },
  { name: "Daily Routines", href: "/routine", desc: "5 science-backed routines with checklists", icon: Clock, category: "Productivity", tags: ["routine", "morning", "evening", "habits"] },
  { name: "Focus Timer", href: "/focus", desc: "Pomodoro, Deep Work, and 2 more preset modes", icon: Clock, category: "Productivity", tags: ["focus", "pomodoro", "timer", "deep work"] },
  { name: "Quick Notes", href: "/notes", desc: "Brain dump — voice input, color-coded, pin/search", icon: PenLine, category: "Productivity", tags: ["notes", "ideas", "brain dump", "quick"] },
  { name: "Goals", href: "/goals", desc: "Set, track, and achieve with milestones", icon: Target, category: "Productivity", tags: ["goals", "milestones", "achieve", "track"] },

  // ─── HOME ───────────────────────────────────────────────────────────────────
  { name: "Home Maintenance", href: "/home-maintenance", desc: "Seasonal checklist — prevent $10K repairs with $10 fixes", icon: Wrench, category: "Home", tags: ["home", "maintenance", "repair", "seasonal"] },
  { name: "Emergency Preparedness", href: "/preparedness", desc: "72-hour readiness checklist with progress bar", icon: Shield, category: "Home", tags: ["emergency", "preparedness", "survival", "safety"] },
  { name: "Food System", href: "/food-system", desc: "Who controls your food, what labels mean, grow your own", icon: Apple, category: "Home", tags: ["food", "labels", "organic", "garden", "grow"] },

  // ─── EDUCATION ──────────────────────────────────────────────────────────────
  { name: "Economics Education", href: "/education/economics", desc: "Austrian, Chicago, Keynesian — what schools skip", icon: GraduationCap, category: "Education", tags: ["economics", "austrian", "friedman", "hayek"] },
  { name: "Civilizations Timeline", href: "/civilizations", desc: "5,000 years of patterns — rise, peak, collapse", icon: Globe2, category: "Education", tags: ["history", "civilizations", "empires", "dalio"] },
  { name: "Money History", href: "/money-history", desc: "Barter → gold → Bretton Woods → 1971 → Bitcoin", icon: Coins, category: "Education", tags: ["money", "history", "gold", "1971", "fiat"] },
  { name: "Logical Fallacies", href: "/logical-fallacies", desc: "20 tricks people use to win without being right", icon: Brain, category: "Education", tags: ["logic", "fallacies", "thinking", "debate"] },
  { name: "Media Ownership", href: "/media-ownership", desc: "Who owns every major news outlet (Canada + US)", icon: Radio, category: "Education", tags: ["media", "news", "ownership", "corporate"] },
  { name: "Your Rights", href: "/rights", desc: "Charter of Rights + Bill of Rights in plain language", icon: Shield, category: "Education", tags: ["rights", "charter", "constitution", "law", "freedom"] },
  { name: "Learning Paths", href: "/education", desc: "Socratic AI tutoring and 5 learning curricula", icon: GraduationCap, category: "Education", tags: ["learning", "education", "tutoring", "courses"] },
  { name: "Personalized Learning", href: "/education/personalized", desc: "Learn through your existing interests", icon: GraduationCap, category: "Education", tags: ["learning", "interests", "personalized"] },

  // ─── WORKFORCE ──────────────────────────────────────────────────────────────
  { name: "Workforce Analytics", href: "/workforce", desc: "10 careers + 10 countries demographics/birth rates", icon: Users, category: "Career", tags: ["workforce", "careers", "shortage", "demographics"] },

  // ─── CORE MODULES ───────────────────────────────────────────────────────────
  { name: "Governance", href: "/governance", desc: "Track politicians, votes, legislation, civic guide", icon: Landmark, category: "Core Modules", tags: ["governance", "politics", "voting", "civic"] },
  { name: "DeSci", href: "/desci", desc: "Pre-register studies, peer review, replication", icon: GraduationCap, category: "Core Modules", tags: ["science", "research", "peer review", "studies"] },
  { name: "Economics Data", href: "/economics", desc: "Copenhagen Consensus ROI, FRED data, narratives", icon: TrendingUp, category: "Core Modules", tags: ["economics", "data", "FRED", "ROI"] },
  { name: "Energy", href: "/energy", desc: "Production, P2P trading, climate data, solar ROI", icon: Zap, category: "Core Modules", tags: ["energy", "solar", "P2P", "climate"] },
  { name: "Infrastructure", href: "/infrastructure", desc: "TCO analysis and global benchmarks", icon: Wrench, category: "Core Modules", tags: ["infrastructure", "TCO", "benchmarks"] },

  // ─── NEW: Social & Community ──────────────────────────────────
  { name: "Community Hub", href: "/community/hub", desc: "Discussion rooms, messages, and accountability partners", icon: Users, category: "Community", tags: ["social", "discuss", "connect", "community"] },
  { name: "Accountability Partners", href: "/accountability", desc: "Pair up with someone on a shared goal — 95% success rate", icon: Users, category: "Community", tags: ["accountability", "goals", "partner"] },
  { name: "Family Groups", href: "/family-group", desc: "Private encrypted spaces for your family", icon: Users, category: "Community", tags: ["family", "private", "messaging", "group"] },
  { name: "Community Insights", href: "/insights", desc: "Evidence-backed learnings shared by members", icon: Star, category: "Community", tags: ["insights", "sharing", "community"] },

  // ─── NEW: Life Situations ──────────────────────────────────
  { name: "Estate Planning", href: "/estate-planning", desc: "Will, POA, beneficiaries — 56% of Canadians don't have a will", icon: Shield, category: "Life Situations", tags: ["will", "estate", "POA", "planning"] },
  { name: "Elder Care", href: "/elder-care", desc: "Housing options, costs, government programs, caregiver burnout", icon: Heart, category: "Life Situations", tags: ["aging", "parents", "care", "elderly"] },
  { name: "Divorce Finance", href: "/divorce-finance", desc: "Asset splitting, support, credit, documents to gather", icon: DollarSign, category: "Life Situations", tags: ["divorce", "separation", "assets"] },
  { name: "Difficult Conversations", href: "/difficult-conversations", desc: "Scripts for hard talks — money, boundaries, end-of-life", icon: Users, category: "Life Situations", tags: ["conversations", "scripts", "communication"] },
  { name: "Grief & Loss", href: "/grief", desc: "Practical steps, costs, children & grief, crisis resources", icon: Heart, category: "Life Situations", tags: ["grief", "loss", "death", "support"] },
  { name: "Insurance Guide", href: "/insurance-guide", desc: "What you need vs what they sell you (Canada)", icon: Shield, category: "Life Situations", tags: ["insurance", "life", "home", "auto"] },
  { name: "Digital Legacy", href: "/digital-legacy", desc: "Passwords, accounts, crypto — what happens to your digital life", icon: Shield, category: "Life Situations", tags: ["digital", "passwords", "legacy", "accounts"] },
  { name: "Conflict Resolution", href: "/conflict-resolution", desc: "De-escalation techniques that actually work", icon: Users, category: "Life Situations", tags: ["conflict", "resolution", "communication"] },

  // ─── NEW: Additional Financial ──────────────────────────────
  { name: "Rent vs Buy", href: "/rent-vs-buy", desc: "The honest math — sometimes renting IS smarter", icon: Home, category: "Financial", tags: ["rent", "buy", "housing", "compare"] },
  { name: "Emergency Fund", href: "/emergency-fund", desc: "How much, how fast, where to keep it", icon: Shield, category: "Financial", tags: ["emergency", "savings", "fund"] },
  { name: "Credit Score", href: "/credit-score", desc: "How it works, 6 myths debunked, build from scratch", icon: DollarSign, category: "Financial", tags: ["credit", "score", "borrowing"] },
  { name: "First Job Checklist", href: "/first-job", desc: "12 steps that set you up for life", icon: Target, category: "Financial", tags: ["first job", "career", "young adult"] },
  { name: "Side Income Tax", href: "/side-income-tax", desc: "HST, deductions, when to incorporate (Canada)", icon: DollarSign, category: "Financial", tags: ["tax", "self-employment", "HST", "deductions"] },
  { name: "Money & Marriage", href: "/marriage-finance", desc: "Joint vs separate, money dates, biggest fights", icon: Heart, category: "Financial", tags: ["marriage", "couple", "money", "communication"] },

  // ─── NEW: Additional Education ──────────────────────────────
  { name: "Propaganda Techniques", href: "/propaganda", desc: "15 manipulation techniques — once you see them...", icon: Brain, category: "Education", tags: ["propaganda", "manipulation", "media"] },
  { name: "Statistics Guide", href: "/statistics-guide", desc: "Mean vs median, correlation vs causation, p-values", icon: GraduationCap, category: "Education", tags: ["statistics", "data", "numbers"] },
  { name: "Philosophy", href: "/philosophy", desc: "Stoicism, Existentialism, Pragmatism — for real life", icon: Brain, category: "Education", tags: ["philosophy", "stoicism", "meaning"] },
  { name: "How Laws Work", href: "/how-laws-work", desc: "Bill to law process, where citizens influence (Canada)", icon: Landmark, category: "Education", tags: ["laws", "parliament", "bills", "Canada"] },
  { name: "History of Democracy", href: "/democracy-history", desc: "Athens to now, what kills democracies, warning signs", icon: Globe2, category: "Education", tags: ["democracy", "history", "government"] },
  { name: "Memory Techniques", href: "/memory-techniques", desc: "Spaced repetition, memory palace, Feynman technique", icon: Brain, category: "Education", tags: ["memory", "learning", "study"] },
  { name: "Habit Science", href: "/habit-science", desc: "Cue-routine-reward, environment design, identity habits", icon: Brain, category: "Education", tags: ["habits", "behavior", "psychology"] },
  { name: "Time Management", href: "/time-management", desc: "Eisenhower matrix, Pomodoro, deep work, elimination", icon: Clock, category: "Productivity", tags: ["time", "productivity", "focus"] },
  { name: "Teach Kids Finance", href: "/kids-finance", desc: "Age-by-age money lessons from 3 to 18", icon: DollarSign, category: "Family", tags: ["kids", "money", "education", "financial literacy"] },
  { name: "Critical Thinking", href: "/critical-thinking", desc: "Age-by-age exercises for independent thinking", icon: Brain, category: "Family", tags: ["kids", "thinking", "bias", "reasoning"] },

  // ─── NEW: Health ──────────────────────────────────────────
  { name: "Men's Health", href: "/mens-health", desc: "Screenings by decade, why men avoid doctors", icon: Heart, category: "Health", tags: ["mens", "health", "screening", "prevention"] },
  { name: "Women's Health", href: "/womens-health", desc: "Screenings by decade, hormones, heart disease #1", icon: Heart, category: "Health", tags: ["womens", "health", "screening", "hormones"] },
  { name: "Gut Health", href: "/gut-health", desc: "Microbiome, prebiotics vs probiotics, gut-brain", icon: Heart, category: "Health", tags: ["gut", "microbiome", "digestion", "probiotics"] },
  { name: "Dental Health", href: "/dental-health", desc: "What prevents cavities, costs, affordable care", icon: Heart, category: "Health", tags: ["dental", "teeth", "cavities", "fluoride"] },
  { name: "Eye Health", href: "/eye-health", desc: "Blue light, 20-20-20 rule, myopia epidemic", icon: Heart, category: "Health", tags: ["eyes", "screen", "vision", "blue light"] },
  { name: "Hormone Health", href: "/hormone-health", desc: "Testosterone, estrogen, cortisol, thyroid basics", icon: Heart, category: "Health", tags: ["hormones", "testosterone", "thyroid"] },
  { name: "Pain Management", href: "/pain-management", desc: "Non-pharmaceutical approaches that actually work", icon: Heart, category: "Health", tags: ["pain", "stretching", "natural", "management"] },

  // ─── NEW: Discovery & Meta ──────────────────────────────────
  { name: "Knowledge Map", href: "/knowledge-map", desc: "Visual canvas of how every tool connects", icon: Globe2, category: "Discovery", tags: ["map", "connections", "explore", "visual"] },
  { name: "Progress Dashboard", href: "/progress", desc: "One view of your growth across all tools", icon: TrendingUp, category: "Discovery", tags: ["progress", "score", "tracking"] },
  { name: "Onboarding Quiz", href: "/quiz", desc: "4 questions → personalized tool recommendations", icon: Target, category: "Discovery", tags: ["quiz", "personalized", "start"] },
  { name: "Data Backup", href: "/data-backup", desc: "Export and import all your local data", icon: Shield, category: "Discovery", tags: ["backup", "export", "data", "security"] },
  { name: "Favorites", href: "/favorites", desc: "Pin your most-used tools for quick access", icon: Star, category: "Discovery", tags: ["favorites", "pin", "quick access"] },
  { name: "Promise Tracker", href: "/promise-tracker", desc: "What politicians promised vs what they did", icon: Landmark, category: "Canada", tags: ["promises", "politicians", "accountability"] },

  // ─── BODY OPTIMIZATION ──────────────────────────────────────────────────────
  { name: "Fascia & Mobility", href: "/fascia", desc: "Myofascial release, stretching protocols, pain-free movement", icon: Activity, category: "Body Optimization", tags: ["fascia", "mobility", "stretching", "myofascial"] },
  { name: "Cold Exposure", href: "/cold-exposure", desc: "Cold plunge protocols, hormesis, dopamine and norepinephrine boost", icon: Thermometer, category: "Body Optimization", tags: ["cold", "plunge", "ice bath", "hormesis"] },
  { name: "Sauna Protocols", href: "/sauna", desc: "Heat therapy, cardiovascular benefits, longevity protocols", icon: Flame, category: "Body Optimization", tags: ["sauna", "heat", "longevity", "cardiovascular"] },
  { name: "Sleep Optimization", href: "/sleep-optimization", desc: "Advanced sleep protocols beyond basic sleep hygiene", icon: Moon, category: "Body Optimization", tags: ["sleep", "circadian", "melatonin", "deep sleep"] },
  { name: "Nutrition Science", href: "/nutrition", desc: "Macro/micronutrients, meal timing, metabolic health", icon: Salad, category: "Body Optimization", tags: ["nutrition", "macros", "diet", "metabolic"] },
  { name: "Posture Correction", href: "/posture", desc: "Desk posture, exercises, anterior pelvic tilt fixes", icon: Activity, category: "Body Optimization", tags: ["posture", "spine", "ergonomics", "desk"] },
  { name: "Strength Training", href: "/strength-training", desc: "Progressive overload, compound lifts, periodization", icon: Dumbbell, category: "Body Optimization", tags: ["strength", "lifting", "muscle", "gym"] },
  { name: "Peptides Guide", href: "/peptides", desc: "BPC-157, TB-500, and research-backed peptide protocols", icon: Beaker, category: "Body Optimization", tags: ["peptides", "BPC-157", "recovery", "healing"] },
  { name: "Testosterone Optimization", href: "/testosterone", desc: "Natural and clinical approaches to hormonal optimization", icon: HeartPulse, category: "Body Optimization", tags: ["testosterone", "hormones", "TRT", "optimization"] },
  { name: "Supplements Guide", href: "/supplements", desc: "Evidence-based supplements with dosing and timing", icon: Pill, category: "Body Optimization", tags: ["supplements", "vitamins", "minerals", "stack"] },
  { name: "Fasting Protocols", href: "/fasting", desc: "Intermittent, extended, and therapeutic fasting guides", icon: Timer, category: "Body Optimization", tags: ["fasting", "intermittent", "autophagy", "metabolic"] },
  { name: "Body Composition", href: "/body-composition", desc: "Track body fat, lean mass, and recomposition progress", icon: Activity, category: "Body Optimization", tags: ["body fat", "lean mass", "composition", "tracking"] },
  { name: "Breathwork", href: "/breathwork", desc: "Wim Hof, box breathing, pranayama, and performance breathing", icon: Wind, category: "Body Optimization", tags: ["breathwork", "wim hof", "breathing", "pranayama"] },
  { name: "Health Protocols", href: "/health-protocols", desc: "Stacked protocols for longevity, recovery, and performance", icon: HeartPulse, category: "Body Optimization", tags: ["protocols", "longevity", "biohacking", "stacking"] },

  // ─── NEUROSCIENCE & MINDSET ─────────────────────────────────────────────────
  { name: "Dopamine Management", href: "/dopamine", desc: "Dopamine baseline, reward systems, addiction recovery", icon: Brain, category: "Neuroscience", tags: ["dopamine", "reward", "addiction", "motivation"] },
  { name: "Anxiety Toolkit", href: "/anxiety-toolkit", desc: "CBT tools, exposure ladders, panic protocol, grounding", icon: Brain, category: "Neuroscience", tags: ["anxiety", "CBT", "panic", "grounding"] },
  { name: "Cognitive Biases", href: "/cognitive-biases", desc: "50+ biases that distort thinking — with real examples", icon: Eye, category: "Neuroscience", tags: ["biases", "cognitive", "thinking", "psychology"] },
  { name: "Mental Models", href: "/mental-models", desc: "First principles, inversion, second-order thinking", icon: Lightbulb, category: "Neuroscience", tags: ["mental models", "thinking", "frameworks", "decision"] },
  { name: "Stoicism", href: "/stoicism", desc: "Marcus Aurelius, Epictetus, Seneca — applied to modern life", icon: Crown, category: "Neuroscience", tags: ["stoicism", "philosophy", "resilience", "virtue"] },

  // ─── KNOWLEDGE & LEARNING ───────────────────────────────────────────────────
  { name: "Scientific Literacy", href: "/scientific-literacy", desc: "Read papers, spot bad studies, understand p-values", icon: Beaker, category: "Education", tags: ["science", "literacy", "papers", "research"] },
  { name: "Book Library", href: "/book-library", desc: "Curated library with summaries, notes, and recommendations", icon: Library, category: "Education", tags: ["books", "library", "reading", "summaries"] },
  { name: "Negotiation Guide", href: "/negotiation-guide", desc: "Advanced negotiation frameworks — BATNA, anchoring, mirroring", icon: Handshake, category: "Education", tags: ["negotiation", "BATNA", "influence", "deals"] },
  { name: "Communication Skills", href: "/communication", desc: "Active listening, assertiveness, nonviolent communication", icon: MessageCircle, category: "Education", tags: ["communication", "listening", "assertive", "NVC"] },
  { name: "Decision Journal", href: "/decision-journal", desc: "Advanced decision logging with pre-mortem and review cycles", icon: Scale, category: "Education", tags: ["decisions", "journal", "thinking", "review"] },

  // ─── DAILY SYSTEMS ──────────────────────────────────────────────────────────
  { name: "Morning Briefing", href: "/morning-briefing", desc: "Your personalized daily launch — priorities, weather, habits", icon: Sunrise, category: "Daily Systems", tags: ["morning", "briefing", "daily", "routine"] },
  { name: "Evening Review", href: "/evening-review", desc: "Reflect on wins, lessons, and set up tomorrow", icon: Sunset, category: "Daily Systems", tags: ["evening", "review", "reflection", "wind down"] },
  { name: "Daily Habits", href: "/daily-habits", desc: "Track daily habits with streaks and completion rates", icon: CalendarCheck, category: "Daily Systems", tags: ["habits", "daily", "streaks", "tracking"] },
  { name: "Gratitude Practice", href: "/gratitude", desc: "Structured gratitude with prompts and streak tracking", icon: Heart, category: "Daily Systems", tags: ["gratitude", "thankful", "positivity", "daily"] },
  { name: "Daily Quests", href: "/daily-quests", desc: "Gamified daily tasks — earn XP, level up your real life", icon: Sword, category: "Daily Systems", tags: ["quests", "gamification", "XP", "daily"] },
  { name: "Life OS", href: "/life-os", desc: "Central command for your entire life system", icon: Compass, category: "Daily Systems", tags: ["life OS", "dashboard", "system", "command"] },
  { name: "Energy Management", href: "/energy-management", desc: "Track energy levels, find peak hours, optimize output", icon: Zap, category: "Daily Systems", tags: ["energy", "productivity", "peak", "circadian"] },
  { name: "Water Tracker", href: "/water-tracker", desc: "Advanced hydration tracking with reminders and goals", icon: Droplets, category: "Daily Systems", tags: ["water", "hydration", "tracking", "health"] },
  { name: "Focus Timer", href: "/focus-timer", desc: "Advanced Pomodoro with deep work modes and session stats", icon: Timer, category: "Daily Systems", tags: ["focus", "timer", "pomodoro", "deep work"] },
  { name: "Weekly Reflection", href: "/weekly-reflection", desc: "Review your week, celebrate wins, plan the next one", icon: PenLine, category: "Daily Systems", tags: ["weekly", "reflection", "review", "planning"] },

  // ─── GAMIFICATION & GROWTH ──────────────────────────────────────────────────
  { name: "Character Sheet", href: "/character-sheet", desc: "RPG-style stats for your real life — STR, INT, WIS, CHA", icon: Gamepad2, category: "Gamification", tags: ["character", "RPG", "stats", "gamification"] },
  { name: "Flourishing Score", href: "/flourishing-score", desc: "Composite score across all life domains — your single number", icon: Award, category: "Gamification", tags: ["flourishing", "score", "assessment", "progress"] },
  { name: "Skill Tree", href: "/skill-tree", desc: "Visual progression tree — unlock skills, track mastery", icon: Network, category: "Gamification", tags: ["skills", "tree", "progression", "mastery"] },
  { name: "Future Self", href: "/future-self", desc: "Write letters to your future self, set long-term intentions", icon: Telescope, category: "Gamification", tags: ["future", "goals", "letters", "intentions"] },
  { name: "30-Day Challenges", href: "/30-day-challenges", desc: "Curated 30-day transformation challenges with daily tasks", icon: Flame, category: "Gamification", tags: ["challenges", "30 days", "transformation", "habit"] },
  { name: "Vision Board", href: "/vision-board", desc: "Digital vision board — images, goals, and affirmations", icon: Sparkles, category: "Gamification", tags: ["vision", "board", "goals", "visualization"] },
  { name: "Trajectory", href: "/trajectory", desc: "Where you are heading based on current habits and trends", icon: Route, category: "Gamification", tags: ["trajectory", "trends", "prediction", "direction"] },
  { name: "My Path", href: "/my-path", desc: "Personalized roadmap based on your goals and assessments", icon: Waypoints, category: "Gamification", tags: ["path", "personalized", "roadmap", "journey"] },

  // ─── ANALYTICS & DATA ───────────────────────────────────────────────────────
  { name: "Trends", href: "/trends", desc: "Personal trends across health, wealth, and habits over time", icon: LineChart, category: "Analytics", tags: ["trends", "analytics", "graphs", "progress"] },
  { name: "Correlations", href: "/correlations", desc: "Discover hidden correlations between your tracked metrics", icon: CircleDot, category: "Analytics", tags: ["correlations", "data", "patterns", "insights"] },
  { name: "Climate Data", href: "/climate-data", desc: "Real climate data, trends, and actionable insights", icon: Globe2, category: "Analytics", tags: ["climate", "data", "environment", "trends"] },
  { name: "World Data", href: "/world-data", desc: "Global metrics — population, GDP, health, education by country", icon: Globe2, category: "Analytics", tags: ["world", "data", "global", "countries"] },
  { name: "Platform Stats", href: "/platform-stats", desc: "Usage statistics and community metrics for the platform", icon: BarChart3, category: "Analytics", tags: ["stats", "platform", "usage", "metrics"] },

  // ─── RESEARCH & INVESTIGATION ───────────────────────────────────────────────
  { name: "Investigate", href: "/investigate", desc: "Deep-dive research tool for any topic or claim", icon: FolderSearch, category: "Research", tags: ["investigate", "research", "deep dive", "verify"] },
  { name: "Research Compiler", href: "/research-compiler", desc: "Compile and organize research from multiple sources", icon: FileText, category: "Research", tags: ["research", "compile", "sources", "organize"] },

  // ─── COMMUNITY & SOCIAL ─────────────────────────────────────────────────────
  { name: "Connections", href: "/connections", desc: "Find and connect with like-minded community members", icon: Network, category: "Community", tags: ["connections", "networking", "community", "people"] },
  { name: "People Directory", href: "/people", desc: "Browse community members, their skills, and interests", icon: Users, category: "Community", tags: ["people", "directory", "community", "profiles"] },
  { name: "Hive Mind", href: "/hive-mind", desc: "Collective intelligence — ask the community, get answers", icon: Network, category: "Community", tags: ["hive mind", "collective", "questions", "wisdom"] },
  { name: "Contribute", href: "/contribute", desc: "Help build the platform — code, content, translations", icon: Handshake, category: "Community", tags: ["contribute", "open source", "help", "build"] },
  { name: "Community Resources", href: "/community-resources", desc: "Shared resources, templates, and tools from the community", icon: Gift, category: "Community", tags: ["resources", "shared", "templates", "community"] },
  { name: "Invite Friends", href: "/invite", desc: "Invite friends and family to join the platform", icon: Gift, category: "Community", tags: ["invite", "referral", "friends", "share"] },

  // ─── PLATFORM & WEB3 ───────────────────────────────────────────────────────
  { name: "Earn Rewards", href: "/earn", desc: "Earn FOUND tokens through contributions and engagement", icon: Coins, category: "Platform", tags: ["earn", "tokens", "rewards", "FOUND"] },
  { name: "DePIN", href: "/depin", desc: "Decentralized physical infrastructure network participation", icon: Cable, category: "Platform", tags: ["DePIN", "decentralized", "infrastructure", "nodes"] },
  { name: "Staking Guide", href: "/staking-guide", desc: "Stake tokens for governance power and rewards", icon: Coins, category: "Platform", tags: ["staking", "tokens", "governance", "yield"] },
  { name: "Node Operator", href: "/node-operator", desc: "Run a node, earn rewards, strengthen the network", icon: Cable, category: "Platform", tags: ["node", "operator", "decentralized", "network"] },
  { name: "Glossary", href: "/glossary", desc: "Every term on the platform explained in plain language", icon: ScrollText, category: "Platform", tags: ["glossary", "terms", "definitions", "learn"] },
  { name: "What's New", href: "/whats-new", desc: "Latest features, updates, and platform changes", icon: Newspaper, category: "Platform", tags: ["updates", "changelog", "new", "features"] },
  { name: "Roadmap", href: "/roadmap", desc: "Where the platform is going — vote on priorities", icon: Map, category: "Platform", tags: ["roadmap", "features", "voting", "future"] },
  { name: "Tokens", href: "/tokens", desc: "FOUND and VOICE token overview, utility, and economics", icon: Gem, category: "Platform", tags: ["tokens", "FOUND", "VOICE", "tokenomics"] },
  { name: "Privacy Architecture", href: "/privacy-architecture", desc: "How your data is protected — zero-knowledge, local-first", icon: Lock, category: "Platform", tags: ["privacy", "encryption", "zero knowledge", "security"] },

  // ─── ASTROLOGY & CYCLES ─────────────────────────────────────────────────────
  { name: "Chinese Zodiac", href: "/chinese-zodiac", desc: "Your Chinese zodiac sign, element, and compatibility", icon: MoonStar, category: "Cycles & Seasons", tags: ["zodiac", "chinese", "astrology", "element"] },
  { name: "Lunar Cycles", href: "/lunar-cycles", desc: "Moon phases, planting calendars, and natural rhythms", icon: MoonStar, category: "Cycles & Seasons", tags: ["lunar", "moon", "phases", "cycles"] },

  // ─── ADDITIONAL FINANCIAL ────────────────────────────────────────────────────
  { name: "Financial Independence", href: "/financial-independence", desc: "FIRE calculator — coast, lean, fat — with Canadian specifics", icon: DollarSign, category: "Financial", tags: ["FIRE", "independence", "retirement", "freedom"] },
  { name: "Investing Guide", href: "/investing", desc: "Index funds, ETFs, TFSA/RRSP strategy, portfolio allocation", icon: TrendingUp, category: "Financial", tags: ["investing", "ETFs", "TFSA", "portfolio"] },
  { name: "Mortgage Calculator", href: "/mortgage", desc: "Payment calculator, amortization schedule, prepayment impact", icon: Home, category: "Financial", tags: ["mortgage", "payment", "amortization", "house"] },
  { name: "Retirement Planning", href: "/retirement", desc: "CPP, OAS, RRSP drawdown — when can you actually retire?", icon: PiggyBank, category: "Financial", tags: ["retirement", "CPP", "OAS", "RRSP"] },
  { name: "Inflation Calculator", href: "/inflation", desc: "See how inflation erodes purchasing power over time", icon: TrendingUp, category: "Financial", tags: ["inflation", "purchasing power", "CPI", "money"] },
  { name: "Savings Finder", href: "/savings-finder", desc: "Find hidden savings in your spending with smart analysis", icon: DollarSign, category: "Financial", tags: ["savings", "spending", "analysis", "cut"] },
  { name: "Real Hourly Rate", href: "/real-hourly-rate", desc: "Your true hourly rate after commute, prep, and stress", icon: Clock, category: "Financial", tags: ["hourly rate", "salary", "real cost", "commute"] },
  { name: "Car Buying Guide", href: "/car-buying", desc: "New vs used, total cost of ownership, negotiation tips", icon: Receipt, category: "Financial", tags: ["car", "buying", "auto", "vehicle"] },
  { name: "Home Buying Guide", href: "/home-buying", desc: "Step-by-step from pre-approval to closing day", icon: Home, category: "Financial", tags: ["home", "buying", "real estate", "closing"] },
  { name: "Birth Fund", href: "/birth-fund", desc: "Plan financially for a new baby — costs, benefits, timeline", icon: Baby, category: "Financial", tags: ["baby", "birth", "costs", "planning"] },
  { name: "Money & Relationship", href: "/money-relationship", desc: "Heal your relationship with money — scarcity vs abundance", icon: Heart, category: "Financial", tags: ["money", "mindset", "relationship", "scarcity"] },
  { name: "Financial Dashboard", href: "/financial-dashboard", desc: "All your financial metrics in one unified view", icon: BarChart3, category: "Financial", tags: ["dashboard", "financial", "overview", "metrics"] },

  // ─── ADDITIONAL FAMILY ──────────────────────────────────────────────────────
  { name: "Family Constitution", href: "/family-constitution", desc: "Define your family values, rules, and mission together", icon: FileText, category: "Family", tags: ["family", "constitution", "values", "mission"] },
  { name: "Parenting Toolkit", href: "/parenting", desc: "Age-by-age parenting strategies and developmental milestones", icon: Baby, category: "Family", tags: ["parenting", "kids", "development", "milestones"] },
  { name: "Marriage Health", href: "/marriage-health", desc: "Gottman-based relationship assessment and strengthening", icon: Heart, category: "Family", tags: ["marriage", "relationship", "gottman", "couples"] },
  { name: "Cooking Guide", href: "/cooking", desc: "Essential cooking skills, techniques, and recipes", icon: Utensils, category: "Family", tags: ["cooking", "recipes", "kitchen", "skills"] },

  // ─── ADDITIONAL PRODUCTIVITY ─────────────────────────────────────────────────
  { name: "Habits Dashboard", href: "/habits", desc: "Master habit dashboard with trends and streaks", icon: Layers, category: "Productivity", tags: ["habits", "dashboard", "streaks", "tracking"] },
  { name: "Bookmarks", href: "/bookmarks", desc: "Save and organize links, articles, and resources", icon: BookOpen, category: "Productivity", tags: ["bookmarks", "save", "links", "articles"] },

  // ─── ADDITIONAL HOME ────────────────────────────────────────────────────────
  { name: "Emergency Kit", href: "/emergency", desc: "Emergency supply kit builder and readiness tracker", icon: Shield, category: "Home", tags: ["emergency", "kit", "supplies", "readiness"] },
  { name: "Emergency Prep", href: "/emergency-prep", desc: "Advanced emergency preparedness — plans, routes, contacts", icon: Shield, category: "Home", tags: ["emergency", "prep", "survival", "plan"] },

  // ─── ADDITIONAL DISCOVERY ────────────────────────────────────────────────────
  { name: "Digest", href: "/digest", desc: "Weekly digest of your progress and platform highlights", icon: Newspaper, category: "Discovery", tags: ["digest", "weekly", "summary", "highlights"] },
  { name: "Explore", href: "/explore", desc: "Discover new tools, trending content, and community picks", icon: Compass, category: "Discovery", tags: ["explore", "discover", "trending", "new"] },
  { name: "Resources", href: "/resources", desc: "Curated external resources, links, and further reading", icon: BookOpen, category: "Discovery", tags: ["resources", "links", "external", "reading"] },
  { name: "Timeline", href: "/timeline", desc: "Your personal timeline of milestones and achievements", icon: Clock, category: "Discovery", tags: ["timeline", "milestones", "history", "achievements"] },
  { name: "Knowledge Hub", href: "/knowledge", desc: "Curated knowledge base across all platform topics", icon: Library, category: "Discovery", tags: ["knowledge", "hub", "base", "learning"] },
  { name: "Why This Platform", href: "/why", desc: "The mission, the problem, and why this matters", icon: Sparkles, category: "Discovery", tags: ["why", "mission", "purpose", "about"] },
]

const CATEGORIES = [...new Set(TOOLS.map(t => t.category))]
const CATEGORY_COLORS: Record<string, string> = {
  "Financial": "text-emerald-600 border-emerald-300 bg-emerald-50",
  "Family": "text-rose-600 border-rose-300 bg-rose-50",
  "Health": "text-red-600 border-red-300 bg-red-50",
  "Mental Health": "text-violet-600 border-violet-300 bg-violet-50",
  "Personal Growth": "text-cyan-600 border-cyan-300 bg-cyan-50",
  "Productivity": "text-blue-600 border-blue-300 bg-blue-50",
  "Home": "text-amber-600 border-amber-300 bg-amber-50",
  "Education": "text-amber-700 border-amber-400 bg-amber-50",
  "Career": "text-indigo-600 border-indigo-300 bg-indigo-50",
  "Core Modules": "text-slate-600 border-slate-300 bg-slate-50",
  "Community": "text-violet-600 border-violet-300 bg-violet-50",
  "Life Situations": "text-slate-600 border-slate-300 bg-slate-50",
  "Discovery": "text-purple-600 border-purple-300 bg-purple-50",
  "Canada": "text-red-600 border-red-300 bg-red-50",
  "Body Optimization": "text-orange-600 border-orange-300 bg-orange-50",
  "Neuroscience": "text-pink-600 border-pink-300 bg-pink-50",
  "Daily Systems": "text-sky-600 border-sky-300 bg-sky-50",
  "Gamification": "text-yellow-600 border-yellow-300 bg-yellow-50",
  "Analytics": "text-teal-600 border-teal-300 bg-teal-50",
  "Research": "text-emerald-600 border-emerald-300 bg-emerald-50",
  "Platform": "text-violet-600 border-violet-300 bg-violet-50",
  "Cycles & Seasons": "text-indigo-600 border-indigo-300 bg-indigo-50",
}

export default function ToolsPage() {
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<string | null>(null)

  const filtered = TOOLS.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCat = !filterCat || t.category === filterCat
    return matchesSearch && matchesCat
  })

  const grouped: Record<string, Tool[]> = {}
  for (const t of filtered) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">All Tools</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {TOOLS.length} tools for health, wealth, family, education, and personal growth. Everything in one place.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools... (budget, sleep, kids, negotiate, rights...)"
          className="pl-10 h-11" />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat(null)}
          className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors font-medium",
            !filterCat ? "bg-violet-100 border-violet-300 text-violet-700" : "border-border text-muted-foreground hover:bg-muted/50"
          )}>All ({TOOLS.length})</button>
        {CATEGORIES.map(cat => {
          const count = TOOLS.filter(t => t.category === cat).length
          return (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors",
                filterCat === cat ? (CATEGORY_COLORS[cat] || "") + " font-medium" : "border-border text-muted-foreground hover:bg-muted/50"
              )}>{cat} ({count})</button>
          )
        })}
      </div>

      {/* Results */}
      {search && filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          No tools match &quot;{search}&quot;. Try a different search term.
        </CardContent></Card>
      )}

      {/* Grouped tools */}
      <div className="space-y-6">
        {(filterCat ? [filterCat] : CATEGORIES).filter(cat => grouped[cat]?.length > 0).map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{cat}</h2>
              <Badge variant="outline" className={cn("text-[9px]", CATEGORY_COLORS[cat])}>{grouped[cat].length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {grouped[cat].map(tool => {
                const Icon = tool.icon
                return (
                  <a key={tool.href} href={tool.href}>
                    <Card className="card-hover h-full">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          CATEGORY_COLORS[tool.category]?.replace("text-", "text-").split(" ").slice(0, 2).join(" ") || "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{tool.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{tool.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                      </CardContent>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
