import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: {
    default: "Human Flourishing Platform",
    template: "%s | Human Flourishing Platform",
  },
  description: "Nine interconnected systems for health, education, governance, and human flourishing — unified under a sovereignty-first identity layer.",
  keywords: ["human flourishing", "health tracking", "education", "governance", "DeSci", "decentralized", "privacy", "ZK proofs"],
  authors: [{ name: "Human Flourishing Platform" }],
  openGraph: {
    title: "Human Flourishing Platform",
    description: "Nine systems. One identity. Your data. Health intelligence, Socratic education, governance transparency, and more.",
    type: "website",
    locale: "en_US",
    siteName: "Human Flourishing Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Flourishing Platform",
    description: "Nine interconnected systems for health, education, and human flourishing.",
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
