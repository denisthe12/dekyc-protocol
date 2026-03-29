use anchor_lang::prelude::*;
use crate::constants::REGISTRY_SEED;
use crate::events::RegistryCreated;
use crate::state::Registry;

#[derive(Accounts)]
pub struct CreateRegistry<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: KZTE mint is created off-chain and only stored as reference here
    pub kzte_mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Registry::LEN,
        seeds = [REGISTRY_SEED],
        bump
    )]
    pub registry: Account<'info, Registry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.registry;

    registry.admin = ctx.accounts.admin.key();
    registry.kzte_mint = ctx.accounts.kzte_mint.key();
    registry.paused = false;
    registry.bump = ctx.bumps.registry;

    emit!(RegistryCreated {
        admin: registry.admin,
        kzte_mint: registry.kzte_mint,
    });

    Ok(())
}