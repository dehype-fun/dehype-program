use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod errors;
pub mod states;
pub mod utils;
use crate::instructions::*;
pub mod instructions;
use instructions::Initialize;

declare_id!("NKTKmCPzV3GUtBZLp7QPgaww5VE78rX3mmn4cnrHsgp");

#[program]
pub mod dehype {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)?;
        Ok(())
    }
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_key: u64,
        title: String,
        description: String,
        cover_url: String,
        answers: Vec<String>,
        creator_fee_percentage: u64,
        service_fee_percentage: u64,
    ) -> Result<()> {
        instructions::create_market(
            ctx,
            market_key,
            title,
            description,
            cover_url,
            answers,
            creator_fee_percentage,
            service_fee_percentage,
        )?;
        Ok(())
    }

    pub fn bet(ctx: Context<Bet>, anwser_key: u64, amount: u64) -> Result<()> {
        instructions::bet(ctx, anwser_key, amount)?;
        Ok(())
    }
}
