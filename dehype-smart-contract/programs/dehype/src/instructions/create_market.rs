use std::ops::DerefMut;

use anchor_lang::{prelude::*, system_program};
use crate::{consts::{DEFAULT_OUTCOME_TOKEN_LOGO, DEFAULT_OUTCOME_TOKEN_NAME}, errors::ProgramErrorCode, states::{ answer::{Answer, AnswerAccount, ANSWER_SEED}, market::{ MarketAccount, MARKET_SEED, MARKET_VAULT_SEED } }}
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
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        init,
        payer = creator,
        space = 0, // System account with no data
        seeds = [MARKET_VAULT_SEED, &market_key.to_le_bytes()],
        owner = system_program::System::id(),
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_market(
    ctx: Context<CreateMarket>,
    market_key: u64,
    title: String,
    description: String,
    cover_url: String,
    answers: Vec<String>,
    outcome_token_names: Option<Vec<String>>,
    outcome_token_logos: Option<Vec<String>>,
    creator_fee_percentage: u64,
) -> Result<()> {
    if creator_fee_percentage > 10 {
        return Err(ProgramErrorCode::CreatorFeeTooHigh.into());
    }
    if let (Some(names), Some(logos)) = (&outcome_token_names, &outcome_token_logos) {
        if answers.len() != names.len() || answers.len() != logos.len() {
            return Err(ProgramErrorCode::InvalidArguments.into());
        }
    }
    let market_account = ctx.accounts.market_account.deref_mut();
    market_account.bump = ctx.bumps.market_account;
    market_account.bump_vault = ctx.bumps.vault_account;
    market_account.creator = ctx.accounts.creator.key();
    market_account.title = title.clone();
    market_account.creator_fee_percentage = creator_fee_percentage;
    market_account.market_key = market_key;
    market_account.market_total_tokens = 0;
    market_account.description = description.clone();
    market_account.cover_url = cover_url.clone();
    market_account.is_active = true;

    let mut new_answers = Vec::new();
    for (i, answer) in answers.iter().enumerate() {
        new_answers.push(Answer {
            answer_key: i as u64,
            name: answer.clone(),
            answer_total_tokens: 0,
            outcome_token_name: outcome_token_names.as_ref().map_or(DEFAULT_OUTCOME_TOKEN_NAME.to_string(), |names| names[i].clone()),
            outcome_token_logo: outcome_token_logos.as_ref().map_or(DEFAULT_OUTCOME_TOKEN_LOGO.to_string(), |logos| logos[i].clone()),
            outcome_token_symbol: "".to_string(),
            outcome_token_url: "".to_string(),
        });
    }


    let answer_account = ctx.accounts.answer_account.deref_mut();
    answer_account.bump = ctx.bumps.answer_account;
    answer_account.market_key = market_key;
    answer_account.answers = new_answers;
    Ok(())
}
