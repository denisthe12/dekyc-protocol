use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod permission_protocol {
    use super::*;

    pub fn register_user(ctx: Context<RegisterUser>, user_id_hash: [u8; 32]) -> Result<()> {
        instructions::register_user(ctx, user_id_hash)
    }

    pub fn grant_permission(
        ctx: Context<GrantPermission>,
        service_id_hash: [u8; 32],
        kyc_hash: [u8; 32],
        required_amount: u64,
    ) -> Result<()> {
        instructions::grant_permission(ctx, service_id_hash, kyc_hash, required_amount)
    }

    pub fn revoke_permission(ctx: Context<RevokePermission>) -> Result<()> {
        instructions::revoke_permission(ctx)
    }
}