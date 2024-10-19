use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::CTRLSEED;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct TokMeta<'info> {
    /// CHECK: This is not dangerous because it will be checked in the inner instruction
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(seeds = [CTRLSEED.as_ref()], bump = bump, mint::decimals = 6, mint::authority = mint)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because it will be checked in the inner instruction
    pub mintauth: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is not dangerous because it will be checked in the inner instruction
    pub updauth: AccountInfo<'info>,
    /// CHECK: This is not dangerous because it's being checked by the inner instruction
    #[account(mut)]
    pub metadata_pda: AccountInfo <'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because it will be checked in the inner instruction
    pub metadata_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}