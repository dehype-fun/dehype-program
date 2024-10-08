import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dehype } from "../target/types/dehype";
import { Keypair, PublicKey, Signer, SystemProgram, Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import { assert, expect } from "chai";
import DehypeIDL from '../sdk/idl/dehype.json';
import { approve, getAssociatedTokenAddress } from "@solana/spl-token";
import { DehypeProgram, MarketData } from '../sdk/dehype-program';
import { createNewMint, createUserWithLamports, mintTokenTo } from "../sdk/utils/helper";

describe("dehype", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Dehype as Program<Dehype>;

  let owner: Signer;
  let user: Signer;

  let tokenMint: PublicKey;
  let pointMint: PublicKey;

  const dehypeProgram = new DehypeProgram(DehypeIDL as Dehype, provider.connection);
  
  const connection = provider.connection;

  const decimals = 9;
  before(async () => {
    [owner, user] = await Promise.all([
      createUserWithLamports(connection, 10),
      createUserWithLamports(connection, 10),
    ]);

    tokenMint = await createNewMint(connection, owner, decimals);
    pointMint = await createNewMint(connection, owner, decimals);

    //mint for owner 3.000.000 points 
    await mintTokenTo(connection, pointMint, owner, owner, owner.publicKey, 3000000 * 10 ** decimals);

    //mint for owner 3.000.000 tokens 
    await mintTokenTo(connection, tokenMint, owner, owner, owner.publicKey, 3000000 * 10 ** decimals);

    //mint for user 3.000.000 tokens 
    await mintTokenTo(connection, tokenMint, owner, owner, user.publicKey, 3000000 * 10 ** decimals);

    const ownerPointTokenAccount = await getAssociatedTokenAddress(pointMint, owner.publicKey, true);

    const ownerTokenAccount = await getAssociatedTokenAddress(tokenMint, owner.publicKey, true);

    //approve to allow config account can transfer point from owner to user  
    await approve(connection, owner, ownerPointTokenAccount, dehypeProgram.configPDA, owner.publicKey, 3000000 * 10 ** decimals, [owner]);

    //approve to allow config account can transfer token from owner to user  
    await approve(connection, owner, ownerTokenAccount, dehypeProgram.configPDA, owner.publicKey, 3000000 * 10 ** decimals, [owner]);

    const tx = await dehypeProgram.initialize(owner.publicKey, pointMint, tokenMint);
    await sendAndConfirmTransaction(connection, tx, [owner]);

    const configData = await dehypeProgram.getConfigData();

    expect(configData.owner.toString()).to.equal(owner.publicKey.toString());
    // expect(configData.tokenMint.toString()).to.equal(tokenMint.toString());
    // expect(configData.pointMint.toString()).to.equal(pointMint.toString());
  });
  it("Creates a market", async () => {
    // Generate a new keypair for the market account
    // random integer between 0 and 1000
    
    const marketKey = new BN(Math.floor(Math.random() * 1000));
    const answers = ["Option 1", "Option 2"];
    const eventName = 'Test Event';
    const creatorFee = new BN(3);
    const serviceFee = new BN(2);

    console.log('market', dehypeProgram.marketPDA(marketKey).toString());
    console.log('answer', dehypeProgram.answerPDA(marketKey).toString());

    const tx = await dehypeProgram.createMarket(marketKey, owner.publicKey, eventName, answers, creatorFee, serviceFee);
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

    // Expected answer data
    expect(answerData.marketKey.toNumber()).to.equal(marketKey.toNumber());
    expect(answerData.answers.length).to.equal(answers.length);
    for (let i = 0; i < answers.length; i++) {
        expect(answerData.answers[i].name).to.equal(answers[i]);
        expect(answerData.answers[i].answerTotalTokens.toNumber()).to.equal(0);
    }
  });
});
//   it("Creates a market", async () => {
//     // Generate a new keypair for the market account
//     const market = anchor.web3.Keypair.generate();

//     // Define the event name and outcome options
//     const eventName = "Test Event";
//     const outcomeOptions = ["Option 1", "Option 2"];

//     // Call the create_market function
//     await program.methods
//       .createMarket(eventName, outcomeOptions)
//       .accounts({
//         market: market.publicKey,
//         user: provider.wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([market])
//       .rpc();

//     // Fetch the market account and verify its state
//     const marketAccount = await program.account.market.fetch(market.publicKey);
//     assert.equal(marketAccount.eventName, eventName);
//     assert.equal(marketAccount.outcomeTokens.length, outcomeOptions.length);
//     assert.equal(marketAccount.outcomeTokens[0].name, outcomeOptions[0]);
//     assert.equal(marketAccount.outcomeTokens[1].name, outcomeOptions[1]);
//   });


