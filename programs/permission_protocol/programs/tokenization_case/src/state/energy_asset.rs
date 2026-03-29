use anchor_lang::prelude::*;
use super::{AssetStatus, PayoutMode};

#[account]
pub struct EnergyAsset {
    pub asset_id: u64,
    pub registry: Pubkey,
    pub issuer: Pubkey,
    pub share_mint: Pubkey,
    pub treasury_share_account: Pubkey,

    pub total_shares: u64,
    pub issued_shares: u64,
    pub sold_shares: u64,
    pub price_per_share_kzte: u64,

    pub investor_bps: u16,
    pub operator_bps: u16,

    pub payout_mode: PayoutMode,
    pub status: AssetStatus,

    pub proof_root_hash: [u8; 32],
    pub metadata_uri_hash: [u8; 32],

    pub bump: u8,
}

impl EnergyAsset {
    pub const LEN: usize = 8   // asset_id
        + 32                   // registry
        + 32                   // issuer
        + 32                   // share_mint
        + 32                   // treasury_share_account
        + 8                    // total_shares
        + 8                    // issued_shares
        + 8                    // sold_shares
        + 8                    // price_per_share_kzte
        + 2                    // investor_bps
        + 2                    // operator_bps
        + 1                    // payout_mode
        + 1                    // status
        + 32                   // proof_root_hash
        + 32                   // metadata_uri_hash
        + 1;                   // bump
}