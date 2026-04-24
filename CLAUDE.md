# Human Flourishing Platform — Project Guide

## What This Is
Personal sovereignty platform — **320 routes** (pages + APIs), 0 build errors. Health, wealth, education, governance, family, personal growth, gamification, thinking tools, Canada analysis (28 deep pages). Connected to Aletheia Truth Protocol. Both deployed on Vercel + Neon PostgreSQL.

## Live URLs
- HFP: https://human-flourishing-platform.vercel.app
- Aletheia: https://aletheia-truth.vercel.app
- GitHub: Ebfdaho12/human-flourishing-platform + Ebfdaho12/aletheia-protocol

## Tech Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Prisma 5 + PostgreSQL (Neon production)
- NextAuth JWT + Argon2 + AES-256-GCM client-side encryption
- Vercel deployment, auto-deploy on push to main
- Branch: master locally, push to origin/main

## Security Stack
- AES-256-GCM encryption: `src/lib/encrypted-fetch.ts` (secureFetcher, encryptedPost, encryptedPatch)
- CSRF: `src/lib/csrf.ts` + proxy.ts validates on POST/PATCH/PUT/DELETE
- Audit logging: `src/lib/audit.ts` (fire-and-forget, 8 critical routes instrumented)
- Error handling: try-catch on ALL 75+ API routes
- GDPR: /api/user/export, /api/user/delete, /settings/data
- Rate limiting: in-memory + Redis-ready (Upstash) via `src/lib/security.ts`

## Key Patterns
- Pages: `src/app/(platform)/[name]/page.tsx` — "use client", useState, expandable cards
- UI: Card/CardContent, Badge, Input, Button from `@/components/ui/`
- Explain: `<Explain tip="simple">complex term</Explain>` from `@/components/ui/explain`
- Footer: every page ends with 3-5 related links
- Canada: `src/app/(platform)/canada/[topic]/page.tsx` — 11 have AletheiaConnection
- APIs: `src/app/api/[module]/route.ts` with getServerSession + rateLimit + try-catch
- localStorage: prefixed `hfp-` + useSyncedStorage hook for cloud backup
- Encrypted fetch: use `secureFetcher` (SWR), `encryptedPost` (mutations) from encrypted-fetch.ts
- Search: Cmd+K via `src/components/layout/SearchOverlay.tsx` (112 pages indexed)

## Key Infrastructure Files
- `src/lib/encrypted-fetch.ts` — secureFetcher, encryptedPost, encryptedPatch, encryptedDelete
- `src/lib/csrf.ts` — token generation + validation
- `src/lib/audit.ts` — auditLog() fire-and-forget
- `src/lib/security.ts` — rateLimit, rateLimitAsync, sanitizeInput, validatePassword
- `src/hooks/use-synced-storage.ts` — localStorage + debounced API cloud sync
- `src/components/layout/SearchOverlay.tsx` — Cmd+K universal search
- `src/components/dashboard/` — DailyRhythm, SmartSuggestions, HealthSnapshot, MilestoneCelebration
- `src/app/api/user/data/route.ts` — generic UserData key-value store (16 data types)

## Page Architecture
- **Daily Rhythm:** morning-briefing, daily-habits, gratitude, evening-review, trends, correlations
- **Gamification:** character-sheet (RPG stats), flourishing-score, 30-day-challenges, milestones
- **Health:** health, sleep-optimization, nutrition, posture, breathwork, body-composition, strength-training, fascia, cold-exposure, sauna, fasting, peptides, testosterone, supplements, anxiety-toolkit, dopamine, water-tracker, energy-management
- **Mind:** mental-models, cognitive-biases, stoicism, scientific-literacy, decision-journal, communication, book-library
- **Finance:** budget, financial-independence, trajectory, negotiation-guide
- **Life Systems:** life-os, vision-board, people, skill-tree, future-self, focus-timer, my-path
- **Canada:** 28 pages + index

## Sidebar Structure
Daily Rhythm → Health → Modules → Discover → Account

## Tokens (Solana — deploying this weekend)
- FOUND: 369M cap, utility. Programs in `blockchain/programs/found-token/`
- VOICE: governance, soulbound, staking FOUND
- VERITAS: Aletheia truth, claim staking. Programs in aletheia repo
- DePIN: distributed nodes (Storage/Compute/Edge/Validator)

## Aletheia
- 17,517 figures (522 Canadian), 41 funding links, 210 voting records
- Stake resolution: /api/admin/resolve-stakes + /api/cron/resolve-stakes
- XSS sanitization on 7 user-content routes

