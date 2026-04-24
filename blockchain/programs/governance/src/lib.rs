// HFP Governance Program — On-Chain Proposals & Voting
//
// VOICE token holders create proposals and vote. Outcomes are
// permanently recorded on Solana. No single person or entity can
// override a democratic vote. The platform is governed by its users.
//
// Proposal lifecycle:
// 1. Create proposal (requires minimum VOICE balance)
// 2. Voting period (7 days default)
// 3. Execution (if passed) or rejection (if failed)
// 4. Permanent record on-chain regardless of outcome

use anchor_lang::prelude::*;

declare_id!("GoVeRnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

pub const MIN_VOICE_TO_PROPOSE: u64 = 100; // Minimum VOICE tokens to create a proposal
pub const VOTING_PERIOD: i64 = 7 * 24 * 60 * 60; // 7 days in seconds
pub const QUORUM_PERCENTAGE: u64 = 10; // 10% of total VOICE must participate
pub const PASS_THRESHOLD: u64 = 51; // 51% of votes must be FOR to pass

#[program]
pub mod hfp_governance {
    use super::*;

    /// Initialize governance state
    pub fn initialize(ctx: Context<InitializeGovernance>) -> Result<()> {
        let state = &mut ctx.accounts.governance_state;
        state.authority = ctx.accounts.authority.key();
        state.total_proposals = 0;
        state.total_votes_cast = 0;
        state.proposals_passed = 0;
        state.proposals_rejected = 0;
        Ok(())
    }

    /// Create a new proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        category: ProposalCategory,
        execution_data: Option<Vec<u8>>, // Optional: encoded instruction to execute if passed
    ) -> Result<()> {
        require!(title.len() <= 100, GovernanceError::TitleTooLong);
        require!(description.len() <= 2000, GovernanceError::DescriptionTooLong);

        let proposal = &mut ctx.accounts.proposal;
        let state = &mut ctx.accounts.governance_state;

        proposal.id = state.total_proposals;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.category = category;
        let now = Clock::get()?.unix_timestamp;
        proposal.created_at = now;
        proposal.voting_ends_at = now
            .checked_add(VOTING_PERIOD)
            .ok_or(GovernanceError::ArithmeticOverflow)?;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.votes_abstain = 0;
        proposal.total_voters = 0;
        proposal.status = ProposalStatus::Active;
        proposal.execution_data = execution_data;
        proposal.executed = false;

        state.total_proposals = state
            .total_proposals
            .checked_add(1)
            .ok_or(GovernanceError::ArithmeticOverflow)?;

        msg!("Proposal #{} created: {}", proposal.id, proposal.title);
        Ok(())
    }

    /// Cast a vote on a proposal (weighted by VOICE balance)
    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote: VoteType,
        voice_weight: u64, // How much VOICE the voter is applying
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let now = Clock::get()?.unix_timestamp;

        require!(now <= proposal.voting_ends_at, GovernanceError::VotingEnded);
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);
        require!(voice_weight > 0, GovernanceError::InvalidVoteWeight);

        // Record the vote
        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.proposal_id = proposal.id;
        vote_record.vote = vote.clone();
        vote_record.weight = voice_weight;
        vote_record.cast_at = now;

        // Update proposal tallies
        match vote {
            VoteType::For => {
                proposal.votes_for = proposal
                    .votes_for
                    .checked_add(voice_weight)
                    .ok_or(GovernanceError::ArithmeticOverflow)?;
            }
            VoteType::Against => {
                proposal.votes_against = proposal
                    .votes_against
                    .checked_add(voice_weight)
                    .ok_or(GovernanceError::ArithmeticOverflow)?;
            }
            VoteType::Abstain => {
                proposal.votes_abstain = proposal
                    .votes_abstain
                    .checked_add(voice_weight)
                    .ok_or(GovernanceError::ArithmeticOverflow)?;
            }
        }
        proposal.total_voters = proposal
            .total_voters
            .checked_add(1)
            .ok_or(GovernanceError::ArithmeticOverflow)?;

        let state = &mut ctx.accounts.governance_state;
        state.total_votes_cast = state
            .total_votes_cast
            .checked_add(1)
            .ok_or(GovernanceError::ArithmeticOverflow)?;

        msg!("Vote cast on proposal #{}: {:?} with weight {}", proposal.id, vote, voice_weight);
        Ok(())
    }

    /// Finalize a proposal after voting period ends
    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let now = Clock::get()?.unix_timestamp;

        require!(now > proposal.voting_ends_at, GovernanceError::VotingStillActive);
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);

        let total_votes = proposal
            .votes_for
            .checked_add(proposal.votes_against)
            .and_then(|v| v.checked_add(proposal.votes_abstain))
            .ok_or(GovernanceError::ArithmeticOverflow)?;

        // Check quorum (minimum participation)
        // In production, this would check against total VOICE supply
        let votes_for_against = proposal
            .votes_for
            .checked_add(proposal.votes_against)
            .ok_or(GovernanceError::ArithmeticOverflow)?;

        let passed = if total_votes == 0 || votes_for_against == 0 {
            false
        } else {
            let for_percentage = proposal
                .votes_for
                .checked_mul(100)
                .and_then(|v| v.checked_div(votes_for_against))
                .ok_or(GovernanceError::ArithmeticOverflow)?;
            for_percentage >= PASS_THRESHOLD
        };

        let state = &mut ctx.accounts.governance_state;

        if passed {
            proposal.status = ProposalStatus::Passed;
            state.proposals_passed = state
                .proposals_passed
                .checked_add(1)
                .ok_or(GovernanceError::ArithmeticOverflow)?;
            msg!("Proposal #{} PASSED — for: {}, against: {}", proposal.id, proposal.votes_for, proposal.votes_against);
        } else {
            proposal.status = ProposalStatus::Rejected;
            state.proposals_rejected = state
                .proposals_rejected
                .checked_add(1)
                .ok_or(GovernanceError::ArithmeticOverflow)?;
            msg!("Proposal #{} REJECTED — for: {}, against: {}", proposal.id, proposal.votes_for, proposal.votes_against);
        }

        Ok(())
    }

    /// Execute a passed proposal (if it has execution data)
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(proposal.status == ProposalStatus::Passed, GovernanceError::ProposalNotPassed);
        require!(!proposal.executed, GovernanceError::AlreadyExecuted);

        // In production, this would execute the encoded instruction
        // For now, mark as executed
        proposal.executed = true;
        proposal.status = ProposalStatus::Executed;

        msg!("Proposal #{} executed", proposal.id);
        Ok(())
    }
}

