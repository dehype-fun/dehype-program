use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
    use anchor_spl::{
        associated_token::AssociatedToken,
        token::{mint_to, Mint, MintTo, Token, TokenAccount},
    };
    use borsh::BorshDeserialize;
    use mpl_token_metadata::{
        instruction::create_metadata_accounts_v3, pda::find_metadata_account, ID as MetadataID,
    };
#[derive(Clone)]
pub struct TokenMetaData;
impl anchor_lang::Id for TokenMetaData {
    fn id() -> Pubkey {
        MetadataID
    }
}
use crate::states::{pool::Pool, ConfigAccount, CONFIG_SEED};

#[derive(Accounts)]
pub struct CreateToken<'info> {
    // account that signs the transaction
    #[account(mut)]
    pub signer: Signer<'info>,

    // account save the config of the program
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + ConfigAccount::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ConfigAccount>,

    // a account for the mint of the token
    #[account(mut)]
    pub mint: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, TokenMetaData>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateToken<'info> {
    pub fn handler(&mut self, bumps: CreateTokenBumps) -> Result<()> {
        self.create_metadata(bumps)?;
        Ok(())
    }

    pub fn create_metadata(&mut self, bumps: CreateTokenBumps) -> Result<()> {
        // acquire the seeds to sign the transaction init token metadata
        let seeds = &[CONFIG_SEED, &[bumps.config]];
        let signer_seeds = &[&seeds[..]];

        // calculate the size of the account, because we use extension MetadataPointer, account size is different legacy spl-token account
        let size =
            ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MetadataPointer])
                .unwrap();

        const MINT_NAME: &str = "DeHype";
        const MINT_SYMBOL: &str = "DH";
        const MINT_URI: &str = "https://dehype.com";
        // define the metadata of the token to be created (for simplicity, i hardcode the metadata and empty additional_metadata)
        let metadata = TokenMetadata {
            update_authority:
                anchor_spl::token_interface::spl_pod::optional_keys::OptionalNonZeroPubkey(
                    self.config.to_account_info().key(),
                ),
            mint: self.mint.to_account_info().key(),
            name: MINT_NAME.to_string(),
            symbol: MINT_SYMBOL.to_string(),
            uri: MINT_URI.to_string(),
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
                    to: self.mint.to_account_info(),
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
                    mint: self.mint.to_account_info(),
                },
            ),
            Some(self.config.to_account_info().key()),
            Some(self.mint.to_account_info().key()),
        )?;

        // call the cpi to initialize the mint with authority as the config account

        initialize_mint2(
            CpiContext::new(
                self.token_program.to_account_info(),
                InitializeMint2 {
                    mint: self.mint.to_account_info(),
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
                    mint: self.mint.to_account_info(),
                    metadata: self.mint.to_account_info(),
                    mint_authority: self.config.to_account_info(),
                    update_authority: self.config.to_account_info(),
                },
                signer_seeds,
            ),
            MINT_NAME.to_string(),
            MINT_SYMBOL.to_string(),
            MINT_URI.to_string(),
        )?;

        Ok(())
    }
}
