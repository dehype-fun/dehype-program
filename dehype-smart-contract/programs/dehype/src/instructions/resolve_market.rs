use anchor_lang::{prelude::*, solana_program::{native_token::LAMPORTS_PER_SOL, program::{invoke, invoke_signed}, system_instruction}, system_program};
use anchor_spl::{
    associated_token::{self, spl_associated_token_account, AssociatedToken}, metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata}, token::Token, token_interface::{mint_to, MintTo, TokenAccount, TokenInterface}
};
// use crate::state::{CurveConfiguration, LiquidityPool, LiquidityPoolAccount};
use anchor_spl::{
    token_2022::{
        initialize_mint2,
        spl_token_2022::{self, extension::ExtensionType, state::Mint},
        InitializeMint2, Token2022,
    },
    token_2022_extensions::{self},
    token_interface::{
        spl_token_metadata_interface::state::TokenMetadata, TokenMetadataInitialize,
    },
};
use mpl_token_metadata::types::{CollectionDetails, DataV2};
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
    #[account(
            init,
            seeds = [MEME_TOKEN_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()],
            bump,
            payer = signer,
            mint::decimals = 6,
            mint::authority = mint,
    )]
    pub meme_token_mint: Account<'info, Mint>,
    #[account(
        mut,
        address=find_metadata_account(&meme_token_mint.key()).0
    )]
    pub metadata: UncheckedAccount<'info>,
    #[account( 
        init_if_needed,
        payer = signer,
        associated_token::mint = meme_token_mint,
        associated_token::authority = config.authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    // the mint of the token to be rewarded
    // #[account(
    //     mut
    //     // init,
    //     // payer = signer,
    //     // mint::token_program = token_program, // check token program of the mint must be the same as the reward_token_program
    //     // mint::authority = config, // check authority of the mint must be config account
    //     // mint::decimals = 9,
    //     // seeds = [MEME_TOKEN_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()],
    //     // bump
    // )]
    // pub meme_token_mint: Signer<'info>,
    // create a associated token account to keep the reward token for the pool
    // #[account(
    //     mut,
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
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, TokenMetadata>,
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
        self.create_metadata(answer.clone(), bumps)?;
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

       pub fn create_metadata(&mut self, answer: Answer,  bumps: ResolveMarketBumps) -> Result<()> {
            let seeds = &[CONFIG_SEED, &[bumps.config]];
            let signer = [&seeds[..]];
            const MINT_NAME: &str = "DeHype";
            const MINT_SYMBOL: &str = "DH";
            const MINT_URI: &str = "https://raw.githubusercontent.com/TranSiTien/Demage/main/assets/token-info.json";
            let account_info = vec![
                self.metadata.to_account_info(),
                self.meme_token_mint.to_account_info(),
                self.signer.to_account_info(),
                self.token_metadata_program.to_account_info(),
                self.token_program.to_account_info(),
                self.system_program.to_account_info(),
                self.rent.to_account_info(),
            ];
    
            invoke_signed(
                &create_metadata_accounts_v3(
                    self.token_metadata_program.key(), // token metadata program
                    self.metadata.key(),               // metadata account PDA for mint
                    self.meme_token_mint.key(),                   // mint account
                    self.meme_token_mint.key(),                   // mint authority
                    self.signer.key(),                   // payer for transaction
                    self.meme_token_mint.key(),                   // update authority
                    MINT_NAME,                                      // name
                    MINT_SYMBOL,                                    // symbol
                    MINT_URI,                                       // uri (offchain metadata)
                    None,                                      // (optional) creators
                    0,                                         // seller free basis points
                    true,                                      // (bool) update authority is signer
                    true,                                      // (bool) is mutable
                    None,                                      // (optional) collection
                    None,                                      // (optional) uses
                    None,                                      // (optional) collection details
                ),
                account_info.as_slice(),
                &signer,
            )?;
    
            mint_to(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    MintTo {
                        authority: self.mint.to_account_info(),
                        to: self.token_account.to_account_info(),
                        mint: self.mint.to_account_info(),
                    },
                    &signer,
                ),
                1,
            )?;
        // // acquire the seeds to sign the transaction init token metadata
        // let seeds = &[CONFIG_SEED, &[bumps.config]];
        // let signer_seeds = &[&seeds[..]];

        // // calculate the size of the account, because we use extension MetadataPointer, account size is different legacy spl-token account
        // let size =
        //     ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MetadataPointer])
        //         .unwrap();

        // const MINT_NAME: &str = "DeHype";
        // const MINT_SYMBOL: &str = "DH";
        // const MINT_URI: &str = "https://raw.githubusercontent.com/TranSiTien/Demage/main/assets/token-info.json";
        // // define the metadata of the token to be created (for simplicity, i hardcode the metadata and empty additional_metadata)
        // let metadata = TokenMetadata {
        //     update_authority:
        //         anchor_spl::token_interface::spl_pod::optional_keys::OptionalNonZeroPubkey(
        //             self.config.to_account_info().key(),
        //         ),
        //     mint: self.meme_token_mint.to_account_info().key(),
        //     name: MINT_NAME.to_string(),
        //     symbol: MINT_SYMBOL.to_string(),
        //     uri: MINT_URI.to_string(),
        //     additional_metadata: vec![],
        // };

        // // calculate the extra space needed for the metadata by Type-length-value of the metadata
        // let extension_extra_space = metadata.tlv_size_of().unwrap();

        // // calculate the minimum balance needed for the account
        // let lamports = self.rent.minimum_balance(size + extension_extra_space);

        // // call cpi to create the account with owner as token 2022 program
        // system_program::create_account(
        //     CpiContext::new(
        //         self.system_program.to_account_info(),
        //         system_program::CreateAccount {
        //             from: self.signer.to_account_info(),
        //             to: self.meme_token_mint.to_account_info(),
        //         },
        //     ),
        //     lamports,
        //     size.try_into().unwrap(),
        //     &spl_token_2022::ID,
        // )?;

        // // call cpi to initialize the metadata pointer point to the mint itself

        // token_2022_extensions::metadata_pointer_initialize(
        //     CpiContext::new(
        //         self.token_program.to_account_info(),
        //         token_2022_extensions::MetadataPointerInitialize {
        //             token_program_id: self.token_program.to_account_info(),
        //             mint: self.meme_token_mint.to_account_info(),
        //         },
        //     ),
        //     Some(self.config.to_account_info().key()),
        //     Some(self.meme_token_mint.to_account_info().key()),
        // )?;

        // // call the cpi to initialize the mint with authority as the config account

        // initialize_mint2(
        //     CpiContext::new(
        //         self.token_program.to_account_info(),
        //         InitializeMint2 {
        //             mint: self.meme_token_mint.to_account_info(),
        //         },
        //     ),
        //     9,
        //     &self.config.to_account_info().key(),
        //     None,
        // )?;

        // // call the cpi to initialize the token metadata with the metadata defined above

        // token_2022_extensions::token_metadata_initialize(
        //     CpiContext::new_with_signer(
        //         self.token_program.to_account_info(),
        //         TokenMetadataInitialize {
        //             token_program_id: self.token_program.to_account_info(),
        //             mint: self.meme_token_mint.to_account_info(),
        //             metadata: self.meme_token_mint.to_account_info(),
        //             mint_authority: self.config.to_account_info(),
        //             update_authority: self.config.to_account_info(),
        //         },
        //         signer_seeds,
        //     ),
        //     MINT_NAME.to_string(),
        //     MINT_SYMBOL.to_string(),
        //     MINT_URI.to_string(),
        // )?;

        Ok(())
    }
}