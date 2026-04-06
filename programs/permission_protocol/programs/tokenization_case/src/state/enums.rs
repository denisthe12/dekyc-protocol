use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetStatus {
    Draft,
    ActiveSale,
    SoldOut,
    Paused,
    Closed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PayoutMode {
    Kzte,
    EnergyPoints,
}

impl PayoutMode {
    pub fn as_seed(&self) -> [u8; 1] {
        match self {
            PayoutMode::Kzte => [0],
            PayoutMode::EnergyPoints => [1],
        }
    }
}
