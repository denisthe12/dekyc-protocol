use anchor_lang::prelude::*;

#[account]
pub struct ClaimReceipt {
    pub epoch: Pubkey,
    pub asset: Pubkey,
    pub claimer: Pubkey,
    pub claimed_amount_kzte: u64,
    pub bump: u8,
}

impl ClaimReceipt {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 1;
}
