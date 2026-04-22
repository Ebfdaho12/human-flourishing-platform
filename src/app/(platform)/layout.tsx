import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { FeedbackButton } from "@/components/layout/FeedbackButton"
import { KeyboardShortcuts } from "@/components/layout/KeyboardShortcuts"
import { SearchOverlay } from "@/components/layout/SearchOverlay"
import { AlyVoice } from "@/components/aly/AlyVoice"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { MilestoneCelebration } from "@/components/dashboard/MilestoneCelebration"
import { ToastProvider } from "@/components/ui/toast-notification"
import { DailyProgress } from "@/components/dashboard/DailyProgress"
import { PageTracker } from "@/components/PageTracker"

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded-lg focus:bg-violet-600 focus:text-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Sidebar — hidden on mobile */}
      <nav className="hidden md:flex md:flex-col md:w-60 md:shrink-0" aria-label="Main navigation">
        <Sidebar />
      </nav>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" role="main">
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </main>
        <MilestoneCelebration />
        <DailyProgress />
        <AlyVoice />
        <FeedbackButton />
        <KeyboardShortcuts />
        <SearchOverlay />
        <PageTracker />
      </div>
    </div>
  )
}
