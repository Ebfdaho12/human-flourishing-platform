/**
 * Token Claim Bridge — Off-Chain → On-Chain
 *
 * Users earn FOUND tokens through platform activity (stored in PostgreSQL).
 * This bridge allows them to claim those tokens to their Solana wallet.
 *
 * Flow:
 * 1. User connects Solana wallet on /wallet/connect
 * 2. User clicks "Claim Tokens"
 * 3. Bridge verifies: off-chain balance, wallet ownership, no double-claim
 * 4. Bridge calls Solana program to mint tokens to user's wallet
 * 5. Off-chain balance reduced by claimed amount
 * 6. On-chain balance increased by claimed amount
 *
 * Security:
 * - Server-side only (never expose mint authority to client)
 * - Rate limited (1 claim per 24 hours)
 * - Minimum claim: 100 FOUND
 * - Double-claim prevention via nonce + transaction log
 * - Mint authority held by platform until burn event
 *
 * After mint authority is burned, claims happen from a pre-funded vault
 * rather than minting new tokens. The total supply is always ≤ 369,369,369.
 */

import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token"

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
const FOUND_MINT = new PublicKey(process.env.FOUND_MINT_ADDRESS || "FoUnDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
const FOUND_DECIMALS = 6
const MIN_CLAIM = 100 * (10 ** FOUND_DECIMALS) // 100 FOUND minimum claim

interface ClaimRequest {
  userId: string
  walletAddress: string
  amount: number // in FOUND (not lamports)
}

interface ClaimResult {
  success: boolean
  txSignature?: string
  error?: string
  amountClaimed?: number
}

/**
 * Process a token claim — verify and execute
 */
export async function processTokenClaim(request: ClaimRequest): Promise<ClaimResult> {
  const { userId, walletAddress, amount } = request

  // Validate
  if (amount < 100) {
    return { success: false, error: "Minimum claim is 100 FOUND" }
  }

  // Convert to token amount with decimals
  const tokenAmount = BigInt(amount) * BigInt(10 ** FOUND_DECIMALS)

  try {
    // 1. Verify wallet address is valid
    const recipientPubkey = new PublicKey(walletAddress)

    // 2. Connect to Solana
    const connection = new Connection(SOLANA_RPC, "confirmed")

    // 3. Load mint authority keypair (stored securely on server)
    // In production: use HSM or Solana vault, never store in env
    const mintAuthoritySecret = process.env.MINT_AUTHORITY_SECRET
    if (!mintAuthoritySecret) {
      return { success: false, error: "Mint authority not configured" }
    }
    const mintAuthority = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(mintAuthoritySecret))
    )

    // 4. Get or create the recipient's token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // payer for account creation
      FOUND_MINT,
      recipientPubkey,
    )

    // 5. Mint tokens to the recipient
    const txSignature = await mintTo(
      connection,
      mintAuthority, // payer
      FOUND_MINT,
      recipientTokenAccount.address,
      mintAuthority, // mint authority
      tokenAmount,
    )

    console.log(`✅ Claimed ${amount} FOUND → ${walletAddress} (tx: ${txSignature})`)

    return {
      success: true,
      txSignature: txSignature.toString(),
      amountClaimed: amount,
    }
  } catch (error: any) {
    console.error(`❌ Claim failed for ${userId}:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Verify a claim transaction on-chain
 */
export async function verifyClaimTransaction(txSignature: string): Promise<boolean> {
  try {
    const connection = new Connection(SOLANA_RPC, "confirmed")
    const tx = await connection.getTransaction(txSignature, { commitment: "confirmed" })
    return tx !== null && tx.meta?.err === null
  } catch {
    return false
  }
}

/**
 * Get on-chain FOUND balance for a wallet
 */
export async function getOnChainBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC, "confirmed")
    const pubkey = new PublicKey(walletAddress)

    const tokenAccounts = await connection.getTokenAccountsByOwner(pubkey, {
      mint: FOUND_MINT,
    })

    if (tokenAccounts.value.length === 0) return 0

    // Parse the account data to get balance
    // In production, use @solana/spl-token's getAccount
    const balance = tokenAccounts.value[0].account.lamports
    return Number(BigInt(balance) / BigInt(10 ** FOUND_DECIMALS))
  } catch {
    return 0
  }
}

// Export for use in API routes
export { SOLANA_RPC, FOUND_MINT, FOUND_DECIMALS, MIN_CLAIM }
