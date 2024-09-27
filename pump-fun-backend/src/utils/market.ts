import { PublicKey } from "@solana/web3.js";
import { model, Schema, Types } from "mongoose";
import { createToken } from "../program/web3";

interface Market {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  title: string;
  description: string;
  endDate: Date;
  outcomes: string[];
  outcomeMints: PublicKey[];
  settled: boolean;
}

const MarketSchema = new Schema<Market>({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  endDate: { type: Date, required: true },
  outcomes: { type: [String], required: true },
  outcomeMints: { type: [String], required: true },
  settled: { type: Boolean, default: false }
});

const MarketModel = model<Market>('Market', MarketSchema);

export const createMarket = async (marketData: Omit<Market, '_id' | 'outcomeMints' | 'settled'>) => {
  try {
    const outcomeMints = await Promise.all(marketData.outcomes.map(async (outcome) => {
      const token = await createToken({
        name: `${marketData.title} - ${outcome}`,
        ticker: outcome.substring(0, 5).toUpperCase(),
        url: 'https://example.com/metadata.json',
        description: `Outcome token for ${marketData.title}`,
      });

      if (token === "transaction failed") {
        throw new Error(`Failed to create token for outcome: ${outcome}`);
      }

      // Assuming the token object has a 'token' field that contains the public key
      if (!token.token) {
        throw new Error(`Token creation succeeded but no token address was returned for outcome: ${outcome}`);
      }

      return token.token;
    }));

    const market = new MarketModel({
      ...marketData,
      outcomeMints,
    });

    return await market.save();
  } catch (error) {
    console.error("Error creating market:", error);
    throw error;
  }
};