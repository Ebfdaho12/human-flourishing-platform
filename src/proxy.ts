import { withAuth } from "next-auth/middleware"
import { validateCsrf } from "@/lib/csrf"
import { NextRequest } from "next/server"

/**
 * Auth Proxy — protects all platform pages and API routes
 *
 * Next.js 16 uses proxy.ts instead of middleware.ts.
 * This ensures unauthenticated users are redirected to /login
 * for all protected routes. Individual API routes still do their
 * own session checks (defense in depth).
 *
 * CSRF protection: state-changing requests (POST/PATCH/PUT/DELETE) to /api/*
 * must include a valid x-csrf-token header matching the csrf-token cookie.
 * NextAuth routes (/api/auth/*) are excluded — NextAuth has its own CSRF.
 *
 * Public routes (no auth): /, /login, /register, /verify-email, /api/auth/*
 */

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
})

export default async function proxy(request: NextRequest) {
  // CSRF check runs first — reject invalid mutations before auth
  const csrfError = validateCsrf(request)
  if (csrfError) return csrfError

  // Delegate to NextAuth's withAuth for authentication
  return (authMiddleware as any)(request, {} as any)
}

export const config = {
  matcher: [
    // Core platform pages
    "/dashboard/:path*",
    "/profile/:path*",
    "/wallet/:path*",
    "/settings/:path*",
    "/admin/:path*",

    // Core modules
    "/foundation/:path*",
    "/health/:path*",
    "/education/:path*",
    "/governance/:path*",
    "/energy/:path*",
    "/desci/:path*",
    "/economics/:path*",
    "/infrastructure/:path*",
    "/mental-health/:path*",

    // Financial tools
    "/budget/:path*",
    "/net-worth/:path*",
    "/debt-payoff/:path*",
    "/compound-interest/:path*",
    "/tax-estimator/:path*",
    "/subscriptions/:path*",
    "/cost-of-living/:path*",
    "/negotiation/:path*",
    "/side-hustles/:path*",

    // Family
    "/family-economics/:path*",
    "/family-meeting/:path*",
    "/screen-time/:path*",
    "/kids-chores/:path*",
    "/date-nights/:path*",
    "/meal-planner/:path*",
    "/relationships/:path*",

    // Personal growth
    "/life-wheel/:path*",
    "/values/:path*",
    "/vision/:path*",
    "/skills/:path*",
    "/career-path/:path*",
    "/decisions/:path*",
    "/wins/:path*",
    "/reading/:path*",
    "/challenges/:path*",
    "/habit-stack/:path*",

    // Productivity
    "/planner/:path*",
    "/routine/:path*",
    "/focus/:path*",
    "/notes/:path*",
    "/goals/:path*",

    // Home
    "/home-maintenance/:path*",
    "/preparedness/:path*",
    "/food-system/:path*",

    // Education
    "/civilizations/:path*",
    "/money-history/:path*",
    "/logical-fallacies/:path*",
    "/media-ownership/:path*",
    "/rights/:path*",

    // Other
    "/workforce/:path*",
    "/sleep-calculator/:path*",
    "/tools/:path*",
    "/explore/:path*",
    "/timeline/:path*",
    "/digest/:path*",
    "/community/:path*",
    "/bookmarks/:path*",
    "/report-issue/:path*",
    "/onboarding/:path*",
    "/getting-started/:path*",
    "/tokens/:path*",
    "/correlations/:path*",
    "/knowledge/:path*",
    "/habits/:path*",
    "/emergency/:path*",

    // Newer pages
    "/accountability/:path*",
    "/family-group/:path*",
    "/insights/:path*",
    "/knowledge-map/:path*",
    "/quiz/:path*",
    "/progress/:path*",
    "/favorites/:path*",
    "/data-backup/:path*",
    "/promise-tracker/:path*",
    "/birth-fund/:path*",
    "/financial-dashboard/:path*",
    "/real-hourly-rate/:path*",
    "/emergency-fund/:path*",
    "/credit-score/:path*",
    "/first-job/:path*",
    "/rent-vs-buy/:path*",
    "/car-buying/:path*",
    "/kids-finance/:path*",
    "/marriage-finance/:path*",
    "/money-relationship/:path*",
    "/side-income-tax/:path*",
    "/insurance-guide/:path*",
    "/estate-planning/:path*",
    "/elder-care/:path*",
    "/divorce-finance/:path*",
    "/difficult-conversations/:path*",
    "/grief/:path*",
    "/digital-legacy/:path*",
    "/conflict-resolution/:path*",
    "/community-resources/:path*",
    "/propaganda/:path*",
    "/statistics-guide/:path*",
    "/philosophy/:path*",
    "/how-laws-work/:path*",
    "/democracy-history/:path*",
    "/memory-techniques/:path*",
    "/habit-science/:path*",
    "/time-management/:path*",
    "/critical-thinking/:path*",
    "/cooking/:path*",
    "/marriage-health/:path*",
    "/family-constitution/:path*",
    "/gut-health/:path*",
    "/dental-health/:path*",
    "/eye-health/:path*",
    "/hormone-health/:path*",
    "/pain-management/:path*",
    "/mens-health/:path*",
    "/womens-health/:path*",
    "/parenting/:path*",
    "/inflation/:path*",
    "/retirement/:path*",
    "/investing/:path*",
    "/fascia/:path*",
    "/chinese-zodiac/:path*",
    "/lunar-cycles/:path*",
    "/morning-briefing/:path*",

    // API routes (returns 401 instead of redirect)
    "/api/bookmarks/:path*",
    "/api/health/:path*",
    "/api/mental-health/:path*",
    "/api/wallet/:path*",
    "/api/feedback/:path*",
    "/api/search/:path*",
    "/api/streaks/:path*",
    "/api/digest/:path*",
    "/api/desci/:path*",
    "/api/education/:path*",
    "/api/correlations/:path*",
    "/api/community/:path*",
  ],
}
