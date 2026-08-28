const express = require('express');
const router = express.Router();
const { register, login, getMe, sendOtp, verifyOtp, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/reset-password', resetPassword);

// Example Cloudinary upload route
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    // Update user avatar in DB
    const user = await require('../models/User').findById(req.user.id);
    user.avatar = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated',
      avatarUrl: req.file.path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
