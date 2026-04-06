use anchor_lang::prelude::*;

#[error_code]
pub enum PermissionProtocolError {
    #[msg("Permission already revoked")]
    PermissionAlreadyRevoked,
}
