use anchor_lang::prelude::*;

#[account]
pub struct Market {
    pub event_name: String,
    pub outcome_tokens: Vec<OutcomeToken>,
    pub is_active: bool, // Added is_active to manage market state
}

#[account]
pub struct OutcomeToken {
    pub name: String,
    pub liquidity: u64,
    pub outcome_state: OutcomeState,
}

#[derive(Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum OutcomeState {
    Pending,
    Winning,
    Losing,
}
