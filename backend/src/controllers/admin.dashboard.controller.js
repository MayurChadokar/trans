const User = require("../models/User");
const Bill = require("../models/Bill");
const GarageBill = require("../models/GarageBill");

async function getStats(req, res, next) {
  try {
    const { mode } = req.query; // 'transport' or 'garage' or global if missing

    const userFilter = mode ? { role: mode } : { role: { $in: ["transport", "garage"] } };
    
    // Create query objects for bills based on mode
    let transportBillQuery = { mode: 'transport' }; // assuming mode field exists or handle dual models
    let garageBillQuery = { mode: 'garage' };

    // Wait, the models are separate: Bill (Transport) and GarageBill (Garage)
    const [
      totalUsers,
      activeUsers,
      totalBusinesses,
      transportStats,
      garageStats
    ] = await Promise.all([
      User.countDocuments(userFilter),
      User.countDocuments({ ...userFilter, setupComplete: true }),
      User.countDocuments({ ...userFilter, businessName: { $ne: null } }),
      
      // Aggregate Transport Bills
      (!mode || mode === 'transport') ? Bill.aggregate([
        { $group: { 
          _id: null, 
          count: { $sum: 1 }, 
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$grandTotal", 0] } },
          pendingRevenue: { $sum: { $cond: [{ $ne: ["$status", "paid"] }, "$grandTotal", 0] } }
        } }
      ]) : Promise.resolve([{ count: 0, paidCount: 0, totalRevenue: 0, pendingRevenue: 0 }]),

      // Aggregate Garage Bills
      (!mode || mode === 'garage') ? GarageBill.aggregate([
        { $group: { 
          _id: null, 
          count: { $sum: 1 }, 
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$grandTotal", 0] } },
          pendingRevenue: { $sum: { $cond: [{ $ne: ["$status", "paid"] }, "$grandTotal", 0] } }
        } }
      ]) : Promise.resolve([{ count: 0, paidCount: 0, totalRevenue: 0, pendingRevenue: 0 }])
    ]);

    const t = transportStats[0] || { count: 0, paidCount: 0, totalRevenue: 0, pendingRevenue: 0 };
    const g = garageStats[0] || { count: 0, paidCount: 0, totalRevenue: 0, pendingRevenue: 0 };

    const totalInvoices = t.count + g.count;
    const paidInvoices = t.paidCount + g.paidCount;
    const pendingInvoices = totalInvoices - paidInvoices;
    const totalRevenue = t.totalRevenue + g.totalRevenue;
    const pendingRevenue = t.pendingRevenue + g.pendingRevenue;

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
