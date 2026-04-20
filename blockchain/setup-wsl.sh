#!/bin/bash
# Full Solana/Anchor setup for WSL Ubuntu
# Run this inside WSL: bash /mnt/c/Users/skyla/Documents/human-flourishing-platform/blockchain/setup-wsl.sh

set -e
echo "=== HFP Blockchain Toolchain Setup ==="

# 1. System dependencies
echo "Step 1: Installing system dependencies..."
sudo apt-get update -y
sudo apt-get install -y build-essential pkg-config libssl-dev libudev-dev curl git

# 2. Rust
echo "Step 2: Installing Rust..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust already installed: $(rustc --version)"
fi
source "$HOME/.cargo/env"

# 3. Solana CLI
echo "Step 3: Installing Solana CLI..."
if ! command -v solana &> /dev/null; then
    sh -c "$(curl -sSfL https://release.anza.xyz/v2.2.3/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
else
    echo "Solana already installed: $(solana --version)"
fi

# 4. Configure Solana for devnet
echo "Step 4: Configuring Solana devnet..."
solana config set --url devnet
if [ ! -f "$HOME/.config/solana/id.json" ]; then
    solana-keygen new --outfile "$HOME/.config/solana/id.json" --no-bip39-passphrase
fi
echo "Wallet: $(solana address)"

# 5. Get devnet SOL
echo "Step 5: Requesting devnet SOL..."
solana airdrop 2 || echo "Airdrop failed (rate limited). Get SOL from https://faucet.solana.com"

# 6. Install Anchor
echo "Step 6: Installing Anchor..."
if ! command -v anchor &> /dev/null; then
    cargo install --git https://github.com/coral-xyz/anchor avm --force
    avm install 0.29.0
    avm use 0.29.0
else
    echo "Anchor already installed: $(anchor --version)"
fi

# 7. Build FOUND token
echo "Step 7: Building FOUND token program..."
cd /mnt/c/Users/skyla/Documents/human-flourishing-platform/blockchain
anchor build

# 8. Deploy FOUND token
echo "Step 8: Deploying FOUND token to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "=== SETUP COMPLETE ==="
echo "FOUND token deployed to Solana devnet!"
echo "Wallet: $(solana address)"
echo "Balance: $(solana balance)"
echo ""
echo "To deploy VERITAS, run:"
echo "  cd /mnt/c/Users/skyla/Documents/aletheia/blockchain"
echo "  anchor build && anchor deploy"
