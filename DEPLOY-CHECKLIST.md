# Deploy Checklist — Human Flourishing Platform

## CRITICAL: Run Before Testing Cloud Sync

### 1. Run Database Migration on Neon

Go to [Neon Console](https://console.neon.tech/) → Your project → SQL Editor → Paste and run:

```sql
-- Add UserData table for encrypted key-value storage
CREATE TABLE IF NOT EXISTS "UserData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- Add AuditLog table for security audit trail
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserData_userId_key_key" ON "UserData"("userId", "key");
CREATE INDEX IF NOT EXISTS "UserData_userId_idx" ON "UserData"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_resource_idx" ON "AuditLog"("resource");

ALTER TABLE "UserData" ADD CONSTRAINT "UserData_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. Optional Environment Variables (Vercel Dashboard)

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `UPSTASH_REDIS_REST_URL` | Distributed rate limiting | Optional (falls back to in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth | Optional |
| `CRON_SECRET` | Aletheia auto stake resolution | Optional |

### 3. Test Critical Flow

1. Register new account → should land on dashboard with WelcomeFlow
2. Log mood → should see toast "+10 XP"
3. Check off a habit → should see toast "+5 XP"
4. Write gratitude → should see toast "+10 XP"
5. Cmd+K → search should work
6. Check /settings → experience toggles should be there
7. Check /tools → should show 197 tools
8. Check /character-sheet → should show RPG stats

### 4. Solana Deployment (This Weekend)

In WSL:
```bash
cd ~/aletheia  # or wherever the repo is in WSL
solana config set --url devnet
anchor build
anchor deploy
```

Then run the bridge: `npx ts-node blockchain/bridge/claim-tokens.ts`
