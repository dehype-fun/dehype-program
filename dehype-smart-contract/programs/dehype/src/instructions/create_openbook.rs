use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
pub const CTRLSEED: &[u8] = b"CTRLv1";
pub const REQUEST_QUEUE_SEED: &[u8] = b"REQQUEUE";
#[derive(Accounts)]
#[instruction(bump: u8)]

pub struct CreateOpenbook<'info> {
    #[account(seeds = [CTRLSEED.as_ref()], bump = bump, mint::decimals = 6, mint::authority = base_mint)]
    pub base_mint: Account<'info, Mint>,
    #[account(mut)]
    pub quote_mint: Account<'info, Mint>,
    #[account(mut, associated_token::mint = base_mint, associated_token::authority = payer)]
    pub base_vault: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = payer, associated_token::mint = quote_mint, associated_token::authority = payer)]
    pub quote_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub request_queue: AccountInfo<'info>,
    #[account(mut)]
    pub event_queue: AccountInfo<'info>,
    #[account(mut)]
    pub bids: AccountInfo<'info>,
    #[account(mut)]
    pub asks: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
} 