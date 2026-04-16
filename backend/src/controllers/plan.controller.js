const SoftwarePlan = require("../models/SoftwarePlan");
const SoftwareSale = require("../models/SoftwareSale");
const User = require("../models/User");
const tokenService = require("../services/token.service");
const authController = require("./auth.controller");


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
};
