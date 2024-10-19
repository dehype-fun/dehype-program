use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, dex::{serum_dex::state::{Market, MarketState}, Dex}, token::{Mint, Token, TokenAccount, Transfer}
};

use crate::create_openbook::CTRLSEED;


#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializeSerumMarket<'info> {
    #[account(mut)]
    pub market: AccountInfo<'info>,

    #[account(mut, associated_token::mint = coin_mint, associated_token::authority = authority)]
    pub coin_vault: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed, 
        payer = authority, 
        associated_token::mint = pc_mint, associated_token::authority = authority)]
    pub pc_vault: Box<Account<'info, TokenAccount>>,

    #[account(seeds = [CTRLSEED.as_ref()], bump = bump, mint::decimals = 6, mint::authority = coin_mint)]
    pub coin_mint: Account<'info, Mint>,
    #[account(mut)]
    pub pc_mint: Account<'info, Mint>,
    #[account(
        mut,
        // payer = authority,
        // space = 8
    )]
    pub bids: AccountInfo<'info>,

    #[account(
        mut,
        // payer = authority,
        // space = 8
    )]
    pub asks: AccountInfo<'info>,

    #[account(
        mut,
        // payer = authority,
        // space = 8
    )]
    pub req_q: AccountInfo<'info>,

    #[account(
        mut,
        // payer = authority,
        // space = 8
    )]
    pub event_q: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub market_signer: Signer<'info>,
    #[account(mut)]
    pub req_q_signer: Signer<'info>,
    #[account(mut)]
    pub event_q_signer: Signer<'info>,
    #[account(mut)]
    pub bids_signer: Signer<'info>,
    #[account(mut)]
    pub asks_signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub dex_program: Program<'info, Dex>,
    pub rent: Sysvar<'info, Rent>,
}