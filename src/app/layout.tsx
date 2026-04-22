import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: {
    default: "Human Flourishing Platform — Free Tools for Health, Wealth, and Truth",
    template: "%s | Human Flourishing Platform",
  },
  description: "330+ free tools for health optimization, financial independence, mental models, daily habits, and civic accountability. Zero-knowledge encrypted. No ads. No tracking. Your data is yours. Earn tokens by contributing. Thrive with the Hive.",
  keywords: ["human flourishing", "health tracking", "daily habits", "financial independence", "mental models", "cognitive biases", "cold exposure", "fasting", "peptides", "supplements", "breathwork", "RPG life", "gamification", "truth protocol", "accountability", "privacy", "encrypted", "free"],
  authors: [{ name: "Human Flourishing Platform" }],
  openGraph: {
    title: "Human Flourishing Platform",
    description: "330+ free tools for health, wealth, mind, and truth. RPG gamification. AI-powered insights. Military-grade encryption. No ads. No tracking. Earn tokens by contributing.",
    type: "website",
    locale: "en_US",
    siteName: "Human Flourishing Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Flourishing Platform",
    description: "330+ free tools for health, wealth, and truth. RPG stats. Daily quests. Encrypted. No ads. Earn by contributing.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (!localStorage.getItem('hfp-theme-v2')) {
              localStorage.setItem('hfp-theme', 'light');
              localStorage.setItem('hfp-theme-v2', '1');
            }
            if (localStorage.getItem('hfp-theme') === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        `}} />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased" role="application" aria-label="Human Flourishing Platform">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
