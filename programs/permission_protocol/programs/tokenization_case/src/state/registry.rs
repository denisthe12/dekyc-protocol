use anchor_lang::prelude::*;

#[account]
pub struct Registry {
    pub admin: Pubkey,
    pub kzte_mint: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

impl Registry {
    pub const LEN: usize = 32 + 32 + 1 + 1;
}
