use anchor_lang::prelude::*;

use super::answer::AnswerAccount;

pub const MARKET_SEED: &str = "market";
pub const MARKET_VAULT_SEED: &[u8] = b"market_vault";

#[account]
#[derive(InitSpace)]
pub struct MarketAccount {
    pub bump: u8,
    pub bump_vault: u8,
    pub creator: Pubkey,
    pub market_key: u64,
    #[max_len(30)]
    pub title: String,
    pub creator_fee_percentage: u64,
    pub market_total_tokens: u64,
    #[max_len(100)]
    pub description: String,
    pub correct_answer_key: u64,
    pub is_active: bool,
    #[max_len(100)]
    pub cover_url: String,
}