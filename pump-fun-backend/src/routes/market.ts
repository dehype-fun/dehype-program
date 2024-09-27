import express from "express";
import Message from "../models/Feedback";
import { Date, Types } from "mongoose";
import { AuthRequest, auth } from "../middleware/authorization";
import { createMarket } from "../utils/market";

const router = express.Router();

// @route   POST /markets/:
// @desc    Get messages about this coin
// @access  Public
router.post('/', async (req, res) => {
  try {
    const market = await createMarket(req.body);
    res.status(201).json(market);
  } catch (error) {
    console.error('Error creating market:', error);
    res.status(500).json({ error: 'Failed to create market' });
  }
});

export default router;