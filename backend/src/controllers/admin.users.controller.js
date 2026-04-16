const User = require("../models/User");

function sanitizePhone(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizeEmail(v) {
  const s = String(v || "").trim();
  return s ? s.toLowerCase() : null;
}

function userRow(u) {
  return {
    id: String(u._id),
    name: u.name || null,
    businessName: u.businessName || null,
    phone: u.phone,
    email: u.email || null,
    role: u.role || null,
    city: u.city || null,
    address: u.address || null,
    kycStatus: u.kycStatus || "Pending",
    documents: u.documents || {},
    setupComplete: !!u.setupComplete,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

async function list(req, res, next) {
  try {
    const role = String(req.query?.role || "").toLowerCase().trim();
    const q = String(req.query?.q || "").trim();
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role && ["admin", "transport", "garage"].includes(role)) {
      filter.role = role;
    } else {
      // only real onboarded users by default
      filter.role = { $in: ["transport", "garage", "admin"] };
    }

    if (q) {
      const phone = sanitizePhone(q);
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { businessName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        ...(phone ? [{ phone: { $regex: phone } }] : []),
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    return res.json({ 
      success: true, 
      users: users.map(userRow),
      pagination: { total, page, limit }
    });
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    const phone = sanitizePhone(req.body?.phone);
    const role = String(req.body?.role || "").toLowerCase().trim();
    const name = String(req.body?.name || "").trim() || null;
    const email = normalizeEmail(req.body?.email);

    if (phone.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone" });
    }
    if (!["transport", "garage", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      {
        $set: { role, name, email, setupComplete: true },
        $setOnInsert: { phone },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({ success: true, user: userRow(user) });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = String(req.params?.id || "").trim();
    if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

    const updates = {};
    if (req.body?.name !== undefined) updates.name = String(req.body?.name || "").trim() || null;
    if (req.body?.email !== undefined) updates.email = normalizeEmail(req.body?.email);
    if (req.body?.setupComplete !== undefined) updates.setupComplete = !!req.body.setupComplete;

    if (req.body?.role !== undefined) {
      const role = String(req.body.role || "").toLowerCase().trim();
      if (!["transport", "garage", "admin", null, ""].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      updates.role = role || null;
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user: userRow(user) });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = String(req.params?.id || "").trim();
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true });
  } catch (e) {
    return next(e);
  }
}

async function getUserHistory(req, res, next) {
  try {
    const { id } = req.params;
    const [trips, bills, fleet] = await Promise.all([
      require("../models/Trip").find({ owner: id }).populate("vehicle").sort({ createdAt: -1 }).limit(100),
      require("../models/TransportBill").find({ owner: id }).sort({ createdAt: -1 }).limit(100),
      require("../models/Vehicle").find({ owner: id }).sort({ createdAt: -1 })
    ]);

    return res.json({
      success: true,
      history: {
        trips: trips.map(t => ({
          id: t._id,
          date: t.startDate,
          vehicle: t.vehicle?.vehicleNumber || "N/A",
          status: t.billed ? "Billed" : "Pending",
          amount: t.totalFreight || 0
        })),
        bills: bills.map(b => ({
          id: b.billNumber || b._id,
          date: b.billingDate,
          total: b.grandTotal,
          status: b.status
        })),
        vehicles: fleet.map(v => ({
          id: v._id,
          plateNo: v.vehicleNumber,
          type: v.vehicleType || 'Truck',
          model: v.model || 'N/A'
        }))
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove, getUserHistory };

