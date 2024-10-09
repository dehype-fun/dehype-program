import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dehype } from "../target/types/dehype";
import { Keypair, PublicKey, Signer, SystemProgram, Connection, sendAndConfirmTransaction, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { assert, expect } from "chai";
import DehypeIDL from '../target/idl/dehype.json';
import { approve, getAssociatedTokenAddress } from "@solana/spl-token";
import { DehypeProgram, MarketData, AnswerData } from '../sdk/dehype-program';
import { createNewMint, createUserWithLamports, mintTokenTo } from "../sdk/utils/helper";
import * as fs from 'fs';
import * as path from 'path';
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
  anchor.setProvider(provider);

  const program = anchor.workspace.Dehype as Program<Dehype>;

  let owner: Signer;

  const dehypeProgram = new DehypeProgram(DehypeIDL as Dehype, provider.connection);
  
  const connection = provider.connection;

  owner = loadKeypairFromFile(path.join(__dirname, '../id.json'));
  console.log('owner', owner.publicKey.toString());
  const keypair = loadKeypairFromFile(path.join(__dirname, '../id.json'));
  console.log('keypair', keypair.publicKey.toString());

  it("Creates a market", async () => {
    const marketKey = new BN(Math.floor(Math.random() * 10000));
    const answers = ["Option 1", "Option 2"];
    const eventName = 'Test Event';
    const description = 'Test Description';
    const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
    const creatorFee = new BN(3);
    const serviceFee = new BN(2);

    console.log('market', dehypeProgram.marketPDA(marketKey).toString());
    console.log('answer', dehypeProgram.answerPDA(marketKey).toString());

    const tx = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee, serviceFee);
    await sendAndConfirmTransaction(connection, tx, [owner]);

    const marketData = await dehypeProgram.getMarketData(marketKey);
    const answerData = await dehypeProgram.getAnswerData(marketKey);

    // console.log('marketData', marketData);
    // console.log('answerData', answerData);
    // console.log('all markets', await dehypeProgram.fetchAllMarkets());
    // console.log('all answers', await dehypeProgram.fetchAllAnswer());
    // const markets = await dehypeProgram.fetchAllMarkets();
    // console.log('markets', markets);
    
    // Expected market data
    expect(marketData.creator.toString()).to.equal(owner.publicKey.toString());
    expect(marketData.title).to.equal(eventName);
    expect(marketData.creatorFeePercentage.toNumber()).to.equal(creatorFee.toNumber());
    expect(marketData.serviceFeePercentage.toNumber()).to.equal(serviceFee.toNumber());
    expect(marketData.marketTotalTokens.toNumber()).to.equal(0);
    expect(marketData.coverUrl).to.equal(cover_url);
    expect(marketData.isActive).to.be.true;
    expect(marketData.description).to.equal(description);

    console.log('markets', await program.account.answerAccount.all());

    // console.log('marketData', marketData);
    // Expected answer data
    expect(answerData.marketKey.toNumber()).to.equal(marketKey.toNumber());
    expect(answerData.answers.length).to.equal(answers.length);
    for (let i = 0; i < answers.length; i++) {
        expect(answerData.answers[i].name).to.equal(answers[i]);
        expect(answerData.answers[i].answerTotalTokens.toNumber()).to.equal(0);
    }
    // program.account.answerAccount.size
    // expect((await markets).length).to.equal(1);
    
  });
  it("Success: Voter 2 Betting", async () => {
    const marketKey = new BN(Math.floor(Math.random() * 10000));
    const answers = ["Option 1", "Option 2"];
    const eventName = 'Test Event';
    const description = 'Test Description';
    const cover_url = 'https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg';
    const creatorFee = new BN(3);
    const serviceFee = new BN(2);

    const tx1 = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, cover_url, answers, creatorFee, serviceFee);
    await sendAndConfirmTransaction(connection, tx1, [owner]);
    console.log('marketKey', marketKey.toString());
    const answerData = await dehypeProgram.getAnswerData(marketKey);

    const decimals = 9;
    const answerKey = answerData.answers[0].answerKey;
    const betAmount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

    const tx = await dehypeProgram
      .bet(owner.publicKey, marketKey, betAmount, answerKey)
    const tx2 = await dehypeProgram
      .bet(owner.publicKey, marketKey, betAmount, answerKey)

    const signature = await sendAndConfirmTransaction(connection, tx, [owner]);
    const signature2 = await sendAndConfirmTransaction(connection, tx2, [owner]);
    console.log('signature', signature);
    console.log('signature2', signature2);
    const betData = await dehypeProgram.getBettingData(owner.publicKey, marketKey, answerKey);
    expect(betData.marketKey.toString()).to.equal(marketKey.toString());
    expect(betData.answerKey.toString()).to.equal(answerKey.toString());
    expect(betData.voter.toString()).to.equal(owner.publicKey.toString());
    expect(betData.tokens.toNumber()).to.equal(betAmount.toNumber() * 2);
    const marketData = await dehypeProgram.getMarketData(marketKey);
    expect(marketData.marketTotalTokens.toNumber()).to.equal(betAmount.toNumber() * 2);
  });
});