//   it("Creates and resolves a market", async () => {
//     // Generate a new keypair for the market account
//     const market = anchor.web3.Keypair.generate();

//     // Define the event name and outcome options
//     const eventName = "Test Event";
//     const outcomeOptions = ["Option 1", "Option 2"];

//     // Call the create_market function
//     await program.methods
//       .createMarket(eventName, outcomeOptions)
//       .accounts({
//         market: market.publicKey,
//         user: provider.wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([market])
//       .rpc();

//     // Fetch the market account and verify its state
//     let marketAccount = await program.account.market.fetch(market.publicKey);
//     assert.equal(marketAccount.eventName, eventName);
//     assert.equal(marketAccount.outcomeTokens.length, outcomeOptions.length);
//     assert.equal(marketAccount.outcomeTokens[0].name, outcomeOptions[0]);
//     assert.equal(marketAccount.outcomeTokens[1].name, outcomeOptions[1]);
//     // Define the winning outcome
//     const winningOutcome = "Option 1";

//     // Call the resolve_market function
//     await program.methods
//       .resolveMarket(winningOutcome)
//       .accounts({
//         market: market.publicKey,
//         user: provider.wallet.publicKey,
//       })
//       .rpc();

//     // Fetch the market account and verify its state
//     marketAccount = await program.account.market.fetch(market.publicKey);
//     assert.deepEqual(marketAccount.outcomeTokens[0].outcomeState, { winning: {} });
//     assert.deepEqual(marketAccount.outcomeTokens[1].outcomeState, { losing: {} });
// });
// it("Buys points", async () => {
//   // Generate keypairs for the necessary accounts
//   const user = provider.wallet.publicKey;
//   const configAccount = Keypair.generate();
//   const tokenMint = Keypair.generate();
//   const pointMint = Keypair.generate();
//   const userTokenAccount = Keypair.generate();
//   const userPointAccount = Keypair.generate();
//   const ownerPointAccount = Keypair.generate();
//   const vaultTokenAccount = Keypair.generate();

//   // Airdrop SOL to user
//   await provider.connection.requestAirdrop(user, 2 * anchor.web3.LAMPORTS_PER_SOL);

//   // Define the amount of tokens to buy
//   const amount = 1 * anchor.web3.LAMPORTS_PER_SOL;

//   // Initialize the config account
//   await program.methods
//     .initializeConfigAccount()
//     .accounts({
//       configAccount: configAccount.publicKey,
//       user: user,
//       systemProgram: SystemProgram.programId,
//     })
//     .signers([configAccount])
//     .rpc();

//   // Call the buy_point function
//   await program.methods
//     .buyPoint(new anchor.BN(amount))
//     .accounts({
//       user: user,
//       configAccount: configAccount.publicKey,
//       tokenMint: tokenMint.publicKey,
//       pointMint: pointMint.publicKey,
//       userTokenAccount: userTokenAccount.publicKey,
//       userPointAccount: userPointAccount.publicKey,
//       ownerPointAccount: ownerPointAccount.publicKey,
//       vaultTokenAccount: vaultTokenAccount.publicKey,
//       tokenProgram: anchor.web3.TOKEN_PROGRAM_ID,
//       associatedTokenProgram: anchor.web3.ASSOCIATED_TOKEN_PROGRAM_ID,
//       systemProgram: SystemProgram.programId,
//     })
//     .signers([userTokenAccount, userPointAccount, ownerPointAccount, vaultTokenAccount])
//     .rpc();

//   // Fetch the user point account and verify its balance
//   const userPointAccountInfo = await program.account.tokenAccount.fetch(userPointAccount.publicKey);
//   assert.equal(userPointAccountInfo.amount.toNumber(), amount);
// });
// });
// function createUserWithLamports(connection: any, arg1: number): any {
//   throw new Error("Function not implemented.");
// }

//   function createNewMint(connection: any, owner: anchor.web3.Signer, decimals: any): anchor.web3.PublicKey | PromiseLike<anchor.web3.PublicKey> {
//     throw new Error("Function not implemented.");
//   }

//   function mintTokenTo(connection: anchor.web3.Connection, tokenMint: anchor.web3.PublicKey, owner: anchor.web3.Signer, owner1: anchor.web3.Signer, publicKey: anchor.web3.PublicKey, arg5: number) {
//     throw new Error("Function not implemented.");
//   }

