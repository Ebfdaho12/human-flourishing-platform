import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["argon2"],
  // Performance: compress responses
  compress: true,
  // Performance: optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Performance: reduce JS bundle by excluding unused locales
  experimental: {
    optimizePackageImports: ["lucide-react", "@/components/ui"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
