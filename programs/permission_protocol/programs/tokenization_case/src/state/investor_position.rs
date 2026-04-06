use crate::state::PayoutMode;
use anchor_lang::prelude::*;

#[account]
pub struct InvestorPosition {
    pub asset: Pubkey,
    pub investor: Pubkey,
    pub payout_mode: PayoutMode,
    pub total_shares_bought: u64,
    pub bump: u8,
}

impl InvestorPosition {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 1;
}
