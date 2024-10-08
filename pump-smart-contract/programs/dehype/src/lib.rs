use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod errors;
pub mod states;
pub mod utils;
use crate::instructions::*;
pub mod instructions;
use instructions::Initialize;

declare_id!("4F6THBo31VYYfUKwfYCpUERSZccH9KYR9LTw4twyZ6iV");

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
        answers: Vec<String>,
        creator_fee_percentage: u64,
        service_fee_percentage: u64,
    ) -> Result<()> {
        instructions::create_market(
            ctx,
            market_key,
            title,
            description,
            answers,
            creator_fee_percentage,
            service_fee_percentage,
        )?;
        Ok(())
    }
}
