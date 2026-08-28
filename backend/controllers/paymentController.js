const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency: 'INR',
      receipt: `receipt_order_${Math.random().toString(36).substring(2, 10)}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, coinsToAdd } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful, update user's virtual coin balance
      if (coinsToAdd && req.user) {
        const user = await User.findById(req.user.id);
        if (user) {
          user.balance += Number(coinsToAdd);
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
