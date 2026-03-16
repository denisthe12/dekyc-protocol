use anchor_lang::prelude::*;

use crate::constants::{PERMISSION_SEED, USER_SEED};
use crate::state::{PermissionPda, PermissionState, UserPda};

#[derive(Accounts)]
#[instruction(service_id_hash: [u8; 32])]
pub struct GrantPermission<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = user_pda.bump,
        has_one = authority
    )]
    pub user_pda: Account<'info, UserPda>,

    #[account(
        init_if_needed,
        payer = authority,
        space = PermissionPda::LEN,
        seeds = [PERMISSION_SEED, user_pda.key().as_ref(), &service_id_hash],
        bump
    )]
    pub permission_pda: Account<'info, PermissionPda>,

    pub system_program: Program<'info, System>,
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
    let permission = &mut ctx.accounts.permission_pda;

    permission.user = ctx.accounts.user_pda.key();
    permission.service_id_hash = service_id_hash;
    permission.kyc_hash = kyc_hash;
    permission.required_amount = required_amount;
    permission.mint = mint;
    permission.token_account = token_account;
    permission.token_program = token_program;
    permission.state = PermissionState::Active;
    permission.bump = ctx.bumps.permission_pda;
    permission.created_at = Clock::get()?.unix_timestamp;
    permission.revoked_at = None;

    Ok(())
}