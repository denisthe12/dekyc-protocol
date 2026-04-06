use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{ENERGY_ASSET_SEED, REVENUE_EPOCH_SEED};
use crate::errors::TokenizationError;
use crate::state::{EnergyAsset, RevenueEpoch};

#[derive(Accounts)]
#[instruction(epoch_index: u64)]
pub struct CreateRevenueEpoch<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        has_one = issuer @ TokenizationError::InvalidIssuer
    )]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(mut)]
    pub kzte_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = energy_asset.treasury_kzte_account == treasury_kzte_account.key()
    )]
    pub treasury_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub issuer_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = issuer,
        space = 8 + RevenueEpoch::LEN,
        seeds = [
            REVENUE_EPOCH_SEED,
            &energy_asset.asset_id.to_le_bytes(),
            &epoch_index.to_le_bytes()
        ],
        bump
    )]
    pub revenue_epoch: Account<'info, RevenueEpoch>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateRevenueEpoch>,
    epoch_index: u64,
    total_amount_kzte: u64,
) -> Result<()> {
    let asset = &ctx.accounts.energy_asset;

    require!(
        asset.issued_shares > 0,
        TokenizationError::InvalidTotalShares
    );

    let amount_per_share_kzte = total_amount_kzte
        .checked_div(asset.issued_shares)
        .ok_or(TokenizationError::MathOverflow)?;

    // перевод KZTE от issuer в treasury проекта
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.issuer_kzte_account.to_account_info(),
        mint: ctx.accounts.kzte_mint.to_account_info(),
        to: ctx.accounts.treasury_kzte_account.to_account_info(),
        authority: ctx.accounts.issuer.to_account_info(),
    };

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    transfer_checked(
        transfer_ctx,
        total_amount_kzte,
        ctx.accounts.kzte_mint.decimals,
    )?;

    let epoch = &mut ctx.accounts.revenue_epoch;
    epoch.asset = asset.key();
    epoch.epoch_index = epoch_index;
    epoch.treasury_kzte_account = ctx.accounts.treasury_kzte_account.key();
    epoch.total_amount_kzte = total_amount_kzte;
    epoch.amount_per_share_kzte = amount_per_share_kzte;
    epoch.total_shares_snapshot = asset.issued_shares;
    epoch.bump = ctx.bumps.revenue_epoch;

    Ok(())
}
