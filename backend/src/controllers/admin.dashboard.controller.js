const User = require("../models/User");
const Bill = require("../models/Bill");
const GarageBill = require("../models/GarageBill");

async function getStats(req, res, next) {
  try {
    const { mode } = req.query; // 'transport' or 'garage' or global if missing

    const [
      allUsers,
      allBills,
      allGarageBills
    ] = await Promise.all([
      User.find({ role: { $in: ["transport", "garage"] } }, { role: 1, setupComplete: 1, businessName: 1, name: 1 }),
      Bill.find({}, { grandTotal: 1, status: 1 }),
      GarageBill.find({}, { grandTotal: 1, status: 1 })
    ]);

    // Filter logic helper
    const filterByMode = (arr, roleField = 'role') => {
      if (!mode) return arr;
      return arr.filter(x => x[roleField] === mode);
    }

    // Process Users
    const targetUsers = mode ? allUsers.filter(u => u.role === mode) : allUsers;
    const totalUsers = targetUsers.length;
    const activeUsers = targetUsers.filter(u => u.setupComplete).length;
    const totalBusinesses = targetUsers.filter(u => u.businessName).length;

    // Process Bills
    let targetBills = [];
    if (!mode || mode === 'transport') targetBills = [...targetBills, ...allBills];
    if (!mode || mode === 'garage') targetBills = [...targetBills, ...allGarageBills];

    const totalInvoices = targetBills.length;
    const paidInvoices = targetBills.filter(b => b.status === "paid").length;
    const pendingInvoices = totalInvoices - paidInvoices;

    const totalRevenue = targetBills
      .filter(b => b.status === "paid")
      .reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);

    const pendingRevenue = targetBills
      .filter(b => b.status !== "paid")
      .reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalBusinesses,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalRevenue,
        pendingRevenue
      }
    });
  } catch (e) {
    next(e);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    // Top 10 recent users
    const users = await User.find({ role: { $in: ["transport", "garage"] } })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      recentUsers: users.map(u => ({
        id: u._id,
        name: u.name || u.businessName || "New User",
        role: u.role,
        createdAt: u.createdAt
      }))
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getStats,
  getRecentActivity
};
