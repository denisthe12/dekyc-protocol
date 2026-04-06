use anchor_lang::prelude::*;

#[event]
pub struct RegistryCreated {
    pub admin: Pubkey,
    pub kzte_mint: Pubkey,
}

#[event]
pub struct EnergyAssetCreated {
    pub asset_id: u64,
    pub issuer: Pubkey,
    pub share_mint: Pubkey,
    pub treasury_share_account: Pubkey,
}

#[event]
pub struct SharesIssued {
    pub asset_id: u64,
    pub total_shares: u64,
    pub share_mint: Pubkey,
    pub treasury_share_account: Pubkey,
}
