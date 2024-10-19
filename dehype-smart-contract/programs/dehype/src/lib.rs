use anchor_lang::prelude::*;
use std::vec::Vec;

pub mod errors;
pub mod states;
pub mod utils;
pub mod consts;
use crate::instructions::*;
pub mod instructions;
declare_id!("G9S21SvVF4J23WWzyudn9BsAov6K2wxVK5US7tJVKX5Q");

#[program]
pub mod dehype {
    use anchor_spl::dex::InitializeMarket;
    use initialize_serum_market::InitializeSerumMarket;
    use mpl_token_metadata::{instructions::{CreateMetadataAccountV3, CreateMetadataAccountV3Cpi, CreateMetadataAccountV3InstructionArgs}, types::DataV2};
    use solana_program::program::invoke_signed;

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
    // pub fn resolve_market(ctx: Context<ResolveMarket>, correct_answer_key: u64) -> Result<()> {
    //     return ctx.accounts.handler(10, correct_answer_key, ctx.bumps);
    // }
    // pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
    //     return ctx.accounts.handler(ctx.bumps)
    // }
    pub fn mint_ctrl(ctx: Context<MintCtrl>, bump: u8, amount: u64) -> Result<()> {
    anchor_spl::token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.mint.to_account_info(),
            },
            &[&[CTRLSEED, &[bump]]],
        ),amount,
    )?;
    Ok(())
}  
    pub fn tok_meta(ctx: Context<TokMeta>, bump: u8) -> Result<()> {
        let seeds = &[CTRLSEED, &[bump]];
        let signer = &[&seeds[..]];
        let token_data: DataV2 = DataV2 {
            name: "SYM".to_string(),
            symbol: "SYM".to_string(),
            uri: "https://bernieblume.github.io/Ctrl/Ctrl.json".to_string(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };
        let binding = ctx.accounts.rent.to_account_info();
        let cpi = CreateMetadataAccountV3Cpi {
            __program: &ctx.accounts.metadata_program.to_account_info(),
            payer: &ctx.accounts.payer.to_account_info(),
            update_authority: (&ctx.accounts.mint.to_account_info(), true),
            mint: &ctx.accounts.mint.to_account_info(),
            metadata: &ctx.accounts.metadata.to_account_info(),
            mint_authority: &ctx.accounts.mint.to_account_info(),
            system_program: &ctx.accounts.system_program.to_account_info(),
            rent: Some(&binding),
            __args: CreateMetadataAccountV3InstructionArgs {
                data: token_data,
                is_mutable: true,
                collection_details: None,
            },
        };
        cpi.invoke_signed(signer)?;
        // anchor_spl::dex::initialize_market(ctx, coin_lot_size, pc_lot_size, vault_signer_nonce, pc_dust_threshold)
    //    let ix = create_metadata_accounts_v2(
    //         *ctx.accounts.metadata_program.to_account_info().key, // program_id,
    //         *ctx.accounts.metadata_pda.to_account_info().key, // metadata_account,
    //         *ctx.accounts.mint.to_account_info().key, //mint,
    //         *ctx.accounts.mint.to_account_info().key, //mint_authority,
    //         *ctx.accounts.payer.to_account_info().key, //payer,
    //         *ctx.accounts.updauth.to_account_info().key, //update_authority,
    //         String::from("CTRL - Program Controlled Token"), // name,
    //         String::from("CTRL"), // symbol,
    //         String::from("https://bernieblume.github.io/Ctrl/Ctrl.json"), // uri,
    //         None, // creators,
    //         0u16, //seller_fee_basis_points,
    //         false, // update_authority_is_signer,
    //         true, // is_mutable,
    //         None, // collection,
    //         None, // uses,
    //         // for create_metadata_accounts_v3, add:     None, // collection_details
    //     );
    //     invoke_signed(
    //         &ix,
    //         &[
    //             ctx.accounts.metadata_program.to_account_info().clone(), // Metadata program id
    //             ctx.accounts.metadata_pda.to_account_info().clone(), // Metadata account
    //             ctx.accounts.mint.to_account_info().clone(), // Mint
    //             ctx.accounts.mint.to_account_info().clone(), // Mint Authority
    //             ctx.accounts.payer.to_account_info().clone(), // Payer
    //             ctx.accounts.updauth.to_account_info().clone(), // Update Authority
    //             ctx.accounts.system_program.to_account_info().clone(), // System Program
    //             ctx.accounts.rent.to_account_info().clone(), // Rent Sysvar
    //         ],
    //         &[
    //             &[CTRLSEED.as_ref(), &[bump]],
    //         ],
    //     )?;
        Ok(())
    //     let ix = create_metadata_accounts_v3(
    //         ctx, data, is_mutable, update_authority_is_signer, collection_details);
    // //    let ix = create_metadata_accounts_v2(
    // //         *ctx.accounts.metadata_program.to_account_info().key, // program_id,
    // //         *ctx.accounts.metadata_pda.to_account_info().key, // metadata_account,
    // //         *ctx.accounts.mint.to_account_info().key, //mint,
    // //         *ctx.accounts.mint.to_account_info().key, //mint_authority,
    // //         *ctx.accounts.payer.to_account_info().key, //payer,
    // //         *ctx.accounts.updauth.to_account_info().key, //update_authority,
    // //         String::from("CTRL - Program Controlled Token"), // name,
    // //         String::from("CTRL"), // symbol,
    // //         String::from("https://bernieblume.github.io/Ctrl/Ctrl.json"), // uri,
    // //         None, // creators,
    // //         0u16, //seller_fee_basis_points,
    // //         false, // update_authority_is_signer,
    // //         true, // is_mutable,
    // //         None, // collection,
    // //         None, // uses,
    // //         // for create_metadata_accounts_v3, add:     None, // collection_details
    // //     );
    //     invoke_signed(
    //         &ix,
    //         &[
    //             ctx.accounts.metadata_program.to_account_info().clone(), // Metadata program id
    //             ctx.accounts.metadata_pda.to_account_info().clone(), // Metadata account
    //             ctx.accounts.mint.to_account_info().clone(), // Mint
    //             ctx.accounts.mint.to_account_info().clone(), // Mint Authority
    //             ctx.accounts.payer.to_account_info().clone(), // Payer
    //             ctx.accounts.updauth.to_account_info().clone(), // Update Authority
    //             ctx.accounts.system_program.to_account_info().clone(), // System Program
    //             ctx.accounts.rent.to_account_info().clone(), // Rent Sysvar
    //         ],
    //         &[
    //             &[CTRLSEED.as_ref(), &[bump]],
    //         ],
    //     )?;
        // Ok(())
    }
    pub fn inititialize_serum_market(ctx: Context<InitializeSerumMarket>, bump: u8, coin_lot_size :u64, pc_lot_size:u64, vault_signer_nonce:u64, pc_dust_threshold:u64) -> Result<()>  {
        msg!("Inititialize Serum Market");
        // ctx.accounts.market_signer = Signer:: Keypair::new();
        let cpi_context = CpiContext::new(
            ctx.accounts.dex_program.to_account_info(),
            anchor_spl::dex::InitializeMarket {
                market: ctx.accounts.market.to_account_info(),
                coin_mint: ctx.accounts.coin_mint.to_account_info(),
                pc_mint: ctx.accounts.pc_mint.to_account_info(),
                coin_vault: ctx.accounts.coin_vault.to_account_info(),
                pc_vault: ctx.accounts.pc_vault.to_account_info(),
                bids: ctx.accounts.bids.to_account_info(),
                asks: ctx.accounts.asks.to_account_info(),
                req_q: ctx.accounts.req_q.to_account_info(),
                event_q: ctx.accounts.event_q.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            }
        );
        let a = anchor_spl::dex::initialize_market(cpi_context, coin_lot_size, pc_lot_size, vault_signer_nonce, pc_dust_threshold);
        msg!("Inititialize Serum Market Done {:?}", a);
        Ok(())
    }
}
