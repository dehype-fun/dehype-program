use std::ops::DerefMut;

use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::
    states::{ answer::{Answer, AnswerAccount, ANSWER_SEED}, market::{ MarketAccount, MARKET_SEED }, ConfigAccount }
;

#[derive(Accounts)]
#[instruction(market_key: u64)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(        
        init,
        payer = creator,
        space = 8 + AnswerAccount::INIT_SPACE,
        seeds = [ANSWER_SEED.as_bytes(), &market_key.to_le_bytes()],
        bump)
    ]
    pub answer_account: Account<'info, AnswerAccount>,
    #[account(
        init,
        payer = creator,
        space = 8 + MarketAccount::INIT_SPACE,
        seeds = [MARKET_SEED.as_bytes(), &market_key.to_le_bytes()],
        bump,
    )]
    pub market_account: Account<'info, MarketAccount>,
    pub system_program: Program<'info, System>,
}

pub fn create_market(
    ctx: Context<CreateMarket>,
    market_key: u64,
    title: String,
    description: String,
    cover_url: String,
    answers: Vec<String>,
    creator_fee_percentage: u64,
    service_fee_percentage: u64
) -> Result<()> {
    let market_account = ctx.accounts.market_account.deref_mut();

    market_account.bump = ctx.bumps.market_account;
    market_account.creator = ctx.accounts.creator.key();
    market_account.title = title.clone();
    market_account.creator_fee_percentage = creator_fee_percentage;
    market_account.service_fee_percentage = service_fee_percentage;
    market_account.market_key = market_key;
    market_account.market_total_tokens = 0;
    market_account.market_remain_tokens = 0;
    market_account.description = description.clone();
    market_account.cover_url = cover_url.clone();
    market_account.is_active = true;

    let mut new_answers = Vec::new();
    for (i, answer) in answers.iter().enumerate() {
        new_answers.push(Answer {
            answer_key: i as u64,
            name: answer.clone(),
            answer_total_tokens: 0,
        });
    }

    let answer_account = ctx.accounts.answer_account.deref_mut();
    answer_account.bump = ctx.bumps.answer_account;
    answer_account.market_key = market_key;
    answer_account.answers = new_answers;
    Ok(())
}
