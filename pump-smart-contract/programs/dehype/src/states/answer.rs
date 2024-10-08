use anchor_lang::prelude::*;

pub const ANSWER_SEED: &str = "answer";

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
#[derive(InitSpace)]
pub struct Answer {
    pub answer_key: u64,
    #[max_len(50)]
    pub name: String,
    pub answer_total_tokens: u64,
}


#[account]
#[derive(InitSpace)]
pub struct AnswerAccount {
    pub bump: u8,
    #[max_len(10)]
    pub answers: Vec<Answer>,
    pub market_key: u64,
}

