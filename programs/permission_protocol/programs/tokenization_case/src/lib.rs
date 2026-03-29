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
}