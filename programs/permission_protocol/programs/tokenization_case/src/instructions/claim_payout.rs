use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{CLAIM_RECEIPT_SEED, ENERGY_ASSET_SEED, INVESTOR_POSITION_SEED};
use crate::errors::TokenizationError;
use crate::state::{ClaimReceipt, EnergyAsset, InvestorPosition, PayoutMode, RevenueEpoch};

#[derive(Accounts)]
#[instruction(claimed_amount: u64, payout_mode: PayoutMode)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub claimer: Signer<'info>,

    #[account(mut)]
    pub energy_asset: Account<'info, EnergyAsset>,

    #[account(
        mut,
        constraint = revenue_epoch.asset == energy_asset.key()
    )]
    pub revenue_epoch: Account<'info, RevenueEpoch>,

    #[account(
        seeds = [
            INVESTOR_POSITION_SEED,
            energy_asset.key().as_ref(),
            claimer.key().as_ref(),
            payout_mode.as_seed().as_ref()
        ],
        bump = investor_position.bump
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    #[account(mut)]
    pub kzte_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = energy_asset.treasury_kzte_account == treasury_kzte_account.key()
    )]
    pub treasury_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub claimer_kzte_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = claimer,
        space = 8 + ClaimReceipt::LEN,
        seeds = [
            CLAIM_RECEIPT_SEED,
            revenue_epoch.key().as_ref(),
            claimer.key().as_ref(),
            payout_mode.as_seed().as_ref()
        ],
        bump
    )]
    pub claim_receipt: Account<'info, ClaimReceipt>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ClaimPayout>,
    claimed_amount: u64,
    payout_mode: PayoutMode,
) -> Result<()> {
    require!(claimed_amount > 0, TokenizationError::NothingToClaim);
    require!(
        ctx.accounts.investor_position.payout_mode == payout_mode,
        TokenizationError::InvalidPayoutMode
    );

    if payout_mode == PayoutMode::Kzte {
        let asset_id_bytes = ctx.accounts.energy_asset.asset_id.to_le_bytes();
        let signer_seeds: &[&[u8]] = &[
            ENERGY_ASSET_SEED,
            &asset_id_bytes,
            &[ctx.accounts.energy_asset.bump],
        ];
        let signer_binding = [signer_seeds];

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.treasury_kzte_account.to_account_info(),
            mint: ctx.accounts.kzte_mint.to_account_info(),
            to: ctx.accounts.claimer_kzte_account.to_account_info(),
            authority: ctx.accounts.energy_asset.to_account_info(),
        };

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            &signer_binding,
        );

        transfer_checked(
            transfer_ctx,
            claimed_amount,
            ctx.accounts.kzte_mint.decimals,
        )?;
    }

    let receipt = &mut ctx.accounts.claim_receipt;
    receipt.epoch = ctx.accounts.revenue_epoch.key();
    receipt.asset = ctx.accounts.energy_asset.key();
    receipt.claimer = ctx.accounts.claimer.key();
    receipt.claimed_amount_kzte = claimed_amount;
    receipt.bump = ctx.bumps.claim_receipt;

    Ok(())
}
