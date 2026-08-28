const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=playzone'
  },
  balance: {
    type: Number,
    default: 50
  },
  // OTP-based password reset fields
  resetOtp: String,         // hashed OTP
  resetOtpExpires: Date,    // OTP expiry (10 min)
  resetOtpToken: String,    // short-lived token after OTP verified
  resetOtpTokenExpires: Date // token expiry (5 min to set new password)
}, {
  timestamps: true
});

// ── Middleware: Hash password on save (only when modified) ──
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Method: Compare entered password with stored hash ──
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
