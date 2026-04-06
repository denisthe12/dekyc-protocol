use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ListingStatus {
    Open,
    Filled,
    Cancelled,
}

#[account]
pub struct Listing {
    pub listing_id: u64,
    pub asset: Pubkey,
    pub asset_id: u64,
    pub seller: Pubkey,
    pub buyer: Pubkey,

    pub share_mint: Pubkey,
    pub seller_kzte_account: Pubkey,
    pub escrow_share_account: Pubkey,

    pub share_amount: u64,
    pub price_per_share_kzte: u64,
    pub total_price_kzte: u64,

    pub status: ListingStatus,
    pub bump: u8,
}

impl Listing {
    pub const LEN: usize = 8   // listing_id
        + 32                   // asset
        + 8                    // asset_id
        + 32                   // seller
        + 32                   // buyer
        + 32                   // share_mint
        + 32                   // seller_kzte_account
        + 32                   // escrow_share_account
        + 8                    // share_amount
        + 8                    // price_per_share_kzte
        + 8                    // total_price_kzte
        + 1                    // status
        + 1; // bump
}
