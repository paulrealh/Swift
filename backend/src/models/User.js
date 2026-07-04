const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    phone: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    kycVerified: {
      type: Boolean,
      default: false
    },
    kycData: {
      idType: String,
      idNumber: String,
      dateOfBirth: Date,
      address: String,
      city: String,
      country: String,
      verifiedAt: Date
    },
    walletBalance: {
      usdt: {
        type: Number,
        default: 0
      }
    },
    bankAccounts: [
      {
        accountNumber: String,
        bankName: String,
        accountName: String,
        verified: {
          type: Boolean,
          default: false
        },
        verifiedAt: Date
      }
    ],
    lastLogin: Date,
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);