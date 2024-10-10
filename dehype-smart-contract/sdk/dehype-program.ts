import { BN, IdlAccounts, Program } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  ConfirmOptions,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  AuthorityType,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createSetAuthorityInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { Dehype } from '../target/types/dehype';
import { PROGRAM_ID } from '../cli/programId';
import * as anchor from "@coral-xyz/anchor";
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

const provider = anchor.AnchorProvider.env();

export type ConfigData = IdlAccounts<Dehype>['configAccount'];
export type MarketData = IdlAccounts<Dehype>["marketAccount"];
export type AnswerData = IdlAccounts<Dehype>["answerAccount"];
export type BettingData = IdlAccounts<Dehype>["bettingAccount"];

export class DehypeProgram {
    constructor(
      public readonly idl: Dehype
    ) { }
  
    get program() {
      return new Program(this.idl, provider);
    }
  
    get accounts(): any {
      return this.program.account;
    }
  
    public configPDA(): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        this.program.programId
      )[0];
    }

    public marketPDA(marketKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }
  
    public answerPDA(marketKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("answer"), marketKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }

    public bettingPDA(voter: PublicKey, marketKey: BN, anwserKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("betting"), voter.toBuffer(), marketKey.toBuffer("le", 8), anwserKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }

    public vaultPDA(marketKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("market_vault"), marketKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }

    public mintTokenPDA(marketKet: BN, answerKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("meme_token"), marketKet.toBuffer("le", 8), answerKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }

    public poolPDA(marketKey: BN, answerKey: BN): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), marketKey.toBuffer("le", 8), answerKey.toBuffer("le", 8)],
        this.program.programId
      )[0];
    }
  
    /**
     * Initializes the forecast exchange program.
     * @param owner - The public key of the owner.
     * @param pointMint - The public key of the point mint.
     * @param tokenMint - The public key of the token mint.
     * @returns A transaction object for the initialization.
     */
    public async initialize(owner: PublicKey): Promise<Transaction> {
      const tx = await this.program.methods
        .initialize()
        .accountsPartial({
          owner: owner,
          configAccount: this.configPDA(),
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      return tx;
    }

    public async createMarket(marketKey: BN, creator: PublicKey, eventName: string, description: string, cover_url: string, answers: string[], creatorFee: BN, outcomeTokenNames?: string[], outcomeTokenLogos?: string[]): Promise<Transaction> {
      const tx = await this.program.methods
        .createMarket(marketKey, eventName, description, cover_url, answers, outcomeTokenNames || null, outcomeTokenLogos || null, creatorFee)
        .accountsPartial({
          creator: creator,
          answerAccount: this.answerPDA(marketKey),
          marketAccount: this.marketPDA(marketKey),
          vaultAccount: this.vaultPDA(marketKey),
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      return tx;
    }
     /**
   * Places a bet on a market.
   * @param voter - The public key of the voter placing the bet.
   * @param marketKey - The key of the market to bet on.
   * @param betAmount - The amount of the bet.
   * @param answerKey - The key of the answer the bet is placed on.
   * @returns A transaction object for placing the bet.
   */
  public async bet(voter: PublicKey, marketKey: BN, betAmount: BN, answerKey: BN): Promise<Transaction> {
    const tx = await this.program.methods
      .bet(answerKey, betAmount)
      .accountsPartial({
        voter: voter,
        marketAccount: this.marketPDA(marketKey),
        vaultAccount: this.vaultPDA(marketKey),
        answerAccount: this.answerPDA(marketKey),
        betAccount: this.bettingPDA(voter, marketKey, answerKey),
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    return tx;
  }

  public async resolveMarket(signer: Signer, marketKey: BN, correctAnswer: BN): Promise<Transaction> {
    const mintPDA = this.mintTokenPDA(marketKey, correctAnswer);
    // const associatedToken = getAssociatedTokenAddressSync(mintPDA, signer.publicKey, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_PROGRAM_ID);

    // const transaction = new Transaction().add(
    //     createAssociatedTokenAccountInstruction(
    //         signer.publicKey,
    //         associatedToken,
    //         signer.publicKey,
    //         mintPDA,
    //         TOKEN_2022_PROGRAM_ID,
    //         ASSOCIATED_PROGRAM_ID
    //     )
    // );

    // await sendAndConfirmTransaction(provider.connection, transaction, [signer]);
    // const confirmOptions: ConfirmOptions = {
    //   commitment: "confirmed"
    // };
    // const ataKeypair = Keypair.generate();
    // const ataTx = new Transaction().add(createAssociatedTokenAccount(provider.connection, signer.publicKey, ataKeypair.publicKey, PROGRAM_ID, this.mintTokenPDA(marketKey, correctAnswer), TOKEN_2022_PROGRAM_ID, ASSOCIATED_PROGRAM_ID));
    // const transaction2 = new Transaction().add(
    //   SystemProgram.transfer({
    //     fromPubkey: signer.publicKey,
    //     toPubkey: ,
    //     lamports: 0.01 * LAMPORTS_PER_SOL,
    //   })
    // );
    // await provider.sendAndConfirm(ataTx, [signer]);
    // console.log("ATA", ataKeypair.publicKey.toString());
      // Fetch the account information
  // const accountInfo = await getAccount(provider.connection, ata, "confirmed", SystemProgram.programId);

  // Log the owner of the ATA
  // console.log("ATA Owner:", accountInfo.owner.toBase58());
  
    // Sign and send the transaction
    // const signature = await provider.sendAndConfirm(transaction, [signer]);

      // Create a transaction to set the authority of the PDA
  // const setAuthorityTransaction = new Transaction().add(
  //   createSetAuthorityInstruction(
  //     ata, // The account whose authority is being changed
  //     signer.publicKey, // Current authority
  //     AuthorityType.AccountOwner, // Type of authority change
  //     PROGRAM_ID, // New authority
  //     [], // Multisig signers (if any)
  //     TOKEN_PROGRAM_ID // Token program ID
  //   )
  // );

  // Send the set authority transaction
  // const signature2 = await provider.sendAndConfirm(setAuthorityTransaction, [signer]);
    // const ata = await getAssociatedTokenAddress(provider.connection, signer, this.mintTokenPDA(marketKey, correctAnswer), signer.publicKey, confirmOptions, TOKEN_2022_PROGRAM_ID);
    // console.log(ata);
    console.log("\n\n");
    console.log("signer", signer.publicKey);
    console.log("config", this.configPDA().toString());
    console.log("memetoken", this.mintTokenPDA(marketKey, correctAnswer).toString());
    console.log("market", this.marketPDA(marketKey).toString());
    console.log("answer", this.answerPDA(marketKey).toString());
    console.log("vault", this.vaultPDA(marketKey).toString());
    console.log("mintToken", this.mintTokenPDA(marketKey, correctAnswer).toString());
    console.log("\n\n");


    const tx = await this.program.methods
      .resolveMarket(correctAnswer)
      .accountsPartial({
        signer: signer,
        config: this.configPDA(),
        pool: this.poolPDA(marketKey, correctAnswer),
        memeTokenMint: this.mintTokenPDA(marketKey, correctAnswer),
        marketAccount: this.marketPDA(marketKey),
        answerAccount: this.answerPDA(marketKey),
        memeTokenAta: await getAssociatedTokenAddressSync(mintPDA, this.poolPDA(marketKey, correctAnswer), true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_PROGRAM_ID),
        vaultAccount: this.vaultPDA(marketKey),
      })
      .transaction();
    return tx;
  }
  public async retrive(voter: PublicKey, marketKey: BN, betAmount: BN, answerKey: BN): Promise<Transaction> {
    const tx = await this.program.methods
      .retrive(answerKey, betAmount)
      .accountsPartial({
        voter: voter,
        marketAccount: this.marketPDA(marketKey),
        answerAccount: this.answerPDA(marketKey),
        vaultAccount: this.vaultPDA(marketKey),
        betAccount: this.bettingPDA(voter, marketKey, answerKey),
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    return tx;
  }

  public async getConfigData(): Promise<ConfigData> {
      const configPDA = this.configPDA();
      const configData = await this.accounts.configAccount.fetch(configPDA);
      return configData;
    }
  /**
   * Retrieves the market data for a given market key.
   * @param marketKey - The key of the market.
   * @returns The market data as a `MarketData` object.
   */
  async getMarketData(marketKey: BN): Promise<MarketData> {
    const marketPDA = this.marketPDA(marketKey);
    const marketData = await this.accounts.marketAccount.fetch(marketPDA);
    return marketData;
  }

  /**
   * Retrieves the betting data for a given voter, market key, and answer key.
   * @param voter - The public key of the voter.
   * @param marketKey - The key of the market.
   * @param anwserKey - The key of the answer.
   * @returns The betting data as a `BettingData` object.
   */
    public async getBettingData(voter: PublicKey, marketKey: BN, anwserKey: BN): Promise<BettingData> {
      const bettingPDA = this.bettingPDA(voter, marketKey, anwserKey);
      const bettingData = await this.accounts.bettingAccount.fetch(bettingPDA);
      return bettingData;
    }

  /**
   * Retrieves the answer data for a given market key.
   * @param marketKey - The key of the market.
   * @returns The answer data as an `AnswerData` object.
   */
  public async getAnswerData(marketKey: BN): Promise<AnswerData> {
    const answerPDA = this.answerPDA(marketKey);
    const answerData = await this.accounts.answerAccount.fetch(answerPDA);
    return answerData;
  }

  public async fetchAllMarkets(): Promise<MarketData[]> {
      return await this.accounts.marketAccount.all();
  }
  public async fetchAllAnswer(): Promise<AnswerData[]> {
    return await this.accounts.answerAccount.all();
  }
}