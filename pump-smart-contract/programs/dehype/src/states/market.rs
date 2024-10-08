use anchor_lang::prelude::*;

use super::answer::AnswerAccount;

pub const MARKET_SEED: &str = "market";

#[account]
#[derive(InitSpace)]
pub struct MarketAccount {
    pub bump: u8,
    pub creator: Pubkey,
    pub market_key: u64,
    #[max_len(50)]
    pub title: String,
    pub creator_fee_percentage: u64,
    pub service_fee_percentage: u64,
    pub market_total_tokens: u64,
    pub market_remain_tokens: u64,
    #[max_len(100)]
    pub description: String,
    pub answers_account: AnswerAccount,
    pub correct_answer_key: Pubkey,
    pub is_active: bool,
}