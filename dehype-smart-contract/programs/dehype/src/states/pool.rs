use anchor_lang::prelude::*;

#[constant]
pub const POOL_SEED: &[u8] = b"pool";

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub authority: Pubkey,
    pub meme_token_mint: Pubkey,
    pub meme_token_ata: Pubkey,
    pub allocation: u64,
}
