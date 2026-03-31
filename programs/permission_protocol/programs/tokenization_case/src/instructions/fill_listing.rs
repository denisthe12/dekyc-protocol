use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::LISTING_SEED;
use crate::errors::TokenizationError;
use crate::state::{EnergyAsset, Listing, ListingStatus};

#[derive(Accounts)]
pub struct FillListing<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub listing: Account<'info, Listing>,

    #[account(
        constraint = listing.asset == energy_asset.key()
    )]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(mut)]
    pub kzte_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = listing.share_mint == share_mint.key()
    )]
    pub share_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub buyer_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_share_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = listing.seller_kzte_account == seller_kzte_account.key()
    )]
    pub seller_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = listing.escrow_share_account == escrow_share_account.key()
    )]
    pub escrow_share_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<FillListing>) -> Result<()> {
    require!(
        ctx.accounts.listing.status == ListingStatus::Open,
        TokenizationError::InvalidListingStatus
    );

    // 1. KZTE: buyer -> seller
    let kzte_transfer_accounts = TransferChecked {
        from: ctx.accounts.buyer_kzte_account.to_account_info(),
        mint: ctx.accounts.kzte_mint.to_account_info(),
        to: ctx.accounts.seller_kzte_account.to_account_info(),
        authority: ctx.accounts.buyer.to_account_info(),
    };

    let kzte_transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        kzte_transfer_accounts,
    );

    transfer_checked(
        kzte_transfer_ctx,
        ctx.accounts.listing.total_price_kzte,
        ctx.accounts.kzte_mint.decimals,
    )?;

    // 2. Shares: escrow -> buyer
    let asset_id_bytes = ctx.accounts.listing.asset_id.to_le_bytes();
    let listing_id_bytes = ctx.accounts.listing.listing_id.to_le_bytes();

    let signer_seeds: &[&[u8]] = &[
        LISTING_SEED,
        &asset_id_bytes,
        &listing_id_bytes,
        &[ctx.accounts.listing.bump],
    ];
    let signer_binding = [signer_seeds];

    let share_transfer_accounts = TransferChecked {
        from: ctx.accounts.escrow_share_account.to_account_info(),
        mint: ctx.accounts.share_mint.to_account_info(),
        to: ctx.accounts.buyer_share_account.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    };

    let share_transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        share_transfer_accounts,
        &signer_binding,
    );

    transfer_checked(
        share_transfer_ctx,
        ctx.accounts.listing.share_amount,
        ctx.accounts.share_mint.decimals,
    )?;

    let listing = &mut ctx.accounts.listing;
    listing.buyer = ctx.accounts.buyer.key();
    listing.status = ListingStatus::Filled;

    Ok(())
}