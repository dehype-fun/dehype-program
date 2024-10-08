const anchor = require("@coral-xyz/anchor");

import { Program } from '@coral-xyz/anchor';
import DehypeIDL from '../sdk/idl/dehype.json';
import { Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import { Dehype } from '../target/types/dehype';
import { DehypeProgram } from '../sdk/dehype-program';

function loadKeypairFromFile(filePath: string): Keypair {
    // Read the file content
    const keypairJson = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the JSON content
    const secretKeyArray = JSON.parse(keypairJson);
    
    // Create and return the Keypair instance
    return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  }

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  const program = anchor.workspace.Dehype as Program<Dehype>;

  let owner: Signer;

  const dehypeProgram = new DehypeProgram(DehypeIDL as Dehype, provider.connection);
  
  const connection = provider.connection;

  // Add your deploy script here.
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

};