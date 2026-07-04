const User = require('../models/User');

const adminOnly = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required'
        }
      });
    }

    const user = await User.findById(req.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_AUTHORIZED',
          message: 'Admin access required'
        }
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: err.message
      }
    });
  }
};

module.exports = { adminOnly };