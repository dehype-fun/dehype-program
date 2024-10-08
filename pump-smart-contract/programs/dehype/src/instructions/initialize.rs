use anchor_lang::prelude::*;
use std::ops::DerefMut;

use crate::{ errors::ProgramErrorCode, states::{ ConfigAccount, CONFIG_SEED } };

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + ConfigAccount::INIT_SPACE,
        seeds = [&CONFIG_SEED.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub config_account: Account<'info, ConfigAccount>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let config_account = ctx.accounts.config_account.deref_mut();

    if config_account.is_initialized {
        return Err(ProgramErrorCode::AlreadyInitialized.into());
    }

    config_account.bump = ctx.bumps.config_account;
    config_account.is_initialized = true;
    config_account.owner = ctx.accounts.owner.key();

    Ok(())
}