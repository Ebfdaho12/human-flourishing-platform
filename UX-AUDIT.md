# HFP UX Audit — 2026-04-24

Quick-hit observations from a fresh read of the core user-journey surfaces (layout, dashboard, welcome flow, topnav, sidebar). Ranked by impact-per-effort.

Not proposals to execute now — these are decisions for you to make when you have bandwidth. Each has a note on how much work it actually is.

## 1. Dashboard overload — 17+ sections on one page (HIGH impact, MEDIUM effort)

`src/app/(platform)/dashboard/page.tsx` renders, in order:

1. Welcome header
2. WelcomeFlow (new users)
3. StreakRecovery
4. DailyRhythm
5. SmartSuggestions
6. DailyCheckIn
7. 4 stat cards (FOUND / VOICE / claims / modules)
8. HiveActivity
9. LevelUnlocks
10. HealthSnapshot
11. StreakWidget
12. Quick Access (8 tools + 6 more links)
13. WhatsNew
14. Discover
15. ModuleStats
16. ActivityFeed
17. ModuleGrid

A new user scrolls through all of this on arrival. Even returning users see the same wall daily. **The fix isn't cutting — it's conditional rendering.** Components like StreakRecovery, LevelUnlocks, WhatsNew, Discover, HiveActivity should self-hide when they have nothing to show, rather than rendering empty states that add noise.

**Tactical approach:**
- Each dashboard section returns `null` when its data is empty/irrelevant, not a placeholder card.
- Order by "what do I need to do TODAY?" first, then progress, then discovery, then modules.
- Optional: a `<DashboardDensity>` toggle (compact vs full) persisted to localStorage.

## 2. Quick Access is not personalized (HIGH impact, LOW effort)

The 8 hardcoded Quick Access tiles (Budget, Health, Planner, Family Meeting, Quick Notes, Focus Timer, Mental Health, Goals) are the same for everyone. With 334 routes, the user's *actual* most-used tools probably aren't these.

**Already have the data:** `PageTracker` stores `hfp-pages-visited`. But it's a set (no counts), so "most visited" isn't computable.

**Low-effort upgrade:**
1. Extend PageTracker to store `Record<path, { count, lastVisited }>` (backward-compat: migrate on read).
2. Replace hardcoded tiles with user's top 6 frequently-visited routes (excluding dashboard itself).
3. Keep 2 suggested tiles for users with <10 visits as onboarding.

Estimated effort: ~40 lines.

## 3. DailyRhythm + DailyCheckIn — overlapping purpose (MEDIUM impact, LOW effort)

Both appear to prompt daily engagement. Not clear to a user how they differ. Worth inspecting both components and either consolidating or making their roles visually distinct.

## 4. Agent API + /agent-hub are invisible to users (LOW impact, LOW effort)

The post-app-future work we built lives at `/agent-hub` and under `/api/agent/*`. Neither is linked from the dashboard or sidebar. Users won't find it. Add a "For developers / agents" link or a single tile on the dashboard.

## 5. Static section order doesn't reflect priority (LOW impact, MEDIUM effort)

HiveActivity (social proof) sits between stat cards and LevelUnlocks (gamification). HealthSnapshot — the most actionable personal data — is buried in the middle. On a mobile device scrolling from top, priority should be:

1. Today's rhythm (do-this-now)
2. Personal snapshot (mood/sleep/money at a glance)
3. Progress + streaks
4. Rewards + levels
5. Social/community
6. Deep tools (module grid at the end)

## 6. Accessibility is solid (observation, not an action)

Layout has a proper skip-to-content link, `role="main"`, `aria-label` on nav, and keyboard shortcuts. TopNav's search button has aria-label. Good foundation — don't regress this when restructuring.

## 7. Mobile is handled but unverified (MEDIUM impact, needs testing)

`<MobileNav />` is referenced in TopNav, so there IS a mobile menu. But I haven't verified it renders correctly, that the dense dashboard survives a 375px viewport, or that chart-heavy pages (correlations, trends, insights) look acceptable on mobile. **Worth a manual pass in Chrome DevTools device mode.**

## 8. The 334-route discoverability problem (HIGH impact, HIGH effort)

This is the deepest issue. Even with Cmd+K search + SearchOverlay (112 pages indexed), users don't know what exists until they stumble onto it. A fresh user hits `/dashboard`, sees 8 Quick Access tools, and has no map of the remaining 326 pages.

**Possible directions (pick one or none):**
- **Knowledge map visualization** — `/knowledge-map` exists; surface it prominently.
- **"What should I do about X?" prompt** — user types a problem, gets a curated route list. Could use LLM or a keyword index.
- **Personalized landing** — based on onboarding answers, show a 6-tool starter kit sized to their goals.

## Priority if I were picking 3 to ship

1. **Quick Access personalization** (item 2) — highest ROI, ~40 lines.
2. **Conditional dashboard rendering** (item 1) — every section self-hides when irrelevant.
3. **Mobile verification pass** (item 7) — not code, just DevTools audit with notes.

Items 4, 5, 8 are bigger questions about product direction. Item 8 especially is "how should users discover 300+ routes" — a platform-shape question, not a UX bug.
