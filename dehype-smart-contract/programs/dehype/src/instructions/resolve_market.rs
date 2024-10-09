use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::states::{answer::AnswerAccount, market::MarketAccount};

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
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

pub fn finish_market(ctx: Context<ResolveMarket>) -> Result<()> {
    let market_account = ctx.accounts.market_account.deref_mut();
    let clock = Clock::get()?;
    // market_account.market_remain_tokens = market_account.market_total_tokens;

    Ok(())
}