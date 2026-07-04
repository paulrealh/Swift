const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.post(
  '/initiate',
  auth,
  [
    body('amount').isFloat({ min: 50 }),
    body('currency').isIn(['USDT', 'NGN']),
    body('destinationType').isIn(['wallet', 'bank'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input'
          }
        });
      }

      const { amount, currency, destinationType, walletAddress } = req.body;
      const user = await User.findById(req.userId);

      if (!user.kycVerified) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'KYC_NOT_VERIFIED',
            message: 'Please complete KYC verification first'
          }
        });
      }

      if (user.walletBalance.usdt < amount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient balance. Available: ${user.walletBalance.usdt} USDT`
          }
        });
      }

      if (destinationType === 'wallet' && !walletAddress) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DESTINATION',
            message: 'Wallet address required'
          }
        });
      }

      const transaction = new Transaction({
        userId: req.userId,
        type: 'withdrawal',
        amount,
        currency,
        status: 'pending_verification',
        description: `Withdrawal ${amount} ${currency}`,
        walletAddress: destinationType === 'wallet' ? walletAddress : null
      });

      await transaction.save();

      user.walletBalance.usdt -= amount;
      await user.save();

      res.status(201).json({
        success: true,
        data: {
          transactionId: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          message: 'Withdrawal request submitted'
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'WITHDRAWAL_ERROR',
          message: err.message
        }
      });
    }
  }
);

router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      userId: req.userId,
      type: 'withdrawal'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      userId: req.userId,
      type: 'withdrawal'
    });

    res.json({
      success: true,
      data: {
        withdrawals: transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: err.message
      }
    });
  }
});

module.exports = router;