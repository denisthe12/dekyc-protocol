use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("6VF97rmPyhMgqkEQGhGu7dSm7oq9tWHZELSKqttUB4Ed");

#[program]
pub mod tokenization_case {
    use super::*;

    pub fn create_registry(ctx: Context<CreateRegistry>) -> Result<()> {
        instructions::create_registry::handler(ctx)
    }

    pub fn create_energy_asset(
        ctx: Context<CreateEnergyAsset>,
        asset_id: u64,
        total_shares: u64,
        price_per_share_kzte: u64,
        investor_bps: u16,
        operator_bps: u16,
        payout_mode: PayoutMode,
        proof_root_hash: [u8; 32],
        metadata_uri_hash: [u8; 32],
    ) -> Result<()> {
        instructions::create_energy_asset::handler(
            ctx,
            asset_id,
            total_shares,
            price_per_share_kzte,
            investor_bps,
            operator_bps,
            payout_mode,
            proof_root_hash,
            metadata_uri_hash,
        )
    }

    pub fn issue_shares(ctx: Context<IssueShares>) -> Result<()> {
        instructions::issue_shares::handler(ctx)
    }

    pub fn buy_shares(
        ctx: Context<BuyShares>,
        share_amount: u64,
        payout_mode: PayoutMode,
    ) -> Result<()> {
        instructions::buy_shares::handler(ctx, share_amount, payout_mode)
    }

    pub fn create_revenue_epoch(
        ctx: Context<CreateRevenueEpoch>,
        epoch_index: u64,
        total_amount_kzte: u64,
    ) -> Result<()> {
        instructions::create_revenue_epoch::handler(ctx, epoch_index, total_amount_kzte)
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        instructions::claim_payout::handler(ctx)
    }

    pub fn create_listing(
        ctx: Context<CreateListing>,
        listing_id: u64,
        share_amount: u64,
        price_per_share_kzte: u64,
    ) -> Result<()> {
        instructions::create_listing::handler(
            ctx,
            listing_id,
            share_amount,
            price_per_share_kzte,
        )
    }

    pub fn fill_listing(ctx: Context<FillListing>) -> Result<()> {
        instructions::fill_listing::handler(ctx)
    }
}