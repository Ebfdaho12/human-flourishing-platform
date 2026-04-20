# HFP Blockchain Architecture

## Overview

The Human Flourishing Platform uses a hybrid on-chain/off-chain architecture:
- **On-chain**: Tokens, governance, identity anchors, content proofs
- **Off-chain**: User data, UI, heavy computation (verified via on-chain hashes)
- **Distributed network**: User-contributed hardware replaces centralized servers

## Tokens

### FOUND (Utility Token)
- **Network**: Solana (SPL Token)
- **Supply**: 369,369,369 (hard cap, mint authority burned after distribution)
- **Decimals**: 6
- **Uses**: Stake for VOICE, tip contributors, unlock premium features, node operator rewards
- **Earning**: Platform activity (health logs, learning, civic actions, feedback rewards, node operation)

### VOICE (Governance Token)
- **Network**: Solana (Soulbound SPL — non-transferable)
- **Supply**: Dynamic (minted via FOUND staking, burned on unstake)
- **Uses**: Vote on proposals, elect moderators, shape platform direction
- **Earning**: Stake FOUND (1 VOICE per 1,000 FOUND per 90 days)
- **Graduated burn on unstake**: <90 days: keep 10%, 6-12mo: 50%, 3+ years: 90%

### VERITAS (Aletheia Truth Token)
- **Network**: Solana (SPL Token)
- **Supply**: 369,369,369 (half burned at genesis)
- **Uses**: Stake on claims (1.8x if correct, 30% back if wrong), reward fact-checkers

## Distributed Network (DePIN)

### How It Works
Users contribute idle hardware to the network. Devices run a lightweight node
that handles: data storage, content delivery, computation, and validation.

### Node Types

**Storage Nodes** (Raspberry Pi, NAS, old computers)
- Store encrypted user data shards (no single node has complete data)
- Replicated across 3+ nodes for redundancy
- Earn: 10-50 FOUND/day based on storage contributed + uptime
- Requirements: 10GB+ storage, always-on internet

**Compute Nodes** (PCs, GPUs)
- Process AI insights, search indexing, data analysis
- Handle Aletheia fact-checking computation
- Earn: 50-500 FOUND/day based on compute contributed
- Requirements: 4+ CPU cores, 8GB+ RAM

**Edge Nodes** (Smart TVs, phones, tablets)
- Cache and serve content to nearby users (CDN function)
- Reduce latency by serving from geographically close devices
- Earn: 5-20 FOUND/day based on bandwidth contributed
- Requirements: internet connection, background app running

**Validator Nodes** (higher-spec machines)
- Validate content hashes, verify proofs, anchor data to Solana
- Require FOUND stake (minimum 10,000 FOUND staked)
- Earn: 100-1,000 FOUND/day based on stake + uptime
- Requirements: 8+ cores, 16GB+ RAM, high uptime, FOUND stake

### Security Model
- **Erasure coding**: data split into shards, any 2/3 can reconstruct
- **Encryption**: data encrypted BEFORE leaving user's device
- **Proof of Storage**: nodes must prove they hold data (challenged randomly)
- **Proof of Compute**: computation results verified by multiple nodes
- **Slashing**: nodes that go offline or serve bad data lose staked FOUND

### Why This Beats Cloud
- **Cost**: distributed idle hardware costs 1/10th of AWS/GCP
- **Resilience**: no single point of failure (Amazon outage = doesn't affect us)
- **Privacy**: no company has all the data (sharded across thousands of nodes)
- **Censorship-resistant**: no government can order one company to shut it down
- **Aligned incentives**: node operators earn from the network they support

## Deployment Roadmap

### Phase 1: Solana Token Launch
1. Deploy FOUND SPL token
2. Deploy VOICE soulbound token
3. Build claim bridge (off-chain earnings → on-chain claims)
4. Wallet integration (Phantom, Solflare)
5. On-chain staking (FOUND → VOICE)

### Phase 2: Governance
1. Proposal program (create, vote, execute)
2. Treasury DAO (multisig → full DAO)
3. Moderator elections (VOICE-weighted)

### Phase 3: Aletheia Anchoring
1. Claim hash anchoring on Solana
2. Arweave storage for full narratives
3. Verification proofs (anyone can verify)

### Phase 4: DePIN Network
1. Node software (Rust/Go lightweight daemon)
2. Storage node protocol
3. Compute node protocol
4. Edge caching protocol
5. Proof of Storage/Compute challenges
6. Staking and reward distribution

### Phase 5: Full Decentralization
1. Frontend on IPFS
2. Backend logic in Solana programs
3. Data in distributed network
4. Governance fully on-chain
5. Platform runs without any central team