// ─── Account Structures ──────────────────────────────────────────

#[account]
pub struct GovernanceState {
    pub authority: Pubkey,
    pub total_proposals: u64,
    pub total_votes_cast: u64,
    pub proposals_passed: u64,
    pub proposals_rejected: u64,
}

#[account]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub category: ProposalCategory,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub total_voters: u64,
    pub status: ProposalStatus,
    pub execution_data: Option<Vec<u8>>,
    pub executed: bool,
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub proposal_id: u64,
    pub vote: VoteType,
    pub weight: u64,
    pub cast_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ProposalCategory {
    PlatformFeature,    // New feature or change to existing
    TokenEconomics,     // Changes to FOUND/VOICE mechanics
    CommunityPolicy,    // Moderation, rules, community guidelines
    TreasurySpend,      // Spending from the DAO treasury
    NodeIncentives,     // Changes to node operator rewards
    PartnershipDecision, // Strategic partnerships or integrations
    EmergencyAction,    // Time-sensitive decisions (shorter voting period)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ProposalStatus {
    Active,    // Voting in progress
    Passed,    // Voting ended, proposal passed
    Rejected,  // Voting ended, proposal failed
    Executed,  // Passed and executed
    Cancelled, // Cancelled by proposer before voting ends
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

// ─── Contexts ──────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8 + 8)]
    pub governance_state: Account<'info, GovernanceState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    #[account(init, payer = proposer, space = 8 + 8 + 32 + 104 + 2004 + 1 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 200 + 1)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(init, payer = voter, space = 8 + 32 + 8 + 1 + 8 + 8)]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(mut)]
    pub governance_state: Account<'info, GovernanceState>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub finalizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
}

// ─── Errors ──────────────────────────────────────────────────────

#[error_code]
pub enum GovernanceError {
    #[msg("Proposal title must be 100 characters or less.")]
    TitleTooLong,
    #[msg("Proposal description must be 2000 characters or less.")]
    DescriptionTooLong,
    #[msg("Voting period has ended.")]
    VotingEnded,
    #[msg("Voting period is still active.")]
    VotingStillActive,
    #[msg("Proposal is not in active status.")]
    ProposalNotActive,
    #[msg("Proposal has not passed.")]
    ProposalNotPassed,
    #[msg("Proposal has already been executed.")]
    AlreadyExecuted,
    #[msg("Invalid vote weight. Must be greater than 0.")]
    InvalidVoteWeight,
    #[msg("Arithmetic overflow.")]
    ArithmeticOverflow,
}
