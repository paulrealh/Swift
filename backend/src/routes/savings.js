const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const SavingsPlan = require('../models/SavingsPlan');
const Transaction = require('../models/Transaction');

router.post(
  '/create-plan',
  auth,
  [
    body('planType').isIn(['flexible', 'fixed_30', 'fixed_60', 'fixed_90']),
    body('principal').isFloat({ min: 100 })
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

      const { planType, principal } = req.body;
      const user = await User.findById(req.userId);

      if (user.walletBalance.usdt < principal) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient balance'
          }
        });
      }

      const planConfigs = {
        flexible: { bonusRate: 0.05, days: 0 },
        fixed_30: { bonusRate: 0.08, days: 30 },
        fixed_60: { bonusRate: 0.12, days: 60 },
        fixed_90: { bonusRate: 0.15, days: 90 }
      };

      const config = planConfigs[planType];
      const maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + config.days);

      const expectedBonus = principal * config.bonusRate;

      const plan = new SavingsPlan({
        userId: req.userId,
        planType,
        principal,
        bonusRate: config.bonusRate,
        expectedBonus,
        maturityDate: config.days > 0 ? maturityDate : null,
        status: 'active'
      });

      await plan.save();

      user.walletBalance.usdt -= principal;
      await user.save();

      const transaction = new Transaction({
        userId: req.userId,
        type: 'savings',
        amount: principal,
        currency: 'USDT',
        status: 'completed',
        description: `Savings plan: ${planType}`,
        completedAt: new Date()
      });

      await transaction.save();

      res.status(201).json({
        success: true,
        data: {
          plan: {
            id: plan._id,
            planType: plan.planType,
            principal: plan.principal,
            bonusRate: plan.bonusRate,
            expectedBonus: plan.expectedBonus,
            maturityDate: plan.maturityDate,
            status: plan.status
          }
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PLAN_ERROR',
          message: err.message
        }
      });
    }
  }
);

router.get('/my-plans', auth, async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const query = { userId: req.userId };
    if (status !== 'all') {
      query.status = status;
    }

    const plans = await SavingsPlan.find(query).sort({ createdAt: -1 });

    const totalSaved = plans.reduce((sum, plan) => sum + plan.principal, 0);
    const totalExpectedBonus = plans.reduce((sum, plan) => sum + plan.expectedBonus, 0);

    res.json({
      success: true,
      data: {
        plans,
        summary: {
          totalSaved,
          totalExpectedBonus,
          count: plans.length
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

router.post('/withdraw-plan', auth, [body('planId').notEmpty()], async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await SavingsPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Plan not found' }
      });
    }

    if (plan.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
      });
    }

    const now = new Date();
    const isMatured = !plan.maturityDate || plan.maturityDate <= now;

    if (!isMatured && plan.planType !== 'flexible') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_MATURED',
          message: `Plan matures on ${plan.maturityDate.toDateString()}`
        }
      });
    }

    const user = await User.findById(req.userId);
    const withdrawalAmount = plan.principal + plan.expectedBonus;

    user.walletBalance.usdt += withdrawalAmount;
    await user.save();

    plan.status = 'completed';
    plan.completedAt = new Date();
    await plan.save();

    res.json({
      success: true,
      data: {
        principal: plan.principal,
        bonus: plan.expectedBonus,
        totalWithdrawn: withdrawalAmount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: err.message }
    });
  }
});

router.get('/plans-info', (req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        {
          type: 'flexible',
          name: 'Flexible Savings',
          bonusRate: 0.05,
          duration: 'Anytime'
        },
        {
          type: 'fixed_30',
          name: '30-Day Fixed',
          bonusRate: 0.08,
          duration: '30 days'
        },
        {
          type: 'fixed_60',
          name: '60-Day Fixed',
          bonusRate: 0.12,
          duration: '60 days'
        },
        {
          type: 'fixed_90',
          name: '90-Day Fixed',
          bonusRate: 0.15,
          duration: '90 days'
        }
      ]
    }
  });
});

module.exports = router;