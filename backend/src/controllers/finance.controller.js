const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Party = require("../models/Party");

async function listTransactions(req, res, next) {
  try {
    const txs = await Transaction.find({ owner: req.user.id })
      .populate("party", "name")
      .sort({ date: -1 })
      .lean();
    return res.json({ success: true, transactions: txs });
  } catch (e) {
    next(e);
  }
}

async function getFinanceStats(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date();
    
    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const stats = await Transaction.aggregate([
      { $match: { owner: userId } },
      {
        $facet: {
          totals: [
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
          ],
          monthly: [
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const totals = stats[0].totals || [];
    const income = totals.find(t => t._id === 'income')?.total || 0;
    const expense = totals.find(t => t._id === 'expense')?.total || 0;

    return res.json({
      success: true,
      stats: {
        totalIncome: income,
        totalExpense: expense,
        cashBalance: income - expense,
        monthly: stats[0].monthly.map(m => ({
          month: m._id,
          income: m.income,
          expense: m.expense
        }))
      }
    });
  } catch (e) {
    next(e);
  }
}

async function addTransaction(req, res, next) {
  try {
    const data = { ...req.body, owner: req.user.id };
    const tx = await Transaction.create(data);
    
    // Update party balance if linked
    if (data.party) {
      const amount = parseFloat(data.amount);
      const adjustment = data.type === 'income' ? -amount : amount;
      await Party.findByIdAndUpdate(data.party, { $inc: { balance: adjustment } });
    }

    return res.json({ success: true, transaction: tx });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listTransactions,
  addTransaction,
  getFinanceStats
};
