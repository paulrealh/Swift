const mongoose = require('mongoose');

const savingsPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    planType: {
      type: String,
      enum: ['flexible', 'fixed_30', 'fixed_60', 'fixed_90'],
      required: true
    },
    principal: {
      type: Number,
      required: true
    },
    bonusRate: {
      type: Number,
      required: true
    },
    expectedBonus: {
      type: Number,
      required: true
    },
    maturityDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
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

savingsPlanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('SavingsPlan', savingsPlanSchema);