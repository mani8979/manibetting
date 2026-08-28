const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ── Generate JWT ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// ── Generate a random 6-digit OTP ──
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// OTP PASSWORD RESET FLOW (3 steps)
// Step 1: POST /api/auth/send-otp       → email OTP
// Step 2: POST /api/auth/verify-otp     → validate OTP → resetToken
// Step 3: PUT  /api/auth/reset-password → use resetToken → new password
// ─────────────────────────────────────────────────

// @desc    Send a 6-digit OTP to user's email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });

    // Always respond 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, an OTP has been sent.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetOtpToken = undefined;
    user.resetOtpTokenExpires = undefined;
    await user.save();

    // Build styled HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0d1526; color: #e2e8f0; padding: 2rem; border-radius: 16px; border: 1px solid rgba(124,92,255,0.3);">
        <h1 style="color: #7c5cff; letter-spacing: 4px; text-align:center; margin-bottom: 0.25rem;">PLAYZONE</h1>
        <p style="text-align:center; color:#94a3b8; margin-top:0;">Password Reset OTP</p>
        <hr style="border-color: rgba(255,255,255,0.08); margin: 1.5rem 0;"/>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Use the OTP below to reset your PlayZone password. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 2rem 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #7c5cff22, #906fff22); border: 2px solid #7c5cff; border-radius: 12px; padding: 1.25rem 2.5rem;">
            <span style="font-size: 2.5rem; font-weight: 900; letter-spacing: 12px; color: #7c5cff;">${otp}</span>
          </div>
        </div>
        <p style="font-size: 0.85em; color: #64748b; text-align:center;">Do NOT share this OTP with anyone. PlayZone staff will never ask for it.</p>
        <p style="font-size: 0.8em; color: #475569; text-align:center;">If you didn't request this, ignore this email safely.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'PlayZone — Your Password Reset OTP',
      message: `Your PlayZone password reset OTP is: ${otp} (valid for 10 minutes)`,
      html
    });

    console.log(`[OTP sent] ${user.email} → ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'If this email is registered, an OTP has been sent.'
    });

  } catch (error) {
    console.error('[sendOtp Error]', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Verify OTP and return a short-lived reset token
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  try {
    const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    const user = await User.findOne({
      email,
      resetOtp: hashedOtp,
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // OTP is valid — generate a short-lived reset token (5 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpToken = hashedResetToken;
    user.resetOtpTokenExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified!',
      resetToken // raw token — sent to frontend, used in step 3
    });

  } catch (error) {
    console.error('[verifyOtp Error]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set new password using verified reset token
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { resetToken, password } = req.body;

  if (!resetToken || !password) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  try {
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetOtpToken: hashedResetToken,
      resetOtpTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired. Please request a new OTP.'
      });
    }

    user.password = password;
    user.resetOtpToken = undefined;
    user.resetOtpTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in.',
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('[resetPassword Error]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
