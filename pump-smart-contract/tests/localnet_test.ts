import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dehype } from "../target/types/dehype";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("dehype", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Dehype as Program<Dehype>;

  it("Creates a market", async () => {
    // Generate a new keypair for the market account
    const market = anchor.web3.Keypair.generate();

    // Define the event name and outcome options
    const eventName = "Test Event";
    const outcomeOptions = ["Option 1", "Option 2"];

    // Call the create_market function
    await program.methods
      .createMarket(eventName, outcomeOptions)
      .accounts({
        market: market.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([market])
      .rpc();

    // Fetch the market account and verify its state
    const marketAccount = await program.account.market.fetch(market.publicKey);
    assert.equal(marketAccount.eventName, eventName);
    assert.equal(marketAccount.outcomeTokens.length, outcomeOptions.length);
    assert.equal(marketAccount.outcomeTokens[0].name, outcomeOptions[0]);
    assert.equal(marketAccount.outcomeTokens[1].name, outcomeOptions[1]);
  });


  it("Creates and resolves a market", async () => {
    // Generate a new keypair for the market account
    const market = anchor.web3.Keypair.generate();

    // Define the event name and outcome options
    const eventName = "Test Event";
    const outcomeOptions = ["Option 1", "Option 2"];

    // Call the create_market function
    await program.methods
      .createMarket(eventName, outcomeOptions)
      .accounts({
        market: market.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([market])
      .rpc();

    // Fetch the market account and verify its state
    let marketAccount = await program.account.market.fetch(market.publicKey);
    assert.equal(marketAccount.eventName, eventName);
    assert.equal(marketAccount.outcomeTokens.length, outcomeOptions.length);
    assert.equal(marketAccount.outcomeTokens[0].name, outcomeOptions[0]);
    assert.equal(marketAccount.outcomeTokens[1].name, outcomeOptions[1]);
    // Define the winning outcome
    const winningOutcome = "Option 1";

    // Call the resolve_market function
    await program.methods
      .resolveMarket(winningOutcome)
      .accounts({
        market: market.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();

    // Fetch the market account and verify its state
    marketAccount = await program.account.market.fetch(market.publicKey);
    assert.deepEqual(marketAccount.outcomeTokens[0].outcomeState, { winning: {} });
    assert.deepEqual(marketAccount.outcomeTokens[1].outcomeState, { losing: {} });
});
});