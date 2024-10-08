import { BN, IdlAccounts, Program } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Dehype } from './types/dehype';
import { PROGRAM_ID } from '../cli/programId';
import * as anchor from "@coral-xyz/anchor";

const provider = anchor.AnchorProvider.env();

export type ConfigData = IdlAccounts<Dehype>['configAccount'];
export type MarketData = IdlAccounts<Dehype>["marketAccount"];
export type AnswerData = IdlAccounts<Dehype>["answerAccount"];

export class DehypeProgram {
    constructor(
      public readonly idl: Dehype,
      public readonly connection: Connection
    ) { }
  
    get program() {
      return new Program(this.idl, PROGRAM_ID, provider);
    }
  
    get accounts(): any {
      return this.program.account;
    }
  
    public configPDA(owner_key: PublicKey): PublicKey {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("config"), owner_key.toBuffer()],
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
  
    // /**
    //   * Adds an event listener for the 'bought' event.
    //   * @param handler - The function to handle the event.
    //   */
    // onBoughtPoint(handler: (event: any) => void) {
    //   this.program.addEventListener('bought', handler)
    // }
  
    // /**
    //   * Adds an event listener for the 'sold' event.
    //   * @param handler - The function to handle the event.
    //   */
    // onSellPoint(handler: (event: any) => void) {
    //   this.program.addEventListener('sold', handler)
    // }
  
    /**
     * Initializes the forecast exchange program.
     * @param owner - The public key of the owner.
     * @param pointMint - The public key of the point mint.
     * @param tokenMint - The public key of the token mint.
     * @returns A transaction object for the initialization.
     */
    public async initialize(owner: PublicKey, pointMint: PublicKey, tokenMint: PublicKey): Promise<Transaction> {
      const tx = await this.program.methods
        .initialize(pointMint, tokenMint)
        .accounts({
          owner: owner,
          configAccount: this.configPDA(owner),
          systemProgram: SystemProgram.programId
        })
        .transaction();
      const configPDA = this.configPDA(owner);
      console.log("configPDA", configPDA);
      console.log("configPDA", configPDA.toString);
      return tx;
    }

    public async createMarket(marketKey: BN, owner: PublicKey, eventName: string, answers: string[], creatorFee: BN, serviceFee: BN): Promise<Transaction> {
      const tx = await this.program.methods
        .createMarket(marketKey, owner, eventName, answers, creatorFee, serviceFee)
        .accounts({
          owner: owner,
          configAccount: this.configPDA(owner),
          marketAccount: this.marketPDA(marketKey),
          answerAccount: this.answerPDA(marketKey),
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      return tx;
    }
  
    // /**
    //  * Buys points using tokens.
    //  * @param user - The public key of the user.
    //  * @param amount - The amount of points to buy.
    //  * @returns A transaction object for buying points.
    //  */
    // public async buyPoint(user: PublicKey, amount: BN): Promise<Transaction> {
  
    //   const configData = await this.getConfigData();
  
    //   const ownerPointAccount = await getAssociatedTokenAddress(configData.pointMint, configData.owner, true);
  
    //   const userTokenAccount = await getAssociatedTokenAddress(configData.tokenMint, user, true);
  
    //   const tx = await this.program.methods
    //     .buyPoint(amount)
    //     .accountsPartial({
    //       user: user,
    //       configAccount: this.configPDA,
    //       ownerPointAccount: ownerPointAccount,
    //       userTokenAccount: userTokenAccount,
    //       tokenMint: configData.tokenMint,
    //       pointMint: configData.pointMint,
    //       tokenProgram: TOKEN_PROGRAM_ID
    //     })
    //     .transaction();
    //   return tx;
    // }
  
    // /**
    //  * Sells points to get tokens.
    //  * @param user - The public key of the user.
    //  * @param amount - The amount of points to sell.
    //  * @returns A transaction object for selling points.
    //  */
    // public async sellPoint(user: PublicKey, amount: BN): Promise<Transaction> {
  
    //   const configData = await this.getConfigData();
  
    //   const userPointAccount = await getAssociatedTokenAddress(configData.pointMint, user, true);
  
    //   const userTokenAccount = await getAssociatedTokenAddress(configData.tokenMint, user, true);
  
    //   const ownerTokenAccount = await getAssociatedTokenAddress(configData.tokenMint, configData.owner, true);
  
    //   const tx = await this.program.methods
    //     .sellPoint(amount)
    //     .accountsPartial({
    //       user: user,
    //       configAccount: this.configPDA,
    //       userPointAccount: userPointAccount,
    //       userTokenAccount: userTokenAccount,
    //       ownerTokenAccount: ownerTokenAccount,
    //       tokenMint: configData.tokenMint,
    //       pointMint: configData.pointMint,
    //       tokenProgram: TOKEN_PROGRAM_ID
    //     })
    //     .transaction();
    //   return tx;
    // }
  
    /**
     * Retrieves the configuration data.
     * @returns The configuration data.
     */
    public async getConfigData(owner: PublicKey): Promise<ConfigData> {
      const configPDA = this.configPDA(owner);
      console.log("configPDA", configPDA.toString());
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
   * Retrieves the answer data for a given market key.
   * @param marketKey - The key of the market.
   * @returns The answer data as an `AnswerData` object.
   */
  public async getAnswerData(marketKey: BN): Promise<AnswerData> {
    const answerPDA = this.answerPDA(marketKey);
    const answerData = await this.accounts.answerAccount.fetch(answerPDA);
    return answerData;
  }
  
  }