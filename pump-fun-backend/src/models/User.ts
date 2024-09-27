// models/User.js
import mongoose, { Types } from 'mongoose';

const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
const defualtImg = process.env.DEFAULT_IMG_HASH || 'QmZ'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  wallet: { type: String, required: true, unique: true },
  avatar: { type: String, default: `${PINATA_GATEWAY_URL}/${defualtImg}` }
});

const User = mongoose.model('User', userSchema);

export default User;