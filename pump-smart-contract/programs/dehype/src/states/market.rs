use anchor_lang::prelude::*;

use super::anwser::AnswerAccount;

pub const MARKET_SEED: &str = "market";

// #[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
// pub enum MarketStatus {
//     Draft,
//     Approve,
//     Finished,
//     Success,
//     Adjourn,
// }

#[account]
#[derive(InitSpace)]
pub struct MarketAccount {
    pub bump: u8,
    // pub exist: bool,
    pub creator: Pubkey,
    pub bet_mint: Pubkey,
    
    pub market_key: u64,
    #[max_len(50)]
    pub title: String,
    // pub status: MarketStatus,
    // pub creator_fee: u64,
    pub creator_fee_percentage: u64,
    pub service_fee_percentage: u64,
    // pub approve_time: u64,
    // pub finish_time: u64,
    // pub adjourn_time: u64,
    // pub success_time: u64,
    pub market_total_tokens: u64,
    // pub market_remain_tokens: u64,
    pub answers_account: AnswerAccount,
    pub correct_answer_key: Pubkey,
    // pub market_reward_base_tokens: u64
    pub is_active: bool, // Added is_active to manage market state
}