use anchor_lang::prelude::*;

pub const CONFIG_SEED: &[u8] = b"config";
#[account]
#[derive(InitSpace)]
pub struct ConfigAccount {
    pub bump: u8,
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub platform_fee_account: Pubkey,
    pub authority: Pubkey,
}
