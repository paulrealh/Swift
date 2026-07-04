const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
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

      const { email, password, firstName, lastName } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }

      user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: err.message
        }
      });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
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

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            kycVerified: user.kycVerified
          },
          token
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: err.message
        }
      });
    }
  }
);

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          kycVerified: user.kycVerified,
          walletBalance: user.walletBalance
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