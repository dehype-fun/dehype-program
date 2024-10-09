use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::{errors::ProgramErrorCode, states::{answer::AnswerAccount, market::MarketAccount}};

#[derive(Accounts)]
pub struct FinishMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    pub market_account: Account<'info, MarketAccount>,
    #[account(mut)]
    pub answer_account: Account<'info, AnswerAccount>,
    #[account(mut)]
    pub vault_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct MarketFinished {
    pub market_key: u64,
    pub end_time: u64,
    pub remain_tokens: u64
}

pub fn finish_market(ctx: Context<FinishMarket>) -> Result<()> {
    let market_account = ctx.accounts.market_account.deref_mut();
    let clock = Clock::get()?;
    // market_account.status = MarketStatus::Finished;

    // market_account.finish_time = clock.unix_timestamp as u64;
    market_account.market_remain_tokens = market_account.market_total_tokens;

    emit!(MarketFinished {
        market_key: market_account.market_key.clone(),
        end_time: clock.unix_timestamp as u64,
        remain_tokens: market_account.market_remain_tokens
    });

    Ok(())
}