## Pending Schema Changes
- UserData + AuditLog models need migration on production
- SQL at: prisma/migrations/20260421_add_userdata_auditlog/migration.sql

## Rules
- Never use Anthropic API credits (save for trading system)
- Treat every line as civilization-scale
- Present data, never declare truth. No political labels
- Privacy for people, transparency for institutions

## Git
- `git add -A && git commit -m "msg" && git push origin master:main`

## API Endpoint Index (exact paths — verify before using)

**Mental health:** `/api/mental-health/mood`, `/journal`, `/insights`, `/prompts`, `/resources`
- mood returns `{ moods: [{ id, moodScore, createdAt }] }`

**Health:** `/api/health/entries?type=SLEEP|EXERCISE|MEASUREMENT|VITALS&limit=N`
- returns `{ entries: [{ id, entryType, loggedAt, data }] }`
- Also: `/api/health/trends`, `/insights`, `/sleep-analysis`, `/goals`, `/body-metrics`, `/compare`, `/wearables`, `/cases`

**Habits/goals/streaks:** `/api/habits?months=N`, `/api/goals/all`, `/api/streaks`, `/api/achievements`

**Other:** `/api/dashboard/activity`, `/api/correlations` (GET + POST), `/api/weather`, `/api/weekly-summary`, `/api/digest`, `/api/bookmarks`, `/api/search`, `/api/related`

**Synced storage:** `/api/user/data?key=<apiKey>` (GET) and `/api/user/data` (PUT)

**DO NOT USE (don't exist):** `/api/mood`, `/api/sleep`, `/api/exercise`, `/api/focus-sessions`, `/api/water`. Subagents have guessed these in the past — always confirm a real route exists first.

## localStorage Key Index

Cloud-synced (auto-sync via useSyncedStorage): `hfp-daily-habits`, `hfp-gratitude`, `hfp-water-log`, `hfp-decisions`, `hfp-challenges`, `hfp-people`, `hfp-skills`, `hfp-vision-board`, `hfp-energy-log`, `hfp-body-comp`, `hfp-lunar-logs`, `hfp-evening-review`, `hfp-focus-history`, `hfp-flourishing-history`, `hfp-future-letters`, `hfp-my-path`.

Local-only (not yet cloud-synced): `hfp-budget`, `hfp-net-worth`, `hfp-networth-history`, `hfp-subscriptions`, `hfp-wins`, `hfp-goals`, `hfp-goal-history`, `hfp-weekly-reflections`, `hfp-reading`, `hfp-meals`, `hfp-debts`, `hfp-debt-history`, `hfp-emergency-fund-history`, `hfp-stoic-journal`, `hfp-study-sessions`, `hfp-anxiety-episodes`, `hfp-dopamine-resets`, `hfp-date-nights`, `hfp-nutrition-targets`, `hfp-screen-time`, `hfp-values`, `hfp-planner-YYYY-MM-DD`, `hfp-networth-fi-target`, `hfp-life-wheel-history`, `hfp-life-wheel-self`.

Shapes of load-bearing keys:
- `hfp-budget`: `{ income, expenses: {category, amount}[], monthlyExpenses }`
- `hfp-net-worth`: `{ assets: [{name, type, category, value}], liabilities: [{value}] }`
- `hfp-networth-history`: `{ date, netWorth }[]`
- `hfp-daily-habits` item: `{ id, name, completions: string[], scheduledTime?, trigger? }`

## Pattern Reference Files

Copy patterns from these when deepening:
- Analytics dashboards: `src/app/(platform)/life-os/page.tsx`, `trends/page.tsx`, `insights/page.tsx`
- Journal + analytics: `wins/page.tsx`, `date-nights/page.tsx`, `anxiety-toolkit/page.tsx`
- Calculator with auto-fill: `emergency-fund/page.tsx`, `financial-independence/page.tsx`
- SVG projection curves: `debt-payoff/page.tsx`, `trajectory/page.tsx`
- Radar/donut SVG: `life-wheel/page.tsx`, `wins/page.tsx`

## Agent Workflow Rules

- When given multi-file work: read all files in main thread first, plan exact edits, apply via Edit tool. Only spawn subagents when files need genuinely novel per-file thinking that would otherwise bloat main context.
- Inside subagents: no `npx next build`, use Edit not Write, report only "done" or "error: X".
- One build + one commit per batch, not per file.
- No emojis in UI unless already present in that file.
- Handle empty states — don't show zeros when no data exists, show "keep logging" hints.
