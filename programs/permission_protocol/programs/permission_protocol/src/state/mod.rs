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
    pub state: PermissionState,
    pub bump: u8,
    pub created_at: i64,
    pub revoked_at: Option<i64>,
}

impl PermissionPda {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1 + 1 + 8 + 1 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PermissionState {
    Active,
    Revoked,
}