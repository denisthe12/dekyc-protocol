use anchor_lang::prelude::*;
use crate::constants::ENERGY_ASSET_SEED;
use crate::errors::TokenizationError;
use crate::events::EnergyAssetCreated;
use crate::state::{AssetStatus, EnergyAsset, PayoutMode, Registry};

#[derive(Accounts)]
#[instruction(asset_id: u64)]
pub struct CreateEnergyAsset<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        seeds = [crate::constants::REGISTRY_SEED],
        bump = registry.bump
    )]
    pub registry: Account<'info, Registry>,

    /// CHECK: share mint is created off-chain in Token-2022 and its mint authority
    /// must be set to this asset PDA address before calling issue_shares
    pub share_mint: UncheckedAccount<'info>,

    /// CHECK: treasury share token account is created off-chain and owned by asset PDA
    pub treasury_share_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = issuer,
        space = 8 + EnergyAsset::LEN,
        seeds = [ENERGY_ASSET_SEED, &asset_id.to_le_bytes()],
        bump
    )]
    pub energy_asset: Account<'info, EnergyAsset>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateEnergyAsset>,
    asset_id: u64,
    total_shares: u64,
    price_per_share_kzte: u64,
    investor_bps: u16,
    operator_bps: u16,
    payout_mode: PayoutMode,
    proof_root_hash: [u8; 32],
    metadata_uri_hash: [u8; 32],
) -> Result<()> {
    require!(!ctx.accounts.registry.paused, TokenizationError::RegistryPaused);
    require!(total_shares > 0, TokenizationError::InvalidTotalShares);
    require!(
        investor_bps as u32 + operator_bps as u32 == 10_000,
        TokenizationError::InvalidBasisPoints
    );

    let asset = &mut ctx.accounts.energy_asset;

    asset.asset_id = asset_id;
    asset.registry = ctx.accounts.registry.key();
    asset.issuer = ctx.accounts.issuer.key();
    asset.share_mint = ctx.accounts.share_mint.key();
    asset.treasury_share_account = ctx.accounts.treasury_share_account.key();
    asset.total_shares = total_shares;
    asset.issued_shares = 0;
    asset.sold_shares = 0;
    asset.price_per_share_kzte = price_per_share_kzte;
    asset.investor_bps = investor_bps;
    asset.operator_bps = operator_bps;
    asset.payout_mode = payout_mode;
    asset.status = AssetStatus::Draft;
    asset.proof_root_hash = proof_root_hash;
    asset.metadata_uri_hash = metadata_uri_hash;
    asset.bump = ctx.bumps.energy_asset;

    emit!(EnergyAssetCreated {
        asset_id,
        issuer: asset.issuer,
        share_mint: asset.share_mint,
        treasury_share_account: asset.treasury_share_account,
    });

    Ok(())
}