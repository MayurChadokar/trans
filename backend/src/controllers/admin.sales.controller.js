const SoftwareSale = require("../models/SoftwareSale");
const User = require("../models/User");

/**
 * GET /api/admin/sales
 * List all software sales with transporter details
 */
async function listSales(req, res, next) {
  try {
    const sales = await SoftwareSale.find()
      .populate("transporter", "name businessName phone email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, sales });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/admin/sales
 * Record a new software sale
 */
async function createSale(req, res, next) {
  try {
    const { transporterId, totalAmount, amountPaid, planName, paymentMode, notes } = req.body;

    const status = amountPaid >= totalAmount ? "paid" : (amountPaid > 0 ? "partial" : "pending");
    
    const sale = await SoftwareSale.create({
      owner: req.user.id,
      transporter: transporterId,
      planName,
      totalAmount,
      amountPaid,
      status,
      notes,
      paymentHistory: amountPaid > 0 ? [{ amount: amountPaid, mode: paymentMode || "cash" }] : []
    });

    const populated = await SoftwareSale.findById(sale._id).populate("transporter", "name businessName");
    return res.json({ success: true, sale: populated });
  } catch (e) {
    next(e);
  }
}

/**
 * PATCH /api/admin/sales/:id/payment
 * Record an installment payment for a sale
 */
async function addPayment(req, res, next) {
  try {
    const { amount, mode, transactionId } = req.body;
    const sale = await SoftwareSale.findById(req.params.id);
    
    if (!sale) return res.status(404).json({ success: false, message: "Sale record not found" });

    sale.amountPaid += Number(amount);
    sale.paymentHistory.push({ amount, mode, transactionId });
    
    sale.status = sale.amountPaid >= sale.totalAmount ? "paid" : "partial";
    await sale.save();

    return res.json({ success: true, sale });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listSales,
  createSale,
  addPayment
};
