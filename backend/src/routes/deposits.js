const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const QRCode = require('qrcode');

router.post(
  '/initiate',
  auth,
  [
    body('amount').isFloat({ min: 10 }),
    body('currency').isIn(['USDT', 'NGN'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array()
          }
        });
      }

      const { amount, currency } = req.body;
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

      const transaction = new Transaction({
        userId: req.userId,
        type: 'deposit',
        amount,
        currency,
        status: 'pending',
        description: `Deposit ${amount} ${currency}`
      });

      if (currency === 'USDT') {
        transaction.walletAddress = process.env.USDT_WALLET_ADDRESS || '0x1234567890123456789012345678901234567890';
      }

      await transaction.save();

      let qrCode = null;
      if (currency === 'USDT') {
        qrCode = await QRCode.toDataURL(transaction.walletAddress);
      }

      res.status(201).json({
        success: true,
        data: {
          transactionId: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          walletAddress: transaction.walletAddress,
          qrCode: qrCode,
          status: transaction.status
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DEPOSIT_ERROR',
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
      type: 'deposit'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      userId: req.userId,
      type: 'deposit'
    });

    res.json({
      success: true,
      data: {
        deposits: transactions,
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