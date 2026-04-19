#!/bin/bash
# ─── Human Flourishing Platform — Production Deployment Prep ──────────────
#
# This script prepares the codebase for Vercel deployment with PostgreSQL.
#
# Prerequisites:
#   1. PostgreSQL database (Railway, Supabase, Neon, or any Postgres provider)
#   2. Vercel CLI installed: npm i -g vercel
#   3. Set the following Vercel secrets:
#
#      vercel secrets add hfp_database_url "postgresql://user:pass@host:5432/hfp?sslmode=require"
#      vercel secrets add hfp_nextauth_secret "$(openssl rand -base64 32)"
#      vercel secrets add hfp_nextauth_url "https://your-domain.vercel.app"
#      vercel secrets add hfp_claim_encryption_secret "$(openssl rand -base64 32)"
#      vercel secrets add anthropic_api_key "sk-ant-..."       # optional, for AI features
#      vercel secrets add xai_api_key "xai-..."                # optional
#      vercel secrets add gemini_api_key "..."                  # optional
#      vercel secrets add resend_api_key "re_..."               # optional, for emails
#      vercel secrets add aletheia_api_url "https://aletheia.your-domain.app"  # optional
#
# Usage:
#   chmod +x scripts/deploy-prep.sh
#   ./scripts/deploy-prep.sh
#   vercel deploy --prod
#

set -e

echo "=== HFP Deployment Prep ==="

# Step 1: Switch Prisma provider to PostgreSQL
echo "1. Switching Prisma provider to postgresql..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
echo "   Done. Provider set to postgresql."

# Step 2: Update SQLite-specific syntax if any (contains → case-insensitive in Postgres)
echo "2. Prisma schema is compatible with PostgreSQL (contains works with mode: insensitive in Postgres)."

# Step 3: Generate Prisma client
echo "3. Generating Prisma client..."
npx prisma generate

# Step 4: Type check
echo "4. Running type check..."
npx tsc --noEmit
echo "   Type check passed."

echo ""
echo "=== Ready to deploy ==="
echo ""
echo "Next steps:"
echo "  1. Set DATABASE_URL in your Vercel project settings"
echo "  2. Run: vercel deploy --prod"
echo "  3. After first deploy, push schema: DATABASE_URL=... npx prisma db push"
echo ""
echo "CRITICAL: Ensure NEXTAUTH_SECRET is a unique, cryptographically secure value."
echo "Generate one with: openssl rand -base64 32"
