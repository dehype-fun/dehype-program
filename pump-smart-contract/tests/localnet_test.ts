import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dehype } from "../target/types/dehype";
import { Keypair, PublicKey, Signer, SystemProgram, Connection, sendAndConfirmTransaction, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { assert, expect } from "chai";
import DehypeIDL from '../sdk/idl/dehype.json';
import { approve, getAssociatedTokenAddress } from "@solana/spl-token";
import { DehypeProgram, MarketData } from '../sdk/dehype-program';
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
  it("Initilize config account", async () => {
    owner = loadKeypairFromFile(path.join(__dirname, '../owner.json'));
    console.log('owner', owner.publicKey.toString());
    const keypair = loadKeypairFromFile(path.join(__dirname, '../id.json'));
    console.log('keypair', keypair.publicKey.toString());
    {
      const amount = 0.1 * LAMPORTS_PER_SOL; // Amount to transfer
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: owner.publicKey,
          lamports: amount,
        })
      );
    
      // Sign and send the transaction
      const signature = await provider.sendAndConfirm(transaction, [keypair]);
      console.log("Transfer signature:", signature);
    }    const tx = await dehypeProgram.initialize(owner.publicKey);
    const signature = await sendAndConfirmTransaction(connection, tx, [owner]);

    console.log('initialize signature', signature);
    const configData = await dehypeProgram.getConfigData(owner.publicKey);
    console.log('configPDA', dehypeProgram.configPDA(owner.publicKey).toString());

    expect(configData.owner.toString()).to.equal(owner.publicKey.toString());
  });
  it("Creates a market", async () => {
    const marketKey = new BN(Math.floor(Math.random() * 1000));
    const answers = ["Option 1", "Option 2"];
    const eventName = 'Test Event';
    const description = 'Test Description';
    const creatorFee = new BN(3);
    const serviceFee = new BN(2);

    console.log('market', dehypeProgram.marketPDA(marketKey).toString());
    console.log('answer', dehypeProgram.answerPDA(marketKey).toString());

    const tx = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, description, answers, creatorFee, serviceFee);
    await sendAndConfirmTransaction(connection, tx, [owner]);

    const marketData = await dehypeProgram.getMarketData(marketKey);
    const answerData = await dehypeProgram.getAnswerData(marketKey);

    // Expected market data
    expect(marketData.creator.toString()).to.equal(owner.publicKey.toString());
    expect(marketData.title).to.equal(eventName);
    expect(marketData.creatorFeePercentage.toNumber()).to.equal(creatorFee.toNumber());
    expect(marketData.serviceFeePercentage.toNumber()).to.equal(serviceFee.toNumber());
    expect(marketData.marketTotalTokens.toNumber()).to.equal(0);
    expect(marketData.isActive).to.be.true;
    expect(marketData.description).to.equal(description);

    // Expected answer data
    expect(answerData.marketKey.toNumber()).to.equal(marketKey.toNumber());
    expect(answerData.answers.length).to.equal(answers.length);
    for (let i = 0; i < answers.length; i++) {
        expect(answerData.answers[i].name).to.equal(answers[i]);
        expect(answerData.answers[i].answerTotalTokens.toNumber()).to.equal(0);
    }
  });
});