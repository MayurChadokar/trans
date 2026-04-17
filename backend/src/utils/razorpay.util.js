const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in INR (not paise)
 * @param {string} receipt - Unique receipt ID
 */
async function createRazorpayOrder(amount, receipt) {
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt: receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw error;
  }
}

/**
 * Verify Razorpay Signature
 */
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
};
