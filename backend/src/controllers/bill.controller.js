const mongoose = require("mongoose");
const TransportBill = require("../models/TransportBill");
const GarageBill    = require("../models/GarageBill");
const Trip          = require("../models/Trip");
const Transaction   = require("../models/Transaction");

// ─── helpers ────────────────────────────────────────────────────────────────

// Helper to auto-create transaction when bill is paid
async function autoCreateTransaction(bill, type) {
  if (bill.status !== "paid") return;
  try {
    const validModes = ["cash", "bank", "check", "online"];
    let mode = bill.paymentMode?.toLowerCase() || "cash";
    if (!validModes.includes(mode)) mode = "cash";

    await Transaction.create({
      owner: bill.owner,
      party: bill.party,
      bill: bill._id,
      type: "income",
      category: "Bill Payment",
      amount: bill.grandTotal || 0,
      paymentMode: mode,
      date: bill.billingDate || bill.createdAt || new Date(),
      notes: `Auto-generated from ${type === 'garage' ? 'Job Card' : 'Invoice'} #${bill.billNumber || bill._id}`
    });
  } catch (txErr) {
    console.warn("[autoCreateTransaction] Failed:", txErr.message);
  }
}

function getModel(billType) {
  if (billType === "garage") return GarageBill;
  if (billType === "transport") return TransportBill;
  return null;
}

