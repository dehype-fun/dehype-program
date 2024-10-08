use anchor_lang::prelude::*;

pub const CONFIG_SEED: &str = "config";
#[account]
#[derive(InitSpace)]
pub struct ConfigAccount {
    pub bump: u8,
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub service_fee_account: Pubkey,
}
