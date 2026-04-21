const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Party = require("../models/Party");
const TransportBill = require("../models/TransportBill");

async function getTransportStats(req, res, next) {
  try {
    const ownerId = req.user.id;
    const ownerObjId = new mongoose.Types.ObjectId(ownerId);

    const [totalVehicles, activeTripsCount, revenueData] = await Promise.all([
      Vehicle.countDocuments({ owner: ownerId }),
      Trip.countDocuments({ owner: ownerId, billed: false }),
      TransportBill.aggregate([
        { $match: { owner: ownerObjId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$grandTotal" },
            paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$grandTotal", 0] } },
          }
        }
      ])
    ]);

    const rev = revenueData[0] || { total: 0, paid: 0 };

    return res.json({
      success: true,
      stats: {
        totalVehicles,
        activeTrips: activeTripsCount,
        pendingRevenue: Math.max(0, rev.total - rev.paid),
        totalRevenue: rev.total
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || "Failed to load stats" });
  }
}

async function listVehicles(req, res, next) {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id);
    const vehicles = await Vehicle.aggregate([
      { $match: { owner: ownerId } },
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "vehicle",
          as: "trips"
        }
      },
      {
        $project: {
          vehicleNumber: 1,
          vehicleType: 1,
          owner: 1,
          createdAt: 1,
          tripCount: { $size: "$trips" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    return res.json({ success: true, vehicles });
  } catch (e) {
    console.error("List Vehicles Error:", e);
    return res.status(500).json({ success: false, message: "Failed to load vehicles" });
  }
}

async function createVehicle(req, res, next) {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) return res.status(400).json({ success: false, message: "Vehicle Number is required" });

    const cleanNumber = vehicleNumber.toString().toUpperCase().trim();
    const existing = await Vehicle.findOne({ vehicleNumber: cleanNumber });
    if (existing) return res.status(400).json({ success: false, message: "This vehicle is already registered" });

    // Package Limit Check
    const userRole = req.user.role;
    const allowedLimit = req.user.allowedVehicles || 0;
    
    if (userRole === 'transport' && allowedLimit > 0) {
      const count = await Vehicle.countDocuments({ owner: req.user.id });
      if (count >= allowedLimit) {
        return res.status(403).json({ 
          success: false, 
          message: `Package Limit Reached! Your current plan allows only ${allowedLimit} vehicles. Please upgrade your package to add more vehicles.` 
        });
      }
    }

    const vehicle = await Vehicle.create({ ...req.body, vehicleNumber: cleanNumber, owner: req.user.id });
    return res.json({ success: true, vehicle });
  } catch (e) {
    console.error("Vehicle Creation Error:", e);
    const msg = e.name === 'ValidationError' ? "Invalid vehicle data" : "Failed to add vehicle";
    return res.status(400).json({ success: false, message: e.message || msg });
  }
}

async function updateVehicle(req, res, next) {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    return res.json({ success: true, vehicle });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Update failed" });
  }
}

async function getVehicleDetail(req, res, next) {
  try {
    const ownerId = req.user.id;
    const vehicleId = req.params.id;

    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: ownerId }).lean();
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    const trips = await Trip.find({ vehicle: vehicleId, owner: ownerId })
      .populate("party", "name phone")
      .sort({ startDate: -1 })
      .lean();

    return res.json({ 
      success: true, 
      vehicle: {
        ...vehicle,
        trips,
        tripCount: trips.length
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || "Failed to load vehicle details" });
  }
}

async function listTrips(req, res, next) {
  try {
    const { billed } = req.query;
    const query = { owner: req.user.id };
    
    if (billed === "false") {
      query.billed = false;
    } else if (billed === "true") {
      query.billed = true;
    }

    const trips = await Trip.find(query)
      .populate("vehicle", "vehicleNumber vehicleType")
      .populate("party", "name phone")
      .sort({ startDate: -1 })
      .lean();
    return res.json({ success: true, trips });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || "Failed to load trips" });
  }
}

async function createTrip(req, res, next) {
  try {
    const tripData = { 
      ...req.body, 
      owner: req.user.id,
      vehicle: req.body.vehicleId || req.body.vehicle,
      party: req.body.partyId || req.body.party
    };
    
    const trip = await Trip.create(tripData);
    
    // Populate for immediate UI update
    const populated = await Trip.findById(trip._id)
      .populate("vehicle", "vehicleNumber vehicleType")
      .populate("party", "name phone")
      .lean();
      
    return res.json({ success: true, trip: populated });
  } catch (e) {
    return res.status(400).json({ success: false, message: `Database Save Error: ${e.message || "Unknown error"}` });
  }
}

async function updateTrip(req, res, next) {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    return res.json({ success: true, trip });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Update failed" });
  }
}

async function deleteTrip(req, res, next) {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    return res.json({ success: true, message: "Trip deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
}

module.exports = {
  getTransportStats,
  listVehicles,
  createVehicle,
  updateVehicle,
  listTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getVehicleDetail
};
