use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod state;
pub mod states;
pub mod errors;
use crate::instructions::*;
pub mod instructions;
use instructions::Initialize;
// use instruction::CreateMarket;

declare_id!("2VEmmnYYUThb6QWAidWoZe2ePbTQ9UbSKT8miAzaV3kx");

#[program]
pub mod dehype {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        point_mint: Pubkey,
        token_mint: Pubkey
    ) -> Result<()> {
        instructions::initialize(ctx, point_mint, token_mint)?;
        Ok(())
    }
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_key: u64,
        creator: Pubkey,
        title: String,
        answers: Vec<String>,
        creator_fee_percentage: u64,
        service_fee_percentage: u64
    ) -> Result<()> {
        instructions::create_market(
            ctx,
            market_key,
            creator,
            title,
            answers,
            creator_fee_percentage,
            service_fee_percentage
        )?;
        Ok(())
    }
    // pub fn create_market(
    //     ctx: Context<CreateMarket>,
    //     event_name: String,
    //     outcome_options: Vec<String>,
    // ) -> Result<()> {
    //     require!(event_name.len() <= 64, ErrorCode::EventNameTooLong);
    //     require!(
    //         outcome_options.len() <= 10,
    //         ErrorCode::TooManyOutcomeOptions
    //     );

    //     let market = &mut ctx.accounts.market;
    //     market.event_name = event_name;

    //     for option in outcome_options.iter() {
    //         require!(option.len() <= 32, ErrorCode::OutcomeOptionNameTooLong);
    //         market.outcome_tokens.push(OutcomeToken {
    //             name: option.clone(),
    //             liquidity: 0,
    //             outcome_state: OutcomeState::Pending,
    //         });
    //     }

    //     Ok(())
    // }

    // pub fn resolve_market(ctx: Context<ResolveMarket>, winning_outcome: String) -> Result<()> {
    //     let market = &mut ctx.accounts.market;
    //     let mut winner_found = false;

    //     for outcome in market.outcome_tokens.iter_mut() {
    //         if outcome.name == winning_outcome {
    //             outcome.outcome_state = OutcomeState::Winning;
    //             winner_found = true;

    //             // Generate coins based on the winning outcome's liquidity
    //             let coins_generated = outcome.liquidity; // Example: coins based on liquidity
    //                                                      // mint_coins(ctx.accounts.user.key(), coins_generated)?;
    //         }
    //     }

    //     require!(winner_found, ErrorCode::InvalidOutcome);

    //     Ok(())
    // }
}

// #[derive(Accounts)]
// pub struct CreateMarket<'info> {
//     #[account(init, payer = user, space = 8 + 64 + 4 + (10 * (4 + 32 + 8 + 1)))]
//     pub market: Account<'info, Market>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct ResolveMarket<'info> {
//     #[account(mut)]
//     pub market: Account<'info, state::Market>,
//     pub user: Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct BuyOption<'info> {
//     #[account(mut)]
//     pub signer: Signer<'info>,

//     #[account(mut)]
//     pub market: Account<'info, Market>,

//     #[account(mut)]
//     pub user: Signer<'info>,
//         #[account(
//         mut,
//         seeds = [MARKET_SEED, market.key().as_ref(), signer.key().as_ref()],
//         bump
//     )]
//     pub pda_market_account: AccountInfo<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[error_code]
// pub enum ErrorCode {
//     #[msg("The event name is too long.")]
//     EventNameTooLong,
//     #[msg("Too many outcome options.")]
//     TooManyOutcomeOptions,
//     #[msg("An outcome option name is too long.")]
//     OutcomeOptionNameTooLong,
//     #[msg("Invalid outcome.")]
//     InvalidOutcome, // Add this to handle the error in resolve_market
// }
