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
import { Dehype } from '../target/types/dehype';
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
        .accounts({
          owner: owner,
          configAccount: this.configPDA(owner),
          systemProgram: SystemProgram.programId
        })
        .transaction();
      return tx;
    }

    public async createMarket(marketKey: BN, creator: PublicKey, eventName: string, description: string, cover_url: string, answers: string[], creatorFee: BN, serviceFee: BN): Promise<Transaction> {
      const tx = await this.program.methods
        .createMarket(marketKey, eventName, description, cover_url, answers, creatorFee, serviceFee)
        .accounts({
          creator: creator,
          marketAccount: this.marketPDA(marketKey),
          answerAccount: this.answerPDA(marketKey),
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      return tx;
    }
  public async getConfigData(owner: PublicKey): Promise<ConfigData> {
      const configPDA = this.configPDA(owner);
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

  public async fetchAllMarkets(): Promise<MarketData[]> {
      return await this.accounts.marketAccount.all();
  }
  public async fetchAllAnswer(): Promise<AnswerData[]> {
    return await this.accounts.answerAccount.all();
  }
}