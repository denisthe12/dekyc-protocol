use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("2hSnMJEbng1ZzW4NKQx2YmTxBpWaUf145ZU6bcZ85hAA");

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
        mint: Pubkey,
        token_account: Pubkey,
        token_program: Pubkey,
    ) -> Result<()> {
        instructions::grant_permission(
            ctx,
            service_id_hash,
            kyc_hash,
            required_amount,
            mint,
            token_account,
            token_program,
        )
    }

    pub fn revoke_permission(ctx: Context<RevokePermission>) -> Result<()> {
        instructions::revoke_permission(ctx)
    }
}