// FOUND Token — Solana Program
//
// This is the core token program for the Human Flourishing Platform.
// Built on Solana using the Anchor framework.
//
// FOUND: 369,369,369 hard cap, 6 decimals
// Mint authority burned after initial distribution.
// Nobody — not even the team — can create more tokens.
//
// To build: anchor build
// To deploy: anchor deploy --provider.cluster mainnet
// To test: anchor test

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Burn, Transfer};

declare_id!("FoUnDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); // Replace with actual program ID after first deploy

pub const FOUND_DECIMALS: u8 = 6;
pub const FOUND_TOTAL_SUPPLY: u64 = 369_369_369 * 1_000_000; // 369,369,369 with 6 decimals
pub const VOICE_STAKE_RATIO: u64 = 1_000; // 1,000 FOUND staked = 1 VOICE per 90 days
pub const MIN_STAKE_PERIOD: i64 = 90 * 24 * 60 * 60; // 90 days in seconds

#[program]
pub mod found_token {
    use super::*;

    /// Initialize the FOUND token mint
    /// Called once at deployment. Sets total supply and mints to treasury.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.total_minted = 0;
        treasury.total_burned = 0;
        treasury.mint_authority_burned = false;
        Ok(())
    }

    /// Mint FOUND tokens to a recipient (only before mint authority is burned)
    /// Only callable by the treasury authority set at initialize time.
    pub fn mint_found(ctx: Context<MintFound>, amount: u64) -> Result<()> {
        let treasury = &ctx.accounts.treasury;
        require!(!treasury.mint_authority_burned, ErrorCode::MintAuthorityBurned);
        require_keys_eq!(
            ctx.accounts.authority.key(),
            treasury.authority,
            ErrorCode::Unauthorized
        );
        require!(amount > 0, ErrorCode::InvalidAmount);

        let new_total = treasury
            .total_minted
            .checked_add(amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        require!(new_total <= FOUND_TOTAL_SUPPLY, ErrorCode::ExceedsMaxSupply);

        // Mint tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::mint_to(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        // Update treasury
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_minted = new_total;

        Ok(())
    }

    /// Permanently burn the mint authority — no more FOUND can ever be created
    /// This is irreversible. Once called, the supply is permanently fixed.
    /// Only callable by the treasury authority.
    pub fn burn_mint_authority(ctx: Context<BurnMintAuthority>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        require!(!treasury.mint_authority_burned, ErrorCode::MintAuthorityBurned);
        require_keys_eq!(
            ctx.accounts.authority.key(),
            treasury.authority,
            ErrorCode::Unauthorized
        );

        // Set the mint authority to None — permanently preventing new mints
        token::set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::SetAuthority {
                    current_authority: ctx.accounts.authority.to_account_info(),
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            anchor_spl::token::spl_token::instruction::AuthorityType::MintTokens,
            None, // No authority = nobody can mint
        )?;

        treasury.mint_authority_burned = true;
        msg!("FOUND mint authority permanently burned. Supply is now fixed at {} tokens.", treasury.total_minted);

        Ok(())
    }

    /// Stake FOUND to earn VOICE governance power
    pub fn stake_found(ctx: Context<StakeFound>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Transfer FOUND to staking vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.staker_token_account.to_account_info(),
            to: ctx.accounts.staking_vault.to_account_info(),
            authority: ctx.accounts.staker.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;

        // Record stake
        let stake = &mut ctx.accounts.stake_account;
        stake.owner = ctx.accounts.staker.key();
        stake.amount = stake.amount.checked_add(amount).ok_or(ErrorCode::ArithmeticOverflow)?;
        stake.staked_at = Clock::get()?.unix_timestamp;
        stake.last_voice_claim = Clock::get()?.unix_timestamp;

        msg!("Staked {} FOUND", amount);
        Ok(())
    }

    /// Unstake FOUND with graduated burn based on duration
    ///
    /// NOTE (devnet-safe, mainnet-blocker): This function currently records the
    /// unstake intent but does NOT yet perform the PDA-signed token transfer
    /// from the staking vault back to the staker. That transfer requires a
    /// vault PDA with seeds + bump, which should be added with integration
    /// tests before any mainnet deploy. On devnet users should treat staked
    /// tokens as locked.
    pub fn unstake_found(ctx: Context<UnstakeFound>, amount: u64) -> Result<()> {
        let stake = &mut ctx.accounts.stake_account;
        require_keys_eq!(ctx.accounts.staker.key(), stake.owner, ErrorCode::Unauthorized);
        require!(stake.amount >= amount, ErrorCode::InsufficientStake);

        let now = Clock::get()?.unix_timestamp;
        let duration = now - stake.staked_at;

        // Graduated VOICE burn on unstake
        // < 90 days: keep 10% of earned VOICE
        // 90 days - 6 months: keep 30%
        // 6-12 months: keep 50%
        // 1-3 years: keep 70%
        // 3+ years: keep 90%
        let _keep_pct = if duration < 90 * 86400 { 10u64 }
            else if duration < 180 * 86400 { 30 }
            else if duration < 365 * 86400 { 50 }
            else if duration < 3 * 365 * 86400 { 70 }
            else { 90 };

        // Devnet-safe bookkeeping only — see NOTE on function above.
        // Mainnet requires PDA-signed vault->staker transfer before this ships.
        stake.amount = stake.amount.checked_sub(amount).ok_or(ErrorCode::ArithmeticOverflow)?;

        msg!("Unstaked {} FOUND (staked for {} days)", amount, duration / 86400);
        Ok(())
    }

    /// Register as a network node operator
    pub fn register_node(ctx: Context<RegisterNode>, node_type: NodeType, stake_amount: u64) -> Result<()> {
        let node = &mut ctx.accounts.node_account;
        node.owner = ctx.accounts.operator.key();
        node.node_type = node_type;
        node.staked_amount = stake_amount;
        node.registered_at = Clock::get()?.unix_timestamp;
        node.uptime_score = 100; // starts at 100%
        node.total_earned = 0;
        node.is_active = true;

        msg!("Node registered: type={:?}, stake={}", node_type, stake_amount);
        Ok(())
    }

    /// Reward a node operator for uptime and service.
    /// Only callable by the treasury authority.
    pub fn reward_node(ctx: Context<RewardNode>, amount: u64) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.authority.key(),
            ctx.accounts.treasury.authority,
            ErrorCode::Unauthorized
        );
        let node = &mut ctx.accounts.node_account;
        require!(node.is_active, ErrorCode::NodeInactive);
        node.total_earned = node.total_earned.checked_add(amount).ok_or(ErrorCode::ArithmeticOverflow)?;

        msg!("Node rewarded {} FOUND", amount);
        Ok(())
    }
}

