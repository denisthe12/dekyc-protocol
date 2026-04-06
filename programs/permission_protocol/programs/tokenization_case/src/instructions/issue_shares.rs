use crate::constants::ENERGY_ASSET_SEED;
use crate::errors::TokenizationError;
use crate::events::SharesIssued;
use crate::state::{AssetStatus, EnergyAsset};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct IssueShares<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        has_one = issuer @ TokenizationError::InvalidIssuer,
        has_one = share_mint,
        constraint = energy_asset.treasury_share_account == treasury_share_account.key()
    )]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(mut)]
    pub share_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub treasury_share_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<IssueShares>) -> Result<()> {
    let asset = &mut ctx.accounts.energy_asset;

    require!(
        asset.issued_shares == 0,
        TokenizationError::SharesAlreadyIssued
    );

    let asset_id_bytes = asset.asset_id.to_le_bytes();
    let signer_seeds: &[&[u8]] = &[ENERGY_ASSET_SEED, &asset_id_bytes, &[asset.bump]];
    let signer_binding = [signer_seeds];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.share_mint.to_account_info(),
        to: ctx.accounts.treasury_share_account.to_account_info(),
        authority: asset.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        &signer_binding,
    );

    mint_to(cpi_ctx, asset.total_shares)?;

    asset.issued_shares = asset.total_shares;
    asset.status = AssetStatus::ActiveSale;

    emit!(SharesIssued {
        asset_id: asset.asset_id,
        total_shares: asset.total_shares,
        share_mint: asset.share_mint,
        treasury_share_account: asset.treasury_share_account,
    });

    Ok(())
}
