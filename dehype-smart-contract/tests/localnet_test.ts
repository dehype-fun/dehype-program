import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dehype } from "../target/types/dehype";
import { Keypair, PublicKey, Signer, SystemProgram, Connection, sendAndConfirmTransaction, LAMPORTS_PER_SOL, Transaction, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { assert, expect } from "chai";
import DehypeIDL from '../target/idl/dehype.json';
import { ACCOUNT_SIZE, approve, ASSOCIATED_TOKEN_PROGRAM_ID, createInitializeAccountInstruction, getAssociatedTokenAddress, getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DehypeProgram, MarketData, AnswerData } from '../sdk/dehype-program';
import { createNewMint, createUserWithLamports, mintTokenTo } from "../sdk/utils/helper";
import * as fs from 'fs';
// import { sendBundle } from "./jitoBundle/sendBundle";
import * as path from 'path';
import { DexInstructions, Market } from "@project-serum/serum";
// import { LP_wallet_keypair, connection } from "../../config/config";
import {
  calculateTotalAccountSize,
  EVENT_QUEUE_HEADER_SIZE,
  EVENT_SIZE,
  REQUEST_QUEUE_HEADER_SIZE,
  REQUEST_SIZE,
  ORDERBOOK_HEADER_SIZE,
  ORDERBOOK_NODE_SIZE,
  getVaultOwnerAndNonce,
} from "./serum";
import { DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
// import { sendBundle } from "./jitoBundle/sendBundle";
function loadKeypairFromFile(filePath: string): Keypair {
  // Read the file content
  const keypairJson = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the JSON content
  const secretKeyArray = JSON.parse(keypairJson);
  
  // Create and return the Keypair instance
  return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
}


describe("dehype", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  provider.opts.commitment = "confirmed";
  anchor.setProvider(provider);

  const program = anchor.workspace.Dehype as Program<Dehype>;

  let owner: Signer;
  const dehypeProgram = new DehypeProgram(DehypeIDL as Dehype);
  
  const connection = provider.connection;
  const LAMPORTS_PER_SIGNATURE = 5000;
  owner = loadKeypairFromFile(path.join(__dirname, '../id.json'));
  // console.log('owner', owner.publicKey.toString());
  const keypair = loadKeypairFromFile(path.join(__dirname, '../id.json'));
  it("Is configured", async () => {
    const tx = await dehypeProgram.initialize(owner.publicKey);
    await sendAndConfirmTransaction(connection, tx, [owner]);

    const configAccount = await dehypeProgram.getConfigData();
    assert(configAccount.authority.equals(owner.publicKey));
    assert(configAccount.platformFeeAccount.equals(owner.publicKey));
  });

  // it("Creates a market", async () => {
  //   const marketKey = new BN(Math.floor(Math.random() * 10000));
  //   const answers = ["Option 1", "Option 2"];
  //   const outcomeTokenNames = ["Token 1", "Token 2"];
  //   const outcomeTokenLogos = ['https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg', 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp']
  //   const eventName = 'Test Event';
  //   const description = 'Test Description';
  //   const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
  //   const creatorFee = new BN(3);

  //   // console.log('market', dehypeProgram.marketPDA(marketKey).toString());
  //   // console.log('answer', dehypeProgram.answerPDA(marketKey).toString());

  //   const tx = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee, outcomeTokenNames, outcomeTokenLogos);
  //   await sendAndConfirmTransaction(connection, tx, [owner]);

  //   const marketData = await dehypeProgram.getMarketData(marketKey);
  //   console.log('marketData', marketData);
  //   const answerData = await dehypeProgram.getAnswerData(marketKey);

  //   // console.log('marketData', marketData);
  //   // console.log('answerData', answerData);
  //   // console.log('all markets', await dehypeProgram.fetchAllMarkets());
  //   // console.log('all answers', await dehypeProgram.fetchAllAnswer());
  //   // const markets = await dehypeProgram.fetchAllMarkets();
  //   // console.log('markets', markets);
    
  //   // Expected market data
  //   expect(marketData.creator.toString()).to.equal(owner.publicKey.toString());
  //   expect(marketData.title).to.equal(eventName);
  //   expect(marketData.creatorFeePercentage.toNumber()).to.equal(creatorFee.toNumber());
  //   expect(marketData.marketTotalTokens.toNumber()).to.equal(0);
  //   expect(marketData.coverUrl).to.equal(cover_url);
  //   expect(marketData.isActive).to.be.true;
  //   expect(marketData.description).to.equal(description);

  //   // console.log('markets', await program.account.answerAccount.all());
  //   // console.log('marketData', marketData);
  //   // Expected answer data
  //   expect(answerData.marketKey.toNumber()).to.equal(marketKey.toNumber());
  //   expect(answerData.answers.length).to.equal(answers.length);
  //   for (let i = 0; i < answers.length; i++) {
  //       expect(answerData.answers[i].name).to.equal(answers[i]);
  //       expect(answerData.answers[i].answerTotalTokens.toNumber()).to.equal(0);
  //       expect(answerData.answers[i].outcomeTokenName).to.equal(outcomeTokenNames[i]);
  //       expect(answerData.answers[i].outcomeTokenLogo).to.equal(outcomeTokenLogos[i]);

  //   }
    
  // });
  // it("Success: Voter 2 Betting and retriving", async () => {
  //   const marketKey = new BN(Math.floor(Math.random() * 10000));
  //   const answers = ["Option 1", "Option 2"];
  //   const eventName = 'Test Event';
  //   const description = 'Test Description';
  //   const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
  //   const outcomeTokenNames = ["Token 1", "Token 2"];
  //   const outcomeTokenLogos = ['https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg', 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp']
  //   const creatorFee = new BN(3);
  //   console.log('vaultPDA', dehypeProgram.vaultPDA(marketKey).toString());
  //   console.log('marketPDA', dehypeProgram.marketPDA(marketKey).toString());
  //   console.log('answerPDA', dehypeProgram.answerPDA(marketKey).toString());
  //   const tx1 = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee);
  //   await sendAndConfirmTransaction(connection, tx1, [owner]);
  //   console.log('marketKey', marketKey.toString());
  //   const answerData = await dehypeProgram.getAnswerData(marketKey);

  //   const decimals = 9;
  //   const answerKey = answerData.answers[0].answerKey;
  //   const betAmount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

  //   const tx = await dehypeProgram
  //     .bet(owner.publicKey, marketKey, betAmount, answerKey)
  //   const tx2 = await dehypeProgram
  //     .bet(owner.publicKey, marketKey, betAmount, answerKey)

  //   const signature = await sendAndConfirmTransaction(connection, tx, [owner]);
  //   const signature2 = await sendAndConfirmTransaction(connection, tx2, [owner]);
  //   console.log('signature', signature);
  //   console.log('signature2', signature2);
  //   const betData = await dehypeProgram.getBettingData(owner.publicKey, marketKey, answerKey);
  //   expect(betData.marketKey.toString()).to.equal(marketKey.toString());
  //   expect(betData.answerKey.toString()).to.equal(answerKey.toString());
  //   expect(betData.voter.toString()).to.equal(owner.publicKey.toString());
  //   expect(betData.tokens.toNumber()).to.equal(betAmount.toNumber() * 2);
  //   const marketData = await dehypeProgram.getMarketData(marketKey);
  //   expect(marketData.marketTotalTokens.toNumber()).to.equal(betAmount.toNumber() * 2);
    
  //   const tx3 = await dehypeProgram.retrive(owner.publicKey, marketKey, betAmount, answerKey);
  //   const signature3 = await sendAndConfirmTransaction(connection, tx3, [owner]);
  //   console.log('signature3', signature3);
  //   const betData2 = await dehypeProgram.getBettingData(owner.publicKey, marketKey, answerKey);
  //   expect(betData2.tokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const marketData2 = await dehypeProgram.getMarketData(marketKey);
  //   const answerData2 = await dehypeProgram.getAnswerData(marketKey);

  //   expect(marketData2.marketTotalTokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);
  //   expect(answerData2.answers[0].answerTotalTokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const newVoter = Keypair.generate();
  //   const transaction = new Transaction().add(
  //     SystemProgram.transfer({
  //       fromPubkey: owner.publicKey,
  //       toPubkey: newVoter.publicKey,
  //       lamports: 0.1 * LAMPORTS_PER_SOL,
  //     })
  //   );
  //   const signatureTransfer2 = await provider.sendAndConfirm(transaction, [owner]);

  //   const tx4 = await dehypeProgram.bet(newVoter.publicKey, marketKey, betAmount, answerKey);
  //   const signature4 = await sendAndConfirmTransaction(connection, tx4, [newVoter]);
  //   console.log('signature4', signature4);
  //   const betData3 = await dehypeProgram.getBettingData(newVoter.publicKey, marketKey, answerKey);
  //   expect(betData3.tokens.toNumber()).to.equal(betAmount.toNumber());
  //   const marketData3 = await dehypeProgram.getMarketData(marketKey);
  //   expect(marketData3.marketTotalTokens.toNumber()).to.equal(2 * betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);
  //   const answerData3 = await dehypeProgram.getAnswerData(marketKey);
  //   expect(answerData3.answers[0].answerTotalTokens.toNumber()).to.equal(2 * betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const tx5 = await dehypeProgram.bet(newVoter.publicKey, marketKey, betAmount, answerData3.answers[1].answerKey);
  //   const signature5 = await sendAndConfirmTransaction(connection, tx5, [newVoter]);
  //   console.log('signature5', signature5);
  //   const answerData5 = await dehypeProgram.getAnswerData(marketKey);
  //   expect(answerData5.answers[1].answerTotalTokens.toNumber()).to.equal(betAmount.toNumber());
  // });

  // it("Resolves a market", async () => {
  //   const marketKey = new BN(Math.floor(Math.random() * 10000));
  //   const answers = ["Option 1", "Option 2"];
  //   const eventName = 'Test Event';
  //   const description = 'Test Description';
  //   const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
  //   const outcomeTokenNames = ["Token 1", "Token 2"];
  //   const outcomeTokenLogos = ['https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg', 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp']
  //   const creatorFee = new BN(3);
  //   console.log('vaultPDA', dehypeProgram.vaultPDA(marketKey).toString());
  //   console.log('marketPDA', dehypeProgram.marketPDA(marketKey).toString());
  //   console.log('answerPDA', dehypeProgram.answerPDA(marketKey).toString());
  //   const tx1 = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee);
  //   await sendAndConfirmTransaction(connection, tx1, [owner]);
  //   console.log('marketKey', marketKey.toString());
  //   const answerData = await dehypeProgram.getAnswerData(marketKey);
  //   const decimals = 9;
  //   const answerKey = answerData.answers[0].answerKey;
  //   const betAmount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

  //   const tx = await dehypeProgram
  //     .bet(owner.publicKey, marketKey, betAmount, answerKey)
  //   const tx2 = await dehypeProgram
  //     .bet(owner.publicKey, marketKey, betAmount, answerKey)

  //   const signature = await sendAndConfirmTransaction(connection, tx, [owner]);
  //   const signature2 = await sendAndConfirmTransaction(connection, tx2, [owner]);
  //   console.log('signature', signature);
  //   console.log('signature2', signature2);
  //   const betData = await dehypeProgram.getBettingData(owner.publicKey, marketKey, answerKey);
  //   expect(betData.marketKey.toString()).to.equal(marketKey.toString());
  //   expect(betData.answerKey.toString()).to.equal(answerKey.toString());
  //   expect(betData.voter.toString()).to.equal(owner.publicKey.toString());
  //   expect(betData.tokens.toNumber()).to.equal(betAmount.toNumber() * 2);
  //   const marketData = await dehypeProgram.getMarketData(marketKey);
  //   expect(marketData.marketTotalTokens.toNumber()).to.equal(betAmount.toNumber() * 2);
    
  //   const tx3 = await dehypeProgram.retrive(owner.publicKey, marketKey, betAmount, answerKey);
  //   const signature3 = await sendAndConfirmTransaction(connection, tx3, [owner]);
  //   console.log('signature3', signature3);
  //   const betData2 = await dehypeProgram.getBettingData(owner.publicKey, marketKey, answerKey);
  //   expect(betData2.tokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const marketData2 = await dehypeProgram.getMarketData(marketKey);
  //   const answerData2 = await dehypeProgram.getAnswerData(marketKey);

  //   expect(marketData2.marketTotalTokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);
  //   expect(answerData2.answers[0].answerTotalTokens.toNumber()).to.equal(betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const newVoter = Keypair.generate();
  //   const transaction = new Transaction().add(
  //     SystemProgram.transfer({
  //       fromPubkey: owner.publicKey,
  //       toPubkey: newVoter.publicKey,
  //       lamports: 0.1 * LAMPORTS_PER_SOL,
  //     })
  //   );
  //   const signatureTransfer2 = await provider.sendAndConfirm(transaction, [owner]);

  //   const tx4 = await dehypeProgram.bet(newVoter.publicKey, marketKey, betAmount, answerKey);
  //   const signature4 = await sendAndConfirmTransaction(connection, tx4, [newVoter]);
  //   console.log('signature4', signature4);
  //   const betData3 = await dehypeProgram.getBettingData(newVoter.publicKey, marketKey, answerKey);
  //   expect(betData3.tokens.toNumber()).to.equal(betAmount.toNumber());
  //   const marketData3 = await dehypeProgram.getMarketData(marketKey);
  //   expect(marketData3.marketTotalTokens.toNumber()).to.equal(2 * betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);
  //   const answerData3 = await dehypeProgram.getAnswerData(marketKey);
  //   expect(answerData3.answers[0].answerTotalTokens.toNumber()).to.equal(2 * betAmount.toNumber() - LAMPORTS_PER_SIGNATURE);

  //   const tx5 = await dehypeProgram.bet(newVoter.publicKey, marketKey, betAmount, answerData3.answers[1].answerKey);
  //   const signature5 = await sendAndConfirmTransaction(connection, tx5, [newVoter]);
  //   console.log('signature5', signature5);
  //   const answerData5 = await dehypeProgram.getAnswerData(marketKey);
  //   expect(answerData5.answers[1].answerTotalTokens.toNumber()).to.equal(betAmount.toNumber());
  //   dehypeProgram.fetchAllByMarketKey(marketKey);
  //   // await program.account.flow.all([
  //   //   {
  //   //    memcmp: {
  //   //      offset: 8,
  //   //      bytes: publicKey.toBase58(),
  //   //    },
  //   //   }
  //   //  ]);
  //   // try {
  //   //   const newMint = Keypair.generate();
  //   //   const tx6 = await dehypeProgram.resolveMarket(owner, marketKey, answerData5.answers[0].answerKey, newMint.publicKey);
  //   //   // const mintKeypair = loadKeypairFromFile("./mint-keypair.json");
  //   //   // console.log('mintKeypair', mintKeypair.publicKey.toString());
  //   //   // const tx6 = await program.createToken(owner, mintKeypair.publicKey);
  //   //   const signature6 = await sendAndConfirmTransaction(connection, tx6, [owner]);
  //   //   console.log('signature6', signature6);
  //   // }
  //   // catch (error) {
  //   //   console.log('error', error);
  //   // }
  // });


  // it('should handle insufficient lamports error', async () => {
  //   // const owner = await createUserWithLamports(connection, 0.005); // Create user with 0.005 SOL
  //   const marketKey = new BN(Math.floor(Math.random() * 10000));
  //   const answers = ["Option 1", "Option 2"];
  //   const eventName = 'Test Event';
  //   const description = 'Test Description';
  //   const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
  //   const creatorFee = new BN(3);
  //   const serviceFee = new BN(2);

  //   const tx1 = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee, serviceFee);
  //   await sendAndConfirmTransaction(connection, tx1, [owner]);
  //   console.log('marketKey', marketKey.toString());
  //   const answerData = await dehypeProgram.getAnswerData(marketKey);

  //   const answerKey = answerData.answers[0].answerKey;
  //   const betAmount = new anchor.BN(100 * LAMPORTS_PER_SOL); // Bet amount is 0.01 SOL

  //   try {
  //     const tx = await dehypeProgram.bet(owner.publicKey, marketKey, betAmount, answerKey);
  //     await sendAndConfirmTransaction(connection, tx, [owner]);
  //     assert.fail("Expected error, but transaction succeeded");
  //   } catch (error) {
  //     console.log('Caught error:', error);
  //     expect(error.message).to.include("Insufficient balance");
  //   }
  // });

  const CTRLSEED = 'CTRLv1';
  it("Gets some CTRL", async () => {
    const [ctrlPDA, bump] = await PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode(CTRLSEED)], program.programId);
    console.log("GetCTRL: ctrlPDA is [", ctrlPDA.toString(), "], bump ", bump);

    let receiver = provider.wallet.publicKey;
    let assocTokAcct = await getAssociatedTokenAddress(
      ctrlPDA,
      receiver,
      true, // allowOwnerOffCurve
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    console.log("GetCTRL: AssocTokAcct: ", assocTokAcct.toString());

    let bigAmount = new anchor.BN(888 * 1000000);

    const mintTx = await program.methods
      .mintCtrl(bump, bigAmount)
      .accounts({
        mint: ctrlPDA,
        destination: assocTokAcct,
        payer: receiver,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).rpc();

    console.log("GetCTRL done.");
    console.log("mintTx: ", mintTx);
    assert.ok(true);
  });


  // it("Sets the token metadata", async () => {
  //   let PROGRAM = "FbSz7XjWDGHL1ecTHngxvobGFNq7Qj6x4wmGG3Uq6s4m"
  //   const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from(CTRLSEED)],
  //     program.programId
  //   );

  //   const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  //   const METADATA_SEED = "metadata";
  //   const [metadataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from(METADATA_SEED),
  //       METADATA_PROGRAM_ID.toBuffer(),
  //       mint.toBuffer(),
  //     ],
  //     METADATA_PROGRAM_ID
  //   );
  //   const [ctrlPDA, bump] = await PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode(CTRLSEED)], program.programId);
  //   console.log("TokMeta: ctrlPDA is [", ctrlPDA.toString(), "], bump ", bump);
  //   const metadataPDA = await findMetadataPda(ctrlPDA);
  //   console.log("TokMeta: metadataPDA is [", metadataPDA.toString(), "]");
  //   const adm = new PublicKey(provider.wallet.publicKey);
  //   console.log("TokMeta: usr=", provider.wallet.publicKey), "adm=", adm.toString();
  //   console.log("TokMeta: METADATA_PROGRAM_ID:", METADATA_PROGRAM_ID.toString());

  //   const tx = await program.methods
  //     .tokMeta(bump)
  //     .accounts({
  //       metadata: metadataAddress,
  //       mint: ctrlPDA,
  //       mintauth: ctrlPDA,
  //       payer: provider.wallet.publicKey,
  //       updauth: adm,
  //       metadataPda: metadataPDA,
  //       systemProgram: SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       metadataProgram: METADATA_PROGRAM_ID,
  //       rent: SYSVAR_RENT_PUBKEY,
  //     })
  //     .rpc();

  //     console.log("TokMeta done.");
  //     console.log("tx: ", tx);
  //   assert.ok(true);
  // });
const SOL_TOKEN_ADDR = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const LOT_SIZE = -3;
const TICK_SIZE = 8;
const TOTAL_EVENT_QUEUE_SIZE = calculateTotalAccountSize(
  128,
  EVENT_QUEUE_HEADER_SIZE,
  EVENT_SIZE
);

const TOTAL_REQUEST_QUEUE_SIZE = calculateTotalAccountSize(
  10,
  REQUEST_QUEUE_HEADER_SIZE,
  REQUEST_SIZE
);

const TOTAL_ORDER_BOOK_SIZE = calculateTotalAccountSize(
  201,
  ORDERBOOK_HEADER_SIZE,
  ORDERBOOK_NODE_SIZE
);
const createMarket = async (
  wallet: Keypair ,
  baseMintAddress: PublicKey
) => {
  console.log("Creating market...");
  let baseMint: PublicKey;
  let baseMintDecimals: number;
  let quoteMint: PublicKey;
  let quoteMintDecimals: number;
  const vaultInstructions: TransactionInstruction[] = [];
  const marketInstructions: TransactionInstruction[] = [];

  const [baseMintPda, bump] = await PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode(CTRLSEED)], program.programId);
  try {
    const baseMintInfo = await getMint(connection, baseMintAddress);
    baseMint = baseMintInfo.address;
    baseMintDecimals = baseMintInfo.decimals;

    const quoteMintInfo = await getMint(connection, SOL_TOKEN_ADDR);
    quoteMint = quoteMintInfo.address;
    quoteMintDecimals = quoteMintInfo.decimals;
  } catch (e) {
    console.error("Invalid mints provided.", e);
    return;
  }

  const marketAccounts = {
    market: Keypair.generate(),
    requestQueue: Keypair.generate(),
    eventQueue: Keypair.generate(),
    bids: Keypair.generate(),
    asks: Keypair.generate(),
    baseVault: Keypair.generate(),
    quoteVault: Keypair.generate(),
  };

  const [vaultOwner, vaultOwnerNonce] = await getVaultOwnerAndNonce(
    marketAccounts.market.publicKey,
    MAINNET_PROGRAM_ID.OPENBOOK_MARKET
  );

  // create vaults
  vaultInstructions.push(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: marketAccounts.baseVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        ACCOUNT_SIZE
      ),
      space: ACCOUNT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: marketAccounts.quoteVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        ACCOUNT_SIZE
      ),
      space: ACCOUNT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(
      marketAccounts.baseVault.publicKey,
      baseMint,
      vaultOwner
    ),
    createInitializeAccountInstruction(
      marketAccounts.quoteVault.publicKey,
      quoteMint,
      vaultOwner
    )
  );

  // tickSize and lotSize here are the 1e^(-x) values, so no check for ><= 0
  const baseLotSize = Math.round(
    10 ** baseMintDecimals * Math.pow(10, -1 * LOT_SIZE)
  );
  const quoteLotSize = Math.round(
    10 ** quoteMintDecimals *
      Math.pow(10, -1 * LOT_SIZE) *
      Math.pow(10, -1 * TICK_SIZE)
  );

  // create market account
  marketInstructions.push(
    SystemProgram.createAccount({
      newAccountPubkey: marketAccounts.market.publicKey,
      fromPubkey: wallet.publicKey,
      space: Market.getLayout(MAINNET_PROGRAM_ID.OPENBOOK_MARKET).span,
      lamports: await connection.getMinimumBalanceForRentExemption(
        Market.getLayout(MAINNET_PROGRAM_ID.OPENBOOK_MARKET).span
      ),
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })
  );

  // create request queue
  marketInstructions.push(
    SystemProgram.createAccount({
      newAccountPubkey: marketAccounts.requestQueue.publicKey,
      fromPubkey: wallet.publicKey,
      space: TOTAL_REQUEST_QUEUE_SIZE,
      lamports: await connection.getMinimumBalanceForRentExemption(
        TOTAL_REQUEST_QUEUE_SIZE
      ),
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })
  );

  // create event queue
  marketInstructions.push(
    SystemProgram.createAccount({
      newAccountPubkey: marketAccounts.eventQueue.publicKey,
      fromPubkey: wallet.publicKey,
      space: TOTAL_EVENT_QUEUE_SIZE,
      lamports: await connection.getMinimumBalanceForRentExemption(
        TOTAL_EVENT_QUEUE_SIZE
      ),
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })
  );

  const orderBookRentExempt =
    await connection.getMinimumBalanceForRentExemption(TOTAL_ORDER_BOOK_SIZE);

  // create bids
  marketInstructions.push(
    SystemProgram.createAccount({
      newAccountPubkey: marketAccounts.bids.publicKey,
      fromPubkey: wallet.publicKey,
      space: TOTAL_ORDER_BOOK_SIZE,
      lamports: orderBookRentExempt,
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })
  );

  // create asks
  marketInstructions.push(
    SystemProgram.createAccount({
      newAccountPubkey: marketAccounts.asks.publicKey,
      fromPubkey: wallet.publicKey,
      space: TOTAL_ORDER_BOOK_SIZE,
      lamports: orderBookRentExempt,
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })
  );

  marketInstructions.push(
    DexInstructions.initializeMarket({
      market: marketAccounts.market.publicKey,
      requestQueue: marketAccounts.requestQueue.publicKey,
      eventQueue: marketAccounts.eventQueue.publicKey,
      bids: marketAccounts.bids.publicKey,
      asks: marketAccounts.asks.publicKey,
      baseVault: marketAccounts.baseVault.publicKey,
      quoteVault: marketAccounts.quoteVault.publicKey,
      baseMint,
      quoteMint,
      baseLotSize: new BN(baseLotSize),
      quoteLotSize: new BN(quoteLotSize),
      feeRateBps: 150, // Unused in v3
      quoteDustThreshold: new BN(500), // Unused in v3
      vaultSignerNonce: vaultOwnerNonce,
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    })

  );

  try {
    let blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;

    const createVaultTransaction = new Transaction().add(...vaultInstructions);
    createVaultTransaction.recentBlockhash = blockhash;
    createVaultTransaction.feePayer = wallet.publicKey;
    const createMarketTransaction = new Transaction().add(
      ...marketInstructions
    );
    createMarketTransaction.recentBlockhash = blockhash;
    createMarketTransaction.feePayer = wallet.publicKey;
    const signature = await sendAndConfirmTransaction(connection, createVaultTransaction,
      [wallet, marketAccounts.baseVault, marketAccounts.quoteVault]);
    const signature2 = await sendAndConfirmTransaction(connection, createMarketTransaction, 
      [
        wallet,
        marketAccounts.market,
        marketAccounts.requestQueue,
        marketAccounts.eventQueue,
        marketAccounts.bids,
        marketAccounts.asks
    ]);
    console.log("Market ID: ", marketAccounts.market.publicKey.toBase58());
    console.log("Signature: ", signature);
    console.log("Signature2: ", signature2);
  let coinVault = await getAssociatedTokenAddress(
    baseMintPda,
    owner.publicKey,
    true, // allowOwnerOffCurve
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  let pcVault = await getAssociatedTokenAddress(
    SOL_TOKEN_ADDR,
    owner.publicKey,
    true, // allowOwnerOffCurve
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
// const tx = await program.methods
//   .inititializeSerumMarket(bump, new BN(baseLotSize), new BN(quoteLotSize), new BN(0), new BN(500))
//   .accounts({
//     market: marketAccounts.market.publicKey ,
//     coinVault: coinVault,
//     pcVault: pcVault,
//     coinMint: baseMintPda,
//     pcMint: SOL_TOKEN_ADDR,
//     authority: owner.publicKey,
//     systemProgram: SystemProgram.programId,
//     dexProgram: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
//     bids: marketAccounts.bids.publicKey,
//     asks: marketAccounts.asks.publicKey,
//     eventQ: marketAccounts.eventQueue.publicKey,
//     reqQ: marketAccounts.requestQueue.publicKey,
//     tokenProgram: TOKEN_PROGRAM_ID,
//     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//     rent: SYSVAR_RENT_PUBKEY,
//     marketSigner: marketAccounts.market.publicKey,
//     reqQSigner: marketAccounts.requestQueue.publicKey,
//     eventQSigner: marketAccounts.eventQueue.publicKey,
//     bidsSigner: marketAccounts.bids.publicKey,
//     asksSigner: marketAccounts.asks.publicKey,
//   })
//   .signers([owner, marketAccounts.market, marketAccounts.requestQueue, marketAccounts.eventQueue, marketAccounts.bids, marketAccounts.asks])
//   .rpc();
//   console.log("tx: ", tx);


    // let success = await sendBundle([
    //   createVaultTransaction,
    //   createMarketTransaction,
    // ]);

    // if (success) {
    //   console.log("Market ID: ", marketAccounts.market.publicKey.toBase58());
    //   return marketAccounts.market.publicKey;
    // }
  } catch (e) {
    console.error("Error creating market: ", e);
  }
};
  
it("create openbook", async () => {
  const LP_wallet_private_key = loadKeypairFromFile('./id.json').secretKey;
  const LP_wallet_keypair = Keypair.fromSecretKey(
    new Uint8Array(LP_wallet_private_key)
  );
  // D4vba6Fu24VWxWgvtW1txRZvntSJ4vp8v8tuC2vLRYFp is token address
  createMarket(LP_wallet_keypair, new PublicKey("D4vba6Fu24VWxWgvtW1txRZvntSJ4vp8v8tuC2vLRYFp"));
}
)
  // it("create openbook", async () => {
  //   const [ctrlPDA, bump] = await PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode(CTRLSEED)], program.programId);
  //   let baseMint: PublicKey;
  //   let baseMintDecimals: number;
  //   let quoteMint: PublicKey;
  //   let quoteMintDecimals: number;
  //   const vaultInstructions: TransactionInstruction[] = [];
  //   const marketInstructions: TransactionInstruction[] = [];
  //     const baseMintInfo = await getMint(connection, ctrlPDA);
  //     baseMint = baseMintInfo.address;
  //     baseMintDecimals = baseMintInfo.decimals;
  
  //     const quoteMintInfo = await getMint(connection, SOL_TOKEN_ADDR);
  //     quoteMint = quoteMintInfo.address;
  //     quoteMintDecimals = quoteMintInfo.decimals;
  // const marketAccounts = {
  //   market: Keypair.generate(),
  //   requestQueue: Keypair.generate(),
  //   eventQueue: Keypair.generate(),
  //   bids: Keypair.generate(),
  //   asks: Keypair.generate(),
  //   coinVault: Keypair.generate(),
  //   pcVault: Keypair.generate(),
  // };
  // console.log("market", marketAccounts.market.publicKey.toString());
  // console.log("requestQueue", marketAccounts.requestQueue.publicKey.toString());
  // console.log("eventQueue", marketAccounts.eventQueue.publicKey.toString());
  // console.log("bids", marketAccounts.bids.publicKey.toString());
  // console.log("asks", marketAccounts.asks.publicKey.toString());
  // console.log("coinVault", marketAccounts.coinVault.publicKey.toString());
  // console.log("pcVault", marketAccounts.pcVault.publicKey.toString());

  //   // create request queue
  //   marketInstructions.push(
  //     SystemProgram.createAccount({
  //       newAccountPubkey: marketAccounts.requestQueue.publicKey,
  //       fromPubkey: owner.publicKey,
  //       space: TOTAL_REQUEST_QUEUE_SIZE,
  //       lamports: await connection.getMinimumBalanceForRentExemption(
  //         TOTAL_REQUEST_QUEUE_SIZE
  //       ),
  //       programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //     })
  //   );
  
  //   // create event queue
  //   marketInstructions.push(
  //     SystemProgram.createAccount({
  //       newAccountPubkey: marketAccounts.eventQueue.publicKey,
  //       fromPubkey: owner.publicKey,
  //       space: TOTAL_EVENT_QUEUE_SIZE,
  //       lamports: await connection.getMinimumBalanceForRentExemption(
  //         TOTAL_EVENT_QUEUE_SIZE
  //       ),
  //       programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //     })
  //   );

  
  //   const orderBookRentExempt =
  //     await connection.getMinimumBalanceForRentExemption(TOTAL_ORDER_BOOK_SIZE);
  
  //   // create bids
  //   marketInstructions.push(
  //     SystemProgram.createAccount({
  //       newAccountPubkey: marketAccounts.bids.publicKey,
  //       fromPubkey: owner.publicKey,
  //       space: TOTAL_ORDER_BOOK_SIZE,
  //       lamports: orderBookRentExempt,
  //       programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //     })
  //   );
  
  //   // create asks
  //   marketInstructions.push(
  //     SystemProgram.createAccount({
  //       newAccountPubkey: marketAccounts.asks.publicKey,
  //       fromPubkey: owner.publicKey,
  //       space: TOTAL_ORDER_BOOK_SIZE,
  //       lamports: orderBookRentExempt,
  //       programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //     })
  //   );
  //   let coinVault = await getAssociatedTokenAddress(
  //     ctrlPDA,
  //     owner.publicKey,
  //     true, // allowOwnerOffCurve
  //     TOKEN_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID,
  //   );
  //   let pcVault = await getAssociatedTokenAddress(
  //     SOL_TOKEN_ADDR,
  //     owner.publicKey,
  //     true, // allowOwnerOffCurve
  //     TOKEN_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID,
  //   );
  //   const baseLotSize = Math.round(
  //     10 ** baseMintDecimals * Math.pow(10, -1 * LOT_SIZE)
  //   );
  //   const quoteLotSize = Math.round(
  //     10 ** quoteMintDecimals *
  //       Math.pow(10, -1 * LOT_SIZE) *
  //       Math.pow(10, -1 * TICK_SIZE)
  //   );
  //   marketInstructions.push(
  //     DexInstructions.initializeMarket({
  //       market: marketAccounts.market.publicKey,
  //       requestQueue: marketAccounts.requestQueue.publicKey,
  //       eventQueue: marketAccounts.eventQueue.publicKey,
  //       bids: marketAccounts.bids.publicKey,
  //       asks: marketAccounts.asks.publicKey,
  //       baseVault: marketAccounts.coinVault.publicKey,
  //       quoteVault: marketAccounts.pcVault.publicKey,
  //       baseMint,
  //       quoteMint,
  //       baseLotSize: new BN(baseLotSize),
  //       quoteLotSize: new BN(quoteLotSize),
  //       feeRateBps: 150, // Unused in v3
  //       quoteDustThreshold: new BN(500), // Unused in v3
  //       vaultSignerNonce: new BN(0),
  //       programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //     })
  //   );
  //   const createMarketTransaction = new Transaction().add(
  //     ...marketInstructions
  //   );
  //   const sig = await sendAndConfirmTransaction(connection, createMarketTransaction, 
  //     [
  //     owner, 
  //     marketAccounts.requestQueue,
  //     marketAccounts.eventQueue,
  //     marketAccounts.bids,
  //     marketAccounts.asks
  //   ]);
  // console.log("sig: ", sig);
  // try {

  //   // const tx = await program.methods
  //   // .inititializeSerumMarket(bump, new BN(baseLotSize), new BN(quoteLotSize), new BN(0), new BN(0))
  //   // .accounts({
  //   //   market: marketAccounts.market.publicKey ,
  //   //   coinVault: coinVault,
  //   //   pcVault: pcVault,
  //   //   coinMint: ctrlPDA,
  //   //   pcMint: SOL_TOKEN_ADDR,
  //   //   authority: owner.publicKey,
  //   //   systemProgram: SystemProgram.programId,
  //   //   dexProgram: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  //   //   bids: marketAccounts.bids.publicKey,
  //   //   asks: marketAccounts.asks.publicKey,
  //   //   eventQ: marketAccounts.eventQueue.publicKey,
  //   //   reqQ: marketAccounts.requestQueue.publicKey,
  //   //   tokenProgram: TOKEN_PROGRAM_ID,
  //   //   associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   //   rent: SYSVAR_RENT_PUBKEY,
  //   //   marketSigner: marketAccounts.market.publicKey,
  //   //   reqQSigner: marketAccounts.requestQueue.publicKey,
  //   //   eventQSigner: marketAccounts.eventQueue.publicKey,
  //   //   bidsSigner: marketAccounts.bids.publicKey,
  //   //   asksSigner: marketAccounts.asks.publicKey,
  //   // })
  //   // .signers([owner, marketAccounts.market, marketAccounts.requestQueue, marketAccounts.eventQueue, marketAccounts.bids, marketAccounts.asks])
  //   // .rpc();
  //   // console.log("tx: ", tx);
  // }
  // catch (e) {
  //   console.error("Error creating market: ", e);
  // }
  // });
});