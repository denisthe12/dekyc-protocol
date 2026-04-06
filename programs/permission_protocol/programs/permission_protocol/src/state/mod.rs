use anchor_lang::prelude::*;

#[account]
pub struct UserPda {
    pub authority: Pubkey,
    pub user_id_hash: [u8; 32],
    pub bump: u8,
    pub created_at: i64,
}

impl UserPda {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8;
}

#[account]
pub struct PermissionPda {
    pub user: Pubkey,
    pub service_id_hash: [u8; 32],
    pub kyc_hash: [u8; 32],
    pub required_amount: u64,

    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub token_program: Pubkey,

    pub state: PermissionState,
    pub bump: u8,
    pub created_at: i64,
    pub revoked_at: Option<i64>,
}

impl PermissionPda {
    pub const LEN: usize = 8  // discriminator
        + 32 // user
        + 32 // service_id_hash
        + 32 // kyc_hash
        + 8  // required_amount
        + 32 // mint
        + 32 // token_account
        + 32 // token_program
        + 1  // state
        + 1  // bump
        + 8  // created_at
        + 1 + 8; // revoked_at option
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PermissionState {
    Active,
    Revoked,
}
