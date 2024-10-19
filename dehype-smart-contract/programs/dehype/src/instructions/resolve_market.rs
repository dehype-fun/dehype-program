use std::sync::Arc;

use anchor_lang::{prelude::*, solana_program::{native_token::LAMPORTS_PER_SOL, program::{invoke, invoke_signed}, system_instruction}, system_program};
// use anchor_spl::{
//     associated_token::{self, spl_associated_token_account, AssociatedToken}, metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata}, token::Token, token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface}
// };
use anchor_spl::{
    associated_token::AssociatedToken, token_2022::{
        initialize_mint2,
        spl_token_2022::{self, extension::ExtensionType, state::Mint as Token2022Mint},
        InitializeMint2, Token2022,
    }
    // token_interface::{
    //     spl_token_metadata_interface::state::TokenMetadata, TokenMetadataInitialize,
    // },
};
// use mpl_token_metadata::types::{CollectionDetails, DataV2};
use crate::{consts::MEME_TOKEN_SEED, errors::ProgramErrorCode, states::{answer::{self, Answer, AnswerAccount}, market::MarketAccount, pool::{Pool, POOL_SEED}, ConfigAccount, CONFIG_SEED}};

#[derive(Accounts)]
#[instruction(correct_answer_key: u64)]
pub struct ResolveMarket<'info> {
    // account that signs the transaction
    #[account(
        mut,
        address = config.authority // check if the signer is the authority of the config account
    )]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED], // just one config account, so we use one string for the seed
        bump
    )]
    pub config: Box<Account<'info, ConfigAccount>>,
    #[account(
        init,
        payer = signer,
        space = 8 + Pool::INIT_SPACE,
        seeds = [POOL_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()], // because we will have multi pool for multi mint, so we use a string and the mint key as the seed
        bump
    )]
    pub pool: Box<Account<'info, Pool>>,
    // the mint of the token to be rewarded
    #[account(
        mut
        // init,
        // payer = signer,
        // mint::token_program = token_program, // check token program of the mint must be the same as the reward_token_program
        // mint::authority = config, // check authority of the mint must be config account
        // mint::decimals = 9,
        // seeds = [MEME_TOKEN_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()],
        // bump
    )]
    pub meme_token_mint: Signer<'info>,
    // create a associated token account to keep the reward token for the pool
    // #[account(
    //     init,
    //     payer = signer,
    //     associated_token::mint = meme_token_mint,
    //     associated_token::authority = pool, 
    //     associated_token::token_program = token_program,   
    // )]
    // pub meme_token_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub market_account: Box<Account<'info, MarketAccount>>,
    #[account(mut)]
    pub answer_account: Box<Account<'info, AnswerAccount>>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_account: AccountInfo<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> ResolveMarket<'info> {
    pub fn handler(&mut self, allocation: u64, correct_answer_key: u64, bumps: ResolveMarketBumps) -> Result<()> {
        // require_gt!(allocation, 0, ProgramErrorCode::AllocationMustBeGreaterThanZero);

        // let is_answer_exist = self.answer_account.answers.iter().any(|answer| answer.answer_key == correct_answer_key);
        // require!(is_answer_exist, ProgramErrorCode::InvalidAnswer);
        // msg!("mint {:?}", self.meme_token_mint.to_account_info().key());
        // self.pool.set_inner(Pool { 
        //     authority: self.signer.to_account_info().key(), 
        //     meme_token_mint: self.meme_token_mint.to_account_info().key(),
        //     meme_token_ata: self.meme_token_ata.to_account_info().key(),
        //     allocation
        // });
        // self.market_account.is_active = false;
        // self.market_account.correct_answer_key = correct_answer_key;
        
        // self.mint_token_for_pool(allocation, bumps)?;
        let answer = self.answer_account.answers.iter().find(|answer| answer.answer_key == correct_answer_key).unwrap();
        // self.create_metadata(answer.clone(), bumps)?;
        Ok(())
    }

    fn mint_token_for_pool(&mut self, amount: u64, bumps: ResolveMarketBumps) -> Result<()> {
        // let cpi_accounts = MintTo {
        //     mint: self.meme_token_mint.to_account_info(),
        //     to: self.meme_token_ata.to_account_info(),
        //     authority: self.config.to_account_info(),
        // };
      
        // let seeds = &[CONFIG_SEED, &[bumps.config]];
        // let signer_seeds = &[&seeds[..]];

        // mint_to(CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer_seeds), amount)?;
      
        Ok(())
    }

    pub fn create_metadata(&mut self, answer: Answer, bumps: ResolveMarketBumps) -> Result<()> {
        // acquire the seeds to sign the transaction init token metadata
        let seeds : &[&[u8]] = &[CONFIG_SEED, &[bumps.config]];
        // let seeds : &[&[u8]] = &[MEME_TOKEN_SEED, &self.market_account.market_key.to_le_bytes(),  &answer.answer_key.to_le_bytes()];
        let signer_seeds = &[&seeds[..]];

        // calculate the size of the account, because we use extension MetadataPointer, account size is different legacy spl-token account
        let size =
            ExtensionType::try_calculate_account_len::<Token2022Mint>(&[ExtensionType::MetadataPointer])
                .unwrap();

        // define the metadata of the token to be created (for simplicity, i hardcode the metadata and empty additional_metadata)
        let metadata = TokenMetadata {
            update_authority:
                anchor_spl::token_interface::spl_pod::optional_keys::OptionalNonZeroPubkey(
                    self.config.to_account_info().key(),
                ),
            mint: self.meme_token_mint.to_account_info().key(),
            name: answer.outcome_token_name.clone(),
            symbol: answer.outcome_token_symbol.clone(),
            uri: answer.outcome_token_url.clone(),
            additional_metadata: vec![],
        };

        // calculate the extra space needed for the metadata by Type-length-value of the metadata
        let extension_extra_space = metadata.tlv_size_of().unwrap();

        // calculate the minimum balance needed for the account
        let lamports = self.rent.minimum_balance(size + extension_extra_space);
        // msg!("okeem");
        // let seeds = &[MEME_TOKEN_SEED, &self.market_account.market_key.to_le_bytes(),  &answer.answer_key.to_le_bytes(), &[bumps.meme_token_mint]];
        // let signer = [&seeds[..]];
        // let token_data: DataV2 = DataV2 {
        //     name: answer.outcome_token_name.clone(),
        //     symbol: answer.outcome_token_symbol.clone(),
        //     uri: answer.outcome_token_url.clone(),
        //     seller_fee_basis_points: 0,
        //     creators: None,
        //     collection: None,
        //     uses: None,
        // };
        // let metadata_ctx = CpiContext::new_with_signer(
        //     self.metadata_program.to_account_info(),
        //     CreateMetadataAccountsV3 {
        //         payer: self.signer.to_account_info(),
        //         update_authority: self.meme_token_mint.to_account_info(),
        //         mint: self.meme_token_mint.to_account_info(),
        //         metadata: self.metadata.to_account_info(),
        //         mint_authority: self.meme_token_mint.to_account_info(),
        //         system_program: self.system_program.to_account_info(),
        //         rent: self.rent.to_account_info(),
        //     },
        //     &signer
        // );

        // let ix = create_metadata_accounts_v3(
        //     metadata_ctx,
        //     token_data,
        //     false,
        //     false,
        //     None,
        // // );
        // let metadata_ctx = CpiContext::new_with_signer(
        //     self.metadata_program.to_account_info(),
        //     CreateMetadataAccountsV3 {
        //         payer: self.signer.to_account_info(),
        //         update_authority: self.meme_token_mint.to_account_info(),
        //         mint: self.meme_token_mint.to_account_info(),
        //         metadata: self.metadata.to_account_info(),
        //         mint_authority: self.meme_token_mint.to_account_info(),
        //         system_program: self.system_program.to_account_info(),
        //         rent: self.rent.to_account_info(),
        //     },
        //     &signer
        // );

        // let ix = create_metadata_accounts_v3(
        //     metadata_ctx,
        //     token_data,
        //     false,
        //     false,
        //     None,
        // );
        // Ok(())

        // call cpi to create the account with owner as token 2022 program
        system_program::create_account(
            CpiContext::new(
                self.system_program.to_account_info(),
                system_program::CreateAccount {
                    from: self.signer.to_account_info(),
                    to: self.meme_token_mint.to_account_info(),
                },
            ),
            lamports,
            size.try_into().unwrap(),
            &spl_token_2022::ID,
        )?;

        // call cpi to initialize the metadata pointer point to the mint itself

        token_2022_extensions::metadata_pointer_initialize(
            CpiContext::new(
                self.token_program.to_account_info(),
                token_2022_extensions::MetadataPointerInitialize {
                    token_program_id: self.token_program.to_account_info(),
                    mint: self.meme_token_mint.to_account_info(),
                },
            ),
            None,
            None
        )?;
        // call the cpi to initialize the mint with authority as the config account

        initialize_mint2(
            CpiContext::new(
                self.token_program.to_account_info(),
                InitializeMint2 {
                    mint: self.meme_token_mint.to_account_info(),
                },
            ),
            9,
            &self.config.to_account_info().key(),
            None,
        )?;

        // call the cpi to initialize the token metadata with the metadata defined above

        token_2022_extensions::token_metadata_initialize(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TokenMetadataInitialize {
                    token_program_id: self.token_program.to_account_info(),
                    mint: self.meme_token_mint.to_account_info(),
                    metadata: self.meme_token_mint.to_account_info(),
                    mint_authority: self.config.to_account_info(),
                    update_authority: self.config.to_account_info(),
                },
                signer_seeds,
            ),
            answer.outcome_token_name.to_string(),
            answer.outcome_token_symbol.to_string(),
            answer.outcome_token_url.to_string(),
        )?;

        Ok(())
    }
}
