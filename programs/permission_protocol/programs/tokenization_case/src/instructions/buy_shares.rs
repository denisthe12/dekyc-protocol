use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{ENERGY_ASSET_SEED, INVESTOR_POSITION_SEED};
use crate::errors::TokenizationError;
use crate::state::{EnergyAsset, InvestorPosition, PayoutMode};

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + InvestorPosition::LEN,
        seeds = [
            INVESTOR_POSITION_SEED,
            energy_asset.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    #[account(mut)]
    pub kzte_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = energy_asset.share_mint == share_mint.key()
    )]
    pub share_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = energy_asset.treasury_kzte_account == treasury_kzte_account.key()
    )]
    pub treasury_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = energy_asset.treasury_share_account == treasury_share_account.key()
    )]
    pub treasury_share_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_share_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<BuyShares>,
    share_amount: u64,
    payout_mode: PayoutMode,
) -> Result<()> {
    require!(share_amount > 0, TokenizationError::InvalidShareAmount);

    let price_per_share_kzte = ctx.accounts.energy_asset.price_per_share_kzte;
    let asset_id = ctx.accounts.energy_asset.asset_id;
    let asset_bump = ctx.accounts.energy_asset.bump;

    let total_cost = share_amount
        .checked_mul(price_per_share_kzte)
        .ok_or(TokenizationError::MathOverflow)?;

    let buyer_to_treasury_accounts = TransferChecked {
        from: ctx.accounts.buyer_kzte_account.to_account_info(),
        mint: ctx.accounts.kzte_mint.to_account_info(),
        to: ctx.accounts.treasury_kzte_account.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };

    let buyer_to_treasury_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        buyer_to_treasury_accounts,
    );

    transfer_checked(
        buyer_to_treasury_ctx,
        total_cost,
        ctx.accounts.kzte_mint.decimals,
    )?;

    let asset_id_bytes = asset_id.to_le_bytes();
    let signer_seeds: &[&[u8]] = &[
        ENERGY_ASSET_SEED,
        &asset_id_bytes,
        &[asset_bump],
    ];
    let signer_binding = [signer_seeds];

    let treasury_to_buyer_accounts = TransferChecked {
        from: ctx.accounts.treasury_share_account.to_account_info(),
        mint: ctx.accounts.share_mint.to_account_info(),
        to: ctx.accounts.buyer_share_account.to_account_info(),
        authority: ctx.accounts.energy_asset.to_account_info(),
    };

    let treasury_to_buyer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        treasury_to_buyer_accounts,
        &signer_binding,
    );

    transfer_checked(
        treasury_to_buyer_ctx,
        share_amount,
        ctx.accounts.share_mint.decimals,
    )?;

    let asset = &mut ctx.accounts.energy_asset;
    asset.sold_shares = asset
        .sold_shares
        .checked_add(share_amount)
        .ok_or(TokenizationError::MathOverflow)?;

    let investor_position = &mut ctx.accounts.investor_position;
    investor_position.asset = ctx.accounts.energy_asset.key();
    investor_position.investor = ctx.accounts.buyer.key();
    investor_position.payout_mode = payout_mode;
    investor_position.total_shares_bought = investor_position
        .total_shares_bought
        .checked_add(share_amount)
        .ok_or(TokenizationError::MathOverflow)?;
    investor_position.bump = ctx.bumps.investor_position;

    Ok(())
}