# Pre-Flight Checklist — HFP Blockchain

Run this **tonight before Sunday** to catch compilation issues early. Each step has expected output and a fix if it fails. Total time: ~5-15 minutes depending on build speed.

## 0. Environment check

```bash
solana --version
anchor --version   # MUST be 0.29.0 to match Cargo.toml
rustc --version
cargo --version
```

**If anchor is not 0.29.0:**
```bash
avm install 0.29.0
avm use 0.29.0
```

## 1. Syntax-only check (fast, ~30s)

```bash
cd blockchain/
cargo check
```

**Expected:** `Finished dev [unoptimized + debuginfo] target(s) in Xs`

**If errors mention `require_keys_eq` or `checked_add`:** Probably an older anchor-lang. Force 0.29.0:
```toml
# In programs/*/Cargo.toml — already set, but verify:
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

**If errors mention deprecated imports or missing traits:** Copy the exact error and I can fix it.

## 2. Full Anchor build (slow, ~2-5 min first time)

```bash
anchor build
```

**Expected output includes:**
- `Compiling found-token v0.1.0`
- `Compiling hfp-governance v0.1.0`
- `Finished release` (both programs)
- `.so` files created in `target/deploy/`
- IDLs in `target/idl/`

**Verify IDLs exist:**
```bash
ls target/idl/
# Should show: found_token.json  hfp_governance.json
ls target/deploy/
# Should show: found_token.so  hfp_governance.so  (+ keypair.json files once you create them)
```

**If build fails:**
- `error: declare_id! address mismatch` → you've already generated keypairs and the `declare_id!` in source doesn't match `target/deploy/*-keypair.json`. Either re-sync or delete the keypair files and let anchor regenerate.
- `linker error: unable to find...` → missing the Solana BPF toolchain. Run: `rustup target add bpf-unknown-unknown` or `cargo-build-sbf --help` to verify install.

## 3. Pre-deploy sanity (devnet connection + balance)

```bash
solana config get
# Should show devnet as the RPC URL

solana balance
# If 0: solana airdrop 2  (repeat if rate limited)
```

For a full deploy of both programs you need **~3-5 SOL** on devnet.

## 4. Generate program keypairs (only once — BACK THESE UP)

```bash
# Only run this once. The pubkey becomes the permanent program ID.
solana-keygen new --outfile target/deploy/found_token-keypair.json --no-bip39-passphrase
solana-keygen new --outfile target/deploy/hfp_governance-keypair.json --no-bip39-passphrase

# Note the pubkeys:
solana-keygen pubkey target/deploy/found_token-keypair.json
solana-keygen pubkey target/deploy/hfp_governance-keypair.json
```

**Back up both keypair files somewhere safe** (encrypted drive, password manager, cold storage). Losing them means losing the vanity program ID forever.

## 5. Update declare_id! and Anchor.toml

Replace the `FoUnDxxx...` and `GoVeRnxxx...` placeholders with your real pubkeys:

**`programs/found-token/src/lib.rs`** line 17 → `declare_id!("<YOUR_PUBKEY>");`
**`programs/governance/src/lib.rs`** line 15 → `declare_id!("<YOUR_PUBKEY>");`
**`Anchor.toml`** — all three `[programs.*]` sections.

Rebuild after editing:
```bash
anchor build
```

## 6. Ready for Sunday

If steps 1-5 all pass:
```bash
anchor deploy --provider.cluster devnet
```

Expected: `Program Id: ...` for each program. Follow the rest of `DEPLOY.md` from "Step 5 — Create the SPL mints" onward.

---

## Known safe-to-ignore warnings

- `warning: unused variable: '_keep_pct'` — the graduated VOICE burn percentage is calculated but not yet applied (mainnet blocker #1 from DEPLOY.md). Leave for now.
- Rust lints about `#[derive(...)]` being deprecated or `Clone` trait suggestions — these don't affect correctness.

## If anything fails

Copy the full error output (from the first `error:` line) and share it. The most likely issues are:
1. Wrong anchor version (use 0.29.0 exactly)
2. Missing `bpf-unknown-unknown` rust target
3. Deployer wallet has 0 SOL (airdrop)

The code I hardened (`require_keys_eq!`, `checked_add`, etc.) uses only standard anchor-lang 0.29 and std Rust — no new dependencies, no experimental features. It should compile cleanly if the toolchain is correct.
