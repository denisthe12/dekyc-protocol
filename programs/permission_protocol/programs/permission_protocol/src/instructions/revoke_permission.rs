use anchor_lang::prelude::*;

use crate::constants::{PERMISSION_SEED, USER_SEED};
use crate::errors::PermissionProtocolError;
use crate::state::{PermissionPda, PermissionState, UserPda};

#[derive(Accounts)]
pub struct RevokePermission<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = user_pda.bump,
        has_one = authority
    )]
    pub user_pda: Account<'info, UserPda>,

    #[account(
        mut,
        seeds = [PERMISSION_SEED, user_pda.key().as_ref(), &permission_pda.service_id_hash],
        bump = permission_pda.bump
    )]
    pub permission_pda: Account<'info, PermissionPda>,
}

pub fn revoke_permission(ctx: Context<RevokePermission>) -> Result<()> {
    let permission = &mut ctx.accounts.permission_pda;

    if permission.state == PermissionState::Revoked {
        return err!(PermissionProtocolError::PermissionAlreadyRevoked);
    }

    permission.state = PermissionState::Revoked;
    permission.revoked_at = Some(Clock::get()?.unix_timestamp);

    Ok(())
}