use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod errors;
pub mod states;
pub mod utils;
pub mod consts;
use crate::instructions::*;
pub mod instructions;
use instructions::Initialize;

declare_id!("AE5qJgwZcDMjZ67a3TDqkujsfgHCZJ4fiA6vJJ1gisLh");

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
        outcome_token_names: Option<Vec<String>>,
        outcome_token_logos: Option<Vec<String>>,
        service_fee_percentage: u64,
    ) -> Result<()> {
        instructions::create_market(
            ctx,
            market_key,
            title,
            description,
            cover_url,
            answers,
            outcome_token_names,
            outcome_token_logos,
            service_fee_percentage,
        )?;
        Ok(())
    }

    pub fn bet(ctx: Context<Bet>, anwser_key: u64, amount: u64) -> Result<()> {
        instructions::bet(ctx, anwser_key, amount)?;
        Ok(())
    }
    pub fn retrive(ctx: Context<Retrieve>, anwser_key: u64, amount: u64) -> Result<()> {
        instructions::retrive(ctx, anwser_key, amount)?;
        Ok(())
    }
    pub fn resolve_market(ctx: Context<ResolveMarket>, correct_answer_key: u64) -> Result<()> {
        return ctx.accounts.handler(10, correct_answer_key, ctx.bumps);
    }
}