function genBillNumber(type) {
  const prefix = type === "garage" ? "G-INV-" : "T-INV-";
  // Use last 8 digits of timestamp + 4 random hex chars for uniqueness
  const ts = Date.now().toString().slice(-8);
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}${ts}-${rand}`;
}

// ─── GET /bills/drafts ────────────────────────────────────────────────────────
async function getDrafts(req, res, next) {
  try {
    const [tDrafts, gDrafts] = await Promise.all([
      TransportBill.find({ owner: req.user.id, status: "draft" })
        .populate("party", "name")
        .select("billNumber party createdAt _id")
        .lean(),
      GarageBill.find({ owner: req.user.id, status: "draft" })
        .populate("party", "name")
        .select("billNumber party customerName createdAt _id")
        .lean(),
    ]);

    const drafts = [
      ...tDrafts.map(d => ({ ...d, billType: "transport" })),
      ...gDrafts.map(d => ({ ...d, billType: "garage" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, drafts });
  } catch (e) {
    next(e);
  }
}

// ─── GET /bills ───────────────────────────────────────────────────────────────
async function listBills(req, res, next) {
  try {
    const [tBills, gBills] = await Promise.all([
      TransportBill.find({ owner: req.user.id })
        .populate("party", "name phone")
        .sort({ createdAt: -1 })
        .lean(),
      GarageBill.find({ owner: req.user.id })
        .populate("party", "name phone")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const bills = [
      ...tBills.map(b => ({ ...b, billType: "transport" })),
      ...gBills.map(b => ({ ...b, billType: "garage" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, bills });
  } catch (e) {
    next(e);
  }
}

// ─── POST /bills ──────────────────────────────────────────────────────────────
async function createBill(req, res, next) {
  try {
    const { billType, type, status } = req.body;
    const resolvedType = billType || (type === "garage" ? "garage" : "transport");
    const Model = getModel(resolvedType);

    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid billType. Use 'transport' or 'garage'." });
    }

    const isFinal = status !== "draft";
    let billData = { owner: req.user.id, status: status || "unpaid" };

    // ── TRANSPORT BILL ──────────────────────────────────────────────────────
    if (resolvedType === "transport") {
      const {
        party, partyId,
        billedToName, billedToPhone, billedToEmail,
        billedToAddress, billedToCity, billedToState, billedToPincode,
        billedToGstin, billedToPan,
        items,
        loadingCharge, unloadingCharge, detentionCharge, otherCharge, extraCharges,
        gstPercent, gstType,
        notes, billingDate, billDate, paymentMode,
      } = req.body;

      // Collect trip references from items
      const allTripIds = (items || []).flatMap(it => it.tripIds || []);

      // Calculate totals
      const itemsTotal = (items || []).reduce((s, it) => s + (parseFloat(it.amount) || 0) + (parseFloat(it.extraAmount) || 0), 0);
      const extras = [loadingCharge, unloadingCharge, detentionCharge, otherCharge, extraCharges]
        .reduce((s, v) => s + (parseFloat(v) || 0), 0);
      const subTotal  = itemsTotal + extras;
      const gstAmt    = subTotal * ((parseFloat(gstPercent) || 0) / 100);
      const grandTotal = subTotal + gstAmt;

      // Sanitize party — empty string would cause ObjectId cast error
      const resolvedParty = (party || partyId || '').trim() || undefined;

      billData = {
        ...billData,
        ...(resolvedParty && { party: resolvedParty }),
        billedToName, billedToPhone, billedToEmail,
        billedToAddress, billedToCity, billedToState, billedToPincode,
        billedToGstin, billedToPan,
        items: (items || []).map(it => ({
          date: it.date,
          tempoNo: it.tempoNo,
          companyFrom: it.companyFrom,
          companyTo: it.companyTo,
          chalanNo: it.chalanNo,
          extraAmount: parseFloat(it.extraAmount) || 0,
          amount: parseFloat(it.amount) || 0,
          tripIds: it.tripIds || [],
        })),
        trips: allTripIds,
        loadingCharge:   parseFloat(loadingCharge)   || 0,
        unloadingCharge: parseFloat(unloadingCharge) || 0,
        detentionCharge: parseFloat(detentionCharge) || 0,
        otherCharge:     parseFloat(otherCharge)     || 0,
        extraCharges:    parseFloat(extraCharges)    || 0,
        gstPercent: parseFloat(gstPercent) || 0,
        gstType: gstType || "CGST+SGST",
        gstAmount: gstAmt,
        subTotal,
        grandTotal: req.body.grandTotal || grandTotal, // prefer frontend-computed, fallback to server
        paymentMode: paymentMode || "topay",
        billingDate: billingDate || billDate || new Date(),
        notes,
      };

      if (isFinal && !billData.billNumber) {
        billData.billNumber = genBillNumber("transport");
      }

      const bill = await TransportBill.create(billData);
      
      // Auto-create transaction if paid
      if (bill.status === "paid") {
        await autoCreateTransaction(bill, "transport");
      }

      // Mark linked trips as billed
      if (isFinal && allTripIds.length > 0) {
        await Trip.updateMany(
          { _id: { $in: allTripIds }, owner: req.user.id },
          { $set: { billed: true, billId: bill._id } }
        );
      }

      return res.json({ success: true, bill: { ...bill.toObject(), billType: "transport" } });
    }

    // ── GARAGE BILL ─────────────────────────────────────────────────────────
    if (resolvedType === "garage") {
      const {
        party, partyId,
        customerName, customerPhone, customerEmail,
        customerAddress, customerCity, customerState, customerPincode,
        customerGstin, customerPan, customerSignatureUrl,
        vehicleNo, vehicleModel, vehicleCompany,
        kmReading, nextServiceKm, nextServiceDate,
        items,
        laborCharge, gstPercent,
        notes, billingDate, billDate, paymentMode,
        grandTotal: bodyGrandTotal,
        partsTotal: bodyPartsTotal,
      } = req.body;

      const parsedItems = (items || []).map(it => ({
        description: it.description,
        qty:    parseFloat(it.qty    || it.quantity) || 1,
        rate:   parseFloat(it.rate)   || 0,
        amount: parseFloat(it.amount) || 0,
      }));

      const partsTotal  = parsedItems.reduce((s, it) => s + it.amount, 0);
      const labor       = parseFloat(laborCharge) || 0;
      const subTotal    = partsTotal + labor;
      const gstAmt      = subTotal * ((parseFloat(gstPercent) || 0) / 100);
      const grandTotal  = bodyGrandTotal || (subTotal + gstAmt);

      // Sanitize party — empty string would cause ObjectId cast error
      const resolvedGarageParty = (party || partyId || '').trim() || undefined;

      billData = {
        ...billData,
        ...(resolvedGarageParty && { party: resolvedGarageParty }),
        customerName, customerPhone, customerEmail,
        customerAddress, customerCity, customerState, customerPincode,
        customerGstin, customerPan, customerSignatureUrl,
        vehicleNo, vehicleModel, vehicleCompany,
        kmReading:       parseFloat(kmReading)       || undefined,
        nextServiceKm:   parseFloat(nextServiceKm)   || undefined,
        nextServiceDate: nextServiceDate || undefined,
        items: parsedItems,
        partsTotal,
        laborCharge: labor,
        subTotal,
        gstPercent: parseFloat(gstPercent) || 0,
        gstAmount:  gstAmt,
        grandTotal,
        paymentMethod: req.body.paymentMethod || req.body.paymentMode || "Cash",
        paymentMode: (status === "paid" || paymentMode === "paid") ? "paid" : (status === "partial" || paymentMode === "partial") ? "partial" : "unpaid",
        status: status || "unpaid",
        billingDate: billingDate || billDate || new Date(),
        notes,
      };

      if (isFinal && !billData.billNumber) {
        billData.billNumber = genBillNumber("garage");
      }

      const bill = await GarageBill.create(billData);

      // Auto-create transaction if paid
      if (bill.status === "paid") {
        await autoCreateTransaction(bill, "garage");
      }

      // Update GarageVehicle record for service reminders
      if (bill.vehicleNo) {
        try {
          const GarageVehicle = require("../models/GarageVehicle");
          await GarageVehicle.findOneAndUpdate(
            { owner: req.user.id, vehicleNumber: bill.vehicleNo },
            {
              $set: {
                partyId:         bill.party,
                kmReading:       bill.kmReading,
                nextServiceKm:   bill.nextServiceKm,
                nextServiceDate: bill.nextServiceDate,
                lastServiceDate: bill.billingDate,
                model:           bill.vehicleModel,
                company:         bill.vehicleCompany,
                customerName:    bill.customerName,
                customerPhone:   bill.customerPhone,
              },
            },
            { upsert: true, returnDocument: "after" }
          );
        } catch (garageErr) {
          console.warn("GarageVehicle upsert failed:", garageErr.message);
        }
      }

      return res.json({ success: true, bill: { ...bill.toObject(), billType: "garage" } });
    }
  } catch (e) {
    console.error("[createBill ERROR]", e.message, e.errors ? JSON.stringify(e.errors) : "");
    next(e);
  }
}

// ─── PATCH /bills/:id ─────────────────────────────────────────────────────────
async function updateBill(req, res, next) {
  try {
    const { id } = req.params;
    const { billType, status } = req.body;

    // Try to find in either collection
    let bill = null;
    let Model = null;
    let resolvedType = billType;

    if (!resolvedType) {
      // Sniff from DB
      bill = await TransportBill.findOne({ _id: id, owner: req.user.id });
      if (bill) { resolvedType = "transport"; Model = TransportBill; }
      else {
        bill = await GarageBill.findOne({ _id: id, owner: req.user.id });
        if (bill) { resolvedType = "garage"; Model = GarageBill; }
      }
    } else {
      Model = getModel(resolvedType);
      bill  = await Model.findOne({ _id: id, owner: req.user.id });
    }

    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
    if (bill.status === "paid") {
      return res.status(400).json({ success: false, message: "Cannot edit a paid bill" });
    }

    const updateData = { ...req.body };
    const becomingFinal = status && status !== "draft" && bill.status === "draft";
    if (becomingFinal && !bill.billNumber && !updateData.billNumber) {
      updateData.billNumber = genBillNumber(resolvedType);
    }

    const previousStatus = bill.status;
    const updatedBill = await Model.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: "after", new: true });

    // Auto-create transaction if payment recorded
    if (previousStatus !== "paid" && updatedBill.status === "paid") {
      await autoCreateTransaction(updatedBill, resolvedType);
    }

    return res.json({ success: true, bill: { ...updatedBill.toObject(), billType: resolvedType } });
  } catch (e) {
    next(e);
  }
}

// ─── GET /bills/:id ───────────────────────────────────────────────────────────
async function getBillDetail(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid bill ID format" });
    }

    const ownerFilter = req.user.role !== "admin" ? { owner: req.user.id } : {};

    // Check both collections
    let bill = await TransportBill.findOne({ _id: id, ...ownerFilter })
      .populate("party")
      .populate("owner", "businessName name email address phone gstin panNo logoUrl signatureUrl bankDetails slogan")
      .populate({ path: "trips", populate: { path: "vehicle", select: "vehicleNumber model" } });

    if (bill) {
      return res.json({ success: true, bill: { ...bill.toObject(), billType: "transport" } });
    }

    bill = await GarageBill.findOne({ _id: id, ...ownerFilter })
      .populate("owner", "businessName name email address phone gstin panNo logoUrl signatureUrl bankDetails slogan")
      .populate("party");
      
    if (bill) {
      return res.json({ success: true, bill: { ...bill.toObject(), billType: "garage" } });
    }

    return res.status(404).json({ success: false, message: "Bill not found" });
  } catch (e) {
    next(e);
  }
}

// ─── DELETE /bills/:id ────────────────────────────────────────────────────────
async function deleteBill(req, res, next) {
  try {
    const { id } = req.params;
    const ownerFilter = { _id: id, owner: req.user.id };

    // Try TransportBill first
    let deleted = await TransportBill.findOneAndDelete(ownerFilter);
    if (!deleted) {
      // Try GarageBill
      deleted = await GarageBill.findOneAndDelete(ownerFilter);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Bill not found or not authorized" });
    }

    return res.json({ success: true, message: "Bill deleted successfully" });
  } catch (e) {
    console.error("[deleteBill ERROR]", e.message);
    next(e);
  }
}

module.exports = { getDrafts, listBills, createBill, updateBill, getBillDetail, deleteBill };
