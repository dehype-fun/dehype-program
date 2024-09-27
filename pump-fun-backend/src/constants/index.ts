import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from the .env file
export const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY
export const PRIVATE_KEY = process.env.PRIVATE_KEY;