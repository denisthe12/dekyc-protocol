use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::LISTING_SEED;
use crate::errors::TokenizationError;
use crate::state::{EnergyAsset, Listing, ListingStatus};

#[derive(Accounts)]
#[instruction(listing_id: u64)]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut)]
    pub relayer: Signer<'info>,

    #[account(mut)]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(
        mut,
        constraint = energy_asset.share_mint == share_mint.key()
    )]
    pub share_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub seller_share_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub seller_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_share_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = relayer,
        space = 8 + Listing::LEN,
        seeds = [
            LISTING_SEED,
            &energy_asset.asset_id.to_le_bytes(),
            &listing_id.to_le_bytes()
        ],
        bump
    )]
    pub listing: Account<'info, Listing>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateListing>,
    listing_id: u64,
    share_amount: u64,
    price_per_share_kzte: u64,
) -> Result<()> {
    require!(share_amount > 0, TokenizationError::InvalidShareAmount);

    let total_price_kzte = share_amount
        .checked_mul(price_per_share_kzte)
        .ok_or(TokenizationError::MathOverflow)?;

    // перевод listed shares от seller в escrow listing
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.seller_share_account.to_account_info(),
        mint: ctx.accounts.share_mint.to_account_info(),
        to: ctx.accounts.escrow_share_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    transfer_checked(
        transfer_ctx,
        share_amount,
        ctx.accounts.share_mint.decimals,
    )?;

    let listing = &mut ctx.accounts.listing;
    listing.listing_id = listing_id;
    listing.asset = ctx.accounts.energy_asset.key();
    listing.asset_id = ctx.accounts.energy_asset.asset_id;
    listing.seller = ctx.accounts.seller.key();
    listing.buyer = Pubkey::default();
    listing.share_mint = ctx.accounts.share_mint.key();
    listing.seller_kzte_account = ctx.accounts.seller_kzte_account.key();
    listing.escrow_share_account = ctx.accounts.escrow_share_account.key();
    listing.share_amount = share_amount;
    listing.price_per_share_kzte = price_per_share_kzte;
    listing.total_price_kzte = total_price_kzte;
    listing.status = ListingStatus::Open;
    listing.bump = ctx.bumps.listing;

    Ok(())
}