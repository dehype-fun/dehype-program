
use std::ops::DerefMut;

use anchor_lang::{prelude::*, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, accessor::amount, Mint, Token, TokenAccount},
};
use crate::{errors::ProgramErrorCode, states::{answer::AnswerAccount, betting::{BettingAccount, BETTING_SEED}, market::{MarketAccount, MARKET_SEED, MARKET_VAULT_SEED}, ConfigAccount}};

#[derive(Accounts)]
#[instruction(answer_key: u64)]
pub struct Retrieve<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(mut)]
    pub market_account: Account<'info, MarketAccount>,
    #[account(mut)]
    pub answer_account: Account<'info, AnswerAccount>,
    #[account(
      init_if_needed,
      payer = voter,
      space = 8 + MarketAccount::INIT_SPACE,
      seeds = [BETTING_SEED.as_bytes(), voter.key().as_ref(), &market_account.market_key.to_le_bytes(), &answer_key.to_le_bytes()],
      bump,
    )]
    pub bet_account: Account<'info, BettingAccount>,
    #[account(
        mut,
        seeds = [MARKET_VAULT_SEED, &market_account.market_key.to_le_bytes()],
        bump = market_account.bump_vault,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn retrive(ctx: Context<Retrieve>, answer_key: u64, amount: u64) -> Result<()> {
    let market_key = ctx.accounts.market_account.market_key.clone();
    let betting_account = ctx.accounts.bet_account.deref_mut();
    let market_account = ctx.accounts.market_account.deref_mut();
    let answer_account = ctx.accounts.answer_account.deref_mut();

    const LAMPORTS_PER_SIGNATURE: u64 = 5000;
    let total_amount: u64 =  amount + LAMPORTS_PER_SIGNATURE;
    if betting_account.tokens < total_amount {
        return Err(ProgramErrorCode::InsufficientBalance.into());
    }

    let seeds: &[&[u8]] = &[
        MARKET_VAULT_SEED,
        &market_account.market_key.to_le_bytes(),
        &[market_account.bump_vault],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.vault_account.to_account_info().clone(),
            to: ctx.accounts.voter.to_account_info().clone(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, total_amount)?;

    if !answer_account
        .answers
        .iter()
        .any(|answer| answer.answer_key == answer_key)
    {
        return Err(ProgramErrorCode::AnswerNotExists.into());
    }

    // Update the specific answer's total tokens
    for answer in answer_account.answers.iter_mut() {
        if answer.answer_key == answer_key {
            answer.answer_total_tokens -= total_amount;
            break;
        }
    }

    let clock = Clock::get()?;

    betting_account.bump = ctx.bumps.bet_account;
    betting_account.market_key = market_key;
    betting_account.answer_key = answer_key;
    betting_account.voter = ctx.accounts.voter.key();
    betting_account.tokens -= total_amount;
    betting_account.create_time = clock.unix_timestamp as u64;
    betting_account.exist = true;

    ctx.accounts.market_account.market_total_tokens -= total_amount;

    Ok(())
}
