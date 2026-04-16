const User = require("../models/User");
const Bill = require("../models/Bill");

async function getGlobalGarageStats(req, res, next) {
  try {
    const workshops = await User.countDocuments({ role: "garage" });
    const billStats = await Bill.aggregate([
      { $match: { billType: "garage" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          totalServices: { $sum: 1 },
          activeJobs: { $sum: { $cond: [{ $eq: ["$status", "unpaid"] }, 1, 0] } }
        }
      }
    ]);

    const stats = billStats[0] || { totalRevenue: 0, totalServices: 0, activeJobs: 0 };

    return res.json({
      success: true,
      stats: {
        totalWorkshops: workshops,
        totalServices: stats.totalServices,
        serviceRevenue: stats.totalRevenue,
        activeJobs: stats.activeJobs
      }
    });
  } catch (e) {
    next(e);
  }
}

async function listAllWorkshops(req, res, next) {
  try {
    const garages = await User.find({ role: "garage" }).select("name businessName phone address createdAt setupComplete").lean();
    
    // Enrich with bill data
    const enrichedWorkshops = await Promise.all(garages.map(async (g) => {
      const stats = await Bill.aggregate([
        { $match: { owner: g._id, billType: "garage" } },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]);
      
      return {
        id: g._id,
        name: g.businessName || g.name || "Unnamed Garage",
        owner: g.name || "N/A",
        location: g.address || "N/A",
        services: stats[0]?.count || 0,
        revenue: stats[0]?.revenue || 0,
        status: g.setupComplete ? "Active" : "Pending"
      };
    }));

    return res.json({ success: true, workshops: enrichedWorkshops });
  } catch (e) {
    next(e);
  }
}

async function listAllServiceBills(req, res, next) {
  try {
    const bills = await Bill.find({ billType: "garage" })
      .populate("owner", "businessName name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formattedBills = bills.map(b => ({
      id: b.billNumber || b._id,
      business: b.owner?.businessName || b.owner?.name || "Workshop",
      vehicle: b.vehicleNo || "N/A",
      amount: b.grandTotal,
      status: b.status === "paid" ? "Paid" : "Pending",
      date: b.billingDate
    }));

    return res.json({ success: true, bills: formattedBills });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getGlobalGarageStats,
  listAllWorkshops,
  listAllServiceBills
};