// ─── Account Structures ──────────────────────────────────────────

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_minted: u64,
    pub total_burned: u64,
    pub mint_authority_burned: bool,
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub last_voice_claim: i64,
}

#[account]
pub struct NodeAccount {
    pub owner: Pubkey,
    pub node_type: NodeType,
    pub staked_amount: u64,
    pub registered_at: i64,
    pub uptime_score: u8,  // 0-100
    pub total_earned: u64,
    pub is_active: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum NodeType {
    Storage,   // Raspberry Pi, NAS — store data shards
    Compute,   // PC, GPU — process AI, indexing
    Edge,      // Phone, TV — cache + serve content
    Validator, // High-spec — validate proofs, anchor to Solana
}

// ─── Instruction Contexts ──────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 1)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintFound<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnMintAuthority<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeFound<'info> {
    #[account(init_if_needed, payer = staker, space = 8 + 32 + 8 + 8 + 8)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub staker_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub staking_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub staker: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeFound<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub staker: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterNode<'info> {
    #[account(init, payer = operator, space = 8 + 32 + 1 + 8 + 8 + 1 + 8 + 1)]
    pub node_account: Account<'info, NodeAccount>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardNode<'info> {
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub node_account: Account<'info, NodeAccount>,
    pub authority: Signer<'info>,
}

// ─── Errors ──────────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Mint authority has been permanently burned. No more FOUND can be created.")]
    MintAuthorityBurned,
    #[msg("Minting would exceed the maximum supply of 369,369,369 FOUND.")]
    ExceedsMaxSupply,
    #[msg("Invalid amount. Must be greater than 0.")]
    InvalidAmount,
    #[msg("Insufficient staked amount.")]
    InsufficientStake,
    #[msg("Node is not active.")]
    NodeInactive,
    #[msg("Caller is not the treasury authority.")]
    Unauthorized,
    #[msg("Arithmetic overflow.")]
    ArithmeticOverflow,
}
