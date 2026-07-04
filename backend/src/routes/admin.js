const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SavingsPlan = require('../models/SavingsPlan');

router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const kycVerifiedUsers = await User.countDocuments({ kycVerified: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({
      status: { $in: ['pending', 'pending_verification'] }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          kycVerified: kycVerifiedUsers,
          unverified: totalUsers - kycVerifiedUsers
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: err.message }
    });
  }
});

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
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
      error: { code: 'ERROR', message: err.message }
    });
  }
});

router.get('/transactions', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments();

    res.json({
      success: true,
      data: {
        transactions,
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
      error: { code: 'ERROR', message: err.message }
    });
  }
});

router.post(
  '/verify-deposit',
  auth,
  adminOnly,
  [
    body('transactionId').notEmpty(),
    body('status').isIn(['approved', 'rejected'])
  ],
  async (req, res) => {
    try {
      const { transactionId, status } = req.body;
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Transaction not found' }
        });
      }

      transaction.status = status === 'approved' ? 'completed' : 'rejected';
      transaction.approvedBy = req.userId;
      transaction.completedAt = new Date();

      if (status === 'approved') {
        const user = await User.findById(transaction.userId);
        user.walletBalance.usdt += transaction.amount;
        await user.save();
      }

      await transaction.save();

      res.json({
        success: true,
        message: `Deposit ${status}`
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { code: 'ERROR', message: err.message }
      });
    }
  }
);

module.exports = router;