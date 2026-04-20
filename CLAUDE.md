# Human Flourishing Platform — Project Guide

## What This Is
Personal sovereignty platform — 188 pages, 71 API routes, 38 components. Health, wealth, education, governance, family, Canada analysis (28 deep pages). Connected to Aletheia Truth Protocol (separate repo). Both deployed on Vercel + Neon PostgreSQL.

## Live URLs
- HFP: https://human-flourishing-platform.vercel.app
- Aletheia: https://aletheia-truth.vercel.app
- GitHub: Ebfdaho12/human-flourishing-platform + Ebfdaho12/aletheia-protocol

## Tech Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Prisma 5 + PostgreSQL (Neon production, SQLite local)
- NextAuth JWT + Argon2 + AES-256-GCM encryption
- Vercel deployment, auto-deploy on push to main
- Branch: master locally, push to origin/main

## Key Patterns
- Pages: `src/app/(platform)/[name]/page.tsx` — "use client", useState, expandable cards
- UI: Card/CardContent, Badge, Input, Button from `@/components/ui/`
- Explain: `<Explain tip="simple">complex term</Explain>` from `@/components/ui/explain`
- Footer: every page ends with 3-5 related links
- Canada: `src/app/(platform)/canada/[topic]/page.tsx`
- APIs: `src/app/api/[module]/route.ts` with getServerSession + rateLimit
- localStorage: prefixed `hfp-` (hfp-budget, hfp-decisions, etc.)

## Tokens (Solana — in development)
- FOUND: 369M cap, utility. Programs in `blockchain/programs/found-token/`
- VOICE: governance, soulbound, staking FOUND
- VERITAS: Aletheia truth, claim staking. Programs in aletheia repo
- DePIN: distributed nodes (Storage/Compute/Edge/Validator) replace servers

## Social System
- 6 discussion rooms (seeded in production), DMs, accountability partners, family groups, insights
- APIs: /api/community/{rooms,posts,messages,partners,family,insights}

## Aletheia Data
- 17,517 figures (522 Canadian), 41 funding links, 210 voting records
- 65 importers in aletheia/scripts/importers/

## Rules
- Never use Anthropic API credits (save for trading system)
- Treat every line as civilization-scale
- Present data, never declare truth. No political labels
- Privacy for people, transparency for institutions
- Warm theme (#faf9f7), simple explanations (? system)

## Git
- `git add -A && git commit -m "msg" && git push origin master:main`
- Always commit from the correct repo directory
