use anchor_lang::{prelude::*, solana_program::{native_token::LAMPORTS_PER_SOL, program::invoke, system_instruction}, system_program};
use anchor_spl::{
    associated_token::{self, spl_associated_token_account, AssociatedToken}, token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface}
};
use anchor_spl::{
    token_2022::{
        initialize_mint2,
        spl_token_2022::{self, extension::ExtensionType, state::Mint as Token2022Mint},
        InitializeMint2, Token2022,
    },
    token_2022_extensions::{self},
    token_interface::{
        spl_token_metadata_interface::state::TokenMetadata, TokenMetadataInitialize,
    },
};
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
    pub config: Account<'info, ConfigAccount>,
    #[account(
        init,
        payer = signer,
        space = 8 + Pool::INIT_SPACE,
        seeds = [POOL_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()], // because we will have multi pool for multi mint, so we use a string and the mint key as the seed
        bump
    )]
    pub pool: Account<'info, Pool>,
    // the mint of the token to be rewarded
    #[account(
        init,
        payer = signer,
        mint::token_program = token_program, // check token program of the mint must be the same as the reward_token_program
        mint::authority = pool, // check authority of the mint must be config account
        mint::decimals = 9,
        seeds = [MEME_TOKEN_SEED, &market_account.market_key.to_le_bytes(),  &correct_answer_key.to_le_bytes()],
        bump
    )]
    pub meme_token_mint: Box<InterfaceAccount<'info, Mint>>,
    // create a associated token account to keep the reward token for the pool
    #[account(
        init,
        payer = signer,
        associated_token::mint = meme_token_mint,
        associated_token::authority = pool, 
        associated_token::token_program = token_program,   
    )]
    pub meme_token_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub market_account: Account<'info, MarketAccount>,
    #[account(mut)]
    pub answer_account: Account<'info, AnswerAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
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
        require_gt!(allocation, 0, ProgramErrorCode::AllocationMustBeGreaterThanZero);

        let is_answer_exist = self.answer_account.answers.iter().any(|answer| answer.answer_key == correct_answer_key);
        require!(is_answer_exist, ProgramErrorCode::InvalidAnswer);

        // self.create_ata(bumps)?;
        // self.pool.set_inner(Pool { 
        //     authority: self.signer.to_account_info().key(), 
        //     meme_token_mint: self.meme_token_mint.to_account_info().key(),
        //     meme_token_ata: self.meme_token_ata.to_account_info().key(),
        //     allocation
        // });
        // self.market_account.is_active = false;
        // self.market_account.correct_answer_key = correct_answer_key;
        
        // self.mint_token_for_pool(allocation, bumps)?;
        Ok(())
    }

    pub fn create_ata(&mut self, bumps: ResolveMarketBumps) -> Result<()> {
        // msg!("Creating associated token account");
        // msg!("associated_token_program: {:?}", self.associated_token_program.key().to_string());
        // msg!("meme_token_ata: {:?}", self.meme_token_ata.key().to_string());
        // // msg!("config: {:?}", self.config);
        // msg!("meme_token_mint: {:?}", self.meme_token_mint.key().to_string());
        // msg!("system_program: {:?}", self.system_program.key().to_string());
        // msg!("token_program: {:?}", self.token_program);
        // let seeds : &[&[u8]] = &[CONFIG_SEED, &[bumps.config]];
        // let signer_seeds = &[&seeds[..]];
        // associated_token::create(
        //     CpiContext::new(
        //         self.associated_token_program.to_account_info(),
        //         associated_token::Create {
        //             payer: self.signer.to_account_info(),
        //             associated_token: self.meme_token_ata.to_account_info(),                   
        //             authority: self.config.to_account_info(),
        //             mint: self.meme_token_mint.to_account_info(),
        //             system_program: self.system_program.to_account_info(),
        //             token_program: self.token_program.to_account_info(),
        //     }
        // ),
        // )?;
    invoke(
        &system_instruction::transfer(
            &self.signer.key(),
            &self.vault_account.key(),
            10000,
        ),
        &[
            self.signer.to_account_info(),
            self.vault_account.to_account_info(),
            self.system_program.to_account_info(),
        ]
    )?;

    let ix_create_ata = spl_associated_token_account::instruction::create_associated_token_account(
        self.signer.to_account_info().key,
        self.config.to_account_info().key,
        self.meme_token_mint.to_account_info().key,
        self.token_program.to_account_info().key,
    );

    let _ = anchor_lang::solana_program::program::invoke(
        &ix_create_ata,
        &[
            self.signer.to_account_info(),
            self.meme_token_ata.to_account_info(),
            self.config.to_account_info(),
            self.meme_token_mint.to_account_info(),
            self.system_program.to_account_info(),
            self.token_program.to_account_info(),
            // ctx.accounts.payer
            // ctx.accounts.associated_token,
            // ctx.accounts.authority,
            // ctx.accounts.mint,
            // ctx.accounts.system_program,
            // ctx.accounts.token_program,
        ],
    );
        Ok(())
    }

    fn mint_token_for_pool(&mut self, amount: u64, bumps: ResolveMarketBumps) -> Result<()> {

        let cpi_accounts = MintTo {
            mint: self.meme_token_mint.to_account_info(),
            to: self.meme_token_ata.to_account_info(),
            authority: self.config.to_account_info(),
        };
      
        let seeds = &[CONFIG_SEED, &[bumps.config]];
        let signer_seeds = &[&seeds[..]];

        mint_to(CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer_seeds), amount)?;
      
        Ok(())
    }

    pub fn create_metadata(&mut self, answer: Answer, bumps: ResolveMarketBumps) -> Result<()> {
        // acquire the seeds to sign the transaction init token metadata
        let seeds : &[&[u8]] = &[CONFIG_SEED, &[bumps.config]];
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
            Some(self.config.to_account_info().key()),
            Some(self.meme_token_mint.to_account_info().key()),
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
