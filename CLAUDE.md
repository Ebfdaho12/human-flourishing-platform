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
