use anchor_lang::prelude::*;

#[account]
pub struct RevenueEpoch {
    pub asset: Pubkey,
    pub epoch_index: u64,
    pub treasury_kzte_account: Pubkey,
    pub total_amount_kzte: u64,
    pub amount_per_share_kzte: u64,
    pub total_shares_snapshot: u64,
    pub bump: u8,
}

impl RevenueEpoch {
    pub const LEN: usize = 32 + 8 + 32 + 8 + 8 + 8 + 1;
}