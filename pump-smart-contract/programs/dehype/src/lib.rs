use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod state;
pub mod states;
pub mod errors;
use crate::instructions::*;
pub mod instructions;
use instructions::Initialize;

declare_id!("2VEmmnYYUThb6QWAidWoZe2ePbTQ9UbSKT8miAzaV3kx");

#[program]
pub mod dehype {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>
    ) -> Result<()> {
        instructions::initialize(ctx)?;
        Ok(())
    }
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_key: u64,
        creator: Pubkey,
        title: String,
        description: String,
        answers: Vec<String>,
        creator_fee_percentage: u64,
        service_fee_percentage: u64
    ) -> Result<()> {
        instructions::create_market(
            ctx,
            market_key,
            creator,
            title,
            description,
            answers,
            creator_fee_percentage,
            service_fee_percentage
        )?;
        Ok(())
    }
}