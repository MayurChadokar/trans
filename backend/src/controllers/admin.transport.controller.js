const mongoose = require("mongoose");
const TransportBill = require("../models/TransportBill");
const GarageBill = require("../models/GarageBill");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const User = require("../models/User");

/**
 * GET /api/admin/transport/bills
 * Fetch all platform-wide bills with owner & party populated
 */
async function getAllBills(req, res, next) {
  try {
    const { mode } = req.query; // 'transport' or 'garage'
    
    let bills = [];
    if (mode === 'transport' || !mode) {
      const tBills = await TransportBill.find()
        .populate("owner", "name businessName")
        .populate("party", "name")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
      bills = [...bills, ...tBills.map(b => ({ ...b, billType: 'transport' }))];
    }
    
    if (mode === 'garage' || !mode) {
      const gBills = await GarageBill.find()
        .populate("owner", "name businessName")
        .populate("party", "name")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
      bills = [...bills, ...gBills.map(b => ({ ...b, billType: 'garage' }))];
    }

    return res.json({ 
      success: true, 
      bills: bills.sort((a,b) => b.createdAt - a.createdAt)
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/transport/fleet
 * Master list of all registered vehicles on the platform
 */
async function getGlobalFleet(req, res, next) {
  try {
    const vehicles = await Vehicle.find()
      .populate("owner", "name businessName")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, vehicles });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/transport/sales-analytics
 * Revenue grouped by business/user
 */
async function getSalesAnalytics(req, res, next) {
  try {
    const transportSales = await TransportBill.aggregate([
      {
        $group: {
          _id: "$owner",
          totalBilled: { $sum: "$grandTotal" },
          paidAmount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$grandTotal", 0] } },
          pendingAmount: { $sum: { $cond: [{ $ne: ["$status", "paid"] }, "$grandTotal", 0] } },
          billCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          userId: "$_id",
          userName: "$userDetails.name",
          businessName: "$userDetails.businessName",
          totalBilled: 1,
          paidAmount: 1,
          pendingAmount: 1,
          billCount: 1
        }
      }
    ]);

    return res.json({ success: true, analytics: transportSales });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/transport/trips
 * Global trip logs for monitoring
 */
async function getGlobalTripHistory(req, res, next) {
  try {
    const { status, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate("owner", "name businessName")
      .populate("vehicle", "vehicleNumber vehicleType")
      .populate("party", "name")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const totalCount = await Trip.countDocuments(filter);

    return res.json({ 
      success: true, 
      trips,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAllBills,
  getGlobalFleet,
  getSalesAnalytics,
  getGlobalTripHistory
};
