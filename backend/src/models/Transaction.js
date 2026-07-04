const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'savings', 'investment'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USDT', 'NGN'],
      default: 'USDT'
    },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    description: String,
    walletAddress: String,
    transactionHash: String,
    bankAccountId: mongoose.Schema.Types.ObjectId,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    completedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);