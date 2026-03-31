use anchor_lang::prelude::*;

#[error_code]
pub enum TokenizationError {
    #[msg("Platform registry is paused")]
    RegistryPaused,

    #[msg("Only registry admin can perform this action")]
    InvalidRegistryAdmin,

    #[msg("Only asset issuer can perform this action")]
    InvalidIssuer,

    #[msg("Shares have already been issued for this asset")]
    SharesAlreadyIssued,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Invalid basis points configuration")]
    InvalidBasisPoints,

    #[msg("Invalid total shares")]
    InvalidTotalShares,

    #[msg("No shares owned by claimer")]
    NoSharesOwned,

    #[msg("Nothing to claim")]
    NothingToClaim,

    #[msg("Invalid listing status")]
    InvalidListingStatus,

    #[msg("Invalid seller")]
    InvalidSeller,

    #[msg("Invalid share amount")]
    InvalidShareAmount,
}