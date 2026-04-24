# HFP Blockchain — Devnet Deploy Playbook

This is the exact sequence for deploying **FOUND** and **Governance** Solana programs to devnet. Mainnet blockers are called out inline so you can't accidentally ship them.

## Prereqs (one-time)

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
solana --version

# Rust + BPF toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup component add rustfmt clippy

# Anchor (pin to 0.29.0 — matches Cargo.toml)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
anchor --version

# Configure Solana for devnet
solana config set --url devnet
```

If you're on Windows, `setup-wsl.sh` in this directory bootstraps the WSL environment.

## Step 1 — Generate deployer + program keypairs

```bash
cd blockchain/

# Deployer wallet (pays for deploy; keep this keypair backed up)
solana-keygen new --outfile ~/.config/solana/id.json
solana address   # your deployer pubkey

# Airdrop devnet SOL (each call = 1 SOL; may need 3-5 to deploy both programs)
solana airdrop 2
solana airdrop 2
solana balance

# Program keypairs (these become the program IDs)
mkdir -p target/deploy
solana-keygen new --outfile target/deploy/found_token-keypair.json
solana-keygen new --outfile target/deploy/hfp_governance-keypair.json

# Get the pubkeys — these replace the placeholders
solana-keygen pubkey target/deploy/found_token-keypair.json
solana-keygen pubkey target/deploy/hfp_governance-keypair.json
```

**Back up all three keypair files.** Losing the program keypair before deploy means losing the vanity program ID. Losing it after means losing upgrade authority.

## Step 2 — Replace placeholder program IDs

Three places per program:

**`programs/found-token/src/lib.rs`** line 17:
```rust
declare_id!("<PASTE found_token pubkey>");
```

**`programs/governance/src/lib.rs`** line 15:
```rust
declare_id!("<PASTE hfp_governance pubkey>");
```

**`Anchor.toml`** — update all three `[programs.*]` sections:
```toml
[programs.localnet]
found_token = "<found_token pubkey>"
hfp_governance = "<hfp_governance pubkey>"

[programs.devnet]
found_token = "<found_token pubkey>"
hfp_governance = "<hfp_governance pubkey>"

[programs.mainnet]
found_token = "<found_token pubkey>"
hfp_governance = "<hfp_governance pubkey>"
```

## Step 3 — Build

```bash
anchor build
```

Successful output puts `.so` files in `target/deploy/` and IDLs in `target/idl/`.

If build fails with `address mismatch`, it means the source `declare_id!` doesn't match the keypair file. Re-sync step 2.

## Step 4 — Deploy

```bash
anchor deploy --provider.cluster devnet
```

Expected output: `Program Id: ...` for each program. Copy these (should match step 2).

Verify on devnet:
```bash
solana program show <program_id> --url devnet
```

## Step 5 — Create the SPL mints

Programs don't create mints — you do, before calling `initialize`.

```bash
# FOUND mint (6 decimals)
spl-token create-token --decimals 6 --url devnet
# note the mint address

# FOUND treasury token account
spl-token create-account <FOUND_MINT> --url devnet
```

## Step 6 — Copy IDLs into the frontend

After a successful build, Anchor generates TypeScript type files:

```bash
# From the blockchain/ directory:
mkdir -p ../src/lib/solana
cp target/idl/found_token.json ../src/lib/solana/
cp target/idl/hfp_governance.json ../src/lib/solana/
cp target/types/found_token.ts ../src/lib/solana/
cp target/types/hfp_governance.ts ../src/lib/solana/
```

## Step 7 — Frontend wiring (does NOT exist yet)

The web app has zero Solana dependencies. Before Step 7 works you need:

```bash
cd ..   # back to repo root
npm install @solana/web3.js @coral-xyz/anchor \
  @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets @solana/wallet-adapter-base
```

Then create `src/lib/solana/client.ts` with:
- `AnchorProvider` wired to the user's connected wallet
- `Program` instances for FOUND + Governance using the imported IDLs
- Helper functions: `getTreasury()`, `stakeFound()`, `createProposal()`, `castVote()`

Wallet UI: use `<WalletMultiButton />` from `@solana/wallet-adapter-react-ui`. Wrap `src/app/layout.tsx` in `<ConnectionProvider>` + `<WalletProvider>`.

## Step 8 — Smoke test

Hit each entry point once from a wallet-connected page:
1. `initialize` (treasury + governance state — one-time)
2. `mint_found` (treasury authority mints a test batch)
3. `stake_found` (any user stakes)
4. `create_proposal` (needs VOICE — after voting infra is complete)

## Mainnet blockers — do NOT deploy to mainnet until these are fixed

These were intentionally left for devnet testing and MUST be fixed with test coverage before mainnet:

1. **`unstake_found` does not actually return tokens from the vault.** Requires converting `staking_vault` to a PDA with seeds + bump, and calling `token::transfer` with `with_signer(&[&[seeds, &[bump]]])`. Tokens currently stay locked in the vault.
2. **`resolve_claim` in the VERITAS program has the same issue** — payout is recorded but not transferred.
3. **`initialize` does not create the SPL Mint.** Currently you must `spl-token create-token` manually before calling. For mainnet, move the mint into the Anchor `init` constraint so the whole flow is atomic.
4. **`StakeAccount` uses `init_if_needed` without PDA seeds.** A staker's second stake would either fail (if account exists as a regular init) or could clobber depending on client. Needs seeds like `[b"stake", staker.key().as_ref()]`.
5. **No integration tests.** `anchor test` with a local validator should cover every public instruction and common failure modes before mainnet.
6. **Upgrade authority.** After the first deploy, program upgrade authority defaults to the deployer. For mainnet, consider transferring to a multisig or burning once stable (`solana program set-upgrade-authority <program_id> --final`).
7. **External security review.** A dedicated Solana/Anchor auditor reviews before mainnet. This is non-negotiable for token economics.

## Defaults that matter

- FOUND total supply: `369_369_369 * 10^6` (6 decimals)
- VOICE stake ratio: 1000 FOUND : 1 VOICE per 90 days
- Minimum stake period: 90 days
- Governance: 10% quorum, 51% pass threshold, 7-day voting period, 100 VOICE to propose

## Rollback

If a devnet deploy is broken:
```bash
# Redeploy on top — Anchor upgrades the existing program ID
anchor upgrade target/deploy/found_token.so --program-id <found_token_pubkey>
```

To abandon a program entirely and start fresh: generate new keypairs, update `declare_id!` and `Anchor.toml`, rebuild, deploy. The old program stays at its address but you stop calling it.
