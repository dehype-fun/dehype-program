use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
pub const CTRLSEED: &[u8] = b"CTRLv1";
#[derive(Accounts)]
pub struct MintCtrl<'info> {
    #[account(init_if_needed, payer = payer, seeds = [CTRLSEED.as_ref()], bump, mint::decimals = 6, mint::authority = mint)]
    pub mint: Account<'info, Mint>,
    #[account(init_if_needed, payer = payer, associated_token::mint = mint, associated_token::authority = payer)]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
} 