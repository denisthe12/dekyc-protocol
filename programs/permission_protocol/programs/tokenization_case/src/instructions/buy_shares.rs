use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::ENERGY_ASSET_SEED;
use crate::errors::TokenizationError;
use crate::state::EnergyAsset;

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(mut)]
    pub kzte_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
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
}

pub fn handler(ctx: Context<BuyShares>, share_amount: u64) -> Result<()> {
    // Сначала читаем все нужные данные из asset без долгого mutable borrow
    let asset_id = ctx.accounts.energy_asset.asset_id;
    let asset_bump = ctx.accounts.energy_asset.bump;
    let price_per_share_kzte = ctx.accounts.energy_asset.price_per_share_kzte;
    let issued_shares = ctx.accounts.energy_asset.issued_shares;
    let sold_shares = ctx.accounts.energy_asset.sold_shares;
    let asset_account_info = ctx.accounts.energy_asset.to_account_info();

    let total_cost = share_amount
        .checked_mul(price_per_share_kzte)
        .ok_or(TokenizationError::MathOverflow)?;

    require!(
        sold_shares
            .checked_add(share_amount)
            .ok_or(TokenizationError::MathOverflow)?
            <= issued_shares,
        TokenizationError::MathOverflow
    );

    // 1. Перевод KZTE от покупателя в treasury
    let kzte_transfer_accounts = TransferChecked {
        from: ctx.accounts.buyer_kzte_account.to_account_info(),
        mint: ctx.accounts.kzte_mint.to_account_info(),
        to: ctx.accounts.treasury_kzte_account.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };

    let kzte_transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        kzte_transfer_accounts,
    );

    transfer_checked(
        kzte_transfer_ctx,
        total_cost,
        ctx.accounts.kzte_mint.decimals,
    )?;

    // 2. Перевод share tokens из treasury проекта покупателю
    let asset_id_bytes = asset_id.to_le_bytes();
    let signer_seeds: &[&[u8]] = &[
        ENERGY_ASSET_SEED,
        &asset_id_bytes,
        &[asset_bump],
    ];
    let signer_binding = [signer_seeds];

    let share_transfer_accounts = TransferChecked {
        from: ctx.accounts.treasury_share_account.to_account_info(),
        mint: ctx.accounts.share_mint.to_account_info(),
        to: ctx.accounts.buyer_share_account.to_account_info(),
        authority: asset_account_info,
    };

    let share_transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        share_transfer_accounts,
        &signer_binding,
    );

    transfer_checked(
        share_transfer_ctx,
        share_amount,
        ctx.accounts.share_mint.decimals,
    )?;

    // Только теперь берём mutable borrow для обновления состояния
    let asset = &mut ctx.accounts.energy_asset;
    asset.sold_shares = asset
        .sold_shares
        .checked_add(share_amount)
        .ok_or(TokenizationError::MathOverflow)?;

    Ok(())
}