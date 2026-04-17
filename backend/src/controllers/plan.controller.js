const SoftwarePlan = require("../models/SoftwarePlan");
const SoftwareSale = require("../models/SoftwareSale");
const User = require("../models/User");
const tokenService = require("../services/token.service");
const authController = require("./auth.controller");
const razorpayUtil = require("../utils/razorpay.util");


async function getAvailablePlans(req, res, next) {
  try {
    const { target } = req.query; // e.g., 'transport' or 'garage'
    const query = { isActive: true };
    if (target) query.target = target;
    
    const plans = await SoftwarePlan.find(query).sort({ price: 1 });
    return res.json({ success: true, plans });
  } catch (e) {
    next(e);
  }
}

async function subscribeToPlan(req, res, next) {
  try {
    const { planId, paymentMode, transactionId } = req.body;
    const plan = await SoftwarePlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const expiryDate = new Date();
    if (plan.interval === "Monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const sale = await SoftwareSale.create({
      owner: user._id, // Recording the purchaser as owner for self-service sales
      transporter: user._id,
      planName: plan.name,
      totalAmount: plan.price,
      amountPaid: plan.price,
      status: "paid",
      purchaseDate: new Date(),
      expiryDate,
      paymentHistory: [{
        amount: plan.price,
        mode: paymentMode || "upi",
        transactionId: transactionId || "MOCK_TXN_" + Date.now()
      }]
    });

    user.subscriptionActive = true;
    user.subscriptionExpiry = expiryDate;
    user.allowedVehicles = plan.allowedVehicles;
    user.planId = plan._id;
    await user.save();

    const accessToken = tokenService.signAccessToken(user);

    return res.json({ 
      success: true, 
      message: "Subscription successful", 
      subscriptionExpiry: expiryDate,
      accessToken,
      user: authController.userDto(user)
    });
  } catch (e) {
    next(e);
  }
}

async function createOrder(req, res, next) {
  try {
    const { planId } = req.body;
    const plan = await SoftwarePlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    let order;
    try {
      order = await razorpayUtil.createRazorpayOrder(plan.price, `receipt_${Date.now()}`);
    } catch (rzpErr) {
      console.error("Razorpay Error Details:", rzpErr);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to connect to Razorpay. Please check if RAZORPAY_KEY_ID and SECRET are correct in .env" 
      });
    }
    
    return res.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name
    });
  } catch (e) {
    next(e);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const isValid = razorpayUtil.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Reuse existing subscription logic
    const plan = await SoftwarePlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const expiryDate = new Date();
    if (plan.interval === "Monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const sale = await SoftwareSale.create({
      owner: user._id,
      transporter: user._id,
      planName: plan.name,
      totalAmount: plan.price,
      amountPaid: plan.price,
      status: "paid",
      purchaseDate: new Date(),
      expiryDate,
      paymentHistory: [{
        amount: plan.price,
        mode: "razorpay",
        transactionId: razorpay_payment_id
      }]
    });

    user.subscriptionActive = true;
    user.subscriptionExpiry = expiryDate;
    user.allowedVehicles = plan.allowedVehicles;
    user.planId = plan._id;
    await user.save();

    const accessToken = tokenService.signAccessToken(user);

    return res.json({ 
      success: true, 
      message: "Subscription successful", 
      subscriptionExpiry: expiryDate,
      accessToken,
      user: authController.userDto(user)
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAvailablePlans,
  subscribeToPlan,
  createOrder,
  verifyPayment
};
