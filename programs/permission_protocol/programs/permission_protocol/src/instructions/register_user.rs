use anchor_lang::prelude::*;

use crate::constants::USER_SEED;
use crate::state::UserPda;

#[derive(Accounts)]
#[instruction(user_id_hash: [u8; 32])]
pub struct RegisterUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = UserPda::LEN,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump
    )]
    pub user_pda: Account<'info, UserPda>,

    pub system_program: Program<'info, System>,
}

pub fn register_user(ctx: Context<RegisterUser>, user_id_hash: [u8; 32]) -> Result<()> {
    let user = &mut ctx.accounts.user_pda;

    user.authority = ctx.accounts.authority.key();
    user.user_id_hash = user_id_hash;
    user.bump = ctx.bumps.user_pda;
    user.created_at = Clock::get()?.unix_timestamp;

    Ok(())
}